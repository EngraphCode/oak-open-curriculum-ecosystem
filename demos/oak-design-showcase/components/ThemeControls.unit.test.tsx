import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ThemeControls } from './ThemeControls';

const ALL_THEMES = ['light', 'dark', 'system', 'high-contrast', 'colour-safe'];
const ALL_MODES = ['system', 'reduced', 'full'];

function renderControls(onThemeChange: (v: string) => void = () => undefined): void {
  render(
    <ThemeControls
      theme="light"
      motion="system"
      themes={ALL_THEMES}
      modes={ALL_MODES}
      onThemeChange={onThemeChange}
      onMotionChange={() => undefined}
    />,
  );
}

describe('ThemeControls', () => {
  it('offers every supplied theme and motion mode through labelled selects', () => {
    renderControls();
    const themeSelect = screen.getByRole('combobox', { name: 'Theme' });
    const motionSelect = screen.getByRole('combobox', { name: 'Motion' });
    expect(themeSelect.querySelectorAll('option')).toHaveLength(ALL_THEMES.length);
    expect(motionSelect.querySelectorAll('option')).toHaveLength(ALL_MODES.length);
  });

  it('reports a theme choice through the callback with the option value', () => {
    let chosen: string | undefined;
    renderControls((value) => {
      chosen = value;
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Theme' }), {
      target: { value: 'high-contrast' },
    });
    expect(chosen).toBe('high-contrast');
  });
});
