import { describe, expect, it } from 'vitest';

import {
  isMapRunData,
  isMetaRunData,
  isReduceRunData,
  isValidateRunData,
  unseededRunDataError,
} from './stage-guards.js';

/**
 * The in-sandbox second line of defence: every seeded artefact re-checks its inlined run
 * data against the stage it was built FOR. Each guard must accept its own stage's minimal
 * valid shape, reject every other stage tag (a map artefact seeded with validate data is
 * unseeded, not almost-right), and reject structurally hollow data.
 */

const mapRunData = {
  windows: [{ window: 'W01', files: ['a.md'] }],
  gazetteer: { subjects: { gates: ['G1'] }, statusVocabulary: ['done'] },
};
const reduceRunData = { instances: [{ id: 'W01-I01' }] };
const validateRunData = {
  clusters: [{ id: 'c1' }],
  groundingInstances: [{ id: 'W01-I01' }],
  resolvedClusterIds: [],
  validateTokenCeiling: 500_000,
};
const metaRunData = { clusters: [{ id: 'c1' }], heldClusters: [] };

describe('isMapRunData', () => {
  it('accepts map-tagged data with windows and a gazetteer', () => {
    expect(isMapRunData(mapRunData, 'map')).toBe(true);
  });

  it('rejects the right shape under the wrong stage tag', () => {
    expect(isMapRunData(mapRunData, 'reduce')).toBe(false);
  });

  it('rejects an empty partition and a missing gazetteer', () => {
    expect(isMapRunData({ windows: [], gazetteer: mapRunData.gazetteer }, 'map')).toBe(false);
    expect(isMapRunData({ windows: mapRunData.windows }, 'map')).toBe(false);
  });
});

describe('isReduceRunData', () => {
  it('accepts reduce-tagged data with instances', () => {
    expect(isReduceRunData(reduceRunData, 'reduce')).toBe(true);
  });

  it('rejects the wrong stage tag and non-array instances', () => {
    expect(isReduceRunData(reduceRunData, 'map')).toBe(false);
    // Empty instances are a VALID clean-corpus seed — reduce yields zero clusters at
    // zero agent spend, never a false unseeded error.
    expect(isReduceRunData({ instances: [] }, 'reduce')).toBe(true);
    expect(isReduceRunData({ instances: 'nope' }, 'reduce')).toBe(false);
  });
});

describe('isValidateRunData', () => {
  it('accepts validate-tagged data with clusters, grounding, and an explicit ceiling', () => {
    expect(isValidateRunData(validateRunData, 'validate')).toBe(true);
  });

  it('rejects the wrong stage tag', () => {
    expect(isValidateRunData(validateRunData, 'meta')).toBe(false);
  });

  it('rejects a missing or non-positive ceiling', () => {
    const noCeiling = {
      clusters: validateRunData.clusters,
      groundingInstances: validateRunData.groundingInstances,
      resolvedClusterIds: validateRunData.resolvedClusterIds,
    };
    expect(isValidateRunData(noCeiling, 'validate')).toBe(false);
    expect(isValidateRunData({ ...validateRunData, validateTokenCeiling: 0 }, 'validate')).toBe(
      false,
    );
  });
});

describe('isMetaRunData', () => {
  it('accepts meta-tagged data with flagged and held cluster arrays', () => {
    expect(isMetaRunData(metaRunData, 'meta')).toBe(true);
  });

  it('rejects the wrong stage tag and non-array cluster sets', () => {
    expect(isMetaRunData(metaRunData, 'validate')).toBe(false);
    // Empty arrays are a VALID clean-audit seed — the workflow's zero-spend
    // empty-ledger short-circuit must be reachable, never a false unseeded error.
    expect(isMetaRunData({ clusters: [], heldClusters: [] }, 'meta')).toBe(true);
    expect(isMetaRunData({ clusters: 'nope', heldClusters: [] }, 'meta')).toBe(false);
  });

  it('rejects data missing the heldClusters array — held rows must be expressible', () => {
    expect(isMetaRunData({ clusters: [{ id: 'c1' }] }, 'meta')).toBe(false);
  });
});

describe('unseededRunDataError', () => {
  it('names the stage and the build-run-artefact cure', () => {
    const message = unseededRunDataError('map');
    expect(message).toContain('map');
    expect(message).toContain('build-run-artefact');
  });
});
