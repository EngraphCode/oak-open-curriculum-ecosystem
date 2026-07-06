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
  SearchResultMeta,
} from '@oaknational/oak-search-sdk/read';
import { ok, err, isOk, type Result } from '@oaknational/result';
import type { Hit, ScopeMeta, SearchResults, SearchSizes } from './search-types';

/** Error surface for a scoped search. Translated to an HTTP status by the route. */
export type SearchError = { kind: 'not_configured' } | { kind: 'failed'; message: string };

/* ---------- mappers (SDK result -> view model) ---------- */

/**
 * URL trust boundary: only http(s) URLs cross the seam. A poisoned index
 * document must not deliver a click-activated `javascript:`/`data:` URL to the
 * cards — the same trust chain the snippet mark-parser defends, so the defence
 * is applied consistently at the mapping. Non-conforming values become `''`,
 * the UI's established no-link fallback (threads already ship it).
 */
const safeUrl = (raw: string): string => (/^https?:\/\//i.test(raw) ? raw : '');

const mapLesson = (r: LessonResult): Hit => ({
  id: r.id,
  title: r.lesson.lesson_title,
  url: safeUrl(r.lesson.lesson_url),
  subjectSlug: r.lesson.subject_slug,
  keyStage: r.lesson.key_stage,
  years: r.lesson.years,
  unitTitle: r.lesson.unit_titles[0],
  snippet: r.highlights[0],
  highlights: r.highlights,
});

// A unit result's index doc can be null when the source was unavailable.
const mapUnit = (r: UnitResult): Hit | null =>
  r.unit
    ? {
        id: r.id,
        title: r.unit.unit_title,
        url: safeUrl(r.unit.unit_url),
        subjectSlug: r.unit.subject_slug,
        keyStage: r.unit.key_stage,
        lessonCount: r.unit.lesson_count,
        snippet: r.highlights[0],
        highlights: r.highlights,
      }
    : null;

const mapThread = (r: ThreadResult): Hit => ({
  id: r.id,
  title: r.thread.thread_title,
  url: safeUrl(r.thread.thread_url ?? ''),
  subjectSlugs: r.thread.subject_slugs,
  unitCount: r.thread.unit_count,
});

/* ---------- public API ---------- */

/** Hub defaults; the showcase page may request different sizes per scope. */
const DEFAULT_SIZES = { lessons: 9, units: 6, threads: 8 } as const;

const scopeMeta = (m: SearchResultMeta): ScopeMeta => ({ total: m.total, took: m.took });

const resolvedSizes = (sizes?: SearchSizes): Required<SearchSizes> => ({
  lessons: sizes?.lessons ?? DEFAULT_SIZES.lessons,
  units: sizes?.units ?? DEFAULT_SIZES.units,
  threads: sizes?.threads ?? DEFAULT_SIZES.threads,
});

// A meta entry is present only for scopes that succeeded — its absence is the
// honest "scope unavailable" signal, distinct from a zero-hit total.
const buildMeta = (
  lessonsRes: Result<SearchResultMeta, unknown>,
  unitsRes: Result<SearchResultMeta, unknown>,
  threadsRes: Result<SearchResultMeta, unknown>,
): SearchResults['meta'] => ({
  ...(isOk(lessonsRes) ? { lessons: scopeMeta(lessonsRes.value) } : {}),
  ...(isOk(unitsRes) ? { units: scopeMeta(unitsRes.value) } : {}),
  ...(isOk(threadsRes) ? { threads: scopeMeta(threadsRes.value) } : {}),
});

/**
 * Run one query across the three search scopes and map the results into the
 * local view model. Never emits `not_configured` — configuration is the
 * wiring layer's concern (`lib/search-client.ts`).
 */
export async function runScopedSearch(
  retrieval: Pick<RetrievalService, 'searchLessons' | 'searchUnits' | 'searchThreads'>,
  q: string,
  sizes?: SearchSizes,
): Promise<Result<SearchResults, SearchError>> {
  try {
    const size = resolvedSizes(sizes);
    const [lessonsRes, unitsRes, threadsRes] = await Promise.all([
      retrieval.searchLessons({ query: q, size: size.lessons, highlight: true }),
      retrieval.searchUnits({ query: q, size: size.units, highlight: true }),
      retrieval.searchThreads({ query: q, size: size.threads }),
    ]);

    // Per-scope degradation: an empty/failed single scope (e.g. a thread index
    // miss) returns [] for that scope rather than blanking the whole response.
    // A catastrophic failure (ES unreachable) is caught below and surfaced.
    const lessons = isOk(lessonsRes) ? lessonsRes.value.results.map(mapLesson) : [];
    const units = isOk(unitsRes)
      ? unitsRes.value.results.map(mapUnit).filter((h): h is Hit => h !== null)
      : [];
    const threads = isOk(threadsRes) ? threadsRes.value.results.map(mapThread) : [];

    return ok({ lessons, units, threads, meta: buildMeta(lessonsRes, unitsRes, threadsRes) });
  } catch (error: unknown) {
    // Translate a thrown ES/transport error into a Result at this single
    // boundary (use-result-pattern / ADR-088: wrap the library that throws).
    return err({
      kind: 'failed',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
