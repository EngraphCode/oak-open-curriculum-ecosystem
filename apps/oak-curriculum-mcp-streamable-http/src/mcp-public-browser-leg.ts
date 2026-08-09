/**
 * Which requests to the MCP endpoint belong to its fully public browser leg.
 *
 * ## Why This Exists
 *
 * The web page at `/mcp` is public unconditionally by owner ruling (MCP-518),
 * while the MCP server on the same URL follows the coded OAuth flow. The auth
 * contract is per-surface, so deciding which surface a request belongs to has
 * to be the FIRST auth-relevant act — not something that happens after the
 * auth vendor has already inspected the request and possibly answered it.
 *
 * This module is that decision, kept apart from both consumers: the
 * negotiation that serves the page (`mcp-middleware.ts`) and the conditional
 * that keeps Clerk off it (`conditional-clerk-middleware.ts`). It is where
 * the one vendor-specific fact in the fork lives, so the negotiation stays
 * free of any knowledge of who is authenticating.
 *
 * @see mcp-middleware.ts — `selectsHtmlLeg`, the serving half of the fork
 * @see conditional-clerk-middleware.ts — the skip half
 */

import { selectsHtmlLeg } from './mcp-middleware.js';

/**
 * `Sec-Fetch-Dest` values the auth vendor reads as a document request.
 *
 * @remarks
 * Taken from the pinned vendor source, not inferred:
 * `HandshakeService.isRequestEligibleForHandshake` in `@clerk/backend@3.13.1`
 * forces the redirect handshake for a GET when `Sec-Fetch-Dest` is `document`
 * or `iframe`, or — with that header absent — when `Accept` starts with
 * `text/html`. Re-read this list against the vendor on a version bump: it is
 * a copy of somebody else's condition, and the copy is what goes stale.
 */
const NAVIGATION_FETCH_DESTS: ReadonlySet<string> = new Set(['document', 'iframe']);

/** The media type that marks a request as MCP protocol traffic. */
const EVENT_STREAM_MEDIA_TYPE = 'text/event-stream';

/** The request properties the surface fork is decided from. */
export interface BrowserLegRequest {
  /** HTTP method: the browser leg is GET/HEAD only. */
  readonly method: string;
  /** `Accept` verbatim, or undefined when the client sent none. */
  readonly accept: string | undefined;
  /** `Sec-Fetch-Dest` verbatim; browsers set it on navigations. */
  readonly secFetchDest: string | undefined;
}

/**
 * True when `Accept` names the MCP stream media type.
 *
 * @remarks
 * The safety hinge of the whole fork. `createEnsureMcpAcceptHeader` answers
 * 406 to any `/mcp` request whose `Accept` omits this media type, and it is
 * mounted ahead of the auth-enforced routes — so a request without it can
 * never reach a handler that reads auth state. Matching the raw header
 * case-insensitively is deliberately WIDER than that gate's own
 * case-sensitive check: erring wide here can only leave auth switched on for
 * a request, never switch it off for one.
 */
function namesEventStream(accept: string | undefined): boolean {
  return (accept ?? '').toLowerCase().includes(EVENT_STREAM_MEDIA_TYPE);
}

/**
 * True for a request to the MCP endpoint's fully public browser leg.
 *
 * @remarks
 * Two clauses, and both are needed:
 *
 * 1. {@link selectsHtmlLeg} — the SAME predicate the negotiation serves the
 *    page by, imported rather than restated, so what bypasses auth and what
 *    receives the page cannot drift apart.
 * 2. A document or iframe navigation the vendor finds handshake-eligible even
 *    though the negotiation will not serve it: `Sec-Fetch-Dest` says
 *    navigation while `Accept` names no HTML type. Clause 1 alone would be
 *    narrower than the class the vendor redirects, which is the defect
 *    MCP-518 exists to close.
 *
 * The protocol leg is excluded first and unconditionally: a request naming
 * `text/event-stream` keeps its auth machinery however browser-shaped it
 * otherwise looks. That is what stops this predicate from becoming a way to
 * reach the MCP handler with no auth context — which `getAuth` cannot
 * survive, so it would be an outage rather than a bypass.
 *
 * @param req - Method and negotiation headers, read off the request
 * @returns true when the request is a public page view, never protocol traffic
 */
export function selectsPublicBrowserLeg(req: BrowserLegRequest): boolean {
  if (namesEventStream(req.accept)) {
    return false;
  }
  if (selectsHtmlLeg(req.method, req.accept)) {
    return true;
  }
  return req.method === 'GET' && NAVIGATION_FETCH_DESTS.has((req.secFetchDest ?? '').toLowerCase());
}
