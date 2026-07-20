/**
 * Contrast manifest validation — evaluates pairings against WCAG thresholds.
 *
 * @remarks
 * Composes the low-level WCAG computation functions from `contrast.ts` with
 * resolved token hex values to validate contrast pairings declared in a
 * human-authored manifest, at a caller-named threshold level (AA per
 * SC 1.4.3/1.4.11, or AAA per SC 1.4.6 — non-text has no AAA tier and
 * gates at 3:1 under both levels).
 *
 * @packageDocumentation
 */
import { type Result, err, ok } from '@oaknational/result';
import {
  checkNonTextContrast,
  checkWcagAA,
  checkWcagAAA,
  contrastRatio,
  hexToSrgb,
  srgbToRelativeLuminance,
} from './contrast.js';
import type {
  ContrastManifest,
  ContrastPair,
  ContrastReport,
  ContrastReportEntry,
  ContrastValidationError,
  PairContext,
  WcagLevel,
} from './contrast-types.js';

// ---------------------------------------------------------------------------
// Pairing evaluation helpers
// ---------------------------------------------------------------------------

/** WCAG threshold for a context at a level (text 4.5/7, large-text 3/4.5, non-text 3, informational 0). */
function requiredRatioForContext(context: PairContext, level: WcagLevel): number {
  if (context === 'informational') {
    return 0;
  }

  if (context === 'text') {
    return level === 'AAA' ? 7 : 4.5;
  }

  if (context === 'large-text') {
    return level === 'AAA' ? 4.5 : 3;
  }

  // Non-text contrast (SC 1.4.11) has no AAA tier.
  return 3;
}

/** Check whether a ratio passes its threshold at the given level. Informational entries always pass. */
function passesThreshold(ratio: number, context: PairContext, level: WcagLevel): boolean {
  if (context === 'informational') {
    return true;
  }

  if (context === 'text') {
    return level === 'AAA' ? checkWcagAAA(ratio, 'normal') : checkWcagAA(ratio, 'normal');
  }

  if (context === 'large-text') {
    return level === 'AAA' ? checkWcagAAA(ratio, 'large') : checkWcagAA(ratio, 'large');
  }

  return checkNonTextContrast(ratio);
}

/** Expand triadic entries in a manifest into flat pairwise checks. */
function expandManifestPairs(manifest: ContrastManifest): readonly ContrastPair[] {
  return [
    ...manifest.pairs,
    ...manifest.triads.flatMap((triad) => [
      { foreground: triad.foreground, background: triad.middle, context: triad.contexts.fgMid },
      { foreground: triad.middle, background: triad.background, context: triad.contexts.midBg },
      { foreground: triad.foreground, background: triad.background, context: triad.contexts.fgBg },
    ]),
  ];
}

/** Evaluate a single contrast pair against resolved hex values at a level. */
function evaluatePair(
  pair: ContrastPair,
  resolvedTokens: ReadonlyMap<string, string>,
  level: WcagLevel,
): Result<ContrastReportEntry, ContrastValidationError> {
  const fgHex = resolvedTokens.get(pair.foreground);
  const bgHex = resolvedTokens.get(pair.background);

  if (fgHex === undefined || bgHex === undefined) {
    return err({
      kind: 'unresolved_token',
      foreground: pair.foreground,
      background: pair.background,
    });
  }

  const fgLuminance = srgbToRelativeLuminance(hexToSrgb(fgHex));
  const bgLuminance = srgbToRelativeLuminance(hexToSrgb(bgHex));
  const ratio = contrastRatio(fgLuminance, bgLuminance);

  return ok({
    foreground: pair.foreground,
    background: pair.background,
    foregroundHex: fgHex,
    backgroundHex: bgHex,
    // Truncate, never round: the displayed ratio must not overstate the
    // gated value (the gate below uses the unrounded ratio).
    ratio: Math.floor(ratio * 100) / 100,
    requiredRatio: requiredRatioForContext(pair.context, level),
    context: pair.context,
    pass: passesThreshold(ratio, pair.context, level),
  });
}

// ---------------------------------------------------------------------------
// Top-level validator
// ---------------------------------------------------------------------------

/**
 * Validate all contrast pairings in a manifest against resolved token hex values.
 *
 * @remarks
 * Expands triads into their constituent pairs, computes WCAG contrast ratios
 * for each at the named threshold level, and returns a structured report
 * that records that level. Contrast failures are encoded as entries with
 * `pass: false`. Informational entries are always marked as passing. If a
 * manifest token path cannot be resolved to a hex value (a manifest
 * authoring error), returns an `Err` with the unresolved token details.
 *
 * @param resolvedTokens - Map from token dot-path to resolved hex colour
 * @param manifest - The contrast pairings manifest
 * @param theme - Theme identifier for the report (e.g. `"light"`, `"dark"`)
 * @param level - The WCAG threshold level to gate at (`'AA'` or `'AAA'`)
 * @returns Ok with the contrast report, or Err with the first unresolved token
 */
export function validateContrastPairings(
  resolvedTokens: ReadonlyMap<string, string>,
  manifest: ContrastManifest,
  theme: string,
  level: WcagLevel,
): Result<ContrastReport, ContrastValidationError> {
  const pairs = expandManifestPairs(manifest);
  const entries: ContrastReportEntry[] = [];

  for (const pair of pairs) {
    const result = evaluatePair(pair, resolvedTokens, level);

    if (!result.ok) {
      return result;
    }

    entries.push(result.value);
  }

  const passed = entries.filter((entry) => entry.pass).length;

  return ok({
    timestamp: new Date().toISOString(),
    theme,
    level,
    results: entries,
    summary: {
      total: entries.length,
      passed,
      failed: entries.length - passed,
    },
  });
}
