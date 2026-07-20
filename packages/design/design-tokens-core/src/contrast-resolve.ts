/**
 * DTCG colour resolution to fixpoint for contrast validation.
 *
 * @remarks
 * Collects colour-candidate leaves via the shared fail-fast walker, then
 * resolves token references to a fixpoint: document order is immaterial,
 * because the bare dialect carries forward references by design (the real
 * light tree's `bg.selected` → `{color.accent-subtle}` precedes its
 * target's root group). References that never terminate in a literal —
 * dangling targets and cycles — are surfaced as data, never silently
 * dropped: the caller decides whether they are fatal. Non-hex literals
 * (rgb-alpha, expressions) are carried verbatim; `toHexComparand` owns
 * their exclusion from the WCAG comparand with one closed rule.
 *
 * @packageDocumentation
 */
import { type Result, ok } from '@oaknational/result';
import { byCodeUnit } from './code-unit-sort.js';
import { isColourCandidate, isHexColourLiteral } from './colour-classification.js';
import type { DtcgTokenTree } from './dtcg-types.js';
import { anchoredTokenReferencePattern } from './token-reference.js';
import { collectTokenLeaves, type InvalidNodeError, type TokenLeafEntry } from './token-walk.js';

const REFERENCE_PATTERN = anchoredTokenReferencePattern();

/** A colour reference that never reached a literal value. */
export interface UnresolvedColourReference {
  /** Token dot-path of the referencing leaf. */
  readonly path: string;
  /** The referenced dot-path that failed to resolve. */
  readonly reference: string;
}

/** Outcome of resolving a token tree's colour leaves. */
export interface ColourResolution {
  /** Dot-path → final literal string (hex, rgb-alpha, or expression). */
  readonly resolved: ReadonlyMap<string, string>;
  /** References that never reached a literal (dangling or cyclic), sorted by path. */
  readonly unresolvable: readonly UnresolvedColourReference[];
}

interface ColourSeed {
  /** Paths whose values are already literals. */
  readonly literals: Map<string, string>;
  /** Paths whose values reference another path. */
  readonly references: Map<string, string>;
}

/**
 * Partition colour-candidate leaves into literals and references.
 *
 * @remarks
 * A typed colour with a non-string `$value` seeds as `String(value)`: it
 * can never join the hex comparand, and carrying the string form keeps the
 * defect visible to the comparand filter and the count backstop instead of
 * vanishing in a silent skip.
 */
function seedColourLeaves(leaves: readonly TokenLeafEntry[]): ColourSeed {
  const literals = new Map<string, string>();
  const references = new Map<string, string>();

  for (const entry of leaves) {
    if (!isColourCandidate(entry.leaf)) {
      continue;
    }

    const path = entry.path.join('.');
    const value = entry.leaf.$value;

    if (typeof value !== 'string') {
      literals.set(path, String(value));
      continue;
    }

    const referenceMatch = REFERENCE_PATTERN.exec(value);

    if (referenceMatch) {
      references.set(path, referenceMatch[1]);
    } else {
      literals.set(path, value);
    }
  }

  return { literals, references };
}

/**
 * Resolve every colour token in a composed DTCG tree to its literal value.
 *
 * @param tokenTree - A composed token tree (all tiers the references span)
 * @returns Ok with the resolution outcome, or Err naming the first
 *   malformed node
 */
export function resolveColourTokens(
  tokenTree: DtcgTokenTree,
): Result<ColourResolution, InvalidNodeError> {
  const leaves = collectTokenLeaves(tokenTree);

  if (!leaves.ok) {
    return leaves;
  }

  const { literals: resolved, references: pending } = seedColourLeaves(leaves.value);
  let progressed = true;

  while (progressed && pending.size > 0) {
    progressed = false;

    for (const [path, target] of pending) {
      const literal = resolved.get(target);

      if (literal !== undefined) {
        resolved.set(path, literal);
        pending.delete(path);
        progressed = true;
      }
    }
  }

  const unresolvable = [...pending]
    .map(([path, reference]) => ({ path, reference }))
    .toSorted((first, second) => byCodeUnit(first.path, second.path));

  return ok({ resolved, unresolvable });
}

/**
 * Filter a colour resolution down to the WCAG hex comparand.
 *
 * @remarks
 * One closed rule: only six-digit hex literals survive. This excludes
 * rgb-alpha literals and their resolved copies, expression residues
 * (`color-mix()`), and any stringified non-string value in one place — a
 * manifest pairing that references a dropped path surfaces as the
 * existing `unresolved_token` error downstream.
 *
 * @param resolved - The `resolved` map from a {@link ColourResolution}
 * @returns The entries whose values are six-digit hex literals
 */
export function toHexComparand(resolved: ReadonlyMap<string, string>): ReadonlyMap<string, string> {
  const comparand = new Map<string, string>();

  for (const [path, value] of resolved) {
    if (isHexColourLiteral(value)) {
      comparand.set(path, value);
    }
  }

  return comparand;
}
