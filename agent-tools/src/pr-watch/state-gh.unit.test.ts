import { describe, expect, it } from 'vitest';

import { readPrStateReading } from './state-gh.js';
import type { GhCommandExecutor } from './gh.js';

/**
 * IO-composition tests for `readPrStateReading` with an injected executor —
 * no real gh. The executor dispatches on argv shape, mirroring the surfaces
 * verified live 2026-07-21.
 */

const HEAD = 'f'.repeat(40);

function viewPayload(): string {
  return JSON.stringify({
    number: 461,
    state: 'OPEN',
    mergeable: 'MERGEABLE',
    mergeStateStatus: 'BLOCKED',
    headRefOid: HEAD,
    statusCheckRollup: [
      { __typename: 'CheckRun', name: 'secret-scan', status: 'COMPLETED', conclusion: 'SUCCESS' },
    ],
    autoMergeRequest: null,
    reviewRequests: [],
    latestReviews: [
      {
        author: { login: 'copilot' },
        state: 'COMMENTED',
        body: 'Reviewed.',
        commit: { oid: HEAD },
      },
    ],
  });
}

function threadsPayload(): string {
  return JSON.stringify([
    {
      data: {
        repository: {
          pullRequest: {
            reviewThreads: { totalCount: 2, nodes: [{ isResolved: true }, { isResolved: true }] },
          },
        },
      },
    },
  ]);
}

interface ExecutorScript {
  readonly agentTaskList?: string | Error;
  readonly agentTaskViews?: Readonly<Record<string, string>>;
}

function agentTaskResponse(script: ExecutorScript, args: readonly string[]): string {
  if (args[1] === 'list') {
    const listResult = script.agentTaskList ?? JSON.stringify([]);
    if (listResult instanceof Error) {
      throw listResult;
    }
    return listResult;
  }
  const id = args[2] ?? '';
  const view = script.agentTaskViews?.[id];
  if (view === undefined) {
    throw new Error(`unexpected agent-task view ${id}`);
  }
  return view;
}

function makeExecutor(script: ExecutorScript, calls: string[][]): GhCommandExecutor {
  const responders: readonly [string, (args: readonly string[]) => string][] = [
    ['pr', () => viewPayload()],
    ['api', () => threadsPayload()],
    ['agent-task', (args) => agentTaskResponse(script, args)],
  ];
  return (_file, args) => {
    calls.push([...args]);
    const responder = responders.find(([topic]) => topic === args[0]);
    if (responder === undefined) {
      throw new Error(`unexpected gh argv: ${args.join(' ')}`);
    }
    return responder[1](args);
  };
}

const ghSeam = { ghPath: '/usr/bin/gh', exists: () => true };

describe('readPrStateReading', () => {
  it('composes view, threads, and PR-scoped review runs into one reading', () => {
    const calls: string[][] = [];
    const reading = readPrStateReading({
      target: { number: 461 },
      ...ghSeam,
      execFileSync: makeExecutor(
        {
          agentTaskList: JSON.stringify([
            { id: 'live-1', name: 'Review from @jimCresswell', createdAt: 't', completedAt: null },
            { id: 'done-1', name: 'Review from @jimCresswell', createdAt: 't', completedAt: 't2' },
          ]),
          agentTaskViews: {
            'live-1': JSON.stringify({ id: 'live-1', completedAt: null, pullRequestNumber: 461 }),
            'done-1': JSON.stringify({ id: 'done-1', completedAt: 't2', pullRequestNumber: 999 }),
          },
        },
        calls,
      ),
    });
    expect(reading.number).toBe(461);
    expect(reading.checks).toEqual({ total: 1, passed: 1, failed: 0, pending: 0 });
    expect(reading.reviewThreads).toEqual({ total: 2, unresolved: 0 });
    // Only the run mapped to THIS PR survives; the other PR's run is filtered.
    expect(reading.reviewRuns).toEqual({
      kind: 'read',
      runs: [{ id: 'live-1', name: 'Review from @jimCresswell', completedAt: null }],
    });
  });

  it('degrades the runs leg to a typed unavailable when gh agent-task fails', () => {
    const calls: string[][] = [];
    const reading = readPrStateReading({
      target: { number: 461 },
      ...ghSeam,
      execFileSync: makeExecutor(
        { agentTaskList: new Error('unknown command "agent-task"') },
        calls,
      ),
    });
    expect(reading.reviewRuns.kind).toBe('unavailable');
    // The other legs still read — a missing preview command never blanks the verdict.
    expect(reading.checks.passed).toBe(1);
  });

  it('bounds run→PR mapping: live runs always mapped, completed capped at five', () => {
    const calls: string[][] = [];
    const completed = Array.from({ length: 9 }, (_, index) => ({
      id: `done-${index}`,
      name: 'Review from @jimCresswell',
      createdAt: 't',
      completedAt: 't2',
    }));
    const views = Object.fromEntries(
      completed.map((run) => [
        run.id,
        JSON.stringify({ id: run.id, completedAt: 't2', pullRequestNumber: 1 }),
      ]),
    );
    readPrStateReading({
      target: { number: 461 },
      ...ghSeam,
      execFileSync: makeExecutor(
        { agentTaskList: JSON.stringify(completed), agentTaskViews: views },
        calls,
      ),
    });
    const viewCalls = calls.filter((args) => args[0] === 'agent-task' && args[1] === 'view');
    expect(viewCalls).toHaveLength(5);
  });

  it('passes --repo through to the pr view leg', () => {
    const calls: string[][] = [];
    readPrStateReading({
      target: { number: 461, repo: 'oaknational/oak-open-curriculum-ecosystem' },
      ...ghSeam,
      execFileSync: makeExecutor({}, calls),
    });
    const prView = calls.find((args) => args[0] === 'pr' && args[1] === 'view');
    expect(prView).toContain('--repo');
    expect(prView).toContain('oaknational/oak-open-curriculum-ecosystem');
  });
});
