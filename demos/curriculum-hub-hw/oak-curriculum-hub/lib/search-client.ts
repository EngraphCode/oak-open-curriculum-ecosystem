/**
 * THE ONLY oak-search-sdk seam. Demo by Heather W.
 *
 * Everything outside this file talks to the local `SearchResults` view model,
 * never to the SDK directly.
 *
 * Capability boundary (ADR-134): import from `/read` only — never `/admin`
 * or internal paths.
 */
import 'server-only';
import { Client } from '@elastic/elasticsearch';
import {
  createRetrievalService,
  type RetrievalService,
  type LessonResult,
  type UnitResult,
  type ThreadResult,
} from '@oaknational/oak-search-sdk/read';
import { ok, err, isOk, type Result } from '@oaknational/result';
import type { Hit, SearchResults } from './search-types';
import { serverEnv, searchConfigured } from './env';

// The view models (Hit, SearchResults) and the client-safe `isSearchResults`
// guard live in ./search-types: this module is `server-only`, so a client
// component (SearchHub) cannot import runtime values from here. Re-exported as
// types (erased at build) so type-only consumers may import from either home.
export type { Hit, SearchResults } from './search-types';

/** Error surface for {@link search}. Translated to an HTTP status by the route. */
export type SearchError = { kind: 'not_configured' } | { kind: 'failed'; message: string };

/* ---------- SDK wiring ---------- */

let _retrieval: RetrievalService | undefined;

function getRetrieval(): RetrievalService {
  if (!_retrieval) {
    const esClient = new Client({
      node: serverEnv.ELASTICSEARCH_URL,
      auth: { apiKey: serverEnv.ELASTICSEARCH_API_KEY },
    });
    _retrieval = createRetrievalService(esClient, {
      indexTarget: serverEnv.SEARCH_INDEX_TARGET,
      ...(serverEnv.SEARCH_INDEX_VERSION
        ? { indexVersion: serverEnv.SEARCH_INDEX_VERSION }
        : {}),
    });
  }
  return _retrieval;
}

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

export async function search(q: string): Promise<Result<SearchResults, SearchError>> {
  if (!searchConfigured()) {
    return err({ kind: 'not_configured' });
  }

  try {
    const retrieval = getRetrieval();
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
