import { randomUUID } from 'node:crypto';

import { sameAgentRoutingKey } from './active-agent-routing.js';
import { optional, required, valueOrDefault, type Options } from './cli-options.js';
import { composeHeartbeatBody, HEARTBEAT_EVENT_TYPE } from './comms-heartbeat-body.js';
import { type CollaborationRegistry, type LifecycleCommsEvent } from './types.js';

/**
 * Heartbeat-tag typed-state CLI keys (Lane A — PDR-078 §5). The order
 * of this tuple is the canonical order the cure-naming error messages
 * surface to operators; tests assert on that order via regex.
 *
 * Structural coupling note: these four keys map 1:1 to the four fields
 * of heartbeatBodyStateSchema (claim-id ↔ claimId, intent-id ↔ intentId,
 * branch ↔ branch, current-cycle-label ↔ currentCycleLabel). If the
 * schema gains a fifth field, this tuple AND the typed object passed
 * to composeHeartbeatBody below MUST grow in lockstep.
 */
const HEARTBEAT_STATE_ARG_KEYS = [
  'claim-id',
  'intent-id',
  'branch',
  'current-cycle-label',
] as const;
type HeartbeatStateArgKey = (typeof HEARTBEAT_STATE_ARG_KEYS)[number];

function formatCliFlag(key: HeartbeatStateArgKey): string {
  return `--${key}`;
}

const HEARTBEAT_STATE_ARG_FLAGS = HEARTBEAT_STATE_ARG_KEYS.map(formatCliFlag).join(', ');
const HEARTBEAT_STATE_ARG_HINT = `Pass ${HEARTBEAT_STATE_ARG_FLAGS}.`;

/**
 * Heartbeat-tag CLI gate enforcing PDR-078 §5 "Substrate category:
 * heartbeats are liveness infrastructure". Rejects free-form --body /
 * --body-file argv on heartbeat-tagged events; requires the four typed
 * state args; composes the body deterministically via
 * composeHeartbeatBody. Error messages name the cure so operators can
 * fix the call without reading source.
 */
export function composeHeartbeatBodyFromOptions(options: Options): string {
  if (optional(options, 'body') !== undefined) {
    throw new Error(
      `heartbeat-tagged events: --body argv rejected. Heartbeats must compose their body from typed state args. ${HEARTBEAT_STATE_ARG_HINT}`,
    );
  }
  if (optional(options, 'body-file') !== undefined) {
    throw new Error(
      `heartbeat-tagged events: --body-file argv rejected. Heartbeats must compose their body from typed state args. ${HEARTBEAT_STATE_ARG_HINT}`,
    );
  }
  const missing = HEARTBEAT_STATE_ARG_KEYS.filter((key) => optional(options, key) === undefined);
  if (missing.length > 0) {
    const missingFlags = missing.map(formatCliFlag).join(', ');
    throw new Error(
      `heartbeat-tagged events require typed state args; missing: ${missingFlags}. ${HEARTBEAT_STATE_ARG_HINT}`,
    );
  }

  return composeHeartbeatBody({
    claimId: required(options, 'claim-id'),
    intentId: required(options, 'intent-id'),
    branch: required(options, 'branch'),
    currentCycleLabel: required(options, 'current-cycle-label'),
  });
}

/**
 * The single heartbeat-mode predicate over ARGV tags: body composition
 * and event-shape dispatch must agree on what counts as heartbeat mode,
 * or a drift produces a narrative event with a heartbeat body — or a
 * lifecycle event with free-form prose.
 */
export function isHeartbeatMode(tags: readonly string[]): boolean {
  return tags.includes('heartbeat');
}

/**
 * Build the ADR-186 lifecycle-shaped heartbeat event for heartbeat-mode
 * `comms append` / `comms send`, running the caller-supplied comms
 * concept gate (injected to keep this module free of the CLI command
 * layer — gating stays uniform across emission kinds). The lifecycle
 * envelope maps from heartbeat-mode inputs: `event_type` cites
 * {@link HEARTBEAT_EVENT_TYPE} (never a string literal — the renderer
 * tolerates unknown sub-kinds, so a typo'd token would silently vanish
 * from retirement detection), `occurred_at` equals `created-at` (a
 * heartbeat records the moment it is emitted), and `subject` duplicates
 * `title`. The caller retains the migration-window `heartbeat` tag so
 * F-146 tag exclusion, the `[HEARTBEAT]` render token, and pre-migration
 * tag-only consumers all keep working against the new shape.
 *
 * `--in-response-to` is rejected rather than dropped: the lifecycle
 * schema carries no threading edge, and silently swallowing the F-77
 * flag would subtract a standing capability without saying so.
 */
export async function buildGatedHeartbeatLifecycleEvent(input: {
  readonly options: Options;
  readonly author: LifecycleCommsEvent['author'];
  readonly body: string;
  readonly tags: readonly string[];
  readonly registry: CollaborationRegistry;
  readonly enforceGates: (gateInput: {
    readonly title: string;
    readonly body: string;
    readonly tags?: readonly string[];
  }) => Promise<void>;
}): Promise<LifecycleCommsEvent> {
  const { options, author, body, tags } = input;
  const title = required(options, 'title');
  await input.enforceGates({ title, body, tags });
  if (optional(options, 'in-response-to') !== undefined) {
    throw new Error(
      'heartbeat-tagged events: --in-response-to rejected. The ADR-186 lifecycle heartbeat shape carries no threading edge; acknowledge the antecedent with a separate narrative event.',
    );
  }
  const claimId = required(options, 'claim-id');
  const createdAt = required(options, 'created-at');
  return {
    schema_version: '2.0.0',
    event_id: valueOrDefault(options, 'event-id', randomUUID()),
    created_at: createdAt,
    kind: 'lifecycle',
    event_type: HEARTBEAT_EVENT_TYPE,
    occurred_at: createdAt,
    author,
    agent_id: author,
    thread: resolveHeartbeatThread(input.registry, claimId, author),
    claim_id: claimId,
    title,
    subject: title,
    body,
  };
}

/**
 * Resolve the lifecycle heartbeat's required `thread` from the active
 * claim row named by `--claim-id`. The row is REQUIRED unconditionally,
 * MUST belong to the emitting identity (PDR-076a routing-key match — a
 * heartbeat asserts "this seat is alive on its own claim", so a row
 * held by a peer would manufacture false liveness tied to another
 * seat's work), and is the thread's only source — a heartbeat's thread
 * is its claim's thread by construction (claim-anchored liveness by
 * settled doctrine: F-73's disposition — the pre-claim gap is
 * intentional; PDR-078 §4 / `liveness-heartbeat-cron` §Exemptions — a
 * standby neither needs nor can emit a heartbeat, and minting a marker
 * purely to anchor one is forbidden). The row comes from the SAME
 * registry snapshot the identity-write guard already loaded (the
 * `comms direct` single-read precedent — a second read would tear the
 * snapshots). A missing or foreign row is a cure-naming error, so armed
 * heartbeat loops fail loud, never silent.
 */
function resolveHeartbeatThread(
  registry: CollaborationRegistry,
  claimId: string,
  author: LifecycleCommsEvent['author'],
): string {
  const row = registry.claims.find((claim) => claim.claim_id === claimId);
  if (row === undefined) {
    throw new Error(
      `heartbeat-tagged events require an active claim and no claim '${claimId}' exists in the registry. Heartbeats are claim-anchored liveness (PDR-078 §4; F-73): open a claim first, or — for a claimless at-rest seat — do not heartbeat (the consumer-absent exemption applies).`,
    );
  }
  if (!sameAgentRoutingKey(row.agent_id, author)) {
    throw new Error(
      `heartbeat-tagged events must anchor to the emitting seat's own active claim and claim '${claimId}' belongs to '${row.agent_id.agent_name}'. Heartbeats are claim-anchored liveness (PDR-078 §4): open your own claim first — never anchor to a peer's claim id.`,
    );
  }
  return row.thread;
}
