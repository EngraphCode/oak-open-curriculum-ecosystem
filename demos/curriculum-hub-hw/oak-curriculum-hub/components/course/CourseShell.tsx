import type { ReactElement } from 'react';

import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { CourseNavProvider } from '@/components/blocks/CourseNavContext';
import type { Course, CourseSection } from '@/lib/course/types';

import { CourseDeepLinkFocus } from './CourseDeepLinkFocus';
import { CourseSidebar } from './CourseSidebar';
import { collectSectionIds } from './section-deep-link';
import { toCourseNavModules, toCourseNavTree } from './course-view-model';

/**
 * One section: a deep-link scroll-target plus its blocks. The element id is `section-<id>`; the
 * `/course#section=<id>` contract fragment is bridged to it by the page's deep-link handler (the `=`
 * form keeps the fragment CSS-selector-safe as a plain `-` id). No `aria-labelledby`: with ~64
 * sections on the composed page, naming each one turns it into a region landmark and drowns the
 * landmark map — the module `<article>` is the landmark; a section is a plain container deep links
 * scroll to.
 */
function SectionView({ section }: { section: CourseSection }): ReactElement {
  // Blocks carry no id of their own; pairing each with `<section id>-<position>` yields a key that is
  // unique across the page AND stable across renders (the generated block list is static, never
  // reordered) — proven by construction, so react/no-array-index-key holds without a raw index in the
  // JSX key. No memo: a server component does not re-render.
  const blocks = section.blocks.map((block, index) => ({ block, key: `${section.id}-${index}` }));
  return (
    <section
      id={`section-${section.id}`}
      tabIndex={-1}
      className="scroll-mt-6 border-t border-oak-grey/25 pt-8 outline-none first:border-t-0 first:pt-0"
    >
      <h3 className="mb-4 text-[28px] font-bold leading-tight">{section.title}</h3>
      <div className="flex flex-col gap-6">
        {blocks.map(({ block, key }) => (
          <BlockRenderer key={key} block={block} />
        ))}
      </div>
    </section>
  );
}

/** A module (or the intro): an in-page anchor (`#<moduleId>`, the coursemap scheme) wrapping its sections. */
function ModuleView({
  id,
  title,
  sections,
}: {
  id: string;
  title: string;
  sections: readonly CourseSection[];
}): ReactElement {
  return (
    <article id={id} aria-labelledby={`module-h-${id}`} className="scroll-mt-6">
      <h2
        id={`module-h-${id}`}
        className="mb-6 inline-block rounded-full border-2 border-oak-black bg-oak-lemon px-4 py-1 text-[13px] font-bold uppercase tracking-[0.06em]"
      >
        {title}
      </h2>
      <div className="flex flex-col gap-12">
        {sections.map((section) => (
          <SectionView key={section.id} section={section} />
        ))}
      </div>
    </article>
  );
}

/**
 * The shared course page shell: a sidebar nav landmark plus the block-rendered course content,
 * wrapped in {@link CourseNavProvider} so in-content `coursemap` blocks read the flat module list.
 * Consumed by the `/course` page (the full Oak Course) and the framework-module view. A server
 * component — the nav projections are computed once (no client re-render), so no memoisation is
 * needed; the interactive block views are the client boundaries below.
 */
export function CourseShell({ course, title }: { course: Course; title: string }): ReactElement {
  const modules = toCourseNavModules(course);
  const tree = toCourseNavTree(course);
  return (
    <CourseNavProvider value={modules}>
      <CourseDeepLinkFocus sectionIds={collectSectionIds(tree)} />
      <div className="mx-auto flex max-w-[1280px] flex-col md:flex-row">
        <CourseSidebar tree={tree} title={title} />
        {/* A labelled region, NOT a second <main>: app/layout.tsx already owns the page's main
            landmark (nested main = invalid HTML + duplicate landmark, SC 1.3.1/4.1.2). Repo idiom
            mirrored from StandardsBrowser. */}
        <section aria-label="Course content" className="min-w-0 flex-1 px-6 py-10 md:px-12">
          <div className="mx-auto flex max-w-[760px] flex-col gap-16">
            <ModuleView id={course.intro.id} title={course.intro.title} sections={course.intro.sections} />
            {course.modules.map((module) => (
              <ModuleView key={module.id} id={module.id} title={module.title} sections={module.sections} />
            ))}
          </div>
        </section>
      </div>
    </CourseNavProvider>
  );
}
