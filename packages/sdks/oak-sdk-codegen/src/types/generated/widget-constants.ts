/**
 * GENERATED FILE - DO NOT EDIT
 * 
 * Widget URI constants generated from sdk-codegen cross-domain constants.
 * 
 * @see code-generation/typegen/cross-domain-constants.ts - Single source of truth
 */

/**
 * Base URI for the Oak curriculum MCP App resource.
 *
 * This app renders tool output with Oak branding, logo, and styling.
 * All UI-bearing tools reference this URI in their `_meta.ui.resourceUri` field (ADR-141).
 *
 * **Cache-Busting Strategy**: The URI carries a deterministic per-build hash
 * derived at sdk-codegen time from the build identifier (git commit SHA on
 * commit-identified deployed builds; the per-deployment ID on non-git
 * deploys; the literal `local` in local dev). A code change yields a
 * new URI — the only cache-invalidation lever the MCP Apps standard gives a
 * server (hosts MAY cache `ui://` content with no invalidation mechanism).
 * Same-code redeploys keep the same URI on the commit-SHA path; on the
 * deployment-ID fallback the URI changes with every deploy, because each
 * deployment mints a fresh ID.
 *
 * **Format**: `ui://widget/oak-curriculum-app-<hash>.html`
 * **Example**: `ui://widget/oak-curriculum-app-abc12345.html`
 *
 * @see code-generation/typegen/cross-domain-constants.ts - Source of truth
 * @see https://modelcontextprotocol.io/extensions/apps/overview (MCP Apps standard)
 */
export const WIDGET_URI = "ui://widget/oak-curriculum-app-local.html" as const;

/**
 * Tools that advertise a widget UI via `_meta.ui.resourceUri`.
 *
 * Only tools in this set have `_meta.ui` in their descriptors.
 * All other tools have no widget UI — MCP clients will not render
 * a widget for their results.
 *
 * @see code-generation/typegen/cross-domain-constants.ts - Source of truth
 */
export const WIDGET_TOOL_NAMES: ReadonlySet<string> = new Set(["get-curriculum-model","user-search"]);
