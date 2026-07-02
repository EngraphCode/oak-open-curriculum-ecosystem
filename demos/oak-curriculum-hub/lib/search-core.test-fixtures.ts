/**
 * Shared fixtures for the search-core contract tests. Typed factories return
 * full valid SDK index docs (`satisfies`-anchored against the generated
 * types); the pools + `sizedRetrieval` model the collaborator's documented
 * size semantics (ES returns at most `size` hits) as pure functions of their
 * params — never spies. Test-only module: imported by the co-located
 * `search-core.*.test.ts` files, not by product code.
 */
import { ok, isOk } from '@oaknational/result';
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

import type { runScopedSearch } from './search-core';

export type Retrieval = Pick<RetrievalService, 'searchLessons' | 'searchUnits' | 'searchThreads'>;

/* ---------- typed doc factories (full valid docs) ---------- */

type LessonDoc = LessonResult['lesson'];
type UnitDoc = NonNullable<UnitResult['unit']>;
type ThreadDoc = ThreadResult['thread'];

export function lessonDoc(): LessonDoc {
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

export function threadDoc(): ThreadDoc {
  return {
    thread_slug: 'number',
    thread_title: 'Number',
    unit_count: 5,
    subject_slugs: ['maths'],
    thread_url: 'https://www.thenational.academy/teachers/threads/number',
  };
}

/* ---------- SDK result fixtures ---------- */

export const lessonResult = {
  id: 'l-1',
  rankScore: 12.3,
  lesson: lessonDoc(),
  highlights: ['about <em>fractions</em>'],
} satisfies LessonResult;

export const unitResult = {
  id: 'u-1',
  rankScore: 9.1,
  unit: unitDoc(),
  highlights: ['unit about <em>fractions</em>'],
} satisfies UnitResult;

export const nullUnitResult = {
  id: 'u-null',
  rankScore: 8.2,
  unit: null,
  highlights: [],
} satisfies UnitResult;

export const threadResult = {
  id: 't-1',
  rankScore: 4.4,
  thread: threadDoc(),
} satisfies ThreadResult;

export const lessonsOk = (results: readonly LessonResult[]): LessonsSearchResult => ({
  scope: 'lessons',
  total: results.length,
  took: 3,
  timedOut: false,
  results,
});

export const unitsOk = (results: readonly UnitResult[]): UnitsSearchResult => ({
  scope: 'units',
  total: results.length,
  took: 3,
  timedOut: false,
  results,
});

export const threadsOk = (results: readonly ThreadResult[]): ThreadsSearchResult => ({
  scope: 'threads',
  total: results.length,
  took: 3,
  timedOut: false,
  results,
});

export const esError = {
  type: 'es_error',
  message: 'threads index missing',
} satisfies RetrievalError;

/* ---------- mapped view-model witnesses ---------- */

export const lessonHit = {
  id: 'l-1',
  title: 'Comparing fractions',
  url: 'https://www.thenational.academy/teachers/lessons/comparing-fractions',
  subjectSlug: 'maths',
  keyStage: 'ks2',
  years: ['4'],
  unitTitle: 'Fractions',
  snippet: 'about <em>fractions</em>',
  highlights: ['about <em>fractions</em>'],
};

export const unitHit = {
  id: 'u-1',
  title: 'Fractions',
  url: 'https://www.thenational.academy/teachers/units/fractions',
  subjectSlug: 'maths',
  keyStage: 'ks2',
  lessonCount: 12,
  snippet: 'unit about <em>fractions</em>',
  highlights: ['unit about <em>fractions</em>'],
};

export const threadHit = {
  id: 't-1',
  title: 'Number',
  url: 'https://www.thenational.academy/teachers/threads/number',
  subjectSlugs: ['maths'],
  unitCount: 5,
};

/* ---------- size-semantics pools + fake ---------- */

const lessonPool: readonly LessonResult[] = Array.from({ length: 12 }, (_, i) => ({
  id: `l-${i}`,
  rankScore: 12 - i,
  lesson: lessonDoc(),
  highlights: [],
}));

const unitPool: readonly UnitResult[] = Array.from({ length: 8 }, (_, i) => ({
  id: `u-${i}`,
  rankScore: 8 - i,
  unit: unitDoc(),
  highlights: [],
}));

const threadPool: readonly ThreadResult[] = Array.from({ length: 10 }, (_, i) => ({
  id: `t-${i}`,
  rankScore: 10 - i,
  thread: threadDoc(),
}));

export const sizedRetrieval: Retrieval = {
  searchLessons: ({ size }) => Promise.resolve(ok(lessonsOk(lessonPool.slice(0, size)))),
  searchUnits: ({ size }) => Promise.resolve(ok(unitsOk(unitPool.slice(0, size)))),
  searchThreads: ({ size }) => Promise.resolve(ok(threadsOk(threadPool.slice(0, size)))),
};

export const scopeLengths = (
  result: Awaited<ReturnType<typeof runScopedSearch>>,
): readonly number[] =>
  isOk(result)
    ? [result.value.lessons.length, result.value.units.length, result.value.threads.length]
    : [];
