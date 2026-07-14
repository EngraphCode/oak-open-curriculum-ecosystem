import { execFileSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { runAgentToolsCli } from '../src/bin/agent-tools-cli';
import type { CommitIntent, CommitQueueRegistry } from '../src/commit-queue';
import { readRegistry } from '../src/commit-queue/registry';

/**
 * F-138 regression tests — the commit-queue two-root split.
 *
 * The pinned F-138 mechanism: `runCommitQueueTopic` collapsed the registry
 * root (the coordination home — the PRIMARY checkout) and the git root (the
 * INVOKING worktree) into one `repoRoot`, so from a linked worktree every
 * staged read fingerprinted the primary's index (empty for the intent's
 * pathspec) and the workflow auto-abandoned a valid intent.
 *
 * These tests build a real scratch primary + linked worktree, stage in the
 * WORKTREE, drive the ceremony through the real CLI boundary, and prove the
 * staged reads and the inner commit operate against the worktree while the
 * registry lands in the coordination home. The guard test proves that when
 * the invoking cwd has no derivable git root, the CLI refuses loudly instead
 * of silently falling back to the coordination home's index.
 */

const CLAIM_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const INTENT_ID = '11111111-1111-4111-8111-111111111111';
const INTENT_FILE = 'notes/change.md';
const COMMIT_SUBJECT = 'feat(f138): stage from the linked worktree';
const REGISTRY_REL = '.agent/state/collaboration/active-claims.json';

const agentId = {
  agent_name: 'Prismatic Waxing Constellation',
  platform: 'claude-code',
  model: 'test-model',
  session_id_prefix: '019f00',
  id: 'e2e793c7-923e-5baa-97f0-2bedfb9b6b50',
};

function seedRegistry(): CommitQueueRegistry {
  return {
    schema_version: '1.3.0',
    claims: [
      {
        claim_id: CLAIM_ID,
        agent_id: agentId,
        thread: 'agent-tooling',
        areas: [{ kind: 'files', patterns: ['notes/**'] }],
        claimed_at: '2026-07-14T00:00:00Z',
        intent: 'F-138 linked-worktree regression fixture.',
        intent_to_commit: INTENT_ID,
      },
    ],
    commit_queue: [
      {
        intent_id: INTENT_ID,
        claim_id: CLAIM_ID,
        agent_id: agentId,
        files: [INTENT_FILE],
        commit_subject: COMMIT_SUBJECT,
        queued_at: '2026-07-14T00:00:00Z',
        updated_at: '2026-07-14T00:00:00Z',
        expires_at: '2099-01-01T00:00:00Z',
        phase: 'staging',
      },
    ],
  };
}

function git(cwd: string, ...args: readonly string[]): string {
  return execFileSync('git', [...args], { cwd, encoding: 'utf8' });
}

interface WorktreeFixture {
  /** Temp parent directory holding both checkouts; removed after each test. */
  readonly root: string;
  /** The primary checkout — the coordination home holding the registry. */
  readonly primary: string;
  /** The linked worktree the ceremony is invoked from. */
  readonly linked: string;
}

async function makeFixture(): Promise<WorktreeFixture> {
  const root = realpathSync(await mkdtemp(join(tmpdir(), 'oak-f138-')));
  const primary = join(root, 'primary');
  await mkdir(primary, { recursive: true });
  git(primary, 'init', '--initial-branch=main');
  git(primary, 'config', 'user.email', 'f138-regression@test.invalid');
  git(primary, 'config', 'user.name', 'F138 Regression');
  git(primary, 'config', 'commit.gpgsign', 'false');
  await writeFile(join(primary, 'README.md'), 'seed\n');
  git(primary, 'add', 'README.md');
  git(primary, 'commit', '-m', 'chore: seed');

  const linked = join(root, 'linked');
  git(primary, 'worktree', 'add', linked, '-b', 'lane/f138');

  const collaborationDir = join(primary, '.agent/state/collaboration');
  await mkdir(collaborationDir, { recursive: true });
  await writeFile(join(primary, REGISTRY_REL), `${JSON.stringify(seedRegistry(), null, 2)}\n`);

  return { root, primary, linked };
}

async function stageIntentFileInWorktree(fixture: WorktreeFixture): Promise<void> {
  await mkdir(join(fixture.linked, 'notes'), { recursive: true });
  await writeFile(join(fixture.linked, INTENT_FILE), '# staged in the linked worktree\n');
  git(fixture.linked, 'add', INTENT_FILE);
}

async function readPrimaryIntent(fixture: WorktreeFixture): Promise<CommitIntent | undefined> {
  const registry = await readRegistry(join(fixture.primary, REGISTRY_REL));
  return registry.commit_queue.find((entry) => entry.intent_id === INTENT_ID);
}

describe('commit-queue from a linked worktree (F-138 two-root split)', () => {
  it('record-staged fingerprints the WORKTREE index and lands the registry in the coordination home', async () => {
    const fixture = await makeFixture();
    try {
      await stageIntentFileInWorktree(fixture);

      const result = await runAgentToolsCli({
        argv: ['commit-queue', 'record-staged', '--intent-id', INTENT_ID],
        env: {},
        cwd: fixture.linked,
      });

      expect(result).toMatchObject({ exitCode: 0, stderr: '' });

      const intent = await readPrimaryIntent(fixture);
      expect(intent?.staged_name_status).toBe(`A\t${INTENT_FILE}\n`);
      expect(intent?.staged_bundle_fingerprint).toMatch(/^[0-9a-f]{64}$/);

      // The registry write must land in the coordination home ONLY — the
      // linked worktree never grows its own registry copy.
      expect(existsSync(join(fixture.linked, REGISTRY_REL))).toBe(false);
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }
  });

  it('verify-staged reads the WORKTREE index after a worktree record-staged', async () => {
    const fixture = await makeFixture();
    try {
      await stageIntentFileInWorktree(fixture);

      const recorded = await runAgentToolsCli({
        argv: ['commit-queue', 'record-staged', '--intent-id', INTENT_ID],
        env: {},
        cwd: fixture.linked,
      });
      expect(recorded).toMatchObject({ exitCode: 0 });

      const verified = await runAgentToolsCli({
        argv: [
          'commit-queue',
          'verify-staged',
          '--intent-id',
          INTENT_ID,
          '--commit-subject',
          COMMIT_SUBJECT,
        ],
        env: {},
        cwd: fixture.linked,
      });

      expect(verified).toMatchObject({ exitCode: 0 });
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }
  });

  it('the commit workflow lands the inner commit on the WORKTREE branch and completes the intent in the coordination home', async () => {
    const fixture = await makeFixture();
    try {
      await stageIntentFileInWorktree(fixture);
      const primaryHeadBefore = git(fixture.primary, 'rev-parse', 'HEAD').trim();

      const recorded = await runAgentToolsCli({
        argv: ['commit-queue', 'record-staged', '--intent-id', INTENT_ID],
        env: {},
        cwd: fixture.linked,
      });
      expect(recorded).toMatchObject({ exitCode: 0 });

      const messageFilePath = join(fixture.root, 'commit-message.txt');
      await writeFile(messageFilePath, `${COMMIT_SUBJECT}\n`);

      const committed = await runAgentToolsCli({
        argv: [
          'commit-queue',
          'commit',
          '--intent-id',
          INTENT_ID,
          '--message-file',
          messageFilePath,
        ],
        env: {},
        cwd: fixture.linked,
      });

      expect(committed.exitCode).toBe(0);
      const reportedSha = committed.stdout.trim();
      expect(git(fixture.linked, 'rev-parse', 'HEAD').trim()).toBe(reportedSha);
      expect(git(fixture.linked, 'show', '--name-only', '--format=%s', 'HEAD')).toContain(
        INTENT_FILE,
      );

      // The primary checkout's HEAD is untouched — the inner commit landed
      // on the invoking worktree's branch.
      expect(git(fixture.primary, 'rev-parse', 'HEAD').trim()).toBe(primaryHeadBefore);

      // The completed intent is removed from the coordination-home registry.
      expect(await readPrimaryIntent(fixture)).toBeUndefined();
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }
  });

  it('refuses loudly when the invoking cwd has no derivable git root, never falling back to the coordination home', async () => {
    const fixture = await makeFixture();
    try {
      const outside = join(fixture.root, 'outside');
      await mkdir(outside, { recursive: true });

      const result = await runAgentToolsCli({
        argv: ['commit-queue', 'record-staged', '--intent-id', INTENT_ID],
        env: {},
        cwd: outside,
        repoRoot: fixture.primary,
      });

      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain('not inside a git working tree');

      // No silent fallback: the registry must NOT have been fingerprinted
      // against the coordination home's own index.
      const intent = await readPrimaryIntent(fixture);
      expect(intent?.staged_name_status).toBeUndefined();
      expect(intent?.staged_bundle_fingerprint).toBeUndefined();
    } finally {
      await rm(fixture.root, { recursive: true, force: true });
    }
  });
});
