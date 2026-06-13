/**
 * Oak acorn mark for the Claude Code statusline, as multi-row glyph art.
 *
 * @remarks
 * The rows are a faithful conversion of the Oak National Academy acorn SVG via
 * the rasterise → area-coverage → glyph-pack pipeline documented, with its
 * regeneration recipe, in
 * `.agent/research/developer-experience/statusline-logos.md`. Each visible style
 * is a three-row mark of uniform per-row display width — an open acorn cup with
 * an upper-right leaf, a sprout, and a rounded base — sized to sit as a left
 * logo-column with the statusline segments flowing to its right.
 *
 * The mark is a fixed brand asset, held here as a verified constant rather than
 * regenerated at build time. Regenerate from the SVG only if the brand mark
 * itself changes, using the recipe in the research document above.
 *
 * @packageDocumentation
 */

/** Glyph family used to draw the Oak mark, or `none` to suppress it. */
export type OakLogoStyle = 'sextant' | 'quad' | 'braille' | 'none';

/**
 * Three-row Oak acorn marks keyed by glyph family. Every row within a style is
 * five code points wide, and the styles assume each glyph renders at
 * single-column (narrow) width so the adjacent segment column stays aligned. A
 * terminal that renders the Legacy Computing block double-width would misalign
 * the sextant column — use `quad` there.
 *
 * - `quad` — Unicode block-element quadrants (U+2580). The default: universal
 *   font support, slightly chunkier.
 * - `sextant` — Unicode Symbols for Legacy Computing (U+1FB00). Sharper, but
 *   needs a font with that block; it renders as tofu boxes otherwise.
 * - `braille` — Unicode Braille Patterns (U+2800). Very wide font support, but
 *   the sparsest at this three-row size (the dots scatter when small).
 */
export const OAK_LOGO_ROWS: Readonly<Record<Exclude<OakLogoStyle, 'none'>, readonly string[]>> = {
  sextant: ['🬞🬵🬻🬲🬏', '🬬 🬁🬋🬝', '🬁🬪🬭🬖🬄'],
  quad: ['▗▄▟▙▖', '█ ▝▚█', '▝▙▄▟▘'],
  braille: ['⢀⡤⣾⢥⡀', '⢯⠀⠘⠲⡽', '⠘⢧⣀⡴⠃'],
};

/**
 * Resolve an {@link OakLogoStyle} from a raw configuration string, such as the
 * `OAK_STATUSLINE_LOGO` environment variable. Unrecognised or absent values
 * fall back to the default `quad`, whose Block Elements have universal font
 * support; `sextant` is opt-in for terminals whose font renders the sharper
 * Legacy Computing block.
 *
 * @param raw - The raw configuration value, or `undefined` when unset.
 * @returns The resolved logo style.
 */
export function resolveLogoStyle(raw: string | undefined): OakLogoStyle {
  if (raw === 'sextant' || raw === 'quad' || raw === 'braille' || raw === 'none') {
    return raw;
  }
  return 'quad';
}
