/**
 * Reviewed anchors for aggregated-tool, app, and widget items whose baseline
 * fragments were intentionally modified on latest main: MCP-300 rewrote the
 * aggregated descriptions and added `annotations.title` to every tool, and
 * the widget/app surfaces evolved alongside. Anchor strings are verbatim
 * from the current sources.
 */

const SDK_MCP = 'packages/sdks/oak-curriculum-sdk/src/mcp';
const SEARCH_DEF = `${SDK_MCP}/aggregated-search/tool-definition.ts`;
const EXPLORE_DEF = `${SDK_MCP}/aggregated-explore/tool-definition.ts`;
const USER_SEARCH_DEF = `${SDK_MCP}/aggregated-user-search/tool-definition.ts`;
const BROWSE_DEF = `${SDK_MCP}/aggregated-browse/tool-definition.ts`;
const FETCH_EXECUTION = `${SDK_MCP}/aggregated-fetch/execution.ts`;
const ASSET_DOWNLOAD_DEF = `${SDK_MCP}/aggregated-asset-download/definition.ts`;
const CURRICULUM_MODEL_DEF = `${SDK_MCP}/aggregated-curriculum-model/definition.ts`;
const KEYWORD_GRAPH = `${SDK_MCP}/aggregated-keyword-graph.ts`;
const PRIOR_KNOWLEDGE_GRAPH = `${SDK_MCP}/aggregated-prior-knowledge-graph.ts`;
const APP_ROOT = 'apps/oak-curriculum-mcp-streamable-http';
const UNDER_THE_HOOD = `${APP_ROOT}/src/oak-under-the-hood/oak-under-the-hood-tool.ts`;
const AUTH_ROUTES = `${APP_ROOT}/src/auth-routes.ts`;
const WIDGET_APP = `${APP_ROOT}/widget/src/App.tsx`;
const BRAND_BANNER = `${APP_ROOT}/widget/src/BrandBanner.tsx`;
const ORIENTATION_GUIDANCE = 'packages/sdks/oak-curriculum-sdk/src/mcp/orientation-guidance.ts';
const TOOL_DESCRIPTION_PARTS =
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/mcp-tools/parts/tool-description.ts';

export const CURRENT_AGGREGATED_ITEM_ANCHOR_OVERRIDES = {
  C001: {
    [ORIENTATION_GUIDANCE]: [
      "export const PRIMARY_ORIENTATION_TOOL_NAME = 'get-curriculum-model' as const;",
    ],
  },
  C005: {
    [ORIENTATION_GUIDANCE]: ['export const OAK_CONTEXT_HINT = generateContextHint();'],
  },
  C006: {
    [ORIENTATION_GUIDANCE]: ['export const SERVER_INSTRUCTIONS = generateServerInstructions();'],
  },
  C066: {
    [SEARCH_DEF]: ["description: `Search Oak's curriculum using semantic search across all four"],
  },
  C067: {
    [SEARCH_DEF]: ["title: 'Search Curriculum',"],
  },
  C101: {
    [EXPLORE_DEF]: ['description: `Explore a topic across the entire Oak curriculum in one call.'],
  },
  C102: {
    [EXPLORE_DEF]: ["title: 'Explore Topic',"],
  },
  C120: {
    [USER_SEARCH_DEF]: ["title: 'User Search',"],
  },
  C138: {
    [BROWSE_DEF]: ["description: `Browse what's available in Oak's curriculum without searching."],
  },
  C139: {
    [BROWSE_DEF]: ["title: 'Browse Curriculum',"],
  },
  C152: {
    [FETCH_EXECUTION]: ['description: `Fetch curriculum resource by canonical identifier.'],
  },
  C153: {
    [FETCH_EXECUTION]: ["title: 'Fetch Curriculum Resource',"],
  },
  C162: {
    [ASSET_DOWNLOAD_DEF]: [
      'description: `Generate a short-lived, secure download link for a lesson asset.',
    ],
  },
  C166: {
    [ASSET_DOWNLOAD_DEF]: ["title: 'Download Asset',"],
  },
  C173: {
    [CURRICULUM_MODEL_DEF]: [
      "description: `Returns a complete orientation to Oak National Academy's",
    ],
  },
  C174: {
    [CURRICULUM_MODEL_DEF]: ["title: 'Oak Curriculum Overview',"],
  },
  C177: {
    [ASSET_DOWNLOAD_DEF]: [
      "securitySchemes: [{ type: 'oauth2', scopes: [...SCOPES_SUPPORTED] }] as const,",
    ],
  },
  C223: {
    [KEYWORD_GRAPH]: [
      '.describe(\'Anchor subject slug (corpus key), e.g. "maths". Required, with keyStage.\')',
    ],
  },
  C224: {
    [KEYWORD_GRAPH]: [
      '.describe(\'Anchor key-stage slug (corpus key), e.g. "ks2". Required, with subject.\')',
    ],
  },
  C231: {
    [KEYWORD_GRAPH]: ['title: KEYWORD_GRAPH_TOOL_TITLE,'],
  },
  C248: {
    [PRIOR_KNOWLEDGE_GRAPH]: [
      'Anchor unit slugs (corpus keys, e.g. from search/fetch results). The result is the bounded',
    ],
  },
  C372: {
    [UNDER_THE_HOOD]: ["title: 'Oak: Under the Hood — orientation method',"],
  },
  C374: {
    [UNDER_THE_HOOD]: ['openWorldHint: true,\n        title: OAK_UNDER_THE_HOOD_TOOL_TITLE,'],
  },
  C385: {
    [WIDGET_APP]: ['<h1 className="visually-hidden">Oak National Academy Curriculum</h1>'],
  },
  C391: {
    [BRAND_BANNER]: ['<span>Oak National Academy</span>'],
  },
  C392: {
    [BRAND_BANNER]: ['<span className="visually-hidden"> (opens in a new tab)</span>'],
  },
  C393: {
    [BRAND_BANNER]: [
      '<svg\n      aria-hidden="true"\n      viewBox="0 0 32 42"\n      width="20"\n      height="26"\n      className="oak-brand-banner__logo"\n    >',
    ],
  },
  C463: {
    [TOOL_DESCRIPTION_PARTS]: [
      'export const TOOL_DESCRIPTION_ADDITIONS: ReadonlyMap<string, string> = new Map([',
    ],
  },
  C705: {
    [AUTH_ROUTES]: ['const servePrm: RequestHandler = (req, res) => {'],
  },
  C717: {
    [WIDGET_APP]: [
      'This service is experimental. It uses Oak National Academy content, but AI can make',
    ],
  },
  C707: {
    [AUTH_ROUTES]: ["app.get('/.well-known/oauth-protected-resource', metadataRateLimiter,"],
  },
} as const;

export const CURRENT_AGGREGATED_ITEM_REVISION_OVERRIDES = {
  C066: 'modified',
  C067: 'modified',
  C101: 'modified',
  C102: 'modified',
  C120: 'modified',
  C138: 'modified',
  C139: 'modified',
  C152: 'modified',
  C153: 'modified',
  C162: 'modified',
  C166: 'modified',
  C173: 'modified',
  C174: 'modified',
  C177: 'modified',
  C223: 'modified',
  C224: 'modified',
  C231: 'modified',
  C248: 'modified',
  C372: 'modified',
  C374: 'modified',
  C385: 'modified',
  C391: 'modified',
  C392: 'modified',
  C393: 'modified',
  C463: 'modified',
  C705: 'modified',
  C707: 'modified',
  C717: 'added',
} as const;
