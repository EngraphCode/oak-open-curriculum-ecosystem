---
id: curriculum-structure-true-views
node_type: delivery
name: "Curriculum structure true views"
overview: >-
  Point structural questions at the live generated tools that already
  serve them, and add the one absent structure — the shared
  prior-knowledge-statement projection — under Oak names.
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: honest-curriculum-structure
impact_areas:
  - served-surface
tickets: []
depends_on:
  - plan: prerequisite-claim-removal
    kind: blocking
owner_gates: []
last_updated: 2026-08-31
---

# Curriculum structure true views

## Goal

Every structural question the fabricated prerequisite surface pretended
to answer has a named, honest, already-served answer — and the one
genuinely absent structure is added. The estate's live generated tools
already serve the true relationships: `get-programmes-units` and
`get-sequences-units` return units in unit sequence order with
programme factors; `get-units-summary` returns a unit's prior-knowledge
requirement statements, threads, national-curriculum statements, and
its lessons in order; `get-threads-units` returns a thread's units in
Oak's authoritative thread order; `get-thread-progressions` serves the
year-derived thread progression with its derivation honestly stated.
Rebuilding any of those from bulk data would create competing surfaces
that can drift (first question: simpler without compromise — reuse).
When this lands, the served guidance points structural questions at
those tools by name, and the one absent structure — the shared
prior-knowledge-statement projection — is served as a new tool.

## User groups and value

Teachers via assistants, assistants, and agent developers, as the
strategic node states. Value here is offered/hypothesised under the
innovation clause (owner ruling 2026-08-31): exposing the true
relationships in Oak's data needs no advance need-proof. Claim
boundary: the new view serves a declared projection of published
fields; nothing serves inferred relationships.

## Mechanism

- **Reuse, named**: the existing generated tools above are the served
  surfaces for sequence order, lesson order, thread order and
  membership, and per-unit prior-knowledge statements. This plan
  builds none of them again; its guidance work re-points the
  post-removal tool guidance at them explicitly.
- **Shared prior-knowledge statements** (the genuinely absent
  structure): a new tool serving the cross-unit grouping of
  string-identical `priorKnowledgeRequirements` statements — a
  **declared projection** (the strings are published facts; the
  grouping is derived by string identity, implies no authored
  relationship, and its contract says so). Derived at sdk-codegen time
  from the bulk data (cardinal rule). The source-citation guard landed
  by `prerequisite-claim-removal` covers emitted corpus edge types
  only, so this plan extends it to emitted non-edge projections: the
  projection artefact carries the bulk-schema source field it derives
  from, the validator recomputes that coverage exactly as it does for
  edge types (validators-must-recompute), and the extension is proven
  red-first — an uncited projection supplied to the validator is
  rejected.
- **Gap check at pickup**: if a structural contract surfaces that the
  existing tools genuinely cannot satisfy, it is named as a contract
  gap with the tool that fails it and routed as its own decision —
  never absorbed here as a duplicate view.

## Acceptance criteria (each with a proof — required)

1. The shared-statement tool's contract and generated types name the
   bulk-schema field they derive from and present the grouping as a
   declared projection keyed by string identity; the source-citation
   guard, extended by this plan to cover emitted non-edge projections,
   recomputes the projection's citation and passes, with the extension
   proven red-first (an uncited projection is rejected). Proof:
   `repo-safe` — the red-first validator run plus contract tests.
2. Shared-statement queries serve exactly the published strings,
   grouped by string identity, proven against fixture data drawn from
   a real bulk file. Proof: `repo-safe` — unit/integration tests.
3. Post-removal served guidance points sequence-order, lesson-order,
   thread-order, and per-unit prior-knowledge questions at the
   existing generated tools by name, and no served view built by this
   plan duplicates them. Proof: `repo-safe` — review of the served
   guidance and contracts plus the existing tools' own tests.

## Todos

Sliced at pickup by the implementer; expected shape is one
single-story PR for the shared-statement tool and one for the guidance
re-pointing, each within the default round budget.

## Out of scope

- Rebuilding sequence-order, lesson-order, thread-order, or per-unit
  prior-knowledge serving — the live generated tools own those
  surfaces.
- Any inferred relationship (statement-to-unit linking, prerequisite
  guessing) — excluded by the strategic node's claim boundary.
- Consuming upstream data not yet published (thread unit order in the
  bulk export, unit connections) — `upstream-curriculum-data-exposure`.
- Presentation/UI; this plan is served-surface structure only.
