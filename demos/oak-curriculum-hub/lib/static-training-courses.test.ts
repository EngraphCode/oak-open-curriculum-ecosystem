import { describe, it, expect } from 'vitest';

import { trainingCourses, searchTrainingCourses } from './static-training-courses';

/**
 * Behaviour of the training-course local index — the LOCAL-search half's training sections,
 * extracted from `Oak Hub.dc.html` `courseIndex()`. Counts/keywords are verified first-hand
 * against that source and act as discriminating fixtures.
 */
describe('trainingCourses', () => {
  it('carries all 21 canonical sections across 7 modules', () => {
    expect(trainingCourses).toHaveLength(21);
    expect(new Set(trainingCourses.map((c) => c.module)).size).toBe(7);
  });

  it('gives every section a course-section link and non-empty fields', () => {
    for (const c of trainingCourses) {
      expect(c.href).toBe(`/course#section=${c.id}`);
      expect(c.id && c.module && c.title && c.kw).toBeTruthy();
    }
  });
});

describe('searchTrainingCourses', () => {
  it('returns nothing for an empty query (idle-empty parity)', () => {
    expect(searchTrainingCourses('')).toEqual([]);
    expect(searchTrainingCourses('   ')).toEqual([]);
  });

  it('matches on title', () => {
    const r = searchTrainingCourses('feedback');
    expect(r.map((c) => c.id)).toContain('m4s4');
  });

  it('matches on module (all learning-framework sections)', () => {
    const r = searchTrainingCourses('learning framework');
    expect(r.length).toBeGreaterThanOrEqual(2);
    expect(r.every((c) => c.module === 'The learning framework')).toBe(true);
  });

  it('matches on keywords beyond title/module (kw widening)', () => {
    const r = searchTrainingCourses('expertise');
    expect(r).toHaveLength(1);
    expect(r[0]?.id).toBe('m3s2');
    // proves the hit came from `kw`, not the visible title/module
    expect(r[0]?.title.toLowerCase()).not.toContain('expertise');
  });

  it('caps results at the limit', () => {
    expect(searchTrainingCourses('e', 3)).toHaveLength(3);
  });
});
