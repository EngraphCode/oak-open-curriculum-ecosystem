import { describe, expect, it } from 'vitest';

import { GLOBAL_PAIR_ID } from '@oaknational/fidelity-review/fidelity-register';

import { FIDELITY_PAIRS, PairingMapSchema } from './fidelity-pairs';

describe('PairingMapSchema invariants', () => {
  const minimalPair = {
    id: 'hub-home-fold',
    kind: 'page-abovefold',
    exportPng: 'demo-evidence/hub-canonical-render-abovefold.png',
    livePng: 'demo-evidence/home-live-abovefold.png',
    liveRoute: '/',
    diffEligible: true,
  };

  it('rejects duplicate pair ids', () => {
    const parsed = PairingMapSchema.safeParse({
      version: 1,
      pairs: [minimalPair, minimalPair],
      exemptSurfaces: [],
    });

    expect(parsed.success).toBe(false);
  });

  it('rejects a reference-only pair marked diff-eligible', () => {
    const parsed = PairingMapSchema.safeParse({
      version: 1,
      pairs: [{ ...minimalPair, kind: 'reference-only', diffEligible: true }],
      exemptSurfaces: [],
    });

    expect(parsed.success).toBe(false);
  });

  it('rejects a section-element pair without a sectionId', () => {
    const parsed = PairingMapSchema.safeParse({
      version: 1,
      pairs: [{ ...minimalPair, kind: 'section-element' }],
      exemptSurfaces: [],
    });

    expect(parsed.success).toBe(false);
  });
});

describe('the declared pairing map', () => {
  it('parses against its own schema at module load', () => {
    // The map's CONTENT is configuration — verified by reading it, not by
    // asserting it here (testing-strategy: tests prove behaviour). This
    // test pins only the load-time validation behaviour: a drifted map
    // fails the import, so consumers never see an unvalidated map.
    expect(FIDELITY_PAIRS.version).toBe(1);
    expect(FIDELITY_PAIRS.pairs.length).toBeGreaterThan(0);
  });
});

describe('the reserved global register scope', () => {
  it('collides with no declared pair id', () => {
    expect(FIDELITY_PAIRS.pairs.some((pair) => pair.id === GLOBAL_PAIR_ID)).toBe(false);
  });
});
