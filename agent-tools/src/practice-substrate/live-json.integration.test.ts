import { describe, expect, it } from 'vitest';

import { evaluateCollaborationJsonSurfaces } from './live-json.js';
import { collaborationAjv, validateWithAjv } from './live-json-support.js';
import {
  makeTempSubstrateRepo,
  removeTempSubstrateRepo,
} from './test-helpers/temp-substrate-repo.js';

/**
 * Characterisation of the live claim-surface contract-parser leg — written
 * before the seam consolidation and kept green through it. The failing
 * fixture is SCHEMA-VALID but PARSER-INVALID (schema_version 1.2.0 is in
 * the schema's enum; the contract parser pins 1.3.0 exactly), so the
 * expected finding can ONLY come from the contract gate — deleting the
 * gate turns this test green-to-empty, not same-finding-via-Ajv. Real
 * temp-directory IO makes this an integration test; the IO lives behind
 * the test-helpers surface (ADR-078).
 */

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

  it('classifies a schema-valid but contract-violating registry (schema_version 1.2.0) as exactly one schema-incoherence finding from the gate', async () => {
    const root = await makeTempSubstrateRepo({
      schema_version: '1.2.0',
      commit_queue: [],
      claims: [],
    });
    try {
      // Detection-power invariant, asserted so its decay is LOUD: the schema
      // ALONE accepts this fixture (1.2.0 is in the enum) — if a future
      // schema change drops 1.2.0, Ajv starts producing the identical
      // finding and this test would silently stop detecting gate deletion.
      expect(
        validateWithAjv(
          await collaborationAjv(root),
          'active-claims.schema.json',
          'collaboration-active-claims',
          '.agent/state/collaboration/active-claims.json',
          { schema_version: '1.2.0', commit_queue: [], claims: [] },
        ),
      ).toStrictEqual([]);
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
