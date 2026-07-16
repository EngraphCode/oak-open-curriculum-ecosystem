/**
 * Pipeline glue: derive one stage's run data from a prior stage's committed checkpoint
 * result(s). Node-side only — never runs in the sandbox.
 *
 * @remarks
 * Mirrors `corpus-analysis/workflows/run-inputs.ts`'s role in the pipeline: the operator
 * (or `build-run-artefact`) reads committed checkpoint JSONs, and this module turns them
 * into the next stage's validated run data. `resolveResumeSeed` (imported from
 * `corpus-analysis/run-orchestration.ts` per the brief's reuse instruction) filters an
 * already-resolved cluster tail on candidate-granular resume.
 *
 * @packageDocumentation
 */

import { err, ok, type Result } from '@oaknational/result';

import { resolveResumeSeed } from '../../corpus-analysis/run-orchestration.js';
import type { Cluster } from '../schemas.js';
import type {
  GroundingInstance,
  MapResult,
  MetaRunData,
  ReduceResult,
  ReduceRunData,
  ValidateResult,
  ValidateRunData,
} from './stage-io.js';

function groundingInstanceOf(source: MapResult): ReadonlyMap<string, GroundingInstance> {
  const byId = new Map<string, GroundingInstance>();
  if (!source.ok) {
    return byId;
  }
  for (const instance of source.instances) {
    byId.set(instance.id, {
      id: instance.id,
      file: instance.file,
      line: instance.line,
      quote: instance.quote,
      valueNorm: instance.valueNorm,
      assertionKind: instance.assertionKind,
    });
  }
  return byId;
}

function membersOf(
  cluster: Cluster,
  byId: ReadonlyMap<string, GroundingInstance>,
): readonly GroundingInstance[] {
  return cluster.memberInstanceIds.flatMap((id) => {
    const member = byId.get(id);
    return member === undefined ? [] : [member];
  });
}

/** Derive REDUCE run data from a successful MAP result. */
export function reduceRunDataFrom(mapResult: MapResult): Result<ReduceRunData, Error> {
  if (!mapResult.ok) {
    return err(new Error(`map result was not ok: ${mapResult.error}`));
  }
  return ok({ instances: mapResult.instances });
}

/**
 * Derive VALIDATE run data from the MAP result (instance lookup) and REDUCE result
 * (clusters). `resolvedIds` from any prior validate attempt narrows the seed to the
 * unresolved tail on resume.
 */
export function validateRunDataFrom(input: {
  readonly mapResult: MapResult;
  readonly reduceResult: ReduceResult;
  readonly priorValidateResults: readonly ValidateResult[];
  readonly validateTokenCeiling: number;
}): Result<ValidateRunData, Error> {
  const { mapResult, reduceResult, priorValidateResults, validateTokenCeiling } = input;
  if (!reduceResult.ok) {
    return err(new Error(`reduce result was not ok: ${reduceResult.error}`));
  }
  const byId = groundingInstanceOf(mapResult);
  const groundingInstances = reduceResult.clusters.flatMap((cluster) => membersOf(cluster, byId));
  const resolvedClusterIds = priorValidateResults.flatMap((result) =>
    result.ok ? result.resolvedClusterIds : [],
  );
  const seed = resolveResumeSeed(reduceResult.clusters, resolvedClusterIds);
  if (seed.length === 0) {
    return err(new Error('validate run data has no unresolved clusters to seed — nothing to do'));
  }
  return ok({
    clusters: seed,
    groundingInstances,
    resolvedClusterIds: [...resolvedClusterIds],
    validateTokenCeiling,
  });
}

/**
 * Merge every validate attempt into one cluster to disposition map, keeping the LAST
 * (most recent resume) disposition recorded for any cluster id.
 */
function mergedDispositions(
  validateResults: readonly ValidateResult[],
): ReadonlyMap<string, 'flagged' | 'dismissed' | 'held-for-review'> {
  const merged = new Map<string, 'flagged' | 'dismissed' | 'held-for-review'>();
  for (const result of validateResults) {
    if (!result.ok) {
      continue;
    }
    for (const entry of result.dispositions) {
      merged.set(entry.clusterId, entry.disposition);
    }
  }
  return merged;
}

/**
 * Derive META run data: the flagged clusters only, projected with byte-checkable
 * grounding. `dispositionFromVoters` is not called here — dispositions are already
 * committed in the validate checkpoint(s); this stage only filters and projects them.
 */
export function metaRunDataFrom(input: {
  readonly mapResult: MapResult;
  readonly reduceResult: ReduceResult;
  readonly validateResults: readonly ValidateResult[];
}): Result<MetaRunData, Error> {
  const { mapResult, reduceResult, validateResults } = input;
  if (!reduceResult.ok) {
    return err(new Error(`reduce result was not ok: ${reduceResult.error}`));
  }
  const byId = groundingInstanceOf(mapResult);
  const dispositions = mergedDispositions(validateResults);
  const clusters = reduceResult.clusters
    .filter((cluster) => dispositions.get(cluster.id) === 'flagged')
    .map((cluster) => ({
      id: cluster.id,
      factClass: cluster.factClass,
      subject: cluster.subject,
      predicate: cluster.predicate,
      verdict: cluster.verdict,
      instances: [...membersOf(cluster, byId)],
    }));
  if (clusters.length === 0) {
    return err(new Error('meta run data has no flagged clusters — nothing to do'));
  }
  return ok({ clusters });
}
