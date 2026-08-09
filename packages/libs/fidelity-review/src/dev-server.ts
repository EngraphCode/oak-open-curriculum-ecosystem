/*
 * Dev-server lifecycle for the fidelity review: attach when something is
 * already answering on the base URL (and never touch it), spawn `pnpm dev`
 * when the port is free — with a bounded ready-wait and a teardown that
 * only ever kills what this module spawned, proves the port released, and
 * prints the proof (no-unbounded-host-load: every wait is bounded).
 * OWNERSHIP CONTRACT: a spawned handle's `stop()` must be called on every
 * exit path by the caller that received it — the child is detached, so an
 * orchestrator that exits without stopping leaves the group alive. This
 * module guarantees the teardown WORKS; the handle owner guarantees it
 * RUNS (typically via try/finally around the capture body).
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
// Explicit module import, never the ambient global (lib boundary rule):
// this module owns the spawned dev server's process lifecycle — group
// kill, pnpm self-identification via npm_execpath, progress lines.
import process from 'node:process';

import { err, ok, type Result } from '@oaknational/result';

import { describeThrown } from './support';

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
  if (!path.isAbsolute(npmExecPath)) {
    // A relative value would spawn via PATH lookup, exactly the search the
    // absolute-paths contract above exists to prevent (Sonar S4036).
    return err(
      `dev-server: npm_execpath (${npmExecPath}) is not an absolute path — refusing a PATH lookup`,
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

/** Spawn the detached dev-server group in `demoDir`; returns its pid. */
function spawnDevServer(command: DevCommand, demoDir: string): Result<number, string> {
  const child = spawn(command.bin, command.args, {
    cwd: demoDir,
    detached: true,
    stdio: 'ignore',
  });
  // Without a listener, a spawn failure (e.g. ENOENT on a stale
  // npm_execpath) emits an unhandled 'error' event and crashes a caller
  // that handled our Result and kept running — shared-library code must
  // tolerate exactly that caller. The failure still surfaces: the ready
  // poll times out and returns err.
  child.on('error', (error: unknown) => {
    process.stdout.write(`dev-server: spawn error — ${describeThrown(error)}\n`);
  });
  const pid = child.pid;
  if (pid === undefined) {
    return err('dev-server: spawn produced no pid');
  }
  child.unref();
  return ok(pid);
}

/** How long an attach-mode reachability ASSERTION retries before failing.
 *  Long enough to ride out a transient listen gap or a slow first
 *  compile of '/', short enough that a genuinely-down server fails in
 *  seconds — attach-mode contact is an assertion, not a spawn wait
 *  (that generosity is READY_WAIT_MS's). */
const ATTACH_ASSERT_MS = 10_000;

/** Assert something is answering on `base`, without touching it — the
 *  attach-mode counterpart of ensureDevServer's ready wait, reusing the
 *  same bounded probe (a one-shot unbounded fetch here previously hung
 *  forever on a server that accepted but never responded, and each app
 *  carried its own copy). `hint` is the app's own start-it advice,
 *  rendered into the failure. */
export async function assertServerUp(base: string, hint: string): Promise<Result<void, string>> {
  if (await pollUntil(() => responds(base), ATTACH_ASSERT_MS)) {
    return ok(undefined);
  }
  return err(`no server reachable at ${base} within ${ATTACH_ASSERT_MS / 1000}s. ${hint}`);
}

/** Attach to a responding dev server, or spawn one and wait until it is ready.
 *  `demoDir` is the app directory whose `pnpm dev` answers on `base` — a
 *  REQUIRED parameter, because this module lives in a shared package and
 *  must never guess the app root from its own location (a wrong guess
 *  spawns in a script-less directory and burns the whole ready-wait
 *  before failing with a misleading not-ready error). */
export async function ensureDevServer(
  base: string,
  demoDir: string,
): Promise<Result<DevServerHandle, string>> {
  if (!path.isAbsolute(demoDir)) {
    return err(`dev-server: demoDir (${demoDir}) must be an absolute path`);
  }
  if (await responds(base)) {
    process.stdout.write(`dev server already up at ${base} — attaching (will not stop it)\n`);
    return ok({ mode: 'attached' });
  }
  const command = resolveDevCommand(process.env.npm_execpath, process.execPath);
  if (!command.ok) {
    return err(command.error);
  }
  const spawned = spawnDevServer(command.value, demoDir);
  if (!spawned.ok) {
    return spawned;
  }
  const pid = spawned.value;
  process.stdout.write(`spawned pnpm dev (pid ${pid}), waiting for ${base}…\n`);
  const ready = await pollUntil(() => responds(base), READY_WAIT_MS);
  if (!ready) {
    const stop = stopSpawned(pid, base);
    await stop();
    return err(`dev-server: not ready within ${READY_WAIT_MS / 1000}s`);
  }
  return ok({ mode: 'spawned', stop: stopSpawned(pid, base) });
}
