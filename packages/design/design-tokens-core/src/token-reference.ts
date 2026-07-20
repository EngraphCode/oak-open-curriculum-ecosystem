/**
 * Shared DTCG token-reference grammar.
 *
 * @remarks
 * Single source for the reference-path pattern previously restated (with a
 * hand-maintained update-together comment web) in `index.ts`,
 * `contrast-resolve.ts`, and the colour-literal validator. The builders
 * return fresh instances so the stateful global flag never shares
 * `lastIndex` across consumers.
 *
 * @packageDocumentation
 */

/** Inner reference-path grammar: dot-separated kebab segments. */
const TOKEN_REFERENCE_INNER = String.raw`[a-z0-9-]+(?:\.[a-z0-9-]+)*`;

/** Anchored full-string reference pattern, path captured (e.g. `{color.ink}`). */
export function anchoredTokenReferencePattern(): RegExp {
  return new RegExp(String.raw`^\{(${TOKEN_REFERENCE_INNER})\}$`, 'iu');
}

/** Global in-string reference pattern, path captured, for scan/replace. */
export function globalTokenReferencePattern(): RegExp {
  return new RegExp(String.raw`\{(${TOKEN_REFERENCE_INNER})\}`, 'giu');
}
