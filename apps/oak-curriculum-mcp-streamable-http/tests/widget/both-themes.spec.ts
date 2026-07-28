/**
 * Playwright tests for the both-themes design-review page.
 *
 * The page renders the exact widget twice in same-origin iframes with
 * the theme FORCED per pane through the same channels a real MCP Apps
 * host drives (`data-theme` on the root; inline host style variables).
 * The assertions are therefore identical under the widget-light and
 * widget-dark Playwright projects — forcing beats the ambient colour
 * scheme, which is the page's entire point.
 */
import { expect, test } from '@playwright/test';

test.describe('Both-themes review page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/both-themes.html', { waitUntil: 'networkidle' });
  });

  test('renders the widget in both forced themes', async ({ page }) => {
    const light = page.frameLocator('iframe[data-theme="light"]');
    const dark = page.frameLocator('iframe[data-theme="dark"]');

    await expect(light.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(dark.locator('html')).toHaveAttribute('data-theme', 'dark');

    await expect(light.locator('.oak-app')).toBeVisible();
    await expect(dark.locator('.oak-app')).toBeVisible();
  });

  test('simulates the host chat surface around each pane', async ({ page }) => {
    const light = page.frameLocator('iframe[data-theme="light"]');
    const dark = page.frameLocator('iframe[data-theme="dark"]');

    // The host-variable channel reaches each widget document root.
    await expect(light.locator('html')).toHaveAttribute(
      'style',
      /--color-background-primary: ?#ffffff/u,
    );
    await expect(dark.locator('html')).toHaveAttribute(
      'style',
      /--color-background-primary: ?#262624/u,
    );
  });
});
