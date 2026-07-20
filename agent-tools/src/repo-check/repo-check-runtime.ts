import { spawn, spawnSync, type SpawnSyncReturns } from 'node:child_process';

import { writeErrorLine } from '../core/terminal-output.js';
import { resolvePnpm } from '../spawn/pnpm-path.js';

import type { RepoCheckRuntime } from './repo-check-types.js';

/**
 * Environment for spawning the RESOLVED standalone pnpm. The corepack
 * variables inherited from an outer corepack-shimmed pnpm chain must be
 * stripped: under `COREPACK_ROOT` the standalone binary refuses to
 * self-switch to the repo's pinned `packageManager` version and fails the
 * devEngines pin (observed first-hand: an 11.9.0 standalone refusing the
 * 11.8.0 pin inside a hook chain); without them it self-switches per the pin.
 */
function pnpmSpawnEnvironment(): NodeJS.ProcessEnv {
  const environment = { ...process.env };
  delete environment.COREPACK_ROOT;
  delete environment.COREPACK_ENABLE_AUTO_PIN;
  delete environment.COREPACK_ENABLE_DOWNLOAD_PROMPT;
  return environment;
}

/**
 * Resolve `pnpm` to its trusted absolute path at this real I/O edge — the
 * agent-tools invariant (see `spawn/pnpm-path.ts`): bare `pnpm` never reaches
 * spawn, so a writable PATH entry cannot shadow it. Other commands pass
 * through unchanged; injected fake runtimes never hit this edge. Returns the
 * resolution error message alongside the command when pnpm is not found, so
 * callers fail loudly through their normal non-zero paths (never a throw).
 */
function trustedSpawnTarget(command: string): {
  readonly command: string;
  readonly environment?: NodeJS.ProcessEnv;
  readonly error?: string;
} {
  if (command !== 'pnpm') {
    return { command };
  }

  const resolved = resolvePnpm(process.env);

  if (!resolved.ok) {
    return { command, error: resolved.error.message };
  }

  return { command: resolved.value, environment: pnpmSpawnEnvironment() };
}

export function runInheritedProcess(command: string, args: readonly string[]): Promise<number> {
  const trusted = trustedSpawnTarget(command);

  if (trusted.error !== undefined) {
    writeErrorLine(`${command}: ${trusted.error}`);
    return Promise.resolve(1);
  }

  return new Promise((resolve) => {
    const child = spawn(trusted.command, args, { stdio: 'inherit', env: trusted.environment });
    child.on('close', (code) => resolve(code ?? 1));
    child.on('error', (error) => {
      writeErrorLine(`${command}: ${error.message}`);
      resolve(1);
    });
  });
}

export function runCapturedProcess(
  command: string,
  args: readonly string[],
): SpawnSyncReturns<string> {
  const trusted = trustedSpawnTarget(command);

  if (trusted.error !== undefined) {
    return {
      pid: 0,
      output: [],
      stdout: '',
      stderr: `${command}: ${trusted.error}`,
      status: 1,
      signal: null,
    };
  }

  return spawnSync(trusted.command, args, {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 50,
    env: trusted.environment,
  });
}

export const defaultRuntime: RepoCheckRuntime = {
  runCaptured: runCapturedProcess,
  runInherited: runInheritedProcess,
};
