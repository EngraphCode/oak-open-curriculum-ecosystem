import { describe, expect, it } from 'vitest';

import { isRenderSuspect, isSuspect, resolveBase, resolveWidth } from './capture-checks';

const NO_ENV: NodeJS.ProcessEnv = { NODE_ENV: 'test' };

describe('resolveWidth', () => {
  it('defaults to the matched-geometry standard 1440', () => {
    const result = resolveWidth([], NO_ENV);

    expect(result.ok ? result.value : result.error).toBe(1440);
  });

  it('prefers the --width flag over the WIDTH env var', () => {
    const result = resolveWidth(['--width', '1280'], { NODE_ENV: 'test', WIDTH: '320' });

    expect(result.ok ? result.value : result.error).toBe(1280);
  });

  it('reads the WIDTH env var when no flag is passed', () => {
    const result = resolveWidth([], { NODE_ENV: 'test', WIDTH: '1920' });

    expect(result.ok ? result.value : result.error).toBe(1920);
  });

  it('rejects non-integer and out-of-range widths loudly', () => {
    for (const bad of ['abc', '319', '5001']) {
      const result = resolveWidth(['--width', bad], NO_ENV);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('invalid --width');
      }
    }
  });
});

describe('resolveBase', () => {
  it('defaults to the showcase dev port on localhost (never 127.0.0.1)', () => {
    expect(resolveBase([], NO_ENV)).toBe('http://localhost:3020');
  });

  it('prefers the --base flag over BASE_URL and strips trailing slashes', () => {
    expect(
      resolveBase(['--base', 'http://localhost:4000/'], { NODE_ENV: 'test', BASE_URL: 'http://x' }),
    ).toBe('http://localhost:4000');
  });

  it('reads BASE_URL when no flag is passed', () => {
    expect(resolveBase([], { NODE_ENV: 'test', BASE_URL: 'http://localhost:3021' })).toBe(
      'http://localhost:3021',
    );
  });
});

describe('isSuspect', () => {
  it('accepts a real page: HTTP 200 with body height and visible text above thresholds', () => {
    expect(isSuspect(200, 401, 201)).toBe(false);
  });

  it('flags a non-200 status, a short body, or near-empty text', () => {
    expect(isSuspect(404, 5000, 5000)).toBe(true);
    expect(isSuspect(200, 400, 5000)).toBe(true);
    expect(isSuspect(200, 5000, 200)).toBe(true);
  });
});

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
