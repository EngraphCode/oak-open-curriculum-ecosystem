/**
 * The theme/motion controls contract (kit consuming-nextjs.md §4): with the
 * oak-theme runtime present the switcher offers every theme it exposes — all
 * five, because the access themes are not optional extras — through labelled
 * selects that write through to the runtime; without a runtime (the server
 * snapshot) it renders nothing, keeping server HTML theme-neutral.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import ThemeSwitcher from './ThemeSwitcher';

expect.extend(toHaveNoViolations);

// colour-contrast needs a canvas happy-dom does not provide; the per-theme
// contrast surface is computed against the kit's contrast manifest instead
// (the §7 audit-in-CI slice) — a documented scope bound, not a silent cap.
const axeOptions = { rules: { 'color-contrast': { enabled: false } } };

const THEMES = ['light', 'dark', 'system', 'high-contrast', 'colour-safe'];
const MODES = ['system', 'reduced', 'full'];

function stubOakTheme(): { set: ReturnType<typeof vi.fn>; motionSet: ReturnType<typeof vi.fn> } {
  let theme = 'light';
  let motion = 'system';
  const set = vi.fn((t: string) => {
    theme = t;
  });
  const motionSet = vi.fn((m: string) => {
    motion = m;
  });
  globalThis.window.oakTheme = {
    get: () => theme,
    set,
    themes: [...THEMES],
    motion: { get: () => motion, set: motionSet, modes: [...MODES] },
  };
  return { set, motionSet };
}

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    delete globalThis.window.oakTheme;
  });

  it('offers all five themes and all three motion modes through labelled selects', async () => {
    stubOakTheme();
    const { container } = render(<ThemeSwitcher />);
    const themeSelect = screen.getByLabelText('Theme');
    const motionSelect = screen.getByLabelText('Motion');
    const themeValues = Array.from(themeSelect.querySelectorAll('option')).map((o) => o.value);
    const motionValues = Array.from(motionSelect.querySelectorAll('option')).map((o) => o.value);
    expect(themeValues).toEqual(THEMES);
    expect(motionValues).toEqual(MODES);
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it('writes a theme choice through to the oak-theme runtime and reflects it', () => {
    const { set } = stubOakTheme();
    render(<ThemeSwitcher />);
    const themeSelect = screen.getByLabelText<HTMLSelectElement>('Theme');
    fireEvent.change(themeSelect, { target: { value: 'high-contrast' } });
    expect(set).toHaveBeenCalledWith('high-contrast');
    expect(themeSelect.value).toBe('high-contrast');
  });

  it('writes a motion choice through to the motion axis and reflects it', () => {
    const { motionSet } = stubOakTheme();
    render(<ThemeSwitcher />);
    const motionSelect = screen.getByLabelText<HTMLSelectElement>('Motion');
    fireEvent.change(motionSelect, { target: { value: 'reduced' } });
    expect(motionSet).toHaveBeenCalledWith('reduced');
    expect(motionSelect.value).toBe('reduced');
  });

  it('renders nothing when the oak-theme runtime is absent (theme-neutral HTML)', () => {
    const { container } = render(<ThemeSwitcher />);
    expect(container.innerHTML).toBe('');
  });
});
