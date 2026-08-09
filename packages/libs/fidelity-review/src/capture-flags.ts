/*
 * Shared capture policy: flag/env resolution for the matched-geometry
 * capture arms and the blank-render classifier. These three were
 * byte-identical (isSuspect) or divergent-only-by-drift (resolveWidth's
 * strictness fix, resolveBase's default port) across the demo apps'
 * copies — the canonical strict versions live here; each app keeps its
 * own default base constant and its app-specific classifiers (route
 * slugging, hydration witnesses, frame-aware render checks). Every
 * function here is pure and side-effect free.
 */
import { ok, err, type Result } from '@oaknational/result';

import { stripTrailing } from './support';

/** Resolve the viewport CSS width (the matched-geometry standard, 1440).
 *  Override: `--width 1280` or WIDTH=1280. */
export function resolveWidth(
  argv: readonly string[],
  env: NodeJS.ProcessEnv,
): Result<number, Error> {
  const flagIdx = argv.indexOf('--width');
  const fromFlag = flagIdx === -1 ? undefined : argv.at(flagIdx + 1);
  const raw = fromFlag ?? env.WIDTH;
  // Number(), not parseInt: '1440px' and '1440.5' must be rejected, not
  // silently truncated to a plausible integer.
  const width = raw !== undefined && raw !== '' ? Number(raw) : 1440;
  if (!Number.isInteger(width) || width < 320 || width > 5000) {
    return err(new Error(`invalid --width ${JSON.stringify(raw)} (expected integer 320..5000)`));
  }
  return ok(width);
}

/** Resolve the base URL of the running app. Override: `--base <url>` or
 *  BASE_URL. `defaultBase` is the app's own dev port — and its host should
 *  be `localhost`, NOT `127.0.0.1`: `next dev` blocks cross-origin dev
 *  resources from 127.0.0.1, so hydration chunks never load and any
 *  hydration-dependent surface silently renders its SSR fallback — a
 *  wrong capture target the blank classifier cannot catch (hub team
 *  finding, 2026-07-02). */
export function resolveBase(
  argv: readonly string[],
  env: NodeJS.ProcessEnv,
  defaultBase: string,
): string {
  const flagIdx = argv.indexOf('--base');
  const fromFlag = flagIdx === -1 ? undefined : argv.at(flagIdx + 1);
  return stripTrailing(fromFlag ?? env.BASE_URL ?? defaultBase, '/');
}

/** Blank-render classifier: a real page is HTTP 200 with meaningful body
 *  height AND visible text. Returns true when the capture is SUSPECT
 *  (looks blank / a placeholder). Pure — the self-check. */
export function isSuspect(status: number, bodyHeight: number, textLength: number): boolean {
  return !(status === 200 && bodyHeight > 400 && textLength > 200);
}
