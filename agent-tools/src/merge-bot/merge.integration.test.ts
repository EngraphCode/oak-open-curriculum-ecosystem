import { ok } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import type { PrStateReading } from '../pr-watch/state-types.js';
import type { GithubApiFetch } from './mint-installation-token.js';
import { runMergeExecution, type MergeExecutionInput } from './merge.js';

/**
 * Integration over injected ports (constant fakes, no process, no network):
 * the reading seam replaces pr-watch's gh-level assembly (whose fidelity is
 * pr-watch's own proof), the fetch port captures the settings GET and the
 * merge PUT, and the assertions pin the call SHAPES the plan's acceptance
 * criteria name — merge-commit method and the verdicted tip's sha in the
 * body (never-squash and tip-consistency as behaviour).
 */

const HEAD_OID = 'abc123def456abc123def456abc123def456abc1';

function makeReading(overrides: Partial<PrStateReading> = {}): PrStateReading {
  return {
    number: 42,
    url: 'https://github.com/acme/widgets/pull/42',
    state: 'OPEN',
    isDraft: false,
    mergeable: 'MERGEABLE',
    mergeStateStatus: 'CLEAN',
    headRefOid: HEAD_OID,
    checks: { total: 3, passed: 3, failed: 0, pending: 0 },
    namedChecks: [{ name: 'lint', bucket: 'passed' }],
    checksGreenAt: '2026-08-06T08:00:00Z',
    reviewThreads: { total: 1, unresolved: 0 },
    autoMergeArmed: false,
    reviewRequests: [],
    expectedReviewers: ['copilot-pull-request-reviewer'],
    expectedDeclared: true,
    reviews: [
      {
        author: 'copilot-pull-request-reviewer',
        state: 'COMMENTED',
        body: 'review round complete',
        commitOid: HEAD_OID,
        submittedAt: '2026-08-06T08:05:00Z',
      },
    ],
    reviewRuns: { kind: 'read', runs: [] },
    ...overrides,
  };
}

/** A fetch port capturing every call; responses served from a constant table. */
function makeFetchPort(input: {
  readonly settingsBody?: unknown;
  readonly mergeStatus?: number;
  readonly mergeBody?: unknown;
}): { fetchImpl: GithubApiFetch; calls: { url: string; init?: RequestInit }[] } {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fetchImpl: GithubApiFetch = async (url, init) => {
    calls.push({ url: String(url), init });
    if (String(url).endsWith('/pulls/42/merge')) {
      return {
        status: input.mergeStatus ?? 200,
        json: () => Promise.resolve(input.mergeBody ?? { merged: true, sha: 'mergesha1' }),
      };
    }
    return {
      status: 200,
      json: () => Promise.resolve(input.settingsBody ?? { allow_merge_commit: true }),
    };
  };
  return { fetchImpl, calls };
}

function makeInput(
  reading: PrStateReading,
  fetchImpl: GithubApiFetch,
  overrides: Partial<MergeExecutionInput> = {},
): MergeExecutionInput {
  return {
    identity: { appId: '1', keyPath: '/dev/null', owner: 'acme', repoName: 'widgets' },
    prNumber: 42,
    expectedReviewers: ['copilot-pull-request-reviewer'],
    nowIso: '2026-08-06T09:00:00Z',
    seams: {
      mint: () =>
        Promise.resolve(
          ok({ token: 'test-token-value', expiresAt: '2026-08-06T10:00:00Z', installationId: 7 }),
        ),
      readReading: () => reading,
      fetchImpl,
    },
    ...overrides,
  };
}

describe('runMergeExecution', () => {
  it('merges a settled tip with the merge-commit method and the verdicted sha in the body', async () => {
    // Quiet window: reading time 08:05, now 09:00 — comfortably elapsed.
    const { fetchImpl, calls } = makeFetchPort({});

    const outcome = await runMergeExecution(makeInput(makeReading(), fetchImpl));

    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.value).toEqual({ kind: 'merged', sha: 'mergesha1' });
    }
    const mergeCall = calls.find((call) => call.url.endsWith('/pulls/42/merge'));
    expect(mergeCall).toBeDefined();
    expect(mergeCall?.init?.method).toBe('PUT');
    const body: unknown = JSON.parse(String(mergeCall?.init?.body));
    expect(body).toEqual({ merge_method: 'merge', sha: HEAD_OID });
  });

  it('refuses a non-settled verdict by name and never calls the merge endpoint', async () => {
    const { fetchImpl, calls } = makeFetchPort({});
    const reading = makeReading({
      checks: { total: 3, passed: 2, failed: 1, pending: 0 },
      namedChecks: [{ name: 'lint', bucket: 'failed' }],
      checksGreenAt: null,
    });

    const outcome = await runMergeExecution(makeInput(reading, fetchImpl));

    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.value.kind).toBe('refused');
      if (outcome.value.kind === 'refused') {
        expect(outcome.value.reason).toContain('CHECKS-RED');
        // The verdict travels as a FIELD so the CLI poll loop reads it by
        // name, never by parsing the prose reason.
        expect(outcome.value.verdictState).toBe('CHECKS-RED');
      }
    }
    expect(calls.some((call) => call.url.endsWith('/pulls/42/merge'))).toBe(false);
  });

  it('refuses loudly when the settings read omits allow_merge_commit, and never merges', async () => {
    const { fetchImpl, calls } = makeFetchPort({ settingsBody: { full_name: 'acme/widgets' } });

    const outcome = await runMergeExecution(makeInput(makeReading(), fetchImpl));

    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.error.message).toContain('allow_merge_commit');
    }
    expect(calls.some((call) => call.url.endsWith('/pulls/42/merge'))).toBe(false);
  });

  it('refuses when merge commits are disallowed, without a squash fallback call', async () => {
    const { fetchImpl, calls } = makeFetchPort({ settingsBody: { allow_merge_commit: false } });

    const outcome = await runMergeExecution(makeInput(makeReading(), fetchImpl));

    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.value.kind).toBe('refused');
      if (outcome.value.kind === 'refused') {
        expect(outcome.value.reason).toContain('merge commits');
        expect(outcome.value.verdictState).toBe('SETTLE-READY');
      }
    }
    expect(calls.some((call) => call.url.endsWith('/pulls/42/merge'))).toBe(false);
  });

  it('surfaces a moved tip loudly when the merge endpoint answers 409', async () => {
    const { fetchImpl } = makeFetchPort({
      mergeStatus: 409,
      mergeBody: { message: 'Head branch was modified. Review and try the merge again.' },
    });

    const outcome = await runMergeExecution(makeInput(makeReading(), fetchImpl));

    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.error.message).toContain('409');
      expect(outcome.error.message).toContain(HEAD_OID);
    }
  });

  it('fails fast on an empty minted token before reading anything', async () => {
    const { fetchImpl, calls } = makeFetchPort({});
    let readingRead = false;
    const input = makeInput(makeReading(), fetchImpl);
    const withEmptyMint: MergeExecutionInput = {
      ...input,
      seams: {
        ...input.seams,
        mint: () =>
          Promise.resolve(ok({ token: '', expiresAt: '2026-08-06T10:00:00Z', installationId: 7 })),
        readReading: () => {
          readingRead = true;
          return makeReading();
        },
      },
    };

    const outcome = await runMergeExecution(withEmptyMint);

    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.error.message).toContain('empty');
    }
    expect(readingRead).toBe(false);
    expect(calls.length).toBe(0);
  });
});
