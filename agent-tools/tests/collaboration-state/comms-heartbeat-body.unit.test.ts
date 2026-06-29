import { describe, expect, it } from 'vitest';

import {
  composeHeartbeatBody,
  heartbeatBodyStateSchema,
  parseHeartbeatBody,
} from '../../src/collaboration-state/comms-heartbeat-body';

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
