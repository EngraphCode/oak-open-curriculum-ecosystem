/**
 * Integration tests: the served-surface definition governs registration.
 *
 * Proves the ratified plan's acceptance criteria on the tool surface:
 * - the registered set is exactly the definition's live set (AC2's tool
 *   half / AC4's one-definition rule), and
 * - every served tool carries a title and a read-only annotation hint
 *   (AC3), walked at registration time.
 *
 * Dormant tools are structurally absent from registration — no runtime
 * flag can resurface them; tests inject a variant definition to exercise
 * dormant rows (the sanctioned test seam; production always uses the
 * canonical module-level constant).
 */

import { describe, it, expect, vi } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  listUniversalTools,
  generatedToolRegistry,
} from '@oaknational/curriculum-sdk/public/mcp-tools.js';
import { registerHandlers } from '../handlers.js';
import { SERVED_SURFACE, type ServedSurfaceDefinition } from './served-surface.js';
import {
  createFakeSearchRetrieval,
  createFakeLogger,
  createFakeHttpObservability,
} from '../test-helpers/fakes.js';
import { createMockRuntimeConfig } from '../test-helpers/auth-error-test-helpers.js';

function registerAndCapture(servedSurface?: ServedSurfaceDefinition) {
  const server = new McpServer({ name: 'test-server', version: '0.0.0' });
  const registerToolSpy = vi.spyOn(server, 'registerTool');

  registerHandlers(server, {
    runtimeConfig: createMockRuntimeConfig({ eefEnabled: true }),
    logger: createFakeLogger(),
    observability: createFakeHttpObservability(),
    searchRetrieval: createFakeSearchRetrieval(),
    getWidgetHtml: () => '<!doctype html><html><body>test-widget</body></html>',
    ...(servedSurface ? { servedSurface } : {}),
  });

  return { registerToolSpy };
}

function registeredToolNames(calls: readonly (readonly unknown[])[]): Set<string> {
  return new Set(calls.map((c) => c[0]).filter((name): name is string => typeof name === 'string'));
}

describe('served-surface registration (integration)', () => {
  it('registers exactly the live set — dormant tools are structurally absent', () => {
    const { registerToolSpy } = registerAndCapture();
    const registered = registeredToolNames(registerToolSpy.mock.calls);

    const expectedLive = new Set<string>([
      ...Object.entries(SERVED_SURFACE.universalTools)
        .filter(([, state]) => state === 'live')
        .map(([name]) => name),
      ...Object.entries(SERVED_SURFACE.appLocalTools)
        .filter(([, state]) => state === 'live')
        .map(([name]) => name),
    ]);

    expect(registered).toEqual(expectedLive);
    expect(registered.has('user-search')).toBe(false);
    expect(registered.has('user-search-query')).toBe(false);
  });

  it('walks every registered tool and finds a title and a read-only hint', () => {
    const { registerToolSpy } = registerAndCapture();

    expect(registerToolSpy.mock.calls.length).toBeGreaterThan(0);
    for (const call of registerToolSpy.mock.calls) {
      const name = String(call[0]);
      const config: unknown = call[1];
      expect(config, `tool ${name} is missing a title`).toHaveProperty(
        'title',
        expect.stringMatching(/\S/),
      );
      expect(config, `tool ${name} is missing annotations.readOnlyHint: true`).toMatchObject({
        annotations: { readOnlyHint: true },
      });
    }
  });

  it('a test-injected definition with user-search live registers the pair (the e2e activation seam)', () => {
    const withUserSearchLive: ServedSurfaceDefinition = {
      universalTools: {
        ...SERVED_SURFACE.universalTools,
        'user-search': 'live',
        'user-search-query': 'live',
      },
      appLocalTools: SERVED_SURFACE.appLocalTools,
    };
    const { registerToolSpy } = registerAndCapture(withUserSearchLive);
    const registered = registeredToolNames(registerToolSpy.mock.calls);

    expect(registered.has('user-search')).toBe(true);
    expect(registered.has('user-search-query')).toBe(true);
    const universalCount = listUniversalTools(generatedToolRegistry).length;
    expect(registered.size).toBe(universalCount + 1);
  });
});
