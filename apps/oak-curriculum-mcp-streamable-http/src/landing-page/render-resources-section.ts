/**
 * Renders the resources section for the landing page.
 *
 * Generates an HTML collapsible section listing the MCP resources the app
 * actually serves.
 */

import { ALL_MCP_RESOURCES } from '@oaknational/curriculum-sdk/public/mcp-tools.js';

import { escapeHtml } from './escape-html.js';
import { SERVED_SURFACE, isResourceLive } from '../served-surface/served-surface.js';

/**
 * Renders the resources section with the served MCP resources.
 *
 * Generates an expandable `<details>` element containing a list of the
 * SERVED resources with their URIs, titles, and descriptions. Resource
 * data is sourced from the SDK's `ALL_MCP_RESOURCES` inventory filtered
 * to the served-surface definition's live rows — the landing page
 * advertises exactly what a connected client sees, never dormant
 * inventory (ratified plan mcp-101).
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
  const servedResources = ALL_MCP_RESOURCES.filter((resource) =>
    isResourceLive(SERVED_SURFACE, resource.uri),
  );
  const resourceCount = servedResources.length;

  const resourceItems = servedResources
    .map(
      (resource) => `
      <li>
        <code>${escapeHtml(resource.uri)}</code>
        <span class="resource-title">${escapeHtml(resource.title)}</span>
        <span class="tool-desc">${escapeHtml(resource.description)}</span>
      </li>`,
    )
    .join('');

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
