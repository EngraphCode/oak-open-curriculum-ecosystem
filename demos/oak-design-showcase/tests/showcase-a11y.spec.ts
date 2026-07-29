/**
 * The accessibility half of the showcase's Playwright proof surface (see
 * showcase.spec.ts for the behaviour half; both run against the BUILT
 * artefact): axe WCAG 2.2 AA across the identity × theme matrix (system
 * cells under an emulated dark OS — under the default light emulation they
 * replay the light cells by construction), the OS accessibility signals,
 * keyboard focus visibility, and 320px reflow per identity.
 */
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

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

type Rgba = readonly [number, number, number, number];

function parseColour(c: string): Rgba | null {
  const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(c);
  return m === null
    ? null
    : [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])];
}

function luminance(c: Rgba): number {
  const [r, g, b] = [c[0], c[1], c[2]].map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

function contrastRatio(a: Rgba, b: Rgba): number {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Split a computed box-shadow list at top-level commas only — colour
 *  functions carry commas inside their parens. */
function splitShadowLayers(shadow: string): readonly string[] {
  const layers: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < shadow.length; i += 1) {
    if (shadow[i] === '(') {
      depth += 1;
    } else if (shadow[i] === ')') {
      depth -= 1;
    } else if (shadow[i] === ',' && depth === 0) {
      layers.push(shadow.slice(start, i));
      start = i + 1;
    }
  }
  layers.push(shadow.slice(start));
  return layers;
}

/** Best contrast of any geometry-bearing, non-transparent shadow layer
 *  against the surface colour. Zero when no layer qualifies. */
function bestRingContrast(shadow: string, surface: Rgba): number {
  let best = 0;
  for (const layer of splitShadowLayers(shadow)) {
    const geometry = [...layer.matchAll(/(-?\d*\.?\d+)px/g)].map((m) => Number(m[1]));
    const colour = parseColour(layer);
    if (geometry.some((n) => n !== 0) && colour !== null && colour[3] > 0) {
      best = Math.max(best, contrastRatio(colour, surface));
    }
  }
  return best;
}

/** SC 1.4.11 evidence for the focused element's ring: the best contrast
 *  ratio between any shadow layer that has real geometry and a non-zero
 *  colour, and the nearest non-transparent ancestor surface. A `none`
 *  shadow, a transparent layer, or a zero-geometry layer scores 0 — the
 *  weak `!== 'none'` assertion this replaces passed all three (PR #637
 *  review), including a hand-measured 1.12:1 ring. */
async function focusRingContrast(page: Page): Promise<number> {
  const evidence = await page.evaluate(() => {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement)) {
      return null;
    }
    let surface: string | null = null;
    for (let el = active.parentElement; el !== null; el = el.parentElement) {
      const bg = getComputedStyle(el).backgroundColor;
      // Chromium serialises fully-transparent as exactly this string.
      if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        surface = bg;
        break;
      }
    }
    return { shadow: getComputedStyle(active).boxShadow, surface };
  });
  if (evidence === null || evidence.shadow === 'none' || evidence.surface === null) {
    return 0;
  }
  const surface = parseColour(evidence.surface);
  return surface === null ? 0 : bestRingContrast(evidence.shadow, surface);
}

test.describe('keyboard focus visibility', () => {
  test('the focus ring holds 3:1 on the switchboard in light and dark @a11y', async ({ page }) => {
    const aborted = await openShowcase(page);
    // Sequential focus starts at the document on a fresh page, so the
    // first Tab lands on the first tabbable element: the identity select.
    await page.keyboard.press('Tab');
    await expect(page.locator('#oak-identity-select')).toBeFocused();
    // Poll, never a one-shot read: the :focus-visible ring's application
    // can lag the focus event by a frame (the ring's base state is a
    // transparent two-layer shadow, so an early read scores 0). The claim
    // is the steady-state ring.
    await expect.poll(async () => focusRingContrast(page)).toBeGreaterThanOrEqual(3);
    // Under the dark palette: Chromium's sequential-navigation point
    // survives interactions, so the next Tab lands on SOME switchboard
    // select — which one is navigation state, not the claim. The claim is
    // that wherever keyboard focus lands on the switchboard, its ring
    // holds SC 1.4.11 contrast against the surface it renders on.
    await applyTheme(page, 'dark');
    await page.keyboard.press('Tab');
    const focusedId = await page.evaluate(() => document.activeElement?.id ?? '');
    expect(['oak-identity-select', 'oak-theme-select', 'oak-motion-select']).toContain(focusedId);
    await expect.poll(async () => focusRingContrast(page)).toBeGreaterThanOrEqual(3);
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
