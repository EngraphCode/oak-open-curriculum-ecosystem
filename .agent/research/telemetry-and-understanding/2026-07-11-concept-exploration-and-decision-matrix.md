---
title: "TAU concept exploration and Decision Matrix"
type: research
status: complete
last_updated: 2026-07-14
method:
  - "Oak reason skill"
  - "Oak metacognition skill"
  - "Resonance Decision Matrix workflow"
---

# TAU concept exploration and Decision Matrix

## Executive finding

Oak should not treat the next step as “add PostHog” or “finish Sentry”.
The next step should be a new outcome-led programme:

> **TAU — a Telemetry and Understanding System in which Oak-owned event
> contracts feed PostHog first for product understanding, while Sentry remains
> the specialist engineering-observability surface and structured stdout
> remains the vendor-independent floor.**

The programme name describes the intended transformation:

```text
Telemetry -> Analysis -> Interpretation -> Understanding
```

The architecture remains sink-cardinality agnostic. PostHog is first because
it is the fastest route to useful product and user understanding, not because
it becomes the owner of Oak’s telemetry model.

## Decisions already made

This exploration does not reopen these owner decisions:

- PostHog is the next implementation priority.
- The existing Sentry work must be reviewed and integrated into the same plan.
- The logging, observability, monitoring, and analysis intent corpus must be
  reviewed holistically.
- Planning should be organised around impact and outcomes.
- The PostHog project is `Oak Open Curriculum Ecosystem`.
- The resulting work should land as research and a reviewable delivery plan,
  not as immediate production instrumentation.

Earlier repo decisions that remain compatible:

- event shapes are Oak-owned and provider-neutral;
- every external emission passes the ADR-160 redaction boundary;
- structured stdout remains available with every external sink disabled;
- Clerk identity may flow to PostHog and Sentry only, subject to the production
  privacy gate;
- raw tool arguments, raw results, query text, curriculum content, tokens, and
  secrets are not product-analytics fields;
- `correlation_id` is the within-invocation join; `traceparent` is the optional
  cross-system join; Sentry `trace_id` is the engineering drill-down join.

## Step 0 — classify the decision

This is not primarily a vendor-selection decision. It is an
**operating-model and architecture decision** with vendor consequences.

The decision object is:

> What system should govern the journey from runtime activity to evidence,
> interpretation, operational action, product learning, and outcome review?

A vendor-only comparison would hide the load-bearing questions:

- Who owns event meaning?
- Which questions justify collection?
- How does evidence cause a decision?
- What is the privacy boundary?
- Which signals belong in logs, events, traces, metrics, or alerts?
- What remains available when a vendor is removed?
- How does the plan corpus avoid becoming the source of runtime truth?

## Step 1 — empirical gate

### Repository evidence

The current estate has strong foundations:

- OpenTelemetry-shaped JSON logs;
- an Oak-owned logger with immutable fan-out;
- provider-neutral observability types and redaction primitives;
- a Sentry adapter with error, trace, release, source-map, and redaction work;
- per-request correlation IDs;
- a mature Result/error-handling discipline;
- a planned Zod-first event-contract workspace;
- a planned vendor-independence conformance harness.

It also has material gaps:

- the events workspace is not implemented;
- product and usability events are mostly absent;
- the current emission snapshot is stale;
- Sentry remains coupled to parts of span generation and runtime mode;
- the Sentry maximisation plan is too large to be a coherent execution unit;
- multiple plans compete for authority;
- the old warehouse-before-PostHog sequence conflicts with later owner
  direction and the current priority;
- dashboards, alerts, logs, metrics, and events are not consistently tied to
  named questions and actions.

### Live PostHog evidence

The project is a clean baseline:

| Surface | Count or state |
|---|---|
| Events | `0` |
| Oak-authored dashboards | `0` |
| Oak-authored insights | `0` |
| Feature flags | `0` |
| Experiments | `0` |
| Surveys | `0` |
| Warehouse sources | `0` |
| Timezone | `Europe/London` |
| Internal/test filter | Configured through cohort `179127` |

Only PostHog starter assets exist. No migration or compatibility constraint
needs preserving.

### Current first-party capability evidence

Current PostHog documentation adds capabilities that were not load-bearing in
the April repo analysis:

- a beta `@posthog/mcp` SDK;
- a purpose-built MCP Analytics view;
- server-side `posthog-node` event capture and flags;
- OTLP log and trace ingestion;
- error tracking;
- surveys, experiments, paths, funnels, retention, and cohorts;
- an alpha Definitions-as-code package for dashboards, insights, flags,
  cohorts, experiments, and project settings.

These are opportunities, not automatic architecture decisions. Both
`@posthog/mcp` and `@posthog/definitions` are pre-1.0/alpha surfaces and must
pass bounded probes before they become authoritative dependencies.

## Step 2 — REASON lenses

### Altitude

The user-visible outcome is not “events arrive in PostHog”.

The outcome is:

> Oak can determine how the MCP surfaces are used, where people succeed or
> struggle, which dependencies or releases explain failures, and which
> product or operational change should happen next—without collecting
> unnecessary content or coupling feature code to a vendor.

### Gap

Today:

- engineering diagnosis exists in partial form;
- product usage is inferred from traces or not available;
- user success and abandonment are not represented;
- dependency fan-out is not captured as a stable event;
- analysis surfaces are not governed by a question register;
- decisions are not linked back to the evidence that caused them.

### Harm

If the gap persists:

- Oak can ship a technically functioning MCP surface without knowing whether
  it helps teachers;
- product teams will ask questions that the system cannot answer;
- observability work will continue to optimise vendor capability rather than
  user outcomes;
- privacy risk increases through ad hoc payload capture;
- Sentry and PostHog can duplicate events without a declared semantic owner;
- the plan estate will accumulate more contradictory sequencing and status.

### Mechanism

The proposed mechanism is a closed understanding loop:

```text
named question
  -> Oak event or operational signal contract
  -> privacy and identity projection
  -> one or more adapters
  -> reproducible analysis surface
  -> explicit interpretation, alternatives, counterevidence, and confidence
  -> scheduled sensemaking review with a named decision owner
  -> decision or explicit no-change finding
  -> product/operational change
  -> outcome re-measurement
```

### Constraints

- provider-neutral feature code;
- no raw arguments, results, content, or search text in analytics;
- identified production capture blocked by privacy/DPO acceptance;
- Sentry engineering capability must not regress;
- stdout/event-fixture behaviour must remain testable without external
  services;
- Vercel/serverless delivery must be empirically proven;
- no invented host conversation/session identifier;
- no dashboard without a named question and decision owner;
- no initial warehouse dependency.

### Success

TAU is successful when a product owner, engineer, data/research colleague,
security reviewer, and accessibility reviewer can each follow evidence from a
question to a decision, with explicit limits on what the evidence can claim.

## Step 3 — METACOGNITION

### Inherited shape

The inherited shape is “observability” organised around Sentry completion,
with product and user understanding added as sibling plans.

That shape is no longer fit for the current impact goal. It makes engineering
telemetry the centre and treats understanding as downstream.

### Ratification

Some inherited decisions are ratified and should remain:

- redaction;
- provider neutrality;
- stdout floor;
- correlation;
- strategy traceability;
- privacy gating;
- Sentry as an engineering tool.

Other inherited decisions are now superseded:

- warehouse before PostHog as a hard blocker;
- one umbrella Sentry plan as the execution authority;
- vendor-specific metrics as the primary product-event surface;
- alerts and dashboards designed inside a Sentry-maximisation programme.

### Fit to impact

PostHog-first is justified only if the first stages answer real questions.
Shipping an adapter without understanding surfaces would repeat the same
mechanism-first error.

### Structural cure

The cure is a new controlling TAU collection, not another observability
sub-plan. The observability estate becomes an implementation/source inventory
whose lanes are explicitly dispositioned into TAU.

### Bridge

The bridge from current to target state is:

1. freeze new runtime work; inventory and classify current authority first;
2. build the Oak event contract;
3. prove provider-neutral delivery and Vercel lifecycle;
4. deliver one vertical question-to-decision slice in PostHog;
5. reconcile Sentry around distinct engineering value;
6. widen by outcome, not by available vendor feature.

## Step 4 — cross-examination

### Candidate A — continue Sentry, then warehouse, then PostHog

**Claim:** finishing established work reduces churn.

**Cross-examination:**

- It delays product understanding behind engineering breadth and data
  infrastructure.
- It preserves a sequence that current owner direction explicitly changes.
- It does not repair the oversized and contradictory plan estate.
- It treats sunk planning effort as priority evidence.

**Verdict:** reject.

### Candidate B — add `posthog-node` directly at tool handlers

**Claim:** fastest route to events.

**Cross-examination:**

- It bypasses the planned event-contract workspace.
- It risks vendor fields and identity logic in feature code.
- It does not integrate Sentry, logs, monitoring, or corpus authority.
- It creates an easy path to raw payload capture.

**Verdict:** reject.

### Candidate C — TAU: Oak contracts, PostHog-first, Sentry specialist

**Claim:** produces useful understanding early while preserving architecture.

**Cross-examination:**

- It adds programme and adapter structure before first value.
- It still needs privacy, schema, lifecycle, and dashboard discipline.
- It must resist turning “holistic” into a mega-plan with no vertical slice.

**Response:** stage 3 is a thin, question-bearing vertical slice; later stages
do not open until it proves useful.

**Verdict:** select.

### Candidate D — generic OpenTelemetry platform first

**Claim:** maximum neutrality and standardisation.

**Cross-examination:**

- OTel is a transport/semantic foundation, not a product-understanding
  workflow.
- It delays funnels, retention, cohorts, and question-driven surfaces.
- Oak already has an OTel-shaped logging and trace substrate to preserve.

**Verdict:** retain as substrate, reject as next organising priority.

### Candidate E — replace Sentry and log destinations with PostHog

**Claim:** one platform reduces cognitive load.

**Cross-examination:**

- Sentry already provides mature release/source-map/error-trace value.
- A single vendor becomes both semantic owner and delivery dependency.
- Platform consolidation is not system simplification if it erases distinct
  operational responsibilities.
- PostHog MCP and Definitions surfaces are still beta/alpha.

**Verdict:** reject.

## Step 5 — four-lens test

| Lens | Candidate C result |
|---|---|
| Strict | Oak schemas, allowlisted fields, privacy gate, delivery proof, and conformance tests are mandatory. |
| Everywhere | Every emitting runtime uses the same envelope, event catalogue, identity policy, and adapter boundary. |
| All time | Event versioning, deprecation, definitions verification, deletion drills, and corpus consolidation prevent silent drift. |
| Long-term excellence | PostHog can be removed or supplemented without feature-code changes; Sentry retains specialist value; warehouse timing follows a named need. |

## Step 6 — survival classes

### Survives as architecture

- Oak-owned semantic event contracts;
- redaction before external delivery;
- provider-neutral composition roots and adapters;
- structured stdout and fixture capture;
- identity and correlation envelopes;
- question-to-decision governance;
- Sentry as engineering specialist;
- warehouse as a later, need-triggered durable analytics destination.

### Survives as a bounded experiment

- `@posthog/mcp` for vendor-native MCP Analytics;
- `@posthog/definitions` for project configuration as code;
- PostHog OTLP Logs as a central analysis surface;
- PostHog distributed tracing beyond product-event correlation.

### Does not survive

- warehouse-first as a prerequisite for PostHog;
- raw `posthog-node` calls in feature code;
- raw MCP parameters/responses in analytics;
- a single mega-plan that attempts to finish every Sentry and PostHog feature;
- dashboards with no named question or owner;
- using telemetry alone as proof of teacher impact.

## Step 7 — verdict

### Recommended direction

Recommend Candidate C for Stage 0 ratification.

If ratified, TAU becomes the controlling programme for:

- telemetry intent and event contracts;
- PostHog product-understanding delivery;
- Sentry integration and rationalisation;
- logging and OTLP destination decisions;
- monitoring, alerting, feedback, and experimentation;
- analysis surfaces and decision reviews;
- privacy, retention, deletion, and cost controls;
- long-term export/warehouse triggers.

### Warrant

The selected direction is expected to shorten the time from “runtime activity”
to “actionable product understanding” while retaining the strongest existing
engineering and architecture investments.

### Falsifiers

Reconsider the direction if any of these occur:

1. The first vertical slice cannot answer its named questions after controlled
   and real traffic is available.
2. The PostHog adapter cannot enforce closed field allowlists with no raw
   content.
3. Controlled Vercel probes cannot deliver all expected events with bounded
   flush time.
4. Identified capture cannot clear privacy and deletion gates.
5. Product and research users cannot use the resulting surfaces without
   recurring bespoke engineering work.
6. PostHog cost, availability, or governance prevents proportional use.
7. Maintaining the PostHog projection requires feature-code changes rather
   than adapter changes.

### Rollback

Rollback is configuration-first:

- remove `posthog` from `OBSERVABILITY_SINKS`;
- retain stdout, fixtures, and Sentry;
- keep Oak event schemas and emission sites;
- disable identified capture independently;
- delete the adapter without changing feature code;
- preserve exported event definitions and decision records.

## Initial understanding questions

These are seeds for Stage 1, not final measures:

| ID | Question | Likely decision |
|---|---|---|
| Q1 | How many identified people use the MCP, and how much anonymous activity occurs, over time? | Whether adoption and enablement work should change. |
| Q2 | Which tools are used, by which client classes, and with what outcome? | Tool portfolio, documentation, and host-specific fixes. |
| Q3 | Which tools compose within the same Oak invocation? | Workflow and MCP App design without inventing a host-session boundary. |
| Q4 | Where do upstream Oak API or Elasticsearch calls fail or dominate latency? | Reliability and architecture priorities. |
| Q5 | Which releases or hosts correlate with errors or degraded outcomes? | Rollback, incident, and release decisions. |
| Q6 | Which categorical curriculum areas and search shapes are requested or produce zero hits? | Search and content-surface priorities. |
| Q7 | Do people return, and what predicts return use? | Product value and onboarding hypotheses. |
| Q8 | Where do users explicitly report failure, confusion, or unmet need? | Feedback, UX, and missing-capability work. |
| Q9 | Are accessibility preferences or host constraints associated with incomplete flows? | Widget and accessibility improvements. |
| Q10 | Which signals should become alerts rather than analysis-only trends? | Operational monitoring policy. |

## Sources

Repo sources are linked from the sibling architecture and Sentry research
documents.

Current vendor sources:

- <https://posthog.com/docs/mcp-analytics>
- <https://posthog.com/docs/mcp-analytics/installation>
- <https://posthog.com/docs/mcp-analytics/privacy>
- <https://posthog.com/docs/mcp-analytics/events>
- <https://posthog.com/docs/mcp-analytics/identifying-users>
- <https://posthog.com/docs/libraries/node>
- <https://posthog.com/docs/libraries/vercel>
- <https://posthog.com/docs/logs>
- <https://posthog.com/docs/advanced/infra-as-code>

Decision workflow source:

- [Decision Matrix](https://github.com/EngraphCode/reasoning-workflows/blob/main/decision-matrix.md).
  This Oak exploration adapts the upstream workflow's empirical grounding,
  outward Reason, inward metacognition, cross-examination, four-lens
  dissolution, and survival-class routing to a repository plan estate rather
  than a single implementation choice; Stage 0 remains the local authority
  gate.
