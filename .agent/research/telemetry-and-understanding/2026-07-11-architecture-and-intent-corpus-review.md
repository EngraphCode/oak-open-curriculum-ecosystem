---
title: "TAU architecture and intent-corpus review"
type: research
status: complete
last_updated: 2026-07-11
---

# TAU architecture and intent-corpus review

## Scope

This review treats the following as one intent corpus:

- logging;
- semantic events;
- errors and exceptions;
- traces and spans;
- metrics;
- monitoring and alerting;
- product analytics;
- feedback and surveys;
- experimentation and flags;
- accessibility and security signals;
- sinks, export, retention, and deletion;
- dashboards, queries, analysis, and decision use.

The review includes code, ADRs, plans, explorations, operational guides, and
the June plan-estate survey. Historical documents are used as evidence and
salvage sources, not automatically as current authority.

## Finding in one sentence

Oak has a strong telemetry substrate but a fragmented understanding system:
signal production is more mature than semantic contracts, product questions,
analysis surfaces, and evidence-to-decision governance.

## Current architecture

### Existing signal path

```text
runtime capability
  ├─ @oaknational/logger
  │    ├─ stdout JSONL
  │    └─ optional file / Sentry log sink
  ├─ @oaknational/sentry-node
  │    ├─ errors
  │    ├─ spans and traces
  │    ├─ releases / source maps
  │    └─ redaction hooks
  └─ free-shape tags / context
```

### Planned path

```text
runtime capability
  -> @oaknational/observability-events
  -> ADR-160 redaction
  -> sink registry
       ├─ stdout / fixture
       ├─ Sentry
       ├─ warehouse
       └─ PostHog
```

The planned shape is sound, but it is not yet a complete system because it
does not specify how questions, dashboards, scheduled interpretation, and
decisions remain connected.

## What is strong

### 1. Structured logging foundation

ADR-051 and `@oaknational/logger` establish:

- one-line OpenTelemetry-shaped JSON;
- immutable `LogEvent` fan-out;
- shared serialisation;
- redaction before sinks;
- trace correlation;
- stdout and file support;
- runtime-neutral core with Node-only sink helpers.

This should be reused. TAU does not replace the logger.

### 2. Redaction as a closure property

ADR-160 and the Sentry adapter implement a non-bypassable redaction model
with tests across error, transaction, span, log, and breadcrumb hooks.

TAU should generalise this from “Sentry hook completeness” to “every external
adapter projection is proven against an allowlisted data policy”.

### 3. Correlation

The HTTP MCP app already owns a per-request `correlation_id`. Sentry adds
`trace_id`; future MCP hosts may supply `traceparent`.

That three-part model is more honest than inventing a conversation or session
identifier the protocol/runtime does not expose.

### 4. Composition-root discipline

Feature code is intended to depend on Oak abstractions while adapters and
composition roots own vendor SDKs. This is the correct boundary for adding
PostHog.

### 5. Release and engineering diagnosis

Sentry integration already contains valuable work in:

- exception capture;
- release identity;
- source maps;
- error fingerprinting;
- noise reduction;
- trace context;
- build/deploy attribution.

TAU should preserve this distinct capability rather than replicate it in
PostHog for the sake of platform uniformity.

### 6. Schema-first intent

The planned `@oaknational/observability-events` workspace is the right
semantic authority:

- Zod-first schemas;
- event catalogue;
- examples;
- conformance helper;
- consuming-workspace tests;
- vendor-neutral fields.

The later May exploration strengthens it from seven to eight Stage-1 events
by adding `dependency_call`.

## What is structurally wrong

### 1. Authority is fragmented

The estate has overlapping authority across:

- ADR-162;
- the high-level observability plan;
- the Sentry maximisation plan;
- the event workspace plan;
- sink decoupling;
- conformance;
- security/accessibility/search plans;
- the three-sink plan;
- later identity/event-emission exploration;
- current code and app guides.

A reader must reconcile dates and amendments manually.

**Cure:** TAU controls priority and cross-layer sequencing. Existing plans
become source plans with explicit dispositions.

### 2. The organising centre is a vendor programme

The largest executable artefact is a Sentry maximisation plan. Product,
feedback, flags, dashboards, and alerts entered it as lanes because Sentry
offered those capabilities.

**Cure:** organise by named outcomes/questions. Vendors implement only the
parts for which they are the selected mechanism.

### 3. The plan unit is too large

The Sentry maximisation plan grew beyond three thousand lines and accumulated
new operational-hardening and maturity lanes. The June survey correctly
identifies it as too large for coherent working memory and review.

**Cure:** do not add PostHog to the umbrella. Cut focused TAU stage plans/PRs
from one controlling plan, and archive/supersede the umbrella only after
evidence is conserved.

### 4. Semantic events are a keystone with no implementation

Multiple plans depend on the event workspace. Product, security,
accessibility, search, and vendor independence remain blocked or free-shape
until it exists.

**Cure:** event contracts are Stage 1 and the first implementation priority.

### 5. Spans are not fully sink-independent

The current sink-decoupling plan records that real span generation is tied to
Sentry initialisation; Sentry-off paths can produce synthetic/no-op spans.

**Cure:** preserve the standalone OTel-provider work, but make it serve the
TAU conformance objective rather than a rename programme.

### 6. Runtime truth and plan truth drift

Examples:

- the observability README and ADR-162 have disagreed about acceptance state;
- `what-the-system-emits-today.md` is stale;
- code comments still call PostHog identity policy open after the May
  exploration records an operating posture;
- old warehouse-first sequencing remains in live plans;
- old `SENTRY_MODE` and new sink axes coexist.

**Cure:** derive an emission inventory from tests/code where possible, and
make Stage 0 close every live contradiction before implementation begins.

### 7. Signals are not tied to decisions

The corpus has event names and axis coverage but no durable requirement that
an insight:

- answers a named question;
- has a decision owner;
- defines an action threshold or interpretation;
- records the decision made;
- schedules re-measurement.

**Cure:** the question register is a first-class TAU artefact. Dashboards are
views of registered questions, not a catalogue of available charts.

### 8. “Session” is overloaded

PostHog has session semantics; MCP transports may have protocol sessions;
the HTTP server is stateless per request; an AI host conversation identifier
is unavailable.

**Cure:** use distinct names:

- `correlation_id`: one Oak HTTP invocation;
- `traceparent`: optional cross-system trace;
- `trace_id`: Sentry/OTel engineering trace;
- `distinct_id`: permitted person or anonymous identity projection;
- `analysis_window`: query-time grouping, not an emitted session claim;
- vendor-native `$session_id`: supplementary only if its source and semantics
  are proven.

### 9. Logs, events, metrics, and alerts blur

The current estate sometimes uses logging as an event carrier, Sentry metrics
as a product surface, and dashboards/alerts as one lane.

**Cure:** register signal class:

| Class | Purpose | Retention/volume posture | Primary use |
|---|---|---|---|
| Semantic event | A stable fact about use or outcome | Durable, schema-versioned | Product/security/accessibility analysis |
| Log | Detailed operational narrative | Higher volume, sampled/shorter retention | Investigation |
| Trace/span | Causal timing and dependency path | Sampled | Engineering diagnosis |
| Metric | Aggregated numeric health | Bounded cardinality | Monitoring and capacity |
| Error | Unexpected failure instance/group | Deduplicated | Engineering response |
| Alert | Evaluation of a condition | Low volume, actionable | Human/operator interruption |
| Feedback | Deliberate qualitative input | Consent/minimisation governed | Product learning |
| Experiment exposure | Controlled intervention assignment | Governed and auditable | Causal learning |

## Target authority model

```text
strategy (APP-1 / K1)
  -> TAU roadmap and controlling delivery plan
     -> question register
     -> event and signal registries
     -> runtime implementation + conformance tests
     -> adapter packages
     -> project definitions / analysis surfaces
     -> review and decision log
```

Authority by concern:

| Concern | Authority |
|---|---|
| Why collect | TAU question register + strategy |
| Event meaning | `@oaknational/observability-events` |
| Sensitive-data policy | ADR-160 + privacy/DPIA decision |
| Runtime emission | owning application code and tests |
| Delivery routing | `@oaknational/observability` + composition roots |
| Sentry projection | `@oaknational/sentry-node` |
| PostHog projection | proposed `@oaknational/posthog-node` |
| Logging | `@oaknational/logger` |
| Dashboards/insights | TAU project definitions or verified manifest |
| Operational response | runbooks and alert ownership |
| Historical rationale | ADRs and archived plans |

## Target architecture

```text
                           ┌────────────────────────────┐
                           │ question / decision register│
                           └─────────────┬──────────────┘
                                         │
runtime capability ──> Oak event/signal contract
                                         │
                         allowlist + redaction + identity projection
                                         │
                           provider-neutral delivery ports
            ┌───────────────┬────────────┼───────────────┐
            │               │            │               │
        stdout/fixture    Sentry       PostHog       future export
        invariant floor  engineering   understanding  warehouse/other
            │               │            │               │
            └───────────────┴──── correlation ───────────┘
                                         │
                         reproducible analysis surfaces
                                         │
                          scheduled human interpretation
                                         │
                              decision + re-measure
```

## Layer-by-axis model

The five ADR-162 axes classify **what a signal is about**. TAU layers classify
**how it becomes useful**.

| Layer | Engineering | Product | Usability | Accessibility | Security |
|---|---|---|---|---|---|
| Question | Can we diagnose? | What is used and valuable? | Did the user succeed? | Where do preferences or barriers affect outcomes? | Which trust boundaries fail or are attacked? |
| Contract | errors/spans/metrics | tool/dependency/search events | outcome/feedback events | a11y tags/outcomes | auth/rate-limit events |
| Delivery | Sentry/OTLP | PostHog/stdout | PostHog/stdout | PostHog/stdout | PostHog/Sentry/stdout by policy |
| Analysis | trace/error views | trends/funnels/retention | paths/outcomes/feedback | segmented outcomes | rates, anomaly views |
| Action | fix/rollback | portfolio/product decision | UX change | accessibility change | incident/control change |

This two-dimensional model should replace “more observability” as the planning
unit.

## Recommended corpus dispositions

### TAU controls

- cross-layer priority;
- PostHog implementation;
- event workspace;
- identity/correlation envelope;
- sink decoupling and conformance;
- Sentry reconciliation;
- analysis/project definitions;
- logs destination decision;
- questions, reviews, and decision evidence.

### Observability collection remains source authority for

- existing detailed Sentry implementation evidence until transferred;
- existing security/accessibility/search domain plans until their TAU stages
  promote;
- historical explorations and completed evidence.

### Architecture/infrastructure remains authority for

- generic OTel provider architecture;
- environment resolution;
- workspace/dependency boundaries;
- build and deployment primitives.

### Security/privacy remains authority for

- DPIA and DPO gates;
- identity permission;
- data retention and deletion;
- processor/data-region decisions;
- rate limiting and incident controls.

## Invariants for the implementation plan

1. Every collected field is allowlisted by schema or projection.
2. No raw tool arguments, results, search text, prompts, curriculum content,
   credentials, headers, or tokens enter product analytics.
3. PostHog and Sentry identity are separate explicit projections.
4. No new vendor SDK import appears in feature code.
5. External sink failure never breaks the user request.
6. Every controlled probe can be reconciled by `event_id` or correlation ID.
7. Every dashboard or saved query cites a question ID.
8. Every alert has an owner, runbook, and actionable condition.
9. Every event has version, environment, release, and source runtime.
10. A vendor can be disabled without changing emission sites.
11. Telemetry is evidence, not a substitute for user research or impact
    evaluation.
12. The plan corpus is consolidated after each stage; stale plans are not left
    as competing live authority.

## Principal source map

- `docs/architecture/architectural-decisions/051-opentelemetry-compliant-logging.md`
- `docs/architecture/architectural-decisions/143-coherent-structured-fan-out-for-observability.md`
- `docs/architecture/architectural-decisions/160-non-bypassable-redaction-barrier-as-principle.md`
- `docs/architecture/architectural-decisions/162-observability-first.md`
- `docs/architecture/architectural-decisions/171-observability-configuration-orthogonal-axes.md`
- `.agent/plans/observability/active/sentry-observability-maximisation-mcp.plan.md`
- `.agent/plans/observability/current/observability-events-workspace.plan.md`
- `.agent/plans/observability/current/observability-sinks-decoupling.plan.md`
- `.agent/plans/observability/current/multi-sink-vendor-independence-conformance.plan.md`
- `.agent/plans/observability/future/observability-plan-consolidation-and-rationalisation.plan.md`
- `.agent/plans/observability/what-the-system-emits-today.md`
- `docs/explorations/2026-05-26-mcp-analytics-identity-and-event-emission.md`
- `packages/core/observability/`
- `packages/libs/logger/`
- `packages/libs/sentry-node/`
- `apps/oak-curriculum-mcp-streamable-http/src/observability/`
