'use client';

import type { ReactElement } from 'react';

import { useCourseNav } from './CourseNavContext';

/**
 * Renders a `coursemap` block as the course-module navigation, read from
 * {@link useCourseNav}. Each module links to its in-page anchor (`#<id>`). Takes
 * no props (the block carries no data of its own); the module list comes from
 * the surrounding Course page. Empty until a page provides modules.
 */
export function CoursemapBlockView(): ReactElement {
  const modules = useCourseNav();
  return (
    <nav aria-label="Course map">
      <ol>
        {modules.map((module) => (
          <li key={module.id}>
            <a href={`#${module.id}`}>{module.title}</a> <span>({module.sectionCount} sections)</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
