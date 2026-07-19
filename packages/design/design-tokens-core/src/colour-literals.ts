/**
 * Closed colour-value grammar validation at the DTCG import boundary.
 *
 * @remarks
 * ADR-213 §2 boundary condition: expression colour values (`color-mix()`,
 * `calc()`) crash the contrast resolver and are rejected with a structured
 * `Err` before resolution. The admitted grammar is closed: a `#rrggbb`
 * literal, an `rgb(R G B / A)` alpha literal, or a full-string token
 * reference. Alpha literals are legal input but cannot yield a WCAG
 * contrast hex without compositing, so their paths are reported for
 * exclusion from the resolved hex map.
 *
 * @packageDocumentation
 */
import { type Result, err, ok } from '@oaknational/result';
import { byCodeUnit } from './code-unit-sort.js';
import type { DtcgTokenTree } from './dtcg-types.js';
import { anchoredTokenReferencePattern } from './token-reference.js';
import { collectTokenLeaves, type InvalidNodeError, type TokenLeafEntry } from './token-walk.js';

/** The only colour value form the contrast resolver can consume directly. */
const HEX_LITERAL_PATTERN = /^#[0-9a-f]{6}$/iu;

/** A single 0–255 integer rgb channel. */
const RGB_CHANNEL = String.raw`(?:25[0-5]|2[0-4]\d|1\d\d|\d{1,2})`;

/** A 0–1 alpha: `0`, `1`, `.5`, `0.2`, `1.0` — never above one. */
const RGB_ALPHA = String.raw`(?:0(?:\.\d+)?|1(?:\.0+)?|\.\d+)`;

/** Space-separated numeric rgb alpha literal, e.g. `rgb(92 92 92 / 0.2)`. */
const RGB_ALPHA_LITERAL_PATTERN = new RegExp(
  String.raw`^rgb\(${RGB_CHANNEL} ${RGB_CHANNEL} ${RGB_CHANNEL} / ${RGB_ALPHA}\)$`,
  'u',
);

const REFERENCE_PATTERN = anchoredTokenReferencePattern();

/** Audit evidence for a validated tree's colour values. */
export interface ColourLiteralAudit {
  /** Number of string-valued colour leaves checked. */
  readonly checkedCount: number;
  /** Sorted paths of rgb-alpha literals (exclude from the WCAG hex map). */
  readonly alphaLiteralPaths: readonly string[];
}

/** A colour token whose `$value` is outside the closed grammar. */
export interface NonLiteralColourOffender {
  /** Token dot-path (e.g. `"semantic.surface-page"`). */
  readonly path: string;
  /** The offending raw `$value`. */
  readonly value: string;
}

/** Error returned when colour tokens carry expression or malformed values. */
export interface NonLiteralColourError {
  /** Discriminant for error routing. */
  readonly kind: 'non_literal_colour_values';
  /** Every offending colour token, sorted by path. */
  readonly offenders: readonly NonLiteralColourOffender[];
}

/** Union of colour-literal failure shapes. */
export type ColourLiteralsError = InvalidNodeError | NonLiteralColourError;

interface ColourFindings {
  readonly checkedCount: number;
  readonly alphaLiteralPaths: readonly string[];
  readonly offenders: readonly NonLiteralColourOffender[];
}

/** Classify every string-valued colour leaf against the closed grammar. */
function auditColourLeaves(leaves: readonly TokenLeafEntry[]): ColourFindings {
  const offenders: NonLiteralColourOffender[] = [];
  const alphaLiteralPaths: string[] = [];
  let checkedCount = 0;

  for (const entry of leaves) {
    const value = entry.leaf.$value;

    if (entry.leaf.$type !== 'color' || typeof value !== 'string') {
      continue;
    }

    checkedCount += 1;

    const path = entry.path.join('.');

    if (HEX_LITERAL_PATTERN.test(value) || REFERENCE_PATTERN.test(value)) {
      continue;
    }

    if (RGB_ALPHA_LITERAL_PATTERN.test(value)) {
      alphaLiteralPaths.push(path);
    } else {
      offenders.push({ path, value });
    }
  }

  return { checkedCount, alphaLiteralPaths, offenders };
}

/**
 * Validate that every colour token `$value` is within the closed grammar.
 *
 * @remarks
 * The Ok value carries the checked-leaf count, so an unexpectedly empty
 * scan is visible to callers rather than indistinguishable from a green
 * validation. Non-string colour `$value`s are type-level malformation
 * owned by the design system's own export schema check, not this boundary.
 *
 * @param tokenTree - A DTCG token tree (any tier composition)
 * @returns Ok with the audit evidence, or Err listing every offender or
 *   naming the first malformed node
 */
export function validateColourLiterals(
  tokenTree: DtcgTokenTree,
): Result<ColourLiteralAudit, ColourLiteralsError> {
  const leaves = collectTokenLeaves(tokenTree);

  if (!leaves.ok) {
    return leaves;
  }

  const findings = auditColourLeaves(leaves.value);

  if (findings.offenders.length > 0) {
    const offenders = [...findings.offenders].sort((first, second) =>
      byCodeUnit(first.path, second.path),
    );

    return err({ kind: 'non_literal_colour_values', offenders });
  }

  return ok({
    checkedCount: findings.checkedCount,
    alphaLiteralPaths: [...findings.alphaLiteralPaths].sort(byCodeUnit),
  });
}
