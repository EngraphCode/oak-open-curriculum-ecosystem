/**
 * The specimen's accessibility matrix (the review's highest finding made
 * mechanical): brand-swap redefines the tokens, so contrast is a
 * PER-IDENTITY property — an axe pass on the base identity proves nothing
 * about the counter-brands. Cells: identity × palette theme, forced-colors
 * per identity, and the SC 1.4.10 reflow floor per identity. Runs against
 * the BUILT artefact like the rest of the proof surface.
 *
 * First run of the matrix caught a real export defect: a bare text-node
 * separator inside the keywords <dl> (axe definition-list, serious) —
 * cured in the rebuild by moving the separator to CSS.
 */
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import {
  assertOnlyKnownExternalOrigins,
  expectNoAxeViolations,
  expectNoAxeViolationsForcedColors,
  IDENTITIES,
  interceptExternalOrigins,
  PALETTE_THEMES,
  type Identity,
  type ThemeName,
} from './apply-state';

/** Open the specimen at an identity, hermetically; brand applies
 *  server-side so navigation is the whole input. */
async function openSpecimen(page: Page, identity: Identity): Promise<Set<string>> {
  const aborted = await interceptExternalOrigins(page);
  await page.goto(`/identity-switchboard/specimen?brand=${identity}`);
  await expect(page.locator('[data-region="masthead"]')).toBeVisible();
  return aborted;
}

/** The specimen has no theme control — the theme lands as the attribute
 *  the kit's cascade keys on, then is asserted IN EFFECT via the
 *  document's computed color-scheme (mirroring applyTheme, minus the
 *  combobox). */
async function applySpecimenTheme(page: Page, theme: ThemeName): Promise<void> {
  await page.evaluate((value) => {
    document.documentElement.dataset['theme'] = value;
  }, theme);
  const colorScheme = await page.evaluate(
    () => getComputedStyle(document.documentElement).colorScheme,
  );
  expect(colorScheme.length).toBeGreaterThan(0);
}

test.describe('specimen: identity × theme matrix', () => {
  for (const identity of IDENTITIES) {
    for (const theme of PALETTE_THEMES) {
      test(`specimen ${identity} × ${theme} has no WCAG 2.2 AA violations @a11y`, async ({
        page,
      }) => {
        const aborted = await openSpecimen(page, identity);
        await applySpecimenTheme(page, theme);
        await expectNoAxeViolations(page);
        assertOnlyKnownExternalOrigins(aborted);
      });
    }
  }
});

test.describe('specimen: forced-colors', () => {
  for (const identity of IDENTITIES) {
    test(`specimen ${identity} stays renderable under forced-colors @a11y`, async ({ page }) => {
      await page.emulateMedia({ forcedColors: 'active' });
      const aborted = await openSpecimen(page, identity);
      await expect(page.getByRole('heading', { level: 1, name: 'The water cycle' })).toBeVisible();
      await expectNoAxeViolationsForcedColors(page);
      assertOnlyKnownExternalOrigins(aborted);
    });
  }
});

test.describe('specimen: reflow at 320px', () => {
  test.use({ viewport: { width: 320, height: 900 } });
  for (const identity of IDENTITIES) {
    test(`specimen ${identity} reflows to 320px without loss @a11y`, async ({ page }) => {
      const aborted = await openSpecimen(page, identity);
      const reflow = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
        // In-flow content only: the skip link sits off-canvas by design
        // until focused (its focus behaviour has its own cell), and
        // out-of-flow elements are not reflow loss.
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
      await expectNoAxeViolations(page);
      assertOnlyKnownExternalOrigins(aborted);
    });
  }
});
