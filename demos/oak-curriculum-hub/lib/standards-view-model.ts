/**
 * Public entry point for the Oak Quality Standards browser view-model (`/standards`).
 *
 * This is the styling-lane composition layer over the data-lane seam (`standards-view.ts`): the
 * seam owns *what matches a filter* (pure corpus queries); this layer owns *what the browse UI
 * shows*. Keeping the derivation in a pure, DOM-free function (rather than in JSX) lets the React
 * component stay a thin, `no-throw` / low-complexity renderer, and lets the behaviour be
 * unit-tested directly. Types live in `standards-view-model-types.ts`; the per-facet builders
 * live in `standards-view-builders.ts`.
 */

import {
  anyFilterActive,
  buildDetail,
  buildRail,
  buildResultLabel,
  buildRubricChips,
  buildTypeChips,
  matchedStandards,
  toCardVM,
} from './standards-view-builders';
import { ALL, DEFAULT_LIMIT, type StandardsBrowseState, type StandardsView } from './standards-view-model-types';

export {
  ALL,
  DEFAULT_LIMIT,
  type AreaRailItem,
  type AreaTag,
  type FilterChip,
  type RelatedStandard,
  type StandardCardVM,
  type StandardDetailVM,
  type StandardsBrowseState,
  type StandardTypeVariant,
  type StandardsView,
} from './standards-view-model-types';

/**
 * Derive the complete standards-browser view from its interaction state. Pure: the same state
 * always yields the same view, so every branch is unit-testable without a DOM.
 *
 * @param state - the browser's current query / facet / focus / pagination state
 */
export function buildStandardsView(state: StandardsBrowseState): StandardsView {
  const focusMode = state.focusIds !== null && state.focusIds.length > 0;
  const matched = matchedStandards(state);
  const limit = focusMode ? matched.length : state.limit;
  const shown = matched.slice(0, limit);
  const remaining = matched.length - shown.length;
  return {
    rail: buildRail(state),
    typeChips: buildTypeChips(state.type),
    rubricChips: buildRubricChips(state.rubric),
    results: shown.map(toCardVM),
    totalMatched: matched.length,
    hasMore: remaining > 0,
    nextStep: Math.min(DEFAULT_LIMIT, remaining),
    showAllCount: matched.length,
    resultLabel: buildResultLabel(focusMode, shown.length, matched.length),
    focusMode,
    hasFilters: anyFilterActive(state),
    noResults: matched.length === 0,
    detail: buildDetail(state),
  };
}

/** The initial browse state (no filters, no focus, default page size). */
export function initialBrowseState(): StandardsBrowseState {
  return { query: '', area: ALL, type: ALL, rubric: ALL, focusIds: null, openId: null, limit: DEFAULT_LIMIT };
}

/**
 * Parse a `/standards` URL hash into deep-link focus ids. Supports `#qs=QS-1,QS-2` (the target of
 * the training-course quality-standard callouts). Returns `null` when the hash carries no `qs=`.
 *
 * @param hash - `location.hash`, with or without the leading `#`
 */
/**
 * Decode a hash, tolerating malformed percent-encoding: `location.hash` is
 * user-controlled and a bare `decodeURIComponent('#qs=%')` throws URIError —
 * the raw text is matched instead (an undecodable id matches no standard, so
 * the deep-link harmlessly finds nothing).
 */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseFocusIds(hash: string): readonly string[] | null {
  const match = /qs=([^&]+)/.exec(safeDecode(hash.replace(/^#/, '')));
  if (match === null) {
    return null;
  }
  const ids = (match[1] ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id !== '');
  return ids.length > 0 ? ids : null;
}
