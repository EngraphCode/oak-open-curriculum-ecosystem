import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runAgentToolsCli } from '../src/bin/agent-tools-cli';
import type { CommitIntent, CommitQueueRegistry } from '../src/commit-queue';
import { readRegistry } from '../src/commit-queue/registry';
import { resolveTrustedGit } from '../src/core/trusted-git';

/**
 * F-138 regression smoke — the commit-queue two-root split.
 *
 * Reproduces the F-138 field mechanism with a real scratch primary and linked
 * worktree: staged reads and commits use the invoking worktree, registry state
 * stays at the coordination home, and an underivable git root refuses loudly.
 * Real filesystem and process IO make this a smoke rather than an in-process
 * Vitest suite; the package's test:e2e script keeps it in the full gate.
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
  return execFileSync(resolveTrustedGit(), [...args], { cwd, encoding: 'utf8' });
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

async function proveRecordStagedUsesWorktreeIndex(): Promise<void> {
  const fixture = await makeFixture();
  try {
    await stageIntentFileInWorktree(fixture);

    const result = await runAgentToolsCli({
      argv: ['commit-queue', 'record-staged', '--intent-id', INTENT_ID],
      env: {},
      cwd: fixture.linked,
    });

    assert.equal(result.exitCode, 0);
    assert.equal(result.stderr, '');

    const intent = await readPrimaryIntent(fixture);
    assert.equal(intent?.staged_name_status, 'A\t' + INTENT_FILE + '\n');
    assert.match(intent?.staged_bundle_fingerprint ?? '', /^[0-9a-f]{64}$/);

    // The registry write must land in the coordination home ONLY — the
    // linked worktree never grows its own registry copy.
    assert.equal(existsSync(join(fixture.linked, REGISTRY_REL)), false);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
}

async function proveVerifyStagedUsesWorktreeIndex(): Promise<void> {
  const fixture = await makeFixture();
  try {
    await stageIntentFileInWorktree(fixture);

    const recorded = await runAgentToolsCli({
      argv: ['commit-queue', 'record-staged', '--intent-id', INTENT_ID],
      env: {},
      cwd: fixture.linked,
    });
    assert.equal(recorded.exitCode, 0);

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

    assert.equal(verified.exitCode, 0);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
}

async function proveCommitLandsOnWorktreeBranch(): Promise<void> {
  const fixture = await makeFixture();
  try {
    await stageIntentFileInWorktree(fixture);
    const primaryHeadBefore = git(fixture.primary, 'rev-parse', 'HEAD').trim();

    const recorded = await runAgentToolsCli({
      argv: ['commit-queue', 'record-staged', '--intent-id', INTENT_ID],
      env: {},
      cwd: fixture.linked,
    });
    assert.equal(recorded.exitCode, 0);

    const messageFilePath = join(fixture.root, 'commit-message.txt');
    await writeFile(messageFilePath, COMMIT_SUBJECT + '\n');

    const committed = await runAgentToolsCli({
      argv: ['commit-queue', 'commit', '--intent-id', INTENT_ID, '--message-file', messageFilePath],
      env: {},
      cwd: fixture.linked,
    });

    assert.equal(committed.exitCode, 0);
    // The scratch repo has no advisory-orchestrator script, so the
    // advisory pass fails — and MUST NOT gate the commit (PDR-053 /
    // ADR-176 advisory polarity). The surfaced notice describes that
    // deliberately exercised state.
    assert.match(committed.stderr, /advisory orchestrator exit/);
    const reportedSha = committed.stdout.trim();
    assert.equal(git(fixture.linked, 'rev-parse', 'HEAD').trim(), reportedSha);
    assert.ok(
      git(fixture.linked, 'show', '--name-only', '--format=%s', 'HEAD').includes(INTENT_FILE),
    );

    // The primary checkout's HEAD is untouched — the inner commit landed
    // on the invoking worktree's branch.
    assert.equal(git(fixture.primary, 'rev-parse', 'HEAD').trim(), primaryHeadBefore);

    // The completed intent is removed from the coordination-home registry.
    assert.equal(await readPrimaryIntent(fixture), undefined);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
}

async function proveMissingGitRootRefusesLoudly(): Promise<void> {
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

    assert.equal(result.exitCode, 2);
    assert.match(result.stderr, /not inside a git working tree/);

    // No silent fallback: the intent survives untouched — neither
    // fingerprinted against the coordination home's own index nor
    // abandoned by the refused invocation.
    const intent = await readPrimaryIntent(fixture);
    assert.equal(intent?.intent_id, INTENT_ID);
    assert.equal(intent?.phase, 'staging');
    assert.equal(intent?.staged_name_status, undefined);
    assert.equal(intent?.staged_bundle_fingerprint, undefined);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
}

await proveRecordStagedUsesWorktreeIndex();
await proveVerifyStagedUsesWorktreeIndex();
await proveCommitLandsOnWorktreeBranch();
await proveMissingGitRootRefusesLoudly();
process.stdout.write('commit-queue worktree smoke: 4/4 proofs passed\n');
