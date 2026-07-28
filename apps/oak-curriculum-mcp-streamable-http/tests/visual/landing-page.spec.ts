/**
 * Playwright tests for the MCP server landing page.
 *
 * Tests verify content rendering and WCAG accessibility compliance.
 * Focuses on structural assertions (sections present) rather than content.
 *
 * @remarks
 * These specs type-check under `tests/tsconfig.json`, not the app project. A
 * Playwright spec is genuinely two execution contexts — the test body runs in
 * Node, the `page.evaluate` callbacks run in the browser — so it needs the DOM
 * lib, and this app is a Node server whose own source must never be able to
 * reach for `document`. Same separation the widget already has.
 */

import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { applyTheme, THEMES } from './apply-theme.js';

test.describe('Landing page', () => {
  test('renders main heading and config snippet', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Verify main heading contains Oak
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/Oak/i);

    // Verify config snippet is present
    await expect(page.getByText(/"mcpServers"/)).toBeVisible();
  });

  test('displays hero explainer text', async ({ page }) => {
    await page.goto('/');

    // The hero band carries an explainer paragraph alongside the title.
    // Located by region and position rather than by a styling class, so the
    // test describes what a visitor sees rather than how it is dressed.
    const hero = page.locator("[data-region='hero'] p").first();
    await expect(hero).toBeVisible();
    await expect(hero).toContainText(/teachers/i);
  });

  test('has collapsible sections for Resources and Tools — and no Prompts section', async ({
    page,
  }) => {
    await page.goto('/');

    // Each section has a summary element containing an h2 with the section name and count
    // e.g. "Resources (3)", "Tools (26)". The app serves zero MCP prompts
    // (decisions register D11), so no Prompts section exists to advertise.
    await expect(page.locator('summary h2', { hasText: /Resources \(\d+\)/ })).toBeVisible();
    await expect(page.locator('summary h2', { hasText: /Tools \(\d+\)/ })).toBeVisible();
    await expect(page.locator('summary h2', { hasText: /Prompts \(\d+\)/ })).toHaveCount(0);
  });

  // Tagged so the dedicated `test:a11y` gate can run browser accessibility
  // assertions separately from the broader UI suite.
  //
  // The matrix is deliberate. A single run at the default viewport, in light,
  // with both accordions shut was green while the page held a Level A failure:
  // the config snippet is only a scroll container below ~500px, and with the
  // accordions closed axe never sees the ~78 tool disclosures that make up most
  // of the DOM. Each axis below is one an audit found the gate blind to.
  //
  // Forward coverage, honestly named: this landing ships data-theme="light"
  // with no control, so the dark / high-contrast / colour-safe cells describe
  // states no visitor can reach until the stack's theme-control landing makes
  // them reachable — they run now so that landing cannot regress them.
  const A11Y_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

  // axe `incomplete` results are unreviewed potential violations — swallowed,
  // they read as green. Each allowlisted entry is a first-hand-cleared axe
  // limitation, keyed by rule and target.
  const CLEARED_INCOMPLETE = [
    {
      // Wrapped inline <a> inside the aqua card defeats axe's background
      // resolution; manually computed 14.32:1 (rgb(34,34,34) on
      // rgb(231,246,245)) — an axe limitation, not an unresolved contrast.
      ruleId: 'color-contrast',
      targetFragment: '.oak-card--aqua',
    },
  ];

  for (const theme of THEMES) {
    for (const width of [320, 1280] as const) {
      for (const expanded of [false, true] as const) {
        test(`@a11y passes WCAG checks — ${theme}, ${width}px, ${
          expanded ? 'expanded' : 'collapsed'
        }`, async ({ page }) => {
          await page.setViewportSize({ width, height: 900 });
          await page.goto('/');
          await applyTheme(page, theme);

          if (expanded) {
            const summaries = await page.locator('.oak-accordion > summary').all();
            // Anti-vacuity: a renamed accordion class would make every
            // "expanded" cell a silent duplicate of its collapsed twin.
            expect(summaries.length, 'no accordion summaries found').toBeGreaterThan(0);
            for (const summary of summaries) {
              await summary.click();
            }
          }

          // SC 1.4.10 Reflow — axe ships no rule for it, so the matrix's
          // 320px axis is blind to the exact defect this page once had
          // without this direct assertion. Content pushed left of the origin
          // is unreachable in LTR, so negative offsets are content loss even
          // when scrollWidth stays clean.
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
          expect(
            reflow.scrollW,
            'SC 1.4.10: horizontal scroll must not appear',
          ).toBeLessThanOrEqual(reflow.clientW);
          expect(reflow.minLeft, 'content pushed left of the origin is unreachable').toBe(0);

          if (width === 320) {
            // SC 2.4.4: at narrow widths the back link visually shortens to
            // "Back to" while the full accessible name must survive — a
            // display:none regression would pass axe (link-name is satisfied
            // by the short text) and every visual suite.
            await expect(
              page.getByRole('link', { name: 'Back to the main Oak website' }),
            ).toBeVisible();
          }

          const axe = await new AxeBuilder({ page }).withTags(A11Y_TAGS).analyze();
          expect(axe.violations.length, JSON.stringify(axe.violations, null, 2)).toBe(0);

          const unreviewedIncomplete = axe.incomplete.filter(
            (result) =>
              !CLEARED_INCOMPLETE.some(
                (cleared) =>
                  result.id === cleared.ruleId &&
                  result.nodes.some((node) =>
                    node.target.join(' ').includes(cleared.targetFragment),
                  ),
              ),
          );
          expect(
            unreviewedIncomplete.length,
            `unreviewed axe incomplete results:\n${JSON.stringify(unreviewedIncomplete, null, 2)}`,
          ).toBe(0);
        });
      }
    }
  }

  test('@a11y focus indicator contrasts against the inverted masthead band', async ({ page }) => {
    // The masthead is an inverted surface, so the canvas focus ring's halo
    // lands on a background of the opposite polarity. In dark that measured
    // 1.12:1 — a keyboard user could not see where they were. axe cannot catch
    // this: it does not evaluate focus-state contrast.
    await page.goto('/');
    await applyTheme(page, 'dark');

    // A real Tab, not .focus() — programmatic focus does not satisfy
    // :focus-visible, and asserting on it passes while painting nothing.
    let onBand = false;
    for (let i = 0; i < 12 && !onBand; i += 1) {
      await page.keyboard.press('Tab');
      onBand = await page.evaluate(
        () => (document.activeElement?.closest('.site-tabs') ?? null) !== null,
      );
    }
    expect(onBand, 'expected Tab to reach a masthead tab control').toBe(true);

    const focusVisible = await page.evaluate(
      () => document.activeElement?.matches(':focus-visible') ?? false,
    );
    expect(focusVisible).toBe(true);

    // SC 1.4.11 stated as itself — a contrast RATIO against the band the
    // control sits on, never a pinned token RGB: re-pointing
    // --shadow-ground-inverted is a free design decision that must not fail
    // this test, and a different-but-still-invisible grey must not pass it.
    // box-shadow is transitioned, so the value at t=0 is two transparent
    // zero layers; polling for a settled non-transparent layer measures the
    // ring a user sees rather than the frame before it.
    const readBestRingContrast = async (): Promise<number> =>
      page.evaluate(() => {
        const parseRgb = (value: string): readonly number[] | null => {
          const match = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(value);
          if (!match) {
            return null;
          }
          const alpha = match[4] === undefined ? 1 : Number(match[4]);
          return alpha === 0 ? null : [Number(match[1]), Number(match[2]), Number(match[3])];
        };
        const luminance = (rgb: readonly number[]): number => {
          const [r = 0, g = 0, b = 0] = rgb.map((channel) => {
            const scaled = channel / 255;
            return scaled <= 0.040_45 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        const contrast = (a: readonly number[], b: readonly number[]): number => {
          const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
          return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
        };

        const focused = document.activeElement;
        const band = document.querySelector('.site-tabs');
        if (focused === null || band === null) {
          return 0;
        }
        const bandBg = parseRgb(getComputedStyle(band).backgroundColor);
        if (bandBg === null) {
          return 0;
        }
        const layers = getComputedStyle(focused)
          .boxShadow.split(/,(?![^(]*\))/)
          .map((layer) => parseRgb(layer))
          .filter((rgb): rgb is readonly number[] => rgb !== null);
        return layers.reduce((best, rgb) => Math.max(best, contrast(rgb, bandBg)), 0);
      });

    // ≥ 3:1 (SC 1.4.11 non-text contrast) from at least one ring layer —
    // the double-ring recipe exists precisely so one layer always carries
    // the contrast on any ground.
    await expect.poll(readBestRingContrast).toBeGreaterThanOrEqual(3);
  });
});
