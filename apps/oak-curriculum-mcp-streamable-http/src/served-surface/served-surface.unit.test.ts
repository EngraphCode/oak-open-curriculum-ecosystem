/**
 * Unit tests for the declarative served-surface definition.
 *
 * The definition is the single point of control for what the app serves
 * (ratified plan mcp-101-visible-surface-allowlist): one module-level
 * constant, evaluated once at process start — never a runtime flag.
 */

import { describe, it, expect } from 'vitest';
import {
  listUniversalTools,
  generatedToolRegistry,
  ALL_MCP_RESOURCES,
  AGENT_GUIDANCE_RESOURCES,
  NAVIGATION_GUIDANCE_URIS,
  CREATION_GUIDANCE_URIS,
  WIDGET_URI,
} from '@oaknational/curriculum-sdk/public/mcp-tools.js';
import { SERVED_SURFACE, isUniversalToolLive, isResourceLive } from './served-surface.js';
import { OAK_UNDER_THE_HOOD_RESOURCE_URI } from '../register-resources.js';

describe('SERVED_SURFACE', () => {
  it('classifies every universal tool in the generated registry (recomputed totality)', () => {
    const registryNames = listUniversalTools(generatedToolRegistry).map((t) => t.name);
    const classifiedNames = Object.keys(SERVED_SURFACE.universalTools);
    expect(new Set(classifiedNames)).toEqual(new Set(registryNames));
  });

  it('marks exactly the unbuilt user-search MCP App pair dormant', () => {
    const dormant = Object.entries(SERVED_SURFACE.universalTools)
      .filter(([, state]) => state === 'dormant')
      .map(([name]) => name);
    expect(new Set(dormant)).toEqual(new Set(['user-search', 'user-search-query']));
  });

  it('serves the app-local orientation tool live', () => {
    expect(SERVED_SURFACE.appLocalTools['oak-under-the-hood']).toBe('live');
  });

  it('answers liveness through the definition, not through any environment read', () => {
    expect(isUniversalToolLive(SERVED_SURFACE, 'search')).toBe(true);
    expect(isUniversalToolLive(SERVED_SURFACE, 'user-search')).toBe(false);
  });
});

describe('SERVED_SURFACE.resources', () => {
  it('classifies the full resource inventory (recomputed totality: catalogue + widget)', () => {
    const inventory = new Set<string>([
      ...ALL_MCP_RESOURCES.map((r) => r.uri),
      ...AGENT_GUIDANCE_RESOURCES.map((r) => r.uri),
      OAK_UNDER_THE_HOOD_RESOURCE_URI,
      WIDGET_URI,
    ]);
    expect(new Set(Object.keys(SERVED_SURFACE.resources))).toEqual(inventory);
  });

  it('marks exactly the creation-oriented four guidance documents dormant (ratified live-set, D11)', () => {
    const dormant = Object.entries(SERVED_SURFACE.resources)
      .filter(([, state]) => state === 'dormant')
      .map(([uri]) => uri);
    expect(new Set(dormant)).toEqual(new Set(CREATION_GUIDANCE_URIS));
  });

  it('serves the navigation three guidance documents live', () => {
    for (const uri of NAVIGATION_GUIDANCE_URIS) {
      expect(isResourceLive(SERVED_SURFACE, uri), uri).toBe(true);
    }
  });

  it('serves the EEF interpretation resource live through the definition — no env flag', () => {
    expect(isResourceLive(SERVED_SURFACE, 'eef://interpretation')).toBe(true);
  });
});
