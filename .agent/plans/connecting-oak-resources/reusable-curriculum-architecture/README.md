# Reusable Curriculum Architecture Planning

This collection coordinates planning for the repository-owned implications of
the reusable curriculum architecture reports. It is deliberately broader than
knowledge graphs: bulk acquisition, schema authority, source accounting,
search ingestion, vocabulary generation, graph projections, and consumer
semantics all depend on the same source-faithfulness boundary. It also owns the
cross-cutting planning seam for a reusable curriculum exploration engine:
bulk and materialised-view source adapters, explicit Elastic projections,
agent-facing MCP exploration, and independently evaluated website retrieval
policy.

The reports diagnose and recommend. Plans in this collection decide how that
evidence becomes owner-ratified executable work without duplicating the reports
or silently changing upstream authority.

## Lifecycle

- **Later:** [future/](future/)

There is no active or current implementation plan in this collection.

## Evidence

- [Reusable curriculum architecture report family](../../../reports/oak-reusable-curriculum-architecture/README.md)

## Adjacent Plan Estates

- [Semantic search](../../semantic-search/README.md) owns search ingestion,
  retrieval, Elastic capability, evaluation, and search-contract execution
  plans.
- [Knowledge graph integration](../knowledge-graph-integration/README.md) owns
  graph substrate and graph-surface execution plans.
- [SDK and MCP enhancements](../../sdk-and-mcp-enhancements/README.md) owns
  generated API, SDK, and MCP execution plans.
- [Architecture and infrastructure](../../architecture-and-infrastructure/README.md)
  owns cross-workspace topology and architectural execution plans.

This collection coordinates those boundaries; it does not absorb them.

The canonical reasoning for the search direction is
[Elasticsearch Serverless as a curriculum exploration engine](../../../reports/oak-reusable-curriculum-architecture/oak-reusable-curriculum-architecture.md#elasticsearch-serverless-as-a-curriculum-exploration-engine).
