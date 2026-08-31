---
id: prerequisite-claim-removal
node_type: delivery
name: "Prerequisite claim removal"
overview: >-
  Remove the fabricated prerequisite structure from the graph corpus and
  every served surface that asserts it, with a recurrence guard.
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: honest-curriculum-structure
impact_areas:
  - served-surface
tickets: []
depends_on: []
owner_gates: []
last_updated: 2026-08-31
---

# Prerequisite claim removal

## Goal

The service stops claiming to have unit-to-unit prerequisite data. Today
(verified first-hand 2026-08-31) the corpus generator mints
`prerequisiteFor` edges from consecutive thread-membership pairs sorted
by year with a stated-arbitrary within-year tie-break
(`packages/sdks/oak-sdk-codegen/src/bulk/generators/graph-corpus-edges.ts`),
and the published `get-prior-knowledge-graph` tool
(`packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-prior-knowledge-graph.ts`)
describes those edges to assistants as "the units that are …
prerequisites of X". The authoritative bulk schema
(`additionalProperties: false`) publishes no unit-to-unit prerequisite
data in any form: `priorKnowledgeRequirements` is an array of plain
prose statements with no reference fields. The served claim is
unsupported prerequisite semantics asserted over disclosed thread
adjacency — fabricated structure wearing Oak's name. When this lands,
that claim is gone from every published surface, in code and in prose,
and a recomputable guard prevents its recurrence.

## User groups and value

Consumers of the served surface (teachers via assistants, assistants,
agent developers) stop being misled. No new value is claimed by this
plan; removal of misleading content requires no user story (owner
ruling, 2026-08-31, this lane's session). The value routes to the
trustworthiness of every surface that remains.

## Mechanism

Pure removal — no renaming, no repointing, no compatibility layer
(principles §Strict and Complete: a disproven design is removed, never
kept alive as an option). Replacement views are separate deliveries
under the same strategic node; this plan only takes the lie out.

- **Generator**: stop minting `prerequisiteFor`; remove the member from
  the closed `GraphCorpusEdgeType` union and the edge-type counts shape
  (`graph-corpus-types.ts`), and delete the thread-ordering pair
  derivation that exists only to feed it (`graph-corpus-sequences.ts`
  usage). The narrowed union turns every downstream reference into a
  compile error — the red-first signal, the same pattern
  `mcp-served-surface-truth` used deliberately.
- **Serving chain**: delete `prior-knowledge-view.ts` (its only meaning
  is traversal of the removed edges), the `get-prior-knowledge-graph`
  tool, and their tests; regenerate the emitted corpus.
- **Prose claim surfaces** (the same claim published in words —
  completion is false without them): `tool-guidance-data.ts` entries
  directing assistants to the prerequisite subgraph; the
  `learning-progression` guidance resource's "map prerequisite
  dependencies" instruction; cross-references in
  `aggregated-misconception-graph.ts` and
  `aggregated-thread-progressions.ts` descriptions;
  `curriculum-model-resource.ts`; `served-tool-table.md`, the app
  README, and `docs/manual-uat-guide.md`.
- **Recurrence guard**: every emitted corpus edge type carries the
  bulk-schema source field it derives from, checked by a validator that
  recomputes membership (validators-must-recompute); plus a test
  asserting `prerequisiteFor` is structurally absent. The semantic
  invariant — no edge asserts meaning its source field does not carry —
  lands as a dated amendment on ADR-086 (the corpus extraction
  methodology record) in the same change.

## Acceptance criteria (each with a proof — required)

1. No generated corpus artefact contains a `prerequisiteFor` edge or
   edge type. Proof: `repo-safe` — the narrowed closed union
   type-checks estate-wide, and a unit test on the emitted corpus
   asserts the edge type set exactly.
2. No served tool, resource, guidance entry, or repository doc claims
   prerequisite data or directs consumers to it. Proof: `repo-safe` —
   the served-surface tests pass with the tool absent, and a repo-wide
   search for the retired claim vocabulary in served content is clean
   at review (content-quality half: construction plus review, never a
   grep gate).
3. Every remaining emitted edge type cites its bulk-schema source
   field, recomputed by validator. Proof: `repo-safe` — the validator
   run red-first against the pre-removal corpus, green after.
4. ADR-086 carries the dated invariant amendment. Proof: `repo-safe` —
   the amendment text in the same PR.

## Todos

Sliced at pickup; expected single-story PR within the default round
budget (removal is one coherent story: generator + chain + prose +
guard land atomically with the regenerated corpus).

## Out of scope

- Any replacement view or tool (sequence order, thread views, prior
  knowledge statement serving) — `curriculum-structure-true-views`.
- Upstream exposure requests — `upstream-curriculum-data-exposure`.
- The `prior-knowledge-extractor.ts` prose extraction and the
  `priorKnowledge` node content field — genuine published data, kept.
