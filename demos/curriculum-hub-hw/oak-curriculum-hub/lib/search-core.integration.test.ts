import { describe, it, expect } from 'vitest';
import { ok, err, isOk } from '@oaknational/result';

import { runScopedSearch } from './search-core';
import { isSearchResults } from './search-types';
import {
  type Retrieval,
  lessonResult,
  unitResult,
  nullUnitResult,
  threadResult,
  lessonsOk,
  unitsOk,
  threadsOk,
  esError,
  lessonHit,
  unitHit,
  threadHit,
} from './search-core.test-fixtures';

/**
 * `runScopedSearch` is the pure search core: SDK results in (via an injected
 * retrieval service), the local `SearchResults` view model out. The states it
 * owns: all scopes mapped, a single failed scope degrading to `[]` without
 * blanking the siblings, a null unit doc dropped, and a thrown transport error
 * surfacing as `err({kind: 'failed'})`. The E3 showcase surface (sizes flow,
 * SDK-sourced meta) is proven in `search-core.showcase.integration.test.ts`.
 */
describe('runScopedSearch', () => {
  it('maps all three scopes into the SearchResults view model when every scope succeeds', async () => {
    const retrieval: Retrieval = {
      searchLessons: () => Promise.resolve(ok(lessonsOk([lessonResult]))),
      searchUnits: () => Promise.resolve(ok(unitsOk([unitResult]))),
      searchThreads: () => Promise.resolve(ok(threadsOk([threadResult]))),
    };

    const result = await runScopedSearch(retrieval, 'fractions');

    expect(result).toEqual(
      ok({
        lessons: [lessonHit],
        units: [unitHit],
        threads: [threadHit],
        meta: {
          lessons: { total: 1, took: 3 },
          units: { total: 1, took: 3 },
          threads: { total: 1, took: 3 },
        },
      }),
    );
    expect(isOk(result) && isSearchResults(result.value)).toBe(true);
  });

  it('drops a unit hit whose index doc is null and keeps its non-null sibling', async () => {
    const retrieval: Retrieval = {
      searchLessons: () => Promise.resolve(ok(lessonsOk([]))),
      searchUnits: () => Promise.resolve(ok(unitsOk([nullUnitResult, unitResult]))),
      searchThreads: () => Promise.resolve(ok(threadsOk([]))),
    };

    const result = await runScopedSearch(retrieval, 'fractions');

    expect(result).toEqual(
      ok({
        lessons: [],
        units: [unitHit],
        threads: [],
        meta: {
          lessons: { total: 0, took: 3 },
          units: { total: 2, took: 3 },
          threads: { total: 0, took: 3 },
        },
      }),
    );
  });
});

describe('runScopedSearch failure handling', () => {
  it('degrades a single failed scope to [] while the sibling scopes stay populated', async () => {
    const retrieval: Retrieval = {
      searchLessons: () => Promise.resolve(ok(lessonsOk([lessonResult]))),
      searchUnits: () => Promise.resolve(ok(unitsOk([unitResult]))),
      searchThreads: () => Promise.resolve(err(esError)),
    };

    const result = await runScopedSearch(retrieval, 'fractions');

    // The non-empty sibling witnesses are load-bearing: they prove the
    // degradation is per-scope, not a blanked whole response. The failed
    // scope's meta entry is ABSENT (honest "scope unavailable"), distinct
    // from a genuine zero-hit total — toStrictEqual makes the absence
    // literal (an explicit `threads: undefined` key would fail).
    expect(result).toStrictEqual(
      ok({
        lessons: [lessonHit],
        units: [unitHit],
        threads: [],
        meta: {
          lessons: { total: 1, took: 3 },
          units: { total: 1, took: 3 },
        },
      }),
    );
  });

  it('surfaces a thrown transport error as err with kind failed', async () => {
    const retrieval: Retrieval = {
      searchLessons: () => Promise.reject(new Error('es down')),
      searchUnits: () => Promise.resolve(ok(unitsOk([]))),
      searchThreads: () => Promise.resolve(ok(threadsOk([]))),
    };

    const result = await runScopedSearch(retrieval, 'fractions');

    expect(isOk(result)).toBe(false);
    expect(result).toMatchObject({ error: { kind: 'failed' } });
  });
});
