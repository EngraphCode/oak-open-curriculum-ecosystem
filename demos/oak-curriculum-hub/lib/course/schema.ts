/**
 * The zod schema for the Oak Course content tree — the single source of truth for the course
 * shape reproduced from the Claude Design canonical export (`Oak Course.dc.html`).
 *
 * The course is `units → modules → sections → blocks`, where each block is validated by the
 * shared block union (`../blocks/schema`). Two belts consume this schema: the generator
 * (`scripts/generate-course.ts`) validates extracted export content BEFORE emitting
 * `oak-course.json`, and the loader (`./load-course.ts`) re-validates that committed JSON at
 * module initialisation. Shapes are strict, so a drifted export field is a loud failure at
 * generation — never silent content corruption in the app.
 */

import { z } from 'zod';

import { blockSchema } from '../blocks/schema';

/** A course unit: the top-level grouping (`Unit 1 … Unit 4`). */
const unitSchema = z
  .strictObject({ id: z.string(), label: z.string(), title: z.string() })
  .readonly();

/** A section within a module: a titled sequence of content blocks. */
export const courseSectionSchema = z
  .strictObject({ id: z.string(), title: z.string(), blocks: z.array(blockSchema).readonly() })
  .readonly();

/** A course module: belongs to a unit, carries accent colours, learning outcomes, and sections. */
const courseModuleSchema = z
  .strictObject({
    id: z.string(),
    unit: z.string(),
    title: z.string(),
    color: z.string(),
    colorStrong: z.string(),
    outcomes: z.array(z.string()).readonly(),
    sections: z.array(courseSectionSchema).readonly(),
  })
  .readonly();

/**
 * The intro pseudo-module (`Welcome & overview`). Distinct from a course module: it has no unit,
 * accent-strong colour, or outcomes — only a title, a base colour, and sections.
 */
const introModuleSchema = z
  .strictObject({
    id: z.literal('intro'),
    title: z.string(),
    color: z.string(),
    sections: z.array(courseSectionSchema).readonly(),
  })
  .readonly();

/** The full Oak Course: the unit index, the intro pseudo-module, and the ordered modules. */
export const courseSchema = z
  .strictObject({
    units: z.array(unitSchema).readonly(),
    intro: introModuleSchema,
    modules: z.array(courseModuleSchema).readonly(),
  })
  .readonly();
