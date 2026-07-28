import { expect, type Page } from '@playwright/test';

/** The four themes the design system ships, and the page must honour. */
export const THEMES = ['light', 'dark', 'high-contrast', 'colour-safe'] as const;

/** A theme name the design system actually ships — never a bare string. */
export type ThemeName = (typeof THEMES)[number];

/**
 * A theme-sensitive resolved colour: `--text-success` re-points in EVERY
 * non-light theme (dark and high-contrast flip it through `color-scheme`,
 * colour-safe re-points it to the Okabe–Ito blue), so its resolved value
 * discriminates each theme from the served light default.
 */
async function resolveThemeProbe(page: Page): Promise<string> {
  return page.evaluate(() => {
    const probe = document.createElement('div');
    probe.style.color = 'var(--text-success)';
    document.body.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  });
}

/**
 * Puts the page into a theme and returns once it is settled and verified.
 *
 * @remarks
 * Two traps here, both hit before this helper existed.
 *
 * Setting `data-theme` after load starts the design system's `background` and
 * `box-shadow` transitions, and anything measured before they settle is a frame
 * of an animation, not the served state — axe read one such frame as a 3.23:1
 * masthead failure, `#8f8f8f` being the midpoint between the light and dark
 * button fills, a colour neither theme contains. Emulating reduced motion
 * collapses the system's `--motion-*` tokens to 0.01ms, so there is no frame to
 * catch it in.
 *
 * Setting it from an init script instead does not work at all: that runs
 * against the initial empty document, and the server-rendered
 * `<html data-theme="light">` then parses over the top. Every theme silently
 * became light, and a whole matrix went green while testing one cell.
 *
 * Hence the assertions. A theme helper that fails to apply the theme must fail
 * loudly, or every test built on it is worthless and looks fine — and the
 * write-back check alone cannot do that (an unknown theme name still lands in
 * the attribute and resolves the light defaults), so the probe asserts a
 * RESOLVED colour actually changed. The type does the third job: a typo'd
 * theme name is a compile error, never eight green cells re-testing light.
 * Call this once per navigation — the entry state is the probe's baseline.
 */
export async function applyTheme(page: Page, theme: ThemeName): Promise<void> {
  const baseline = await resolveThemeProbe(page);

  await page.emulateMedia({
    colorScheme: theme === 'dark' ? 'dark' : 'light',
    reducedMotion: 'reduce',
  });
  await page.evaluate((chosen) => {
    document.documentElement.dataset['theme'] = chosen;
  }, theme);

  const applied = await page.evaluate(() => document.documentElement.dataset['theme'] ?? null);
  expect(applied, 'theme did not reach the document').toBe(theme);

  const probe = await resolveThemeProbe(page);
  expect(probe, `${theme} resolved no colour`).not.toBe('');
  if (theme === 'light') {
    // The served default IS light: applying it must be a visual no-op.
    expect(probe, 'light must match the served default').toBe(baseline);
  } else {
    // The theme must observably re-point resolved colour, or the matrix is
    // silently re-testing light N times.
    expect(probe, `${theme} did not change any resolved colour`).not.toBe(baseline);
  }
}
