import { describe, it, expect } from 'vitest';
import { ok } from '@oaknational/result';
import type { LessonsSearchResult } from '@oaknational/oak-search-sdk/read';

import { runScopedSearch } from './search-core';
import {
  type Retrieval,
  lessonResult,
  unitsOk,
  threadsOk,
  sizedRetrieval,
  scopeLengths,
} from './search-core.test-fixtures';

/**
 * The E3 showcase surface of `runScopedSearch`: per-scope sizes flowing to the
 * retrieval boundary (asserted on the OUTPUT envelope via the size-semantics
 * fake, never call inspection) and per-scope meta sourced from the SDK result
 * meta. The core mapping/degradation states are proven in
 * `search-core.integration.test.ts`.
 */
describe('runScopedSearch showcase surface (E3)', () => {
  it('carries per-scope meta from the SDK result meta, not derived from the returned page', async () => {
    const retrieval: Retrieval = {
      searchLessons: () =>
        Promise.resolve(
          ok({
            scope: 'lessons',
            total: 42,
            took: 7,
            timedOut: false,
            results: [lessonResult],
          } satisfies LessonsSearchResult),
        ),
      searchUnits: () => Promise.resolve(ok(unitsOk([]))),
      searchThreads: () => Promise.resolve(ok(threadsOk([]))),
    };

    const result = await runScopedSearch(retrieval, 'fractions');

    expect(result).toMatchObject({ value: { meta: { lessons: { total: 42, took: 7 } } } });
  });

  it('defaults to the hub scope sizes (9/6/8) when no sizes are given', async () => {
    const result = await runScopedSearch(sizedRetrieval, 'fractions');

    expect(scopeLengths(result)).toEqual([9, 6, 8]);
  });

  it('honours caller-supplied per-scope sizes', async () => {
    const result = await runScopedSearch(sizedRetrieval, 'fractions', {
      lessons: 2,
      units: 1,
      threads: 1,
    });

    expect(scopeLengths(result)).toEqual([2, 1, 1]);
  });

  it('applies the hub default for scopes omitted from a partial sizes object', async () => {
    const result = await runScopedSearch(sizedRetrieval, 'fractions', { lessons: 2 });

    expect(scopeLengths(result)).toEqual([2, 6, 8]);
  });
});
