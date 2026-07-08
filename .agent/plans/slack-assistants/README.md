# Slack Assistants

Collection purpose: user-facing agentic **Slack assistants** built over Oak's MCP surfaces,
on isolated, publishable libs — `@oaknational/ai-gateway` (the model layer: bounded tool
loop, MCP attachment, the egress contract) and `@oaknational/slack-assistant` (the Slack
surface framework: Bolt + `@vercel/slack-bolt` runtime, invocation mechanics, the PII egress
boundary, mrkdwn/disclaimer). Each app is thin config over them. Distinct from
`connecting-oak-resources` (data/knowledge-graph integration) — this collection is the
*surface*, not the resource.

Design source of truth:
[`oisin-oce-navigator-design.md`](../../research/outreach/oisin-oce-navigator-design.md) —
verified against primary vendor docs and the live Oak MCP on 2026-07-08, then re-verified by
a full claim-register pass the same day. Telemetry topology is **resolved** in the companion
[logging/observability design record](../../research/outreach/slack-assistant-logging-observability-design.md),
whose estate workstreams (the `logger` portability fix; the Sentry vendor×runtime provider
decomposition) ride the Ask Oisín plan per owner direction.

Both apps are **internal-use only** — allow-listed Slack installations, no external users or
access. Others may fork the repo and self-host their own instance. **Ask Oisín v1 is an
internal proof-of-concept.** Roadmap: [`roadmap.md`](roadmap.md).

## Thread

`oak-slack-assistants` (PDR-027) — [`oak-slack-assistants.next-session.md`](../../memory/operational/threads/oak-slack-assistants.next-session.md).

## Plans

| Lane | Plan | State |
|---|---|---|
| `current/` | [`ask-oisin.plan.md`](current/ask-oisin.plan.md) | Ask Oisín v1 (internal POC) — project/repo navigator; builds the two libs, the `sentry-nextjs` provider over a shared redaction core, and the `logger` portability fix. 🟢 DECISION-COMPLETE / READY FOR EXECUTION; WS9+ consumes owner-provisioned resources (named blocking dependencies). |
| `future/` | [`ask-oak.plan.md`](future/ask-oak.plan.md) | Ask Oak — curriculum-content assistant on a first-class machine identity (Clerk M2M verified by our own MCP app). Strategic; promotion trigger in the brief. |

## Sequencing

Ship **Ask Oisín first** (it builds the shared libs), **with more Slack apps in mind**
(Ask Oak is the committed second consumer; the seam is validated when Ask Oak ships as thin
config with no lib changes). The app host is **Next.js App Router** (owner choice,
2026-07-08). Incoming canonical Next.js/React resources supply shared config to adopt, not a
framework change.
