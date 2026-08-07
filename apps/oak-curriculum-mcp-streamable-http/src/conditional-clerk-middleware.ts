/**
 * Conditional Clerk middleware that skips auth context setup for non-MCP routes.
 *
 * ## Why This Exists
 *
 * The standard `clerkMiddleware()` runs on every request to set up auth context.
 * Non-MCP routes (health checks, OAuth metadata), public resource reads
 * (documentation URIs) and the MCP endpoint's public browser leg do not need
 * Clerk auth context.
 *
 * ## What Skips Clerk
 *
 * - **Path-based**: `/.well-known/*`, `/healthz`, `/oauth/*` (RFC 9728, health checks)
 * - **Prefix-based**: HMAC-signed asset downloads, and the landing page's own
 *   static asset trees under the routed base
 * - **Public resources**: `resources/read` for documentation URIs
 * - **The browser leg of `/mcp`**: the page served there is fully public by
 *   owner ruling (MCP-518), so the surface fork must precede auth involvement
 *   rather than follow it
 *
 * ## What Does NOT Skip Clerk
 *
 * Per MCP 2025-11-25: "Authorization MUST be included in every HTTP request
 * from client to server." All MCP methods including discovery (initialize,
 * tools/list) go through Clerk. If latency becomes a concern, cache JWKS --
 * do not skip auth.
 *
 * @see https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization
 */

import type { RequestHandler, Request, Response, NextFunction } from 'express';
import type { Logger } from '@oaknational/logger';
import { getResourceUriFromBody } from './auth/mcp-body-parser.js';
import { isPublicResourceUri } from './auth/public-resources.js';
import { selectsPublicBrowserLeg, type BrowserLegRequest } from './mcp-public-browser-leg.js';
import {
  OAK_ASSETS_PUBLIC_DIRNAME,
  OAK_DS_PUBLIC_DIRNAME,
  ROUTED_ASSET_BASE,
} from './app/static-asset-paths.js';

/**
 * Paths that should always skip clerkMiddleware.
 * OAuth metadata endpoints must be publicly accessible per RFC 9728.
 */
const CLERK_SKIP_PATHS: ReadonlySet<string> = new Set([
  '/.well-known/oauth-protected-resource',
  '/.well-known/oauth-protected-resource/mcp',
  '/.well-known/oauth-authorization-server',
  '/.well-known/openid-configuration',
  '/healthz',
  '/oauth/authorize',
  '/oauth/token',
  '/oauth/register',
]);

/**
 * Type guard for object with method property.
 */
function hasMethodProperty(value: unknown): value is { method: unknown } {
  return typeof value === 'object' && value !== null && 'method' in value;
}

/**
 * Extracts MCP method from request body.
 */
function getMcpMethodFromBody(body: unknown): string | undefined {
  if (hasMethodProperty(body) && typeof body.method === 'string') {
    return body.method;
  }
  return undefined;
}

/**
 * Minimal request interface for skip logic.
 * Only contains the properties actually used by shouldSkipClerkMiddleware.
 *
 * @remarks
 * Plain data, extracted by the caller rather than an Express `Request`
 * narrowed by structural typing. The surface fork is decided by the
 * request's method and its negotiation headers, so carrying them as values
 * keeps every case describable from literals — and keeps the header names
 * spelled once, at the one place that reads them off the wire. The
 * negotiation fields are inherited from {@link BrowserLegRequest} rather
 * than restated, so this interface cannot fall behind the predicate.
 */
interface SkipCheckRequest extends BrowserLegRequest {
  path: string;
  body: unknown;
}

/**
 * Checks if an MCP method should skip Clerk authentication.
 *
 * Only public resource reads skip Clerk. All other MCP methods
 * require auth per MCP 2025-11-25.
 *
 * @param mcpMethod - The MCP method from request body
 * @param body - Request body for extracting resource URI
 * @returns true if the method should skip auth
 */
function shouldMcpMethodSkipClerk(mcpMethod: string, body: unknown): boolean {
  if (mcpMethod === 'resources/read') {
    const uri = getResourceUriFromBody(body);
    if (uri && isPublicResourceUri(uri)) {
      return true;
    }
  }
  return false;
}

/**
 * Path prefixes that should skip clerkMiddleware.
 *
 * @remarks
 * Asset download routes are self-authenticating via HMAC signature (ADR-126).
 *
 * The design-system and brand trees are the public landing page's own
 * subresources (MCP-518). They are static files with no session-dependent
 * content, and they sit under the routed base only because the edge forwards
 * `/mcp*` and nothing else — a shared prefix, never a shared auth contract.
 * Composed from the same constants the static mount and the page's markup
 * use, so a change to the served layout moves the skip with it instead of
 * leaving a stale literal behind.
 */
const CLERK_SKIP_PREFIXES: readonly string[] = [
  '/assets/download/',
  `${ROUTED_ASSET_BASE}/${OAK_DS_PUBLIC_DIRNAME}/`,
  `${ROUTED_ASSET_BASE}/${OAK_ASSETS_PUBLIC_DIRNAME}/`,
];

function shouldSkipClerkMiddleware(req: SkipCheckRequest): boolean {
  // Skip for known public paths
  if (CLERK_SKIP_PATHS.has(req.path)) {
    return true;
  }

  // Skip for prefix-matched paths (parameterised routes)
  if (CLERK_SKIP_PREFIXES.some((prefix) => req.path.startsWith(prefix))) {
    return true;
  }

  // For /mcp endpoints, fork on the surface first, then on the MCP method.
  // Check exact /mcp path or /mcp/ subpaths, not paths that happen to start with /mcp
  if (req.path === '/mcp' || req.path.startsWith('/mcp/')) {
    if (selectsPublicBrowserLeg(req)) {
      return true;
    }
    const mcpMethod = getMcpMethodFromBody(req.body);
    if (mcpMethod && shouldMcpMethodSkipClerk(mcpMethod, req.body)) {
      return true;
    }
  }

  return false;
}

/**
 * Creates a conditional clerkMiddleware that skips auth setup for discovery methods.
 *
 * @param clerkMw - The actual clerkMiddleware to conditionally apply
 * @param logger - Logger for debug output
 * @returns Express middleware that conditionally applies clerkMiddleware
 */
export function createConditionalClerkMiddleware(
  clerkMw: RequestHandler,
  logger: Logger,
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const skipCheck: SkipCheckRequest = {
      path: req.path,
      body: req.body,
      method: req.method,
      accept: req.get('Accept'),
      secFetchDest: req.get('Sec-Fetch-Dest'),
    };
    if (shouldSkipClerkMiddleware(skipCheck)) {
      const mcpMethod = getMcpMethodFromBody(req.body);
      logger.debug('clerkMiddleware skipped for discovery/public method', {
        path: req.path,
        mcpMethod,
      });
      next();
      return;
    }

    // Run clerkMiddleware for requests that might need auth
    clerkMw(req, res, next);
  };
}

/**
 * Type guard to check if shouldSkipClerkMiddleware is available.
 * Exported for testing.
 */
export { shouldSkipClerkMiddleware as testShouldSkipClerkMiddleware };
