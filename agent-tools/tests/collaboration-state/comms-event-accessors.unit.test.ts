import { describe, expect, it } from 'vitest';

import {
  commsEventAuthor,
  commsEventTitle,
} from '../../src/collaboration-state/comms-event-accessors';
import { collaborationAgentIdSchema, type CommsEvent } from '../../src/collaboration-state/types';

// Discriminating fixtures: every identity/title-bearing field differs from
// its siblings, so each accessor test fails if the wrong field is read.
const writer = collaborationAgentIdSchema.parse({
  agent_name: 'Woodland Creeping Petal',
  platform: 'codex',
  model: 'GPT-5',
  session_id_prefix: '019dd3',
});

const other = collaborationAgentIdSchema.parse({
  agent_name: 'Moonlit Transiting Prism',
  platform: 'cursor',
  model: 'GPT-5.5',
  session_id_prefix: 'e86710',
});

const narrative: CommsEvent = {
  schema_version: '2.0.0',
  event_id: 'narrative-event',
  created_at: '2026-04-28T09:00:00Z',
  kind: 'narrative',
  author: writer,
  addressed_to: other,
  title: 'narrative title',
  body: 'Narrative body.',
};

const lifecycle: CommsEvent = {
  schema_version: '2.0.0',
  event_id: 'lifecycle-event',
  created_at: '2026-04-28T09:01:00Z',
  kind: 'lifecycle',
  event_type: 'claim_lifecycle',
  occurred_at: '2026-04-28T09:01:00Z',
  author: writer,
  agent_id: other,
  thread: 'agentic-engineering-enhancements',
  claim_id: 'claim-one',
  title: 'lifecycle title',
  subject: 'lifecycle subject',
  body: 'Lifecycle body.',
};

const directed: CommsEvent = {
  schema_version: '2.0.0',
  event_id: 'directed-event',
  created_at: '2026-04-28T09:02:00Z',
  kind: 'directed',
  message_kind: 'coordination-update',
  from: writer,
  to: other,
  subject: 'directed subject',
  body: 'Directed body.',
};

describe('commsEventAuthor', () => {
  it('reads author on a narrative event, not the addressee', () => {
    expect(commsEventAuthor(narrative)).toStrictEqual(writer);
  });

  it('reads author on a lifecycle event, not the subject agent_id', () => {
    expect(commsEventAuthor(lifecycle)).toStrictEqual(writer);
  });

  it('reads from on a directed message, not the addressee', () => {
    expect(commsEventAuthor(directed)).toStrictEqual(writer);
  });
});

describe('commsEventTitle', () => {
  it('reads title on a narrative event', () => {
    expect(commsEventTitle(narrative)).toBe('narrative title');
  });

  it('reads title on a lifecycle event, not its subject', () => {
    expect(commsEventTitle(lifecycle)).toBe('lifecycle title');
  });

  it('reads subject on a directed message', () => {
    expect(commsEventTitle(directed)).toBe('directed subject');
  });
});
