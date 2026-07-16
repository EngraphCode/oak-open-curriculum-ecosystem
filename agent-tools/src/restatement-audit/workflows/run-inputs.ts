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
  Disposition,
  GroundingInstance,
  MapResult,
  MetaRunData,
  ReduceResult,
  ReduceRunData,
  ValidateResult,
  ValidateRunData,
} from './stage-io.js';

/** Caller must have rejected a failed map result BEFORE building the lookup. */
function groundingInstanceOf(
  source: Extract<MapResult, { ok: true }>,
): ReadonlyMap<string, GroundingInstance> {
  const byId = new Map<string, GroundingInstance>();
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

interface ResolvedMembers {
  readonly members: readonly GroundingInstance[];
  /** `clusterId:instanceId` for every member id absent from the map result — never dropped silently. */
  readonly missing: readonly string[];
}

function resolveMembers(
  cluster: Cluster,
  byId: ReadonlyMap<string, GroundingInstance>,
): ResolvedMembers {
  const members: GroundingInstance[] = [];
  const missing: string[] = [];
  for (const id of cluster.memberInstanceIds) {
    const member = byId.get(id);
    if (member === undefined) {
      missing.push(`${cluster.id}:${id}`);
    } else {
      members.push(member);
    }
  }
  return { members, missing };
}

function unresolvableMembersError(missing: readonly string[]): Error {
  return new Error(
    `clusters reference ${missing.length} member instance id(s) absent from the map result — ` +
      `voters/meta would run on partial grounding: ${missing.join(', ')}`,
  );
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
  if (!mapResult.ok) {
    return err(new Error(`map result was not ok: ${mapResult.error}`));
  }
  if (!reduceResult.ok) {
    return err(new Error(`reduce result was not ok: ${reduceResult.error}`));
  }
  const byId = groundingInstanceOf(mapResult);
  const resolved = reduceResult.clusters.map((cluster) => resolveMembers(cluster, byId));
  const missing = resolved.flatMap((entry) => entry.missing);
  if (missing.length > 0) {
    return err(unresolvableMembersError(missing));
  }
  const groundingInstances = resolved.flatMap((entry) => entry.members);
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
): ReadonlyMap<string, Disposition> {
  const merged = new Map<string, Disposition>();
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
  if (!mapResult.ok) {
    return err(new Error(`map result was not ok: ${mapResult.error}`));
  }
  if (!reduceResult.ok) {
    return err(new Error(`reduce result was not ok: ${reduceResult.error}`));
  }
  const byId = groundingInstanceOf(mapResult);
  const dispositions = mergedDispositions(validateResults);
  const flagged = reduceResult.clusters.filter(
    (cluster) => dispositions.get(cluster.id) === 'flagged',
  );
  const resolved = flagged.map((cluster) => resolveMembers(cluster, byId));
  const missing = resolved.flatMap((entry) => entry.missing);
  if (missing.length > 0) {
    return err(unresolvableMembersError(missing));
  }
  const clusters = flagged.map((cluster, index) => ({
    id: cluster.id,
    factClass: cluster.factClass,
    subject: cluster.subject,
    predicate: cluster.predicate,
    verdict: cluster.verdict,
    instances: [...(resolved[index]?.members ?? [])],
  }));
  if (clusters.length === 0) {
    return err(new Error('meta run data has no flagged clusters — nothing to do'));
  }
  return ok({ clusters });
}
