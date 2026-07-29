import { isAbsolute, join, resolve } from 'node:path';

import { err, ok, unwrapOrThrow, type Result } from '@oaknational/result';

import { resolveCoordinationHomeForOptions } from './cli-coordination-home.js';
import { optional, type Options } from './cli-options.js';
import { type CliRuntime } from './cli-runtime.js';
import { commsSeenFileForCodename, DEFAULT_COMMS_SEEN_DIR } from './watcher-presence.js';

/** Canonical comms event directory relative to the coordination home. */
const DEFAULT_COMMS_DIR = '.agent/state/collaboration/comms';

export interface CommsWatchPaths {
  readonly commsDir: string;
  readonly seenFile: string;
}

/** Build the canonical watcher path pair from an already-resolved home. */
export function commsWatchPathsFromHome(
  coordinationHome: string,
  agentName: string,
): CommsWatchPaths {
  return {
    commsDir: join(coordinationHome, DEFAULT_COMMS_DIR),
    seenFile: commsSeenFileForCodename(agentName, join(coordinationHome, DEFAULT_COMMS_SEEN_DIR)),
  };
}

/** Canonical watcher path pair under the resolved primary coordination home. */
export function resolveCanonicalCommsWatchPaths(
  options: Options,
  agentName: string,
  runtime: CliRuntime,
): CommsWatchPaths {
  const home = resolveCoordinationHomeForOptions(options, runtime);
  return commsWatchPathsFromHome(unwrapOrThrow(resolveWatchedCommsDir(home, runtime)), agentName);
}

/** Lexically anchor a watched path without consulting process-global cwd. */
export function resolveWatchedCommsDir(
  commsDir: string,
  runtime: CliRuntime,
): Result<string, Error> {
  if (isAbsolute(commsDir)) {
    return ok(resolve(commsDir));
  }
  if (runtime.cwd === undefined) {
    return err(
      new Error(
        'collaboration-state CLI cwd must be provided by the composition layer to resolve a relative comms path',
      ),
    );
  }
  return ok(resolve(runtime.cwd, commsDir));
}

/**
 * Resolve the watcher's PROCESS input and CURSOR as one atomic path pair.
 *
 * Explicit values are an all-or-neither override pair and are preserved
 * verbatim. With neither flag, both paths derive from the same primary
 * coordination home; this closes the linked-worktree decoy split (F-41).
 */
export function resolveCommsWatchPaths(
  options: Options,
  agentName: string,
  runtime: CliRuntime,
): Result<CommsWatchPaths, Error> {
  const explicitCommsDir = optional(options, 'comms-dir');
  const explicitSeenFile = optional(options, 'seen-file');
  if ((explicitCommsDir === undefined) !== (explicitSeenFile === undefined)) {
    return err(
      new Error(
        'comms watch accepts --comms-dir and --seen-file only as a pair: ' +
          'provide both, or omit both to use the coordination-home defaults',
      ),
    );
  }
  if (explicitCommsDir !== undefined && explicitSeenFile !== undefined) {
    return ok({ commsDir: explicitCommsDir, seenFile: explicitSeenFile });
  }

  return ok(resolveCanonicalCommsWatchPaths(options, agentName, runtime));
}
