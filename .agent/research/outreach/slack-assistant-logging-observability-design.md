---
name: "Slack assistants — logging & observability across runtimes (understanding + open questions)"
status: ready for review
lineage:
  serves_thread: oak-slack-assistants
  companion_to: ".agent/research/outreach/oisin-oce-navigator-design.md"
  derives_from: "session 'Kiln wakes Copper' (48382d), 2026-07-08 — owner-directed logging re-exploration"
last_updated: 2026-07-08
---

# Slack assistants — logging & observability across runtimes

> **Provenance & confidence.** This record was authored in a single session from
> (a) a first-hand read of the current code and (b) three read-only estate-mapping
> passes. Every claim below is tagged in §7 as **Fact (verified)**,
> **Owner's-call**, **Assumption-to-verify**, or **Dropped**. Nothing vendor-specific
> here is verified against live vendor docs yet — those are all Assumptions-to-verify.
> This is the discipline the owner asked for: transmitted claims are marked as claims,
> never treated as ground truth.

## 1. Why this record exists

Building the Slack apps surfaced a boundary contradiction (a framework lib could
not import `@oaknational/sentry-node`). The first instinct — shrink the plan to fit
the current lint tier — was wrong. The owner's reframe: that contradiction is a
**symptom**, not a defect to patch. The real gap is that **the estate has no
cohesive theory of logging/observability across runtimes**. The Slack apps are the
first non-Node product runtime (Next.js App Router on Vercel) the estate has ever
had, so they are the forcing function to build the multi-runtime story we have
*designed for but never built*.

This record captures: what exists today (§2), the model in the owner's vocabulary
(§3), the problem framed (§4), the topology space (§5), the cost/value theory
structure (§6), the assumption ledger (§7), open questions and next steps (§8), and
a certainty-as-risk register (§9).

## 2. What exists today (grounded, with cites)

A coherent, **Node-only, vendor-neutral-by-ports** design in three layers:

- **`@oaknational/observability`** (`packages/core/observability`) — the
  vendor-neutral ports: `ObservabilitySink`, `SinkRegistry`, `ServerInstrumenter`
  (`src/sink-registry.ts`), redaction primitives, the `LogEvent` currency.
  **Structurally enforced browser-safe**: `src/no-node-only-imports.unit.test.ts`
  fails on any `node:*` or `@sentry/*` import in runtime source (ADR-160
  browser-safety guarantee). Deps: `@opentelemetry/api` + `@oaknational/type-helpers`.
- **`@oaknational/logger`** (`packages/libs/logger`) — the **general logging
  adapter** (the facade). `UnifiedLogger` (`src/unified-logger.ts`) fans one
  immutable `LogEvent` out to `readonly LogSink[]` with per-sink failure isolation
  and one shared redaction pass (ADR-143, ADR-051). `LogSink` is a one-method
  `write(event)` contract (`src/types.ts`); sinks are injected via constructor DI,
  never selected internally. Runtime-split via package exports: `.` (intended
  portable) and `./node` (`src/node.ts`: `createNodeStdoutSink`, file sink,
  express middleware). Deps: observability + type-helpers only.
- **`@oaknational/sentry-node`** (`packages/libs/sentry-node`) — the **one and only
  concrete backend provider**, binding the ports to `@sentry/node ^10.63.0`.
  Three-mode DI (`SENTRY_MODE` off/fixture/sentry, `src/runtime.ts`), the ADR-160
  redaction barrier (`src/runtime-sdk.ts` `createSentryHooks`), and a `LogSink`
  bridge that forwards `LogEvent`s into Sentry (`src/runtime-sinks.ts`). It is a
  provider that lives outside the adapter and plugs into its fan-out.

**Dependency-tier model (ESLint boundary, `packages/core/oak-eslint/src/rules/boundary.ts`).**
Purely a dependency-direction model — core → foundation libs → adapter libs → sdks
→ apps. `logger` is a **foundation** lib (may import only core); `sentry-node` is
the sole **adapter** lib (may import foundation, never another adapter). ADR-041 is
the authority; the split protects *vendor-independence of the reusable tier*. **The
boundary model has NO runtime (node/edge/browser) axis** — only a `no-restricted-globals`
DI rule. Note the vocabulary collision: ESLint's "adapter" tier (vendor-binding
libs) is a *different* word-sense from the domain "general adapter" (`logger`); §3
uses the domain sense.

**Config theory (on paper).** ADR-171 (Accepted): two orthogonal axes
`OBSERVABILITY_SINKS` (typed list `sentry`/`console`/`log-file`) × `OBSERVABILITY_FIXTURES`
(boolean), retiring `SENTRY_MODE` via a bridge. ADR-162 (**Proposed**):
observability-first, five axes, a vendor-independence clause ("minimum functionality
= structured stdout via logger persists with no backend"), and a composition-root
carve-out permitting vendor SDK wiring at `apps/**` roots. The
`observability-sinks-decoupling.plan.md` (DECISION-COMPLETE, execution owner-gated)
would land the axes and a standalone `NodeTracerProvider` so spans persist with
Sentry off.

**Runtime reality.** Two shipping runtimes, both Node: the Express MCP server
(`apps/oak-curriculum-mcp-streamable-http`) and Node CLIs (`apps/oak-search-cli`,
`oak-sdk-codegen`). Plus a browser MCP widget that is observability-**dark**, and
the Next.js demo (`demos/oak-curriculum-hub`) with **zero** logging/Sentry. Only
`@sentry/node` ships anywhere; `@sentry/nextjs`/`browser`/`react`/`edge` appear
**only** in docs/plans, never in code or dependencies. Browser Sentry (widget
"L-12") is deferred to public beta pending agentic-host verification.

### 2.1 Two latent defects this surfaced

1. **The "portable" adapter core is not portable.** `logger`'s base entrypoint
   pulls `node:crypto` — `packages/libs/logger/src/otel-format.ts:10`
   (`createHash('md5')` at line 83, in `correlationIdToTraceId`), reached from both
   `src/index.ts` and `src/unified-logger.ts`. `node:crypto`'s `createHash` is
   unavailable in a browser or the Vercel Edge runtime, so the surface advertised as
   "runtime-agnostic" would crash there. Unlike `observability`, **`logger` has no
   `no-node-only-imports` enforcement test** — which is exactly why the leak
   survives. Per "every issue earns a check", the fix must land *with* that test.
2. **`sentry-node` conflates vendor and runtime.** Its name and its one hard
   dependency (`@sentry/node`) bind "Sentry" (vendor) and "Node" (runtime) together,
   which is why "add client-side Sentry" has no clean home. Decompose at that
   fault line (see §3, §8).

## 3. The model, in the owner's vocabulary

- **General adapter** = `logger` (the facade over sinks).
- **Providers** = the concrete sinks/backends: `stdio`, `sentry-node`, and a needed
  **client-side** provider for the Next.js app (candidate base: the Sentry
  Next/Vercel library — *not settled*; "we have specific requirements").
- The **app composition root** wires the providers it wants. A framework lib
  (`slack-assistant`) imports **no** vendor provider — only the vendor-neutral
  `logger` + `observability` ports. This is the boundary rule working *as designed*.

The excellent target: a **vendor × runtime** provider model behind the existing
shared ports. The vendor-neutral ~90% of Sentry logic (config resolution, the
ADR-160 redaction barrier, the `LogSink` bridge, the mode/axes) lives once; only the
thin `Sentry.init()` differs per runtime. This is *decompose-at-the-tension* applied
to `sentry-node`. Prerequisite: make the adapter core provably portable (fix the
`node:crypto` leak; add the enforcement test `observability` already has).

## 4. The problem, framed (not the solution)

Choose logging topology(ies) for the Next.js Slack app across **multiple
non-exclusive** options, optimising **cost vs value**, given (a) an **egress
decision per origin** — front-end vs back-end code both run here — and (b) **our own**
redaction/PII control needs. **No assumed compliance mandate** (see §7 Dropped).

Owner's safety lean: **do not egress logs from the front-end/Slack side at all;
only from the app back-end.** The user-visible Slack surface is front-end; the
back-end is where we can log safely. The general client-side provider is still a
needed estate capability, but whether we *use* it to egress for these apps is the
open safety question — and the lean is no.

## 5. The topology space

Decomposes in order: **origin** (front-end / back-end) → **egress policy** (send
off-box from this origin?) → for each egressing origin, **emission × transport ×
destination**. The topologies the owner named live in the last layer:

- **A — app code → general adapter → Sentry provider (SDK direct).** Redaction:
  ours, pre-egress.
- **B — app code → general adapter → stdio; Sentry provider off; the platform
  (Vercel) forwards stdout → Sentry.** Redaction: ours, pre-stdout; transport:
  platform.
- **C — the Sentry Next/Vercel SDK library** (framework auto + manual
  instrumentation).
- **D — the Vercel-side Sentry integration/plugin** (infra-level; little/no app
  code).
- **(orthogonal) Next.js built-in logging** — an origin we ignore, or tee into the
  adapter.

These are **non-exclusive** (e.g. A+B, or D beneath A), so **double-emission** is a
real failure mode to price.

## 6. The cost/value theory (structure — values pending verification)

Deliberately **unpopulated**: filling the cells requires the vendor facts in §8,
which are unverified. Populating from memory would repeat the exact
assumptions-as-truth error this record exists to prevent.

**Cost axes:** redaction/PII control retained (how much of the barrier stays
*ours*); telemetry fidelity (structured errors/spans vs flattened lines); app-code +
per-runtime init complexity; infra/config complexity and **platform lock-in**;
`$` cost (Sentry ingest, platform log volume); double-emission risk; consistency
with the vendor-neutral adapter model (does the path go *through* the adapter or
*bypass* it — **D bypasses it entirely**, breaking the ADR-162 clause).

**Value axes:** what we can actually debug/alert on (errors, latency, tool-call
failures — overwhelmingly back-end); the signal we would *lose* by not egressing
front-end (owner's read: little, and risky).

**Reversibility (first-class):** A/B via our providers are reversible (swap a
provider); **D couples us to the platform** and is least reversible; C sits between.

## 7. Assumption ledger

| Claim | Status |
|---|---|
| Redaction/PII barrier lives in our adapter+providers (ADR-160); bypassing them bypasses redaction | **Fact** (verified in code) |
| `logger` base is not truly portable (`node:crypto` leak), and has no enforcement test | **Fact** (verified this session) |
| Boundary model has no runtime axis; "adapter" is overloaded (tier vs domain) | **Fact** (verified) |
| Only `@sentry/node` ships; no browser/edge/nextjs Sentry anywhere in code | **Fact** (verified) |
| Always-on stdio baseline must survive any backend off | **Our stated direction** (ADR-162, still *Proposed*) |
| Egress from back-end only; no front-end/Slack log egress for these apps | **Owner's-call** (their lean; not yet decided — prunes hardest) |
| We need a client-side provider as a general estate capability | **Owner's statement** (distinct from whether we egress front-end here) |
| What Vercel log-drains do / whether+how the platform forwards logs to Sentry | **Assumption — must verify** |
| What the Sentry Next/Vercel SDK captures across server/client/edge; how our redaction hooks apply | **Assumption — must verify** |
| What the Vercel-side Sentry integration/plugin does; double-emit interaction with the SDK | **Assumption — must verify** |
| What Next.js built-in logging emits and whether we tee it into the adapter | **Assumption — must verify** |
| A legal / DPIA / records-retention / audit requirement governs these apps | **Dropped** — no such requirement is known; the thread record itself says DPIA *not* required. It was transmitted framing echoed as truth. The real drivers are the owner's safety instinct + engineering hygiene. |
| "The Slack app is server-only" | **Dropped/corrected** — both front-end and back-end code run; the real variable is egress-policy-per-origin |
| "`@sentry/nextjs` is the mechanism" | **Dropped/corrected** — a candidate, not a fact ("maybe not, we have specific requirements") |

## 8. Open questions & next steps

**Vendor-literal verification needed (before populating §6):**

1. Vercel log drains → Sentry: does the platform forward stdout/structured logs to
   Sentry, by what mechanism, with what fidelity and redaction control?
2. The Sentry Next/Vercel SDK: what it auto-captures across server/client/edge; how
   the ADR-160 redaction hooks apply in each; init shape for App Router.
3. The Vercel-side Sentry integration/plugin: what it does at build/infra level; the
   double-emission interaction if the SDK is also present; the lock-in it adds.
4. Next.js built-in logging: what it emits and whether to tee it into the adapter.

**Owner decision (prunes the space):** is back-end-only egress the working
constraint? If yes, evaluate topologies for the back-end path; treat the front-end/
client provider as a separate general-capability track.

**Estate-level forward-asks (bigger than these apps):**

- Fix `logger`'s `node:crypto` leak (portable hash / Web Crypto) **and add the
  `no-node-only-imports` enforcement test** it lacks.
- Decompose the Sentry provider into a vendor-neutral core + per-runtime `init`
  (vendor × runtime provider model), so each new runtime is a thin new member.
- Coordinate with the owner-gated `observability-sinks-decoupling` plan (ADR-171
  axes) and ADR-162 — this work is plausibly the first cross-runtime evidence that
  flips ADR-162 from Proposed to Accepted. Sequencing is an owner call.

## 9. Certainty-as-risk register (stated with no uncertainty → therefore a risk)

The owner flagged that *absence* of stated uncertainty is itself a risk. The
following are asserted flatly in the estate and warrant a deliberate re-check:

- **"`@oaknational/logger` is runtime-agnostic / browser-safe."** Asserted in its
  README and `src/node.ts` comments — and **false** at the base entrypoint
  (§2.1). High-confidence claim, wrong.
- **"Vendor-independence"** as an estate property. ADR-162 states it; it is a
  *structural claim, not a tested invariant* (the conformance test is beta-gated).
  Confidence exceeds evidence.
- **ADR-171 config model as "the" model.** In code, the sink enum
  (`['sentry','file']`) diverges from ADR-171 (`sentry`/`console`/`log-file`) and
  the `SENTRY_MODE`→axes bridge does not exist yet — the paper model and the code
  disagree, but the paper reads as settled.
- **"sentry-node is the shared Sentry package."** Its name reads as the Sentry
  integration; it is specifically the *Node* one. Treating it as *the* Sentry
  provider is what produced the original boundary contradiction.
