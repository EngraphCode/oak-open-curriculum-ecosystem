/**
 * Quoted-span and comment machinery for the dtcg↔CSS value normaliser.
 *
 * @remarks
 * The span rules encode which spelling differences are formatting and which
 * are drift: simple escapes decode, hex escapes stay verbatim, escaped
 * backslashes keep their spelling, line continuations vanish, and comments
 * separate tokens. `consistency-values.ts` owns the walk; this module owns
 * the per-span reads it composes.
 *
 * @packageDocumentation
 */

const HEX_DIGIT_PATTERN = /[0-9a-f]/iu;

/** The canonical delimiter's escaped spelling, hoisted to keep templates flat. */
const ESCAPED_DELIMITER = String.raw`\'`;

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
export function consumeQuotedSpan(
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

/**
 * Serialise a span's literal content into the canonical quoted form,
 * re-escaping the canonical delimiter: without it a valid `"a' b"` and a
 * malformed `'a' b'` would serialise identically.
 */
export function serialiseSpanContent(content: string): string {
  const escaped = content.replaceAll("'", ESCAPED_DELIMITER);

  return `'${escaped}'`;
}

/**
 * Index just past a comment opened at `openIndex`. An unterminated comment
 * runs to EOF per the CSS consume-comment rule.
 */
export function consumeComment(value: string, openIndex: number): number {
  const close = value.indexOf('*/', openIndex + 2);

  return close === -1 ? value.length : close + 2;
}

/**
 * Index of a quoted span's closing delimiter (or the last consumed index
 * when unterminated), escape-aware so an escaped delimiter never closes it.
 */
export function skipQuotedSpan(value: string, openIndex: number): number {
  const delimiter = value[openIndex];
  let index = openIndex + 1;

  while (index < value.length && value[index] !== delimiter) {
    index += value[index] === '\\' ? 2 : 1;
  }

  return index;
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

  const continuationEnd = lineContinuationEnd(value, index);

  if (continuationEnd !== undefined) {
    return { text: '', nextIndex: continuationEnd };
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

/**
 * End index of a backslash-newline line continuation at `index`, or
 * undefined when the escape is not one. A continuation is a CSS lexical
 * artefact, not an escape: it contributes NO character, with CRLF consumed
 * as one sequence. Decoding it to the newline would make `'ab'` and a
 * continued `'a\<LF>b'` compare different while colliding with a malformed
 * literal newline.
 */
function lineContinuationEnd(value: string, index: number): number | undefined {
  const next = value[index + 1];

  if (next === '\n' || next === '\f') {
    return index + 2;
  }

  if (next === '\r') {
    return value[index + 2] === '\n' ? index + 3 : index + 2;
  }

  return undefined;
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
 * A trailing ESCAPED whitespace character (`foo\ `) is identifier content
 * and stays; a leading one cannot exist (nothing precedes it to escape it).
 */
export function trimCssWhitespace(value: string): string {
  let start = 0;
  let end = value.length;

  while (start < end && CSS_WHITESPACE_CHARACTERS.has(value[start])) {
    start += 1;
  }

  while (
    end > start &&
    CSS_WHITESPACE_CHARACTERS.has(value[end - 1]) &&
    !escapedAt(value, end - 1)
  ) {
    end -= 1;
  }

  return value.slice(start, end);
}

/** True when the character at `index` sits behind an ODD run of backslashes. */
function escapedAt(value: string, index: number): boolean {
  let backslashes = 0;

  while (index - backslashes - 1 >= 0 && value[index - backslashes - 1] === '\\') {
    backslashes += 1;
  }

  return backslashes % 2 === 1;
}
