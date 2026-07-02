'use client';

import type { ReactElement } from 'react';

import type { CourseNavUnit, CourseNavUnitModule } from './course-view-model';

/**
 * One section row inside an expanded module (export-exact: 3px left rule — dark when active — the
 * module-accent wash on the active row, weight 600/300, rounded right edge). Navigates the player
 * via the `#section=<id>` contract fragment; `aria-current` marks the active section. The leading
 * circle is the export's completion slot — the demo persists no progress, so it stays empty.
 */
function SectionRow({
  sectionId,
  title,
  accent,
  active,
}: {
  readonly sectionId: string;
  readonly title: string;
  readonly accent: string;
  readonly active: boolean;
}): ReactElement {
  return (
    <li>
      <a
        href={`#section=${sectionId}`}
        aria-current={active ? 'location' : undefined}
        style={active ? { backgroundColor: accent } : undefined}
        className={`ml-3.5 flex items-center gap-2.5 rounded-r-lg border-l-[3px] py-[9px] pl-3.5 pr-3 text-[14px] leading-[19px] ${
          active ? 'border-oak-black font-semibold' : 'border-oak-grey-line font-light'
        }`}
      >
        <span
          aria-hidden="true"
          className="h-5 w-5 shrink-0 rounded-full border-2 border-oak-grey-40"
        />
        {title}
      </a>
    </li>
  );
}

/**
 * One module group: the toggle header (per-unit ordinal in an accent-tinted dot, `aria-expanded`,
 * grey wash when the module owns the active section, rotating chevron) plus its section rows when
 * open. The header toggles disclosure only — navigation happens on the section rows, exactly as the
 * export behaves.
 */
/** The module disclosure header: accent ordinal dot, title, rotating chevron; toggles, never navigates. */
function ModuleHeaderButton({
  module,
  ordinal,
  open,
  activeModule,
  onToggle,
}: {
  readonly module: CourseNavUnitModule;
  readonly ordinal: number;
  readonly open: boolean;
  readonly activeModule: boolean;
  readonly onToggle: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onToggle}
      className={`flex w-full items-center gap-[11px] rounded-[10px] px-3 py-[11px] text-left text-[15px] font-bold leading-[19px] ${
        activeModule ? 'bg-oak-black/5' : 'hover:bg-oak-lemon-subdued'
      }`}
    >
      <span
        aria-hidden="true"
        style={{ backgroundColor: module.color }}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-oak-black text-[13px] font-bold"
      >
        {ordinal}
      </span>
      <span className="flex-1">{module.title}</span>
      <span
        aria-hidden="true"
        className={`text-[20px] leading-none text-oak-grey transition-transform ${open ? 'rotate-90' : ''}`}
      >
        ›
      </span>
    </button>
  );
}

function NavModule({
  module,
  ordinal,
  open,
  activeModule,
  activeSectionId,
  onToggle,
}: {
  readonly module: CourseNavUnitModule;
  readonly ordinal: number;
  readonly open: boolean;
  readonly activeModule: boolean;
  readonly activeSectionId: string | null;
  readonly onToggle: () => void;
}): ReactElement {
  return (
    <li className="mb-1.5">
      <ModuleHeaderButton
        module={module}
        ordinal={ordinal}
        open={open}
        activeModule={activeModule}
        onToggle={onToggle}
      />
      {open && (
        <ul className="mb-2 mt-0.5">
          {module.sections.map((section) => (
            <SectionRow
              key={section.id}
              sectionId={section.id}
              title={section.title}
              accent={module.color}
              active={section.id === activeSectionId}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/** One unit group header (dark "Unit N" pill + uppercase grey title) and its modules. */
export function NavUnitGroup({
  unit,
  activeModuleId,
  activeSectionId,
  openModuleId,
  onToggle,
}: {
  readonly unit: CourseNavUnit;
  readonly activeModuleId: string;
  readonly activeSectionId: string | null;
  readonly openModuleId: string | null;
  readonly onToggle: (moduleId: string) => void;
}): ReactElement {
  return (
    <li className="mb-2">
      <p className="mt-1.5 flex items-center gap-2 px-1.5 pb-[7px] pt-2.5">
        <span className="shrink-0 rounded-full bg-oak-black px-[9px] py-[5px] text-[11px] font-bold leading-none tracking-[0.04em] text-white">
          {unit.label}
        </span>
        <span className="text-[11px] font-bold uppercase leading-[15px] tracking-[0.04em] text-oak-grey">
          {unit.title}
        </span>
      </p>
      <ol>
        {unit.modules.map((module, index) => (
          <NavModule
            key={module.id}
            module={module}
            ordinal={index + 1}
            open={openModuleId === module.id}
            activeModule={activeModuleId === module.id}
            activeSectionId={activeSectionId}
            onToggle={() => onToggle(module.id)}
          />
        ))}
      </ol>
    </li>
  );
}

/**
 * The course sidebar, export-exact (the `Oak Course.dc.html` source styles are authoritative; the
 * arrival render is `demo-evidence/course-export-full.png`): logo, grey "Professional course"
 * eyebrow, the course title (the page's single `h1`), the "0 of N done" SECTION-progress zero-state
 * (module sections only — no `role="progressbar"`, the demo persists no progress), then the
 * course-navigation landmark: the starred intro item (lemon-shadow box when current), and each unit
 * as a dark-pill group with expandable modules whose section rows navigate the player. Disclosure
 * derives from the active module, with a user-toggle override keyed to it — navigating re-opens the
 * new active module and discards the stale override, matching the export's single-open behaviour.
 * Pre-hydration the intro is current and every module is collapsed — identical on server and first
 * client render, so hydration is mismatch-free. A plain `<div>`, not an `<aside>`: it holds the page
 * `h1` and the primary nav; the inner `<nav>` carries the navigation semantics.
 */
