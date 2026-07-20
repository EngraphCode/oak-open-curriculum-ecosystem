'use client';

import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { activeModuleIdOf } from './course-player';
import { useCoursePlayer } from './CoursePlayerContext';

/** CSSProperties plus the module-accent custom property (the react types predate `--*` keys). */
interface ModuleAccentStyle extends CSSProperties {
  readonly '--module-accent': string;
}

/**
 * The module landmark (`<article id={moduleId}>`, the coursemap `#<moduleId>` anchor scheme), hidden
 * unless it owns the active section. Pre-hydration (`activeSectionId === null`) every module shows —
 * the server-rendered document doubles as the no-JS fallback. The heading the label points at lives in
 * the server-rendered children; only the visibility decision is client work.
 */
export function PlayerModule({
  moduleId,
  labelledBy,
  accent,
  children,
}: {
  readonly moduleId: string;
  readonly labelledBy: string;
  /** The module's accent colour, exposed as `--module-accent` so SERVER-rendered block views
      (accordion chips, flip backs) inherit it without a client context (export: `b.chip ?? accent`). */
  readonly accent: string;
  readonly children: ReactNode;
}): ReactElement {
  const { activeSectionId, entries } = useCoursePlayer();
  const activeModuleId = activeModuleIdOf(activeSectionId, entries);
  const hidden = activeModuleId !== null && activeModuleId !== moduleId;
  const accentStyle: ModuleAccentStyle = { '--module-accent': accent };
  return (
    <article
      id={moduleId}
      aria-labelledby={labelledBy}
      hidden={hidden}
      style={accentStyle}
      className="scroll-mt-6"
    >
      {children}
    </article>
  );
}

/**
 * The live "Section n of N" position beside a unit module's kicker pill (export-grounded content
 * header; n/N are within the module, not the whole course). Renders nothing pre-hydration or while
 * another module is active — the parent module is hidden then anyway.
 */
export function ModulePosition({ moduleId }: { readonly moduleId: string }): ReactElement | null {
  const { activeSectionId, entries } = useCoursePlayer();
  if (activeSectionId === null || activeModuleIdOf(activeSectionId, entries) !== moduleId) {
    return null;
  }
  const moduleSections = entries.filter((entry) => entry.moduleId === moduleId);
  const index = moduleSections.findIndex((entry) => entry.sectionId === activeSectionId);
  if (index === -1) {
    return null;
  }
  return (
    <p className="text-[14px] font-light text-ink-subdued">
      Section {index + 1} of {moduleSections.length}
    </p>
  );
}

/**
 * The section element (`section-<id>`, the deep-link scroll anchor), hidden in player mode unless
 * active. Programmatic focus lands on the section's H3 (`section-h-<id>`, owned by the shell), NOT
 * this container — a nameless focused `<section>` announces nothing to screen readers. The
 * between-section divider classes apply only pre-hydration: in the one-section-per-view player a
 * divider above the lone visible section would read as a stray rule.
 */
export function PlayerSection({
  sectionId,
  children,
}: {
  readonly sectionId: string;
  readonly children: ReactNode;
}): ReactElement {
  const { activeSectionId } = useCoursePlayer();
  const playerActive = activeSectionId !== null;
  return (
    <section
      id={`section-${sectionId}`}
      hidden={playerActive && activeSectionId !== sectionId}
      className={
        playerActive
          ? 'scroll-mt-6'
          : 'scroll-mt-6 border-t border-line-neutral/25 pt-8 first:border-t-0 first:pt-0'
      }
    >
      {children}
    </section>
  );
}
