import {
  type AgentRoutingKey,
  formatRoutingKey,
  routingKeyFor,
  sameAgentRoutingKey,
} from './active-agent-routing.js';
import { commsEventAuthor } from './comms-event-accessors.js';
import { isHeartbeatEvent, parseHeartbeatBody } from './comms-heartbeat-body.js';
import { type CollaborationAgentId, type CommsEvent } from './types.js';

/**
 * Peer-liveness classification over the PDR-078 heartbeat *comms-event*
 * stream (F-75). This reads peers' heartbeat events in BOTH ADR-186
 * migration-window shapes via the shared {@link isHeartbeatEvent} dual
 * filter — the legacy `narrative + tags:["heartbeat"]` shape and the
 * canonical `lifecycle + event_type='heartbeat'` shape — the
 * ≤4-minute-cadence liveness signal — NOT the watcher's own
 * `<seen>.heartbeat.json` file (that is `watcher-staleness.ts`, a distinct
 * surface) and NOT claim freshness (`claim-reports.ts`, a deliberately coarse
 * 4-hour window that cannot detect a silently-retired peer).
 *
 * The classifier mirrors `watcher-staleness.ts`'s discriminated-union model
 * but over the event stream: filter heartbeat-tagged events, group by author
 * routing key, take the latest per peer, and classify its age against the
 * PDR-078 state thresholds. It is the reusable liveness core the F-44 / OQ5
 * composed-liveness work consumes unchanged; treat its output as
 * input-to-verify (pair with `ping-before-escalate`), never an automatic
 * retirement verdict.
 */

/** PDR-078 §State thresholds: a heartbeat younger than this is `active`. */
export const ACTIVE_BELOW_MS = 4 * 60 * 1000;

/** PDR-078 §State thresholds: a heartbeat this old or older is `retired`. */
export const RETIRED_AT_OR_ABOVE_MS = 10 * 60 * 1000;

/**
 * Discriminated liveness state of a peer's most-recent heartbeat, per the
 * PDR-078 state-threshold table:
 *
 * - `active`: latest heartbeat younger than `activeBelowMs` (default 4 min).
 * - `offline`: latest heartbeat in `[activeBelowMs, retiredAtOrAboveMs)` —
 *   the transient 4–10 min window where resume is assumed imminent.
 * - `retired`: latest heartbeat `retiredAtOrAboveMs` (default 10 min) or
 *   older — the silence threshold that presumes retirement.
 */
export type PeerLivenessState = 'active' | 'offline' | 'retired';

interface PeerLivenessReportBase {
  readonly routingKey: AgentRoutingKey;
  readonly identity: CollaborationAgentId;
  readonly lastHeartbeatAt: string;
  readonly ageMs: number;
}

/**
 * One report per peer that has emitted at least one heartbeat, carrying the
 * identity from its latest heartbeat, that heartbeat's timestamp, its age at
 * `nowMs`, and the classified `state`. Discriminated on `state` so a consumer
 * can narrow exhaustively.
 */
export type PeerLivenessReport =
  | (PeerLivenessReportBase & { readonly state: 'active' })
  | (PeerLivenessReportBase & { readonly state: 'offline' })
  | (PeerLivenessReportBase & { readonly state: 'retired' });

export function classifyState(
  ageMs: number,
  activeBelowMs: number,
  retiredAtOrAboveMs: number,
): PeerLivenessState {
  if (ageMs < activeBelowMs) {
    return 'active';
  }
  if (ageMs < retiredAtOrAboveMs) {
    return 'offline';
  }
  return 'retired';
}

export interface LatestHeartbeat {
  readonly identity: CollaborationAgentId;
  readonly createdAtMs: number;
  readonly createdAt: string;
  /**
   * The `branch` field parsed from the canonical heartbeat body, or `undefined`
   * when the body is not canonical. This is the only structured agent↔branch
   * link on the comms stream (claims carry no branch), so the derived
   * work-state view binds a worktree to its agent through it.
   */
  readonly branch?: string;
}

/**
 * Classify each peer's heartbeat liveness from the comms event stream.
 *
 * Filters to heartbeat-tagged events, optionally excludes the calling agent
 * (`self`), groups the rest by author routing key, keeps the latest heartbeat
 * per peer, and classifies its age at `nowMs`. Peers that have never emitted a
 * heartbeat do not appear (the stream is the only evidence). Results are
 * ordered most-stale-first (largest `ageMs`), so a caller filtering for
 * `retired` reads the alert at the top; ties break by routing key for
 * determinism.
 *
 * Pure and IO-free: the caller supplies the already-read events (see
 * `readCommsEvents`) and a single `nowMs`, so the classifier is fully
 * unit-testable without a clock or filesystem.
 */
export function peerHeartbeatLiveness(input: {
  readonly events: readonly CommsEvent[];
  readonly nowMs: number;
  readonly self?: CollaborationAgentId;
  readonly activeBelowMs?: number;
  readonly retiredAtOrAboveMs?: number;
}): readonly PeerLivenessReport[] {
  const activeBelowMs = input.activeBelowMs ?? ACTIVE_BELOW_MS;
  const retiredAtOrAboveMs = input.retiredAtOrAboveMs ?? RETIRED_AT_OR_ABOVE_MS;

  return Array.from(latestHeartbeatByPeer(input.events, input.self).values())
    .map((latest): PeerLivenessReport => {
      const ageMs = input.nowMs - latest.createdAtMs;
      return {
        routingKey: routingKeyFor(latest.identity),
        identity: latest.identity,
        lastHeartbeatAt: latest.createdAt,
        ageMs,
        state: classifyState(ageMs, activeBelowMs, retiredAtOrAboveMs),
      };
    })
    .toSorted(byMostStaleThenRoutingKey);
}

interface HeartbeatContribution extends LatestHeartbeat {
  readonly key: string;
}

/**
 * Group heartbeat events by author routing key and keep the latest per peer,
 * dropping events that contribute no usable live-peer heartbeat (see
 * {@link heartbeatContribution}).
 */
export function latestHeartbeatByPeer(
  events: readonly CommsEvent[],
  self?: CollaborationAgentId,
): Map<string, LatestHeartbeat> {
  const latestByPeer = new Map<string, LatestHeartbeat>();
  for (const event of events) {
    const contribution = heartbeatContribution(event, self);
    if (contribution === undefined) {
      continue;
    }
    const existing = latestByPeer.get(contribution.key);
    if (existing === undefined || contribution.createdAtMs > existing.createdAtMs) {
      latestByPeer.set(contribution.key, contribution);
    }
  }
  return latestByPeer;
}

/**
 * Parse one event into a live-peer heartbeat contribution, or `undefined` to
 * skip it. Skips: non-heartbeat events; the calling agent (`self`); id-less
 * identities (PDR-076a historical pre-sunset rows — never a live peer, and
 * `routingKeyFor` fails fast on them); and an unparseable `created_at`. Skipping
 * a malformed timestamp rather than classifying it is the cure for the
 * NaN-flows-to-`retired` false positive (`NaN < threshold` is false on both
 * comparisons, so a bad timestamp would otherwise manufacture a `retired`
 * verdict). The CLI path is schema-validated (`z.iso.datetime`); this guards the
 * documented in-process reusable-core consumers (F-44 / OQ5), and dropping one
 * corrupt event keeps it from hiding the rest of the live cast.
 */
function heartbeatContribution(
  event: CommsEvent,
  self: CollaborationAgentId | undefined,
): HeartbeatContribution | undefined {
  const author = commsEventAuthor(event);
  if (!isHeartbeatEvent(event) || author.id === undefined) {
    return undefined;
  }
  if (self !== undefined && sameAgentRoutingKey(author, self)) {
    return undefined;
  }
  const createdAtMs = Date.parse(event.created_at);
  if (Number.isNaN(createdAtMs)) {
    return undefined;
  }
  return {
    key: formatRoutingKey(routingKeyFor(author)),
    identity: author,
    createdAtMs,
    createdAt: event.created_at,
    branch: parseHeartbeatBody(event.body)?.branch,
  };
}

/** Order most-stale-first (largest age), breaking ties by routing key. */
function byMostStaleThenRoutingKey(left: PeerLivenessReport, right: PeerLivenessReport): number {
  const byAge = right.ageMs - left.ageMs;
  if (byAge !== 0) {
    return byAge;
  }
  return formatRoutingKey(left.routingKey).localeCompare(formatRoutingKey(right.routingKey));
}
