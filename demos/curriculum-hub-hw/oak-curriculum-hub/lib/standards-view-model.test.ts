import { describe, expect, it } from 'vitest';

import {
  ALL,
  DEFAULT_LIMIT,
  buildStandardsView,
  initialBrowseState,
  parseFocusIds,
  type StandardsBrowseState,
} from '@/lib/standards-view-model';

/** The vendored corpus is a fixed 685-item snapshot; these are real, stable facts about it. */
const TOTAL = 685;
const REQUIRED_COUNT = 356;

function stateWith(overrides: Partial<StandardsBrowseState>): StandardsBrowseState {
  return { ...initialBrowseState(), ...overrides };
}

describe('buildStandardsView — default browse', () => {
  it('lists the whole corpus with no filters and no detail open', () => {
    const view = buildStandardsView(initialBrowseState());
    expect(view.totalMatched).toBe(TOTAL);
    expect(view.focusMode).toBe(false);
    expect(view.hasFilters).toBe(false);
    expect(view.noResults).toBe(false);
    expect(view.detail).toBeNull();
  });

  it('opens the rail with an "All standards" entry counting the whole corpus', () => {
    const view = buildStandardsView(initialBrowseState());
    const all = view.rail[0];
    expect(all?.value).toBe(ALL);
    expect(all?.label).toBe('All standards');
    expect(all?.count).toBe(TOTAL);
  });
});

describe('buildStandardsView — facet filtering', () => {
  it('narrows to a single type and marks every shown card as that type', () => {
    const view = buildStandardsView(stateWith({ type: 'Required standard' }));
    expect(view.totalMatched).toBe(REQUIRED_COUNT);
    expect(view.hasFilters).toBe(true);
    expect(view.results.every((card) => card.typeVariant === 'required')).toBe(true);
  });

  it('conjoins area and type filters (both must hold)', () => {
    const view = buildStandardsView(stateWith({ area: 'Explanation', type: 'Required standard' }));
    expect(view.totalMatched).toBeGreaterThan(0);
    expect(view.totalMatched).toBeLessThan(REQUIRED_COUNT);
    expect(
      view.results.every(
        (card) => card.typeVariant === 'required' && card.areaTags.some((t) => t.label === 'Explanation'),
      ),
    ).toBe(true);
  });

  it('narrows on free text', () => {
    const view = buildStandardsView(stateWith({ query: 'accessibility' }));
    expect(view.totalMatched).toBeGreaterThan(0);
    expect(view.totalMatched).toBeLessThan(TOTAL);
    expect(view.hasFilters).toBe(true);
  });

  it('keeps rail counts context-sensitive to the active type but not the area', () => {
    const view = buildStandardsView(stateWith({ type: 'Required standard' }));
    // "All standards" reflects the type filter; areas are still all listed (canonical behaviour).
    expect(view.rail[0]?.count).toBe(REQUIRED_COUNT);
    expect(view.rail.length).toBeGreaterThan(1);
  });
});

describe('buildStandardsView — pagination', () => {
  it('caps the default page and reports more remaining', () => {
    const view = buildStandardsView(initialBrowseState());
    expect(view.results.length).toBe(DEFAULT_LIMIT);
    expect(view.hasMore).toBe(true);
    expect(view.nextStep).toBe(DEFAULT_LIMIT);
    expect(view.showAllCount).toBe(TOTAL);
    expect(view.resultLabel).toBe(`Showing ${DEFAULT_LIMIT} of ${TOTAL} standards`);
  });

  it('shows the whole corpus and drops the more control when the limit covers it', () => {
    const view = buildStandardsView(stateWith({ limit: TOTAL }));
    expect(view.results.length).toBe(TOTAL);
    expect(view.hasMore).toBe(false);
    expect(view.resultLabel).toBe(`${TOTAL} standards`);
  });
});

describe('buildStandardsView — deep-link focus mode', () => {
  it('resolves focus ids in order and ignores the page limit', () => {
    const view = buildStandardsView(stateWith({ focusIds: ['QS-70', 'QS-68'], limit: 1 }));
    expect(view.focusMode).toBe(true);
    expect(view.results.map((card) => card.id)).toEqual(['QS-70', 'QS-68']);
    expect(view.resultLabel).toBe('Linked from training · 2 standards');
  });

  it('uses the singular label for a single focused standard', () => {
    const view = buildStandardsView(stateWith({ focusIds: ['QS-68'] }));
    expect(view.resultLabel).toBe('Linked from training · 1 standard');
  });

  it('drops unknown focus ids rather than erroring', () => {
    const view = buildStandardsView(stateWith({ focusIds: ['QS-68', 'QS-does-not-exist'] }));
    expect(view.results.map((card) => card.id)).toEqual(['QS-68']);
  });
});

describe('buildStandardsView — detail view', () => {
  it('builds the detail view-model for an opened standard', () => {
    const view = buildStandardsView(stateWith({ openId: 'QS-73' }));
    expect(view.detail?.id).toBe('QS-73');
    expect(view.detail?.hasCode).toBe(true);
    expect(view.detail?.code).toBe('PV4');
    expect(view.detail?.typeVariant).toBe('required');
  });

  it('surfaces related standards that share an area and exclude the standard itself', () => {
    const view = buildStandardsView(stateWith({ openId: 'QS-73' }));
    const related = view.detail?.related ?? [];
    expect(related.length).toBeGreaterThan(0);
    expect(related.length).toBeLessThanOrEqual(6);
    expect(related.every((r) => r.id !== 'QS-73')).toBe(true);
  });

  it('returns no detail for an unknown open id', () => {
    const view = buildStandardsView(stateWith({ openId: 'QS-nope' }));
    expect(view.detail).toBeNull();
  });
});

describe('buildStandardsView — filter chips', () => {
  it('offers the closed type set with the active chip marked', () => {
    const view = buildStandardsView(stateWith({ type: 'Model Practice' }));
    expect(view.typeChips.map((c) => c.value)).toEqual([ALL, 'Required standard', 'Model Practice']);
    expect(view.typeChips.find((c) => c.value === 'Model Practice')?.active).toBe(true);
    expect(view.typeChips.find((c) => c.value === ALL)?.active).toBe(false);
  });

  it('derives rubric chips from the corpus with shortened labels', () => {
    const view = buildStandardsView(initialBrowseState());
    const labels = view.rubricChips.map((c) => c.label);
    expect(labels).toContain('All');
    expect(labels).toContain('Pedagogical');
    expect(labels).toContain('Technical');
    expect(labels).toContain('Annex B');
  });
});

describe('parseFocusIds', () => {
  it('parses a comma list of qs ids', () => {
    expect(parseFocusIds('#qs=QS-1,QS-2')).toEqual(['QS-1', 'QS-2']);
  });

  it('tolerates a missing leading hash', () => {
    expect(parseFocusIds('qs=QS-3')).toEqual(['QS-3']);
  });

  it('returns null when the hash carries no qs= parameter', () => {
    expect(parseFocusIds('#area=Explanation')).toBeNull();
    expect(parseFocusIds('')).toBeNull();
    expect(parseFocusIds('#qs=')).toBeNull();
  });

  it('decodes percent-encoded hashes (an encoded comma still splits)', () => {
    expect(parseFocusIds('#qs=QS-1%2CQS-2')).toEqual(['QS-1', 'QS-2']);
  });

  it('never throws on malformed percent-encoding — the raw text is matched instead', () => {
    // location.hash is user-controlled; '#qs=%' would throw URIError through a bare
    // decodeURIComponent and crash the page. The undecodable id is harmless (matches
    // no standard -> the deep-link finds nothing).
    expect(parseFocusIds('#qs=%')).toEqual(['%']);
    expect(parseFocusIds('#qs=QS-1,%E0%A4%A')).toEqual(['QS-1', '%E0%A4%A']);
  });
});
