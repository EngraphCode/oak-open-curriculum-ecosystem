import { describe, expect, it } from 'vitest';

import { parseColour, ringChainContrast } from './focus-ring-contrast';
import type { Rgba } from './focus-ring-contrast';

const WHITE: Rgba = [255, 255, 255, 1];

describe('ringChainContrast: states that score zero', () => {
  it('scores none as zero', () => {
    expect(ringChainContrast('none', WHITE)).toBe(0);
  });

  it('scores the transparent two-layer base state as zero', () => {
    expect(
      ringChainContrast(
        'rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px',
        WHITE,
      ),
    ).toBe(0);
  });

  it('scores a geometry-less layer as zero', () => {
    expect(ringChainContrast('rgb(0, 0, 0) 0px 0px 0px 0px', WHITE)).toBe(0);
  });

  it('scores an inset-only shadow as zero — it never reaches the ring boundary', () => {
    expect(ringChainContrast('rgb(0, 0, 0) 0px 0px 0px 4px inset', WHITE)).toBe(0);
  });
});

describe('ringChainContrast: measured verdicts', () => {
  it('reports the hand-measured 1.12:1 halo as failing', () => {
    const ratio = ringChainContrast('rgb(242, 242, 242) 0px 0px 0px 5px', WHITE);
    expect(ratio).toBeGreaterThan(1.11);
    expect(ratio).toBeLessThan(1.13);
  });

  it('passes the kit double ring through the halo pair on a light band', () => {
    // Inner lemon 2px + grey halo 5px on near-white: the surface↔halo pair
    // carries the criterion even though the lemon layer alone would fail.
    const shadow = 'rgb(255, 229, 85) 0px 0px 0px 2px, rgb(87, 87, 87) 0px 0px 0px 5px';
    expect(ringChainContrast(shadow, [249, 249, 249, 1])).toBeGreaterThanOrEqual(3);
  });

  it('passes the high-contrast ring through the inner pair, per the criterion', () => {
    // Lemon halo on white measures ~1.27 at the surface boundary, but the
    // black↔lemon pair inside the indicator provides the contrast — WCAG
    // 1.4.11: "either part of the indicator could provide contrast".
    const shadow = 'rgb(0, 0, 0) 0px 0px 0px 2px, rgb(255, 229, 85) 0px 0px 0px 5px';
    expect(ringChainContrast(shadow, WHITE)).toBeGreaterThanOrEqual(3);
  });

  it('fails a chain whose every ADJACENT pair is below the ratio', () => {
    // Monotone three-step ramp: white surface, light-grey halo, mid-grey
    // inner. Best-of-any-layer would multiply through the intermediate and
    // pass; the chain reads each boundary as rendered.
    const shadow = 'rgb(130, 130, 130) 0px 0px 0px 2px, rgb(200, 200, 200) 0px 0px 0px 5px';
    expect(ringChainContrast(shadow, WHITE)).toBeLessThan(3);
  });

  it('composites alpha over the surface — a 5% alpha ring scores as rendered', () => {
    expect(ringChainContrast('rgba(0, 0, 0, 0.05) 0px 0px 0px 5px', WHITE)).toBeLessThan(1.3);
  });

  it('splits layers at top-level commas only — colour-function commas stay inside', () => {
    const shadow = 'rgba(87, 87, 87, 1) 0px 0px 0px 5px, rgb(255, 229, 85) 0px 0px 0px 2px';
    expect(ringChainContrast(shadow, WHITE)).toBeGreaterThanOrEqual(3);
  });

  it('returns zero for a colour serialisation it cannot parse, failing closed', () => {
    expect(ringChainContrast('oklch(0.5 0.1 200) 0px 0px 0px 5px', WHITE)).toBe(0);
  });
});

describe('parseColour', () => {
  it('parses the Chromium computed serialisations', () => {
    expect(parseColour('rgb(255, 229, 85)')).toEqual([255, 229, 85, 1]);
    expect(parseColour('rgba(0, 0, 0, 0.5)')).toEqual([0, 0, 0, 0.5]);
    expect(parseColour('oklch(0.5 0.1 200)')).toBeNull();
  });
});
