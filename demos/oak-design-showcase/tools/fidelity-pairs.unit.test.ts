import { describe, expect, it } from 'vitest';

import { GLOBAL_PAIR_ID } from './fidelity-register';
import { FIDELITY_PAIRS, PairingMapSchema } from './fidelity-pairs';

describe('PairingMapSchema invariants', () => {
  const minimalPair = {
    id: 'picker-oak-fold',
    kind: 'page-abovefold',
    exportPng: 'demo-evidence/export-picker-oak-fold.png',
    livePng: 'demo-evidence/live-picker-oak-fold.png',
    liveRoute: '/identity-switchboard/specimen',
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

  it('declares six diff-eligible specimen pairs under target-state naming plus one reference-only chrome pair', () => {
    const diffable = FIDELITY_PAIRS.pairs.filter((pair) => pair.diffEligible).map((p) => p.id);
    const referenceOnly = FIDELITY_PAIRS.pairs
      .filter((pair) => !pair.diffEligible)
      .map((p) => p.id);

    expect(diffable.toSorted((a, b) => a.localeCompare(b))).toStrictEqual([
      'picker-emc2-fold',
      'picker-emc2-full',
      'picker-oak-fold',
      'picker-oak-full',
      'picker-pds-fold',
      'picker-pds-full',
    ]);
    expect(referenceOnly).toStrictEqual(['picker-chrome']);
  });

  it('derives every evidence basename from the pair id — the naming-ratchet-safe convention', () => {
    // Capture outputs are named by pair id (already target-state), never by
    // route: the live routes carry the pre-rename brand slug in their query,
    // and route-derived basenames would put that token into the tracked
    // register's evidence paths.
    for (const pair of FIDELITY_PAIRS.pairs) {
      expect(pair.exportPng).toBe(`demo-evidence/export-${pair.id}.png`);
      expect(pair.livePng).toBe(`demo-evidence/live-${pair.id}.png`);
    }
  });

  it('records the owner-rejected root route as exempt, with its reason', () => {
    expect(FIDELITY_PAIRS.exemptSurfaces.some((surface) => surface.route === '/')).toBe(true);
  });
});

describe('the reserved global register scope', () => {
  it('collides with no declared pair id', () => {
    expect(FIDELITY_PAIRS.pairs.some((pair) => pair.id === GLOBAL_PAIR_ID)).toBe(false);
  });
});
