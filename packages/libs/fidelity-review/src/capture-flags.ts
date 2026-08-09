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

/** The raw width input: the `--width` value when the flag is present,
 *  else WIDTH from env. A `--width` with no following value is a
 *  stated error — a silent fall-through to env/default would hand the
 *  user a width they did not ask for. */
function rawWidthInput(
  argv: readonly string[],
  env: NodeJS.ProcessEnv,
): Result<string | undefined, Error> {
  const flagIdx = argv.indexOf('--width');
  if (flagIdx === -1) {
    return ok(env.WIDTH);
  }
  const fromFlag = argv.at(flagIdx + 1);
  if (fromFlag === undefined) {
    return err(new Error('--width requires a value (an integer 320..5000)'));
  }
  return ok(fromFlag);
}

/** Resolve the viewport CSS width (the matched-geometry standard, 1440).
 *  Override: `--width 1280` or WIDTH=1280. */
export function resolveWidth(
  argv: readonly string[],
  env: NodeJS.ProcessEnv,
): Result<number, Error> {
  const raw = rawWidthInput(argv, env);
  if (!raw.ok) {
    return raw;
  }
  // Number(), not parseInt: '1440px' and '1440.5' must be rejected, not
  // silently truncated to a plausible integer.
  const width = raw.value !== undefined && raw.value !== '' ? Number(raw.value) : 1440;
  if (!Number.isInteger(width) || width < 320 || width > 5000) {
    return err(
      new Error(`invalid --width ${JSON.stringify(raw.value)} (expected integer 320..5000)`),
    );
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

/** The device scale factor of the matched-geometry convention: every
 *  capture arm shoots at this scale AND the report meta declares it —
 *  one constant consumed at both ends, because an arm that drifted
 *  while the meta stayed hardcoded would make the rendered "scale 2" a
 *  lie about the PNGs. Peer of resolveWidth's 1440 default. */
export const MATCHED_GEOMETRY_SCALE = 2;

/** Blank-render classifier: a real page is HTTP 200 with meaningful body
 *  height AND visible text. Returns true when the capture is SUSPECT
 *  (looks blank / a placeholder). Pure — the self-check. */
export function isSuspect(status: number, bodyHeight: number, textLength: number): boolean {
  return !(status === 200 && bodyHeight > 400 && textLength > 200);
}
