/**
 * Pure search core: SDK results in, the local `SearchResults` view model out.
 * Demo by Heather W.
 *
 * The retrieval service is INJECTED so this module needs no environment, no
 * Elasticsearch client, and no `server-only` marker — the DI seam that makes
 * the search behaviour testable with plain object fakes. All SDK imports are
 * type-only (erased at build). The wiring that constructs the real retrieval
 * service lives in `lib/search-client.ts`.
 *
 * Capability boundary (ADR-134): types from `/read` only — never `/admin`
 * or internal paths.
 */
import type {
  RetrievalService,
  LessonResult,
  UnitResult,
  ThreadResult,
} from '@oaknational/oak-search-sdk/read';
import { ok, err, isOk, type Result } from '@oaknational/result';
import type { Hit, SearchResults } from './search-types';

/** Error surface for a scoped search. Translated to an HTTP status by the route. */
export type SearchError = { kind: 'not_configured' } | { kind: 'failed'; message: string };

/* ---------- mappers (SDK result -> view model) ---------- */

const mapLesson = (r: LessonResult): Hit => ({
  id: r.id,
  title: r.lesson.lesson_title,
  url: r.lesson.lesson_url,
  subjectSlug: r.lesson.subject_slug,
  keyStage: r.lesson.key_stage,
  years: r.lesson.years,
  unitTitle: r.lesson.unit_titles[0],
  snippet: r.highlights[0],
});

// A unit result's index doc can be null when the source was unavailable.
const mapUnit = (r: UnitResult): Hit | null =>
  r.unit
    ? {
        id: r.id,
        title: r.unit.unit_title,
        url: r.unit.unit_url,
        subjectSlug: r.unit.subject_slug,
        keyStage: r.unit.key_stage,
        lessonCount: r.unit.lesson_count,
        snippet: r.highlights[0],
      }
    : null;

const mapThread = (r: ThreadResult): Hit => ({
  id: r.id,
  title: r.thread.thread_title,
  url: r.thread.thread_url ?? '',
  subjectSlugs: r.thread.subject_slugs,
  unitCount: r.thread.unit_count,
});

/* ---------- public API ---------- */

/**
 * Run one query across the three search scopes and map the results into the
 * local view model. Never emits `not_configured` — configuration is the
 * wiring layer's concern (`lib/search-client.ts`).
 */
export async function runScopedSearch(
  retrieval: Pick<RetrievalService, 'searchLessons' | 'searchUnits' | 'searchThreads'>,
  q: string,
): Promise<Result<SearchResults, SearchError>> {
  try {
    const [lessonsRes, unitsRes, threadsRes] = await Promise.all([
      retrieval.searchLessons({ query: q, size: 9, highlight: true }),
      retrieval.searchUnits({ query: q, size: 6 }),
      retrieval.searchThreads({ query: q, size: 8 }),
    ]);

    // Per-scope degradation: an empty/failed single scope (e.g. a thread index
    // miss) returns [] for that scope rather than blanking the whole response.
    // A catastrophic failure (ES unreachable) is caught below and surfaced.
    const lessons = isOk(lessonsRes) ? lessonsRes.value.results.map(mapLesson) : [];
    const units = isOk(unitsRes)
      ? unitsRes.value.results.map(mapUnit).filter((h): h is Hit => h !== null)
      : [];
    const threads = isOk(threadsRes) ? threadsRes.value.results.map(mapThread) : [];

    return ok({ lessons, units, threads });
  } catch (error: unknown) {
    // Translate a thrown ES/transport error into a Result at this single
    // boundary (use-result-pattern / ADR-088: wrap the library that throws).
    return err({
      kind: 'failed',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
