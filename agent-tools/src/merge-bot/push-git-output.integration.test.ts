import { describe, expect, it } from 'vitest';

import { resolveTrustedGit } from '../core/trusted-git.js';
import { realGitExecutor } from './git-executor.js';
import { pushHead, resolveGitContext } from './push-git.js';

import { execFileSync } from 'node:child_process';
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * The push's REAL output path, against real child processes.
 *
 * `merge-bot push` hands the transfer to git, and git runs the repository's
 * pre-push gate chain with its output flowing back through this seam. That
 * volume is the gates' to decide, never this tool's (R1), so it is streamed
 * rather than buffered — and the only way to know that is to put more than a
 * buffer's worth through it and watch.
 *
 * Both legs here execute real binaries in throwaway directories: no faked
 * boundary, because seven static instruments passed a push command that could
 * not push and one execution found it in minutes (R8).
 */

/**
 * The repository's own pre-push gate chain on a GREEN run, measured
 * 2026-08-06 — turbo leg only, so a LOWER bound on what a real push carries.
 * Node's `spawnSync` default is 1 MiB; this is 1.77× that, which is why an
 * ordinary push died ENOBUFS and never landed.
 */
const MEASURED_GATE_OUTPUT_BYTES = 1_852_962;

/** R1's proof bar: at least twice the recorded measured corpus. */
const DRIVE_BYTES = MEASURED_GATE_OUTPUT_BYTES * 2;

const CHUNK = 64 * 1024;
const CHUNK_COUNT = Math.ceil(DRIVE_BYTES / CHUNK);

/** A child that emits `DRIVE_BYTES` on stdout and a closing line on stderr. */
const EMITTER = [
  `const c = 'x'.repeat(${CHUNK});`,
  `for (let i = 0; i < ${CHUNK_COUNT}; i += 1) { process.stdout.write(c); }`,
  `process.stderr.write('emitter done' + String.fromCharCode(10));`,
].join(' ');

/**
 * A literal child environment (ADR-078: tests never read `process.env`).
 * `PATH` is here because git's hook runner needs a shell on it; everything
 * else the children need is addressed absolutely. `HOME` points into the
 * throwaway root and the two `GIT_CONFIG_*` variables silence the machine's
 * real git configuration, so this leg cannot be steered — or broken — by
 * whoever is running it.
 */
function hermeticEnv(home: string): Record<string, string> {
  return {
    PATH: '/usr/bin:/bin',
    HOME: home,
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_CONFIG_SYSTEM: '/dev/null',
  };
}

/** Awaits the work BEFORE removing the directory — a sync `finally` would delete it mid-run. */
async function withTempDir<T>(run: (dir: string) => Promise<T>): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), 'merge-bot-output-'));
  try {
    return await run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('the push output seam under real volume', () => {
  it('streams more than twice the measured gate output without loss or failure', async () => {
    let received = 0;
    let sawStderr = false;
    const result = await withTempDir(async (cwd) =>
      realGitExecutor()(process.execPath, ['-e', EMITTER], {
        cwd,
        env: hermeticEnv(cwd),
        onOutput: (chunk) => {
          received += Buffer.byteLength(chunk);
          sawStderr ||= chunk.includes('emitter done');
        },
      }),
    );

    // Survival is the claim: a run that dies ENOBUFS reports a negative
    // status and a "cannot run git" stderr, which is exactly the shape a
    // silently-never-landed push had.
    expect(result.status).toBe(0);
    expect(received).toBeGreaterThanOrEqual(DRIVE_BYTES);
    // Both streams reach the operator, and the stderr line emitted last is
    // still there — a truncating consumer would drop the tail first.
    expect(sawStderr).toBe(true);
  });
});

const GIT = resolveTrustedGit();

/** A throwaway repository with a bare remote and a loud pre-push hook. */
function makeRepoWithLoudHook(root: string): { work: string; remote: string } {
  const remote = join(root, 'remote.git');
  const work = join(root, 'work');
  const env = hermeticEnv(root);
  const git = (cwd: string, args: readonly string[]): void => {
    execFileSync(GIT, [...args], { cwd, env, stdio: 'ignore' });
  };
  execFileSync(GIT, ['init', '--bare', '-b', 'lane', remote], { env, stdio: 'ignore' });
  execFileSync(GIT, ['init', '-b', 'lane', work], { env, stdio: 'ignore' });
  git(work, ['config', 'user.email', 'bot@example.invalid']);
  git(work, ['config', 'user.name', 'bot']);
  writeFileSync(join(work, 'file.txt'), 'content\n');
  git(work, ['add', 'file.txt']);
  git(work, ['commit', '-m', 'seed', '--no-verify']);
  const hook = join(work, '.git', 'hooks', 'pre-push');
  // A gate chain in miniature: it prints far more than any single buffer and
  // exits 0, exactly like a green run of the real one.
  writeFileSync(
    hook,
    ['#!/bin/sh', `${process.execPath} -e ${JSON.stringify(EMITTER)}`, 'exit 0', ''].join('\n'),
  );
  chmodSync(hook, 0o755);
  return { work, remote };
}

describe('merge-bot push against a real repository (live fire)', () => {
  it('completes a real push whose real pre-push hook out-talks every buffer', async () => {
    const outcome = await withTempDir(async (root) => {
      const { work, remote } = makeRepoWithLoudHook(root);
      const git = resolveGitContext({});
      expect(git.ok).toBe(true);
      let received = 0;
      const pushed = git.ok
        ? await pushHead(git.value, {
            remote,
            branch: 'lane',
            cwd: work,
            token: 'unused-for-a-local-remote',
            baseEnv: hermeticEnv(root),
            onOutput: (chunk) => {
              received += Buffer.byteLength(chunk);
            },
          })
        : undefined;
      const landed = execFileSync(GIT, ['rev-parse', 'lane'], {
        cwd: remote,
        encoding: 'utf8',
        env: hermeticEnv(root),
      }).trim();
      return { pushed, received, landed };
    });

    // The push LANDED: the remote now has the ref, which is the state a
    // buffer death silently failed to produce.
    expect(outcome.landed).toMatch(/^[0-9a-f]{40}$/u);
    expect(outcome.pushed?.ok).toBe(true);
    expect(outcome.pushed?.ok === true ? outcome.pushed.value.status : -1).toBe(0);
    expect(outcome.received).toBeGreaterThanOrEqual(DRIVE_BYTES);
  });
});
