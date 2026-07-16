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
import type { JSONSchema } from 'zod/v4/core';

import {
  clusterSchema,
  finderInstanceSchema,
  ledgerRowSchema,
  voterVerdictSchema,
} from '../schemas.js';

/** MAP stage agent contract: the window's extracted finder instances. */
const finderStageOutputSchema = z.strictObject({
  instances: z.array(finderInstanceSchema),
});
export type FinderStageOutput = z.infer<typeof finderStageOutputSchema>;

/**
 * REDUCE stage agent contract: reducer-proposed clusters over free-text-subject
 * residuals only (`clusterKind: 'reducer'`) — the exact-key clusters are code-computed
 * by `join.ts` and never pass through an agent.
 */
const clusterStageOutputSchema = z.strictObject({
  clusters: z.array(clusterSchema),
});
export type ClusterStageOutput = z.infer<typeof clusterStageOutputSchema>;

/** VALIDATE stage agent contract: one voter's judgment of one cluster. */
const voterStageOutputSchema = voterVerdictSchema;
export type VoterStageOutput = z.infer<typeof voterStageOutputSchema>;

/** META stage agent contract: the byte-verified, terminal ledger rows. */
const metaStageOutputSchema = z.strictObject({
  rows: z.array(ledgerRowSchema),
});
export type MetaStageOutput = z.infer<typeof metaStageOutputSchema>;

/**
 * A derived, fully-inlined JSON Schema ready for the harness `agent()` schema param,
 * phantom-typed with the output shape it validates: `agent()` infers its return type
 * FROM the schema, so a schema/type mismatch at a call site is uncompilable rather than
 * an unproven claim. The `_output` property never exists at runtime.
 */
export interface DerivedJsonSchema<T = unknown> extends JSONSchema.BaseSchema {
  readonly _output?: T;
}

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
