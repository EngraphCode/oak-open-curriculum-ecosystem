/**
 * Renders the resources section for the landing page.
 *
 * Generates an HTML collapsible section listing all available MCP resources
 * from the Oak Curriculum SDK.
 */

import { ALL_MCP_RESOURCES } from '@oaknational/curriculum-sdk/public/mcp-tools.js';

import { escapeHtml } from './escape-html.js';

/**
 * Renders the resources section with all available MCP resources.
 *
 * Generates an expandable `<details>` element containing a list of all
 * MCP resources with their URIs, titles, and descriptions. Resource data is
 * sourced from the canonical `ALL_MCP_RESOURCES` catalogue in the Oak
 * Curriculum SDK, so the page stays in sync with what is actually registered.
 *
 * @returns HTML string for the resources section
 *
 * @example
 * ```typescript
 * const resourcesHtml = renderResourcesSection();
 * // Returns: '<details class="card expandable">...'
 * ```
 */
export function renderResourcesSection(): string {
  const resourceCount = ALL_MCP_RESOURCES.length;

  const resourceItems = ALL_MCP_RESOURCES.map(
    (resource) => `
      <li>
        <code>${escapeHtml(resource.uri)}</code>
        <span class="resource-title">${escapeHtml(resource.title)}</span>
        <span class="tool-desc">${escapeHtml(resource.description)}</span>
      </li>`,
  ).join('');

  return `
    <details class="card expandable">
      <summary>
        <h2>Resources (${String(resourceCount)})</h2>
        <span class="expand-hint">Click to expand</span>
      </summary>
      <p>Resources available via MCP resources/read:</p>
      <ul class="tool-list">${resourceItems}
      </ul>
    </details>`;
}
