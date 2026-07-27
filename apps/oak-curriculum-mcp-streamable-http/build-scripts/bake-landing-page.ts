/**
 * Build-time bake of the landing page.
 *
 * @remarks
 * Renders the page ONCE with build-environment inputs and writes the static
 * artefact the route serves. The content is therefore fixed at build time —
 * and because the server's own tool registry is fixed at the same build, the
 * baked page and the MCP app cannot diverge, by construction.
 *
 * The inputs reuse the exact runtime derivations rather than mirroring them:
 * {@link getDisplayHostname} (Vercel provides the `VERCEL_*` variables at
 * build, per deployment) and {@link resolveApplicationVersion} are the same
 * functions the runtime config resolves at boot, so a build and its runtime
 * agree on host and version by shared code, not by convention.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  getDisplayHostname,
  resolveApplicationVersion,
  type VercelDisplayHostnameEnvironment,
} from '@oaknational/build-metadata';

import { LANDING_PAGE_ARTEFACT_RELATIVE_PATH } from '../src/app/landing-page-artefact.js';
import { renderLandingPageHtml, type LandingPageOptions } from '../src/landing-page/index.js';

/**
 * Exactly the environment shape the bake reads — the honest contract, not
 * an open record. `process.env` satisfies it structurally at the callers.
 */
export type BakeEnvironment = VercelDisplayHostnameEnvironment & {
  readonly APP_VERSION_OVERRIDE?: string;
};

/** Resolve the bake's inputs from a build environment (pure, injectable). */
export function resolveBakeOptions(env: BakeEnvironment): LandingPageOptions {
  const vercelHost = getDisplayHostname(env);
  const version = resolveApplicationVersion({
    APP_VERSION_OVERRIDE: env['APP_VERSION_OVERRIDE'],
  });
  return {
    ...(vercelHost !== undefined ? { vercelHost } : {}),
    ...(version.ok ? { appVersion: version.value.value } : {}),
  };
}

/**
 * Render the page with build-environment inputs and write the artefact.
 *
 * @param workspaceRoot - The app workspace directory.
 * @param env - The build environment. Callers are composition roots and
 * pass `process.env` at their own boundary; this module never reads it.
 * @returns The absolute artefact path, for the caller's logging.
 */
export async function bakeLandingPage(
  workspaceRoot: string,
  env: BakeEnvironment,
): Promise<string> {
  const artefact = path.join(workspaceRoot, LANDING_PAGE_ARTEFACT_RELATIVE_PATH);
  await mkdir(path.dirname(artefact), { recursive: true });
  await writeFile(artefact, renderLandingPageHtml(resolveBakeOptions(env)), 'utf8');
  return artefact;
}
