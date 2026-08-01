import { unwrapErr, unwrapOrThrow } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { parseIntentAgentId } from '../collaboration-state/agent-id.js';
import { parseRegistry, parseRegistryText, readRegistry } from './registry.js';

/**
 * Pure-value description of the commit-queue registry parse layer's Result
 * contract (ADR-088). Every error literal below is the layer's public
 * failure surface: consumers (the commit workflow's `load-intent` stage, the
 * CLI boundary, the transaction adapter) relay these messages verbatim, so a
 * reword is a behaviour change and must redden here. The matchers pin the
 * FULL message (`toBe`, or `^`/`$`-anchored regexes) — an unanchored
 * substring match cannot catch a wrapping slip such as `unwrap` in place of
 * `unwrapOrThrow`, which prefixes rather than replaces the message.
 */

const REGISTRY_PATH = 'active-claims.json';
const INTENT_ID = '33333333-3333-4333-8333-333333333333';

const VALID_INTENT_AGENT_ID = {
  agent_name: 'Prismatic Waxing Constellation',
  platform: 'codex',
  model: 'gpt-5.5',
  session_id_prefix: '019dcd',
  id: 'e2e793c7-923e-5baa-97f0-2bedfb9b6b50',
};

const LEGACY_IDLESS_AGENT_ID = {
  agent_name: 'Vintage Pre-Sunset Seat',
  platform: 'codex',
  model: 'gpt-4.9',
  session_id_prefix: '00aa11',
};

function validIntentRow(): Record<string, unknown> {
  return {
    intent_id: INTENT_ID,
    claim_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    agent_id: VALID_INTENT_AGENT_ID,
    files: ['agent-tools/src/commit-queue/index.ts'],
    commit_subject: 'feat(queue): exercise the registry round trip',
    queued_at: '2026-04-27T07:20:00Z',
    updated_at: '2026-04-27T07:20:00Z',
    expires_at: '2026-04-27T07:35:00Z',
    phase: 'queued',
    // All three conditional-extras branches of intent reconstruction: a
    // parser that stops carrying an optional field drops one of these and
    // the whole-row equality reddens.
    staged_bundle_fingerprint: 'fingerprint-preservation-probe',
    staged_name_status: 'M\tagent-tools/src/commit-queue/index.ts',
    notes: 'optional-field preservation probe',
  };
}

function legacyClaimRow(): Record<string, unknown> {
  return {
    claim_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    agent_id: LEGACY_IDLESS_AGENT_ID,
    thread: 'legacy-thread',
    areas: [{ kind: 'files', patterns: ['notes/**'] }],
    claimed_at: '2026-04-27T07:00:00Z',
    intent: 'Pre-sunset legacy row exercising the write-back preservation contract.',
    // Fields OUTSIDE any reconstructed set: field-by-field rebuilding of
    // claim rows drops these and the whole-row equality reddens.
    freshness_seconds: 14400,
    role: 'implementer',
  };
}

function withoutKey(record: Record<string, unknown>, key: string): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).filter(([entryKey]) => entryKey !== key));
}

function registryValue(commitQueue: readonly unknown[]): Record<string, unknown> {
  return {
    schema_version: '1.3.0',
    commit_queue: commitQueue,
    claims: [legacyClaimRow()],
    // Unknown top-level key: parseRegistry spreads the top level, so the key
    // survives PARSING (pinned here). Under the latest-only schema contract
    // it is out of schema (additionalProperties false), and the composed Ajv
    // write gate refuses any write-back that still carries it.
    custodian_note: 'top-level preservation probe',
  };
}

describe('parseRegistry', () => {
  it('round-trips a full registry value, preserving unknown top-level keys, whole legacy claim rows, and every optional intent field', () => {
    const value = registryValue([validIntentRow()]);

    const parsed = unwrapOrThrow(parseRegistry(value, REGISTRY_PATH));

    expect(parsed).toEqual(registryValue([validIntentRow()]));
  });

  it('rejects a non-object value naming the registry path', () => {
    const result = parseRegistry('not an object', REGISTRY_PATH);

    const error = unwrapErr(result);
    expect(error).toBeInstanceOf(TypeError);
    expect(error.message).toBe('active-claims.json must contain a JSON object');
  });

  it('rejects a foreign schema_version naming the registry path', () => {
    const result = parseRegistry({ ...registryValue([]), schema_version: '1.4.0' }, REGISTRY_PATH);

    expect(unwrapErr(result).message).toBe(
      'active-claims.json must use schema_version 1.3.0 before commit queue writes',
    );
  });

  it('rejects a missing commit_queue array naming the registry path', () => {
    const result = parseRegistry(withoutKey(registryValue([]), 'commit_queue'), REGISTRY_PATH);

    const error = unwrapErr(result);
    expect(error).toBeInstanceOf(TypeError);
    expect(error.message).toBe('active-claims.json must contain a top-level commit_queue array');
  });

  it('rejects a missing claims array naming the registry path', () => {
    const result = parseRegistry(withoutKey(registryValue([]), 'claims'), REGISTRY_PATH);

    const error = unwrapErr(result);
    expect(error).toBeInstanceOf(TypeError);
    expect(error.message).toBe('active-claims.json must contain a top-level claims array');
  });

  it('rejects an intent without a recognised phase as an incomplete intent object', () => {
    const result = parseRegistry(
      registryValue([{ ...validIntentRow(), phase: 'mystery' }]),
      REGISTRY_PATH,
    );

    expect(unwrapErr(result).message).toBe('commit_queue entries must be complete intent objects');
  });

  it('rejects an intent whose files array is sparse, naming the intent', () => {
    // isStringArray must check densely: a bare every() skips holes and would
    // admit files typed readonly string[] with undefined at index 0.
    const result = parseRegistry(
      registryValue([{ ...validIntentRow(), files: new Array(1) }]),
      REGISTRY_PATH,
    );

    expect(unwrapErr(result).message).toBe(
      'commit_queue entry 33333333-3333-4333-8333-333333333333 must contain a files array',
    );
  });

  it('rejects a sparse commit_queue hole as an incomplete intent object instead of throwing', () => {
    // A hole is not JSON-reachable, but parseRegistry takes `unknown` and its
    // Result contract is exception-freedom for ANY input (ADR-088): the dense
    // mapping must feed the hole to the total parser as undefined.
    const result = parseRegistry(registryValue(new Array(1)), REGISTRY_PATH);

    expect(unwrapErr(result).message).toBe('commit_queue entries must be complete intent objects');
  });

  it('rejects an intent without a files array, naming the intent', () => {
    const result = parseRegistry(
      registryValue([withoutKey(validIntentRow(), 'files')]),
      REGISTRY_PATH,
    );

    expect(unwrapErr(result).message).toBe(
      `commit_queue entry ${INTENT_ID} must contain a files array`,
    );
  });

  it('rejects an intent missing a required string field, naming the field', () => {
    const result = parseRegistry(
      registryValue([withoutKey(validIntentRow(), 'commit_subject')]),
      REGISTRY_PATH,
    );

    expect(unwrapErr(result).message).toBe('missing required string field: commit_subject');
  });

  it('rejects an intent timestamp that is not a calendar-valid ISO date-time, naming the field', () => {
    const result = parseRegistry(
      registryValue([{ ...validIntentRow(), queued_at: '2026-02-30T07:20:00Z' }]),
      REGISTRY_PATH,
    );

    expect(unwrapErr(result).message).toBe(
      'invalid ISO date-time for queued_at: 2026-02-30T07:20:00Z',
    );
  });

  it('rejects a non-object claim row', () => {
    const result = parseRegistry(
      { ...registryValue([]), claims: ['not an object'] },
      REGISTRY_PATH,
    );

    expect(unwrapErr(result).message).toBe('claims entries must be objects');
  });

  it('rejects a sparse claims hole as a non-object claim row instead of throwing', () => {
    // The sibling of the sparse commit_queue pin: each mapping site holds its
    // totality independently, so each needs its own distinguishing pin.
    const result = parseRegistry({ ...registryValue([]), claims: new Array(1) }, REGISTRY_PATH);

    expect(unwrapErr(result).message).toBe('claims entries must be objects');
  });

  it('rejects a claim row without a claim_id, naming the field', () => {
    const result = parseRegistry(
      { ...registryValue([]), claims: [{ agent_id: LEGACY_IDLESS_AGENT_ID }] },
      REGISTRY_PATH,
    );

    expect(unwrapErr(result).message).toBe('missing required string field: claim_id');
  });
});

describe('parseRegistryText', () => {
  it('parses valid registry JSON text end to end', () => {
    const text = JSON.stringify(registryValue([validIntentRow()]));

    const parsed = unwrapOrThrow(parseRegistryText(text, REGISTRY_PATH));

    expect(parsed).toEqual(registryValue([validIntentRow()]));
  });

  it('labels malformed JSON with the registry path instead of a bare position-only SyntaxError', () => {
    const result = parseRegistryText('---\nnot json', REGISTRY_PATH);

    expect(unwrapErr(result).message).toMatch(/^active-claims\.json is not valid JSON: /);
  });
});

describe('readRegistry (IO failure contract, injected read seam)', () => {
  it('enriches ENOENT into the verify-then-seed instructions for the untracked-by-design registry', async () => {
    const result = await readRegistry(REGISTRY_PATH, async () => {
      throw Object.assign(new Error('ENOENT: no such file or directory'), { code: 'ENOENT' });
    });

    const message = unwrapErr(result).message;
    expect(message).toMatch(/^active-claims registry not found at active-claims\.json\./);
    expect(message).toContain('untracked-by-design');
    expect(message).toContain('{ "schema_version": "1.3.0", "claims": [], "commit_queue": [] }');
  });

  it('passes a non-ENOENT read failure through as the original error object', async () => {
    const failure = Object.assign(new Error('EACCES: permission denied'), { code: 'EACCES' });

    const result = await readRegistry(REGISTRY_PATH, async () => {
      throw failure;
    });

    expect(unwrapErr(result)).toBe(failure);
  });

  it('crashes at detection on a non-Error throwable instead of admitting it to the Result channel', async () => {
    await expect(
      readRegistry(REGISTRY_PATH, async () => {
        throw 'not an error object';
      }),
    ).rejects.toThrow('non-Error value thrown at the state-file read boundary');
  });

  it('crashes at detection on a non-Error throwable even when it carries an ENOENT-shaped code', async () => {
    // The code never buys enrichment: only a real Error takes the
    // verify-then-seed branch; a code-carrying non-Error is a seam defect.
    const structural: Error = { name: 'Error', message: 'shaped like fs, not an instance' };

    await expect(
      readRegistry(REGISTRY_PATH, () =>
        Promise.reject(Object.assign(structural, { code: 'ENOENT' })),
      ),
    ).rejects.toThrow('non-Error value thrown at the state-file read boundary');
  });
});

describe('parseIntentAgentId (Err channel)', () => {
  it('returns the valid write-shape identity untouched', () => {
    const parsed = unwrapOrThrow(parseIntentAgentId(VALID_INTENT_AGENT_ID, INTENT_ID));

    expect(parsed).toEqual(VALID_INTENT_AGENT_ID);
  });

  it('rejects an id-less identity with the full loud message: head names the intent, tail names the owner-run recovery', () => {
    const result = parseIntentAgentId(LEGACY_IDLESS_AGENT_ID, INTENT_ID);

    const message = unwrapErr(result).message;
    expect(message).toMatch(
      /^commit_queue entry 33333333-3333-4333-8333-333333333333 carries an invalid agent_id \(PDR-076a requires the UUID v5 id on intents\): /,
    );
    expect(message).toMatch(
      /recovery is removing intent 33333333-3333-4333-8333-333333333333 \(owner-run\)\.$/,
    );
  });
});
