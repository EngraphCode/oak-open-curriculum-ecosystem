/**
 * The data-motion axis priority for the JS-driven walk-through: an explicit
 * in-product choice wins in both directions; 'system' (or no runtime) defers
 * to the OS preference. The pure decision is tested directly — the review
 * finding this cures was the axis controlling CSS motion but not the
 * requestAnimationFrame animation.
 */
import { describe, expect, it } from 'vitest';

import { effectiveReducedMotion } from './LearningFramework';

describe('effectiveReducedMotion', () => {
  it("an explicit 'reduced' choice stills the animation even when the OS allows motion", () => {
    expect(effectiveReducedMotion(false, 'reduced')).toBe(true);
  });

  it("an explicit 'full' choice enables the animation even under OS reduced-motion", () => {
    expect(effectiveReducedMotion(true, 'full')).toBe(false);
  });

  it("'system' defers to the OS preference in both directions", () => {
    expect(effectiveReducedMotion(true, 'system')).toBe(true);
    expect(effectiveReducedMotion(false, 'system')).toBe(false);
  });

  it('no runtime (undefined motion) defers to the OS preference', () => {
    expect(effectiveReducedMotion(true, undefined)).toBe(true);
    expect(effectiveReducedMotion(false, undefined)).toBe(false);
  });
});
