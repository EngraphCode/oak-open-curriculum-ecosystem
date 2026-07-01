/**
 * Types, closed value sets, and boundary guards for the Oak quality standards.
 *
 * These are the shared shape the data plane emits, the styling lane's filter UI builds against, and
 * the build-time generator (`scripts/generate-quality-standards.ts`) validates. The concrete data
 * lives in `data/quality-standards.generated.ts` (generated from `data/quality-standards.json`),
 * compile-time-validated against {@link QualityStandard} — so the closed `type`/`state` sets are
 * sound by construction (a drifted vendored value is a build error), with no runtime narrowing.
 */

/** The closed set of `type` values observed across the snapshot (empty string = untyped). */
export const QUALITY_STANDARD_TYPES = ['Required standard', 'Model Practice', ''] as const;
/** A quality standard's `type`, narrowed to the closed set the filter UI builds against. */
export type QualityStandardType = (typeof QUALITY_STANDARD_TYPES)[number];

/** The closed set of `state` values observed across the snapshot. */
export const QUALITY_STANDARD_STATES = ['Active', 'Future'] as const;
/** A quality standard's `state`, narrowed to the closed set. */
export type QualityStandardState = (typeof QUALITY_STANDARD_STATES)[number];

/** A single Oak quality-standards item, as stored in the prototype snapshot. */
export interface QualityStandard {
  id: string;
  text: string;
  type: QualityStandardType;
  areas: string[];
  components: string[];
  rubrics: string[];
  code: string;
  state: QualityStandardState;
  subject: string;
}

const TYPE_SET: ReadonlySet<string> = new Set(QUALITY_STANDARD_TYPES);
const STATE_SET: ReadonlySet<string> = new Set(QUALITY_STANDARD_STATES);

/**
 * Narrow an arbitrary string (a URL param, a UI selection) to a {@link QualityStandardType}. The
 * boundary guard a consumer building a `StandardsFilter` uses so an off-set value — including an
 * `all` sentinel — is dropped rather than passed through as a silent empty-result filter.
 */
export const isQualityStandardType = (value: string): value is QualityStandardType => TYPE_SET.has(value);

/** Narrow an arbitrary string to a {@link QualityStandardState} (the `state` counterpart). */
export const isQualityStandardState = (value: string): value is QualityStandardState => STATE_SET.has(value);
