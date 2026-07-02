'use client';

import type { ReactElement } from 'react';

import { playerPosition } from './course-player';
import { useCoursePlayer } from './CoursePlayerContext';

const buttonClasses =
  'rounded-full border-2 border-oak-black bg-white px-5 py-1.5 text-[15px] font-bold ' +
  'hover:bg-oak-lemon-subdued disabled:opacity-40 disabled:hover:bg-white';

/**
 * The player's section navigation: previous/next plus a "Section n of N" position line. Renders
 * nothing pre-hydration — the server-rendered fallback is the full single-scroll document, which
 * needs no paging controls. Navigation writes the `#section=<id>` hash via the provider, so prev/next,
 * sidebar anchors, and hub-search deep-links all move the player through one mechanism.
 */
export function CoursePlayerControls(): ReactElement | null {
  const { activeSectionId, entries, navigate } = useCoursePlayer();
  if (activeSectionId === null) {
    return null;
  }
  const position = playerPosition(activeSectionId, entries);
  if (position === null) {
    return null;
  }
  const { previousId, nextId } = position;
  return (
    <nav
      aria-label="Section navigation"
      className="mt-12 flex items-center justify-between gap-4 border-t-2 border-oak-black pt-6"
    >
      <button
        type="button"
        disabled={previousId === null}
        onClick={() => {
          if (previousId !== null) {
            navigate(previousId);
          }
        }}
        className={buttonClasses}
      >
        Previous section
      </button>
      <p className="text-[13px] font-bold uppercase tracking-[0.06em]">
        Section {position.index + 1} of {position.total}
      </p>
      <button
        type="button"
        disabled={nextId === null}
        onClick={() => {
          if (nextId !== null) {
            navigate(nextId);
          }
        }}
        className={buttonClasses}
      >
        Next section
      </button>
    </nav>
  );
}
