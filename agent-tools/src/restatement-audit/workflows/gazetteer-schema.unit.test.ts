import { isErr, isOk } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { parseGazetteerFile } from './gazetteer-schema.js';

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
});
