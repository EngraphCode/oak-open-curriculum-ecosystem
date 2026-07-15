# Semantic Search — Navigation

**Last Updated**: 2026-07-15

## Start Here

- Purpose: explore how hybrid semantic search works in conjunction with APIs,
  MCP, MCP Apps, and Oak knowledge graphs so AI education products can find,
  explain, and compose curriculum resources from natural-language intent.
- Session entry: semantic-search.prompt.md (`../../prompts/semantic-search/archive/semantic-search.prompt.md`)
- Knowledge-graph hub: [../connecting-oak-resources/knowledge-graph-integration/README.md](../connecting-oak-resources/knowledge-graph-integration/README.md)
- Strategic sequence: [roadmap.md](roadmap.md)
- Research index: [research-index.md](research-index.md)
- Cross-boundary ontology report:
  [../../reports/oak-ontology-mcp-search-integration-report-2026-04-19.md](../../reports/oak-ontology-mcp-search-integration-report-2026-04-19.md)
  (important because the ontology is not a search-only asset)
- Reusable curriculum architecture and Elastic exploration synthesis:
  [../../reports/oak-reusable-curriculum-architecture/oak-reusable-curriculum-architecture.md#elasticsearch-serverless-as-a-curriculum-exploration-engine](../../reports/oak-reusable-curriculum-architecture/oak-reusable-curriculum-architecture.md#elasticsearch-serverless-as-a-curriculum-exploration-engine)
  (canonical evidence for source-portable bulk and materialised-view adapters,
  purpose-built indexes, progressive MCP exploration, and separate agent and
  website retrieval policies)
- Cross-estate strategic planning brief:
  [../connecting-oak-resources/reusable-curriculum-architecture/future/reusable-curriculum-architecture-planning.plan.md](../connecting-oak-resources/reusable-curriculum-architecture/future/reusable-curriculum-architecture-planning.plan.md)
  (coordinates the search-owned execution plans with acquisition, compilation,
  graph and upstream-contract work without absorbing this collection)
- Graph-serving architecture research note:
  [../../research/kg-neo4j-stardog-product-creation/kg-neo4j-stardog-product-creation-clean.md](../../research/kg-neo4j-stardog-product-creation/kg-neo4j-stardog-product-creation-clean.md)
  (use this when deciding whether a live graph platform is needed at all,
  or whether search should consume ontology projections directly)
- Fresh-perspective follow-on:
  ../../plans-old-archive/connecting-oak-resources/knowledge-graph-integration/archive/completed/ontology-repo-fresh-perspective-review.plan.md (`../../plans-old-archive/connecting-oak-resources/knowledge-graph-integration/archive/completed/ontology-repo-fresh-perspective-review.plan.md`)
  (use this when you need to re-open the ontology repo without letting
  semantic search become the default frame)
- Direct-use and serving-platform comparison plan:
  ../../plans-old-archive/connecting-oak-resources/knowledge-graph-integration/archive/superseded/direct-ontology-use-and-graph-serving-prototypes.plan.md (`../../plans-old-archive/connecting-oak-resources/knowledge-graph-integration/archive/superseded/direct-ontology-use-and-graph-serving-prototypes.plan.md`)
  (use this when the question is `neither`, `Neo4j`, `Stardog`, or `both`,
  rather than just "how should search consume graph context?")

## Active

No active plans. See [active/README.md](active/README.md).

Recently archived:

- ../../plans-old-archive/semantic-search/archive/completed/prod-search-assessment.execution.plan.md (`../../plans-old-archive/semantic-search/archive/completed/prod-search-assessment.execution.plan.md`) — F1/F2 verified in production (2026-03-25)

## Current Queue

- [current/unified-versioned-ingestion.plan.md](current/unified-versioned-ingestion.plan.md)
- [current/sequence-retrieval-architecture-followup.plan.md](current/sequence-retrieval-architecture-followup.plan.md) (locked recipe; executing via remediation plan)
- [current/search-contract-followup.plan.md](current/search-contract-followup.plan.md) (S4/S5 source; executing via remediation plan)
- [current/semantic-search-scheduled-refresh.operations.plan.md](current/semantic-search-scheduled-refresh.operations.plan.md) (deferred; out of migration-complete scope)
- [current/bulk-metadata-quick-wins.execution.plan.md](current/bulk-metadata-quick-wins.execution.plan.md)
- ../../plans-old-archive/connecting-oak-resources/knowledge-graph-integration/archive/superseded/kg-alignment-audit.execution.plan.md (`../../plans-old-archive/connecting-oak-resources/knowledge-graph-integration/archive/superseded/kg-alignment-audit.execution.plan.md`)
- [current/search-sdk-args-extraction.plan.md](current/search-sdk-args-extraction.plan.md)
- [current/category-integration-remediation.md](current/category-integration-remediation.md) (superseded by the F2 fix; retained for traceability)
- [current/bulk_data_for_semantic_search.feature_request.md](current/bulk_data_for_semantic_search.feature_request.md)
- [current/m2-public-alpha-auth-rate-limits.execution.plan.md](current/m2-public-alpha-auth-rate-limits.execution.plan.md)
- [current/keyword-definition-assets.execution.plan.md](current/keyword-definition-assets.execution.plan.md)
- [current/thread-sequence-semantic-surfaces.execution.plan.md](current/thread-sequence-semantic-surfaces.execution.plan.md)
- ../../plans-old-archive/connecting-oak-resources/knowledge-graph-integration/archive/superseded/kg-integration-quick-wins.plan.md (`../../plans-old-archive/connecting-oak-resources/knowledge-graph-integration/archive/superseded/kg-integration-quick-wins.plan.md`)

## Future (Strategic)

- [future/curriculum-nlp-processing-workspace.md](future/curriculum-nlp-processing-workspace.md) — Python NLP workspace for ML-based entity extraction, semantic transcript compression, and relationship mining from bulk curriculum data
- [../connecting-oak-resources/reusable-curriculum-architecture/future/reusable-curriculum-architecture-planning.plan.md](../connecting-oak-resources/reusable-curriculum-architecture/future/reusable-curriculum-architecture-planning.plan.md) — cross-estate brief governing source-portable Elastic projections, MCP exploration and agent/website policy evidence

## Key Completed Evidence

- ../../plans-old-archive/semantic-search/archive/completed/comprehensive-field-integrity-integration-tests.execution.plan.md (`../../plans-old-archive/semantic-search/archive/completed/comprehensive-field-integrity-integration-tests.execution.plan.md`)
- ../../plans-old-archive/semantic-search/archive/completed/search-cli-sdk-boundary-migration.execution.plan.md (`../../plans-old-archive/semantic-search/archive/completed/search-cli-sdk-boundary-migration.execution.plan.md`)
- ../../plans-old-archive/semantic-search/archive/completed/cli-robustness.plan.md (`../../plans-old-archive/semantic-search/archive/completed/cli-robustness.plan.md`)
- ../../plans-old-archive/semantic-search/archive/completed/blue-green-reindex.execution.plan.md (`../../plans-old-archive/semantic-search/archive/completed/blue-green-reindex.execution.plan.md`)
- ../../plans-old-archive/semantic-search/archive/completed/semantic-search-recovery-and-guardrails.execution.plan.md (`../../plans-old-archive/semantic-search/archive/completed/semantic-search-recovery-and-guardrails.execution.plan.md`)
- ../../plans-old-archive/semantic-search/archive/completed/semantic-search-ingest-runbook.md (`../../plans-old-archive/semantic-search/archive/completed/semantic-search-ingest-runbook.md`)
- ../../plans-old-archive/semantic-search/archive/completed/mcp-result-pattern-unification.execution.plan.md (`../../plans-old-archive/semantic-search/archive/completed/mcp-result-pattern-unification.execution.plan.md`)
- ../../plans-old-archive/semantic-search/archive/completed/sdk-workspace-separation.md (`../../plans-old-archive/semantic-search/archive/completed/sdk-workspace-separation.md`)
- ../../plans-old-archive/semantic-search/archive/completed/search-dispatch-type-safety.md (`../../plans-old-archive/semantic-search/archive/completed/search-dispatch-type-safety.md`)
- ../../plans-old-archive/semantic-search/archive/completed/search-results-quality.md (`../../plans-old-archive/semantic-search/archive/completed/search-results-quality.md`) ([ADR-120](../../../docs/architecture/architectural-decisions/120-per-scope-search-tuning.md))

## Directory Map

- Active: [active/README.md](active/README.md)
- Current: [current/README.md](current/README.md)
- Future: [future/README.md](future/README.md)
- Completed/superseded: relocated to [`.agent/plans-old-archive/semantic-search/`](../../plans-old-archive/semantic-search/) (ADR-200)

## Foundation (Mandatory)

1. [principles.md](../../directives/principles.md)
2. [testing-strategy.md](../../directives/testing-strategy.md)
3. [schema-first-execution.md](../../directives/schema-first-execution.md)
