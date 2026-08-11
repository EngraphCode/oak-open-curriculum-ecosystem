/**
 * The behaviour half of the showcase's Playwright proof surface (see
 * showcase-a11y.spec.ts for the axe matrix, OS signals and reflow; both
 * run against the BUILT artefact via `pnpm start` — playwright.config.ts):
 * the region contract in effect and the switchboard driving the real
 * runtimes through the real controls.
 *
 * Hermetic by interception: every cross-origin request is aborted and the
 * aborted origins must stay within the declared third-party set (see
 * apply-state.ts for why absence of web fonts and icon masks does not
 * weaken the claims).
 */
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { IDENTITY_DEFAULT } from '@oaknational/oak-design-react';
import {
  applyIdentity,
  applyTheme,
  assertOnlyKnownExternalOrigins,
  measureSwitchboardGeometry,
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
    assertOnlyKnownExternalOrigins(aborted);
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
    assertOnlyKnownExternalOrigins(aborted);
  });
});

test.describe('theme switching', () => {
  test('a theme choice applies to the document and restyles the page', async ({ page }) => {
    const aborted = await openShowcase(page);
    const lightBackground = await bodyBackground(page);
    await applyTheme(page, 'dark');
    expect(await bodyBackground(page)).not.toBe(lightBackground);
    assertOnlyKnownExternalOrigins(aborted);
  });

  test('a theme choice survives reload through the pre-paint bootstrap', async ({ page }) => {
    const aborted = await openShowcase(page);
    await applyTheme(page, 'dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    assertOnlyKnownExternalOrigins(aborted);
  });
});

test.describe('theme no-choice state and motion axis', () => {
  test('no-choice reads Identity default under every identity, and an explicit choice bites', async ({
    page,
  }) => {
    const aborted = await openShowcase(page);
    const themeSelect = page.getByRole('combobox', { name: 'Theme' });
    // The control names the person's CHOICE (DDR-003 dated amendment
    // 2026-08-11): with none made it reads Identity default — honestly,
    // under every identity — and an explicit override is a real state
    // change, so the change event fires by construction. Explicit Light
    // on the dark-first arcade is the sharpest instance: the person
    // beats the brand's polarity lever at the cascade.
    await expect(themeSelect).toHaveValue(IDENTITY_DEFAULT);
    await applyIdentity(page, 'creature');
    await expect(themeSelect).toHaveValue(IDENTITY_DEFAULT);
    const arcadeDefaultBackground = await bodyBackground(page);
    await applyTheme(page, 'light');
    expect(await bodyBackground(page)).not.toBe(arcadeDefaultBackground);
    assertOnlyKnownExternalOrigins(aborted);
  });

  test('an OS contrast request themes the page without claiming a choice', async ({ page }) => {
    await page.emulateMedia({ contrast: 'more' });
    const aborted = await openShowcase(page);
    // The runtime's auto path applies high-contrast pre-paint…
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'high-contrast');
    // …while the control keeps naming the person's choice — none — as
    // Identity default (DDR-003 dated amendment 2026-08-11): the access
    // route themes the page without claiming a choice, and selecting
    // High contrast explicitly is then a real state change that fires.
    await expect(page.getByRole('combobox', { name: 'Theme' })).toHaveValue(IDENTITY_DEFAULT);
    assertOnlyKnownExternalOrigins(aborted);
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
    assertOnlyKnownExternalOrigins(aborted);
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
    assertOnlyKnownExternalOrigins(aborted);
  });

  test('the counter-brand defaults to its own dark face, and an explicit choice still wins', async ({
    page,
  }) => {
    // The identity speaks first when the person is silent (DDR-003 dated
    // amendment 2026-08-11): with no choice the arcade shows its DARK
    // native face — the restored polarity lever — even on a light-scheme
    // device (Playwright's default). Proven in rendered pixels against
    // the same page's explicit renders: the default face matches the
    // explicit Dark render, and explicit Light beats the lever.
    const aborted = await openShowcase(page);
    await applyIdentity(page, 'creature');
    const defaultFaceBackground = await bodyBackground(page);
    await applyTheme(page, 'dark');
    const explicitDarkBackground = await bodyBackground(page);
    await applyTheme(page, 'light');
    const explicitLightBackground = await bodyBackground(page);
    expect(defaultFaceBackground).toBe(explicitDarkBackground);
    expect(defaultFaceBackground).not.toBe(explicitLightBackground);
    assertOnlyKnownExternalOrigins(aborted);
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
    assertOnlyKnownExternalOrigins(aborted);
  });
});

test.describe('pre-hydration shell geometry', () => {
  // The claim under guard: hydration swaps state, never layout. The shell
  // (JS disabled = the server render, deterministically pre-hydration) must
  // occupy exactly the geometry the hydrated switchboard occupies. Widths:
  // 320 (the original wrap defect), 737/740 (the measured re-wrap band of
  // the reduced-option shell — a 74px masthead drop), 900 (single row).
  for (const width of [320, 737, 740, 900]) {
    test(`the server shell matches the hydrated geometry at ${width}px`, async ({ browser }) => {
      const shell = await measureSwitchboardGeometry(browser, width, false);
      const hydrated = await measureSwitchboardGeometry(browser, width, true);
      expect(shell).toEqual(hydrated);
    });
  }
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
    assertOnlyKnownExternalOrigins(aborted);
  });
});
