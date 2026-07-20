/**
 * Theme-tree composition: declared base ⊕ sparse overlay.
 *
 * @remarks
 * ADR-213 §2 amendment obligation: contrast validation MUST compose the
 * declared base with each sparse overlay BEFORE resolution — a sparse
 * overlay resolved alone spuriously reports unresolved tokens. An overlay
 * leaf replaces the base node at its path wholesale (no member-wise
 * metadata merge, so stale base metadata cannot survive an override);
 * groups merge recursively; overlay `$`-metadata wins where present. Pure
 * — inputs are never mutated. Malformation is owned by the upstream
 * validators (`collectTokenLeaves` and friends), not re-policed here.
 *
 * @packageDocumentation
 */
import type { DtcgTokenLeaf, DtcgTokenTree } from './dtcg-types.js';

function isTokenObject(value: DtcgTokenTree[string]): value is DtcgTokenLeaf | DtcgTokenTree {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isLeaf(node: DtcgTokenLeaf | DtcgTokenTree): node is DtcgTokenLeaf {
  return '$value' in node;
}

function isGroup(value: DtcgTokenTree[string]): value is DtcgTokenTree {
  return isTokenObject(value) && !isLeaf(value);
}

/** Own entries in tree order, prototype-safe for JSON-derived keys. */
function ownEntries(tree: DtcgTokenTree): [string, DtcgTokenTree[string]][] {
  const entries: [string, DtcgTokenTree[string]][] = [];

  for (const key in tree) {
    if (Object.hasOwn(tree, key)) {
      entries.push([key, tree[key]]);
    }
  }

  return entries;
}

/**
 * Compose a sparse overlay theme tree onto its declared base.
 *
 * @param base - The complete base theme tree (the declared namespace)
 * @param overlay - A sparse override tree; every key SHOULD exist in the
 *   base (`validateThemeOverlayCoverage` enforces that upstream)
 * @returns A new tree: base keys carried, overlay leaves replacing,
 *   overlay groups merged recursively
 */
export function composeThemeTree(base: DtcgTokenTree, overlay: DtcgTokenTree): DtcgTokenTree {
  const composed = new Map<string, DtcgTokenTree[string]>(ownEntries(base));

  for (const [key, overlayChild] of ownEntries(overlay)) {
    const baseChild = composed.get(key);

    composed.set(
      key,
      isGroup(overlayChild) && isGroup(baseChild)
        ? composeThemeTree(baseChild, overlayChild)
        : overlayChild,
    );
  }

  return Object.fromEntries(composed);
}
