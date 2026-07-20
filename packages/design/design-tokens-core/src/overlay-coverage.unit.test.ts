import { describe, expect, it } from 'vitest';
import type { DtcgTokenTree } from './index.js';
import { validateThemeOverlayCoverage } from './overlay-coverage.js';

const baseTree: DtcgTokenTree = {
  bg: {
    page: { $type: 'color', $value: '#f7f3eb' },
    selected: { $type: 'color', $value: '#e6f0fa' },
  },
  text: {
    primary: { $type: 'color', $value: '#102033' },
    muted: { $type: 'color', $value: '#4a5568' },
  },
  motion: {
    'duration-fast': { $type: 'duration', $value: '150ms' },
  },
};

describe('validateThemeOverlayCoverage', () => {
  it('accepts sparse overlays whose every key exists in the base, reporting coverage counts', () => {
    const result = validateThemeOverlayCoverage(baseTree, {
      dark: {
        bg: { page: { $type: 'color', $value: '#102033' } },
        text: { primary: { $type: 'color', $value: '#f7f3eb' } },
      },
      'high-contrast': {
        text: { primary: { $type: 'color', $value: '#000000' } },
      },
      'colour-safe': {
        bg: { selected: { $type: 'color', $value: '#dcdcdc' } },
      },
    });

    expect(result).toEqual({
      ok: true,
      value: {
        baseKeyCount: 5,
        overlayKeyCounts: { 'colour-safe': 1, dark: 2, 'high-contrast': 1 },
      },
    });
  });

  it('rejects overlay keys absent from the base, naming every orphaned theme and its paths sorted', () => {
    // Theme declaration order and tree order both differ from the asserted
    // sorted order, so a non-sorting or first-theme-only implementation fails.
    const result = validateThemeOverlayCoverage(baseTree, {
      'high-contrast': {
        surface: { card: { $type: 'color', $value: '#000000' } },
      },
      dark: {
        zz: { orphan: { $type: 'color', $value: '#1a2a3d' } },
        bg: { paeg: { $type: 'color', $value: '#102033' } },
      },
      'colour-safe': {
        text: { primary: { $type: 'color', $value: '#000000' } },
      },
    });

    expect(result).toEqual({
      ok: false,
      error: {
        kind: 'orphan_overrides',
        orphans: [
          { theme: 'dark', paths: ['bg.paeg', 'zz.orphan'] },
          { theme: 'high-contrast', paths: ['surface.card'] },
        ],
      },
    });
  });

  it('rejects an overlay using the reserved base identifier', () => {
    const result = validateThemeOverlayCoverage(baseTree, {
      base: { text: { primary: { $type: 'color', $value: '#000000' } } },
    });

    expect(result).toEqual({
      ok: false,
      error: { kind: 'reserved_theme_identifier', theme: 'base' },
    });
  });

  it('fails fast on a malformed overlay node instead of silently skipping it', () => {
    const result = validateThemeOverlayCoverage(baseTree, {
      dark: {
        bg: { page: 'not-a-token-object' },
      },
    });

    expect(result).toEqual({
      ok: false,
      error: { kind: 'invalid_theme_node', theme: 'dark', path: 'bg.page' },
    });
  });

  it('fails fast on a malformed base node, reporting the base as the theme', () => {
    const result = validateThemeOverlayCoverage({ bg: { page: 'not-a-token-object' } }, {});

    expect(result).toEqual({
      ok: false,
      error: { kind: 'invalid_theme_node', theme: 'base', path: 'bg.page' },
    });
  });

  it('treats $-prefixed metadata keys as structure, not tokens', () => {
    const result = validateThemeOverlayCoverage(
      {
        $description: 'Base tree',
        text: { primary: { $type: 'color', $value: '#102033', $description: 'Body' } },
      },
      {
        dark: {
          $description: 'Dark overlay',
          text: { primary: { $type: 'color', $value: '#f7f3eb' } },
        },
      },
    );

    expect(result).toEqual({
      ok: true,
      value: { baseKeyCount: 1, overlayKeyCounts: { dark: 1 } },
    });
  });

  it('accepts an empty overlay set trivially', () => {
    expect(validateThemeOverlayCoverage(baseTree, {})).toEqual({
      ok: true,
      value: { baseKeyCount: 5, overlayKeyCounts: {} },
    });
  });

  it('keeps a JSON-derived __proto__ theme as an own coverage entry', () => {
    // Plain-object assignment would silently drop this theme onto the prototype.
    const parseOverlays: (json: string) => Readonly<Record<string, DtcgTokenTree>> = JSON.parse;
    const result = validateThemeOverlayCoverage(
      baseTree,
      parseOverlays(
        '{"__proto__": {"text": {"primary": {"$type": "color", "$value": "#000000"}}}}',
      ),
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error(`Expected Ok, got Err: ${JSON.stringify(result.error)}`);
    }

    const counts = result.value.overlayKeyCounts;

    expect(Object.hasOwn(counts, '__proto__')).toBe(true);
    expect(Object.getOwnPropertyDescriptor(counts, '__proto__')?.value).toBe(1);
  });
});
