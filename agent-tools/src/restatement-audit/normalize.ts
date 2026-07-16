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

/** Strip a single trailing `.`, `,`, `;`, or `:` — punctuation, not part of the value. */
function stripTrailingPunctuation(value: string): string {
  return value.replace(/[.,;:]+$/, '');
}

/**
 * Deterministically canonicalise a raw `valueNorm` for exact-key joining: trim, collapse
 * internal whitespace, strip trailing sentence punctuation, and lowercase. Pure and
 * total — every string has a normal form, including the empty string.
 */
export function normalizeValue(raw: string): string {
  return stripTrailingPunctuation(collapseWhitespace(raw.trim())).toLowerCase();
}
