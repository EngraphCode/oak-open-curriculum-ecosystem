/**
 * Tests for `renderSharedCommsLog` — the per-kind renderers and the
 * chronological merge across the unified comms event kinds.
 */
import { describe, expect, it } from 'vitest';

import {
  createCommsEvent,
  renderSharedCommsLog,
  type CollaborationAgentId,
  type CommsEvent,
} from '../../src/collaboration-state';
import { collaborationAgentIdSchema } from '../../src/collaboration-state/types';

const nowIso = '2026-04-28T09:37:11Z';

const woodland: CollaborationAgentId = {
  agent_name: 'Woodland Creeping Petal',
  platform: 'codex',
  model: 'GPT-5',
  session_id_prefix: '019dd3',
};

describe('renderSharedCommsLog', () => {
  it('renders narrative events chronologically and labels the canonical source directory', () => {
    const rendered = renderSharedCommsLog({
      events: [
        createCommsEvent(
          {
            schema_version: '2.0.0',
            event_id: 'event-two',
            created_at: '2026-04-28T09:05:00Z',
            kind: 'narrative',
            author: woodland,
            title: 'second event',
            body: 'Rendered second.',
          },
          { nowIso },
        ),
        createCommsEvent(
          {
            schema_version: '2.0.0',
            event_id: 'event-one',
            created_at: '2026-04-28T09:00:00Z',
            kind: 'narrative',
            author: woodland,
            title: 'first event',
            body: 'Rendered first.',
          },
          { nowIso },
        ),
      ],
    });

    expect(rendered.indexOf('first event')).toBeLessThan(rendered.indexOf('second event'));
    expect(rendered).toContain('merge_class: append-only-narrative');
    expect(rendered).toContain('Generated from `.agent/state/collaboration/comms/`');
    expect(rendered).toContain('# Agent-to-Agent Shared Communication Log');
    expect(rendered).toContain('Rendered first.\n\n---\n\n## 2026-04-28T09:05:00Z');
  });

  it('merges the three event kinds in chronological order regardless of input order', () => {
    const narrativeEvent = createCommsEvent(
      {
        schema_version: '2.0.0',
        event_id: 'narrative-event-id',
        created_at: '2026-04-28T09:00:00Z',
        kind: 'narrative',
        author: woodland,
        title: 'narrative first',
        body: 'Narrative body.',
      },
      { nowIso },
    );
    const lifecycleEvent = {
      schema_version: '2.0.0',
      event_id: 'lifecycle-event-id',
      created_at: '2026-04-28T09:10:00Z',
      kind: 'lifecycle',
      event_type: 'consolidation_open',
      occurred_at: '2026-04-28T09:10:00Z',
      author: woodland,
      agent_id: woodland,
      thread: 'agentic-engineering-enhancements',
      claim_id: '',
      title: 'lifecycle middle',
      subject: 'lifecycle middle subject',
      body: 'Lifecycle body.',
    } satisfies CommsEvent;
    const directedMessage = {
      schema_version: '2.0.0',
      event_id: 'directed-message-id',
      created_at: '2026-04-28T09:20:00Z',
      kind: 'directed',
      message_kind: 'session-handoff-summary',
      from: woodland,
      to: woodland,
      subject: 'directed last',
      body: 'Directed body.',
    } satisfies CommsEvent;

    const rendered = renderSharedCommsLog({
      events: [directedMessage, lifecycleEvent, narrativeEvent],
    });

    expect(rendered.indexOf('narrative first')).toBeLessThan(rendered.indexOf('lifecycle middle'));
    expect(rendered.indexOf('lifecycle middle')).toBeLessThan(rendered.indexOf('directed last'));
  });

  it('labels directed sections with the message-kind prefix', () => {
    const directedMessage = {
      schema_version: '2.0.0',
      event_id: 'directed-message-id',
      created_at: '2026-04-28T09:20:00Z',
      kind: 'directed',
      message_kind: 'session-handoff-summary',
      from: woodland,
      to: woodland,
      subject: 'directed subject',
      body: 'Directed body.',
    } satisfies CommsEvent;

    const rendered = renderSharedCommsLog({
      events: [directedMessage],
    });

    expect(rendered).toContain('[directed:session-handoff-summary]');
  });

  // Id-carrying authors render the visual-disambiguator token in the heading
  // prefix field; id-less blocks keep the bare wire prefix (displayPrefix is
  // total). The id literal is reused from the 2a-ratified token table in
  // visual-disambiguator.unit.test.ts so the tables stay cross-checkable.
  describe('heading identity field', () => {
    const tokenAuthor = collaborationAgentIdSchema.parse({
      agent_name: 'Uplifted Wheeling Sky',
      platform: 'claude',
      model: 'claude-fable-5',
      session_id_prefix: '22e835',
      id: '1bb4df59-58e8-5b71-b41b-eebd1f587dda',
    });

    it('renders the token for an id-carrying narrative author', () => {
      const rendered = renderSharedCommsLog({
        events: [
          createCommsEvent(
            {
              schema_version: '2.0.0',
              event_id: 'token-narrative',
              created_at: '2026-04-28T09:00:00Z',
              kind: 'narrative',
              author: tokenAuthor,
              title: 'token event',
              body: 'Token body.',
            },
            { nowIso },
          ),
        ],
      });

      expect(rendered).toContain(
        '## 2026-04-28T09:00:00Z — `Uplifted Wheeling Sky` / `claude` / ' +
          '`claude-fable-5` / `22e835-dda` — token event',
      );
    });

    it('renders the token for an id-carrying lifecycle author', () => {
      const rendered = renderSharedCommsLog({
        events: [
          {
            schema_version: '2.0.0',
            event_id: 'token-lifecycle',
            created_at: '2026-04-28T09:10:00Z',
            kind: 'lifecycle',
            event_type: 'consolidation_open',
            occurred_at: '2026-04-28T09:10:00Z',
            author: tokenAuthor,
            // Discriminating fixture: agent_id differs from author so the
            // heading pin fails if the renderer reads the wrong field.
            agent_id: woodland,
            thread: 'agentic-engineering-enhancements',
            claim_id: '',
            title: 'token lifecycle',
            subject: 'token lifecycle subject',
            body: 'Lifecycle body.',
          } satisfies CommsEvent,
        ],
      });

      expect(rendered).toContain(
        '## 2026-04-28T09:10:00Z — `Uplifted Wheeling Sky` / `claude` / ' +
          '`claude-fable-5` / `22e835-dda` — [lifecycle:consolidation_open] token lifecycle',
      );
    });

    it('keeps the bare wire prefix for an id-less legacy author', () => {
      const rendered = renderSharedCommsLog({
        events: [
          createCommsEvent(
            {
              schema_version: '2.0.0',
              event_id: 'bare-narrative',
              created_at: '2026-04-28T09:00:00Z',
              kind: 'narrative',
              author: woodland,
              title: 'bare event',
              body: 'Bare body.',
            },
            { nowIso },
          ),
        ],
      });

      expect(rendered).toContain(
        '## 2026-04-28T09:00:00Z — `Woodland Creeping Petal` / `codex` / ' +
          '`GPT-5` / `019dd3` — bare event',
      );
    });
  });
});
