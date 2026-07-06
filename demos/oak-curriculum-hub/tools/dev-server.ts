/*
 * Dev-server lifecycle for the fidelity review: attach when something is
 * already answering on the base URL (and never touch it), spawn `pnpm dev`
 * when the port is free — with a bounded ready-wait and a teardown that
 * only ever kills what this module spawned, proves the port released, and
 * prints the proof (no-unbounded-host-load: every wait is bounded, no
 * orphaned process survives an exit path).
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { err, ok, type Result } from '@oaknational/result';

import { describeThrown } from './support';

const TOOLS_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEMO_DIR = path.resolve(TOOLS_DIR, '..');

const READY_WAIT_MS = 120_000;
const POLL_MS = 1000;
const SIGTERM_GRACE_MS = 10_000;
const RELEASE_WAIT_MS = 15_000;

export type DevServerHandle =
  | { readonly mode: 'attached' }
  | { readonly mode: 'spawned'; readonly stop: () => Promise<Result<void, string>> };

export interface DevCommand {
  readonly bin: string;
  readonly args: readonly string[];
}

const JS_ENTRY_EXTENSIONS = ['.js', '.cjs', '.mjs'] as const;

/**
 * Resolve the `pnpm dev` invocation to absolute paths — never a PATH search
 * (Sonar S4036): the pnpm that launched this tool announces itself via
 * `npm_execpath`. A JS entry (corepack's pnpm.mjs, nvm's pnpm.cjs) runs under
 * the current node binary; a native pnpm binary runs directly by its absolute
 * path. Anything else fails loud — this repo is pnpm-only.
 */
export function resolveDevCommand(
  npmExecPath: string | undefined,
  nodeBin: string,
): Result<DevCommand, string> {
  if (npmExecPath === undefined || npmExecPath === '') {
    return err(
      'dev-server: npm_execpath is not set — run this tool through a pnpm script (e.g. pnpm tool:fidelity)',
    );
  }
  const lowerBasename = path.basename(npmExecPath).toLowerCase();
  if (!lowerBasename.includes('pnpm')) {
    return err(`dev-server: npm_execpath (${npmExecPath}) is not pnpm — this repo is pnpm-only`);
  }
  if (JS_ENTRY_EXTENSIONS.some((ext) => lowerBasename.endsWith(ext))) {
    return ok({ bin: nodeBin, args: [npmExecPath, 'dev'] });
  }
  return ok({ bin: npmExecPath, args: ['dev'] });
}

async function responds(base: string): Promise<boolean> {
  try {
    await fetch(base, { signal: AbortSignal.timeout(2000) });
    return true;
  } catch {
    return false;
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Poll `predicate` every POLL_MS until true or the bounded deadline passes. */
async function pollUntil(predicate: () => Promise<boolean>, deadlineMs: number): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < deadlineMs) {
    if (await predicate()) {
      return true;
    }
    await wait(POLL_MS);
  }
  return false;
}

function stopSpawned(pid: number, base: string): () => Promise<Result<void, string>> {
  return async () => {
    try {
      // Negative pid = the whole process group: pnpm wraps next, and killing
      // pnpm alone orphans the next process holding the port.
      process.kill(-pid, 'SIGTERM');
    } catch (error: unknown) {
      return err(`dev-server: SIGTERM failed — ${describeThrown(error)}`);
    }
    const released = await pollUntil(async () => !(await responds(base)), SIGTERM_GRACE_MS);
    if (!released) {
      try {
        process.kill(-pid, 'SIGKILL');
      } catch {
        // The group died between the poll and the kill — that is the goal state.
      }
      const killed = await pollUntil(async () => !(await responds(base)), RELEASE_WAIT_MS);
      if (!killed) {
        return err(`dev-server: pid ${pid} did not release ${base} after SIGKILL`);
      }
    }
    process.stdout.write(`dev server pid ${pid} terminated, ${base} released\n`);
    return ok(undefined);
  };
}

/** Attach to a responding dev server, or spawn one and wait until it is ready. */
export async function ensureDevServer(base: string): Promise<Result<DevServerHandle, string>> {
  if (await responds(base)) {
    process.stdout.write(`dev server already up at ${base} — attaching (will not stop it)\n`);
    return ok({ mode: 'attached' });
  }
  const command = resolveDevCommand(process.env.npm_execpath, process.execPath);
  if (!command.ok) {
    return err(command.error);
  }
  const child = spawn(command.value.bin, command.value.args, {
    cwd: DEMO_DIR,
    detached: true,
    stdio: 'ignore',
  });
  const pid = child.pid;
  if (pid === undefined) {
    return err('dev-server: spawn produced no pid');
  }
  child.unref();
  process.stdout.write(`spawned pnpm dev (pid ${pid}), waiting for ${base}…\n`);
  const ready = await pollUntil(() => responds(base), READY_WAIT_MS);
  if (!ready) {
    const stop = stopSpawned(pid, base);
    await stop();
    return err(`dev-server: not ready within ${READY_WAIT_MS / 1000}s`);
  }
  return ok({ mode: 'spawned', stop: stopSpawned(pid, base) });
}
