/**
 * F-108: `claims close` / `claims archive-stale` resolve the shared coordination
 * home for `--closed` by default, so a worktree-isolated agent archives closed
 * claims into the team's primary checkout rather than a worktree-local file (the
 * F-41 fragmentation failure mode F-85 cured for `--active`, applied to the
 * closed archive). These cover the resolution behaviour directly:
 *
 * - an omitted `--closed` resolves to the coordination home's
 *   `closed-claims.archive.json` (git consulted via the injected runner);
 * - an explicit `--closed` is honoured verbatim and NEVER consults git (laziness
 *   — an explicit path must not pay for, or fail on, a git invocation);
 * - `--repo-root` overrides the home without consulting git;
 * - `withClosedDefault` injects the resolved value while preserving every other
 *   option field.
 *
 * Built through `parseOptions` so the flags are exercised on a real parsed
 * Options value; the git runner is stubbed so the resolution is proven without a
 * repository.
 */
import { describe, expect, it } from 'vitest';

import {
  resolveClosedPath,
  withClosedDefault,
} from '../../src/collaboration-state/claim-closed-path';
import { parseOptions } from '../../src/collaboration-state/cli-options';
import { type GitRunner } from '../../src/collaboration-state/coordination-home';

const PRIMARY = '/workspace/oak';
const LINKED = '/workspace/oak-worktrees/lane-b';
const CLOSED_IN_PRIMARY = `${PRIMARY}/.agent/state/collaboration/closed-claims.archive.json`;

function porcelain(...roots: readonly string[]): string {
  return roots
    .map((root, i) => `worktree ${root}\nHEAD ${'0'.repeat(40)}\nbranch refs/heads/wt-${i}\n`)
    .join('\n');
}

const gitReturning =
  (output: string): GitRunner =>
  () =>
    output;

const gitThatThrows: GitRunner = () => {
  throw new Error('git must not be consulted when the path is given explicitly');
};

describe('resolveClosedPath (F-108 claims --closed default)', () => {
  it('defaults an omitted --closed to the coordination home closed-claims.archive.json', () => {
    const options = parseOptions(['claims', 'close', '--claim-id', 'abc']);
    expect(
      resolveClosedPath(options, LINKED, { runGit: gitReturning(porcelain(PRIMARY, LINKED)) }),
    ).toBe(CLOSED_IN_PRIMARY);
  });

  it('honours an explicit --closed verbatim without consulting git', () => {
    const options = parseOptions(['claims', 'close', '--closed', '/explicit/closed.json']);
    expect(resolveClosedPath(options, LINKED, { runGit: gitThatThrows })).toBe(
      '/explicit/closed.json',
    );
  });

  it('honours --repo-root as the home override without consulting git', () => {
    const options = parseOptions(['claims', 'close', '--repo-root', '/repo/root']);
    expect(resolveClosedPath(options, LINKED, { runGit: gitThatThrows })).toBe(
      '/repo/root/.agent/state/collaboration/closed-claims.archive.json',
    );
  });
});

describe('withClosedDefault', () => {
  it('injects the resolved --closed while preserving other option fields', () => {
    const options = parseOptions([
      'claims',
      'close',
      '--claim-id',
      'abc',
      '--now',
      '2026-06-28T00:00:00Z',
    ]);
    const resolved = withClosedDefault(options, LINKED, {
      runGit: gitReturning(porcelain(PRIMARY, LINKED)),
    });
    expect(resolved.values.get('closed')).toBe(CLOSED_IN_PRIMARY);
    expect(resolved.values.get('claim-id')).toBe('abc');
    expect(resolved.values.get('now')).toBe('2026-06-28T00:00:00Z');
    expect(resolved.command).toBe('claims');
    expect(resolved.topic).toBe('close');
  });

  it('leaves an explicit --closed untouched', () => {
    const options = parseOptions(['claims', 'close', '--closed', '/explicit/closed.json']);
    const resolved = withClosedDefault(options, LINKED, { runGit: gitThatThrows });
    expect(resolved.values.get('closed')).toBe('/explicit/closed.json');
  });
});
