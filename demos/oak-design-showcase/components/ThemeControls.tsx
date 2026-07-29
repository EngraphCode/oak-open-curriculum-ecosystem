/**
 * Theme + motion selects — props-only view over the kit's shipped switcher
 * markup (docs/nextjs-theme-switcher.tsx.txt): a labelled `<select>` per
 * axis. All five themes are always offered — the access themes
 * (high-contrast, colour-safe) are not optional extras.
 */
import type { ReactElement } from 'react';

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

export interface ThemeControlsProps {
  readonly theme: string;
  readonly motion: string;
  readonly themes: readonly string[];
  readonly modes: readonly string[];
  readonly onThemeChange: (value: string) => void;
  readonly onMotionChange: (value: string) => void;
}

export function ThemeControls({
  theme,
  motion,
  themes,
  modes,
  onThemeChange,
  onMotionChange,
}: ThemeControlsProps): ReactElement {
  return (
    <div className="oak-cluster oak-cluster--s">
      <label className="oak-body-3" htmlFor="oak-theme-select">
        Theme
      </label>
      <select
        className="oak-select"
        id="oak-theme-select"
        value={theme}
        onChange={(event) => {
          onThemeChange(event.target.value);
        }}
      >
        {themes.map((name) => (
          <option key={name} value={name}>
            {THEME_LABELS[name] ?? name}
          </option>
        ))}
      </select>
      <label className="oak-body-3" htmlFor="oak-motion-select">
        Motion
      </label>
      <select
        className="oak-select"
        id="oak-motion-select"
        value={motion}
        onChange={(event) => {
          onMotionChange(event.target.value);
        }}
      >
        {modes.map((mode) => (
          <option key={mode} value={mode}>
            {MOTION_LABELS[mode] ?? mode}
          </option>
        ))}
      </select>
    </div>
  );
}
