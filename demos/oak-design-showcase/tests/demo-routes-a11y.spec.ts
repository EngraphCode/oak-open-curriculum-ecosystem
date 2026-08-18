/**
 * The demo-day routes' accessibility cells (review round 1, #907: the axe
 * matrix did not exercise the composition, token-reference, or
 * colour-matrix routes, so their regressions could ride a green build).
 * Same discipline as the specimen matrix: axe against the BUILT artefact,
 * the SC 1.4.10 reflow floor at 320px, and — for the composition exhibit —
 * proof that each layout map carries a NARROW face (below the kit's 840px
 * seam a map without narrow faces silently collapses to the canonical
 * stack and the layout control goes dead).
 */
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { assertOnlyKnownExternalOrigins, interceptExternalOrigins } from './apply-state';
import { expectNoAxeViolations } from './axe-checks';

const ROUTES = ['/tokens', '/tokens/colours', '/composition'] as const;

async function openRoute(page: Page, route: string): Promise<Set<string>> {
  const aborted = await interceptExternalOrigins(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(route);
  await expect(page.locator('main').first()).toBeVisible();
  return aborted;
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const reflow = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    // In-flow content only, as the sibling suites probe it: out-of-flow
    // elements (the skip link off-canvas by design) are not reflow loss.
    minLeft: Math.min(
      0,
      ...[...document.querySelectorAll('body *')]
        .filter((element) => {
          const position = getComputedStyle(element).position;
          return position === 'static' || position === 'relative';
        })
        .map((element) => element.getBoundingClientRect().left),
    ),
  }));
  expect(reflow.scrollW, 'SC 1.4.10: horizontal scroll must not appear').toBeLessThanOrEqual(
    reflow.clientW,
  );
  expect(reflow.minLeft, 'content pushed left of the origin is unreachable').toBe(0);
}

test.describe('demo routes: axe', () => {
  for (const route of ROUTES) {
    for (const theme of ['light', 'dark'] as const) {
      test(`${route} × ${theme} has no WCAG 2.2 AA violations @a11y`, async ({ page }) => {
        const aborted = await openRoute(page, route);
        await page.evaluate((value) => {
          document.documentElement.dataset['theme'] = value;
        }, theme);
        await expectNoAxeViolations(page);
        assertOnlyKnownExternalOrigins(aborted);
      });
    }
  }
});

test.describe('demo routes: reflow at 320px', () => {
  test.use({ viewport: { width: 320, height: 900 } });
  for (const route of ROUTES) {
    test(`${route} reflows to 320px without loss @a11y`, async ({ page }) => {
      const aborted = await openRoute(page, route);
      await expectNoHorizontalOverflow(page);
      await expectNoAxeViolations(page);
      assertOnlyKnownExternalOrigins(aborted);
    });
  }
});

test.describe('composition exhibit: every layout, both grounds', () => {
  for (const layout of ['document', 'magazine', 'dashboard', 'inverted'] as const) {
    for (const theme of ['light', 'dark'] as const) {
      test(`frame ${layout} × ${theme} has no WCAG 2.2 AA violations @a11y`, async ({ page }) => {
        const aborted = await openRoute(page, `/composition/frame?layout=${layout}&theme=${theme}`);
        await expectNoAxeViolations(page);
        assertOnlyKnownExternalOrigins(aborted);
      });
    }
  }
});

test.describe('composition exhibit: narrow faces re-arrange', () => {
  test.use({ viewport: { width: 320, height: 900 } });
  for (const layout of ['document', 'magazine', 'dashboard', 'inverted'] as const) {
    test(`frame ${layout} reflows to 320px without loss @a11y`, async ({ page }) => {
      const aborted = await openRoute(page, `/composition/frame?layout=${layout}`);
      await expectNoHorizontalOverflow(page);
      assertOnlyKnownExternalOrigins(aborted);
    });
  }

  test('inverted leads with the cta at 320px while document leads with the hero @a11y', async ({
    page,
  }) => {
    const topOf = async (region: string): Promise<number> =>
      page.locator(`[data-region='${region}']`).evaluate((el) => el.getBoundingClientRect().top);
    const aborted = await openRoute(page, '/composition/frame?layout=document');
    expect(await topOf('hero')).toBeLessThan(await topOf('cta'));
    await page.goto('/composition/frame?layout=inverted');
    await expect(page.locator('main').first()).toBeVisible();
    expect(await topOf('cta')).toBeLessThan(await topOf('hero'));
    assertOnlyKnownExternalOrigins(aborted);
  });
});
