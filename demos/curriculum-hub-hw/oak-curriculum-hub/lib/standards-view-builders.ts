/**
 * Pure builder functions for the standards browser view-model. Each derives one facet of the
 * view (types in `standards-view-model-types.ts`) from the browse state and the data-lane seam
 * (`standards-view.ts`), side-effect-free and unit-testable via the `standards-view-model.ts` entry.
 */

import { areaColour, AREA_FALLBACK_COLOUR, AREA_ORDER, displayArea } from './standards-area-palette';
import { browseStandards, getStandard, type StandardsFilter } from './standards-view';
import { isQualityStandardType, qualityStandards, type QualityStandard } from './static-quality-standards';
import {
  ALL,
  type AreaRailItem,
  type AreaTag,
  type FilterChip,
  type RelatedStandard,
  type StandardCardVM,
  type StandardDetailVM,
  type StandardsBrowseState,
  type StandardTypeVariant,
} from './standards-view-model-types';

/** Maximum related standards surfaced in the detail view. */
const MAX_RELATED = 6;

/** Classify a standard's raw `type` value into its render variant. */
export function typeVariantOf(type: string): StandardTypeVariant {
  if (type === 'Required standard') {
    return 'required';
  }
  if (type === 'Model Practice') {
    return 'model';
  }
  return 'none';
}

/** The short type label shown on a card ("Required" / "Model" / "—"). */
function shortTypeLabel(variant: StandardTypeVariant): string {
  if (variant === 'required') {
    return 'Required';
  }
  if (variant === 'model') {
    return 'Model';
  }
  return '—';
}

/** The long type label shown in the detail view. */
function longTypeLabel(variant: StandardTypeVariant): string {
  if (variant === 'required') {
    return 'Required standard';
  }
  if (variant === 'model') {
    return 'Model practice';
  }
  return 'Standard';
}

/** Shorten a rubric name for chip display (drops the long spec prefix and "Rubric" suffix). */
function displayRubric(rubric: string): string {
  return rubric.replace('Curriculum and Lesson Specification - ', '').replace(' Rubric', '');
}

/**
 * Build the seam filter from the browse state, mapping {@link ALL} sentinels to "unconstrained".
 * `type` narrows through {@link isQualityStandardType} — the URL/UI→seam boundary guard — so the
 * `ALL` sentinel (and any off-set value) drops to unconstrained rather than producing a silent
 * empty result against the tightened `StandardsFilter.type` literal union.
 */
function toFilter(state: StandardsBrowseState): StandardsFilter {
  const text = state.query.trim();
  return {
    ...(text !== '' ? { text } : {}),
    ...(isQualityStandardType(state.type) ? { type: state.type } : {}),
    ...(state.rubric !== ALL ? { rubric: state.rubric } : {}),
    ...(state.area !== ALL ? { area: state.area } : {}),
  };
}

/** The area tags for a standard, in the standard's own area order. */
function areaTagsOf(standard: QualityStandard): readonly AreaTag[] {
  return standard.areas.map((area) => ({ label: displayArea(area), colour: areaColour(area) }));
}

/** Project a standard onto its result-card view-model. */
export function toCardVM(standard: QualityStandard): StandardCardVM {
  const variant = typeVariantOf(standard.type);
  return {
    id: standard.id,
    text: standard.text,
    code: standard.code,
    hasCode: standard.code !== '',
    typeLabel: shortTypeLabel(variant),
    typeVariant: variant,
    areaTags: areaTagsOf(standard),
    componentTags: standard.components,
  };
}

/**
 * The guidance-area rail. Counts respect the active type/rubric/text filters but NOT the area
 * itself, so selecting an area never zeroes the other areas' counts (canonical behaviour).
 */
export function buildRail(state: StandardsBrowseState): readonly AreaRailItem[] {
  const base = browseStandards(toFilter({ ...state, area: ALL }));
  const counts = new Map<string, number>();
  for (const standard of base) {
    for (const area of standard.areas) {
      counts.set(area, (counts.get(area) ?? 0) + 1);
    }
  }
  const areaItems = AREA_ORDER.map((area) => ({
    value: area,
    label: displayArea(area),
    count: counts.get(area) ?? 0,
    active: state.area === area,
    colour: areaColour(area),
  }));
  const allItem: AreaRailItem = {
    value: ALL,
    label: 'All standards',
    count: base.length,
    active: state.area === ALL,
    colour: AREA_FALLBACK_COLOUR,
  };
  return [allItem, ...areaItems];
}

/** The type filter chips (the closed type value set), with the active one marked. */
export function buildTypeChips(activeType: string): readonly FilterChip[] {
  const values: readonly FilterChip[] = [
    { value: 'Required standard', label: 'Required standard', active: activeType === 'Required standard' },
    { value: 'Model Practice', label: 'Model practice', active: activeType === 'Model Practice' },
  ];
  return [{ value: ALL, label: 'All', active: activeType === ALL }, ...values];
}

/** The rubric filter chips, derived from the corpus rubrics, with the active one marked. */
export function buildRubricChips(activeRubric: string): readonly FilterChip[] {
  const rubrics = [...new Set(qualityStandards.flatMap((s) => s.rubrics))].sort((a, b) =>
    a.localeCompare(b),
  );
  const chips = rubrics.map((rubric) => ({
    value: rubric,
    label: displayRubric(rubric),
    active: activeRubric === rubric,
  }));
  return [{ value: ALL, label: 'All', active: activeRubric === ALL }, ...chips];
}

/** Resolve the standards matching the current state (focus ids take precedence over facet filters). */
export function matchedStandards(state: StandardsBrowseState): readonly QualityStandard[] {
  if (state.focusIds !== null && state.focusIds.length > 0) {
    const resolved: QualityStandard[] = [];
    for (const id of state.focusIds) {
      const standard = getStandard(id);
      if (standard !== undefined) {
        resolved.push(standard);
      }
    }
    return resolved;
  }
  return browseStandards(toFilter(state));
}

/** The toolbar result label, reflecting focus mode and pagination. */
export function buildResultLabel(focusMode: boolean, shown: number, total: number): string {
  const plural = total === 1 ? 'standard' : 'standards';
  if (focusMode) {
    return `Linked from training · ${total} ${plural}`;
  }
  if (shown < total) {
    return `Showing ${shown} of ${total} standards`;
  }
  return `${total} ${plural}`;
}

/** Build the detail/exemplification view-model for the opened standard, if any. */
export function buildDetail(state: StandardsBrowseState): StandardDetailVM | null {
  if (state.openId === null) {
    return null;
  }
  const standard = getStandard(state.openId);
  if (standard === undefined) {
    return null;
  }
  const variant = typeVariantOf(standard.type);
  const related: RelatedStandard[] = qualityStandards
    .filter((s) => s.id !== standard.id && s.areas.some((a) => standard.areas.includes(a)))
    .slice(0, MAX_RELATED)
    .map((s) => ({ id: s.id, text: s.text }));
  return {
    id: standard.id,
    text: standard.text,
    typeLabel: longTypeLabel(variant),
    typeVariant: variant,
    code: standard.code,
    hasCode: standard.code !== '',
    areaTags: areaTagsOf(standard),
    components: standard.components,
    rubrics: standard.rubrics,
    related,
  };
}

/** Whether any facet or free-text filter is currently narrowing the corpus. */
export function anyFilterActive(state: StandardsBrowseState): boolean {
  return (
    state.area !== ALL || state.type !== ALL || state.rubric !== ALL || state.query.trim() !== ''
  );
}
