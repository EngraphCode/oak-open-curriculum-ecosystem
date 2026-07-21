import { describe, expect, it } from 'vitest';

import {
  parseAgentTaskList,
  parseAgentTaskView,
  parseStateView,
  PR_STATE_VIEW_JSON_FIELDS,
} from './state-fields.js';

/**
 * Boundary parsers for the D1 legs of `pr state`. Fixtures mirror shapes
 * verified live on 2026-07-21 (gh 2.x, PR #461 and the day's agent-task list):
 * autoMergeRequest null-when-unarmed; latestReviews with an EMPTY commit oid;
 * a User-shaped review request; CheckRun `name` / StatusContext `context`.
 */

function stateViewFixture(): Record<string, unknown> {
  return {
    number: 461,
    state: 'OPEN',
    mergeable: 'MERGEABLE',
    mergeStateStatus: 'BLOCKED',
    headRefOid: 'f'.repeat(40),
    statusCheckRollup: [
      { __typename: 'CheckRun', name: 'secret-scan', status: 'COMPLETED', conclusion: 'SUCCESS' },
      {
        __typename: 'CheckRun',
        name: 'SonarCloud Code Analysis',
        status: 'COMPLETED',
        conclusion: 'FAILURE',
      },
      { __typename: 'StatusContext', context: 'legacy/status', state: 'SUCCESS' },
    ],
    autoMergeRequest: null,
    reviewRequests: [{ __typename: 'User', login: 'jimCresswell' }],
    latestReviews: [
      {
        author: { login: 'claude' },
        state: 'COMMENTED',
        body: '⚠️ **Code review skipped** — overage spend limit reached.',
        commit: { oid: '' },
      },
    ],
  };
}

describe('parseStateView', () => {
  it('carries per-check verdicts BY NAME (CheckRun name, StatusContext context)', () => {
    const parsed = parseStateView(stateViewFixture());
    expect(parsed.namedChecks).toEqual([
      { name: 'secret-scan', bucket: 'passed' },
      { name: 'SonarCloud Code Analysis', bucket: 'failed' },
      { name: 'legacy/status', bucket: 'passed' },
    ]);
  });

  it('summarises checks consistently with the named verdicts', () => {
    const parsed = parseStateView(stateViewFixture());
    expect(parsed.checks).toEqual({ total: 3, passed: 2, failed: 1, pending: 0 });
  });

  it('reads autoMergeRequest null as unarmed and an object as armed', () => {
    expect(parseStateView(stateViewFixture()).autoMergeArmed).toBe(false);
    expect(
      parseStateView({
        ...stateViewFixture(),
        autoMergeRequest: { enabledAt: '2026-07-21T10:00:00Z', mergeMethod: 'MERGE' },
      }).autoMergeArmed,
    ).toBe(true);
  });

  it('maps review requests to logins (User) and slugs (Team)', () => {
    const parsed = parseStateView({
      ...stateViewFixture(),
      reviewRequests: [
        { __typename: 'User', login: 'jimCresswell' },
        { __typename: 'Team', name: 'platform', slug: 'platform-team' },
      ],
    });
    expect(parsed.reviewRequests).toEqual(['jimCresswell', 'platform-team']);
  });

  it('tolerates an empty or absent review commit oid (observed live) as empty string', () => {
    const parsed = parseStateView(stateViewFixture());
    expect(parsed.latestReviews).toEqual([
      {
        author: 'claude',
        state: 'COMMENTED',
        body: '⚠️ **Code review skipped** — overage spend limit reached.',
        commitOid: '',
      },
    ]);
    const noCommit = parseStateView({
      ...stateViewFixture(),
      latestReviews: [{ author: { login: 'x' }, state: 'APPROVED', body: '', commit: null }],
    });
    expect(noCommit.latestReviews[0]?.commitOid).toBe('');
  });

  it('normalises null rollup and null latestReviews to empty (no-checks PRs parse)', () => {
    const parsed = parseStateView({
      ...stateViewFixture(),
      statusCheckRollup: null,
      latestReviews: null,
      reviewRequests: null,
    });
    expect(parsed.namedChecks).toEqual([]);
    expect(parsed.latestReviews).toEqual([]);
    expect(parsed.reviewRequests).toEqual([]);
  });

  it('fails loud on a genuinely misshapen payload', () => {
    expect(() => parseStateView({ number: 'not-a-number' })).toThrow();
  });

  it('requests exactly the fields it parses', () => {
    expect([...PR_STATE_VIEW_JSON_FIELDS]).toEqual([
      'number',
      'state',
      'mergeable',
      'mergeStateStatus',
      'headRefOid',
      'statusCheckRollup',
      'autoMergeRequest',
      'reviewRequests',
      'latestReviews',
    ]);
  });
});

describe('parseAgentTaskList / parseAgentTaskView', () => {
  it('parses the list shape (no PR number on this surface) with null-safe completedAt', () => {
    const runs = parseAgentTaskList([
      {
        id: 'run-1',
        name: 'Review from @jimCresswell',
        createdAt: '2026-07-21T10:22:07Z',
        completedAt: null,
      },
      {
        id: 'run-2',
        name: 'Review from @jimCresswell',
        createdAt: '2026-07-21T09:22:06Z',
        completedAt: '2026-07-21T09:22:53Z',
      },
    ]);
    expect(runs).toEqual([
      { id: 'run-1', name: 'Review from @jimCresswell', completedAt: null },
      { id: 'run-2', name: 'Review from @jimCresswell', completedAt: '2026-07-21T09:22:53Z' },
    ]);
  });

  it('parses the view shape carrying the run→PR mapping', () => {
    expect(
      parseAgentTaskView({
        id: 'run-1',
        name: 'Review',
        completedAt: null,
        pullRequestNumber: 461,
      }),
    ).toEqual({ id: 'run-1', completedAt: null, pullRequestNumber: 461 });
    expect(
      parseAgentTaskView({ id: 'run-2', name: 'Review', completedAt: '2026-07-21T09:22:53Z' })
        .pullRequestNumber,
    ).toBeUndefined();
  });

  it('fails loud on misshapen agent-task output', () => {
    expect(() => parseAgentTaskList({ not: 'an array' })).toThrow();
  });
});
