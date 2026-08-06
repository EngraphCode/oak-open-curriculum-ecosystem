import { request } from './test-helpers/loopback-request.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Express } from 'express';

import { createApp } from './application.js';
import {
  createEmptyStaticRoot,
  getScratchStaticRoot,
  removeStaticRoot,
} from './test-helpers/static-root-fixture.js';
import { createFakeHttpObservability } from './test-helpers/observability-fakes.js';
import { createMockRuntimeConfig } from './test-helpers/auth-error-test-helpers.js';
import { renderLandingPageHtml } from './landing-page/index.js';
import { ROUTED_ASSET_BASE } from './app/static-asset-paths.js';

/**
 * The design system reaches the browser as ordinary static assets.
 *
 * The copy itself is proven in `build-scripts/copy-oak-ds.integration.test.ts`;
 * this suite proves the other half — that the copied tree is actually
 * reachable over HTTP from the running app, through the static mount that
 * already exists. Without this, a correct copy into a directory the server
 * does not serve would look identical to success.
 *
 * The suite serves from its own scratch root (the `staticRoot` seam), so it
 * neither reads nor writes the workspace's live `public/` tree and cannot
 * race the build's copy step.
 */
describe('Oak Open Curriculum Design System static serving', () => {
  let scratchRoot: string;
  let app: Express;

  beforeAll(async () => {
    scratchRoot = await getScratchStaticRoot();
    app = await createApp({
      runtimeConfig: createMockRuntimeConfig({
        dangerouslyDisableAuth: true,
        env: { ALLOWED_HOSTS: 'localhost,127.0.0.1,::1' },
      }),
      observability: createFakeHttpObservability(),
      getWidgetHtml: () => '<!doctype html><html><body>test-widget</body></html>',
      getLandingPageHtml: () =>
        '<!doctype html><html lang="en-GB"><body>test landing page</body></html>',
      staticRoot: scratchRoot,
    });
  });

  afterAll(() => {
    // The shared scratch root outlives the suite by design (one copy per
    // worker, other suites boot from it); the OS temp dir owns cleanup.
  });

  it('serves the root stylesheet as CSS, revalidate-always', async () => {
    const res = await request(app).get('/oak-ds/styles.css').set('Host', 'localhost');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/css');
    // Mutable URLs: any positive freshness window pairs pre-deploy assets
    // with post-deploy HTML. ETag keeps the steady state a cheap 304.
    expect(res.headers['cache-control']).toBe('public, max-age=0');
    expect(res.headers['etag']).toBeDefined();
  });

  it('serves the stylesheets the root sheet imports', async () => {
    for (const sheet of ['colors_and_type.css', 'oak-icons.css', 'components.css', 'print.css']) {
      const res = await request(app).get(`/oak-ds/${sheet}`).set('Host', 'localhost');

      expect(res.status, `${sheet} is not reachable`).toBe(200);
    }
  });

  it('serves a font face and its licence notice', async () => {
    const font = await request(app)
      .get('/oak-ds/fonts/Lexend-VariableFont_wght.ttf')
      .set('Host', 'localhost');
    const licence = await request(app).get('/oak-ds/fonts/Lexend-OFL.txt').set('Host', 'localhost');

    expect(font.status).toBe(200);
    expect(licence.status).toBe(200);
  });

  it('serves a mask icon', async () => {
    const res = await request(app)
      .get('/oak-ds/assets/icons/chevron-down.svg')
      .set('Host', 'localhost');

    expect(res.status).toBe(200);
  });

  it('serves every asset the rendered page references from /oak-ds or /oak-assets', async () => {
    // The CSS closure test covers what the stylesheets reach. This covers the
    // other half — assets named only in markup — by asking the page itself
    // what it references, so the masthead logo's `img src` (moved to the
    // assets package in this change) cannot drift from the served path, and
    // a new markup-referenced asset cannot be added without being served.
    // The scrape accepts an absolute origin prefix so ABSOLUTE references —
    // og:image is emitted absolute for crawlers — are covered too, not just
    // root-relative ones: this test's name promises the whole rendered page.
    // The path prefix is DERIVED, not spelled: these references moved under
    // the routed base in MCP-509, and a literal `/oak-` here silently matched
    // nothing afterwards — a zero-match scrape that still asserted "every
    // referenced asset is served" over an empty set. The
    // `expect(length).toBeGreaterThan(0)` below is what caught that, and it is
    // the reason this test keeps its own vacuity guard.
    const html = renderLandingPageHtml();
    const referenced = [
      ...new Set(
        [
          ...html.matchAll(
            new RegExp(`"(?:https?://[^"/]+)?(${ROUTED_ASSET_BASE}/oak-(?:ds|assets)/[^"]+)"`, 'g'),
          ),
        ].map((match) => match[1]),
      ),
    ];

    expect(referenced.length).toBeGreaterThan(0);

    for (const assetPath of referenced) {
      const res = await request(app)
        .get(assetPath ?? '')
        .set('Host', 'localhost');
      expect(res.status, assetPath).toBe(200);
    }
  });

  it('references every first-party asset from inside the canonical routed surface', () => {
    // MCP-509. The canonical deployment reaches this app through a Cloudflare
    // origin rule scoped to `/mcp` and `/mcp/*`. A root-relative reference
    // therefore never arrives here at all — it stays on the main website and
    // returns its 404 HTML, so the canonical page renders unstyled with no
    // logo and no favicon while every request this app *does* receive is
    // healthy. The page cannot observe that from the inside, which is why the
    // invariant is asserted on the rendered markup rather than over HTTP.
    //
    // Scoped to SUBRESOURCES — the things the browser fetches to render the
    // page (`<link>`, `<img>`, `<script>`), not everything that looks like a
    // path. Two exclusions are deliberate, not laziness:
    //
    //  - An `<a href>` is a destination, not a subresource. The page links to
    //    the main Oak site and to GitHub, and those are absolute off-origin
    //    URLs whose *paths* would look first-party if the origin were stripped.
    //  - `/.well-known/oauth-protected-resource` is a first-party ENDPOINT
    //    with its own edge route, and forcing it under the asset base would
    //    break OAuth discovery. Not every first-party path is an asset.
    //
    // The suite's older scrape was prefix-scoped to `/oak-ds/` and
    // `/oak-assets/`, so `/favicons/*` and `/landing-page.css` were never
    // covered — and those were exactly the paths that 404'd in production
    // while this suite stayed green. Matching by tag instead of by prefix is
    // what closes that hole: a newly-added subresource cannot opt out.
    const html = renderLandingPageHtml();
    const subresourceRefs = [
      ...new Set(
        [...html.matchAll(/<(?:link|img|script)\b[^>]*?\b(?:href|src)="([^"]+)"/g)]
          .map((match) => match[1] ?? '')
          .filter((ref) => ref.startsWith('/')),
      ),
    ];

    expect(subresourceRefs.length).toBeGreaterThan(0);

    const escaped = subresourceRefs.filter((ref) => !ref.startsWith(`${ROUTED_ASSET_BASE}/`));
    expect(
      escaped,
      `these subresources sit outside ${ROUTED_ASSET_BASE}/ and 404 on the canonical host`,
    ).toEqual([]);
  });

  it('serves the routed asset paths ahead of the MCP accept and auth gates', async () => {
    // `/mcp/*` also carries the MCP accept-header gate and Clerk auth. Assets
    // survive only because the static mount is registered before both, so a
    // browser's `Accept: text/css` is not a 406 and an unauthenticated GET is
    // not a 401. Reordering those mounts would break the page while leaving
    // every MCP request correct — this test is what makes that visible.
    const res = await request(app)
      .get(`${ROUTED_ASSET_BASE}/oak-ds/styles.css`)
      .set('Host', 'localhost')
      .set('Accept', 'text/css,*/*;q=0.1');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/css');
  });

  it('still serves the unprefixed paths, so the alpha surface keeps rendering', async () => {
    // The alpha host serves this app at its own root and is a declared
    // compatibility surface (MCP-509 acceptance). Retiring the root mount
    // would break it silently.
    const res = await request(app).get('/oak-ds/styles.css').set('Host', 'localhost');

    expect(res.status).toBe(200);
  });

  it('refuses to construct the app when the static root lacks the copied assets', async () => {
    const emptyRoot = await createEmptyStaticRoot();
    try {
      await expect(
        createApp({
          runtimeConfig: createMockRuntimeConfig({
            dangerouslyDisableAuth: true,
            env: { ALLOWED_HOSTS: 'localhost,127.0.0.1,::1' },
          }),
          observability: createFakeHttpObservability(),
          getWidgetHtml: () => '<!doctype html><html><body>test-widget</body></html>',
          getLandingPageHtml: () =>
            '<!doctype html><html lang="en-GB"><body>test landing page</body></html>',
          staticRoot: emptyRoot,
        }),
      ).rejects.toThrow(/missing .*oak-ds/);
    } finally {
      await removeStaticRoot(emptyRoot);
    }
  });
});
