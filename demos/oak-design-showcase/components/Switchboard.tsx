'use client';
/**
 * The switchboard: identity × theme × motion controls. This is the binder —
 * it owns the hooks (useSyncExternalStore over the theme store, the identity
 * binder) and passes plain props to the LabelledSelect views. Its root is a
 * named section, so the page's interactive surface is a landmark with a
 * group name.
 *
 * The identity control renders unconditionally — it has no dependency on
 * the theme runtime, and coupling its availability to an unrelated
 * subsystem's liveness would remove the page's headline interaction if the
 * pre-paint script were ever blocked (e.g. a strict CSP). Only the theme
 * and motion selects wait for the runtime snapshot.
 *
 * The label maps are typed over the closed runtime unions, so a kit theme
 * or mode added later is a compile error here (a forced label), never a
 * silently rendered raw slug.
 */
import { useSyncExternalStore } from 'react';
import type { ReactElement } from 'react';

import { oakThemeStore } from '../lib/oak-theme-store';
import type { OakMotionMode, OakThemeName, OakThemeStore } from '../lib/oak-theme-store';
import { LabelledSelect } from './LabelledSelect';
import { useIdentity } from './useIdentity';

const THEME_LABELS: Readonly<Record<OakThemeName, string>> = {
  light: 'Light',
  dark: 'Dark',
  system: 'Match device',
  'high-contrast': 'High contrast',
  'colour-safe': 'Colour safe',
};
const MOTION_LABELS: Readonly<Record<OakMotionMode, string>> = {
  system: 'Match device',
  reduced: 'Reduced',
  full: 'Full',
};
const IDENTITY_LABELS: Readonly<Record<string, string>> = {
  oak: 'Oak',
  freedonia: 'Freedonia DSE',
  creature: 'EMC²',
};

// The store prop must be referentially stable across renders (the default
// module singleton is): useSyncExternalStore re-subscribes whenever the
// subscribe function's identity changes.
export default function Switchboard({
  store = oakThemeStore,
}: {
  readonly store?: OakThemeStore;
}): ReactElement {
  const theme = useSyncExternalStore(store.subscribe, store.getTheme, store.getServerSnapshot);
  const motion = useSyncExternalStore(store.subscribe, store.getMotion, store.getServerSnapshot);
  const { identity, identities, setIdentity } = useIdentity();

  return (
    <section aria-label="Brand and display settings" className="oak-cluster oak-cluster--l">
      <LabelledSelect
        id="oak-identity-select"
        label="Identity"
        value={identity}
        options={identities}
        labels={IDENTITY_LABELS}
        onChange={setIdentity}
      />
      {theme !== undefined && motion !== undefined && (
        <>
          <LabelledSelect
            id="oak-theme-select"
            label="Theme"
            value={theme}
            options={store.themeOptions()}
            labels={THEME_LABELS}
            placeholderLabel="Page default"
            onChange={store.setTheme}
          />
          <LabelledSelect
            id="oak-motion-select"
            label="Motion"
            value={motion}
            options={store.motionOptions()}
            labels={MOTION_LABELS}
            onChange={store.setMotion}
          />
        </>
      )}
    </section>
  );
}
