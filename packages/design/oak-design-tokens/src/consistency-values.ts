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
import { globalTokenReferencePattern } from '@oaknational/design-tokens-core';

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

    // An unterminated string is malformed: keep its remainder verbatim from
    // the opening delimiter, never fabricate the missing close — a malformed
    // value must not normalise equal to its well-formed twin.
    if (span.closingIndex >= value.length) {
      parts.push(value.slice(index));
      index = value.length;
      continue;
    }

    parts.push(serialiseSpanContent(span.content));
    index = span.closingIndex + 1;
  }

  parts.push(normaliseOutsideQuotes(outside));

  return trimCssWhitespace(parts.join(''));
}

/**
 * Read a quoted span's literal content from after its opening delimiter to
 * its matching close. Simple backslash escapes DECODE to their character so
 * equivalent spellings share one canonical form — `"Rock'n Roll"` and
 * `'Rock\'n Roll'` are the same string, and preserving the escape spelling
 * would report drift where only the delimiter changed. Hex escapes stay
 * verbatim: a cross-projection hex-vs-literal spelling difference reads as
 * loud drift, never as a masked equality. An unterminated string keeps its
 * remainder as literal content — the fail-soft still compares content
 * rather than normalising it.
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
      const escape = consumeEscape(value, index);
      content += escape.text;
      index = escape.nextIndex;
      continue;
    }

    content += value[index];
    index += 1;
  }

  return { content, closingIndex: index };
}

const HEX_DIGIT_PATTERN = /[0-9a-f]/iu;

/**
 * CSS whitespace is space, tab, LF, CR, and FF only — narrower than JS `\s`,
 * which also matches NBSP and other Unicode spaces that CSS treats as
 * identifier content. Collapsing or trimming with JS semantics would
 * normalise genuinely different values (`foo\u00a0bar` vs `foo bar`) to
 * equality, masking real drift.
 */
const CSS_WHITESPACE_RUN_PATTERN = /[ \t\n\r\f]+/gu;
const CSS_WHITESPACE_CHARACTERS: ReadonlySet<string> = new Set([' ', '\t', '\n', '\r', '\f']);

/** Collapse CSS whitespace runs to a single space (never JS `\s`). */
export function collapseCssWhitespace(segment: string): string {
  return segment.replaceAll(CSS_WHITESPACE_RUN_PATTERN, ' ');
}

/**
 * Trim CSS whitespace from both edges (never `.trim()`). Index walk, not an
 * anchored-alternation regex — `/^[…]+|[…]+$/g` backtracks super-linearly.
 */
export function trimCssWhitespace(value: string): string {
  let start = 0;
  let end = value.length;

  while (start < end && CSS_WHITESPACE_CHARACTERS.has(value[start])) {
    start += 1;
  }

  while (end > start && CSS_WHITESPACE_CHARACTERS.has(value[end - 1])) {
    end -= 1;
  }

  return value.slice(start, end);
}

/** The canonical delimiter's escaped spelling, hoisted to keep templates flat. */
const ESCAPED_DELIMITER = String.raw`\'`;

/**
 * Serialise a span's literal content into the canonical quoted form,
 * re-escaping the canonical delimiter: without it a valid `"a' b"` and a
 * malformed `'a' b'` would serialise identically.
 */
function serialiseSpanContent(content: string): string {
  const escaped = content.replaceAll("'", ESCAPED_DELIMITER);

  return `'${escaped}'`;
}

/**
 * Consume one backslash escape starting at `index`. A simple escape decodes
 * to its character; a hex escape (backslash + up to six hex digits + one
 * optional terminating space) keeps its spelling verbatim per the
 * `consumeQuotedSpan` contract.
 */
function consumeEscape(
  value: string,
  index: number,
): { readonly text: string; readonly nextIndex: number } {
  // An escaped backslash keeps its escaped spelling: decoding it to a raw
  // backslash would collide with the preserved hex-escape representation
  // ('a\\b' vs the hex escape 'a\b' must stay distinct).
  if (value[index + 1] === '\\') {
    return { text: '\\\\', nextIndex: index + 2 };
  }

  if (!HEX_DIGIT_PATTERN.test(value[index + 1])) {
    return { text: value[index + 1], nextIndex: index + 2 };
  }

  let end = index + 1;

  while (end < value.length && end - index <= 6 && HEX_DIGIT_PATTERN.test(value[end])) {
    end += 1;
  }

  if (value[end] === ' ') {
    end += 1;
  }

  return { text: value.slice(index, end), nextIndex: end };
}

function normaliseOutsideQuotes(segment: string): string {
  return collapseCssWhitespace(segment)
    .replaceAll('( ', '(')
    .replaceAll(' )', ')')
    .replaceAll(' ,', ',')
    .replaceAll(', ', ',')
    .replaceAll(' *', '*')
    .replaceAll('* ', '*');
}

/**
 * Rewrite dtcg `{a.b}` references to their CSS `var(--a-b)` projection —
 * the same semantic reference expressed in each surface's own syntax. The
 * reference grammar is owned by design-tokens-core
 * (consolidate-at-second-consumer): a brace chunk outside that grammar is
 * not a reference and stays verbatim.
 */
export function normaliseDtcgReferences(value: string): string {
  return value.replaceAll(
    globalTokenReferencePattern(),
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
