import { describe, expect, it } from 'vitest';
import { validateColourLiterals } from './colour-literals.js';
import type { DtcgTokenTree } from './index.js';

describe('validateColourLiterals', () => {
  it('accepts hex literals, rgb-alpha literals, and references, reporting counts and alpha paths', () => {
    const tree: DtcgTokenTree = {
      color: {
        ink: { $type: 'color', $value: '#102033' },
        paper: { $type: 'color', $value: '#F7F3EB' },
        'shadow-veil': { $type: 'color', $value: 'rgb(92 92 92 / 0.2)' },
        'veil-black': { $type: 'color', $value: 'rgb(0 0 0 / 0.65)' },
        'veil-full': { $type: 'color', $value: 'rgb(0 0 0 / 1.0)' },
      },
      semantic: {
        'text-primary': { $type: 'color', $value: '{color.ink}' },
      },
      spacing: {
        // Non-colour leaves are outside this validator's scope.
        'stack-gap': { $type: 'dimension', $value: 'calc(2 * 0.25rem)' },
      },
    };

    expect(validateColourLiterals(tree)).toEqual({
      ok: true,
      value: {
        checkedCount: 6,
        alphaLiteralPaths: ['color.shadow-veil', 'color.veil-black', 'color.veil-full'],
      },
    });
  });

  it('rejects expression and malformed colour values, listing offenders sorted by path', () => {
    const tree: DtcgTokenTree = {
      color: {
        blended: { $type: 'color', $value: 'color-mix(in oklch, #102033 80%, white)' },
        short: { $type: 'color', $value: '#123' },
        loud: { $type: 'color', $value: 'rgb(999 0 0 / 0.5)' },
        overlit: { $type: 'color', $value: 'rgb(0 0 0 / 1.5)' },
        indirect: { $type: 'color', $value: 'var(--oak-color-ink)' },
      },
      semantic: {
        computed: { $type: 'color', $value: 'calc(1 + 1)' },
      },
    };

    expect(validateColourLiterals(tree)).toEqual({
      ok: false,
      error: {
        kind: 'non_literal_colour_values',
        offenders: [
          { path: 'color.blended', value: 'color-mix(in oklch, #102033 80%, white)' },
          { path: 'color.indirect', value: 'var(--oak-color-ink)' },
          { path: 'color.loud', value: 'rgb(999 0 0 / 0.5)' },
          { path: 'color.overlit', value: 'rgb(0 0 0 / 1.5)' },
          { path: 'color.short', value: '#123' },
          { path: 'semantic.computed', value: 'calc(1 + 1)' },
        ],
      },
    });
  });

  it('fails fast on a malformed node instead of silently skipping it', () => {
    expect(validateColourLiterals({ color: { ink: 'not-a-token-object' } })).toEqual({
      ok: false,
      error: { kind: 'invalid_node', path: 'color.ink' },
    });
  });

  it('rejects a colour token whose $value is a non-string primitive as an offender', () => {
    expect(
      validateColourLiterals({
        color: {
          bad: { $type: 'color', $value: 42 },
          good: { $type: 'color', $value: '#ff0000' },
        },
      }),
    ).toEqual({
      ok: false,
      error: {
        kind: 'non_literal_colour_values',
        offenders: [{ path: 'color.bad', value: '42' }],
      },
    });
  });

  it('fails fast on a hybrid node carrying both $value and non-$ children', () => {
    expect(
      validateColourLiterals({
        color: {
          hybrid: {
            $type: 'color',
            $value: '#ffffff',
            nested: { $type: 'color', $value: '#000000' },
          },
        },
      }),
    ).toEqual({
      ok: false,
      error: { kind: 'invalid_node', path: 'color.hybrid' },
    });
  });

  it('fails fast on an array node — arrays are not DTCG groups', () => {
    // Arrays are inexpressible in DtcgTokenTree; they arrive only through
    // unvalidated JSON, so the fixture enters through the same boundary.
    const parseJsonTree: (json: string) => DtcgTokenTree = JSON.parse;

    expect(validateColourLiterals(parseJsonTree('{"color":{"list":["#ffffff"]}}'))).toEqual({
      ok: false,
      error: { kind: 'invalid_node', path: 'color.list' },
    });
  });

  it('fails fast on a colour token whose $value is not a token primitive', () => {
    // e.g. a studio-export malformation nesting per-theme values inside $value.
    expect(
      validateColourLiterals({
        color: {
          bad: { $type: 'color', $value: { light: '#ffffff', dark: '#000000' } },
          good: { $type: 'color', $value: '#ff0000' },
        },
      }),
    ).toEqual({
      ok: false,
      error: { kind: 'invalid_node', path: 'color.bad' },
    });
  });
});
