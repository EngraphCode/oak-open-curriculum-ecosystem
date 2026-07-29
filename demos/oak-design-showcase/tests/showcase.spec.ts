/**
 * Playwright suite for the showcase page, run against the BUILT artefact
 * (`pnpm start` — see playwright.config.ts). Proves the served page: the
 * region contract in effect, the switchboard driving the real runtime, and
 * axe WCAG 2.2 AA across the identity × theme matrix (system cells under an
 * emulated dark OS — under the default light emulation they replay the
 * light cells by construction). An "a11y" title tag lets `test:a11y` run
 * the accessibility checks by grep (estate idiom).
 *
 * Hermetic by interception: every cross-origin request is aborted and the
 * aborted hosts must stay within the declared third-party set (see
 * apply-state.ts for why absence of web fonts and icon masks does not
 * weaken the a11y claim).
 */
import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import {
  applyIdentity,
  applyTheme,
  assertOnlyKnownExternalHosts,
  IDENTITIES,
  openShowcase,
} from './apply-state';

const PALETTE_THEMES = ['light', 'dark', 'high-contrast', 'colour-safe'] as const;

async function expectNoAxeViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
}

async function bodyBackground(page: Page): Promise<string> {
  return page.evaluate(() => getComputedStyle(document.body).backgroundColor);
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
    const headingFont = async (): Promise<string | null> =>
      page.evaluate(() => {
        const heading = document.querySelector('h1');
        return heading === null ? null : getComputedStyle(heading).fontFamily;
      });
    const oakHeadingFont = await headingFont();
    expect(oakHeadingFont).not.toBeNull();
    await applyIdentity(page, 'freedonia');
    await applyIdentity(page, 'oak');
    expect(await headingFont()).toBe(oakHeadingFont);
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

test.describe('identity × theme matrix', () => {
  for (const identity of IDENTITIES) {
    for (const theme of PALETTE_THEMES) {
      test(`${identity} × ${theme} has no WCAG 2.2 AA violations @a11y`, async ({ page }) => {
        const aborted = await openShowcase(page);
        await applyIdentity(page, identity);
        await applyTheme(page, theme);
        await expectNoAxeViolations(page);
        assertOnlyKnownExternalHosts(aborted);
      });
    }
  }
});

test.describe('identity × system theme (dark OS)', () => {
  test.use({ colorScheme: 'dark' });
  for (const identity of IDENTITIES) {
    test(`${identity} × system has no WCAG 2.2 AA violations @a11y`, async ({ page }) => {
      const aborted = await openShowcase(page);
      await applyIdentity(page, identity);
      await applyTheme(page, 'system');
      await expectNoAxeViolations(page);
      assertOnlyKnownExternalHosts(aborted);
    });
  }
});

test.describe('reflow at 320px', () => {
  test.use({ viewport: { width: 320, height: 900 } });
  for (const identity of IDENTITIES) {
    test(`${identity} reflows to 320px without loss @a11y`, async ({ page }) => {
      const aborted = await openShowcase(page);
      await applyIdentity(page, identity);
      // SC 1.4.10 Reflow — axe ships no rule for it (MCP landing-page
      // precedent). Content pushed left of the origin is unreachable in
      // LTR, so negative offsets are content loss even when scrollWidth
      // stays clean.
      const reflow = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
        minLeft: Math.min(
          0,
          ...[...document.querySelectorAll('main *')].map(
            (element) => element.getBoundingClientRect().left,
          ),
        ),
      }));
      expect(reflow.scrollW, 'SC 1.4.10: horizontal scroll must not appear').toBeLessThanOrEqual(
        reflow.clientW,
      );
      expect(reflow.minLeft, 'content pushed left of the origin is unreachable').toBe(0);
      await expectNoAxeViolations(page);
      assertOnlyKnownExternalHosts(aborted);
    });
  }
});
