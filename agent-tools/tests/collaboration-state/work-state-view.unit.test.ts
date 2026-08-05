import { describe, expect, it } from 'vitest';

import { routingKeyFor } from '../../src/collaboration-state/active-agent-routing';
import { type ActiveAgentReport } from '../../src/collaboration-state/active-agents';
import { uuidV5Schema } from '../../src/collaboration-state/agent-id';
import { composeHeartbeatBody } from '../../src/collaboration-state/comms-heartbeat-body';
import { type CollaborationAgentId, type CommsEvent } from '../../src/collaboration-state/types';
import { type GitWorktree } from '../../src/collaboration-state/git-worktree-list';
import { projectWorkState } from '../../src/collaboration-state/work-state-view';

const NOW_MS = 1_000_000_000_000;

const kingfisher: CollaborationAgentId = {
  agent_name: 'Kingfisher seeks Moorings',
  platform: 'claude',
  model: 'claude-opus-4-8',
  session_id_prefix: '59a56d',
  id: uuidV5Schema.parse('11111111-1111-5111-9111-111111111111'),
};

const gannet: CollaborationAgentId = {
  agent_name: 'Gannet herds Altitude',
  platform: 'claude',
  model: 'claude-opus-4-8',
  session_id_prefix: '2f7b3c',
  id: uuidV5Schema.parse('22222222-2222-5222-9222-222222222222'),
};

let eventCounter = 0;

function heartbeat(author: CollaborationAgentId, branch: string, ageMs: number): CommsEvent {
  eventCounter += 1;
  return {
    schema_version: '2.0.0',
    event_id: `evt-${eventCounter}`,
    created_at: new Date(NOW_MS - ageMs).toISOString(),
    kind: 'narrative',
    author,
    title: `Heartbeat: ${author.agent_name}`,
    body: composeHeartbeatBody({
      claimId: 'c',
      intentId: 'c',
      branch,
      currentCycleLabel: 'cycle',
    }),
    tags: ['heartbeat'],
  };
}

function worktree(path: string, branch: string | undefined, head = 'abc1234'): GitWorktree {
  return branch === undefined ? { path, head } : { path, branch, head };
}

function activeAgent(identity: CollaborationAgentId, intent: string): ActiveAgentReport {
  return {
    routing_key: routingKeyFor(identity),
    visibility_status: 'active',
    collision_status: 'clear',
    identities: [identity],
    claims: [
      {
        claim_id: 'claim-1',
        thread: 'agent-operability',
        freshness_status: 'fresh',
        fresh_until: new Date(NOW_MS).toISOString(),
        intent,
      },
    ],
    commit_queue: [],
    closed_claims: [],
  };
}

describe('projectWorkState — derived cross-worktree work-state view (F-98 / spawn-flow Phase 2)', () => {
  it('binds a worktree to its agent via the heartbeat branch and enriches with claim intent', () => {
    const rows = projectWorkState({
      worktrees: [worktree('/repo/oak-spawn-flow', 'feat/spawn-worktree-view')],
      events: [heartbeat(kingfisher, 'feat/spawn-worktree-view', 60_000)],
      activeAgents: [activeAgent(kingfisher, 'Lane A Phase 2')],
      nowMs: NOW_MS,
    });

    expect(rows).toHaveLength(1);
    expect(rows[0].agent).toStrictEqual(kingfisher);
    expect(rows[0].intent).toBe('Lane A Phase 2');
    expect(rows[0].branch).toBe('feat/spawn-worktree-view');
  });

  it('renders last-seen recency from heartbeat event age (input-to-verify, NOT claim freshness)', () => {
    const rows = projectWorkState({
      worktrees: [worktree('/repo/wt', 'feat/x')],
      events: [heartbeat(kingfisher, 'feat/x', 5 * 60_000)],
      activeAgents: [],
      nowMs: NOW_MS,
    });

    expect(rows[0].lastSeen).toEqual({
      at: new Date(NOW_MS - 5 * 60_000).toISOString(),
      ageMs: 5 * 60_000,
      state: 'offline',
    });
  });

  it('leaves a worktree with no matching heartbeat unbound (agent/lastSeen absent)', () => {
    const rows = projectWorkState({
      worktrees: [worktree('/repo/unbound', 'feat/orphan')],
      events: [heartbeat(kingfisher, 'feat/other', 60_000)],
      activeAgents: [],
      nowMs: NOW_MS,
    });

    expect(rows[0].agent).toBeUndefined();
    expect(rows[0].lastSeen).toBeUndefined();
    expect(rows[0].branch).toBe('feat/orphan');
  });

  it('leaves a detached-HEAD worktree (no branch) unbound', () => {
    const rows = projectWorkState({
      worktrees: [worktree('/repo/detached', undefined)],
      events: [heartbeat(kingfisher, 'feat/x', 60_000)],
      activeAgents: [],
      nowMs: NOW_MS,
    });

    expect(rows[0].branch).toBeUndefined();
    expect(rows[0].agent).toBeUndefined();
  });

  it('orders rows by worktree path and binds each worktree to its own agent', () => {
    const rows = projectWorkState({
      worktrees: [worktree('/repo/b-lane', 'feat/b'), worktree('/repo/a-lane', 'feat/a')],
      events: [heartbeat(gannet, 'feat/b', 60_000), heartbeat(kingfisher, 'feat/a', 60_000)],
      activeAgents: [],
      nowMs: NOW_MS,
    });

    expect(rows.map((row) => row.worktreePath)).toStrictEqual(['/repo/a-lane', '/repo/b-lane']);
    expect(rows[0].agent).toStrictEqual(kingfisher);
    expect(rows[1].agent).toStrictEqual(gannet);
  });

  it('on a branch collision the most-recent heartbeat wins deterministically', () => {
    const rows = projectWorkState({
      worktrees: [worktree('/repo/wt', 'feat/shared')],
      events: [
        heartbeat(gannet, 'feat/shared', 30_000),
        heartbeat(kingfisher, 'feat/shared', 120_000),
      ],
      activeAgents: [],
      nowMs: NOW_MS,
    });

    expect(rows[0].agent).toStrictEqual(gannet);
  });

  it('breaks an exact-timestamp branch collision deterministically (order-independent)', () => {
    const a = heartbeat(kingfisher, 'feat/shared', 60_000);
    const b = heartbeat(gannet, 'feat/shared', 60_000);
    const base = {
      worktrees: [worktree('/repo/wt', 'feat/shared')],
      activeAgents: [],
      nowMs: NOW_MS,
    };

    const forward = projectWorkState({ ...base, events: [a, b] });
    const reversed = projectWorkState({ ...base, events: [b, a] });

    expect(forward[0].agent).toStrictEqual(reversed[0].agent);
  });

  it('binds a worktree to its agent through an UNTAGGED ADR-186 lifecycle-shaped heartbeat', () => {
    const lifecycleHeartbeat: CommsEvent = {
      schema_version: '2.0.0',
      event_id: 'evt-lifecycle-bound',
      created_at: new Date(NOW_MS - 30_000).toISOString(),
      kind: 'lifecycle',
      event_type: 'heartbeat',
      occurred_at: new Date(NOW_MS - 30_000).toISOString(),
      author: gannet,
      agent_id: gannet,
      thread: 'estate-coordination',
      claim_id: 'claim-1',
      title: `Heartbeat: ${gannet.agent_name}`,
      subject: `Heartbeat: ${gannet.agent_name}`,
      body: composeHeartbeatBody({
        claimId: 'c',
        intentId: 'c',
        branch: 'feat/lifecycle-bound',
        currentCycleLabel: 'cycle',
      }),
    };

    const rows = projectWorkState({
      worktrees: [worktree('/repo/wt-lifecycle', 'feat/lifecycle-bound')],
      events: [lifecycleHeartbeat],
      activeAgents: [],
      nowMs: NOW_MS,
    });

    expect(rows[0].agent).toStrictEqual(gannet);
  });
});
