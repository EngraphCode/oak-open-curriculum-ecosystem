# ADR-212: Federated Visibility Authority and Evidence Boundaries

- **Status:** Accepted (owner-directed 2026-07-13; recorded 2026-07-14).
- **Builds on:** [ADR-200](200-intent-as-a-living-idea-graph.md), which keeps durable intent in
  the repository and future idea graph.
- **Relates to:** [ADR-201](201-external-systems-evidence-integration.md), which remains Proposed
  and owns connector and returning-evidence mechanics; and
  [ADR-207](207-dora-delivery-metrics-as-a-structural-property.md), which owns the generated
  delivery-performance projection.

## Context

The repository is the durable authority for vision, strategy, architectural decisions, scope,
constraints, and planning intent. That does not mean every audience should read repository files,
or that one external dashboard can serve engineering delivery, operational diagnosis, product
understanding, and senior stakeholder narrative equally well.

Without an explicit boundary, copying status into several tools creates competing planning
estates. Treating every external service as equivalent also collapses different evidence classes:
software delivery performance, operational health, product usage, and value or impact do not prove
one another.

## Decision

Adopt a federated visibility estate. The repository remains the canonical durable-intent surface;
each neighbouring system has one primary audience-shaped responsibility and links to its source
authority.

| Surface                          | Primary audience                                                             | Responsibility                                                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Repository and future idea graph | Engineering, agents, and governance reviewers                                | Durable vision, strategy, decisions, plans, relationships, interpretation, and generated cross-system projections |
| Notion                           | Non-engineering stakeholders, especially senior leadership                   | Curated narrative of intent, value, current state, roadmap, milestones, and Oak alignment                         |
| Linear                           | Engineers, engineering managers, product managers, and delivery colleagues   | Concrete work, ownership, dependencies, sequencing, and execution progress                                        |
| GitHub pull requests             | Authors, reviewers, and engineering stakeholders                             | Proposed change, review, checks, evidence, and readiness                                                          |
| PostHog                          | Product, engineering, data/research, and leadership through curated readouts | Observed product usage, adoption, journeys, and behaviour after instrumentation lands                             |
| Sentry                           | Engineers and operational stakeholders                                       | Errors, traces, regressions, operational health, and diagnostic understanding                                     |

The authority direction is fixed:

- durable intent originates in the repository and projects outward;
- external systems may return evidence within their assigned evidence class;
- an external record, ticket, dashboard, or narrative never becomes authority over durable intent
  merely because it is current or easier to read; and
- audience projections name their source, evidence date, known limits, and refresh owner or
  cadence.

Keep four evidence classes distinct:

1. **Delivery performance** is the ADR-207 generated projection over the intent graph joined to
   GitHub, Linear, deployment, and Sentry evidence. No single external service owns it.
2. **Operational behaviour and health** come from Sentry and its OpenTelemetry context.
3. **Product usage and adoption** come from PostHog after the relevant instrumentation lands.
4. **Value and impact** require interpretation across those sources plus qualitative research,
   evaluation, curriculum evidence, and Oak-owned outcome measures.

Accepting this architecture does not mean that its projectors, connectors, graph, or product
instrumentation exist. The relevant plan collection's status surface records current planning
readiness, delivery authority, and implementation activity; this permanent decision record does
not.

## Consequences

- Stakeholders get audience-shaped visibility without creating a second source of planning intent.
- Linear can remain detailed and execution-oriented while Notion remains concise and narrative.
- PostHog and Sentry stay useful specialist surfaces as well as evidence sources for curated
  readouts.
- No dashboard, telemetry event, or delivery metric alone proves value or impact.
- Proposed ADR-201 may define evidence edges, capability modes, supervision, connectors, and
  validated write-back without reopening the accepted audience split.
- Projection automation remains future work. Until it lands, the people maintaining each
  projection must state its freshness and evidence limits explicitly.

## Practice boundary

[PDR-113](../../../.agent/practice-core/decision-records/PDR-113-source-intent-from-the-principal-not-the-records.md)
provides the portable principle that records are projections rather than sources of intent. The
named systems, audiences, and responsibilities above are this repository's host architecture, so
they do not create a vendor-specific PDR. A portable Practice contract would require separate
owner intent and a host-free, evidenced formulation.

## Amendment — 2026-07-14: Execution movement is a fifth evidence class

The owner ruled that execution movement is not merely a view onto delivery performance. It is a
distinct evidence class answering whether concrete work, dependencies, and proposed changes are
moving. The accepted text above records the original four-class decision and remains unchanged as
history; this amendment supersedes that count.

Keep five evidence classes distinct:

1. **Execution movement** comes from Linear execution state and GitHub change/readiness evidence.
   It answers whether concrete work, dependencies, review, and proposed changes are progressing.
2. **Delivery performance** is the ADR-207 generated projection over the intent graph joined to
   GitHub, Linear, deployment, and Sentry evidence. No single external service owns it.
3. **Operational behaviour and health** come from Sentry and its OpenTelemetry context.
4. **Product usage and adoption** come from PostHog after the relevant instrumentation lands.
5. **Value and impact** require interpretation across those sources plus qualitative research,
   evaluation, curriculum evidence, and Oak-owned outcome measures.

Execution movement can be current while the delivery system performs poorly, and delivery
performance can improve without proving product use or impact. The five classes therefore remain
separate in stakeholder projections and generated evidence views.
