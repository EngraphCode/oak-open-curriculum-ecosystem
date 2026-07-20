/**
 * dtcg-side token walking and indexing for the consistency comparison.
 *
 * @remarks
 * Walks the dtcg trees into `(path, normalised value)` leaves using the
 * core token types, and indexes the light-side trees by their projected
 * CSS variable name with a collision check (the naming transforms are
 * verified collision-free; the check keeps that a fact, not a hope).
 *
 * @packageDocumentation
 */
import { type Result, err, ok } from '@oaknational/result';
import { collectTokenLeaves as collectStrictLeaves } from '@oaknational/design-tokens-core';
import type { DtcgTokenTree } from '@oaknational/design-tokens-core';
import {
  dtcgPathToCssVariable,
  normaliseDtcgReferences,
  normaliseValue,
} from './consistency-values.js';

/** Failure shapes the walker itself can produce. */
export type TokenIndexError =
  | { readonly kind: 'invalid_node'; readonly path: string }
  | {
      readonly kind: 'variable_collision';
      readonly variable: string;
      readonly paths: readonly string[];
    };

/** One walked dtcg leaf: dot-path plus its comparison-normalised value. */
export interface TokenLeafEntry {
  readonly path: string;
  readonly value: string;
}

/**
 * Walk one tree into comparison leaves via the core's strict walker —
 * hybrid leaf-with-children nodes and non-primitive `$value`s are
 * `invalid_node`, never silently coerced (consolidate-at-second-consumer:
 * the walker is owned once, in design-tokens-core).
 */
export function collectTokenLeaves(
  tree: DtcgTokenTree,
): Result<readonly TokenLeafEntry[], TokenIndexError> {
  const walked = collectStrictLeaves(tree);

  if (!walked.ok) {
    return walked;
  }

  return ok(
    walked.value.map((entry) => ({
      path: entry.path.join('.'),
      value:
        typeof entry.leaf.$value === 'string'
          ? normaliseValue(normaliseDtcgReferences(entry.leaf.$value))
          : String(entry.leaf.$value),
    })),
  );
}

export function indexLightTokens(
  trees: readonly DtcgTokenTree[],
): Result<ReadonlyMap<string, TokenLeafEntry>, TokenIndexError> {
  const index = new Map<string, TokenLeafEntry>();

  for (const tree of trees) {
    const leaves = collectTokenLeaves(tree);

    if (!leaves.ok) {
      return leaves;
    }

    for (const leaf of leaves.value) {
      const variable = dtcgPathToCssVariable(leaf.path);
      const existing = index.get(variable);

      // The base tiers are disjoint by design: any pre-existing variable —
      // including the same path defined twice — would let one value escape
      // comparison, so every duplicate is a collision.
      if (existing !== undefined) {
        return err({ kind: 'variable_collision', variable, paths: [existing.path, leaf.path] });
      }

      index.set(variable, leaf);
    }
  }

  return ok(index);
}
