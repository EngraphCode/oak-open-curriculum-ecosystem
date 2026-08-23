import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  makeShimTempDir,
  readShimText,
  runIdentityShim,
  shimFileExists,
  shimHookErrorLogPath,
  shimRepoRoot,
} from '../test-helpers/identity-shim-runner.js';

/**
 * Process-level regression tests for the Claude `SessionStart` identity shim
 * (`.claude/hooks/practice-session-identity.mjs`), which the adapter-level
 * unit tests cannot observe: the shim's stdin capture, failure-path seed
 * persistence into `$CLAUDE_ENV_FILE`, diagnostic payload, stderr mirror,
 * hook-errors log append, and exit code. Landed after the shim's silent-`{}`
 * failure mode was replaced by the loud fail-open (ADR-167 §Limitations 6).
 * Real IO lives in the injected runner per ADR-078.
 */

const VALID_SEED = '0f3c2a1b-4d5e-4f60-8172-93a4b5c6d7e8';

describe('practice-session-identity shim (missing-adapter fail-open)', () => {
  it('persists the seed to CLAUDE_ENV_FILE, reports it, logs, and exits 0', async () => {
    const projectDir = await makeShimTempDir('persist');
    const envFile = join(await makeShimTempDir('persist-env'), 'env');
    const run = runIdentityShim({
      stdinJson: JSON.stringify({ session_id: VALID_SEED }),
      projectDir,
      envFile,
    });

    expect(run.status).toBe(0);
    expect(run.additionalContext).toContain('Identity hook could not run');
    expect(run.additionalContext).toContain('seed WAS persisted');
    expect(run.additionalContext).not.toContain('<session_id>');
    expect(await readShimText(envFile)).toBe(
      `export PRACTICE_AGENT_SESSION_ID_CLAUDE='${VALID_SEED}'\n`,
    );
    expect(run.stderr).toContain('Identity hook could not run');
    expect(await readShimText(shimHookErrorLogPath(projectDir))).toContain(
      'practice-session-identity fail-open',
    );
  });

  it('falls back to an inline per-command seed prefix when CLAUDE_ENV_FILE is absent', async () => {
    const projectDir = await makeShimTempDir('inline');
    const run = runIdentityShim({
      stdinJson: JSON.stringify({ session_id: VALID_SEED }),
      projectDir,
    });

    expect(run.status).toBe(0);
    expect(run.additionalContext).toContain('could NOT be persisted');
    expect(run.additionalContext).toContain(
      `PRACTICE_AGENT_SESSION_ID_CLAUDE='${VALID_SEED}' pnpm agent-tools:agent-identity`,
    );
  });

  it('refuses to embed or persist a shell-unsafe seed', async () => {
    const projectDir = await makeShimTempDir('hostile');
    const envFile = join(await makeShimTempDir('hostile-env'), 'env');
    const run = runIdentityShim({
      stdinJson: JSON.stringify({ session_id: "evil'; rm -rf $HOME'" }),
      projectDir,
      envFile,
    });

    expect(run.status).toBe(0);
    expect(await shimFileExists(envFile)).toBe(false);
    expect(run.additionalContext).toContain('<session_id>');
    expect(run.additionalContext).not.toContain('rm -rf');
  });
});

describe('practice-session-identity shim (built-adapter success path)', () => {
  it('pipes the captured stdin to the adapter and writes both env exports', async () => {
    const envFile = join(await makeShimTempDir('success-env'), 'env');
    const run = runIdentityShim({
      stdinJson: JSON.stringify({ session_id: VALID_SEED }),
      projectDir: shimRepoRoot,
      envFile,
    });

    expect(run.status).toBe(0);
    expect(run.additionalContext).toContain('[Practice agent identity]');
    expect(run.additionalContext).toContain('Session identity (PDR-027):');
    const envContent = await readShimText(envFile);
    expect(envContent).toContain(`export PRACTICE_AGENT_SESSION_ID_CLAUDE='${VALID_SEED}'`);
    expect(envContent).toContain('export OAK_AGENT_IDENTITY_OVERRIDE=');
  });
});
