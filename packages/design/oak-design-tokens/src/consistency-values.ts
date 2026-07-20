/**
 * Value and name normalisation for the dtcg↔CSS consistency comparison.
 *
 * @remarks
 * The two projections format identical values differently; these closed
 * rules make formatting differences invisible while value drift stays
 * visible. Contract: the Stage-A import verification report Part 2 §2.1.
 * The per-span string machinery lives in `consistency-value-strings.ts`.
 *
 * @packageDocumentation
 */
import { globalTokenReferencePattern } from '@oaknational/design-tokens-core';
import {
  consumeComment,
  consumeQuotedSpan,
  serialiseSpanContent,
  skipQuotedSpan,
} from './consistency-value-strings.js';

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
  // Tokenise with quote, escape, and comment awareness, then canonicalise
  // the quote DELIMITER and normalise spacing only OUTSIDE quoted segments:
  // quoted content is literal (an apostrophe inside a double-quoted string
  // is content, never a delimiter), and rewriting it would make genuinely
  // different values compare equal. Comments are token separators, not
  // value content: they contribute one space (so `a/* */b` stays distinct
  // from the single ident `ab`) and are consumed at the same level as quote
  // detection — a comment can contain quote characters, commas, and
  // parentheses that would otherwise corrupt the walk.
  const parts: string[] = [];
  let outside = '';
  let index = 0;

  while (index < value.length) {
    const character = value[index];

    if (character === '/' && value[index + 1] === '*') {
      outside += ' ';
      index = consumeComment(value, index);
      continue;
    }

    if (character !== '"' && character !== "'") {
      outside += character;
      index += 1;
      continue;
    }

    parts.push(normaliseOutsideQuotes(outside));
    outside = '';
    index = appendCanonicalSpan(parts, value, index, character);
  }

  parts.push(normaliseOutsideQuotes(outside));

  return trimCssWhitespace(parts.join(''));
}

/**
 * Push the span opened at `openIndex` in canonical form and return the next
 * walk index. An unterminated string is malformed: its remainder stays
 * verbatim from the opening delimiter, never with a fabricated close — a
 * malformed value must not normalise equal to its well-formed twin.
 */
function appendCanonicalSpan(
  parts: string[],
  value: string,
  openIndex: number,
  delimiter: string,
): number {
  const span = consumeQuotedSpan(value, openIndex + 1, delimiter);

  if (span.closingIndex >= value.length) {
    parts.push(value.slice(openIndex));
    return value.length;
  }

  parts.push(serialiseSpanContent(span.content));
  return span.closingIndex + 1;
}

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

/**
 * Split a value on its single top-level comma, respecting nested parentheses
 * and quoted spans (a comma inside a string is content, never a separator).
 * Exactly one real top-level comma is required — zero or several means the
 * value is not a two-arm pair, and the caller's whole-value fallback keeps
 * any drift visible rather than mis-split. Input is `normaliseValue` output,
 * so comments are already consumed.
 */
export function splitTopLevelComma(value: string): readonly [string, string] | undefined {
  const commas = topLevelCommaIndices(value);

  if (commas.length !== 1) {
    return undefined;
  }

  const splitIndex = commas[0];

  return [value.slice(0, splitIndex), value.slice(splitIndex + 1)];
}

/** Indices of every comma at parenthesis depth zero outside quoted spans. */
function topLevelCommaIndices(value: string): readonly number[] {
  const indices: number[] = [];
  let depth = 0;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];

    if (character === '"' || character === "'") {
      index = skipQuotedSpan(value, index);
    } else if (character === '(') {
      depth += 1;
    } else if (character === ')') {
      depth -= 1;
    } else if (character === ',' && depth === 0) {
      indices.push(index);
    }
  }

  return indices;
}
