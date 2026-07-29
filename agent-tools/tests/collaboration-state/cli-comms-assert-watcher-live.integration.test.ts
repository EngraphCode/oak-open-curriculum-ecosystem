/**
 * Integration coverage for `comms assert-watcher-live` (F-95 Option A)
 * through the real CLI dispatcher and an injected heartbeat adapter. The
 * product owns classification and path selection; the fake supplies literal
 * heartbeat text + mtime without making the test ask the filesystem to work.
 */
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { runCollaborationStateCli } from '../../src/collaboration-state';
import { deriveOverrideCollaborationIdentity } from '../../src/collaboration-state/identity';
import { type WatcherStalenessIo } from '../../src/collaboration-state/watcher-staleness';

const codename = 'Seal hunts Offing';
const sessionPrefix = '8210d6';
const repoRoot = '/coordination';
const canonicalCommsDir = join(repoRoot, '.agent/state/collaboration/comms');
const commsSeenDir = join(repoRoot, '.agent/state/collaboration/comms-seen');

const sessionIdentity = deriveOverrideCollaborationIdentity({
  agent_name: codename,
  platform: 'override',
  model: 'override',
  session_id_prefix: sessionPrefix,
});

function heartbeatJson(watchedCommsDir = canonicalCommsDir): string {
  return JSON.stringify({
    schema_version: '0.2.0',
    watched_comms_dir: watchedCommsDir,
    pid: 4242,
    started_at: '2026-06-25T08:00:00.000Z',
    last_drain_at: '2026-06-25T08:00:00.000Z',
    last_emit_at: '2026-06-25T08:00:00.000Z',
    last_error_at: null,
    emitted_count: 3,
    heartbeat_interval_ms: 30000,
    watcher_identity: sessionIdentity,
  });
}

function stalenessIo(input: {
  readonly mtimeMs: number | 'missing';
  readonly heartbeatText?: string;
}): WatcherStalenessIo {
  const heartbeatText = input.heartbeatText ?? heartbeatJson();
  return {
    statMtimeMs: () => Promise.resolve(input.mtimeMs),
    readTextFile: () => Promise.resolve(heartbeatText),
  };
}

function runAssert(
  io: WatcherStalenessIo,
  extraArgs: readonly string[] = ['--comms-seen-dir', commsSeenDir],
) {
  return runCollaborationStateCli({
    argv: [
      '--',
      'comms',
      'assert-watcher-live',
      '--agent-name',
      codename,
      '--session-prefix',
      sessionPrefix,
      ...extraArgs,
    ],
    env: {},
    cwd: repoRoot,
    resolveCoordinationHome: () => repoRoot,
    watcherStalenessIo: io,
  });
}

describe('comms assert-watcher-live', () => {
  it('exits 0 when this session has a fresh canonical-source heartbeat', async () => {
    const result = await runAssert(stalenessIo({ mtimeMs: Date.now() }));

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(`comms watcher live for ${codename}`);
  });

  it('exits non-zero when a fresh matching heartbeat watches a decoy comms source', async () => {
    const result = await runAssert(
      stalenessIo({
        mtimeMs: Date.now(),
        heartbeatText: heartbeatJson('/decoy/.agent/state/collaboration/comms'),
      }),
    );

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('different comms source');
  });

  it('exits non-zero with a move-1 fix instruction when no heartbeat exists', async () => {
    const result = await runAssert(stalenessIo({ mtimeMs: 'missing' }));

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('no comms watcher heartbeat');
    expect(result.stderr).toContain('start-right-team move 1');
  });

  it('exits non-zero when the heartbeat mtime has aged out', async () => {
    const result = await runAssert(stalenessIo({ mtimeMs: 0 }));

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('aged out');
  });

  it('honours an explicit --heartbeat-file override', async () => {
    const explicit = join(repoRoot, 'relocated.heartbeat.json');
    const result = await runAssert(stalenessIo({ mtimeMs: Date.now() }), [
      '--heartbeat-file',
      explicit,
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(explicit);
  });
});
