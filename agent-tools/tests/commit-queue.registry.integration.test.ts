import { chmod, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { uuidV5Schema } from '../src/collaboration-state/agent-id';
import {
  commitQueueDirForActivePath,
  readCommitQueueEntries,
} from '../src/collaboration-state/commit-queue-store';
import { ACTIVE_CLAIMS_SCHEMA_VERSION } from '../src/collaboration-state/types';
import { enqueueCommitIntent } from '../src/commit-queue/enqueue';
import { readRegistry, updateRegistry } from '../src/commit-queue/registry';
import { type CommitIntent } from '../src/commit-queue/types';
import {
  makeTempDirectory,
  readText,
  removeDirectory,
  writeText,
} from './test-helpers/temp-collaboration-state';

const NOW = '2026-08-18T12:00:00.000Z';

const AGENT_ID = {
  agent_name: 'Prismatic Waxing Constellation',
  platform: 'codex',
  model: 'gpt-5.5',
  session_id_prefix: '019dcd',
  // Deterministic v5 derived from '019dcd' under the collaboration-identity
  // namespace; the same stable write-side identity fixture the unit tests use.
  id: uuidV5Schema.parse('e2e793c7-923e-5baa-97f0-2bedfb9b6b50'),
};

const CLAIM = {
  claim_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  agent_id: AGENT_ID,
  thread: 'queue-ephemera',
  areas: [{ kind: 'git', patterns: ['index/head'] }],
  claimed_at: NOW,
  intent: 'Crash-atomicity fixture claim.',
};

const INTENT: CommitIntent = {
  intent_id: '11111111-1111-4111-8111-111111111111',
  claim_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  agent_id: AGENT_ID,
  files: ['agent-tools/src/commit-queue/index.ts'],
  commit_subject: 'feat(queue): crash-window fixture',
  queued_at: NOW,
  updated_at: NOW,
  expires_at: '2026-08-18T13:00:00.000Z',
  phase: 'queued',
  queued_seq: 0,
};

describe('readRegistry — the legacy migration runs on the wall clock, never a caller view clock', () => {
  let root: string;
  let activePath: string;
  let queueDir: string;

  // Live against the REAL clock: the migration's liveness filter decides
  // which legacy rows survive to the store, and after the cure that filter
  // sees the wall clock whatever the caller passes as a view clock.
  const liveUpdatedAt = new Date(Date.now() - 60 * 1000).toISOString();

  function legacyRegistryText(): string {
    return `${JSON.stringify(
      {
        schema_version: '1.3.0',
        claims: [CLAIM],
        commit_queue: [{ ...INTENT, queued_at: liveUpdatedAt, updated_at: liveUpdatedAt }],
      },
      null,
      2,
    )}\n`;
  }

  beforeEach(async () => {
    root = await makeTempDirectory('oak-commit-queue-migration-clock-');
    activePath = join(root, 'active-claims.json');
    queueDir = commitQueueDirForActivePath(activePath);
    await writeText(activePath, legacyRegistryText());
  });

  afterEach(async () => {
    await removeDirectory(root);
  });

  it('preserves live legacy intents when a far-future --now reaches the read', async () => {
    // `--now` is a READ-command view clock. Routing it into the one-time
    // migration would let a read-only invocation judge every live legacy
    // row expired and DELETE it — the destructive twin of a view.
    await readRegistry(activePath, { nowIso: '2099-01-01T00:00:00.000Z' });

    const stored = await readCommitQueueEntries({
      queueDir,
      nowIso: new Date().toISOString(),
    });
    expect(stored.map((entry) => entry.intent_id)).toStrictEqual([INTENT.intent_id]);
  });
});

describe('updateRegistry — a failed store write cannot strand claims-file state', () => {
  let root: string;
  let activePath: string;
  let queueDir: string;
  let seededText: string;

  beforeEach(async () => {
    root = await makeTempDirectory('oak-commit-queue-registry-');
    activePath = join(root, 'active-claims.json');
    queueDir = commitQueueDirForActivePath(activePath);
    seededText = `${JSON.stringify(
      { schema_version: ACTIVE_CLAIMS_SCHEMA_VERSION, claims: [CLAIM] },
      null,
      2,
    )}\n`;
    await writeText(activePath, seededText);
    // A real but READ-ONLY store directory: every store READ succeeds (the
    // pre-transaction composed read must pass), and only the intent-file
    // WRITE fails — landing the failure inside the split-write window
    // review finding 1 names, deterministically.
    await mkdir(queueDir, { recursive: true });
    await chmod(queueDir, 0o555);
  });

  afterEach(async () => {
    await chmod(queueDir, 0o755);
    await removeDirectory(root);
  });

  it('leaves the claims file byte-unchanged when the enqueue dies at the store write', async () => {
    await expect(
      updateRegistry(
        activePath,
        (registry) => enqueueCommitIntent({ registry, draft: INTENT }),
        NOW,
      ),
    ).rejects.toThrow(/EACCES.*commit-queue/);

    // No claims-file residue may reference the intent whose store file was
    // never created: the enqueue either lands whole or leaves no trace.
    expect(await readText(activePath)).toBe(seededText);
  });
});
