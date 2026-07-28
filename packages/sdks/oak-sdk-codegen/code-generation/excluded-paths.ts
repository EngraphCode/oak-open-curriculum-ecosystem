/**
 * Upstream paths the code generators do not consume.
 *
 * Two sets, deliberately separate so a reader can tell a permanent design decision
 * from a temporary one:
 *
 * - {@link SKIPPED_PATHS} — permanent. Honoured by the MCP tool generator only: these
 *   paths remain in the SDK schema, the generated types, and the Zod schemas, but never
 *   become MCP tools, because they are superseded by Elasticsearch search or are not
 *   transportable over MCP. Removing an entry is a design decision, not a chore.
 * - {@link DEFERRED_PATHS} — temporary. Honoured by the whole generation pipeline: the
 *   SDK schema (`api-schema-sdk.json`) and everything derived from it — types, Zod
 *   schemas, MCP tools, parameter and response maps — omit these paths. Owner-ruled
 *   deferral (2026-07-26) tracked by MCP-214 (build the family, blocked by MCP-152)
 *   and MCP-215 (serve it, blocked by MCP-214). When MCP-214 lands, delete this
 *   constant, `apply-deferred-paths.ts`, and their wiring, then regenerate; nothing
 *   else changes.
 *
 * Neither set touches the committed schema cache or the emitted
 * `api-schema-original.json`: both stay verbatim upstream truth, so the CI schema-drift
 * check and the upstream alignment runbook keep comparing like with like.
 */

/** A deferred upstream path and the ticket that lifts its deferral. */
export interface DeferredPathEntry {
  readonly path: string;
  readonly ticket: string;
}

/** Paths excluded from MCP tool generation — superseded by ES search or non-transportable. */
export const SKIPPED_PATHS: ReadonlySet<string> = new Set([
  '/search/lessons',
  '/search/transcripts',
  '/lessons/{lesson}/assets/{type}',
]);

/** The check-restricted (usage-licence) family, deferred whole-pipeline. */
export const DEFERRED_PATHS: readonly DeferredPathEntry[] = [
  { path: '/key-stages/{keyStage}/subject/{subject}/check-restricted', ticket: 'MCP-214' },
  { path: '/lessons/check-restricted', ticket: 'MCP-214' },
];
