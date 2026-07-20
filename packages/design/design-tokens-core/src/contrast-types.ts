/**
 * Type definitions for WCAG contrast manifest, report, and colour models.
 *
 * @packageDocumentation
 */

/** Contexts a contrast pairing may declare, in declaration order. */
export const PAIR_CONTEXTS = ['text', 'non-text', 'large-text', 'informational'] as const;

/** Which WCAG criterion applies to a pairing, or `'informational'` (no gate). */
export type PairContext = (typeof PAIR_CONTEXTS)[number];

/** Contexts valid for a triad's foreground-on-middle pair (a gate always applies). */
export const FG_MID_CONTEXTS = ['text', 'non-text', 'large-text'] as const;

/** Which WCAG criterion applies to a triad's foreground-on-middle pair. */
export type FgMidContext = (typeof FG_MID_CONTEXTS)[number];

/**
 * The WCAG threshold level a validation run gates at.
 *
 * @remarks
 * A level names a threshold set (SC 1.4.3 at AA; SC 1.4.6 at AAA), not a
 * conformance claim — conformance is a page-level property across the full
 * criteria set, which a token-pair gate cannot prove. Non-text contrast
 * (SC 1.4.11) has no AAA tier and gates at 3:1 under both levels.
 */
export type WcagLevel = 'AA' | 'AAA';

/**
 * Normalised sRGB colour with channels in the 0–1 range.
 */
export interface SrgbColour {
  /** Red channel (0–1). */
  readonly r: number;
  /** Green channel (0–1). */
  readonly g: number;
  /** Blue channel (0–1). */
  readonly b: number;
}

/**
 * A pair of foreground and background tokens to check for contrast compliance.
 */
export interface ContrastPair {
  /** Token dot-path for the foreground colour (e.g. `"semantic.text-primary"`). */
  readonly foreground: string;
  /** Token dot-path for the background colour (e.g. `"semantic.surface-page"`). */
  readonly background: string;
  /**
   * Which WCAG criterion applies to this pairing, or `'informational'` to
   * compute the ratio without applying a pass/fail gate.
   */
  readonly context: PairContext;
}

/**
 * A triad of foreground, middle-ground, and background tokens.
 *
 * @remarks
 * Models layered UI elements (e.g. button text on button surface on page
 * surface) where all three pairwise ratios must pass their applicable
 * WCAG criterion independently.
 */
export interface ContrastTriad {
  /** Token dot-path for the innermost foreground (e.g. button text). */
  readonly foreground: string;
  /** Token dot-path for the middle surface (e.g. button background). */
  readonly middle: string;
  /** Token dot-path for the outermost background (e.g. page surface). */
  readonly background: string;
  /** Which WCAG criterion applies to each pair within the triad. */
  readonly contexts: {
    /** Foreground on middle (e.g. button text on button surface). */
    readonly fgMid: FgMidContext;
    /** Middle on background (e.g. button surface on page). */
    readonly midBg: 'non-text';
    /**
     * Foreground on background — informational when the middle layer is
     * opaque (e.g. button text vs page). Set to `'informational'` to
     * compute the ratio in the report without applying a WCAG gate.
     * Set to a context value to apply the gate (e.g. when the middle
     * layer is translucent).
     */
    readonly fgBg: PairContext;
  };
}

/**
 * Human-authored manifest declaring which token pairs to validate.
 */
export interface ContrastManifest {
  /** Simple foreground/background pairs. */
  readonly pairs: readonly ContrastPair[];
  /** Three-layer triads expanded into pairwise checks. */
  readonly triads: readonly ContrastTriad[];
}

/**
 * A single contrast check result within the report.
 */
export interface ContrastReportEntry {
  /** Token dot-path for the foreground colour. */
  readonly foreground: string;
  /** Token dot-path for the background colour. */
  readonly background: string;
  /** Resolved hex value of the foreground colour. */
  readonly foregroundHex: string;
  /** Resolved hex value of the background colour. */
  readonly backgroundHex: string;
  /**
   * Computed contrast ratio, truncated (not rounded) to two decimal places
   * so the displayed value never overstates the gated value. The gate
   * itself uses the unrounded ratio (a true 6.9995 fails a 7:1 threshold).
   */
  readonly ratio: number;
  /** The WCAG threshold that applies at the report's level (7, 4.5, 3, or 0 for informational). */
  readonly requiredRatio: number;
  /** Which WCAG criterion was applied, or `'informational'` if no gate. */
  readonly context: PairContext;
  /** Whether the pairing meets its threshold at the report's level. Always true for informational entries. */
  readonly pass: boolean;
}

/**
 * Error returned when a manifest token path cannot be resolved to a hex value.
 *
 * @remarks
 * Indicates a human authoring error in the contrast-pairings manifest:
 * a foreground or background token path was declared but does not exist
 * in the merged token tree.
 */
export interface ContrastValidationError {
  /** Discriminant for error routing. */
  readonly kind: 'unresolved_token';
  /** The foreground token dot-path from the manifest entry. */
  readonly foreground: string;
  /** The background token dot-path from the manifest entry. */
  readonly background: string;
}

/**
 * Machine-generated contrast validation report.
 */
export interface ContrastReport {
  /** ISO 8601 timestamp of report generation. */
  readonly timestamp: string;
  /** Theme identifier (e.g. `"light"`, `"dark"`). */
  readonly theme: string;
  /** The WCAG threshold level this report gated at (see {@link WcagLevel}). */
  readonly level: WcagLevel;
  /** Individual check results for every pairing. */
  readonly results: readonly ContrastReportEntry[];
  /** Aggregate pass/fail counts. */
  readonly summary: {
    readonly total: number;
    readonly passed: number;
    readonly failed: number;
  };
}
