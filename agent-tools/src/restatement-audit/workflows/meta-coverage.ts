/**
 * Pure, unit-tested meta-stage decision logic — extracted from `meta.workflow.ts` so the
 * sandbox workflow stays a thin dispatcher (the same pattern as `validate.workflow.ts`'s
 * `aggregateValidation`): the clean-audit short-circuit and the ledger coverage
 * recompute both carry regression pins here, where vitest can reach them.
 *
 * @packageDocumentation
 */

import type { LedgerRow } from '../schemas.js';
import type { MetaCluster, MetaResult } from './stage-io.js';

/**
 * The clean-audit short-circuit: zero flagged clusters is a VALID terminal state — the
 * caller emits this empty ledger at zero spend and MUST NOT dispatch an agent. Returns
 * `null` when there are clusters to verify.
 */
export function cleanAuditShortCircuit(clusters: readonly MetaCluster[]): MetaResult | null {
  if (clusters.length > 0) {
    return null;
  }
  return { ok: true, rows: [] };
}

/**
 * Recompute ledger coverage in code, never trusting the agent: every flagged cluster
 * must have EXACTLY ONE row whose id IS the cluster id. Sets alone check presence, not
 * cardinality — duplicate rows for one cluster are counted, never collapsed.
 */
export function checkLedgerCoverage(
  clusters: readonly MetaCluster[],
  rows: readonly LedgerRow[],
): string | null {
  const rowIdCounts = new Map<string, number>();
  for (const row of rows) {
    rowIdCounts.set(row.id, (rowIdCounts.get(row.id) ?? 0) + 1);
  }
  const clusterIds = new Set(clusters.map((cluster) => cluster.id));
  const missingRows = [...clusterIds].filter((id) => !rowIdCounts.has(id));
  const orphanRows = [...rowIdCounts.keys()].filter((id) => !clusterIds.has(id));
  const duplicateRows = [...rowIdCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([id, count]) => `${id}×${count}`);
  if (missingRows.length === 0 && orphanRows.length === 0 && duplicateRows.length === 0) {
    return null;
  }
  return (
    `meta ledger coverage mismatch — cluster id(s) with no row: [${missingRows.join(', ')}]; ` +
    `row id(s) matching no flagged cluster: [${orphanRows.join(', ')}]; ` +
    `cluster id(s) with duplicate rows: [${duplicateRows.join(', ')}]`
  );
}
