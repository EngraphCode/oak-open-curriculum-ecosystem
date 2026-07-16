/**
 * Cluster-set hygiene applied AFTER joining/recount: deterministic dedupe and overlap
 * visibility over the combined exact-key + reducer cluster list. Split from `join.ts`
 * (file-length discipline): joining computes clusters; this module polices the set.
 *
 * @packageDocumentation
 */

import type { Cluster } from './schemas.js';

/**
 * Deduplicate clusters by their MEMBER-SET signature, keeping the first occurrence.
 * Ids cannot dedupe reducer output: proposal ids are re-minted unique per
 * chunk+position, so two proposals covering the same instances would both survive an
 * id-based pass — double voting spend and a duplicate ledger row. Exact-key clusters
 * keep precedence by coming first in the caller's ordering. (Partial-overlap merging
 * is deliberately NOT attempted here — that judgment is the v2 canonicalisation seam.)
 */
export function dedupeByMemberSet(clusters: readonly Cluster[]): Cluster[] {
  const seen = new Set<string>();
  const out: Cluster[] = [];
  for (const cluster of clusters) {
    const signature = [...cluster.memberInstanceIds].sort((a, b) => a.localeCompare(b)).join('|');
    if (!seen.has(signature)) {
      seen.add(signature);
      out.push(cluster);
    }
  }
  return out;
}

/**
 * Instance ids that appear in MORE THAN ONE cluster. Overlap is legal after the
 * factClass-only recount (two reducer proposals may share a member; the voters judge
 * each cluster independently) but must be VISIBLE: a shared member double-counts in
 * grounding and can yield two ledger rows for one underlying statement. Callers log
 * the returned ids; merging partial overlaps is deliberately deferred to the v2
 * canonicalisation seam.
 */
export function overlappingMemberIds(clusters: readonly Cluster[]): string[] {
  const counts = new Map<string, number>();
  for (const cluster of clusters) {
    for (const id of cluster.memberInstanceIds) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  return [...counts.entries()].filter(([, count]) => count > 1).map(([id]) => id);
}
