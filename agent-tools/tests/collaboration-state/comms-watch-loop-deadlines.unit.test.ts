import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { watcherExitLine } from '../../src/collaboration-state/comms-watch-errors';
import {
  watchCommsLoop,
  WatcherTimeoutError,
  type WatcherErrorKind,
} from '../../src/collaboration-state/comms-watch-loop';
import { type DrainResult } from '../../src/collaboration-state/types';

/** A step that never settles — models the hang-but-run failure mode (2026-06-10). */
function neverResolves<T>(): Promise<T> {
  return new Promise<T>(() => undefined);
}

/** A void-returning step that never settles (the hang for `emit` / `markSeen`). */
function hangsForever(): Promise<void> {
  return new Promise<never>(() => undefined);
}

const ONE_PAYLOAD: DrainResult = { output: 'payload\n', eventCount: 1, eventIds: ['evt'] };

/**
 * State-described supervisor terminator — see the sibling
 * `comms-watch-loop.unit.test.ts` for the convention (MCP-229). The probe
 * cap turns an unsatisfiable predicate into a red test instead of a hang.
 */
function aliveUntil(done: () => boolean, maxProbes = 50): () => boolean {
  let probes = 0;
  return () => {
    probes += 1;
    return probes <= maxProbes && !done();
  };
}

const EXIT_LINE = watcherExitLine;

describe('watchCommsLoop — per-step deadlines fail loud (Luminous c1, hang-but-run cure 2026-06-10)', () => {
  const STEP_TIMEOUT_MS = 60_000;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('rejects with a kind=timeout diagnostic naming the step when DRAIN hangs, within the deadline', async () => {
    const emitted: string[] = [];

    const loop = watchCommsLoop({
      maxEventsPerDrain: 1,
      stepTimeoutMs: STEP_TIMEOUT_MS,
      drain: () => neverResolves<DrainResult>(),
      waitForChange: async () => undefined,
      emit: async (text) => {
        emitted.push(text);
      },
      markSeen: async () => undefined,
    });

    const rejection = expect(loop).rejects.toThrow(WatcherTimeoutError);
    await vi.advanceTimersByTimeAsync(STEP_TIMEOUT_MS);
    await rejection;

    const errorLine = emitted.find((text) => text.includes('--- WATCHER ERROR ---'));
    expect(errorLine).toBeDefined();
    expect(errorLine).toContain('kind=timeout');
    expect(errorLine).toContain('drain');
    // A disorderly death carries NO exit line — the non-zero exit is the signal.
    expect(emitted.some((text) => text.includes('--- WATCHER EXIT ---'))).toBe(false);
  });

  it('rejects naming the EMIT step when emit hangs — fail-loud even when the diagnostic channel is the hung one', async () => {
    const loop = watchCommsLoop({
      maxEventsPerDrain: 1,
      stepTimeoutMs: STEP_TIMEOUT_MS,
      drain: async () => ONE_PAYLOAD,
      waitForChange: async () => undefined,
      // The emit channel is permanently hung, so BOTH the payload emit and the
      // loop's own timeout-error report wedge on it. The loop must still exit
      // (reject), proving fail-loud does not depend on the diagnostic channel.
      // (The bounded report's behaviour in isolation is pinned directly on
      // reportTimeout in comms-watch-errors.unit.test.ts.)
      emit: () => hangsForever(),
      markSeen: async () => undefined,
    });

    const rejection = expect(loop).rejects.toThrow(/step "emit"/u);
    // Worst case is 2x the deadline: one for the hung emit step, one for the
    // hung error report bounded by reportTimeout.
    await vi.advanceTimersByTimeAsync(STEP_TIMEOUT_MS * 2);
    await rejection;
  });

  it('rejects with a kind=timeout diagnostic naming the step when MARKSEEN hangs, within the deadline', async () => {
    const emitted: string[] = [];

    const loop = watchCommsLoop({
      maxEventsPerDrain: 1,
      stepTimeoutMs: STEP_TIMEOUT_MS,
      drain: async () => ONE_PAYLOAD,
      waitForChange: async () => undefined,
      emit: async (text) => {
        emitted.push(text);
      },
      markSeen: () => hangsForever(),
    });

    const rejection = expect(loop).rejects.toThrow(WatcherTimeoutError);
    await vi.advanceTimersByTimeAsync(STEP_TIMEOUT_MS);
    await rejection;

    const errorLine = emitted.find((text) => text.includes('--- WATCHER ERROR ---'));
    expect(errorLine).toBeDefined();
    expect(errorLine).toContain('kind=timeout');
    expect(errorLine).toContain('markSeen');
  });

  it('does NOT time out when every step resolves within the deadline (normal operation unaffected)', async () => {
    const emitted: string[] = [];

    await watchCommsLoop({
      maxEventsPerDrain: 1,
      stepTimeoutMs: STEP_TIMEOUT_MS,
      drain: async () => ({ output: 'ok\n', eventCount: 1, eventIds: ['evt-ok'] }),
      waitForChange: async () => undefined,
      emit: async (text) => {
        emitted.push(text);
      },
      markSeen: async () => undefined,
      supervisorAlive: aliveUntil(() => emitted.includes('ok\n')),
    });

    expect(emitted).toStrictEqual(['ok\n', EXIT_LINE('supervisor-gone', 1)]);
  });

  it('a timed-out step is fatal regardless of onError (timeout is always non-recoverable)', async () => {
    const onErrorKinds: WatcherErrorKind[] = [];

    const loop = watchCommsLoop({
      maxEventsPerDrain: 1,
      stepTimeoutMs: STEP_TIMEOUT_MS,
      drain: () => neverResolves<DrainResult>(),
      waitForChange: async () => undefined,
      emit: async () => undefined,
      markSeen: async () => undefined,
      // onError returning false (non-fatal) must NOT rescue a timeout.
      onError: async (kind) => {
        onErrorKinds.push(kind);
        return false;
      },
    });

    const rejection = expect(loop).rejects.toThrow(WatcherTimeoutError);
    await vi.advanceTimersByTimeAsync(STEP_TIMEOUT_MS);
    await rejection;

    // The timeout path is fatal-by-construction and never consults onError —
    // onError must not be invoked AT ALL for a timed-out step.
    expect(onErrorKinds).toHaveLength(0);
  });
});
