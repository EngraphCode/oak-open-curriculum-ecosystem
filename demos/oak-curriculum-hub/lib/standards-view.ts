/**
 * Standards browser data-view — the data-lane seam consumed by the (renderer-independent)
 * Oak Standards parity page. Where `searchQualityStandards` (in `static-quality-standards.ts`)
 * powers the hero-driven hub search (idle-empty), this module powers the full catalogue browser:
 * a whole-corpus listing, conjunctive facet filtering (type / rubric / area / subject), live facet
 * counts for the filter rail, and by-id resolution for `#qs=<id>` deep-links.
 *
 * Pure functions over the vendored 685-item snapshot, schema-validated at load
 * (see `static-quality-standards.ts`) — no further guard needed past that boundary.
 */

import {
  qualityStandards,
  type QualityStandard,
  type QualityStandardType,
} from './static-quality-standards';

/** A facet value and how many standards carry it. */
interface StandardsFacet {
  readonly value: string;
  readonly count: number;
}

/** The filterable facet dimensions of the quality-standards catalogue, with live counts. */
export interface StandardsFacets {
  readonly types: readonly StandardsFacet[];
  readonly rubrics: readonly StandardsFacet[];
  readonly areas: readonly StandardsFacet[];
  readonly subjects: readonly StandardsFacet[];
}

/** A conjunctive filter over the catalogue; an omitted field does not constrain that dimension. */
export interface StandardsFilter {
  readonly text?: string;
  /** Constrained to the closed type set so a typo is a compile error, not a silent empty result. */
  readonly type?: QualityStandardType;
  readonly rubric?: string;
  readonly area?: string;
  readonly subject?: string;
}

/** Order a count map into facets: count descending, then value ascending. */
function toFacets(counts: ReadonlyMap<string, number>): StandardsFacet[] {
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

/** Tally a scalar field across the corpus, dropping the empty value. */
function facetScalar(values: readonly string[]): StandardsFacet[] {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (v !== '') {
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
  }
  return toFacets(counts);
}

/** Tally a multi-valued field across the corpus, dropping empty entries. */
function facetList(lists: readonly (readonly string[])[]): StandardsFacet[] {
  const counts = new Map<string, number>();
  for (const list of lists) {
    for (const v of list) {
      if (v !== '') {
        counts.set(v, (counts.get(v) ?? 0) + 1);
      }
    }
  }
  return toFacets(counts);
}

/** The facet dimensions and live counts for the standards browser filter rail. */
export function standardsFacets(): StandardsFacets {
  return {
    types: facetScalar(qualityStandards.map((s) => s.type)),
    rubrics: facetList(qualityStandards.map((s) => s.rubrics)),
    areas: facetList(qualityStandards.map((s) => s.areas)),
    subjects: facetScalar(qualityStandards.map((s) => s.subject)),
  };
}

/** Case-insensitive free-text match across text/subject/areas/components/rubrics. */
function matchesText(s: QualityStandard, q: string): boolean {
  return (
    s.text.toLowerCase().includes(q) ||
    s.subject.toLowerCase().includes(q) ||
    s.areas.some((a) => a.toLowerCase().includes(q)) ||
    s.components.some((c) => c.toLowerCase().includes(q)) ||
    s.rubrics.some((r) => r.toLowerCase().includes(q))
  );
}

/** Whether a standard satisfies every provided facet dimension (conjunctive; omitted = unconstrained). */
function matchesFacets(s: QualityStandard, filter: StandardsFilter): boolean {
  const checks: readonly boolean[] = [
    filter.type === undefined || s.type === filter.type,
    filter.subject === undefined || s.subject === filter.subject,
    filter.rubric === undefined || s.rubrics.includes(filter.rubric),
    filter.area === undefined || s.areas.includes(filter.area),
  ];
  return checks.every(Boolean);
}

/** Whether a standard satisfies the facet filter and the free-text query. */
function matchesFilter(s: QualityStandard, filter: StandardsFilter, q: string): boolean {
  return matchesFacets(s, filter) && (q === '' || matchesText(s, q));
}

/**
 * Browse the catalogue under a conjunctive filter. Unlike the hero search (idle-empty), an omitted
 * or empty filter returns the whole corpus; each provided dimension narrows the result via AND.
 *
 * @param filter - facet + free-text constraints; omitted fields do not constrain
 */
export function browseStandards(filter: StandardsFilter = {}): readonly QualityStandard[] {
  const q = filter.text?.trim().toLowerCase() ?? '';
  return qualityStandards.filter((s) => matchesFilter(s, filter, q));
}

/**
 * Resolve a single standard by its `QS-<n>` id — the target of a `#qs=<id>` deep-link from the
 * training course. Returns `undefined` when no standard carries the id (an explicit not-found the
 * caller renders as an empty state; not an error).
 *
 * @param id - the quality-standard id, e.g. `QS-68`
 */
export function getStandard(id: string): QualityStandard | undefined {
  return qualityStandards.find((s) => s.id === id);
}
