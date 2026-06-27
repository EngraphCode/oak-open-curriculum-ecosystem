/**
 * Integration tests for explain tool registration (D3).
 *
 * Behaviour under test:
 * 1. `registerExplainTool` registers the explain tool on a real `McpServer`
 *    under its name, with no `inputSchema` (zero-arg) and no `outputSchema`
 *    (ADR-058 free-form `structuredContent`).
 * 2. Via `registerHandlers`, the explain tool COEXISTS with the SDK
 *    universal/generated tools in one `tools/list` — the additive registration
 *    does not disturb the universal-tools loop.
 *
 * Registration is observed with `vi.spyOn` on the injected server (DI per
 * ADR-078), never module replacement.
 */

import { describe, it, expect, vi } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  listUniversalTools,
  generatedToolRegistry,
} from '@oaknational/curriculum-sdk/public/mcp-tools.js';
import { registerExplainTool, EXPLAIN_TOOL_NAME } from './explain-tool.js';
import { registerHandlers } from '../handlers.js';
import {
  createFakeSearchRetrieval,
  createFakeLogger,
  createFakeHttpObservability,
} from '../test-helpers/fakes.js';
import { createMockRuntimeConfig } from '../test-helpers/auth-error-test-helpers.js';

function findConfig(calls: readonly (readonly unknown[])[], toolName: string): unknown {
  const call = calls.find((c) => c[0] === toolName);
  if (!call) {
    throw new Error(`registerTool was not called for tool ${toolName}`);
  }
  return call[1];
}

describe('Explain tool registration (integration)', () => {
  it('registers the explain tool with no inputSchema and no outputSchema', () => {
    const server = new McpServer({ name: 'test-server', version: '0.0.0' });
    const spy = vi.spyOn(server, 'registerTool');

    registerExplainTool(server);

    const config = findConfig(spy.mock.calls, EXPLAIN_TOOL_NAME);
    expect(config).toHaveProperty('description');
    expect(config).not.toHaveProperty('inputSchema');
    expect(config).not.toHaveProperty('outputSchema');
  });

  it('coexists with the universal/generated tools in tools/list registration', () => {
    const server = new McpServer({ name: 'test-server', version: '0.0.0' });
    const spy = vi.spyOn(server, 'registerTool');

    registerHandlers(server, {
      runtimeConfig: createMockRuntimeConfig({ eefEnabled: true, userSearchEnabled: true }),
      logger: createFakeLogger(),
      observability: createFakeHttpObservability(),
      searchRetrieval: createFakeSearchRetrieval(),
      getWidgetHtml: () => '<!doctype html><html><body>test-widget</body></html>',
    });

    const registeredNames = spy.mock.calls.map((c) => c[0]);
    // Explain is present...
    expect(registeredNames).toContain(EXPLAIN_TOOL_NAME);
    // ...and the universal tools are still all registered alongside it.
    for (const tool of listUniversalTools(generatedToolRegistry)) {
      expect(registeredNames).toContain(tool.name);
    }
  });
});
