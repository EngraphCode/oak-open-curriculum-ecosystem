---
title: "TAU PostHog baseline and build-vs-buy research"
type: research
status: complete
last_updated: 2026-07-14
posthog_project_id: 221775
---

# TAU PostHog baseline and build-vs-buy research

## Purpose

This document records:

- the live starting state of the PostHog project;
- current first-party PostHog capabilities relevant to Oak;
- what should be reused, wrapped, probed, or deferred;
- the delivery and privacy risks the implementation plan must close.

No PostHog project state was changed during this research.

## Live project baseline

Queried on 2026-07-11/12 Europe/London:

| Property | Value |
|---|---|
| Project name | `Oak Open Curriculum Ecosystem` |
| Project/team id | `221775` |
| Created | `2026-07-11T23:42:01.163063+01:00` |
| Timezone | `Europe/London` |
| Events | `0` |
| Feature flags | `0` |
| Experiments | `0` |
| Surveys | `0` |
| Warehouse sources | `0` |
| Oak/MCP/TAU-named insights | `0` |
| Oak/MCP/TAU-named dashboards | `0` |

Default vendor scaffolding:

- dashboard `811754`: `Your starter dashboard`;
- eight starter insights for active users, sessions, page views, DAU, WAU,
  retention, referrers, and visit-to-interaction funnel;
- cohort `179127`: `Internal / Test users`;
- the project test-account filter excludes that cohort.

### Baseline interpretation

The project is empty for Oak purposes. Starter web-product insights should
not be treated as TAU implementation. The plan may retain them temporarily as
vendor examples, but Oak-authored surfaces must use question IDs and explicit
event semantics.

## First-party capability survey

### `posthog-node`

Current documentation describes:

- a queued, non-blocking Node client;
- asynchronous batching;
- server-side capture;
- identity and person properties;
- feature-flag evaluation;
- explicit `flush()` / `shutdown()` lifecycle;
- Vercel/serverless guidance using immediate delivery or small batches.

**Use:** yes, inside an Oak adapter.

**Do not:** expose it in feature code or make its event object the canonical
event contract.

### `@posthog/mcp`

Current documentation describes a beta, pre-1.0 package that:

- wraps `Server` or `McpServer`;
- instruments initialize, tool listing, and tool calls with `$mcp_*` events;
- names resource/prompt events in its mapping, but the current wrapper does not
  instrument resource or prompt methods;
- provides an MCP Analytics view;
- supports intent and missing-capability features;
- can identify users;
- allows per-event properties and a `beforeSend` hook;
- owns no client lifecycle;
- includes parameters and responses after its own sanitisation/truncation;
- can emit paired `$exception` events.

Risks for Oak:

1. event names/properties may change before 1.0;
2. default `context: true` changes tool schemas;
3. parameters and responses conflict with Oak’s categorical-only posture;
4. exception autocapture may duplicate Sentry;
5. the HTTP app creates a fresh server per request;
6. vendor-native events could become a second semantic contract;
7. tool-call events could duplicate Oak `tool_invoked`.

**Decision:** do not make it the canonical instrumentation path. Run a
version-pinned, preview-only build-vs-buy probe.

Probe configuration floor:

```ts
{
  context: false,
  enableConversationId: false,
  reportMissing: false,
  enableExceptionAutocapture: false,
  beforeSend: stripParametersResponsesAndUnapprovedProperties,
  eventProperties: addReleaseEnvironmentCorrelationOnly,
}
```

The probe must prove:

- no tool schema changes;
- no raw arguments/results on the final wire payload;
- no duplicate canonical event;
- correct behaviour with a fresh server per HTTP request;
- bounded flush behaviour;
- stable client and identity semantics;
- adapter isolation from the rest of the codebase.

Possible outcomes:

- **adopt as a supplementary projection** for the MCP Analytics view;
- **adopt selected code patterns only** in the Oak adapter;
- **reject** and use the existing handler/executor seams.

### MCP Analytics view

The purpose-built view could accelerate:

- tool mix;
- tool success/failure;
- intent clusters;
- missing capabilities;
- per-session flow where session semantics are real.

It is a useful supplementary surface, but TAU cannot rely on it for
production reporting while both the SDK and view remain beta.

### Product analytics

PostHog is a strong fit for:

- trends;
- paths;
- funnels;
- retention;
- lifecycle and stickiness;
- cohorts and breakdowns;
- saved HogQL;
- dashboards;
- qualitative feedback integration.

This is the reason for PostHog-first prioritisation.

### Error tracking

PostHog can receive exceptions. Oak already has a mature Sentry path.

**Decision:** no broad duplicate exception capture in the first stages.
PostHog receives outcome/error classification on semantic events and a Sentry
trace/error correlation key. A later empirical comparison may justify a
specific PostHog error-tracking role.

### Logs

PostHog Logs accepts OTLP using standard OpenTelemetry packages. Oak’s logger
already produces OTel-shaped records, but it does not automatically mean a
second network log exporter is proportionate.

**Decision:** defer full log export until a Stage-6 probe measures:

- diagnostic questions answered that stdout/Vercel/Sentry cannot answer;
- ingestion volume and cost;
- field and PII posture;
- trace correlation;
- delivery overhead;
- retention requirements;
- duplication with Sentry logs.

### Distributed traces

PostHog accepts OTLP traces. Sentry is the current engineering trace surface.

**Decision:** preserve OTel compatibility, but do not dual-export all traces
in the first delivery slice. Add only when a named analysis question requires
events/logs/traces in one PostHog query.

### Feature flags and experiments

PostHog can later provide:

- `evaluateFlags()` server-side evaluation;
- exposure tracking;
- experiments;
- cohorts.

**Decision:** Stage 8 only. A flag is not adopted until a real release or
experiment use case exists, and the provider boundary is decided with the
existing feature-flag plan. Product events must be stable before exposure
analysis begins.

### Surveys and feedback

Surveys can provide qualitative evidence, but the MCP host/user experience
may not support an embedded survey surface.

**Decision:** Stage 8. First implement an Oak-owned feedback event/tool or
host-appropriate surface. Use PostHog surveys only where host compatibility,
consent, and accessibility are proven.

### Definitions as code

`@posthog/definitions` can manage project assets as TypeScript and apply them
through a CLI. It is alpha.

Potential value:

- review trail in the same PR as event changes;
- reproducible dashboards and insights;
- rollback through git;
- fewer manual project-state contradictions.

Risks:

- unstable package/format;
- credentialed apply in CI;
- destructive or surprising reconciliation;
- mismatch between project defaults and repo intent.

**Decision:** Stage-4 bounded spike. Until accepted, keep a checked-in
manifest of expected project assets and verify live state through read-only
queries. Do not make alpha tooling a launch blocker without a successful
apply/rollback proof.

## Build-vs-buy matrix

| Capability | Reuse/buy | Oak-owned layer | Verdict |
|---|---|---|---|
| Event semantics | No vendor contract | Zod schemas and catalogue | Build |
| Node delivery | `posthog-node` | adapter, config, Result/error policy | Reuse behind adapter |
| MCP auto instrumentation | `@posthog/mcp` beta | privacy/projection/conformance | Probe |
| Product analytics UI | PostHog | question register and definitions | Buy |
| MCP Analytics UI | PostHog beta | canonical event path remains Oak | Supplementary probe |
| Identity | PostHog `distinct_id` | permission and projection rules | Extend |
| Logs | PostHog OTLP | logger/export policy | Defer/probe |
| Traces | PostHog OTLP | OTel/Sentry routing | Defer |
| Error tracking | PostHog + Sentry | Sentry primary, event correlations | Preserve Sentry |
| Feature flags | PostHog candidate | Oak flag port / policy | Stage-8 decision |
| Surveys | PostHog candidate | host UX/consent/accessibility | Stage-8 decision |
| Dashboards | PostHog | questions, naming, review, source manifest | Buy + govern |
| Project IaC | `@posthog/definitions` alpha | manifest, apply/rollback gates | Probe |
| Warehouse | PostHog/external | durable export contract | Triggered later |

## Recommended adapter shape

Proposed workspace:

```text
packages/libs/posthog-node/
  src/
    client.ts
    config.ts
    event-projection.ts
    identity-projection.ts
    lifecycle.ts
    sink.ts
    types.ts
    test-fixture.ts
```

Responsibilities:

- consume only validated Oak event types;
- map event name and fields to PostHog;
- choose `distinct_id` and `$process_person_profile`;
- add release/environment/runtime/schema version;
- enforce the final field allowlist;
- reject/drop unrecognised fields;
- enqueue without affecting the request;
- expose bounded flush/shutdown to the composition root;
- surface delivery failures to structured logs/metrics without recursion;
- provide a network-free capture fixture.

Non-responsibilities:

- defining event semantics;
- parsing tool arguments;
- deciding privacy permission;
- building dashboards;
- importing Sentry;
- being called directly from handlers.

## Environment shape

Candidate variables, finalised in Stage 2:

```text
OBSERVABILITY_SINKS=sentry,posthog
OBSERVABILITY_FIXTURES=false
POSTHOG_PROJECT_TOKEN=...
POSTHOG_HOST=https://eu.i.posthog.com
POSTHOG_CAPTURE_MODE=off|anonymous|identified
POSTHOG_MCP_NATIVE_PROJECTION=off|preview
```

Rules:

- no `NEXT_PUBLIC_` prefix;
- token only at server composition roots;
- preview capture may be anonymous before the privacy gate;
- identified production mode cannot parse successfully until the privacy gate
  evidence is supplied;
- disabling PostHog must not disable event production;
- unknown hosts or missing token fail startup when PostHog is selected.

The actual project region/ingestion host must be verified from project
settings before implementation. The project timezone alone does not prove
data residency.

## Vercel delivery probe

The server runtime and current request lifecycle require first-hand proof.

Controlled experiment:

1. create a preview-only PostHog adapter with a capture fixture and real
   project mode;
2. issue 100 synthetic MCP requests with unique `event_id` and
   `correlation_id`;
3. test warm and cold function invocations;
4. test normal completion, handled error, timeout, and shutdown paths;
5. compare expected IDs against PostHog after an agreed ingest delay;
6. measure request overhead and flush duration;
7. test disable/rollback;
8. repeat with batching options under review.

Acceptance before production:

- 100/100 controlled events queryable by `event_id`;
- no raw prohibited fields in raw event inspection;
- user request succeeds when PostHog is unavailable;
- flush is bounded and does not reuse a permanently shut-down client;
- no duplicate event per semantic occurrence;
- project token is absent from bundles and logs.

## Privacy and identity

Initial modes:

| Mode | `distinct_id` | Person profile | Use |
|---|---|---|---|
| off | none | none | local/CI/default before config |
| anonymous | generated/connection-safe ID or explicit anonymous key | disabled | preview and public anonymous traffic |
| identified | opaque Clerk user ID | enabled | production only after privacy gate |

No person properties beyond a separately approved allowlist.

Hard gate before identified production:

- DPIA current;
- processor/data-region decision recorded;
- privacy notice updated;
- deletion/DSAR runbook tested;
- event fields minimised and reviewed;
- DPO sign-off recorded.

## Project bootstrap sequence

1. verify EU/US ingestion region and project token;
2. retain test-user cohort exclusion;
3. create TAU naming/tagging conventions;
4. create an ingestion-validation dashboard;
5. ingest only synthetic preview data;
6. verify raw events and privacy;
7. create question-driven Stage-4 dashboards;
8. document owners and review cadence;
9. enable anonymous production if approved;
10. enable identified production only after the hard gate.

## Current references

- <https://posthog.com/docs/libraries/node>
- <https://posthog.com/docs/libraries/vercel>
- <https://posthog.com/docs/mcp-analytics>
- <https://posthog.com/docs/mcp-analytics/installation>
- <https://posthog.com/docs/mcp-analytics/privacy>
- <https://posthog.com/docs/mcp-analytics/events>
- <https://posthog.com/docs/mcp-analytics/identifying-users>
- <https://posthog.com/docs/mcp-analytics/custom-events>
- <https://posthog.com/docs/logs/installation/nodejs>
- <https://posthog.com/docs/distributed-tracing/installation/nodejs>
- <https://posthog.com/docs/advanced/infra-as-code>
