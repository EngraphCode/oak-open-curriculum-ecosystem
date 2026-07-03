import { describe, expect, it } from 'vitest';

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
  it('covers pages, sections, and reference targets', () => {
    const kinds = new Set(FIDELITY_PAIRS.pairs.map((pair) => pair.kind));

    expect(kinds).toContain('page-abovefold');
    expect(kinds).toContain('page-fullpage');
    expect(kinds).toContain('section-element');
    expect(kinds).toContain('reference-only');
  });

  it('gives every section-element pair a sectionId embedded in its evidence names', () => {
    const sections = FIDELITY_PAIRS.pairs.filter((pair) => pair.kind === 'section-element');

    expect(sections.length).toBeGreaterThanOrEqual(9);
    for (const pair of sections) {
      expect(pair.sectionId).toBeDefined();
      expect(pair.liveRoute).toBe(`/course#section=${pair.sectionId ?? ''}`);
      expect(pair.exportPng).toContain(pair.id);
      expect(pair.livePng).toContain(pair.id);
    }
  });

  it('keeps reference-only pairs out of the diff set', () => {
    const references = FIDELITY_PAIRS.pairs.filter((pair) => pair.kind === 'reference-only');

    expect(references.length).toBeGreaterThanOrEqual(3);
    for (const pair of references) {
      expect(pair.diffEligible).toBe(false);
    }
  });

  it('records the surfaces with no export target instead of leaving them silent', () => {
    const routes = FIDELITY_PAIRS.exemptSurfaces.map((surface) => surface.route);

    expect(routes).toContain('/curriculum');
    expect(routes).toContain('/rubrics');
    for (const surface of FIDELITY_PAIRS.exemptSurfaces) {
      expect(surface.reason.length).toBeGreaterThan(0);
    }
  });
});
