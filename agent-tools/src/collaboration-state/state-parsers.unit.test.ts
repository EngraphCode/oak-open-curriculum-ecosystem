import { describe, expect, it } from 'vitest';

import { parseClosedClaimsArchive, parseCollaborationRegistry } from './state-parsers.js';

describe('parseCollaborationRegistry', () => {
  it('rejects a non-JSON file (e.g. a markdown file mistakenly passed to --active) with an actionable boundary error naming --active', () => {
    // A markdown file begins with `---` (YAML frontmatter); JSON.parse reads `-`
    // as the start of a number and fails with the position-only V8 message
    // "No number after minus sign in JSON at position 1" — which gives the
    // caller no clue they passed the wrong file. The boundary must explain it.
    const markdown = '---\nfitness_line_target: 400\n---\n\n# Repo Continuity\n';

    expect(() => parseCollaborationRegistry(markdown)).toThrow(
      /active-claims registry[\s\S]*--active[\s\S]*not valid JSON/,
    );
  });

  it('parses a valid empty registry', () => {
    const registry = parseCollaborationRegistry(
      JSON.stringify({ schema_version: '1.3.0', commit_queue: [], claims: [] }),
    );

    expect(registry.claims).toEqual([]);
    expect(registry.commit_queue).toEqual([]);
  });
});

describe('parseClosedClaimsArchive', () => {
  it('rejects a non-JSON file with an actionable boundary error naming --closed', () => {
    expect(() => parseClosedClaimsArchive('not json at all')).toThrow(
      /closed-claims archive[\s\S]*--closed[\s\S]*not valid JSON/,
    );
  });
});

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

function validIntentRow() {
  return {
    intent_id: '33333333-3333-4333-8333-333333333333',
    claim_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    agent_id: VALID_INTENT_AGENT_ID,
    files: ['agent-tools/src/collaboration-state/index.ts'],
    commit_subject: 'feat(state): exercise the intent identity boundary',
    queued_at: '2026-04-27T07:20:00Z',
    updated_at: '2026-04-27T07:20:00Z',
    expires_at: '2026-04-27T07:35:00Z',
    phase: 'queued',
  };
}

function legacyClaimRow() {
  return {
    claim_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    agent_id: LEGACY_IDLESS_AGENT_ID,
    thread: 'legacy-thread',
    areas: [{ kind: 'files', patterns: ['notes/**'] }],
    claimed_at: '2026-04-27T07:00:00Z',
    intent: 'Pre-sunset legacy row exercising the claim preservation contract.',
    // Fields OUTSIDE parseClaim's reconstructed set: a parser that rebuilds
    // claim rows field-by-field (instead of spreading) drops these, and the
    // whole-row preservation assertions redden.
    freshness_seconds: 14400,
    role: 'implementer',
  };
}

describe('parseCollaborationRegistry — PDR-076a intent identity boundary', () => {
  it('rejects an id-less intent agent_id loudly, naming the intent and the owner-run recovery', () => {
    const registry = JSON.stringify({
      schema_version: '1.3.0',
      commit_queue: [{ ...validIntentRow(), agent_id: LEGACY_IDLESS_AGENT_ID }],
      claims: [],
    });

    expect(() => parseCollaborationRegistry(registry)).toThrow(
      /commit_queue entry 33333333-3333-4333-8333-333333333333 carries an invalid agent_id[\s\S]*owner-run/,
    );
  });

  it('round-trips a valid intent row whole, with its routing id intact', () => {
    const parsed = parseCollaborationRegistry(
      JSON.stringify({ schema_version: '1.3.0', commit_queue: [validIntentRow()], claims: [] }),
    );

    expect(parsed.commit_queue[0]).toEqual(validIntentRow());
  });

  it('preserves an id-less legacy claim row whole — claims narrow at the comparator, never at parse', () => {
    const parsed = parseCollaborationRegistry(
      JSON.stringify({ schema_version: '1.3.0', commit_queue: [], claims: [legacyClaimRow()] }),
    );

    expect(parsed.claims[0]).toEqual(legacyClaimRow());
  });
});

describe('parseClosedClaimsArchive — PDR-076a legacy preservation', () => {
  it('parses an archived id-less claim whole: archive rows keep preservation semantics', () => {
    const parsed = parseClosedClaimsArchive(
      JSON.stringify({
        schema_version: '1.3.0',
        claims: [{ ...legacyClaimRow(), archived_at: '2026-04-28T07:00:00Z' }],
      }),
    );

    expect(parsed.claims[0]).toEqual({ ...legacyClaimRow(), archived_at: '2026-04-28T07:00:00Z' });
  });
});
