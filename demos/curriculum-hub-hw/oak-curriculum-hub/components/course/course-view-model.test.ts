import { describe, expect, it } from 'vitest';

import { toCourseNavModules, toCourseNavTree } from '@/components/course/course-view-model';
import type { Course } from '@/lib/course/types';

/**
 * A small discriminating fixture: two units, one module each in unit 1 (2 sections) and unit 2
 * (1 section), plus the intro pseudo-module (1 section). It describes the transformation, not the
 * real course's counts, so the tests stay stable as the generated data changes.
 */
const fixture: Course = {
  units: [
    { id: 'u1', label: 'Unit 1', title: 'First unit' },
    { id: 'u2', label: 'Unit 2', title: 'Second unit' },
  ],
  intro: {
    id: 'intro',
    title: 'Welcome',
    color: '#ffffff',
    sections: [{ id: 'introMain', title: 'Overview', blocks: [{ t: 'text', paras: ['Hi'] }] }],
  },
  modules: [
    {
      id: 'u1m1',
      unit: 'u1',
      title: 'Module A',
      color: '#eeeeee',
      colorStrong: '#cccccc',
      outcomes: ['Outcome one'],
      sections: [
        { id: 'u1m1s1', title: 'Section one', blocks: [] },
        { id: 'u1m1s2', title: 'Section two', blocks: [] },
      ],
    },
    {
      id: 'u2m1',
      unit: 'u2',
      title: 'Module B',
      color: '#eeeeee',
      colorStrong: '#cccccc',
      outcomes: [],
      sections: [{ id: 'u2m1s1', title: 'Section three', blocks: [] }],
    },
  ],
};

describe('toCourseNavModules — the flat coursemap projection (id/title/sectionCount)', () => {
  it('projects the intro first, then every module, with its section count', () => {
    const modules = toCourseNavModules(fixture);
    expect(modules.map((m) => m.id)).toEqual(['intro', 'u1m1', 'u2m1']);
    expect(modules.map((m) => m.sectionCount)).toEqual([1, 2, 1]);
    expect(modules[1]?.title).toBe('Module A');
  });
});

describe('toCourseNavTree — the sidebar units → modules → sections tree', () => {
  it('groups each module under its unit', () => {
    const tree = toCourseNavTree(fixture);
    expect(tree.units.map((u) => u.id)).toEqual(['u1', 'u2']);
    const u1 = tree.units.find((u) => u.id === 'u1');
    expect(u1?.modules.map((m) => m.id)).toEqual(['u1m1']);
    expect(tree.units.find((u) => u.id === 'u2')?.modules.map((m) => m.id)).toEqual(['u2m1']);
  });

  it('preserves section ids in order (the /course#section=<id> deep-link contract)', () => {
    const tree = toCourseNavTree(fixture);
    const moduleA = tree.units.find((u) => u.id === 'u1')?.modules[0];
    expect(moduleA?.sections.map((s) => s.id)).toEqual(['u1m1s1', 'u1m1s2']);
    expect(moduleA?.sections[0]?.title).toBe('Section one');
  });

  it('places the intro pseudo-module first, with its sections', () => {
    const tree = toCourseNavTree(fixture);
    expect(tree.intro.id).toBe('intro');
    expect(tree.intro.sections.map((s) => s.id)).toEqual(['introMain']);
  });
});
