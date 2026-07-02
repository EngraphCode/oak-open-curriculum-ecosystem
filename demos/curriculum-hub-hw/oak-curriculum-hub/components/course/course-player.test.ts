import { describe, expect, it } from 'vitest';

import type { CourseNavTree } from '@/components/course/course-view-model';
import {
  parseSectionFragment,
  playerPosition,
  resolveActiveSection,
  toPlayerEntries,
} from '@/components/course/course-player';

/**
 * A discriminating tree: the intro (one section), unit u1 with a two-section module, unit u2 with a
 * one-section module. It describes the player's ordering and resolution rules, not the real course's
 * counts, so the tests stay stable as the generated data changes.
 */
const tree: CourseNavTree = {
  intro: {
    id: 'intro',
    title: 'Welcome & overview',
    color: '#fff2aa',
    sections: [{ id: 'introMain', title: 'Welcome' }],
  },
  units: [
    {
      id: 'u1',
      label: 'Unit 1',
      title: 'First unit',
      modules: [
        {
          id: 'u1m1',
          title: 'Module A',
          color: '#aabbcc',
          sections: [
            { id: 'u1m1s1', title: 'Section one' },
            { id: 'u1m1s2', title: 'Section two' },
          ],
        },
      ],
    },
    {
      id: 'u2',
      label: 'Unit 2',
      title: 'Second unit',
      modules: [
        { id: 'u2m1', title: 'Module B', color: '#ddeeff', sections: [{ id: 'u2m1s1', title: 'Section three' }] },
      ],
    },
  ],
};

const entries = toPlayerEntries(tree);

describe('toPlayerEntries — the ordered section sequence', () => {
  it('orders the intro sections first, then every module section in tree order', () => {
    expect(entries.map((entry) => entry.sectionId)).toEqual(['introMain', 'u1m1s1', 'u1m1s2', 'u2m1s1']);
  });

  it('pairs every section with the id of the module that owns it', () => {
    expect(entries.map((entry) => entry.moduleId)).toEqual(['intro', 'u1m1', 'u1m1', 'u2m1']);
  });
});

describe('parseSectionFragment — the #section=<id> contract fragment', () => {
  it('extracts the id from a #section=<id> hash', () => {
    expect(parseSectionFragment('#section=u1m1s1')).toBe('u1m1s1');
  });

  it('returns null for a hash that is not a section deep-link', () => {
    expect(parseSectionFragment('#u1m1')).toBeNull();
    expect(parseSectionFragment('#section=')).toBeNull();
    expect(parseSectionFragment('')).toBeNull();
  });
});

describe('resolveActiveSection — #section= deep-links', () => {
  it('resolves a #section=<id> hash naming a real section to that section', () => {
    expect(resolveActiveSection('#section=u1m1s2', entries)).toBe('u1m1s2');
  });

  it('resolves a #section=<id> hash naming an unknown section to null', () => {
    expect(resolveActiveSection('#section=missing', entries)).toBeNull();
  });
});

describe('resolveActiveSection — module anchors and non-targets', () => {
  it("resolves a #<moduleId> hash to that module's first section", () => {
    expect(resolveActiveSection('#u1m1', entries)).toBe('u1m1s1');
  });

  it('resolves the intro anchor to the first intro section', () => {
    expect(resolveActiveSection('#intro', entries)).toBe('introMain');
  });

  it('resolves an empty, bare, or unknown hash to null', () => {
    expect(resolveActiveSection('', entries)).toBeNull();
    expect(resolveActiveSection('#', entries)).toBeNull();
    expect(resolveActiveSection('#nowhere', entries)).toBeNull();
  });
});

describe('playerPosition — sequence neighbours', () => {
  it('reports the 0-based index, total, and both neighbours for a middle section', () => {
    expect(playerPosition('u1m1s1', entries)).toEqual({
      index: 1,
      total: 4,
      previousId: 'introMain',
      nextId: 'u1m1s2',
    });
  });

  it('reports no previous neighbour at the start of the sequence', () => {
    expect(playerPosition('introMain', entries)?.previousId).toBeNull();
  });

  it('reports no next neighbour at the end of the sequence', () => {
    expect(playerPosition('u2m1s1', entries)?.nextId).toBeNull();
  });

  it('reports null for a section id outside the sequence', () => {
    expect(playerPosition('missing', entries)).toBeNull();
  });
});
