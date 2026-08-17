/**
 * Pre-lock gate inputs for `claims open` (F-95): the watcher verdict and
 * the live per-intent queue entries, both resolved OUTSIDE the registry
 * lock in one IO step. Watcher staleness is 3x-interval-grained and queue
 * liveness is TTL-grained (1 hour), so a just-before-the-lock read is not
 * a race; the claims half of every in-transform check still evaluates on
 * the locked registry snapshot.
 */
import { dirname } from 'node:path';

import { assertNoLiveIdentityRoutingCollision } from './active-agents.js';
import {
  assertNotBlindWithOtherAgents,
  resolveOpenClaimWatcherVerdict,
} from './claims-open-watcher-gate.js';
import { commitQueueDirForActivePath, readCommitQueueEntries } from './commit-queue-store.js';
import { type Options } from './cli-options.js';
import { type CliRuntime } from './cli-runtime.js';
import { resolveCanonicalCommsWatchPaths } from './comms-watch-paths.js';
import { type WatcherPresenceVerdict } from './watcher-presence.js';
import {
  type CollaborationAgentId,
  type CollaborationClaim,
  type CollaborationCommitQueueEntry,
  type CollaborationRegistry,
} from './types.js';

export interface OpenClaimGateInputs {
  readonly watcherVerdict: WatcherPresenceVerdict;
  readonly commitQueue: readonly CollaborationCommitQueueEntry[];
}

export async function resolveOpenClaimGateInputs(input: {
  readonly options: Options;
  readonly identity: CollaborationAgentId;
  readonly activePath: string;
  readonly nowIso: string;
  readonly runtime: CliRuntime;
}): Promise<OpenClaimGateInputs> {
  const watcherPaths = resolveCanonicalCommsWatchPaths(
    input.options,
    input.identity.agent_name,
    input.runtime,
  );
  const watcherVerdict = await resolveOpenClaimWatcherVerdict(
    input.identity,
    dirname(watcherPaths.seenFile),
    watcherPaths.commsDir,
  );
  const commitQueue = await readCommitQueueEntries({
    queueDir: commitQueueDirForActivePath(input.activePath),
    nowIso: input.nowIso,
  });

  return { watcherVerdict, commitQueue };
}

/**
 * The locked-transform half of `claims open`: both gates evaluate against
 * the authoritative registry snapshot, then the claim row appends.
 */
export function openClaimTransform(input: {
  readonly openedClaim: CollaborationClaim;
  readonly commitQueue: readonly CollaborationCommitQueueEntry[];
  readonly nowIso: string;
  readonly identity: CollaborationAgentId;
  readonly watcherVerdict: WatcherPresenceVerdict;
}): (registry: CollaborationRegistry) => CollaborationRegistry {
  return (registry) => {
    assertNoLiveIdentityRoutingCollision({
      registry,
      commitQueue: input.commitQueue,
      nowIso: input.nowIso,
      agentId: input.identity,
      surface: 'claims open',
    });
    assertNotBlindWithOtherAgents({
      registry,
      commitQueue: input.commitQueue,
      nowIso: input.nowIso,
      selfIdentity: input.identity,
      watcherVerdict: input.watcherVerdict,
    });

    return {
      ...registry,
      claims: [...registry.claims, input.openedClaim],
    };
  };
}
