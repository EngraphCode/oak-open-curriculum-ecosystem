/**
 * State-application helpers for the showcase suite. Each helper asserts
 * internally that the state actually reached the cascade, so a failure to
 * apply is loud rather than a silently-duplicated cell (the MCP visual
 * suite's apply-theme.ts records the whole-matrix-went-green failure this
 * guards against).
 *
 * The identity wait is grounded in a first-hand probe: Chromium sets
 * `link.sheet` non-null BEFORE the sheet joins document.styleSheets and the
 * cascade (observed one-frame gap while its nested import resolves), so
 * "sheet parsed" is not "styles applied" — membership in
 * document.styleSheets plus a computed-style change is the applied signal.
 */
import { AxeBuilder } from '@axe-core/playwright';
import { expect } from '@playwright/test';
import type { Browser, Page } from '@playwright/test';

import type { OakThemeName } from '../lib/oak-theme-store';
import { SHOWCASE_ORIGIN } from '../tools/showcase-origin';

export const IDENTITIES = ['oak', 'freedonia', 'creature'] as const;
export const PALETTE_THEMES = ['light', 'dark', 'high-contrast', 'colour-safe'] as const;
export type Identity = (typeof IDENTITIES)[number];
/** The runtime's closed theme union is the single source of the five names. */
export type ThemeName = OakThemeName;

export async function expectNoAxeViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
}

/** Origins the kit-authored counter-brand sheets are known to reference;
 *  any other aborted origin during a test fails the suite loudly. Full
 *  origins, not hostnames: a wrong-port loopback request must surface as
 *  itself, never hide behind a familiar hostname. */
const EXPECTED_THIRD_PARTY_ORIGINS: readonly string[] = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdn.jsdelivr.net',
];

/** Cascade-level application proof per explicit theme: the computed
 *  color-scheme each choice must resolve to (a per-cell table, not a branch). */
const EXPECTED_COLOR_SCHEME: Record<ThemeName, string> = {
  light: 'light',
  dark: 'dark',
  system: 'light dark',
  'high-contrast': 'light',
  'colour-safe': 'light',
};

/** Abort every request that is not same-origin with the suite's own
 *  server, recording the aborted ORIGINS. Same-origin means the full
 *  origin from tools/showcase-origin.ts — hostname equality would admit
 *  any port on localhost (cross-origin, and in a many-worktree estate
 *  possibly another tree's server). Icon masks and web fonts are absent
 *  under abort; that does not weaken the a11y claim — the kit's contract
 *  pairs fills with borders, icons AND text, so text carries every
 *  state's meaning. */
async function interceptExternalOrigins(page: Page): Promise<Set<string>> {
  const abortedOrigins = new Set<string>();
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin === SHOWCASE_ORIGIN) {
      return route.continue();
    }
    abortedOrigins.add(url.origin);
    return route.abort();
  });
  return abortedOrigins;
}

export function assertOnlyKnownExternalOrigins(abortedOrigins: ReadonlySet<string>): void {
  for (const origin of abortedOrigins) {
    expect(EXPECTED_THIRD_PARTY_ORIGINS, `unexpected third-party origin: ${origin}`).toContain(
      origin,
    );
  }
}

/** Open the page hermetically and wait for the hydrated switchboard.
 *  Reduced-motion emulation is on by default: axe reading a mid-transition
 *  frame is a recorded failure mode (MCP apply-theme.ts); the motion
 *  behaviour test opts out to observe the tokens move. */
export async function openShowcase(
  page: Page,
  options: { readonly reducedMotion?: boolean } = {},
): Promise<Set<string>> {
  const abortedOrigins = await interceptExternalOrigins(page);
  await page.emulateMedia({
    reducedMotion: (options.reducedMotion ?? true) ? 'reduce' : 'no-preference',
  });
  await page.goto('/');
  // Hydration gate: the Theme select exists pre-hydration as a DISABLED
  // placeholder, so visibility alone is not readiness — wait for it to
  // become enabled (keyboard tests Tab immediately and do not auto-wait).
  // Stated blind spot: everything downstream of this gate observes the
  // POST-hydration DOM only; the pre-hydration shell is proven by the
  // dedicated JS-disabled geometry test, never by these helpers.
  await expect(page.getByRole('combobox', { name: 'Theme' })).toBeEnabled();
  return abortedOrigins;
}

/** Geometry snapshot of the switchboard band in its own fresh context —
 *  masthead, switchboard section and both hydrating selects. JS disabled
 *  is the server shell, deterministically pre-hydration; fonts are aborted
 *  by the same interception either way, so both measurements render the
 *  same fallback face. A fresh context inherits NO test-config options, so
 *  the base origin is passed explicitly. */
export async function measureSwitchboardGeometry(
  browser: Browser,
  width: number,
  javaScriptEnabled: boolean,
): Promise<unknown> {
  const context = await browser.newContext({
    baseURL: SHOWCASE_ORIGIN,
    javaScriptEnabled,
    viewport: { width, height: 900 },
  });
  const page = await context.newPage();
  await interceptExternalOrigins(page);
  await page.goto('/');
  const themeSelect = page.getByRole('combobox', { name: 'Theme' });
  await (javaScriptEnabled
    ? expect(themeSelect).toBeEnabled()
    : expect(themeSelect).toBeDisabled());
  const boxes = await page.evaluate(() => {
    const rect = (selector: string) => {
      const box = document.querySelector(selector)?.getBoundingClientRect();
      return box ? { top: box.top, height: box.height, width: box.width } : null;
    };
    return {
      mast: rect('[data-region="masthead"]'),
      switchboard: rect('section[aria-label="Brand and display settings"]'),
      theme: rect('#oak-theme-select'),
      motion: rect('#oak-motion-select'),
    };
  });
  await context.close();
  return boxes;
}

async function headingFontFamily(page: Page): Promise<string> {
  const fontFamily = await page.evaluate(() => {
    const heading = document.querySelector('h1');
    return heading === null ? null : getComputedStyle(heading).fontFamily;
  });
  expect(fontFamily, 'the page must have an h1 to probe').not.toBeNull();
  return fontFamily ?? '';
}

/** Select an identity and assert it is IN EFFECT: brand link present with
 *  the right href, its sheet a member of document.styleSheets, and the
 *  heading face changed (both counter-brands re-point the display face). */
export async function applyIdentity(page: Page, identity: Identity): Promise<void> {
  const baselineFont = await headingFontFamily(page);
  await page.getByRole('combobox', { name: 'Identity' }).selectOption(identity);
  if (identity === 'oak') {
    await page.waitForFunction(() => document.querySelector('link[data-oak-brand]') === null);
    return;
  }
  // Target the identity-specific link: during a load-then-swap transition
  // the outgoing and incoming brand links briefly coexist by design.
  await expect(page.locator(`link[data-oak-brand="${identity}"]`)).toHaveAttribute(
    'href',
    `/brands/${identity}/brand.css`,
  );
  await page.waitForFunction((slug) => {
    return [...document.styleSheets].some((sheet) =>
      (sheet.href ?? '').endsWith(`/brands/${slug}/brand.css`),
    );
  }, identity);
  await expect
    .poll(async () => headingFontFamily(page), {
      message: 'the counter-brand face must reach the heading',
    })
    .not.toBe(baselineFont);
}

/** Select a theme and assert it is IN EFFECT: the attribute landed and the
 *  document's computed color-scheme matches the per-theme expectation. */
export async function applyTheme(page: Page, theme: ThemeName): Promise<void> {
  await page.getByRole('combobox', { name: 'Theme' }).selectOption(theme);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  const colorScheme = await page.evaluate(
    () => getComputedStyle(document.documentElement).colorScheme,
  );
  expect(colorScheme).toBe(EXPECTED_COLOR_SCHEME[theme]);
}
