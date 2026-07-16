/**
 * Ledger row contracts — the terminal disposition surface of one audited cluster.
 *
 * @remarks
 * Extracted from `schemas.ts` when the ledger grew its second row kind. The row set is a
 * discriminated union on `disposition` so every terminal state is VISIBLE in the ledger:
 *
 * - `flagged` — the meta agent's byte-verified row with an assigned cure. A member whose
 *   quote fails byte-verify can only leave the row by being NAMED in `droppedMembers`
 *   with its reason (never a silent exclusion); a row with any drop is DEGRADED, and may
 *   fall below two surviving instances — even to zero — because the drop list preserves
 *   the cluster's original member floor.
 * - `held-for-review` — the voters disagreed. Code builds this row directly from the
 *   validate checkpoint (no cure, no agent); `heldNote` points at that checkpoint's
 *   `voterVerdicts` as the triage surface. Because held rows are IN the ledger, an
 *   all-held audit renders as N held-marked rows and can never be mistaken for clean.
 *
 * @packageDocumentation
 */

import type { Result } from '@oaknational/result';
import { z } from 'zod';

import { parseWithSchema } from '../core/schema-parse.js';
import { clusterVerdictSchema, confidenceSchema, factClassSchema } from './schemas.js';

const nonEmptyString = z.string().min(1);
const positiveInt = z.number().int().positive();

/** The closed cure menu (plan Deliverable 2 / audit brief) — no open-ended free text. */
const proposedCureSchema = z.enum([
  'cite-register',
  'extract-to-data',
  'derive-from-generator',
  'delete-restatement',
  'mark-as-history',
  'new-single-source',
]);

/**
 * One instance a ledger row carries: byte-verified grounding on `flagged` rows, the map
 * stage's grounding on `held-for-review` rows. `id` is the map-minted member instance
 * id, copied verbatim, so member conservation is recomputable as an exact id-set match
 * (a duplicated survivor can never mask an omitted member behind a matching count).
 */
const ledgerInstanceSchema = z.strictObject({
  id: nonEmptyString,
  file: nonEmptyString,
  line: positiveInt,
  quote: z.string().min(1).max(200),
  valueNorm: nonEmptyString,
});

/**
 * A member the meta agent removed from a row — its map-minted `id` and the
 * file/line/quote it was extracted with, plus the reason it left: a byte-verify
 * failure, or a split-off (the member belongs to a different fact than the row's).
 * Required by name so a removal is always a visible ledger fact, never a metaNotes
 * aside or a silent omission — member conservation (the exact id-set across survivors +
 * drops) is recomputed in code.
 */
const droppedMemberSchema = z.strictObject({
  id: nonEmptyString,
  file: nonEmptyString,
  line: positiveInt,
  quote: z.string().min(1).max(200),
  reason: nonEmptyString,
});

/**
 * The identity fields every row restates VERBATIM from its cluster — `checkLedgerCoverage`
 * recomputes the match per id in code, so a row cannot keep a cluster's id while swapping
 * what fact it claims to disposition.
 */
const rowIdentityFields = {
  id: nonEmptyString,
  factClass: factClassSchema,
  subject: nonEmptyString,
  predicate: nonEmptyString,
  verdict: clusterVerdictSchema,
};

/**
 * The meta agent's output row — the flagged row MINUS the `disposition` discriminant,
 * which code stamps after the agent call (the agent only ever handles flagged clusters).
 * `sourceOfTruth: null` means no single source exists yet — the row feeds prevention
 * design (Deliverable 3), not just a patch. `droppedMembers` is required — an explicit
 * `[]` when nothing was dropped.
 */
const metaAgentRowBaseSchema = z.strictObject({
  ...rowIdentityFields,
  instances: z.array(ledgerInstanceSchema),
  droppedMembers: z.array(droppedMemberSchema),
  sourceOfTruth: nonEmptyString.nullable(),
  proposedCure: proposedCureSchema,
  severity: confidenceSchema,
  metaNotes: z.string(),
});

/** Surviving + dropped members must cover the cluster's original ≥2-member floor. */
function meetsMemberFloor(row: {
  readonly instances: readonly unknown[];
  readonly droppedMembers: readonly unknown[];
}): boolean {
  return row.instances.length + row.droppedMembers.length >= 2;
}

const MEMBER_FLOOR_ERROR =
  'flagged row must cover >=2 members across surviving instances + droppedMembers — ' +
  'a member can leave a row only by being named as dropped';

export const metaAgentRowSchema = metaAgentRowBaseSchema.refine(meetsMemberFloor, {
  error: MEMBER_FLOOR_ERROR,
});
export type MetaAgentRow = z.infer<typeof metaAgentRowSchema>;

const flaggedLedgerRowSchema = metaAgentRowBaseSchema.extend({
  disposition: z.literal('flagged'),
});
export type FlaggedLedgerRow = z.infer<typeof flaggedLedgerRowSchema>;

/**
 * A held-for-review row: voter disagreement, code-built, no cure assigned. Instances are
 * the map stage's grounding (a held cluster keeps its full ≥2-member floor — nothing was
 * byte-verified away).
 */
const heldLedgerRowSchema = z.strictObject({
  disposition: z.literal('held-for-review'),
  ...rowIdentityFields,
  instances: z.array(ledgerInstanceSchema).min(2),
  heldNote: nonEmptyString,
});
export type HeldLedgerRow = z.infer<typeof heldLedgerRowSchema>;

/**
 * LEDGER ROW — the discriminated union rendered into `fix-ledger.v1.json`. The member
 * floor is re-applied at the union (the flagged member schema itself must stay an
 * unrefined object for the discriminated union and for `.extend`).
 */
export const ledgerRowSchema = z
  .discriminatedUnion('disposition', [flaggedLedgerRowSchema, heldLedgerRowSchema])
  .refine((row) => row.disposition !== 'flagged' || meetsMemberFloor(row), {
    error: MEMBER_FLOOR_ERROR,
  });
export type LedgerRow = z.infer<typeof ledgerRowSchema>;

export const parseLedgerRow = (value: unknown): Result<LedgerRow, Error> =>
  parseWithSchema({ label: 'ledger row', schema: ledgerRowSchema, value });
