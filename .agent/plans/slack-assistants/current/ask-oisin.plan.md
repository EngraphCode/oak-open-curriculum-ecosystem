---
name: "Ask Oisín — v1 Slack assistant, framework-first"
overview: "Ship Ask Oisín (project/repo navigator) as a headless Vercel Slack app, extracting a reusable slack-assistant framework so future Slack apps (Ask Oak next) are thin config."
lineage:
  serves_thread: oak-slack-assistants
  serves_stream: "agentic surfaces over Oak's MCPs (new; no parent stream record yet)"
  strategic_choice: "n/a — new surface domain"
  derives_from: ".agent/research/outreach/oisin-oce-navigator-design.md (PR #328, open; design file tracked on main)"
todos:
  - id: ws0-scaffold
    content: "WS0: scaffold packages/libs/slack-assistant (lib) + apps/slack/ask-oisin (Next.js App Router app + vercel.json) workspaces (pkg/tsconfig/eslint/vitest), add pnpm-workspace glob, spike @vercel/slack-bolt receiver wiring. Tree green (build/type-check/lint)."
    status: pending
    depends_on: []
  - id: ws1-model-layer
    content: "WS1: slack-assistant ask() over AI SDK + Gateway — bounded tool loop (isStepCount), dot-slug validation rejecting legacy hyphen slugs. Unit tests + product code, one commit per cycle."
    status: pending
    depends_on: [ws0-scaffold]
  - id: ws2-pii-boundary
    content: "WS2: PII egress boundary — scrub() strips identity/mentions/emails/phones/structured PII; guard asserts only the sanctioned question egresses. Unit tests + code."
    status: pending
    depends_on: [ws0-scaffold]
  - id: ws3-mcp-attach
    content: "WS3: attachMcp(config) — createMCPClient over Streamable HTTP, header/authProvider auth, denylist tool filter. Unit tests (mocked client) + code."
    status: pending
    depends_on: [ws0-scaffold]
  - id: ws4-slack-surface
    content: "WS4: Slack surface adapter — @vercel/slack-bolt wiring for app_mention, DM (message.im only), slash, assistant-thread; signature verification; mrkdwn + disclaimer. Integration tests + code."
    status: pending
    depends_on: [ws0-scaffold]
  - id: ws5-factory
    content: "WS5: defineSlackAssistant(config) factory composing WS1–4 + a Zod config schema (the Oak-config/general-functionality seam). Integration test + code."
    status: pending
    depends_on: [ws1-model-layer, ws2-pii-boundary, ws3-mcp-attach, ws4-slack-surface]
  - id: ws6-oisin-config
    content: "WS6: Ask Oisín config — system prompt (repo-nav, cite-source, hand-off), GitHub MCP attach (read-only, repos toolset), model slug, name. Tests assert GitHub MCP headers + config validity."
    status: pending
    depends_on: [ws5-factory]
  - id: ws7-observability
    content: "WS7: Sentry beforeSend scrubber (no content/PII to Sentry), metadata-only logging, rate limiting (reuse MCP-app factory). Unit/integration tests + code."
    status: pending
    depends_on: [ws0-scaffold]
  - id: ws8-deploy
    content: "WS8: deploy config — vercel.json, maxDuration, env wiring, manifest.oisin.yaml; preview deploy acks Slack <3s. Value-proxy acceptance."
    status: pending
    depends_on: [ws6-oisin-config, ws7-observability]
  - id: ws9-e2e-value-proxy
    content: "WS9: E2E value-proxy — a known project question returns a grounded, cited answer from live repo read; captured outbound payload proves no identity/PII egress."
    status: pending
    depends_on: [ws8-deploy]
  - id: ws10-reviews-docs-consolidation
    content: "WS10: readiness reviews (assumptions/mcp/security/config/accessibility/docs/onboarding/release), doc propagation, /oak-consolidate-docs."
    status: pending
    depends_on: [ws9-e2e-value-proxy]
isProject: true
---

<!-- Component reference paths are relative to this file
     (.agent/plans/slack-assistants/current/): use ../../templates/components/. -->

# Ask Oisín — v1 Slack assistant, framework-first

**Last Updated**: 2026-07-08
**Status**: 🟢 READY FOR EXECUTION (queued in `current/`, not started; blocking prerequisites in Dependencies). Plan-phase reviews passed 2026-07-08 (assumptions-expert READY-WITH-CONDITIONS, mcp-expert CONFIRMED); conditions applied.
**Scope**: Ship Ask Oisín as a headless Vercel Slack app that answers project questions grounded in a live read of the OCE repo, while extracting a reusable `slack-assistant` framework so future Slack apps are thin config.

---

## Context

The design is recorded in [`.agent/research/outreach/oisin-oce-navigator-design.md`](../../../research/outreach/oisin-oce-navigator-design.md) (PR #328 is **open**; the design file is tracked on `main` and usable as grounding), verified against primary vendor docs and the live Oak MCP on 2026-07-08. This plan turns that design into executable work under the owner rulings recorded there: **build Ask Oisín first**; **Ask Oak is a future app** (see `../future/ask-oak.plan.md`); build **with more Slack apps in mind** (extract the framework now); **pragmatic PII egress**; **running-text matcher deferred**.

### Problem Statement

Oak staff have no low-friction way to ask questions about the *project* — the repo, the Practice, strategy, planning state — without reading the `.agent/` substrate themselves. The intended intervention is a Slack bot that answers from a live read of the public repo. The build must not produce a one-off: a second app (Ask Oak) and more are expected, so the reusable seam must be extracted as Oisín is built, not retrofitted.

### Existing Capabilities

- `apps/oak-curriculum-mcp-streamable-http` — a working Vercel-deployed, observable, rate-limited, Clerk-authenticated headless app (Express 5 + esbuild). Reuse its observability / rate-limit / Clerk **packages**; its Express **router does not transfer** — Express is the right choice for an MCP-SDK server, but Ask Oisín is a Next.js App Router handler under `@vercel/slack-bolt`. Reuse the shared packages, not the framework.
- Shared workspace packages already consumed by that app: `@oaknational/{result, env, env-resolution, logger, observability, sentry-node, type-helpers, build-metadata}`.
- The official remote GitHub MCP server (`https://api.githubcopilot.com/mcp/`, GA) for live repo reads; the Vercel AI SDK + AI Gateway for the model layer; `@ai-sdk/mcp` for MCP attachment.

---

## Design Principles

1. **Thin app over a shared framework** — the per-app delta is a config object + system prompt; everything else lives in `packages/libs/slack-assistant`. Apps are leaf deployables and never depend on each other.
2. **Config seam = Oak-specific vs general** — `defineSlackAssistant(config)`: framework is org-agnostic and publishable; `config` carries all Oak specifics. The placement test: *would another org's bot need this unchanged?* → framework; *change a value?* → config; *change logic?* → mis-placed.
3. **No vendoring, ever** — the repo is read live via the GitHub MCP; nothing is baked into the deploy.
4. **Pragmatic PII egress as a framework invariant** — only the sanctioned question egresses, scrubbed and identity-stripped; no content in logs/Sentry/KV; ZDR on. (Owner ruling; see design doc §Security.)
5. **First-party integrations over bespoke** — see Build-vs-Buy Attestation.
6. **Framework-first is an owner override of `consolidate-at-second-consumer`** (ruled 2026-07-08). Normally the reusable package is extracted at the *second* consumer; the owner accepts building it now, with Ask Oak as the committed (alpha-gated) second consumer, and accepts that Ask Oak validates only the *shared* surface of the seam — its hardest part, durable OAuth refresh-token persistence, is app-specific and sits outside the framework. The framework is **not** on Oisín's value-critical path: Oisín could ship as a single well-factored app, so building the package now is the accepted extra investment, not a technical necessity.
7. **Seam stop-rule** — framework code encodes only the demonstrably-shared surface (model loop, PII boundary, MCP attach, Slack surface, config schema). Anything that would require guessing Ask Oak's unstable-alpha specifics stays in-app until Ask Oak is actually built; resist generality beyond that (YAGNI).

**Non-Goals** (YAGNI):

- **Ask Oak** — separate future app (`../future/ask-oak.plan.md`); this plan only ensures the seam makes it thin.
- **Running-text matcher / `message.channels`** — deferred (privacy ruling); v1 is explicit-invocation only.
- **Token-by-token streaming** — production hardening, not v1.
- **Neon/relational storage** — Oisín is stateless; only an optional retry-dedup KV.
- **Multi-workspace OAuth install store**, **web/CLI adapters**, **feedback analytics** — later.
- **Generalising the framework beyond Oisín's needs** — no speculative config surface.

---

## Build-vs-Buy Attestation (REQUIRED before ExitPlanMode)

**Vendors**: Vercel (hosting + Slack adapter + AI Gateway), Anthropic (model, via Gateway), GitHub (repo read via MCP), Slack (platform).

**First-party integrations surveyed**:

| Integration shipped by vendor | Evaluated? | Adopted / ruled out + reason |
|--|--|--|
| `@vercel/slack-bolt` (official Vercel Slack adapter) | yes | **adopted** — solves the 3s-ack/`waitUntil` serverless problem first-party |
| Vercel AI SDK + AI Gateway | yes | **adopted** over raw Anthropic SDK — zero-markup BYOK, observability, failover, ZDR, one model interface |
| Official remote GitHub MCP server | yes | **adopted** over a bespoke GitHub REST client — first-party, read-only scoping, GA |
| `@ai-sdk/mcp` `createMCPClient` | yes | **adopted** — first-party MCP client, one tool loop, ZDR-eligible (vs Anthropic's connector) |
| In-repo MCP-app observability / rate-limit / Clerk packages | yes | **adopted** — reuse the shared packages; the MCP app's Express router is **not** reused (that framework fits an MCP-SDK server, not this Bolt-adapter Slack app — Ask Oisín is a Next.js App Router handler) |
| Vercel/community "Slack agent" starter as the framework skeleton | yes | **ruled out as a skeleton** — the `@vercel/slack-bolt` changelog example is a single-file demo, not a reusable framework, and no first-party "grounded-assistant-over-MCP framework" ships. We adopt the *adapter* (above) but hand-build the thin `defineSlackAssistant` seam (a factory + Zod config); the bespoke surface is minimal and justified by the committed second consumer, not sunk cost |
| Anthropic MCP connector (`mcp_servers`) | yes | **ruled out** — Anthropic-API-only (breaks the AI-SDK abstraction) and not ZDR-eligible |

**Reviewer**: `assumptions-expert` MUST run against this attestation pre-ExitPlanMode.

---

## Framework: Next.js App Router (settled)

The app framework is **Next.js App Router** — settled 2026-07-08. Choosing `@vercel/slack-bolt` for its `waitUntil` ack *is* choosing a Web-Request framework: the adapter is Web-Request-native and exports `export const POST = createHandler(app, receiver)` — a Next.js App Router route handler. Vercel's changelog names Hono/Nitro/Next.js and does not list Express; running Bolt on Express would mean Bolt's classic `ExpressReceiver`, i.e. *not* this adapter, forfeiting the `waitUntil` benefit we adopted it for. Next.js is the canonical Vercel host and is already in the monorepo (the `oak-curriculum-hub` demo). Incoming canonical Next.js/React resources will supply shared config/conventions to **adopt**, not change the framework. **Plan-body first-principles check** (`../../rules/plan-body-first-principles-check.md`): before WS4/WS8 rely on the `@vercel/slack-bolt` receiver shape, confirm it against the current README (vendor-literal clause), and adopt the shared Next.js config workspace if it has landed.

---

## Session Discipline (multi-session plans only)

> **Session discipline**: see [`../../templates/components/session-discipline.md`](../../templates/components/session-discipline.md). The four disciplines apply to every session. Forward-load the WS0 `@vercel/slack-bolt` receiver spike into the first session — it de-risks WS4/WS8.

---

## Lifecycle Triggers

> See [Lifecycle Triggers component](../../templates/components/lifecycle-triggers.md)

- **Start-right**: `oak-start-right-quick` at each session open.
- **Thread record**: create `.agent/memory/operational/threads/oak-slack-assistants.next-session.md` (PDR-027) at execution start — the thread is newly established by this plan.
- **Active claim**: register `apps/slack/**` and `packages/libs/slack-assistant/**` before the first edit.
- **Handoff / consolidation**: session-handoff at each close; `/oak-consolidate-docs` at WS10.

---

## Cycle Dependencies and Parallelisation

> See [TDD Cycles component](../../templates/components/tdd-phases.md) §"Atomic, independent cycles for parallel dispatch"

- **WS0** gates everything (workspaces must exist).
- **WS1, WS2, WS3, WS4, WS7** are parallel-safe after WS0 — separate module/file scopes inside the framework package (and WS7 in the app's observability wiring). Dispatchable to separate agents.
- **WS5** sequences after WS1–4 (composes them). **WS6** after WS5. **WS8** after WS6 + WS7. **WS9** after WS8. **WS10** last.

---

## Reviewer Scheduling (phase-aligned)

- **Plan-phase (pre-ExitPlanMode)**: `assumptions-expert` (proportionality, build-vs-buy, blocking legitimacy); `mcp-expert` (GitHub MCP + `@ai-sdk/mcp` idiom).
- **Mid-cycle**: `test-expert` + `type-expert` per RED/GREEN; `security-expert` after WS2/WS7 (PII boundary, secrets, egress); `config-expert` after WS0 (new-workspace configs); `code-expert` gateway.
- **Close**: `accessibility-expert` (any rendered affordance/disclaimer, WCAG 2.2 AA); `docs-adr-expert`, `onboarding-expert`; `release-readiness-expert` (GO/NO-GO).

---

## WS0 — Scaffold workspaces + adapter spike

Create `packages/libs/slack-assistant` (a lib: tsc/esbuild build) and `apps/slack/ask-oisin` (a **Next.js App Router** app + `vercel.json`) with package.json, tsconfig, eslint, vitest. Reuse the MCP app's observability / rate-limit / Clerk **packages** (not its Express router). Add the `apps/slack/*` glob to `pnpm-workspace.yaml`. Spike the `@vercel/slack-bolt` receiver wiring against its current README and record the confirmed shape.

**Acceptance**: `pnpm build && pnpm type-check && pnpm lint` green for both new workspaces; the adapter spike proves an ack path within Slack's 3s window locally. **Proof**: `non-code` (workspace builds) + a captured local ack. **Reviewer**: `config-expert`.

---

## WS1 — Framework: model layer (`ask()`)

Cycles delivering the AI-SDK/Gateway call with a bounded tool loop.

### Cycle 1.1: bounded tool loop + slug validation

**Parallel-safety**: parallel-safe (own file scope). **Starting state**: after WS0.
**File scope**: `packages/libs/slack-assistant/src/model.ts` (NEW), `…/model.unit.test.ts` (NEW). **Not to touch**: other framework modules.
**Test (Red)**: `ask()` calls `generateText` with `stopWhen: isStepCount(N)` and the given tools; a hyphenated legacy slug (`anthropic/claude-sonnet-4-5`) is rejected, a dot-slug accepted.
**Product code (Green)**: `model.ts` — `ask(system, prompt, tools)` + `assertModelSlug()`.
**Acceptance**: test passes; whole tree green; commit names the cycle.
**Validation**: `pnpm test --filter @oaknational/slack-assistant` → exit 0; `pnpm test` → exit 0, no skips.
**Reviewer**: `type-expert`.
**Note (mcp-expert review)**: re-verify `isStepCount` (v7 name; was `stepCountIs` in v6) against the *installed* `ai` version in `node_modules` at GREEN, per `verify-vendor-call-shapes` — not against docs.

---

## WS2 — Framework: PII egress boundary (`scrub()` + guard)

The org-critical slice. Cycles delivering identity-stripping and structured-PII redaction applied to prompt and tool args.

### Cycle 2.1: scrub identity + structured PII

**Parallel-safety**: parallel-safe. **File scope**: `…/pii.ts` (NEW), `…/pii.unit.test.ts` (NEW).
**Test (Red)**: `scrub()` removes `<@U…>` mentions, email-shaped and phone-shaped tokens, and any provided author identity; a fixture message with an email + user id egresses with neither.
**Product code (Green)**: `pii.ts` — `scrub(text)` and an egress guard asserting the outbound payload is the sanctioned question only.
**Acceptance**: test passes; tree green. **Validation**: workspace test exit 0; full test exit 0.
**Reviewer**: `security-expert` (mid-cycle, after GREEN).

---

## WS3 — Framework: MCP attachment (`attachMcp()`)

### Cycle 3.1: attach + denylist filter

**Parallel-safety**: parallel-safe. **File scope**: `…/mcp.ts` (NEW), `…/mcp.unit.test.ts` (NEW).
**Test (Red)**: given a mocked `createMCPClient`, `attachMcp({url, headers, deny})` returns the tool map minus denied keys and sets the auth/toolset headers.
**Product code (Green)**: `mcp.ts` — Streamable HTTP transport, header/authProvider auth, denylist filter.
**Acceptance/Validation**: as WS1/2. **Reviewer**: `mcp-expert`.
**Notes (mcp-expert review)**: (a) the MCP client is created once per warm instance (module top-level), so the denylist auto-picks-up new server tools only on cold start, not live — acceptable, but state it in the module doc. (b) Re-verify the `@ai-sdk/mcp` `createMCPClient`/transport shape against the *installed* version at GREEN (`verify-vendor-call-shapes`).

---

## WS4 — Framework: Slack surface adapter

### Cycle 4.1: invocation wiring (explicit-only)

**Parallel-safety**: parallel-safe. **File scope**: `…/slack.ts` (NEW), `…/slack.integration.test.ts` (NEW).
**Test (Red)** (integration, Bolt test harness): `app_mention`, DM (`message.im`, `channel_type==="im"`), and slash route to `ask()` with scrubbed text; a channel message is NOT handled (no `message.channels` subscription); a message with the bot's own mention does not double-answer.
**Product code (Green)**: `slack.ts` — `@vercel/slack-bolt` wiring, signature verification, mrkdwn + disclaimer, assistant-thread suggested prompts.
**Acceptance**: integration test passes; tree green. **Reviewer**: `security-expert` (signature verification), `code-expert`.

---

## WS5 — Framework: `defineSlackAssistant()` + config schema

### Cycle 5.1: factory composes the framework

**Starting state**: after WS1–4. **File scope**: `…/define.ts` (NEW), `…/config.ts` (Zod schema, NEW), `…/define.integration.test.ts` (NEW).
**Test (Red)**: a minimal config yields a working handler that, given a stub MCP + stub model, answers a scrubbed question; an invalid config is rejected by the schema.
**Product code (Green)**: `define.ts` + `config.ts` — the seam; the package's public export.
**Acceptance**: integration test passes; tree green; `packages/libs/slack-assistant` has zero Oak-specific literals (grep gate). **Reviewer**: `architecture-expert-*` (seam), `type-expert`.

---

## WS6 — Ask Oisín config (app)

### Cycle 6.1: Oisín config over the framework

**Starting state**: after WS5. **File scope**: `apps/slack/ask-oisin/src/config.ts` (NEW), `…/config.unit.test.ts` (NEW).
**Test (Red)**: the Oisín config attaches the GitHub MCP with `X-MCP-Readonly: true` and `X-MCP-Toolsets: repos`; the system prompt names the repo-nav start point and the Ask-Oak hand-off; config validates against the schema.
**Product code (Green)**: `config.ts` — Oisín persona, GitHub MCP attach, model slug, name.
**Acceptance/Validation**: as above. **Reviewer**: `mcp-expert`.
**Note (mcp-expert review)**: verify the `repos` toolset exposes a content-search tool sufficient for open-ended questions; if Oisín's grounding needs repo-wide search beyond reading known paths, add the `search` toolset to `X-MCP-Toolsets`. This gates WS9's open-ended-question acceptance.

---

## WS7 — Observability + rate limiting (app)

### Cycle 7.1: Sentry beforeSend scrubber + metadata-only logging

**Parallel-safety**: parallel-safe after WS0. **File scope**: `apps/slack/ask-oisin/src/observability.ts` (NEW) + test.
**Test (Red)**: `beforeSend` strips message bodies/PII from events; the logger emits event-type/latency/token-count only, never message content; rate limiter (reused factory) rejects over-limit.
**Product code (Green)**: wire `@oaknational/sentry-node` `beforeSend`, structured logging, `express-rate-limit`/factory.
**Seam note (assumptions-expert review)**: the PII-safe scrubber and the log-redaction policy are framework-tier — they live in the framework PII module (WS2, the reusable egress boundary). WS7 only *wires* them into the app's Sentry `beforeSend` and logger, plus the deploy-specific rate limiter. This reconciles the design's framework-tier observability with app-specific deploy wiring.
**Acceptance/Validation**: as above. **Reviewer**: `security-expert`.

---

## WS8 — Deploy config

`vercel.json` (Next.js on Vercel), `maxDuration` covering model+GitHub-read latency, env wiring (`SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, `AI_GATEWAY_API_KEY`, `CLAUDE_MODEL`, `GITHUB_TOKEN`), `manifest.oisin.yaml` (scopes without `channels:history`; events without `message.channels`).

**Acceptance**: a Vercel **preview deploy** receives a Slack `app_mention` and acks within 3s (value-proxy). **Proof**: `value-proxy` — captured Slack delivery + 2xx within window.

---

## WS9 — E2E value-proxy

### Cycle 9.1: grounded, cited answer + PII egress proof

**Starting state**: after WS8. **Test**: a known project question ("What is the Practice?") returns an answer that (a) is grounded in a live GitHub read and (b) cites the repo path used; a captured outbound model payload contains the sanctioned question only — no user id, name, or structured PII.
**Acceptance**: both assertions pass against the preview deploy. **Proof**: `e2e` + `value-proxy` (grounded answer) and `integration` (captured-payload PII assertion).

---

## WS10 — Reviews, docs, consolidation

Run readiness reviewers (`release-readiness-expert` GO/NO-GO gate), propagate settled outcomes to canonical docs (a `slack-assistant` package README; app README; any ADR if the framework introduces an architectural boundary), update the design doc's status, and run `/oak-consolidate-docs`.

---

## Proof Contract

| Acceptance id | Proof level | Proven by |
|---|---|---|
| Framework units (WS1–5) | unit / integration | `pnpm test --filter @oaknational/slack-assistant` exit 0 |
| PII egress invariant (WS2, WS9) | unit + integration | scrub tests + captured-outbound-payload assertion showing question-only |
| No Oak literals in framework (WS5) | non-code | grep gate over `packages/libs/slack-assistant/src` |
| Oisín config attaches read-only GitHub MCP (WS6) | unit | header assertions |
| No content in Sentry/logs (WS7) | unit/integration | beforeSend + logger tests |
| 3s ack (WS8) | value-proxy | captured Slack delivery + timely 2xx on a preview deploy |
| Grounded, cited answer (WS9) | e2e / value-proxy | preview-deploy question returns cited, repo-grounded answer |

`complete` is claimable only when every id above is proven. TDD evidence must be test-first; retrospective coverage is not TDD evidence.

---

## Risk Assessment

> See [Risk Assessment component](../../templates/components/risk-assessment.md)

| Risk | Mitigation |
|------|------------|
| Incoming shared Next.js config workspace differs from our scaffold | Framework is settled (Next.js App Router); adopt the shared config's conventions when it lands — a config alignment, not a framework change |
| PII leak via logs/Sentry/tool-args | WS2 scrub applies to prompt AND tool args; WS7 beforeSend + metadata-only logging; `security-expert` gate |
| `oak-skills` is private → no live tone-of-voice | Prereq below; minimum shippable = grounded answers with degraded voice until PAT scope / public flip / mirror |
| `@vercel/slack-bolt` receiver wiring uncertain | WS0 spike confirms against current README before WS4/WS8 depend on it |
| Gateway BYOK cost / abuse | ZDR on; budget alerts; reuse rate-limiter |
| Premature framework generality | Extract only what Oisín needs; WS5 grep gate for zero Oak literals is the seam test, not a generality mandate |
| Owner override of `consolidate-at-second-consumer` (framework built before the real 2nd consumer) | Owner-accepted 2026-07-08; seam stop-rule (Principle 7) holds the framework to the shared surface; framework is off Oisín's value-critical path, so Oisín still ships if extraction proves premature |
| Seam drawn from a guess at Ask Oak's needs | Encode only the demonstrably-shared surface; Ask Oak's OAuth persistence stays app-side; if WS5 starts encoding Ask-Oak specifics, keep them in-app until Ask Oak is built |
| Prompt injection via repo content | Read-only tools only (`X-MCP-Readonly`); bot has no write/destructive capability |

---

## Foundation Alignment

> See [Foundation Alignment component](../../templates/components/foundation-alignment.md)

- **principles.md** — decision lenses applied in the design doc §4; simplicity (thin apps), strict boundaries (PII), long-term architecture (publishable seam).
- **testing-strategy.md** — TDD cycle-pairs as the unit of landing; unit/integration/e2e taxonomy per WS; no skipped/conditional tests.
- **schema-first-execution.md** — the config seam is a Zod schema; MCP tool shapes come from the servers, not hand-typed.

---

## Documentation Propagation

> See [Documentation Propagation component](../../templates/components/documentation-propagation.md)

`slack-assistant` package README (the config seam + "spin up your own"); `apps/slack/ask-oisin` README; design-doc status update; an ADR only if the framework introduces a durable architectural boundary worth recording.

---

## Consolidation

After all WS complete and gates pass, run `/oak-consolidate-docs` to graduate settled content, extract reusable patterns, and update the practice exchange.

---

## Dependencies

**Blocking**:

- Slack app registration (bot token + signing secret) for Ask Oisín.
- Vercel project + `AI_GATEWAY_API_KEY` with BYOK (paid tier + purchased credits).
- GitHub fine-grained PAT with read on the public OCE repo.

**Blocking for full voice (beneficial otherwise)**:

- PAT read on the private `oak-skills` repo (or `oak-skills` made public, or tone-of-voice mirrored into the OCE repo). **Minimum shippable without it**: Oisín answers grounded in the repo with degraded (non-Oak-voiced) tone.

**Beneficial**:

- AI Gateway ZDR toggle on (recommended for Oak's own material).
- The MCP app's harness as the copy source for build/deploy/observability.

**Related Plans**:

- [`../future/ask-oak.plan.md`](../future/ask-oak.plan.md) — the second consumer; promoted when Oak MCP alpha credentials land.
- Design source: [`oisin-oce-navigator-design.md`](../../../research/outreach/oisin-oce-navigator-design.md).
