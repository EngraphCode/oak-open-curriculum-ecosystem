/**
 * The accessibility half of the showcase's Playwright proof surface (see
 * showcase.spec.ts for the behaviour half; both run against the BUILT
 * artefact): axe WCAG 2.2 AA across the identity × theme matrix (system
 * cells under an emulated dark OS — under the default light emulation they
 * replay the light cells by construction), the OS accessibility signals,
 * keyboard focus visibility, and 320px reflow per identity.
 */
import { expect, test } from '@playwright/test';

import {
  applyIdentity,
  applyTheme,
  assertOnlyKnownExternalHosts,
  expectNoAxeViolations,
  IDENTITIES,
  openShowcase,
  PALETTE_THEMES,
} from './apply-state';

test.describe('OS accessibility signals', () => {
  test('prefers-contrast: more auto-selects the high-contrast theme @a11y', async ({ page }) => {
    await page.emulateMedia({ contrast: 'more' });
    const aborted = await openShowcase(page);
    // The kit's access commitment, end to end: no stored choice + an OS
    // contrast request = the high-contrast theme, applied pre-paint.
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'high-contrast');
    await expectNoAxeViolations(page);
    assertOnlyKnownExternalHosts(aborted);
  });

  test('forced-colors keeps the page renderable @a11y', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    const aborted = await openShowcase(page);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Oak Open Curriculum Design System' }),
    ).toBeVisible();
    await expectNoAxeViolations(page);
    assertOnlyKnownExternalHosts(aborted);
  });
});

test.describe('keyboard focus visibility', () => {
  test('the focus ring is visible on the switchboard in light and dark @a11y', async ({ page }) => {
    const aborted = await openShowcase(page);
    const activeElementShadow = async (): Promise<string | null> =>
      page.evaluate(() => {
        const active = document.activeElement;
        return active === null ? null : getComputedStyle(active).boxShadow;
      });
    // Sequential focus starts at the document on a fresh page, so the
    // first Tab lands on the first tabbable element: the identity select.
    await page.keyboard.press('Tab');
    await expect(page.locator('#oak-identity-select')).toBeFocused();
    expect(await activeElementShadow()).not.toBe('none');
    // Under the dark palette: Chromium's sequential-navigation point
    // survives interactions, so the next Tab lands on SOME switchboard
    // select — which one is navigation state, not the claim. The claim is
    // that wherever keyboard focus lands on the switchboard, its ring is
    // visible.
    await applyTheme(page, 'dark');
    await page.keyboard.press('Tab');
    const focusedId = await page.evaluate(() => document.activeElement?.id ?? '');
    expect(['oak-identity-select', 'oak-theme-select', 'oak-motion-select']).toContain(focusedId);
    expect(await activeElementShadow()).not.toBe('none');
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
          ...[...document.querySelectorAll('body *')].map(
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
