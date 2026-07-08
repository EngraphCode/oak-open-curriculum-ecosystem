---
name: "Slack assistants — logging & observability across runtimes (resolved)"
status: resolved — topology settled on verified facts
lineage:
  serves_thread: oak-slack-assistants
  companion_to: ".agent/research/outreach/oisin-oce-navigator-design.md"
  derives_from: "session 'Kiln wakes Copper' (48382d), 2026-07-08 — owner-directed logging re-exploration; resolved by session 'Salamander weaves Warmth' (4960fe), 2026-07-08 — full-claim verification + owner direction that estate workspaces are changeable in support of this work"
last_updated: 2026-07-08
---

# Slack assistants — logging & observability across runtimes

> **Provenance & confidence.** First authored 2026-07-08 as an open cost/value theory with a
> deliberately unpopulated decision table, after the owner's correction that transmitted
> assumptions must never be treated as ground truth. Resolved the same day: every vendor
> mechanism below was verified against primary sources (Vercel, Sentry, Next.js docs — quoted
> in the verification claims register of the PR #328 review), the framing error §4 describes
> was corrected, and the owner directed that the estate's own workspaces are changeable in
> support of this work. §5–§8 now carry the settled result; §2 remains the grounded
> current-state map.

## 1. Why this record exists

Building the Slack apps surfaced a boundary contradiction (a framework lib could
not import `@oaknational/sentry-node`). The first instinct — shrink the plan to fit
the current lint tier — was wrong. The owner's reframe: that contradiction is a
**symptom**, not a defect to patch. The real gap was that the estate had no
cohesive theory of logging/observability across runtimes. This record captures the
current state (§2), the model in the owner's vocabulary (§3), the corrected problem
framing (§4), the topology evaluation with verified facts (§5), the populated
cost/value assessment (§6), the assumption ledger with final dispositions (§7), the
resolution and the estate work it drives (§8), and the certainty-as-risk register
with closures (§9).

## 2. What exists today (grounded, with cites; re-verified 2026-07-08)

A coherent, **Node-only, vendor-neutral-by-ports** design in three layers:

- **`@oaknational/observability`** (`packages/core/observability`) — the
  vendor-neutral ports: `ObservabilitySink`, `SinkRegistry`, `ServerInstrumenter`
  (`src/sink-registry.ts`) and the redaction primitives (`redactTelemetryValue`,
  `redactTelemetryObject`, `redactHeaderRecord`, …). **Structurally enforced
  browser-safe**: `src/no-node-only-imports.unit.test.ts` fails on any `node:*` or
  `@sentry/*` import in runtime source (ADR-160 browser-safety guarantee). Deps:
  `@opentelemetry/api` + `@oaknational/type-helpers`.
- **`@oaknational/logger`** (`packages/libs/logger`) — the **general logging
  adapter** (the facade), and the owner of the `LogEvent` currency
  (`src/types.ts:106`). `UnifiedLogger` (`src/unified-logger.ts`) fans one
  immutable `LogEvent` out to `readonly LogSink[]` with per-sink failure isolation
  and one shared redaction pass (ADR-143, ADR-051). `LogSink` is a one-method
  `write(event)` contract; sinks are injected via constructor DI, never selected
  internally. Runtime-split via package exports: `.` (intended portable) and
  `./node` (`createNodeStdoutSink`, file sink, express middleware). Deps:
  observability + type-helpers only.
- **`@oaknational/sentry-node`** (`packages/libs/sentry-node`) — the **Node/Express
  provider**, binding the ports to `@sentry/node`. Three-mode DI (`SENTRY_MODE`
  off/fixture/sentry, `src/runtime.ts`), the ADR-160 redaction barrier
  (`src/runtime-sdk.ts` `createSentryHooks`, composing the Sentry-shaped redactors
  from `src/runtime-redaction.ts`: `redactSentryEvent`/`Breadcrumb`/`Log`/`Span`/
  `Transaction`, with load-bearing composition order — redaction first,
  post-redaction consumer hooks last), and a `LogSink` bridge forwarding
  `LogEvent`s into Sentry (`src/runtime-sinks.ts`).

**Dependency-tier model (ESLint boundary, `packages/core/oak-eslint/src/rules/boundary.ts`).**
Purely a dependency-direction model — core → foundation libs → adapter libs → sdks
→ apps. `logger` is a **foundation** lib (may import only core); `sentry-node` is
the sole **adapter** lib (may import foundation, never another adapter). ADR-041 is
the authority; the split protects *vendor-independence of the reusable tier*. The
boundary model has NO runtime (node/edge/browser) axis. Note the vocabulary
collision: ESLint's "adapter" tier (vendor-binding libs) is a *different* word-sense
from the domain "general adapter" (`logger`); §3 uses the domain sense. The boundary
config is ours to extend — the resolution (§8) adds edges by configuration, never by
disabling (`never-disable-checks`).

**Config theory (on paper).** ADR-171 (Accepted): two orthogonal axes
`OBSERVABILITY_SINKS` × `OBSERVABILITY_FIXTURES`, retiring `SENTRY_MODE` via a
bridge. ADR-162 (**Proposed**): observability-first, five axes, a
vendor-independence clause, and a composition-root carve-out permitting vendor SDK
wiring at `apps/**` roots. The `observability-sinks-decoupling.plan.md`
(DECISION-COMPLETE, execution owner-gated) would land the axes and a standalone
`NodeTracerProvider`. In code today the sink enum is `['sentry','file']` and the
`SENTRY_MODE`→axes bridge does not yet exist — the paper model and the code
disagree (§9).

**Runtime reality.** Two shipping product runtimes, both Node: the Express MCP
server (`apps/oak-curriculum-mcp-streamable-http`) and the Node search CLI
(`apps/oak-search-cli`); `@oaknational/sdk-codegen` is a generation workspace at
`packages/sdks/oak-sdk-codegen`, not an `apps/*` CLI (corrected). The hub demo
(`demos/oak-curriculum-hub`) has zero logging/Sentry. Only `@sentry/node` ships
anywhere. Browser-surface Sentry remains deferred pending its own lane.

### 2.1 Two latent defects this surfaced — now owned by this work

1. **The "portable" adapter core is not portable.** `logger`'s base entrypoint
   pulls `node:crypto` — `packages/libs/logger/src/otel-format.ts:10`
   (`createHash('md5')` at line 83, in `correlationIdToTraceId`), reached from both
   `src/index.ts` and `src/unified-logger.ts` — and unlike `observability`,
   `logger` has **no** `no-node-only-imports` enforcement test, which is exactly why
   the leak survives while the README asserts "runtime-agnostic". The Slack app's
   default runtime is Node, so this does not crash Ask Oisín — but the framework
   imports `logger`'s base entrypoint, so the portability claim must be true, not
   worked around. **Owner direction (2026-07-08): fix it in support of this work** —
   the Ask Oisín plan carries the cycle (portable hash + the missing enforcement
   test + a truthful README; note Web Crypto has no MD5, so the cycle chooses a
   portable deterministic hash rather than preserving MD5).
2. **`sentry-node` conflates vendor and runtime.** Its name and its one hard
   dependency bind "Sentry" (vendor) and "Node/Express" (runtime) together. The
   resolution decomposes at that fault line (§8): the Sentry-shaped,
   runtime-agnostic substance (the redactors + hook composition) extracts to a
   shared core; per-runtime providers stay thin.

## 3. The model, in the owner's vocabulary

- **General adapter** = `logger` (the facade over sinks).
- **Providers** = the concrete sinks/backends per vendor × runtime: `stdio`,
  `sentry-node` (Node/Express), and now **`sentry-nextjs`** (Next.js) — plus a
  future client-side provider when a browser surface needs one.
- The **app composition root** wires the providers it wants. A framework lib
  (`slack-assistant`) imports **no** vendor provider — only the vendor-neutral
  `logger` + `observability` ports. This is the boundary rule working *as designed*.

The excellent target this record named — a **vendor × runtime** provider model
behind the existing shared ports, with the vendor-shared substance (the redaction
barrier and the hook-composition skeleton) living once and the per-runtime pieces
(`init`, mode/DI, sinks bridge) staying with each provider — is what the resolution
now builds (§8), rather than deferring.

## 4. The problem, framed — and the framing correction

The first draft framed this as "egress decision per origin — front-end vs back-end
code both run here". That was a misapplication: the *estate* has front-end code
(the browser MCP widget; the hub demo), but **the Slack apps ship none** — Slack's
own client renders everything, and Next.js App Router route handlers on Vercel run
on the **Node.js runtime by default** (verified). So for these apps there is exactly
one origin (back-end) and one runtime (Node). The Slack apps are NOT the estate's
first non-Node product runtime — that premise was false.

Consequences:

- The owner's safety lean — **no front-end log egress; back-end only** — is
  satisfied by construction for these apps and is recorded as settled for this
  plan. The general client-side provider remains a real estate capability need
  (owner statement) for the surfaces that do have client code; it rides the
  observability collection, not this plan.
- The remaining question was narrow and answerable: *which Sentry mechanism carries
  the back-end telemetry of a headless Next.js app on Vercel, and does the ADR-160
  redaction barrier apply to it?* §5 answers it with verified facts.

**No assumed compliance mandate** (unchanged): PII handling is our own safety
requirement; no legal/DPIA/audit requirement is known (§7 Dropped).

## 5. The topology space — evaluated on verified facts (2026-07-08)

- **A — app code → general adapter → a Sentry provider (SDK direct). CHOSEN.**
  The runtime's documented SDK is `@sentry/nextjs`: init via `instrumentation.ts`
  `register()` importing `sentry.server.config.ts`, `onRequestError =
  Sentry.captureRequestError`, `withSentryConfig` on `next.config` (build-time
  code injection + source maps; tree-shaking flags exist). The barrier is the
  **ADR-160 closure over every fan-out hook** — concretely all five (`beforeSend`,
  `beforeSendTransaction`, `beforeBreadcrumb`, `beforeSendLog`, `beforeSendSpan`), not a
  shorter list: fetch spans are auto-captured (so span redaction is required, mutate-in-place
  — `beforeSendSpan` cannot drop), and console-as-breadcrumbs is ON by default (redacted via
  `beforeBreadcrumb`; console-as-Sentry-logs is off). All five are available server-side in
  `@sentry/nextjs` — the barrier applies. Auto-captures route-handler errors and fetch spans;
  the SDK's handler wrapping manages flush timing for the request path; the post-response
  continuation needs our own EXPLICIT capture+flush (`captureRequestError` does not see
  post-response work — vendor-undocumented, so it is our requirement). No
  `instrumentation-client.ts` — the app is headless. Redaction: ours, pre-egress.
- **B — app code → general adapter → stdio; the platform forwards logs → Sentry.
  Evaluated, not chosen for v1.** Verified real: Vercel Drains (Pro/Enterprise)
  deliver structured JSON/NDJSON, and Sentry is a documented drain destination
  (auto-provisioned via the Marketplace integration or a manual endpoint); Sentry's
  Structured Logs product is GA (2025-09) with platform drain ingestion GA
  (2026-01). Not chosen because: a second pipe with its own cost; SDK+drain
  double-emission is documented NOWHERE (a self-managed dedup risk, not a
  vendor-managed one); and it adds no error/trace fidelity over A. The structured
  **stdout baseline via `logger` stays regardless** (vendor-independence floor,
  ADR-171/162 spirit), visible in Vercel's own logs.
- **C — the Sentry Next.js SDK. Merged into A.** On this host, `@sentry/nextjs`
  *is* the provider mechanism inside topology A; C was never genuinely distinct
  once the provider composes behind our adapter and barrier.
- **D — the Vercel-side Sentry integration as a runtime path. Does not exist.**
  Verified: the Marketplace integration acts at build/deploy time only (DSN env
  wiring, source-map upload, release creation) — it captures nothing at runtime.
  Install it for env/source-map/release plumbing if wanted; it is not a telemetry
  topology. (Its drain-provisioning facility belongs to B.)
- **(orthogonal) Next.js built-in logging** — dev-oriented request/fetch logging;
  nothing to tee for production purposes. Ignored.

## 6. The cost/value assessment (populated)

| Axis | A (chosen: provider SDK behind our adapter) | B (stdout → drain → Sentry Logs) | D (integration as runtime path) |
|---|---|---|---|
| Redaction/PII control | **Ours end-to-end** (ADR-160 hooks in-process, pre-egress) | Ours pre-stdout; transport/platform handles the rest | n/a — no runtime capture exists |
| Telemetry fidelity | Structured errors + traces + spans | Log lines (structured) only | n/a |
| App/init complexity | One provider workspace, thin app-root init | Drain config + dedup discipline | Trivial but does nothing at runtime |
| Cost | Sentry plan ingest | Pro-tier drains + Sentry Logs $/GB | — |
| Double-emission risk | None (one pipe + silent stdout floor) | Real and vendor-undocumented | — |
| Adapter-model consistency | Through the adapter + barrier (ADR-162 clause holds) | Through the adapter to stdout; bypasses the barrier beyond it | Bypasses everything |
| Reversibility | Swap the provider (ports unchanged) | Reconfigure drains | — |

**Verdict: A**, with the stdout baseline retained and B re-openable if a
platform-log aggregation need emerges.

## 7. Assumption ledger — final dispositions

| Claim | Status |
|---|---|
| Redaction/PII barrier lives in our adapter+providers (ADR-160); bypassing them bypasses redaction | **Fact** (verified in code) |
| `logger` base is not truly portable (`node:crypto` leak), and has no enforcement test | **Fact** (verified; fix now owned by the Ask Oisín plan — owner direction) |
| Boundary model has no runtime axis; "adapter" is overloaded (tier vs domain) | **Fact** (verified; boundary config extended by configuration for the provider model) |
| Only `@sentry/node` ships; no browser/edge/nextjs Sentry anywhere in code | **Fact** (verified) |
| Always-on stdio baseline must survive any backend off | **Our stated direction** (ADR-162 still Proposed; honoured by the chosen topology) |
| Egress from back-end only for these apps | **Settled** — satisfied by construction (headless app, no client code; §4) |
| We need a client-side provider as a general estate capability | **Owner statement** — real, routed to the observability collection (not these apps) |
| Vercel log drains / platform→Sentry forwarding | **Verified** — drains are Pro/Enterprise, structured JSON/NDJSON; Sentry is a documented destination; Sentry Logs GA |
| What the Sentry Next SDK captures and how our redaction hooks apply | **Verified** — route-handler errors + fetch spans auto-captured; the full five-hook ADR-160 closure (`beforeSend`/`beforeSendTransaction`/`beforeBreadcrumb`/`beforeSendLog`/`beforeSendSpan`) available server-side; console-as-breadcrumbs on (redacted), console-as-logs off |
| What the Vercel Sentry integration does | **Verified** — build/deploy-time only (env, source maps, releases); no runtime capture |
| Next.js built-in logging | **Verified** — dev-oriented; nothing to tee in production |
| A legal / DPIA / records-retention / audit requirement governs these apps | **Dropped** — no such requirement is known; the drivers are the owner's safety instinct + engineering hygiene |
| "The Slack app is server-only" | **Corrected twice**: the first draft's correction over-corrected — the estate has both origins, but THESE apps ship no client code; one origin, Node runtime (§4) |
| "`@sentry/nextjs` is the mechanism" | **Confirmed as the runtime's provider SDK**, composed behind our adapter/barrier as the `sentry-nextjs` provider workspace — adopted on verified capability, not assumption |

## 8. Resolution and the estate work it drives

**Settled topology**: A — the app root composes **`@oaknational/sentry-nextjs`**
(new provider workspace) which wraps `@sentry/nextjs` and carries the ADR-160
barrier; the `slack-assistant` framework imports no vendor provider; structured
stdout via `logger` remains the vendor-independent floor.

**Estate work this drives (owner direction: the workspaces are ours to enhance
in support of this work — executed by the Ask Oisín plan's estate workstreams):**

1. **Decompose `sentry-node` at the vendor×runtime fault line**: extract the five
   Sentry-shaped, runtime-agnostic redactors and the hook-composition **skeleton**
   (redact → injected post-redaction transform, preserving the load-bearing ordering)
   into a shared Sentry redaction core (types re-based on `@sentry/core`);
   `applyFingerprint` stays with `sentry-node` as its injected post-redaction hook
   (its error families are MCP-app-specific); `sentry-node` consumes the core with an
   unchanged public surface; the new `sentry-nextjs` provider consumes it for the
   full five-hook closure. The shared core joins the adapter-base sub-tier of the
   stratified adapter tier (the ADR-041 amendment owns tier mechanics); the
   provider-model ADR records the decomposition and barrier ownership.
2. **Fix `logger` portability** (§2.1): portable deterministic hash in
   `otel-format.ts`, add the missing `no-node-only-imports` enforcement test,
   true up the README claim — every issue earns a check.
3. **Config contract**: the new provider adopts the ADR-171 axes as its native
   config vocabulary; the estate-wide `SENTRY_MODE` migration remains the
   owner-gated `observability-sinks-decoupling` plan's scope (coordinate, don't
   fork — this work is evidence for that plan, not a preemption of it).
4. **Routed, not carried**: the client-side provider capability (for surfaces with
   real client code) stays with the observability collection; ADR-162's
   acceptance evidence should cite this resolution as a same-runtime instance,
   not "cross-runtime" evidence (the first draft's overreach).

## 9. Certainty-as-risk register — with closures

- **"`@oaknational/logger` is runtime-agnostic / browser-safe."** Was asserted and
  false. **Closure**: the fix + enforcement test are owned by the Ask Oisín plan;
  the claim becomes structurally guaranteed, not asserted.
- **"Vendor-independence" as an estate property.** Still a structural claim, not a
  tested invariant. Remains open with the observability lane; the stdout floor in
  the chosen topology honours it here.
- **ADR-171 config model as "the" model.** The code/paper divergence (sink enum,
  missing bridge) is still real and still belongs to the sinks-decoupling plan.
  The new provider adopting the axes natively narrows the divergence rather than
  widening it.
- **"sentry-node is the shared Sentry package."** Closed by the decomposition: after
  §8.1 the shared thing has a name of its own, and `sentry-node` is honestly the
  Node/Express provider.
