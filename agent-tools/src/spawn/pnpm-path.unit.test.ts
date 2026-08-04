import { isErr, isOk, unwrap } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { type PathExists } from '../core/path-exists.js';

import { resolvePnpm } from './pnpm-path.js';

const FAKE_HOME = '/Users/<user>';

/** A {@link PathExists} fake that reports only `target` as present. */
const onlyExists =
  (target: string): PathExists =>
  (candidate) =>
    candidate === target;

describe('resolvePnpm', () => {
  it('prefers $PNPM_HOME/pnpm when it exists', () => {
    const result = resolvePnpm(
      { PNPM_HOME: '/pnpm-home', HOME: FAKE_HOME },
      onlyExists('/pnpm-home/pnpm'),
    );

    expect(isOk(result)).toBe(true);
    expect(unwrap(result)).toBe('/pnpm-home/pnpm');
  });

  it('falls back to the per-user macOS standalone location', () => {
    const result = resolvePnpm({ HOME: FAKE_HOME }, onlyExists(`${FAKE_HOME}/Library/pnpm/pnpm`));

    expect(unwrap(result)).toBe(`${FAKE_HOME}/Library/pnpm/pnpm`);
  });

  it('resolves a system location when no per-user install exists', () => {
    const result = resolvePnpm({}, onlyExists('/opt/homebrew/bin/pnpm'));

    expect(unwrap(result)).toBe('/opt/homebrew/bin/pnpm');
  });

  it('returns err naming the searched paths and the remedy when pnpm is found nowhere', () => {
    const result = resolvePnpm({ HOME: FAKE_HOME }, () => false);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.message).toMatch(/pnpm not found/u);
      expect(result.error.message).toContain('PNPM_HOME');
    }
  });

  it('skips a non-absolute PNPM_HOME so a relative candidate never passes resolution', () => {
    const probed: string[] = [];
    const result = resolvePnpm(
      { PNPM_HOME: 'relative/pnpm-home', HOME: FAKE_HOME },
      (candidate) => {
        probed.push(candidate);
        // The relative candidate "would" exist when probed against the process cwd...
        return candidate === 'relative/pnpm-home/pnpm';
      },
    );

    // ...but execFileSync resolves a relative executable against the worktree cwd, so a
    // relative PNPM_HOME that passes existsSync would run the wrong binary (or none). It
    // must never become a candidate — only absolute paths are probed, so it never resolves.
    expect(probed).not.toContain('relative/pnpm-home/pnpm');
    expect(probed.every((candidate) => candidate.startsWith('/'))).toBe(true);
    expect(isErr(result)).toBe(true);
  });

  it('never consults PATH — every probed candidate is an absolute path, never bare "pnpm"', () => {
    const probed: string[] = [];
    resolvePnpm({ PNPM_HOME: '/pnpm-home', HOME: FAKE_HOME }, (candidate) => {
      probed.push(candidate);
      return false;
    });

    expect(probed.length).toBeGreaterThan(0);
    expect(probed.every((candidate) => candidate.startsWith('/'))).toBe(true);
    expect(probed).not.toContain('pnpm');
  });
});

/**
 * Regression: `$PNPM_HOME/bin/pnpm`.
 *
 * pnpm's installer treats `PNPM_HOME` as the global bin directory, but some
 * installations place the launcher one level down. Observed 2026-08-04 on a
 * machine with `PNPM_HOME=~/Library/pnpm` and the binary at
 * `~/Library/pnpm/bin/pnpm`: none of the previous candidates existed, so every
 * commit failed, and the pre-commit hook reported the resolver error as
 * "formatting issues found" — sending two agents after a formatting problem
 * that did not exist.
 */
describe('resolvePnpm — PNPM_HOME/bin layout (2026-08-04 regression)', () => {
  it('finds the binary under $PNPM_HOME/bin when it is not directly in $PNPM_HOME', () => {
    const result = resolvePnpm(
      { PNPM_HOME: '/pnpm-home', HOME: '/home-dir' },
      (path) => path === '/pnpm-home/bin/pnpm',
    );

    expect(result.ok).toBe(true);
    expect(result.ok && result.value).toBe('/pnpm-home/bin/pnpm');
  });

  it('still prefers $PNPM_HOME/pnpm when both layouts exist', () => {
    const result = resolvePnpm(
      { PNPM_HOME: '/pnpm-home', HOME: '/home-dir' },
      (path) => path === '/pnpm-home/pnpm' || path === '/pnpm-home/bin/pnpm',
    );

    expect(result.ok && result.value).toBe('/pnpm-home/pnpm');
  });

  it('finds the Linux standalone per-user bin layout with no PNPM_HOME set', () => {
    const result = resolvePnpm(
      { HOME: '/home-dir' },
      (path) => path === '/home-dir/.local/share/pnpm/bin/pnpm',
    );

    expect(result.ok && result.value).toBe('/home-dir/.local/share/pnpm/bin/pnpm');
  });

  // The macOS sibling of the case above. This is the layout that actually broke —
  // the observed machine had the launcher under `Library/pnpm/bin/` — so without
  // this case the candidate that fixes the real defect could be deleted or
  // mistyped and the suite would stay green.
  it('finds the macOS standalone per-user bin layout with no PNPM_HOME set', () => {
    const result = resolvePnpm(
      { HOME: '/home-dir' },
      (path) => path === '/home-dir/Library/pnpm/bin/pnpm',
    );

    expect(result.ok && result.value).toBe('/home-dir/Library/pnpm/bin/pnpm');
  });

  it('names every searched path when pnpm is absent, so the remedy is actionable', () => {
    const probed: string[] = [];
    const result = resolvePnpm({ PNPM_HOME: '/pnpm-home', HOME: '/home-dir' }, (candidate) => {
      probed.push(candidate);
      return false;
    });

    expect(result.ok).toBe(false);
    expect(probed.length).toBeGreaterThan(0);

    // "Every" is the promise in this test's name, so assert against the set the
    // resolver actually probed rather than a hand-listed subset — otherwise a new
    // candidate can be added without ever appearing in the error a user reads.
    // Checking the probe set keeps the assertion true as the candidate list grows.
    const message = result.ok ? '' : result.error.message;
    for (const candidate of probed) {
      expect(message).toContain(candidate);
    }
  });

  it('never admits a relative candidate, keeping the absolute-only invariant', () => {
    const result = resolvePnpm({ PNPM_HOME: 'relative/pnpm', HOME: '/home-dir' }, (path) =>
      path.startsWith('relative/'),
    );

    expect(result.ok).toBe(false);
  });
});
