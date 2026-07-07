/**
 * The validated Oak Course loader: imports the committed content data (`oak-course.json`,
 * produced by `scripts/generate-course.ts` from the canonical export) and parses it against the
 * course schema — the single source of truth in `./schema.ts` — at module initialisation.
 *
 * This is the runtime belt of the two-belt design (the generator validates the same schema before
 * writing). The module loads at build/server start, so a validation failure fails the build loud
 * via the module-scope `parse` (the one deliberate throwing boundary here: there is no runtime
 * caller to hand a `Result` to, and a malformed content file must never ship). The parsed tree is
 * deeply frozen by the schema's `readonly` wrappers, so course content is immutable by
 * construction.
 */

import courseJson from './oak-course.json';
import { courseSchema } from './schema';
import type { Course } from './types';

/**
 * The full Oak Course (4 units · intro + 11 modules · 214 blocks), schema-validated at load.
 */
export const oakCourse: Course = courseSchema.parse(courseJson);
