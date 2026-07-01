/**
 * The Oak Course content tree — the typed shape of the full course reproduced from the Claude
 * Design canonical export (`claude-design-canonical-export/Oak Course.dc.html`).
 *
 * The course is `units → modules → sections → blocks`, where each block is a {@link Block} from the
 * presentational seam (`../blocks/types`). This module owns the *tree* shape (data-lane); the block
 * union is the shared seam Kite/styling owns. The tree type is settled with the styling lane via the
 * Director at Course-assembly before either side commits (per the seam contract) — the block-level
 * contract is stable and unchanged.
 *
 * The concrete data lives in `oak-course.generated.ts`, produced by `scripts/generate-course.ts`
 * from the export and compile-time-validated against these types (a malformed block is a build
 * error, so the exhaustive `BlockRenderer` is safe by construction).
 */

import type { Block } from '../blocks/types';

/** A course unit: the top-level grouping (`Unit 1 … Unit 4`). */
export interface Unit {
  readonly id: string;
  readonly label: string;
  readonly title: string;
}

/** A section within a module: a titled sequence of content blocks. */
export interface CourseSection {
  readonly id: string;
  readonly title: string;
  readonly blocks: readonly Block[];
}

/** A course module: belongs to a unit, carries accent colours, learning outcomes, and sections. */
export interface CourseModule {
  readonly id: string;
  readonly unit: string;
  readonly title: string;
  readonly color: string;
  readonly colorStrong: string;
  readonly outcomes: readonly string[];
  readonly sections: readonly CourseSection[];
}

/**
 * The intro pseudo-module (`Welcome & overview`). Distinct from {@link CourseModule}: it has no unit,
 * accent-strong colour, or outcomes — only a title, a base colour, and sections.
 */
export interface IntroModule {
  readonly id: 'intro';
  readonly title: string;
  readonly color: string;
  readonly sections: readonly CourseSection[];
}

/** The full Oak Course: the unit index, the intro pseudo-module, and the ordered modules. */
export interface Course {
  readonly units: readonly Unit[];
  readonly intro: IntroModule;
  readonly modules: readonly CourseModule[];
}
