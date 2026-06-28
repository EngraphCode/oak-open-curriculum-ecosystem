# ADR-207: DORA delivery metrics as a structural property of the intent graph

- **Status:** Accepted (owner-directed design constraint, 2026-06-21; recorded as an ADR 2026-06-28).
  This ADR decides the **design constraint** — that the delivery metrics are a structural property of
  the graph, designed-for at every level. The **build** is gated and owned downstream (§Build-gating).
- **Thread:** `strategy-and-plan-estate-holistic-review`.
- **Builds on:** [ADR-200](200-intent-as-a-living-idea-graph.md) (the idea knowledge-graph substrate and
  its `serves_strategic_choice` / `kind` / `disposition` / realisation edges) and
  [ADR-201](201-external-systems-evidence-integration.md) (external systems as typed evidence edges — the
  raw delivery/incident event sources). This ADR is the canonical statement of **why the delivery metrics
  fall out of those two decisions as projections**; ADR-200/201 are not restated here.

## Context

Oak's two products are measured on two axes: **impact** (lagging, Oak-grounded — adoption and observed
benefit for teachers; the launch keystone K1) and **delivery** (leading, derived in-repo). This ADR is
about the delivery axis. Owner direction (2026-06-21): the **DORA software-delivery-performance metrics
are considered at every level of the intent-graph design** — node-types, edges, projections, and strategy
alignment — for the repo's two products: the **MCP app**, and the **Practice / agentic-engineering
framework itself** (the FRAME stream's flagship). The metrics are to _fall out as projections_, never a
bolted-on dashboard.

**Why this is native here, not a bolt-on — the same-repo advantage.** Vision, strategy, intent, planning,
work, and output all live in **one versioned, typed substrate** (ADR-200). DORA's own metrics-frameworks
guidance is that logs-based delivery metrics give continuously-measured, standardized data at scale _but
require sufficient observability into the development toolchain_ — usually the **hardest precondition to
meet**, because in a conventional estate intent lives in one tool (docs/tickets), work in another (git),
and output in a third (deploys/incidents), and the joins must be reconstructed after the fact. Here that
precondition is **structurally met**: the repo spans the toolchain across all three axes — **GitHub** (the
change axis: commits, PRs — present today), **Sentry with OpenTelemetry spans** (the runtime / incident
axis — foundation in progress, ADR-162), and **Linear** (the intent / execution-status axis — the
`projects_to` projection is designed and reserved, not yet built; §Build-gating). Those external systems
are the typed nodes ADR-201's `evidence` and `projects_to` edges point at, so that — once the evidence
edges are wired (§Build-gating) — every strategic choice, plan, commit, deployment, and incident is
reachable in one graph and the delivery metrics — including the planned-vs-rework attribution everyone
else reconstructs painfully — are a traversal away. The
architectural claim is therefore stronger than "co-location is convenient": **the system is built around
value delivery as the organizing axis**, so surfacing the metrics that prove value is being delivered is a
structural property of the substrate, not a later instrumentation project.

## Decision

The delivery metrics are a **structural property of the intent graph**: the graph is shaped so they are
generated projections over the typed graph plus evidence edges, and drift is a validator failure rather
than a stale dashboard.

### 1. Two products, two altitudes — both first-class

- **The MCP app** — DORA in its literal, validated sense; "production" is the deployed app, and the
  calibrated DORA performance bands apply.
- **The Practice / agentic framework** — DORA-_shaped_ metrics over the repo's own delivery (a landed,
  gate-green commit as the unit; intent → landed-change as lead time; the remediation share as rework).
  This is the FRAME stream measuring itself. It borrows the metrics' **shape, not DORA's calibrated
  bands** — applying them to the meta-process is a novel use, not a validated one.

**The single-owner topology caveat.** DORA's _team-performance_ construct is, in today's
one-developer-many-agents topology, a **reinterpretation** (agent-to-agent coordination), not a
like-for-like match — which is the second reason (alongside the meta-process novelty) the Practice
altitude borrows shape, not bands. This is transitional: as the repo moves to many checkouts with a fluid
developer-plus-agent cast ([the multi-developer transition](200-intent-as-a-living-idea-graph.md)), the
construct becomes **directly** applicable, and the author-agnostic, returning-evidence graph is the
substrate that keeps delivery measurable across that cast.

### 2. The metrics (DORA 2025, verbatim)

_Throughput_ — lead time for changes (committed → deployed in production), deployment frequency, failed
deployment recovery time. _Instability_ — change fail rate (deployments requiring immediate
intervention), deployment rework rate (unplanned deployments resulting from a production incident).
Alongside these, **value-stream flow** metrics (lead time, process time, value-add-to-wait ratio) make
the value stream queryable rather than a periodic whiteboard exercise.

### 3. Where the metrics attach — reusing the contract, no new primitives

- **Node-types** — the reserved `product` and `product-increment` node-types are the deployment/release
  units DORA counts; each `product-increment` is one shipped change.
- **Edges** — `projects_to` (→ Linear) carries live execution status (the throughput state);
  `evidence`-family edges from `product-increment` to external deployment/incident nodes (a Vercel
  deploy, a Sentry incident) are the raw DORA event sources (ADR-201 — services report back,
  outward-only).
- **Attribution (the unique contribution)** — the instability metrics need every change classified
  planned-vs-rework. The `plan` node's `serves_strategic_choice` + `kind` + `disposition`, joined to
  commits, give this **natively**: a change tracing to a plan serving a strategic choice is _planned_;
  an incident-driven fix with no serving plan is _rework_. This is the classification conventional
  setups reconstruct painfully; here it is a graph traversal — the payoff of intent living with the
  code.
- **Projection** — the metrics are a generated read-model over the typed graph + evidence edges, never
  hand-maintained; drift is a validator failure (ADR-200's projection discipline).

### 4. The seven DORA AI-capabilities as leading indicators

The seven capabilities the DORA 2025 research names — clear & communicated AI stance, healthy data
ecosystems, AI-accessible internal data, strong version control practices, working in small batches,
user-centric focus, quality internal platforms — map onto what this system already encodes: the intent
graph **is** AI-accessible internal data and a healthy data ecosystem; TDD-cycle-as-landing **is** working
in small batches and strong version control; the directives **are** the communicated AI stance;
agent-tools and the validators **are** the quality internal platform. So the graph is positioned to
instrument not only DORA's _outcome_ metrics but the _capabilities_ that drive them (the AI-adoption ×
capabilities → outcomes model), as graph-derived proxies (batch size, commit cadence, graph coverage,
gate health), closing the capabilities → metrics → value loop natively for both products. This is design
ambition, not a built claim.

### 5. The continuous-measurement closure is uniform

Every delivery/quality/value signal closes the same way — a generated projection over the typed graph
plus an `evidence`-family edge — so there is **no separate metrics stack**. DORA is this ADR's primary
subject; the non-DORA rows below are included to establish the _uniform closure_ property, not to make
this ADR the decision record for those axes (each would earn its own decision):

| Axis                            | Have today                    | Closure                                                                   |
| ------------------------------- | ----------------------------- | ------------------------------------------------------------------------- |
| Substrate / Practice health     | Fitness four-zone (ADR-144)   | — (have it)                                                               |
| Per-change quality              | Quality gates (point-in-time) | aggregate the trend (gate-failure rate over time)                         |
| Delivery performance            | —                             | the DORA five — projection over the graph + GitHub/Linear/Sentry evidence |
| Output accuracy                 | per-change reviewers          | gate-failure + rework-attribution trend (rework ≈ inverse accuracy)       |
| Usefulness / user value         | —                             | the user-value loop — a `validated_by` evidence edge (ADR-201 §2)         |
| Cost per delivered value        | seat-cost awareness           | token/seat telemetry attributed to increments via `realized_by`           |
| Capability presence (the seven) | —                             | graph-derived proxies (batch size, commit cadence, coverage, gate health) |

The intent graph, fed by returning evidence, **is** the continuous-measurement substrate. The user-value
loop is the **highest-priority** of these: DORA finds user-centric focus the strongest moderator of AI's
effect on team performance — its absence can actively _harm_ teams — and an internal engineering substrate
is structurally distant from the end user (the teacher). It turns user-centricity from a _link_ (intent →
strategic choice) into a _loop_: user-value evidence (usage signals, teacher feedback, the EEF evidence
corpus, Oak-grounded impact) returns as a `validated_by` edge onto the strategic choice, and a validator
flags choices with delivered output but no returned evidence. The _loop structure_ is the cure here; the
_user-value-hypothesis content_ remains an owner/strategy call.

## Consequences

- This is the FRAME stream's differentiator made concrete: a system where intent, work, output, and the
  evidence that value was delivered all live in one traversable substrate, self-measuring its own
  delivery — the artefact other teams would adopt. It reframes the intent graph from plumbing to product.
- The metrics constrain the graph's shape now (the attribution fields and the reserved node-types/edges
  exist because of this decision) even though nothing is measured yet, so the later build composes in
  rather than retrofits.
- The DORA-shaped Practice-altitude metrics are a **novel, unvalidated** use of the metric shape; do not
  read DORA's calibrated bands onto the meta-process.

## Build-gating

No metric extractor, evidence-edge wiring, or dashboard is built by this decision. This ADR makes DORA a
**design constraint** on the graph; the build is owner-gated and sequenced downstream:

- The integration contract is [ADR-201](201-external-systems-evidence-integration.md); its executable
  build is `.agent/plans/product-development-governance/future/external-evidence-integration.plan.md`
  (WS4 projects the DORA metrics and the user-value loop).
- The **operational home** for the metric surfaces is
  `.agent/plans/architecture-and-infrastructure/future/observability-and-quality-metrics.plan.md`,
  emitted per the `what-the-system-emits-today` matrix.
- Today lead time / deployment frequency / change fail rate / FDRT are partially derivable from git,
  Vercel, and Sentry (the Sentry/OTel foundation is in progress per ADR-162); rework-rate and full
  intent-attribution need the intent-graph extractor plus the Linear projection.

## Non-goals

- **No metrics stack parallel to the graph** — every signal is a projection over the typed graph plus an
  evidence edge.
- **No PII in version control** — external IDs and credentials live only in gitignored local config
  (ADR-201).
- **No external system becomes an authority over intent** — services evidence and execute; the direction
  invariant holds (ADR-201).
- **Not a validation of DORA bands for the meta-process** — the Practice-altitude metrics borrow shape,
  not calibrated thresholds.
