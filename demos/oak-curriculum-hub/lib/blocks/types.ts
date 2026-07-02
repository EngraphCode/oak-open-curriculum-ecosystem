/**
 * The typed content-block model for the Oak Curriculum Hub demo, inferred from the zod schemas in
 * `./schema.ts` — the single source of truth for the block contract. `Block` is the discriminated
 * union (on `t`); this module is the import surface consumers (the presentational `BlockRenderer`
 * and its views) build against, so every type name here is stable while the schema owns the shape.
 * Extend by adding a schema variant + its renderer case, keeping the union closed.
 */

import type { z } from 'zod';

import type {
  accordionBlockSchema,
  accordionItemSchema,
  blockSchema,
  calloutBlockSchema,
  calloutStandardSchema,
  columnsBlockSchema,
  compareBlockSchema,
  coursemapBlockSchema,
  downloadBlockSchema,
  flipBlockSchema,
  flipCardSchema,
  headingBlockSchema,
  hotspotBlockSchema,
  imageBlockSchema,
  quizBlockSchema,
  quizOptionSchema,
  quizQuestionSchema,
  sortableBlockSchema,
  statsBlockSchema,
  summaryBlockSchema,
  tabPanelSchema,
  tabsBlockSchema,
  textBlockSchema,
  videoBlockSchema,
  videoImportBlockSchema,
} from './schema';

/** A paragraph run. Rendered as one `<p>` per entry. */
export type TextBlock = z.infer<typeof textBlockSchema>;
/** A section sub-heading (`<h3>`-level within a section). */
export type HeadingBlock = z.infer<typeof headingBlockSchema>;
/** One quality-standard bullet inside a callout: a QS code chip + verbatim wording. */
export type CalloutStandard = z.infer<typeof calloutStandardSchema>;
/** A bordered callout; `variant` drives the colour treatment. */
export type CalloutBlock = z.infer<typeof calloutBlockSchema>;
/** One multiple-choice / true-false option; `correct` marks the answer. */
export type QuizOption = z.infer<typeof quizOptionSchema>;
/** A single quiz question. */
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
/** An interactive knowledge-check: pick an option, reveal correctness + explanation. */
export type QuizBlock = z.infer<typeof quizBlockSchema>;
/** A good-vs-non-example side-by-side. */
export type CompareBlock = z.infer<typeof compareBlockSchema>;
/** One tab: a label and its paragraph body (+ optional worked example). */
export type TabPanel = z.infer<typeof tabPanelSchema>;
/** A tabbed panel; one tab active at a time. */
export type TabsBlock = z.infer<typeof tabsBlockSchema>;
/** Key-takeaway bullets plus an optional reflection prompt. */
export type SummaryBlock = z.infer<typeof summaryBlockSchema>;
/** A flip card: front prompt, back reveal, numbered badge. */
export type FlipCard = z.infer<typeof flipCardSchema>;
/** A grid of flip cards; `chip` tints the card accent. */
export type FlipBlock = z.infer<typeof flipBlockSchema>;
/** One accordion item: question, optional badge/image, answer paragraphs, optional features. */
export type AccordionItem = z.infer<typeof accordionItemSchema>;
/** An expand/collapse accordion; the optional `chip` tints the item accent. */
export type AccordionBlock = z.infer<typeof accordionBlockSchema>;
/** A grid of statistics with optional intro and note. */
export type StatsBlock = z.infer<typeof statsBlockSchema>;
/** A multi-column comparison of bulleted lists. */
export type ColumnsBlock = z.infer<typeof columnsBlockSchema>;
/** A figure. `src` is the asset when present; `placeholder` describes it otherwise. */
export type ImageBlock = z.infer<typeof imageBlockSchema>;
/** A media slot with a caption. */
export type VideoBlock = z.infer<typeof videoBlockSchema>;
/** An imported/embedded video component (e.g. the animated learning framework). */
export type VideoImportBlock = z.infer<typeof videoImportBlockSchema>;
/** A drag/keyboard-orderable activity checked against `correct`. */
export type SortableBlock = z.infer<typeof sortableBlockSchema>;
/** An image with numbered hotspots; selecting one reveals its detail. */
export type HotspotBlock = z.infer<typeof hotspotBlockSchema>;
/** A downloadable resource link. */
export type DownloadBlock = z.infer<typeof downloadBlockSchema>;
/** The course-map: renders the unit/module/section navigation from the content tree. */
export type CoursemapBlock = z.infer<typeof coursemapBlockSchema>;

/** The full set of content blocks a page can render. Discriminated on `t`. */
export type Block = z.infer<typeof blockSchema>;
