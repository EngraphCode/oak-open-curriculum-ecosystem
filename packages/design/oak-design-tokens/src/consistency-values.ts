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
  collapseCssWhitespace,
  consumeComment,
  consumeQuotedSpan,
  serialiseSpanContent,
  skipQuotedSpan,
  trimCssWhitespace,
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
    } else if (isContentSpanStart(value, index)) {
      parts.push(normaliseOutsideQuotes(outside));
      outside = '';
      index = appendContentSpan(parts, value, index);
    } else {
      outside += character;
      index += 1;
    }
  }

  parts.push(normaliseOutsideQuotes(outside));

  return trimCssWhitespace(parts.join(''));
}

/** A quoted span, or an escape span outside quotes — both literal content. */
function isContentSpanStart(value: string, index: number): boolean {
  const character = value[index];

  return (character === '\\' && index + 1 < value.length) || character === '"' || character === "'";
}

/**
 * Push the content span at `openIndex` and return the next walk index. An
 * escape span outside quotes (`foo\ bar`) passes through verbatim, shielded
 * from whitespace collapsing — `foo\ bar` and `foo\  bar` are genuinely
 * different values. Quoted spans canonicalise via `appendCanonicalSpan`.
 */
function appendContentSpan(parts: string[], value: string, openIndex: number): number {
  const character = value[openIndex];

  if (character === '\\') {
    parts.push(value.slice(openIndex, openIndex + 2));
    return openIndex + 2;
  }

  return appendCanonicalSpan(parts, value, openIndex, character);
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
  let index = 0;

  while (index < value.length) {
    const skipEnd = contentSkipEnd(value, index);

    if (skipEnd !== undefined) {
      index = skipEnd;
      continue;
    }

    const character = value[index];

    if (character === '(') {
      depth += 1;
    } else if (character === ')') {
      depth -= 1;
    } else if (character === ',' && depth === 0) {
      indices.push(index);
    }

    index += 1;
  }

  return indices;
}

/**
 * End index of a span the structural scan must skip as content, or undefined
 * when `index` is structural. Two content spans exist: a CSS escape outside
 * quotes (`foo\,bar`, `a\(b` — the escaped code point is identifier content,
 * never a separator or depth change) and a quoted span.
 */
function contentSkipEnd(value: string, index: number): number | undefined {
  const character = value[index];

  if (character === '\\') {
    return index + 2;
  }

  if (character === '"' || character === "'") {
    return skipQuotedSpan(value, index) + 1;
  }

  return undefined;
}
