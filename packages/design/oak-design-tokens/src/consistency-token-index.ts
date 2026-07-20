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
import { typeSafeEntries } from '@oaknational/type-helpers';
import { type Result, err, ok } from '@oaknational/result';
import type { DtcgTokenLeaf, DtcgTokenTree } from '@oaknational/design-tokens-core';
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

function isLeafOrGroup(
  candidate: DtcgTokenLeaf | DtcgTokenTree | string | undefined,
): candidate is DtcgTokenLeaf | DtcgTokenTree {
  return typeof candidate === 'object' && candidate !== null;
}

function isLeaf(candidate: DtcgTokenLeaf | DtcgTokenTree): candidate is DtcgTokenLeaf {
  return '$value' in candidate;
}

export function collectTokenLeaves(
  tree: DtcgTokenTree,
  prefix: readonly string[],
): Result<readonly TokenLeafEntry[], TokenIndexError> {
  const leaves: TokenLeafEntry[] = [];

  for (const [key, child] of typeSafeEntries(tree)) {
    if (key.startsWith('$')) {
      continue;
    }

    const path = [...prefix, key];

    if (!isLeafOrGroup(child)) {
      return err({ kind: 'invalid_node', path: path.join('.') });
    }

    if (isLeaf(child)) {
      const value =
        typeof child.$value === 'string'
          ? normaliseValue(normaliseDtcgReferences(child.$value))
          : String(child.$value);
      leaves.push({ path: path.join('.'), value });
      continue;
    }

    const childLeaves = collectTokenLeaves(child, path);

    if (!childLeaves.ok) {
      return childLeaves;
    }

    leaves.push(...childLeaves.value);
  }

  return ok(leaves);
}

export function indexLightTokens(
  trees: readonly DtcgTokenTree[],
): Result<ReadonlyMap<string, TokenLeafEntry>, TokenIndexError> {
  const index = new Map<string, TokenLeafEntry>();

  for (const tree of trees) {
    const leaves = collectTokenLeaves(tree, []);

    if (!leaves.ok) {
      return leaves;
    }

    for (const leaf of leaves.value) {
      const variable = dtcgPathToCssVariable(leaf.path);
      const existing = index.get(variable);

      if (existing !== undefined && existing.path !== leaf.path) {
        return err({ kind: 'variable_collision', variable, paths: [existing.path, leaf.path] });
      }

      index.set(variable, leaf);
    }
  }

  return ok(index);
}
