/**
 * Semantic dtcg↔CSS consistency comparison for the design system's export.
 *
 * @remarks
 * The design system ships two projections of one token source: the dtcg
 * JSON trees and the canonical CSS custom properties. This module proves
 * they agree by regeneration comparison — parse both surfaces, compare
 * token values — never a byte checksum (hashing pins bytes and proves no
 * behaviour). Extraction rules live in `consistency-css-comparand.ts`;
 * naming and value normalisation in `consistency-values.ts`. Build
 * contract: the Stage-A import verification report Part 2 §2.1 and the
 * plan's `pr2-consistency-check` work item.
 *
 * @packageDocumentation
 */
import { type Result, ok } from '@oaknational/result';
import type { DtcgTokenTree } from '@oaknational/design-tokens-core';
import { extractCssComparand, type CssParseError } from './consistency-css-comparand.js';
import {
  collectTokenLeaves,
  indexLightTokens,
  type TokenIndexError,
  type TokenLeafEntry,
} from './consistency-token-index.js';
import { dtcgPathToCssVariable } from './consistency-values.js';

export { dtcgPathToCssVariable } from './consistency-values.js';
export { extractCssComparand } from './consistency-css-comparand.js';

/** One token surface disagreement between the dtcg trees and the CSS. */
type ConsistencyMismatch =
  | {
      readonly kind: 'value_mismatch';
      readonly theme: 'light' | 'dark';
      readonly path: string;
      readonly variable: string;
      readonly dtcgValue: string;
      readonly cssValue: string;
    }
  | {
      readonly kind: 'missing_css_variable';
      readonly path: string;
      readonly variable: string;
    }
  | {
      readonly kind: 'unaccounted_css_variable';
      readonly variable: string;
    };

/** Failure surface of the consistency comparison itself. */
export type ConsistencyError = CssParseError | TokenIndexError;

/** Comparison outcome: every mismatch found, plus how much was compared. */
export interface ConsistencyReport {
  readonly comparedCount: number;
  readonly mismatches: readonly ConsistencyMismatch[];
}

/** Input surfaces for one consistency comparison. */
export interface ConsistencyInput {
  readonly css: string;
  readonly palette: DtcgTokenTree;
  readonly primitives: DtcgTokenTree;
  readonly component: DtcgTokenTree;
  readonly semanticLight: DtcgTokenTree;
  readonly semanticDark: DtcgTokenTree;
  /** CSS variables that deliberately have no dtcg counterpart (non-token plumbing). */
  readonly nonTokenAllowlist: readonly string[];
}

interface ThemeComparison {
  readonly compared: number;
  readonly mismatches: readonly ConsistencyMismatch[];
}

function compareTheme(
  pairs: Iterable<readonly [string, TokenLeafEntry]>,
  cssValues: ReadonlyMap<string, string>,
  theme: 'light' | 'dark',
): ThemeComparison {
  const mismatches: ConsistencyMismatch[] = [];
  let compared = 0;

  for (const [variable, leaf] of pairs) {
    const cssValue = cssValues.get(variable);

    if (cssValue === undefined) {
      mismatches.push({ kind: 'missing_css_variable', path: leaf.path, variable });
      continue;
    }

    compared += 1;

    if (cssValue !== leaf.value) {
      mismatches.push({
        kind: 'value_mismatch',
        theme,
        path: leaf.path,
        variable,
        dtcgValue: leaf.value,
        cssValue,
      });
    }
  }

  return { compared, mismatches };
}

/**
 * Compare the dark theme against the FULL light index overlaid with the
 * semantic dark leaves: the CSS comparand carries a dark arm for every
 * variable (light-dark() split, or the light value copied), so every arm
 * must be validated — a token absent from semanticDark is expected to keep
 * its light value in the dark theme, and a drifted dark arm on it is real
 * drift, not out-of-scope. A variable absent from the CSS altogether is ONE
 * fact, reported by the light pass; the dark pass keeps only value
 * mismatches and genuinely dark-only absences (present in light, missing a
 * dark arm — impossible by construction today, but honest if extraction
 * ever changes).
 */
function compareDarkTheme(
  lightIndex: ReadonlyMap<string, TokenLeafEntry>,
  darkLeaves: readonly TokenLeafEntry[],
  comparand: {
    readonly light: ReadonlyMap<string, string>;
    readonly dark: ReadonlyMap<string, string>;
  },
): ThemeComparison {
  const darkIndex = new Map(lightIndex);

  for (const leaf of darkLeaves) {
    darkIndex.set(dtcgPathToCssVariable(leaf.path), leaf);
  }

  const raw = compareTheme(darkIndex, comparand.dark, 'dark');

  return {
    compared: raw.compared,
    mismatches: raw.mismatches.filter(
      (mismatch) =>
        mismatch.kind !== 'missing_css_variable' || comparand.light.has(mismatch.variable),
    ),
  };
}

function findUnaccountedVariables(
  cssLight: ReadonlyMap<string, string>,
  cssDark: ReadonlyMap<string, string>,
  lightIndex: ReadonlyMap<string, TokenLeafEntry>,
  nonTokenAllowlist: readonly string[],
): readonly ConsistencyMismatch[] {
  const allowlist = new Set(nonTokenAllowlist);
  const unaccounted: ConsistencyMismatch[] = [];
  // Union of both maps: a dark-block-only variable never appears in the
  // light map, and the overlay invariant means every dtcg dark token has a
  // light-index entry — so the light index is the right reference for both.
  const variables = new Set([...cssLight.keys(), ...cssDark.keys()]);

  for (const variable of variables) {
    if (!lightIndex.has(variable) && !allowlist.has(variable)) {
      unaccounted.push({ kind: 'unaccounted_css_variable', variable });
    }
  }

  return unaccounted;
}

/**
 * Compare the dtcg trees against the CSS comparand and report every
 * disagreement: value mismatches per theme, dtcg tokens with no CSS
 * counterpart, and CSS variables with neither a dtcg counterpart nor a
 * declared non-token allowlist entry.
 */
export function compareDesignSystemConsistency(
  input: ConsistencyInput,
): Result<ConsistencyReport, ConsistencyError> {
  const comparand = extractCssComparand(input.css);

  if (!comparand.ok) {
    return comparand;
  }

  const lightIndex = indexLightTokens([
    input.palette,
    input.primitives,
    input.component,
    input.semanticLight,
  ]);

  if (!lightIndex.ok) {
    return lightIndex;
  }

  const darkLeaves = collectTokenLeaves(input.semanticDark);

  if (!darkLeaves.ok) {
    return darkLeaves;
  }

  const lightComparison = compareTheme(lightIndex.value, comparand.value.light, 'light');
  const darkComparison = compareDarkTheme(lightIndex.value, darkLeaves.value, comparand.value);
  const unaccounted = findUnaccountedVariables(
    comparand.value.light,
    comparand.value.dark,
    lightIndex.value,
    input.nonTokenAllowlist,
  );

  return ok({
    comparedCount: lightComparison.compared + darkComparison.compared,
    mismatches: [...lightComparison.mismatches, ...darkComparison.mismatches, ...unaccounted],
  });
}
