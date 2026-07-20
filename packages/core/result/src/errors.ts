/**
 * Error-normalisation helper for the entry side of the Result world — the
 * counterpart to `unwrapping.ts`'s exits. A `catch` clause receives
 * `unknown`; translating that failure into an `Err` payload needs an
 * `Error` without losing an already-`Error` identity (message, stack,
 * `cause`). Centralised here so every catch-to-Result boundary shares one
 * narrowing instead of growing private copies.
 */

/**
 * Normalise an unknown caught failure to an `Error`, preserving an
 * already-`Error` identity.
 *
 * @param failure - The caught value (typed `unknown` in a catch clause)
 * @returns The failure itself when it is an `Error`; otherwise a new
 * `Error` whose message is the failure's string form
 *
 * @example
 * ```typescript
 * try {
 *   return ok(parse(text));
 * } catch (error) {
 *   return err(toError(error));
 * }
 * ```
 */
export function toError(failure: unknown): Error {
  return failure instanceof Error ? failure : new Error(String(failure));
}
