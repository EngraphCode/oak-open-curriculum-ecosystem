import { request } from './test-helpers/loopback-request.js';
import { beforeAll, describe, expect, it } from 'vitest';
import type { Express } from 'express';

import { createApp } from './application.js';
import { getScratchStaticRoot } from './test-helpers/static-root-fixture.js';
import { createFakeHttpObservability } from './test-helpers/observability-fakes.js';
import { createMockRuntimeConfig } from './test-helpers/auth-error-test-helpers.js';
import { ROUTED_ASSET_BASE } from './app/static-asset-paths.js';

/**
 * The submission carousel images are served at stable, permanent `/mcp` URLs.
 *
 * @remarks
 * MCP-595. The Claude submission portal will not accept image uploads, so the
 * listing holds these URLs and fetches them itself, indefinitely. That makes
 * them an EXTERNAL contract rather than an internal asset path: nothing in this
 * repository references them, so no scrape-based guard can notice them, and a
 * rename or a move would break Anthropic's rendered directory listing — a
 * surface we never see — while every check here stayed green.
 *
 * This suite is therefore the only thing standing between a tidy-up and a
 * broken public listing. It asserts POSITIVELY and per file: HTTP 200 AND a
 * `image/png` content type.
 *
 * The positive form is load-bearing, not pedantry. A non-existent path under
 * `/mcp/` does NOT return 404 — the MCP transport's accept-header gate answers
 * first with `406 application/json`. So a check written as "confirm it is not a
 * 404" passes against a completely broken URL, and would have certified an
 * empty directory. Do not weaken these assertions to a negative one.
 */
/**
 * The carousel filenames, exactly as the submitted listing references them.
 *
 * @remarks
 * Spelled out rather than enumerated from disk, deliberately. Reading the
 * directory would make any rename self-fulfilling: the test would follow the
 * new name and pass, which is precisely the silent break this guards. Changing
 * a name here is a change to a published URL and must be a deliberate edit.
 *
 * Ordinal prefixes carry the carousel's running order, and each image pairs
 * with a specific example prompt on the submission form (MCP-458).
 */
const CAROUSEL_IMAGE_FILENAMES = [
  '1-progression-photosynthesis.png',
  '2-misconceptions-triangle-area.png',
  '3-keywords-year1-art.png',
] as const;

describe('submission carousel image serving', () => {
  let app: Express;

  beforeAll(async () => {
    app = await createApp({
      runtimeConfig: createMockRuntimeConfig({
        dangerouslyDisableAuth: true,
        env: { ALLOWED_HOSTS: 'localhost,127.0.0.1,::1' },
      }),
      observability: createFakeHttpObservability(),
      getWidgetHtml: () => '<!doctype html><html><body>test-widget</body></html>',
      getLandingPageHtml: () =>
        '<!doctype html><html lang="en-GB"><body>test landing page</body></html>',
      staticRoot: await getScratchStaticRoot(),
    });
  });

  it.each(CAROUSEL_IMAGE_FILENAMES)(
    'serves %s as a PNG inside the routed surface',
    async (file) => {
      // The `Accept` header is the point of this request, not scaffolding. These
      // URLs sit under `/mcp/`, which also carries the MCP accept-header gate,
      // and an image fetch never sends `text/event-stream` — it sends this. The
      // images survive only because the static mount is registered ahead of that
      // gate (`application.ts` ordering). Reordering the two would answer every
      // carousel fetch with a 406 while leaving all MCP traffic correct.
      const res = await request(app)
        .get(`${ROUTED_ASSET_BASE}/carousel/${file}`)
        .set('Host', 'localhost')
        .set('Accept', 'image/avif,image/webp,image/png,*/*;q=0.8');

      expect(res.status, `${file} is not served — the submitted listing would show a gap`).toBe(
        200,
      );
      expect(res.headers['content-type'], `${file} is served with the wrong type`).toContain(
        'image/png',
      );
    },
  );
});
