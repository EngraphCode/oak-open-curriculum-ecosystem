---
id: mcp-655-oauth-issuer-alignment
node_type: delivery
name: OAuth issuer alignment for RFC 9207 clients
overview: The Protected Resource Metadata names the upstream authorization server so the issuer a client holds equals the iss in the authorization response; the app-origin proxy metadata stays for origin-discovering clients.
status: ratified
ratified_by: Jim Cresswell
ratified_date: 2026-09-01
ratified_where: Linear MCP-655 (the ratification comment of 2026-09-01 records the owner's approval of this plan in the authoring session)
serves: first-major-release
impact_areas:
  - auth-and-access
  - conformance-and-standards
tickets:
  - MCP-655
depends_on: []
owner_gates: []
last_updated: 2026-09-01
---

# OAuth issuer alignment for RFC 9207 clients

This node is self-contained: a fresh session implements it from this document and the
linked ticket alone. The ticket carries the incident evidence (dates, client versions,
deployment URLs); this node carries the mechanism, the exact changes, the sequence and the
proofs.

## Goal

An MCP client that validates the RFC 9207 `iss` parameter can sign in to the Oak Curriculum
MCP app on preview and production. Today such clients refuse the authorization response,
because the app names itself as the authorization server while the response carries the
upstream identity provider's issuer.

## Mechanism

The app is a transparent OAuth proxy in front of the upstream identity provider (Clerk) — see
[ADR-115](../../../docs/architecture/architectural-decisions/115-proxy-oauth-as-for-cursor.md):

- `apps/oak-curriculum-mcp-streamable-http/src/auth-routes.ts`,
  `registerPublicOAuthMetadataEndpoints` → `servePrm`: the Protected Resource Metadata
  (RFC 9728, `/.well-known/oauth-protected-resource` and the path-qualified `/mcp` variant)
  serves `authorization_servers: [selfOrigin]` — the app names itself as the AS.
- `apps/oak-curriculum-mcp-streamable-http/src/oauth-proxy/oauth-proxy-upstream.ts`,
  `rewriteAuthServerMetadata`: the AS metadata at the app origin is the upstream document with
  `issuer` and the authorize/token/register endpoints rewritten to the app origin; every other
  field is spread through unchanged — including the upstream's
  `authorization_response_iss_parameter_supported: true`.
- `/oauth/authorize` redirects the browser to the upstream authorize endpoint, and the upstream
  redirects straight back to the client's `redirect_uri`, so the authorization response carries
  the **upstream** `iss`, never the app origin.

RFC 9207 §2.4: a client that supports the parameter "MUST extract the value of the `iss`
parameter from authorization responses they receive if the parameter is present" and compare
it with the issuer identifier it holds; it "SHOULD discard authorization responses with the
`iss` parameter from authorization servers that do not indicate their support for the
parameter". So a validating client holding the app origin as issuer must refuse — and merely
disclaiming support on the proxy metadata does not cure it (the upstream still sends `iss`;
the client still compares it, and now also should discard the response). The only cure that
satisfies the RFC is that the issuer the client holds **equals** the `iss` the upstream sends.

**The change**: the PRM names the upstream authorization server's issuer in
`authorization_servers` (the value is already available — `upstreamMetadata.issuer` is
injected into `registerPublicOAuthMetadataEndpoints`; it is also what the Clerk MCP library's
own PRM helper names by default). A client following the PRM then reads the upstream's own AS
metadata, registers and exchanges tokens there, and receives an `iss` equal to the issuer it
holds. The app-origin AS metadata and the three `/oauth/*` proxy endpoints remain unchanged
for clients that discover the AS from the resource origin (the ADR-115 case); that proxy path
cannot satisfy RFC 9207, so its served metadata **omits** the
`authorization_response_iss_parameter_supported` claim the upstream declares (RFC 9207 §3: an
omitted claim defaults to false; the claim is omitted rather than served `false` because
Claude Code's error reference reads the key by presence — "unless the server's metadata sets
`authorization_response_iss_parameter_supported`"). Tokens (the upstream's opaque tokens),
RFC 8707 audience validation and the `/mcp` endpoint are untouched.

Reviewer evidence (three read-only reviews, verdicts on the ticket): Claude Code's own error
reference states that a redirect carrying no `iss` passes unless the metadata sets the claim,
and that a present `iss` is always compared — the flag governs only the absent-`iss` branch;
the MCP authorization spec requires RFC 9207 nowhere (the check is client policy); the
disclaim-only shape adds no security exposure but cures nothing; the redirect-target broker
would add a state store, an open-redirect surface and code transit through our logs for
negligible marginal value.

Rejected shapes, so they are not re-proposed: disclaim-only (insufficient per the RFC text
above); the proxy as redirect target re-issuing responses with its own `iss` (a stateful
broker with new open-redirect and code-interception surface, to preserve a uniform path whose
only justification is one client's discovery bug); `issuer` = upstream on the app-origin
metadata (violates RFC 8414 §3.3).

Known consequence, recorded on ADR-115: clients following the PRM register at the upstream's
DCR directly, so the proxy's advertised-AS refusal of plain-`http` non-loopback redirect URIs
(ADR-115, MCP-188) no longer covers them; ADR-115 Negative 4 already rules that refusal a
conformance control, not a security boundary. The mcpjam `oauth_dcr_http_redirect_uri`
conformance check now grades the upstream's DCR on that path.

## Acceptance criteria (each with a proof — required)

- The served PRM names the upstream authorization server and the served app-origin AS
  metadata carries no RFC 9207 claim — `repo-safe`: route integration tests in
  `apps/oak-curriculum-mcp-streamable-http/src/auth-routes.integration.test.ts` and
  `canonical-origin.integration.test.ts`, the e2e discovery suite in
  `apps/oak-curriculum-mcp-streamable-http/e2e-tests/auth-enforcement.e2e.test.ts`, and the
  content-registry validator (`validate-mcp-content-current-source`) green.
- A validating client completes sign-in against a preview of the change — `owner-held`: the
  owner signs in from Claude Code against the pull request's Vercel preview (add it as an
  `http` MCP server, `/mcp` → Authenticate); success is the tools list loading; the result is
  recorded on the pull request. This is the decision's falsifier: if sign-in still fails after
  this change, the residual cause is client-side and the evidence goes to the client vendor —
  do not build the broker on a guess.
- Origin-discovering clients are unaffected — `repo-safe`: the `/oauth/*` proxy endpoint tests
  and the app-origin AS-metadata tests are unchanged and green.
- The architecture record says what is true — `repo-safe`: ADR-115 amended (§Metadata
  Rewriting, §Always-On, a dated Negative consequence), ADR-053 discovery note, the UAT
  runbook rows; markdownlint and Prettier green.

## Changes (exact)

Product code:

1. `src/auth-routes.ts`, `servePrm`: `authorization_servers: [selfOrigin]` →
   `authorization_servers: [upstreamMetadata.issuer]`; TSDoc states why (RFC 9207 §2.4) and
   that the app-origin AS metadata remains for origin-discovering clients.
2. `src/oauth-proxy/oauth-proxy-upstream.ts`: schema gains
   `authorization_response_iss_parameter_supported: z.boolean().optional()` (so the field is
   typed at the boundary); `rewriteAuthServerMetadata` destructures that key out of the
   upstream document before the spread, so the served document omits it whatever the upstream
   declares; TSDoc states that the proxy path cannot satisfy RFC 9207 and that validating
   clients are served by the PRM naming the upstream — never that omission is a cure.

Tests (test first — red for the right reason, then green; each test names a system state):

- `src/auth-routes.integration.test.ts`: the `authorization_servers` assertions in the
  `authorization_servers field` describe block and the path-qualified PRM test expect
  `[TEST_UPSTREAM_METADATA.issuer]` (the fixture's issuer) for both hosts; `resource` stays on
  self-origin; the AS-metadata test asserts the **whole served document** strictly equals the
  rewritten fixture without the RFC 9207 claim (a positive shape proof — never an absence pin
  on a single key, per the tests-prove-behaviour doctrine).
- `src/canonical-origin.integration.test.ts`: the PRM `authorization_servers` assertion expects
  the fixture's issuer; `resource` stays on the canonical origin.
- `src/oauth-proxy/oauth-proxy-upstream.unit.test.ts`: the rewrite's output is asserted as a
  whole for an upstream declaring the claim `true` and for one silent on it — both yield the
  same document, and neither carries the key.
- `src/test-helpers/upstream-metadata-fixture.ts`: the fixture declares
  `authorization_response_iss_parameter_supported: true`, as the upstream does.
- `e2e-tests/auth-enforcement.e2e.test.ts`: the PRM helper and the test asserting self-origin
  `authorization_servers` invert to "names the upstream authorization server" (assert on the
  injected fixture issuer; the suite never contacts the upstream); the app-origin AS-metadata
  and `/oauth/*` tests are unchanged.
- Mutation check (testing-strategy §Prove the guard bites): revert the `servePrm` line, confirm
  exactly the PRM tests fail, restore.

Content registry (the pre-commit validator `validate-mcp-content-current-source` pins immutable
source fragments; every changed governed file is re-attested — machinery in
`agent-tools/src/mcp-content-current-source/`):

- Item anchors in `current-registration-item-anchor-overrides.ts`: C408 (`rewriteAuthServerMetadata`)
  and C706 (`servePrm` body) re-anchored on their new lines.
- `current-item-revision-overrides.ts`: `C408: 'modified'`, `C706: 'modified'`.
- Reviewed deltas (semantic-hash pinned, each with an MCP-655 comment):
  `current-source-delta-reviews-app-auth.ts` — `auth-routes.ts` (`reviewed`, citing
  C705–C708) and `oauth-proxy/oauth-proxy-upstream.ts` (`reviewed`, citing C408);
  `current-source-delta-reviews-app-test-helpers.ts` — `upstream-metadata-fixture.ts`
  (`excluded`, `TEST_ONLY`). Hashes come from the validator's own failure output or
  `semantic-source-sha256.ts`.
- `pnpm --filter @oaknational/agent-tools refresh-mcp-content-current-source-anchors`, then
  `pnpm --filter @oaknational/agent-tools validate-mcp-content-current-source` → OK; review the
  regenerated artefacts under `.agent/reports/mcp-agent-facing-content-audit/` — only the C408
  and C706 rows and the delta inventory move.

Documentation:

- ADR-115: §Metadata Rewriting (PRM names the upstream AS; the app-origin AS metadata's
  "all capability fields pass through unchanged" sentence gains the one exception — the
  RFC 9207 claim is omitted), §Always-On (two standard discovery mechanisms, no client
  detection), Positive consequence 4 cross-referenced to the new Negative consequence, and
  that dated Negative consequence: the proxy path cannot satisfy RFC 9207; PRM-following
  clients hold the upstream's issuer; the MCP-188 refusal no longer covers their
  registrations; the passthrough generator is ticketed (MCP-656).
- ADR-053 §Discovery: one-line note that the PRM names the upstream while the app-origin AS
  metadata remains the proxy's.
- `apps/oak-curriculum-mcp-streamable-http/docs/manual-uat-guide.md` row 1.2: expected
  `authorization_servers` is the upstream issuer; new row 1.5 "RFC 9207 issuer alignment"
  (owner-held: a validating client's sign-in).
- Any README sentence claiming the PRM points to self-origin is trued.

Reviews before push (rules `invoke-code-experts`, `invoke-mcp-expert`; security surface):
`code-expert` (gateway), `mcp-expert` (MCP authorization spec, RFC 9207/8414/9728) and
`security-expert` (mix-up exposure on both discovery paths; DCR at the upstream without the
MCP-188 refusal) on the final diff, verdicts posted on the pull request before merge.

## Sequence

1. Implement test-first; package gates (`type-check`, ESLint, Prettier, markdownlint, the
   changed Vitest files); the registry ceremony until the validator is green.
2. One commit by explicit pathspec; message pre-checked with
   `pnpm agent-tools:check-commit-message -F <file>` (never start a body line with a
   `word:` shape — commitlint reads it as a footer); footer `Fixes MCP-655.`
3. Reviews; cure any P1 in one batched commit.
4. Push as the bot: `pnpm agent-tools merge-bot push --branch fix/mcp-oauth-metadata-iss-claim`
   (hooks run; no hook skipping).
5. Open the pull request as the bot (mint a `pull-request-work` token first, pass it via
   `GH_TOKEN`, never the prefix-substitution form — `docs/engineering/merge-bot.md`); title
   `MCP-655: fix(mcp-http): name the upstream authorization server in the PRM so RFC 9207 clients can sign in`;
   label `jimbot`; body per the PR template with `Fixes MCP-655`, the mechanism, the review
   focus (both discovery paths, the retained proxy, the MCP-188 consequence), the validation
   evidence and the PDR-140 intake contract; request Copilot via the GitHub MCP; watch with
   `pnpm agent-tools:pr-watch <n> --repo oaknational/oak-open-curriculum-ecosystem --watch`.
6. Live proof on the preview: `curl <preview>/.well-known/oauth-protected-resource/mcp` names
   the upstream issuer; `curl <preview>/.well-known/oauth-authorization-server` shows
   `authorization_response_iss_parameter_supported: false`; then the owner-held sign-in.
7. Merge under the standing doctrine (required checks green, threads resolved, the Copilot
   round settled by triage, the owner's code-owner approval), via
   `pnpm agent-tools merge-bot merge --pr <n> --expect copilot-pull-request-reviewer`. The
   release cut on merge restores production sign-in. Post-merge harvest; MCP-655 → Done; this
   node → `archive/`, `status: archived`.
8. Then the paused innovation-kit landing pull request resumes: merge `main` in, run the UAT
   runbook's smoke subset and Section 0 inventory reconciliation against its preview through an
   authenticated Claude Code session, post the run record, then its own merge.

## Todos

1. Route change + tests + registry re-attestation + ADR and runbook amendments — one
   single-story pull request, default round budget (PDR-132: ≤2 review rounds).
2. Preview proof (owner-held), merge, release, production sign-in confirmed.

## Out of scope

- Retiring the proxy authorization-server path — its removal precondition (the
  origin-discovery client fixing its metadata persistence) is unmet.
- Making the proxy a redirect target that re-issues authorization responses — a broker with
  new state and redirect surface, not needed once clients hold the real issuer.
- Any change to the upstream identity provider's configuration.
- The paused innovation-kit landing pull request's own diff; it resumes after this lands.
- The passthrough generator — the metadata fetch returns raw JSON and the schema only narrows
  the type, so any undeclared upstream field is served under our issuer; strict parse versus
  passthrough is an ADR-115 decision on its own ticket (MCP-656).
