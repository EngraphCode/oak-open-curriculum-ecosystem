/**
 * The Oak Course content tree types, inferred from the zod schemas in `./schema.ts` — the single
 * source of truth for the course shape. This module is the import surface the course views build
 * against ({@link Course} and {@link CourseSection}); the concrete data lives in
 * `oak-course.json`, produced by `scripts/generate-course.ts` from the canonical export and
 * validated against the schema both at generation and again at load (`./load-course.ts`).
 */

import type { z } from 'zod';

import type { courseSchema, courseSectionSchema } from './schema';

/** A section within a module: a titled sequence of content blocks. */
export type CourseSection = z.infer<typeof courseSectionSchema>;

/** The full Oak Course: the unit index, the intro pseudo-module, and the ordered modules. */
export type Course = z.infer<typeof courseSchema>;
