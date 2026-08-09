import { describe, expect, it } from 'vitest';

import { isRenderSuspect } from './render-export-targets';

describe('isRenderSuspect', () => {
  it('accepts a healthy unframed page', () => {
    expect(
      isRenderSuspect({
        status: 200,
        bodyHeight: 5949,
        textLength: 3544,
        frameTextLength: undefined,
      }),
    ).toBe(false);
  });

  it('flags an unframed page that fails the generic blank thresholds', () => {
    expect(
      isRenderSuspect({ status: 200, bodyHeight: 120, textLength: 40, frameTextLength: undefined }),
    ).toBe(true);
    expect(
      isRenderSuspect({
        status: 404,
        bodyHeight: 5949,
        textLength: 3544,
        frameTextLength: undefined,
      }),
    ).toBe(true);
  });

  it('counts a healthy frame toward a thin parent — the picker chrome shape', () => {
    // The picker page's own text sits above the threshold only barely; its
    // iframe's specimen text carries the rest.
    expect(
      isRenderSuspect({ status: 200, bodyHeight: 1297, textLength: 190, frameTextLength: 3544 }),
    ).toBe(false);
  });

  it('flags a framed page whose frame is empty even when the parent is healthy', () => {
    // The wrong-target class the generic classifier cannot see: healthy
    // chrome around a specimen that never loaded.
    expect(
      isRenderSuspect({ status: 200, bodyHeight: 1297, textLength: 383, frameTextLength: 0 }),
    ).toBe(true);
  });
});
