/**
 * Holds the page's composition layer to the claim it opens with.
 *
 * @remarks
 * `public/landing-page.css` begins "Everything here resolves through
 * design-system tokens — no raw colours, fonts, or spacing values." That was an
 * assertion in a comment, and a design-system review found it already untrue:
 * the file reached past the semantic tier to two `--oak-*` primitives, which
 * silently discarded the high-contrast theme's own shadow choice for that
 * subtree.
 *
 * A comment cannot check the file it sits in. This does — and each exemption
 * it grants is itself checked (the visually-hidden recipe must equal the
 * kit's own, declaration for declaration), because an unexamined exemption
 * is the same defect one layer down.
 */

import { describe, expect, it } from 'vitest';

import { resolveOakDsPackageRoot } from './copy-oak-ds.js';
import { readAppText, readPackageText } from './test-helpers/oak-ds-fixtures.js';

const CSS_PATH = 'public/landing-page.css';

/** Strips comments so prose about hex values is not read as a hex value. */
function withoutComments(css: string): string {
  return css.replaceAll(/\/\*[\s\S]*?\*\//g, '');
}

/** The declarations of one flat `{ … }` block, normalised for set comparison. */
function declarationSet(block: string): readonly string[] {
  return block
    .replaceAll(/[{}]/g, '')
    .split(';')
    .map((declaration) => declaration.replaceAll(/\s+/g, ' ').trim())
    .filter((declaration) => declaration !== '')
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Named colours and modern colour functions a hand-written rule most
 * plausibly reaches for. Not the full CSS keyword list — the common hazard
 * set, alongside the hex and legacy-function legs below.
 */
// The negative lookahead (?![\w-]) rejects hyphen continuations so property
// names like `white-space` and identifiers like `colour-safe` never match.
const RAW_COLOUR_PATTERN =
  /(?:[:\s(,])(?:white|black|red|blue|green|yellow|orange|purple|pink|brown|grey|gray|cyan|magenta|teal|navy|maroon|olive|lime|aqua|fuchsia|silver|gold|indigo|violet|coral|salmon|khaki|beige|ivory|tomato|orchid|plum|azure|lavender|crimson|turquoise)(?![\w-])|\b(?:oklch|oklab|lab|lch|hwb|color|color-mix)\(/gi;

const VISUALLY_HIDDEN_BLOCK_PATTERN = /\{[^{}]*clip-path:\s*inset\(50%\)[^{}]*\}/g;

describe('landing-page.css token discipline', () => {
  it('names no raw colour', async () => {
    const css = withoutComments(await readAppText(CSS_PATH));

    expect(css.match(/#[0-9a-f]{3,8}\b/gi) ?? []).toStrictEqual([]);
    expect(css.match(/\b(?:rgba?|hsla?)\(/gi) ?? []).toStrictEqual([]);
    expect(css.match(RAW_COLOUR_PATTERN) ?? []).toStrictEqual([]);
  });

  it('names no --oak-* primitive', async () => {
    // Tier 1 colour primitives are the palette. Composition consumes roles,
    // so that a theme which re-points a role — as high-contrast does for
    // --shadow-ground — is obeyed rather than overridden by a page that
    // named the primitive underneath it. (Spacing scale tokens are the
    // system's own composition grammar and are not what this checks.)
    const css = withoutComments(await readAppText(CSS_PATH));

    expect(css.match(/var\(\s*--oak-[\w-]+/g) ?? []).toStrictEqual([]);
  });

  it('mirrors the kit visually-hidden recipe exactly, once', async () => {
    // The one sanctioned bare-length site: the width-conditional
    // visually-hidden recipe (the kit class is unconditional, so the page
    // carries the recipe inside its media query). "Mirrors the design
    // system's .oak-visually-hidden" is this file's own comment — held here
    // declaration-for-declaration, so the exemption cannot quietly grow a
    // smuggled extra declaration or drift from the kit.
    const css = withoutComments(await readAppText(CSS_PATH));
    const kitCss = withoutComments(
      await readPackageText(resolveOakDsPackageRoot(), 'components.css'),
    );

    const pageBlocks = css.match(VISUALLY_HIDDEN_BLOCK_PATTERN) ?? [];
    expect(pageBlocks).toHaveLength(1);

    const kitBlock = kitCss.match(/\.oak-visually-hidden\s*(\{[^{}]*\})/)?.[1];
    expect(kitBlock).toBeDefined();

    expect(declarationSet(pageBlocks[0] ?? '')).toStrictEqual(declarationSet(kitBlock ?? ''));
  });

  it('sizes nothing with a bare length', async () => {
    // Spacing, radii and borders all have tokens. The exemptions are the
    // media-query breakpoints (no token can express them) and the
    // kit-equal visually-hidden recipe proven above.
    const withoutQueries = withoutComments(await readAppText(CSS_PATH)).replaceAll(
      /@media[^{]+\{/g,
      '{',
    );
    const declarations = withoutQueries.replaceAll(VISUALLY_HIDDEN_BLOCK_PATTERN, '{}');

    expect(declarations.match(/:\s*[^;{}]*?\b\d+(?:\.\d+)?(?:px|rem|em)\b/g) ?? []).toStrictEqual(
      [],
    );
  });
});
