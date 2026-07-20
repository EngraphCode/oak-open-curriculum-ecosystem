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
  return value
    .replaceAll('"', "'")
    .replaceAll(/\s+/gu, ' ')
    .replaceAll(/\(\s+/gu, '(')
    .replaceAll(/\s+\)/gu, ')')
    .replaceAll(/\s*(?<punctuation>[,*])\s*/gu, '$<punctuation>')
    .trim();
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
