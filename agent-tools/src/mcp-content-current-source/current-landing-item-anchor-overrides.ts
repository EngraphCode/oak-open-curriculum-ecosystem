const LANDING_ROOT = 'apps/oak-curriculum-mcp-streamable-http/src/landing-page';
const LANDING_RESOURCES = `${LANDING_ROOT}/render-resources-section.ts`;
const LANDING_TOOLS = `${LANDING_ROOT}/render-tools-section.ts`;

/** Reviewed anchors whose current source is the MCP app landing page. */
export const CURRENT_LANDING_ITEM_ANCHOR_OVERRIDES = {
  C342: {
    [`${LANDING_ROOT}/render-landing-page.ts`]: ['alt="Oak National Academy logo"'],
  },
  C357: {
    [LANDING_RESOURCES]: ['Resources (${String(resourceCount)})'],
    [LANDING_TOOLS]: ['Tools (${String(toolCount)})'],
  },
  C370: {
    [LANDING_RESOURCES]: ['<span class="expand-hint">Click to expand</span>'],
    [LANDING_TOOLS]: ['<span class="expand-hint">Click to expand</span>'],
  },
} as const;
