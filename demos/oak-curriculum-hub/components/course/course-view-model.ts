import type { Course, CourseSection } from '@/lib/course/types';
import type { CourseNavModule } from '@/components/blocks/CourseNavContext';

/** One section projected for the sidebar nav; `id` is the `#section=<id>` deep-link anchor. */
interface CourseNavSection {
  readonly id: string;
  readonly title: string;
}

/**
 * A module projected for the sidebar nav: id, title, accent colour (the export-grounded sidebar
 * badge + content eyebrow tint), and its sections (ids preserved for deep-linking).
 */
export interface CourseNavUnitModule {
  readonly id: string;
  readonly title: string;
  readonly color: string;
  readonly sections: readonly CourseNavSection[];
}

/** A unit paired with the modules that belong to it, for the sidebar nav tree. */
export interface CourseNavUnit {
  readonly id: string;
  readonly label: string;
  readonly title: string;
  readonly modules: readonly CourseNavUnitModule[];
}

/** The sidebar nav tree: the intro pseudo-module first, then each unit with its modules and sections. */
export interface CourseNavTree {
  readonly intro: CourseNavUnitModule;
  readonly units: readonly CourseNavUnit[];
}

function toNavSections(sections: readonly CourseSection[]): readonly CourseNavSection[] {
  return sections.map((section) => ({ id: section.id, title: section.title }));
}

/**
 * The flat `{ id, title, sectionCount }` projection consumed by `coursemap` blocks through
 * `CourseNavProvider`: the intro pseudo-module first, then every module in order.
 */
export function toCourseNavModules(course: Course): readonly CourseNavModule[] {
  const intro: CourseNavModule = {
    id: course.intro.id,
    title: course.intro.title,
    sectionCount: course.intro.sections.length,
  };
  const modules = course.modules.map((module) => ({
    id: module.id,
    title: module.title,
    sectionCount: module.sections.length,
  }));
  return [intro, ...modules];
}

/**
 * The sidebar nav tree: the intro pseudo-module, then each unit paired with the modules whose `unit`
 * matches it (order preserved), each module carrying its sections so `#section=<id>` deep-links resolve.
 */
export function toCourseNavTree(course: Course): CourseNavTree {
  const intro: CourseNavUnitModule = {
    id: course.intro.id,
    title: course.intro.title,
    color: course.intro.color,
    sections: toNavSections(course.intro.sections),
  };
  const units = course.units.map((unit) => ({
    id: unit.id,
    label: unit.label,
    title: unit.title,
    modules: course.modules
      .filter((module) => module.unit === unit.id)
      .map((module) => ({
        id: module.id,
        title: module.title,
        color: module.color,
        sections: toNavSections(module.sections),
      })),
  }));
  return { intro, units };
}
