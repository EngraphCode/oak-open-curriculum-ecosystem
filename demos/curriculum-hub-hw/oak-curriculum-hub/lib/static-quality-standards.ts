/**
 * Public API for the static "Quality standards" content. Demo by Heather W.
 *
 * The shape + closed-set guards live in `./quality-standards-types`; the concrete data is GENERATED
 * (`./data/quality-standards.generated`, 685 items) from `./data/quality-standards.json` by
 * `scripts/generate-quality-standards.ts` and compile-time-validated against
 * {@link QualityStandard} — so the closed `type`/`state` sets are sound by construction with NO
 * runtime narrowing (a drifted vendored value is a build error at generate/compile time, not a
 * runtime throw). This module re-exports the shape + data and adds the search helper; it is the
 * static complement to the live curriculum group (`useCurriculumSearch`) in the unified hub search.
 *
 * Licensing: this is Oak quality-standards content, placed under the OGL by `LICENCE-DATA.md`.
 */

export {
  QUALITY_STANDARD_TYPES,
  QUALITY_STANDARD_STATES,
  isQualityStandardType,
  isQualityStandardState,
  type QualityStandard,
  type QualityStandardType,
  type QualityStandardState,
} from './quality-standards-types';

import type { QualityStandard } from './quality-standards-types';
import { qualityStandards } from './data/quality-standards.generated';

export { qualityStandards };

/**
 * Filter quality standards by a free-text query (case-insensitive across text, subject, areas,
 * components, and rubrics). An empty query returns no results — parity with the live curriculum
 * group's idle state. Results are capped at `limit` for the results UI.
 *
 * @param query - the live search string (shared with the hero, like `useCurriculumSearch`)
 * @param limit - maximum results to return (default 24)
 */
export function searchQualityStandards(query: string, limit = 24): QualityStandard[] {
  const q = query.trim().toLowerCase();
  if (q === '') {
    return [];
  }
  const matches = (s: QualityStandard): boolean =>
    s.text.toLowerCase().includes(q) ||
    s.subject.toLowerCase().includes(q) ||
    s.areas.some((a) => a.toLowerCase().includes(q)) ||
    s.components.some((c) => c.toLowerCase().includes(q)) ||
    s.rubrics.some((r) => r.toLowerCase().includes(q));
  return qualityStandards.filter(matches).slice(0, limit);
}
