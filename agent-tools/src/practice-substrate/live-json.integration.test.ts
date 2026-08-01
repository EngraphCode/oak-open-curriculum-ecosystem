import { describe, expect, it } from 'vitest';

import { evaluateCollaborationJsonSurfaces } from './live-json.js';
import {
  makeTempSubstrateRepo,
  removeTempSubstrateRepo,
} from './test-helpers/temp-substrate-repo.js';

/**
 * Characterization of the live claim-surface contract-parser leg — written
 * BEFORE the seam-consolidation change and kept green through it: a
 * contract-violating registry (valid JSON, id-less intent row) must surface
 * as exactly one schema-incoherence finding, produced by the contract gate
 * BEFORE Ajv runs. Real temp-directory IO makes this an integration test;
 * the IO lives behind the test-helpers surface (ADR-078).
 */

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
  commit_subject: 'feat(queue): exercise the parser gate',
  queued_at: '2026-04-27T07:20:00Z',
  updated_at: '2026-04-27T07:20:00Z',
  expires_at: '2026-04-27T07:35:00Z',
  phase: 'queued',
};

describe('evaluateCollaborationJsonSurfaces contract-parser leg', () => {
  it('passes a clean estate', async () => {
    const root = await makeTempSubstrateRepo({
      schema_version: '1.3.0',
      commit_queue: [],
      claims: [],
    });
    try {
      expect(await evaluateCollaborationJsonSurfaces(root)).toStrictEqual([]);
    } finally {
      await removeTempSubstrateRepo(root);
    }
  });

  it('classifies a contract-violating registry (valid JSON, id-less intent) as exactly one schema-incoherence finding', async () => {
    const root = await makeTempSubstrateRepo({
      schema_version: '1.3.0',
      commit_queue: [IDLESS_INTENT_ROW],
      claims: [],
    });
    try {
      expect(await evaluateCollaborationJsonSurfaces(root)).toStrictEqual([
        {
          id: 'schema-incoherence',
          surface: 'collaboration-active-claims',
          severity: 'blocking',
          repair: 'manual-with-provenance',
          message:
            'JSON surface .agent/state/collaboration/active-claims.json does not satisfy its schema.',
          evidence: ['.agent/state/collaboration/active-claims.json'],
        },
      ]);
    } finally {
      await removeTempSubstrateRepo(root);
    }
  });
});
