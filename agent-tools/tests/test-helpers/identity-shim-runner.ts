import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Real-IO surface (ADR-078) for the process-level tests of the Claude
 * `SessionStart` identity shim: the shim is a shell-invoked `.mjs` whose
 * observable contract (stdin capture, `$CLAUDE_ENV_FILE` writes, stderr,
 * hook-errors log, exit code) only exists at process level, so the spawn and
 * filesystem reads live here and the test file consumes typed results.
 */

export const shimRepoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

const shimPath = join(shimRepoRoot, '.claude', 'hooks', 'practice-session-identity.mjs');

export interface ShimRun {
  readonly status: number | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly additionalContext: string;
}

function isHookPayload(value: unknown): value is {
  hookSpecificOutput: { hookEventName: string; additionalContext: string };
} {
  if (typeof value !== 'object' || value === null || !('hookSpecificOutput' in value)) {
    return false;
  }
  const inner: unknown = value.hookSpecificOutput;
  return (
    typeof inner === 'object' &&
    inner !== null &&
    'additionalContext' in inner &&
    typeof inner.additionalContext === 'string'
  );
}

export function runIdentityShim(input: {
  readonly stdinJson: string;
  readonly projectDir: string;
  readonly envFile?: string;
}): ShimRun {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    CLAUDE_PROJECT_DIR: input.projectDir,
  };
  delete env.CLAUDE_ENV_FILE;
  if (input.envFile !== undefined) {
    env.CLAUDE_ENV_FILE = input.envFile;
  }
  const result = spawnSync(process.execPath, [shimPath], {
    input: input.stdinJson,
    env,
    encoding: 'utf8',
  });
  const parsed: unknown = JSON.parse(result.stdout);
  const additionalContext = isHookPayload(parsed)
    ? parsed.hookSpecificOutput.additionalContext
    : '';
  return { status: result.status, stdout: result.stdout, stderr: result.stderr, additionalContext };
}

export async function makeShimTempDir(label: string): Promise<string> {
  return mkdtemp(join(tmpdir(), `identity-shim-${label}-`));
}

export function readShimText(path: string): Promise<string> {
  return readFile(path, 'utf8');
}

export function shimHookErrorLogPath(projectDir: string): string {
  return join(projectDir, '.claude', 'logs', 'hook-errors.log');
}

export async function shimFileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}
