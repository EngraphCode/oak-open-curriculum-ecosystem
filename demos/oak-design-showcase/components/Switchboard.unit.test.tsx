import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createOakThemeStore, IDENTITY_DEFAULT } from '@oaknational/oak-design-react';
import type { OakMotionMode, OakThemeName, OakThemeRuntime } from '@oaknational/oak-design-react';
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
    clear: () => {
      applied = undefined;
    },
    // Mirrors the real runtime: a set() through this session IS the choice,
    // and clear() removes it (the state the store names Identity default).
    choice: () => applied ?? null,
    themes: ['system', 'light', 'dark', 'high-contrast', 'colour-safe'],
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
    render(<Switchboard store={createOakThemeStore(() => world.runtime)} />);
    expect(screen.queryByRole('region', { name: 'Brand and display settings' })).not.toBeNull();
    expect(
      screen.getByRole('combobox', { name: 'Identity' }).querySelectorAll('option'),
    ).toHaveLength(3);
    expect(
      screen.getByRole('combobox', { name: 'Motion' }).querySelectorAll('option'),
    ).toHaveLength(3);
    // The theme options are a relation, not a count: Identity default —
    // the no-choice default the control opens on (DDR-003 dated amendment
    // 2026-08-11) — leads, and the tail IS the runtime's own theme list.
    const themeSelect = screen.getByRole('combobox', { name: 'Theme' });
    const themeValues = Array.from(themeSelect.querySelectorAll('option')).map((o) => o.value);
    expect(themeValues).toEqual([IDENTITY_DEFAULT, ...world.runtime.themes]);
    expect(themeSelect).toHaveProperty('value', IDENTITY_DEFAULT);
  });
});

describe('Switchboard write-through and degradation', () => {
  it('writes a theme choice through to the runtime, and Identity default clears it again', () => {
    const world = fakeRuntimeWorld();
    render(<Switchboard store={createOakThemeStore(() => world.runtime)} />);
    const themeSelect = screen.getByRole('combobox', { name: 'Theme' });
    fireEvent.change(themeSelect, { target: { value: 'high-contrast' } });
    expect(world.appliedTheme()).toBe('high-contrast');
    fireEvent.change(themeSelect, { target: { value: IDENTITY_DEFAULT } });
    expect(world.appliedTheme()).toBeUndefined();
    expect(themeSelect).toHaveProperty('value', IDENTITY_DEFAULT);
  });

  it('renders theme and motion as disabled no-knowledge placeholders with no runtime', () => {
    render(<Switchboard store={createOakThemeStore(() => undefined)} />);
    expect(screen.queryByRole('combobox', { name: 'Identity' })).not.toBeNull();
    // The placeholders are disabled (honestly not yet interactive) and read
    // the no-KNOWLEDGE sentinel ('') on both axes — a DIFFERENT state from
    // no-choice: the shell cannot know a returning user's persisted choice,
    // so it claims nothing, while the live control names no-choice as the
    // selectable Identity default. The shells carry the SAME option lists
    // as the live controls — a select sizes to its widest option, so
    // option parity is the geometry contract (the rendered-geometry claim
    // itself is pinned by the guard in tests/showcase.spec.ts).
    const world = fakeRuntimeWorld();
    const live = [IDENTITY_DEFAULT, ...world.runtime.themes];
    const themeSelect = screen.getByRole('combobox', { name: 'Theme' });
    expect(themeSelect).toHaveProperty('disabled', true);
    expect(themeSelect).toHaveProperty('value', '');
    const shellValues = Array.from(themeSelect.querySelectorAll('option'))
      .map((o) => o.value)
      .filter((value) => value !== '');
    expect(shellValues).toEqual(live);
    const motionSelect = screen.getByRole('combobox', { name: 'Motion' });
    expect(motionSelect).toHaveProperty('disabled', true);
    expect(motionSelect).toHaveProperty('value', '');
    expect(motionSelect.querySelectorAll('option')).toHaveLength(4);
  });
});
