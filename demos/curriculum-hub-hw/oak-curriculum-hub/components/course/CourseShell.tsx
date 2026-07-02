import type { ReactElement } from 'react';

import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { CourseNavProvider } from '@/components/blocks/CourseNavContext';
import type { Course, CourseSection } from '@/lib/course/types';

import { CoursePlayerControls } from './CoursePlayerControls';
import { CoursePlayerProvider } from './CoursePlayerContext';
import { CourseSidebar } from './CourseSidebar';
import { ModulePosition, PlayerModule, PlayerSection } from './PlayerGates';
import { toCourseNavModules, toCourseNavTree } from './course-view-model';
import { toPlayerEntries } from './course-player';

/**
 * One section: its blocks inside the {@link PlayerSection} gate (the deep-link target element). The
 * element id is `section-<id>`; the `/course#section=<id>` contract fragment is bridged to it by the
 * player (the `=` form keeps the fragment CSS-selector-safe as a plain `-` id). No `aria-labelledby`:
 * with ~64 sections on the composed page, naming each one turns it into a region landmark and drowns
 * the landmark map — the module `<article>` is the landmark; a section is a plain container the
 * player reveals.
 */
function SectionView({ section }: { section: CourseSection }): ReactElement {
  // Blocks carry no id of their own; pairing each with `<section id>-<position>` yields a key that is
  // unique across the page AND stable across renders (the generated block list is static, never
  // reordered) — proven by construction, so react/no-array-index-key holds without a raw index in the
  // JSX key. No memo: a server component does not re-render.
  const blocks = section.blocks.map((block, index) => ({ block, key: `${section.id}-${index}` }));
  return (
    <PlayerSection sectionId={section.id}>
      {/* Export-exact heading: 600 38/46 balanced + the 64×6 accent bar. The h3 is the player's
          programmatic focus target (SC 2.4.3): screen readers announce "<title>, heading, level 3". */}
      <h3
        id={`section-h-${section.id}`}
        tabIndex={-1}
        className="mb-7 text-[38px] font-semibold leading-[46px] tracking-[0.0115rem] text-balance"
      >
        {section.title}
        <span aria-hidden="true" className="mt-1.5 block h-1.5 w-16 rounded-full bg-oak-black" />
      </h3>
      <div className="flex flex-col gap-6">
        {blocks.map(({ block, key }) => (
          <BlockRenderer key={key} block={block} />
        ))}
      </div>
    </PlayerSection>
  );
}

/**
 * A module (or the intro) inside the {@link PlayerModule} gate — the `#<moduleId>` anchor (the
 * coursemap scheme) wrapping its sections; hidden by the player unless it owns the active section.
 */
function ModuleView({
  id,
  eyebrow,
  color,
  unitCrumb,
  sections,
}: {
  id: string;
  eyebrow: string;
  color: string;
  /** "Unit N · unit title" for unit modules; absent for the intro (export-grounded header). */
  unitCrumb?: string;
  sections: readonly CourseSection[];
}): ReactElement {
  return (
    <PlayerModule moduleId={id} labelledBy={`module-h-${id}`}>
      {unitCrumb !== undefined && (
        <p className="mb-[11px] text-[12px] font-bold uppercase tracking-[0.05em] text-oak-grey">
          {unitCrumb}
        </p>
      )}
      {/* Export-grounded: the kicker pill is tinted with the module's accent colour (the intro's
          data colour is the lemon), never hardcoded lemon; unit modules pair it with the live
          "Section n of N" position. */}
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <h2
          id={`module-h-${id}`}
          style={{ backgroundColor: color }}
          className="inline-block rounded-full border-2 border-oak-black px-[13px] py-1.5 text-[12px] font-bold uppercase tracking-[0.04em]"
        >
          {eyebrow}
        </h2>
        {unitCrumb !== undefined && <ModulePosition moduleId={id} />}
      </div>
      <div className="flex flex-col gap-12">
        {sections.map((section) => (
          <SectionView key={section.id} section={section} />
        ))}
      </div>
    </PlayerModule>
  );
}

/**
 * The shared course page shell: a sidebar nav landmark plus the block-rendered course content, wrapped
 * in {@link CourseNavProvider} (in-content `coursemap` blocks read the flat module list) and
 * {@link CoursePlayerProvider} (the paginated-player presentation, plan Ratified decision #7). The
 * server renders EVERY section — SSR, crawlers, and no-JS users get the full document — and the thin
 * client gates then reveal one section per view, navigated by the sidebar anchors, the
 * `#section=<id>` deep links, and the prev/next controls. Consumed by the `/course` page (the full
 * Oak Course) and the framework-module view. A server component — the nav projections are computed
 * once; the player gates and interactive block views are the client boundaries below.
 */
export function CourseShell({ course, title }: { course: Course; title: string }): ReactElement {
  const modules = toCourseNavModules(course);
  const tree = toCourseNavTree(course);
  return (
    <CourseNavProvider value={modules}>
      <CoursePlayerProvider entries={toPlayerEntries(tree)}>
        <div className="mx-auto flex max-w-[1280px] flex-col md:flex-row">
          <CourseSidebar tree={tree} title={title} />
          {/* A labelled region, NOT a second <main>: app/layout.tsx already owns the page's main
              landmark (nested main = invalid HTML + duplicate landmark, SC 1.3.1/4.1.2). Repo idiom
              mirrored from StandardsBrowser. */}
          <section aria-label="Course content" className="min-w-0 flex-1 px-6 py-10 md:px-12">
            <div className="mx-auto max-w-[760px]">
              <div className="flex flex-col gap-16">
                {/* Export-grounded: the intro's eyebrow reads "Course overview" (fixed), not the
                    intro module title; module eyebrows carry the module title. */}
                <ModuleView
                  id={course.intro.id}
                  eyebrow="Course overview"
                  color={course.intro.color}
                  sections={course.intro.sections}
                />
                {course.modules.map((module) => {
                  const unit = course.units.find((candidate) => candidate.id === module.unit);
                  return (
                    <ModuleView
                      key={module.id}
                      id={module.id}
                      eyebrow={module.title}
                      color={module.color}
                      unitCrumb={unit === undefined ? undefined : `${unit.label} · ${unit.title}`}
                      sections={module.sections}
                    />
                  );
                })}
              </div>
              <CoursePlayerControls />
            </div>
          </section>
        </div>
      </CoursePlayerProvider>
    </CourseNavProvider>
  );
}
