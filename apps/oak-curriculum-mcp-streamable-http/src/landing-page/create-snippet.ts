/**
 * MCP client configuration snippet generator.
 *
 * Provides a pure function for generating the JSON configuration snippet
 * that users can add to their MCP client configuration.
 *
 * @example
 * ```typescript
 * import { createSnippet } from './create-snippet.js';
 *
 * const snippet = createSnippet('https://my-app.vercel.app/mcp');
 * // Returns JSON snippet with that endpoint URL
 * ```
 */

/**
 * Creates the MCP client configuration snippet.
 *
 * Generates a JSON snippet that can be added to MCP client configurations
 * (e.g., Claude, Cursor) to connect to this MCP server. The endpoint URL is
 * derived once on the build side (`derive-view-props.ts`) and passed in —
 * this module performs no environment derivation of its own.
 *
 * @param mcpEndpointUrl - The already-derived MCP endpoint URL
 * @returns JSON configuration snippet string (without outer braces)
 *
 * @example
 * ```typescript
 * const snippet = createSnippet('https://my-app.vercel.app/mcp');
 * // Returns:
 * // '
 * //   "mcpServers": {
 * //     "oak-open-curriculum": {
 * //       "type": "http",
 * //       "url": "https://my-app.vercel.app/mcp"
 * //     }
 * //   }
 * // '
 * ```
 */
export function createSnippet(mcpEndpointUrl: string): string {
  return `
  "mcpServers": {
    "oak-open-curriculum": {
      "type": "http",
      "url": "${mcpEndpointUrl}"
    }
  }
`;
}
