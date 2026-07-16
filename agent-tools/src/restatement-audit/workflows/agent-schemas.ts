/**
 * Agent-call contracts for the restatement-audit workflow stages.
 *
 * @remarks
 * Mirrors `corpus-analysis/workflows/agent-schemas.ts`: each stage's `agent()` call
 * constrains the model's output with a JSON Schema DERIVED here from the zod SSOT
 * (`../schemas.js`) and inlined into the sandbox artefacts at build time — zod never
 * enters the bundle, and the shape an agent is asked to emit cannot drift from the shape
 * the Node-side boundary re-parses with.
 *
 * The derived schemas must be fully inlined (`$ref`/`$defs` hoisting would not survive
 * the harness `agent()` schema parameter) — {@link deriveAgentJsonSchemas} enforces that
 * invariant at derivation time, and the unit tests pin the exact required/enum shapes.
 *
 * @packageDocumentation
 */

import { z } from 'zod';

import { metaAgentRowSchema } from '../ledger-rows.js';
import { finderInstanceSchema, voterVerdictSchema } from '../schemas.js';
import type { DerivedJsonSchema } from '../../corpus-analysis/workflows/agent-schemas.js';

/** MAP stage agent contract: the window's extracted finder instances. */
const finderStageOutputSchema = z.strictObject({
  instances: z.array(finderInstanceSchema),
});
export type FinderStageOutput = z.infer<typeof finderStageOutputSchema>;

/**
 * REDUCE stage agent contract: MEMBERSHIP PROPOSALS ONLY, exactly what the reducer
 * prompt instructs ("a temporary id and the list of instance ids" — never a verdict, a
 * factClass, or a count). The full `Cluster` shape is code-computed downstream by
 * `recountReducerCluster`; asking the agent for it contradicted the prompt and nulled
 * every prompt-compliant chunk at schema validation.
 */
const reducerProposalSchema = z.strictObject({
  id: z.string().min(1),
  memberInstanceIds: z.array(z.string().min(1)).min(2),
});
const clusterStageOutputSchema = z.strictObject({
  clusters: z.array(reducerProposalSchema),
});
export type ClusterStageOutput = z.infer<typeof clusterStageOutputSchema>;

/** VALIDATE stage agent contract: one voter's judgment of one cluster. */
const voterStageOutputSchema = voterVerdictSchema;
export type VoterStageOutput = z.infer<typeof voterStageOutputSchema>;

/**
 * META stage agent contract: the byte-verified flagged rows, MINUS the `disposition`
 * discriminant code stamps after the call (the agent only ever handles flagged clusters;
 * held-for-review rows are code-built and never pass through it).
 */
const metaStageOutputSchema = z.strictObject({
  rows: z.array(metaAgentRowSchema),
});
export type MetaStageOutput = z.infer<typeof metaStageOutputSchema>;

/**
 * The derived-schema phantom type is DECLARED ONCE, in
 * `corpus-analysis/workflows/agent-schemas.ts` — a second local declaration survived
 * only while both kept the same phantom property. Re-exported so this module's
 * consumers keep a single import site.
 */
export type { DerivedJsonSchema } from '../../corpus-analysis/workflows/agent-schemas.js';

/** The four stage agent schemas, keyed by stage contract. */
export interface AgentJsonSchemas {
  readonly finderStage: DerivedJsonSchema<FinderStageOutput>;
  readonly clusterStage: DerivedJsonSchema<ClusterStageOutput>;
  readonly voterStage: DerivedJsonSchema<VoterStageOutput>;
  readonly metaStage: DerivedJsonSchema<MetaStageOutput>;
}

/**
 * Derive one schema with everything inlined (`reused: 'inline'` — no `$defs`/`$ref`,
 * which the harness cannot resolve) and the `$schema` dialect marker stripped. The
 * fully-inlined and strict-everywhere invariants are pinned by the unit tests.
 */
function deriveInlined<T>(schema: z.ZodType<T>): DerivedJsonSchema<T> {
  const derived = { ...z.toJSONSchema(schema, { reused: 'inline' }) };
  delete derived.$schema;
  return derived;
}

/**
 * Derive the four stage agent schemas from the zod SSOT: `$schema` stripped, everything
 * inlined, strict objects preserved. Runs at build time (and in tests) — never in the
 * sandbox.
 */
export function deriveAgentJsonSchemas(): AgentJsonSchemas {
  return {
    finderStage: deriveInlined(finderStageOutputSchema),
    clusterStage: deriveInlined(clusterStageOutputSchema),
    voterStage: deriveInlined(voterStageOutputSchema),
    metaStage: deriveInlined(metaStageOutputSchema),
  };
}

/**
 * The derived stage agent schemas, as stage entries import them. Under Node this is the
 * live derivation; in a sandbox bundle the build's schema-inline plugin substitutes this
 * module with a precomputed literal of the same export — same SSOT, zod-free artefact.
 */
export const AGENT_JSON_SCHEMAS: AgentJsonSchemas = deriveAgentJsonSchemas();
