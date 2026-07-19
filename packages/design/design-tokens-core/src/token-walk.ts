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

  if (valueType !== 'string' && valueType !== 'number' && valueType !== 'boolean') {
    return false;
  }

  // A token carries only $-prefixed members; a hybrid leaf-with-children
  // node is malformed, not a token (it falls through to the invalid branch).
  for (const key in node) {
    if (Object.hasOwn(node, key) && !key.startsWith('$')) {
      return false;
    }
  }

  return true;
}

function isTokenObjectNode(child: DtcgTokenTree[string]): child is DtcgTokenLeaf | DtcgTokenTree {
  return typeof child === 'object' && child !== null && !Array.isArray(child);
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

    if (!isTokenObjectNode(child)) {
      return { kind: 'invalid_node', path: childPath.join('.') };
    }

    if (isLeaf(child)) {
      entries.push({ path: childPath, leaf: child });
      continue;
    }

    if ('$value' in child) {
      // Has `$value` but is not a well-formed token (non-primitive value or
      // hybrid leaf-with-children) — malformed, not a group.
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
  // The root must itself be a group: a non-array object without `$value`.
  // JSON-derived documents can violate this even though the type forbids it.
  if (!isTokenObjectNode(tokenTree) || '$value' in tokenTree) {
    return err({ kind: 'invalid_node', path: '' });
  }

  const entries: TokenLeafEntry[] = [];
  const invalidNode = walk(tokenTree, [], entries);

  if (invalidNode) {
    return err(invalidNode);
  }

  return ok(entries);
}
