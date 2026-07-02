/**
 * The typed content-block model for the Oak Curriculum Hub demo: `Block` is the discriminated
 * union (on `t`), extracted verbatim from the canonical export `Oak Course.dc.html`. It is the
 * seam contract between the data plane (emits blocks) and the presentational `BlockRenderer`;
 * extend by adding a variant + its renderer case, keeping the union closed (no escape-hatch fields).
 */

/** A paragraph run. Rendered as one `<p>` per entry. */
export interface TextBlock {
  t: 'text';
  paras: readonly string[];
}

/** A section sub-heading (`<h3>`-level within a section). */
export interface HeadingBlock {
  t: 'heading';
  text: string;
}

/** One quality-standard bullet inside a callout: a QS code chip + verbatim wording. */
export interface CalloutStandard {
  qs: string;
  text: string;
}

/**
 * A bordered callout. `variant` drives the colour treatment. A quality-standard
 * callout carries either a single `qs`+`text` or an `items` list; both render as
 * QS-chip-led bullets deep-linking `#qs=<id>` (see the export CLAUDE.md). A `quote`
 * variant may carry an `attrib` (the source's `b.attrib` field); some callouts in
 * the source carry no title, so `title` is optional.
 */
export interface CalloutBlock {
  t: 'callout';
  variant: 'info' | 'tip' | 'warning' | 'quote';
  title?: string;
  text?: string;
  qs?: readonly string[];
  items?: readonly CalloutStandard[];
  /** Attribution for a quotation (e.g. `Rosenshine`), rendered as a citation. */
  attrib?: string;
}

/** One multiple-choice / true-false option; `correct` marks the answer. */
export interface QuizOption {
  text: string;
  correct?: boolean;
}

/** A single quiz question. */
export interface QuizQuestion {
  kind: 'mcq' | 'tf';
  stem: string;
  options: readonly QuizOption[];
  explain?: string;
}

/** An interactive knowledge-check: pick an option, reveal correctness + explanation. */
export interface QuizBlock {
  t: 'quiz';
  title: string;
  questions: readonly QuizQuestion[];
}

/** A good-vs-non-example side-by-side. */
export interface CompareBlock {
  t: 'compare';
  goodText: string;
  goodNote?: string;
  badText: string;
  badNote?: string;
}

/** One tab: a label and its paragraph body (+ optional worked example). */
export interface TabPanel {
  label: string;
  paras: readonly string[];
  example?: string;
}

/** A tabbed panel; one tab active at a time. */
export interface TabsBlock {
  t: 'tabs';
  tabs: readonly TabPanel[];
}

/** Key-takeaway bullets plus an optional reflection prompt. */
export interface SummaryBlock {
  t: 'summary';
  points: readonly string[];
  question?: string;
}

/** A flip card: front prompt, back reveal, numbered badge. */
export interface FlipCard {
  badge: string;
  front: string;
  back: string;
}

/** A grid of flip cards; `chip` tints the card accent. */
export interface FlipBlock {
  t: 'flip';
  chip: string;
  cards: readonly FlipCard[];
  /** When set, the card fronts get the image treatment (source's `b.frontImage`). */
  frontImage?: boolean;
}

/** An image slot inside an accordion item; `placeholder` describes the asset. */
export interface AccordionImage {
  placeholder: string;
}

/** One accordion item: question, optional badge/image, answer paragraphs, optional features. */
export interface AccordionItem {
  q: string;
  badge?: string;
  a: readonly string[];
  features?: readonly string[];
  img?: AccordionImage;
}

/** An expand/collapse accordion; the optional `chip` tints the item accent. */
export interface AccordionBlock {
  t: 'accordion';
  chip?: string;
  items: readonly AccordionItem[];
}

/** One statistic: a value and its label. */
export interface StatItem {
  value: string;
  label: string;
}

/** A grid of statistics with optional intro and note. */
export interface StatsBlock {
  t: 'stats';
  intro?: string;
  items: readonly StatItem[];
  note?: string;
}

/** One labelled column of bullet points. */
export interface ColumnGroup {
  title: string;
  points: readonly string[];
}

/** A multi-column comparison of bulleted lists. */
export interface ColumnsBlock {
  t: 'columns';
  cols: readonly ColumnGroup[];
}

/** A figure. `src` is the asset when present; `placeholder` describes it otherwise. */
export interface ImageBlock {
  t: 'image';
  placeholder: string;
  src?: string;
  alt?: string;
  caption?: string;
  maxWidth?: string;
}

/** A media slot with a caption. */
export interface VideoBlock {
  t: 'video';
  caption: string;
  placeholder: string;
}

/** An imported/embedded video component (e.g. the animated learning framework). */
export interface VideoImportBlock {
  t: 'videoimport';
  embed: string;
  filename: string;
  duration: string;
  caption: string;
  hint?: string;
}

/** One orderable item; `id` identifies it for the correct-order check. */
export interface SortableItem {
  id: string;
  text: string;
}

/** A drag/keyboard-orderable activity checked against `correct`. */
export interface SortableBlock {
  t: 'sortable';
  prompt: string;
  items: readonly SortableItem[];
  correct: readonly string[];
}

/** One hotspot: a title and the text revealed when it is active. */
export interface HotspotSpot {
  title: string;
  text: string;
}

/** An image with numbered hotspots; selecting one reveals its detail. */
export interface HotspotBlock {
  t: 'hotspot';
  placeholder: string;
  spots: readonly HotspotSpot[];
}

/** A downloadable resource link. */
export interface DownloadBlock {
  t: 'download';
  title: string;
  desc: string;
  meta: string;
  href: string;
  filename?: string;
}

/** The course-map: renders the unit/module/section navigation from the content tree. */
export interface CoursemapBlock {
  t: 'coursemap';
}

/** The full set of content blocks a page can render. Discriminated on `t`. */
export type Block =
  | TextBlock
  | HeadingBlock
  | CalloutBlock
  | QuizBlock
  | CompareBlock
  | TabsBlock
  | SummaryBlock
  | FlipBlock
  | AccordionBlock
  | StatsBlock
  | ColumnsBlock
  | ImageBlock
  | VideoBlock
  | VideoImportBlock
  | SortableBlock
  | HotspotBlock
  | DownloadBlock
  | CoursemapBlock;

/** The discriminant literal of any block. */
export type BlockKind = Block['t'];
