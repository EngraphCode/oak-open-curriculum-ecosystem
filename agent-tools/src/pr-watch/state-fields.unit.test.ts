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
    url: 'https://github.com/oaknational/oak-open-curriculum-ecosystem/pull/461',
    state: 'OPEN',
    isDraft: false,
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

  it('anchors checksGreenAt on the LATEST completion when every green item is anchored, null otherwise', () => {
    const allAnchored = parseStateView({
      ...stateViewFixture(),
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
      ],
    });
    expect(allAnchored.checksGreenAt).toBe('2026-07-21T10:41:02Z');
    const notGreen = parseStateView({
      ...stateViewFixture(),
      statusCheckRollup: [
        { __typename: 'CheckRun', name: 'a', status: 'IN_PROGRESS', conclusion: null },
      ],
    });
    expect(notGreen.checksGreenAt).toBeNull();
  });

  it('a green item with NO timestamp makes checksGreenAt null — a partial anchor can pre-date the all-green moment (r4 regression)', () => {
    // The default fixture's `legacy/status` context is green with neither
    // completedAt nor startedAt: a max over PRESENT timestamps would anchor
    // settlement at 10:41:02Z while the unanchored item's green moment is
    // unknown, letting reviewer timeout/settlement fire off a wrong time.
    expect(parseStateView(stateViewFixture()).checksGreenAt).toBeNull();
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

  it('parses isDraft through (drafts are refused typed downstream) — r6 regression', () => {
    expect(parseStateView({ ...stateViewFixture(), isDraft: true }).isDraft).toBe(true);
    expect(parseStateView(stateViewFixture()).isDraft).toBe(false);
  });

  it('a review request with NO identity field fails loud at the boundary, never becomes reviewer "unknown" (r6 regression)', () => {
    expect(() => parseStateView({ ...stateViewFixture(), reviewRequests: [{}] })).toThrow(
      /identity field/,
    );
  });

  it('requests exactly the fields it parses', () => {
    expect([...PR_STATE_VIEW_JSON_FIELDS]).toEqual([
      'number',
      'url',
      'state',
      'isDraft',
      'mergeable',
      'mergeStateStatus',
      'headRefOid',
      'statusCheckRollup',
      'autoMergeRequest',
      'reviewRequests',
    ]);
  });
});

describe('parseStateView: latest run per check name', () => {
  // GitHub evaluates a check BY NAME through its latest run on the head
  // commit; superseded runs stay in the rollup as residue. Worked instance
  // (PR #846, 2026-08-13): a duplicated pull_request delivery left one CI
  // run concurrency-cancelled beside its green twin on the SAME sha, and
  // the undeduped read held CHECKS-RED against a head GitHub itself
  // evaluated as green.
  it('a concurrency-cancelled twin is superseded by the same-named later success', () => {
    const parsed = parseStateView({
      ...stateViewFixture(),
      statusCheckRollup: [
        {
          __typename: 'CheckRun',
          name: 'run-quality-gates',
          workflowName: 'CI',
          status: 'COMPLETED',
          conclusion: 'FAILURE',
          startedAt: '2026-08-13T21:17:17Z',
          completedAt: '2026-08-13T21:17:17Z',
        },
        {
          __typename: 'CheckRun',
          name: 'run-quality-gates',
          workflowName: 'CI',
          status: 'COMPLETED',
          conclusion: 'SUCCESS',
          startedAt: '2026-08-13T21:22:01Z',
          completedAt: '2026-08-13T21:22:04Z',
        },
        {
          __typename: 'CheckRun',
          name: 'browser-tests',
          workflowName: 'CI',
          status: 'COMPLETED',
          conclusion: 'CANCELLED',
          startedAt: '2026-08-13T21:17:17Z',
          completedAt: '2026-08-13T21:17:18Z',
        },
        {
          __typename: 'CheckRun',
          name: 'browser-tests',
          workflowName: 'CI',
          status: 'COMPLETED',
          conclusion: 'SUCCESS',
          startedAt: '2026-08-13T21:18:00Z',
          completedAt: '2026-08-13T21:20:12Z',
        },
      ],
    });
    expect(parsed.namedChecks).toEqual([
      { name: 'run-quality-gates', bucket: 'passed' },
      { name: 'browser-tests', bucket: 'passed' },
    ]);
    expect(parsed.checks).toEqual({ total: 2, passed: 2, failed: 0, pending: 0 });
  });

  it('an anchor tie resolves to the more-blocking item in either array order', () => {
    // gh timestamps are second-granularity; twins can complete in the same
    // second. Array order is not contractual, so a tie must never green.
    const tied = (first: string, second: string): readonly Record<string, unknown>[] => [
      {
        __typename: 'CheckRun',
        name: 'build',
        status: 'COMPLETED',
        conclusion: first,
        completedAt: '2026-08-13T21:17:17Z',
      },
      {
        __typename: 'CheckRun',
        name: 'build',
        status: 'COMPLETED',
        conclusion: second,
        completedAt: '2026-08-13T21:17:17Z',
      },
    ];
    for (const rollup of [tied('SUCCESS', 'FAILURE'), tied('FAILURE', 'SUCCESS')]) {
      const parsed = parseStateView({ ...stateViewFixture(), statusCheckRollup: rollup });
      expect(parsed.namedChecks).toEqual([{ name: 'build', bucket: 'failed' }]);
    }
  });

  it('an undated failure survives a dated success in either array order', () => {
    // Undated does not mean older: when either side has no parseable
    // anchor, recency is unknowable and the more-blocking item stands.
    const dated = {
      __typename: 'CheckRun',
      name: 'unit-tests',
      status: 'COMPLETED',
      conclusion: 'SUCCESS',
      completedAt: '2026-08-13T21:25:00Z',
    };
    const undated = {
      __typename: 'CheckRun',
      name: 'unit-tests',
      status: 'COMPLETED',
      conclusion: 'FAILURE',
    };
    for (const rollup of [
      [dated, undated],
      [undated, dated],
    ]) {
      const parsed = parseStateView({ ...stateViewFixture(), statusCheckRollup: rollup });
      expect(parsed.namedChecks).toEqual([{ name: 'unit-tests', bucket: 'failed' }]);
    }
  });

  it('two undated same-named items resolve to the more-blocking one in either order', () => {
    const green = {
      __typename: 'CheckRun',
      name: 'lint',
      status: 'COMPLETED',
      conclusion: 'SUCCESS',
    };
    const red = {
      __typename: 'CheckRun',
      name: 'lint',
      status: 'COMPLETED',
      conclusion: 'FAILURE',
    };
    for (const rollup of [
      [green, red],
      [red, green],
    ]) {
      const parsed = parseStateView({ ...stateViewFixture(), statusCheckRollup: rollup });
      expect(parsed.namedChecks).toEqual([{ name: 'lint', bucket: 'failed' }]);
    }
  });

  it('a StatusContext never joins the reduction — a same-named CheckRun cannot displace it', () => {
    // GitHub already collapses commit statuses per context; a CheckRun
    // sharing a status's name is a DIFFERENT check, and both count.
    const parsed = parseStateView({
      ...stateViewFixture(),
      statusCheckRollup: [
        { __typename: 'StatusContext', context: 'deploy', state: 'FAILURE' },
        {
          __typename: 'CheckRun',
          name: 'deploy',
          status: 'COMPLETED',
          conclusion: 'SUCCESS',
          completedAt: '2026-08-13T21:25:00Z',
        },
      ],
    });
    expect(parsed.namedChecks).toEqual([
      { name: 'deploy', bucket: 'failed' },
      { name: 'deploy', bucket: 'passed' },
    ]);
    expect(parsed.checks).toEqual({ total: 2, passed: 1, failed: 1, pending: 0 });
  });

  it('a newer failure listed before its older green twin still reads failed (array order is not recency)', () => {
    const parsed = parseStateView({
      ...stateViewFixture(),
      statusCheckRollup: [
        {
          __typename: 'CheckRun',
          name: 'unit-tests',
          status: 'COMPLETED',
          conclusion: 'FAILURE',
          completedAt: '2026-08-13T21:25:00Z',
        },
        {
          __typename: 'CheckRun',
          name: 'unit-tests',
          status: 'COMPLETED',
          conclusion: 'SUCCESS',
          completedAt: '2026-08-13T21:17:17Z',
        },
      ],
    });
    expect(parsed.namedChecks).toEqual([{ name: 'unit-tests', bucket: 'failed' }]);
  });

  it('an unparseable timestamp is undated — a garbage-dated failure survives a valid-dated success in either order', () => {
    const garbage = {
      __typename: 'CheckRun',
      name: 'install',
      status: 'COMPLETED',
      conclusion: 'FAILURE',
      completedAt: 'not-a-timestamp',
    };
    const dated = {
      __typename: 'CheckRun',
      name: 'install',
      status: 'COMPLETED',
      conclusion: 'SUCCESS',
      completedAt: '2026-08-13T21:25:00Z',
    };
    for (const rollup of [
      [garbage, dated],
      [dated, garbage],
    ]) {
      const parsed = parseStateView({ ...stateViewFixture(), statusCheckRollup: rollup });
      expect(parsed.namedChecks).toEqual([{ name: 'install', bucket: 'failed' }]);
    }
  });

  it('an undated queued re-run outranks its dated green predecessor in either order — no premature settlement', () => {
    const done = {
      __typename: 'CheckRun',
      name: 'build',
      status: 'COMPLETED',
      conclusion: 'SUCCESS',
      completedAt: '2026-08-13T21:17:17Z',
    };
    const queued = { __typename: 'CheckRun', name: 'build', status: 'QUEUED', conclusion: null };
    for (const rollup of [
      [done, queued],
      [queued, done],
    ]) {
      const parsed = parseStateView({ ...stateViewFixture(), statusCheckRollup: rollup });
      expect(parsed.namedChecks).toEqual([{ name: 'build', bucket: 'pending' }]);
    }
  });

  it('the workflow/name key never conflates on concatenation ambiguity', () => {
    // ('CI', 'extra build') and ('CI extra', 'build') concatenate equal
    // under a naive space join; they are different checks and both count.
    const parsed = parseStateView({
      ...stateViewFixture(),
      statusCheckRollup: [
        {
          __typename: 'CheckRun',
          name: 'extra build',
          workflowName: 'CI',
          status: 'COMPLETED',
          conclusion: 'FAILURE',
          completedAt: '2026-08-13T21:17:17Z',
        },
        {
          __typename: 'CheckRun',
          name: 'build',
          workflowName: 'CI extra',
          status: 'COMPLETED',
          conclusion: 'SUCCESS',
          completedAt: '2026-08-13T21:25:00Z',
        },
      ],
    });
    expect(parsed.checks).toEqual({ total: 2, passed: 1, failed: 1, pending: 0 });
  });

  it('same-named checks from different workflows never conflate', () => {
    const parsed = parseStateView({
      ...stateViewFixture(),
      statusCheckRollup: [
        {
          __typename: 'CheckRun',
          name: 'Analyze (python)',
          workflowName: 'CodeQL',
          status: 'COMPLETED',
          conclusion: 'FAILURE',
          completedAt: '2026-08-13T21:17:17Z',
        },
        {
          __typename: 'CheckRun',
          name: 'Analyze (python)',
          workflowName: 'Code Quality',
          status: 'COMPLETED',
          conclusion: 'SUCCESS',
          completedAt: '2026-08-13T21:25:00Z',
        },
      ],
    });
    expect(parsed.checks).toEqual({ total: 2, passed: 1, failed: 1, pending: 0 });
  });

  it('a newer in-progress re-run supersedes an older completed conclusion', () => {
    const parsed = parseStateView({
      ...stateViewFixture(),
      statusCheckRollup: [
        {
          __typename: 'CheckRun',
          name: 'unit-tests',
          status: 'COMPLETED',
          conclusion: 'FAILURE',
          completedAt: '2026-08-13T21:17:17Z',
        },
        {
          __typename: 'CheckRun',
          name: 'unit-tests',
          status: 'IN_PROGRESS',
          conclusion: null,
          startedAt: '2026-08-13T21:30:00Z',
        },
      ],
    });
    expect(parsed.namedChecks).toEqual([{ name: 'unit-tests', bucket: 'pending' }]);
  });

  it('a newer failure supersedes an older success — the dangerous direction stays red', () => {
    const parsed = parseStateView({
      ...stateViewFixture(),
      statusCheckRollup: [
        {
          __typename: 'CheckRun',
          name: 'secret-scan',
          status: 'COMPLETED',
          conclusion: 'SUCCESS',
          completedAt: '2026-08-13T21:17:17Z',
        },
        {
          __typename: 'CheckRun',
          name: 'secret-scan',
          status: 'COMPLETED',
          conclusion: 'FAILURE',
          completedAt: '2026-08-13T21:25:00Z',
        },
      ],
    });
    expect(parsed.namedChecks).toEqual([{ name: 'secret-scan', bucket: 'failed' }]);
    expect(parsed.checksGreenAt).toBeNull();
  });

  it('an unanchored item never displaces an anchored incumbent', () => {
    // Conservative: residue is out-ranked only by a DATED successor — an
    // undatable green must not silence a dated failure.
    const parsed = parseStateView({
      ...stateViewFixture(),
      statusCheckRollup: [
        {
          __typename: 'CheckRun',
          name: 'static-checks',
          status: 'COMPLETED',
          conclusion: 'FAILURE',
          completedAt: '2026-08-13T21:17:17Z',
        },
        {
          __typename: 'CheckRun',
          name: 'static-checks',
          status: 'COMPLETED',
          conclusion: 'SUCCESS',
        },
      ],
    });
    expect(parsed.namedChecks).toEqual([{ name: 'static-checks', bucket: 'failed' }]);
  });

  it('superseded residue no longer nulls checksGreenAt', () => {
    const parsed = parseStateView({
      ...stateViewFixture(),
      statusCheckRollup: [
        {
          __typename: 'CheckRun',
          name: 'build',
          status: 'COMPLETED',
          conclusion: 'CANCELLED',
          startedAt: '2026-08-13T21:17:17Z',
          completedAt: '2026-08-13T21:17:18Z',
        },
        {
          __typename: 'CheckRun',
          name: 'build',
          status: 'COMPLETED',
          conclusion: 'SUCCESS',
          startedAt: '2026-08-13T21:18:00Z',
          completedAt: '2026-08-13T21:19:30Z',
        },
      ],
    });
    expect(parsed.checksGreenAt).toBe('2026-08-13T21:19:30Z');
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
