/**
 * Oak acorn mark for the Claude Code statusline, as multi-row glyph art.
 *
 * @remarks
 * The rows are a faithful conversion of the Oak National Academy acorn SVG via
 * the rasterise → area-coverage → glyph-pack pipeline documented, with its
 * regeneration recipe, in
 * `.agent/research/developer-experience/statusline-logos/statusline-logos.md`. Each visible style
 * is a four-row mark of uniform per-row display width — an open acorn cup with
 * an upper-right leaf, a sprout, and a rounded base — sized to sit as a left
 * logo-column with the statusline segments flowing to its right.
 *
 * The marks are fixed brand assets, held here as verified constants rather than
 * regenerated at build time. The `braille` / `quad` / `sextant` rows are the
 * unmodified conversion output; `braille-sharp` carries two deliberate
 * hand-tuned dots on top of it (see below). Regenerate the conversion styles
 * from the SVG only if the brand mark itself changes, using the recipe in the
 * research doc.
 *
 * @packageDocumentation
 */

/** Glyph style used to draw the Oak mark, or `none` to suppress it. */
export type OakLogoStyle = 'braille-sharp' | 'braille' | 'quad' | 'sextant' | 'none';

/**
 * Four-row Oak acorn marks keyed by style. Every row within a style has a
 * uniform display width (the braille styles are six columns; quad and sextant
 * are seven), and each style assumes its glyphs render at single-column (narrow)
 * width so the adjacent segment column stays aligned. A terminal that renders
 * the Legacy Computing block double-width would misalign the sextant column —
 * use a braille style or `quad` there.
 *
 * - `braille-sharp` — the default. The braille conversion plus two hand-tuned
 *   dots: a sharper lower-left nut-to-cup shoulder and a crisper sprout tip.
 *   Braille Patterns (U+2800) have very wide font support.
 * - `braille` — the unmodified braille conversion (rounder left shoulder),
 *   regenerable from the SVG.
 * - `quad` — Unicode block-element quadrants (U+2580). Universal font support,
 *   slightly chunkier.
 * - `sextant` — Unicode Symbols for Legacy Computing (U+1FB00). Sharpest, but
 *   needs a font with that block; it renders as tofu boxes otherwise.
 */
export const OAK_LOGO_ROWS: Readonly<Record<Exclude<OakLogoStyle, 'none'>, readonly string[]>> = {
  'braille-sharp': ['⠀⢀⣠⣞⣁⠀', '⣼⠋⠘⢧⡉⢷', '⢹⡅⠀⠀⢉⡍', '⠀⠻⣤⣤⠞⠁'],
  braille: ['⠀⢀⣠⣟⣀⠀', '⣼⠋⠘⢧⡉⢷', '⢹⡄⠀⠀⢉⡍', '⠀⠻⣤⣤⠞⠁'],
  quad: [' ▗▄▟▙▖ ', '▟▀ ▜▄▀▙', '▜▌  ▝▜▛', ' ▀▙▄▄▛ '],
  sextant: [' 🬞🬭🬻🬮🬏 ', '🬻🬆🬀🬬🬱🬒🬺', '🬨▌  🬁🬡🬕', ' 🬊🬩🬭🬵🬆 '],
};

/**
 * Resolve an {@link OakLogoStyle} from a raw configuration string, such as the
 * `OAK_STATUSLINE_LOGO` environment variable. Unrecognised or absent values
 * fall back to the default `braille-sharp`; `braille`, `quad`, and `sextant`
 * are opt-in alternatives, and `none` restores the single-line statusline.
 *
 * @param raw - The raw configuration value, or `undefined` when unset.
 * @returns The resolved logo style.
 */
export function resolveLogoStyle(raw: string | undefined): OakLogoStyle {
  if (
    raw === 'braille-sharp' ||
    raw === 'braille' ||
    raw === 'quad' ||
    raw === 'sextant' ||
    raw === 'none'
  ) {
    return raw;
  }
  return 'braille-sharp';
}
