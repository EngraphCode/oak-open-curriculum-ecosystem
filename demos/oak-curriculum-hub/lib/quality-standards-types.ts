/**
 * The zod schema, closed value sets, and boundary guards for the Oak quality standards — the
 * single source of truth for the quality-standard shape.
 *
 * Two belts consume {@link qualityStandardsSchema}: the generator
 * (`scripts/generate-quality-standards.ts`) validates the vendored snapshot BEFORE (re-)emitting
 * `data/quality-standards.json`, and the loader (`data/load-quality-standards.ts`) re-validates
 * that committed JSON at module initialisation — so a drifted `type`/`state` value is a loud
 * generation/build failure, never silent content corruption in the filter UI.
 */

import { z } from 'zod';

/** The closed set of `type` values observed across the snapshot (empty string = untyped). */
export const QUALITY_STANDARD_TYPES = ['Required standard', 'Model Practice', ''] as const;
/** A quality standard's `type`, narrowed to the closed set the filter UI builds against. */
export type QualityStandardType = (typeof QUALITY_STANDARD_TYPES)[number];

/** The closed set of `state` values observed across the snapshot. */
export const QUALITY_STANDARD_STATES = ['Active', 'Future'] as const;
/** A quality standard's `state`, narrowed to the closed set. */
type QualityStandardState = (typeof QUALITY_STANDARD_STATES)[number];

/** A single Oak quality-standards item; strict, so a drifted snapshot field fails loud. */
const qualityStandardSchema = z.strictObject({
  id: z.string(),
  text: z.string(),
  type: z.enum(QUALITY_STANDARD_TYPES),
  areas: z.array(z.string()),
  components: z.array(z.string()),
  rubrics: z.array(z.string()),
  code: z.string(),
  state: z.enum(QUALITY_STANDARD_STATES),
  subject: z.string(),
});

/** The whole vendored snapshot: the shape both the generator and the loader validate against. */
export const qualityStandardsSchema = z.array(qualityStandardSchema);

/** A single Oak quality-standards item, as stored in the prototype snapshot. */
export type QualityStandard = z.infer<typeof qualityStandardSchema>;

const TYPE_SET: ReadonlySet<string> = new Set(QUALITY_STANDARD_TYPES);
const STATE_SET: ReadonlySet<string> = new Set(QUALITY_STANDARD_STATES);

/**
 * Narrow an arbitrary string (a URL param, a UI selection) to a {@link QualityStandardType}. The
 * boundary guard a consumer building a `StandardsFilter` uses so an off-set value — including an
 * `all` sentinel — is dropped rather than passed through as a silent empty-result filter.
 */
export const isQualityStandardType = (value: string): value is QualityStandardType =>
  TYPE_SET.has(value);

/** Narrow an arbitrary string to a quality-standard `state` (the `type` guard's counterpart). */
export const isQualityStandardState = (value: string): value is QualityStandardState =>
  STATE_SET.has(value);
