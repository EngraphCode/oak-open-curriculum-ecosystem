'use client';

import { useEffect } from 'react';

import { resolveSectionDeepLink } from './section-deep-link';

/**
 * Moves keyboard focus to the deep-linked section on arrival at `/course#section=<id>` and on later
 * hash changes. Programmatic focus (not scroll-only) is the WCAG requirement (SC 2.4.3): hub-search
 * emits `#section=<id>` fragments that are not native element ids, so the browser never focuses the
 * target for us. `.focus()` also scrolls it into view; `scroll-padding-top` (globals.css) clears the
 * sticky nav. Renders nothing.
 */
export function CourseDeepLinkFocus({ sectionIds }: { sectionIds: readonly string[] }): null {
  useEffect(() => {
    const valid = new Set(sectionIds);
    const focusFromHash = (): void => {
      const targetId = resolveSectionDeepLink(globalThis.location.hash, valid);
      if (targetId === null) {
        return;
      }
      document.getElementById(targetId)?.focus();
    };
    focusFromHash();
    globalThis.addEventListener('hashchange', focusFromHash);
    return () => {
      globalThis.removeEventListener('hashchange', focusFromHash);
    };
  }, [sectionIds]);
  return null;
}
