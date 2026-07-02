import { describe, it, expect } from 'vitest';
import { ok, err, isOk } from '@oaknational/result';
import type {
  RetrievalService,
  RetrievalError,
  LessonResult,
  UnitResult,
  ThreadResult,
  LessonsSearchResult,
  UnitsSearchResult,
  ThreadsSearchResult,
} from '@oaknational/oak-search-sdk/read';

import { runScopedSearch } from './search-core';
import { isSearchResults } from './search-types';

/**
 * `runScopedSearch` is the pure search core: SDK results in (via an injected
 * retrieval service), the local `SearchResults` view model out. The states it
 * owns: all scopes mapped, a single failed scope degrading to `[]` without
 * blanking the siblings, a null unit doc dropped, and a thrown transport error
 * surfacing as `err({kind: 'failed'})`.
 */

type Retrieval = Pick<RetrievalService, 'searchLessons' | 'searchUnits' | 'searchThreads'>;

/* ---------- typed fixture factories (full valid docs) ---------- */

type LessonDoc = LessonResult['lesson'];
type UnitDoc = NonNullable<UnitResult['unit']>;
type ThreadDoc = ThreadResult['thread'];

function lessonDoc(): LessonDoc {
  return {
    lesson_id: 'lesson-0001',
    lesson_slug: 'comparing-fractions',
    lesson_title: 'Comparing fractions',
    subject_slug: 'maths',
    subject_parent: 'maths',
    key_stage: 'ks2',
    years: ['4'],
    unit_ids: ['unit-0001'],
    unit_titles: ['Fractions'],
    has_transcript: false,
    lesson_url: 'https://www.thenational.academy/teachers/lessons/comparing-fractions',
    unit_urls: ['https://www.thenational.academy/teachers/units/fractions'],
    doc_type: 'lesson',
  };
}

function unitDoc(): UnitDoc {
  return {
    unit_id: 'unit-0001',
    unit_slug: 'fractions',
    unit_title: 'Fractions',
    subject_slug: 'maths',
    subject_parent: 'maths',
    key_stage: 'ks2',
    lesson_ids: ['lesson-0001'],
    lesson_count: 12,
    unit_url: 'https://www.thenational.academy/teachers/units/fractions',
    subject_programmes_url: 'https://www.thenational.academy/teachers/programmes/maths',
    doc_type: 'unit',
  };
}

function threadDoc(): ThreadDoc {
  return {
    thread_slug: 'number',
    thread_title: 'Number',
    unit_count: 5,
    subject_slugs: ['maths'],
    thread_url: 'https://www.thenational.academy/teachers/threads/number',
  };
}

const lessonResult = {
  id: 'l-1',
  rankScore: 12.3,
  lesson: lessonDoc(),
  highlights: ['about <em>fractions</em>'],
} satisfies LessonResult;

const unitResult = {
  id: 'u-1',
  rankScore: 9.1,
  unit: unitDoc(),
  highlights: ['unit about <em>fractions</em>'],
} satisfies UnitResult;

const nullUnitResult = {
  id: 'u-null',
  rankScore: 8.2,
  unit: null,
  highlights: [],
} satisfies UnitResult;

const threadResult = {
  id: 't-1',
  rankScore: 4.4,
  thread: threadDoc(),
} satisfies ThreadResult;

const lessonsOk = (results: readonly LessonResult[]): LessonsSearchResult => ({
  scope: 'lessons',
  total: results.length,
  took: 3,
  timedOut: false,
  results,
});

const unitsOk = (results: readonly UnitResult[]): UnitsSearchResult => ({
  scope: 'units',
  total: results.length,
  took: 3,
  timedOut: false,
  results,
});

const threadsOk = (results: readonly ThreadResult[]): ThreadsSearchResult => ({
  scope: 'threads',
  total: results.length,
  took: 3,
  timedOut: false,
  results,
});

const esError = { type: 'es_error', message: 'threads index missing' } satisfies RetrievalError;

/* ---------- the mapped view-model witnesses ---------- */

const lessonHit = {
  id: 'l-1',
  title: 'Comparing fractions',
  url: 'https://www.thenational.academy/teachers/lessons/comparing-fractions',
  subjectSlug: 'maths',
  keyStage: 'ks2',
  years: ['4'],
  unitTitle: 'Fractions',
  snippet: 'about <em>fractions</em>',
};

const unitHit = {
  id: 'u-1',
  title: 'Fractions',
  url: 'https://www.thenational.academy/teachers/units/fractions',
  subjectSlug: 'maths',
  keyStage: 'ks2',
  lessonCount: 12,
  snippet: 'unit about <em>fractions</em>',
};

const threadHit = {
  id: 't-1',
  title: 'Number',
  url: 'https://www.thenational.academy/teachers/threads/number',
  subjectSlugs: ['maths'],
  unitCount: 5,
};

describe('runScopedSearch', () => {
  it('maps all three scopes into the SearchResults view model when every scope succeeds', async () => {
    const retrieval: Retrieval = {
      searchLessons: () => Promise.resolve(ok(lessonsOk([lessonResult]))),
      searchUnits: () => Promise.resolve(ok(unitsOk([unitResult]))),
      searchThreads: () => Promise.resolve(ok(threadsOk([threadResult]))),
    };

    const result = await runScopedSearch(retrieval, 'fractions');

    expect(result).toEqual(ok({ lessons: [lessonHit], units: [unitHit], threads: [threadHit] }));
    expect(isOk(result) && isSearchResults(result.value)).toBe(true);
  });

  it('drops a unit hit whose index doc is null and keeps its non-null sibling', async () => {
    const retrieval: Retrieval = {
      searchLessons: () => Promise.resolve(ok(lessonsOk([]))),
      searchUnits: () => Promise.resolve(ok(unitsOk([nullUnitResult, unitResult]))),
      searchThreads: () => Promise.resolve(ok(threadsOk([]))),
    };

    const result = await runScopedSearch(retrieval, 'fractions');

    expect(result).toEqual(ok({ lessons: [], units: [unitHit], threads: [] }));
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
    // degradation is per-scope, not a blanked whole response.
    expect(result).toEqual(ok({ lessons: [lessonHit], units: [unitHit], threads: [] }));
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
