import { describe, expect, it } from 'vitest';

import {
  formatClassifiedEvent,
  formatWatcherEventHeader,
} from '../../src/collaboration-state/comms-event-format';
import { type EventView } from '../../src/collaboration-state/comms-relevant-events';
import { collaborationAgentIdSchema, type CommsEvent } from '../../src/collaboration-state/types';

describe('formatWatcherEventHeader', () => {
  it('renders broadcast view without tags when tags is undefined', () => {
    expect(formatWatcherEventHeader('broadcast', undefined)).toBe('--- NEW [BROADCAST] EVENT ---');
  });

  it('renders group view without tags when tags is undefined', () => {
    expect(formatWatcherEventHeader('group', undefined)).toBe('--- NEW [GROUP] EVENT ---');
  });

  it('renders directed view without tags when tags is undefined', () => {
    expect(formatWatcherEventHeader('directed', undefined)).toBe('--- NEW [DIRECTED] EVENT ---');
  });

  it('renders observed view without tags when tags is undefined', () => {
    expect(formatWatcherEventHeader('observed', undefined)).toBe('--- NEW [OBSERVED] EVENT ---');
  });

  it('renders lifecycle view without tags when tags is undefined', () => {
    expect(formatWatcherEventHeader('lifecycle', undefined)).toBe('--- NEW [LIFECYCLE] EVENT ---');
  });

  it('renders an empty tags array identically to undefined tags', () => {
    expect(formatWatcherEventHeader('broadcast', [])).toBe('--- NEW [BROADCAST] EVENT ---');
  });

  it('renders a single failure-mode tag on a broadcast event', () => {
    expect(formatWatcherEventHeader('broadcast', ['failure-mode'])).toBe(
      '--- NEW [BROADCAST] [FAILURE-MODE] EVENT ---',
    );
  });

  it('renders a single behaviour-note tag on a directed event', () => {
    expect(formatWatcherEventHeader('directed', ['behaviour-note'])).toBe(
      '--- NEW [DIRECTED] [BEHAVIOUR-NOTE] EVENT ---',
    );
  });

  it('sorts two tags alphabetically when input is reverse-alphabetical', () => {
    expect(formatWatcherEventHeader('broadcast', ['failure-mode', 'behaviour-note'])).toBe(
      '--- NEW [BROADCAST] [BEHAVIOUR-NOTE] [FAILURE-MODE] EVENT ---',
    );
  });

  it('produces the same output for alphabetical input on a lifecycle event', () => {
    expect(formatWatcherEventHeader('lifecycle', ['behaviour-note', 'failure-mode'])).toBe(
      '--- NEW [LIFECYCLE] [BEHAVIOUR-NOTE] [FAILURE-MODE] EVENT ---',
    );
  });

  it('renders an unknown tag literally with uppercase normalisation', () => {
    expect(formatWatcherEventHeader('broadcast', ['doctrine-update'])).toBe(
      '--- NEW [BROADCAST] [DOCTRINE-UPDATE] EVENT ---',
    );
  });

  it('uppercases a mixed-case tag', () => {
    expect(formatWatcherEventHeader('directed', ['Mixed-Tag'])).toBe(
      '--- NEW [DIRECTED] [MIXED-TAG] EVENT ---',
    );
  });

  it('does not mutate the input tags array', () => {
    const tags: readonly string[] = ['failure-mode', 'behaviour-note'];
    const snapshot = [...tags];
    const view: EventView = 'broadcast';
    formatWatcherEventHeader(view, tags);
    expect([...tags]).toStrictEqual(snapshot);
  });
});

// Watcher identity lines carry the visual-disambiguator token for
// id-carrying blocks and the bare wire prefix for id-less blocks
// (displayPrefix is total). The id literal is reused from the 2a-ratified
// token table in visual-disambiguator.unit.test.ts.
describe('formatClassifiedEvent identity lines', () => {
  const tokenAgent = collaborationAgentIdSchema.parse({
    agent_name: 'Uplifted Wheeling Sky',
    platform: 'claude',
    model: 'claude-fable-5',
    session_id_prefix: '22e835',
    id: '1bb4df59-58e8-5b71-b41b-eebd1f587dda',
  });
  const bareAgent = collaborationAgentIdSchema.parse({
    agent_name: 'Woodland Creeping Petal',
    platform: 'codex',
    model: 'GPT-5',
    session_id_prefix: '019dd3',
  });

  it('renders the token on the from line of an id-carrying narrative author', () => {
    const event: CommsEvent = {
      schema_version: '2.0.0',
      event_id: 'token-narrative',
      created_at: '2026-04-28T09:00:00Z',
      kind: 'narrative',
      author: tokenAgent,
      title: 'token event',
      body: 'Token body.',
    };

    const lines = formatClassifiedEvent({ event, view: 'broadcast' }).split('\n');

    expect(lines).toContain('from: Uplifted Wheeling Sky / claude / 22e835-dda');
  });

  it('renders token from and bare to on a directed message with mixed blocks', () => {
    const event: CommsEvent = {
      schema_version: '2.0.0',
      event_id: 'token-directed',
      created_at: '2026-04-28T09:05:00Z',
      kind: 'directed',
      message_kind: 'coordination-update',
      from: tokenAgent,
      to: bareAgent,
      subject: 'mixed identity blocks',
      body: 'Directed body.',
    };

    const lines = formatClassifiedEvent({ event, view: 'directed' }).split('\n');

    expect(lines).toContain('from: Uplifted Wheeling Sky / claude / 22e835-dda');
    expect(lines).toContain('to: Woodland Creeping Petal / codex / 019dd3');
  });
});

describe('formatClassifiedEvent — ADR-186 lifecycle-shaped heartbeat render', () => {
  const author = collaborationAgentIdSchema.parse({
    agent_name: 'Uplifted Wheeling Sky',
    platform: 'claude',
    model: 'claude-fable-5',
    session_id_prefix: '22e835',
    id: '1bb4df59-58e8-5b71-b41b-eebd1f587dda',
  });

  function lifecycleHeartbeat(
    overrides: { subject?: string; occurredAt?: string } = {},
  ): CommsEvent {
    return {
      schema_version: '2.0.0',
      event_id: 'lifecycle-hb',
      created_at: '2026-08-02T19:00:00Z',
      kind: 'lifecycle',
      event_type: 'heartbeat',
      occurred_at: overrides.occurredAt ?? '2026-08-02T19:00:00Z',
      author,
      agent_id: author,
      thread: 'estate-coordination',
      claim_id: 'claim-1',
      title: 'Heartbeat: Uplifted Wheeling Sky (22e835) — test lane',
      subject: overrides.subject ?? 'Heartbeat: Uplifted Wheeling Sky (22e835) — test lane',
      body: 'active; claim=c; intent=i; branch=b; cycle=y',
      tags: ['heartbeat'],
    };
  }

  it('renders the [LIFECYCLE] view with exactly ONE [HEARTBEAT] token (the ADR-186 at-most-once render guarantee)', () => {
    const text = formatClassifiedEvent({ event: lifecycleHeartbeat(), view: 'lifecycle' });

    expect(text).toContain('--- NEW [LIFECYCLE] [HEARTBEAT] EVENT ---');
    expect(text.match(/\[HEARTBEAT\]/g)).toHaveLength(1);
  });

  it('omits the duplicate subject and occurred_at lines when they equal title and created_at (the dedup is kind-wide, not heartbeat-special)', () => {
    const lines = formatClassifiedEvent({ event: lifecycleHeartbeat(), view: 'lifecycle' }).split(
      '\n',
    );

    expect(lines).toContain('title: Heartbeat: Uplifted Wheeling Sky (22e835) — test lane');
    expect(lines).toContain('created_at: 2026-08-02T19:00:00Z');
    expect(lines.some((line) => line.startsWith('subject:'))).toBe(false);
    expect(lines.some((line) => line.startsWith('occurred_at:'))).toBe(false);
  });

  it('applies the same dedup to a non-heartbeat lifecycle event_type', () => {
    const event: CommsEvent = {
      schema_version: '2.0.0',
      event_id: 'lifecycle-cycle-complete',
      created_at: '2026-08-02T19:00:00Z',
      kind: 'lifecycle',
      event_type: 'cycle-complete',
      occurred_at: '2026-08-02T19:00:00Z',
      author,
      agent_id: author,
      thread: 'estate-coordination',
      claim_id: 'claim-1',
      title: 'Cycle complete: review round closed',
      subject: 'Cycle complete: review round closed',
      body: 'round closed with zero findings',
    };

    const lines = formatClassifiedEvent({ event, view: 'lifecycle' }).split('\n');

    expect(lines).toContain('title: Cycle complete: review round closed');
    expect(lines.some((line) => line.startsWith('subject:'))).toBe(false);
    expect(lines.some((line) => line.startsWith('occurred_at:'))).toBe(false);
  });

  it('keeps distinct subject and occurred_at lines when they genuinely differ', () => {
    const lines = formatClassifiedEvent({
      event: lifecycleHeartbeat({
        subject: 'a different summary line',
        occurredAt: '2026-08-02T18:55:00Z',
      }),
      view: 'lifecycle',
    }).split('\n');

    expect(lines).toContain('subject: a different summary line');
    expect(lines).toContain('occurred_at: 2026-08-02T18:55:00Z');
  });
});
