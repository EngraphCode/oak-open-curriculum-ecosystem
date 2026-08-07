import { describe, it, expect } from 'vitest';
import { testShouldSkipClerkMiddleware } from './conditional-clerk-middleware.js';
import { selectsHtmlLeg } from './mcp-middleware.js';

/**
 * The skip decision's own argument type, read off the function rather than
 * restated, so a widened decision cannot leave these cases describing a
 * shape the production caller no longer passes.
 */
type SkipCheckArg = Parameters<typeof testShouldSkipClerkMiddleware>[0];

/** What a browser actually sends on a document navigation. */
const BROWSER_ACCEPT = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';

/** What a conformant MCP client sends on a protocol POST. */
const PROTOCOL_ACCEPT = 'application/json, text/event-stream';

/**
 * Unit tests for conditional Clerk middleware pure functions.
 *
 * These tests verify the skip logic for public paths and resources.
 * Per MCP 2025-11-25: All MCP methods require auth including discovery.
 */
describe('shouldSkipClerkMiddleware', () => {
  describe('public paths', () => {
    it('returns true for OAuth protected resource metadata path', () => {
      const req = createMockRequest('/.well-known/oauth-protected-resource', undefined);
      expect(testShouldSkipClerkMiddleware(req)).toBe(true);
    });

    it('returns true for path-qualified PRM (RFC 9728 Section 3.1)', () => {
      const req = createMockRequest('/.well-known/oauth-protected-resource/mcp', undefined);
      expect(testShouldSkipClerkMiddleware(req)).toBe(true);
    });

    it('returns true for OIDC discovery path', () => {
      const req = createMockRequest('/.well-known/openid-configuration', undefined);
      expect(testShouldSkipClerkMiddleware(req)).toBe(true);
    });

    it('returns true for healthz check path', () => {
      const req = createMockRequest('/healthz', undefined);
      expect(testShouldSkipClerkMiddleware(req)).toBe(true);
    });

    it('returns true for OAuth proxy authorize path', () => {
      const req = createMockRequest('/oauth/authorize', undefined);
      expect(testShouldSkipClerkMiddleware(req)).toBe(true);
    });

    it('returns true for OAuth proxy token path', () => {
      const req = createMockRequest('/oauth/token', undefined);
      expect(testShouldSkipClerkMiddleware(req)).toBe(true);
    });

    it('returns true for OAuth proxy register path', () => {
      const req = createMockRequest('/oauth/register', undefined);
      expect(testShouldSkipClerkMiddleware(req)).toBe(true);
    });
  });

  describe('MCP discovery methods (auth required per MCP 2025-11-25)', () => {
    it('returns false for initialize method', () => {
      const req = createMockRequest('/mcp', { method: 'initialize' });
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });

    it('returns false for tools/list method', () => {
      const req = createMockRequest('/mcp', { method: 'tools/list' });
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });

    it('returns false for resources/list method', () => {
      const req = createMockRequest('/mcp', { method: 'resources/list' });
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });

    it('returns false for prompts/list method', () => {
      const req = createMockRequest('/mcp', { method: 'prompts/list' });
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });

    it('returns false for resources/templates/list method', () => {
      const req = createMockRequest('/mcp', { method: 'resources/templates/list' });
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });

    it('returns false for notifications/initialized method', () => {
      const req = createMockRequest('/mcp', { method: 'notifications/initialized' });
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });
  });

  describe('MCP execution methods (require auth)', () => {
    it('returns false for tools/call method', () => {
      const req = createMockRequest('/mcp', {
        method: 'tools/call',
        params: { name: 'get-key-stages' },
      });
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });

    it('returns false for resources/read method', () => {
      const req = createMockRequest('/mcp', {
        method: 'resources/read',
        params: { uri: 'curriculum://model' },
      });
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });

    it('returns false for prompts/get method', () => {
      const req = createMockRequest('/mcp', {
        method: 'prompts/get',
        params: { name: 'lesson-discovery' },
      });
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('returns false for /mcp path with no body', () => {
      const req = createMockRequest('/mcp', undefined);
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });

    it('returns false for /mcp path with empty object body', () => {
      const req = createMockRequest('/mcp', {});
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });

    it('returns false for /mcp path with non-string method', () => {
      const req = createMockRequest('/mcp', { method: 123 });
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });

    it('returns false for /mcp path with unknown method', () => {
      const req = createMockRequest('/mcp', { method: 'unknown/method' });
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });

    it('returns false for non-MCP paths without discovery method', () => {
      const req = createMockRequest('/api/other', { method: 'tools/list' });
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });

    it('returns false for root path', () => {
      const req = createMockRequest('/', undefined);
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });
  });

  describe('asset download bypass (HMAC-authenticated, no Clerk needed)', () => {
    it('returns true for an asset download path', () => {
      const req = createMockRequest('/assets/download/my-lesson/worksheet', undefined);
      expect(testShouldSkipClerkMiddleware(req)).toBe(true);
    });

    it('returns true for URL-encoded lesson slugs in asset download path', () => {
      const req = createMockRequest('/assets/download/lesson%2Fwith%20spaces/worksheet', undefined);
      expect(testShouldSkipClerkMiddleware(req)).toBe(true);
    });

    it('returns false for /assets path without download subpath', () => {
      const req = createMockRequest('/assets/other', undefined);
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });
  });

  describe('path variations', () => {
    it('returns false for /mcp subpaths with discovery method', () => {
      const req = createMockRequest('/mcp/v1', { method: 'tools/list' });
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });

    it('returns false for paths that start with /mcp prefix but are different', () => {
      const req = createMockRequest('/mcpfake', { method: 'tools/list' });
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });
  });
});

/**
 * The surface fork on `/mcp` (MCP-518).
 *
 * The page there is public unconditionally by owner ruling, so no browser
 * page view may reach Clerk — while every MCP protocol request still must.
 * Each case below differs in ONE header from a case with the opposite
 * outcome, deliberately: a predicate stuck at `true`, stuck at `false`, or
 * inverted fails at least one member of every pair, so none of these
 * assertions can be satisfied by accident.
 */
describe('shouldSkipClerkMiddleware — the surface fork on /mcp', () => {
  describe('public browser leg of /mcp (MCP-518)', () => {
    it('returns true for a browser document GET of the page', () => {
      const req = createMockRequest('/mcp', undefined, {
        method: 'GET',
        accept: BROWSER_ACCEPT,
        secFetchDest: 'document',
      });
      expect(testShouldSkipClerkMiddleware(req)).toBe(true);
    });

    it('returns true for a browser HEAD of the page', () => {
      const req = createMockRequest('/mcp', undefined, {
        method: 'HEAD',
        accept: BROWSER_ACCEPT,
      });
      expect(testShouldSkipClerkMiddleware(req)).toBe(true);
    });

    it('returns true for a document navigation whose Accept names no HTML type', () => {
      // Handshake-eligible at the vendor (Sec-Fetch-Dest: document) even
      // though the negotiation would not serve it: covering only the HTML
      // Accept shape would leave this request redirecting.
      const req = createMockRequest('/mcp', undefined, {
        method: 'GET',
        accept: '*/*',
        secFetchDest: 'document',
      });
      expect(testShouldSkipClerkMiddleware(req)).toBe(true);
    });

    it('returns true for an iframe navigation that sends no Accept at all', () => {
      const req = createMockRequest('/mcp', undefined, {
        method: 'GET',
        secFetchDest: 'iframe',
      });
      expect(testShouldSkipClerkMiddleware(req)).toBe(true);
    });

    it('returns false for a GET naming the stream media type alongside HTML', () => {
      // The protocol leg wins whenever the client names text/event-stream.
      const req = createMockRequest('/mcp', undefined, {
        method: 'GET',
        accept: 'text/html, text/event-stream',
        secFetchDest: 'document',
      });
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });

    it('returns false for a conformant protocol GET', () => {
      const req = createMockRequest('/mcp', undefined, {
        method: 'GET',
        accept: PROTOCOL_ACCEPT,
      });
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });

    it('returns false for a POST carrying a browser Accept', () => {
      // Not a page view and not handshake-eligible: Clerk stays on it.
      const req = createMockRequest(
        '/mcp',
        { method: 'tools/call' },
        {
          method: 'POST',
          accept: BROWSER_ACCEPT,
          secFetchDest: 'document',
        },
      );
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });

    it('returns false for a browser document GET of a path outside the MCP surface', () => {
      const req = createMockRequest('/mcpfake', undefined, {
        method: 'GET',
        accept: BROWSER_ACCEPT,
        secFetchDest: 'document',
      });
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });
  });

  describe("the page's own static assets under the routed base (MCP-518)", () => {
    it('returns true for a stylesheet fetch from the design-system tree', () => {
      const req = createMockRequest('/mcp/oak-ds/styles.css', undefined, {
        method: 'GET',
        accept: 'text/css,*/*;q=0.1',
        secFetchDest: 'style',
      });
      expect(testShouldSkipClerkMiddleware(req)).toBe(true);
    });

    it('returns true for an image fetch from the brand-asset tree', () => {
      const req = createMockRequest(
        '/mcp/oak-assets/assets/oak-national-academy-logo-512.png',
        undefined,
        { method: 'GET', accept: 'image/avif,image/webp,*/*', secFetchDest: 'image' },
      );
      expect(testShouldSkipClerkMiddleware(req)).toBe(true);
    });

    it('returns false for a same-shaped fetch on a path outside those trees', () => {
      const req = createMockRequest('/mcp/oak-other/styles.css', undefined, {
        method: 'GET',
        accept: 'text/css,*/*;q=0.1',
        secFetchDest: 'style',
      });
      expect(testShouldSkipClerkMiddleware(req)).toBe(false);
    });
  });

  /**
   * One predicate, two call sites: whatever the negotiation will serve as
   * the page must also have skipped Clerk. Asserted as an implication over a
   * matrix rather than by inspecting the source, so a second predicate that
   * happened to agree would pass and one that disagreed anywhere would fail.
   */
  describe('agreement with the HTML negotiation', () => {
    const methods = ['GET', 'HEAD', 'POST'] as const;
    const accepts = [
      undefined,
      '*/*',
      BROWSER_ACCEPT,
      'text/html',
      'application/xhtml+xml',
      PROTOCOL_ACCEPT,
      'text/html, text/event-stream',
      'application/json',
    ];

    it('skips Clerk for every request the negotiation serves the page to', () => {
      const served = methods.flatMap((method) =>
        accepts
          .filter((accept) => selectsHtmlLeg(method, accept))
          .map((accept) => ({ method, accept })),
      );

      // Guards the implication against being vacuously true: if the matrix
      // stopped containing served requests, the loop below would assert
      // nothing while still passing.
      expect(served.length).toBeGreaterThan(0);

      for (const { method, accept } of served) {
        expect(
          testShouldSkipClerkMiddleware(createMockRequest('/mcp', undefined, { method, accept })),
          `negotiation serves ${method} with Accept ${String(accept)} but Clerk was not skipped`,
        ).toBe(true);
      }
    });

    it('leaves Clerk on every request the negotiation refuses as protocol traffic', () => {
      const protocolShaped = methods.flatMap((method) =>
        [PROTOCOL_ACCEPT, 'text/html, text/event-stream'].map((accept) => ({ method, accept })),
      );

      for (const { method, accept } of protocolShaped) {
        expect(selectsHtmlLeg(method, accept)).toBe(false);
        expect(
          testShouldSkipClerkMiddleware(
            createMockRequest('/mcp', undefined, { method, accept, secFetchDest: 'document' }),
          ),
          `${method} with Accept ${accept} is protocol traffic and must reach Clerk`,
        ).toBe(false);
      }
    });
  });
});

/**
 * Creates a minimal mock request object for testing shouldSkipClerkMiddleware.
 *
 * @param path - The request path
 * @param body - The request body (JSON-RPC method)
 * @param surface - Method and negotiation headers; defaults describe the
 *   protocol shape (a POST naming no media type), so every pre-existing case
 *   keeps meaning what it meant before the browser leg existed.
 * @returns Mock request object for the skip decision
 */
function createMockRequest(
  path: string,
  body: unknown,
  surface: { method?: string; accept?: string; secFetchDest?: string } = {},
): SkipCheckArg {
  return {
    path,
    body,
    method: surface.method ?? 'POST',
    accept: surface.accept,
    secFetchDest: surface.secFetchDest,
  };
}
