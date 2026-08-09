import { describe, expect, it } from 'vitest';

import { isRenderSuspect } from './capture-checks';

/* resolveWidth/resolveBase/isSuspect behaviour is proven in
 * @oaknational/fidelity-review's capture-flags suite; this file owns the
 * showcase's frame-aware render classification. */

describe('isRenderSuspect', () => {
  it('accepts a healthy unframed page', () => {
    expect(
      isRenderSuspect(
        {
          status: 200,
          bodyHeight: 5949,
          textLength: 3544,
          frameTextLength: undefined,
        },
        false,
      ),
    ).toBe(false);
  });

  it('flags an unframed page that fails the generic blank thresholds', () => {
    expect(
      isRenderSuspect(
        { status: 200, bodyHeight: 120, textLength: 40, frameTextLength: undefined },
        false,
      ),
    ).toBe(true);
    expect(
      isRenderSuspect(
        { status: 404, bodyHeight: 5949, textLength: 3544, frameTextLength: undefined },
        false,
      ),
    ).toBe(true);
  });
});

describe('isRenderSuspect on framed pages', () => {
  it('counts a healthy frame toward a thin parent — the picker chrome shape', () => {
    // The picker page's own text sits above the threshold only barely; its
    // iframe's specimen text carries the rest.
    expect(
      isRenderSuspect(
        { status: 200, bodyHeight: 1297, textLength: 190, frameTextLength: 3544 },
        true,
      ),
    ).toBe(false);
  });

  it('flags a framed page whose frame is empty even when the parent is healthy', () => {
    // The wrong-target class the generic classifier cannot see: healthy
    // chrome around a specimen that never loaded.
    expect(
      isRenderSuspect({ status: 200, bodyHeight: 1297, textLength: 383, frameTextLength: 0 }, true),
    ).toBe(true);
  });

  it('flags a page expected to host a frame that renders none — healthy chrome around an unmounted specimen', () => {
    expect(
      isRenderSuspect(
        { status: 200, bodyHeight: 1297, textLength: 383, frameTextLength: undefined },
        true,
      ),
    ).toBe(true);
  });
});
