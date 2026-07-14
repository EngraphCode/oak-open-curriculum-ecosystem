---
title: "TAU Sentry integration disposition ledger"
type: research
status: complete
last_updated: 2026-07-11
source_plan: ".agent/plans/observability/active/sentry-observability-maximisation-mcp.plan.md"
---

# TAU Sentry integration disposition ledger

## Purpose

The existing Sentry plan contains valuable completed work, stale status,
deferred work, and lanes whose purpose now belongs in TAU. This ledger prevents
two failure modes:

- discarding mature engineering-observability work during a PostHog pivot;
- carrying every historical Sentry lane into a new mega-plan.

No plan is archived or deleted by this research PR. Stage 0 of the TAU plan
re-verifies each disposition against current code and then performs the
moves/amendments.

## Disposition vocabulary

| Disposition | Meaning |
|---|---|
| Preserve | Landed capability remains part of the target architecture. |
| Complete | Distinct Sentry value remains unfinished and should be delivered. |
| Absorb | Outcome belongs in TAU, possibly using Sentry as one projection. |
| Defer | Real value, but opens only on a named trigger. |
| Retire | Mechanism or authority no longer belongs in the live plan estate. |
| Verify | Status is stale or ambiguous; first action is evidence, not implementation. |

## Lane ledger

| Lane | Current recorded state | TAU disposition | Rationale / target home |
|---|---|---|---|
| L-0a ground-truth correction | completed | Preserve | Evidence-first correction discipline remains valid; archive as history after plan split. |
| L-0b ADR-160 redaction gate | completed | Preserve and generalise | Keep Sentry closure tests; add PostHog/event-projection allowlist closure in TAU Stage 2. |
| L-1 free-signal integrations | pending | Verify then Complete selectively | Re-check current Sentry SDK. Enable only integrations that answer named engineering questions with acceptable overhead. |
| L-2 delegates extraction | pending | Absorb | Extract a provider-neutral composition/delegate seam if both HTTP MCP and Search CLI need it; do not create a Sentry-only abstraction by default. |
| L-3 MCP context enrichment | pending/partly present | Absorb | Common identity/correlation/runtime envelope belongs in TAU Stage 1/3; Sentry receives an engineering projection. |
| L-4b Sentry metrics adapter | pending | Split | Engineering health metrics may stay in Sentry; product usage/outcome facts become canonical TAU events, not Sentry metrics. |
| L-4a span-metric convention | pending/deferred | Defer | Open only for a span-attribution question that events and health metrics cannot answer. |
| L-5 dynamic sampling | pending/deferred | Defer | Trigger on measured trace volume, cost, or diagnostic loss; not a PostHog prerequisite. |
| L-6 profiling | pending/deferred | Defer | Trigger on a named CPU/performance investigation and measured overhead budget. |
| L-7 release/deploy linkage | completed then superseded in mechanism | Verify and Preserve outcome | Keep release/commit/deploy attribution; remove stale implementation authority and point to current esbuild/build-metadata code. |
| L-8 bundler/source maps | pending with substantial landings | Verify and Complete closure | Prove current preview/production source maps and release linkage; consolidate duplicate release plans. |
| L-9 feedback | deferred | Absorb | Feedback is a TAU understanding source. Define the user surface and privacy first; PostHog is a consumer, not the contract owner. |
| L-10 feature-flag scaffolding | pending | Absorb/Defer | Stage 8 provider decision. Keep Sentry crash-linked flag context regardless of chosen evaluator. |
| L-11 AI instrumentation | pending | Defer | Trigger on first LLM-calling capability. Route to AI-telemetry plan and TAU event/cost conventions. |
| L-12 prerequisite redaction core | completed | Preserve | `@oaknational/observability` ownership and browser-safe primitives are target substrate. |
| L-12 widget Sentry | deferred | Absorb | Widget events and host compatibility belong in TAU Stage 7; Sentry browser wiring remains an engineering sub-decision. |
| L-13 alerts/dashboards/runbooks | deferred | Split | Sentry engineering alerts stay; product dashboards move to PostHog; all alerts require distributions, owner, and runbook. |
| L-14 third-party trace propagation | deferred | Defer | Security/architecture decision triggered by MCP spec and cross-system incident need. |
| L-15 strategy close-out | pending | Retire into TAU authority | The old Sentry-only/dual-export decision is superseded by PostHog-first TAU. Record durable ADR amendments in Stage 0/10. |
| L-EH initial | completed | Preserve | Cause-preservation enforcement remains general engineering discipline. |
| L-EH final | pending | Move out of TAU critical path | If still valuable, own under architecture/code-quality rather than telemetry delivery. |
| L-DOC initial | completed | Preserve | Existing Sentry and app guides remain evidence; update to TAU authority and current code. |
| L-DOC final | dissolved | Preserve doctrine | Documentation remains definition-of-done per stage. |
| L-IMM operational hardening | completed | Preserve and verify | Fingerprinting, filters, flush, breadcrumbs, client reports, and marketplace checks remain Sentry-specific value. |
| L-OPS operational maturity | deferred | Decompose | Cron/cache items open on capability adoption; server-side filters/integrations are project operations, not one lane. |
| Quality gates / review / propagation / consolidation | pending | Absorb | These become per-stage TAU acceptance and final corpus consolidation, not umbrella-plan tail work. |

## Plan-level disposition

### Preserve as durable capability

- `@oaknational/sentry-node`;
- redaction closure;
- release/source-map integration;
- handled-error boundaries;
- per-request engineering scope;
- error fingerprints and noise controls;
- Sentry deployment and CLI runbooks.

### Re-author as focused TAU/Sentry stage work

1. **Sentry ground-truth verification**
   - live code and package/API review;
   - current Sentry project configuration;
   - source maps and release proof;
   - current errors/traces/log delivery;
   - unresolved plan claims.

2. **Engineering signal completion**
   - selected free integrations;
   - request/tool/dependency context projection;
   - health metrics with bounded cardinality;
   - engineering dashboards/alerts after distributions.

3. **Corpus close**
   - split or archive the umbrella;
   - consolidate release-identifier plans;
   - move deferred capability-triggered work to focused future plans;
   - amend ADRs and app docs.

### Do not reproduce

- a PostHog section inside the Sentry umbrella;
- product events encoded primarily as `Sentry.metrics.*`;
- duplicate error capture without a named comparative need;
- product dashboards owned by a Sentry-maximisation lane;
- deferred lanes with no trigger or expiry;
- status claims derived from plan frontmatter without code/live-project proof.

## Sentry/PostHog responsibility boundary

| Concern | Primary surface | Cross-link |
|---|---|---|
| Exceptions and stack traces | Sentry | `event_id`, `correlation_id`, `trace_id` on TAU outcome event |
| Distributed engineering trace | Sentry/OTel | correlation properties in PostHog |
| Release/source maps | Sentry | release on every TAU event |
| Product usage and outcome | PostHog | Sentry trace/error link when applicable |
| Dependency outcome and latency | TAU event + PostHog | detailed span in Sentry |
| Structured operational logs | stdout first; destination decision later | trace/correlation IDs |
| Product feedback | TAU/PostHog | Sentry only if feedback reports a technical failure |
| Feature flag exposure | TAU/PostHog or selected provider | Sentry crash-linked flag context |
| Engineering alert | Sentry/monitoring | TAU decision log |
| Product trend review | PostHog | linked incident/release evidence |

## Verification work required before moving files

- inspect current main, not the old feature branch;
- compare every pending lane to current package versions and code;
- query live Sentry project settings and recent controlled events;
- identify merged code whose plan todo still says pending;
- identify completed todos whose implementation has been replaced;
- map every surviving lane to a focused TAU stage or non-TAU collection;
- conserve review findings and operational lessons before archive;
- update inbound links so no archived plan remains live authority.

## Exit condition

The umbrella Sentry plan stops being live execution authority only when:

- every lane in the table has a verified disposition;
- every surviving capability has a current owner;
- current code and live Sentry evidence are recorded;
- no inbound index tells a reader to resume the umbrella;
- durable decisions are in ADRs/docs;
- historical execution evidence remains reachable.
