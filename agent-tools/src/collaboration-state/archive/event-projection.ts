/**
 * Pure projection from a parsed {@link CommsEvent} to the
 * {@link ClassifiableEvent} fields the archive-move classifier needs.
 *
 * @remarks
 * Kept separate from both the `node:fs` boundary (`archive-move-node.ts`) and the
 * classification core (`event-classification.ts`): the boundary stays thin
 * untestable glue, the core stays decoupled from the comms wire shape, and this
 * mapping — the one place that knows directed events carry `subject` where
 * narrative / lifecycle events carry `title` — is unit-testable with no IO.
 *
 * @packageDocumentation
 */

import { commsEventTitle } from '../comms-event-accessors.js';
import { isHeartbeatEvent } from '../comms-heartbeat-body.js';
import type { CommsEvent } from '../types.js';
import type { ClassifiableEvent } from './event-classification.js';

/**
 * Project a parsed comms event to its classification-relevant fields.
 * The ADR-186 heartbeat dual-filter verdict is computed HERE — the one
 * module that knows the comms wire shape — so the classification core
 * consumes a boolean and never re-reads kind/event_type/tags itself.
 */
export function toClassifiableEvent(event: CommsEvent): ClassifiableEvent {
  return {
    eventId: event.event_id,
    kind: event.kind,
    createdAt: event.created_at,
    tags: event.tags ?? [],
    titleOrSubject: commsEventTitle(event),
    bodyLength: event.body.length,
    isHeartbeatShaped: isHeartbeatEvent(event),
  };
}
