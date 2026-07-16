/**
 * Deterministic value normalisation for the restatement-audit join layer.
 *
 * @remarks
 * A finder agent's `valueNorm` is its best-effort canonical value, but LLM output still
 * varies on casing, whitespace, and trailing punctuation for what is genuinely the same
 * fact ("Completed" vs "completed." vs "  completed"). `normalizeValue` is the
 * deterministic, code-side second pass `join.ts` applies before grouping — so a
 * formatting difference never mints a false CONFLICT, and code (never an agent) owns the
 * canonicalisation that feeds a count.
 *
 * @packageDocumentation
 */

/** Collapse any run of whitespace to a single space. */
function collapseWhitespace(value: string): string {
  return value.replaceAll(/\s+/g, ' ');
}

/**
 * Strip the whole trailing run of sentence punctuation AND whitespace as one class —
 * `'completed .'` must normalise to `'completed'`, never `'completed '` (a trailing space
 * surviving a punctuation-only strip minted false CONFLICTs and broke idempotence).
 */
function stripTrailingPunctuation(value: string): string {
  return value.replace(/[\s.,;:]+$/, '');
}

/**
 * Deterministically canonicalise a raw `valueNorm` for exact-key joining: trim, collapse
 * internal whitespace, strip the trailing whitespace-and-punctuation run, and lowercase.
 * Pure, total (every string has a normal form, including the empty string), and
 * idempotent: `normalizeValue(normalizeValue(x)) === normalizeValue(x)` for all `x`.
 */
export function normalizeValue(raw: string): string {
  return stripTrailingPunctuation(collapseWhitespace(raw.trim())).toLowerCase();
}
