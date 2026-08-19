'use client';

/**
 * Applies the exhibit's ground to the document ROOT: light-dark() inside
 * a custom property resolves against the color-scheme of the element the
 * declaration applies to, so a subtree data-theme cannot flip tokens
 * declared at :root — the kit's own model themes the root, and this
 * exhibit follows it.
 *
 * OWNERSHIP BY CONTEXT (review round 3): the kit runtime's live
 * `prefers-contrast` listener rewrites `data-theme` when it believes no
 * choice exists, so a one-shot write loses the query's ground on the
 * first OS change. Standalone, this component HOLDS the query theme for
 * the route's lifetime through the shared frame-theme guard. FRAMED, it
 * deliberately does nothing: the parent stage installs the hold and
 * drives it live — exactly one holder per document, or two observers
 * would correct each other forever.
 */
import { useEffect } from 'react';

import { holdFrameTheme } from '../../../components/apply-frame-theme';
import { useFramed } from '../../../components/useFramed';
import type { ExhibitTheme } from './layouts';

export function ExhibitThemeApplier({ theme }: { readonly theme: ExhibitTheme }): null {
  const framed = useFramed();
  useEffect(() => {
    if (framed) {
      return undefined;
    }
    return holdFrameTheme(document.documentElement, theme);
  }, [framed, theme]);
  return null;
}
