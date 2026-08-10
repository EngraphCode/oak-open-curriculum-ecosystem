'use client';
/* Theme + motion controls for the Oak design system (kit
   docs/nextjs-theme-switcher.tsx.txt, adapted to useSyncExternalStore over
   the @oaknational/oak-design-react theme-store adapter). Pairs with the
   kit's oak-theme.js served
   as a raw inline <head> script from app/layout.tsx (ADR-213: never
   next/script beforeInteractive — it does not block first paint). The server
   snapshot is undefined, so server HTML renders no controls and the client
   upgrades after hydration: theme state lives in localStorage, so the server
   must not guess. All five themes are offered — the access themes
   (high-contrast, colour-safe) are not optional extras. */
import { useSyncExternalStore } from 'react';
import type { ReactElement } from 'react';

import { oakThemeStore } from '@oaknational/oak-design-react';
import type { OakThemeStore } from '@oaknational/oak-design-react';

const THEME_LABELS: Record<string, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'Match device',
  'high-contrast': 'High contrast',
  'colour-safe': 'Colour safe',
};
const MOTION_LABELS: Record<string, string> = {
  system: 'Match device',
  reduced: 'Reduced',
  full: 'Full',
};

function AxisSelect({
  id,
  label,
  value,
  options,
  labels,
  onChange,
  placeholderLabel,
}: {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly options: readonly string[];
  readonly labels: Record<string, string>;
  readonly onChange: (value: string) => void;
  /** Renders a disabled, hidden '' option so the no-choice snapshot ('')
   *  reads truthfully instead of leaving a controlled select with no
   *  matching option — the showcase's LabelledSelect placeholder shape. */
  readonly placeholderLabel?: string;
}): ReactElement {
  return (
    <>
      <label className="oak-body-3" htmlFor={id}>
        {label}
      </label>
      <select
        className="oak-select"
        id={id}
        value={value}
        style={{ width: 'auto', minHeight: 'var(--size-target-min)' }}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholderLabel !== undefined && (
          <option value="" disabled hidden>
            {placeholderLabel}
          </option>
        )}
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option] ?? option}
          </option>
        ))}
      </select>
    </>
  );
}

export default function ThemeSwitcher({
  store = oakThemeStore,
}: {
  readonly store?: OakThemeStore;
} = {}): ReactElement | null {
  const theme = useSyncExternalStore(store.subscribe, store.getTheme, store.getServerSnapshot);
  const motion = useSyncExternalStore(store.subscribe, store.getMotion, store.getServerSnapshot);

  if (theme === undefined || motion === undefined) {
    return null; // server render / no runtime: HTML stays theme-neutral
  }

  return (
    <div className="oak-cluster oak-cluster--s">
      <AxisSelect
        id="oak-theme-select"
        label="Theme"
        value={theme}
        options={store.themeOptions() ?? []}
        labels={THEME_LABELS}
        onChange={store.setTheme}
      />
      <AxisSelect
        id="oak-motion-select"
        label="Motion"
        value={motion}
        options={store.motionOptions() ?? []}
        labels={MOTION_LABELS}
        onChange={store.setMotion}
      />
    </div>
  );
}
