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
- **Blocking (auth shape)**: the Oak MCP OAuth has **no `client_credentials` grant** — a one-time interactive `authorization_code` + PKCE sign-in (`offline_access`) mints a refresh token that must be **persisted durably** (a secret/KV store from day one). Reuse the Clerk pattern already in `apps/oak-curriculum-mcp-streamable-http` (`@clerk/backend`, `@clerk/mcp-tools`); invoke `clerk-expert`. The `authProvider` must be **refresh-only and fail-closed**: load the persisted refresh token, perform only the `refresh_token` grant on 401, write back the rotated token, and **never** initiate the interactive authorization-code (redirect) flow at runtime — there is no interactive surface on Vercel, so that path is a hard failure. The `offline_access` sign-in is out-of-band provisioning, not a runtime code path (mcp-expert review).
- **Beneficial**: Ask Oisín deployed and its framework seam proven against a real consumer.

## Strategic acceptance criteria and success signals

- Ask Oak ships as thin config over the unchanged framework (the seam test).
- A known curriculum question returns a grounded, cited, Oak-voiced answer via the Oak MCP.
- Same PII invariant as Ask Oisín (pragmatic egress; no content in logs/Sentry/store).

## Risks and unknowns

- Invite-only alpha (endpoint, tools, scopes) may change — verified 2026-07-08 but not stable.
- Refresh-token lifecycle (rotation, revocation) needs an owned store design.
- **Denylist fails open** on a server tool rename or a new write/destructive tool. Harden the name-based denylist with an MCP tool-annotation filter: exclude any tool whose `annotations.readOnlyHint !== true` (or `destructiveHint === true`), so future write tools are excluded regardless of the name list while new *read* tools are still auto-included (mcp-expert review).

## Promotion trigger into `current/`

Promote when **both**: (a) the `slack-assistant` framework has shipped with Ask Oisín, and (b) Oak MCP alpha OAuth credentials for a headless client are obtainable. On promotion, mine this brief into executable WS/cycles per `/oak-plan`; execution decisions finalise then.
