/**
 * Unit tests for the canonical MCP resource catalogue.
 *
 * Locks the full set of resource URIs and the exclusion of the `ui://` widget,
 * so a resource added to (or removed from) the catalogue is a deliberate,
 * reviewed change rather than silent drift.
 */
import { describe, it, expect } from 'vitest';

import { ALL_MCP_RESOURCES } from './all-resources.js';
import { WIDGET_URI } from './widget-constants.js';

describe('ALL_MCP_RESOURCES', () => {
  const uris = ALL_MCP_RESOURCES.map((resource) => resource.uri);

  it('contains every MCP resource URI the server exposes, in listing order', () => {
    expect(uris).toStrictEqual([
      'docs://oak/getting-started.md',
      'docs://oak/tools.md',
      'docs://oak/workflows.md',
      'curriculum://model',
      'curriculum://prior-knowledge-graph',
      'curriculum://thread-progressions',
      'curriculum://misconception-graph',
      'eef://interpretation',
    ]);
  });

  it('excludes the ui:// widget, which is not a resources/read data resource', () => {
    expect(uris).not.toContain(WIDGET_URI);
  });

  it('gives every entry the fields listing surfaces render', () => {
    for (const resource of ALL_MCP_RESOURCES) {
      expect(resource.uri).toBeTruthy();
      expect(resource.title).toBeTruthy();
      expect(resource.description).toBeTruthy();
    }
  });
});
