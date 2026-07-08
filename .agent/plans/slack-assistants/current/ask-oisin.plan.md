---
name: "Ask Oisín — v1 Slack assistant, framework-first"
overview: "Ship Ask Oisín (project/repo navigator) as a headless Next.js App Router Slack app on Vercel, building the reusable ai-gateway model layer and slack-assistant framework as isolated libs, the sentry-nextjs provider over a shared redaction core, and the logger portability fix — so future Slack apps (Ask Oak next) are thin config. Internal-use only, allow-listed installations."
lineage:
  serves_thread: oak-slack-assistants
  serves_stream: "agentic surfaces over Oak's MCPs (new; no parent stream record yet)"
  strategic_choice: "n/a — new surface domain"
  derives_from: ".agent/research/outreach/oisin-oce-navigator-design.md"
todos:
  - id: ws0-scaffold
    content: "WS0: scaffold packages/libs/ai-gateway + packages/libs/slack-assistant (repo tsup + three-tsconfig convention) + apps/slack/ask-oisin (Next.js App Router + vercel.json); register all three in pnpm-workspace (explicit lib lines + apps/slack/* glob); turbo.json Next.js task entries; stratify the eslint adapter tier (adapter-base: ai-gateway + the shared sentry core; composites: slack-assistant, sentry-node, sentry-nextjs — structural acyclicity, no composite→composite edges) and update the boundary unit tests + APP_PACKAGE_IMPORTS + 3-deep path depth; record as an ADR-041 amendment (adapter-tier stratification + apps/slack family rows; ADR-154 cited). Tree green."
    status: pending
    depends_on: []
  - id: ws-e1-logger-portability
    content: "WS-E1 (estate): make @oaknational/logger's base entrypoint genuinely portable — add the missing no-node-only-imports enforcement test (RED on the node:crypto import), replace otel-format's createHash('md5') with a portable deterministic hash, true up the README claim. Parallel-safe; independent of WS0."
    status: pending
    depends_on: []
  - id: ws-e2-sentry-provider
    content: "WS-E2 (estate): decompose sentry-node at the vendor×runtime fault line — extract the five Sentry-shaped redactors + the hook-composition SKELETON (redact → injected post-redaction transform; applyFingerprint is LIFTED OUT and re-composed as sentry-node's post-redaction hook — its error families are MCP-app-specific) into a shared core consumed by sentry-node (public surface unchanged, existing tests green; types re-based on @sentry/core exports); build @oaknational/sentry-nextjs (App Router init glue, nodejs branch only, onRequestError, the FULL five-hook ADR-160 closure from the shared core, post-response capture+flush helper); author the provider-model ADR (references WS0's ADR-041 amendment for tier mechanics). Boundary registration consumes WS0's stratified tier."
    status: pending
    depends_on: [ws0-scaffold]
  - id: ws1-model-layer
    content: "WS1: ai-gateway model layer — ask() bounded tool loop (ai@^7: isStepCount, instructions), askStream() over streamText (same loop, token stream out — owner decision 2026-07-08: streaming is v1), opaque model slug (NO format validation), per-request ZDR providerOptions, tools typed as ToolSet; the egress CONTRACT (branded ScrubbedText required at every egress point, @ts-expect-error compile fixture). Isolation tests over injected fake (streaming) models."
    status: pending
    depends_on: [ws0-scaffold]
  - id: ws2-pii-boundary
    content: "WS2: PII egress boundary — scrub() implementation in slack-assistant (identity/mentions/emails/phones/structured PII; Slack-shaped patterns as config) returning the ai-gateway branded type; tool-call-argument scrubbing seam inside ai-gateway's tool loop (injected arg-scrubber applied to model-emitted args before MCP dispatch). Unit + integration tests in both libs."
    status: pending
    depends_on: [ws0-scaffold, ws1-model-layer]
  - id: ws3-mcp-attach
    content: "WS3: ai-gateway MCP attachment — attachMcp(config) over @ai-sdk/mcp@^2 (createMCPClient, transport type 'http', headers/authProvider): a mock-free unit test for the pure denylist filter, an integration test over an injected fake client asserting transport + auth/toolset headers. Note per-cold-start tool pickup; note client.tools() drops MCP annotations (verified) so name-denylist is the filter."
    status: pending
    depends_on: [ws0-scaffold]
  - id: ws4-slack-surface
    content: "WS4: slack-assistant Slack surface — @vercel/slack-bolt@^1 wiring (VercelReceiver constructed once, same instance to App{deferInitialization:true} and createHandler(app, receiver)); app_mention (thread_ts = event.thread_ts ?? event.ts), DM (message.im, typed narrowing — no `as any`), slash, assistant-thread events; token streaming via sayStream on mention/DM/assistant listeners over ai-gateway askStream (slash answers post complete via response_url); 👍/👎 reaction-signal capture (reaction_added/removed on bot answers → metadata-only counters, identity stripped); DM/mention double-fire de-duplication; signature verification with a stated test seam; in-process Bolt test harness (signed synthetic requests); mrkdwn + disclaimer. Integration tests + code."
    status: pending
    depends_on: [ws0-scaffold, ws1-model-layer, ws2-pii-boundary]
  - id: ws5-factory
    content: "WS5: defineSlackAssistant(config) factory + Zod config schema (Config = z.infer). Seam gates (grep-enforced): framework has zero Oak-specific literals, zero process.env reads (config injected), and imports NO vendor telemetry provider; model/tool concerns come only through ai-gateway. Integration test + code."
    status: pending
    depends_on: [ws1-model-layer, ws2-pii-boundary, ws3-mcp-attach, ws4-slack-surface]
  - id: ws6-oisin-config
    content: "WS6: Ask Oisín app config — system instructions (repo-nav via under-the-hood start point, cite-source, decline-curriculum-with-explanation, safeguarding deflect+signpost), GitHub MCP attach (X-MCP-Readonly, X-MCP-Toolsets: repos — includes search_code + get_file_contents), opaque model slug env, name. Audience: internal Oak staff."
    status: pending
    depends_on: [ws5-factory]
  - id: ws7-access-and-limits
    content: "WS7: access control + abuse limits + delivery correctness — built IN slack-assistant so every bot inherits them (the design's framework-level controls): installation allow-list (workspace-level, fail-closed on empty/malformed list), per-workspace AND per-user (salted one-way hash, never egressed) rate limiting, Slack event-id retry de-duplication (retries are normal operation). Allow-list values, thresholds, salt, and the KV client are INJECTED config (fake KV in tests; Upstash Redis client supplied by the app). Unit + integration tests."
    status: pending
    depends_on: [ws0-scaffold]
  - id: ws8-observability
    content: "WS8: app observability composition — compose @oaknational/sentry-nextjs at the app root (instrumentation.ts + onRequestError; no client config — headless); forced-failure-in-the-post-response-continuation captured AND flushed before termination (our requirement, vendor-undocumented); metadata-only events (no message content; console capture stays off; AI SDK experimental_telemetry stays off). Unit/integration tests."
    status: pending
    depends_on: [ws0-scaffold, ws-e2-sentry-provider]
  - id: ws9-deploy
    content: "WS9: deploy config — vercel.json (Next.js), turbo entries, env wiring (SLACK_*, AI_GATEWAY_API_KEY, CLAUDE_MODEL, GITHUB_TOKEN, SLACK_TEAM_ALLOWLIST, SENTRY_* incl. optional auth token for source maps), manifest.oisin.yaml (features.agent_view — NOT the legacy assistant_view; no channels:history / message.channels); duration left at the Fluid default (300s) unless measured need; a DEV Slack app pointed at the preview deployment (Slack delivers to one request URL per app). Preview deploy acks Slack <3s (value-proxy)."
    status: pending
    depends_on: [ws6-oisin-config, ws7-access-and-limits, ws8-observability]
  - id: ws10a-pii-assertion
    content: "WS10.1: the deterministic in-process integration test proving the outbound payload (instructions + prompt + every tool-call argument) carries only the scrubbed question — CI gate over the WS2 capture seam; runs the moment the libs assemble, NOT gated on deploy."
    status: pending
    depends_on: [ws2-pii-boundary, ws5-factory]
  - id: ws10b-live-validation
    content: "WS10.2–4: live value-proxy smoke (grounded answer citing the repo path), content readability vs oak-tone-of-voice, safeguarding deflect+signpost over a small adversarial synthetic set (not a single case)."
    status: pending
    depends_on: [ws9-deploy]
  - id: ws11-reviews-docs-consolidation
    content: "WS11: readiness reviews (release-readiness GO/NO-GO + the scheduled specialists), doc propagation (the two ADRs, lib READMEs, what-the-system-emits-today.md, thread record, design-doc status), /oak-consolidate-docs."
    status: pending
    depends_on: [ws10a-pii-assertion, ws10b-live-validation]
isProject: true
---

<!-- Component reference paths are relative to this file
     (.agent/plans/slack-assistants/current/): use ../../templates/components/. -->

# Ask Oisín — v1 Slack assistant, framework-first

**Last Updated**: 2026-07-08
**Status**: 🟢 **DECISION-COMPLETE / READY FOR EXECUTION** (2026-07-08). Every load-bearing
vendor claim was verified against primary sources on 2026-07-08 (the full claim-register pass —
provenance and counts in the thread record; corrections folded in). The
telemetry topology is **settled** — see the
[logging/observability design record](../../../research/outreach/slack-assistant-logging-observability-design.md)
§5–§8 — and the estate workstreams it drives (WS-E1, WS-E2) are in this plan per owner
direction (the estate's workspaces are ours to enhance in support of this work). Execution
of WS9+ consumes the owner-provisioned resources named under §Dependencies — named blocking
dependencies, not decision gaps. **Readiness reviews ran 2026-07-08** (assumptions, mcp,
sentry, clerk, architecture-fred, docs-adr — six narrow specialist reviews; every finding
critically assessed and the accepted set applied; the disposition record is the thread
record's §Readiness review round). **v1 is an internal proof-of-concept.**
**Scope**: Ship Ask Oisín as a headless Next.js App Router Slack app on Vercel that answers project questions grounded in a live read of the OCE repo, building `ai-gateway` (model layer), `slack-assistant` (surface framework), `sentry-nextjs` over a shared redaction core, and the `logger` portability fix. Internal-use only, allow-listed installations.

---

## Settled by verification (2026-07-08)

The design source records the full verification ledger; the plan-relevant pins:

- **APIs (verified against published majors; re-verify against installed versions at each
  GREEN — `verify-vendor-call-shapes`)**: `ai@^7` (`isStepCount`, `instructions`, `ToolSet`);
  `@ai-sdk/mcp@^2` (`createMCPClient`, transport `{ type: 'http', url, headers }`,
  `authProvider`); `@vercel/slack-bolt@^1` (`createHandler(app, receiver)` +
  `VercelReceiver` + `deferInitialization`); `@slack/bolt@^4`.
- **Slack**: manifest key is `features.agent_view` (new apps cannot use the legacy
  `assistant_view`); `assistant:write` is the method scope for `assistant.threads.*`;
  events deliver to ONE request URL per app (hence the dev Slack app in WS9); 3s ack +
  up to 3 retries → event-id de-dup is correctness (WS7).
- **Vercel**: Node.js runtime by default for App Router route handlers (`node:crypto`
  available — the logger leak does not bite this app, and is fixed anyway in WS-E1);
  Fluid compute default-on; default duration 300s on all tiers; Vercel KV is retired —
  the durable KV is **Upstash Redis via the Marketplace**.
- **Sentry**: `@sentry/nextjs` init shape + server-side `beforeSend`/`beforeSendTransaction`/
  `beforeBreadcrumb` (the ADR-160 barrier applies); the Marketplace integration is
  build/deploy-time only; console-as-Sentry-logs off by default (console-as-breadcrumbs is
  ON and redacted via `beforeBreadcrumb`); SDK-wrapped handlers manage request-path flush —
  the post-response continuation capture+flush is OUR requirement (WS8).
- **Gateway**: zero-markup BYOK (paid tier + credits); per-request ZDR free
  (`zeroDataRetention: true` in providerOptions) vs team-wide $0.10/1k → per-request;
  per-key budgets are enforced caps.
- **GitHub MCP**: `repos` toolset includes `search_code` + `get_file_contents`; no
  anonymous mode; fine-grained PAT selects only `oak-skills` (public read is implicit).

**Owner rulings in force** (unchanged): pragmatic PII egress; internal-use only,
workspace-level allow-list; running-text matcher deferred; framework-first; opaque model
slug; safeguarding = deflect + signpost, no record; PII invariant independent of ZDR;
PAT reads private `oak-skills`. **Owner directions 2026-07-08 (this revision)**: estate
workspaces are changeable in support of this work; `ai-gateway` is a first-class isolated
lib (defining/describing/testing in isolation is the value, not a cost); optimise for
long-term excellence, never minimum work.

## Context

The design is recorded in [`oisin-oce-navigator-design.md`](../../../research/outreach/oisin-oce-navigator-design.md)
(same branch/PR as this plan). This plan turns that design into executable work: **build Ask
Oisín first**; **Ask Oak is a future app** ([`../future/ask-oak.plan.md`](../future/ask-oak.plan.md))
riding a first-class machine identity on our own MCP app; **Next.js App Router** (owner
choice); **pragmatic PII egress**; **internal-use only**.

### Problem Statement

Oak staff have no low-friction way to ask questions about the *project* — the repo, the Practice, strategy, planning state — without reading the `.agent/` substrate themselves. The intended intervention is a Slack bot that answers from a live read of the public repo, built over isolated, reusable libs so a second app (Ask Oak) is thin config.

### Existing capabilities consumed

- Shared `@oaknational/*` packages: `result`, `env`, `env-resolution`, `logger` (WS-E1 makes
  its portability claim true), `type-helpers`, `build-metadata`.
- `@oaknational/observability`'s redaction primitives and ports; `sentry-node`'s
  Sentry-shaped redaction + hook composition (extracted to a shared core in WS-E2 so the
  barrier is owned once across runtimes).
- The official remote GitHub MCP server (`https://api.githubcopilot.com/mcp/`, GA); the
  Vercel AI SDK v7 + AI Gateway; `@ai-sdk/mcp@2`.
- **Upstash Redis (Vercel Marketplace)** — required v1 resource for WS7 (rate limits +
  event de-dup). Provisioning is owner-handled; the plan names it as needed.

---

## Design Principles

1. **Isolated, describable units** — `ai-gateway` (model layer + egress contract) and
   `slack-assistant` (surface + egress implementation) are separate libs, each defined,
   described, and tested in isolation; the app is thin config over them. Apps are leaf
   deployables and never depend on each other.
2. **Config seam = Oak-specific vs general** — `defineSlackAssistant(config)`; the libs are
   org-agnostic and publishable; `config` carries all Oak specifics. Governed by
   [ADR-154](../../../../docs/architecture/architectural-decisions/154-separate-framework-from-consumer.md).
   The boundary config is **configured** for the new tiers/edges (never disabled —
   `never-disable-checks`); the WS0 ADR records them.
3. **No vendoring, ever** — the repo is read live via the GitHub MCP.
4. **Pragmatic PII egress, compiler-enforced** — only the sanctioned question egresses;
   the egress contract (branded type) lives in `ai-gateway` and every egress point requires
   it; scrubbing covers the inbound question AND model-generated tool-call arguments; no
   content in logs/Sentry/KV. **The invariant does NOT depend on ZDR** (owner ruling);
   per-request ZDR rides along as the free beneficial control.
5. **Safeguarding: deflect + signpost, no record** (owner ruling) — carried in the system
   instructions (WS6), verified in WS10.
6. **Internal-use only, workspace-level** (owner ruling) — fail-closed installation
   allow-list on the Slack team id; guests/Slack-Connect within an allow-listed workspace
   accepted. Others may fork and self-host.
7. **The barrier is owned once** — telemetry providers are per-runtime (`sentry-node`,
   `sentry-nextjs`) over one shared Sentry-shaped redaction core (WS-E2); apps compose
   providers at their roots; libs import no vendor provider.
8. **Excellence over expediency** (owner direction, standing): estate workspaces, boundary
   configs, and our own apps' auth are all improvable in support of the work; the
   decomposition question is "does this have an independent identity worth defining,
   describing, and testing in isolation?" — never "can we defer it?"

**Non-Goals** (YAGNI — each with its provenance and revisit trigger):

- **Ask Oak** — future app (`../future/ask-oak.plan.md`); this plan keeps the seam honest.
- **Running-text matcher / `message.channels`** — owner privacy ruling; revisit only with a
  demand signal AND a fresh privacy review.
- **A custom interactive Block Kit feedback affordance** — deferred (owner decision
  2026-07-08: the v1 feedback signal is 👍/👎 *reactions*, WS4.3 — counts only, in-Slack);
  if the interactive affordance is ever pulled in, it carries a WCAG 2.2 AA contract.
- **Neon/relational storage, multi-workspace install store, web/CLI surface adapters,
  external access** — each has a named trigger in the design's revisit register.
- **AI SDK `experimental_telemetry` / `recordInputs`** — stays off (would write raw prompts
  into span attributes).

---

## Build-vs-Buy Attestation

**Vendors**: Vercel (hosting + Slack adapter + AI Gateway), Anthropic (via Gateway), GitHub (MCP), Slack, Sentry, Upstash (via Marketplace).

| Integration | Evaluated? | Verdict |
|--|--|--|
| `@vercel/slack-bolt` (Web-Request-native Slack adapter) | yes | **adopted** — solves 3s-ack/`waitUntil`; Next.js App Router host (owner choice) |
| Vercel AI SDK v7 + AI Gateway | yes | **adopted** over raw Anthropic SDK (zero-markup BYOK, failover, budgets, per-request ZDR) |
| Official remote GitHub MCP server | yes | **adopted** over a bespoke GitHub REST client |
| `@ai-sdk/mcp` `createMCPClient` | yes | **adopted** |
| `@sentry/nextjs` (via the WS-E2 provider) | yes | **adopted** — the runtime's documented SDK; barrier hooks verified available |
| Vercel log drains → Sentry Logs (topology B) | yes | **evaluated, not chosen for v1** — second pipe, self-managed dedup, no fidelity gain (logging record §5–§6) |
| Vercel/community "Slack agent" starter as the framework skeleton | yes | **ruled out** — single-file demo, not a reusable framework |
| Anthropic MCP connector (`mcp_servers`) | yes | **ruled out** — Anthropic-Messages-API-only; Anthropic documents it as not ZDR-eligible |

**Reviewer**: `assumptions-expert` re-runs against this attestation as part of the readiness review.

---

## Lifecycle Triggers

> See [Lifecycle Triggers component](../../templates/components/lifecycle-triggers.md)

- **Start-right** each session; **thread record** `oak-slack-assistants.next-session.md`;
  **active claim** on `apps/slack/**` + `packages/libs/ai-gateway/**` +
  `packages/libs/slack-assistant/**` (+ the estate surfaces while WS-E1/WS-E2 are in
  flight); **consolidation** at WS11.

---

## Cycle Dependencies and Parallelisation

> See [TDD Cycles component](../../templates/components/tdd-phases.md)

WS0 gates the new-workspace work. **WS-E1 is parallel-safe immediately** (logger-only file
scope). **WS-E2's extraction cycles can be drafted in parallel, but its boundary
registration consumes WS0's stratified tier and both touch `boundary.ts` + its tests — so
WS-E2 lands after WS0** (`depends_on` reflects this). After WS0: **WS1, WS3, WS7**
parallel-safe; WS2 ← WS1; WS4 ← WS1+WS2 (its cycles route to `ask()`/`askStream()` with
`ScrubbedText` — the surface consumes the model layer's contract and the scrubber);
WS5 ← WS1–4; WS6 ← WS5; WS8 ← WS-E2; WS9 ← WS6+WS7+WS8;
WS10.1 (the CI PII assertion) ← WS5; WS10.2–4 ← WS9; WS11 last.

---

## Reviewer Scheduling

- **Plan-phase (this revision)**: `assumptions-expert`, `mcp-expert`,
  `architecture-expert-fred` (boundary/tier + ADRs), `sentry-expert` (WS-E2/WS8),
  `clerk-expert` (the Ask Oak machine-identity direction, advisory), `config-expert`
  (workspace/turbo/eslint boundary).
- **Mid-cycle**: `test-expert` + `type-expert` per RED/GREEN; `security-expert` after
  WS2/WS7/WS8 (PII, access control, egress); `code-expert` gateway per
  `invoke-code-experts`.
- **Close (WS11)**: `accessibility-expert` (content readability), `docs-adr-expert`,
  `onboarding-expert`, `release-readiness-expert` (GO/NO-GO).

---

## WS0 — Scaffold, register, configure

Create `packages/libs/ai-gateway` and `packages/libs/slack-assistant` (repo **tsup +
three-tsconfig** convention — copy a `packages/libs/*` member) and `apps/slack/ask-oisin`
(**Next.js App Router** + `vercel.json`, copying the hub's Next config conventions:
`noEmit`, `jsx`, next plugin, `@/*` alias). Register all three in `pnpm-workspace.yaml`
(explicit lib lines + the `apps/slack/*` glob — a new 3-deep app nesting; existing apps are
2-deep). Add `turbo.json` entries for the Next.js app (`.next` outputs, `!.next` inputs,
mirroring the hub). **Boundary configuration** (configure, never disable): stratify the existing
**adapter tier** in `boundary.ts` — mirroring the foundation/adapter idiom one level deeper —
into an **adapter-base** sub-tier (`ai-gateway`, and WS-E2's shared sentry core): vendor
adapters other adapters may depend on, themselves importing only core + foundation; and the
**adapter** sub-tier (`slack-assistant`, `sentry-node`, WS-E2's `sentry-nextjs`): may import
core, foundation, and adapter-base — never another composite adapter. This gives the
`slack-assistant → ai-gateway` and provider → shared-core edges **structural** acyclicity
rather than a hand-maintained edge whitelist. Update the `lib-boundary`/`app-boundary`
unit-test tier assertions (they import the tier constants directly, so the new sub-tier
constant is asserted there too) and `APP_PACKAGE_IMPORTS` in the same change; verify the
3-deep app's own eslint/tsconfig relative-path depth (existing apps are 2-deep). Record the
decision as an **amendment to
[ADR-041](../../../../docs/architecture/architectural-decisions/041-workspace-structure-option-a.md)**
(one decision: the adapter-tier stratification + the `apps/slack/*` family rows — the same
in-place amendment shape as its 2026-05-11 `agent-tools`/`agent-graphs` rows), with
[ADR-154](../../../../docs/architecture/architectural-decisions/154-separate-framework-from-consumer.md)
cited for the framework/consumer seam.

**Acceptance**: `pnpm build && pnpm type-check && pnpm lint` green for all three workspaces
(lint proves the configured edges); the oak-eslint unit tests pass with the updated
assertions; a `@vercel/slack-bolt` receiver spike acks within 3s locally; the ADR is in the
tree. **Reviewers**: `config-expert`, `architecture-expert-fred`.

---

## WS-E1 — Estate: logger portability (owner-directed)

### Cycle E1.1: enforcement test + portable hash + truthful README

**Parallel-safe immediately.** **File scope**: `packages/libs/logger/src/no-node-only-imports.unit.test.ts`
(new), `src/otel-format.ts`, `README.md`.
**Test (Red)**: a `no-node-only-imports` enforcement test mirroring
`@oaknational/observability`'s (fails on any `node:*` or `@sentry/*` import in runtime
source) — RED on `otel-format.ts`'s `node:crypto` import.
**Product code (Green)**: replace `createHash('md5')` in `correlationIdToTraceId` with a
portable deterministic **synchronous** hash (the function and its format-path callers are
sync, and Web Crypto's `subtle.digest` is async — so a pure-JS 128-bit derivation preserving
the trace-id shape, not a signature-changing swap). Before changing the derivation, grep
`logger` consumers for any persistence or cross-version comparison of derived trace ids and
record the result in the cycle (the "per-run values, not persisted contracts" claim becomes
a checked fact, not an assertion). True up the README's runtime-agnostic claim so it is
structurally guaranteed, not asserted.
**Validation**: logger workspace tests exit 0; full `pnpm test` exit 0; the new enforcement
test passes. **Reviewers**: `code-expert`, `test-expert`.

---

## WS-E2 — Estate: Sentry vendor×runtime decomposition + the Next.js provider

### Cycle E2.1: extract the shared Sentry redaction core (refactor-shaped)

**File scope**: new shared core package (working name `packages/libs/sentry-core`; the ADR
fixes the name/tier), `packages/libs/sentry-node/src/runtime-redaction.ts` +
`runtime-sdk.ts` call sites, boundary config + tests.
Move the Sentry-shaped, runtime-agnostic substance — the **five** `redactSentry*` redactors
(event/breadcrumb/log/span/transaction) and the hook-composition **skeleton** (redact →
optional injected post-redaction transform → return, with its **load-bearing ordering**) —
into the shared core, re-basing types onto `@sentry/core` exports (nothing reaches back to
`NodeOptions`). **`applyFingerprint` does NOT move**: it sits between redaction and the
consumer hook today and its `KNOWN_ERROR_FAMILIES` are MCP-app-specific (`McpError`,
`TestError*`) — lift it out of `createSentryHooks` and re-compose it as `sentry-node`'s own
post-redaction hook (the existing `SentryPostRedactionHooks` injection point carries it), so
`sentry-nextjs` never inherits it. `sentry-node` consumes the core; **its public surface is
unchanged and its existing tests stay green unmodified** (refactoring-TDD: the RED phase is
compiler errors, existing tests are the net). What must NOT move (per-runtime, confirmed):
`createSentryInitOptions`/`NodeOptions` shaping, the three-mode DI + env resolution, the
`LogSink` bridge, fixture mode. Boundary: the shared core joins the adapter-base sub-tier (the WS0 ADR-041
amendment owns the tier mechanics; this workstream references it). The **provider-model
ADR** records the genuinely separate decision: the Sentry vendor×runtime decomposition and
where the ADR-160 barrier is owned (shared core owns it; sentry-node = Node/Express
provider; sentry-nextjs = Next.js provider).

### Cycle E2.2: `@oaknational/sentry-nextjs` (the Next.js provider)

**File scope**: `packages/libs/sentry-nextjs/**` (new). **Test (Red)**: the provider wires
the **full five-hook ADR-160 closure** (`beforeSend`, `beforeSendTransaction`,
`beforeBreadcrumb`, `beforeSendLog`, `beforeSendSpan`) — a PII payload pushed through EACH
hook emerges redacted (spans are mutate-redacted in place: `beforeSendSpan` cannot return
null); composition order proven; a post-response **capture+flush** helper exists and
flushes within a bounded timeout (~5s, `sentry-node`'s precedent). **Product code (Green)**:
thin wrapping of `@sentry/nextjs` for headless App Router apps — instrumentation glue
(`register()` loading the `nodejs` branch ONLY, deliberately no edge/client config, +
`sentry.server.config` import + `onRequestError = captureRequestError`), the hook-set from
the shared core, the helper. If the provider forwards `LogEvent`s into Sentry, that path
depends on `beforeSendLog` being wired — same closure. Re-verify the `@sentry/nextjs`
option names against the installed version at GREEN. **Config contract (precise)**: the
ADR-171 SINKS axis vocabulary governs the provider's own sentry on/off enablement, read at
server-config load; fixture behaviour is realised in the test harness (direct hook
assertion), not a live fixture transport; the provider defines NO rival estate-wide axes
schema — the estate-wide `SENTRY_MODE`→axes migration and the sink-enum reconciliation
(`file` vs `log-file`) stay with the owner-gated `observability-sinks-decoupling` plan;
this provider is cited there as evidence, not a preemption.
**Reviewers**: `sentry-expert`, `security-expert`, `architecture-expert-fred`.

---

## WS1 — ai-gateway: model layer (`ask()`)

### Cycle 1.1: bounded tool loop + egress contract

**File scope**: `packages/libs/ai-gateway/src/model.ts`, `src/egress.ts` + unit tests.
**Test (Red)** — behaviour over an injected fake model: given a fake that returns text after
K tool round-trips, `ask()` returns that text and stops at the configured bound (do NOT
assert the internal `generateText` call shape — audit-shaped). The model slug is an opaque
operator-configured env string — no format validation (owner ruling). Egress contract: a
branded `ScrubbedText` type (`string & { readonly __scrubbed: unique symbol }`) that every
egress-facing parameter requires; pin the compile-time guarantee with a `// @ts-expect-error`
fixture (plain `string` fails to compile).
**Product code (Green)**: `ask(instructions, prompt, tools)` on `ai@^7` (`isStepCount`,
`instructions`, `ToolSet`); per-request ZDR in `providerOptions`.
**Validation**: workspace tests exit 0; full `pnpm test` exit 0. **Reviewer**: `type-expert`.

### Cycle 1.2: streaming variant (`askStream()`)

**File scope**: `packages/libs/ai-gateway/src/model.ts` + unit tests. **Test (Red)** — over an
injected fake streaming model: `askStream()` yields the token stream and preserves the same
bound, egress contract, and tool-loop semantics as `ask()` (one implementation of the loop,
two delivery shapes — not a fork). Owner decision 2026-07-08: streaming is v1, built once at
the framework level. **Reviewer**: `type-expert`, `code-expert`.

---

## WS2 — PII egress boundary (org-critical)

### Cycle 2.1: scrub implementation → branded type (slack-assistant)

**File scope**: `packages/libs/slack-assistant/src/pii.ts` + `pii.unit.test.ts`.
**Test (Red)**: `scrub()` removes `<@U…>` mentions, email- and phone-shaped tokens, and
author identity; returns `ScrubbedText` (the `ai-gateway` brand). Pattern set is config —
Slack-shaped defaults, extensible. **Reviewer**: `security-expert`, `type-expert`.

### Cycle 2.2: tool-call-argument scrubbing seam (ai-gateway)

**File scope**: `packages/libs/ai-gateway/src/model.ts` + an integration test with a
capturing fake tool. **Test (Red)**: when the model emits a tool call whose arguments echo
PII from the question, the injected arg-scrubber runs over the arguments before they reach
the MCP transport. This closes the design's named tool-argument egress vector — without it
the PII invariant is not enforced end-to-end. **Reviewer**: `security-expert`.

---

## WS3 — ai-gateway: MCP attachment

### Cycle 3.1: pure denylist filter (unit, mock-free)

**File scope**: `packages/libs/ai-gateway/src/mcp-filter.ts` + `*.unit.test.ts`.
**Test**: parameters in (tool map + denylist), filtered map out — no mocks. (Annotation-based
filtering is not implementable on `client.tools()` output — verified: it drops
`readOnlyHint`/`destructiveHint` — so the name denylist is the filter.)

### Cycle 3.2: attachMcp over an injected fake client (integration)

**File scope**: `packages/libs/ai-gateway/src/mcp.ts` + `*.integration.test.ts`.
**Test**: an injected fake client receives the Streamable-HTTP transport config
(`type: 'http'`) + auth/toolset headers; the filtered tools are returned. **Note** in the
module doc: the client is created once per warm instance, so denylist auto-pickup of new
server tools is per-cold-start, not live. **Reviewer**: `mcp-expert`.

---

## WS4 — slack-assistant: Slack surface

### Cycle 4.1: invocation wiring + signature verification (explicit-only)

**File scope**: `packages/libs/slack-assistant/src/slack.ts` + `*.integration.test.ts`.
**Test harness (defined)**: drive Bolt in-process by invoking the receiver's request handler
with a signed synthetic request (no network). **Test (Red)**: `app_mention` (replying with
`thread_ts: event.thread_ts ?? event.ts`), DM (`message.im`, narrowed via Bolt's typed
message union — no `as any`), and slash route to `ask()` with `ScrubbedText`; a channel
message is NOT handled (no `message.channels`); a mention **inside a DM does not
double-answer** (mention+message de-dup); a self/bot message is ignored; an invalid Slack
signature is rejected. **Product code**: `@vercel/slack-bolt` wiring — one `VercelReceiver`,
the same instance to `new App({ receiver, deferInitialization: true })` and
`createHandler(app, receiver)`; mrkdwn + disclaimer; assistant-thread suggested prompts.
**Reviewer**: `security-expert`, `code-expert`.

### Cycle 4.2: token streaming on the event listeners

**File scope**: `src/slack.ts` + `*.integration.test.ts`. **Test (Red)**: a mention/DM/
assistant-thread answer streams via `sayStream` (Bolt ≥ 4.7 wrapping
`chat.startStream`/`appendStream`/`stopStream`, scope `chat:write`) fed by `askStream()`;
the stream closes cleanly on completion and on error (no dangling stream); slash commands
post complete answers via `response_url` (the streaming methods are message-thread-shaped,
not response_url-shaped). Re-verify `sayStream` against the installed `@slack/bolt` at
GREEN. **Reviewer**: `code-expert`.

### Cycle 4.3: reaction feedback signal (👍/👎, metadata only)

**File scope**: `src/reactions.ts` + test. **Test (Red)**: `reaction_added`/`reaction_removed`
events on the bot's own answers increment/decrement metadata-only counters (answer message
`ts` + emoji class + count — no user identity, no content); reactions on other messages are
ignored. Owner decision 2026-07-08: reactions are the v1 POC feedback signal (in-Slack, no
new PII egress; the interactive Block Kit affordance stays deferred). **Reviewer**:
`security-expert` (identity-stripping), `code-expert`.

---

## WS5 — slack-assistant: `defineSlackAssistant()` + config schema

### Cycle 5.1: factory + Zod config schema (the seam)

**File scope**: `src/define.ts`, `src/config.ts`, `*.integration.test.ts`.
**Config schema (sketch)**: `{ name, model (env slug), mcp: { url, headers|authProvider, deny[] }, instructions, invocation: { slashCommands[] }, egress: { scrubPatterns, allowList }, observability (injected), disclaimer }` with `type Config = z.infer<typeof configSchema>`.
**Test (Red)**: a minimal config yields a working handler (stub MCP + stub model) answering
a scrubbed question; an invalid config is rejected. **Seam gates (grep-enforced)**:
`packages/libs/slack-assistant/src` and `packages/libs/ai-gateway/src` have (a) zero
Oak-specific literals, (b) zero `process.env` reads (config injected), (c) no vendor
telemetry provider imports, and (d) the `ScrubbedText` brand is minted (`as ScrubbedText`)
ONLY in the sanctioned scrubber modules — casting anywhere else is the enforcement-theatre
hole, so the gate greps for the assertion outside those files. **Reviewer**: `architecture-expert-*`, `type-expert`.

---

## WS6 — Ask Oisín config (app)

### Cycle 6.1: Oisín config over the framework

**File scope**: `apps/slack/ask-oisin/src/config.ts` + test. **Test (Red)**: attaches the
GitHub MCP with `X-MCP-Readonly: true` and `X-MCP-Toolsets: repos`; system instructions name
the under-the-hood start point + cite-source + decline-curriculum-with-explanation + the
safeguarding deflect-and-signpost instruction; config validates. Audience: internal Oak
staff. **Reviewer**: `mcp-expert`.

---

## WS7 — Access control, abuse limits, delivery correctness

These are **framework controls** — they live in `slack-assistant` so every bot inherits
them (the design's §Security "framework-level, so every bot inherits them"); the app
supplies only values (allow-list, thresholds, salt) and the KV client through the WS5
config. All three cycles test over an **injected fake KV client** — CI needs no
provisioned Redis; the app wires the real Upstash Redis client at its root.

### Cycle 7.1: installation allow-list (internal-use only)

**File scope**: `packages/libs/slack-assistant/src/access.ts` + test. **Test (Red)**: an
allow-listed Slack team id is accepted; any other workspace is rejected; **an empty or
malformed allow-list rejects ALL requests (fail-closed)** — the "empty the allow-list"
kill-switch invariant. Workspace-level scope per the owner ruling. **Product code**: verify
the team id after signature verification, before any model call. **Reviewer**:
`security-expert`.

### Cycle 7.2: per-workspace + per-user (hashed) rate limiting

**File scope**: `packages/libs/slack-assistant/src/rate-limit.ts` + test. **Test (Red)**:
over-limit requests are rejected; keys are the Slack team id AND a salted one-way hash of
the user id (never egressed), against the injected KV client. Default thresholds
(config-tunable): ~20/hour per hashed user, ~200/hour per workspace — comfortably under
GitHub's 5,000/hour token limit even at `isStepCount(8)` (GitHub search also carries
per-minute sub-limits; the per-user bound keeps bursts inside them). **Reviewer**:
`security-expert`.

### Cycle 7.3: Slack retry de-duplication (first-class)

**File scope**: `packages/libs/slack-assistant/src/dedup.ts` + test. **Test (Red)**: a
redelivered event (same Slack event id / `x-slack-retry-num` present) is acknowledged but
not re-answered; the de-dup key is the opaque event id with a short TTL — never content.
Slack retries slow acks up to 3 times in normal operation; this is correctness, not
hardening. **Reviewer**: `code-expert`.

---

## WS8 — App observability composition

### Cycle 8.1: compose the provider; prove capture + flush + metadata-only

**File scope**: `apps/slack/ask-oisin/instrumentation.ts`, `sentry.server.config.ts`,
`src/observability.ts` + tests. **Test (Red)**: a forced failure in the post-response
continuation is captured AND flushed before the function terminates — and the capture is
**explicit** (`try/catch` → `Sentry.captureException` → bounded `Sentry.flush(~5s)` wrapping
the continuation body): `onRequestError`/`captureRequestError` covers request-path errors,
NOT work continued after the response, so without the explicit wrap a continuation failure
is invisible (our requirement — vendor-undocumented for the continuation path). Emitted
events carry event-type/latency/token-count only, never message content; a content-bearing
synthetic event is redacted by the barrier before transport (console-as-breadcrumbs is ON
by default and rides `beforeBreadcrumb`; console-as-Sentry-logs stays off). **Product code (Green)**: compose `@oaknational/sentry-nextjs`
(WS-E2) at the app root — no client config (headless); `withSentryConfig` per its README
(source-map upload rides the optional `SENTRY_AUTH_TOKEN`; without it the POC still
captures, with unminified server stacks anyway); console capture stays off; AI SDK
`experimental_telemetry` stays off. **Reviewer**: `security-expert`, `sentry-expert`.

---

## WS9 — Deploy config

`vercel.json` (Next.js), the `turbo.json` entries from WS0, env wiring (`SLACK_BOT_TOKEN`,
`SLACK_SIGNING_SECRET`, `AI_GATEWAY_API_KEY`, `CLAUDE_MODEL`, `GITHUB_TOKEN`,
`SLACK_TEAM_ALLOWLIST`, `SENTRY_*` + build-metadata release inputs), `manifest.oisin.yaml`
(**`features.agent_view`** — the legacy `assistant_view` is not available to new apps;
scopes without `channels:history` but WITH `reactions:read` (WS4.3); events without
`message.channels` but WITH `reaction_added` + `reaction_removed`). Duration stays at
the Fluid default (300s) unless measured need says otherwise. **A dev Slack app** points at
the preview deployment (Slack delivers each app's events to exactly one request URL).

**Acceptance**: a Vercel **preview deploy** acks a Slack `app_mention` from the dev app
within 3s (value-proxy).

---

## WS10 — Validation (split)

### Cycle 10.1: deterministic PII payload assertion (CI-safe; NOT deploy-gated)

**In-process integration test** over the WS2 capture seam: the outbound payload
(instructions + prompt + every tool-call argument) contains only the `ScrubbedText` — no
Slack user id, display name, or structured PII. Fully deterministic, runs in CI the moment
WS2+WS5 assemble (the estate's most important safety assertion does not wait for deploy).
**Proof**: `integration`.

### Cycle 10.2: live grounded-answer smoke (non-CI)

A **manual/value-proxy** check against the preview deploy: "What is the Practice?" returns
an answer grounded in a live repo read that **cites the repo path** used. Non-deterministic
(live LLM), so not a CI gate. **Proof**: `value-proxy` / `e2e` (manual).

### Cycle 10.3: content readability

The reply text meets plain-language expectations, measured against **`oak-tone-of-voice`**
(the loaded voice standard). **Proof**: `non-code` (reviewer check).

### Cycle 10.4: safeguarding behaviour

A **small adversarial synthetic set** of safeguarding disclosures (not a single case — the
behaviour is LLM-probabilistic) is deflected + signposted; nothing retained (the retention
half is already proven deterministically by WS8 + WS10.1).
**Proof**: `value-proxy` (manual).

---

## WS11 — Reviews, docs, consolidation

Readiness reviewers (`release-readiness-expert` GO/NO-GO). Doc propagation: the two ADRs
(scaffolding; provider model); `ai-gateway`, `slack-assistant`, `sentry-nextjs`, and app
READMEs; register Ask Oisín as a runtime in
[`what-the-system-emits-today.md`](../../observability/what-the-system-emits-today.md)
(Engineering cell: Sentry capture + the WS8 test id); update the design-doc status; the
`oak-slack-assistants` thread record; the collection `roadmap.md`. Run `/oak-consolidate-docs`.

---

## Proof Contract

| Acceptance id | Proof level | Proven by |
|---|---|---|
| logger portability (WS-E1) | unit | the new enforcement test green on a portable base entrypoint |
| Barrier owned once; provider redaction + ordering (WS-E2) | unit + integration | shared-core tests + provider hook-set tests; sentry-node's existing tests green unmodified |
| Scaffold + boundary (WS0) | non-code + unit | build/type-check/lint green across the three workspaces; boundary unit tests assert the stratified tiers; the ADR-041 amendment in tree |
| Model-layer isolation (WS1) | unit / integration | `pnpm test --filter @oaknational/ai-gateway` exit 0 over injected fakes |
| MCP attachment (WS3) | unit + integration | mock-free denylist filter test + injected-fake-client transport/header assertions |
| Slack surface (WS4) | integration | signature-reject, routing, thread_ts, DM/mention double-fire de-dup all proven in the in-process harness |
| PII egress: inbound + tool-args, branded-type-enforced (WS2, WS10.1) | unit + integration + type | scrub tests + arg-capture test + compile failure on unscrubbed egress + deterministic outbound-payload assertion |
| No Oak literals / no `process.env` / no vendor provider in the libs (WS5) | non-code | three grep gates over both lib `src/` trees |
| Internal-only access + rate limits + retry de-dup (WS7) | integration | allow-list accept/reject (fail-closed) + over-limit reject + redelivery-not-reanswered tests |
| Provider composition: continuation capture+flush; metadata-only (WS8) | integration | forced-failure captured+flushed; no content in events; redaction proven pre-transport |
| GitHub MCP read-only attach (WS6) | unit | header assertions |
| Streaming delivery (WS1.2, WS4.2) | unit + integration | askStream over a fake streaming model; sayStream stream opened/closed cleanly in the harness |
| Reaction feedback signal, identity-stripped (WS4.3) | integration | reaction events counted metadata-only; no user id in the counter records |
| 3s ack (WS9) | value-proxy | captured Slack delivery + timely 2xx on a preview deploy via the dev app |
| Grounded, cited answer (WS10.2) | value-proxy (manual) | preview-deploy question returns a cited, repo-grounded answer |
| Safeguarding deflect + signpost (WS10.4) | value-proxy (manual) | synthetic disclosure deflected + signposted, nothing retained |
| POC success bar | value-proxy | eval-set pass rate on a golden question set + weekly-active-askers; the numeric thresholds are set by the owner at POC start and recorded HERE before WS10.2 runs — the bar must be falsifiable before it is evaluated |

`complete` is claimable only when every id is proven. TDD evidence must be test-first.

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Vendor API drift between plan-time pins and build-time installs | Every WS re-verifies the named call shapes against the installed versions at GREEN (`verify-vendor-call-shapes`); majors pinned |
| PII not enforced end-to-end | WS2 scrubs inbound AND tool-args; the branded type gives compile-time enforcement; WS10.1 deterministic payload assertion; libs read no env |
| External/unauthorised access | WS7 fail-closed allow-list after signature verification |
| Boundary config blocks the new legitimate edges | WS0 configures the tiers/edges (never disables) with updated boundary tests; the ADRs record them |
| Estate refactor (WS-E2) destabilises the MCP app | sentry-node's public surface unchanged; its existing tests must stay green unmodified — the refactor's safety net |
| Trace-id derivation change (WS-E1) surprises a consumer | Correlation ids are per-run values, not persisted contracts; the derivation change is documented in TSDoc and the WS-E1 commit |
| Incoming shared Next.js config workspace differs from our scaffold | Adopt the shared config when it lands (config alignment, not a framework change) |
| Prompt injection via public repo content steering the private-scoped `oak-skills` read | Read-only tools; PAT selects exactly `oak-skills`; disclosures land only in-Slack to internal staff |
| Double-answer on DM mentions / Slack retries | WS4 de-dup test + WS7.3 event-id de-dup (first-class) |

---

## Foundation Alignment

> See [Foundation Alignment component](../../templates/components/foundation-alignment.md)

- **principles.md** — decision lenses (design §4); strict boundaries (branded egress type);
  long-term architecture over expediency (isolated libs, provider decomposition, estate
  fixes done properly — owner direction 2026-07-08); separate framework from consumer
  (ADR-154); context-specificity gradient (model layer below surface framework below app).
- **testing-strategy.md** — TDD cycle-pairs; unit (mock-free) vs integration (injected
  fakes) correctly labelled; behaviour-not-audit tests; refactoring-TDD for WS-E2.1;
  no skipped tests.
- **schema-first-execution.md** — the Zod config schema is the seam contract
  (`Config = z.infer`); env validated via `@oaknational/env`/`env-resolution` at the app
  boundary; MCP tool shapes from the servers.

---

## Documentation Propagation

> See [Documentation Propagation component](../../templates/components/documentation-propagation.md)

The two ADRs (WS0 scaffolding; WS-E2 provider model); lib + app READMEs; the design-doc
status; the logging record (already carries the resolution); `what-the-system-emits-today.md`;
the `oak-slack-assistants` thread record; the collection `roadmap.md`.

---

## Consolidation

After all WS complete and gates pass, run `/oak-consolidate-docs`.

---

## Dependencies

**Blocking (owner-provisioned; consumed from WS9)**:

- Slack app registration — the production app AND a dev app for previews (bot tokens +
  signing secrets); the Slack team/workspace id for the allow-list.
- Vercel project + `AI_GATEWAY_API_KEY` with BYOK (paid tier + purchased credits).
- GitHub fine-grained PAT (select `oak-skills`; public OCE read is implicit).
- **Upstash Redis via the Vercel Marketplace** (rate limits + retry de-dup).

**Blocking (in-plan)**:

- The WS0 scaffolding ADR and the WS-E2 provider-model ADR land with their workstreams.

**Beneficial**:

- `SENTRY_AUTH_TOKEN` (or the Sentry Marketplace integration) for source-map upload —
  without it the POC still captures errors with readable-enough server stacks.
- Per-request ZDR — free; on by default in the model layer (the PII invariant does not
  depend on it — owner ruling).

**Related Plans**:

- [`../future/ask-oak.plan.md`](../future/ask-oak.plan.md) — the second consumer (machine
  identity on our MCP app).
- [`observability-sinks-decoupling.plan.md`](../../observability/current/observability-sinks-decoupling.plan.md)
  — owner-gated; WS-E2 coordinates with it (axes-native provider as evidence, not preemption).
- Design source: [`oisin-oce-navigator-design.md`](../../../research/outreach/oisin-oce-navigator-design.md);
  telemetry resolution: [`slack-assistant-logging-observability-design.md`](../../../research/outreach/slack-assistant-logging-observability-design.md).
