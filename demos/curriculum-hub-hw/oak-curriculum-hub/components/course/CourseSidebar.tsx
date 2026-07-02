import type { ReactElement } from 'react';

import type { CourseNavTree, CourseNavUnit, CourseNavUnitModule } from './course-view-model';

/** One module link in the sidebar nav: jumps to the module's in-page anchor (`#<moduleId>`). */
function NavModuleLink({ module }: { module: CourseNavUnitModule }): ReactElement {
  return (
    <li>
      <a
        href={`#${module.id}`}
        className="block rounded-md px-3 py-1.5 text-[15px] font-light text-oak-grey hover:bg-oak-lemon-subdued hover:text-oak-black"
      >
        {module.title}
      </a>
    </li>
  );
}

/** One unit group: a numbered badge + unit title, then its module links. */
function NavUnitGroup({ unit, index }: { unit: CourseNavUnit; index: number }): ReactElement {
  return (
    <li>
      <p className="mt-4 mb-1 flex items-center gap-2.5 px-1">
        <span
          aria-hidden="true"
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-oak-black bg-oak-lemon text-[13px] font-bold"
        >
          {index + 1}
        </span>
        <span className="text-[15px] font-bold leading-tight">
          <span className="sr-only">{unit.label}: </span>
          {unit.title}
        </span>
      </p>
      <ol className="flex flex-col gap-0.5 pl-[34px]">
        {unit.modules.map((module) => (
          <NavModuleLink key={module.id} module={module} />
        ))}
      </ol>
    </li>
  );
}

/**
 * The course sidebar: the professional-course eyebrow, the course title (the page's single `h1`), a
 * static progress indicator (reproduced from the canonical export — the demo persists no progress, so
 * it is a fixed zero-state with no `role="progressbar"`), and the course-navigation landmark — the
 * intro pseudo-module first, then each unit with its modules. A plain `<div>`, not an `<aside>`: it
 * holds the page `h1` and the primary nav, so `complementary` would be the wrong landmark; the inner
 * `<nav>` carries the navigation semantics. Fed the {@link CourseNavTree}; each link targets an
 * in-page anchor rendered by the main content.
 */
export function CourseSidebar({ tree, title }: { tree: CourseNavTree; title: string }): ReactElement {
  const moduleCount = tree.units.reduce((sum, unit) => sum + unit.modules.length, 0);
  return (
    <div className="shrink-0 border-r-2 border-oak-black bg-white px-6 py-8 md:w-[320px]">
      <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.06em] text-oak-navy">
        Professional course
      </p>
      <h1 className="text-[24px] font-bold leading-tight">{title}</h1>
      <div className="mt-4">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-[13px] font-bold">Your progress</span>
          <span className="text-[13px] font-light text-oak-grey">0 of {moduleCount} modules complete</span>
        </div>
        <div className="h-2 rounded-full border-2 border-oak-black bg-white" aria-hidden="true">
          <div className="h-full w-0 rounded-full bg-oak-mint" />
        </div>
      </div>
      <nav aria-label="Course navigation" className="mt-6">
        <ol className="flex flex-col gap-0.5">
          <li>
            <a
              href={`#${tree.intro.id}`}
              className="block rounded-md px-3 py-2 text-[15px] font-bold text-oak-black hover:bg-oak-lemon-subdued"
            >
              {tree.intro.title}
            </a>
          </li>
          {tree.units.map((unit, index) => (
            <NavUnitGroup key={unit.id} unit={unit} index={index} />
          ))}
        </ol>
      </nav>
    </div>
  );
}
