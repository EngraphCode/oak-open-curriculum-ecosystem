/**
 * Registration-time `redirect_uris` validation for the OAuth proxy (MCP-188).
 *
 * RFC 9700 §2.1: an authorization server MUST NOT allow redirection URIs
 * using the `http` scheme except for loopback redirection as described in
 * RFC 8252 §7.3. Because the proxy advertises itself as the issuer and
 * registration endpoint (see `oauth-proxy-upstream.ts` metadata rewriting),
 * that obligation attaches here — see ADR-115 §Transparent Passthrough, as
 * amended.
 *
 * The validator is TOTAL: it never throws. `asyncRoute` converts any throw
 * into a 500, so a throw here would turn a legitimate registration into a
 * server error.
 */

import type { Response as ExpressResponse } from 'express';

import { formatProxyErrorResponse } from './oauth-proxy-upstream.js';

/**
 * IPv4 loopback is the whole `127.0.0.0/8` range per RFC 8252 §7.3, not just
 * `127.0.0.1` — a client registering `http://127.0.0.2/callback` is
 * standards-compliant and must not be refused.
 *
 * FULLY ANCHORED, and applied only to `URL.hostname`, which the WHATWG parser
 * has already canonicalised (`127.1` and `0x7f000001` both arrive as
 * `127.0.0.1`). The anchoring is what makes widening safe: a prefix test such
 * as `startsWith('127.')` would accept `127.evil.example`, re-introducing the
 * cleartext code leak this validation exists to prevent.
 */
const IPV4_LOOPBACK = /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/u;

/**
 * Non-IPv4 hosts for which an `http` redirect URI is permissible.
 *
 * `[::1]` is RFC 8252 §7.3's IPv6 loopback literal — `URL.hostname` retains
 * the brackets, so the bracketed form is what a comparison sees. `localhost`
 * is RFC 8252 §8.3: permitted though NOT RECOMMENDED, and required by
 * Inspector-class clients. Both are matched by EXACT EQUALITY.
 */
const LOOPBACK_HOSTNAMES: ReadonlySet<string> = new Set(['[::1]', 'localhost']);

function isLoopbackHostname(hostname: string): boolean {
  return LOOPBACK_HOSTNAMES.has(hostname) || IPV4_LOOPBACK.test(hostname);
}

/** A registration rejected at the redirect-URI boundary. */
export interface RedirectUriRejection {
  /** RFC 7591 §3.2.2 error code. */
  readonly error: 'invalid_redirect_uri' | 'invalid_client_metadata';
  /**
   * Client-facing description. STATIC by construction — the submitted URI is
   * never echoed. `/oauth/register` is unauthenticated, so the request body is
   * hostile input, and the response is rendered in MCP client terminals.
   */
  readonly description: string;
  /** Short code for logs and span attributes. Never contains request data. */
  readonly reason: string;
}

const NOT_AN_ARRAY: RedirectUriRejection = {
  error: 'invalid_client_metadata',
  description: 'redirect_uris must be an array of redirect URI strings',
  reason: 'redirect_uris_not_an_array',
};

const NOT_A_STRING: RedirectUriRejection = {
  error: 'invalid_redirect_uri',
  description: 'every redirect_uris entry must be a string',
  reason: 'entry_not_a_string',
};

const UNPARSEABLE: RedirectUriRejection = {
  error: 'invalid_redirect_uri',
  description: 'every redirect_uris entry must be an absolute URI',
  reason: 'entry_unparseable',
};

const HTTP_NOT_LOOPBACK: RedirectUriRejection = {
  error: 'invalid_redirect_uri',
  description: 'an http redirect_uri is permitted only for loopback addresses',
  reason: 'http_host_not_loopback',
};

/**
 * The ONLY refusal this boundary makes, and deliberately so.
 *
 * ADR-115's advertised-AS exception permits refusing exactly what a cited
 * OAuth clause obliges us to refuse and the upstream is demonstrated not to
 * refuse, and forbids refusals of our own devising — scheme preferences
 * included. Non-loopback `http` is the one case meeting all three tests.
 *
 * Hardening beyond it (script/local-resource schemes, userinfo on web URIs)
 * was drafted and REMOVED before merge: neither carries a cited clause nor a
 * demonstrated upstream gap, so shipping them would have violated the
 * constraint recorded in the same change. Establishing that evidence is
 * MCP-200; until then a value we are not obliged to refuse is forwarded to
 * the upstream authorisation server unchanged.
 */
function rejectionForParsedUri(parsed: URL): RedirectUriRejection | undefined {
  if (parsed.protocol === 'http:' && !isLoopbackHostname(parsed.hostname)) {
    return HTTP_NOT_LOOPBACK;
  }
  return undefined;
}

function rejectionForEntry(entry: unknown): RedirectUriRejection | undefined {
  if (typeof entry !== 'string') {
    return NOT_A_STRING;
  }
  // `URL.parse` returns null rather than throwing, which keeps this function
  // total without a caught-error branch.
  const parsed = URL.parse(entry);
  if (parsed === null) {
    return UNPARSEABLE;
  }
  return rejectionForParsedUri(parsed);
}

/**
 * Returns the rejection for the first non-conformant `redirect_uris` entry, or
 * `undefined` when the registration may be forwarded upstream.
 *
 * An absent, empty, or non-object body passes through: it cannot produce a bad
 * redirect, and whether a client may register without redirect URIs is the
 * upstream authorization server's policy. A `redirect_uris` value that is
 * present but not iterable is REJECTED rather than skipped — skipping it would
 * let `{"redirect_uris": "http://evil.example/cb"}` bypass validation entirely.
 */
export function findRedirectUriRejection(body: unknown): RedirectUriRejection | undefined {
  if (typeof body !== 'object' || body === null || !('redirect_uris' in body)) {
    return undefined;
  }
  const redirectUris: unknown = body.redirect_uris;
  if (!Array.isArray(redirectUris)) {
    return NOT_AN_ARRAY;
  }
  for (const entry of redirectUris) {
    const rejection = rejectionForEntry(entry);
    if (rejection !== undefined) {
      return rejection;
    }
  }
  return undefined;
}

/** Structured logger surface needed to record a rejection. */
interface RejectionLogger {
  warn(message: string, context: Record<string, string>): void;
}

/**
 * Emits the RFC 7591 §3.2.2 error response for a rejected registration.
 *
 * Lives beside the validator rather than in the handler so the registration
 * handler stays inside its per-function length ceiling. Deliberately does NOT
 * call `captureHandledError`: this endpoint is public and unauthenticated, so
 * routing expected client-input errors to the error tracker would hand any
 * caller an event-generation primitive. The codebase already reserves that
 * call for proxy-internal failures.
 */
export function respondInvalidRedirectUri(
  rejection: RedirectUriRejection,
  res: ExpressResponse,
  logger: RejectionLogger,
  span: { setAttribute(name: string, value: string): void },
): void {
  span.setAttribute('oak.oauth.register.rejected', rejection.reason);
  logger.warn('oauth-proxy.register.rejected', {
    route: '/oauth/register',
    reason: rejection.reason,
  });
  res.status(400).json(formatProxyErrorResponse(rejection.error, rejection.description));
}
