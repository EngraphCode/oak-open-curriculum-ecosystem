/**
 * Explain effort-orientation content assembler (WS-B — Director-ratified Option A, 2026-06-24).
 *
 * Assembles the body served by the explain MCP surfaces (tool / resource / prompt) for a
 * remote client with no repo filesystem, from two CURATED projections plus a freshness
 * header:
 *
 *   - the curated PORTABLE behaviour projection (`EXPLAIN_BEHAVIOUR_SHELL`) — discernment,
 *     the three delivery modes, the honesty invariants, the access-aware principle.
 *   - the curated EFFORT-OVERVIEW (`EXPLAIN_EFFORT_OVERVIEW`) — purpose, value-streams, the
 *     machinery at executive altitude, how to engage; effort-domain only.
 *
 * Both are hand-authored clean and anchored to their sources by drift-guards (the canonical
 * for the behaviour shell, README/VISION for the effort overview), asserted at generation
 * time. Mechanical extraction was abandoned for BOTH halves: it bakes coupling and leaks on
 * real content (the behaviour shell at D1, the effort overview at D2 — both verify-on-real-
 * content findings). Because the inputs are curated-clean, this assembler needs no firewalls:
 * the curriculum and volatility firewalls are held BY CONSTRUCTION in the curated constants
 * and asserted by their unit tests plus the real-content backstop on the generated body.
 *
 * Pure function; no IO, no global clock — `lastModified` is passed in (the generation script
 * derives it from the newest source-file commit date and runs the drift-guards).
 *
 * @see src/explain/behaviour-shell.ts — the curated behaviour projection
 * @see src/explain/effort-overview.ts — the curated effort-overview projection
 * @see scripts/generate-explain-content.ts — the generation step (IO + drift-guards)
 */

import { EXPLAIN_BEHAVIOUR_SHELL } from './behaviour-shell.js';
import { EXPLAIN_EFFORT_OVERVIEW } from './effort-overview.js';

export interface ExplainContentInputs {
  /** ISO-8601 datetime: the newest source-file commit date (never build/wall-clock). */
  lastModified: string;
}

/**
 * Build the explain effort-orientation body. Deterministic for a given `lastModified`:
 * a freshness header, the curated behaviour shell, then the curated effort overview.
 */
export function transformExplainContent(inputs: ExplainContentInputs): string {
  const { lastModified } = inputs;

  return [
    '# Orienting someone to the Oak effort',
    '',
    `_Effort and ecosystem orientation — how Oak builds and delivers its curriculum. ` +
      `For assistants and integrators; this is a separate concern from curriculum content, ` +
      `which other tools serve. Source content last updated: ${lastModified}._`,
    '',
    EXPLAIN_BEHAVIOUR_SHELL,
    '',
    EXPLAIN_EFFORT_OVERVIEW,
  ].join('\n');
}
