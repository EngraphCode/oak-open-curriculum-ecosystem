/**
 * Shared colour-token classification at the DTCG boundary.
 *
 * @remarks
 * The export's `$type` is heuristic (`dtcg/README.md`; 131/537 leaves are
 * untyped, including the `color-mix()` state tokens), so classification
 * keys on the declared type where present and on value shape where absent.
 * Consolidated here at the second consumer: colour-literal validation and
 * contrast resolution must share one notion of "colour token", or the two
 * surfaces drift apart on exactly the untyped residual.
 *
 * @packageDocumentation
 */
import type { DtcgTokenLeaf } from './dtcg-types.js';

/** The only colour value form the WCAG contrast computation can consume. */
const HEX_LITERAL_PATTERN = /^#[0-9a-f]{6}$/iu;

/**
 * Value shapes that identify an UNTYPED leaf as a colour token.
 *
 * @remarks
 * Hex, rgb, and `color-mix()` values are unambiguously colours; untyped
 * `calc()` and bare references stay out of scope (indistinguishable from
 * dimension values without an ontology) — that residual is owned by the
 * export's own schema check and the gate's checked-count assertion.
 */
const UNTYPED_COLOUR_VALUE_PATTERN = /^#|^rgb\(|color-mix\(/u;

/** Whether a value is a six-digit hex colour literal (`#rrggbb`). */
export function isHexColourLiteral(value: string): boolean {
  return HEX_LITERAL_PATTERN.test(value);
}

/** Whether a leaf is a colour token: typed `color`, or untyped with a colour-shaped string value. */
export function isColourCandidate(leaf: DtcgTokenLeaf): boolean {
  if (leaf.$type === 'color') {
    return true;
  }

  return (
    leaf.$type === undefined &&
    typeof leaf.$value === 'string' &&
    UNTYPED_COLOUR_VALUE_PATTERN.test(leaf.$value)
  );
}
