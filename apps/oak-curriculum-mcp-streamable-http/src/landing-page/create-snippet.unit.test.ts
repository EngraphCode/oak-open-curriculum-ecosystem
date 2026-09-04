/**
 * Unit tests for MCP configuration snippet generation.
 *
 * Tests verify that the JSON configuration snippet embeds the endpoint URL
 * it is handed (derivation happens on the build side, not here) and stays
 * parseable JSON when wrapped in braces.
 */

import { describe, expect, it } from 'vitest';

import { createSnippet } from './create-snippet.js';

describe('createSnippet', () => {
  it('embeds the endpoint URL it is handed', () => {
    const snippet = createSnippet('https://my-app.vercel.app/mcp');

    expect(snippet).toContain('"mcpServers"');
    expect(snippet).toContain('"oak-open-curriculum"');
    expect(snippet).toContain('"type": "http"');
    expect(snippet).toContain('"url": "https://my-app.vercel.app/mcp"');
  });

  it('performs no derivation of its own', () => {
    const snippet = createSnippet('http://localhost:3333/mcp');

    expect(snippet).toContain('"url": "http://localhost:3333/mcp"');
  });

  it('generates valid JSON structure', () => {
    const snippet = createSnippet('https://example.com/mcp');
    const jsonWrapped = `{${snippet}}`;
    const doParse = () => {
      const result: unknown = JSON.parse(jsonWrapped);
      return result;
    };
    expect(doParse).not.toThrow();
  });
});
