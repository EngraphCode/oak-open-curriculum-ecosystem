'use client';
/**
 * The switchboard: identity × theme × motion controls. This is the binder —
 * it owns the hooks (useSyncExternalStore over the theme store, the identity
 * binder) and passes plain props to the views. Renders nothing before the
 * client snapshot exists: theme and identity are client state, and the
 * server HTML stays neutral (the pre-paint script has already applied any
 * stored theme by the time this hydrates). The store is injectable so tests
 * drive the composed control from a fake runtime (ADR-078).
 */
import { useSyncExternalStore } from 'react';
import type { ReactElement } from 'react';

import { oakThemeStore } from '../lib/oak-theme-store';
import type { OakThemeStore } from '../lib/oak-theme-store';
import { IdentityControl } from './IdentityControl';
import { ThemeControls } from './ThemeControls';
import { useIdentity } from './useIdentity';

export default function Switchboard({
  store = oakThemeStore,
}: {
  readonly store?: OakThemeStore;
} = {}): ReactElement | null {
  const theme = useSyncExternalStore(store.subscribe, store.getTheme, store.getServerSnapshot);
  const motion = useSyncExternalStore(store.subscribe, store.getMotion, store.getServerSnapshot);
  const { identity, identities, setIdentity } = useIdentity();

  if (theme === undefined || motion === undefined) {
    return null; // server render / no runtime: HTML stays theme-neutral
  }

  return (
    <div className="oak-cluster oak-cluster--l">
      <IdentityControl identity={identity} identities={identities} onChange={setIdentity} />
      <ThemeControls
        theme={theme}
        motion={motion}
        themes={store.themeOptions()}
        modes={store.motionOptions()}
        onThemeChange={store.setTheme}
        onMotionChange={store.setMotion}
      />
    </div>
  );
}
