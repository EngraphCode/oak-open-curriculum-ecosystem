import { describe, expect, it } from 'vitest';

import { runCollaborationStateCli } from '../../src/collaboration-state';
import { uuidV5Schema } from '../../src/collaboration-state/agent-id';
import { type CollaborationAgentId, type CommsEvent } from '../../src/collaboration-state/types';
import { createFakeCollaborationRuntime } from './fake-collaboration-runtime';

// Live peers carry an id (the write schema requires it); peer-liveness routes
// by id, so the fixtures must too (branded via the schema).
const pangolin: CollaborationAgentId = {
  agent_name: 'Pangolin weaves Nightfall',
  platform: 'claude',
  model: 'claude-opus-4-8',
  session_id_prefix: 'c680e4',
  id: uuidV5Schema.parse('11111111-1111-5111-9111-111111111111'),
};

const avocet: CollaborationAgentId = {
  agent_name: 'Avocet tracks Crag',
  platform: 'claude',
  model: 'claude-opus-4-8',
  session_id_prefix: '30fe5b',
  id: uuidV5Schema.parse('22222222-2222-5222-9222-222222222222'),
};

// A historical pre-PDR-076a row: id-less. Must be skipped, never throw.
const legacyIdless: CollaborationAgentId = {
  agent_name: 'Ancient Drifting Relic',
  platform: 'claude',
  model: 'claude-opus-4-7',
  session_id_prefix: 'aa0000',
};

const commsDir = 'state/comms';
const NOW = '2026-06-28T12:00:00Z';

function heartbeat(author: CollaborationAgentId, eventId: string, createdAt: string): CommsEvent {
  return {
    schema_version: '2.0.0',
    event_id: eventId,
    created_at: createdAt,
    kind: 'narrative',
    author,
    title: `Heartbeat: ${author.agent_name}`,
    body: 'active; claim=x; intent=x; branch=b; cycle=c',
    tags: ['heartbeat'],
  };
}

function lifecycleHeartbeat(
  author: CollaborationAgentId,
  eventId: string,
  createdAt: string,
): CommsEvent {
  return {
    schema_version: '2.0.0',
    event_id: eventId,
    created_at: createdAt,
    kind: 'lifecycle',
    event_type: 'heartbeat',
    occurred_at: createdAt,
    author,
    agent_id: author,
    thread: 'estate-coordination',
    claim_id: 'claim-1',
    title: `Heartbeat: ${author.agent_name}`,
    subject: `Heartbeat: ${author.agent_name}`,
    body: 'active; claim=x; intent=x; branch=b; cycle=c',
  };
}

describe('comms peer-liveness', () => {
  it('classifies peers from the heartbeat event stream, most-stale-first', async () => {
    const events: readonly CommsEvent[] = [
      // Pangolin: latest heartbeat 11 min before NOW → retired (the F-75 "fires" case).
      heartbeat(pangolin, 'pangolin-old', '2026-06-28T11:30:00Z'),
      heartbeat(pangolin, 'pangolin-latest', '2026-06-28T11:49:00Z'),
      // Avocet: 1 min before NOW → active.
      heartbeat(avocet, 'avocet-latest', '2026-06-28T11:59:00Z'),
      // A historical id-less heartbeat must be skipped, never throw or appear.
      heartbeat(legacyIdless, 'legacy-idless', '2026-06-28T11:55:00Z'),
      // A non-heartbeat narrative from a third agent must be ignored.
      {
        schema_version: '2.0.0',
        event_id: 'noise',
        created_at: '2026-06-28T11:58:00Z',
        kind: 'narrative',
        author: avocet,
        title: 'not a heartbeat',
        body: 'prose',
      },
    ];
    const fake = createFakeCollaborationRuntime({ comms: { [commsDir]: events } });

    const result = await runCollaborationStateCli({
      argv: ['--', 'comms', 'peer-liveness', '--comms-dir', commsDir, '--now', NOW],
      env: {},
      io: fake.runtime.io,
    });

    expect(result.exitCode).toBe(0);
    const lines = result.stdout.trimEnd().split('\n');
    expect(lines[0]).toBe(
      'comms peer-liveness — 2 peer(s) with heartbeats, most stale first ' +
        '(PDR-078: active <4m / offline 4-10m / retired >=10m)',
    );
    // Most-stale-first: Pangolin (retired) leads, classified off its LATEST heartbeat.
    // The who-label carries the MCP-145 display token (prefix-idTail); every
    // reported peer is id-bearing by construction (id-less authors are skipped).
    expect(lines[1]).toContain('retired');
    expect(lines[1]).toContain('Pangolin weaves Nightfall/c680e4-111');
    expect(lines[1]).toContain('last_heartbeat=2026-06-28T11:49:00Z');
    expect(lines[2]).toContain('active');
    expect(lines[2]).toContain('Avocet tracks Crag/30fe5b-222');
    // The id-less historical row is skipped (PDR-076a: not a live peer).
    expect(result.stdout).not.toContain('Ancient Drifting Relic');
  });

  it('classifies a peer from an UNTAGGED ADR-186 lifecycle-shaped heartbeat (dual-filter consumer at the CLI seam)', async () => {
    const events: readonly CommsEvent[] = [
      // A migrated seat whose lifecycle heartbeat carries no tag at all —
      // the lifecycle clause alone must keep it out of false retirement.
      lifecycleHeartbeat(avocet, 'avocet-lifecycle', '2026-06-28T11:59:00Z'),
      // A legacy narrative+tag peer in the same stream (the window mix).
      heartbeat(pangolin, 'pangolin-legacy', '2026-06-28T11:58:00Z'),
    ];
    const fake = createFakeCollaborationRuntime({ comms: { [commsDir]: events } });

    const result = await runCollaborationStateCli({
      argv: ['--', 'comms', 'peer-liveness', '--comms-dir', commsDir, '--now', NOW],
      env: {},
      io: fake.runtime.io,
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('2 peer(s) with heartbeats');
    expect(result.stdout).toContain('Avocet tracks Crag/30fe5b-222');
    expect(result.stdout).toContain('Pangolin weaves Nightfall/c680e4-111');
    expect(result.stdout).toContain('last_heartbeat=2026-06-28T11:59:00Z');
  });

  // The MCP-145 distinct-labels case: two seats sharing agent_name AND
  // session_id_prefix (a name+prefix collision across sessions) are distinct
  // peers by id, and the id-tail token keeps their report lines visually
  // distinct — the defect class the disambiguator exists to cure.
  it('renders distinct who-labels for two peers sharing a name and a prefix', async () => {
    const firstTwin: CollaborationAgentId = {
      agent_name: 'Twin echoes Prefix',
      platform: 'claude',
      model: 'claude-opus-4-8',
      session_id_prefix: 'dd44ee',
      id: uuidV5Schema.parse('44444444-4444-5444-9444-444444444abc'),
    };
    const secondTwin: CollaborationAgentId = {
      ...firstTwin,
      id: uuidV5Schema.parse('55555555-5555-5555-9555-555555555def'),
    };
    const events: readonly CommsEvent[] = [
      heartbeat(firstTwin, 'first-twin-latest', '2026-06-28T11:58:00Z'),
      heartbeat(secondTwin, 'second-twin-latest', '2026-06-28T11:59:00Z'),
    ];
    const fake = createFakeCollaborationRuntime({ comms: { [commsDir]: events } });

    const result = await runCollaborationStateCli({
      argv: ['--', 'comms', 'peer-liveness', '--comms-dir', commsDir, '--now', NOW],
      env: {},
      io: fake.runtime.io,
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Twin echoes Prefix/dd44ee-abc');
    expect(result.stdout).toContain('Twin echoes Prefix/dd44ee-def');
  });

  it('reports no peer heartbeats when the stream has none', async () => {
    const fake = createFakeCollaborationRuntime({ comms: { [commsDir]: [] } });

    const result = await runCollaborationStateCli({
      argv: ['--', 'comms', 'peer-liveness', '--comms-dir', commsDir, '--now', NOW],
      env: {},
      io: fake.runtime.io,
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe('no peer heartbeats found\n');
  });

  it('rejects a malformed --now with a clear error', async () => {
    const fake = createFakeCollaborationRuntime({ comms: { [commsDir]: [] } });

    const result = await runCollaborationStateCli({
      argv: ['--', 'comms', 'peer-liveness', '--comms-dir', commsDir, '--now', 'not-a-date'],
      env: {},
      io: fake.runtime.io,
    });

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('--now must be an ISO-8601 timestamp (got: not-a-date)');
  });
});
