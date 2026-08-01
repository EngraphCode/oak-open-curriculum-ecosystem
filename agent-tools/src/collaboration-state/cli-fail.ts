import { err, unwrapOrThrow } from '@oaknational/result';

/**
 * Throw-only Result edge for CLI surfaces: the single-boundary translation
 * where a thrown teaching error IS the command contract (ADR-088; the
 * sanctioned shape under the no-throw lint). `never`-typed so a call outside
 * return position marks the following code unreachable.
 */
export function fail(message: string, options?: ErrorOptions): never {
  return unwrapOrThrow<never>(err(new Error(message, options)));
}
