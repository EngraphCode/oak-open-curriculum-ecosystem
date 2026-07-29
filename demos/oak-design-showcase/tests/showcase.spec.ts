/**
 * Playwright tests for the design-showcase placeholder page, run against
 * the BUILT artefact (`pnpm start` — see playwright.config.ts). The full
 * showcase assertions (switchers, the identity × theme matrix in the a11y
 * suite) arrive with the page slice. An "a11y" title tag lets `test:a11y`
 * run the accessibility checks independently by grep (estate idiom).
 */
import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('design-showcase placeholder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('serves the design-system showcase page', async ({ page }) => {
    await expect(
      page.getByRole('heading', { level: 1, name: 'Oak Open Curriculum Design System' }),
    ).toBeVisible();
  });

  test('applies the design-system stylesheets to the served page', async ({ page }) => {
    // colors_and_type.css declares --text-primary; components.css bounds
    // .oak-container. Both must survive the Next build to reach the page.
    const textPrimary = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
    );
    expect(textPrimary.trim()).not.toBe('');

    const containerMaxWidth = await page.evaluate(() => {
      const main = document.querySelector('main.oak-container');
      return main === null ? null : getComputedStyle(main).maxWidth;
    });
    expect(containerMaxWidth).not.toBeNull();
    // Never assert the px value — that pins --container-max configuration.
    expect(containerMaxWidth).not.toBe('none');
  });

  test('page has no WCAG 2.2 AA violations @a11y', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
