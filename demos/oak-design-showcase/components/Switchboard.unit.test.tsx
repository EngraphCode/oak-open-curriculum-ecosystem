import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createOakThemeStore } from '../lib/oak-theme-store';
import type { OakMotionMode, OakThemeName, OakThemeRuntime } from '../lib/oak-theme-store';
import Switchboard from './Switchboard';

function fakeRuntime(): OakThemeRuntime {
  let theme: OakThemeName = 'light';
  let motion: OakMotionMode = 'system';
  return {
    get: () => theme,
    set: (t: OakThemeName) => {
      theme = t;
    },
    themes: ['light', 'dark', 'system', 'high-contrast', 'colour-safe'],
    motion: {
      get: () => motion,
      set: (m: OakMotionMode) => {
        motion = m;
      },
      modes: ['system', 'reduced', 'full'],
    },
  };
}

function renderSwitchboard(runtime: OakThemeRuntime = fakeRuntime()): void {
  render(
    <Switchboard
      store={createOakThemeStore(
        () => runtime,
        () => undefined,
      )}
    />,
  );
}

describe('Switchboard', () => {
  it('offers identity, theme and motion selects with the full option sets', () => {
    renderSwitchboard();
    expect(
      screen.getByRole('combobox', { name: 'Identity' }).querySelectorAll('option'),
    ).toHaveLength(3);
    expect(screen.getByRole('combobox', { name: 'Theme' }).querySelectorAll('option')).toHaveLength(
      5,
    );
    expect(
      screen.getByRole('combobox', { name: 'Motion' }).querySelectorAll('option'),
    ).toHaveLength(3);
  });

  it('writes a theme choice through to the runtime', () => {
    const runtime = fakeRuntime();
    renderSwitchboard(runtime);
    fireEvent.change(screen.getByRole('combobox', { name: 'Theme' }), {
      target: { value: 'high-contrast' },
    });
    expect(runtime.get()).toBe('high-contrast');
  });
});
