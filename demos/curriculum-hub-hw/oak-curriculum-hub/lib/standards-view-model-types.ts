/**
 * Types and public constants for the Oak Quality Standards browser view-model. Kept separate from
 * the builder logic (`standards-view-builders.ts`) and the public assembly
 * (`standards-view-model.ts`) so each module stays small and single-purpose.
 */

/** How a standard's `type` renders: a required standard, a model-practice exemplar, or neither. */
export type StandardTypeVariant = 'required' | 'model' | 'none';

/** A guidance-area entry in the filter rail: its value, display label, live count, and colour. */
export interface AreaRailItem {
  readonly value: string;
  readonly label: string;
  readonly count: number;
  readonly active: boolean;
  readonly colour: string;
}

/** A type/rubric filter chip: the underlying value, a display label, and whether it is selected. */
export interface FilterChip {
  readonly value: string;
  readonly label: string;
  readonly active: boolean;
}

/** A coloured guidance-area tag shown on a standard card or detail view. */
export interface AreaTag {
  readonly label: string;
  readonly colour: string;
}

/** A single quality-standard result card. */
export interface StandardCardVM {
  readonly id: string;
  readonly text: string;
  readonly code: string;
  readonly hasCode: boolean;
  readonly typeLabel: string;
  readonly typeVariant: StandardTypeVariant;
  readonly areaTags: readonly AreaTag[];
  readonly componentTags: readonly string[];
}

/** A related-standard link shown in the detail view (same guidance area). */
export interface RelatedStandard {
  readonly id: string;
  readonly text: string;
}

/** The detail/exemplification view-model for a single opened standard. */
export interface StandardDetailVM {
  readonly id: string;
  readonly text: string;
  readonly typeLabel: string;
  readonly typeVariant: StandardTypeVariant;
  readonly code: string;
  readonly hasCode: boolean;
  readonly areaTags: readonly AreaTag[];
  readonly components: readonly string[];
  readonly rubrics: readonly string[];
  readonly related: readonly RelatedStandard[];
}

/** The browser's interaction state; the view-model is a pure function of this. */
export interface StandardsBrowseState {
  readonly query: string;
  /** Selected guidance area, or {@link ALL}. */
  readonly area: string;
  /** Selected type, or {@link ALL}. */
  readonly type: string;
  /** Selected rubric, or {@link ALL}. */
  readonly rubric: string;
  /** Deep-link focus ids (`#qs=…`); non-empty means focus mode. */
  readonly focusIds: readonly string[] | null;
  /** The standard whose detail view is open, or `null`. */
  readonly openId: string | null;
  /** How many result cards to show before "show more". */
  readonly limit: number;
}

/** The fully-derived view the standards browser renders. */
export interface StandardsView {
  readonly rail: readonly AreaRailItem[];
  readonly typeChips: readonly FilterChip[];
  readonly rubricChips: readonly FilterChip[];
  readonly results: readonly StandardCardVM[];
  readonly totalMatched: number;
  readonly hasMore: boolean;
  readonly nextStep: number;
  readonly showAllCount: number;
  readonly resultLabel: string;
  readonly focusMode: boolean;
  readonly hasFilters: boolean;
  readonly noResults: boolean;
  readonly detail: StandardDetailVM | null;
}

/** Sentinel value meaning "this facet does not constrain the query". */
export const ALL = 'all';

/** Default number of cards shown before the "show more" control. */
export const DEFAULT_LIMIT = 100;
