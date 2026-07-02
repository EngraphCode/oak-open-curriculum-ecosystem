import { describe, expect, it } from 'vitest';

import { collectSectionIds, parseSectionFragment, resolveSectionDeepLink } from '@/components/course/section-deep-link';
import type { CourseNavTree } from '@/components/course/course-view-model';

const tree: CourseNavTree = {
  intro: { id: 'intro', title: 'Welcome', sections: [{ id: 'introMain', title: 'Overview' }] },
  units: [
    {
      id: 'u1',
      label: 'Unit 1',
      title: 'First unit',
      modules: [
        {
          id: 'u1m1',
          title: 'Module A',
          sections: [
            { id: 'u1m1s1', title: 'Section one' },
            { id: 'u1m1s2', title: 'Section two' },
          ],
        },
      ],
    },
  ],
};

describe('parseSectionFragment — the #section=<id> reader', () => {
  it('extracts the id from a section deep-link fragment', () => {
    expect(parseSectionFragment('#section=u1m1s1')).toBe('u1m1s1');
    expect(parseSectionFragment('#section=introMain')).toBe('introMain');
  });

  it('returns null for a module anchor, an empty id, or no fragment', () => {
    expect(parseSectionFragment('#u1m1')).toBeNull(); // native module anchor, not a section deep-link
    expect(parseSectionFragment('#section=')).toBeNull(); // no id
    expect(parseSectionFragment('#')).toBeNull();
    expect(parseSectionFragment('')).toBeNull();
  });
});

describe('collectSectionIds — the valid deep-link targets from the nav tree', () => {
  it('gathers every section id, intro first then each module in order', () => {
    expect(collectSectionIds(tree)).toEqual(['introMain', 'u1m1s1', 'u1m1s2']);
  });
});

describe('resolveSectionDeepLink — hash to focus-target element id', () => {
  const valid = new Set(collectSectionIds(tree));

  it('resolves a valid section deep-link to its `section-<id>` element id', () => {
    expect(resolveSectionDeepLink('#section=u1m1s1', valid)).toBe('section-u1m1s1');
    expect(resolveSectionDeepLink('#section=introMain', valid)).toBe('section-introMain');
  });

  it('returns null for an unknown id or a non-section fragment (focuses nothing)', () => {
    expect(resolveSectionDeepLink('#section=nope', valid)).toBeNull();
    expect(resolveSectionDeepLink('#u1m1', valid)).toBeNull();
    expect(resolveSectionDeepLink('', valid)).toBeNull();
  });
});
