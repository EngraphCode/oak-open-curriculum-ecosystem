import { describe, expect, it } from 'vitest';
import { parseContrastManifest } from './contrast-manifest-parse.js';

describe('parseContrastManifest', () => {
  // Mirrors the real manifest's facts: text/non-text contexts, triads empty.
  const realShapedManifest = {
    pairs: [
      { foreground: 'text.primary', background: 'bg.page', context: 'text' },
      { foreground: 'border.focus', background: 'bg.page', context: 'non-text' },
    ],
    triads: [],
  };

  it('accepts a real-shaped manifest without casting', () => {
    expect(parseContrastManifest(realShapedManifest)).toEqual({
      ok: true,
      value: realShapedManifest,
    });
  });

  it('accepts the full context union and a well-formed triad', () => {
    const manifest = {
      pairs: [
        { foreground: 'a', background: 'b', context: 'text' },
        { foreground: 'a', background: 'b', context: 'non-text' },
        { foreground: 'a', background: 'b', context: 'large-text' },
        { foreground: 'a', background: 'b', context: 'informational' },
      ],
      triads: [
        {
          foreground: 'text.on-button',
          middle: 'bg.button',
          background: 'bg.page',
          contexts: { fgMid: 'text', midBg: 'non-text', fgBg: 'informational' },
        },
      ],
    };

    expect(parseContrastManifest(manifest)).toEqual({ ok: true, value: manifest });
  });

  it.each([
    ['a string', 'not a manifest'],
    ['null', null],
    ['an array', [42]],
  ])('rejects %s at the root', (_label, input) => {
    expect(parseContrastManifest(input)).toEqual({
      ok: false,
      error: { kind: 'manifest_shape', path: '', message: 'expected an object' },
    });
  });

  it('rejects a non-object pair element with the indexed path', () => {
    expect(parseContrastManifest({ pairs: ['not a pair'], triads: [] })).toEqual({
      ok: false,
      error: { kind: 'manifest_shape', path: 'pairs[0]', message: 'expected an object' },
    });
  });

  it('reports only the first violation when several exist', () => {
    expect(
      parseContrastManifest({
        pairs: [
          { foreground: 'a', background: 'b', context: 'decorative' },
          { background: 'b', context: 'text' },
        ],
        triads: [],
      }),
    ).toEqual({
      ok: false,
      error: {
        kind: 'manifest_shape',
        path: 'pairs[0].context',
        message: 'expected one of text | non-text | large-text | informational',
      },
    });
  });

  it('rejects a missing pairs array', () => {
    expect(parseContrastManifest({ triads: [] })).toEqual({
      ok: false,
      error: { kind: 'manifest_shape', path: 'pairs', message: 'expected an array' },
    });
  });

  it('rejects unknown top-level keys', () => {
    expect(parseContrastManifest({ ...realShapedManifest, extra: true })).toEqual({
      ok: false,
      error: { kind: 'manifest_shape', path: 'extra', message: 'unexpected key' },
    });
  });

  it('rejects unknown keys inside a pair', () => {
    expect(
      parseContrastManifest({
        pairs: [{ foreground: 'a', background: 'b', context: 'text', weight: 'bold' }],
        triads: [],
      }),
    ).toEqual({
      ok: false,
      error: { kind: 'manifest_shape', path: 'pairs[0].weight', message: 'unexpected key' },
    });
  });

  it('rejects a pair with an invalid context, naming the offending path', () => {
    expect(
      parseContrastManifest({
        pairs: [
          { foreground: 'a', background: 'b', context: 'text' },
          { foreground: 'a', background: 'b', context: 'decorative' },
        ],
        triads: [],
      }),
    ).toEqual({
      ok: false,
      error: {
        kind: 'manifest_shape',
        path: 'pairs[1].context',
        message: 'expected one of text | non-text | large-text | informational',
      },
    });
  });

  it('rejects a triad missing its middle token path', () => {
    expect(
      parseContrastManifest({
        pairs: [],
        triads: [
          {
            foreground: 'text.on-button',
            background: 'bg.page',
            contexts: { fgMid: 'text', midBg: 'non-text', fgBg: 'informational' },
          },
        ],
      }),
    ).toEqual({
      ok: false,
      error: { kind: 'manifest_shape', path: 'triads[0].middle', message: 'expected a string' },
    });
  });

  it('rejects a triad whose fgMid context is informational', () => {
    expect(
      parseContrastManifest({
        pairs: [],
        triads: [
          {
            foreground: 'text.on-button',
            middle: 'bg.button',
            background: 'bg.page',
            contexts: { fgMid: 'informational', midBg: 'non-text', fgBg: 'text' },
          },
        ],
      }),
    ).toEqual({
      ok: false,
      error: {
        kind: 'manifest_shape',
        path: 'triads[0].contexts.fgMid',
        message: 'expected one of text | non-text | large-text',
      },
    });
  });

  it('rejects a triad whose midBg context is not non-text', () => {
    expect(
      parseContrastManifest({
        pairs: [],
        triads: [
          {
            foreground: 'text.on-button',
            middle: 'bg.button',
            background: 'bg.page',
            contexts: { fgMid: 'text', midBg: 'text', fgBg: 'informational' },
          },
        ],
      }),
    ).toEqual({
      ok: false,
      error: {
        kind: 'manifest_shape',
        path: 'triads[0].contexts.midBg',
        message: 'expected non-text',
      },
    });
  });
});
