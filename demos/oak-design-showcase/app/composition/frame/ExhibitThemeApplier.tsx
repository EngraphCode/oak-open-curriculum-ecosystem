'use client';

/**
 * Applies the exhibit's ground to the document ROOT: light-dark() inside
 * a custom property resolves against the color-scheme of the element the
 * declaration applies to, so a subtree data-theme cannot flip tokens
 * declared at :root — the kit's own model themes the root, and this
 * exhibit follows it. Direct visits get the query's theme here at mount;
 * the parent page drives the same attribute live afterwards.
 */
import { useEffect } from 'react';

import type { ExhibitTheme } from './layouts';

export function ExhibitThemeApplier({ theme }: { readonly theme: ExhibitTheme }): null {
  useEffect(() => {
    document.documentElement.dataset['theme'] = theme;
  }, [theme]);
  return null;
}
