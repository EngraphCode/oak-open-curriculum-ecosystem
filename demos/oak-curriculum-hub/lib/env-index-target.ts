import { err, ok, type Result } from '@oaknational/result';

/** The closed set of search index targets the SDK accepts. */
export type SearchIndexTarget = 'primary' | 'sandbox';

/**
 * Narrow the `SEARCH_INDEX_TARGET` env value to its closed set. Unset or empty
 * means the default (`primary`); anything else must name a member exactly — an
 * unknown value (a typo like `sandobx`) is a configuration error, because
 * falling back silently would search the wrong index while the operator
 * believes the sandbox is live. Pure and Result-typed (ADR-088); `lib/env.ts`
 * is the module-scope boundary that fails loud on the `err`.
 */
export function resolveIndexTarget(value: string | undefined): Result<SearchIndexTarget, string> {
  if (value === undefined || value === '') {
    return ok('primary');
  }
  if (value === 'primary' || value === 'sandbox') {
    return ok(value);
  }
  return err(
    `SEARCH_INDEX_TARGET must be "primary" or "sandbox" (or unset for primary); got "${value}".`,
  );
}
