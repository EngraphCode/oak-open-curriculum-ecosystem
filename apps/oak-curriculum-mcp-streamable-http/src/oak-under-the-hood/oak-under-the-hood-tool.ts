/**
 * The Oak: Under the Hood orientation tool (baked-content shape).
 *
 * A model-controlled tool that fires on repo / effort orientation triggers —
 * "tell me about this project", "how does Oak build and deliver its curriculum",
 * "how do I engage or contribute" — and serves the orientation METHOD inline:
 * the audience-independent digest of the canonical under-the-hood skill,
 * generated out of band into `../generated/oak-under-the-hood-content.js`
 * (committed; the app build never runs the generator)
 * and drift-gated by `validate-under-the-hood-content` (MCP-353).
 *
 * Why baked, not pointed: the Anthropic Software Directory policy (§2.F,
 * https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy)
 * forbids instructional software directing the assistant to dynamically pull
 * behavioural instructions from external sources for execution. The previous
 * pointer shape ("fetch the canonical at this URL and follow it") was exactly
 * that; the served artefact now carries its own reviewed instructions,
 * versioned with the deployment. The public Oak URLs remain as INFORMATIONAL
 * CITATIONS (owner ruling 2026-07-29): the assistant may read Oak's public
 * pages and this repository's public documents to answer the user's own
 * orientation questions; nothing directs it to fetch instructions to execute.
 *
 * Effort-domain ONLY (owner separation principle). Two construction-held
 * firewalls, never tests:
 *
 * 1. The `tools/list` description is the separation lever: it scopes the tool to
 *    the effort domain and excludes curriculum in user-domain terms, so a
 *    curriculum query routes to the curriculum tools, not here.
 * 2. The result carries NO curriculum context hint. This file never imports the
 *    SDK's curriculum-coupled `formatToolResponse` / `OAK_CONTEXT_HINT` (ADR-041),
 *    so the curriculum nudge cannot leak into the result — the firewall is
 *    STRUCTURAL.
 *
 * Registered via a SEPARATE, additive `server.registerTool` call (outside the
 * SDK universal-tools loop): the oak-under-the-hood tool is app-local, not in the
 * generated registry. It declares an explicit empty CLOSED `inputSchema` (zero-arg;
 * accepts only the empty object, per MCP 2025-11-25) and NO `outputSchema` — the
 * result body is free-form markdown, with no object contract worth declaring. The
 * dual shape is ADR-058 (content + structuredContent): the orientation body rides
 * BOTH channels because major clients each deliver only one of them. Result size
 * is measured through the same outbound token-health metric as the universal
 * tools (`MCP tool result size`), so MCP-305's evidence lens covers this — the
 * app's largest single result — rather than being blind to it.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult, TextContent } from '@modelcontextprotocol/sdk/types.js';
import type { Logger } from '@oaknational/logger';

import { OAK_UNDER_THE_HOOD_ORIENTATION } from '../generated/oak-under-the-hood-content.js';
import type { HttpObservability } from '../observability/http-observability.js';
import { measureCallToolResult } from '../observability/tool-result-measurement.js';

/**
 * Tool name — the wire identifier for the Oak: Under the Hood orientation tool.
 * One concept, one name: it matches the `/oak-under-the-hood` skill command and
 * the `Skill(oak-under-the-hood)` allowlist entry.
 */
export const OAK_UNDER_THE_HOOD_TOOL_NAME = 'oak-under-the-hood';

/**
 * Display title, referenced by BOTH the top-level `title` and
 * `annotations.title` registration fields — one constant so the two wire
 * locations cannot diverge (no compile-time guard reaches this app-local
 * tool; the shared constant makes divergence unrepresentable).
 */
const OAK_UNDER_THE_HOOD_TOOL_TITLE = 'Oak: Under the Hood';

/** Oak's official positioning and pillars — public-site framing context. */
const OAK_WHO_WE_ARE_URL = 'https://www.thenational.academy/about-us/who-we-are';

/** Oak's official strategy, annual plan, and impact evaluations — public-site, on-interest depth. */
const OAK_STRATEGY_DOCS_URL = 'https://www.thenational.academy/about-us/meet-the-team#documents';

/** The public repository the orientation content describes. */
const OAK_REPOSITORY_URL = 'https://github.com/oaknational/oak-open-curriculum-ecosystem';

/**
 * `tools/list` description — the separation lever. Trigger-optimised for
 * effort/ecosystem orientation and explicitly scoped away from curriculum in
 * user-domain terms (never internal tool identifiers, per mcp-expert), so a
 * curriculum query routes to the curriculum tools rather than here. Internal: the
 * tests assert the advertised description over the wire, never import this constant
 * (an identity pin on it would be content-pinning by the back door).
 */
const OAK_UNDER_THE_HOOD_TOOL_DESCRIPTION =
  'Use when a user asks to understand the Oak project, effort, or ecosystem — this repository, ' +
  "how Oak builds and delivers its curriculum, the project's purpose and machinery, or how to " +
  'engage or contribute. Not for curriculum content questions (subjects, units, lessons, key ' +
  'stages, sequencing) — those are served by the curriculum tools.';

const OAK_UNDER_THE_HOOD_TOOL_SUMMARY =
  'Oak: Under the Hood — the orientation method for this repository (the Oak Open Curriculum ' +
  'Ecosystem), served in full below. Follow it to orient the user. Document paths cited below ' +
  `are relative to the public repository at ${OAK_REPOSITORY_URL}; Oak-organisation framing ` +
  "cites Oak's official positioning and strategy pages.";

/**
 * Builds the Oak: Under the Hood tool result: the ADR-058 dual shape — a
 * `content` array (one-line summary, then the orientation digest as markdown)
 * plus `structuredContent` carrying the same body and the informational
 * citations. The body appears on BOTH channels because major clients each
 * deliver only one. The curriculum separation firewall is held structurally:
 * this file builds its result locally and takes no dependency on the
 * curriculum SDK's response helpers (ADR-041).
 */
export function buildOakUnderTheHoodToolResult(): CallToolResult {
  const summary: TextContent = { type: 'text', text: OAK_UNDER_THE_HOOD_TOOL_SUMMARY };
  const orientation: TextContent = { type: 'text', text: OAK_UNDER_THE_HOOD_ORIENTATION };
  return {
    content: [summary, orientation],
    structuredContent: {
      summary: OAK_UNDER_THE_HOOD_TOOL_SUMMARY,
      orientation: OAK_UNDER_THE_HOOD_ORIENTATION,
      repositoryUrl: OAK_REPOSITORY_URL,
      oakSources: [OAK_WHO_WE_ARE_URL, OAK_STRATEGY_DOCS_URL],
    },
  };
}

/** Observability seams the registration wires the handler through. */
export interface OakUnderTheHoodToolOptions {
  readonly logger: Logger;
  readonly observability: HttpObservability;
}

/**
 * Creates the tool handler: builds the result and routes it through the same
 * outbound token-health metric as the universal tools (`MCP tool result size`),
 * tagged with the tool name. Exported as a seam so the measurement wiring is
 * directly testable (ADR-078 DI), not only reachable through protocol plumbing.
 */
export function createOakUnderTheHoodToolHandler(
  options: OakUnderTheHoodToolOptions,
): () => CallToolResult {
  return () => {
    options.observability.setTag('mcp.tool_name', OAK_UNDER_THE_HOOD_TOOL_NAME);
    const result = buildOakUnderTheHoodToolResult();
    options.logger.info('MCP tool result size', {
      toolName: OAK_UNDER_THE_HOOD_TOOL_NAME,
      ...measureCallToolResult(result),
    });
    return result;
  };
}

/**
 * Registers the Oak: Under the Hood orientation tool with the MCP server.
 *
 * A separate, additive registration — not part of the universal-tools loop. It
 * declares an explicit empty CLOSED `inputSchema` (`z.object({}).strict()`, which
 * the SDK serialises to `{type:'object', additionalProperties:false}` — a strict
 * raw shape `{}` alone does NOT emit `additionalProperties:false`) and no
 * `outputSchema`. `openWorldHint: false` — the result is served entirely from
 * the deployed artefact; the URLs it carries are citations, not fetch targets.
 *
 * @param server - the MCP server (narrowed to the `registerTool` capability)
 * @param options - logger + observability for the outbound result-size metric
 */
export function registerOakUnderTheHoodTool(
  server: Pick<McpServer, 'registerTool'>,
  options: OakUnderTheHoodToolOptions,
): void {
  server.registerTool(
    OAK_UNDER_THE_HOOD_TOOL_NAME,
    {
      title: OAK_UNDER_THE_HOOD_TOOL_TITLE,
      description: OAK_UNDER_THE_HOOD_TOOL_DESCRIPTION,
      inputSchema: z.object({}).strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
        title: OAK_UNDER_THE_HOOD_TOOL_TITLE,
      },
    },
    createOakUnderTheHoodToolHandler(options),
  );
}
