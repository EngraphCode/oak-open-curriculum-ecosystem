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
import type { Page } from '@playwright/test';

import type { OakThemeName } from '../lib/oak-theme-store';

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

/** Hosts the kit-authored counter-brand sheets are known to reference; any
 *  other third-party host aborted during a test fails the suite loudly. */
const EXPECTED_THIRD_PARTY_HOSTS: readonly string[] = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net',
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

/** Abort every cross-origin request, recording the hostnames. Icon masks and
 *  web fonts are absent under abort; that does not weaken the a11y claim —
 *  the kit's contract pairs fills with borders, icons AND text, so text
 *  carries every state's meaning. */
async function interceptExternalHosts(page: Page): Promise<Set<string>> {
  const abortedHosts = new Set<string>();
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return route.continue();
    }
    abortedHosts.add(url.hostname);
    return route.abort();
  });
  return abortedHosts;
}

export function assertOnlyKnownExternalHosts(abortedHosts: ReadonlySet<string>): void {
  for (const host of abortedHosts) {
    expect(EXPECTED_THIRD_PARTY_HOSTS, `unexpected third-party host: ${host}`).toContain(host);
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
  const abortedHosts = await interceptExternalHosts(page);
  await page.emulateMedia({
    reducedMotion: (options.reducedMotion ?? true) ? 'reduce' : 'no-preference',
  });
  await page.goto('/');
  // Hydration gate: the Theme select exists pre-hydration as a DISABLED
  // placeholder, so visibility alone is not readiness — wait for it to
  // become enabled (keyboard tests Tab immediately and do not auto-wait).
  await expect(page.getByRole('combobox', { name: 'Theme' })).toBeEnabled();
  return abortedHosts;
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
