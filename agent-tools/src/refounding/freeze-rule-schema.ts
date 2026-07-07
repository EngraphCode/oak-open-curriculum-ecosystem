import type { Result } from '@oaknational/result';
import { z } from 'zod';

import { parseWithSchema } from '../core/schema-parse.js';

/**
 * Freeze-rule schema for the plan-corpus refounding (F1 §2, decision D2;
 * v2 per P2's sanctioned-writer classes).
 *
 * @remarks
 * The freeze rule is a checked-in, owner-ratified data artefact that enumerates
 * surface CLASSES with an `in`/`sweep`/`out` verdict and a recorded reason for
 * every class. Judgement is placed once — at rule authoring, ratified at gate
 * G1 — and the scripts in this module's siblings execute it mechanically; no
 * script and no agent ever decides file-by-file. The shape is closed
 * (`strict-validation-at-boundary`): unknown keys are rejected so a typo'd or
 * smuggled field can never silently widen or narrow the freeze.
 *
 * **Versioning.** The document `version` field selects the schema shape:
 *
 * - **v1** — the shape the S0 freeze consumes: `version`, `ratifiedBy`,
 *   `classes`. A v1 document carries no sanctioned-writer classes.
 * - **v2** — v1 plus `sanctionedWriters`: PATH-scoped sanctioned-writer
 *   classes (`{ id, globs, reason }`, G1 packet §5, P2). A write inside the
 *   frozen denominator matching a sanctioned-writer glob is protocol-authored
 *   — `refound-merge-recheck` classifies it `sanctioned` (reported
 *   separately, never silent, never auto-frozen) instead of flagging it as an
 *   arrival. The array is required and non-empty in v2: a rule with no
 *   sanctioned-writer classes IS a v1 document — no placeholder shapes.
 *
 * The CONTENT-scoped banner diff class is deliberately absent from v2:
 * banner-awareness is sanctioned-diff classification with an EMPTY
 * content-diff class set, i.e. strict byte identity. Banners cannot exist
 * before the R2 F4 banner policy, so there is no banner flag, no exemption
 * parameter, and no empty placeholder here (closed-shape discipline); the
 * banner diff class lands as a schema version bump WITH its policy.
 *
 * `ratifiedBy` is `null` until gate G1 lands. The schema accepts `null` so the
 * draft rule parses; the freeze runner (`runFreeze`) owns the refusal to
 * FREEZE from an unratified rule — parsing a draft and acting on it are
 * different boundaries.
 *
 * @packageDocumentation
 */

const nonEmptyString = z.string().min(1);

/**
 * A class verdict: `in` (frozen and conserved by the denominator), `sweep`
 * (scanned for non-terminal markers, promotable by amendment), or `out`
 * (excluded, with a recorded reason).
 */
const freezeVerdictSchema = z.enum(['in', 'sweep', 'out']);

/** One surface class: an id, its glob set, the verdict, and the recorded reason. */
const freezeRuleClassSchema = z.strictObject({
  id: nonEmptyString,
  globs: z.array(nonEmptyString).min(1),
  verdict: freezeVerdictSchema,
  reason: nonEmptyString,
});

/**
 * One PATH-scoped sanctioned-writer class (P2, G1 packet §5): writes inside
 * the frozen denominator matching `globs` are protocol-authored, never
 * self-noise arrivals. All fields non-empty; closed shape.
 */
const sanctionedWriterClassSchema = z.strictObject({
  id: nonEmptyString,
  globs: z.array(nonEmptyString).min(1),
  reason: nonEmptyString,
});
export type SanctionedWriterClass = z.infer<typeof sanctionedWriterClassSchema>;

const freezeRuleV1Schema = z.strictObject({
  version: z.literal(1),
  ratifiedBy: nonEmptyString.nullable(),
  classes: z.array(freezeRuleClassSchema).min(1),
});

const freezeRuleV2Schema = z.strictObject({
  version: z.literal(2),
  ratifiedBy: nonEmptyString.nullable(),
  classes: z.array(freezeRuleClassSchema).min(1),
  sanctionedWriters: z.array(sanctionedWriterClassSchema).min(1),
});

/**
 * The whole rule document (`.agent/plans-refounding/freeze-rule.json`), v1 or
 * v2. `ratifiedBy` is the owner-gate record path once G1 lands, `null` before.
 */
const freezeRuleSchema = z.discriminatedUnion('version', [freezeRuleV1Schema, freezeRuleV2Schema]);
export type FreezeRule = z.infer<typeof freezeRuleSchema>;

/**
 * The rule's sanctioned-writer classes across schema versions: a v1 document
 * has none (the classes arrive with v2), a v2 document carries its declared
 * set.
 */
export function sanctionedWriterClasses(rule: FreezeRule): readonly SanctionedWriterClass[] {
  return rule.version === 2 ? rule.sanctionedWriters : [];
}

/**
 * Parse an unknown value as a freeze rule at the read boundary.
 *
 * @remarks
 * A parse failure is a typed value the operator inspects, never a thrown
 * exception (the shared `core/schema-parse.ts` boundary helper).
 *
 * @param value - The raw JSON value read from the rule file.
 * @returns The parsed {@link FreezeRule}, or an `Error` naming the boundary.
 */
export const parseFreezeRule = (value: unknown): Result<FreezeRule, Error> =>
  parseWithSchema({ label: 'freeze rule', schema: freezeRuleSchema, value });
