---
name: "Ask Oak — curriculum-content Slack assistant (future)"
overview: "The second Slack assistant: curriculum-content-facing for internal Oak staff, over the Oak Curriculum MCP, authenticating with a first-class machine identity we add to our own MCP app. Strategic brief; promoted to current/ when the framework ships and the machine-auth deliverable lands."
lineage:
  serves_thread: oak-slack-assistants
  serves_stream: "agentic surfaces over Oak's MCPs"
  strategic_choice: "n/a — new surface domain"
  derives_from: ".agent/research/outreach/oisin-oce-navigator-design.md"
status: strategic-future
lifecycle: strategic-future
---

# Ask Oak — curriculum-content Slack assistant (future)

**Status**: strategic future brief (2026-07-08 revision — machine-identity reshape after the
owner's direction that our own MCP app's auth is ours to extend). Not executable until
promoted; execution decisions finalise at promotion per `/oak-plan` §Promotion Workflow.
Open questions below are deliberate and appropriate to this lane.

## Problem and intent

Internal Oak staff have no low-friction way to ask curriculum-content questions
(lessons, units, threads, misconceptions, keywords, prior knowledge, EEF evidence) inside
Slack. Ask Oak is the curriculum-facing sibling of Ask Oisín, built on the same
`ai-gateway` + `slack-assistant` libs so it is thin config — the seam those libs draw is
validated by this being their second consumer
(see [`../current/ask-oisin.plan.md`](../current/ask-oisin.plan.md)).

## End goal, mechanism, means

- **End goal**: internal Oak staff get grounded, Oak-voiced curriculum answers in Slack.
- **Mechanism**: `defineSlackAssistant(config)` with the Oak Curriculum MCP attached
  (denylist-pruned to curriculum tools), `get-curriculum-model` first, curriculum skills
  loaded live (`oak-tone-of-voice`, `oak-curriculum-principles`, `oak-lesson-builder`,
  `oak-brand` — all verified present in `oak-skills`, 2026-07-08).
- **Means**: a config module + deploy harness + the **machine-identity deliverable on the
  Oak MCP app** — no framework changes if the seam holds.

## Domain boundaries and non-goals

- Answers curriculum content only; project questions defer to Ask Oisín.
- Not a framework change — if Ask Oak needs `ai-gateway`/`slack-assistant` edits, that is a
  signal the seam was drawn wrong, to be fixed in the libs, not forked.

## Auth: first-class machine identity (both ends ours)

Ask Oak is a headless service and authenticates as one. The Oak MCP
(`apps/oak-curriculum-mcp-streamable-http`) is our app; its auth approaches are ours to
extend (owner direction, 2026-07-08). The design:

- **The MCP app grows an M2M verification path** alongside its user-OAuth verification:
  Clerk **M2M tokens** are Clerk's machine-auth product for backend-to-backend calls
  (verified 2026-07-08: Clerk does not support the OAuth `client_credentials` grant — it
  says it is aiming to — and its AS metadata can only advertise `authorization_code` +
  `refresh_token`, which is exactly what the live Oak MCP `/.well-known/` metadata shows;
  Clerk's API-keys product was also considered and is a documented mismatch — it delegates
  *user* API access, not first-party service identity). Verification is a **separate verify
  call**, not a parameter tweak: the current `verifyClerkToken` (`@clerk/mcp-tools`) is
  OAuth-only by construction; the machine branch is `clerkClient.m2m.verify(...)`
  (`@clerk/backend`), requiring a `CLERK_MACHINE_SECRET_KEY` **on the MCP app side only** —
  one endpoint accepts both via `acceptsToken: ['oauth_token', 'm2m_token']` + a
  `tokenType` branch constructing `AuthInfo` for the machine case. The scoped deliverable
  covers: that verification branch, machine-caller authorisation (which tools a machine
  identity may call — server-side scoping is **load-bearing**, see the audience-binding
  question below), and rate-limit identity for machine callers.
- **Ask Oak presents its machine token as a plain Bearer header** on the `@ai-sdk/mcp`
  transport. No OAuth client flow, no persisted refresh token, no day-one secret store —
  the bot holds only the pre-minted token as an env secret (never the machine secret key).
- **Rejected alternative** (recorded): a human minting a refresh token via
  `authorization_code` + `offline_access`, persisted by the bot. Rejected because it binds
  a service to a human account's lifecycle, muddies audit attribution, and forces a durable
  token store; Clerk's never-expiring refresh tokens would have made the workaround
  *durable*, not *right*. If Clerk ships `client_credentials`, the M2M implementation can
  migrate to the standard grant.

## Dependencies and sequencing (blocking / beneficial)

- **Blocking**: the `ai-gateway` + `slack-assistant` libs shipped by the Ask Oisín plan.
- **Blocking (ours to build)**: the Oak MCP machine-identity deliverable above — scoped at
  promotion time as a workstream (owned by this plan or a sibling in the
  `sdk-and-mcp-enhancements` collection; decide at promotion); invoke `clerk-expert` on
  both sides.
- **Beneficial**: Ask Oisín deployed and the lib seam proven against a real consumer.

## Strategic acceptance criteria and success signals

- Ask Oak ships as thin config over the unchanged libs (the seam test).
- A known curriculum question returns a grounded, cited, Oak-voiced answer via the Oak MCP.
- Same PII invariant as Ask Oisín (pragmatic egress; no content in logs/Sentry/store) and
  the same internal-only posture (the Oak MCP alpha is invite-only; both apps are
  allow-listed internal tools).
- Machine-caller actions are attributable to the machine identity in the MCP app's
  logs/limits (clean audit separation from human users).

## Risks and unknowns (open questions — deliberate for this lane)

- **Clerk M2M specifics at build time**: token lifetime/rotation configuration (mint with a
  finite `secondsUntilExpiration` + a rotation runbook, or consciously accept
  no-expiry-but-revocable — a never-expiring token would repeat the exact critique this
  design levels at the rejected alternative), verification surface (`clerkClient.m2m.verify`
  - `CLERK_MACHINE_SECRET_KEY`), and pricing (~$0.001/token creation, ~$0.00001/verify,
  free tiers; every tool round-trip verifies over the network for opaque tokens — Ask Oak's
  volume sits far inside the free tier, but name it; possible beta→GA transition) — verify
  vendor-literal at promotion; Clerk's M2M product is newer than its OAuth surface.
- **RFC 8707 audience binding for the machine path** (the genuinely open design decision —
  the constraints are in tension): the MCP spec REQUIRES resource servers to validate token
  audience; our own `resource-parameter-validator.ts` enforces `aud` for JWTs but
  deliberately bypasses opaque tokens (with a comment naming exactly this second-caller
  case as its re-evaluation trigger). Opaque M2M tokens are revocable (wanted) but carry no
  `aud` (the spec MUST is then carried by Clerk verification + server-side tool scoping,
  which becomes load-bearing); JWT M2M tokens could carry `aud` but are non-revocable
  (unwanted). Candidate resolutions, decide at promotion with `mcp-expert` +
  `security-expert` + `clerk-expert`: (a) JWT-with-`aud` if Clerk supports a custom
  audience on M2M JWTs AND the revocability loss is mitigated; (b) opaque + a distinct
  machine resource identifier/endpoint so the advertised MCP resource's audience guarantee
  stays intact and the machine path is a documented deliberate deviation; (c) opaque on the
  main endpoint with the bypass consciously re-ratified + server-side scoping as the
  enforced guarantee. The PRM/`/.well-known` metadata contract is NOT violated by any of
  these (a pre-provisioned machine caller legitimately skips discovery; both token types
  issue from the same Clerk AS).
- **Machine-caller authorisation model on the MCP app**: per-tool scoping for machine
  identities — server-side, not client-side-only (load-bearing per the audience-binding
  question above). A safety-by-default alternative to the fail-open name denylist at
  promotion: build a `readOnlyHint` allowlist from the raw `listTools()` result (annotations
  ARE present there — it is `tools()` that strips them). Design with `mcp-expert` +
  `security-expert`.
- **Denylist drift**: the name-based denylist fails open on a server tool rename or a new
  non-curriculum tool. Verified 2026-07-08: `client.tools()` does **not** surface MCP tool
  annotations (`readOnlyHint`/`destructiveHint` are dropped in the adapter — source-checked),
  so an annotation-based filter is not implementable on the adapted tools; if annotation-aware
  filtering is ever needed, read the raw MCP `listTools` result directly. Server-side
  machine-caller tool scoping (above) is the stronger cure.
- **Alpha evolution**: the Oak MCP tool inventory and OAuth surface were verified live
  2026-07-08 but the alpha is invite-only and ours to evolve — re-verify at promotion.
- **Streaming/feedback affordances**: inherit whatever the Ask Oisín POC learns; same
  deferral provenance flags.

## Promotion trigger into `current/`

Promote when **all three**: (a) the `ai-gateway` + `slack-assistant` libs have shipped with
Ask Oisín; (b) the Oak MCP machine-identity deliverable is scoped (its owning plan/workstream
decided); (c) an owner go for the second app. On promotion, mine this brief into
executable WS/cycles per `/oak-plan`; execution decisions finalise then.
