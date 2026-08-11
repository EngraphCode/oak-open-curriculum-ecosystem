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
 * pre-paint script were ever blocked (e.g. a strict CSP). The theme and
 * motion selects render as DISABLED no-claim placeholders in their
 * full option geometry until the runtime snapshot exists, so the server
 * shell carries the switchboard's true shape at every width and hydration
 * swaps state, never layout (PR #637 review: a height reservation
 * under-reserved at 320px; a reduced-option shell re-wrapped at 737-742px
 * — the geometry guard in tests/showcase.spec.ts pins the claim).
 * useSyncExternalStore serves the server snapshot for both the server
 * render and the hydration render, so the swap is mismatch-free; a
 * returning user's persisted choice appears at the post-hydration render
 * — inherent to client-only state.
 *
 * The label maps are typed over the closed runtime unions, so a kit theme
 * or mode added later is a compile error here (a forced label), never a
 * silently rendered raw slug.
 */
import { typeSafeKeys } from '@oaknational/type-helpers';
import { useSyncExternalStore } from 'react';
import type { ReactElement } from 'react';

import { IDENTITY_DEFAULT, oakThemeStore } from '@oaknational/oak-design-react';
import type { OakMotionMode, OakThemeSnapshot, OakThemeStore } from '@oaknational/oak-design-react';
import { LabelledSelect } from './LabelledSelect';
import { useIdentity } from './brand-identity-binding';
import type { IdentitySlug } from './useIdentity';

// Exported so the picker's frame-bound theme control names themes
// identically to the home switchboard (same discipline as IDENTITY_LABELS).
// Identity default leads: it is the no-choice default (DDR-003 dated
// amendment 2026-08-11 — the person's choice wins, and the identity
// speaks first when the person is silent), and the five choices follow.
export const THEME_LABELS: Readonly<Record<OakThemeSnapshot, string>> = {
  [IDENTITY_DEFAULT]: 'Identity default',
  system: 'Match device',
  light: 'Light',
  dark: 'Dark',
  'high-contrast': 'High contrast',
  'colour-safe': 'Colour safe',
};
const MOTION_LABELS: Readonly<Record<OakMotionMode, string>> = {
  system: 'Match device',
  reduced: 'Reduced',
  full: 'Full',
};
// Exported so the picker's frame-bound control names identities identically.
// The record stays HERE rather than moving to the roster module: its keys are
// slug literals, and relocating them mid-rename would move census occurrences
// for no gain. Exporting moves no text.
export const IDENTITY_LABELS: Readonly<Record<IdentitySlug, string>> = {
  oak: 'Oak',
  freedonia: 'Freedonia DSE',
  creature: 'EMC²',
};

function ThemeMotionControls({
  store,
  theme,
  motion,
}: {
  readonly store: OakThemeStore;
  readonly theme: string;
  readonly motion: string;
}): ReactElement {
  return (
    <>
      <LabelledSelect
        id="oak-theme-select"
        label="Theme"
        value={theme}
        options={store.themeOptions() ?? []}
        labels={THEME_LABELS}
        onChange={store.setTheme}
      />
      <LabelledSelect
        id="oak-motion-select"
        label="Motion"
        value={motion}
        options={store.motionOptions() ?? []}
        labels={MOTION_LABELS}
        onChange={store.setMotion}
      />
    </>
  );
}

// The placeholders carry the FULL static option lists: a select with
// `width: auto` sizes to its widest option, so a reduced option set makes
// the control grow at hydration and re-wrap the utility row (measured: a
// 74px masthead drop in the 737-742px band with a single-option shell).
// The closed label records are compile-time-complete, so geometry equality
// is by construction, not coincidence.
const THEME_OPTION_SHELL: readonly OakThemeSnapshot[] = typeSafeKeys(THEME_LABELS);
const MOTION_OPTION_SHELL: readonly OakMotionMode[] = typeSafeKeys(MOTION_LABELS);

/** The pre-hydration shell: identical geometry (full option lists, see
 *  above), the no-knowledge sentinel on BOTH axes (a placeholder must
 *  never claim a state it cannot know — a returning user's persisted
 *  choice is already applied by the pre-paint script while this control
 *  waits, so the shell shows a bare em dash, never a theme name), and
 *  disabled so the not-yet-interactive state is honest. A disabled
 *  select fires no change, so the live handlers are safe to bind. */
function ThemeMotionPlaceholders({ store }: { readonly store: OakThemeStore }): ReactElement {
  return (
    <>
      <LabelledSelect
        id="oak-theme-select"
        label="Theme"
        value=""
        options={THEME_OPTION_SHELL}
        labels={THEME_LABELS}
        placeholderLabel="—"
        disabled
        onChange={store.setTheme}
      />
      <LabelledSelect
        id="oak-motion-select"
        label="Motion"
        value=""
        options={MOTION_OPTION_SHELL}
        labels={MOTION_LABELS}
        placeholderLabel="—"
        disabled
        onChange={store.setMotion}
      />
    </>
  );
}

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
      {theme !== undefined && motion !== undefined ? (
        <ThemeMotionControls store={store} theme={theme} motion={motion} />
      ) : (
        <ThemeMotionPlaceholders store={store} />
      )}
    </section>
  );
}
