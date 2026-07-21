/**
 * Code-unit string comparison for reproducible evidence ordering.
 *
 * Evidence snapshots must order identically on every machine and locale, so
 * sorting compares UTF-16 code units — the same ordering as a compare-less
 * `Array.prototype.sort` — never `localeCompare` (see the
 * `sonarjs/no-alphabetical-sort` relaxation in `eslint.config.ts`).
 */
export function codeUnitCompare(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  return left > right ? 1 : 0;
}
