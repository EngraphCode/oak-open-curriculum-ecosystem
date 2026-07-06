import { err, ok, type Result } from '@oaknational/result';

import { type Denominator, type DenominatorFile } from './refounding-artefacts.js';

/**
 * The freeze verifier's data model: the effective-denominator merge and the
 * violation vocabulary its RED findings are expressed in. Pure — the
 * filesystem-facing verification lives in
 * `refound-verify-freeze-helpers.ts`.
 *
 * @packageDocumentation
 */

/**
 * A denominator amendment (F1 §7): files appended by arrival routing or
 * sweep promotion. Tranche 1 defines the merge SIGNATURE and accepts only an
 * empty amendment list; the amendment mechanics land with
 * `refound-merge-recheck`.
 */
export interface DenominatorAmendment {
  readonly files: readonly DenominatorFile[];
}

/**
 * Merge the v1 denominator with its amendments into the effective
 * denominator every downstream check divides by (`v1 + all amendments`,
 * F1 §7).
 *
 * @remarks
 * Tranche-1 scope: an empty amendment list returns v1 unchanged; a non-empty
 * list is a typed refusal, because accepting amendments before their
 * per-file identity proofs are checkable would let an unproven file into the
 * denominator.
 */
export function mergeDenominator(
  v1: Denominator,
  amendments: readonly DenominatorAmendment[],
): Result<Denominator, Error> {
  if (amendments.length > 0) {
    return err(
      new Error('denominator amendment merging is not yet supported (tranche 1 verifies v1 only)'),
    );
  }
  return ok(v1);
}

/** One RED finding from the verifier, as a typed value. */
export type FreezeViolation =
  | {
      readonly kind: 'hash-mismatch';
      readonly path: string;
      readonly expectedSha256: string;
      readonly actualSha256: string;
    }
  | { readonly kind: 'missing'; readonly path: string }
  | { readonly kind: 'unreadable'; readonly path: string; readonly detail: string }
  | { readonly kind: 'extra'; readonly path: string }
  | { readonly kind: 'recount-mismatch'; readonly path: string; readonly detail: string }
  | { readonly kind: 'totals-mismatch'; readonly detail: string };

/** Render one violation as an operator-readable line. */
export function formatViolation(violation: FreezeViolation): string {
  if (violation.kind === 'hash-mismatch') {
    return (
      `hash mismatch at ${violation.path}: denominator ${violation.expectedSha256}, ` +
      `frozen copy ${violation.actualSha256}`
    );
  }
  if (violation.kind === 'missing') {
    return `missing frozen file: ${violation.path}`;
  }
  if (violation.kind === 'unreadable') {
    return `unreadable frozen file ${violation.path}: ${violation.detail}`;
  }
  if (violation.kind === 'extra') {
    return `extra file under the frozen tree, absent from the denominator: ${violation.path}`;
  }
  if (violation.kind === 'recount-mismatch') {
    return `denominator row recount mismatch at ${violation.path}: ${violation.detail}`;
  }
  return `denominator totals disagree with its file list: ${violation.detail}`;
}
