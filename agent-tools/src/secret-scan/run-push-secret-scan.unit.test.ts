import { describe, expect, it } from 'vitest';

import { runPushSecretScan } from './run-push-secret-scan.js';

/**
 * The pre-push scan's orchestration over an injected scanner and an injected
 * warning sink. The range arithmetic itself is pinned in
 * `compute-push-scan-ranges.unit.test.ts`; what is described here is what an
 * operator SEES — in particular that a scan which has quietly become a
 * full-history walk says so (R6: a performance-sensitive operation that loses
 * its optimisation precondition refuses or warns, never degrades silently).
 */

const LOCAL = '1111111111111111111111111111111111111111';
const REMOTE = '2222222222222222222222222222222222222222';
const ZERO = '0000000000000000000000000000000000000000';

function run(args: { remoteName: string; refsText: string }): {
  exit: number;
  scanned: string[];
  warnings: string[];
} {
  const scanned: string[] = [];
  const warnings: string[] = [];
  const exit = runPushSecretScan(
    args,
    (range) => {
      scanned.push(range);
      return true;
    },
    (message) => warnings.push(message),
  );
  return { exit, scanned, warnings };
}

describe('runPushSecretScan', () => {
  it('warns loudly when a bare-URL destination turns the incremental scan into a full-history walk', () => {
    // No named remote means no remote-tracking refs to scope the exclusion
    // against, so the range widens to "not on ANY remote" — a superset that
    // measured 5,009 commits on this repository while reporting nothing.
    const result = run({
      remoteName: '',
      refsText: `refs/heads/lane ${LOCAL} refs/heads/lane ${ZERO}`,
    });

    expect(result.exit).toBe(0);
    expect(result.warnings).toHaveLength(1);
    // The operator is told WHAT was lost and WHAT it costs, not merely that
    // something is unusual.
    expect(result.warnings[0]).toContain('full history');
    expect(result.warnings[0]).toContain('remote');
    expect(result.scanned).toEqual([`${LOCAL} --not --remotes`]);
  });

  it('warns when git supplies no ref lines at all — a manual run scans the same superset', () => {
    const result = run({ remoteName: 'origin', refsText: '' });

    expect(result.warnings).toHaveLength(1);
    expect(result.scanned).toEqual(['HEAD --not --remotes']);
  });

  it('stays silent on the ordinary incremental push — the precondition holds', () => {
    const result = run({
      remoteName: 'origin',
      refsText: `refs/heads/lane ${LOCAL} refs/heads/lane ${REMOTE}`,
    });

    expect(result.exit).toBe(0);
    expect(result.warnings).toEqual([]);
    expect(result.scanned).toEqual([`${REMOTE}..${LOCAL}`]);
  });

  it('keeps a new ref scoped to its named destination remote without warning', () => {
    const result = run({
      remoteName: 'origin',
      refsText: `refs/heads/lane ${LOCAL} refs/heads/lane ${ZERO}`,
    });

    expect(result.warnings).toEqual([]);
    expect(result.scanned).toEqual([`${LOCAL} --not --remotes=origin`]);
  });

  it('reports a leak as a non-zero exit', () => {
    const exit = runPushSecretScan(
      { remoteName: 'origin', refsText: `refs/heads/lane ${LOCAL} refs/heads/lane ${REMOTE}` },
      () => false,
      () => undefined,
    );

    expect(exit).toBe(1);
  });
});
