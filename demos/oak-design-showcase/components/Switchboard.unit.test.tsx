import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createOakThemeStore } from '@oaknational/oak-design-react';
import type { OakMotionMode, OakThemeName, OakThemeRuntime } from '@oaknational/oak-design-react';
import Switchboard from './Switchboard';

function fakeRuntimeWorld(): {
  runtime: OakThemeRuntime;
  appliedTheme: () => string | undefined;
} {
  let applied: OakThemeName | undefined;
  let motion: OakMotionMode = 'system';
  const runtime: OakThemeRuntime = {
    get: () => applied ?? 'system',
    set: (t: OakThemeName) => {
      applied = t;
    },
    // Mirrors the real runtime: a set() through this session IS the choice.
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
    // Five themes, no placeholder: the live control displays the APPLIED
    // model, which is the system default when nothing is chosen (owner
    // ruling 2026-08-10 — there is no page-default state).
    const themeSelect = screen.getByRole('combobox', { name: 'Theme' });
    expect(themeSelect.querySelectorAll('option')).toHaveLength(5);
    expect(themeSelect).toHaveProperty('value', 'system');
  });
});

describe('Switchboard write-through and degradation', () => {
  it('writes a theme choice through to the runtime, including from no-choice', () => {
    const world = fakeRuntimeWorld();
    render(<Switchboard store={createOakThemeStore(() => world.runtime)} />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Theme' }), {
      target: { value: 'high-contrast' },
    });
    expect(world.appliedTheme()).toBe('high-contrast');
  });

  it('renders theme and motion as disabled no-knowledge placeholders with no runtime', () => {
    render(<Switchboard store={createOakThemeStore(() => undefined)} />);
    expect(screen.queryByRole('combobox', { name: 'Identity' })).not.toBeNull();
    // The placeholders are disabled (honestly not yet interactive), read
    // the no-knowledge sentinel on both axes, and carry the SAME option
    // lists as the live controls — a select sizes to its widest option, so
    // option parity is the geometry contract (the rendered-geometry claim
    // itself is pinned by the guard in tests/showcase.spec.ts).
    const themeSelect = screen.getByRole('combobox', { name: 'Theme' });
    expect(themeSelect).toHaveProperty('disabled', true);
    expect(themeSelect).toHaveProperty('value', '');
    expect(themeSelect.querySelectorAll('option')).toHaveLength(6);
    const motionSelect = screen.getByRole('combobox', { name: 'Motion' });
    expect(motionSelect).toHaveProperty('disabled', true);
    expect(motionSelect).toHaveProperty('value', '');
    expect(motionSelect.querySelectorAll('option')).toHaveLength(4);
  });
});
