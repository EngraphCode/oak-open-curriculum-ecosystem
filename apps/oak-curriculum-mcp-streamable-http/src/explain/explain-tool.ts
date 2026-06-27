/**
 * The Oak effort-orientation tool (WS-B D3).
 *
 * A model-controlled tool that fires on effort/ecosystem-orientation triggers
 * — "tell me about this project", "how does Oak build and deliver its
 * curriculum", "how do I engage or contribute" — and serves the curated
 * effort-orientation body so a connected assistant runs Oak's orientation
 * process instead of improvising.
 *
 * Effort-domain ONLY (owner separation principle). Two construction-held
 * firewalls, never tests (see the plan's test-doctrine correction):
 *
 * 1. The `tools/list` description is the separation lever: it scopes the tool
 *    to the effort domain and excludes curriculum in user-domain terms, so a
 *    curriculum query routes to the curriculum tools, not here.
 * 2. The result carries NO curriculum context hint. The SDK's canonical
 *    `formatToolResponse` (the dual-shape formatter the curriculum tools use)
 *    is SDK-internal (not on the publishable `public/mcp-tools.js` barrel the
 *    app may import, per ADR-041) AND hard-couples `OAK_CONTEXT_HINT`, which
 *    steers the model toward `get-curriculum-model` and the curriculum tools.
 *    Building the ADR-058 dual shape locally — rather than reusing that
 *    formatter (the plan's original letter) — makes the curriculum firewall
 *    STRUCTURAL: the explain tool never imports the curriculum-coupled
 *    machinery, so the nudge cannot leak into its result.
 *
 * Registered via a SEPARATE, additive `server.registerTool` call (outside the
 * SDK universal-tools loop): explain is app-local, not in the generated
 * registry. No `inputSchema` (zero-arg, so the handler is the `extra`-only
 * callback form) and no `outputSchema` (free-form `structuredContent`;
 * declaring an `outputSchema` would make `tools/call` run strict validation and
 * fail) — the ADR-058 dual shape, mirroring the agent-support tools.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult, TextContent } from '@modelcontextprotocol/sdk/types.js';
import { EXPLAIN_ORIENTATION_BODY } from '../generated/explain-content.js';

/**
 * Tool name. Collision-free against the universal tool registry, and aligned
 * with the `docs://oak/explain.md` resource and the explain orientation lens.
 */
export const EXPLAIN_TOOL_NAME = 'explain';

/**
 * `tools/list` description — the separation lever. Trigger-optimised for
 * effort/ecosystem orientation and explicitly scoped away from curriculum in
 * user-domain terms (never internal tool identifiers, per mcp-expert), so a
 * curriculum query routes to the curriculum tools rather than here.
 */
export const EXPLAIN_TOOL_DESCRIPTION =
  'Use when a user asks to understand the Oak project, effort, or ecosystem — this repository, ' +
  "how Oak builds and delivers its curriculum, the project's purpose and machinery, or how to " +
  'engage or contribute. Not for curriculum content questions (subjects, units, lessons, key ' +
  'stages, sequencing) — those are served by the curriculum tools.';

const EXPLAIN_TOOL_SUMMARY =
  "Oak effort orientation: how Oak builds and delivers its curriculum, the project's purpose and " +
  'machinery, and how to engage. Follow the orientation below.';

/**
 * Builds the explain tool result: the ADR-058 dual shape — a 2-item `content`
 * array (human-readable summary, then the JSON body for backwards-compatible
 * readers) plus `structuredContent` — carrying the committed effort-orientation
 * body. No `oakContextHint` (separation firewall, held structurally; see the
 * file header). No `_meta`: explain is not an MCP App widget, so it carries no
 * widget-routing data (`_meta` is the widget-only channel).
 */
export function buildExplainToolResult(): CallToolResult {
  const summary: TextContent = { type: 'text', text: EXPLAIN_TOOL_SUMMARY };
  const jsonBody: TextContent = {
    type: 'text',
    text: JSON.stringify({ orientation: EXPLAIN_ORIENTATION_BODY }),
  };
  return {
    content: [summary, jsonBody],
    structuredContent: { orientation: EXPLAIN_ORIENTATION_BODY, summary: EXPLAIN_TOOL_SUMMARY },
  };
}

/**
 * Registers the explain effort-orientation tool with the MCP server.
 *
 * A separate, additive registration — not part of the universal-tools loop.
 * Zero-arg: `inputSchema` is omitted, so the handler is the `extra`-only
 * callback form; no `outputSchema` is declared.
 *
 * @param server - the MCP server (narrowed to the `registerTool` capability)
 */
export function registerExplainTool(server: Pick<McpServer, 'registerTool'>): void {
  server.registerTool(
    EXPLAIN_TOOL_NAME,
    {
      title: 'Explain the Oak effort',
      description: EXPLAIN_TOOL_DESCRIPTION,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    () => buildExplainToolResult(),
  );
}
