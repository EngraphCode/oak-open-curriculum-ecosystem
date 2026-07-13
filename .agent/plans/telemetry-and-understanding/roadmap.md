---
title: "TAU roadmap"
type: strategic-index
status: active
last_updated: 2026-07-13
serves_strategic_choice: APP-1
current_plan: "current/tau-delivery.plan.md"
---

# TAU roadmap

## End state

Oak has one coherent understanding system in which:

- product and operational questions are registered before collection;
- runtime events have typed, versioned, privacy-reviewed contracts;
- PostHog provides the first product-understanding surface;
- Sentry provides specialist engineering diagnosis;
- logs, traces, metrics, errors, events, alerts, and feedback have distinct
  roles;
- external delivery is adapter-based and removable;
- analysis surfaces are reproducible and tied to decisions;
- privacy, deletion, retention, cost, and data-quality controls are exercised;
- evidence changes priorities and is re-measured.

## Stage map

| Stage | Name | Outcome | Opens when |
|---|---|---|---|
| 0 | Authority and evidence reset | One truthful current-state and disposition map | Plan promoted |
| 1 | Questions and semantic contracts | Eight Stage-1 events and common envelope are code-enforced | Stage 0 contradictions closed |
| 2 | Delivery substrate and PostHog adapter | Provider-neutral event fan-out and proven Vercel delivery | Stage 1 schemas green |
| 3 | First value-bearing vertical slice | `tool_invoked` + `dependency_call` answer initial questions in PostHog | Privacy-safe preview adapter green |
| 4 | Analysis and sensemaking surfaces | Named questions have reproducible analysis, interpretation records, owners, and review cadence | Real/synthetic event quality proven |
| 5 | Sentry reconciliation | Sentry work is completed, absorbed, deferred, or retired by distinct value | Stage 3 correlations established |
| 6 | Logs, monitoring, and alerts | Signal classes, destinations, SLOs, and runbooks are proportionate | Enough distributions and incidents exist |
| 7 | Wider axes and runtimes | Search, security, feedback, widget, accessibility, and other runtimes join TAU | Stage 1–4 pattern proven |
| 8 | Qualitative learning and experimentation | Feedback, flags, surveys, and experiments are governed | Real product hypothesis or feedback surface exists |
| 9 | Durable export and warehouse | Cross-source/durable analysis is implemented only for a named need | Recorded question cannot be met proportionately in PostHog |
| 10 | Governance and corpus close | Event/project definitions, costs, deletion, decision logs, and plan estate remain truthful | Every declared lane complete or explicitly dispositioned as not promoted |

## Critical path

```text
Stage 0
  -> Stage 1
  -> Stage 2
  -> Stage 3
  -> Stage 4
```

Stages 5 and 6 may begin after Stage 3, but neither may delay the first
understanding loop. Stages 7–9 open only on their named triggers.

## Stage outcomes and gates

### Stage 0 — Authority and evidence reset

Deliver:

- current code/live-project inventory;
- question and plan authority map;
- Sentry lane disposition ledger re-verified against main;
- old warehouse-first direction explicitly superseded;
- privacy/data-region/processor/deletion gap register;
- generated or test-backed “what emits today” baseline.

Gate:

- no live index or ADR makes a contradictory sequencing/status claim;
- every inherited plan has one owner/disposition;
- no implementation task relies on an unverified old branch.

### Stage 1 — Questions and semantic contracts

Deliver:

- question register;
- `@oaknational/observability-events`;
- eight Stage-1 event schemas;
- common event, correlation, identity, environment, release, and schema
  envelopes;
- field allowlists and negative privacy fixtures;
- event catalogue and conformance helper.

Gate:

- all schemas and fixtures green;
- no vendor fields;
- no raw content;
- product/data/security/accessibility review completed;
- each event maps to at least one question or mandatory control.

### Stage 2 — Delivery substrate and PostHog adapter

Deliver:

- sink-independent semantic event port;
- `@oaknational/posthog-node`;
- sink-axis migration slice required by PostHog;
- network-free fixtures;
- no-vendor-import lint;
- emission-persistence test;
- pinned `@posthog/mcp` probe;
- Vercel lifecycle and delivery proof.

Gate:

- 100/100 controlled preview events queryable by ID;
- request success independent of PostHog availability;
- no prohibited field on wire;
- no duplicate semantic event;
- PostHog can be disabled without emission-site changes.

### Stage 3 — First value-bearing vertical slice

Deliver:

- one `tool_invoked` per tool completion;
- one `dependency_call` per Oak API/Elasticsearch attempt;
- common envelope and identity projection;
- Sentry correlation;
- synthetic and preview proof;
- anonymous production option;
- identified production remains privacy-gated.

Gate:

- Q2, Q4, and Q5 have queryable evidence;
- Q1 can report identified people and anonymous activity only; it must not
  claim anonymous-person cardinality without a privacy-approved stable
  anonymous identity;
- Q3 is limited to tool composition within one Oak invocation identified by
  `correlation_id`; it must not claim cross-invocation or host-conversation
  composition;
- event completeness reconciles against controlled calls/logs;
- expected and error paths covered;
- product owner, engineer, and data/research reviewer accept usefulness.

### Stage 4 — Analysis and sensemaking surfaces

Deliver:

- question register as a checked-in artefact;
- TAU ingestion/data-quality dashboard;
- adoption and repeat-use dashboard;
- tool/outcome/path dashboard;
- dependency/reliability dashboard;
- saved HogQL queries;
- definitions-as-code spike and decision;
- recurring evidence review and decision-log template that separates
  observations, interpretations, hypotheses, counterevidence, confidence, and
  judgement.

Gate:

- every surface cites question ID and owner;
- reviewers can answer questions without bespoke engineering;
- reviews record plausible alternative explanations and what evidence would
  change the interpretation;
- at least one decision or explicit no-change finding is recorded;
- default starter assets are clearly separated from Oak authority.

### Stage 5 — Sentry reconciliation

Deliver:

- live Sentry/code ground truth;
- selected engineering lanes completed;
- product lanes moved to TAU;
- release/source-map proof;
- duplicate plan authorities removed;
- umbrella plan split/archived with conserved evidence.

Gate:

- Sentry answers distinct engineering questions;
- no product event depends on Sentry;
- no duplicate exception/event path without written purpose;
- all surviving deferred lanes have triggers.

### Stage 6 — Logs, monitoring, and alerts

Deliver:

- signal-class registry;
- PostHog Logs/OTLP empirical decision;
- health/SLO measures after real distributions;
- alert inventory, owner, threshold, runbook, and dedupe policy;
- cost/cardinality/retention budgets.

Gate:

- no “alert because available” rule;
- each alert is actionable;
- logs add demonstrated investigation value;
- network export is sampled/bounded and privacy-reviewed.

### Stage 7 — Wider axes and runtimes

Deliver in focused child lanes:

- `search_query`;
- `auth_failure`;
- `rate_limit_triggered`;
- `feedback_submitted`;
- `widget_session_outcome`;
- `a11y_preference_tag`;
- Search CLI, widget, Slack assistants, and later AI tools where applicable.

Gate per child:

- same schema/conformance/question/decision loop as Stage 3;
- runtime-specific privacy and delivery proof;
- no bulk scope expansion.

### Stage 8 — Qualitative learning and experimentation

Trigger:

- real feedback collection surface, feature rollout, or experiment proposal.

Deliver:

- feedback taxonomy and response loop;
- survey/host-compatibility decision;
- provider-neutral flag port;
- PostHog/Sentry flag projections;
- experiment design, exposure event, guardrails, and readout.

### Stage 9 — Durable export and warehouse

Trigger:

- a named cross-source/durable SQL question;
- retention/residency requirement;
- PostHog export limitation;
- data-team-owned use case.

Deliver:

- warehouse selection;
- identity-minimised projection;
- backfill/version strategy;
- quality reconciliation;
- retention/deletion ownership.

Warehouse does not retroactively become a PostHog prerequisite.

### Stage 10 — Governance and corpus close

Deliver:

- completion or explicit not-promoted disposition for every declared lane;
- event/project definitions verification;
- ingestion-warning and schema-drift checks;
- cost and retention review;
- deletion drill;
- quarterly question/decision review;
- ADR and runbook updates;
- archive/supersede old plans;
- fresh emission inventory.

## Stage-review rule

Every stage review answers:

1. What question or risk did this stage serve?
2. What evidence was produced?
3. What can the evidence not establish?
4. Which interpretations or hypotheses were considered, with what confidence?
5. What counterevidence would change the interpretation?
6. What decision was made?
7. What changed as a result?
8. When will the outcome be re-measured?
9. Which old authority was retired or updated?

## Promotion

The executable plan remains in `current/` until implementation begins. Stage
0 is the first active slice; later stage work must not start opportunistically
because an SDK feature is available.
