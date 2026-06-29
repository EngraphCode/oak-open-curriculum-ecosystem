import { type ActiveAgentReport } from './active-agents.js';
import { formatRoutingKey, routingKeyFor } from './active-agent-routing.js';
import { type GitWorktree } from './git-worktree-list.js';
import {
  ACTIVE_BELOW_MS,
  RETIRED_AT_OR_ABOVE_MS,
  classifyState,
  type LatestHeartbeat,
  latestHeartbeatByPeer,
  type PeerLivenessState,
} from './peer-liveness.js';
import { type CollaborationAgentId, type CommsEvent } from './types.js';

/**
 * The bounded, derived cross-worktree work-state view (F-98, spawn-flow Phase
 * 2). It REPLACES the hand-maintained `cross-worktree-work-state.md` roster
 * with a projection over three ground-truth inputs — never a fifth authored
 * surface (it is NOT the larger PDR-118 unified registry, which is owner-gated):
 *
 *  - `git worktree list` — git ground truth: worktree path, branch, HEAD.
 *  - the comms heartbeat stream — the only structured `agent ↔ branch` link
 *    (claims carry no branch) AND the `last-seen` recency.
 *  - the claims registry — the agent's claimed `intent`.
 *
 * The binding is `worktree.branch ⋈ heartbeat.branch → agent`, enriched with
 * the agent's claim intent. The `lastSeen` recency is PDR-078 heartbeat-event
 * recency and is **input-to-verify** (pair with `ping-before-escalate`), NOT a
 * claim's `freshness_status` — that is the F-44 decision-class trap (claim
 * freshness reads `stale` for a live agent because comms heartbeats do not bump
 * `claimed_at`).
 */

/** The F-98 last-seen recency for a bound agent — input-to-verify, not freshness. */
interface WorkStateLastSeen {
  readonly at: string;
  readonly ageMs: number;
  readonly state: PeerLivenessState;
}

/** A derived work-state row: a worktree plus the agent bound to it (if any). */
export interface WorkStateRow {
  readonly worktreePath: string;
  readonly branch?: string;
  readonly head: string;
  readonly agent?: CollaborationAgentId;
  readonly intent?: string;
  readonly lastSeen?: WorkStateLastSeen;
}

/**
 * Index the agent's claimed intent by routing key. The first claim per agent
 * is the binding intent; the view shows the worktree's owner intent, not the
 * full claim list (which `claims active-agents` already renders).
 */
function intentByAgentKey(activeAgents: readonly ActiveAgentReport[]): Map<string, string> {
  const byKey = new Map<string, string>();
  for (const report of activeAgents) {
    const intent = report.claims[0]?.intent;
    if (intent !== undefined) {
      byKey.set(formatRoutingKey(report.routing_key), intent);
    }
  }
  return byKey;
}

/**
 * Index the latest heartbeat per branch. The agent↔branch link lives only on
 * the heartbeat stream; on the rare branch collision (two agents heartbeating
 * the same branch) the most-recent heartbeat wins, and an exact-timestamp tie
 * breaks by routing key (lower wins) so the result is order-independent — the
 * same tiebreak peer-liveness uses for its most-stale ordering.
 */
function latestHeartbeatByBranch(latest: Iterable<LatestHeartbeat>): Map<string, LatestHeartbeat> {
  const byBranch = new Map<string, LatestHeartbeat>();
  for (const heartbeat of latest) {
    if (heartbeat.branch === undefined) {
      continue;
    }
    const existing = byBranch.get(heartbeat.branch);
    if (existing === undefined || winsBranch(heartbeat, existing)) {
      byBranch.set(heartbeat.branch, heartbeat);
    }
  }
  return byBranch;
}

/** A heartbeat wins its branch if it is more recent, ties broken by lower routing key. */
function winsBranch(candidate: LatestHeartbeat, existing: LatestHeartbeat): boolean {
  if (candidate.createdAtMs !== existing.createdAtMs) {
    return candidate.createdAtMs > existing.createdAtMs;
  }
  const candidateKey = formatRoutingKey(routingKeyFor(candidate.identity));
  const existingKey = formatRoutingKey(routingKeyFor(existing.identity));
  return candidateKey.localeCompare(existingKey) < 0;
}

/**
 * Project the derived work-state rows, one per worktree, ordered by worktree
 * path for a stable, scannable view. Pure and IO-free: the caller supplies the
 * already-read worktrees, comms events, claim reports, and a single `nowMs`, so
 * the projection is fully unit-testable without git, a clock, or the
 * filesystem.
 *
 * The view is worktree-spined: there is one row per worktree and no more. An
 * agent heartbeating a branch that matches NO listed worktree does not appear —
 * absence here is not proof of inactivity (use `claims active-agents` /
 * `comms peer-liveness` for an agent-spined view). This is the cost of binding
 * through the self-reported heartbeat branch; an agent that heartbeats a stale
 * branch (e.g. the coordination branch instead of its feature branch) binds to
 * that branch's worktree, not its own.
 *
 * `nowMs` must be finite — the caller validates it (the CLI guards `--now`), the
 * same contract `peerHeartbeatLiveness` keeps. A non-finite `nowMs` would make
 * every `ageMs` NaN and classify every agent `retired` (`NaN < threshold` is
 * false on both comparisons).
 */
export function projectWorkState(input: {
  readonly worktrees: readonly GitWorktree[];
  readonly events: readonly CommsEvent[];
  readonly activeAgents: readonly ActiveAgentReport[];
  readonly nowMs: number;
  readonly activeBelowMs?: number;
  readonly retiredAtOrAboveMs?: number;
}): readonly WorkStateRow[] {
  const activeBelowMs = input.activeBelowMs ?? ACTIVE_BELOW_MS;
  const retiredAtOrAboveMs = input.retiredAtOrAboveMs ?? RETIRED_AT_OR_ABOVE_MS;
  const byBranch = latestHeartbeatByBranch(latestHeartbeatByPeer(input.events).values());
  const intents = intentByAgentKey(input.activeAgents);

  return input.worktrees
    .map((worktree): WorkStateRow => {
      const heartbeat = worktree.branch === undefined ? undefined : byBranch.get(worktree.branch);
      if (heartbeat === undefined) {
        return { worktreePath: worktree.path, branch: worktree.branch, head: worktree.head };
      }
      const ageMs = input.nowMs - heartbeat.createdAtMs;
      return {
        worktreePath: worktree.path,
        branch: worktree.branch,
        head: worktree.head,
        agent: heartbeat.identity,
        intent: intents.get(formatRoutingKey(routingKeyFor(heartbeat.identity))),
        lastSeen: {
          at: heartbeat.createdAt,
          ageMs,
          state: classifyState(ageMs, activeBelowMs, retiredAtOrAboveMs),
        },
      };
    })
    .toSorted((left, right) => left.worktreePath.localeCompare(right.worktreePath));
}
