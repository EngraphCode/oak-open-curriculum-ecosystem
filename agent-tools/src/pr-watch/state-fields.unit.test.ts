import { describe, expect, it } from 'vitest';

import { parseAgentTaskList, parseAgentTaskView } from './agent-task-fields.js';
import { parseReviewsHarvest, parseStateView, PR_STATE_VIEW_JSON_FIELDS } from './state-fields.js';

/**
 * Boundary parsers for the D1 legs of `pr state`. Fixtures mirror shapes
 * verified live on 2026-07-21 (gh 2.x, PR #461 and the day's agent-task list):
 * autoMergeRequest null-when-unarmed; reviews with an EMPTY commit oid; a
 * User-shaped review request; CheckRun `name` / StatusContext `context` with
 * CheckRun `completedAt` anchoring checks-green.
 */

function stateViewFixture(): Record<string, unknown> {
  return {
    number: 461,
    state: 'OPEN',
    mergeable: 'MERGEABLE',
    mergeStateStatus: 'BLOCKED',
    headRefOid: 'f'.repeat(40),
    statusCheckRollup: [
      {
        __typename: 'CheckRun',
        name: 'secret-scan',
        status: 'COMPLETED',
        conclusion: 'SUCCESS',
        completedAt: '2026-07-21T10:33:35Z',
      },
      {
        __typename: 'CheckRun',
        name: 'run-quality-gates',
        status: 'COMPLETED',
        conclusion: 'SUCCESS',
        completedAt: '2026-07-21T10:41:02Z',
      },
      { __typename: 'StatusContext', context: 'legacy/status', state: 'SUCCESS' },
    ],
    autoMergeRequest: null,
    reviewRequests: [{ __typename: 'User', login: 'jimCresswell' }],
  };
}

describe('parseStateView', () => {
  it('carries per-check verdicts BY NAME (CheckRun name, StatusContext context)', () => {
    const parsed = parseStateView(stateViewFixture());
    expect(parsed.namedChecks).toEqual([
      { name: 'secret-scan', bucket: 'passed' },
      { name: 'run-quality-gates', bucket: 'passed' },
      { name: 'legacy/status', bucket: 'passed' },
    ]);
    expect(parsed.checks).toEqual({ total: 3, passed: 3, failed: 0, pending: 0 });
  });

  it('anchors checksGreenAt on the LATEST completion when green, null otherwise', () => {
    expect(parseStateView(stateViewFixture()).checksGreenAt).toBe('2026-07-21T10:41:02Z');
    const notGreen = parseStateView({
      ...stateViewFixture(),
      statusCheckRollup: [
        { __typename: 'CheckRun', name: 'a', status: 'IN_PROGRESS', conclusion: null },
      ],
    });
    expect(notGreen.checksGreenAt).toBeNull();
  });

  it('anchors on StatusContext startedAt when contexts are the only green items', () => {
    const parsed = parseStateView({
      ...stateViewFixture(),
      statusCheckRollup: [
        {
          __typename: 'StatusContext',
          context: 'Vercel',
          state: 'SUCCESS',
          startedAt: '2026-07-21T10:50:00Z',
        },
      ],
    });
    expect(parsed.checksGreenAt).toBe('2026-07-21T10:50:00Z');
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

  it('normalises null rollup and null requests to empty (no-checks PRs parse)', () => {
    const parsed = parseStateView({
      ...stateViewFixture(),
      statusCheckRollup: null,
      reviewRequests: null,
    });
    expect(parsed.namedChecks).toEqual([]);
    expect(parsed.reviewRequests).toEqual([]);
    expect(parsed.checksGreenAt).toBeNull();
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
    ]);
  });
});

describe('parseReviewsHarvest', () => {
  function page(nodes: readonly unknown[]): unknown {
    return { data: { repository: { pullRequest: { reviews: { nodes } } } } };
  }

  it('flattens all pages and normalises null author/commit/submittedAt', () => {
    const reviews = parseReviewsHarvest([
      page([
        {
          author: { login: 'copilot-pull-request-reviewer' },
          state: 'COMMENTED',
          body: 'Reviewed.',
          submittedAt: '2026-07-21T12:00:00Z',
          commit: { oid: 'f'.repeat(40) },
        },
      ]),
      page([
        {
          author: null,
          state: 'COMMENTED',
          body: 'Deleted account review.',
          submittedAt: null,
          commit: null,
        },
      ]),
    ]);
    expect(reviews).toEqual([
      {
        author: 'copilot-pull-request-reviewer',
        state: 'COMMENTED',
        body: 'Reviewed.',
        submittedAt: '2026-07-21T12:00:00Z',
        commitOid: 'f'.repeat(40),
      },
      {
        author: 'unknown',
        state: 'COMMENTED',
        body: 'Deleted account review.',
        submittedAt: '',
        commitOid: '',
      },
    ]);
  });

  it('fails loud on an empty page array (a silent zero is the defect)', () => {
    expect(() => parseReviewsHarvest([])).toThrow();
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
    ]);
    expect(runs).toEqual([
      {
        id: 'run-1',
        name: 'Review from @jimCresswell',
        createdAt: '2026-07-21T10:22:07Z',
        completedAt: null,
      },
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
  });

  it('fails loud on misshapen agent-task output', () => {
    expect(() => parseAgentTaskList({ not: 'an array' })).toThrow();
  });
});
