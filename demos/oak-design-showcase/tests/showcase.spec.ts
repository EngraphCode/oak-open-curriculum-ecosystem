/**
 * The behaviour half of the showcase's Playwright proof surface (see
 * showcase-a11y.spec.ts for the axe matrix, OS signals and reflow; both
 * run against the BUILT artefact via `pnpm start` — playwright.config.ts):
 * the region contract in effect and the switchboard driving the real
 * runtimes through the real controls.
 *
 * Hermetic by interception: every cross-origin request is aborted and the
 * aborted hosts must stay within the declared third-party set (see
 * apply-state.ts for why absence of web fonts and icon masks does not
 * weaken the claims).
 */
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import {
  applyIdentity,
  applyTheme,
  assertOnlyKnownExternalHosts,
  openShowcase,
} from './apply-state';

async function bodyBackground(page: Page): Promise<string> {
  return page.evaluate(() => getComputedStyle(document.body).backgroundColor);
}

async function headingFontFamily(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const heading = document.querySelector('h1');
    return heading === null ? null : getComputedStyle(heading).fontFamily;
  });
}

test.describe('showcase page structure', () => {
  test('serves the showcase under the region contract', async ({ page }) => {
    const aborted = await openShowcase(page);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Oak Open Curriculum Design System' }),
    ).toBeVisible();
    for (const region of ['utility', 'masthead', 'main', 'footer']) {
      await expect(page.locator(`.oak-canvas > [data-region="${region}"]`)).toBeVisible();
    }
    assertOnlyKnownExternalHosts(aborted);
  });

  test('applies the design-system stylesheets with the region map live', async ({ page }) => {
    const aborted = await openShowcase(page);
    const textPrimary = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
    );
    expect(textPrimary.trim()).not.toBe('');
    // The composition map in effect is what this slice adds: the main grid
    // must resolve named areas (never assert WHICH areas — that pins the map).
    const gridAreas = await page.evaluate(() => {
      const main = document.querySelector('main.oak-main');
      return main === null ? null : getComputedStyle(main).gridTemplateAreas;
    });
    expect(gridAreas).not.toBeNull();
    expect(gridAreas).not.toBe('none');
    assertOnlyKnownExternalHosts(aborted);
  });
});

test.describe('theme switching', () => {
  test('a theme choice applies to the document and restyles the page', async ({ page }) => {
    const aborted = await openShowcase(page);
    const lightBackground = await bodyBackground(page);
    await applyTheme(page, 'dark');
    expect(await bodyBackground(page)).not.toBe(lightBackground);
    assertOnlyKnownExternalHosts(aborted);
  });

  test('a theme choice survives reload through the pre-paint bootstrap', async ({ page }) => {
    const aborted = await openShowcase(page);
    await applyTheme(page, 'dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    assertOnlyKnownExternalHosts(aborted);
  });
});

test.describe('theme no-choice state and motion axis', () => {
  test('no-choice reads as Page default and the first Light choice bites', async ({ page }) => {
    const aborted = await openShowcase(page);
    const themeSelect = page.getByRole('combobox', { name: 'Theme' });
    // Six runtime states, not five: with nothing chosen the control must
    // not claim "Light" — under a dark-first brand that misreports the
    // page AND makes the first click on Light a dead control (a select
    // fires change only when its value actually changes).
    await expect(themeSelect).toHaveValue('');
    await applyIdentity(page, 'creature');
    await expect(themeSelect).toHaveValue('');
    const noChoiceBackground = await bodyBackground(page);
    await applyTheme(page, 'light');
    expect(await bodyBackground(page)).not.toBe(noChoiceBackground);
    assertOnlyKnownExternalHosts(aborted);
  });

  test('an OS contrast request themes the page without claiming a choice', async ({ page }) => {
    await page.emulateMedia({ contrast: 'more' });
    const aborted = await openShowcase(page);
    // The runtime's auto path applies high-contrast pre-paint…
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'high-contrast');
    // …but no explicit choice exists, so the control must read "Page
    // default" — a claimed value would also make selecting High contrast
    // a dead first click (no change event on an already-selected value).
    await expect(page.getByRole('combobox', { name: 'Theme' })).toHaveValue('');
    assertOnlyKnownExternalHosts(aborted);
  });

  test('a reduced-motion choice collapses the motion tokens', async ({ page }) => {
    const aborted = await openShowcase(page, { reducedMotion: false });
    const fullMotion = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--motion-quick'),
    );
    await page.getByRole('combobox', { name: 'Motion' }).selectOption('reduced');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
    const reducedMotion = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--motion-quick'),
    );
    expect(reducedMotion).not.toBe(fullMotion);
    assertOnlyKnownExternalHosts(aborted);
  });
});

test.describe('identity switching', () => {
  test('a counter-brand loads over the base and re-brands the page', async ({ page }) => {
    const aborted = await openShowcase(page);
    const oakHeadingFont = await headingFontFamily(page);
    expect(oakHeadingFont).not.toBeNull();
    await applyIdentity(page, 'freedonia');
    await applyIdentity(page, 'oak');
    expect(await headingFontFamily(page)).toBe(oakHeadingFont);
    assertOnlyKnownExternalHosts(aborted);
  });

  test('the dark-first counter-brand is dark with no theme chosen', async ({ page }) => {
    const aborted = await openShowcase(page);
    await applyIdentity(page, 'creature');
    // Captured BEFORE any theme interaction — the no-choice premise: the
    // brand's polarity lever applies because no explicit choice exists.
    const noChoiceBackground = await bodyBackground(page);
    await expect(page.locator('html')).not.toHaveAttribute('data-theme');
    await applyTheme(page, 'dark');
    const explicitDarkBackground = await bodyBackground(page);
    await applyTheme(page, 'light');
    const explicitLightBackground = await bodyBackground(page);
    expect(noChoiceBackground).toBe(explicitDarkBackground);
    expect(noChoiceBackground).not.toBe(explicitLightBackground);
    assertOnlyKnownExternalHosts(aborted);
  });
});

test.describe('counter-brand to counter-brand transition', () => {
  test('switching between counter-brands never shows the Oak base', async ({ page }) => {
    const aborted = await openShowcase(page);
    const oakHeadingFont = await headingFontFamily(page);
    expect(oakHeadingFont).not.toBeNull();
    await applyIdentity(page, 'freedonia');
    // Sample the heading face every frame across the transition: the
    // in-place href update must never let the page fall back to the Oak
    // base between two counter-brands. Sampler state rides data attributes
    // (test-only, removed with the page) so no page-context global exists.
    await page.evaluate(() => {
      const root = document.documentElement;
      root.dataset['headingFaces'] = '[]';
      delete root.dataset['headingFacesStop'];
      const sample = (): void => {
        if (root.dataset['headingFacesStop'] === 'yes') {
          return;
        }
        const heading = document.querySelector('h1');
        if (heading !== null) {
          const parsed: unknown = JSON.parse(root.dataset['headingFaces'] ?? '[]');
          if (Array.isArray(parsed)) {
            parsed.push(getComputedStyle(heading).fontFamily);
            root.dataset['headingFaces'] = JSON.stringify(parsed);
          }
        }
        requestAnimationFrame(sample);
      };
      sample();
    });
    await applyIdentity(page, 'creature');
    const sampledFaces = await page.evaluate(() => {
      const root = document.documentElement;
      root.dataset['headingFacesStop'] = 'yes';
      const parsed: unknown = JSON.parse(root.dataset['headingFaces'] ?? '[]');
      return Array.isArray(parsed)
        ? parsed.filter((face): face is string => typeof face === 'string')
        : [];
    });
    expect(sampledFaces.length).toBeGreaterThan(0);
    expect(sampledFaces).not.toContain(oakHeadingFont);
    assertOnlyKnownExternalHosts(aborted);
  });
});

test.describe('system theme follows the device', () => {
  test.use({ colorScheme: 'dark' });
  test('system matches the explicit dark palette under a dark OS, light under light', async ({
    page,
  }) => {
    const aborted = await openShowcase(page);
    await applyTheme(page, 'dark');
    const darkBackground = await bodyBackground(page);
    await applyTheme(page, 'system');
    expect(await bodyBackground(page)).toBe(darkBackground);
    await page.emulateMedia({ colorScheme: 'light' });
    await expect.poll(async () => bodyBackground(page)).not.toBe(darkBackground);
    assertOnlyKnownExternalHosts(aborted);
  });
});
