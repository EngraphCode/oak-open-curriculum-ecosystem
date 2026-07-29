/**
 * MCP OAuth authentication middleware.
 *
 * Generic authentication middleware for MCP that enforces OAuth token verification.
 * Returns HTTP 401 + WWW-Authenticate header for auth failures, per MCP spec.
 *
 * ## Auth Model
 *
 * Per MCP spec: "Invalid or expired tokens MUST receive a HTTP 401 response"
 * Per OpenAI Apps: "If verification fails, respond with 401 Unauthorized"
 *
 * This middleware runs BEFORE the MCP SDK, allowing proper HTTP 401 responses.
 *
 */

import type { RequestHandler, Request, Response, NextFunction } from 'express';
import type { Logger } from '@oaknational/logger';
import type { TokenVerifier } from './types.js';
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';

// Local declaration merge: augments Express Request with `auth?: AuthInfo`.
// Replaces the `import type {} from '.../bearerAuth.js'` side-effect import.
// Both paths reach the SDK via the `"./*"` catch-all wildcard (not a named
// export), but `server/auth/types.js` is a pure-type leaf file — less likely
// to move than the middleware module. If the SDK promotes `AuthInfo` to a
// named export, update this import path to match.
// REMOVAL CONDITION: if @modelcontextprotocol/sdk re-exports bearerAuth's
// augmentation of Request.auth as part of its public API, remove this local
// declaration to avoid merge duplication.
declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthInfo;
  }
}
import { getPRMUrl } from './get-prm-url.js';
import { getMcpResourceUrl } from './get-mcp-resource-url.js';
import { validateResourceParameter } from '../../resource-parameter-validator.js';
import type { HostValidationError } from '../../host-validation-error.js';
import { ok, type Result } from '@oaknational/result';
import {
  sendHostValidationForbidden,
  sendInvalidFormatResponse,
  sendInvalidResourceResponse,
  sendMissingAuthResponse,
  sendVerificationFailedResponse,
} from './mcp-auth-responses.js';

/** The two self-URLs an authenticated request needs, derived together. */
interface AuthUrls {
  readonly prmUrl: string;
  readonly expectedResource: string;
}

/**
 * Derives the PRM URL and the RFC 8707 expected resource for the request.
 * Both come from the same validated origin, so they fail together — one
 * `Err` maps to one 403.
 */
function deriveAuthUrls(
  req: Request,
  allowedHosts: readonly string[],
  canonicalOrigin?: string,
): Result<AuthUrls, HostValidationError> {
  const prmUrlResult = getPRMUrl(req, allowedHosts, canonicalOrigin);
  if (!prmUrlResult.ok) {
    return prmUrlResult;
  }
  const resourceResult = getMcpResourceUrl(req, allowedHosts, canonicalOrigin);
  if (!resourceResult.ok) {
    return resourceResult;
  }
  return ok({ prmUrl: prmUrlResult.value, expectedResource: resourceResult.value });
}

/**
 * Extract Bearer token from authorization header.
 * Returns token string or undefined if format is invalid.
 */
function extractBearerToken(authHeader: string): string | undefined {
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  return undefined;
}

/**
 * Runs the three token steps — presence, format, verification — responding
 * 401 (with the PRM pointer) at the first failure. Returns the token and
 * its verified `AuthInfo` on success; `undefined` means a response has
 * already been sent.
 *
 * CodeQL `js/user-controlled-bypass` alert #225 flags the `authorization`
 * presence check below as "a user-provided value controls a condition that
 * guards a sensitive action". The rule targets servers that decide WHICH
 * permission to check from user data — its canonical example compares a
 * forgeable cookie against a URL parameter to decide whether to require a
 * login. That is not this shape: the client-supplied header is not an input
 * to the authorisation decision, it IS the credential being verified, and
 * the guard's polarity is the inverse of the rule's pattern — the value
 * being ABSENT short-circuits to 401, being PRESENT routes into
 * verification. Absence is rejection, not bypass.
 *
 * The invariant this middleware holds: **no request leaves `mcpAuth` via
 * `next()` unless `verifyToken` returned a truthy `AuthInfo`**. It is
 * asserted over the states a client controls in
 * `mcp-auth.integration.test.ts` ("no unverified request reaches next()"),
 * which is what the alert dismissal cites.
 *
 * Scope that sentence to THIS middleware, deliberately. It is NOT a claim
 * about the `/mcp` route: `createMcpRouter` (`mcp-router.ts`) calls `next()`
 * directly for a `resources/read` of a public resource URI, so such a
 * request never enters `mcpAuth` at all. That exception is designed
 * (ADR-057 / ADR-113 / ADR-205) and fail-closed — membership is exact-string
 * against a frozen `Set` in `auth/public-resources.ts`, with no prefix or
 * normalisation slack — but it is a route-level bypass of this file, and an
 * attestation that claimed otherwise would be overclaiming.
 *
 * Note also that this file's `catch` calls `next(error)`, which enters
 * Express's error pipeline and skips the remaining route handlers rather
 * than reaching the MCP handler — an Express guarantee, verified against
 * this app's own express version during the alert review.
 */
async function verifyRequestToken(
  req: Request,
  res: Response,
  prmUrl: string,
  verifyToken: TokenVerifier,
): Promise<{ token: string; authData: AuthInfo } | undefined> {
  if (!req.headers.authorization) {
    sendMissingAuthResponse(res, prmUrl);
    return undefined;
  }
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    sendInvalidFormatResponse(res, prmUrl);
    return undefined;
  }
  const authData = await verifyToken(token, req);
  if (!authData) {
    sendVerificationFailedResponse(res, prmUrl);
    return undefined;
  }
  return { token, authData };
}

/**
 * Creates MCP authentication middleware with custom token verification.
 *
 * Returns middleware that:
 * 1. Derives the PRM URL; a failed Host validation is an explicit 403
 * 2. Returns 401 with WWW-Authenticate header if no authorization header
 * 3. Extracts and validates Bearer token format
 * 4. Calls custom verifyToken function for actual verification
 * 5. Returns 401 if token verification fails
 * 6. Validates JWT audience claim matches the resource URL (RFC 8707)
 * 7. Returns 401 if audience validation fails
 * 8. Sets verified `AuthInfo` on `req.auth` for the MCP SDK transport
 * 9. Calls next() if all checks pass
 *
 * **RFC 8707 Compliance**: This middleware validates that the JWT's `aud`
 * (audience) claim matches the expected resource URL to prevent token misuse
 * across different services. The expected resource is the fixed `/mcp`
 * path on the derived self-origin — exactly what the PRM document
 * advertises.
 *
 * @param verifyToken - Custom function to verify the OAuth token
 * @param logger - Logger for authentication events
 * @returns Express middleware that enforces authentication
 *
 * @see https://www.rfc-editor.org/rfc/rfc8707.html
 *
 * @example
 * ```typescript
 * const auth = mcpAuth(async (token, req) => {
 *   // Custom token verification logic
 *   return verifyMyToken(token);
 * }, logger, allowedHosts);
 * app.post('/mcp', auth, mcpHandler);
 * ```
 */
export function mcpAuth(
  verifyToken: TokenVerifier,
  logger: Logger,
  allowedHosts: readonly string[],
  canonicalOrigin?: string,
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const urlsResult = deriveAuthUrls(req, allowedHosts, canonicalOrigin);
      if (!urlsResult.ok) {
        sendHostValidationForbidden(urlsResult.error, req, res, logger);
        return;
      }
      const { prmUrl, expectedResource } = urlsResult.value;

      // Presence, format, verification — 401s are sent inside the helper
      const verified = await verifyRequestToken(req, res, prmUrl, verifyToken);
      if (!verified) {
        return;
      }

      // RFC 8707: Validate resource parameter (JWT audience claim)
      const validation = validateResourceParameter(verified.token, expectedResource, logger);
      if (!validation.valid) {
        sendInvalidResourceResponse(res, prmUrl, validation.reason ?? 'Unknown validation error');
        return;
      }

      // Set verified AuthInfo on req.auth for the MCP SDK transport.
      // Direct assignment matches the SDK's own requireBearerAuth pattern.
      // The MCP SDK augments IncomingMessage with `auth?: AuthInfo`.
      req.auth = verified.authData;

      next();
    } catch (error) {
      logger.error('MCP auth middleware error', {
        error: error instanceof Error ? error.message : String(error),
        path: req.path,
        method: req.method,
      });
      next(error);
    }
  };
}
