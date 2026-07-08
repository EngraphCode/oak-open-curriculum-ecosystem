# Slack Assistants

Collection purpose: user-facing agentic **Slack assistants** built over Oak's MCP surfaces, on one shared, publishable `slack-assistant` framework. Each app is thin config; the framework carries the general functionality (Bolt + `@vercel/slack-bolt` runtime, the AI-SDK model layer, MCP attachment, the PII egress boundary, mrkdwn/disclaimer). Distinct from `connecting-oak-resources` (data/knowledge-graph integration) — this collection is the *surface*, not the resource.

Design source of truth: [`.agent/research/outreach/oisin-oce-navigator-design.md`](../../research/outreach/oisin-oce-navigator-design.md) (PR #328), verified against primary vendor docs and the live Oak MCP on 2026-07-08.

Both apps are **internal-use only** — allow-listed Slack installations, no external users or access. Others may fork the repo and self-host their own instance. Roadmap: [`roadmap.md`](roadmap.md).

## Thread

`oak-slack-assistants` (PDR-027) — [`../../memory/operational/threads/oak-slack-assistants.next-session.md`](../../memory/operational/threads/oak-slack-assistants.next-session.md).

## Plans

| Lane | Plan | State |
|---|---|---|
| `current/` | [`ask-oisin.plan.md`](current/ask-oisin.plan.md) | Ask Oisín v1 — project/repo navigator; extracts the framework. Queued, not started. |
| `future/` | [`ask-oak.plan.md`](future/ask-oak.plan.md) | Ask Oak — curriculum-content assistant. Strategic; promoted when the framework ships and Oak MCP alpha credentials land. |

## Sequencing

Ship **Ask Oisín first** (it extracts the `slack-assistant` framework), **with more Slack apps in mind** (Ask Oak is the committed second consumer; the seam is validated when Ask Oak ships as thin config with no framework changes). The app framework is **Next.js App Router** (settled 2026-07-08 — the `@vercel/slack-bolt` adapter is Web-Request-native, so Next.js fits *this* use case; not a copy of the MCP app's Express). Incoming canonical Next.js/React resources supply shared config to adopt, not a framework change.
