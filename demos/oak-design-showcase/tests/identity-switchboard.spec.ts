/**
 * The identity-switchboard pages' mechanism proofs.
 *
 * SPECIMEN — presentation is data, applied server-side. Navigation is the
 * only input: the probe goes to `?brand=` and asserts the brand is IN
 * EFFECT in computed style, never merely that a link exists (a link proves
 * the mechanism is wired; a computed value proves it fired). The sheet
 * rides the initial HTML, so there is no post-load application step for a
 * flash to hide in.
 *
 * PICKER — the transition is the hero, so the proof is that there is no
 * navigation to hide behind: a sentinel planted on the frame document's
 * root dataset before the swap must still be there after it (a reload
 * manufactures a FRESH document, so the sentinel's survival is document
 * identity itself), the frame's src must still name the MOUNT identity
 * (why the external link derives from control state, not the frame), and
 * the brand must be in effect inside the frame's own document.
 *
 * No identity slug is typed in this file: every name derives from the
 * imported roster, which keeps the identity-naming census untouched.
 */
import { expect, test } from '@playwright/test';
import type { Frame, Locator, Page } from '@playwright/test';

import { BASE_IDENTITY, IDENTITIES, type IdentitySlug } from '../components/useIdentity';
import { assertOnlyKnownExternalOrigins, interceptExternalOrigins } from './apply-state';

const COUNTER_BRANDS = IDENTITIES.filter((slug) => slug !== BASE_IDENTITY);

/** Computed face of the specimen's brand-name — the element every identity
 *  restyles. Polled by callers: the value, not the poll, is the claim. */
async function brandNameFont(target: Page | Frame): Promise<string> {
  return target.evaluate(() => {
    const name = document.querySelector('.brand-name');
    return name === null ? '' : getComputedStyle(name).fontFamily;
  });
}

/** The swapped brand is IN EFFECT inside the frame: the binder's link is
 *  present with the right href, and the computed face has moved off the
 *  base face. */
async function expectBrandInEffect(
  frame: Frame,
  identity: IdentitySlug,
  baseFont: string,
): Promise<void> {
  await expect(frame.locator(`link[data-oak-brand="${identity}"]`)).toHaveAttribute(
    'href',
    `/brands/${identity}/brand.css`,
  );
  await expect
    .poll(async () => brandNameFont(frame), {
      message: 'the swapped brand must reach computed style inside the frame',
    })
    .not.toBe(baseFont);
}

test.describe('specimen: identity is server-applied and in effect at first paint', () => {
  test('each counter-brand changes computed style relative to the base', async ({ page }) => {
    const aborted = await interceptExternalOrigins(page);
    await page.goto(`/identity-switchboard/specimen?brand=${BASE_IDENTITY}`);
    const baseFont = await brandNameFont(page);
    expect(baseFont).not.toBe('');

    for (const identity of COUNTER_BRANDS) {
      await page.goto(`/identity-switchboard/specimen?brand=${identity}`);
      await expect(page.locator('[data-identity]')).toHaveAttribute('data-identity', identity);
      // The brand sheet is in the initial HTML; "in effect" is a computed
      // value that differs from the base render, polled only because font
      // application is async even for a document-order sheet.
      await expect
        .poll(async () => brandNameFont(page), {
          message: `the ${identity} face must differ from the base face`,
        })
        .not.toBe(baseFont);
    }
    assertOnlyKnownExternalOrigins(aborted);
  });

  test('an unknown brand value narrows to the base identity', async ({ page }) => {
    await interceptExternalOrigins(page);
    await page.goto('/identity-switchboard/specimen?brand=not-a-brand');
    await expect(page.locator('[data-identity]')).toHaveAttribute('data-identity', BASE_IDENTITY);
    await expect(page.locator('link[data-oak-brand]')).toHaveCount(0);
  });
});

test.describe('specimen: keyboard and state semantics', () => {
  test('the skip link delivers focus to main', async ({ page }) => {
    await interceptExternalOrigins(page);
    await page.goto(`/identity-switchboard/specimen?brand=${BASE_IDENTITY}`);
    await page.keyboard.press('Tab');
    await expect(page.locator('.oak-skip-link')).toBeFocused();
    await page.keyboard.press('Enter');
    // Focus LANDS (tabIndex -1 on main), never merely scrolls.
    await expect(page.locator('#main')).toBeFocused();
  });

  test('the current audience is marked, and not by colour alone', async ({ page }) => {
    await interceptExternalOrigins(page);
    await page.goto(`/identity-switchboard/specimen?brand=${BASE_IDENTITY}`);
    const audience = page.locator('nav[aria-label="Audience"]');
    await expect(audience.locator('a[aria-current="true"]')).toHaveCount(1);
    // The non-colour marker: computed weight separates current from not —
    // a distinction forced-colors cannot erase.
    const weights = await audience.evaluate((nav) =>
      [...nav.querySelectorAll('a')].map((anchor) => getComputedStyle(anchor).fontWeight),
    );
    expect(new Set(weights).size).toBeGreaterThan(1);
  });
});

/** Open the picker hermetically and resolve its stage down to the framed
 *  specimen's live Frame, with the mount-time facts later assertions
 *  compare against. */
async function openPickerStage(page: Page): Promise<{
  readonly aborted: ReadonlySet<string>;
  readonly stage: Locator;
  readonly frame: Frame;
  readonly mountSrc: string;
  readonly baseFont: string;
} | null> {
  const aborted = await interceptExternalOrigins(page);
  await page.goto('/identity-switchboard');
  const stage = page.locator('iframe.picker-stage');
  const frame = await (await stage.elementHandle())?.contentFrame();
  expect(frame, 'the stage frame must resolve').not.toBeNull();
  if (frame === null || frame === undefined) {
    return null;
  }
  await expect(frame.locator('[data-region="masthead"]')).toBeVisible();
  return {
    aborted,
    stage,
    frame,
    mountSrc: (await stage.getAttribute('src')) ?? '',
    baseFont: await brandNameFont(frame),
  };
}

test.describe('picker: the swap is an in-place re-skin', () => {
  test('brand changes inside the frame with no navigation', async ({ page }) => {
    const opened = await openPickerStage(page);
    if (opened === null) {
      return;
    }
    const { aborted, stage, frame, mountSrc, baseFont } = opened;

    // The no-reload sentinel: a reload manufactures a fresh document, so a
    // dataset mark on the document root cannot survive one.
    await frame.evaluate(() => {
      document.documentElement.dataset['pickerSentinel'] = 'planted';
    });

    const firstCounterBrand = COUNTER_BRANDS[0];
    expect(firstCounterBrand, 'the roster must hold a counter-brand').toBeDefined();
    if (firstCounterBrand === undefined) {
      return;
    }
    await page.getByRole('combobox', { name: 'Identity' }).selectOption(firstCounterBrand);

    await expectBrandInEffect(frame, firstCounterBrand, baseFont);

    // No navigation happened: same document, same src, same mount identity.
    await expect
      .poll(async () => frame.evaluate(() => document.documentElement.dataset['pickerSentinel']))
      .toBe('planted');
    await expect(stage).toHaveAttribute('src', mountSrc);

    // The external link derives from CONTROL state — the frame's frozen src
    // would name the mount identity and send the viewer somewhere else.
    await expect(
      page.getByRole('link', { name: 'Open this identity as a full page' }),
    ).toHaveAttribute('href', `/identity-switchboard/specimen?brand=${firstCounterBrand}`);
    assertOnlyKnownExternalOrigins(aborted);
  });
});
