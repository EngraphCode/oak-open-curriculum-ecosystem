import { describe, expect, it } from 'vitest';

import {
  composeHeartbeatBody,
  heartbeatBodyStateSchema,
  isHeartbeatEvent,
  parseHeartbeatBody,
} from '../../src/collaboration-state/comms-heartbeat-body';
import { type CommsEvent } from '../../src/collaboration-state/types';

describe('composeHeartbeatBody (Lane A — PDR-078 §5 mechanical state-binding)', () => {
  it('composes a deterministic single-line body from typed state', () => {
    const body = composeHeartbeatBody({
      claimId: 'a1b2c3d4',
      intentId: 'lane-a-a1',
      branch: 'docs/agent-collaboration-enhancements',
      currentCycleLabel: 'n2-enforcement-bundle',
    });

    expect(body).toBe(
      'active; claim=a1b2c3d4; intent=lane-a-a1; branch=docs/agent-collaboration-enhancements; cycle=n2-enforcement-bundle',
    );
  });

  it('rejects extra fields via strict schema (preserves typed-origin invariant)', () => {
    const parse = heartbeatBodyStateSchema.safeParse({
      claimId: 'x',
      intentId: 'y',
      branch: 'z',
      currentCycleLabel: 'c',
      free_form: 'not allowed',
    });

    expect(parse.success).toBe(false);
  });

  it('rejects missing fields (each state element required)', () => {
    const parse = heartbeatBodyStateSchema.safeParse({
      claimId: 'x',
      intentId: 'y',
    });

    expect(parse.success).toBe(false);
  });

  it('rejects empty-string values (cure is meaningful structured origin, not just typed origin)', () => {
    const parse = heartbeatBodyStateSchema.safeParse({
      claimId: '',
      intentId: 'y',
      branch: 'z',
      currentCycleLabel: 'c',
    });

    expect(parse.success).toBe(false);
  });

  it('throws when composeHeartbeatBody receives invalid state (defence in depth at call site)', () => {
    expect(() =>
      composeHeartbeatBody({
        claimId: '',
        intentId: 'y',
        branch: 'z',
        currentCycleLabel: 'c',
      }),
    ).toThrow();
  });
});

describe('parseHeartbeatBody (inverse of composeHeartbeatBody — SSOT for the body format)', () => {
  it('round-trips composeHeartbeatBody back to the typed state', () => {
    const state = {
      claimId: 'a63ac21a',
      intentId: 'a63ac21a',
      branch: 'feat/spawn-worktree-view',
      currentCycleLabel: 'Lane A Phase 2 derived view',
    };

    expect(parseHeartbeatBody(composeHeartbeatBody(state))).toEqual(state);
  });

  it('treats the cycle label as the rest of the line (it may contain ; and =)', () => {
    const parsed = parseHeartbeatBody(
      'active; claim=c1; intent=i1; branch=feat/x; cycle=phase 2; step=2; exit=DoD-or-handoff',
    );

    expect(parsed?.branch).toBe('feat/x');
    expect(parsed?.currentCycleLabel).toBe('phase 2; step=2; exit=DoD-or-handoff');
  });

  it('returns undefined for a non-heartbeat body', () => {
    expect(parseHeartbeatBody('some narrative prose')).toBeUndefined();
    expect(parseHeartbeatBody('active; claim=c1; branch=feat/x')).toBeUndefined();
  });
});

describe('isHeartbeatEvent (ADR-186 §Migration discipline dual filter — deliberate strict superset)', () => {
  const author = {
    agent_name: 'Anvil spins Bronze',
    platform: 'claude',
    model: 'claude-opus-4-8',
    session_id_prefix: '9cd858',
  } as const;

  function lifecycleEvent(eventType: string, tags?: readonly string[]): CommsEvent {
    return {
      schema_version: '2.0.0',
      event_id: 'evt-lifecycle',
      created_at: '2026-08-02T19:00:00Z',
      kind: 'lifecycle',
      event_type: eventType,
      occurred_at: '2026-08-02T19:00:00Z',
      author,
      agent_id: author,
      thread: 'estate-coordination',
      claim_id: 'claim-1',
      title: 'Heartbeat: Anvil spins Bronze',
      subject: 'Heartbeat: Anvil spins Bronze',
      body: 'active; claim=c; intent=i; branch=b; cycle=y',
      ...(tags === undefined ? {} : { tags }),
    };
  }

  function narrativeEvent(tags?: readonly string[]): CommsEvent {
    return {
      schema_version: '2.0.0',
      event_id: 'evt-narrative',
      created_at: '2026-08-02T19:00:00Z',
      kind: 'narrative',
      author,
      title: 'Heartbeat: Anvil spins Bronze',
      body: 'active; claim=c; intent=i; branch=b; cycle=y',
      ...(tags === undefined ? {} : { tags }),
    };
  }

  it("recognises the lifecycle shape by event_type 'heartbeat' alone (no tag)", () => {
    expect(isHeartbeatEvent(lifecycleEvent('heartbeat'))).toBe(true);
  });

  it('recognises the legacy narrative + tag shape', () => {
    expect(isHeartbeatEvent(narrativeEvent(['heartbeat']))).toBe(true);
  });

  it('recognises a migration-window event carrying BOTH discriminators', () => {
    expect(isHeartbeatEvent(lifecycleEvent('heartbeat', ['heartbeat']))).toBe(true);
  });

  it("does not recognise a lifecycle event whose event_type is the near-miss typo 'heatbeat' with no tag — the ADR-186 §What-this-costs typo exposure", () => {
    expect(isHeartbeatEvent(lifecycleEvent('heatbeat'))).toBe(false);
  });

  it("still recognises a typo'd lifecycle event when the migration-window tag is present (the tag clause is the safety net)", () => {
    expect(isHeartbeatEvent(lifecycleEvent('heatbeat', ['heartbeat']))).toBe(true);
  });

  it('does not recognise an untagged narrative event, whatever its title', () => {
    expect(isHeartbeatEvent(narrativeEvent())).toBe(false);
  });

  it('does not recognise a lifecycle event of a different event_type', () => {
    expect(isHeartbeatEvent(lifecycleEvent('claim_lifecycle'))).toBe(false);
  });

  it('recognises a heartbeat-tagged directed event — the tag clause is deliberately kind-agnostic (a superset can only over-count liveness, never under-count into false retirement)', () => {
    const directed: CommsEvent = {
      schema_version: '2.0.0',
      event_id: 'evt-directed',
      created_at: '2026-08-02T19:00:00Z',
      kind: 'directed',
      message_kind: 'coordination-notice',
      from: author,
      to: author,
      subject: 'carries heartbeat semantics compositionally',
      body: 'x',
      tags: ['heartbeat'],
    };
    expect(isHeartbeatEvent(directed)).toBe(true);
  });
});
