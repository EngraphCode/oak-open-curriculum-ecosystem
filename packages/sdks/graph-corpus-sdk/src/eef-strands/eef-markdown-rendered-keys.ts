/**
 * Compile-time pins over the corpus keys the markdown projection renders.
 *
 * The strand renderer reads each section by name, so a corpus refresh that
 * adds a key to a strand, a headline, a phase entry or any section body would
 * compile and render without the new value. Each alias below subtracts the
 * keys a renderer handles (or deliberately omits) from the keys the corpus
 * actually carries, and constrains the remainder to `never`: a new key turns
 * into a type error naming it, at the build, before any file is rendered.
 * The tests bind these aliases so the pins stay in use.
 */
import type { BehindTheAverage, PhaseDetail } from './eef-strand-markdown-sections.js';
import type { EefStrand, KeysOfUnion, StrandCarrying } from './strand-lookup.js';

/** Resolves only when `T` is `never`; a non-empty `T` is a build error naming its members. */
type AssertNever<T extends never> = T;

/** The strand keys the renderer reads. */
type RenderedStrandKey =
  | 'id'
  | 'name'
  | 'eef_url'
  | 'headline'
  | 'definition'
  | 'key_findings'
  | 'effectiveness'
  | 'behind_the_average'
  | 'closing_the_disadvantage_gap'
  | 'implementation'
  | 'related_guidance_reports'
  | 'related_strands'
  | 'update_history'
  | 'tags';

/** The strand keys the renderer omits: the evidence tools' selector block (its figures on some strands are a named follow-up) and the URL slug. */
type OmittedStrandKey = 'slug' | 'school_context_relevance';

/** Every strand key is rendered or named as omitted. */
export type UnrenderedStrandKey = AssertNever<
  Exclude<KeysOfUnion<EefStrand>, RenderedStrandKey | OmittedStrandKey>
>;

/** Every headline key is rendered. */
export type UnrenderedHeadlineKey = AssertNever<
  Exclude<
    KeysOfUnion<EefStrand['headline']>,
    | 'impact_months'
    | 'cost_rating'
    | 'cost_label'
    | 'evidence_strength_rating'
    | 'evidence_strength_label'
    | 'headline_summary'
    | 'number_of_studies'
  >
>;

/** Every definition key is rendered. */
export type UnrenderedDefinitionKey = AssertNever<
  Exclude<KeysOfUnion<EefStrand['definition']>, 'short' | 'full'>
>;

/** Every effectiveness key is rendered. */
export type UnrenderedEffectivenessKey = AssertNever<
  Exclude<KeysOfUnion<StrandCarrying<'effectiveness'>['effectiveness']>, 'summary' | 'mechanisms'>
>;

/** Every behind-the-average key is rendered. */
export type UnrenderedBehindTheAverageKey = AssertNever<
  Exclude<
    KeysOfUnion<BehindTheAverage>,
    'summary' | 'by_phase' | 'by_subject' | 'moderating_factors'
  >
>;

/** Every field of a phase entry is rendered. */
export type UnrenderedPhaseField = AssertNever<
  Exclude<KeysOfUnion<PhaseDetail>, 'impact_months' | 'notes'>
>;

/** Every field of a by-subject entry is rendered. */
export type UnrenderedSubjectField = AssertNever<
  Exclude<
    KeysOfUnion<Extract<BehindTheAverage, Record<'by_subject', unknown>>['by_subject'][number]>,
    'subject' | 'notes'
  >
>;

/** Every disadvantage-gap key is rendered. */
export type UnrenderedDisadvantageGapKey = AssertNever<
  Exclude<
    KeysOfUnion<StrandCarrying<'closing_the_disadvantage_gap'>['closing_the_disadvantage_gap']>,
    'summary'
  >
>;

/** Every implementation key is rendered. */
export type UnrenderedImplementationKey = AssertNever<
  Exclude<
    KeysOfUnion<StrandCarrying<'implementation'>['implementation']>,
    'key_considerations' | 'common_pitfalls' | 'digital_technology_application'
  >
>;

/** Every field of a guidance-report entry is rendered. */
export type UnrenderedGuidanceReportField = AssertNever<
  Exclude<
    KeysOfUnion<StrandCarrying<'related_guidance_reports'>['related_guidance_reports'][number]>,
    'title' | 'url'
  >
>;

/** Every field of an update-history entry is rendered. */
export type UnrenderedUpdateHistoryField = AssertNever<
  Exclude<KeysOfUnion<StrandCarrying<'update_history'>['update_history'][number]>, 'date' | 'notes'>
>;
