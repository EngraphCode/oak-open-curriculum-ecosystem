import { mapErr, unwrapErr, unwrapOrThrow } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import {
  MalformedJsonError,
  SurfaceContractError,
  checkCollaborationSurfaceContract,
} from './surface-contract.js';

/**
 * The one collaboration-state-owned surface-contract gate. Failure kinds are
 * a closed union narrowed on the literal `kind` — consumers map them to
 * their own finding vocabularies without instanceof sniffing — and every
 * failure carries the original parser error as a typed `causeError`, so the
 * state-io write gates rethrow the ORIGINAL loud message identity-intact
 * through `unwrapOrThrow(mapErr(...))` (pinned anchored below).
 */

const REGISTRY_PATH = '.agent/state/collaboration/active-claims.json';

const IDLESS_INTENT_ROW = {
  intent_id: '33333333-3333-4333-8333-333333333333',
  claim_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  agent_id: {
    agent_name: 'Vintage Pre-Sunset Seat',
    platform: 'codex',
    model: 'gpt-4.9',
    session_id_prefix: '00aa11',
  },
  files: ['agent-tools/src/commit-queue/index.ts'],
  commit_subject: 'feat(queue): exercise the contract gate',
  queued_at: '2026-04-27T07:20:00Z',
  updated_at: '2026-04-27T07:20:00Z',
  expires_at: '2026-04-27T07:35:00Z',
  phase: 'queued',
};

function registryText(commitQueue: readonly unknown[]): string {
  return JSON.stringify({
    schema_version: '1.3.0',
    commit_queue: commitQueue,
    claims: [],
    // Unknown top-level key: present in the RAW json product; the domain
    // value is the parser's reconstruction (the documented divergence) —
    // which is exactly why `json`, never `value`, feeds schema validation.
    custodian_note: 'raw-json preservation probe',
  });
}

describe('checkCollaborationSurfaceContract', () => {
  it('passes a contract-satisfying registry, carrying the RAW json for schema validation and the parsed domain value', () => {
    const result = checkCollaborationSurfaceContract({
      schemaId: 'active-claims.schema.json',
      path: REGISTRY_PATH,
      text: registryText([]),
    });

    const checked = unwrapOrThrow(result);
    expect(checked.json).toMatchObject({ custodian_note: 'raw-json preservation probe' });
    expect(checked.value.schema_version).toBe('1.3.0');
    expect(checked.value.claims).toEqual([]);
  });

  it('passes the other two contract surfaces on satisfying text', () => {
    expect(
      checkCollaborationSurfaceContract({
        schemaId: 'closed-claims.schema.json',
        path: '.agent/state/collaboration/closed-claims.archive.json',
        text: JSON.stringify({ schema_version: '1.3.0', claims: [] }),
      }).ok,
    ).toBe(true);
    expect(
      checkCollaborationSurfaceContract({
        schemaId: 'comms-event.schema.json',
        path: '.agent/state/collaboration/comms/e.json',
        text: JSON.stringify({
          schema_version: '2.0.0',
          event_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          created_at: '2026-04-27T07:20:00Z',
          kind: 'narrative',
          author: {
            agent_name: 'Vintage Pre-Sunset Seat',
            platform: 'codex',
            model: 'gpt-4.9',
            session_id_prefix: '00aa11',
          },
          title: 'contract gate probe',
          body: 'contract gate probe body',
        }),
      }).ok,
    ).toBe(true);
  });

  it('classifies a contract violation with kind, path-labelled message, verbatim reason, and the original error as causeError', () => {
    const result = checkCollaborationSurfaceContract({
      schemaId: 'active-claims.schema.json',
      path: REGISTRY_PATH,
      text: registryText([IDLESS_INTENT_ROW]),
    });

    const failure = unwrapErr(result);
    expect(failure).toBeInstanceOf(SurfaceContractError);
    expect(failure.kind).toBe('contract-failure');
    if (failure.kind !== 'contract-failure') {
      return;
    }
    expect(failure.reason).toMatch(
      /^commit_queue entry 33333333-3333-4333-8333-333333333333 carries an invalid agent_id/,
    );
    expect(failure.message).toBe(
      `${REGISTRY_PATH} does not satisfy its surface contract: ${failure.reason}`,
    );
    expect(failure.causeError.message).toBe(failure.reason);
  });

  it('classifies text that is not JSON at all as malformed-json carrying the path-labelled JSON error', () => {
    const result = checkCollaborationSurfaceContract({
      schemaId: 'active-claims.schema.json',
      path: REGISTRY_PATH,
      text: '---\nnot json',
    });

    const failure = unwrapErr(result);
    expect(failure).toBeInstanceOf(MalformedJsonError);
    expect(failure.kind).toBe('malformed-json');
    if (failure.kind !== 'malformed-json') {
      return;
    }
    expect(failure.message).toBe(`${REGISTRY_PATH} is not valid JSON`);
    expect(failure.causeError.message).toMatch(
      /^\.agent\/state\/collaboration\/active-claims\.json is not valid JSON: /,
    );
  });

  it('rethrows the ORIGINAL parser error identity-intact through the state-io fold shape', () => {
    const result = checkCollaborationSurfaceContract({
      schemaId: 'active-claims.schema.json',
      path: REGISTRY_PATH,
      text: registryText([IDLESS_INTENT_ROW]),
    });

    // The write-path gates fold exactly like this pre-2c; the anchored pin
    // catches any wrap that would prefix or rename the loud message.
    expect(() => unwrapOrThrow(mapErr(result, (failure) => failure.causeError))).toThrow(
      /^commit_queue entry 33333333-3333-4333-8333-333333333333 carries an invalid agent_id/,
    );
  });
});
