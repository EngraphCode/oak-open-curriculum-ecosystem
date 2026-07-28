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

import { describe, it, expect } from 'vitest';
import {
  listUniversalTools,
  generatedToolRegistry,
} from '@oaknational/curriculum-sdk/public/mcp-tools.js';
import { SERVED_SURFACE, type ServedSurfaceDefinition } from './served-surface.js';
import { walkCanonicalRegistration } from '../test-helpers/registration-walk.js';

describe('served-surface registration (integration)', () => {
  it('registers exactly the live set — dormant tools are structurally absent', () => {
    const walk = walkCanonicalRegistration();
    const registered = new Set(walk.toolConfigs.keys());

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
    const walk = walkCanonicalRegistration();

    expect(walk.toolConfigs.size).toBeGreaterThan(0);
    for (const [name, config] of walk.toolConfigs) {
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
      resources: SERVED_SURFACE.resources,
    };
    const walk = walkCanonicalRegistration(withUserSearchLive);
    const registered = new Set(walk.toolConfigs.keys());

    expect(registered.has('user-search')).toBe(true);
    expect(registered.has('user-search-query')).toBe(true);
    // Recomputed from the injected definition: everything enumerated
    // registers except rows the definition still holds dormant (the gated
    // EEF tool, under the canonical definition this variant inherits).
    const stillDormant = Object.values(withUserSearchLive.universalTools).filter(
      (state) => state === 'dormant',
    ).length;
    const universalCount = listUniversalTools(generatedToolRegistry).length;
    expect(registered.size).toBe(universalCount + 1 - stillDormant);
  });
});
