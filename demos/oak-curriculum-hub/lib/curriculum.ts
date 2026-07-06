/**
 * THE ONLY oak-curriculum-sdk seam (content plane → Open REST API).
 * Demo by Heather W.
 *
 * The SDK is an OpenAPI-fetch style client: `client.GET(path, { params })`
 * returns `{ data, error, response }`. This seam returns a `Result` wrapping the
 * summary / quiz / assets the lesson page reads — a part that is absent or
 * blocked-for-copyright (a non-OK response) degrades to `null` rather than
 * failing the whole lesson.
 */
import 'server-only';
import { createOakClient, type OakApiClient } from '@oaknational/curriculum-sdk';
import type { SearchLessonSummary } from '@oaknational/curriculum-sdk/types';
import { ok, err, type Result } from '@oaknational/result';
import { serverEnv, contentConfigured } from './env';

/* ---------- read-surface of the SDK responses (only the fields the page uses) ---------- */

/**
 * Fields the lesson page reads from `/lessons/{lesson}/summary`.
 *
 * The additive pedagogy fields (C4 seam — subject/key-stage/unit context,
 * keywords, key learning points) are DERIVED from the SDK's generated
 * `SearchLessonSummary` via `Pick`, so their shapes cannot drift from the
 * schema by construction (generator-first). They stay optional because the live
 * API may omit them for a given lesson, so the page guards each field defensively.
 *
 * `getLesson` passes the full SDK summary object through (see {@link getLesson}),
 * so these fields are already present at runtime when the API returns them — this
 * interface only widens what is *type-visible*. No change to the stable
 * `{summary,quiz,assets}` contract the page consumes.
 */
interface LessonSummaryFields extends Partial<
  Pick<
    SearchLessonSummary,
    'subjectTitle' | 'keyStageTitle' | 'units' | 'lessonKeywords' | 'keyLearningPoints'
  >
> {
  title?: string | null;
  lessonTitle?: string | null;
  pupilLessonOutcome?: string | null;
  oakUrl?: string | null;
  canonicalUrl?: string | null;
}
interface LessonQuizFields {
  starterQuiz?: readonly unknown[] | null;
  exitQuiz?: readonly unknown[] | null;
}
interface LessonAssetFields {
  assets?: readonly { type: string; label: string }[] | null;
  oakUrl?: string | null;
}

/** The lesson content the demo renders. Each part is null when unavailable. */
export interface LessonContent {
  summary: LessonSummaryFields | null;
  quiz: LessonQuizFields | null;
  assets: LessonAssetFields | null;
}

/** Error surface for {@link getLesson}. Translated to an HTTP status by the route. */
export type ContentError = { kind: 'not_configured' } | { kind: 'failed'; message: string };

/* ---------- SDK wiring ---------- */

let _client: OakApiClient | undefined;

function getClient(): OakApiClient {
  _client ??= createOakClient(serverEnv.OAK_API_KEY);
  return _client;
}

/** A GET response only carries usable data when the HTTP response was OK. */
function extractData<T>(result: { response: { ok: boolean }; data?: T }): T | undefined {
  return result.response.ok ? result.data : undefined;
}

/* ---------- public API ---------- */

export async function getLesson(slug: string): Promise<Result<LessonContent, ContentError>> {
  if (!contentConfigured()) {
    return err({ kind: 'not_configured' });
  }

  try {
    const client = getClient();
    const [summaryRes, quizRes, assetsRes] = await Promise.all([
      client.GET('/lessons/{lesson}/summary', { params: { path: { lesson: slug } } }),
      client.GET('/lessons/{lesson}/quiz', { params: { path: { lesson: slug } } }),
      client.GET('/lessons/{lesson}/assets', { params: { path: { lesson: slug } } }),
    ]);

    return ok({
      summary: extractData(summaryRes) ?? null,
      quiz: extractData(quizRes) ?? null,
      assets: extractData(assetsRes) ?? null,
    });
  } catch (error: unknown) {
    // Translate a thrown transport error into a Result at this single boundary
    // (use-result-pattern / ADR-088: wrap the library that throws).
    return err({
      kind: 'failed',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
