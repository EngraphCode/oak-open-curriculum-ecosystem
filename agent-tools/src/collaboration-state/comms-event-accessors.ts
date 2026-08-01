/**
 * Field accessors over the comms-event union — the one module that owns
 * which field carries a concept per event kind. Extracted when the author
 * narrowing reached its fourth copy (consolidate-at-second-consumer); the
 * title narrowing had independently reached its third.
 *
 * @packageDocumentation
 */
import { type CollaborationAgentId, type CommsEvent } from './types.js';

/**
 * The record WRITER's identity block: `author` on narrative and lifecycle
 * events, `from` on directed messages.
 */
export function commsEventAuthor(event: CommsEvent): CollaborationAgentId {
  return event.kind === 'directed' ? event.from : event.author;
}

/**
 * The event's heading text: `subject` on directed messages, `title` on
 * narrative and lifecycle events.
 */
export function commsEventTitle(event: CommsEvent): string {
  return event.kind === 'directed' ? event.subject : event.title;
}
