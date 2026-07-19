/**
 * Shared strict DTCG leaf collection.
 *
 * @remarks
 * Consolidates the package's leaf-walk (previously re-implemented per
 * module) behind a fail-fast contract: a malformed node returns an `Err`
 * rather than being silently skipped, because a tolerant walker inside a
 * coverage or completeness validator masks exactly the defect the
 * validator exists to catch.
 *
 * @packageDocumentation
 */
import { type Result, err, ok } from '@oaknational/result';
import type { DtcgTokenLeaf, DtcgTokenTree } from './dtcg-types.js';

/** A collected token leaf with its path segments. */
export interface TokenLeafEntry {
  /** Path segments from the tree root to the leaf. */
  readonly path: readonly string[];
  /** The leaf node itself. */
  readonly leaf: DtcgTokenLeaf;
}

/** Error returned when a tree contains a node that is neither token nor group. */
export interface InvalidNodeError {
  /** Discriminant for error routing. */
  readonly kind: 'invalid_node';
  /** Dot-path of the malformed node. */
  readonly path: string;
}

function isLeaf(node: DtcgTokenLeaf | DtcgTokenTree): node is DtcgTokenLeaf {
  if (!('$value' in node)) {
    return false;
  }

  const valueType = typeof node.$value;

  return valueType === 'string' || valueType === 'number' || valueType === 'boolean';
}

function isTokenKey(node: DtcgTokenTree, key: string): boolean {
  return Object.hasOwn(node, key) && !key.startsWith('$');
}

function walk(
  node: DtcgTokenTree,
  pathSegments: readonly string[],
  entries: TokenLeafEntry[],
): InvalidNodeError | undefined {
  for (const key in node) {
    if (!isTokenKey(node, key)) {
      continue;
    }

    const child = node[key];
    const childPath = [...pathSegments, key];

    if (typeof child !== 'object' || child === null) {
      return { kind: 'invalid_node', path: childPath.join('.') };
    }

    if (isLeaf(child)) {
      entries.push({ path: childPath, leaf: child });
      continue;
    }

    if ('$value' in child) {
      // Has a `$value` that is not a token primitive — malformed, not a group.
      return { kind: 'invalid_node', path: childPath.join('.') };
    }

    const invalidDescendant = walk(child, childPath, entries);

    if (invalidDescendant) {
      return invalidDescendant;
    }
  }

  return undefined;
}

/**
 * Collect every token leaf in a DTCG tree, in tree order.
 *
 * @param tokenTree - A DTCG token tree
 * @returns Ok with the collected leaves, or Err naming the first node that
 *   is neither a token (`$value`) nor a group
 */
export function collectTokenLeaves(
  tokenTree: DtcgTokenTree,
): Result<readonly TokenLeafEntry[], InvalidNodeError> {
  const entries: TokenLeafEntry[] = [];
  const invalidNode = walk(tokenTree, [], entries);

  if (invalidNode) {
    return err(invalidNode);
  }

  return ok(entries);
}
