import { err, ok, type Result } from '@oaknational/result';

import { compareByCodeUnit } from '../refounding/refounding-artefacts.js';
import {
  PROOF_KIND_RECOMPUTATION,
  ROW_CLASSES_V1,
  type CanonicalClaim,
  type ClaimRow,
  type EvidenceVerdict,
  type PlanStateReport,
  type PlanStateTable,
  type ReportRow,
  type RowClass,
} from './plan-state-model.js';

/**
 * The ONE deterministic plan-state recomputation engine (F5): recorded
 * claims in, injected recomputation verdicts in, divergence report out —
 * pure, sorted, byte-stable, timestamp-free. Both adapters (the permanent
 * gate adapter over V0.1 frontmatter and the disposable audit adapter over
 * census records) feed this same function; neither owns any verdict logic.
 *
 * Outcome identities (three, kept distinct per the landed verify idiom):
 * refusal (`Err`, malformed input, nothing computed) — over-band UNMAPPED
 * halt (`Err` with the halt-and-inspect message shape, nothing reported) —
 * RED (an `Ok` report whose rows carry divergence classes; the gate verdict
 * decides the exit code). The gate-semantics table lives in
 * `plan-state-model.ts`.
 *
 * `compareByCodeUnit` is imported from the refounding module's artefact
 * utilities — a utility-direction dependency only. The deferred C1 coupling
 * is the OPPOSITE direction (census consuming this module's table stays an
 * injected input). BOUND COMMITMENT (gateway ruling 2026-07-07): the shared
 * utilities (`compareByCodeUnit`, `parseJsonDocument`, the path-resolve
 * pair) extract to `agent-tools/src/core/` as a NAMED R1-runway work item —
 * before any third consuming module appears and no later than the
 * refounded-corpus milestone — merging the two JSON-parse-at-boundary owners
 * (ADR-088 Result form wins) and dropping the `refound-` naming.
 *
 * @packageDocumentation
 */

/** The UNMAPPED halt band: strictly more than 20% of rows (the H shape). */
const UNMAPPED_HALT_PERCENT = 20;

/** The engine's full input: claims, evidence, and the parsed v1 table. */
export interface PlanStateInput {
  readonly claims: readonly ClaimRow[];
  readonly evidence: readonly EvidenceVerdict[];
  readonly table: PlanStateTable;
}

interface JoinedClaim {
  readonly claim: ClaimRow;
  readonly evidence: EvidenceVerdict[];
}

/** The refusal (or null) for attaching one evidence verdict to its claim. */
function joinRefusal(joined: JoinedClaim, verdict: EvidenceVerdict): Error | null {
  if (joined.claim.proof?.kind === 'attested') {
    return new Error(
      `evidence for attested-proof claim '${verdict.key}' — attested has no recomputer ` +
        'by design (reported signal, never a gate); refusing (nothing computed)',
    );
  }
  if (joined.claim.proof !== null && joined.claim.proof.kind !== verdict.kind) {
    return new Error(
      `evidence kind '${verdict.kind}' does not match declared proof kind ` +
        `'${joined.claim.proof.kind}' on claim '${verdict.key}' — refusing (nothing computed)`,
    );
  }
  return null;
}

/** Join evidence rows onto claims by key; refuse every malformed join. */
function joinEvidence(
  claims: readonly ClaimRow[],
  evidence: readonly EvidenceVerdict[],
): Result<Map<string, JoinedClaim>, Error> {
  const byKey = new Map<string, JoinedClaim>();
  for (const claim of claims) {
    if (byKey.has(claim.key)) {
      return err(new Error(`duplicate claim key '${claim.key}' — refusing (nothing computed)`));
    }
    byKey.set(claim.key, { claim, evidence: [] });
  }
  for (const verdict of evidence) {
    const joined = byKey.get(verdict.key);
    if (joined === undefined) {
      return err(
        new Error(`evidence for unknown claim key '${verdict.key}' — refusing (nothing computed)`),
      );
    }
    const refusal = joinRefusal(joined, verdict);
    if (refusal !== null) {
      return err(refusal);
    }
    joined.evidence.push(verdict);
  }
  return ok(byKey);
}

/** Classify one joined row (precedence: unmapped, reported-only, no-evidence, then divergence). */
function classifyRow(joined: JoinedClaim, canonicalClaim: CanonicalClaim | null): RowClass {
  if (canonicalClaim === null) {
    return 'unmapped-status';
  }
  if (
    joined.claim.proof !== null &&
    PROOF_KIND_RECOMPUTATION[joined.claim.proof.kind] === 'reported-only'
  ) {
    return 'attested';
  }
  if (joined.evidence.length === 0) {
    return 'no-evidence';
  }
  const anyRed = joined.evidence.some((entry) => entry.verdict === 'red');
  if (canonicalClaim === 'completed') {
    return anyRed ? 'recorded-done-but-red' : 'consistent';
  }
  return anyRed ? 'consistent' : 'recorded-pending-but-green';
}

interface BuiltRows {
  readonly rows: ReportRow[];
  readonly unmappedCount: number;
  readonly unmappedValues: ReadonlySet<string>;
}

/** Map and classify every joined claim into its (unsorted) report row. */
function buildRows(
  joinedByKey: ReadonlyMap<string, JoinedClaim>,
  table: PlanStateTable,
): BuiltRows {
  const verdictByValue = new Map<string, CanonicalClaim>(
    table.entries.map((entry) => [entry.value, entry.verdict]),
  );
  const unmappedValues = new Set<string>();
  let unmappedCount = 0;
  const rows: ReportRow[] = [];
  for (const joined of joinedByKey.values()) {
    const trimmed = joined.claim.recordedStatus.trim();
    const canonicalClaim = verdictByValue.get(trimmed) ?? null;
    if (canonicalClaim === null) {
      unmappedCount += 1;
      unmappedValues.add(trimmed);
    }
    rows.push({
      key: joined.claim.key,
      recordedStatus: joined.claim.recordedStatus,
      canonicalClaim,
      rowClass: classifyRow(joined, canonicalClaim),
      evidence: [...joined.evidence]
        .map((entry) => ({ kind: entry.kind, verdict: entry.verdict, detail: entry.detail }))
        .sort(
          (a, b) => compareByCodeUnit(a.kind, b.kind) || compareByCodeUnit(a.verdict, b.verdict),
        ),
    });
  }
  return { rows, unmappedCount, unmappedValues };
}

/**
 * Derive the plan-state report — the two-direction gate's substance: a
 * recorded `completed` with any red recomputation is `recorded-done-but-red`;
 * a recorded `pending` with all-green recomputation is
 * `recorded-pending-but-green`. Mapping is exact-match-after-trim against
 * the v1 table; UNMAPPED is counted residue and strictly-over-20% of rows is
 * the named halt. A zero-claim input with zero evidence is the named
 * `vacuous` report; zero claims with evidence present is a refusal.
 */
export function derivePlanState(input: PlanStateInput): Result<PlanStateReport, Error> {
  if (input.claims.length === 0 && input.evidence.length > 0) {
    return err(new Error('evidence supplied with zero claims — refusing (nothing computed)'));
  }
  const joinedResult = joinEvidence(input.claims, input.evidence);
  if (!joinedResult.ok) {
    return joinedResult;
  }
  const { rows, unmappedCount, unmappedValues } = buildRows(joinedResult.value, input.table);
  if (unmappedCount * 100 > rows.length * UNMAPPED_HALT_PERCENT) {
    return err(
      new Error(
        `plan-state halt-and-inspect: ${String(unmappedCount)} of ${String(rows.length)} ` +
          `row(s) are UNMAPPED — over the ${String(UNMAPPED_HALT_PERCENT)}% band, a ` +
          'mapping-table mis-fit signal; inspect the table, never push through (nothing written)',
      ),
    );
  }
  rows.sort((a, b) => compareByCodeUnit(a.key, b.key));
  return ok({
    version: 1,
    tableVersion: input.table.version,
    rows,
    summary: {
      rows: rows.length,
      byClass: ROW_CLASSES_V1.map((rowClass) => ({
        rowClass,
        count: rows.filter((row) => row.rowClass === rowClass).length,
      })),
      unmapped: {
        count: unmappedCount,
        distinctValues: [...unmappedValues].sort(compareByCodeUnit),
      },
      vacuous: rows.length === 0,
    },
  });
}
