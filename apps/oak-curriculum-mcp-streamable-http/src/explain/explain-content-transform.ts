/**
 * Explain effort-orientation content assembler (WS-B).
 *
 * Composes the body served by the explain MCP surfaces (tool / resource / prompt) for a
 * remote client with no repo filesystem: a freshness header carrying `lastModified`, then
 * the behaviour shell, then the effort overview.
 *
 * Pure function. The parts are INJECTED (dependency injection), not read from module scope,
 * so this composition is provable with trivial fakes and never pins real prose: the
 * generation script passes the curated `EXPLAIN_BEHAVIOUR_SHELL` and `EXPLAIN_EFFORT_OVERVIEW`
 * constants; tests pass fakes and assert ordering and freshness-header injection.
 *
 * The behaviour shell and effort overview are curated projections of the explain
 * `SKILL-CANONICAL.md` and `README.md`/`VISION.md` respectively, kept faithful and
 * effort-domain-clean by authoring and review — not by an automated content check.
 *
 * @see src/explain/behaviour-shell.ts — the curated behaviour projection
 * @see src/explain/effort-overview.ts — the curated effort-overview projection
 * @see scripts/generate-explain-content.ts — the generation step (IO; injects the constants)
 */

export interface ExplainContentInputs {
  /** The behaviour projection (discernment, delivery modes, honesty invariants, access-aware). */
  behaviourShell: string;
  /** The effort-overview projection (purpose, value-streams, machinery, how to engage). */
  effortOverview: string;
  /** ISO-8601 datetime: the newest source-file commit date (never build/wall-clock). */
  lastModified: string;
}

/**
 * Build the explain effort-orientation body: a freshness header carrying `lastModified`,
 * the behaviour shell, then the effort overview. Deterministic for given inputs.
 */
export function transformExplainContent(inputs: ExplainContentInputs): string {
  const { behaviourShell, effortOverview, lastModified } = inputs;

  return [
    '# Orienting someone to the Oak effort',
    '',
    `_Effort and ecosystem orientation — how Oak builds and delivers its curriculum. ` +
      `For assistants and integrators; this is a separate concern from curriculum content, ` +
      `which other tools serve. Source content last updated: ${lastModified}._`,
    '',
    behaviourShell,
    '',
    effortOverview,
  ].join('\n');
}
