/**
 * Pure schema-drift evaluation for {@link file://./ci-schema-drift-check.ts}.
 *
 * Side-effect-free (no fetch, no fs), so it is unit-testable in isolation — the
 * runner module executes its `main()` on import and cannot be imported by a test
 * without hitting the live upstream API.
 *
 * The comparison is **semantic**, not byte-for-byte: our committed cache is
 * written through `validateOpenApiDocument(live)` (one stringify pipeline) while
 * the drift check stringifies the raw fetched document (a different pipeline), so
 * the two are routinely byte-different yet semantically identical. A byte compare
 * cries wolf on every run; canonicalising both sides (recursively sorting object
 * keys, preserving array order) before comparing reports drift only when the
 * meaning differs.
 *
 * @packageDocumentation
 */

import { isJsonObject, type JsonObject } from '../collaboration-state/json.js';

/** Outcome of comparing the cached schema against the live upstream spec. */
export interface SchemaDriftResult {
  /** `true` when the two documents differ semantically. */
  readonly drifted: boolean;
}

/** Own enumerable string keys of a JSON object, sorted for a stable order. */
function sortedOwnKeys(value: JsonObject): string[] {
  const keys: string[] = [];
  for (const key in value) {
    if (Object.hasOwn(value, key)) {
      keys.push(key);
    }
  }
  return keys.sort((left, right) => left.localeCompare(right));
}

/**
 * Recursively sort object keys (arrays keep their order) so that two
 * semantically-equal JSON values serialise identically.
 */
function canonicalise(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalise(item));
  }
  if (isJsonObject(value)) {
    return Object.fromEntries(
      sortedOwnKeys(value).map((key): [string, unknown] => [key, canonicalise(value[key])]),
    );
  }
  return value;
}

/**
 * Canonical serialisation of a JSON document. Falls back to the trimmed raw
 * text when the input is not valid JSON, so two identical non-JSON inputs still
 * compare equal and a corrupt cache still reports as drift against valid live
 * JSON.
 */
function canonicalText(text: string): string {
  try {
    const parsed: unknown = JSON.parse(text);
    return JSON.stringify(canonicalise(parsed));
  } catch {
    return text.trimEnd();
  }
}

/**
 * Compare the committed schema cache against the live upstream spec, ignoring
 * key order and formatting but honouring array order and every value.
 */
export function evaluateSchemaDrift(cachedText: string, liveText: string): SchemaDriftResult {
  return { drifted: canonicalText(cachedText) !== canonicalText(liveText) };
}
