import { z } from 'zod';
import { type Result } from '@oaknational/result';

import { parseWithSchema } from '../core/schema-parse.js';

/**
 * Plan-state recomputation model (R0b, F5 "one engine, two adapters"): the
 * closed types the deterministic engine consumes and emits. Recorded status
 * is a CLAIM; recomputed evidence is held equal to it in both divergence
 * directions (`plan-node-schema.v0.md` V0.1 §1).
 *
 * GATE-SEMANTICS TABLE (the contract; `decideGateVerdict` implements it):
 *
 * | Row class                    | Gate effect          |
 * | ---------------------------- | -------------------- |
 * | `recorded-done-but-red`      | RED (exit non-zero)  |
 * | `recorded-pending-but-green` | RED (exit non-zero)  |
 * | `unmapped-status`            | counted, never gates |
 * | `no-evidence`                | counted, never gates |
 * | `attested`                   | counted, never gates |
 * | `consistent`                 | green                |
 *
 * Over-band UNMAPPED (strictly more than 20% of rows) is a named HALT — an
 * `Err` before any report exists (mapping-table mis-fit, inspect the table);
 * distinct from a refusal on malformed input and from a RED report. A zero-row
 * input is the named `vacuous` class: reported, and the GATE refuses to pass
 * on it (a gate that scanned nothing must not pass) — never silently green.
 *
 * R1 PRECONDITION (deferred by design, the F2-precedent flag): the five
 * recomputable proof kinds have NO executors in R0b — evidence enters the
 * engine as injected typed verdicts (fixture-driven; the DI seam). Before
 * r1's audit-mode run can produce the claim-vs-derived divergence report,
 * per-kind executors must land, and each owes its OWN prove-it-fires
 * discrimination proof (P4 is NOT discharged by this module's engine-level
 * mutation proofs).
 *
 * @packageDocumentation
 */

const nonEmptyString = z.string().min(1);

/**
 * The V0.1 closed six-kind proof taxonomy, in the owner-signed order
 * (`plan-node-schema.v0.md` V0.1 §1). `artifact` is the ratified literal —
 * never respell it. The uniform `ref` field is proof-shape v1: the reference
 * resolving against a committed registry (registries land with the executors;
 * the refinement axis is kind-specific reference fields in a later version).
 */
const PROOF_KINDS_V1 = ['artifact', 'gate', 'probe', 'git-fact', 'ratified', 'attested'] as const;
export type ProofKind = (typeof PROOF_KINDS_V1)[number];

/**
 * The recomputable subset: every kind except `attested`, which has no
 * recomputer BY DESIGN (F5: attested-count is a reported signal, never a
 * gate). The evidence input type is built from THIS set, so an evidence
 * verdict for an attested proof is unrepresentable at the type level; the
 * engine additionally refuses one arriving by key-join at runtime.
 */
const RECOMPUTABLE_PROOF_KINDS_V1 = ['artifact', 'gate', 'probe', 'git-fact', 'ratified'] as const;
export type RecomputableProofKind = (typeof RECOMPUTABLE_PROOF_KINDS_V1)[number];

/** A V0.1 todo proof: one closed kind plus its registry reference. */
export const proofSchema = z.strictObject({
  kind: z.enum(PROOF_KINDS_V1),
  ref: nonEmptyString,
});
type Proof = z.infer<typeof proofSchema>;

/**
 * One recorded-status claim row, adapter-produced: the gate adapter keys
 * rows `<planPath>#<todoId>`; the audit adapter keys rows `<file>:<line>`
 * (frozen coordinates). `recordedStatus` is verbatim (trim happens at
 * mapping application, never at capture); `proof` is the declared V0.1
 * proof or `null` for a V0 todo (schema-valid: proof is optional on the
 * schema and required-at-authoring only for refounding-produced plans —
 * that rule belongs to the AUTHORING gate, never to this engine).
 */
export interface ClaimRow {
  readonly key: string;
  readonly recordedStatus: string;
  readonly proof: Proof | null;
}

/**
 * One injected recomputation verdict (the DI seam). When the joined claim
 * declares a proof, `kind` must match it; a claim with no declared proof
 * accepts evidence of any recomputable kind (the audit path recomputes
 * from the estate's instruments, not from declared proofs).
 */
export const evidenceVerdictSchema = z.strictObject({
  key: nonEmptyString,
  kind: z.enum(RECOMPUTABLE_PROOF_KINDS_V1),
  verdict: z.enum(['green', 'red']),
  detail: z.string().nullable(),
});
export type EvidenceVerdict = z.infer<typeof evidenceVerdictSchema>;

/** The closed row-class set (see the gate-semantics table above). */
export const ROW_CLASSES_V1 = [
  'consistent',
  'recorded-done-but-red',
  'recorded-pending-but-green',
  'unmapped-status',
  'no-evidence',
  'attested',
] as const;
export type RowClass = (typeof ROW_CLASSES_V1)[number];

/**
 * The v1 canonical-claim codomain: table v1 maps TODO-status instances only
 * (`plan-node-schema.v0.md` §2: `status: pending | completed`). Plan-level
 * status values (`superseded`, `active`, …) are deliberately OUT OF SCOPE —
 * they surface as UNMAPPED residue, and the over-band halt firing on them at
 * r1 is the designed table-v2 trigger, not a defect.
 */
const CANONICAL_CLAIMS_V1 = ['pending', 'completed'] as const;
export type CanonicalClaim = (typeof CANONICAL_CLAIMS_V1)[number];

/**
 * The plan-state status-mapping table shape as THIS module consumes it:
 * the census's document invariants (version, pre-trimmed unique values)
 * with the verdict codomain narrowed to {@link CANONICAL_CLAIMS_V1}. The
 * census keeps `verdict` an open string at ITS parse boundary; production
 * wiring across `refounding`→`plan-state` remains the deferred C1
 * reintegration decision — shape compatibility is proven by test, not by a
 * production import.
 */
const planStateTableSchema = z.strictObject({
  version: z.number().int().positive(),
  entries: z
    .array(
      z.strictObject({
        value: nonEmptyString.refine((value) => value === value.trim(), {
          message: 'mapping values must be pre-trimmed (application is exact-match-after-trim)',
        }),
        verdict: z.enum(CANONICAL_CLAIMS_V1),
      }),
    )
    .min(1),
});
export type PlanStateTable = z.infer<typeof planStateTableSchema>;

/** Parse an unknown value as a {@link PlanStateTable} at the engine boundary. */
export const parsePlanStateTable = (value: unknown): Result<PlanStateTable, Error> =>
  parseWithSchema({
    label: 'plan-state status-mapping table',
    schema: planStateTableSchema,
    value,
  });

/** Versioned report basename (the landed versioned-basename convention). */
export const PLAN_STATE_REPORT_BASENAME = 'plan-state.v1.report.json';

/** One recomputation-verdict echo on a report row. */
interface ReportEvidence {
  readonly kind: RecomputableProofKind;
  readonly verdict: 'green' | 'red';
}

/** One report row (classes per the gate-semantics table above). */
export interface ReportRow {
  readonly key: string;
  readonly recordedStatus: string;
  readonly canonicalClaim: CanonicalClaim | null;
  readonly rowClass: RowClass;
  readonly evidence: readonly ReportEvidence[];
}

/**
 * The `plan-state.v1.report.json` document: rows sorted by key, the closed
 * per-class count list (every class, list order, zero-counts included), the
 * UNMAPPED residue detail, and the named `vacuous` flag. No timestamps,
 * byte-stable. Constructed by the engine — typed, never parsed here; r1's
 * report READER owns the parse boundary when it lands.
 */
export interface PlanStateReport {
  readonly version: 1;
  readonly tableVersion: number;
  readonly rows: readonly ReportRow[];
  readonly summary: {
    readonly rows: number;
    readonly byClass: readonly { readonly rowClass: RowClass; readonly count: number }[];
    readonly unmapped: { readonly count: number; readonly distinctValues: readonly string[] };
    readonly vacuous: boolean;
  };
}
