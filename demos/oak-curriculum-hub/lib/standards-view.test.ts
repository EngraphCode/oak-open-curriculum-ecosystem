import { describe, it, expect } from 'vitest';

import { standardsFacets, browseStandards, getStandard } from './standards-view';

/**
 * Behaviour of the Standards data-view — the data-lane seam the (renderer-independent)
 * Standards browser page consumes. Counts are verified first-hand against
 * `lib/data/quality-standards.json` (685 items) and act as discriminating fixtures.
 */
describe('standardsFacets', () => {
  it('counts type facets across the corpus, excluding the empty value', () => {
    const byValue = new Map(standardsFacets().types.map((f) => [f.value, f.count]));
    expect(byValue.get('Required standard')).toBe(356);
    expect(byValue.get('Model Practice')).toBe(328);
    expect(standardsFacets().types.some((f) => f.value === '')).toBe(false);
  });

  it('counts multi-valued rubric facets across the corpus', () => {
    const byValue = new Map(standardsFacets().rubrics.map((f) => [f.value, f.count]));
    expect(byValue.get('Curriculum and Lesson Specification - Annex B')).toBe(167);
    expect(byValue.get('Technical Rubric')).toBe(93);
    expect(byValue.get('Pedagogical Rubric')).toBe(89);
  });

  it('exposes 23 area facets and only non-empty, positive-count subject facets', () => {
    const { areas, subjects } = standardsFacets();
    expect(areas).toHaveLength(23);
    expect(subjects.every((f) => f.value !== '' && f.count > 0)).toBe(true);
  });

  it('orders every facet by count descending', () => {
    const { types, rubrics, areas } = standardsFacets();
    for (const facets of [types, rubrics, areas]) {
      const counts = facets.map((f) => f.count);
      expect([...counts].sort((a, b) => b - a)).toEqual(counts);
    }
  });
});

describe('browseStandards', () => {
  it('returns the whole corpus for an omitted or empty filter', () => {
    expect(browseStandards()).toHaveLength(685);
    expect(browseStandards({})).toHaveLength(685);
  });

  it('filters by exact type', () => {
    const r = browseStandards({ type: 'Model Practice' });
    expect(r).toHaveLength(328);
    expect(r.every((s) => s.type === 'Model Practice')).toBe(true);
  });

  it('filters by rubric membership', () => {
    const r = browseStandards({ rubric: 'Technical Rubric' });
    expect(r).toHaveLength(93);
    expect(r.every((s) => s.rubrics.includes('Technical Rubric'))).toBe(true);
  });

  it('ANDs facet dimensions together', () => {
    const both = browseStandards({ type: 'Required standard', rubric: 'Pedagogical Rubric' });
    expect(
      both.every((s) => s.type === 'Required standard' && s.rubrics.includes('Pedagogical Rubric')),
    ).toBe(true);
    expect(both.length).toBeLessThanOrEqual(browseStandards({ type: 'Required standard' }).length);
  });

  it('matches free text across text/subject/areas/components/rubrics', () => {
    const r = browseStandards({ text: 'tone' });
    expect(r.length).toBeGreaterThan(0);
    expect(r.some((s) => s.id === 'QS-68')).toBe(true);
  });
});

describe('getStandard', () => {
  it('resolves a known id (for #qs=<id> deep-links)', () => {
    expect(getStandard('QS-68')?.text.toLowerCase()).toContain('tone');
  });

  it('returns undefined for an unknown id', () => {
    expect(getStandard('QS-DOES-NOT-EXIST')).toBeUndefined();
  });
});
