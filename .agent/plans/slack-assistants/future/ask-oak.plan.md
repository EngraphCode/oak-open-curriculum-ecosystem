---
name: "Ask Oak — curriculum-content Slack assistant (future)"
overview: "The second Slack assistant: teacher/curriculum-facing, over the Oak Curriculum MCP. Strategic brief; promoted to current/ when Oak MCP alpha credentials land."
lineage:
  serves_thread: oak-slack-assistants
  serves_stream: "agentic surfaces over Oak's MCPs"
  strategic_choice: "n/a — new surface domain"
  derives_from: ".agent/research/outreach/oisin-oce-navigator-design.md (PR #328)"
status: strategic
---

# Ask Oak — curriculum-content Slack assistant (future)

**Status**: 🔵 STRATEGIC (future) — not executable until promoted.

## Problem and intent

Teachers and curriculum staff have no low-friction way to ask curriculum-content questions (lessons, units, threads, misconceptions, keywords, prior knowledge, EEF evidence) inside Slack. Ask Oak is the curriculum-facing sibling of Ask Oisín, built on the **same `slack-assistant` framework** so it is thin config — the framework Ask Oisín extracts (see [`../current/ask-oisin.plan.md`](../current/ask-oisin.plan.md)) is validated by this being its second consumer.

## End goal, mechanism, means

- **End goal**: curriculum staff get grounded, Oak-voiced curriculum answers in Slack.
- **Mechanism**: `defineSlackAssistant(config)` with the Oak Curriculum MCP attached (denylist-pruned to curriculum tools), `get-curriculum-model` first, curriculum skills loaded live.
- **Means**: a config module + deploy harness + the Oak-MCP OAuth flow — no framework changes if the seam holds.

## Domain boundaries and non-goals

- Answers curriculum content only; project questions defer to Ask Oisín.
- Not a framework change — if Ask Oak needs framework edits, that is a signal the WS5 seam was drawn wrong, to be fixed in the framework, not forked.

## Dependencies and sequencing (blocking / beneficial)

- **Blocking**: the `slack-assistant` framework shipped by the Ask Oisín plan; Oak MCP invite-only OAuth 2.1 alpha credentials.
- **Blocking (auth shape)**: the Oak MCP OAuth has **no `client_credentials` grant** — a one-time interactive `authorization_code` + PKCE sign-in (`offline_access`) mints a refresh token that must be **persisted durably** (a secret/KV store from day one). Note: the MCP app is an OAuth **resource server** (it verifies inbound tokens) — it has no OAuth-**client** acquisition/refresh code, so this is **new work, not a lift**. `@clerk/mcp-tools` offers a non-redirecting refresh path (`getClientBySessionId`) to build on; invoke `clerk-expert`. The durable store must persist the DCR **client_id** (and secret, if a confidential client) as well as the refresh token, or the client re-registers/orphans on cold start. The `authProvider` must be **refresh-only and fail-closed**: load the persisted refresh token, perform only the `refresh_token` grant on 401, write back the rotated token, and **never** initiate the interactive authorization-code (redirect) flow at runtime — there is no interactive surface on Vercel, so that path is a hard failure. The `offline_access` sign-in is out-of-band provisioning, not a runtime code path (mcp-expert review).
- **Beneficial**: Ask Oisín deployed and its framework seam proven against a real consumer.

## Strategic acceptance criteria and success signals

- Ask Oak ships as thin config over the unchanged framework (the seam test).
- A known curriculum question returns a grounded, cited, Oak-voiced answer via the Oak MCP.
- Same PII invariant as Ask Oisín (pragmatic egress; no content in logs/Sentry/store).

## Risks and unknowns

- Invite-only alpha (endpoint, tools, scopes) may change — verified 2026-07-08 but not stable.
- Refresh-token lifecycle (rotation, revocation) needs an owned store design.
- **Denylist fails open** on a server tool rename or a new write/destructive tool. Harden the name-based denylist with an MCP tool-annotation filter — but annotations are OPTIONAL, so `readOnlyHint !== true` would wrongly exclude every *unannotated* tool. Correct logic: exclude only tools **explicitly** marked non-read (`readOnlyHint === false` OR `destructiveHint === true`); keep unannotated tools (the name denylist still covers the known non-curriculum ones). **Verify at promotion** whether the AI SDK MCP client's `.tools()` actually surfaces raw MCP annotations (`readOnlyHint`/`destructiveHint`) — if it does not, the annotation filter is not implementable and the name denylist stands alone. Also: access to the Oak MCP is invite-only, so Ask Oak inherits the same internal-only posture as Ask Oisín (mcp-expert review, logic corrected).

## Promotion trigger into `current/`

Promote when **both**: (a) the `slack-assistant` framework has shipped with Ask Oisín, and (b) Oak MCP alpha OAuth credentials for a headless client are obtainable. On promotion, mine this brief into executable WS/cycles per `/oak-plan`; execution decisions finalise then.
