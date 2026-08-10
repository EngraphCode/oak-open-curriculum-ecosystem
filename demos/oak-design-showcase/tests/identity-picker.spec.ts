/**
 * The picker's mechanism proofs. The transition is the hero, so the proof
 * is that there is no navigation to hide behind: a sentinel planted on the
 * frame document's root dataset before a swap must still be there after it
 * (a reload manufactures a FRESH document, so the sentinel's survival is
 * document identity itself), the frame's src must still name the MOUNT
 * identity (why the external link derives from control state, not the
 * frame), and each control's choice must be IN EFFECT inside the frame's
 * own document — computed style for identity, computed color-scheme for
 * theme, the frame's own innerWidth for width.
 *
 * No identity slug is typed in this file: every name derives from the
 * imported roster, which keeps the identity-naming census untouched.
 */
import { expect, test } from '@playwright/test';
import type { Frame, Locator, Page } from '@playwright/test';

import { SWITCHBOARD_CANVAS_WIDTH } from '../components/canonical-widths';
import { BASE_IDENTITY, IDENTITIES, type IdentitySlug } from '../components/useIdentity';
import { MEASUREMENT_WIDTH_VALUES } from '../tools/measurement-widths';
import {
  assertOnlyKnownExternalOrigins,
  brandNameFont,
  interceptExternalOrigins,
} from './apply-state';

const COUNTER_BRANDS = IDENTITIES.filter((slug) => slug !== BASE_IDENTITY);

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

/** Open the picker hermetically and resolve its stage down to the framed
 *  specimen's live Frame, with the mount-time facts later assertions
 *  compare against. The no-reload sentinel is planted here: a reload
 *  manufactures a fresh document, so a dataset mark on the document root
 *  cannot survive one. */
async function openPickerStage(page: Page): Promise<{
  readonly aborted: ReadonlySet<string>;
  readonly stage: Locator;
  readonly frame: Frame;
  readonly mountSrc: string;
  readonly baseFont: string;
} | null> {
  const aborted = await interceptExternalOrigins(page);
  await page.goto('/identity-switchboard');
  const stage = page.locator('.picker-stage iframe');
  const frame = await (await stage.elementHandle())?.contentFrame();
  expect(frame, 'the stage frame must resolve').not.toBeNull();
  if (frame === null || frame === undefined) {
    return null;
  }
  await expect(frame.locator('[data-region="masthead"]')).toBeVisible();
  await frame.evaluate(() => {
    document.documentElement.dataset['pickerSentinel'] = 'planted';
  });
  return {
    aborted,
    stage,
    frame,
    mountSrc: (await stage.getAttribute('src')) ?? '',
    baseFont: await brandNameFont(frame),
  };
}

/** No navigation happened since the sentinel was planted: same document,
 *  same frozen mount src. */
async function expectSameDocument(frame: Frame, stage: Locator, mountSrc: string): Promise<void> {
  await expect
    .poll(async () => frame.evaluate(() => document.documentElement.dataset['pickerSentinel']))
    .toBe('planted');
  await expect(stage).toHaveAttribute('src', mountSrc);
}

/** The chosen theme is IN EFFECT inside the frame: the framed document's
 *  computed color-scheme resolves to it, not merely the attribute string. */
async function chooseThemeAndExpectInEffect(
  page: Page,
  frame: Frame,
  theme: string,
): Promise<void> {
  await page.getByRole('combobox', { name: 'Theme' }).selectOption(theme);
  await expect
    .poll(
      async () => frame.evaluate(() => getComputedStyle(document.documentElement).colorScheme),
      {
        message: 'the chosen theme must reach the framed cascade',
      },
    )
    .toBe(theme);
}

/** The chosen canonical width IS the frame's own viewport — innerWidth, so
 *  the media queries inside respond to the simulated width truthfully. */
async function chooseWidthAndExpectInEffect(
  page: Page,
  frame: Frame,
  width: number,
): Promise<void> {
  await page.getByRole('combobox', { name: 'Width' }).selectOption(`${width}`);
  await expect
    .poll(async () => frame.evaluate(() => window.innerWidth), {
      message: 'the simulated viewport must adopt the chosen canonical width',
    })
    .toBe(width);
}

/** The controls open on the ruled defaults: the system theme (people, not
 *  pages, own the colour scheme) and the export switchboard's own framed
 *  canvas, so the two demos read identically side by side. */
async function expectRuledDefaults(page: Page): Promise<void> {
  await expect(page.getByRole('combobox', { name: 'Theme' })).toHaveValue('system');
  await expect(page.getByRole('combobox', { name: 'Width' })).toHaveValue(
    `${SWITCHBOARD_CANVAS_WIDTH}`,
  );
}

test.describe('picker: every control is an in-place change', () => {
  test('brand changes inside the frame with no navigation', async ({ page }) => {
    const opened = await openPickerStage(page);
    if (opened === null) {
      return;
    }
    const { aborted, stage, frame, mountSrc, baseFont } = opened;

    const firstCounterBrand = COUNTER_BRANDS[0];
    expect(firstCounterBrand, 'the roster must hold a counter-brand').toBeDefined();
    if (firstCounterBrand === undefined) {
      return;
    }
    await page.getByRole('combobox', { name: 'Identity' }).selectOption(firstCounterBrand);

    await expectBrandInEffect(frame, firstCounterBrand, baseFont);
    await expectSameDocument(frame, stage, mountSrc);

    // The external link derives from CONTROL state — the frame's frozen src
    // would name the mount identity and send the viewer somewhere else.
    await expect(
      page.getByRole('link', { name: 'Open this identity as a full page' }),
    ).toHaveAttribute('href', `/identity-switchboard/specimen?brand=${firstCounterBrand}`);
    assertOnlyKnownExternalOrigins(aborted);
  });

  test('theme and width land in effect inside the same document', async ({ page }) => {
    const opened = await openPickerStage(page);
    if (opened === null) {
      return;
    }
    const { aborted, stage, frame, mountSrc } = opened;

    await expectRuledDefaults(page);

    await chooseThemeAndExpectInEffect(page, frame, 'dark');

    const narrowest = MEASUREMENT_WIDTH_VALUES[0];
    expect(narrowest, 'the canonical set must be non-empty').toBeDefined();
    if (narrowest === undefined) {
      return;
    }
    await chooseWidthAndExpectInEffect(page, frame, narrowest);

    await expectSameDocument(frame, stage, mountSrc);
    assertOnlyKnownExternalOrigins(aborted);
  });
});
