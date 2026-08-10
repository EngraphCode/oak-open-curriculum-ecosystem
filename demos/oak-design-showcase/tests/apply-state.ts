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

import type { OakThemeName } from '@oaknational/oak-design-react';
import { RATIFIED_EXTERNAL_ORIGINS } from '@oaknational/fidelity-review/capture-flags';
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

/** The forced-colors variant: every rule except color-contrast, which axe
 *  reads from UNFORCED author colours in this mode and so measures a
 *  fiction — a live probe (2026-08-10) showed the same elements computing
 *  correctly forced CanvasText/LinkText while axe reported the author
 *  values. Contrast under forced colors is the system palette's property
 *  by construction; every other rule stays live. */
export async function expectNoAxeViolationsForcedColors(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .disableRules(['color-contrast'])
    .analyze();
  expect(results.violations).toEqual([]);
}

/** Origins the kit-authored counter-brand sheets are known to reference;
 *  any other aborted origin during a test fails the suite loudly. Full
 *  origins, not hostnames: a wrong-port loopback request must surface as
 *  itself, never hide behind a familiar hostname. The list itself is
 *  the fidelity package's RATIFIED_EXTERNAL_ORIGINS — one census,
 *  consumed here and by the capture-egress allowlist, so the two
 *  surfaces cannot drift apart. */
const EXPECTED_THIRD_PARTY_ORIGINS: readonly string[] = RATIFIED_EXTERNAL_ORIGINS;

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
export async function interceptExternalOrigins(page: Page): Promise<Set<string>> {
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
 *  is the server shell, deterministically pre-paint interactive state. The
 *  interception does NOT silence fonts here: the kit's faces are
 *  SELF-HOSTED (same-origin), so they load asynchronously and swap the
 *  metrics mid-page-life — under concurrent machine load one context can
 *  measure pre-swap and the other post-swap, which is exactly the flake
 *  MCP-399 recorded (three load-dependent outcomes on identical code).
 *  Both measurements therefore wait for document.fonts.ready (the
 *  FontFaceSet promise resolves in a JS-disabled context too — the
 *  setting blocks page-authored scripts, not CSS font loading or the
 *  driver's evaluation). A fresh context inherits NO test-config options,
 *  so the base origin is passed explicitly. */
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
  await page.evaluate(() => document.fonts.ready);
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
  // The parent sheet joining the cascade does NOT mean its nested @import
  // (brand-a.css) has: Chromium attaches the imported sheet a frame later,
  // and a scan in that gap sees the brand's base rules without its token
  // overrides (a CI axe run caught creature x high-contrast mid-gap at
  // 1.37:1). Applied means every import rule carries its stylesheet.
  await page.waitForFunction((slug) => {
    const parent = [...document.styleSheets].find((sheet) =>
      (sheet.href ?? '').endsWith(`/brands/${slug}/brand.css`),
    );
    if (parent === undefined) {
      return false;
    }
    try {
      return [...parent.cssRules].every(
        (rule) => !(rule instanceof CSSImportRule) || rule.styleSheet !== null,
      );
    } catch {
      return false;
    }
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
