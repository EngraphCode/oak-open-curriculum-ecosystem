import { describe, expect, it } from 'vitest';
import {
  compareDesignSystemConsistency,
  dtcgPathToCssVariable,
  extractCssComparand,
  type ConsistencyInput,
} from './design-system-consistency.js';
import {
  normaliseDtcgReferences,
  normaliseValue,
  splitTopLevelComma,
} from './consistency-values.js';
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

describe('normaliseDtcgReferences', () => {
  it('rewrites a canonical-grammar reference to its var() projection', () => {
    expect(normaliseDtcgReferences('{radius.s}')).toBe('var(--radius-s)');
  });

  it('leaves a brace chunk outside the canonical reference grammar verbatim', () => {
    // The reference grammar is owned by design-tokens-core (dot-separated
    // kebab segments); anything else is not a reference and must not be
    // projected as one.
    expect(normaliseDtcgReferences('{Not A.Ref}')).toBe('{Not A.Ref}');
  });
});

describe('normaliseValue', () => {
  it('keeps CSS hex escape spelling verbatim inside quoted content', () => {
    // '\\41' spells the character A via a hex escape; decoding it to the
    // digits 41 would let a literal "41" compare equal and mask real drift.
    expect(normaliseValue(String.raw`'\41'`)).toBe(String.raw`'\41'`);
    expect(normaliseValue(String.raw`'\41'`)).not.toBe(normaliseValue(`'41'`));
  });

  it('decodes a simple escape while a hex escape in the same span stays verbatim', () => {
    // The decoded apostrophe re-escapes in the canonical serialisation (the
    // delimiter must never appear bare inside content); the hex escape keeps
    // its spelling untouched.
    expect(normaliseValue(String.raw`"a\'b \41 z"`)).toBe(String.raw`'a\'b \41 z'`);
  });

  it('keeps an unterminated quoted remainder verbatim instead of fabricating its delimiter', () => {
    // A malformed value must never normalise equal to its well-formed twin.
    expect(normaliseValue(`'Lexend`)).toBe(`'Lexend`);
    expect(normaliseValue(`'Lexend`)).not.toBe(normaliseValue(`'Lexend'`));
  });

  it('keeps a valid quoted value distinct from its malformed stray-quote twin', () => {
    // "a' b" is one string containing an apostrophe; 'a' b' is a string, a
    // bare token, and a stray quote. Serialising without re-escaping the
    // canonical delimiter would flatten both to the same form.
    expect(normaliseValue(`"a' b"`)).not.toBe(normaliseValue(`'a' b'`));
  });

  it('keeps an escaped backslash distinct from a preserved hex escape', () => {
    // 'a\\b' (literal backslash then b) and 'a\b' (hex escape) are different
    // strings; a decode that flattens both to a\b would mask real drift.
    expect(normaliseValue(String.raw`'a\\b'`)).not.toBe(normaliseValue(String.raw`'a\b'`));
  });

  it('keeps a non-breaking space distinct from a CSS space', () => {
    // CSS whitespace is space/tab/LF/CR/FF only; U+00A0 is identifier
    // content, so a value differing only by NBSP is real drift, and a JS
    // \s collapse would normalise the two to equality.
    expect(normaliseValue('foo\u00a0bar')).not.toBe(normaliseValue('foo bar'));
  });

  it('keeps a leading or trailing NBSP instead of trimming it away', () => {
    // .trim() strips U+00A0; the CSS-whitespace trim must not.
    expect(normaliseValue('\u00a0foo')).not.toBe(normaliseValue('foo'));
    expect(normaliseValue('foo\u00a0')).not.toBe(normaliseValue('foo'));
  });

  it('consumes comments as token separators, punctuation and quote content included', () => {
    // A comment is formatting, never value content \u2014 but it separates
    // tokens (`a/* */b` is two idents, not `ab`), and its interior commas,
    // parentheses, and quote characters are not structure.
    expect(normaliseValue("a /* don't, (really) */ b")).toBe('a b');
    expect(normaliseValue('a/* c */b')).toBe('a b');
    expect(normaliseValue('a /* runs to EOF')).toBe('a');
  });

  it('keeps escaped whitespace outside quotes distinct from formatting whitespace', () => {
    // `foo\ bar` is one ident containing an escaped space; `foo\  bar` has
    // an additional real separator — collapsing them together masks drift.
    // A trailing escaped space is content the edge trim must keep.
    expect(normaliseValue(String.raw`foo\ bar`)).not.toBe(normaliseValue(String.raw`foo\  bar`));
    expect(normaliseValue(String.raw`foo\ `)).not.toBe(normaliseValue('foo'));
  });

  it('treats backslash-newline as a line continuation contributing nothing', () => {
    expect(normaliseValue(`'a\\\nb'`)).toBe(normaliseValue(`'ab'`));
    expect(normaliseValue(`'a\\\r\nb'`)).toBe(normaliseValue(`'ab'`));
    // A literal newline inside a string is malformed content, not a
    // continuation \u2014 it stays distinct from the joined form.
    expect(normaliseValue(`'a\nb'`)).not.toBe(normaliseValue(`'ab'`));
  });
});

describe('splitTopLevelComma', () => {
  it('ignores commas inside quoted spans and nested parentheses', () => {
    expect(splitTopLevelComma(`'a,b',c`)).toEqual([`'a,b'`, 'c']);
    expect(splitTopLevelComma('rgb(1,2,3),x')).toEqual(['rgb(1,2,3)', 'x']);
  });

  it('refuses zero or multiple real top-level commas', () => {
    // Not-a-pair falls back to whole-value comparison at the caller, so a
    // malformed light-dark() reads as loud drift, never a mis-split.
    expect(splitTopLevelComma('a b')).toBeUndefined();
    expect(splitTopLevelComma('a,b,c')).toBeUndefined();
  });

  it('treats escaped code points outside quotes as identifier content, not structure', () => {
    // `foo\,bar` is one ident containing an escaped comma; `a\(b` must not
    // corrupt the parenthesis depth.
    expect(splitTopLevelComma(String.raw`foo\,bar,baz`)).toEqual([String.raw`foo\,bar`, 'baz']);
    expect(splitTopLevelComma(String.raw`a\(b,c`)).toEqual([String.raw`a\(b`, 'c']);
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

  it('splits light-dark() arms despite comment punctuation inside an arm', () => {
    // The comma and parenthesis inside the comment are not structure; the
    // real top-level comma still divides the arms.
    const comparand = assertOk(
      extractCssComparand(
        `:root { --bg-primary: light-dark(#ffffff /* fallback, (light) */, #222222); }`,
      ),
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

describe('compareDesignSystemConsistency', () => {
  it('passes a fully consistent surface pair and counts every comparison', () => {
    const report = assertOk(compareDesignSystemConsistency(baseInput()));

    // Exact, not a lower bound: baseInput has three light and three dark
    // comparisons, and a >= bound would stay green if a whole theme pass
    // stopped contributing.
    expect(report.mismatches).toEqual([]);
    expect(report.comparedCount).toBe(6);
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

  it('reports a dark-only token with no CSS counterpart', () => {
    const input = baseInput();
    const report = assertOk(
      compareDesignSystemConsistency({
        ...input,
        semanticDark: {
          ...input.semanticDark,
          text: { glow: { $type: 'color', $value: '#eeeeee' } },
        },
      }),
    );

    expect(report.mismatches).toEqual([
      { kind: 'missing_css_variable', path: 'text.glow', variable: '--text-glow' },
    ]);
  });

  it('rejects a dark-overlay path that collides with a different light path on one variable', () => {
    const input = baseInput();
    const result = compareDesignSystemConsistency({
      ...input,
      css: `${input.css}\n:root { --oak-foo: light-dark(#111111, #222222); }`,
      palette: {
        oak: {
          color: {
            paper: { $type: 'color', $value: '#fcfbf8' },
            foo: { $type: 'color', $value: '#111111' },
          },
        },
      },
      semanticDark: {
        ...input.semanticDark,
        oak: {
          color: { paper: { $type: 'color', $value: '#1c1a17' } },
          // oak.foo projects to --oak-foo, colliding with the palette's
          // oak.color.foo projection of the same variable.
          foo: { $type: 'color', $value: '#222222' },
        },
      },
    });

    expect(result.ok).toBe(false);

    if (result.ok) {
      throw new Error('Expected Err, got Ok');
    }

    expect(result.error.kind).toBe('variable_collision');
  });

  describe('non-token allowlist staleness', () => {
    it('reports an allowlist entry whose CSS variable no longer exists', () => {
      const input = baseInput();
      const report = assertOk(
        compareDesignSystemConsistency({
          ...input,
          nonTokenAllowlist: ['--canvas-rows', '--retired-plumbing'],
        }),
      );

      expect(report.mismatches).toEqual([
        { kind: 'unused_allowlist_entry', variable: '--retired-plumbing' },
      ]);
    });

    it('reports an allowlist entry whose variable has gained a dtcg counterpart', () => {
      const input = baseInput();
      const report = assertOk(
        compareDesignSystemConsistency({
          ...input,
          nonTokenAllowlist: ['--canvas-rows', '--bg-primary'],
        }),
      );

      expect(report.mismatches).toEqual([
        { kind: 'unused_allowlist_entry', variable: '--bg-primary' },
      ]);
    });

    it('reports an allowlist entry whose variable has gained a dark-only dtcg counterpart', () => {
      // The counterpart reference must include projected dark-leaf
      // variables: with canvas.rows introduced solely in semanticDark, the
      // --canvas-rows exemption is stale and must be reported, not
      // silently retained.
      const input = baseInput();
      const report = assertOk(
        compareDesignSystemConsistency({
          ...input,
          semanticDark: {
            ...input.semanticDark,
            canvas: { rows: { $type: 'number', $value: 12 } },
          },
        }),
      );

      expect(report.mismatches).toEqual([
        { kind: 'unused_allowlist_entry', variable: '--canvas-rows' },
      ]);
    });
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
