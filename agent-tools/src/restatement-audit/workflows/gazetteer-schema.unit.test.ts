import { isErr, isOk } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { gazetteerSchema, parseGazetteerFile } from './gazetteer-schema.js';

const file = {
  version: 'gazetteer.v1',
  referenceTree: 'origin/main @ SHA:abc',
  compiledBy: 'test',
  usage: 'test',
  subjects: { gates: ['G1'] },
  statusVocabulary: ['done'],
  knownCanonicalValues: { 'lane-seed.lanes': '7' },
};

describe('parseGazetteerFile', () => {
  it('accepts the pinned v1 envelope', () => {
    expect(isOk(parseGazetteerFile(file))).toBe(true);
  });

  it('rejects any other version string — a typo or future version fails loudly, never rides through', () => {
    expect(isErr(parseGazetteerFile({ ...file, version: 'gazetteer.v2' }))).toBe(true);
    expect(isErr(parseGazetteerFile({ ...file, version: 'gazeteer.v1' }))).toBe(true);
  });

  it('rejects a subject id containing ":" — the fact-key join delimiter ban binds gazetteer ids too', () => {
    expect(isErr(parseGazetteerFile({ ...file, subjects: { 'gates:G1': ['G1'] } }))).toBe(true);
  });
});

describe('gazetteerSchema (inlined projection)', () => {
  it('rejects a subject id containing ":" — a colliding id would corrupt every exact join built on it', () => {
    expect(
      gazetteerSchema.safeParse({ subjects: { 'a:b': ['x'] }, statusVocabulary: ['done'] }).success,
    ).toBe(false);
    expect(
      gazetteerSchema.safeParse({ subjects: { ab: ['x'] }, statusVocabulary: ['done'] }).success,
    ).toBe(true);
  });
});
