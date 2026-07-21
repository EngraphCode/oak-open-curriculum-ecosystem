import { describe, expect, it } from 'vitest';

import { computePrVerdict, PR_VERDICT_STATES } from './states.js';
import type { PrStateReading } from './states.js';

/**
 * The D1 verdict function: one closed, typed verdict per compound reading.
 * Each silent-wait class from the 2026-07-20/21 net-to-zero drive has a
 * regression fixture here — the named failure it encodes can never again
 * read healthy (plan: pr-state-instrumentation D1 acceptance).
 */

/** A settled, review-complete, all-green reading — the SETTLE-READY baseline. */
function settledReading(overrides: Partial<PrStateReading> = {}): PrStateReading {
  return {
    number: 999,
    state: 'OPEN',
    mergeable: 'MERGEABLE',
    mergeStateStatus: 'BLOCKED',
    headRefOid: 'a'.repeat(40),
    checks: { total: 3, passed: 3, failed: 0, pending: 0 },
    namedChecks: [
      { name: 'secret-scan', bucket: 'passed' },
      { name: 'SonarCloud Code Analysis', bucket: 'passed' },
      { name: 'CI / static-checks', bucket: 'passed' },
    ],
    reviewThreads: { total: 4, unresolved: 0 },
    autoMergeArmed: false,
    reviewRequests: [],
    latestReviews: [
      {
        author: 'copilot-pull-request-reviewer',
        state: 'COMMENTED',
        body: 'Reviewed 2 of 2 files.',
        commitOid: 'a'.repeat(40),
      },
    ],
    reviewRuns: { kind: 'read', runs: [] },
    ...overrides,
  };
}

describe('PR_VERDICT_STATES', () => {
  it('is the closed set from the plan, plus the typed CLOSED refusal', () => {
    const byLocale = (left: string, right: string): number => left.localeCompare(right);
    expect([...PR_VERDICT_STATES].sort(byLocale)).toEqual(
      [
        'SETTLE-READY',
        'WAITING-REVIEW-RUN-LIVE',
        'SILENT-WAIT-NO-REVIEWER',
        'SILENT-WAIT-RUN-DEAD',
        'CHECKS-RUNNING',
        'CHECKS-RED',
        'THREADS-OPEN',
        'ARMED-BEHIND-RED',
        'QUOTA-SKIPPED',
        'MERGED',
        'CLOSED',
        'CONFLICT-DIRTY',
      ].sort(byLocale),
    );
  });
});

describe('computePrVerdict — terminal states', () => {
  it('reports MERGED for a merged PR regardless of other legs', () => {
    const verdict = computePrVerdict(
      settledReading({ state: 'MERGED', checks: { total: 3, passed: 1, failed: 1, pending: 1 } }),
    );
    expect(verdict.state).toBe('MERGED');
  });

  it('reports CLOSED (typed refusal, never a healthy verdict) for closed-unmerged', () => {
    const verdict = computePrVerdict(settledReading({ state: 'CLOSED' }));
    expect(verdict.state).toBe('CLOSED');
  });
});

describe('computePrVerdict — conflict', () => {
  it('reports CONFLICT-DIRTY when GitHub marks the PR CONFLICTING', () => {
    const verdict = computePrVerdict(settledReading({ mergeable: 'CONFLICTING' }));
    expect(verdict.state).toBe('CONFLICT-DIRTY');
  });

  it('reports CONFLICT-DIRTY on mergeStateStatus DIRTY even if mergeable lags UNKNOWN', () => {
    const verdict = computePrVerdict(
      settledReading({ mergeable: 'UNKNOWN', mergeStateStatus: 'DIRTY' }),
    );
    expect(verdict.state).toBe('CONFLICT-DIRTY');
  });
});

describe('computePrVerdict — the armed-behind-red regression class (#437, 2026-07-21)', () => {
  it('an armed auto-merge behind a red check can NEVER read healthy', () => {
    const verdict = computePrVerdict(
      settledReading({
        autoMergeArmed: true,
        checks: { total: 3, passed: 2, failed: 1, pending: 0 },
        namedChecks: [
          { name: 'secret-scan', bucket: 'passed' },
          { name: 'CI / static-checks', bucket: 'passed' },
          { name: 'SonarCloud Code Analysis', bucket: 'failed' },
        ],
      }),
    );
    expect(verdict.state).toBe('ARMED-BEHIND-RED');
    // The evidence names the red check BY NAME — the #437 cure: never a
    // column-parsed fragment like "1 Code".
    expect(verdict.evidence.join('\n')).toContain('SonarCloud Code Analysis');
  });

  it('outranks plain CHECKS-RED: the armed intent is the decision-relevant fact', () => {
    const armed = computePrVerdict(
      settledReading({
        autoMergeArmed: true,
        checks: { total: 1, passed: 0, failed: 1, pending: 0 },
        namedChecks: [{ name: 'CI / test', bucket: 'failed' }],
      }),
    );
    const unarmed = computePrVerdict(
      settledReading({
        checks: { total: 1, passed: 0, failed: 1, pending: 0 },
        namedChecks: [{ name: 'CI / test', bucket: 'failed' }],
      }),
    );
    expect(armed.state).toBe('ARMED-BEHIND-RED');
    expect(unarmed.state).toBe('CHECKS-RED');
  });
});

describe('computePrVerdict — checks and threads', () => {
  it('reports CHECKS-RED naming every failed check', () => {
    const verdict = computePrVerdict(
      settledReading({
        checks: { total: 2, passed: 0, failed: 2, pending: 0 },
        namedChecks: [
          { name: 'CI / test', bucket: 'failed' },
          { name: 'SonarCloud Code Analysis', bucket: 'failed' },
        ],
      }),
    );
    expect(verdict.state).toBe('CHECKS-RED');
    expect(verdict.evidence.join('\n')).toContain('CI / test');
    expect(verdict.evidence.join('\n')).toContain('SonarCloud Code Analysis');
  });

  it('reports CHECKS-RUNNING while any check is pending and none failed', () => {
    const verdict = computePrVerdict(
      settledReading({
        checks: { total: 2, passed: 1, failed: 0, pending: 1 },
        namedChecks: [
          { name: 'secret-scan', bucket: 'passed' },
          { name: 'CI / test', bucket: 'pending' },
        ],
      }),
    );
    expect(verdict.state).toBe('CHECKS-RUNNING');
  });

  it('red outranks running: a failed check is the verdict even mid-run', () => {
    const verdict = computePrVerdict(
      settledReading({
        checks: { total: 2, passed: 0, failed: 1, pending: 1 },
        namedChecks: [
          { name: 'CI / test', bucket: 'failed' },
          { name: 'CI / build', bucket: 'pending' },
        ],
      }),
    );
    expect(verdict.state).toBe('CHECKS-RED');
  });

  it('reports THREADS-OPEN when checks are green but threads are unresolved', () => {
    const verdict = computePrVerdict(
      settledReading({ reviewThreads: { total: 5, unresolved: 2 } }),
    );
    expect(verdict.state).toBe('THREADS-OPEN');
  });
});

describe('computePrVerdict — the quota-bounce regression class (live specimen, PR #461)', () => {
  const quotaReview = {
    author: 'claude',
    state: 'COMMENTED',
    body:
      '⚠️ **Code review skipped** — your organization’s overage spend limit has been ' +
      'reached.\n\nCode review is billed via overage credits.',
    commitOid: '',
  };

  it('a quota-bounce body yields QUOTA-SKIPPED, never a settled reviewer leg', () => {
    const verdict = computePrVerdict(settledReading({ latestReviews: [quotaReview] }));
    expect(verdict.state).toBe('QUOTA-SKIPPED');
  });

  it('fires even alongside a real review from another reviewer', () => {
    const verdict = computePrVerdict(
      settledReading({
        latestReviews: [
          {
            author: 'copilot-pull-request-reviewer',
            state: 'COMMENTED',
            body: 'Reviewed.',
            commitOid: 'a'.repeat(40),
          },
          quotaReview,
        ],
      }),
    );
    expect(verdict.state).toBe('QUOTA-SKIPPED');
  });
});

describe('computePrVerdict — review-run liveness (the silent-wait classes)', () => {
  it('reports WAITING-REVIEW-RUN-LIVE while a review run is in flight (completedAt null)', () => {
    const verdict = computePrVerdict(
      settledReading({
        latestReviews: [],
        reviewRuns: {
          kind: 'read',
          runs: [{ id: 'run-1', name: 'Review from @jimCresswell', completedAt: null }],
        },
      }),
    );
    expect(verdict.state).toBe('WAITING-REVIEW-RUN-LIVE');
  });

  it('reports SILENT-WAIT-RUN-DEAD when a review is requested but no run is live', () => {
    const verdict = computePrVerdict(
      settledReading({
        latestReviews: [],
        reviewRequests: ['jimCresswell'],
        reviewRuns: {
          kind: 'read',
          runs: [
            { id: 'run-1', name: 'Review from @jimCresswell', completedAt: '2026-07-21T10:00:00Z' },
          ],
        },
      }),
    );
    expect(verdict.state).toBe('SILENT-WAIT-RUN-DEAD');
  });

  it('reports SILENT-WAIT-NO-REVIEWER when nothing is requested and no review exists', () => {
    const verdict = computePrVerdict(settledReading({ latestReviews: [] }));
    expect(verdict.state).toBe('SILENT-WAIT-NO-REVIEWER');
  });

  it('a review bound to a STALE tip does not satisfy the reviewer leg', () => {
    const verdict = computePrVerdict(
      settledReading({
        latestReviews: [
          {
            author: 'copilot-pull-request-reviewer',
            state: 'COMMENTED',
            body: 'Reviewed an older push.',
            commitOid: 'b'.repeat(40),
          },
        ],
      }),
    );
    expect(verdict.state).toBe('SILENT-WAIT-NO-REVIEWER');
  });

  it('an empty-string commitOid (vendor gap, seen live) is tolerated as tip-bound', () => {
    const verdict = computePrVerdict(
      settledReading({
        latestReviews: [
          {
            author: 'copilot-pull-request-reviewer',
            state: 'COMMENTED',
            body: 'Reviewed.',
            commitOid: '',
          },
        ],
      }),
    );
    expect(verdict.state).toBe('SETTLE-READY');
  });
});

describe('computePrVerdict — SETTLE-READY', () => {
  it('reports SETTLE-READY when checks green, threads resolved, review present, nothing owed', () => {
    const verdict = computePrVerdict(settledReading());
    expect(verdict.state).toBe('SETTLE-READY');
  });

  it('zero checks are never vacuously green: absence of evidence is not a pass', () => {
    const verdict = computePrVerdict(
      settledReading({
        checks: { total: 0, passed: 0, failed: 0, pending: 0 },
        namedChecks: [],
      }),
    );
    expect(verdict.state).toBe('CHECKS-RUNNING');
  });

  it('an unavailable review-runs leg degrades typed, not silently green', () => {
    const verdict = computePrVerdict(
      settledReading({ reviewRuns: { kind: 'unavailable', reason: 'gh agent-task missing' } }),
    );
    expect(verdict.state).toBe('SETTLE-READY');
    expect(verdict.evidence.join('\n')).toContain('review-run liveness unavailable');
  });
});
