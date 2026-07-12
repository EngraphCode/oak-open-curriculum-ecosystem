# Observability

Observability plans for the Oak Open Curriculum Ecosystem. The scope is
the **five-axis** observability principle per
[ADR-162](../../../docs/architecture/architectural-decisions/162-observability-first.md):
engineering, product, usability, accessibility, and security.

## TAU transition — 2026-07-11

The new
[Telemetry and Understanding System (TAU)](../telemetry-and-understanding/README.md)
is the controlling programme for cross-layer priority, PostHog delivery,
Sentry reconciliation, logging/monitoring decisions, analysis surfaces, and
evidence-to-decision governance.

This collection remains the detailed inherited implementation/evidence estate.
Nothing is silently abandoned or archived by the transition. The
[TAU delivery plan](../telemetry-and-understanding/current/tau-delivery.plan.md)
first re-verifies and dispositions every live lane.

Where older observability plans conflict with the TAU direction:

- PostHog is the next implementation priority;
- the warehouse no longer blocks PostHog;
- Oak-owned event schemas remain the semantic authority;
- Sentry remains the specialist engineering-observability surface;
- stdout/fixtures remain the vendor-independent floor;
- product dashboards and decisions are organised by registered questions,
  not by vendor capability.

**Status**: 🔄 Active transition (post-2026-04-18 restructure; TAU controls
new sequencing from 2026-07-11)
**Foundational ADR**: [ADR-162 Observability-First](../../../docs/architecture/architectural-decisions/162-observability-first.md)
(current ADR file remains the status authority).
**Direction-setting session**: [`docs/explorations/2026-04-18-observability-strategy-and-restructure.md`](../../../docs/explorations/2026-04-18-observability-strategy-and-restructure.md)
**Execution plan**: [`architecture-and-infrastructure/current/observability-strategy-restructure.plan.md`](../architecture-and-infrastructure/current/observability-strategy-restructure.plan.md).
**Inherited high-level plan**: [`high-level-observability-plan.md`](./high-level-observability-plan.md);
use it for the detailed five-axis/Sentry estate, but use TAU for current
cross-layer priority.
**Forward-motion evidence**: [`what-the-system-emits-today.md`](./what-the-system-emits-today.md)
— externally verifiable snapshot of what actually emits in code today
per axis and per runtime. It is a Stage-0 TAU input and must be re-derived
before implementation.

---

## Parent Foundation

The Sentry + OpenTelemetry parent foundation plan remains at its
original home and is **not** moved:

- [`architecture-and-infrastructure/active/sentry-otel-integration.execution.plan.md`](../architecture-and-infrastructure/active/sentry-otel-integration.execution.plan.md)
  — foundation closure + credential/evidence authority for the shared
  Sentry + OTel primitives.

Observability plans in this directory build on that foundation.

---

## Lifecycle Index

| Lifecycle | Role | Index |
|---|---|---|
| [`active/`](./active/) | In-progress execution (NOW) | Plans currently being worked on this branch. |
| [`current/`](./current/) | Queued and ready (NEXT) | Plans ready to promote to `active/` when implementation starts. |
| [`future/`](./future/) | Strategic backlog (LATER) | Strategic briefs and post-MVP future plans with promotion triggers. |
| [`archive/completed/`](./archive/completed/) | Completed plans | Historical record; **never updated**. |
| [`archive/superseded/`](./archive/superseded/) | Replaced by newer plans | Historical record; **never updated**. |

---

## Five-Axis Coverage (per ADR-162)

| Axis | Primary signal | Owning plan |
|---|---|---|
| Engineering | Errors, performance, health | `active/sentry-observability-maximisation-mcp.plan.md` as inherited source; TAU Stage 5 re-verifies/dispositions it |
| Product | What is used, by whom, how | TAU Stages 1–4; inherited sources: `current/search-observability.plan.md` + `current/observability-events-workspace.plan.md` |
| Usability | Did the user succeed | TAU Stages 3, 4, 7, and 8; inherited L-9/L-12 plans remain source evidence |
| Accessibility | Preferences, frustration proxies, incomplete-flow correlation | TAU Stage 7; inherited `current/accessibility-observability.plan.md` |
| Security | Trust-boundary events (auth failure, rate-limit triggered) | TAU Stage 7; inherited `current/security-observability.plan.md` |

Transport / bot / DDoS observability is Cloudflare's layer, not this
application's — cross-reference
[ADR-158](../../../docs/architecture/architectural-decisions/158-multi-layer-security-and-rate-limiting.md).

---

## Restructure Phase Map

The five-phase restructure (owned by the execution plan above)
completed 2026-04-19 with all phases landed:

1. **Phase 1** ✅ — directory skeleton + ADR-162 Proposed + move five existing observability plans.
2. **Phase 2** ✅ — populated `high-level-observability-plan.md`, authored
   six MVP `current/` plans + eleven `future/` plans each with a named
   promotion trigger.
3. **Phase 3** ✅ — two full explorations + six focused briefs under
   [`docs/explorations/`](../../../docs/explorations/).
4. **Phase 4** ✅ — revised `active/sentry-observability-maximisation-mcp.plan.md`
   for MVP classification and the `metrics.*` priority swap.
5. **Phase 5** ✅ — ADR-162 status was advanced in the restructure; later
   amendments in the ADR itself remain the current status authority.
   `require-observability-emission` was also introduced.

Execution now transitions to the TAU stage ordering. The prior wave structure
and evidence remain useful inputs but are not the current cross-layer
sequencing authority.

The focused local startup/release boundary follow-up is tracked separately in
the inherited observability estate and is re-verified in TAU Stage 5.

---

## Explorations

Observability explorations live at
[`docs/explorations/`](../../../docs/explorations/). Each exploration is
dated and informs either an ADR or a specific plan.

The immediate TAU bridge is:

- [`2026-05-26-mcp-analytics-identity-and-event-emission.md`](../../../docs/explorations/2026-05-26-mcp-analytics-identity-and-event-emission.md)
  — owner decisions on eight Stage-1 events, PostHog-first direction,
  identity, correlation, and privacy gates.
- [`TAU research`](../../research/telemetry-and-understanding/README.md)
  — current concept, architecture, PostHog, and Sentry synthesis.

---

## Substrate plans (cross-axis infrastructure)

Per the inherited high-level observability plan, these plans contain
load-bearing substrate. TAU absorbs or dispositions them rather than
re-deriving their work:

- [`current/observability-events-workspace.plan.md`](./current/observability-events-workspace.plan.md)
  — Zod-first event-schema contract; TAU Stage 1.
- [`current/observability-sinks-decoupling.plan.md`](./current/observability-sinks-decoupling.plan.md)
  — real telemetry independent of Sentry; TAU Stage 2.
- [`current/multi-sink-vendor-independence-conformance.plan.md`](./current/multi-sink-vendor-independence-conformance.plan.md)
  — structural import and emission-persistence proof; TAU Stage 2.
- [`active/sentry-observability-maximisation-mcp.plan.md`](./active/sentry-observability-maximisation-mcp.plan.md)
  — detailed Sentry execution evidence; TAU Stage 5.
- [`future/observability-plan-consolidation-and-rationalisation.plan.md`](./future/observability-plan-consolidation-and-rationalisation.plan.md)
  — the pending consolidation session whose trigger is now satisfied by the
  2026-07-11 owner direction; TAU Stage 0 executes the decision work.

Earlier sink-axis rename plans and superseded/damaged plans remain historical
inputs. They are not resumed without the TAU Stage-0 evidence pass.

---

## Related

- [`telemetry-and-understanding/`](../telemetry-and-understanding/README.md)
  — current controlling programme.
- [`high-level-plan.md`](../high-level-plan.md) — repo-wide plan index.
- [`architecture-and-infrastructure/roadmap.md`](../architecture-and-infrastructure/roadmap.md)
  — wider architecture roadmap.
- [ADR-051](../../../docs/architecture/architectural-decisions/051-opentelemetry-compliant-logging.md)
  — structured logging baseline.
- [ADR-143](../../../docs/architecture/architectural-decisions/143-coherent-structured-fan-out-for-observability.md)
  — structural sink-and-redaction architecture.
- [ADR-160](../../../docs/architecture/architectural-decisions/160-non-bypassable-redaction-barrier-as-principle.md)
  — non-bypassable redaction barrier.
- [ADR-161](../../../docs/architecture/architectural-decisions/161-network-free-pr-check-ci-boundary.md)
  — network-free PR-check CI boundary.
- [ADR-162](../../../docs/architecture/architectural-decisions/162-observability-first.md)
  — five-axis and vendor-independence principle.
- [ADR-171](../../../docs/architecture/architectural-decisions/171-observability-configuration-orthogonal-axes.md)
  — sink/fixture configuration axes.
