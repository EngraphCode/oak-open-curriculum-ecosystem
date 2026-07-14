---
title: "Telemetry and Understanding System (TAU)"
type: plan-collection-index
status: active
last_updated: 2026-07-14
serves_strategic_choice: APP-1
---

# Telemetry and Understanding System (TAU)

TAU is the proposed controlling plan collection for turning runtime evidence
into product and operational understanding. Its Stage 0 authority gate must
ratify that role before TAU becomes current delivery authority.

The name expresses the loop:

```text
Telemetry -> Analysis -> Interpretation -> Understanding
```

Here, **logging** records operational detail; **observability** makes system
state answerable from correlated outputs; **organisational intelligence** is
the explicit formation and comparison of hypotheses from those outputs; and
**understanding** is warranted, situated comprehension sufficient for a
responsible decision. A dashboard is an analysis surface, not understanding by
itself.

TAU exists so Oak can answer:

- who is using the MCP surfaces, with what repeat pattern;
- what tools and flows are used;
- where people succeed, fail, abandon, or report unmet needs;
- which dependencies, releases, or hosts explain degraded outcomes;
- which change should happen next;
- whether the change improved the intended outcome.

## Strategic traceability

Primary strategic choice:

- [`APP-1`](../../../docs/strategy/stream-mcp-app.md): meet teachers inside
  the assistants they already use.

TAU also provides evidence for:

- K1: live is an evidence state, not a deploy state;
- APP-2: whether Oak remains recognisable and grounded;
- APP-3: whether the surface informs rather than decides;
- engineering-tool and framework quality where the same event/logging
  substrate is reused.

Telemetry alone cannot prove teacher impact. TAU provides part of the evidence
substrate and must be joined with research, evaluation, curriculum review, and
other Oak measures.

## Scope

If ratified at Stage 0, TAU controls cross-layer sequencing for:

- event and signal intent;
- question and decision registers;
- PostHog implementation and project surfaces;
- Sentry reconciliation;
- logging destination decisions;
- monitoring and alerts;
- feedback, flags, experiments, and qualitative evidence;
- privacy, identity, retention, deletion, and cost controls;
- analysis definitions and scheduled interpretation;
- later warehouse/export triggers.

## Boundaries

| Collection/surface | Boundary |
|---|---|
| `observability/` | Detailed inherited implementation estate and historical evidence. TAU dispositions and sequences it; it is not silently deleted. |
| `architecture-and-infrastructure/` | Generic OTel, environment, workspace, build, and deployment architecture. |
| `security-and-privacy/` | DPIA, DPO, legal basis, identity permission, retention, DSAR/deletion, security controls. |
| `compliance/` | Published policy, statutory records, and external submission requirements. |
| [`effectiveness-and-impact/`](../effectiveness-and-impact/README.md) | Owns assessment methodology for agent-facing content and delivered behaviour plus the evidence chain to real-world impact. TAU supplies governed runtime telemetry and owns its question-to-interpretation-to-decision-to-remeasurement loop; it does not own cross-product assessment methodology. |
| `semantic-search/` | Search quality and retrieval implementation; TAU owns cross-runtime event semantics and analysis joins. |
| stakeholder and external-system surfaces | Linear owns execution coordination and progress; Notion owns curated stakeholder narrative and status presentation; and [ADR-207](../../../docs/architecture/architectural-decisions/207-dora-delivery-metrics-as-a-structural-property.md) owns the delivery-performance projection over the intent graph joined to GitHub, Linear, deployment, and Sentry evidence. TAU owns the meaning, limits, interpretation, and decision use of its telemetry; it does not own those neighbouring surfaces. |
| application workspaces | Own emission sites and behaviour tests. |

## Proposed authority model

1. strategy and owner decisions;
2. this roadmap and the current TAU delivery plan;
3. Oak event/signal schemas and executable conformance tests;
4. application code;
5. adapter packages;
6. PostHog/Sentry project definitions and live evidence;
7. inherited plans and research as source material.

## Lifecycle

| Lane | Role | Index |
|---|---|---|
| [`current/`](current/README.md) | NEXT: queued and ready; move to `active/` when implementation starts | TAU delivery plan |
| `active/` | NOW: created when implementation begins | Not yet created |
| `future/` | Later trigger-bound extensions | Added when a concrete future plan exists |
| `archive/completed/` | Read-only execution history | Added at first completion |

## Current direction

- PostHog is the next product-understanding priority.
- Oak event contracts remain provider-neutral.
- Sentry remains the primary specialist engineering-observability surface.
- stdout/fixtures remain the no-vendor floor.
- warehouse work no longer blocks PostHog; it opens on a named durable
  cross-source analysis need.
- `@posthog/mcp`, PostHog Logs, traces, and Definitions-as-code are bounded
  probes, not assumed dependencies.
- identified production capture remains blocked by privacy acceptance.

## Entry points

- [Roadmap](roadmap.md)
- [Current delivery plan](current/tau-delivery.plan.md)
- [Research index](../../research/telemetry-and-understanding/README.md)
- [May identity and event-emission exploration](../../../docs/explorations/2026-05-26-mcp-analytics-identity-and-event-emission.md)

## Delivery rule

The programme must close a real loop:

```text
question -> signal -> delivery -> analysis -> interpretation -> human review
         -> decision -> change -> remeasurement -> next question
```

Prerequisite stages may establish contracts, delivery, or reconciled evidence
without prematurely claiming interpretation or a decision. Their closure must
name the downstream stage that completes the loop and state what the current
evidence cannot establish. Stage 4 owns the first sensemaking review and
evidence-backed decision; a stage that merely adds instrumentation without a
declared evidence or downstream-use gate is incomplete.
