/**
 * Parser tests for the unified communication event kinds.
 *
 * The canonical comms-event schema at
 * `.agent/state/collaboration/comms-event.schema.json` defines three event
 * shapes ($defs.narrative, $defs.lifecycle, $defs.directed). The TypeScript
 * layer projects the schema's $defs through ONE union value parser
 * (`parseCommsEventValue`, kind-discriminated) plus the text-level Result
 * parser (`parseCommsEvent`). Per-kind field assertions here narrow through
 * the union, so every case also exercises the kind dispatch.
 *
 * These tests are the TypeScript-layer correctness gate; the schema-
 * authority gate lives in `comms-event-schema.unit.test.ts`, and the
 * text-level arms (malformed JSON, non-object JSON) are pinned by the
 * colocated `state-parsers.unit.test.ts` beside the source.
 */
import { unwrapErr, unwrapOrThrow } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { parseCommsEvent } from '../../src/collaboration-state/state-parsers.js';
import { parseCommsEventValue } from '../../src/collaboration-state/state-schemas.js';
import {
  type DirectedCommsMessage,
  type LifecycleCommsEvent,
  type NarrativeCommsEvent,
} from '../../src/collaboration-state/types.js';

const woodland = {
  agent_name: 'Woodland Creeping Petal',
  platform: 'codex',
  model: 'GPT-5',
  session_id_prefix: '019dd3',
} as const;

const sylvan = {
  agent_name: 'Sylvan Fruiting Glade',
  platform: 'claude-code',
  model: 'claude-opus-4-7-1m',
  session_id_prefix: 'a53e45',
} as const;

// Purpose-built UUID v5 test vectors. The uuidV5Schema refines on character
// position 14 = '5' (the v5 version nibble per RFC 4122). Position 19 = '8'
// keeps the variant nibble RFC-4122-compliant (the 10xx pattern). Visually
// distinct uniform-hex patterns make test failures grep-able without
// coupling fixtures to any real agent's derived identity.
const TEST_AGENT_ALPHA_ID = 'aaaaaaaa-aaaa-5aaa-8aaa-aaaaaaaaaaaa';
const TEST_AGENT_BETA_ID = 'bbbbbbbb-bbbb-5bbb-8bbb-bbbbbbbbbbbb';

const woodlandWithId = {
  ...woodland,
  id: TEST_AGENT_ALPHA_ID,
} as const;

const sylvanWithId = {
  ...sylvan,
  id: TEST_AGENT_BETA_ID,
} as const;

const canonicalNarrative = {
  schema_version: '2.0.0',
  event_id: '00de9e88-44a5-41c1-a9a5-6488a890ff07',
  created_at: '2026-05-07T15:49:02Z',
  kind: 'narrative',
  author: woodland,
  title: 'Canonical narrative event title',
  body: 'Canonical narrative event body.',
} as const;

const narrativeWithAffordances = {
  schema_version: '2.0.0',
  event_id: 'narrative-with-affordances',
  created_at: '2026-05-03T09:35:57Z',
  kind: 'narrative',
  author: woodland,
  audience: [sylvan],
  addressed_to: sylvan,
  in_response_to: 'earlier-event-id',
  in_reply_to: 'another-earlier-event-id',
  title: 'Narrative with all optional affordances',
  body: 'Validates that audience / addressed_to / in_response_to / in_reply_to are accepted.',
} as const;

const lifecycle = {
  schema_version: '2.0.0',
  event_id: 'fe4acc7e-cons-doc-2026-04-29-14-30',
  created_at: '2026-04-29T14:30:00Z',
  kind: 'lifecycle',
  event_type: 'comms_event',
  occurred_at: '2026-04-29T14:30:00Z',
  author: woodland,
  agent_id: woodland,
  thread: 'agentic-engineering-enhancements',
  claim_id: 'fe4acc7e-1234-4abc-9def-0123456789ab',
  title: 'Lifecycle event title',
  subject: 'Lifecycle event subject',
  body: 'Records a session lifecycle moment.',
} as const;

const directedPostMigration = {
  schema_version: '2.0.0',
  event_id: '3882213c-a6b1-4661-a1cd-a261f50ea5e8',
  created_at: '2026-05-10T18:15:00Z',
  kind: 'directed',
  message_kind: 'session-handoff-summary',
  from: woodland,
  to: sylvan,
  subject: 'Session-handoff summary',
  body: 'Directed message body.',
} as const;

// Kind-narrowing helpers: unwrap the union, then narrow by discriminant.
// A wrong-kind parse returns undefined, so every field assertion below
// fails loudly on a dispatch defect instead of narrowing past it.
function asNarrative(value: unknown): NarrativeCommsEvent | undefined {
  const event = unwrapOrThrow(parseCommsEventValue(value));
  return event.kind === 'narrative' ? event : undefined;
}

function asLifecycle(value: unknown): LifecycleCommsEvent | undefined {
  const event = unwrapOrThrow(parseCommsEventValue(value));
  return event.kind === 'lifecycle' ? event : undefined;
}

function asDirected(value: unknown): DirectedCommsMessage | undefined {
  const event = unwrapOrThrow(parseCommsEventValue(value));
  return event.kind === 'directed' ? event : undefined;
}

function rejectionMessage(value: unknown): string {
  return unwrapErr(parseCommsEventValue(value)).message;
}

function omit(record: Record<string, unknown>, key: string): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).filter(([entryKey]) => entryKey !== key));
}

describe('narrative events through the union value parser', () => {
  it('parses a canonical narrative event, whole-row equal to the fixture', () => {
    expect(asNarrative(canonicalNarrative)).toEqual(canonicalNarrative);
  });

  it('preserves every optional routing and threading affordance on a narrative event', () => {
    expect(asNarrative(narrativeWithAffordances)).toEqual(narrativeWithAffordances);
  });

  it('rejects a legacy string-form addressed_to (post-WS1 tuple is canonical)', () => {
    expect(
      rejectionMessage({
        ...canonicalNarrative,
        addressed_to: 'Riverine Drifting Lighthouse',
      }),
    ).toMatch(/addressed_to/);
  });

  it('rejects a partial 2-field addressed_to tuple missing platform/model', () => {
    expect(
      rejectionMessage({
        ...canonicalNarrative,
        addressed_to: {
          agent_name: 'Riverine Drifting Lighthouse',
          session_id_prefix: 'd1105c',
        },
      }),
    ).toMatch(/addressed_to/);
  });

  it('rejects legacy null threading fields', () => {
    expect(rejectionMessage({ ...canonicalNarrative, in_response_to: null })).toMatch(
      /in_response_to/,
    );
    expect(rejectionMessage({ ...canonicalNarrative, in_reply_to: null })).toMatch(/in_reply_to/);
  });

  it('rejects a narrative event missing the required body field', () => {
    expect(rejectionMessage(omit({ ...canonicalNarrative }, 'body'))).toMatch(/body/);
  });

  it('round-trips an optional tags array on a narrative event', () => {
    const event = asNarrative({ ...canonicalNarrative, tags: ['failure-mode'] });

    expect(event?.tags).toEqual(['failure-mode']);
  });

  it('reports a non-object value as an Err at the union boundary', () => {
    expect(rejectionMessage(42)).toMatch(/communication event/);
  });
});

describe('lifecycle events through the union value parser', () => {
  it('parses a lifecycle event, whole-row equal to the fixture', () => {
    expect(asLifecycle(lifecycle)).toEqual(lifecycle);
  });

  it('accepts an empty claim_id for non-claim-scoped lifecycle events', () => {
    const event = asLifecycle({ ...lifecycle, claim_id: '' });

    expect(event?.claim_id).toBe('');
  });

  it('rejects a lifecycle event missing the event_type discriminator field', () => {
    expect(rejectionMessage(omit({ ...lifecycle }, 'event_type'))).toMatch(/event_type/);
  });

  it('round-trips an optional tags array on a lifecycle event', () => {
    const event = asLifecycle({ ...lifecycle, tags: ['failure-mode'] });

    expect(event?.tags).toEqual(['failure-mode']);
  });
});

describe('directed messages through the union value parser', () => {
  it('parses a directed message in the post-migration shape, whole-row equal to the fixture', () => {
    expect(asDirected(directedPostMigration)).toEqual(directedPostMigration);
  });

  it('rejects the legacy directed shape that carries timestamp instead of created_at', () => {
    const legacyShape = {
      ...omit({ ...directedPostMigration }, 'created_at'),
      timestamp: directedPostMigration.created_at,
    };

    expect(rejectionMessage(legacyShape)).toMatch(/created_at/);
  });

  it('rejects a directed message missing the to field', () => {
    expect(rejectionMessage(omit({ ...directedPostMigration }, 'to'))).toMatch(/to/);
  });

  it('round-trips an optional tags array on a directed message', () => {
    const event = asDirected({ ...directedPostMigration, tags: ['failure-mode'] });

    expect(event?.tags).toEqual(['failure-mode']);
  });

  it('round-trips the optional in_response_to threading edge on a directed message', () => {
    const event = asDirected({ ...directedPostMigration, in_response_to: 'antecedent-event-1' });

    expect(event?.in_response_to).toBe('antecedent-event-1');
  });
});

describe('parseCommsEvent', () => {
  it('dispatches canonical events through the top-level kind discriminator', () => {
    expect(unwrapOrThrow(parseCommsEvent(JSON.stringify(canonicalNarrative))).kind).toBe(
      'narrative',
    );
    expect(unwrapOrThrow(parseCommsEvent(JSON.stringify(lifecycle))).kind).toBe('lifecycle');
    expect(unwrapOrThrow(parseCommsEvent(JSON.stringify(directedPostMigration))).kind).toBe(
      'directed',
    );
  });
});

describe('PDR-076a §Cascade item 3 — agent identity id field round-trip', () => {
  it('round-trips id on a narrative event author', () => {
    const event = asNarrative({ ...canonicalNarrative, author: woodlandWithId });

    expect(event?.author.id).toBe(TEST_AGENT_ALPHA_ID);
    expect(event?.author.agent_name).toBe('Woodland Creeping Petal');
  });

  it('round-trips id on every routing role of a narrative event (author, addressed_to, audience)', () => {
    const event = asNarrative({
      ...narrativeWithAffordances,
      author: woodlandWithId,
      addressed_to: sylvanWithId,
      audience: [sylvanWithId, woodlandWithId],
    });

    expect(event?.author.id).toBe(TEST_AGENT_ALPHA_ID);
    expect(event?.addressed_to?.id).toBe(TEST_AGENT_BETA_ID);
    expect(event?.audience).toEqual([sylvanWithId, woodlandWithId]);
  });

  it('round-trips id on a lifecycle event author and agent_id', () => {
    const event = asLifecycle({ ...lifecycle, author: woodlandWithId, agent_id: woodlandWithId });

    expect(event?.author.id).toBe(TEST_AGENT_ALPHA_ID);
    expect(event?.agent_id.id).toBe(TEST_AGENT_ALPHA_ID);
  });

  it('round-trips id on a directed message from and to', () => {
    const event = asDirected({
      ...directedPostMigration,
      from: woodlandWithId,
      to: sylvanWithId,
    });

    expect(event?.from.id).toBe(TEST_AGENT_ALPHA_ID);
    expect(event?.to.id).toBe(TEST_AGENT_BETA_ID);
  });

  it('still parses legacy identities without an id field (additive migration window)', () => {
    const event = asNarrative(canonicalNarrative);

    expect(event?.author).toEqual(woodland);
    expect(event?.author.id).toBeUndefined();
  });

  it('rejects a non-UUID-v5 id on the author (refines on the version nibble)', () => {
    const v4Id = '00000000-0000-4000-8000-000000000000';

    expect(rejectionMessage({ ...canonicalNarrative, author: { ...woodland, id: v4Id } })).toMatch(
      /UUID v5|version nibble/i,
    );
  });
});
