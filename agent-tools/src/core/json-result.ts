import { err, ok, type Result } from '@oaknational/result';

import { getJsonValue, type JsonObject } from './json.js';

/**
 * Result-returning twins of the `core/json.ts` field helpers (ADR-088,
 * `use-result-pattern`). The consolidated home for parse layers converting
 * from throw to `Result` — later conversions consume these instead of
 * forking per-module copies (`consolidate-at-second-consumer`). Error
 * message literals match the throwing originals exactly: consumers relay
 * them verbatim, so the two surfaces must never drift.
 */

/**
 * Require a non-empty string field on a JSON object, as an `Err` instead of
 * a throw. Message literal identical to `core/json.ts` `requireString`.
 */
export function requireStringResult(record: JsonObject, key: string): Result<string, Error> {
  const value = getJsonValue(record, key);
  if (typeof value !== 'string' || value.length === 0) {
    return err(new Error(`missing required string field: ${key}`));
  }

  return ok(value);
}

/**
 * Parse JSON text at a trust boundary, as an `Err` instead of a throw. The
 * label restores the surface context a raw position-only `SyntaxError`
 * lacks; the original error rides the `cause` chain. Message shape
 * identical to `core/json.ts` `parseJsonText`.
 */
export function parseJsonTextResult(text: string, label: string): Result<unknown, Error> {
  try {
    const value: unknown = JSON.parse(text);
    return ok(value);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return err(new Error(`${label} is not valid JSON: ${reason}`, { cause: error }));
  }
}
