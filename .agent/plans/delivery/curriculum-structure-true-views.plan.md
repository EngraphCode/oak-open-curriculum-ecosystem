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
  as first-class served content, plus the shared-statement structure
  (units sharing a statement by string identity — published fact, no
  inference), and `whyThisWhyNow` as the unit's placement rationale.

Tool naming follows the data (Oak names only); one open semantic
detail — whether `sequence` array position stays meaningful within a
year when programme forks share a file — is checked against a real
downloaded bulk file at pickup, before the sequence-order contract is
worded.

## Acceptance criteria (each with a proof — required)

1. Each served view names, in its contract and its generated types, the
   bulk-schema fields it derives from; the source-citation validator
   passes. Proof: `repo-safe` — validator plus contract tests.
2. Sequence-order queries return units in the `sequence` array's order
   under programme-factor filters, proven against fixture data drawn
   from a real bulk file. Proof: `repo-safe` — unit/integration tests.
3. The thread view's contract states its derivation (sequence order
   restricted to thread membership) and asserts no thread-specific
   order. Proof: `repo-safe` — contract test on the served description
   plus review.
4. Prior knowledge statements and shared-statement queries serve
   exactly the published strings, keyed by string identity. Proof:
   `repo-safe` — tests against fixtures.

## Todos

Sliced at pickup by the implementer; this plan is expected to split
into two or more single-story PRs (ordering views; prior-knowledge
statement serving), each within the default round budget.

## Out of scope

- Any inferred relationship (statement-to-unit linking, prerequisite
  guessing) — excluded by the strategic node's claim boundary.
- Consuming upstream data not yet published (thread unit order, unit
  connections) — `upstream-curriculum-data-exposure`.
- Presentation/UI; this plan is served-surface structure only.
