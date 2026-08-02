import { unwrapErr } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { parseCommsEventValue } from '../../src/collaboration-state/state-schemas.js';

/**
 * Strictness pins for the union value parser: every $def is a strict object,
 * so an unrecognised field is refused rather than silently dropped. The
 * fixtures are canonical-but-for-one-extra-field, so each case can fail for
 * exactly one reason — a fixture that is also wrong elsewhere could match
 * the assertion off a different defect and hide a strictness regression.
 */

const agent = {
  agent_name: 'Woodland Creeping Petal',
  platform: 'codex',
  model: 'GPT-5',
  session_id_prefix: '019dd3',
} as const;

const narrative = {
  schema_version: '2.0.0',
  event_id: 'narrative-event',
  created_at: '2026-05-07T15:49:02Z',
  kind: 'narrative',
  author: agent,
  title: 'Narrative event',
  body: 'Narrative body.',
} as const;

const lifecycle = {
  schema_version: '2.0.0',
  event_id: 'lifecycle-event',
  created_at: '2026-04-29T14:30:00Z',
  kind: 'lifecycle',
  event_type: 'comms_event',
  occurred_at: '2026-04-29T14:30:00Z',
  author: agent,
  agent_id: agent,
  thread: 'agentic-engineering-enhancements',
  claim_id: '',
  title: 'Lifecycle event',
  subject: 'Lifecycle subject',
  body: 'Lifecycle body.',
} as const;

const directed = {
  schema_version: '2.0.0',
  event_id: 'directed-event',
  created_at: '2026-05-10T18:15:00Z',
  kind: 'directed',
  message_kind: 'session-handoff-summary',
  from: agent,
  to: agent,
  subject: 'Directed subject',
  body: 'Directed body.',
} as const;

describe('strict comms event parsing', () => {
  it('accepts each canonical fixture, proving the strict cases below fail on the extra field alone', () => {
    expect(parseCommsEventValue(narrative).ok).toBe(true);
    expect(parseCommsEventValue(lifecycle).ok).toBe(true);
    expect(parseCommsEventValue(directed).ok).toBe(true);
  });

  it('rejects unrecognised narrative fields instead of silently dropping them', () => {
    expect(
      unwrapErr(parseCommsEventValue({ ...narrative, unrecognised_field: 'no' })).message,
    ).toMatch(/Unrecognized key/);
  });

  it('rejects unrecognised lifecycle fields instead of silently dropping them', () => {
    expect(
      unwrapErr(parseCommsEventValue({ ...lifecycle, extra_lifecycle_field: 'no' })).message,
    ).toMatch(/Unrecognized key/);
  });

  it('rejects unrecognised directed fields instead of silently dropping them', () => {
    expect(
      unwrapErr(parseCommsEventValue({ ...directed, extra_directed_field: 'no' })).message,
    ).toMatch(/Unrecognized key/);
  });
});
