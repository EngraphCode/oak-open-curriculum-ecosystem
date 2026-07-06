/**
 * The zod schemas for the typed content-block model — the single source of truth for the block
 * contract. `blockSchema` is the discriminated union (on `t`) covering every block kind the export
 * authors; `lib/blocks/types.ts` re-exports the inferred types so consumers keep their existing
 * import surface. Two belts consume these schemas: `scripts/generate-course.ts` validates extracted
 * export content BEFORE emitting `lib/course/oak-course.json`, and `lib/course/load-course.ts`
 * re-validates the committed JSON at module initialisation. Shapes are strict (unknown keys are
 * loud failures), so the contract stays closed — extend by adding a schema + its renderer case.
 */

import { z } from 'zod';

/**
 * Asset-path boundary (strict-validation-at-boundary): the views render `href`/`src` as
 * `/${value}`, so each must be a RELATIVE path — no leading slash, no URI scheme. An absolute or
 * protocol value in a fresh export fails validation loud, naming the field and value, instead of
 * silently becoming a broken or protocol-relative URL in the app.
 */
const relativeAssetPath = (field: string): z.ZodString =>
  z.string().refine((value) => !value.startsWith('/') && !/^[a-z][a-z0-9+.-]*:/i.test(value), {
    error: (issue) =>
      `${field} ${JSON.stringify(issue.input)} is not a relative asset path ` +
      `(no leading slash, no URI scheme); the views render it as /<${field}>`,
  });

/** A paragraph run. Rendered as one `<p>` per entry. */
export const textBlockSchema = z.strictObject({
  t: z.literal('text'),
  paras: z.array(z.string()).readonly(),
});

/** A section sub-heading (`<h3>`-level within a section). */
export const headingBlockSchema = z.strictObject({ t: z.literal('heading'), text: z.string() });

/** One quality-standard bullet inside a callout: a QS code chip + verbatim wording. */
export const calloutStandardSchema = z.strictObject({ qs: z.string(), text: z.string() });

/**
 * A bordered callout. `variant` drives the colour treatment; a quality-standard callout carries
 * either a single `qs`+`text` or an `items` list; a `quote` may carry an `attrib` citation.
 */
export const calloutBlockSchema = z.strictObject({
  t: z.literal('callout'),
  variant: z.enum(['info', 'tip', 'warning', 'quote']),
  title: z.string().optional(),
  text: z.string().optional(),
  qs: z.array(z.string()).readonly().optional(),
  items: z.array(calloutStandardSchema).readonly().optional(),
  attrib: z.string().optional(),
});

/** One multiple-choice / true-false option; `correct` marks the answer. */
export const quizOptionSchema = z.strictObject({
  text: z.string(),
  correct: z.boolean().optional(),
});

/** A single quiz question; `kind` is the closed question-type set. */
export const quizQuestionSchema = z.strictObject({
  kind: z.enum(['mcq', 'tf']),
  stem: z.string(),
  options: z.array(quizOptionSchema).readonly(),
  explain: z.string().optional(),
});

/** An interactive knowledge-check: pick an option, reveal correctness + explanation. */
export const quizBlockSchema = z.strictObject({
  t: z.literal('quiz'),
  title: z.string(),
  questions: z.array(quizQuestionSchema).readonly(),
});

/** A good-vs-non-example side-by-side. */
export const compareBlockSchema = z.strictObject({
  t: z.literal('compare'),
  goodText: z.string(),
  goodNote: z.string().optional(),
  badText: z.string(),
  badNote: z.string().optional(),
});

/** One tab: a label and its paragraph body (+ optional worked example). */
export const tabPanelSchema = z.strictObject({
  label: z.string(),
  paras: z.array(z.string()).readonly(),
  example: z.string().optional(),
});

/** A tabbed panel; one tab active at a time. */
export const tabsBlockSchema = z.strictObject({
  t: z.literal('tabs'),
  tabs: z.array(tabPanelSchema).readonly(),
});

/** Key-takeaway bullets plus an optional reflection prompt. */
export const summaryBlockSchema = z.strictObject({
  t: z.literal('summary'),
  points: z.array(z.string()).readonly(),
  question: z.string().optional(),
});

/** A flip card: front prompt, back reveal, numbered badge. */
export const flipCardSchema = z.strictObject({
  badge: z.string(),
  front: z.string(),
  back: z.string(),
});

/** A grid of flip cards; `chip` tints the card accent. */
export const flipBlockSchema = z.strictObject({
  t: z.literal('flip'),
  chip: z.string(),
  cards: z.array(flipCardSchema).readonly(),
  frontImage: z.boolean().optional(),
});

/** An image slot inside an accordion item; `placeholder` describes the asset. */
const accordionImageSchema = z.strictObject({ placeholder: z.string() });

/**
 * An accordion answer. The export authors this field inconsistently — a bare string in some items,
 * a paragraph array in the rest — so the container inconsistency is resolved once here at the data
 * boundary (Director-ratified 2026-07-01): a one-paragraph string becomes a one-element array,
 * losslessly, and consumers only ever see `readonly string[]`.
 */
const accordionAnswerSchema = z
  .union([z.string(), z.array(z.string()).readonly()])
  .transform((value): readonly string[] => (typeof value === 'string' ? [value] : value));

/** One accordion item: question, optional badge/image, answer paragraphs, optional features. */
export const accordionItemSchema = z.strictObject({
  q: z.string(),
  badge: z.string().optional(),
  a: accordionAnswerSchema,
  features: z.array(z.string()).readonly().optional(),
  img: accordionImageSchema.optional(),
});

/** An expand/collapse accordion; the optional `chip` tints the item accent. */
export const accordionBlockSchema = z.strictObject({
  t: z.literal('accordion'),
  chip: z.string().optional(),
  items: z.array(accordionItemSchema).readonly(),
});

/** A grid of statistics (value + label pairs) with optional intro and note. */
export const statsBlockSchema = z.strictObject({
  t: z.literal('stats'),
  intro: z.string().optional(),
  items: z.array(z.strictObject({ value: z.string(), label: z.string() })).readonly(),
  note: z.string().optional(),
});

/** A multi-column comparison of bulleted lists. */
export const columnsBlockSchema = z.strictObject({
  t: z.literal('columns'),
  cols: z
    .array(z.strictObject({ title: z.string(), points: z.array(z.string()).readonly() }))
    .readonly(),
});

/** A figure. `src` is the (relative) asset when present; `placeholder` describes it otherwise. */
export const imageBlockSchema = z.strictObject({
  t: z.literal('image'),
  placeholder: z.string(),
  src: relativeAssetPath('src').optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  maxWidth: z.string().optional(),
});

/** A media slot with a caption. */
export const videoBlockSchema = z.strictObject({
  t: z.literal('video'),
  caption: z.string(),
  placeholder: z.string(),
});

/** An imported/embedded video component (e.g. the animated learning framework). */
export const videoImportBlockSchema = z.strictObject({
  t: z.literal('videoimport'),
  embed: z.string(),
  filename: z.string(),
  duration: z.string(),
  caption: z.string(),
  hint: z.string().optional(),
});

/** A drag/keyboard-orderable activity checked against `correct` (item ids in order). */
export const sortableBlockSchema = z.strictObject({
  t: z.literal('sortable'),
  prompt: z.string(),
  items: z.array(z.strictObject({ id: z.string(), text: z.string() })).readonly(),
  correct: z.array(z.string()).readonly(),
});

/** An image with numbered hotspots; selecting one reveals its detail. */
export const hotspotBlockSchema = z.strictObject({
  t: z.literal('hotspot'),
  placeholder: z.string(),
  spots: z.array(z.strictObject({ title: z.string(), text: z.string() })).readonly(),
});

/** A downloadable resource link; `href` is a relative asset path. */
export const downloadBlockSchema = z.strictObject({
  t: z.literal('download'),
  title: z.string(),
  desc: z.string(),
  meta: z.string(),
  href: relativeAssetPath('href'),
  filename: z.string().optional(),
});

/** The course-map: renders the unit/module/section navigation from the content tree. */
export const coursemapBlockSchema = z.strictObject({ t: z.literal('coursemap') });

/** The full set of content blocks a page can render. Discriminated on `t`. */
export const blockSchema = z.discriminatedUnion('t', [
  textBlockSchema,
  headingBlockSchema,
  calloutBlockSchema,
  quizBlockSchema,
  compareBlockSchema,
  tabsBlockSchema,
  summaryBlockSchema,
  flipBlockSchema,
  accordionBlockSchema,
  statsBlockSchema,
  columnsBlockSchema,
  imageBlockSchema,
  videoBlockSchema,
  videoImportBlockSchema,
  sortableBlockSchema,
  hotspotBlockSchema,
  downloadBlockSchema,
  coursemapBlockSchema,
]);
