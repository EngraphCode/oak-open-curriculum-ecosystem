/**
 * Integration tests for the generator's filesystem boundary: fallible fs
 * operations translate to Err at the boundary (ADR-088), never a rejection.
 */
import { isErr, unwrapErr } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { generateContentModule } from './generator.js';
import {
  createTempRepoWithCanonicalOnly,
  removeTempRepo,
} from './test-helpers/temp-canonical-fixture.js';

describe('generateContentModule (integration)', () => {
  it('surfaces a filesystem write failure as Err, never a rejection', async () => {
    // The fixture carries the canonical but NOT the generated module's parent directory.
    const root = await createTempRepoWithCanonicalOnly();
    try {
      const result = await generateContentModule(root);
      expect(isErr(result)).toBe(true);
      expect(unwrapErr(result)).toMatch(/Cannot write/);
    } finally {
      await removeTempRepo(root);
    }
  });
});
