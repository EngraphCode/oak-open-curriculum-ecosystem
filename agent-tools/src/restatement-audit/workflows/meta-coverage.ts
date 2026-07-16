/**
 * Pure, unit-tested meta-stage decision logic — extracted from `meta.workflow.ts` so the
 * sandbox workflow stays a thin dispatcher (the same pattern as `validate.workflow.ts`'s
 * `aggregateValidation`): the held-row builder, the zero-flagged short-circuit, and the
 * ledger coverage recompute all carry regression pins here, where vitest can reach them.
 *
 * @packageDocumentation
 */

import type { HeldLedgerRow, LedgerRow, MetaAgentRow } from '../ledger-rows.js';
import type { MetaCluster, MetaResult } from './stage-io.js';

/**
 * Build the held-for-review ledger rows in code — the voters disagreed, so no cure is
 * assigned and no agent runs; the row's distinct marking keeps the disagreement visible
 * in the terminal disposition surface, and `heldNote` points at the validate checkpoint
 * (the `voterVerdicts` for this cluster id) as the triage surface.
 */
export function heldLedgerRows(heldClusters: readonly MetaCluster[]): HeldLedgerRow[] {
  return heldClusters.map((cluster) => ({
    disposition: 'held-for-review' as const,
    id: cluster.id,
    factClass: cluster.factClass,
    subject: cluster.subject,
    predicate: cluster.predicate,
    verdict: cluster.verdict,
    instances: cluster.instances.map(({ file, line, quote, valueNorm }) => ({
      file,
      line,
      quote,
      valueNorm,
    })),
    heldNote:
      'voters disagreed — triage via the validate checkpoint voterVerdicts for this cluster id',
  }));
}

/**
 * Zero flagged clusters needs NO meta agent: the ledger is exactly the held rows —
 * empty on a truly clean audit, N held-marked rows when voters disagreed everywhere
 * (an all-held audit must never render as clean). Returns `null` when flagged clusters
 * exist — the agent must be dispatched.
 */
export function zeroFlaggedShortCircuit(
  clusters: readonly MetaCluster[],
  heldRows: readonly HeldLedgerRow[],
): MetaResult | null {
  if (clusters.length > 0) {
    return null;
  }
  return { ok: true, rows: [...heldRows] };
}

/**
 * Compose the terminal ledger: stamp the `flagged` discriminant on every agent row (the
 * agent never emits one) and append the held rows, flagged first. Extracted so the MIXED
 * audit — flagged AND held clusters together — carries a regression pin: held rows must
 * survive composition on the agent-dispatched path, never only on the zero-flagged
 * short-circuit path.
 */
export function composeMetaLedger(
  agentRows: readonly MetaAgentRow[],
  heldRows: readonly HeldLedgerRow[],
): LedgerRow[] {
  return [...agentRows.map((row) => ({ ...row, disposition: 'flagged' as const })), ...heldRows];
}

/** The fields a row must restate VERBATIM from its cluster — identity, not judgment. */
const ROW_IDENTITY_FIELDS = ['factClass', 'subject', 'predicate', 'verdict'] as const;

/** `id.field row='x' cluster='y'` for every identity field a row disagrees with its cluster on. */
function fieldIdentityMismatches(
  clusters: readonly MetaCluster[],
  rows: readonly MetaAgentRow[],
): string[] {
  const byClusterId = new Map(clusters.map((cluster) => [cluster.id, cluster]));
  const mismatches: string[] = [];
  for (const row of rows) {
    const cluster = byClusterId.get(row.id);
    if (cluster === undefined) {
      continue; // an orphan row is already reported by the cardinality check
    }
    for (const field of ROW_IDENTITY_FIELDS) {
      if (row[field] !== cluster[field]) {
        mismatches.push(`${row.id}.${field} row='${row[field]}' cluster='${cluster[field]}'`);
      }
    }
  }
  return mismatches;
}

/**
 * Recompute ledger coverage in code, never trusting the agent: every flagged cluster
 * must have EXACTLY ONE row whose id IS the cluster id, that row must restate the
 * cluster's identity fields verbatim — an id alone is not coverage (a row could keep
 * the id while swapping factClass/subject/predicate/verdict, dispositioning a fact
 * nobody flagged) — and every row must cover the ≥2 member floor across surviving
 * instances + droppedMembers. The floor is re-checked here because it is a zod refine,
 * unrepresentable in the derived agent JSON schema: the in-sandbox structured-output
 * call cannot reject a sub-floor row, so this recompute is the cheap in-stage gate
 * (the Node re-parse boundary would otherwise refuse the already-committed checkpoint
 * downstream). Sets alone check presence, not cardinality — duplicate rows for one
 * cluster are counted, never collapsed.
 */
export function checkLedgerCoverage(
  clusters: readonly MetaCluster[],
  rows: readonly MetaAgentRow[],
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
  const mismatches = fieldIdentityMismatches(clusters, rows);
  const subFloorRows = rows
    .filter((row) => row.instances.length + row.droppedMembers.length < 2)
    .map(
      (row) =>
        `${row.id} (${row.instances.length} surviving + ${row.droppedMembers.length} dropped)`,
    );
  if (
    missingRows.length === 0 &&
    orphanRows.length === 0 &&
    duplicateRows.length === 0 &&
    mismatches.length === 0 &&
    subFloorRows.length === 0
  ) {
    return null;
  }
  return (
    `meta ledger coverage mismatch — cluster id(s) with no row: [${missingRows.join(', ')}]; ` +
    `row id(s) matching no flagged cluster: [${orphanRows.join(', ')}]; ` +
    `cluster id(s) with duplicate rows: [${duplicateRows.join(', ')}]; ` +
    `field-identity mismatch(es): [${mismatches.join('; ')}]; ` +
    `row(s) below the ≥2 member floor: [${subFloorRows.join(', ')}]`
  );
}
