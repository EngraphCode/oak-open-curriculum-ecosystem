import { describe, expect, it } from 'vitest';
import { composeThemeTree } from './compose-theme-tree.js';
import type { DtcgTokenTree } from './index.js';

describe('composeThemeTree', () => {
  it('overrides base leaves with overlay leaves and keeps base-only keys', () => {
    const base: DtcgTokenTree = {
      bg: {
        page: { $type: 'color', $value: '#f7f3eb' },
        selected: { $type: 'color', $value: '#e6f0fa' },
      },
      motion: {
        'duration-fast': { $type: 'duration', $value: '150ms' },
      },
    };
    const overlay: DtcgTokenTree = {
      bg: {
        page: { $type: 'color', $value: '#102033' },
      },
    };

    expect(composeThemeTree(base, overlay)).toEqual({
      bg: {
        page: { $type: 'color', $value: '#102033' },
        selected: { $type: 'color', $value: '#e6f0fa' },
      },
      motion: {
        'duration-fast': { $type: 'duration', $value: '150ms' },
      },
    });
  });

  it('merges nested groups recursively', () => {
    const base: DtcgTokenTree = {
      btn: {
        primary: {
          bg: { $type: 'color', $value: '#1a6b4a' },
          label: { $type: 'color', $value: '#ffffff' },
        },
      },
    };
    const overlay: DtcgTokenTree = {
      btn: {
        primary: {
          bg: { $type: 'color', $value: '#7fd0ab' },
        },
      },
    };

    expect(composeThemeTree(base, overlay)).toEqual({
      btn: {
        primary: {
          bg: { $type: 'color', $value: '#7fd0ab' },
          label: { $type: 'color', $value: '#ffffff' },
        },
      },
    });
  });

  it('replaces a base leaf wholesale when the overlay redefines it as a leaf', () => {
    // The overlay leaf REPLACES the base leaf — no member-wise merging of
    // token metadata, so a stale base $description cannot survive an override.
    const base: DtcgTokenTree = {
      text: {
        primary: { $type: 'color', $value: '#102033', $description: 'Light body text' },
      },
    };
    const overlay: DtcgTokenTree = {
      text: {
        primary: { $type: 'color', $value: '#f7f3eb' },
      },
    };

    expect(composeThemeTree(base, overlay)).toEqual({
      text: {
        primary: { $type: 'color', $value: '#f7f3eb' },
      },
    });
  });

  it('lets an overlay group replace a base leaf at the same path', () => {
    const base: DtcgTokenTree = {
      state: { hover: { $type: 'color', $value: '#eeeeee' } },
    };
    const overlay: DtcgTokenTree = {
      state: { hover: { subtle: { $type: 'color', $value: '#dddddd' } } },
    };

    expect(composeThemeTree(base, overlay)).toEqual({
      state: { hover: { subtle: { $type: 'color', $value: '#dddddd' } } },
    });
  });

  it('carries group $-metadata from the overlay where present, else from the base', () => {
    const base: DtcgTokenTree = {
      $description: 'Base tree',
      bg: { page: { $type: 'color', $value: '#f7f3eb' } },
    };
    const overlay: DtcgTokenTree = {
      $description: 'Dark overlay',
      bg: { page: { $type: 'color', $value: '#102033' } },
    };

    expect(composeThemeTree(base, overlay)).toEqual({
      $description: 'Dark overlay',
      bg: { page: { $type: 'color', $value: '#102033' } },
    });
  });

  it('keeps the base group $-metadata when the overlay declares none', () => {
    // The "else from the base" half of the metadata contract: a sparse
    // overlay that only overrides values must not strip the base's
    // group description.
    const base: DtcgTokenTree = {
      $description: 'Base tree',
      bg: { page: { $type: 'color', $value: '#f7f3eb' } },
    };
    const overlay: DtcgTokenTree = {
      bg: { page: { $type: 'color', $value: '#102033' } },
    };

    expect(composeThemeTree(base, overlay)).toEqual({
      $description: 'Base tree',
      bg: { page: { $type: 'color', $value: '#102033' } },
    });
  });

  it('applies the metadata contract to nested groups', () => {
    const base: DtcgTokenTree = {
      btn: {
        $description: 'Button tokens',
        bg: { $type: 'color', $value: '#1a6b4a' },
      },
      state: {
        $description: 'State tokens',
        hover: { $type: 'color', $value: '#eeeeee' },
      },
    };
    const overlay: DtcgTokenTree = {
      btn: {
        $description: 'Dark button tokens',
        bg: { $type: 'color', $value: '#7fd0ab' },
      },
      state: {
        hover: { $type: 'color', $value: '#333333' },
      },
    };

    expect(composeThemeTree(base, overlay)).toEqual({
      btn: {
        $description: 'Dark button tokens',
        bg: { $type: 'color', $value: '#7fd0ab' },
      },
      state: {
        $description: 'State tokens',
        hover: { $type: 'color', $value: '#333333' },
      },
    });
  });

  it('keeps a JSON-derived __proto__ group as an own entry', () => {
    // Plain-object assignment would silently drop this key onto the prototype.
    const parseTree: (json: string) => DtcgTokenTree = JSON.parse;
    const composed = composeThemeTree(
      parseTree('{"__proto__": {"x": {"$type": "color", "$value": "#000000"}}}'),
      {},
    );

    expect(Object.hasOwn(composed, '__proto__')).toBe(true);
  });

  it('returns a structurally independent tree — composing never mutates its inputs', () => {
    const base: DtcgTokenTree = {
      bg: { page: { $type: 'color', $value: '#f7f3eb' } },
    };
    const overlay: DtcgTokenTree = {
      bg: { selected: { $type: 'color', $value: '#dcdcdc' } },
    };

    const composed = composeThemeTree(base, overlay);

    expect(composed).toEqual({
      bg: {
        page: { $type: 'color', $value: '#f7f3eb' },
        selected: { $type: 'color', $value: '#dcdcdc' },
      },
    });
    expect(base).toEqual({ bg: { page: { $type: 'color', $value: '#f7f3eb' } } });
    expect(overlay).toEqual({ bg: { selected: { $type: 'color', $value: '#dcdcdc' } } });
  });
});
