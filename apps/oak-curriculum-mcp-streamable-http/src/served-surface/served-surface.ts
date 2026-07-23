/**
 * The declarative served-surface definition — the single point of control
 * for what this app serves (ratified plan mcp-101-visible-surface-allowlist;
 * decisions register D11/D22).
 *
 * One structural, registration-time allowlist: enabling or disabling any
 * surface element is a reviewed change to this one definition, never a
 * runtime flag. The constant is module-level and evaluated once at process
 * start, so the served surface cannot drift between the per-request
 * `McpServer` instances (ADR-112) — every request registers from the same
 * definition object.
 *
 * `universalTools` is TOTAL over the SDK's generated tool registry: the
 * `satisfies` clause makes a codegen-added tool a compile error here (it
 * must be classified live or dormant deliberately), and the unit suite
 * recomputes totality against the live registry at test time.
 *
 * App-local surfaces (registered outside the universal enumeration) have
 * their own rows so the definition covers everything served, with no
 * special cases hiding outside it.
 */

import type { UniversalToolName } from '@oaknational/curriculum-sdk/public/mcp-tools.js';

/** A served-surface element is exactly live (registered) or dormant (retained, not registered). */
type ServedState = 'live' | 'dormant';

/** Tools this app registers outside the SDK's universal enumeration. */
export type AppLocalToolName = 'oak-under-the-hood';

/** The full tool-surface classification. */
export interface ServedSurfaceDefinition {
  readonly universalTools: Readonly<Record<UniversalToolName, ServedState>>;
  readonly appLocalTools: Readonly<Record<AppLocalToolName, ServedState>>;
}

/**
 * The canonical served surface.
 *
 * Dormant rows: the two user-search MCP App tools — the MCP App
 * user-search experience is not built yet (previously gated by the
 * `OAK_CURRICULUM_MCP_USER_SEARCH_ENABLED` env flag, superseded by this
 * definition). Everything else on the tool surface is live.
 */
export const SERVED_SURFACE = {
  universalTools: {
    search: 'live',
    fetch: 'live',
    'get-curriculum-model': 'live',
    'get-thread-progressions': 'live',
    'get-prior-knowledge-graph': 'live',
    'get-misconception-graph': 'live',
    'get-keyword-graph': 'live',
    'get-eef-evidence': 'live',
    'browse-curriculum': 'live',
    'explore-topic': 'live',
    'download-asset': 'live',
    'user-search': 'dormant',
    'user-search-query': 'dormant',
    'get-changelog': 'live',
    'get-changelog-latest': 'live',
    'get-key-stages': 'live',
    'get-key-stages-subject-assets': 'live',
    'get-key-stages-subject-lessons': 'live',
    'get-key-stages-subject-questions': 'live',
    'get-key-stages-subject-units': 'live',
    'get-keywords': 'live',
    'get-lessons-assets': 'live',
    'get-lessons-quiz': 'live',
    'get-lessons-summary': 'live',
    'get-lessons-transcript': 'live',
    'get-programmes': 'live',
    'get-programmes-assets': 'live',
    'get-programmes-questions': 'live',
    'get-programmes-units': 'live',
    'get-rate-limit': 'live',
    'get-sequences': 'live',
    'get-sequences-assets': 'live',
    'get-sequences-questions': 'live',
    'get-sequences-units': 'live',
    'get-subject-detail': 'live',
    'get-subjects': 'live',
    'get-subjects-key-stages': 'live',
    'get-subjects-programmes': 'live',
    'get-subjects-years': 'live',
    'get-threads': 'live',
    'get-threads-units': 'live',
    'get-units-summary': 'live',
  },
  appLocalTools: {
    'oak-under-the-hood': 'live',
  },
} as const satisfies ServedSurfaceDefinition;

/** Whether a universal tool is live under the given definition. */
export function isUniversalToolLive(
  definition: ServedSurfaceDefinition,
  name: UniversalToolName,
): boolean {
  return definition.universalTools[name] === 'live';
}

/** Whether an app-local tool is live under the given definition. */
export function isAppLocalToolLive(
  definition: ServedSurfaceDefinition,
  name: AppLocalToolName,
): boolean {
  return definition.appLocalTools[name] === 'live';
}
