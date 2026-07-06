/**
 * CLI input validation utilities.
 *
 * Validates string inputs from Commander options against the
 * schema-derived type guards from the Curriculum SDK, ensuring
 * type-safe values are passed to the Search SDK.
 */

import { InvalidArgumentError } from 'commander';
import { isSubject, isKeyStage, SUBJECTS, KEY_STAGES } from '@oaknational/curriculum-sdk';
import { isSearchScope, SEARCH_SCOPES } from '@oaknational/sdk-codegen/search';
import type { SearchSubjectSlug, SearchScope } from '@oaknational/sdk-codegen/search';
import type { KeyStage } from '@oaknational/curriculum-sdk';

/**
 * Validate an optional subject string against the schema-derived subject slugs.
 *
 * @param value - The subject string from CLI options, or undefined
 * @returns The validated SearchSubjectSlug, or undefined if input is undefined
 * @throws Error if the value is not a valid subject slug
 */
export function validateSubject(value: string | undefined): SearchSubjectSlug | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!isSubject(value)) {
    const valid = SUBJECTS.join(', ');
    throw new Error(`Invalid subject "${value}". Valid subjects: ${valid}`);
  }
  return value;
}

/**
 * Validate an optional key stage string against the schema-derived key stages.
 *
 * @param value - The key stage string from CLI options, or undefined
 * @returns The validated KeyStage, or undefined if input is undefined
 * @throws Error if the value is not a valid key stage
 */
export function validateKeyStage(value: string | undefined): KeyStage | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!isKeyStage(value)) {
    const valid = KEY_STAGES.join(', ');
    throw new Error(`Invalid key stage "${value}". Valid key stages: ${valid}`);
  }
  return value;
}

/**
 * Validate a scope string against the schema-derived search scopes.
 *
 * @param value - The scope string from CLI options
 * @returns The validated SearchScope
 * @throws Error if the value is not a valid search scope
 */
export function validateScope(value: string): SearchScope {
  if (!isSearchScope(value)) {
    const valid = SEARCH_SCOPES.join(', ');
    throw new Error(`Invalid scope "${value}". Valid scopes: ${valid}`);
  }
  return value;
}

/**
 * Parse a positive-integer CLI option value at the option boundary.
 *
 * Commander argParser for numeric options (`--size`, `--limit`): validates
 * that the raw string is a positive decimal integer and returns the parsed
 * number, so command handlers receive `number` and never re-parse.
 *
 * @param value - The raw option string from Commander
 * @returns The parsed positive integer
 * @throws InvalidArgumentError if the value is not a positive decimal integer
 *
 * @example
 * ```typescript
 * command.option('--size <n>', 'Maximum results to return', parsePositiveIntOption, 25);
 * ```
 */
export function parsePositiveIntOption(value: string): number {
  const parsed = /^\d+$/.test(value) ? Number.parseInt(value, 10) : Number.NaN;
  if (!(parsed >= 1)) {
    throw new InvalidArgumentError(`Expected a positive integer, got "${value}".`);
  }
  return parsed;
}
