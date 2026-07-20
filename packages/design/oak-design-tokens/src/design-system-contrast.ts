/**
 * Design-system dtcg contrast gate — the four-theme validator.
 *
 * @remarks
 * The second gate instance of the dual-gate window (ADR-213 §2 amendment,
 * 2026-07-20): validates the design system's dtcg export against its own
 * contrast manifest across all four themes, at the ratified levels
 * (high-contrast at AAA thresholds, the rest at the AA floor). This gate
 * is a validator-consumer only — no shipped artefact derives from the
 * dtcg trees until Stage B, which deletes the hand-authored trees, their
 * manifest, and their gate in the same atomic change.
 *
 * Pipeline per theme: compose declared base ⊕ sparse overlay BEFORE
 * resolution, resolve references to fixpoint, filter the comparand to
 * six-digit hex (one closed exclusion rule), assert the pinned comparand
 * count, then run the manifest. Every error names its source so a red
 * build during the window sends the engineer to the right tree.
 *
 * @packageDocumentation
 */
import {
  composeThemeTree,
  parseContrastManifest,
  resolveColourTokens,
  toHexComparand,
  validateContrastPairings,
  validateThemeOverlayCoverage,
  validateTreeRoots,
  type ContrastManifest,
  type ContrastReport,
  type DtcgTokenTree,
} from '@oaknational/design-tokens-core';
import { type Result, err, ok } from '@oaknational/result';
import contrastPairingsJson from '@oaknational/oak-design-system/dtcg/contrast-pairings.json';
import paletteTree from '@oaknational/oak-design-system/dtcg/palette.json';
import semanticColourSafe from '@oaknational/oak-design-system/dtcg/semantic.colour-safe.json';
import semanticDark from '@oaknational/oak-design-system/dtcg/semantic.dark.json';
import semanticHighContrast from '@oaknational/oak-design-system/dtcg/semantic.high-contrast.json';
import semanticLight from '@oaknational/oak-design-system/dtcg/semantic.light.json';
import {
  DESIGN_SYSTEM_THEMES,
  EXPECTED_COMPARAND_SIZE,
  PALETTE_ROOTS,
  SEMANTIC_ROOTS,
  THEME_GATE_LEVELS,
  type DesignSystemTheme,
} from './design-system-expectations.js';
import {
  DESIGN_SYSTEM_GATE_SOURCE as SOURCE,
  type DesignSystemGateError,
} from './design-system-gate-error.js';

const SEMANTIC_TREES: Readonly<Record<DesignSystemTheme, DtcgTokenTree>> = {
  light: semanticLight,
  dark: semanticDark,
  'high-contrast': semanticHighContrast,
  'colour-safe': semanticColourSafe,
};

const OVERLAY_TREES: Readonly<Record<string, DtcgTokenTree>> = {
  dark: semanticDark,
  'high-contrast': semanticHighContrast,
  'colour-safe': semanticColourSafe,
};

/** Validate roots and overlay coverage of the imported trees. */
function validateImportShape(): DesignSystemGateError | undefined {
  const paletteRoots = validateTreeRoots(paletteTree, PALETTE_ROOTS);

  if (!paletteRoots.ok) {
    return { source: SOURCE, stage: 'roots', tree: 'palette', error: paletteRoots.error };
  }

  for (const theme of DESIGN_SYSTEM_THEMES) {
    const themeRoots = validateTreeRoots(SEMANTIC_TREES[theme], SEMANTIC_ROOTS[theme]);

    if (!themeRoots.ok) {
      return { source: SOURCE, stage: 'roots', tree: `semantic.${theme}`, error: themeRoots.error };
    }
  }

  const coverage = validateThemeOverlayCoverage(semanticLight, OVERLAY_TREES);

  if (!coverage.ok) {
    return { source: SOURCE, stage: 'coverage', error: coverage.error };
  }

  return undefined;
}

/** Compose the full resolution tree for a theme: palette ∪ (base ⊕ overlay). */
function composedThemeTree(theme: DesignSystemTheme): DtcgTokenTree {
  const semantic =
    theme === 'light' ? semanticLight : composeThemeTree(semanticLight, SEMANTIC_TREES[theme]);

  return composeThemeTree(paletteTree, semantic);
}

/** Resolve, filter, count-check, and validate one theme's pairings. */
function buildThemeReport(
  theme: DesignSystemTheme,
  manifest: ContrastManifest,
): Result<ContrastReport, DesignSystemGateError> {
  const resolution = resolveColourTokens(composedThemeTree(theme));

  if (!resolution.ok) {
    return err({ source: SOURCE, stage: 'composition', theme, error: resolution.error });
  }

  if (resolution.value.unresolvable.length > 0) {
    return err({
      source: SOURCE,
      stage: 'resolution',
      theme,
      unresolvable: resolution.value.unresolvable,
    });
  }

  const comparand = toHexComparand(resolution.value.resolved);

  if (comparand.size !== EXPECTED_COMPARAND_SIZE) {
    return err({
      source: SOURCE,
      stage: 'comparand_count',
      theme,
      expected: EXPECTED_COMPARAND_SIZE,
      actual: comparand.size,
    });
  }

  const report = validateContrastPairings(comparand, manifest, theme, THEME_GATE_LEVELS[theme]);

  if (!report.ok) {
    return err({ source: SOURCE, stage: 'pairings', theme, error: report.error });
  }

  return ok(report.value);
}

/**
 * Build contrast reports for all four design-system themes.
 *
 * @returns Ok with one report per theme in declared order, or the first
 *   source-named gate error
 */
export function buildDesignSystemContrastReports(): Result<
  readonly ContrastReport[],
  DesignSystemGateError
> {
  const manifest = parseContrastManifest(contrastPairingsJson);

  if (!manifest.ok) {
    return err({ source: SOURCE, stage: 'manifest', error: manifest.error });
  }

  const shapeError = validateImportShape();

  if (shapeError) {
    return err(shapeError);
  }

  const reports: ContrastReport[] = [];

  for (const theme of DESIGN_SYSTEM_THEMES) {
    const report = buildThemeReport(theme, manifest.value);

    if (!report.ok) {
      return report;
    }

    reports.push(report.value);
  }

  return ok(reports);
}

export { formatDesignSystemGateError } from './design-system-gate-error.js';
export type { DesignSystemGateError } from './design-system-gate-error.js';
