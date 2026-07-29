/**
 * Integration tests for the oak-under-the-hood tool registration (baked-content
 * shape).
 *
 * Behaviour under test:
 * 1. `registerOakUnderTheHoodTool` registers the oak-under-the-hood tool on a real `McpServer`
 *    under its name, declaring an explicit empty CLOSED `inputSchema` (zero-arg,
 *    empty Zod raw shape) and no `outputSchema` (ADR-058 free-form
 *    `structuredContent`), with `openWorldHint: false` (the result is served
 *    entirely from the deployed artefact — MCP-353).
 * 2. The handler routes through the outbound result-size metric: one
 *    `MCP tool result size` log per call, tagged with the tool name.
 * 3. Via `registerHandlers`, the oak-under-the-hood tool COEXISTS with the SDK
 *    universal/generated tools in one `tools/list` — the additive registration
 *    does not disturb the universal-tools loop.
 *
 * Registration is observed with `vi.spyOn` on the injected server (DI per
 * ADR-078), never module replacement. The wire-level closed-schema form
 * (`additionalProperties: false`) is asserted end-to-end in the e2e test.
 */

import { describe, it, expect, vi } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  listUniversalTools,
  generatedToolRegistry,
} from '@oaknational/curriculum-sdk/public/mcp-tools.js';
import {
  createOakUnderTheHoodToolHandler,
  registerOakUnderTheHoodTool,
  OAK_UNDER_THE_HOOD_TOOL_NAME,
} from './oak-under-the-hood-tool.js';
import { registerHandlers } from '../handlers.js';
import {
  createFakeSearchRetrieval,
  createFakeLogger,
  createFakeHttpObservability,
} from '../test-helpers/fakes.js';
import { createMockRuntimeConfig } from '../test-helpers/auth-error-test-helpers.js';
import { SERVED_SURFACE, isUniversalToolLive } from '../served-surface/served-surface.js';

describe('Oak: Under the Hood tool registration (integration)', () => {
  it('registers the oak-under-the-hood tool with a closed empty inputSchema, no outputSchema, openWorldHint false', () => {
    const server = new McpServer({ name: 'test-server', version: '0.0.0' });
    const spy = vi.spyOn(server, 'registerTool');

    registerOakUnderTheHoodTool(server, {
      logger: createFakeLogger(),
      observability: createFakeHttpObservability(),
    });

    const call = spy.mock.calls.find((c) => c[0] === OAK_UNDER_THE_HOOD_TOOL_NAME);
    expect(call).toBeDefined();
    const config = call?.[1];
    expect(config).toHaveProperty('description');
    // Declares a closed empty inputSchema (z.object({}).strict()), not omitted; the
    // wire-level closed form (additionalProperties:false) is asserted in the e2e test.
    expect(config).toHaveProperty('inputSchema');
    // No outputSchema: the result body is free-form markdown.
    expect(config).not.toHaveProperty('outputSchema');
    // Served entirely from the deployed artefact; read-only.
    expect(config).toMatchObject({ annotations: { openWorldHint: false, readOnlyHint: true } });
  });

  it('routes the handler through the outbound result-size metric, tagged with the tool name', () => {
    const logger = createFakeLogger();
    const observability = createFakeHttpObservability();
    const setTagSpy = vi.spyOn(observability, 'setTag');

    const result = createOakUnderTheHoodToolHandler({ logger, observability })();

    expect(result.isError).not.toBe(true);
    const infoCalls = vi.mocked(logger.info).mock.calls;
    const sizeLog = infoCalls.find(([message]) => message === 'MCP tool result size');
    expect(sizeLog).toBeDefined();
    expect(sizeLog?.[1]).toMatchObject({ toolName: OAK_UNDER_THE_HOOD_TOOL_NAME });
    expect(setTagSpy).toHaveBeenCalledWith('mcp.tool_name', OAK_UNDER_THE_HOOD_TOOL_NAME);
  });

  it('coexists with the universal/generated tools in tools/list registration', () => {
    const server = new McpServer({ name: 'test-server', version: '0.0.0' });
    const spy = vi.spyOn(server, 'registerTool');

    registerHandlers(server, {
      runtimeConfig: createMockRuntimeConfig(),
      logger: createFakeLogger(),
      observability: createFakeHttpObservability(),
      searchRetrieval: createFakeSearchRetrieval(),
      resourceUrl: 'https://probe.test/mcp',
      getWidgetHtml: () => '<!doctype html><html><body>test-widget</body></html>',
    });

    const registeredNames = spy.mock.calls.map((c) => c[0]);
    // The oak-under-the-hood tool is present...
    expect(registeredNames).toContain(OAK_UNDER_THE_HOOD_TOOL_NAME);
    // ...and every LIVE universal tool is still registered alongside it
    // (dormant rows are structurally absent — asserted exactly in the
    // served-surface integration suite).
    for (const tool of listUniversalTools(generatedToolRegistry)) {
      if (isUniversalToolLive(SERVED_SURFACE, tool.name)) {
        expect(registeredNames).toContain(tool.name);
      }
    }
  });
});
