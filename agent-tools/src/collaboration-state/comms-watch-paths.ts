import { join } from 'node:path';

import { err, ok, type Result } from '@oaknational/result';

import { resolveCoordinationHomeForOptions } from './cli-coordination-home.js';
import { optional, type Options } from './cli-options.js';
import { type CliRuntime } from './cli-runtime.js';
import {
  commsSeenFileForCodename,
  DEFAULT_COMMS_SEEN_DIR,
  heartbeatFileForSeen,
} from './watcher-presence.js';

/** Canonical comms event directory relative to the coordination home. */
export const DEFAULT_COMMS_DIR = '.agent/state/collaboration/comms';

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

  const coordinationHome = resolveCoordinationHomeForOptions(options, runtime);
  return ok(commsWatchPathsFromHome(coordinationHome, agentName));
}

/** Canonical per-agent cursor directory under the primary coordination home. */
export function resolveCanonicalCommsSeenDir(options: Options, runtime: CliRuntime): string {
  return join(resolveCoordinationHomeForOptions(options, runtime), DEFAULT_COMMS_SEEN_DIR);
}

/** The heartbeat path consumed by both F-95 liveness readers. */
export function resolveCanonicalWatcherHeartbeatFile(
  options: Options,
  agentName: string,
  runtime: CliRuntime,
): string {
  return heartbeatFileForSeen(
    commsSeenFileForCodename(agentName, resolveCanonicalCommsSeenDir(options, runtime)),
  );
}
