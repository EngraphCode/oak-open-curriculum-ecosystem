# ADR-209: Planning Vocabulary — Host Instantiation

- **Status:** Accepted (owner-directed 2026-06-28; Clover mends Hedgerow session).
- **Mirrors:** [PDR-121: Planning Vocabulary](../../../.agent/practice-core/decision-records/PDR-121-planning-vocabulary.md)
  — the portable semantics. This ADR is the host half: how this repo realises each term.
- **Relates to:** [ADR-117](117-plan-templates-and-components.md) (plan templates, components,
  document hierarchy), [ADR-200](200-intent-as-a-living-idea-graph.md) (intent as a living
  idea-graph — these terms are the projection types over that graph).

## Context

The planning vocabulary — plan, thread, programme, and the units around them — was defined
piecemeal across PDR-018, PDR-027, ADR-117, and PDR-037, with the de-facto consolidated reference
in the plan-templates README. The cross-cutting grouping term, **programme**, had no definition and
was introduced on 2026-06-28. Two problems followed: the realisation of the terms in this repo had
no single home, and "programme" collides with an established domain term — a **curriculum
programme** (a contextualised curriculum pathway such as `biology-secondary-ks4-foundation-aqa`),
load-bearing across the curriculum data, SDK, and MCP surfaces (ADR-080/083/157).

PDR-121 defines the portable semantics. This ADR records how this repo instantiates them.

## Decision

The portable terms in [PDR-121](../../../.agent/practice-core/decision-records/PDR-121-planning-vocabulary.md)
are realised in this repo as follows:

- **Collection** — a domain grouping under `.agent/plans/<collection>/`, with its own README and
  roadmap (ADR-117).
- **Lane** — the lifecycle directory: `future/` (later) → `current/` (next) → `active/` (now) →
  `archive/completed/` (done) (ADR-117).
- **Plan** — a `*.plan.md` (or `*.execution.plan.md`) file in a lane; strategic in `future/`,
  executable in `current/`/`active/` (PDR-018, ADR-117).
- **Thread** — a record under `.agent/memory/operational/threads/<slug>.next-session.md` (PDR-027).
- **Roadmap / phase / workstream / cycle** — as in ADR-117 and the plan templates.
- **Programme** — a cross-cutting grouping, realised as:
  - a **programme index** file named `*.programme.md` (mirroring `*.plan.md`), which **owns
    membership** (the membership source of truth) and points to member plans in their home
    collections; it is a view, not a home, and is reachable through its owning collection's index
    (the Reachability Invariant in the plans README);
  - a **`programmes:` frontmatter edge** (a top-level list) on each YAML-frontmatter member,
    mirroring membership so the grouping is greppable; distinct from `serves_stream` (the member's
    domain stream).
  - First instance: the generic-foundation-decomposition programme (recorded in the plan estate, which points up to this ADR).

The plan-templates Planning Vocabulary table points to this ADR and PDR-121 as the canonical
glossary rather than re-defining the terms.

### Disambiguation — planning programme vs curriculum programme

The default term is **programme**; context disambiguates — the planning sense applies only within
the planning estate (`.agent/plans/`, plan frontmatter, plan indices), the curriculum sense only
within the curriculum domain (data, SDK, MCP tools, programme URLs). Where a single surface is
genuinely ambiguous, prefix explicitly: **planning programme** and **curriculum programme**.

## Consequences

- One host home for the vocabulary realisation; "programme" is defined and disambiguated.
- The `*.programme.md` + `programmes:` edge convention is recorded; the templates README points
  here.
- These terms are the projection types over ADR-200's idea-graph; when that graph lands they become
  typed nodes and edges informed by this glossary. As an ADR this decision is permanent — it
  outlives the plans it describes (which the idea-graph conversion retires).
- Cost: a cross-domain homonym persists. It is accepted because the two senses live in disjoint
  surfaces; the prefix convention covers the rare ambiguous case.
