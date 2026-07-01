import { describe, expect, it } from 'vitest';

import { polar, chevronPath, walkStageIndex } from '@/components/framework/framework-animation';

describe('polar', () => {
  it('maps an angle on a circle to a cartesian point (0deg = right, 90deg = down)', () => {
    const [x0, y0] = polar(100, 100, 50, 0);
    expect(x0).toBeCloseTo(150);
    expect(y0).toBeCloseTo(100);
    const [x90, y90] = polar(100, 100, 50, 90);
    expect(x90).toBeCloseTo(100);
    expect(y90).toBeCloseTo(150);
  });
});

describe('chevronPath', () => {
  it('produces a closed SVG path with two arcs (a chevron ring band)', () => {
    const d = chevronPath({
      cx: 100,
      cy: 100,
      innerR: 40,
      outerR: 80,
      startDeg: 0,
      endDeg: 40,
      pointDeg: 8,
    });
    expect(d.startsWith('M')).toBe(true);
    expect(d.trimEnd().endsWith('Z')).toBe(true);
    expect((d.match(/A/g) ?? []).length).toBe(2);
  });
});

describe('walkStageIndex', () => {
  it('advances one stage per interval and wraps back to the first', () => {
    expect(walkStageIndex(0, 1000, 7)).toBe(0);
    expect(walkStageIndex(1500, 1000, 7)).toBe(1);
    expect(walkStageIndex(6999, 1000, 7)).toBe(6);
    expect(walkStageIndex(7000, 1000, 7)).toBe(0);
  });

  it('is defensive against a non-positive interval or empty stage set', () => {
    expect(walkStageIndex(5000, 0, 7)).toBe(0);
    expect(walkStageIndex(5000, 1000, 0)).toBe(0);
  });
});
