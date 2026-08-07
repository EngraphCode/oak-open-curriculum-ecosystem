/**
 * The `/mcp` page is public before auth exists in the chain (MCP-518).
 *
 * The web page at `/mcp` is fully public by owner ruling — absolutely anyone
 * may see it — while the MCP server on the same URL follows the coded OAuth
 * flow. The auth contract is therefore per-surface, and the surface fork has
 * to be the FIRST auth-relevant act rather than something that happens after
 * Clerk has already inspected the request.
 *
 * These cases are assembled through `createApp` with a spy standing in for
 * global `clerkMiddleware` (the `clerkMiddlewareFactory` seam, ADR-078), so
 * they describe the property that actually matters: whether a request reaches
 * Clerk at all. A predicate that were correct in isolation but mounted after
 * something that answers first would pass a unit test and fail here.
 *
 * The complement of each browser case is asserted in the same suite: the
 * protocol leg must still reach Clerk and must still answer an anonymous
 * request with the 401 challenge. A change that made the page public by
 * making the endpoint public would pass the first half and fail the second.
 */

import { describe, it, expect, vi } from 'vitest';
import type { Express, RequestHandler } from 'express';

import { request } from './test-helpers/loopback-request.js';
import { createApp } from './application.js';
import { createFakeHttpObservability } from './test-helpers/observability-fakes.js';
import { createMockRuntimeConfig } from './test-helpers/auth-error-test-helpers.js';
import { TEST_UPSTREAM_METADATA } from './test-helpers/upstream-metadata-fixture.js';
import { getScratchStaticRoot } from './test-helpers/static-root-fixture.js';
import { OAK_ASSETS_MARKER, OAK_DS_MARKER, ROUTED_ASSET_BASE } from './app/static-asset-paths.js';

/** What a browser sends on a document navigation. */
const BROWSER_ACCEPT = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';

/** What a conformant MCP client sends on a protocol POST. */
const PROTOCOL_ACCEPT = 'application/json, text/event-stream';

/** The allow-listed Host these requests arrive on. */
const SERVED_HOST = 'localhost';

const CANONICAL_HOST = 'www.thenational.academy';
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;

/**
 * Clerk cookie state of a signed-in browser.
 *
 * `__client_uat` above zero is what tells Clerk a session exists, and it is
 * the shape of the MCP-517 synthetic probe that produced the user-visible
 * handshake redirect. Present on every browser case here: the contract is
 * that the page renders regardless of cookie state, so the cases carry the
 * state that used to break it rather than the state that never did.
 */
const SIGNED_IN_COOKIES = '__client_uat=1758000000; __session=not-a-real-token';

const FAKE_LANDING_PAGE_HTML =
  '<!doctype html><html lang="en-GB"><body>test landing page</body></html>';

/**
 * The header the real `clerkMiddleware` stamps on every response it handles.
 *
 * The double sets it too, which is what makes the header assertions below
 * discriminating: a fake that recorded the call but left the response alone
 * would let "no `x-clerk-*` headers on the public page" pass even if Clerk
 * ran on every request.
 */
const CLERK_STATUS_HEADER = 'x-clerk-auth-status';

interface Harness {
  readonly app: Express;
  /** Records every request that reached global Clerk middleware. */
  readonly reachedClerk: ReturnType<typeof createReachedClerkSpy>;
}

function createReachedClerkSpy() {
  return vi.fn<(label: string) => void>();
}

async function createHarness(env: Record<string, string> = {}): Promise<Harness> {
  const reachedClerk = createReachedClerkSpy();
  const clerkMiddleware: RequestHandler = (req, res, next) => {
    reachedClerk(`${req.method} ${req.path}`);
    res.setHeader(CLERK_STATUS_HEADER, 'signed-out');
    next();
  };

  const app = await createApp({
    staticRoot: await getScratchStaticRoot(),
    runtimeConfig: createMockRuntimeConfig({ env }),
    observability: createFakeHttpObservability(),
    getWidgetHtml: () => '<!doctype html><html><body>test-widget</body></html>',
    getLandingPageHtml: () => FAKE_LANDING_PAGE_HTML,
    upstreamMetadata: TEST_UPSTREAM_METADATA,
    clerkMiddlewareFactory: () => clerkMiddleware,
  });

  return { app, reachedClerk };
}

/** Response header names Clerk adds when its middleware has run. */
function clerkHeaderNames(headers: Record<string, unknown>): string[] {
  return Object.keys(headers).filter((name) => name.toLowerCase().startsWith('x-clerk-'));
}

describe('the public /mcp surface never reaches Clerk (MCP-518)', () => {
  it('serves the page to a signed-in browser without Clerk seeing the request', async () => {
    const { app, reachedClerk } = await createHarness();

    const res = await request(app)
      .get('/mcp')
      .set('Host', SERVED_HOST)
      .set('Accept', BROWSER_ACCEPT)
      .set('Sec-Fetch-Dest', 'document')
      .set('Cookie', SIGNED_IN_COOKIES);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toBe(FAKE_LANDING_PAGE_HTML);
    expect(reachedClerk).not.toHaveBeenCalled();
  });

  it('answers the page with no auth-vendor headers and no cookie of its own', async () => {
    const { app } = await createHarness();

    const res = await request(app)
      .get('/mcp')
      .set('Host', SERVED_HOST)
      .set('Accept', BROWSER_ACCEPT)
      .set('Sec-Fetch-Dest', 'document')
      .set('Cookie', SIGNED_IN_COOKIES);

    expect(clerkHeaderNames(res.headers)).toStrictEqual([]);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('serves the page rather than a redirect, whatever the cookie state', async () => {
    const { app, reachedClerk } = await createHarness();

    const cookieStates = ['', SIGNED_IN_COOKIES, '__client_uat=1; __session=malformed.jwt'];
    for (const cookie of cookieStates) {
      const res = await request(app)
        .get('/mcp')
        .set('Host', SERVED_HOST)
        .set('Accept', BROWSER_ACCEPT)
        .set('Sec-Fetch-Dest', 'document')
        .set('Cookie', cookie);

      expect(res.status, `cookie state ${JSON.stringify(cookie)} did not get the page`).toBe(200);
    }
    expect(reachedClerk).not.toHaveBeenCalled();
  });

  it('keeps Clerk off a document navigation whose Accept names no HTML type', async () => {
    // Handshake-eligible at the vendor on Sec-Fetch-Dest alone. The
    // negotiation does not serve it — the protocol gate refuses it — but it
    // must not be redirected into an auth handshake on the way there.
    const { app, reachedClerk } = await createHarness();

    const res = await request(app)
      .get('/mcp')
      .set('Host', SERVED_HOST)
      .set('Accept', '*/*')
      .set('Sec-Fetch-Dest', 'document')
      .set('Cookie', SIGNED_IN_COOKIES);

    expect(res.status).toBe(406);
    expect(reachedClerk).not.toHaveBeenCalled();
  });

  it("keeps Clerk off the page's own static assets under the routed base", async () => {
    const { app, reachedClerk } = await createHarness();

    for (const marker of [OAK_DS_MARKER, OAK_ASSETS_MARKER]) {
      const res = await request(app)
        .get(`${ROUTED_ASSET_BASE}/${marker}`)
        .set('Host', SERVED_HOST)
        .set('Cookie', SIGNED_IN_COOKIES);

      expect(res.status, `${marker} was not served`).toBe(200);
      expect(clerkHeaderNames(res.headers)).toStrictEqual([]);
    }
    expect(reachedClerk).not.toHaveBeenCalled();
  });
});

describe('the MCP protocol leg still reaches Clerk (MCP-518)', () => {
  it('routes a conformant protocol POST through Clerk', async () => {
    const { app, reachedClerk } = await createHarness();

    await request(app)
      .post('/mcp')
      .set('Host', SERVED_HOST)
      .set('Accept', PROTOCOL_ACCEPT)
      .set('Cookie', SIGNED_IN_COOKIES)
      .send({ jsonrpc: '2.0', id: 1, method: 'tools/list' });

    expect(reachedClerk).toHaveBeenCalledWith('POST /mcp');
  });

  it('still answers an unauthenticated protocol POST with the 401 challenge', async () => {
    const { app } = await createHarness({ CANONICAL_HOST });

    const res = await request(app)
      .post('/mcp')
      .set('Host', SERVED_HOST)
      .set('Accept', PROTOCOL_ACCEPT)
      .send({ jsonrpc: '2.0', id: 1, method: 'tools/list' });

    expect(res.status).toBe(401);
    expect(res.headers['www-authenticate']).toContain(
      `resource_metadata="${CANONICAL_ORIGIN}/.well-known/oauth-protected-resource/mcp"`,
    );
    // The same response proves Clerk was in the chain, so the challenge is
    // the auth-enabled one rather than a bypass that happens to 401.
    expect(res.headers[CLERK_STATUS_HEADER]).toBe('signed-out');
  });

  it('routes a protocol GET through Clerk even when it also names HTML', async () => {
    // The one shape that is browser-ish and protocol-ish at once. The
    // protocol leg wins, so auth must too — otherwise the browser skip
    // would be a way to reach the MCP handler with no auth context, which
    // `getAuth` cannot survive.
    const { app, reachedClerk } = await createHarness();

    await request(app)
      .get('/mcp')
      .set('Host', SERVED_HOST)
      .set('Accept', 'text/html, text/event-stream')
      .set('Sec-Fetch-Dest', 'document')
      .set('Cookie', SIGNED_IN_COOKIES);

    expect(reachedClerk).toHaveBeenCalledWith('GET /mcp');
  });
});
