import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createOakThemeStore } from '../lib/oak-theme-store';
import type { OakMotionMode, OakThemeName, OakThemeRuntime } from '../lib/oak-theme-store';
import Switchboard from './Switchboard';

function fakeRuntimeWorld(): {
  runtime: OakThemeRuntime;
  appliedTheme: () => string | undefined;
} {
  let applied: OakThemeName | undefined;
  let motion: OakMotionMode = 'system';
  const runtime: OakThemeRuntime = {
    get: () => applied ?? 'light',
    set: (t: OakThemeName) => {
      applied = t;
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
  return { runtime, appliedTheme: () => applied };
}

describe('Switchboard', () => {
  it('offers identity, theme and motion in a named settings landmark', () => {
    const world = fakeRuntimeWorld();
    render(
      <Switchboard
        store={createOakThemeStore(
          () => world.runtime,
          () => undefined,
          world.appliedTheme,
        )}
      />,
    );
    expect(screen.queryByRole('region', { name: 'Brand and display settings' })).not.toBeNull();
    expect(
      screen.getByRole('combobox', { name: 'Identity' }).querySelectorAll('option'),
    ).toHaveLength(3);
    expect(
      screen.getByRole('combobox', { name: 'Motion' }).querySelectorAll('option'),
    ).toHaveLength(3);
    // Five themes plus the non-choosable "Page default" placeholder, which
    // is the selected display in the no-choice state.
    const themeSelect = screen.getByRole('combobox', { name: 'Theme' });
    expect(themeSelect.querySelectorAll('option')).toHaveLength(6);
    expect(themeSelect).toHaveProperty('value', '');
  });
});

describe('Switchboard write-through and degradation', () => {
  it('writes a theme choice through to the runtime, including from no-choice', () => {
    const world = fakeRuntimeWorld();
    render(
      <Switchboard
        store={createOakThemeStore(
          () => world.runtime,
          () => undefined,
          world.appliedTheme,
        )}
      />,
    );
    fireEvent.change(screen.getByRole('combobox', { name: 'Theme' }), {
      target: { value: 'high-contrast' },
    });
    expect(world.appliedTheme()).toBe('high-contrast');
  });

  it('offers the identity control even with no theme runtime', () => {
    render(
      <Switchboard
        store={createOakThemeStore(
          () => undefined,
          () => undefined,
          () => undefined,
        )}
      />,
    );
    expect(screen.queryByRole('combobox', { name: 'Identity' })).not.toBeNull();
    expect(screen.queryByRole('combobox', { name: 'Theme' })).toBeNull();
  });
});
