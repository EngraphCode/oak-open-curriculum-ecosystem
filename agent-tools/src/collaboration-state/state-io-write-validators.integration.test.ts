import { unwrapErr } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { activeClaimsWriteValidator } from './state-io-write-validators.js';

/**
 * The composed write gates (contract check, then schema validation). The
 * anchored pin below is the write-gate half of the byte-identity guarantee:
 * the Err arm must carry the parser's ORIGINAL error — a slip to the
 * check's wrapper (whose message is path-prefixed) reddens the anchor. The
 * transaction fold's half (the unwrap that rethrows this Err's error by
 * identity) is pinned in transaction.integration.test.ts. Integration
 * classification: importing the gate module evaluates the schema-directory
 * walk at module level, and the Ajv-leg case below reads the real schema
 * files.
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
  commit_subject: 'feat(queue): exercise the composed write gate',
  queued_at: '2026-04-27T07:20:00Z',
  updated_at: '2026-04-27T07:20:00Z',
  expires_at: '2026-04-27T07:35:00Z',
  phase: 'queued',
};

function registryText(commitQueue: readonly unknown[]): string {
  return JSON.stringify({ schema_version: '1.3.0', commit_queue: commitQueue, claims: [] });
}

describe('activeClaimsWriteValidator', () => {
  it('returns the ORIGINAL parser error on a contract failure — anchored so a wrapper slip reddens', async () => {
    const result = await activeClaimsWriteValidator(REGISTRY_PATH)(
      registryText([IDLESS_INTENT_ROW]),
    );

    expect(unwrapErr(result).message).toMatch(
      /^commit_queue entry 33333333-3333-4333-8333-333333333333 carries an invalid agent_id/,
    );
  });

  it('returns the path-labelled JSON error on malformed text, before any schema validation', async () => {
    const result = await activeClaimsWriteValidator(REGISTRY_PATH)('---\nnot json');

    // Anchored: the check's MalformedJsonError wrapper carries the same
    // prefix WITHOUT the ": <detail>" tail, so a slip to the wrapper reddens.
    expect(unwrapErr(result).message).toMatch(
      /^\.agent\/state\/collaboration\/active-claims\.json is not valid JSON: /,
    );
  });

  it('rejects contract-valid text whose raw form violates the JSON schema — the Ajv leg reads the raw text', async () => {
    // The contract parser reconstructs field-by-field and DROPS unknown
    // fields, so it accepts this text; only the Ajv leg (raw text,
    // additionalProperties: false) can refuse it. Dropping the schema leg
    // would silently re-open the reconstruction-loss trap.
    const result = await activeClaimsWriteValidator(REGISTRY_PATH)(
      JSON.stringify({
        schema_version: '1.3.0',
        commit_queue: [],
        claims: [],
        unknown_extra: true,
      }),
    );

    expect(unwrapErr(result).message).toMatch(/must NOT have additional properties/);
  });
});
