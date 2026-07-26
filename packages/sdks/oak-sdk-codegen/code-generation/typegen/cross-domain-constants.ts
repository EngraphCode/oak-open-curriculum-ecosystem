import { resolveWidgetUriSuffix } from './widget-uri-suffix.js';

/**
 * Base widget URI with a deterministic per-build cache-busting suffix.
 *
 * Generated at sdk-codegen time so every consumer — the tool definitions
 * advertising `_meta.ui.resourceUri` and the app's served-surface
 * registration — derives from this one constant.
 *
 * This module-level binding is the one sanctioned `process.env`
 * composition point for the widget URI; the resolver itself lives
 * environment-free in `widget-uri-suffix.ts` so its unit suite's import
 * graph carries no ambient-state read.
 *
 * URI identity is the only cache-invalidation lever the MCP Apps standard
 * gives a server: hosts MAY prefetch and cache `ui://` resource content,
 * and the standard defines no invalidation, freshness, or versioning
 * mechanism — so a changed URI is what forces hosts to reload the widget
 * bundle instead of serving a stale cached copy.
 *
 * Format: ui://widget/oak-curriculum-app-<suffix>.html
 * Example: ui://widget/oak-curriculum-app-abc12345.html
 *
 * @see https://modelcontextprotocol.io/extensions/apps/overview (MCP Apps standard)
 */
export const BASE_WIDGET_URI = `ui://widget/oak-curriculum-app-${resolveWidgetUriSuffix({
  vercel: process.env.VERCEL,
  gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA,
  deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
})}.html`;

/**
 * Tools that should advertise a widget UI via `_meta.ui.resourceUri`.
 *
 * Only allowlisted **names** emit `_meta.ui.resourceUri` in codegen and in
 * aggregated tool definitions. Other tools must not include `resourceUri`
 * in `_meta.ui` (even if they use `_meta.ui.visibility` for app-only helpers).
 *
 * Tools in this set get `_meta.ui.resourceUri` in their codegen output
 * and in aggregated definitions.
 *
 * @see https://modelcontextprotocol.io/extensions/apps/overview (MCP Apps standard)
 */
export const WIDGET_TOOL_NAMES: ReadonlySet<string> = new Set([
  'get-curriculum-model',
  'user-search',
]);
