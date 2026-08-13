/**
 * Latest-run-per-check reduction of a status-check rollup.
 *
 * GitHub evaluates a check through its LATEST run on the head commit;
 * superseded runs (concurrency-cancelled twins of a duplicated trigger
 * delivery, re-runs) stay in the rollup as residue. This module mirrors
 * that semantic for Actions check runs, and ONLY for them: exactly the
 * items with `__typename === 'CheckRun'` and a real name participate,
 * keyed per workflow so same-named checks from different workflows (or
 * apps) never conflate; StatusContexts (already collapsed per context by
 * GitHub) and unnamed items pass through untouched, each still counted.
 *
 * Recency alone never greens: a candidate displaces its incumbent only
 * when BOTH sides carry a parseable anchor (completedAt, else startedAt)
 * and the candidate's is strictly newer. Every other same-key comparison
 * — an anchor tie, either side undated — resolves to the MORE-BLOCKING
 * item (failed outranks pending outranks passed): unknown is never
 * latest-known, in
 * either direction, so no green survives a failure it cannot prove it
 * superseded (the same doctrine as checksGreenAt's partial-anchor null).
 *
 * Worked instance (PR #846, 2026-08-13): a duplicated pull_request
 * delivery left one CI run cancelled beside its green twin on the SAME
 * sha, and the undeduped read held CHECKS-RED against a head GitHub
 * itself evaluated as green.
 */

export interface RollupCheckShape {
  readonly __typename: string;
  readonly name?: string | null;
  readonly workflowName?: string | null;
  readonly completedAt?: string | null;
  readonly startedAt?: string | null;
}

/** Blocking order for survivor ties: failed outranks pending outranks passed. */
const BLOCKING_RANK: Record<'failed' | 'pending' | 'passed', number> = {
  failed: 2,
  pending: 1,
  passed: 0,
};

export function blockingRank(bucket: 'failed' | 'pending' | 'passed'): number {
  return BLOCKING_RANK[bucket];
}

// Epoch anchor, or null when absent/unparseable — an undatable timestamp
// is treated exactly like a missing one (never "latest-known").
function anchorOf(item: RollupCheckShape): number | null {
  const raw = item.completedAt ?? item.startedAt ?? null;
  if (raw === null || raw === undefined) {
    return null;
  }
  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? null : parsed;
}

function participates(item: RollupCheckShape): boolean {
  return item.__typename === 'CheckRun' && typeof item.name === 'string' && item.name.length > 0;
}

function reductionKey(item: RollupCheckShape): string {
  return `${item.workflowName ?? ''}\u0000${item.name ?? ''}`;
}

function survivorOf<T extends RollupCheckShape>(
  incumbent: T,
  candidate: T,
  rank: (item: T) => number,
): T {
  const incumbentAnchor = anchorOf(incumbent);
  const candidateAnchor = anchorOf(candidate);
  if (incumbentAnchor !== null && candidateAnchor !== null && incumbentAnchor !== candidateAnchor) {
    return candidateAnchor > incumbentAnchor ? candidate : incumbent;
  }
  return rank(candidate) > rank(incumbent) ? candidate : incumbent;
}

function reduceSurvivors<T extends RollupCheckShape>(
  items: readonly T[],
  rank: (item: T) => number,
): Map<string, T> {
  const survivors = new Map<string, T>();
  for (const item of items.filter(participates)) {
    const key = reductionKey(item);
    const incumbent = survivors.get(key);
    survivors.set(key, incumbent === undefined ? item : survivorOf(incumbent, item, rank));
  }
  return survivors;
}

/**
 * Reduce rollup items to the latest run per (workflow, check name), each
 * key's survivor emitted at the position of the key's first occurrence;
 * non-participating items pass through in place.
 */
export function latestRunPerCheck<T extends RollupCheckShape>(
  items: readonly T[],
  rank: (item: T) => number,
): T[] {
  const survivors = reduceSurvivors(items, rank);
  const emitted = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (!participates(item)) {
      out.push(item);
      continue;
    }
    const key = reductionKey(item);
    const kept = survivors.get(key);
    if (kept !== undefined && !emitted.has(key)) {
      emitted.add(key);
      out.push(kept);
    }
  }
  return out;
}
