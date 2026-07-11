---
id: tau-delivery
node_type: plan
kind: executable
serves_strategic_choice: APP-1
derives_from:
  - ../../../../docs/strategy/stream-mcp-app.md
  - ../../../../docs/architecture/architectural-decisions/051-opentelemetry-compliant-logging.md
  - ../../../../docs/architecture/architectural-decisions/160-non-bypassable-redaction-barrier-as-principle.md
  - ../../../../docs/architecture/architectural-decisions/162-observability-first.md
  - ../../../../docs/architecture/architectural-decisions/171-observability-configuration-orthogonal-axes.md
  - ../../../../docs/explorations/2026-05-26-mcp-analytics-identity-and-event-emission.md
  - ../../../research/telemetry-and-understanding/2026-07-11-concept-exploration-and-decision-matrix.md
  - ../../../research/telemetry-and-understanding/2026-07-11-architecture-and-intent-corpus-review.md
  - ../../../research/telemetry-and-understanding/2026-07-11-posthog-baseline-and-build-vs-buy.md
  - ../../../research/telemetry-and-understanding/2026-07-11-sentry-integration-disposition-ledger.md
last_updated: 2026-07-11
todos:
  - id: s0-ground-current-state
    content: "STAGE 0: re-derive current code, package, branch, Sentry, PostHog, logger, event, environment, and plan state; produce a source-cited ground-truth ledger and replace stale emission percentages with executable evidence."
    status: pending
    depends_on: []
  - id: s0-authority-and-disposition
    content: "STAGE 0: ratify TAU as controlling authority; verify and disposition every live observability/Sentry/monitoring/analytics plan; explicitly supersede warehouse-before-PostHog; create archive/split/update worklist without losing evidence."
    status: pending
    depends_on: [s0-ground-current-state]
  - id: s0-privacy-and-project-gates
    content: "STAGE 0: verify PostHog project region/token/settings; record processor/DPIA/privacy-notice/DSAR/deletion/DPO gaps; encode off/anonymous/identified modes with identified production hard-gated."
    status: pending
    depends_on: [s0-ground-current-state]
  - id: s1-question-register
    content: "STAGE 1: author the checked-in TAU question register with question ID, strategic link, decision owner, event/signal needs, interpretation limits, review cadence, and action/re-measure contract."
    status: pending
    depends_on: [s0-authority-and-disposition]
  - id: s1-events-workspace
    content: "STAGE 1: implement @oaknational/observability-events with common envelope and eight Stage-1 schemas: tool_invoked, dependency_call, search_query, feedback_submitted, auth_failure, rate_limit_triggered, widget_session_outcome, a11y_preference_tag."
    status: pending
    depends_on: [s1-question-register]
  - id: s1-privacy-conformance
    content: "STAGE 1: add closed field allowlists, prohibited-field fixtures, schema examples, event catalogue, schema versioning/deprecation rules, and consuming-workspace conformance helpers."
    status: pending
    depends_on: [s1-events-workspace, s0-privacy-and-project-gates]
  - id: s2-semantic-event-port
    content: "STAGE 2: add a provider-neutral semantic-event delivery port and registry that is distinct from exception/message sinks; preserve stdout/fixture delivery and composition-root-only vendor wiring."
    status: pending
    depends_on: [s1-privacy-conformance]
  - id: s2-posthog-adapter
    content: "STAGE 2: implement @oaknational/posthog-node around posthog-node with validated event projection, identity modes, bounded lifecycle, delivery-failure logging, final allowlist, and network-free fixture."
    status: pending
    depends_on: [s2-semantic-event-port, s0-privacy-and-project-gates]
  - id: s2-posthog-mcp-probe
    content: "STAGE 2: run a pinned preview-only @posthog/mcp build-vs-buy probe with context/conversation/missing-capability/exception capture disabled and final-wire stripping; decide supplementary adoption, pattern reuse, or rejection."
    status: pending
    depends_on: [s2-posthog-adapter]
  - id: s2-sink-decoupling
    content: "STAGE 2: absorb the observability-sinks-decoupling plan slice required for real telemetry with Sentry off: orthogonal sink/fixture axes, standalone OTel provider where required, transitional migration, and enum reconciliation."
    status: pending
    depends_on: [s2-semantic-event-port]
  - id: s2-vendor-independence
    content: "STAGE 2: land no-vendor-observability-import allowlist enforcement plus event-emission persistence tests for stdout/fixture/Sentry/PostHog configurations."
    status: pending
    depends_on: [s2-posthog-adapter, s2-sink-decoupling]
  - id: s2-vercel-delivery-proof
    content: "STAGE 2: execute a 100-event controlled Vercel preview probe across warm/cold/success/error/timeout paths; reconcile event IDs, latency, duplicates, prohibited fields, and failure isolation."
    status: pending
    depends_on: [s2-posthog-adapter, s2-vendor-independence]
  - id: s3-tool-invoked
    content: "STAGE 3: emit exactly one schema-conformant tool_invoked event at the terminal tool-handler seam for every outcome, with categorical metadata only and Sentry correlation."
    status: pending
    depends_on: [s2-vercel-delivery-proof]
  - id: s3-dependency-call
    content: "STAGE 3: thread the AnalyticsEnvelope and emit one dependency_call per Oak API/Elasticsearch attempt, including retries and final-attempt marker, without identity reaching those upstream processors."
    status: pending
    depends_on: [s3-tool-invoked]
  - id: s3-vertical-slice-evidence
    content: "STAGE 3: prove the question-to-event-to-PostHog-to-decision vertical slice in fixture, preview, and approved production mode; reconcile counts against controlled logs and Sentry traces."
    status: pending
    depends_on: [s3-tool-invoked, s3-dependency-call]
  - id: s4-question-surfaces
    content: "STAGE 4: create TAU ingestion-quality, adoption, tool/outcome/path, dependency/reliability, host/client, and release-correlation insights/dashboards; every asset cites a registered question and owner."
    status: pending
    depends_on: [s3-vertical-slice-evidence]
  - id: s4-definitions-probe
    content: "STAGE 4: test @posthog/definitions apply/verify/rollback in the empty project; adopt as code authority only if deterministic and reviewable, otherwise retain a checked-in expected-state manifest and read-only verifier."
    status: pending
    depends_on: [s4-question-surfaces]
  - id: s4-understanding-review
    content: "STAGE 4: run the first product/data/engineering understanding review, record an evidence-backed decision or explicit no-change finding, and schedule outcome re-measurement."
    status: pending
    depends_on: [s4-question-surfaces]
  - id: s5-sentry-ground-truth
    content: "STAGE 5: re-verify the live Sentry project and current main implementation: releases, source maps, traces, errors, logs, identity, redaction, integrations, alerts, and replaced mechanisms."
    status: pending
    depends_on: [s3-vertical-slice-evidence]
  - id: s5-sentry-distinct-value
    content: "STAGE 5: complete only distinct engineering-observability work (selected free integrations, context, release/source-map closure, engineering health metrics/alerts) and link it to TAU events by correlation."
    status: pending
    depends_on: [s5-sentry-ground-truth]
  - id: s5-sentry-corpus-close
    content: "STAGE 5: absorb product lanes into TAU, decompose trigger-bound work, consolidate release authorities, conserve evidence, and retire/supersede the oversized Sentry umbrella as live execution authority."
    status: pending
    depends_on: [s5-sentry-distinct-value, s0-authority-and-disposition]
  - id: s6-signal-class-and-logs
    content: "STAGE 6: formalise event/log/trace/metric/error/alert/feedback classes and run the PostHog OTLP Logs value-cost-privacy probe; do not wholesale duplicate logs without a surviving question."
    status: pending
    depends_on: [s4-understanding-review, s5-sentry-ground-truth]
  - id: s6-monitoring-alerts
    content: "STAGE 6: derive SLOs and alerts from observed distributions; each alert requires owner, condition, dedupe, runbook, cost/cardinality control, and explicit action."
    status: pending
    depends_on: [s6-signal-class-and-logs]
  - id: s7-wider-events
    content: "STAGE 7: deliver focused child lanes for search_query, auth_failure, rate_limit_triggered, feedback_submitted, widget_session_outcome, and a11y_preference_tag using the proven TAU pattern."
    status: pending
    depends_on: [s4-understanding-review]
  - id: s8-feedback-flags-experiments
    content: "STAGE 8: when a real surface/hypothesis exists, deliver qualitative feedback, provider-neutral flag evaluation, PostHog/Sentry projections, survey compatibility, and experiment governance."
    status: pending
    depends_on: [s7-wider-events]
  - id: s9-warehouse-trigger
    content: "STAGE 9: on a recorded durable cross-source question, select and implement a warehouse/export projection with retention, backfill, identity-minimisation, and reconciliation; never as a retroactive PostHog prerequisite."
    status: pending
    depends_on: [s4-understanding-review]
  - id: s10-governance-and-close
    content: "STAGE 10: establish project/event definition verification, ingestion warnings, cost/retention budgets, deletion drills, recurring question reviews, ADR/runbook propagation, fresh emission inventory, and plan-corpus consolidation."
    status: pending
    depends_on: [s4-understanding-review, s5-sentry-corpus-close]
---

# TAU — Telemetry and Understanding System delivery plan

## Status

**Lifecycle:** `current/` — NEXT, executable and queued; no implementation has
started under this plan.

**Decision completeness:**

- Stages 0–4 are decision-complete as tasks and may execute after promotion.
- Stage 5 is decision-complete in disposition and must re-derive Sentry facts
  before code changes.
- Stages 6–10 are trigger/evidence-gated. Their outcomes and acceptance are
  defined, but detailed mechanisms must be finalised from observed data.

## Owner direction embodied

This plan records the 2026-07-11 priority change:

- PostHog moves to the next priority.
- The old warehouse-before-PostHog blocker is superseded.
- Sentry is reviewed and integrated, not abandoned or blindly completed.
- logging, observability, monitoring, and analysis are treated as one intent
  system.
- the system is planned around impact and outcomes.
- research and plan artefacts land first for review.

## End goal, mechanism, means

### End goal

Oak can turn evidence about MCP use and operation into proportionate product
and engineering decisions, while protecting users and retaining the ability
to change vendors.

A new contributor can answer, from one navigable chain:

1. why a signal exists;
2. where it is emitted;
3. what it contains and excludes;
4. which destinations receive it;
5. which question or control consumes it;
6. who reviews it;
7. what decision it caused;
8. whether the decision improved the outcome.

### Mechanism

TAU closes this loop:

```text
registered question
  -> typed Oak signal
  -> allowlist/redaction/identity projection
  -> adapter fan-out
  -> reproducible analysis surface
  -> scheduled review
  -> decision
  -> change
  -> re-measurement
```

### Means

The frontmatter stages and the detailed execution sections below.

## Outcome-level acceptance

The programme is accepted when:

1. **Usefulness**
   - product, data/research, and engineering reviewers can answer the agreed
     first-order questions without bespoke data extraction;
   - at least one evidence-backed decision or explicit no-change finding is
     recorded and re-measured.

2. **Semantic integrity**
   - eight Stage-1 events are code-enforced;
   - every event maps to a question/control;
   - every field is allowlisted and versioned.

3. **Privacy**
   - no raw arguments, results, search text, prompts, curriculum content,
     headers, credentials, tokens, or unapproved person properties reach
     PostHog;
   - identified production capture cannot enable before the hard privacy gate;
   - deletion/DSAR behaviour is tested.

4. **Delivery**
   - 100/100 controlled preview events are reconcilable by ID;
   - external sink failure never fails a user request;
   - stdout/fixture information persists with all vendors disabled;
   - PostHog can be removed without changing emission sites.

5. **Engineering diagnosis**
   - Sentry release/source-map/error/trace capability is current and
     evidence-backed;
   - TAU product events link to engineering evidence without duplicate semantic
     ownership.

6. **Governance**
   - dashboards and saved queries cite question IDs and owners;
   - project definitions or an expected-state manifest are checked in;
   - ingestion, cost, retention, and schema drift are reviewed;
   - old plan authorities are updated, archived, or superseded.

## Non-goals

- Proving teacher impact from telemetry alone.
- Capturing conversations, prompts, tool arguments, results, or curriculum
  content.
- Inventing an MCP host conversation/session ID.
- Replacing Sentry merely to reduce vendor count.
- Making PostHog the semantic source of truth.
- Making a warehouse a prerequisite.
- Enabling every PostHog product.
- Shipping a single mega-PR that implements all stages.
- Rebuilding `@oaknational/logger`.
- Adding alerts before distributions and response ownership exist.
- Adding experiments before a product hypothesis exists.

## Current-state baseline

### PostHog

The new `Oak Open Curriculum Ecosystem` project is empty for Oak-authored
data and configuration. It contains only vendor starter assets and the
internal/test cohort filter.

### Runtime

The HTTP MCP runtime:

- creates a fresh MCP server and transport per HTTP request;
- has a per-request correlation ID;
- sets Sentry method/tool/user context;
- emits manual Sentry/OTel spans;
- measures response/tool-result size;
- closes server/transport asynchronously;
- does not emit the Stage-1 semantic product events;
- does not own a PostHog lifecycle.

### Sentry

The mature parts are real but the plan state is stale. The target keeps:

- engineering errors/traces;
- release/source maps;
- redaction;
- fingerprints/noise controls;
- correlation;
- selected health instrumentation.

### Logger

`@oaknational/logger` is the vendor-independent structured-log floor. TAU
adds no direct PostHog calls to it during the first vertical slice.

## TAU conceptual model

### Axis of meaning

- engineering;
- product;
- usability;
- accessibility;
- security.

### Layer of realisation

- question;
- contract;
- emission;
- delivery;
- storage;
- analysis;
- monitoring;
- decision;
- re-measurement.

Every planned item must name both an axis and a layer.

## Question register contract

Proposed checked-in file:

```text
docs/telemetry-and-understanding/question-register.yaml
```

Each question:

```yaml
id: TAU-Q001
statement: "Which MCP tools are used and with what outcome?"
strategic_choice: APP-1
decision_owner: product
consumers:
  - product-review
signals:
  - tool_invoked
analysis_surfaces:
  - tau-tool-outcomes
interpretation_limits:
  - "Usage does not prove usefulness or teacher identity."
review_cadence: monthly
action_contract: "Record portfolio/documentation/UX decision or no-change."
remeasure_after: "next monthly review or four weeks after change"
status: active
```

Rules:

- IDs are stable and additive.
- A dashboard may serve multiple questions; a question may use multiple
  surfaces.
- An event without a question must be justified by a mandatory engineering,
  security, compliance, or accessibility control.
- Questions can be retired, but their decision history remains.

## Stage-1 event catalogue

### Common envelope

Every semantic event includes:

| Field | Purpose |
|---|---|
| `event_id` | Unique delivery/reconciliation ID |
| `event_name` | Closed event discriminator |
| `schema_version` | Contract evolution |
| `occurred_at` | UTC event time |
| `service_name` | Emitting service |
| `runtime` | HTTP MCP, Search CLI, widget, etc. |
| `environment` | local/preview/production |
| `release` | build/release identity |
| `correlation_id` | Within-invocation join |
| `traceparent` | Optional cross-system join |
| `trace_id` | Optional engineering drill-down |
| `identity_kind` | anonymous/identified/system |
| `actor_category` | approved categorical class, not an identifier |
| `properties` | event-specific validated object |

The PostHog adapter separately chooses `distinct_id`; it is not a generic
event field exported to every sink.

### `tool_invoked`

Required categorical/numeric properties:

- `tool_name`;
- `outcome`;
- `duration_ms`;
- `is_error`;
- `client_name`/`client_version` where available and approved;
- `auth_kind`;
- `argument_shape` as approved categories/counts only;
- curriculum/search categories supplied by the executing tool without raw
  values where policy permits;
- response-size/token-estimate categories, not content.

Emit at terminal completion, including handled error outcomes.

### `dependency_call`

- `dependency`: `oak_api`, `elasticsearch`, future closed additions;
- `operation`;
- `outcome`;
- `duration_ms`;
- `http_status_class` and optionally approved exact status;
- `attempt`;
- `is_final_attempt`;
- `timeout`;
- no URL query, payload, response body, Clerk ID, or API key.

One event per attempt, enabling retry/fan-out analysis.

### Remaining Stage-1 events

- `search_query`;
- `feedback_submitted`;
- `auth_failure`;
- `rate_limit_triggered`;
- `widget_session_outcome`;
- `a11y_preference_tag`.

Their detailed domain plans are reused but must adopt the common envelope,
question register, field allowlist, and PostHog/Sentry responsibility
boundary.

## Identity model

### Identified person

PostHog `distinct_id` may be the opaque Clerk user ID after the privacy gate.

Permitted initial person properties: none unless separately approved.

Sentry continues to receive the same opaque user ID for engineering
correlation. An acceptance test prevents regression.

### Anonymous use

Anonymous events must:

- avoid person profile creation;
- use a stable-enough key only where justified and privacy-approved;
- not imply teacher identity;
- avoid unsafe fingerprinting.

The adapter may use PostHog’s person-profile suppression.

### System/test use

Synthetic, CI, smoke, and internal/test traffic is marked with explicit
environment/test properties and excluded through the existing cohort/filter
where appropriate.

### No host conversation ID

Do not use request correlation, Clerk identity, or a PostHog-generated session
as a claimed host conversation ID.

PostHog `$session_id` is only enabled if the source semantics are documented
and accepted. Query-time windows can analyse sequences without an emitted
conversation claim.

## Privacy policy as code

For each event/projection:

- closed Zod object;
- `.strict()` or equivalent unknown-key rejection;
- property allowlist;
- prohibited-field fixtures;
- generated JSON Schema/catalogue;
- adapter final-wire allowlist;
- negative tests for keys and nested data;
- fixture payload inspection;
- controlled raw-event inspection in PostHog;
- deletion classification;
- retention classification.

The `@posthog/mcp` automatic sanitizer is defence-in-depth, not the Oak
privacy boundary.

## Provider-neutral event delivery

The existing `ObservabilitySink` exception/message surface is too narrow to
be the sole semantic-event port.

Add a distinct interface, for example:

```ts
interface SemanticEventSink {
  readonly kind: SemanticEventSinkKind;
  capture(event: ObservabilityEvent): void;
  flush(timeoutMs: number): Promise<boolean>;
}
```

Requirements:

- event is validated before capture;
- sink adapters cannot mutate caller-owned values;
- fan-out failure is isolated and observable;
- stdout/fixture sink available;
- no adapter decides event meaning;
- Sentry may receive a selective event/metric projection;
- PostHog receives the product-understanding projection;
- future warehouse receives its own minimised projection.

Final names are chosen during RED/GREEN design, not fixed by this example.

## PostHog adapter design

### Package

`@oaknational/posthog-node` under `packages/libs/posthog-node/`.

### Configuration

- token;
- verified EU/US host;
- capture mode;
- batching/flush configuration;
- native MCP projection mode;
- request timeout;
- delivery error callback;
- feature flags disabled unless Stage 8 opens.

### Capture

- accepts only `ObservabilityEvent`;
- maps event name and flat properties;
- adds release/environment/schema metadata;
- sets person-profile processing;
- final field allowlist;
- never throws into feature flow;
- records delivery failures without recursive PostHog capture.

### Lifecycle

The composition root owns one client/lifecycle per runtime model.

The Vercel experiment decides:

- singleton reuse vs per-invocation handle;
- `flush` vs `shutdown`;
- `flushAt`/`flushInterval`;
- cold/warm behaviour;
- response-completion hook;
- timeout and failure reporting.

No lifecycle mechanism is accepted from documentation alone.

## `@posthog/mcp` probe

### Why probe

It may buy:

- tool/resource/prompt instrumentation;
- intent capture;
- missing-capability reporting;
- purpose-built MCP views.

### Why not adopt by default

- beta event contract;
- payload capture;
- schema mutation;
- fresh-server-per-request topology;
- duplicate semantic events;
- possible identity/session mismatch;
- duplicate exception capture.

### Probe variants

A. Oak canonical events only; no `@posthog/mcp`.

B. Vendor-native supplementary projection, stripped and disabled by default.

C. Vendor-native events transformed at adapter boundary into Oak questions.

D. Selected source/pattern reuse without runtime dependency.

### Acceptance

The selected variant must pass:

- tool-list schema diff equals zero unless separately owner-approved;
- final raw event has no parameters/response;
- one semantic occurrence has one canonical Oak event;
- no `$exception` duplicate;
- stable package pin;
- upgrade contract test;
- no feature-code imports;
- server-per-request and Vercel lifecycle proof.

## Stage execution detail

## Stage 0 — Authority and evidence reset

### RED / evidence

Create failing or contradiction-detecting checks where practical:

- plan/index assertions for authority links;
- grep/AST inventory of Sentry/PostHog/vendor imports;
- executable emission inventory test scaffold;
- environment-key inventory;
- current package/API capability register;
- live-project snapshots.

### GREEN / decisions

- add TAU transition notices to inherited indices;
- amend/schedule ADR changes for PostHog-first;
- verify every Sentry lane;
- record archive/split worklist;
- close identity-policy comments that contradict the May decision;
- record exact privacy blockers and owners.

### Acceptance

- one current-state ledger;
- one plan owner per surviving lane;
- no old plan is treated as current merely because its directory says so;
- every external project assumption dated and sourced.

### Review

- architecture;
- product;
- data/research;
- privacy/security;
- Sentry;
- PostHog.

## Stage 1 — Questions and semantic contracts

### Cycle 1: question register

Author representative questions first. Review for decisions and harms before
writing schemas.

### Cycle 2: common envelope

RED tests for required fields, strictness, timestamp/version/correlation, and
identity separation.

### Cycles 3–10: eight events

One test+schema green commit per event. `dependency_call` is included in
Stage 1 from the start.

### Cycle 11: catalogue and conformance

- derived/reference event catalogue;
- consuming test helper;
- property classification;
- deprecation/version policy.

### Acceptance

- every event has valid and invalid fixtures;
- extra keys rejected;
- nested prohibited values rejected;
- examples survive JSON Schema conversion;
- question/control traceability complete.

## Stage 2 — Delivery substrate

### Cycle 1: semantic event fixture/stdout

Start network-free. Prove event production independent of any vendor.

### Cycle 2: PostHog adapter fixture

Project validated events to captured PostHog payloads and assert exact wire
shape.

### Cycle 3: environment and capture modes

Parse off/anonymous/identified with production privacy gate.

### Cycle 4: axes and OTel decoupling

Absorb only the required sink-decoupling work. Keep structural and cosmetic
changes in separate green cycles.

### Cycle 5: vendor import lint

Allowlist adapter and explicit composition roots. Add PostHog RuleTester
cases in the same change.

### Cycle 6: native MCP probe

Run all variants and write a decision record.

### Cycle 7: live preview delivery

100 controlled events, raw inspection, outage test, warm/cold test.

### Acceptance

See roadmap Stage 2. Any delivery loss or privacy failure keeps PostHog out of
production but does not block schema/stdout progress.

## Stage 3 — First vertical slice

### Tool completion seam

Use the existing registered-tool handler/executor boundary, not request-body
parsing as the semantic source.

Event outcome is built after auth interception and tool execution so expected
failures are represented without raising duplicate exceptions.

### Dependency seam

Instrument the shared Oak API and Elasticsearch request executors. Retries
emit attempts with common correlation.

### Identity/correlation

Resolve identity once per request and supply an `AnalyticsEnvelope` to tool
and dependency emitters. Do not pass Clerk ID to upstream clients.

### Controlled verification

For a fixed scenario set:

- expected tool calls;
- expected dependency attempts;
- expected outcomes;
- expected Sentry traces;
- expected stdout/fixture events;
- expected PostHog events.

Reconcile all by IDs.

### Production rollout

1. preview synthetic;
2. preview authenticated/internal;
3. production anonymous if approved;
4. production identified only after hard gate;
5. monitor ingestion warnings and cost;
6. rollback switch rehearsed.

## Stage 4 — Understanding surfaces

### Asset naming

```text
TAU — Data quality
TAU — Adoption and return use
TAU — Tool use and outcomes
TAU — Dependency reliability
TAU — Host and release comparison
```

Insight names begin with question ID:

```text
TAU-Q002 — Tool calls by outcome and tool
```

### Initial surfaces

1. event receipt and schema version;
2. expected-vs-received controlled probe;
3. unique identified/anonymous use over time;
4. new vs returning identified users, with limits;
5. tool mix and outcome;
6. duration percentiles;
7. dependency calls per tool invocation;
8. dependency errors/retries/timeouts;
9. host/client breakdown;
10. release/environment comparison;
11. correlation drill-down to Sentry;
12. data-quality and unknown-category checks.

### Definitions-as-code decision

Spike:

- export/create one dashboard, one insight, one cohort, one event definition;
- apply to the empty project;
- no-op re-apply;
- modify through PR;
- rollback;
- verify drift;
- inspect credential and CI requirements.

Adopt only if the workflow survives without hidden destructive behaviour.

### First review

Participants:

- product owner;
- data/research;
- engineer;
- privacy/security as needed.

Output:

```yaml
question_id: TAU-Q...
evidence:
  - posthog_insight: ...
limits:
  - ...
decision: ...
owner: ...
date: ...
remeasure: ...
```

## Stage 5 — Sentry reconciliation

Use the sibling research ledger as the starting register.

### Ground truth before changes

- inspect main code;
- inspect current package docs/APIs;
- query live project;
- run controlled source-map/release/error/trace probes;
- reconcile plan todos.

### Complete distinct value

Candidate work, subject to re-verification:

- selected runtime/error integrations;
- Sentry scope projection of the TAU envelope;
- release/source-map closure;
- engineering health metrics;
- alerts after distributions;
- Search CLI engineering parity where owned by its plan.

### Move/retire

- product events from Sentry metrics to TAU events;
- feedback to TAU;
- flags to Stage 8;
- product dashboards to PostHog;
- broad strategy close to TAU/ADRs;
- triggered maturity work to focused future plans.

### Corpus close

No archive until inbound links, durable decisions, and evidence are conserved.

## Stage 6 — Logs, monitoring, alerts

### Signal-class register

Add a code- or schema-governed registry defining:

- event;
- log;
- span;
- metric;
- error;
- alert;
- feedback;
- experiment exposure.

Each new signal declares its class.

### PostHog Logs probe

Compare:

- stdout/Vercel logs;
- Sentry logs;
- PostHog OTLP Logs;
- no external log destination.

Use real investigation scenarios, not feature lists.

### Monitoring

Define service-level indicators from stable signals. Candidate dimensions:

- request/tool availability;
- error rate;
- dependency success/latency;
- event-delivery health;
- release regressions;
- privacy/data-quality violations.

Targets and alerts wait for traffic and owner risk tolerance.

## Stage 7 — Wider events and runtimes

Each child lane repeats:

```text
question -> schema -> fixture -> emitter -> adapter -> dashboard/query
         -> review -> decision -> remeasure
```

Security events use strict categorical allowlists and rate caps. Widget/a11y
work requires host compatibility. Search events coordinate with semantic
search rather than duplicate retrieval-quality ownership.

## Stage 8 — Feedback, flags, and experiments

Open only on a real surface or hypothesis.

- feedback taxonomy;
- response/service loop;
- accessible host-compatible collection;
- provider-neutral flag port;
- PostHog `evaluateFlags()` or selected provider;
- Sentry crash-linked flag context;
- exposure schema;
- experiment pre-registration and guardrails;
- decision/readout template;
- kill switch.

## Stage 9 — Warehouse/export

A question must name:

- requester;
- SQL/join/retention need;
- why PostHog plus export cannot answer proportionately;
- identity policy;
- owner and cost.

Only then select and implement the warehouse projection.

## Stage 10 — Governance

### Recurring checks

- event-definition verification;
- unknown event/property report;
- ingestion warnings;
- schema-version distribution;
- delivery completeness probes;
- cost/volume/retention;
- person/profile growth;
- privacy and deletion drill;
- dashboard/question orphan report;
- stale question review;
- evidence-to-decision count.

### Corpus close

- amend ADRs;
- update app/library/runbooks;
- generate fresh emission inventory;
- archive/supersede old plans;
- record rejected experiments;
- keep historical evidence reachable.

## Quality gates

Per implementation PR:

```bash
pnpm format:root
pnpm markdownlint:root
pnpm build
pnpm type-check
pnpm lint
pnpm test
pnpm depcruise
pnpm knip
pnpm constraints
pnpm cycles
pnpm check
```

Use the repo’s current canonical gate command/ordering at execution time; this
list is re-derived before the first implementation commit.

Additional TAU gates:

- event schema tests;
- prohibited-field tests;
- adapter exact-payload tests;
- no-vendor-import rule;
- emission-persistence tests;
- controlled live reconciliation;
- dashboard/question reference verification;
- deletion drill where identity is enabled.

## Reviewer matrix

| Stage | Required review |
|---|---|
| 0 | architecture, plans/corpus, product, privacy, Sentry, PostHog |
| 1 | schema/type, product, data/research, security/privacy, accessibility |
| 2 | architecture, PostHog, OTel, Vercel, security, test |
| 3 | MCP, auth/Clerk, PostHog, Sentry, search, test |
| 4 | product, data/research, analytics, accessibility |
| 5 | Sentry, architecture, operations, docs/ADR |
| 6 | SRE/operations, logging/OTel, security, cost |
| 7 | owning domain experts per event/runtime |
| 8 | product/research, experimentation, privacy, accessibility |
| 9 | data platform, privacy, architecture, cost |
| 10 | docs/ADR, plans/corpus, operations, privacy |

Reviews use non-leading prompts and disposition every finding.

## Risks

| Risk | Mitigation / falsifier |
|---|---|
| TAU becomes another mega-plan | Stage PRs are thin vertical or focused substrate slices; later stages do not open early. |
| PostHog-first becomes vendor-first | Oak question/event contracts land first; feature code sees no PostHog type. |
| `@posthog/mcp` leaks raw data | Final-wire negative tests and raw preview inspection; reject package if the contract cannot be proven. |
| Duplicate tool/error events | One canonical event rule; native projection explicitly off by default; exception autocapture off. |
| Serverless event loss | 100-event warm/cold reconciliation and bounded lifecycle before production. |
| Identity/privacy delay blocks all value | Anonymous/fixture/preview modes progress; identified production remains gated. |
| Analytics overclaims impact | Every question carries interpretation limits; K1 joins telemetry with research/evals. |
| Dashboard sprawl | Question IDs, owners, expected-state verification, recurring orphan report. |
| Cost/cardinality growth | closed categories, volume budgets, test traffic filters, staged logs, review. |
| Sentry regression | preserved engineering acceptance and controlled error/trace/release probes. |
| Corpus contradictions recur | Stage-close consolidation and generated current-state inventory. |
| Warehouse need arrives later | adapter architecture and event versions preserved; Stage 9 trigger is explicit. |

## PR decomposition

Recommended implementation sequence:

1. PR: Stage 0 authority/current-state amendments.
2. PR: event workspace envelope + first event cycles.
3. PR: remaining Stage-1 events/catalogue/conformance.
4. PR: semantic-event ports, fixtures, and sink decoupling.
5. PR: PostHog adapter and environment modes.
6. PR: `@posthog/mcp` probe decision and Vercel delivery proof.
7. PR: `tool_invoked` vertical slice.
8. PR: `dependency_call` vertical slice.
9. PR: PostHog analysis surfaces/definitions decision.
10. PR(s): Sentry reconciliation by focused lane.

Do not merge a stage PR without its documentation, specialist review,
deterministic evidence, and explicit decision/next gate.

## Stage-close evidence template

```md
### Attempt

What was run or changed.

### Observed outcome

Raw result, including failure and missing evidence.

### Proven result

What the evidence establishes and what it does not.

### Understanding

Which registered question was answered.

### Decision

Action, owner, and rationale—or explicit no-change.

### Re-measure

Date/condition for checking the outcome.

### Corpus disposition

Which prior plan/doc authority was updated, superseded, or retained.
```

## References

Start at:

- [TAU research index](../../../research/telemetry-and-understanding/README.md)
- [TAU roadmap](../roadmap.md)
- [May identity/event exploration](../../../../docs/explorations/2026-05-26-mcp-analytics-identity-and-event-emission.md)
- [Observability collection](../../observability/README.md)
- [Strategy APP-1](../../../../docs/strategy/stream-mcp-app.md)
