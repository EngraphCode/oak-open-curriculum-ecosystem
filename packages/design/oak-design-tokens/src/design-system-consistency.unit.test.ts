import { describe, expect, it } from 'vitest';
import {
  compareDesignSystemConsistency,
  dtcgPathToCssVariable,
  extractCssComparand,
  type ConsistencyInput,
} from './design-system-consistency.js';
// dtcgPathToCssVariable and extractCssComparand are re-exported from their
// home modules through the comparison module's public surface.

/** Assert Ok and unwrap; an unexpected Err fails loud, never falls back. */
function assertOk<T, E>(result: { ok: true; value: T } | { ok: false; error: E }): T {
  expect(result.ok).toBe(true);

  if (!result.ok) {
    throw new Error(`Expected Ok, got Err: ${JSON.stringify(result.error)}`);
  }

  return result.value;
}

describe('dtcgPathToCssVariable', () => {
  it('maps the palette transform: oak.color.x drops the color segment', () => {
    expect(dtcgPathToCssVariable('oak.color.veil-ink')).toBe('--oak-veil-ink');
  });

  it('maps the font transform: font.family.x drops the family segment', () => {
    expect(dtcgPathToCssVariable('font.family.display')).toBe('--font-display');
  });

  it('maps every other path mechanically: a.b becomes --a-b', () => {
    expect(dtcgPathToCssVariable('bg.primary')).toBe('--bg-primary');
    expect(dtcgPathToCssVariable('text.subdued')).toBe('--text-subdued');
    expect(dtcgPathToCssVariable('space.x2')).toBe('--space-x2');
  });
});

describe('extractCssComparand', () => {
  it('keys the comparand on top-level :root scope only', () => {
    const comparand = assertOk(
      extractCssComparand(
        `:root { --bg-primary: #ffffff; }
         [data-page='unit'] { --bg-primary: #eeeeee; }
         @media (min-width: 40rem) { :root { --bg-primary: #dddddd; } }`,
      ),
    );

    expect(comparand.light.get('--bg-primary')).toBe('#ffffff');
    expect(comparand.light.size).toBe(1);
  });

  it('splits light-dark() values into the two theme arms', () => {
    const comparand = assertOk(
      extractCssComparand(`:root { --bg-primary: light-dark(#ffffff, #222222); }`),
    );

    expect(comparand.light.get('--bg-primary')).toBe('#ffffff');
    expect(comparand.dark.get('--bg-primary')).toBe('#222222');
  });

  it('carries a single-polarity value into both arms', () => {
    const comparand = assertOk(extractCssComparand(`:root { --oak-grey50: #808080; }`));

    expect(comparand.light.get('--oak-grey50')).toBe('#808080');
    expect(comparand.dark.get('--oak-grey50')).toBe('#808080');
  });

  it('overrides dark arms from the explicit dark-theme block', () => {
    const comparand = assertOk(
      extractCssComparand(
        `:root { --shadow-filter: none; }
         [data-theme='dark'] { --shadow-filter: brightness(0.8); }`,
      ),
    );

    expect(comparand.light.get('--shadow-filter')).toBe('none');
    expect(comparand.dark.get('--shadow-filter')).toBe('brightness(0.8)');
  });

  it('parses nested-brace hazards a brace scanner would misread', () => {
    const comparand = assertOk(
      extractCssComparand(
        `:root { --icon: url("a}b.svg"); --bg-primary: #ffffff; }
         .card { &:hover { --bg-primary: #cccccc; } }`,
      ),
    );

    expect(comparand.light.get('--icon')).toBe("url('a}b.svg')");
    expect(comparand.light.get('--bg-primary')).toBe('#ffffff');
  });
});

describe('compareDesignSystemConsistency', () => {
  const baseInput = (): ConsistencyInput => ({
    css: `:root {
        --oak-paper: light-dark(#fcfbf8, #1c1a17);
        --bg-primary: light-dark(#ffffff, #222222);
        --font-display: 'Lexend', sans-serif;
        --canvas-rows: 12;
      }`,
    palette: { oak: { color: { paper: { $type: 'color', $value: '#fcfbf8' } } } },
    primitives: {
      font: { family: { display: { $type: 'fontFamily', $value: "'Lexend', sans-serif" } } },
    },
    component: {},
    semanticLight: { bg: { primary: { $type: 'color', $value: '#ffffff' } } },
    semanticDark: {
      oak: { color: { paper: { $type: 'color', $value: '#1c1a17' } } },
      bg: { primary: { $type: 'color', $value: '#222222' } },
    },
    nonTokenAllowlist: ['--canvas-rows'],
  });

  it('passes a fully consistent surface pair and counts every comparison', () => {
    const report = assertOk(compareDesignSystemConsistency(baseInput()));

    expect(report.mismatches).toEqual([]);
    expect(report.comparedCount).toBeGreaterThanOrEqual(3);
  });

  it('reports a light-value mismatch with both values named', () => {
    const input = baseInput();
    const report = assertOk(
      compareDesignSystemConsistency({
        ...input,
        semanticLight: { bg: { primary: { $type: 'color', $value: '#fffff0' } } },
      }),
    );

    expect(report.mismatches).toEqual([
      {
        kind: 'value_mismatch',
        theme: 'light',
        path: 'bg.primary',
        variable: '--bg-primary',
        dtcgValue: '#fffff0',
        cssValue: '#ffffff',
      },
    ]);
  });

  it('reports a dark-arm mismatch against the dtcg dark overlay', () => {
    const input = baseInput();
    const report = assertOk(
      compareDesignSystemConsistency({
        ...input,
        semanticDark: {
          ...input.semanticDark,
          bg: { primary: { $type: 'color', $value: '#333333' } },
        },
      }),
    );

    expect(report.mismatches).toEqual([
      {
        kind: 'value_mismatch',
        theme: 'dark',
        path: 'bg.primary',
        variable: '--bg-primary',
        dtcgValue: '#333333',
        cssValue: '#222222',
      },
    ]);
  });

  it('reports a dtcg token with no CSS counterpart', () => {
    const input = baseInput();
    const report = assertOk(
      compareDesignSystemConsistency({
        ...input,
        semanticLight: {
          ...input.semanticLight,
          text: { primary: { $type: 'color', $value: '#102033' } },
        },
      }),
    );

    expect(report.mismatches).toEqual([
      { kind: 'missing_css_variable', path: 'text.primary', variable: '--text-primary' },
    ]);
  });

  it('reports a CSS variable with neither a dtcg counterpart nor an allowlist entry', () => {
    const input = baseInput();
    const report = assertOk(compareDesignSystemConsistency({ ...input, nonTokenAllowlist: [] }));

    expect(report.mismatches).toEqual([
      { kind: 'unaccounted_css_variable', variable: '--canvas-rows' },
    ]);
  });

  it('treats a dtcg reference and its CSS var() projection as the same value', () => {
    const input = baseInput();
    const report = assertOk(
      compareDesignSystemConsistency({
        ...input,
        css: `${input.css}\n:root { --radius-control: var(--radius-s); --radius-s: 0.5rem; }`,
        component: {
          radius: {
            control: { $type: 'dimension', $value: '{radius.s}' },
            s: { $type: 'dimension', $value: '0.5rem' },
          },
        },
      }),
    );

    expect(report.mismatches).toEqual([]);
  });

  it('treats double- and single-quoted font names as the same value', () => {
    const input = baseInput();
    const report = assertOk(
      compareDesignSystemConsistency({
        ...input,
        primitives: {
          font: { family: { display: { $type: 'fontFamily', $value: '"Lexend", sans-serif' } } },
        },
      }),
    );

    expect(report.mismatches).toEqual([]);
  });

  it('rejects the same dtcg path defined in two base trees', () => {
    const input = baseInput();
    const result = compareDesignSystemConsistency({
      ...input,
      component: { bg: { primary: { $type: 'color', $value: '#ffffff' } } },
    });

    expect(result.ok).toBe(false);

    if (result.ok) {
      throw new Error('Expected Err, got Ok');
    }

    expect(result.error.kind).toBe('variable_collision');
  });

  it('keeps punctuation differences inside quoted strings visible', () => {
    const input = baseInput();
    const report = assertOk(
      compareDesignSystemConsistency({
        ...input,
        css: `:root {
            --oak-paper: light-dark(#fcfbf8, #1c1a17);
            --bg-primary: light-dark(#ffffff, #222222);
            --font-display: 'A, B', sans-serif;
            --canvas-rows: 12;
          }`,
        primitives: {
          font: { family: { display: { $type: 'fontFamily', $value: "'A,B', sans-serif" } } },
        },
      }),
    );

    // A single-polarity drift surfaces once per theme arm: the CSS value is
    // carried into both comparand maps, and both arms disagree with the dtcg
    // expectation.
    expect(report.mismatches).toHaveLength(2);
    expect(report.mismatches.map((mismatch) => mismatch.kind)).toEqual([
      'value_mismatch',
      'value_mismatch',
    ]);
  });

  it('keeps whitespace differences after an apostrophe inside a double-quoted string visible', () => {
    const input = baseInput();
    const report = assertOk(
      compareDesignSystemConsistency({
        ...input,
        css: `:root {
            --oak-paper: light-dark(#fcfbf8, #1c1a17);
            --bg-primary: light-dark(#ffffff, #222222);
            --font-display: "A'  B", sans-serif;
            --canvas-rows: 12;
          }`,
        primitives: {
          font: { family: { display: { $type: 'fontFamily', $value: `"A' B", sans-serif` } } },
        },
      }),
    );

    // The apostrophe is literal content inside a double-quoted string, so
    // the differing interior whitespace is real drift, never normalised away.
    expect(report.mismatches.length).toBeGreaterThanOrEqual(1);
    expect(report.mismatches.every((mismatch) => mismatch.kind === 'value_mismatch')).toBe(true);
  });

  it('treats an escaped quote and its unescaped double-quoted spelling as the same value', () => {
    const input = baseInput();
    const report = assertOk(
      compareDesignSystemConsistency({
        ...input,
        css: String.raw`:root {
            --oak-paper: light-dark(#fcfbf8, #1c1a17);
            --bg-primary: light-dark(#ffffff, #222222);
            --font-display: 'Rock\'n Roll', sans-serif;
            --canvas-rows: 12;
          }`,
        primitives: {
          font: {
            family: { display: { $type: 'fontFamily', $value: `"Rock'n Roll", sans-serif` } },
          },
        },
      }),
    );

    expect(report.mismatches).toEqual([]);
  });

  it('flags a drifted dark arm on a token absent from the semantic dark overlay', () => {
    const input = baseInput();
    const report = assertOk(
      compareDesignSystemConsistency({
        ...input,
        css: `${input.css}\n:root { --oak-slate: light-dark(#445566, #000000); }`,
        palette: {
          oak: {
            color: {
              paper: { $type: 'color', $value: '#fcfbf8' },
              slate: { $type: 'color', $value: '#445566' },
            },
          },
        },
      }),
    );

    expect(report.mismatches).toEqual([
      {
        kind: 'value_mismatch',
        theme: 'dark',
        path: 'oak.color.slate',
        variable: '--oak-slate',
        dtcgValue: '#445566',
        cssValue: '#000000',
      },
    ]);
  });

  it('reports a dark-block-only CSS variable with no dtcg counterpart', () => {
    const input = baseInput();
    const report = assertOk(
      compareDesignSystemConsistency({
        ...input,
        css: `${input.css}\n[data-theme='dark'] { --debug-overlay: red; }`,
      }),
    );

    expect(report.mismatches).toEqual([
      { kind: 'unaccounted_css_variable', variable: '--debug-overlay' },
    ]);
  });

  it('rejects a hybrid leaf-with-children node as invalid', () => {
    const input = baseInput();
    const result = compareDesignSystemConsistency({
      ...input,
      semanticLight: {
        bg: { primary: { $type: 'color', $value: '#ffffff', child: { $value: '#000000' } } },
      },
    });

    expect(result.ok).toBe(false);

    if (result.ok) {
      throw new Error('Expected Err, got Ok');
    }

    expect(result.error.kind).toBe('invalid_node');
  });

  it('normalises expression spacing around parentheses, commas, and operators', () => {
    const input = baseInput();
    const report = assertOk(
      compareDesignSystemConsistency({
        ...input,
        css: `${input.css}\n:root { --gap-s: calc(var(--density) * var(--space-8)); --grid: minmax(0, 1fr); }`,
        component: {
          gap: { s: { $type: 'dimension', $value: 'calc(var(--density)*var(--space-8))' } },
          grid: { $value: 'minmax(0,1fr)' },
        },
      }),
    );

    expect(report.mismatches).toEqual([]);
  });

  it('normalises insignificant whitespace before comparing values', () => {
    const input = baseInput();
    const report = assertOk(
      compareDesignSystemConsistency({
        ...input,
        primitives: {
          font: { family: { display: { $type: 'fontFamily', $value: "'Lexend',  sans-serif" } } },
        },
      }),
    );

    expect(report.mismatches).toEqual([]);
  });
});
