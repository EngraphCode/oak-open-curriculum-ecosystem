# Oak Reusable Curriculum Architecture Reports

This directory contains the canonical report family from the source-first,
authority-aware exploration of reusable curriculum architecture. The reports
diagnose the current position and recommend directions; they are not a ratified
architecture, implementation plan, or claim about deployed runtime behaviour.

**Parent index:** [Reports](../README.md)

## Reading Order

| Report | Use it for |
| --- | --- |
| [Strategic synthesis](./oak-reusable-curriculum-architecture.md) | The whole-system model, authority boundaries, architectural direction, sequencing, and remaining questions |
| [Issues in this repository](./oak-reusable-curriculum-architecture-this-repository.md) | Repo-owned semantic, provenance, acquisition, extraction, graph, and validation improvements |
| [Issues in the current Oak data estate](./oak-reusable-curriculum-architecture-current-data-estate.md) | Upstream data-contract, bulk-generation, release-identity, and API-source issues and dependencies |

Start with the synthesis when making cross-estate decisions. Start with the
repository issue register when shaping work that this repository can own
without waiting for upstream redesign.

## Highest-Impact Directions for This Repository

These are the main planning priorities distilled from the reports. The issue
register remains the authority for their evidence, qualifications, and detailed
acceptance conditions.

1. **Correct semantic overclaims first.** Retire the thread-derived
   `prerequisiteFor` claim, qualify unit-slug lesson associations as aggregate
   rather than exact variant containment, and remove unsupported completeness
   claims.
2. **Introduce one loss-aware compilation boundary.** Compile each validated
   bulk bundle into a typed intermediate representation that accounts for every
   source record, occurrence, retained dimension, conflict, and omission before
   producing search, graph, vocabulary, or other projections.
3. **Make acquisition immutable and provenance-bearing.** Stage and validate a
   complete bundle, hash every file, reconcile requested and returned scope, and
   promote atomically while distinguishing local retrieval identity from any
   producer-supplied release identity.
4. **Derive the bulk contract from the received schema and data.** Replace
   hand-authored bulk type templates with schema-traceable generation that
   parses every file and fails visibly when schema and payload disagree.
5. **Preserve context, occurrence, and disagreement.** Keep entity identity
   separate from placement and occurrence, retain variant factors and
   contextual definitions, and represent conflicting source values explicitly.
6. **Publish honest, bounded, navigable views.** Treat graphs and search indexes
   as question-led projections, state their omissions and snapshot semantics,
   enforce finite bounds in the owning core, and return typed refusals where the
   source cannot support an exact answer.
7. **Turn search into curriculum exploration.** Add occurrence, relationship,
   passage and analytical projections only where known-answer agent journeys
   prove that they improve orientation, navigation, comparison or explanation.
8. **Make the conserved curriculum model the portability seam.** Let bulk and
   specialised materialised-view adapters feed the same compiler while
   retaining different declared source capabilities; do not make bulk JSON or
   a database view the permanent internal domain contract.
9. **Expose a progressive MCP exploration protocol.** Move beyond parallel
   top-results search to bounded orientation, search, contextual summary,
   relationship expansion, comparison, explanation and selected-detail fetch.
10. **Share search primitives, not an assumed universal ranking policy.** Reuse
    compilation, projections and lifecycle across agents and the primary
    website, then evaluate their retrieval and result-shaping policies
    independently.

The detailed architecture, Elastic Serverless opportunity map, assumptions,
falsifiers and reversible experiments are authoritative in
[Elasticsearch Serverless as a curriculum exploration engine](./oak-reusable-curriculum-architecture.md#elasticsearch-serverless-as-a-curriculum-exploration-engine).
The corresponding local gaps and acceptance conditions are REPO-014 through
REPO-017 in the
[repository issue register](./oak-reusable-curriculum-architecture-this-repository.md#repo-014--mcp-exploration-is-aggregated-search-not-structural-exploration).

The planning route for these directions is the
[reusable curriculum architecture strategic planning brief](../../plans-backlog-2026-07/connecting-oak-resources/reusable-curriculum-architecture/future/reusable-curriculum-architecture-planning.plan.md).

## Evidence and Authority

- Findings are bounded to the cited public source revisions, this repository,
  and the analysed bulk snapshot.
- Checked-in source establishes source behaviour, not production deployment or
  runtime state; the reports mark that boundary explicitly.
- Recommendations do not authorise implementation. Any implementation tranche
  still needs an owner-ratified plan with executable acceptance criteria.
- The current Oak Curriculum Ontology is treated as the formal ontology
  available to this work today; no ontology change is proposed here.
