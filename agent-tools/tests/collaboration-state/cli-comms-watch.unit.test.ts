import { describe, expect, it } from 'vitest';

import { watchComms } from '../../src/collaboration-state/cli-comms-watch';
import { type Options } from '../../src/collaboration-state/cli-options';
import {
  type CollaborationStateEnvironment,
  type CommsEvent,
} from '../../src/collaboration-state/types';
import { parseWatcherHeartbeat } from '../../src/collaboration-state/watcher-heartbeat';
import { createFakeCollaborationRuntime } from './fake-collaboration-runtime';

const EMPTY_ENV: CollaborationStateEnvironment = {};
const COMMS_DIR = '/comms';
const SEEN_FILE = '/seen/watcher.json';
const DERIVED_HEARTBEAT = `${SEEN_FILE}.heartbeat.json`;

function watchOptions(
  values: Record<string, string>,
  excludeTags: readonly string[] = [],
): Options {
  return {
    command: 'comms',
    topic: 'watch',
    values: new Map(Object.entries(values)),
    files: [],
    areaPatterns: [],
    tags: [],
    excludeTags,
    positionals: [],
  };
}

/** An event authored by someone OTHER than the watcher, so it is not self-excluded. */
function otherAgentEvent(eventId: string): CommsEvent {
  return {
    schema_version: '2.0.0',
    event_id: eventId,
    created_at: '2026-06-10T00:00:00Z',
    kind: 'narrative',
    author: {
      agent_name: 'Other Agent',
      platform: 'claude',
      model: 'test',
      session_id_prefix: 'oth123',
    },
    title: `event ${eventId}`,
    body: 'test body',
  };
}

/** Capture stdout for a runtime — `watchComms` refuses to run without one. */
function captureStdout(runtime: ReturnType<typeof createFakeCollaborationRuntime>['runtime']): {
  readonly runtime: typeof runtime;
  readonly streamed: string[];
} {
  const streamed: string[] = [];
  return {
    runtime: {
      ...runtime,
      stdout: {
        write: (text: string): boolean => {
          streamed.push(text);
          return true;
        },
      },
    },
    streamed,
  };
}

/**
 * Drive one bounded watch pass (a single drainable non-self event,
 * `--no-auto-seed` so it is replayed rather than seeded-past, `--agent-name`
 * for a deterministic override identity). The loop never ends on an emission
 * count (per-pass semantics, MCP-229), so the pass is bounded by the F-101
 * supervisor probe: alive through the first pass's two checks (loop-top +
 * heartbeat tick), dead at the next loop-top — the probe choreography this
 * file pins. The single live iteration emits the event and fires the
 * heartbeat tick exactly once.
 */
async function runOneWatchPass(extraOptions: Record<string, string>): Promise<{
  readonly heartbeatAt: (path: string) => string | undefined;
  readonly streamed: readonly string[];
}> {
  let aliveChecks = 0;
  const fake = createFakeCollaborationRuntime({
    comms: { [COMMS_DIR]: [otherAgentEvent('evt-1')] },
    processIsAlive: () => {
      aliveChecks += 1;
      return aliveChecks <= 2;
    },
  });
  const captured = captureStdout(fake.runtime);

  await watchComms(
    watchOptions({
      'comms-dir': COMMS_DIR,
      'seen-file': SEEN_FILE,
      'agent-name': 'Watcher Self',
      platform: 'claude',
      model: 'test',
      'session-prefix': 'self99',
      'max-events-per-drain': '1',
      'no-auto-seed': 'true',
      'supervisor-pid': '999999',
      ...extraOptions,
    }),
    EMPTY_ENV,
    captured.runtime,
  );

  return { heartbeatAt: (path) => fake.readTextFile(path), streamed: captured.streamed };
}

describe('watchComms — stdout boundary (stream-only output)', () => {
  it('refuses to run without a streaming stdout surface (consumption without delivery)', async () => {
    const fake = createFakeCollaborationRuntime({
      comms: { [COMMS_DIR]: [otherAgentEvent('evt-1')] },
    });

    await expect(
      watchComms(
        watchOptions({
          'comms-dir': COMMS_DIR,
          'seen-file': SEEN_FILE,
          'agent-name': 'Watcher Self',
          platform: 'claude',
          model: 'test',
          'session-prefix': 'self99',
        }),
        EMPTY_ENV,
        fake.runtime,
      ),
    ).rejects.toThrow(/requires a streaming stdout surface/u);
    // Refused at the boundary: nothing was drained, nothing marked seen.
    expect(fake.readSeenIds(SEEN_FILE)).toStrictEqual([]);
  });
});

describe('watchComms — liveness default-on (Luminous c2)', () => {
  it('writes a schema-valid heartbeat at the derived <seen-file>.heartbeat.json on a default invocation', async () => {
    const { heartbeatAt } = await runOneWatchPass({});

    const heartbeatText = heartbeatAt(DERIVED_HEARTBEAT);
    expect(heartbeatText).toBeDefined();
    const heartbeat = parseWatcherHeartbeat(heartbeatText ?? '');
    expect(heartbeat.watcher_identity.agent_name).toBe('Watcher Self');
  });

  it('writes NO heartbeat when --no-heartbeat opts out', async () => {
    const { heartbeatAt } = await runOneWatchPass({ 'no-heartbeat': 'true' });

    expect(heartbeatAt(DERIVED_HEARTBEAT)).toBeUndefined();
  });

  it('honours an explicit --heartbeat-file over the derived default', async () => {
    const explicitPath = '/custom/heartbeat.json';
    const { heartbeatAt } = await runOneWatchPass({ 'heartbeat-file': explicitPath });

    const heartbeatText = heartbeatAt(explicitPath);
    expect(heartbeatText).toBeDefined();
    const heartbeat = parseWatcherHeartbeat(heartbeatText ?? '');
    expect(heartbeat.watcher_identity.agent_name).toBe('Watcher Self');
    expect(heartbeatAt(DERIVED_HEARTBEAT)).toBeUndefined();
  });
});

describe('watchComms — supervisor-death detection (F-101 refined-(i) kill-tree)', () => {
  it('self-exits without draining or writing a heartbeat when --supervisor-pid is already dead, announcing the exit in-band', async () => {
    const fake = createFakeCollaborationRuntime({
      comms: { [COMMS_DIR]: [otherAgentEvent('evt-1')] },
      processIsAlive: () => false,
    });
    const captured = captureStdout(fake.runtime);

    const output = await watchComms(
      watchOptions({
        'comms-dir': COMMS_DIR,
        'seen-file': SEEN_FILE,
        'agent-name': 'Watcher Self',
        platform: 'claude',
        model: 'test',
        'session-prefix': 'self99',
        'no-auto-seed': 'true',
        'supervisor-pid': '999999',
      }),
      EMPTY_ENV,
      captured.runtime,
    );

    // Supervisor dead at the first top-of-iteration check → the loop returns
    // BEFORE draining the available event or firing the heartbeat tick; the
    // only stream output is the exit line.
    expect(output).toBe('');
    expect(captured.streamed.join('')).toBe(
      '--- WATCHER EXIT --- reason=supervisor-gone emitted_count=0\n',
    );
    expect(fake.readTextFile(DERIVED_HEARTBEAT)).toBeUndefined();
  });

  it('processes normally, writes a heartbeat, and ends the stream with the exit line when --supervisor-pid dies later', async () => {
    const { heartbeatAt, streamed } = await runOneWatchPass({});

    const heartbeatText = heartbeatAt(DERIVED_HEARTBEAT);
    expect(heartbeatText).toBeDefined();
    const heartbeat = parseWatcherHeartbeat(heartbeatText ?? '');
    expect(heartbeat.watcher_identity.agent_name).toBe('Watcher Self');
    expect(streamed.join('')).toContain('evt-1');
    expect(streamed.at(-1)).toBe('--- WATCHER EXIT --- reason=supervisor-gone emitted_count=1\n');
  });

  it('does NOT write a heartbeat once the supervisor dies mid-pass (no false-liveness heartbeat after death)', async () => {
    let aliveChecks = 0;
    const fake = createFakeCollaborationRuntime({
      comms: { [COMMS_DIR]: [otherAgentEvent('evt-1')] },
      // Alive at the loop's top-of-iteration check, dead at the heartbeat tick's
      // own check — models the supervisor dying during the drain/emit step.
      processIsAlive: () => {
        aliveChecks += 1;
        return aliveChecks < 2;
      },
    });
    const captured = captureStdout(fake.runtime);

    await watchComms(
      watchOptions({
        'comms-dir': COMMS_DIR,
        'seen-file': SEEN_FILE,
        'agent-name': 'Watcher Self',
        platform: 'claude',
        model: 'test',
        'session-prefix': 'self99',
        'max-events-per-drain': '1',
        'no-auto-seed': 'true',
        'supervisor-pid': '999999',
      }),
      EMPTY_ENV,
      captured.runtime,
    );

    // The top-check passes (alive) so the event is processed, but the tick's
    // own supervisor check then sees it gone and SKIPS the write — the F-101
    // guard against refreshing the heartbeat after the agent session died.
    // The iteration still finishes (wait), and the NEXT top-check exits: three
    // probe calls under the per-pass loop (top, tick, top).
    expect(aliveChecks).toBe(3);
    expect(fake.readTextFile(DERIVED_HEARTBEAT)).toBeUndefined();
  });
});

describe('watchComms — sanctioned --exclude-tag boundary (F-146)', () => {
  function heartbeatEvent(eventId: string): CommsEvent {
    return { ...otherAgentEvent(eventId), tags: ['heartbeat'] };
  }

  const BASE_OPTIONS: Record<string, string> = {
    'comms-dir': COMMS_DIR,
    'seen-file': SEEN_FILE,
    'agent-name': 'Watcher Self',
    platform: 'claude',
    model: 'test',
    'session-prefix': 'self99',
    'max-events-per-drain': '1',
    'no-auto-seed': 'true',
    'supervisor-pid': '999999',
  };

  it('threads a canonical exclusion through to the drain: heartbeat suppressed from output, both ids marked seen', async () => {
    const fake = createFakeCollaborationRuntime({
      comms: { [COMMS_DIR]: [heartbeatEvent('hb-evt'), otherAgentEvent('real-evt')] },
      // State-described probe: alive until the real event has been marked
      // seen; the tick then sees the supervisor gone (markSeen precedes tick)
      // and the next loop-top exits. Heartbeat absence is fine here — this
      // test pins the exclusion, not the liveness surface.
      processIsAlive: () => !fake.readSeenIds(SEEN_FILE).includes('real-evt'),
    });
    const captured = captureStdout(fake.runtime);

    await watchComms(watchOptions(BASE_OPTIONS, ['heartbeat']), EMPTY_ENV, captured.runtime);

    const output = captured.streamed.join('');
    expect(output).toContain('real-evt');
    expect(output).not.toContain('hb-evt');
    const seenIds = fake.readSeenIds(SEEN_FILE);
    expect(seenIds).toContain('real-evt');
    expect(seenIds).toContain('hb-evt');
  });

  it('rejects an unknown exclude tag at the boundary, before any comms IO', async () => {
    const fake = createFakeCollaborationRuntime({
      comms: { [COMMS_DIR]: [otherAgentEvent('evt-1')] },
    });
    const captured = captureStdout(fake.runtime);

    await expect(
      watchComms(watchOptions(BASE_OPTIONS, ['hearbeat']), EMPTY_ENV, captured.runtime),
    ).rejects.toThrow(/unknown comms event tag: 'hearbeat'/u);
    expect(fake.readTextFile(DERIVED_HEARTBEAT)).toBeUndefined();
  });

  it('rejects a duplicate exclude tag at the boundary', async () => {
    const fake = createFakeCollaborationRuntime({
      comms: { [COMMS_DIR]: [otherAgentEvent('evt-1')] },
    });
    const captured = captureStdout(fake.runtime);

    await expect(
      watchComms(
        watchOptions(BASE_OPTIONS, ['heartbeat', 'heartbeat']),
        EMPTY_ENV,
        captured.runtime,
      ),
    ).rejects.toThrow(/duplicate comms event tag: 'heartbeat'/u);
  });
});
