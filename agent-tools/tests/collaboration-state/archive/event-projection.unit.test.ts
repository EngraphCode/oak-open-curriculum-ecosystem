import { describe, expect, it } from 'vitest';

import { toClassifiableEvent } from '../../../src/collaboration-state/archive/event-projection';
import type {
  DirectedCommsMessage,
  LifecycleCommsEvent,
  NarrativeCommsEvent,
} from '../../../src/collaboration-state/types';

const agent = {
  agent_name: 'Anvil spins Bronze',
  platform: 'claude-code',
  model: 'Opus 4.8',
  session_id_prefix: '9cd858',
} as const;

describe('toClassifiableEvent', () => {
  it('projects a narrative event, using title and defaulting absent tags to empty', () => {
    const event: NarrativeCommsEvent = {
      schema_version: '2.0.0',
      event_id: 'aaaaaaaa-1111-4111-8111-111111111111',
      created_at: '2026-06-01T00:00:00Z',
      kind: 'narrative',
      author: agent,
      title: 'Team start: Anvil spins Bronze',
      body: 'hello team',
    };
    expect(toClassifiableEvent(event)).toEqual({
      eventId: 'aaaaaaaa-1111-4111-8111-111111111111',
      kind: 'narrative',
      createdAt: '2026-06-01T00:00:00Z',
      tags: [],
      titleOrSubject: 'Team start: Anvil spins Bronze',
      bodyLength: 'hello team'.length,
      isHeartbeatShaped: false,
    });
  });

  it('projects a directed message using subject (not title) and carries its tags', () => {
    const event: DirectedCommsMessage = {
      schema_version: '2.0.0',
      event_id: 'bbbbbbbb-2222-4222-8222-222222222222',
      created_at: '2026-06-02T00:00:00Z',
      kind: 'directed',
      message_kind: 'coordination-notice',
      from: agent,
      to: agent,
      subject: 'ArcAngel channel open',
      body: 'tail it',
      tags: ['behaviour-note'],
    };
    const projected = toClassifiableEvent(event);
    expect(projected.titleOrSubject).toBe('ArcAngel channel open');
    expect(projected.tags).toEqual(['behaviour-note']);
    expect(projected.kind).toBe('directed');
    expect(projected.isHeartbeatShaped).toBe(false);
  });

  it("projects an UNTAGGED lifecycle event with event_type 'heartbeat' as heartbeat-shaped (ADR-186 dual filter at the projection seam)", () => {
    const event: LifecycleCommsEvent = {
      schema_version: '2.0.0',
      event_id: 'cccccccc-3333-4333-8333-333333333333',
      created_at: '2026-06-03T00:00:00Z',
      kind: 'lifecycle',
      event_type: 'heartbeat',
      occurred_at: '2026-06-03T00:00:00Z',
      author: agent,
      agent_id: agent,
      thread: 'estate-coordination',
      claim_id: 'claim-1',
      title: 'Heartbeat: Anvil spins Bronze',
      subject: 'Heartbeat: Anvil spins Bronze',
      body: 'active; claim=c; intent=i; branch=b; cycle=y',
    };
    const projected = toClassifiableEvent(event);
    expect(projected.isHeartbeatShaped).toBe(true);
    expect(projected.kind).toBe('lifecycle');
    expect(projected.titleOrSubject).toBe('Heartbeat: Anvil spins Bronze');
  });

  it('projects a legacy narrative + heartbeat-tag event as heartbeat-shaped', () => {
    const event: NarrativeCommsEvent = {
      schema_version: '2.0.0',
      event_id: 'dddddddd-4444-4444-8444-444444444444',
      created_at: '2026-06-04T00:00:00Z',
      kind: 'narrative',
      author: agent,
      title: 'Heartbeat: Anvil spins Bronze',
      body: 'active; claim=c; intent=i; branch=b; cycle=y',
      tags: ['heartbeat'],
    };
    expect(toClassifiableEvent(event).isHeartbeatShaped).toBe(true);
  });

  it('projects a non-heartbeat lifecycle event as NOT heartbeat-shaped', () => {
    const event: LifecycleCommsEvent = {
      schema_version: '2.0.0',
      event_id: 'eeeeeeee-5555-4555-8555-555555555555',
      created_at: '2026-06-05T00:00:00Z',
      kind: 'lifecycle',
      event_type: 'claim_lifecycle',
      occurred_at: '2026-06-05T00:00:00Z',
      author: agent,
      agent_id: agent,
      thread: 'estate-coordination',
      claim_id: 'claim-1',
      title: 'Claim closed: 44616c39',
      subject: 'Claim closed: 44616c39',
      body: 'closed with summary',
    };
    expect(toClassifiableEvent(event).isHeartbeatShaped).toBe(false);
  });
});
