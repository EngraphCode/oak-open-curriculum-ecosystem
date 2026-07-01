/**
 * The local half of the unified hub search — the "second search" over bundled export content.
 *
 * The hero query drives two searches: the live curriculum via Elasticsearch (`useCurriculumSearch`,
 * a client hook) and this local search over the vendored export content. `searchHub` is the local
 * dispatch: it fans one query across both bundled sources (training-course sections + the 685 quality
 * standards) and returns the canonical hit shapes the hub renders. Pure over the vendored data — the
 * live half stays in the hook.
 *
 * The standard-hit `href` is the `#qs=<id>` deep-link into the Standards page focus mode, so a hub
 * search result is the entry point to the same cross-link the Course QS-callouts target.
 */

import { searchQualityStandards } from './static-quality-standards';
import { searchTrainingCourses } from './static-training-courses';

/** A training-course section hit, as the hub's training group renders it. */
export interface CourseHit {
  readonly title: string;
  readonly module: string;
  readonly href: string;
}

/** A quality-standard hit, as the hub's standards group renders it (with its `#qs=` deep-link). */
export interface StandardHit {
  readonly id: string;
  readonly text: string;
  readonly area: string;
  readonly href: string;
}

/** The local (bundled-content) half of the unified hub search results. */
export interface HubSearchResults {
  readonly courseHits: readonly CourseHit[];
  readonly stdHits: readonly StandardHit[];
}

/**
 * Search the bundled export content for the hero query, returning course and standard hits. An empty
 * query returns no hits from either source (parity with the live group's idle state). Each source is
 * capped independently at `limitPerSource`.
 *
 * @param query - the hero search string (shared with the live `useCurriculumSearch`)
 * @param limitPerSource - maximum hits per source (default 24)
 */
export function searchHub(query: string, limitPerSource = 24): HubSearchResults {
  const courseHits = searchTrainingCourses(query, limitPerSource).map((course) => ({
    title: course.title,
    module: course.module,
    href: course.href,
  }));
  const stdHits = searchQualityStandards(query, limitPerSource).map((standard) => ({
    id: standard.id,
    text: standard.text,
    area: standard.areas[0] ?? '',
    href: `/standards#qs=${standard.id}`,
  }));
  return { courseHits, stdHits };
}
