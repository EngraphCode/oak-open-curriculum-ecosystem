/**
 * Comms-event leg of the Codex identity audit. Communication history is
 * audited from the event stream, never from the rendered shared log — a
 * generated read model whose heading field carries the render-time display
 * token, not the wire prefix.
 *
 * @packageDocumentation
 */
import {
  isAnonymousCodexAgent,
  type CodexIdentityAuditFinding,
} from './identity-audit-findings.js';
import { type CollaborationAgentId, type CommsEvent } from './types.js';

/**
 * Report anonymous Codex identity blocks on comms events, one finding per
 * anonymous block, block-addressed via `event:<event_id>#<field>`.
 */
export function auditCommsEvents(
  events: readonly CommsEvent[],
): readonly CodexIdentityAuditFinding[] {
  return events.flatMap((event) =>
    auditedBlocks(event).flatMap(([field, identity]) =>
      isAnonymousCodexAgent(identity)
        ? [
            {
              source: 'comms-event' as const,
              record_ref: `event:${event.event_id}#${field}`,
              classification: 'historical-no-repair' as const,
              agent_id: identity,
              reason: 'Comms event is historical communication evidence; do not rewrite.',
            },
          ]
        : [],
    ),
  );
}

// Audited blocks are the writer plus the lifecycle SUBJECT: `author` on
// narrative/lifecycle, `agent_id` on lifecycle (the two are independently
// migrated and can diverge), `from` on directed. Relay blocks (`to`,
// `addressed_to`, `audience`) evidence what the writer knew about OTHER
// agents and are never audited.
function auditedBlocks(
  event: CommsEvent,
): readonly (readonly [field: string, identity: CollaborationAgentId])[] {
  if (event.kind === 'directed') {
    return [['from', event.from]];
  }
  if (event.kind === 'lifecycle') {
    return [
      ['author', event.author],
      ['agent_id', event.agent_id],
    ];
  }
  return [['author', event.author]];
}
