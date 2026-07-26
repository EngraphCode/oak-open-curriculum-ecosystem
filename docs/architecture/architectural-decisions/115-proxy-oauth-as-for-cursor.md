# ADR-115: Proxy OAuth Authorisation Server for Cursor Compatibility

## Status

Accepted (2026-02-21). Amended 2026-05-10 to clarify that "transparent
passthrough" means protocol payload passthrough, not absence of protective
traffic controls. Amended 2026-07-26 (MCP-188) to scope transparency against
request validation that a cited OAuth clause obliges the _advertised_
authorisation server to perform and that the upstream is demonstrated not to
perform.

**Related**: [ADR-052 (OAuth 2.1)](052-oauth-2.1-for-mcp-http-authentication.md), [ADR-053 (Clerk)](053-clerk-as-identity-provider.md), [ADR-113 (Spec-Compliant Auth)](113-mcp-spec-compliant-auth-for-all-methods.md)

## Context

Cursor (v2.5.20 and later) cannot complete the MCP OAuth flow when the resource server (RS) and authorisation server (AS) are on different origins. This is a [confirmed Cursor bug](https://forum.cursor.com/t/mcp-oauth-callback-loses-authorization-server-url-discovered-from-resource-metadata-causing-token-exchange-failure/151331) where the `resource_metadata` URL from the initial 401 `WWW-Authenticate` header is not persisted across the browser redirect. After the user authorises at Clerk, Cursor cannot re-discover the AS token endpoint, and the token exchange fails silently.

This affects all configurations where the RS and AS are on different origins:

- `http://localhost:3333` (RS) vs `https://native-hippo-15.clerk.accounts.dev` (AS)
- `https://curriculum-mcp.oaknational.dev` (RS) vs `https://native-hippo-15.clerk.accounts.dev` (AS)

MCP Inspector and programmatic clients (e.g. `pnpm smoke:oauth:spec`) are unaffected — the bug is specific to Cursor's `resource_metadata` persistence.

### Options Considered

| Option                      | Description                                 | Verdict                                  |
| --------------------------- | ------------------------------------------- | ---------------------------------------- |
| **A: Proxy OAuth AS**       | Server acts as its own AS, proxies to Clerk | **Accepted**                             |
| B: Wait for Cursor fix      | Bug is reported, fix is straightforward     | Rejected — unpredictable release cadence |
| C: Dedicated `/cursor` path | Cursor-specific metadata                    | Rejected — does not fix root cause       |

## Decision

Act as a **proxy OAuth Authorisation Server** by serving three proxy endpoints that transparently forward all OAuth operations to Clerk. This makes the RS and AS the same origin, bypassing the Cursor bug.

### Proxy Endpoints

| Route                  | Proxy behaviour                                                                                                                                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /oauth/register` | Forwards JSON body to Clerk's DCR endpoint and relays the response per the response-handling policy under Error Handling — except a body whose `redirect_uris` the advertised-AS rule below obliges us to refuse, which is rejected 400 with no upstream call |
| `GET /oauth/authorize` | Constructs redirect URL to Clerk's authorise endpoint with all query params                                                                                                                                                                                   |
| `POST /oauth/token`    | Forwards raw `application/x-www-form-urlencoded` body to Clerk's token endpoint                                                                                                                                                                               |

### Metadata Rewriting

- **PRM** (`/.well-known/oauth-protected-resource` and path-qualified `/mcp` variant per RFC 9728 Section 3.1): `authorization_servers` points to self-origin.
- **AS Metadata** (`/.well-known/oauth-authorization-server`): Fetched from Clerk at startup, cached for process lifetime. `issuer`, `authorization_endpoint`, `token_endpoint`, `registration_endpoint` rewritten to self-origin per-request. All capability fields (`scopes_supported`, `grant_types_supported`, etc.) pass through unchanged.

### Architecture

```text
                    ┌─────────────────────────────────────────┐
                    │           Our MCP Server                │
                    │                                         │
                    │  ┌──────────────────────────────────┐   │
                    │  │  OAuth Proxy Layer                │   │
                    │  │  /oauth/authorize  → Clerk        │   │
                    │  │  /oauth/token      → Clerk        │   │
                    │  │  /oauth/register   → Clerk        │   │
                    │  └──────────────────────────────────┘   │
                    │                                         │
                    │  ┌──────────────────────────────────┐   │
                    │  │  OAuth Metadata                   │   │
                    │  │  /.well-known/oauth-protected-    │   │
                    │  │    resource → AS points to self   │   │
                    │  │  /.well-known/oauth-authorization-│   │
                    │  │    server → rewritten from Clerk  │   │
                    │  └──────────────────────────────────┘   │
                    │                                         │
                    │  ┌──────────────────────────────────┐   │
                    │  │  MCP Endpoint (UNCHANGED)         │   │
                    │  │  /mcp → Clerk token verification  │   │
                    │  └──────────────────────────────────┘   │
                    └─────────────────────────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────────┐
                    │           Clerk (Upstream AS)           │
                    │  /oauth/authorize                       │
                    │  /oauth/token                           │
                    │  /oauth/register                        │
                    │  Token introspection / JWKS             │
                    └─────────────────────────────────────────┘
```

## Rationale

### Transparent Passthrough

The proxy is a transparent protocol pipe. It does not alter OAuth payloads,
filter client parameters, or perform its own OAuth grant validation. Clerk is
the real authorisation server and handles OAuth security decisions. Two scoped
exceptions are recorded: the request-side one below, and the response-side
error normalisation described under Error Handling (which this ADR previously
described as verbatim passthrough — corrected 2026-07-26 to match the code).

The proxy may still sit behind application and edge traffic controls. Current
runtime wires application rate limiting for OAuth proxy routes per ADR-158;
that does not violate transparency because the limiter rejects excess traffic
before proxy semantics are applied rather than modifying OAuth messages.

#### Advertised-AS request validation (amended 2026-07-26, MCP-188)

This is a second and independently justified exception, NOT an extension of
the rate-limiting clause above — that clause is licensed by acting _before_
proxy semantics apply, whereas this one reads an OAuth message body and
decides on its content.

The principle, which is a constraint and not a licence:

> The proxy forwards every OAuth message verbatim and makes no OAuth grant
> decision; the sole exception is that, because it publishes its own origin as
> `issuer` and `registration_endpoint`, it must refuse outright — HTTP 400 in
> the RFC's own error vocabulary, before any upstream call, and never by
> editing, filtering, defaulting or partially accepting the message — a
> request that a **cited** OAuth clause obliges the advertised authorisation
> server to refuse and that upstream is **demonstrated** not to refuse.

All three tests must hold: advertised-AS attachment, a cited clause, and a
demonstrated upstream gap. The trigger is publication of our origin as the AS,
so the exception cannot travel to `/mcp`, asset routes, or any surface we do
not advertise ourselves as the authority for.

The one instance, and the evidence for its third test: OAuth 2.1 (adopted by
ADR-052) carries RFC 8252 §7.3's restriction that `http` redirect URIs are
permissible only for loopback interfaces. The MCPJam conformance check
`oauth_dcr_http_redirect_uri` failed against the deployed alpha — `POST
/oauth/register` returned 201 for a plain-`http` non-loopback
`redirect_uri` — first observed 2026-07-26 and reconfirmed first-hand against
production the same day after that day's deploy. RFC 7591 §3.2.2 supplies the
refusal's _shape_ (HTTP 400, `invalid_redirect_uri` / `invalid_client_metadata`),
not the rule itself.

Deliberate deviation, recorded so it is not read later as an oversight: RFC
8252 §8.4's SHOULD that private-use schemes be reverse-domain-named is NOT
enforced. Its minimum period test would reject `cursor://callback`, the scheme
of the very client this ADR exists to serve.

What this exception still forbids:

- Filtering, dropping, normalising, defaulting or reordering any field of a
  forwarded message. ADR-113's `openid` scope disposition stands unchanged —
  there the upstream _does_ discharge the rule, and the intervention on offer
  was mutation rather than refusal.
- Partial acceptance: rejecting one `redirect_uris` entry and forwarding the
  rest. All-or-nothing per message; anything else is filtering in a
  validator's coat.
- Grant validation: PKCE, `client_id`/secret, authorisation codes, tokens,
  scopes, and `redirect_uri` matching at `/oauth/authorize` all remain Clerk's,
  excluded by the demonstrated-upstream-gap test itself.
- Refusals of our own devising: host allowlists, `client_name` policy, scheme
  preferences — anything without a named clause of a named RFC.
- Extension to `/oauth/authorize` or `/oauth/token` by analogy. Permitted only
  by re-running all three tests and recording the evidence.

- `/oauth/authorize`: All query parameters forwarded via `buildAuthorizeRedirectUrl()`.
- `/oauth/token`: Raw body forwarded as-is (parsed by `express.text()`, not `express.urlencoded()`).
- `/oauth/register`: JSON body forwarded via `JSON.stringify(req.body)`.

This makes the proxy resilient to upstream changes (e.g. Clerk adding new parameters or grant types).

### Always-On

One code path for all clients, all environments. No client detection, no conditional enablement. MCP Inspector, Claude, and programmatic clients all go through the proxy — the tokens are identical. If Cursor fixes the bug, the proxy can be removed without urgency.

### Open Redirect Prevention

`/oauth/authorize` redirects to a URL derived at startup from `CLERK_PUBLISHABLE_KEY` via `deriveUpstreamOAuthBaseUrl()`. The redirect target is an immutable value set once at process start. Client requests append query parameters to this known-good base URL — they cannot control the redirect hostname.

### Critical Assumption: Opaque Tokens

The proxy works because Clerk issues opaque tokens (`oat_...`), not JWTs. There is no `iss` claim to validate against the AS metadata `issuer`. Token verification happens via Clerk's API (`getAuth()`), which does not check where the client found the AS metadata.

**Risk**: If Clerk offers JWT access tokens in the future, the issuer mismatch (`issuer: "http://localhost:3333"` vs Clerk's actual issuer) will break clients that validate `iss` claims against AS metadata.

### Error Handling

All upstream HTTP calls use `fetchWithTimeout()` with a 10-second timeout (configurable via `OAuthProxyConfig.timeoutMs`). `fetchUpstream` returns `Result<T, ProxyFetchError>` with a discriminated union (`timeout` | `network`).

| Failure                          | Proxy Response                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------- |
| Clerk returns 4xx/5xx, JSON body | Pass through Clerk's status + body, with `error_description` bounded (see below) |
| Clerk returns 4xx/5xx, non-JSON  | Status preserved, body re-synthesised as our own OAuth error object              |
| Clerk returns 2xx, non-JSON      | HTTP 502 + `{ "error": "server_error" }`                                         |
| Clerk times out (>10s)           | HTTP 504 + `{ "error": "temporarily_unavailable" }`                              |
| Network error                    | HTTP 502 + `{ "error": "temporarily_unavailable" }`                              |

Response-side truing (2026-07-26, MCP-188): the previous table row claimed
upstream 4xx/5xx bodies pass through verbatim. That has not been true since
`oauth-proxy-response.ts` landed — it re-synthesises non-JSON upstream errors,
bounds and sanitises `error_description` so a misbehaving upstream cannot
smuggle terminal-escape sequences or unbounded payloads into MCP client logs,
and drops implausible `Retry-After` values. The table above is corrected to
match. **Behaviour recorded as-built; its soundness is not re-adjudicated
here** — this truing is documentation of what the code provably does, not a
fresh ratification of the design, and no behaviour changed in the amending PR.

### Deployment Preconditions

1. **Host header trust**: The server derives self-origin from the request `Host` header via `deriveSelfOrigin()`. All OAuth metadata (`authorization_servers`, `issuer`, endpoint URLs) uses this value. Ingress (Vercel, reverse proxy) must enforce a canonical host/protocol — otherwise, a malicious `Host` header could cause metadata to advertise incorrect endpoints. Locally, `isLoopbackHost()` forces `http://` for `localhost`; in production, Vercel enforces the canonical domain.

2. **Rate limiting**: The proxy endpoints (`/oauth/register`, `/oauth/authorize`, `/oauth/token`) are unauthenticated, public OAuth endpoints and therefore require traffic controls. Application-layer rate limiting is now applied as defence-in-depth per ADR-158, with edge/WAF rate limiting remaining the authoritative volumetric control.

### Precedent

A community member published a [working solution using this exact pattern with Microsoft Entra ID](https://forum.cursor.com/t/working-solution-mcp-server-oauth-with-microsoft-entra-id-on-azure-container-apps/151813). The MCP SDK provides `ProxyOAuthServerProvider` as an official pattern.

## Consequences

### Positive

1. **Cursor works**: Full OAuth flow completes (DCR → authorize → sign-in → token exchange → authenticated MCP calls).
2. **Other clients unaffected**: MCP Inspector, programmatic clients follow the same path transparently.
3. **Simple**: ~200 lines of pure functions + ~100 lines of route handlers. No state, no sessions, no token storage.
4. **Resilient**: Object-spread metadata rewriting automatically picks up new Clerk capability fields.
5. **Removable, with one precondition**: If Cursor fixes the `resource_metadata` persistence bug, the proxy can be removed. It adds no coupling — but since 2026-07-26 it is the only party enforcing the loopback restriction on registered `redirect_uris`, so removal must first move that control to Clerk configuration or re-verify that upstream now enforces it.

### Negative

1. **Additional latency**: Token exchange and DCR go through the proxy before reaching Clerk. Measured at <50ms additional per call — negligible for an operation that happens once per session.
2. **Opaque token dependency**: If Clerk switches to JWT access tokens, the issuer mismatch will need addressing.
3. **Token refresh blocked by Cursor**: Cursor does not send `grant_type=refresh_token` ([forum #149511](https://forum.cursor.com/t/cursor-does-not-refresh-oauth-tokens-for-mcp-servers/149511)). Access tokens expire after ~15 minutes and users must reconnect. The proxy is architecturally ready for refresh — no server-side fix is possible for this Cursor bug.
4. **Registration validation is a conformance control, not a security boundary** (2026-07-26): an attacker can call Clerk's DCR endpoint directly — the proxy holds no credential the open internet lacks — so the guard constrains well-behaved clients, not adversaries. Coverage is also bounded by what our URL parser can read: values we cannot classify (absent, non-string, unparseable) are refused or forwarded per the rule, but the endpoint must not be treated as a validated boundary for anything beyond the one cited clause.
5. **The URL parser is now part of the accept-set definition** (2026-07-26): "parseable, `http:`, host not loopback" is defined by the WHATWG `URL` implementation in the running Node version. An IDNA, IPv6-literal or userinfo parsing change across a Node upgrade moves our accept-set with no ADR change and no necessarily-failing test.
6. **Accept-set drift from Clerk, asymmetric in consequence** (2026-07-26): nothing keeps our rule aligned with the upstream's. Clerk tightening later costs only a duplicated refusal; Clerk _relaxing_ later makes us the stricter party and breaks a client Clerk would have served, with no upstream signal and the failure attributed to our origin. Registration error bodies are also no longer uniform — ours are our shape, Clerk's are Clerk's.
7. **Precedent pressure on a one-exception clause** (2026-07-26): future conformance failures will arrive framed as "same as MCP-188". The cited-clause and demonstrated-upstream-gap tests are the only brake.

## Implementation

| File                                                     | Role                                                                                      |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/oauth-proxy/oauth-proxy-upstream.ts`                | Pure functions: URL derivation, redirect construction, metadata rewriting, Zod type guard |
| `src/oauth-proxy/oauth-proxy-routes.ts`                  | Express router wiring and async error wrapping                                            |
| `src/oauth-proxy/oauth-proxy-handlers.ts`                | Route handlers (register, authorize, token)                                               |
| `src/oauth-proxy/oauth-proxy-response.ts`                | Upstream response reading and error-shape normalisation                                   |
| `src/oauth-proxy/oauth-proxy-redirect-uri-validation.ts` | Advertised-AS `redirect_uris` refusal at registration (see Rationale)                     |
| `src/oauth-proxy/oauth-proxy-upstream.unit.test.ts`      | 22 unit tests                                                                             |
| `src/oauth-proxy/oauth-proxy-routes.integration.test.ts` | 10 integration tests (fake upstream via DI `fetch`)                                       |
| `src/oauth-proxy/index.ts`                               | Barrel export                                                                             |
| `src/auth-routes.ts`                                     | PRM + AS metadata endpoints; accepts `upstreamMetadata` via DI                            |
| `src/conditional-clerk-middleware.ts`                    | Proxy paths in `CLERK_SKIP_PATHS`                                                         |
| `src/app/oauth-and-caching-setup.ts`                     | Wires metadata + proxy into async bootstrap                                               |
| `src/application.ts`                                     | `createApp` is async; `upstreamMetadata` injectable via `CreateAppOptions`                |
| `e2e-tests/auth-enforcement.e2e.test.ts`                 | 16 E2E tests asserting self-origin metadata                                               |

All files within `apps/oak-curriculum-mcp-streamable-http/`.

## Deployment Preconditions

**Rate limiting must be in place before production rollout.** The proxy
OAuth flow exposes publicly reachable `/register` and `/token` endpoints.
Without edge/WAF and application-layer rate limiting, these are vulnerable to
credential-stuffing and denial-of-service patterns. Configure rate limiting at
the CDN/reverse proxy layer (e.g. Vercel Edge Middleware, Cloudflare WAF, or
AWS WAF) and keep the application limiter wired per ADR-158 before deploying to
production.

## Related ADRs

- [ADR-052: OAuth 2.1 for MCP HTTP Authentication](052-oauth-2.1-for-mcp-http-authentication.md)
- [ADR-053: Clerk as Identity Provider](053-clerk-as-identity-provider.md) (amended to reflect proxy role)
- [ADR-113: MCP Spec-Compliant Auth](113-mcp-spec-compliant-auth-for-all-methods.md) (troubleshooting: `openid` scope)
- [ADR-112: Per-Request MCP Transport](112-per-request-mcp-transport.md)

## References

- [Cursor Forum #151331: resource_metadata URL loss](https://forum.cursor.com/t/mcp-oauth-callback-loses-authorization-server-url-discovered-from-resource-metadata-causing-token-exchange-failure/151331)
- [Cursor Forum #149511: Token refresh not working](https://forum.cursor.com/t/cursor-does-not-refresh-oauth-tokens-for-mcp-servers/149511)
- [RFC 9728: OAuth 2.0 Protected Resource Metadata](https://datatracker.ietf.org/doc/html/rfc9728)
- [RFC 8414: OAuth 2.0 Authorisation Server Metadata](https://datatracker.ietf.org/doc/html/rfc8414)
- [MCP Authorisation Spec (2025-11-25)](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization)
- [Working Solution: Entra ID Proxy](https://forum.cursor.com/t/working-solution-mcp-server-oauth-with-microsoft-entra-id-on-azure-container-apps/151813)
