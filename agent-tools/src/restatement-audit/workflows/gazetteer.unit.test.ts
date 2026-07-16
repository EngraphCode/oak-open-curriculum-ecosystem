import { describe, expect, it } from 'vitest';

import { flattenGazetteerSubjects } from './gazetteer.js';
import type { Gazetteer } from './gazetteer.js';

describe('flattenGazetteerSubjects', () => {
  it('flattens every category into one deduplicated, ordered list', () => {
    const gazetteer: Gazetteer = {
      subjects: {
        gates: ['G1', 'G2'],
        tools: ['refound-tile'],
      },
      statusVocabulary: ['done'],
    };
    expect(flattenGazetteerSubjects(gazetteer)).toEqual(['G1', 'G2', 'refound-tile']);
  });

  it('deduplicates an id repeated across categories, keeping first occurrence order', () => {
    const gazetteer: Gazetteer = {
      subjects: {
        a: ['x', 'y'],
        b: ['y', 'z'],
      },
      statusVocabulary: [],
    };
    expect(flattenGazetteerSubjects(gazetteer)).toEqual(['x', 'y', 'z']);
  });

  it('returns an empty array for an empty gazetteer', () => {
    expect(flattenGazetteerSubjects({ subjects: {}, statusVocabulary: [] })).toEqual([]);
  });
});
