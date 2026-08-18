'use client';

/**
 * Applies the cell's theme to the document ROOT, following the composition
 * exhibit's applier: `light-dark()` inside a custom property resolves
 * against the colour-scheme of the element the declaration applies to, so a
 * subtree `data-theme` cannot flip tokens declared at `:root`. The kit
 * themes the root, and so does this.
 *
 * The identity default is the ABSENCE of the attribute, not a value of it —
 * that is the whole point of the first band, where each identity shows the
 * face it chose for itself. Setting `data-theme="identity-default"` would
 * match no theme rule and quietly show the light face instead.
 */
import { IDENTITY_DEFAULT } from '@oaknational/oak-design-react';
import { useEffect } from 'react';

import type { MatrixTheme } from '../colour-matrix';

export function StripThemeApplier({ theme }: { readonly theme: MatrixTheme }): null {
  useEffect(() => {
    const root = document.documentElement;
    if (theme === IDENTITY_DEFAULT) {
      delete root.dataset['theme'];
    } else {
      root.dataset['theme'] = theme;
    }
  }, [theme]);
  return null;
}
