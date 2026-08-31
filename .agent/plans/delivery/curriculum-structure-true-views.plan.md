---
id: curriculum-structure-true-views
node_type: delivery
name: "Curriculum structure true views"
overview: >-
  Serve the ordering and prior-knowledge structure the bulk data really
  carries — sequence order, thread membership, lesson order, prior
  knowledge statements — as new tools under Oak names.
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

The service serves the structural relationships the published bulk data
actually carries, as new tools named for what they serve. Today that
structure is either buried (prior knowledge requirement statements ride
node content beneath fabricated edges), ignored (the ordered `sequence`
array is unused by the corpus), or absent from the served surface
entirely. When this lands, consumers can ask what the sequence teaches
before and after a unit, which units a thread contains and in what
sequence order, what a unit's lessons are in teaching order, and what
prior knowledge a unit's authors state it assumes — every answer
grounded in a named bulk-schema field.

## User groups and value

Teachers via assistants, assistants, and agent developers, as the
strategic node states. Value here is offered/hypothesised under the
innovation clause (owner ruling 2026-08-31): exposing the true
relationships in Oak's data needs no advance need-proof. Claim
boundary: each view serves a published field or a declared projection
of published fields; none serves inferred relationships.

## Mechanism

All views derive from the authoritative bulk schema, in the generator
(cardinal rule: heavy lifting at sdk-codegen time), each emitted
structure citing its source fields per the recurrence guard landed by
`prerequisite-claim-removal`:

- **Sequence order**: the `sequence` array's position ("ordered list of
  units for the subject sequence"), filterable by the unit's programme
  factors (year, key stage, tier, exam board, pathway) — what the
  sequence teaches before/after a unit.
- **Thread views**: thread membership plus the thread's units in
  sequence order — a declared projection (the sequence's order
  restricted to the thread), documented as such, never presented as a
  thread-specific editorial order (that data exists upstream,
  unpublished — see `upstream-curriculum-data-exposure`).
- **Lesson order**: `unitLessons[].lessonOrder` within a unit.
- **Prior knowledge statements**: a unit's `priorKnowledgeRequirements`
  as first-class served content, plus the shared-statement structure —
  a **declared projection** grouping units by string-identical
  requirement statements (the strings are published facts; the grouping
  is derived, implies no authored relationship, and its contract says
  so) — and `whyThisWhyNow` as the unit's placement rationale.

Tool naming follows the data (Oak names only). The sequence-order
contract rests on one data premise the schema leaves open — whether
`sequence` array position stays meaningful within a year when programme
forks share a file — so establishing that premise against real bulk
files is this plan's first todo, blocking the contract wording:
criterion 2 commits only to the scope that check verifies.

## Acceptance criteria (each with a proof — required)

1. Each served view names, in its contract and its generated types, the
   bulk-schema fields it derives from; the source-citation validator
   passes. Proof: `repo-safe` — validator plus contract tests.
2. The within-year meaning of `sequence` array position across
   programme forks is established against real bulk files and recorded
   in the plan before any ordering contract is worded; sequence-order
   queries then return units in the `sequence` array's order under
   programme-factor filters, within exactly the verified scope, proven
   against fixture data drawn from a real bulk file. Proof:
   `repo-safe` — the recorded verification note plus unit/integration
   tests.
3. The thread view's contract states its derivation (sequence order
   restricted to thread membership) and asserts no thread-specific
   order. Proof: `repo-safe` — contract test on the served description
   plus review.
4. Prior knowledge statements and shared-statement queries serve
   exactly the published strings, with the shared-statement grouping
   presented as a declared projection keyed by string identity. Proof:
   `repo-safe` — tests against fixtures plus the contract's projection
   statement.
5. Lesson-order queries return a unit's lessons ordered by
   `unitLessons[].lessonOrder`. Proof: `repo-safe` — unit/integration
   tests against fixtures.

## Todos

Todo 1, blocking all contract wording: verify the within-year
sequence-position semantics against real downloaded bulk files and
record the verified scope in this plan (dated note). The remaining
slices are cut at pickup by the implementer; this plan is expected to
split into two or more single-story PRs (ordering views;
prior-knowledge statement serving), each within the default round
budget.

## Out of scope

- Any inferred relationship (statement-to-unit linking, prerequisite
  guessing) — excluded by the strategic node's claim boundary.
- Consuming upstream data not yet published (thread unit order, unit
  connections) — `upstream-curriculum-data-exposure`.
- Presentation/UI; this plan is served-surface structure only.
