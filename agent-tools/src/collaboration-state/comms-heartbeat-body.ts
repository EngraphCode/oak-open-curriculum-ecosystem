import { z } from 'zod';

import { type CommsEvent } from './types.js';

/**
 * Lane A (A1) — heartbeat emitter mechanical state-binding.
 *
 * Enforces PDR-078 §5 "Substrate category: heartbeats are liveness
 * infrastructure" at the CLI boundary: heartbeat-tagged comms events
 * MUST construct their body from typed state fields, not from free-form
 * `--body` argv. This module is the typed-origin invariant. The CLI
 * layer (`cli-comms-commands.ts`) rejects free-form `--body` /
 * `--body-file` when `--tag heartbeat` is present and composes the body
 * via `composeHeartbeatBody` instead.
 *
 * The cure shape: structured origin (typed args), not just non-empty
 * content. Empty strings are rejected so the body cannot silently
 * degrade into prose-equivalent ambiguity — a body like
 * "active; claim=; intent=; branch=; cycle=" satisfies the typed-origin
 * shape but defeats the purpose, so the schema rejects it.
 */
const heartbeatBodyStateSchema = z
  .object({
    claimId: z.string().min(1),
    intentId: z.string().min(1),
    branch: z.string().min(1),
    currentCycleLabel: z.string().min(1),
  })
  .strict();

export type HeartbeatBodyState = z.infer<typeof heartbeatBodyStateSchema>;

/**
 * Compose the heartbeat event body from typed state. The output is a
 * single deterministic line: parsing the input through the strict Zod
 * schema is the source of validation, and the format is the recorded
 * canonical shape for `[HEARTBEAT]` event bodies under ADR-186's
 * migration window.
 *
 * The compile-time `HeartbeatBodyState` contract guarantees field
 * presence; the runtime `.parse` here is **defence in depth** for one
 * gap the type system does not close: the schema's `.min(1)` rejects
 * empty-string values, which the `string` compile-time type permits.
 * The CLI gate in `cli-comms-commands.ts` rejects missing keys before
 * reaching this composer, so the only remaining failure mode this
 * `.parse` catches in practice is a caller that bypasses the CLI and
 * passes empty strings programmatically.
 *
 * Throws (Zod `ZodError`) on schema mismatch — the caller (CLI) handles
 * the error by surfacing a cure-naming message to the operator.
 */
export function composeHeartbeatBody(state: HeartbeatBodyState): string {
  const parsed = heartbeatBodyStateSchema.parse(state);
  return `active; claim=${parsed.claimId}; intent=${parsed.intentId}; branch=${parsed.branch}; cycle=${parsed.currentCycleLabel}`;
}

/**
 * The canonical heartbeat-body shape as a parser. The first three fields
 * (claim, intent, branch) are matched non-greedily up to their delimiter;
 * `cycle` is the rest of the line because a cycle label may itself contain `;`
 * or `=` (e.g. an `exit=DoD-or-handoff` suffix).
 */
const heartbeatBodyPattern = /^active; claim=(.+?); intent=(.+?); branch=(.+?); cycle=(.+)$/;

/**
 * Parse a canonical heartbeat-event body back into its typed state, or
 * `undefined` when the string is not a canonical heartbeat body.
 *
 * The inverse of {@link composeHeartbeatBody}, kept in this module so the body
 * format has a single source of truth and parse cannot drift from compose.
 * Values are validated through the same strict {@link heartbeatBodyStateSchema},
 * so a malformed or empty field yields `undefined` rather than a partial state —
 * the read-side counterpart of the typed-origin write-side invariant. Consumers
 * that need a structured field off the heartbeat stream (e.g. the derived
 * work-state view's branch binding) parse through here rather than re-splitting
 * the body string.
 */
export function parseHeartbeatBody(body: string): HeartbeatBodyState | undefined {
  const match = heartbeatBodyPattern.exec(body);
  if (match === null) {
    return undefined;
  }
  const [, claimId, intentId, branch, currentCycleLabel] = match;
  const parsed = heartbeatBodyStateSchema.safeParse({
    claimId,
    intentId,
    branch,
    currentCycleLabel,
  });
  return parsed.success ? parsed.data : undefined;
}

/**
 * The ADR-186 lifecycle-substrate discriminator for heartbeat liveness
 * events: `kind='lifecycle'` + `event_type=HEARTBEAT_EVENT_TYPE`. This is
 * the single typed-constant source ADR-186 §"What this costs" mandates —
 * emitters and consumers cite this constant by name; string-literal
 * duplication of the token across emitter sites violates the ADR, because
 * the renderer tolerates unknown sub-kinds and a typo'd `event_type` would
 * silently vanish from retirement detection.
 */
export const HEARTBEAT_EVENT_TYPE = 'heartbeat';

/**
 * ADR-186 §"Migration discipline" heartbeat discriminator, shared by every
 * consumer that counts heartbeats (peer-liveness retirement detection, the
 * archive tier projection). Deliberately a STRICT SUPERSET of the ADR's
 * canonical two-clause predicate: the tag clause stays kind-agnostic
 * because the pre-migration consumers were already kind-agnostic and
 * narrowing to `kind='narrative'` would subtract standing tolerance for
 * zero gain. A superset can only over-count liveness; the failure the
 * dual-filter contract exists to prevent is UNDER-counting (false
 * retirement of a live peer). The window-closure tidy removes the tag
 * clause — not the lifecycle clause — once every named emitter has landed
 * the lifecycle shape and a full-cycle sweep shows zero legacy events.
 */
export function isHeartbeatEvent(event: CommsEvent): boolean {
  if (event.kind === 'lifecycle' && event.event_type === HEARTBEAT_EVENT_TYPE) {
    return true;
  }
  return event.tags?.includes('heartbeat') ?? false;
}

export { heartbeatBodyStateSchema };
