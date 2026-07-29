/**
 * HTTP response senders for the MCP auth middleware.
 *
 * Each sender writes one terminal auth outcome: the 401 family carries a
 * `WWW-Authenticate` challenge pointing at the PRM document (triggering
 * OAuth discovery in MCP clients, per the MCP spec's 401 requirement); the
 * 403 deliberately carries no challenge — a disallowed Host is not an auth
 * failure, and pointing such a client at metadata would echo an address
 * this server does not answer to.
 */

import type { Request, Response } from 'express';
import type { Logger } from '@oaknational/logger';
import {
  hostValidationErrorMessage,
  type HostValidationError,
} from '../../host-validation-error.js';

/**
 * Send 401 response with WWW-Authenticate header for missing authorization.
 * This triggers OAuth discovery in MCP clients.
 */
export function sendMissingAuthResponse(res: Response, prmUrl: string): void {
  res
    .status(401)
    .set({ 'WWW-Authenticate': `Bearer resource_metadata="${prmUrl}"` })
    .send({ error: 'Unauthorized' });
}

/**
 * Send 401 response for invalid Bearer token format.
 */
export function sendInvalidFormatResponse(res: Response, prmUrl: string): void {
  res
    .status(401)
    .set({
      'WWW-Authenticate': `Bearer resource_metadata="${prmUrl}", error="invalid_request", error_description="Invalid Authorization header format. Must be 'Bearer <token>'."`,
    })
    .send({
      error: 'Unauthorized',
      message: 'Invalid Authorization header format.',
    });
}

/**
 * Send 401 response for failed token verification.
 */
export function sendVerificationFailedResponse(res: Response, prmUrl: string): void {
  res
    .status(401)
    .set({
      'WWW-Authenticate': `Bearer resource_metadata="${prmUrl}", error="invalid_token", error_description="Token verification failed"`,
    })
    .json({ error: 'Unauthorized' });
}

/**
 * Send 401 response for invalid resource parameter (audience mismatch).
 */
export function sendInvalidResourceResponse(res: Response, prmUrl: string, reason: string): void {
  res
    .status(401)
    .set({
      'WWW-Authenticate': `Bearer resource_metadata="${prmUrl}", error="invalid_token", error_description="${reason}"`,
    })
    .send({
      error: 'Unauthorized',
      message: reason,
    });
}

/**
 * Send 403 response for a request whose Host failed validation.
 *
 * Deliberately carries no `WWW-Authenticate` header (see module doc).
 */
export function sendHostValidationForbidden(
  error: HostValidationError,
  req: Request,
  res: Response,
  logger: Logger,
): void {
  logger.warn('Rejected request due to invalid or disallowed Host header', {
    error: hostValidationErrorMessage(error),
    path: req.path,
    method: req.method,
  });
  res.status(403).json({ error: 'Forbidden' });
}
