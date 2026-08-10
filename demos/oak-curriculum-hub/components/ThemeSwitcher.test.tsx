/**
 * The theme/motion controls contract (kit consuming-nextjs.md §4): with the
 * oak-theme runtime present the switcher offers every theme it exposes — all
 * five, because the access themes are not optional extras — through labelled
 * selects that write through to the runtime; without a runtime (the server
 * snapshot) it renders nothing, keeping server HTML theme-neutral.
 *
 * The runtime is a simple fake injected through the store factory
 * (no-global-state-in-tests / ADR-078) — nothing here touches `window`.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';

import { createOakThemeStore } from '@oaknational/oak-design-react';
import type { OakMotionMode, OakThemeName, OakThemeRuntime } from '@oaknational/oak-design-react';

import ThemeSwitcher from './ThemeSwitcher';

expect.extend(toHaveNoViolations);

// colour-contrast needs a canvas happy-dom does not provide; the per-theme
// contrast surface is computed against the kit's contrast manifest instead
// (the PR3 token-level gate + the §7 audit-in-CI slice) — a documented scope
// bound, not a silent cap.
const axeOptions = { rules: { 'color-contrast': { enabled: false } } };

const THEMES: OakThemeName[] = ['system', 'light', 'dark', 'high-contrast', 'colour-safe'];
const MODES: OakMotionMode[] = ['system', 'reduced', 'full'];

function fakeRuntime(): {
  runtime: OakThemeRuntime;
  set: ReturnType<typeof vi.fn>;
  motionSet: ReturnType<typeof vi.fn>;
} {
  // Mirrors the real runtime's contract: set() records the in-memory
  // current choice, which choice() reports; with no set() there is no
  // explicit choice and choice() is null while get() collapses to the
  // system default (the applied model).
  let current: OakThemeName | null = null;
  let motion: OakMotionMode = 'system';
  const set = vi.fn((t: OakThemeName) => {
    current = t;
  });
  const motionSet = vi.fn((m: OakMotionMode) => {
    motion = m;
  });
  const runtime: OakThemeRuntime = {
    get: () => current ?? 'system',
    set,
    choice: () => current,
    themes: [...THEMES],
    motion: { get: () => motion, set: motionSet, modes: [...MODES] },
  };
  return { runtime, set, motionSet };
}

/** A store over the injected fake runtime — the ADR-078 seam. */
function storeWith(runtime: OakThemeRuntime | undefined) {
  return createOakThemeStore(() => runtime);
}

describe('ThemeSwitcher rendering contract', () => {
  it('offers all five themes and all three motion modes through labelled selects', async () => {
    const { runtime } = fakeRuntime();
    const store = storeWith(runtime);
    const { container } = render(<ThemeSwitcher store={store} />);
    const themeSelect = screen.getByLabelText('Theme');
    const motionSelect = screen.getByLabelText('Motion');
    const themeValues = Array.from(themeSelect.querySelectorAll('option')).map((o) => o.value);
    const motionValues = Array.from(motionSelect.querySelectorAll('option')).map((o) => o.value);
    // Five themes plus the non-choosable "Page default" placeholder ('') —
    // the truthful rendering of the no-choice snapshot. Motion has no
    // placeholder: 'system' is its concrete no-choice semantic.
    expect(themeValues).toEqual([...THEMES]);
    expect(motionValues).toEqual(MODES);
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it('renders nothing when the oak-theme runtime is absent (theme-neutral HTML)', () => {
    const store = storeWith(undefined);
    const { container } = render(<ThemeSwitcher store={store} />);
    expect(container.innerHTML).toBe('');
  });

  it('reads the applied system default with no explicit choice', () => {
    // The applied model (owner ruling 2026-08-10): with no explicit user
    // choice the control truthfully reads what is applied — the system
    // default — never a page-default sentinel and never a blank control
    // (a controlled select with no matching option).
    const { runtime } = fakeRuntime();
    const store = storeWith(runtime);
    render(<ThemeSwitcher store={store} />);
    const themeSelect = screen.getByLabelText<HTMLSelectElement>('Theme');
    expect(themeSelect.value).toBe('system');
    expect(Array.from(themeSelect.querySelectorAll('option')).every((o) => o.value !== '')).toBe(
      true,
    );
  });
});

describe('ThemeSwitcher write-through contract', () => {
  it('writes a theme choice through to the oak-theme runtime and reflects it', () => {
    const { runtime, set } = fakeRuntime();
    const store = storeWith(runtime);
    render(<ThemeSwitcher store={store} />);
    const themeSelect = screen.getByLabelText<HTMLSelectElement>('Theme');
    fireEvent.change(themeSelect, { target: { value: 'high-contrast' } });
    expect(set).toHaveBeenCalledWith('high-contrast');
    expect(themeSelect.value).toBe('high-contrast');
  });

  it('writes a motion choice through to the motion axis and reflects it', () => {
    const { runtime, motionSet } = fakeRuntime();
    const store = storeWith(runtime);
    render(<ThemeSwitcher store={store} />);
    const motionSelect = screen.getByLabelText<HTMLSelectElement>('Motion');
    fireEvent.change(motionSelect, { target: { value: 'reduced' } });
    expect(motionSet).toHaveBeenCalledWith('reduced');
    expect(motionSelect.value).toBe('reduced');
  });
});
