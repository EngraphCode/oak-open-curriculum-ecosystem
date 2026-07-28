/**
 * Orientation guidance surfaces for the MCP server.
 *
 * Server instructions and context hints are generated from the
 * AGENT_SUPPORT_TOOL_METADATA to ensure they always include all agent
 * support tools and their relationships. Tool DESCRIPTIONS carry no
 * call-another-tool-first imperatives (MCP-300): directory policy bars
 * descriptions from instructing the model about other tools. The
 * orientation channels are the `instructions` field (delivered once at
 * initialise) and the `oakContextHint` in response `structuredContent`
 * (per-call reinforcement) — both generated here, neither a description.
 */

import {
  generateServerInstructions,
  generateContextHint,
  AGENT_SUPPORT_TOOL_NAMES,
} from './agent-support-tool-metadata.js';

/**
 * The name of the primary orientation tool that provides complete domain understanding.
 *
 * Used by the aggregated tool descriptions that cross-reference it (routing
 * documentation such as "use 'get-curriculum-model'"), and by the generated
 * orientation channels, so every surface names the same tool.
 */
export const PRIMARY_ORIENTATION_TOOL_NAME = 'get-curriculum-model' as const;

/**
 * Context hint included in structuredContent for model guidance.
 *
 * GENERATED from AGENT_SUPPORT_TOOL_METADATA to ensure it always includes
 * all agent support tools.
 *
 * The model sees structuredContent (unlike _meta), so this hint guides
 * the model to call agent support tools for domain understanding.
 *
 * @remarks
 * All tools using formatToolResponse automatically include
 * this hint, providing consistent context grounding across all tools.
 */
export const OAK_CONTEXT_HINT = generateContextHint();

/**
 * Server instructions sent in the MCP initialize response.
 *
 * GENERATED from AGENT_SUPPORT_TOOL_METADATA to ensure it always includes
 * all agent support tools, their relationships, and complementary nature.
 *
 * This text is sent to the CLIENT once, in the initialize response;
 * whether and how the host surfaces it to the model is client-dependent
 * (the residual risk this channel carries — see the MCP-300 PR record).
 *
 * @remarks
 * Unlike tool descriptions (which may be truncated in large tool lists),
 * server instructions ride a single stable field that hosts CAN surface
 * whole. Use this for high-priority guidance about agent support tools.
 */
export const SERVER_INSTRUCTIONS = generateServerInstructions();

// Re-export for convenience
export { AGENT_SUPPORT_TOOL_NAMES };
