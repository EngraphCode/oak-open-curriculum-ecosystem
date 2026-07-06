import type { Result } from '@oaknational/result';
import { z } from 'zod';

import { parseWithSchema } from '../core/schema-parse.js';

/**
 * Freeze-rule schema for the plan-corpus refounding (F1 §2, decision D2).
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
 * The whole rule document (`.agent/plans-refounding/freeze-rule.json`).
 * `ratifiedBy` is the owner-gate record path once G1 lands, `null` before.
 */
const freezeRuleSchema = z.strictObject({
  version: z.number().int().positive(),
  ratifiedBy: nonEmptyString.nullable(),
  classes: z.array(freezeRuleClassSchema).min(1),
});
export type FreezeRule = z.infer<typeof freezeRuleSchema>;

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
