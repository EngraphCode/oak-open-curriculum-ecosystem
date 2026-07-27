/**
 * Static content route mounting: landing page and public assets.
 *
 * Extracted from `application.ts` to keep each module under the
 * file-length lint ceiling.
 */

import { static as expressStatic } from 'express';
import type { Express, RequestHandler } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import type { Logger } from '@oaknational/logger';
import { err, ok, type Result } from '@oaknational/result';

import { OAK_ASSETS_MARKER, OAK_DS_MARKER } from './static-asset-paths.js';
import { renderLandingPageHtml } from '../landing-page/index.js';

function addRootLandingPage(
  app: Express,
  dnsRebindingMw: RequestHandler,
  log: Logger,
  vercelHostname?: string,
  appVersion?: string,
): void {
  app.get('/', dnsRebindingMw, (req, res) => {
    log.debug('landing.get', { path: req.path, method: req.method });
    res.type('text/html').send(renderLandingPageHtml(vercelHostname, appVersion));
  });
}

/** Why a static root could not be resolved. */
export interface StaticRootError {
  readonly reason: 'no-root' | 'missing-asset';
  readonly detail: string;
}

/**
 * Resolve the served static root from candidate directories.
 *
 * @remarks
 * Pure: filesystem access is injected so the three failure branches are
 * unit-describable with literals. The first existing candidate wins, then
 * both copied trees must prove themselves via their boot markers — the
 * design system's root stylesheet and the brand logo the masthead
 * references. A root that exists without them is a broken deployment, not
 * a servable root.
 */
export function resolveStaticRoot(
  candidates: readonly string[],
  exists: (candidatePath: string) => boolean,
): Result<string, StaticRootError> {
  const chosen = candidates.find((candidate) => exists(candidate));
  if (chosen === undefined) {
    return err({ reason: 'no-root', detail: candidates.join(', ') });
  }
  for (const marker of [OAK_DS_MARKER, OAK_ASSETS_MARKER]) {
    if (!exists(path.join(chosen, marker))) {
      return err({ reason: 'missing-asset', detail: path.join(chosen, marker) });
    }
  }
  return ok(chosen);
}

/**
 * Mounts the static asset root, refusing to serve without it.
 *
 * @remarks
 * The root is located by trying `process.cwd()`-relative candidates (the app
 * runs from the workspace directory locally and from the repository root on
 * Vercel), unless an explicit root is injected. That heuristic used to fail
 * open: no candidate meant no mount, and the server came up healthy.
 *
 * The design system and brand artwork are delivered from this directory —
 * including the masthead logo the page references — so failing open costs
 * them silently: a page that returns 200 with a broken image today, and
 * unstyled HTML once the page consumes the stylesheets. A missing copy is a
 * broken deployment, so it is treated as one at boot rather than discovered
 * by a visitor. (The boot-time throw is the deliberate fail-fast exception
 * to the Result pattern: there is no caller above `createApp` to hand a
 * Result to, and a half-booted server is the worse outcome.)
 */
function mountStaticAssets(app: Express, log: Logger, staticRoot?: string): void {
  const candidates =
    staticRoot === undefined
      ? [
          path.resolve(process.cwd(), 'public'),
          path.resolve(process.cwd(), 'apps/oak-curriculum-mcp-streamable-http/public'),
        ]
      : [staticRoot];
  const resolution = resolveStaticRoot(candidates, fs.existsSync);

  if (!resolution.ok) {
    log.error('static.root.unresolved', {
      cwd: process.cwd(),
      reason: resolution.error.reason,
      detail: resolution.error.detail,
    });
    throw new Error(
      resolution.error.reason === 'no-root'
        ? `No static asset root found. Tried: ${resolution.error.detail} (cwd: ${process.cwd()}). ` +
            'The design system, fonts, icons, and brand assets are all served from this directory.'
        : `Static root is missing ${resolution.error.detail}. ` +
            'Run the build so copy-oak-ds populates it; serving without it breaks the page.',
    );
  }

  // Revalidate-always, not a freshness window: these are mutable URLs
  // (`/oak-ds/styles.css`), so any positive maxAge lets a browser pair
  // pre-deploy assets with post-deploy HTML for that long. ETag keeps the
  // steady state cheap (304, no body). Content-hashed URLs are the durable
  // cure and belong to the asset-versioning follow-up. Applies to the whole
  // root (favicons included) — a deliberate simplification recorded in the
  // PR's deviation ledger.
  app.use(expressStatic(resolution.value, { etag: true, maxAge: 0 }));
}

/** What the static-content mount needs from the app's options. */
export interface StaticContentOptions {
  readonly vercelHostname?: string;
  readonly appVersion?: string;
  readonly staticRoot?: string;
}

export function mountStaticContentRoutes(
  app: Express,
  dnsRebindingMw: RequestHandler,
  log: Logger,
  options: StaticContentOptions,
): void {
  addRootLandingPage(app, dnsRebindingMw, log, options.vercelHostname, options.appVersion);
  mountStaticAssets(app, log, options.staticRoot);
}
