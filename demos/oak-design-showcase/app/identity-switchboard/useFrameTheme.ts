'use client';

/**
 * Theme INSIDE the picker's frame: the kit's cascade keys on the root
 * `data-theme` attribute, so applying a theme is an attribute write on the
 * framed document — presentation as data, same no-reload story as
 * identity. Identity default is the opening state (DDR-003 dated
 * amendment 2026-08-11): the control names the no-choice state honestly,
 * and the frame shows each identity's own default face — dark for the
 * arcade, light for the base — exactly as a first-time visitor would see
 * it.
 */
import { typeSafeKeys } from '@oaknational/type-helpers';
import { useCallback, useEffect, useState } from 'react';

import { IDENTITY_DEFAULT } from '@oaknational/oak-design-react';
import type { OakThemeSnapshot } from '@oaknational/oak-design-react';
import { THEME_LABELS } from '../../components/Switchboard';

export const THEME_OPTIONS: readonly OakThemeSnapshot[] = typeSafeKeys(THEME_LABELS);

function isPickerTheme(value: string): value is OakThemeSnapshot {
  const names: readonly string[] = THEME_OPTIONS;
  return names.includes(value);
}

/** Apply a picker theme to the framed document's root. Identity default is
 *  the no-attribute state — the framed identity's own polarity governs
 *  (DDR-003 dated amendment 2026-08-11) — with the kit's access
 *  commitment honoured frame-locally: an OS-level request for more
 *  contrast keeps high-contrast until an explicit choice is made in the
 *  control. The picker writes the attribute directly rather than calling
 *  the frame runtime's set()/clear(): its controls are stage-local
 *  presentation data, and a runtime write would persist to the shared
 *  localStorage and leak the demo state into the whole showcase. */
function applyFrameTheme(root: HTMLElement, theme: OakThemeSnapshot): void {
  if (theme !== IDENTITY_DEFAULT) {
    root.dataset['theme'] = theme;
    return;
  }
  const prefersMoreContrast =
    root.ownerDocument.defaultView?.matchMedia('(prefers-contrast: more)').matches === true;
  if (prefersMoreContrast) {
    root.dataset['theme'] = 'high-contrast';
    return;
  }
  delete root.dataset['theme'];
}

export function useFrameTheme(resolveTarget: () => Document | null): {
  readonly theme: OakThemeSnapshot;
  readonly setTheme: (value: string) => void;
} {
  const [theme, setThemeState] = useState<OakThemeSnapshot>(IDENTITY_DEFAULT);

  useEffect(() => {
    const root = resolveTarget()?.documentElement;
    if (root === null || root === undefined) {
      return;
    }
    applyFrameTheme(root, theme);
  }, [theme, resolveTarget]);

  const setTheme = useCallback((value: string): void => {
    if (isPickerTheme(value)) {
      setThemeState(value);
    }
  }, []);

  return { theme, setTheme };
}
