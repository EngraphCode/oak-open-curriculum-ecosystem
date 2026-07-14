# ADR-201: External systems as evidence edges — integrating external state into the idea knowledge-graph

- **Status:** Proposed (2026-06-22). This ADR **names** the decision and its considerations; it is **not yet
  accepted**. Ratification is gated on the idea knowledge-graph substrate landing (ADR-200 §Value, the
  interim completion milestone) and an owner decision.
- **Thread:** `strategy-and-plan-estate-holistic-review`.
- **Builds on:** [ADR-200](200-intent-as-a-living-idea-graph.md) (the idea knowledge-graph and §Value's
  substrate-vs-full-value split); `packages/core/graph-core` + `packages/libs/graph-ingest` (the substrate
  and ingestion); the observability estate (Sentry/OpenTelemetry, Vercel);
  [ADR-179](179-transport-agnostic-graph-substrate.md) (transport-agnostic substrate).
- **Relates to:** [ADR-212](212-federated-visibility-authority-and-evidence-boundaries.md), which owns
  the Accepted federated audience, authority-direction, and evidence-class contract.

## Context

ADR-200 §Value distinguishes the **substrate value** — the idea knowledge-graph plus the rewritten corpus:
recoverable, drift-free, traceable intent, complete and assessable on its own — from the **full value**: a
system that **proves it delivers value, not just claims it** (self-measuring delivery with the DORA metrics
as a property of the structure, the user-value loop closed, the FRAME stream's core value). **The full value
rests on extracting evidence from the state of external systems** into the graph. This ADR decides how that
integration is shaped, kept as a **distinct** decision so the substrate work can complete and be assessed
without it.

The repo already touches the relevant external systems piecemeal (Sentry/OpenTelemetry and Vercel in the
observability estate; GitHub for change; Linear for execution). What is undecided is the **contract** by
which their state becomes evidence in the graph without compromising the graph's canonical authority. The
external-systems pillar was set out, owner-ratified, as a principle in the intent-graph design (the
"external systems are typed edges; the repo stays canonical" pillar); this ADR formalises that principle for
the idea knowledge-graph of ADR-200.

[ADR-212](212-federated-visibility-authority-and-evidence-boundaries.md) settles the neighbouring
audience responsibilities, authority direction, and evidence-class distinctions. It does not settle the
connector, evidence-edge, write-back, or supervision mechanisms owned here. This ADR does not own TAU
planning readiness, delivery authority, or implementation status. Conversely, accepting this ADR would not
make Notion or Linear a source of durable intent: external systems remain projections or evidence sources
with bounded authority.

## Decision (proposed)

External systems are **typed edges to external nodes**; the idea knowledge-graph stays **canonical**. The
shape:

1. **Conform to ADR-212's authority direction.** The connector and edge mechanics defined here must
   preserve ADR-212; this proposed decision does not reopen or redefine that Accepted contract.
2. **Evidence edges.** External state attaches via returning edges in the plan-layer schema — `evidence` (a
   node is evidenced by external state), `validated_by` (a strategic choice or increment is validated by
   user-value evidence), `realized_by` (the intent → realization join, for cost and throughput attribution).
3. **Capability modes per integration:** `read` / `summarise` / `annotate` / `mutate`. Each integration
   declares its mode; `mutate` carries a **supervision requirement** (human-in-the-loop).
4. **No PII in version control, ever.** External IDs and credentials live only in gitignored local config;
   the graph stores edges to external nodes, never personal data. (Organization constraint.)
5. **Connectors + triggers + validated write-back (the actuation layer).** Connectors draw from each system;
   triggers (event-driven and scheduled) drive agentic analysis; write-back into the graph is validated (the
   deterministic frontmatter↔store validator extends to cover evidence edges).
6. **Per-system map (first cut):** GitHub (change-readiness), Linear (execution / `projects_to`),
   Sentry + OpenTelemetry (runtime / incident), Vercel (deploy), Sonar (code quality), and PostHog
   (product usage, adoption, and behaviour). Each is a directional edge with a capability mode, an
   evidence-only authority effect, and a supervision requirement. PostHog evidence contributes to the
   user-value loop but does not establish value or impact without interpretation and Oak-grounded evidence.

## Consequences

- Unlocks the **full value** — self-measuring delivery, the closed user-value loop, the FRAME stream's core
  value — on top of the substrate.
- **Gated on the substrate** (ADR-200 §Value interim milestone): this integration does not begin until the
  idea knowledge-graph is real. The substrate value stands without it.
- Extends to the future knowledge-graph family (ADR-200 §Future state): the operations and code
  knowledge-graphs evidence from the same external estate through the same contract.

## Practice boundary

[PDR-113](../../../.agent/practice-core/decision-records/PDR-113-source-intent-from-the-principal-not-the-records.md)
provides the portable principle that records are projections rather than sources of intent. The named
vendor roles and evidence mechanisms in this ADR are host-repository architecture, so they do not belong
in a new PDR. A portable PDR requires a separately evidenced, host-free contract and an owner decision;
portability is not inferred from this one implementation estate.

## Open (to settle at ratification)

- The per-system capability + supervision matrix (which mode, what human-in-loop, what evidence effect).
- The write-back validation contract (how an evidence edge is validated before it lands).
- Reuse vs new connectors against the existing observability estate.
- What is a typed evidence edge vs a derived projection (do not store what can be computed).
- The no-PII enforcement mechanism (a validator and/or a gitignored-config boundary check).
