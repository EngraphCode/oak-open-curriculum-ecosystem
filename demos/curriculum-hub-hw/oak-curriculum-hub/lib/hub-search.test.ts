import { describe, it, expect } from 'vitest';

import { searchHub } from './hub-search';

/**
 * The local half of the unified hub search: `searchHub` dispatches one hero query across both
 * bundled-content sources (training-course sections + quality standards) and returns the canonical
 * hit shapes the hub renders. The live-curriculum half is the separate `useCurriculumSearch` hook;
 * this is the "second search" over local export content (DoD §C, local half).
 */
describe('searchHub', () => {
  it('returns no hits for an empty query (parity with the idle live group)', () => {
    const { courseHits, stdHits } = searchHub('   ');
    expect(courseHits).toHaveLength(0);
    expect(stdHits).toHaveLength(0);
  });

  it('finds training-course sections and shapes them as course hits linking to the section', () => {
    const { courseHits } = searchHub('checks for understanding');
    expect(courseHits.length).toBeGreaterThan(0);
    for (const hit of courseHits) {
      expect(typeof hit.title).toBe('string');
      expect(typeof hit.module).toBe('string');
      expect(hit.href.startsWith('/course#section=')).toBe(true);
    }
  });

  it('finds quality standards and shapes them as standard hits with #qs= deep-links', () => {
    const { stdHits } = searchHub('tone');
    const hit = stdHits.find((s) => s.id === 'QS-68');
    expect(hit?.href).toBe('/standards#qs=QS-68');
    expect(hit?.text.toLowerCase()).toContain('tone');
    expect(typeof hit?.area).toBe('string');
  });

  it('caps each source independently at the given limit', () => {
    const { courseHits, stdHits } = searchHub('e', 3);
    expect(courseHits.length).toBeLessThanOrEqual(3);
    expect(stdHits.length).toBeLessThanOrEqual(3);
  });
});
