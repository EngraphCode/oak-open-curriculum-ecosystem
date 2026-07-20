import { describe, expect, it } from 'vitest';
import { resolveColourTokens, toHexComparand, type ColourResolution } from './contrast-resolve.js';
import type { DtcgTokenTree } from './dtcg-types.js';

const EMPTY_RESOLUTION: ColourResolution = { resolved: new Map(), unresolvable: [] };

/** Assert Ok and unwrap; the fallback is unreachable once the expect has failed. */
function resolvedOk(tree: DtcgTokenTree): ColourResolution {
  const resolution = resolveColourTokens(tree);

  expect(resolution.ok).toBe(true);

  return resolution.ok ? resolution.value : EMPTY_RESOLUTION;
}

describe('resolveColourTokens', () => {
  it('resolves palette tokens directly to their hex values', () => {
    const tree: DtcgTokenTree = {
      color: {
        ink: { $type: 'color', $value: '#102033' },
      },
    };

    expect(resolvedOk(tree).resolved.get('color.ink')).toBe('#102033');
  });

  it('resolves semantic tokens through palette references', () => {
    const tree: DtcgTokenTree = {
      color: {
        'paper-050': { $type: 'color', $value: '#fcfbf8' },
      },
      semantic: {
        'surface-page': { $type: 'color', $value: '{color.paper-050}' },
      },
    };

    expect(resolvedOk(tree).resolved.get('semantic.surface-page')).toBe('#fcfbf8');
  });

  it('resolves component tokens through semantic and palette', () => {
    const tree: DtcgTokenTree = {
      color: {
        'ink-950': { $type: 'color', $value: '#102033' },
      },
      semantic: {
        'text-primary': { $type: 'color', $value: '{color.ink-950}' },
      },
      component: {
        'shell-title-color': { $type: 'color', $value: '{semantic.text-primary}' },
      },
    };

    expect(resolvedOk(tree).resolved.get('component.shell-title-color')).toBe('#102033');
  });

  it('ignores non-colour tokens', () => {
    const tree: DtcgTokenTree = {
      font: {
        'size-300': { $type: 'dimension', $value: '1rem' },
      },
      color: {
        ink: { $type: 'color', $value: '#102033' },
      },
    };

    const resolution = resolvedOk(tree);

    expect(resolution.resolved.has('font.size-300')).toBe(false);
    expect(resolution.resolved.has('color.ink')).toBe(true);
    expect(resolution.unresolvable).toEqual([]);
  });

  it('resolves a reference declared before its target in document order', () => {
    // The bare dialect carries forward references by design (the real
    // light tree's `bg.selected` → `{color.accent-subtle}` with the `bg`
    // root preceding the `color` root). Document order must be immaterial.
    const tree: DtcgTokenTree = {
      bg: {
        selected: { $type: 'color', $value: '{color.accent-subtle}' },
      },
      color: {
        'accent-subtle': { $type: 'color', $value: '#e6f0fa' },
      },
    };

    expect(resolvedOk(tree).resolved.get('bg.selected')).toBe('#e6f0fa');
  });

  it('resolves reference chains regardless of declaration order', () => {
    const tree: DtcgTokenTree = {
      c: { top: { $type: 'color', $value: '{b.mid}' } },
      b: { mid: { $type: 'color', $value: '{a.base}' } },
      a: { base: { $type: 'color', $value: '#102033' } },
    };

    expect(resolvedOk(tree).resolved.get('c.top')).toBe('#102033');
    expect(resolvedOk(tree).resolved.get('b.mid')).toBe('#102033');
  });

  it('surfaces a dangling reference as unresolvable, never silently dropped', () => {
    const tree: DtcgTokenTree = {
      semantic: {
        broken: { $type: 'color', $value: '{color.missing}' },
      },
    };

    const resolution = resolvedOk(tree);

    expect(resolution.resolved.has('semantic.broken')).toBe(false);
    expect(resolution.unresolvable).toEqual([
      { path: 'semantic.broken', reference: 'color.missing' },
    ]);
  });

  it('surfaces every member of a reference cycle as unresolvable, sorted by path', () => {
    const tree: DtcgTokenTree = {
      b: { second: { $type: 'color', $value: '{a.first}' } },
      a: { first: { $type: 'color', $value: '{b.second}' } },
    };

    expect(resolvedOk(tree).unresolvable).toEqual([
      { path: 'a.first', reference: 'b.second' },
      { path: 'b.second', reference: 'a.first' },
    ]);
  });

  it('carries non-hex colour literals verbatim', () => {
    // Alpha literals and expression values stay in the resolution result;
    // `toHexComparand` owns their exclusion from the WCAG comparand.
    const tree: DtcgTokenTree = {
      oak: {
        color: {
          'veil-ink': { $type: 'color', $value: 'rgb(16 32 51 / 0.5)' },
        },
      },
      state: {
        hover: { $value: 'color-mix(in oklab, currentColor 8%, transparent)' },
      },
    };

    const resolution = resolvedOk(tree);

    expect(resolution.resolved.get('oak.color.veil-ink')).toBe('rgb(16 32 51 / 0.5)');
    expect(resolution.resolved.get('state.hover')).toBe(
      'color-mix(in oklab, currentColor 8%, transparent)',
    );
  });

  it('resolves a reference to an alpha literal to the raw rgb string', () => {
    // The real `scrim` token references the palette's `veil-ink` alpha
    // literal; the copy must reach the resolution result so the comparand
    // filter excludes both paths by one rule.
    const tree: DtcgTokenTree = {
      oak: {
        color: {
          'veil-ink': { $type: 'color', $value: 'rgb(16 32 51 / 0.5)' },
        },
      },
      scrim: { $type: 'color', $value: '{oak.color.veil-ink}' },
    };

    expect(resolvedOk(tree).resolved.get('scrim')).toBe('rgb(16 32 51 / 0.5)');
  });

  it('classifies untyped leaves by value shape', () => {
    // The export's $type is heuristic: untyped hex-shaped leaves are
    // colours; untyped non-colour strings are not.
    const tree: DtcgTokenTree = {
      accent: { $value: '#7fd0ab' },
      motion: { fast: { $value: '150ms' } },
    };

    const resolution = resolvedOk(tree);

    expect(resolution.resolved.get('accent')).toBe('#7fd0ab');
    expect(resolution.resolved.has('motion.fast')).toBe(false);
  });

  it('carries a non-string colour $value through as its string form', () => {
    // A typed colour with a non-string value can never join the hex
    // comparand; carrying `String(value)` keeps the defect visible to the
    // comparand filter and the count backstop instead of vanishing.
    const tree: DtcgTokenTree = {
      color: {
        odd: { $type: 'color', $value: 42 },
      },
    };

    expect(resolvedOk(tree).resolved.get('color.odd')).toBe('42');
  });

  it('returns the walker error for a malformed tree', () => {
    const parseTree: (json: string) => DtcgTokenTree = JSON.parse;
    const resolution = resolveColourTokens(
      parseTree('{"color": {"bad": {"$type": "color", "$value": {"nested": true}}}}'),
    );

    expect(resolution.ok).toBe(false);

    if (!resolution.ok) {
      expect(resolution.error).toEqual({ kind: 'invalid_node', path: 'color.bad' });
    }
  });
});

describe('toHexComparand', () => {
  it('keeps six-digit hex entries in either case', () => {
    const comparand = toHexComparand(
      new Map([
        ['text.primary', '#102033'],
        ['bg.primary', '#FCFBF8'],
      ]),
    );

    expect(comparand.get('text.primary')).toBe('#102033');
    expect(comparand.get('bg.primary')).toBe('#FCFBF8');
  });

  it('drops every non-hex entry with one closed rule', () => {
    const comparand = toHexComparand(
      new Map([
        ['scrim', 'rgb(16 32 51 / 0.5)'],
        ['state.hover', 'color-mix(in oklab, currentColor 8%, transparent)'],
        ['shorthand', '#fff'],
        ['text.primary', '#102033'],
      ]),
    );

    expect([...comparand.keys()]).toEqual(['text.primary']);
  });
});
