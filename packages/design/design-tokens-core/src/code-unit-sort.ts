/**
 * Deterministic string ordering shared by the validation modules.
 *
 * @packageDocumentation
 */

/** Compare strings by code unit for deterministic, locale-independent order. */
export function byCodeUnit(first: string, second: string): number {
  if (first < second) {
    return -1;
  }

  return first > second ? 1 : 0;
}
