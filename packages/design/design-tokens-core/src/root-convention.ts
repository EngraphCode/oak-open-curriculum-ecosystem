/**
 * Root-group convention validation for imported DTCG trees.
 *
 * @remarks
 * ADR-213 §2 boundary condition: repo-imported trees root at the tier
 * segments the flattener understands (no `oak.` root group — the
 * flattener prefixes `--oak-` itself, and tier detection keys off the
 * root segment). This validator is the regression net for the Stage B
 * re-rooting: a wrong-rooted studio export fails here with a structured
 * `Err` instead of silently emitting `--oak-oak-*` variables.
 *
 * @packageDocumentation
 */
import { type Result, err, ok } from '@oaknational/result';
import { byCodeUnit } from './code-unit-sort.js';
import type { DtcgTokenTree } from './dtcg-types.js';

/** Error returned when a tree's root groups fall outside the allowed set. */
export interface DisallowedRootGroupsError {
  /** Discriminant for error routing. */
  readonly kind: 'disallowed_root_groups';
  /** Sorted root-group names outside the allowed set. */
  readonly disallowed: readonly string[];
}

/**
 * Validate that a tree's root groups are all within the allowed set.
 *
 * @param tokenTree - A DTCG token tree
 * @param allowedRoots - Root-group names the importing pipeline accepts
 * @returns Ok with the sorted root groups found, or Err listing the
 *   disallowed ones
 */
export function validateTreeRoots(
  tokenTree: DtcgTokenTree,
  allowedRoots: readonly string[],
): Result<readonly string[], DisallowedRootGroupsError> {
  const roots: string[] = [];
  const disallowed: string[] = [];

  for (const key in tokenTree) {
    if (!Object.hasOwn(tokenTree, key) || key.startsWith('$')) {
      continue;
    }

    roots.push(key);

    if (!allowedRoots.includes(key)) {
      disallowed.push(key);
    }
  }

  if (disallowed.length > 0) {
    return err({ kind: 'disallowed_root_groups', disallowed: disallowed.toSorted(byCodeUnit) });
  }

  return ok(roots.toSorted(byCodeUnit));
}
