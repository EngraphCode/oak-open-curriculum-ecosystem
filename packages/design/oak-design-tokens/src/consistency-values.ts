/**
 * Value and name normalisation for the dtcg↔CSS consistency comparison.
 *
 * @remarks
 * The two projections format identical values differently; these closed
 * rules make formatting differences invisible while value drift stays
 * visible. Contract: the Stage-A import verification report Part 2 §2.1.
 *
 * @packageDocumentation
 */

/**
 * Map a dtcg dot-path to its CSS custom-property name.
 *
 * Exactly two live transforms exist (verified against every path, zero
 * collisions): `oak.color.x` → `--oak-x` and `font.family.x` → `--font-x`.
 * Every other path maps mechanically: `a.b` → `--a-b`.
 */
export function dtcgPathToCssVariable(path: string): string {
  const paletteMatch = /^oak\.color\.(?<rest>.+)$/u.exec(path);

  if (paletteMatch?.groups) {
    return `--oak-${paletteMatch.groups.rest.replaceAll('.', '-')}`;
  }

  const fontMatch = /^font\.family\.(?<rest>.+)$/u.exec(path);

  if (fontMatch?.groups) {
    return `--font-${fontMatch.groups.rest.replaceAll('.', '-')}`;
  }

  return `--${path.replaceAll('.', '-')}`;
}

const DTCG_REFERENCE_PATTERN = /\{(?<path>[^{}]+)\}/gu;

/**
 * Collapse insignificant whitespace and normalise quote style so
 * formatting differences never read as drift: font stacks quote names
 * with `'` in the CSS and `"` in the JSON, and expression spacing at
 * parenthesis edges and around `,` and `*` differs between the
 * projections while `+`/`-` keep their syntactically required spacing
 * on both sides.
 */
export function normaliseValue(value: string): string {
  // Tokenise with quote and escape awareness, then canonicalise the quote
  // DELIMITER and normalise spacing only OUTSIDE quoted segments: quoted
  // content is literal (an apostrophe inside a double-quoted string is
  // content, never a delimiter), and rewriting it would make genuinely
  // different values compare equal.
  const parts: string[] = [];
  let outside = '';
  let index = 0;

  while (index < value.length) {
    const character = value[index];

    if (character !== '"' && character !== "'") {
      outside += character;
      index += 1;
      continue;
    }

    parts.push(normaliseOutsideQuotes(outside));
    outside = '';

    const span = consumeQuotedSpan(value, index + 1, character);
    parts.push(`'${span.content}'`);
    index = span.closingIndex + 1;
  }

  parts.push(normaliseOutsideQuotes(outside));

  return parts.join('').trim();
}

/**
 * Read a quoted span's literal content from after its opening delimiter to
 * its matching close, honouring backslash escapes. An unterminated string
 * keeps its remainder as literal content — the fail-soft still compares
 * content verbatim rather than normalising it.
 */
function consumeQuotedSpan(
  value: string,
  startIndex: number,
  delimiter: string,
): { readonly content: string; readonly closingIndex: number } {
  let content = '';
  let index = startIndex;

  while (index < value.length && value[index] !== delimiter) {
    if (value[index] === '\\' && index + 1 < value.length) {
      content += value[index] + value[index + 1];
      index += 2;
      continue;
    }

    content += value[index];
    index += 1;
  }

  return { content, closingIndex: index };
}

function normaliseOutsideQuotes(segment: string): string {
  return segment
    .replaceAll(/\s+/gu, ' ')
    .replaceAll('( ', '(')
    .replaceAll(' )', ')')
    .replaceAll(' ,', ',')
    .replaceAll(', ', ',')
    .replaceAll(' *', '*')
    .replaceAll('* ', '*');
}

/**
 * Rewrite dtcg `{a.b}` references to their CSS `var(--a-b)` projection —
 * the same semantic reference expressed in each surface's own syntax.
 */
export function normaliseDtcgReferences(value: string): string {
  return value.replaceAll(
    DTCG_REFERENCE_PATTERN,
    (_match, path: string) => `var(${dtcgPathToCssVariable(path)})`,
  );
}

/** Split a value on its single top-level comma, respecting nested parentheses. */
export function splitTopLevelComma(value: string): readonly [string, string] | undefined {
  let depth = 0;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];

    if (character === '(') {
      depth += 1;
    } else if (character === ')') {
      depth -= 1;
    } else if (character === ',' && depth === 0) {
      return [value.slice(0, index), value.slice(index + 1)];
    }
  }

  return undefined;
}
