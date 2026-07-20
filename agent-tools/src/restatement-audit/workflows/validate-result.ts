/**
 * The validate checkpoint's SUCCESS envelope and its integrity refines.
 *
 * @remarks
 * Split from `stage-io.ts` (file-length discipline, the `derive-stage-run-data.ts`
 * precedent). This is the refine-heavy boundary: every disposition must be backed by
 * exactly two verdicts from two DISTINCT voter identities, and the stored disposition is
 * recomputed via `dispositionFromVoters` — a checkpoint can never smuggle a free-hand or
 * under-voted disposition past the parse (AIP-126 item 1). `stage-io.ts` composes this
 * schema into the `ok`-discriminated `validateResultSchema`.
 *
 * @packageDocumentation
 */

import { z } from 'zod';

import { dispositionFromVoters } from '../disposition.js';
import { dispositionSchema, voterVerdictSchema } from '../schemas.js';

const nonEmptyString = z.string().min(1);

export const validateSuccessSchema = z
  .strictObject({
    ok: z.literal(true),
    validateComplete: z.boolean(),
    resolvedClusterIds: z.array(nonEmptyString),
    incompleteClusterIds: z.array(nonEmptyString),
    missingClusterIds: z.array(nonEmptyString),
    dispositions: z.array(
      z.strictObject({
        clusterId: nonEmptyString,
        disposition: dispositionSchema,
        reason: nonEmptyString.nullable(),
      }),
    ),
    voterVerdicts: z.array(
      z.strictObject({
        clusterId: nonEmptyString,
        voterId: nonEmptyString,
        verdict: voterVerdictSchema,
      }),
    ),
  })
  .refine(
    (result) =>
      result.dispositions.every((entry) => {
        const verdicts = result.voterVerdicts.filter(
          (verdict) => verdict.clusterId === entry.clusterId,
        );
        return (
          verdicts.length === 2 && new Set(verdicts.map((verdict) => verdict.voterId)).size === 2
        );
      }),
    {
      error:
        'validate result carries disposition(s) not backed by exactly two verdicts from two DISTINCT voter identities (two-independent-voter rule)',
    },
  )
  .refine(
    (result) =>
      result.dispositions.every((entry) => {
        const verdicts = result.voterVerdicts.filter(
          (verdict) => verdict.clusterId === entry.clusterId,
        );
        const [first, second] = verdicts;
        // The distinct-pair refine above owns cardinality failures; skip here so each
        // defect reports its own error, not a cascade.
        if (verdicts.length !== 2 || first === undefined || second === undefined) {
          return true;
        }
        return dispositionFromVoters(first.verdict, second.verdict) === entry.disposition;
      }),
    {
      error:
        'validate result carries disposition(s) contradicting their own voter verdicts — dispositions are computed by code, never stored free-hand',
    },
  )
  // The same equality refinement the map/reduce envelopes carry: the live workflow
  // DERIVES validateComplete from incompleteClusterIds emptiness (validate.workflow.ts),
  // so a checkpoint asserting one without the other is internally contradictory.
  .refine((result) => result.validateComplete === (result.incompleteClusterIds.length === 0), {
    error:
      'validateComplete must be true exactly when incompleteClusterIds is empty — a contradicting flag either hides unresolved clusters or forces a needless re-run',
  });
