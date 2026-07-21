import { describe, expect, it } from 'vitest';

import { runPrStateCli } from './state-cli.js';
import type { PrStateReading } from './states.js';

/** CLI tests for `pr state` with an injected reading — no gh. */

function reading(overrides: Partial<PrStateReading> = {}): PrStateReading {
  return {
    number: 461,
    state: 'OPEN',
    mergeable: 'MERGEABLE',
    mergeStateStatus: 'BLOCKED',
    headRefOid: 'f'.repeat(40),
    checks: { total: 1, passed: 0, failed: 1, pending: 0 },
    namedChecks: [{ name: 'SonarCloud Code Analysis', bucket: 'failed' }],
    reviewThreads: { total: 0, unresolved: 0 },
    autoMergeArmed: true,
    reviewRequests: [],
    latestReviews: [],
    reviewRuns: { kind: 'read', runs: [] },
    ...overrides,
  };
}

class Sink {
  public text = '';
  public write(chunk: string): boolean {
    this.text += chunk;
    return true;
  }
}

describe('runPrStateCli', () => {
  it('prints the verdict with the red check named — never a column fragment', () => {
    const stdout = new Sink();
    const exit = runPrStateCli({
      args: ['state', '461'],
      stdout,
      stderr: new Sink(),
      readReading: () => reading(),
    });
    expect(exit).toBe(0);
    expect(stdout.text).toContain('PR #461 ARMED-BEHIND-RED');
    expect(stdout.text).toContain('failed check: SonarCloud Code Analysis');
  });

  it('emits the full reading and verdict as JSON with --json', () => {
    const stdout = new Sink();
    const exit = runPrStateCli({
      args: ['state', '461', '--json'],
      stdout,
      stderr: new Sink(),
      readReading: () => reading(),
    });
    expect(exit).toBe(0);
    const payload: unknown = JSON.parse(stdout.text);
    expect(payload).toMatchObject({
      verdict: { state: 'ARMED-BEHIND-RED' },
      reading: { number: 461, autoMergeArmed: true },
    });
  });

  it('rejects an unknown action with usage on stderr and exit 2', () => {
    const stderr = new Sink();
    const exit = runPrStateCli({
      args: ['status', '461'],
      stdout: new Sink(),
      stderr,
      readReading: () => reading(),
    });
    expect(exit).toBe(2);
    expect(stderr.text).toContain('pr state');
  });

  it('rejects a malformed PR identifier at the boundary', () => {
    const stderr = new Sink();
    const exit = runPrStateCli({
      args: ['state', 'not-a-pr'],
      stdout: new Sink(),
      stderr,
      readReading: () => reading(),
    });
    expect(exit).toBe(2);
    expect(stderr.text).toContain('Invalid PR identifier');
  });

  it('prints usage on --help with exit 0', () => {
    const stdout = new Sink();
    const exit = runPrStateCli({
      args: ['--help'],
      stdout,
      stderr: new Sink(),
      readReading: () => reading(),
    });
    expect(exit).toBe(0);
    expect(stdout.text).toContain('pr state');
  });

  it('reports a reader failure on stderr with exit 2, never a partial verdict', () => {
    const stderr = new Sink();
    const exit = runPrStateCli({
      args: ['state', '461'],
      stdout: new Sink(),
      stderr,
      readReading: () => {
        throw new Error('gh pr view returned non-JSON output');
      },
    });
    expect(exit).toBe(2);
    expect(stderr.text).toContain('non-JSON');
  });
});
