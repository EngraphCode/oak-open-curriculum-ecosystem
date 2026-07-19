'use client';

import type { ReactElement } from 'react';

import { useCourseNav } from './CourseNavContext';

/**
 * Renders a `coursemap` block as the course-module navigation, read from
 * {@link useCourseNav}: the export's module cards (white, lemon-shadowed, a
 * numbered dot beside title + section count, a black jump pill), in the
 * export's auto-fit grid. The dot stays neutral — the export colours it per
 * module, a field {@link useCourseNav}'s projection does not carry (extend the
 * seam with the data lane before colouring). Takes no props (the block carries
 * no data of its own); empty until a page provides modules.
 */
export function CoursemapBlockView(): ReactElement {
  const modules = useCourseNav();
  return (
    <nav aria-label="Course map">
      <ol className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
        {modules.map((module, index) => (
          <li
            key={module.id}
            className="shadow-accent-brand flex flex-col overflow-hidden rounded-[14px] border-2 border-line bg-white"
          >
            <span className="flex items-center gap-[11px] p-[16px_18px_10px]">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-line bg-white text-[15px] leading-none font-bold"
              >
                {index + 1}
              </span>
              <span className="flex-1">
                <span className="block text-lg leading-[23px] font-bold">{module.title}</span>
                <span className="mt-[3px] block text-[13px] leading-none font-light text-ink-subdued">
                  {module.sectionCount} sections
                </span>
              </span>
            </span>
            <span className="mt-auto block p-[14px_18px_16px]">
              <a
                href={`#${module.id}`}
                className="shadow-accent-brand flex w-full items-center justify-center gap-[7px] rounded-lg border-2 border-line bg-surface-inverted p-[11px] text-sm leading-none font-bold text-white no-underline"
              >
                Start module <span aria-hidden="true">→</span>
              </a>
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
