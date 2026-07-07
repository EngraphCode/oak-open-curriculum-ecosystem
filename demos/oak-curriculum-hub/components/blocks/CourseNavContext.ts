'use client';

import { createContext, useContext } from 'react';

/**
 * The minimal course-navigation shape the `coursemap` block renders — a
 * presentational projection (id, title, section count) of the course tree, not
 * the full content tree. The Course-assembly cycle provides it via
 * {@link CourseNavProvider}, mapping the data plane's units→modules→sections
 * tree onto this shape (tree-type ownership agreed with the data lane at
 * assembly). Empty by default, so a `coursemap` block renders an empty nav until
 * a page supplies the modules — data-driven, never fabricated.
 */
export interface CourseNavModule {
  id: string;
  title: string;
  sectionCount: number;
}

const CourseNavContext = createContext<readonly CourseNavModule[]>([]);

/** Provides the course-map module list to `coursemap` blocks below it. */
export const CourseNavProvider = CourseNavContext.Provider;

/** Reads the current course-map module list (empty when no provider is above). */
export function useCourseNav(): readonly CourseNavModule[] {
  return useContext(CourseNavContext);
}
