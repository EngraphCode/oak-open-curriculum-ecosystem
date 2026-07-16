import type { Result } from '@oaknational/result';
import { z } from 'zod';

import { parseWithSchema } from '../core/schema-parse.js';
import { normalizeValue } from './normalize.js';

/**
 * Zod SSOT for the restatement-audit fleet (T3 sweep).
 *
 * @remarks
 * Mirrors `corpus-analysis/judgment-schemas.ts`'s atomic-judgment discipline: an LLM
 * finder emits one atomic, per-instance judgment (never a cross-file count or verdict);
 * deterministic code (`normalize.ts` / `join.ts`) groups instances by fact-key and
 * computes CONFLICT / LATENT; a voter judges one cluster against four conjunctive tests;
 * a meta agent resolves splits and assigns the fix. No agent ever emits a number that is
 * a function of more than one item it is also judging.
 *
 * Design authority: `resilient-wobbling-hartmanis.md` Deliverable 2 (the owner-approved
 * plan) and `.agent/state/collaboration/handoffs/2026-07-16-audit-brief-team-mango.md`.
 *
 * @packageDocumentation
 */

const nonEmptyString = z.string().min(1);
const positiveInt = z.number().int().positive();

/**
 * Qualitative confidence an agent attaches to a single judgment. Module-private: no
 * consumer needs the bare enum yet — every schema below embeds it inline. Re-export the
 * moment a second consumer (e.g. the Director's fix-application code) needs it directly
 * (`consolidate-at-second-consumer`).
 */
const confidenceSchema = z.enum(['low', 'med', 'high']);

/**
 * The eight restatement classes the fleet hunts (plan Deliverable 2). A `factKey` is
 * `(factClass, subject, predicate)` — deterministic and exact-joinable once the
 * gazetteer has resolved `subject` to a canonical id. Module-private for the same reason
 * as `confidenceSchema` above.
 */
const factClassSchema = z.enum([
  'status-assertion',
  'closed-set-membership',
  'count',
  'denominator',
  'threshold',
  'coverage-mapping',
  'named-tool-or-artefact',
  'date-claim',
]);
export type FactClass = z.infer<typeof factClassSchema>;

/**
 * Whether a quoted fact is being freshly stated, cited from elsewhere, narrated as
 * history, or produced by a generator. Only `authored` restatements are the anti-pattern
 * the fleet exists to find — `citation`/`history`/`generated` are legitimate.
 * Module-private for the same reason as `confidenceSchema` above.
 */
const assertionKindSchema = z.enum(['authored', 'citation', 'history', 'generated']);

/**
 * FINDER INSTANCE — one atomic fact assertion a map agent extracts from one file, at
 * high recall. `subjectFromGazetteer` records whether `subject` matched a canonical
 * gazetteer entry (exact-joinable) or is free text (routed to reducer clustering).
 * `quote` is capped at 200 chars — grounding, not a full excerpt.
 *
 * The unrefined base is exported separately for the same reason as `clusterBaseSchema`
 * below — zod v4 forbids `.pick()` on a refined object schema, and `stage-io.ts`'s
 * grounding projection picks from the base. Every parse boundary uses the refined
 * `finderInstanceSchema`, which additionally rejects values whose deterministic normal
 * form is empty (`'.'`, `','` — such an instance would build a schema-invalid cluster
 * downstream). The refinement is not representable in the derived agent JSON Schema;
 * enforcement lives at the checkpoint re-parse.
 */
/**
 * The fact-key components join on `:` (the gazetteer/canary-key convention), so the
 * delimiter is BANNED inside components — `(subject:"a:b", predicate:"c")` and
 * `(subject:"a", predicate:"b:c")` would otherwise collide into one false cluster.
 */
const factKeyComponent = z
  .string()
  .min(1)
  .regex(/^[^:]+$/, 'fact-key components must not contain ":" (the join delimiter)');

export const finderInstanceBaseSchema = z.strictObject({
  id: nonEmptyString,
  file: nonEmptyString,
  line: positiveInt,
  quote: z.string().min(1).max(200),
  factClass: factClassSchema,
  subject: factKeyComponent,
  subjectFromGazetteer: z.boolean(),
  predicate: factKeyComponent,
  valueNorm: nonEmptyString,
  assertionKind: assertionKindSchema,
  confidence: confidenceSchema,
});

export const finderInstanceSchema = finderInstanceBaseSchema.refine(
  (instance) => normalizeValue(instance.valueNorm) !== '',
  { error: 'valueNorm must not normalise to the empty string' },
);
export type FinderInstance = z.infer<typeof finderInstanceSchema>;

/**
 * The two restatement shapes code detects by grouping instances on their fact-key. The
 * bare schema is module-private (same reason as `confidenceSchema` above); `ClusterVerdict`
 * the type stays exported — `join.ts` names it directly.
 */
const clusterVerdictSchema = z.enum(['conflict', 'latent']);
export type ClusterVerdict = z.infer<typeof clusterVerdictSchema>;

/**
 * CLUSTER — a code-computed group of finder instances sharing a fact-key (or, for
 * free-text subjects, a reducer-clustered group over the same predicate/value shape).
 * `conflict` = more than one distinct `valueNorm`; `latent` = one value repeated across
 * two or more files. Code computes `verdict` and `distinctValueNorms`; the reducer never
 * emits either — `clusterKind: 'reducer'` clusters still route through the SAME code
 * recount once the reducer proposes membership.
 *
 * The unrefined base is exported separately because zod v4 forbids `.pick()` on a
 * refined object schema — `stage-io.ts`'s `metaClusterSchema` picks fields from the base,
 * never from `clusterSchema` itself (verified against the real seeded-build path, which
 * unit tests never exercised: `.pick()` on the refined schema throws at module load).
 */
export const clusterBaseSchema = z.strictObject({
  id: nonEmptyString,
  clusterKind: z.enum(['exact-key', 'reducer']),
  factClass: factClassSchema,
  subject: nonEmptyString,
  predicate: nonEmptyString,
  verdict: clusterVerdictSchema,
  distinctValueNorms: z.array(nonEmptyString).min(1),
  memberInstanceIds: z.array(nonEmptyString).min(2),
});

export const clusterSchema = clusterBaseSchema
  .refine(
    (cluster) => new Set(cluster.memberInstanceIds).size === cluster.memberInstanceIds.length,
    {
      error: 'cluster member instance ids must be unique',
    },
  )
  .refine(
    (cluster) =>
      cluster.verdict === 'conflict'
        ? cluster.distinctValueNorms.length > 1
        : cluster.distinctValueNorms.length === 1,
    { error: 'conflict clusters need >1 distinct valueNorm; latent clusters need exactly 1' },
  );
export type Cluster = z.infer<typeof clusterSchema>;

/**
 * One apophenia-style test outcome: did it pass, and how confidently. Module-private
 * (same reason as `confidenceSchema` above) — `disposition.ts` reads `.pass` structurally
 * off `VoterVerdict` without naming this type.
 */
const testJudgmentSchema = z.strictObject({
  pass: z.boolean(),
  confidence: confidenceSchema,
});

/**
 * VOTER VERDICT — one adversary's atomic judgment of one judgment-needed cluster
 * against the four conjunctive tests (plan Deliverable 2, S3 verify): `sameFact` (the
 * join is not a false-positive — every member genuinely asserts the same fact),
 * `authoredNotCited` (this is an authored restatement, not a citation/quote/history),
 * `genuineConflict` (for `conflict` clusters, the values truly disagree, not just
 * phrasing; for `latent`, the repetition is a genuine same-fact copy, not coincidence),
 * `liveSurface` (the file is a live surface, not an archived/historical one). The voter
 * never emits a disposition — code computes it from the four pass/confidence tuples.
 */
export const voterVerdictSchema = z.strictObject({
  sameFact: testJudgmentSchema,
  authoredNotCited: testJudgmentSchema,
  genuineConflict: testJudgmentSchema,
  liveSurface: testJudgmentSchema,
  importance: confidenceSchema,
});
export type VoterVerdict = z.infer<typeof voterVerdictSchema>;

/**
 * The closed cure menu (plan Deliverable 2 / audit brief) — no open-ended free text.
 * Module-private for the same reason as `confidenceSchema` above.
 */
const proposedCureSchema = z.enum([
  'cite-register',
  'extract-to-data',
  'derive-from-generator',
  'delete-restatement',
  'mark-as-history',
  'new-single-source',
]);

/**
 * LEDGER ROW — the meta stage's byte-verified, terminal disposition of one cluster.
 * `sourceOfTruth: null` means no single source exists yet — the row feeds prevention
 * design (Deliverable 3), not just a patch. `instances` carries the meta agent's
 * byte-verified quotes (re-grep'd against the live file), not the map agent's originals.
 */
export const ledgerRowSchema = z.strictObject({
  id: nonEmptyString,
  factClass: factClassSchema,
  subject: nonEmptyString,
  predicate: nonEmptyString,
  verdict: clusterVerdictSchema,
  instances: z
    .array(
      z.strictObject({
        file: nonEmptyString,
        line: positiveInt,
        quote: z.string().min(1).max(200),
        valueNorm: nonEmptyString,
      }),
    )
    .min(2),
  sourceOfTruth: nonEmptyString.nullable(),
  proposedCure: proposedCureSchema,
  severity: confidenceSchema,
  metaNotes: z.string(),
});
export type LedgerRow = z.infer<typeof ledgerRowSchema>;

export const parseFinderInstance = (value: unknown): Result<FinderInstance, Error> =>
  parseWithSchema({ label: 'finder instance', schema: finderInstanceSchema, value });

export const parseCluster = (value: unknown): Result<Cluster, Error> =>
  parseWithSchema({ label: 'cluster', schema: clusterSchema, value });

export const parseVoterVerdict = (value: unknown): Result<VoterVerdict, Error> =>
  parseWithSchema({ label: 'voter verdict', schema: voterVerdictSchema, value });

export const parseLedgerRow = (value: unknown): Result<LedgerRow, Error> =>
  parseWithSchema({ label: 'ledger row', schema: ledgerRowSchema, value });
