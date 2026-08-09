import { describe, expect, it } from 'vitest';

import { isSuspect, resolveBase, resolveWidth } from './capture-flags';

const ENV: NodeJS.ProcessEnv = { NODE_ENV: 'test' };
const DEFAULT_BASE = 'http://localhost:3010';

describe('resolveWidth', () => {
  it('defaults to the matched-geometry standard 1440', () => {
    const result = resolveWidth([], ENV);

    expect(result.ok ? result.value : result.error).toBe(1440);
  });

  it('prefers the --width flag over the WIDTH env var', () => {
    const result = resolveWidth(['--width', '1280'], { ...ENV, WIDTH: '900' });

    expect(result.ok ? result.value : result.error).toBe(1280);
  });

  it('reads the WIDTH env var when no flag is passed', () => {
    const result = resolveWidth([], { ...ENV, WIDTH: '900' });

    expect(result.ok ? result.value : result.error).toBe(900);
  });

  it('rejects non-integer, suffixed, fractional, and out-of-range widths loudly', () => {
    for (const raw of ['abc', '1440px', '1440.5', '100', '9000']) {
      const result = resolveWidth(['--width', raw], ENV);

      expect(result.ok).toBe(false);
    }
  });

  it('rejects a valueless --width flag instead of silently falling through', () => {
    // A user typing `--width` with no value must hear about it — a
    // silent fall-through to env/default hands them a width they did
    // not ask for.
    const result = resolveWidth(['--width'], { ...ENV, WIDTH: '1280' });

    expect(result.ok).toBe(false);
    expect(result.ok ? undefined : result.error.message).toContain('--width requires a value');
  });
});

describe('resolveBase', () => {
  it('answers the supplied default when nothing overrides it', () => {
    expect(resolveBase([], ENV, DEFAULT_BASE)).toBe('http://localhost:3010');
  });

  it('prefers the --base flag over BASE_URL and strips trailing slashes', () => {
    expect(
      resolveBase(
        ['--base', 'http://localhost:4000/'],
        { ...ENV, BASE_URL: 'http://x' },
        DEFAULT_BASE,
      ),
    ).toBe('http://localhost:4000');
  });

  it('reads BASE_URL when no flag is passed', () => {
    expect(resolveBase([], { ...ENV, BASE_URL: 'http://localhost:5000' }, DEFAULT_BASE)).toBe(
      'http://localhost:5000',
    );
  });
});

describe('isSuspect', () => {
  it('accepts a real page: HTTP 200 with body height and visible text above thresholds', () => {
    expect(isSuspect(200, 2000, 5000)).toBe(false);
  });

  it('flags a non-200 status, a short body, or near-empty text', () => {
    expect(isSuspect(404, 2000, 5000)).toBe(true);
    expect(isSuspect(200, 100, 5000)).toBe(true);
    expect(isSuspect(200, 2000, 50)).toBe(true);
  });
});
