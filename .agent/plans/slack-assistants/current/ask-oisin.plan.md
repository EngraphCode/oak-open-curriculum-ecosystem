---
name: "Ask Oisín — v1 Slack assistant, framework-first"
overview: "Ship Ask Oisín (project/repo navigator) as a headless Next.js App Router Slack app on Vercel, extracting a reusable slack-assistant framework so future Slack apps (Ask Oak next) are thin config. Internal-use only, allow-listed installations."
lineage:
  serves_thread: oak-slack-assistants
  serves_stream: "agentic surfaces over Oak's MCPs (new; no parent stream record yet)"
  strategic_choice: "n/a — new surface domain"
  derives_from: ".agent/research/outreach/oisin-oce-navigator-design.md (PR #328, open, on branch feat/slack-apps — NOT yet merged to main)"
todos:
  - id: ws0-scaffold
    content: "WS0: scaffold packages/libs/slack-assistant (lib, repo tsup + three-tsconfig convention) + apps/slack/ask-oisin (Next.js App Router + vercel.json); register BOTH in pnpm-workspace; add turbo.json Next.js task entries; register slack-assistant in the eslint lib-boundary config with its permitted adapter imports (logging adapter); author the ADR for the apps/slack tier + framework placement; decide the Next.js Sentry init mechanism. Tree green."
    status: pending
    depends_on: []
  - id: ws1-model-layer
    content: "WS1: slack-assistant ask() over AI SDK + Gateway — bounded tool loop (isStepCount), tools typed as the AI SDK ToolSet. NO model-slug format validation (opaque operator-configured env string). Behaviour tests over an injected fake model."
    status: pending
    depends_on: [ws0-scaffold]
  - id: ws2-pii-boundary
    content: "WS2: PII egress boundary — scrub() strips identity/mentions/emails/phones/structured PII from the inbound question AND from model-generated tool-call arguments; scrub() returns a branded ScrubbedQuestion type that the egress path requires; config is injected (framework reads no process.env). Unit + integration tests."
    status: pending
    depends_on: [ws0-scaffold]
  - id: ws3-mcp-attach
    content: "WS3: attachMcp(config) — split: a mock-free unit test for the pure denylist filter, and an integration test over an injected fake client asserting Streamable-HTTP transport + auth/toolset headers. Note per-cold-start tool pickup."
    status: pending
    depends_on: [ws0-scaffold]
  - id: ws4-slack-surface
    content: "WS4: Slack surface adapter — @vercel/slack-bolt wiring for app_mention, DM (message.im only), slash, assistant-thread; signature verification with a stated test seam; a defined in-process Bolt test harness; mrkdwn + disclaimer. Integration tests + code."
    status: pending
    depends_on: [ws0-scaffold]
  - id: ws5-factory
    content: "WS5: defineSlackAssistant(config) factory + a sketched Zod config schema (Config = z.infer). Seam gate: framework has zero Oak-specific literals AND reads no process.env (config injected). Integration test + code."
    status: pending
    depends_on: [ws1-model-layer, ws2-pii-boundary, ws3-mcp-attach, ws4-slack-surface]
  - id: ws6-oisin-config
    content: "WS6: Ask Oisín config — system prompt (repo-nav, cite-source, hand-off), GitHub MCP attach (read-only, repos toolset — which already includes search_code), model slug (opaque env), name. Bolt event union narrowed (no `as any`)."
    status: pending
    depends_on: [ws5-factory]
  - id: ws7-access-and-limits
    content: "WS7: Access control + abuse limiting — installation allow-list gate (internal-use ONLY; reject any non-allow-listed Slack workspace/team; no external access); per-workspace AND per-user (one-way hashed, never-egressed id) rate limiting in a durable KV. NOT express-rate-limit. Unit + integration tests."
    status: pending
    depends_on: [ws0-scaffold]
  - id: ws8-observability
    content: "WS8: Observability — Next.js Sentry init via the @oaknational/sentry-node all-sink redaction barrier (not events-only); capture + FLUSH errors from the waitUntil continuation before the function terminates; metadata-only logging; Sentry env contract. Do NOT enable AI SDK experimental_telemetry. Unit/integration tests."
    status: pending
    depends_on: [ws0-scaffold]
  - id: ws9-deploy
    content: "WS9: deploy config — vercel.json (Next.js), turbo entries, maxDuration, env wiring (incl SENTRY_*, GITHUB_TOKEN, allow-list), manifest.oisin.yaml (no channels:history / message.channels). Preview deploy acks Slack <3s (value-proxy)."
    status: pending
    depends_on: [ws6-oisin-config, ws7-access-and-limits, ws8-observability]
  - id: ws10-validation
    content: "WS10: split validation — (a) deterministic in-process integration test proving the outbound payload (prompt + tool-call args) carries only the scrubbed question, no identity/PII (CI-safe, over the capture seam); (b) non-CI live value-proxy smoke that a known project question returns a grounded, cited answer; (c) content plain-language readability check."
    status: pending
    depends_on: [ws9-deploy]
  - id: ws11-reviews-docs-consolidation
    content: "WS11: readiness reviews (assumptions/mcp/security/config/accessibility/docs/onboarding/release), doc propagation (ADR-154 citation, what-the-system-emits-today.md, thread record), /oak-consolidate-docs."
    status: pending
    depends_on: [ws10-validation]
isProject: true
---

<!-- Component reference paths are relative to this file
     (.agent/plans/slack-assistants/current/): use ../../templates/components/. -->

# Ask Oisín — v1 Slack assistant, framework-first

**Last Updated**: 2026-07-08
**Status**: 🟡 PLANNING (queued in `current/`, not started; blocking prerequisites in Dependencies). Plan-phase reviews run 2026-07-08 (12-expert fleet + adversarial verify + owner rulings); corrections applied. Re-review after this revision before marking READY FOR EXECUTION.
**Scope**: Ship Ask Oisín as a headless Next.js App Router Slack app on Vercel that answers project questions grounded in a live read of the OCE repo, while extracting a reusable `slack-assistant` framework. Internal-use only, allow-listed installations.

---

## Context

The design is recorded in [`.agent/research/outreach/oisin-oce-navigator-design.md`](../../../research/outreach/oisin-oce-navigator-design.md) — on the open PR #328 branch `feat/slack-apps`, **not yet merged to `main`** (usable as grounding, but not a merged artefact). This plan turns that design into executable work under owner rulings: **build Ask Oisín first**; **Ask Oak is a future app** (`../future/ask-oak.plan.md`); **framework-first**; **Next.js App Router** (settled); **pragmatic PII egress**; **running-text matcher deferred**; **internal-use only with an installation allow-list**.

### Problem Statement

Oak staff have no low-friction way to ask questions about the *project* — the repo, the Practice, strategy, planning state — without reading the `.agent/` substrate themselves. The intended intervention is a Slack bot that answers from a live read of the public repo, extracted over a reusable framework so a second app (Ask Oak) is thin config.

### Existing Capabilities — what transfers, and what does NOT

- Genuine reusable `@oaknational/*` packages consumed via the boundary config: `result`, `env`, `env-resolution`, `logger` (the logging **adapter**, backed by Sentry + stdio), `sentry-node`, `type-helpers`, `build-metadata`.
- **What does NOT transfer** (precedent-transfer trap, verified in review): `express-rate-limit` and the `@clerk/*` client wiring are **third-party, Express-bound, app-local** — not `@oaknational/*` packages, and not runnable under Next.js on Vercel serverless. The MCP app is an OAuth **resource-server / AS-proxy** (it *verifies* inbound tokens); it has no OAuth-**client** acquisition/refresh code, so Ask Oak's client flow is new work, not a lift. `@oaknational/sentry-node` wraps `@sentry/node` for an Express server; a Next.js App Router app needs a Next.js-appropriate init (`@sentry/nextjs` or `instrumentation.ts`) — decided in WS0/WS8.
- The official remote GitHub MCP server (`https://api.githubcopilot.com/mcp/`, GA); the Vercel AI SDK + AI Gateway; `@ai-sdk/mcp`.

---

## Design Principles

1. **Thin app over a shared framework** — per-app delta is a config object + system prompt; the rest lives in `packages/libs/slack-assistant`. Apps are leaf deployables and never depend on each other.
2. **Config seam = Oak-specific vs general** — `defineSlackAssistant(config)`; framework is org-agnostic and publishable; `config` carries all Oak specifics. Governed by [ADR-154](../../../../docs/architecture/architectural-decisions/154-separate-framework-from-consumer.md) (Separate Framework from Consumer). The framework **consumes adapters** (e.g. the logging adapter, backed by Sentry/stdio) — that is the intended architecture, not a boundary violation; WS0 registers the framework in the eslint boundary config with its permitted adapter edges (configure, never disable — see `never-disable-checks`).
3. **No vendoring, ever** — the repo is read live via the GitHub MCP.
4. **Pragmatic PII egress, compiler-enforced** — only the sanctioned question egresses; `scrub()` returns a branded `ScrubbedQuestion` and the egress path accepts only that type; scrubbing covers the inbound question AND model-generated tool-call arguments; no content in logs/Sentry/KV. **The invariant does NOT depend on ZDR** (owner ruling 2026-07-08): it stands on minimisation + scrubbing alone; ZDR stays a beneficial toggle, not a proof dependency (see §Security).
5. **Safeguarding: deflect + signpost, no record** (owner ruling 2026-07-08) — on a sensitive/safeguarding disclosure the bot declines to engage and points the user to Oak's human safeguarding route; nothing is retained (preserves the no-logging invariant). Carried in the system prompt (WS6).
6. **Internal-use only, workspace-level** (owner ruling 2026-07-08) — an installation allow-list gates on the Slack team id and rejects any workspace that is not ours (no external users/access); guests / Slack-Connect members *of an allow-listed workspace* are accepted (workspace-level scope is sufficient for v1). Others may fork the repo and self-host their own instance.
7. **Framework-first is an owner override of `consolidate-at-second-consumer`** (timing only; ruled 2026-07-08). The framework/consumer *separation* is ADR-154; the override is only of *when* to extract. Ask Oak validates the shared surface of the seam; its OAuth persistence is app-side.
8. **Seam stop-rule** — framework code encodes only the demonstrably-shared surface and reads no `process.env` (config injected). Ask-Oak specifics stay in-app until Ask Oak is built.

**Non-Goals** (YAGNI):

- **Ask Oak** — future app; this plan only keeps the seam thin.
- **Running-text matcher / `message.channels`** — deferred (privacy).
- **A custom interactive feedback affordance** — deferred; v1 authors no interactive Block Kit element (removes the untested "accessible feedback" claim). If added later, it carries a WCAG 2.2 AA contract (text labels, non-colour-only, AT-reachable).
- **Token streaming, Neon/relational storage, multi-workspace install store, web/CLI adapters, external access.**
- **AI SDK `experimental_telemetry` / `recordInputs`** — must stay off (it would write raw prompts into span attributes).

---

## Build-vs-Buy Attestation

**Vendors**: Vercel (hosting + Slack adapter + AI Gateway), Anthropic (via Gateway), GitHub (MCP), Slack.

| Integration | Evaluated? | Verdict |
|--|--|--|
| `@vercel/slack-bolt` (Web-Request-native Slack adapter) | yes | **adopted** — Next.js App Router host; solves 3s-ack/`waitUntil` |
| Vercel AI SDK + AI Gateway | yes | **adopted** over raw Anthropic SDK |
| Official remote GitHub MCP server | yes | **adopted** over a bespoke GitHub REST client |
| `@ai-sdk/mcp` `createMCPClient` | yes | **adopted** |
| `@oaknational/*` shared packages (result/env/logger/sentry-node...) | yes | **adopted via the boundary config** (framework consumes the logging adapter) |
| Vercel/community "Slack agent" starter as the framework skeleton | yes | **ruled out** — single-file demo, not a reusable framework; hand-build the thin `defineSlackAssistant` seam |
| Anthropic MCP connector (`mcp_servers`) | yes | **ruled out** — Anthropic-API-only; not ZDR-eligible |
| `express-rate-limit` / `@clerk/*` client wiring | yes | **ruled out for transfer** — Express-bound, not Vercel-serverless-runnable; abuse control uses a durable-KV limiter (WS7) |

**Reviewer**: `assumptions-expert` re-runs against this attestation pre-ExitPlanMode.

---

## Framework: Next.js App Router (settled)

Settled 2026-07-08: choosing `@vercel/slack-bolt` (for its `waitUntil` ack) chooses a Web-Request-native framework (`export const POST = createHandler(app, receiver)`); Vercel names Hono/Nitro/Next.js, not Express. Next.js is the canonical Vercel host, already in the monorepo. This is a fit-for-use-case choice, not a precedent copy of the MCP app's Express. Incoming canonical Next.js/React resources supply shared config to adopt, not a framework change. **Plan-body first-principles check**: before WS4/WS8 rely on the `@vercel/slack-bolt` receiver shape or a Sentry init mechanism, confirm against the current vendor README/docs (vendor-literal), and adopt the shared Next.js config workspace if it has landed.

---

## Lifecycle Triggers

> See [Lifecycle Triggers component](../../templates/components/lifecycle-triggers.md)

- **Start-right** each session; **thread record** `oak-slack-assistants.next-session.md` created with this revision; **active claim** on `apps/slack/**` + `packages/libs/slack-assistant/**`; **consolidation** at WS11.

---

## Cycle Dependencies and Parallelisation

> See [TDD Cycles component](../../templates/components/tdd-phases.md)

WS0 gates all. **WS1, WS2, WS3, WS4, WS7, WS8** are parallel-safe after WS0 (separate file scopes). WS5←WS1–4; WS6←WS5; WS9←WS6+WS7+WS8; WS10←WS9; WS11 last.

---

## Reviewer Scheduling

- **Plan-phase**: `assumptions-expert`, `mcp-expert`, `architecture-expert-fred` (boundary config + ADR), `config-expert` (workspace/turbo/eslint-boundary).
- **Mid-cycle**: `test-expert` + `type-expert` per RED/GREEN; `security-expert` after WS2/WS7/WS8 (PII, access control, egress); `code-expert` gateway.
- **Close**: `accessibility-expert` (content readability + any future affordance), `docs-adr-expert`, `release-readiness-expert`.

---

## WS0 — Scaffold, register, configure

Create `packages/libs/slack-assistant` (a lib on the repo's **tsup + three-tsconfig** convention — copy a `packages/libs/*` member, not a bespoke tsc/esbuild build) and `apps/slack/ask-oisin` (a **Next.js App Router** app + `vercel.json`, copying the `oak-curriculum-hub` Next config: `noEmit`, `jsx`, next plugin, `@/*` alias). Register **both** in `pnpm-workspace.yaml` (an explicit `packages/libs/slack-assistant` line and the `apps/slack/*` glob). Add `turbo.json` task entries for the Next.js app (`.next` outputs, `!.next` inputs), mirroring the hub. Register `slack-assistant` in the eslint lib-boundary config with its permitted adapter imports (it consumes the logging adapter). Author an ADR (citing [ADR-154](../../../../docs/architecture/architectural-decisions/154-separate-framework-from-consumer.md) for the framework/consumer seam and [ADR-041](../../../../docs/architecture/architectural-decisions/041-workspace-structure-option-a.md) for the workspace tier) recording the `apps/slack/*` family and the framework's tier + permitted edges. Decide + record the Next.js Sentry init mechanism.

**Acceptance**: `pnpm build && pnpm type-check && pnpm lint` green for both workspaces (lint proves the boundary config accepts the framework's adapter imports); the `@vercel/slack-bolt` receiver spike acks within 3s locally; ADR merged. **Reviewers**: `config-expert`, `architecture-expert-fred`.

---

## WS1 — Framework: model layer (`ask()`)

### Cycle 1.1: bounded tool loop (no slug-format validation)

**Parallel-safe** after WS0. **File scope**: `packages/libs/slack-assistant/src/model.ts` + `model.unit.test.ts`.
**Test (Red)** — behaviour over an injected fake model: given a fake that returns text after K tool round-trips, `ask()` returns that text and stops at the configured bound. Do NOT assert the internal `generateText` call shape (audit-shaped). The model slug is an **opaque operator-configured env string** — no hyphen/dot format validation (the Gateway rejects unknown slugs at call time; current Anthropic IDs are hyphenated, e.g. `claude-sonnet-5`, so a format heuristic would false-reject valid models).
**Product code (Green)**: `model.ts` — `ask(system, prompt, tools)`; `tools` typed as the AI SDK `ToolSet` (not `Record<string, unknown>`).
**Validation**: workspace test exit 0; full `pnpm test` exit 0. **Reviewer**: `type-expert`.
**Note**: re-verify `isStepCount` and `ToolSet` against the *installed* `ai` version at GREEN (`verify-vendor-call-shapes`).

---

## WS2 — Framework: PII egress boundary (org-critical)

### Cycle 2.1: scrub the inbound question → branded type

**File scope**: `src/pii.ts` + `pii.unit.test.ts`. **Test (Red)**: `scrub()` removes `<@U…>` mentions, email- and phone-shaped tokens, and author identity; it returns a branded `ScrubbedQuestion = string & { readonly __scrubbed: unique symbol }`. **Product code**: `scrub()` + the branded type; the egress path (`ask()`/tool dispatch) accepts only `ScrubbedQuestion`, so the compiler rejects unscrubbed egress. **Reviewer**: `security-expert`, `type-expert`.

### Cycle 2.2: scrub model-generated tool-call arguments

**File scope**: `src/pii.ts` + an integration test over the tool-loop seam with a capturing fake tool. **Test (Red)**: when the model emits a tool call whose arguments echo PII from the question, the arguments are scrubbed before they reach the MCP transport. **Product code**: apply `scrub()` (or a structured-arg scrubber) at the tool-dispatch boundary. This closes the design's named tool-argument egress vector — without it the PII invariant the owner ruling rests on is not enforced end-to-end. **Reviewer**: `security-expert`.

---

## WS3 — Framework: MCP attachment

### Cycle 3.1: pure denylist filter (unit, mock-free)

**File scope**: `src/mcp-filter.ts` + `*.unit.test.ts`. **Test**: parameters in (tool map + denylist), filtered map out — no mocks. **Product code**: the pure filter.

### Cycle 3.2: attachMcp over an injected fake client (integration)

**File scope**: `src/mcp.ts` + `*.integration.test.ts`. **Test**: an injected fake client receives the Streamable-HTTP transport config + auth/toolset headers; the filtered tools are returned. **Note**: the client is created once per warm instance (module scope), so denylist auto-pickup of new server tools is per-cold-start, not live — state it in the module doc. **Reviewer**: `mcp-expert`.

---

## WS4 — Framework: Slack surface adapter

### Cycle 4.1: invocation wiring + signature verification (explicit-only)

**File scope**: `src/slack.ts` + `*.integration.test.ts`. **Test harness (defined)**: drive Bolt events in-process by invoking the receiver's request handler with a signed synthetic request (no network); assert routing without HTTP. **Test (Red)**: `app_mention`, DM (`message.im`, `channel_type==="im"`) and slash route to `ask()` with a `ScrubbedQuestion`; a channel message is NOT handled (no `message.channels`); a self-mention does not double-answer; a request with an invalid Slack signature is rejected. **Product code**: `@vercel/slack-bolt` wiring, signature verification, mrkdwn + disclaimer, assistant-thread prompts. The Bolt message event is narrowed via its typed union (no `as any`). **Reviewer**: `security-expert`, `code-expert`.

---

## WS5 — Framework: `defineSlackAssistant()` + config schema

### Cycle 5.1: factory + Zod config schema (the seam)

**File scope**: `src/define.ts`, `src/config.ts`, `*.integration.test.ts`. **Config schema (sketch)**: `{ name, model (env slug), mcp: { url, headers|authProvider, deny[] }, systemPrompt, invocation: { slashCommands[] }, egress: { scrub, allowList }, observability (injected), disclaimer }` with `type Config = z.infer<typeof configSchema>`. **Test (Red)**: a minimal config yields a working handler (stub MCP + stub model) answering a scrubbed question; an invalid config is rejected. **Seam gate**: `packages/libs/slack-assistant/src` has (a) zero Oak-specific literals and (b) **zero `process.env` reads** (config injected) — both grep-gated. **Reviewer**: `architecture-expert-*`, `type-expert`.

---

## WS6 — Ask Oisín config (app)

### Cycle 6.1: Oisín config over the framework

**File scope**: `apps/slack/ask-oisin/src/config.ts` + test. **Test (Red)**: attaches the GitHub MCP with `X-MCP-Readonly: true` and `X-MCP-Toolsets: repos` (the `repos` toolset already includes `search_code` + `get_file_contents`, sufficient for search-then-read grounding — no separate `search` toolset exists); system prompt names the under-the-hood start point + cite-source + **declines curriculum-content questions with a short explanation** (Ask Oak is not yet live) + a **safeguarding deflect-and-signpost instruction** (on a sensitive/safeguarding disclosure, decline to engage and point to Oak's human safeguarding route; retain nothing); config validates. Audience is **internal Oak staff** (reconciled from a stray "Pathfinder team" literal). **Reviewer**: `mcp-expert`.

---

## WS7 — Access control + abuse limiting

### Cycle 7.1: installation allow-list (internal-use only)

**File scope**: `apps/slack/ask-oisin/src/access.ts` + test. **Test (Red)**: a request from an allow-listed Slack team/workspace id is accepted; a request from any other workspace is rejected (internal-use only; no external access). The allow-list is config/env-driven. **Scope (owner ruling)**: workspace-level is the accepted v1 definition — guests / Slack-Connect members *within* an allow-listed workspace are accepted; no per-user identity gating in v1. **Product code**: verify the Slack team id against the allow-list after signature verification, before any model call. **Reviewer**: `security-expert`.

### Cycle 7.2: per-workspace + per-user (hashed) rate limiting

**File scope**: `src/rate-limit.ts` + test. **Test (Red)**: over-limit requests are rejected; the limiter keys on the Slack team id (per-workspace) AND a **salted one-way hash of the user id that is never egressed** (per-user), in a durable KV (Upstash/Vercel KV) — NOT `express-rate-limit` (Express-bound, doesn't survive serverless, can't see users behind Slack's shared egress IP). The hash reconciles per-user limiting with PII identity-stripping. **Default thresholds (env-tunable)**: ~20 requests/hour per hashed user, ~200/hour per workspace — comfortably under GitHub's 5,000/hour authenticated REST limit. **Reviewer**: `security-expert`.

---

## WS8 — Observability

### Cycle 8.1: Next.js Sentry init via the all-sink barrier + waitUntil flush

**File scope**: `apps/slack/ask-oisin/src/observability.ts` (+ `instrumentation.ts` if that is the chosen Next.js init) + test. **Test (Red)**: a forced failure in the `waitUntil` continuation is captured AND Sentry is flushed before the function terminates (Vercel truncates otherwise); logs carry event-type/latency/token-count only, never message content. **Product code**: init through the `@oaknational/sentry-node` **all-sink redaction barrier** (beforeSend + beforeSendSpan + beforeSendLog + beforeSendTransaction + beforeBreadcrumb — ADR-160), not an events-only `beforeSend`; a `waitUntil`-aware capture+flush. AI SDK `experimental_telemetry` stays off. **Reviewer**: `security-expert`, `sentry-expert`.

---

## WS9 — Deploy config

`vercel.json` (Next.js), the `turbo.json` entries from WS0, `maxDuration` covering model + live GitHub reads, env wiring (`SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, `AI_GATEWAY_API_KEY`, `CLAUDE_MODEL`, `GITHUB_TOKEN`, `SENTRY_MODE`/`SENTRY_DSN` + build-metadata release inputs, the allow-list), `manifest.oisin.yaml` (scopes without `channels:history`; events without `message.channels`).

**Acceptance**: a Vercel **preview deploy** acks a Slack `app_mention` within 3s (value-proxy).

---

## WS10 — Validation (split)

### Cycle 10.1: deterministic PII payload assertion (CI-safe)

**In-process integration test** over the WS2 capture seam: the outbound payload (system + prompt + every tool-call argument) contains only the `ScrubbedQuestion` — no Slack user id, display name, or structured PII. Fully deterministic, runs in CI. **Proof**: `integration`.

### Cycle 10.2: live grounded-answer smoke (non-CI)

A **manual/value-proxy** check against the preview deploy: "What is the Practice?" returns an answer grounded in a live repo read that **cites the repo path** used. Non-deterministic (live LLM), so not a CI gate. **Proof**: `value-proxy` / `e2e` (manual).

### Cycle 10.3: content readability

The reply text meets plain-language / WCAG understandable expectations (in scope even without React components), measured against **`oak-tone-of-voice`** as the named readability bar (already the loaded voice standard). **Proof**: `non-code` (reviewer check).

---

## WS11 — Reviews, docs, consolidation

Readiness reviewers (`release-readiness-expert` GO/NO-GO). Doc propagation: cite ADR-154 as the governing seam decision; register Ask Oisín as a runtime in [`what-the-system-emits-today.md`](../../observability/what-the-system-emits-today.md) (Engineering cell: Sentry capture + WS8 test id); update the design-doc status; author the `slack-assistant` README and app README. Run `/oak-consolidate-docs`.

---

## Proof Contract

| Acceptance id | Proof level | Proven by |
|---|---|---|
| Framework units (WS1–5) | unit / integration | `pnpm test --filter @oaknational/slack-assistant` exit 0 |
| PII egress: inbound + tool-args, branded-type-enforced (WS2, WS10.1) | unit + integration + type | scrub tests + tool-arg capture test + compile failure on unscrubbed egress + deterministic outbound-payload assertion |
| No Oak literals AND no `process.env` in framework (WS5) | non-code | two grep gates over `packages/libs/slack-assistant/src` |
| Internal-only access + rate limits (WS7) | integration | allow-list accept/reject + over-limit reject tests |
| Next.js Sentry all-sink + waitUntil flush (WS8) | integration | forced-failure-in-continuation captured+flushed; no content in events |
| GitHub MCP read-only attach (WS6) | unit | header assertions |
| 3s ack (WS9) | value-proxy | captured Slack delivery + timely 2xx on a preview deploy |
| Grounded, cited answer (WS10.2) | value-proxy (manual) | preview-deploy question returns a cited, repo-grounded answer |

`complete` is claimable only when every id is proven. TDD evidence must be test-first.

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Precedent-transfer trap (Express/MCP-shaped assumptions on a Next.js Bolt app) | Existing Capabilities separates what transfers (shared `@oaknational/*` packages) from what does not (express-rate-limit, Clerk client, Express Sentry init); WS7/WS8 build Vercel-appropriate replacements |
| PII not enforced end-to-end | WS2 scrubs inbound AND tool-args; branded `ScrubbedQuestion` gives compile-time enforcement; WS10.1 deterministic payload assertion; framework reads no env |
| External/unauthorised access | WS7 installation allow-list (internal-only) after signature verification; reject non-allow-listed workspaces |
| Framework mis-tiered / boundary rule blocks legitimate adapter use | WS0 configures the eslint boundary for the framework's permitted adapter edges (configure, never disable); ADR records the tier |
| Incoming shared Next.js config workspace differs from our scaffold | Framework settled (Next.js App Router); adopt the shared config when it lands (config alignment, not a framework change) |
| ZDR is contractual, not just a toggle | Confirm the Anthropic/Gateway ZDR arrangement (owner/legal) before treating "no retention" as guaranteed; reconcile ZDR's plan classification (invariant vs beneficial) with a proof row |
| Prompt injection via public repo content steering the private-scoped `oak-skills` read | Read-only tools; PAT scoped to exactly the two repos; note the public-content-instructs-private-read pivot; disclosures land only in-Slack to internal staff |

---

## Foundation Alignment

> See [Foundation Alignment component](../../templates/components/foundation-alignment.md)

- **principles.md** — decision lenses (design §4); simplicity, strict boundaries (PII branded type), long-term architecture (ADR-154 seam).
- **testing-strategy.md** — TDD cycle-pairs; unit (no mocks) vs integration (injected fakes) correctly labelled; behaviour-not-audit tests; no skipped tests.
- **schema-first-execution.md** — the Zod config schema is the seam contract (`Config = z.infer`); env validated via `@oaknational/env`/`env-resolution` at the app boundary; MCP tool shapes from the servers.

---

## Documentation Propagation

> See [Documentation Propagation component](../../templates/components/documentation-propagation.md)

The WS0 ADR; `slack-assistant` + app READMEs; the design-doc status; `what-the-system-emits-today.md`; the `oak-slack-assistants` thread record; the collection `roadmap.md`.

---

## Consolidation

After all WS complete and gates pass, run `/oak-consolidate-docs`.

---

## Known open questions (owner / legal / ops)

Surfaced by the 2026-07-08 open-question review; four design-shaping decisions were answered (safeguarding, ZDR classification, internal scope, oak-skills — folded in above). These remain open and are tracked as dependencies, not blockers for a plan-phase re-review. They mostly need a real legal/ops owner, not a design choice:

- **Legal — data protection**: are DPAs (Vercel / Anthropic / Slack) + a DPIA required before launch (staff questions → US inference + the KV user-hash), or is a "not required" decision recorded?
- **Legal — records/audit retention**: does Oak have a positive duty to *retain* a Q&A log (vs the no-persistence stance)? Is Slack's own workspace retention the governed record, or is a deliberate audit store needed?
- **Legal — ZDR contract**: is a no-retention term contractually in force with Vercel/Anthropic (the invariant no longer depends on it, but confirming lets ZDR be relied on if wanted)?
- **Owner/product — success metrics**: the keep/kill bar for v1 (eval pass rate / weekly active askers / cited-and-correct % / "would staff miss it"). No target exists yet.
- **Ops — provisioning + ownership**: named owner per external resource — Slack app (+ workspace-admin approval), Vercel project + billing, Gateway BYOK key + Anthropic key, GitHub PAT (recommend a **machine/service account**, not a personal PAT), and Ask Oak's Clerk identity + refresh-token store.
- **Ops — cost ceiling**: monthly budget cap, alert thresholds, hard-stop-vs-alert-only at ceiling, and whether to disable the silent Vercel system-credit BYOK fallback. Named budget owner.
- **Ops — monitoring / service owner**: where Sentry / budget / rate-limit-trip alerts route, and who operates the running service.
- **Ops — rollback / kill-switch authority**: mechanism is derivable (empty the allow-list / unset Gateway+GitHub env / Vercel instant-rollback); who is authorised to trigger it, and the incident procedure.
- **Ops/owner — Slack app approval**: does the workspace require admin/security approval to install a new app, who grants it, and what lead-time does M1 budget for?

---

## Dependencies

**Blocking**:

- Slack app registration (bot token + signing secret); the Slack team/workspace id for the allow-list.
- Vercel project + `AI_GATEWAY_API_KEY` with BYOK (paid tier + purchased credits).
- GitHub fine-grained PAT with read on the public OCE repo.
- The WS0 ADR merged before scaffolding structure.

**Blocking for full voice (beneficial otherwise)**:

- **Chosen (owner ruling 2026-07-08): scope the fine-grained PAT to read the private `oak-skills` repo** (the make-public and mirror alternatives were declined for v1). This folds into the blocking PAT provisioning. **Minimum shippable without**: grounded, cited answers with degraded (non-Oak-voiced) tone.

**Beneficial**:

- AI Gateway ZDR on — **beneficial only** (owner ruling 2026-07-08: the PII invariant does not depend on it). The contractual-ZDR question is tracked open (see Known Open Questions).

**Related Plans**:

- [`../future/ask-oak.plan.md`](../future/ask-oak.plan.md) — the second consumer.
- Design source: [`oisin-oce-navigator-design.md`](../../../research/outreach/oisin-oce-navigator-design.md).
