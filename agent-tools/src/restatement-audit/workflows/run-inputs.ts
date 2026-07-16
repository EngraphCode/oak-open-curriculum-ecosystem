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
import {
  groundingInstanceOf,
  projectClusters,
  resolveMembers,
  unresolvableMembersError,
} from './member-grounding.js';
import type {
  Disposition,
  MapResult,
  MetaRunData,
  ReduceResult,
  ReduceRunData,
  ValidateResult,
  ValidateRunData,
} from './stage-io.js';

/**
 * `ok: true` is not completeness: a map/reduce envelope deliberately reports partial
 * coverage (`mapComplete: false` / `reduceComplete: false`) when windows or chunks die.
 * Seeding a later stage from a partial checkpoint silently shrinks the audit corpus —
 * every derivation below refuses instead.
 */
function incompleteMapError(mapResult: Extract<MapResult, { ok: true }>): Error {
  return new Error(
    `map result is INCOMPLETE — dead window(s) [${mapResult.incompleteWindows.join(', ')}] ` +
      'would silently shrink the corpus; re-run or resume map before seeding downstream stages',
  );
}

function incompleteReduceError(reduceResult: Extract<ReduceResult, { ok: true }>): Error {
  return new Error(
    `reduce result is INCOMPLETE — dead chunk(s) [${reduceResult.incompleteChunks.join(', ')}] ` +
      'would silently drop free-text clusters; re-run or resume reduce before seeding downstream stages',
  );
}

/** The shared ok+complete gate over the map and reduce checkpoints every later stage seeds from. */
function completeCheckpoints(
  mapResult: MapResult,
  reduceResult: ReduceResult,
): Result<
  { map: Extract<MapResult, { ok: true }>; reduce: Extract<ReduceResult, { ok: true }> },
  Error
> {
  if (!mapResult.ok) {
    return err(new Error(`map result was not ok: ${mapResult.error}`));
  }
  if (!mapResult.mapComplete) {
    return err(incompleteMapError(mapResult));
  }
  if (!reduceResult.ok) {
    return err(new Error(`reduce result was not ok: ${reduceResult.error}`));
  }
  if (!reduceResult.reduceComplete) {
    return err(incompleteReduceError(reduceResult));
  }
  return ok({ map: mapResult, reduce: reduceResult });
}

/** Derive REDUCE run data from a successful, COMPLETE MAP result. */
export function reduceRunDataFrom(mapResult: MapResult): Result<ReduceRunData, Error> {
  if (!mapResult.ok) {
    return err(new Error(`map result was not ok: ${mapResult.error}`));
  }
  if (!mapResult.mapComplete) {
    return err(incompleteMapError(mapResult));
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
  const checked = completeCheckpoints(mapResult, reduceResult);
  if (!checked.ok) {
    return checked;
  }
  const byId = groundingInstanceOf(checked.value.map);
  const resolved = checked.value.reduce.clusters.map((cluster) => resolveMembers(cluster, byId));
  const missing = resolved.flatMap((entry) => entry.missing);
  if (missing.length > 0) {
    return err(unresolvableMembersError(missing));
  }
  const groundingInstances = resolved.flatMap((entry) => entry.members);
  const resolvedClusterIds = priorValidateResults.flatMap((result) =>
    result.ok ? result.resolvedClusterIds : [],
  );
  const seed = resolveResumeSeed(checked.value.reduce.clusters, resolvedClusterIds);
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
 * Derive META run data: the flagged clusters (for the byte-verifying agent) AND the
 * held-for-review clusters (code-built into distinctly marked ledger rows — no agent),
 * both projected with byte-checkable grounding. `dispositionFromVoters` is not called
 * here — dispositions are already committed in the validate checkpoint(s); this stage
 * only filters and projects them.
 *
 * A corpus whose reduce produced ZERO clusters skips validate entirely (there is
 * nothing to vote on — `validateRunDataFrom` correctly refuses an empty seed): meta
 * then accepts zero validate results and the coverage gate is trivially satisfied,
 * flowing to the empty clean-audit ledger. When clusters EXIST, missing validate
 * coverage errs below, naming every undispositioned cluster.
 */
export function metaRunDataFrom(input: {
  readonly mapResult: MapResult;
  readonly reduceResult: ReduceResult;
  readonly validateResults: readonly ValidateResult[];
}): Result<MetaRunData, Error> {
  const { mapResult, reduceResult, validateResults } = input;
  const checked = completeCheckpoints(mapResult, reduceResult);
  if (!checked.ok) {
    return checked;
  }
  const byId = groundingInstanceOf(checked.value.map);
  const dispositions = mergedDispositions(validateResults);
  // Terminal coverage is recomputed here, never assumed: a cluster no validate attempt
  // ever dispositioned would otherwise silently vanish from the ledger (it is neither
  // flagged nor visibly dropped).
  const uncovered = checked.value.reduce.clusters
    .filter((cluster) => !dispositions.has(cluster.id))
    .map((cluster) => cluster.id);
  if (uncovered.length > 0) {
    return err(
      new Error(
        `validate checkpoints carry no disposition for cluster id(s) [${uncovered.join(', ')}] — ` +
          'an undispositioned cluster would silently vanish from the ledger; complete validate first',
      ),
    );
  }
  const flagged = projectClusters(
    checked.value.reduce.clusters.filter((cluster) => dispositions.get(cluster.id) === 'flagged'),
    byId,
  );
  if (!flagged.ok) {
    return flagged;
  }
  const held = projectClusters(
    checked.value.reduce.clusters.filter(
      (cluster) => dispositions.get(cluster.id) === 'held-for-review',
    ),
    byId,
  );
  if (!held.ok) {
    return held;
  }
  // Zero flagged clusters is a VALID terminal state — a clean audit produces an empty
  // ledger, and held clusters still enter the ledger as held-for-review rows, so an
  // all-held audit can never read as clean.
  return ok({ clusters: flagged.value, heldClusters: held.value });
}
