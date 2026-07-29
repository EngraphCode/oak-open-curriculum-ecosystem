import { watch } from 'node:fs';
import { dirname } from 'node:path';

import { err, ok, unwrapOrThrow, type Result } from '@oaknational/result';

import { type CollaborationStateCliIo, productionIo } from './cli-io-production.js';
import { resolveCoordinationHome } from './coordination-home.js';
import { processIsAliveBySignalZero } from './watcher-supervisor.js';

export { type CollaborationStateCliIo } from './cli-io-production.js';

/** Resolve the canonical coordination home from one invocation directory. */
export type CoordinationHomeResolver = (cwd: string) => string;

export interface CliRuntime {
  readonly stdout?: Pick<NodeJS.WritableStream, 'write'>;
  readonly io?: CollaborationStateCliIo;
  readonly waitForCommsChange?: (input: {
    readonly directory: string;
    readonly pollMs: number;
  }) => Promise<void>;
  readonly waitForCollaborationStateChange?: (input: {
    readonly activePath: string;
    readonly closedPath: string;
    readonly commsDir: string;
    readonly pollMs: number;
  }) => Promise<void>;
  /**
   * Probe whether a process is alive by pid (F-101 supervisor-death detection).
   * Production uses a signal-0 `process.kill` probe; tests inject a fake so the
   * watcher's self-exit-when-supervisor-gone behaviour is exercised without a
   * real process. Provided by the composition layer when `--supervisor-pid` is
   * in play.
   */
  readonly processIsAlive?: (pid: number) => boolean;
  /** Invocation cwd, captured at the composition edge for path defaulting. */
  readonly cwd?: string;
  /** Injectable primary coordination-home resolver for hermetic tests. */
  readonly resolveCoordinationHome?: CoordinationHomeResolver;
}

export function cliIo(runtime: CliRuntime): CollaborationStateCliIo {
  return unwrapOrThrow(
    requiredRuntimeCapability(
      runtime.io,
      'collaboration-state CLI IO must be provided by the composition layer',
    ),
  );
}

export function waitForCommsChange(
  runtime: CliRuntime,
  input: {
    readonly directory: string;
    readonly pollMs: number;
  },
): Promise<void> {
  return unwrapOrThrow(
    requiredRuntimeCapability(
      runtime.waitForCommsChange,
      'collaboration-state watch source must be provided by the composition layer',
    ),
  )(input);
}

export function waitForCollaborationStateChange(
  runtime: CliRuntime,
  input: {
    readonly activePath: string;
    readonly closedPath: string;
    readonly commsDir: string;
    readonly pollMs: number;
  },
): Promise<void> {
  return unwrapOrThrow(
    requiredRuntimeCapability(
      runtime.waitForCollaborationStateChange,
      'collaboration-state TUI update source must be provided by the composition layer',
    ),
  )(input);
}

function requiredRuntimeCapability<T>(value: T | undefined, message: string): Result<T, Error> {
  return value === undefined ? err(new Error(message)) : ok(value);
}

export function productionCollaborationStateRuntime(
  input: {
    readonly stdout?: Pick<NodeJS.WritableStream, 'write'>;
    readonly cwd?: string;
    readonly resolveCoordinationHome?: CoordinationHomeResolver;
  } = {},
): CliRuntime {
  return {
    stdout: input.stdout,
    io: productionIo,
    waitForCommsChange: waitForDirectoryChange,
    waitForCollaborationStateChange: waitForCollaborationStateChangeFromFiles,
    processIsAlive: processIsAliveBySignalZero,
    cwd: input.cwd ?? process.cwd(),
    resolveCoordinationHome: input.resolveCoordinationHome ?? resolveCoordinationHome,
  };
}

function waitForDirectoryChange(input: {
  readonly directory: string;
  readonly pollMs: number;
}): Promise<void> {
  return waitForAnyDirectoryChange({ directories: [input.directory], pollMs: input.pollMs });
}

function waitForCollaborationStateChangeFromFiles(input: {
  readonly activePath: string;
  readonly closedPath: string;
  readonly commsDir: string;
  readonly pollMs: number;
}): Promise<void> {
  return waitForAnyDirectoryChange({
    directories: [input.commsDir, dirname(input.activePath), dirname(input.closedPath)],
    pollMs: input.pollMs,
  });
}

/**
 * Subscribes `onChange` to a directory's change events, returning a closable
 * handle or `null` when the platform cannot watch the path. Injectable so the
 * poll-bound invariant below is unit-testable without real FS events — which
 * are non-deterministic, especially the dropped-subscription case this guards.
 *
 * The real `node:fs` watch callback always fires asynchronously. A factory
 * that fires `onChange` synchronously during subscription is tolerated (the
 * wait settles immediately and no further directories are subscribed), but a
 * handle returned by such a factory cannot be closed — it has not been
 * registered yet — so asynchronous firing remains the supported contract.
 */
export type DirectoryWatchFactory = (
  directory: string,
  onChange: () => void,
) => { readonly close: () => void } | null;

const fsDirectoryWatchFactory: DirectoryWatchFactory = (directory, onChange) => {
  try {
    const watcher = watch(directory, { persistent: false }, onChange);
    watcher.on('error', onChange);
    return watcher;
  } catch {
    return null;
  }
};

/**
 * Resolve when ANY watched directory changes — OR after `pollMs`, whichever
 * comes first. The `setTimeout(pollMs)` fallback is armed ALONGSIDE the watch
 * subscriptions, so a dropped FSEvents subscription (the macOS hang suspect)
 * delays a wake by at most `pollMs` instead of stalling the watcher forever.
 * This poll-bound is the invariant pinned by `cli-runtime.unit.test.ts`.
 */
export function waitForAnyDirectoryChange(input: {
  readonly directories: readonly string[];
  readonly pollMs: number;
  readonly watchFactory?: DirectoryWatchFactory;
}): Promise<void> {
  const watchFactory = input.watchFactory ?? fsDirectoryWatchFactory;
  return new Promise((resolve) => {
    let settled = false;
    const watchers: ({ readonly close: () => void } | null)[] = [];
    let timer: ReturnType<typeof setTimeout> | undefined;

    const done = (): void => {
      if (settled) {
        return;
      }
      settled = true;
      if (timer !== undefined) {
        clearTimeout(timer);
      }
      for (const watcher of watchers) {
        watcher?.close();
      }
      resolve();
    };

    // `watchers` and `done` are initialised before any factory call, so a
    // synchronous callback settles cleanly instead of hitting a temporal dead
    // zone. A sync-settle also stops subscribing further directories.
    for (const directory of input.directories) {
      if (settled) {
        break;
      }
      watchers.push(watchFactory(directory, done));
    }
    // Arm the poll fallback alongside the still-open subscriptions.
    if (!settled) {
      timer = setTimeout(done, input.pollMs);
    }
  });
}
