import { describe, expect, it } from 'vitest';

import { watcherExitLine } from '../../src/collaboration-state/comms-watch-errors';
import {
  watchCommsLoop,
  type WatcherErrorKind,
} from '../../src/collaboration-state/comms-watch-loop';
import { type DrainResult } from '../../src/collaboration-state/types';

// The per-step deadline (hang-but-run) behaviour is pinned in the sibling
// `comms-watch-loop-deadlines.unit.test.ts`.

const ONE_PAYLOAD: DrainResult = { output: 'payload\n', eventCount: 1, eventIds: ['evt'] };

function emptyDrain(): DrainResult {
  return { output: '', eventCount: 0, eventIds: [] };
}

function describeStream(...payloads: readonly DrainResult[]): {
  readonly drain: () => Promise<DrainResult>;
  readonly drainCalls: () => number;
} {
  let cursor = 0;
  let calls = 0;
  return {
    drain: async () => {
      calls += 1;
      const next = payloads[cursor] ?? emptyDrain();
      cursor = Math.min(cursor + 1, payloads.length - 1 < 0 ? 0 : payloads.length);
      return next;
    },
    drainCalls: () => calls,
  };
}

/**
 * State-described supervisor terminator: the supervisor "lives" until the
 * state the test describes has been reached, then the next loop-top probe
 * exits the watch. This replaced the retired lifetime-budget terminator
 * (`maxEvents`) when the bound became per-pass (MCP-229) — the loop itself
 * never ends on an emission count. The fixed probe cap turns an
 * unsatisfiable predicate into a red assertion instead of a CI hang: a
 * microtask-only loop starves vitest's own timeout timer, so without the
 * cap a predicate that never fires pins a core until the outer wall-clock
 * kills the job. Every current predicate fires within four probes.
 */
function aliveUntil(done: () => boolean, maxProbes = 50): () => boolean {
  let probes = 0;
  return () => {
    probes += 1;
    return probes <= maxProbes && !done();
  };
}

const EXIT_LINE = watcherExitLine;

describe('watchCommsLoop — contract per FM-2 cure (2026-05-23) + per-pass bound (MCP-229)', () => {
  it('emits drained text and marks the same event IDs seen — the pass bound never ends the watch', async () => {
    const emitted: string[] = [];
    const marked: (readonly string[])[] = [];
    const drainPayload: DrainResult = {
      output: 'one\ntwo\n',
      eventCount: 2,
      eventIds: ['evt-one', 'evt-two'],
    };

    const stream = describeStream(drainPayload);

    await watchCommsLoop({
      maxEventsPerDrain: 2,
      drain: stream.drain,
      waitForChange: async () => undefined,
      emit: async (text) => {
        emitted.push(text);
      },
      markSeen: async (eventIds) => {
        marked.push(eventIds);
      },
      supervisorAlive: aliveUntil(() => marked.length >= 1),
    });

    // The batch was delivered whole and the loop then exited on supervisor
    // death — never on the emission count — announcing itself in-band.
    expect(emitted).toStrictEqual(['one\ntwo\n', EXIT_LINE('supervisor-gone', 2)]);
    expect(marked).toStrictEqual([['evt-one', 'evt-two']]);
    expect(stream.drainCalls()).toBe(1);
  });

  it('runs pass after pass through the bound — lifetime is independent of event traffic (MCP-229)', async () => {
    const emitted: string[] = [];
    const stream = describeStream(
      { output: 'a\n', eventCount: 1, eventIds: ['a'] },
      { output: 'b\n', eventCount: 1, eventIds: ['b'] },
      { output: 'c\n', eventCount: 1, eventIds: ['c'] },
    );

    await watchCommsLoop({
      maxEventsPerDrain: 1,
      drain: stream.drain,
      waitForChange: async () => undefined,
      emit: async (text) => {
        emitted.push(text);
      },
      markSeen: async () => undefined,
      supervisorAlive: aliveUntil(
        () => emitted.filter((text) => !text.startsWith('---')).length >= 3,
      ),
    });

    // Three single-event passes sailed straight through the old lifetime
    // ceiling; the cumulative count appears only in the exit diagnostics.
    expect(emitted).toStrictEqual(['a\n', 'b\n', 'c\n', EXIT_LINE('supervisor-gone', 3)]);
    expect(stream.drainCalls()).toBe(3);
  });

  it('calls markSeen only AFTER emit succeeds (Zephyrous post-emit-seen invariant)', async () => {
    const sequence: string[] = [];
    const drainPayload: DrainResult = {
      output: 'payload\n',
      eventCount: 1,
      eventIds: ['evt-one'],
    };
    const stream = describeStream(drainPayload);

    await watchCommsLoop({
      maxEventsPerDrain: 1,
      drain: stream.drain,
      waitForChange: async () => undefined,
      emit: async () => {
        sequence.push('emit');
      },
      markSeen: async () => {
        sequence.push('markSeen');
      },
      supervisorAlive: aliveUntil(() => sequence.includes('markSeen')),
    });

    // The trailing 'emit' is the WATCHER EXIT line.
    expect(sequence).toStrictEqual(['emit', 'markSeen', 'emit']);
  });

  it('fires the tick callback on every loop iteration with the latest status snapshot', async () => {
    const ticks: number[] = [];
    const stream = describeStream(
      { output: 'a\n', eventCount: 1, eventIds: ['a'] },
      { output: 'b\n', eventCount: 1, eventIds: ['b'] },
    );

    await watchCommsLoop({
      maxEventsPerDrain: 2,
      drain: stream.drain,
      waitForChange: async () => undefined,
      emit: async () => undefined,
      markSeen: async () => undefined,
      tick: async (status) => {
        ticks.push(status.emittedCount);
      },
      supervisorAlive: aliveUntil(() => ticks.length >= 2),
    });

    // emittedCount stays monotonic per process — the heartbeat's
    // emitted_count contract.
    expect(ticks).toStrictEqual([1, 2]);
  });

  it('fires tick even when the drain step yields no events (quiet-stream heartbeat — Zephyrous slice 1)', async () => {
    const ticks: number[] = [];
    let drainCalls = 0;
    let waits = 0;

    await watchCommsLoop({
      maxEventsPerDrain: 1,
      drain: async () => {
        drainCalls += 1;
        if (drainCalls === 1) {
          return emptyDrain();
        }
        return { output: 'finally\n', eventCount: 1, eventIds: ['final'] };
      },
      waitForChange: async () => {
        waits += 1;
      },
      emit: async () => undefined,
      markSeen: async () => undefined,
      tick: async (status) => {
        ticks.push(status.emittedCount);
      },
      supervisorAlive: aliveUntil(() => ticks.length >= 2),
    });

    expect(drainCalls).toBe(2);
    // Every non-fatal pass waits — including the emitting one (backlog pacing).
    expect(waits).toBe(2);
    expect(ticks).toStrictEqual([0, 1]);
  });

  it('emits a WATCHER ERROR line when drain throws and continues the loop (Zephyrous slice 2 + slice 3 — bad event file no silent kill)', async () => {
    const emitted: string[] = [];
    const ticks: number[] = [];
    let drainCalls = 0;
    let waits = 0;

    await watchCommsLoop({
      maxEventsPerDrain: 1,
      drain: async () => {
        drainCalls += 1;
        if (drainCalls === 1) {
          throw new Error('malformed JSON event file');
        }
        return { output: 'recovered\n', eventCount: 1, eventIds: ['evt-recovered'] };
      },
      waitForChange: async () => {
        waits += 1;
      },
      emit: async (text) => {
        emitted.push(text);
      },
      markSeen: async () => undefined,
      tick: async (status) => {
        ticks.push(status.emittedCount);
      },
      supervisorAlive: aliveUntil(() => emitted.includes('recovered\n')),
    });

    expect(emitted.length).toBeGreaterThanOrEqual(3);
    expect(emitted[0]).toContain('--- WATCHER ERROR ---');
    expect(emitted[0]).toContain('kind=drain');
    expect(emitted[0]).toContain('malformed JSON event file');
    expect(emitted).toContain('recovered\n');
    expect(emitted.at(-1)).toBe(EXIT_LINE('supervisor-gone', 1));
    // A recoverable drain failure costs exactly ONE tick and ONE wait — the
    // failing pass paces like any other (never a doubled or skipped cadence).
    expect(ticks).toStrictEqual([0, 1]);
    expect(waits).toBe(2);
  });

  it('emits a WATCHER ERROR when markSeen throws AND includes the event_ids (Zephyrous slice 5 — preservation constraint)', async () => {
    const emitted: string[] = [];

    await watchCommsLoop({
      maxEventsPerDrain: 1,
      drain: async () => ({
        output: 'payload\n',
        eventCount: 1,
        eventIds: ['evt-a', 'evt-b'],
      }),
      waitForChange: async () => undefined,
      emit: async (text) => {
        emitted.push(text);
      },
      markSeen: async () => {
        throw new Error('seen-file write failed');
      },
      supervisorAlive: aliveUntil(() => emitted.some((text) => text.includes('kind=markSeen'))),
    });

    const errorLine = emitted.find((text) => text.includes('--- WATCHER ERROR ---'));
    expect(errorLine).toBeDefined();
    expect(errorLine).toContain('kind=markSeen');
    expect(errorLine).toContain('seen-file write failed');
    expect(errorLine).toContain('event_ids=evt-a,evt-b');
  });

  it('does NOT mark events seen when emit throws — one tick and one wait per iteration, events re-emit on the next', async () => {
    const emitted: string[] = [];
    const marked: (readonly string[])[] = [];
    const ticks: number[] = [];
    let waits = 0;
    let emitCalls = 0;

    await watchCommsLoop({
      maxEventsPerDrain: 1,
      drain: async () => ({
        output: 'payload\n',
        eventCount: 1,
        eventIds: ['evt-one'],
      }),
      waitForChange: async () => {
        waits += 1;
      },
      emit: async (text) => {
        emitCalls += 1;
        // The first emit attempt of the iteration fails; every subsequent
        // emit succeeds. The fake does not introspect the text — call-count
        // is the sole switch, so changes to the watcher's error-line format
        // do not silently re-wire this test.
        if (emitCalls === 1) {
          throw new Error('stdout write failed');
        }
        emitted.push(text);
      },
      markSeen: async (eventIds) => {
        marked.push(eventIds);
      },
      tick: async (status) => {
        ticks.push(status.emittedCount);
      },
      supervisorAlive: aliveUntil(() => marked.length >= 1),
    });

    // The loop emits 4 things across the two iterations:
    //   1) iteration 1 attempts to emit the payload — throws
    //   2) iteration 1 emits WATCHER ERROR kind=emit (via the swallow-safe
    //      error-reporter; counted as emit call 2, succeeds)
    //   3) iteration 2 drains the same event again (still unseen) and
    //      emits the payload successfully (counted as emit call 3, succeeds)
    //   4) the WATCHER EXIT line after the supervisor probe fires
    expect(emitCalls).toBe(4);
    // markSeen fires exactly once — only after the payload emit succeeded
    // on iteration 2; the iteration-1 attempt left the event unseen.
    expect(marked).toStrictEqual([['evt-one']]);
    // A recoverable emit failure costs exactly ONE tick and ONE wait for the
    // iteration — never a doubled cadence (the pre-MCP-229 polarity defect).
    expect(ticks).toStrictEqual([0, 1]);
    expect(waits).toBe(2);
    expect(emitted.some((text) => text.includes('kind=emit'))).toBe(true);
    expect(emitted.includes('payload\n')).toBe(true);
  });

  // The throwing waitForChange is itself the wait-unreached assertion: the
  // loop contract forbids a rejecting waitForChange, so reaching it after a
  // fatal ruling would reject the whole watch and fail the test.
  it.each<{ kind: WatcherErrorKind; expectedCountAtExit: number }>([
    { kind: 'drain', expectedCountAtExit: 0 },
    { kind: 'emit', expectedCountAtExit: 0 },
    { kind: 'markSeen', expectedCountAtExit: 1 },
  ])(
    'a fatal ruling on the $kind step exits the loop: cause line first, reason=fatal-step last (pre-MCP-229 polarity defect made emit/markSeen continue)',
    async ({ kind, expectedCountAtExit }) => {
      const emitted: string[] = [];
      const errorKinds: WatcherErrorKind[] = [];

      await watchCommsLoop({
        maxEventsPerDrain: 1,
        drain: async () => {
          if (kind === 'drain') {
            throw new Error('drain step failed');
          }
          return ONE_PAYLOAD;
        },
        waitForChange: async () => {
          throw new Error('waitForChange must not be reached after fatal');
        },
        emit: async (text) => {
          if (kind === 'emit' && text === ONE_PAYLOAD.output) {
            throw new Error('emit step failed');
          }
          emitted.push(text);
        },
        markSeen: async () => {
          if (kind === 'markSeen') {
            throw new Error('markSeen step failed');
          }
        },
        onError: async (errorKind) => {
          errorKinds.push(errorKind);
          return true;
        },
      });

      expect(errorKinds).toStrictEqual([kind]);
      // Cause line immediately before the outcome line, outcome line last.
      // (For markSeen the successfully-emitted payload precedes both.)
      expect(emitted.at(-2)).toContain(`kind=${kind}`);
      expect(emitted.at(-1)).toBe(EXIT_LINE('fatal-step', expectedCountAtExit));
    },
  );

  it('a fatal ruling on the excluded-ids markSeen exits the loop the same way (F-146 fatal path)', async () => {
    const emitted: string[] = [];

    await watchCommsLoop({
      maxEventsPerDrain: 1,
      drain: async () => ({
        output: '',
        eventCount: 0,
        eventIds: [],
        excludedEventIds: ['hb-1'],
      }),
      waitForChange: async () => {
        throw new Error('waitForChange must not be reached after fatal');
      },
      emit: async (text) => {
        emitted.push(text);
      },
      markSeen: async () => {
        throw new Error('excluded markSeen failed');
      },
      onError: async () => true,
    });

    expect(emitted[0]).toContain('kind=markSeen');
    expect(emitted.at(-1)).toBe(EXIT_LINE('fatal-step', 0));
  });

  it('treats onError throwing as non-fatal — the loop continues', async () => {
    let drainCalls = 0;

    await watchCommsLoop({
      maxEventsPerDrain: 1,
      drain: async () => {
        drainCalls += 1;
        if (drainCalls === 1) {
          throw new Error('first failure');
        }
        return { output: 'ok\n', eventCount: 1, eventIds: ['evt-ok'] };
      },
      waitForChange: async () => undefined,
      emit: async () => undefined,
      markSeen: async () => undefined,
      onError: async () => {
        throw new Error('onError itself failed');
      },
      supervisorAlive: aliveUntil(() => drainCalls >= 2),
    });

    expect(drainCalls).toBe(2);
  });

  it('does NOT kill the watcher when tick throws (heartbeat failures must not be fatal)', async () => {
    let tickCalls = 0;
    let emitCalls = 0;

    await watchCommsLoop({
      maxEventsPerDrain: 1,
      drain: async () => ({ output: 'ok\n', eventCount: 1, eventIds: ['evt-ok'] }),
      waitForChange: async () => undefined,
      emit: async () => {
        emitCalls += 1;
      },
      markSeen: async () => undefined,
      tick: async () => {
        tickCalls += 1;
        throw new Error('heartbeat write failed');
      },
      supervisorAlive: aliveUntil(() => tickCalls >= 1),
    });

    expect(tickCalls).toBe(1);
    // Payload emit plus the WATCHER EXIT line.
    expect(emitCalls).toBe(2);
  });

  it('passes the per-pass batch bound to drain unchanged on every pass (never a decrementing budget)', async () => {
    const batchArgs: (number | undefined)[] = [];

    await watchCommsLoop({
      maxEventsPerDrain: 3,
      drain: async (batchLimit) => {
        batchArgs.push(batchLimit);
        return { output: 'one\n', eventCount: 1, eventIds: ['x'] };
      },
      waitForChange: async () => undefined,
      emit: async () => undefined,
      markSeen: async () => undefined,
      supervisorAlive: aliveUntil(() => batchArgs.length >= 3),
    });

    expect(batchArgs).toStrictEqual([3, 3, 3]);
  });
});

describe('watchCommsLoop — supervisor-death detection (F-101 refined-(i) kill-tree)', () => {
  it('self-exits the iteration after supervisorAlive reports the supervisor dead, announcing the reason in-band', async () => {
    let aliveChecks = 0;
    let drainCalls = 0;
    let waits = 0;
    const emitted: string[] = [];

    await watchCommsLoop({
      // Supervisor death is the ONLY exit — the loop is unbounded, exactly as
      // the live watcher runs; the pass bound never ends it.
      drain: async () => {
        drainCalls += 1;
        return emptyDrain();
      },
      waitForChange: async () => {
        waits += 1;
      },
      emit: async (text) => {
        emitted.push(text);
      },
      markSeen: async () => undefined,
      // Alive on the first check, dead on the second.
      supervisorAlive: async () => {
        aliveChecks += 1;
        return aliveChecks < 2;
      },
    });

    // The check sits at the TOP of each iteration: iteration 1 sees alive →
    // one drain + one wait; iteration 2 sees dead → emits the exit line and
    // returns BEFORE draining or waiting again.
    expect(aliveChecks).toBe(2);
    expect(drainCalls).toBe(1);
    expect(waits).toBe(1);
    expect(emitted).toStrictEqual([EXIT_LINE('supervisor-gone', 0)]);
  });

  it('exits immediately without draining when the supervisor is already dead at start', async () => {
    let drainCalls = 0;
    const emitted: string[] = [];

    await watchCommsLoop({
      drain: async () => {
        drainCalls += 1;
        return emptyDrain();
      },
      waitForChange: async () => undefined,
      emit: async (text) => {
        emitted.push(text);
      },
      markSeen: async () => undefined,
      supervisorAlive: async () => false,
    });

    expect(drainCalls).toBe(0);
    expect(emitted).toStrictEqual([EXIT_LINE('supervisor-gone', 0)]);
  });

  it('keeps running while supervisorAlive reports alive (no behaviour change on the live path)', async () => {
    let aliveChecks = 0;
    const emitted: string[] = [];
    const stream = describeStream({ output: 'a\n', eventCount: 1, eventIds: ['a'] });

    await watchCommsLoop({
      maxEventsPerDrain: 1,
      drain: stream.drain,
      waitForChange: async () => undefined,
      emit: async (text) => {
        emitted.push(text);
      },
      markSeen: async () => undefined,
      supervisorAlive: async () => {
        aliveChecks += 1;
        return !emitted.includes('a\n');
      },
    });

    // The payload was delivered on the live path; the exit came only from the
    // probe flipping afterwards.
    expect(emitted).toStrictEqual(['a\n', EXIT_LINE('supervisor-gone', 1)]);
    expect(aliveChecks).toBeGreaterThanOrEqual(1);
  });
});

describe('watchCommsLoop — excluded-event seen-marking (F-146)', () => {
  it('marks excluded ids seen even when the drain produced no emit output', async () => {
    const marked: (readonly string[])[] = [];
    const emitted: string[] = [];
    const stream = describeStream(
      { output: '', eventCount: 0, eventIds: [], excludedEventIds: ['hb-1', 'hb-2'] },
      { output: 'real\n', eventCount: 1, eventIds: ['real'] },
    );

    await watchCommsLoop({
      maxEventsPerDrain: 1,
      drain: stream.drain,
      waitForChange: async () => undefined,
      emit: async (text) => {
        emitted.push(text);
      },
      markSeen: async (eventIds) => {
        marked.push(eventIds);
      },
      supervisorAlive: aliveUntil(() => marked.some((ids) => ids.includes('real'))),
    });

    expect(emitted).toContain('real\n');
    expect(marked).toContainEqual(['hb-1', 'hb-2']);
    expect(marked).toContainEqual(['real']);
  });

  it('never counts excluded events toward emitted_count (they consume no bound and no diagnostics)', async () => {
    const emitted: string[] = [];
    const stream = describeStream(
      { output: 'one\n', eventCount: 1, eventIds: ['one'], excludedEventIds: ['hb-a', 'hb-b'] },
      { output: 'two\n', eventCount: 1, eventIds: ['two'], excludedEventIds: ['hb-c'] },
    );

    await watchCommsLoop({
      maxEventsPerDrain: 2,
      drain: stream.drain,
      waitForChange: async () => undefined,
      emit: async (text) => {
        emitted.push(text);
      },
      markSeen: async () => undefined,
      supervisorAlive: aliveUntil(() => emitted.includes('two\n')),
    });

    // Five events were drained across the two passes (2 payload + 3 excluded);
    // the exit line counts only the two emitted.
    expect(emitted).toStrictEqual(['one\n', 'two\n', EXIT_LINE('supervisor-gone', 2)]);
  });

  it('keeps events-owed-emission unmarked on emit failure while excluded ids still mark', async () => {
    const marked: (readonly string[])[] = [];
    let emitAttempts = 0;
    // A fixed two-result stream: the same owed payload twice models
    // redelivery after the first emit failure (unmarked events re-drain)
    // without embedding production logic in the fake.
    const owedPayload: DrainResult = {
      output: 'payload\n',
      eventCount: 1,
      eventIds: ['owed'],
      excludedEventIds: ['hb-x'],
    };
    const stream = describeStream(owedPayload, owedPayload);

    await watchCommsLoop({
      maxEventsPerDrain: 1,
      drain: stream.drain,
      waitForChange: async () => undefined,
      emit: async (text) => {
        emitAttempts += 1;
        if (emitAttempts === 1 && text === 'payload\n') {
          throw new Error('transient emit failure');
        }
      },
      markSeen: async (eventIds) => {
        marked.push(eventIds);
      },
      supervisorAlive: aliveUntil(() => marked.some((ids) => ids.includes('owed'))),
    });

    expect(marked).toContainEqual(['hb-x']);
    const owedMarks = marked.filter((ids) => ids.includes('owed'));
    expect(owedMarks).toHaveLength(1);
  });
});
