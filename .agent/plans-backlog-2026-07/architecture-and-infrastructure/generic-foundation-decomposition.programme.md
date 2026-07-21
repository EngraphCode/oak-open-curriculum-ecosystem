# Generic-Foundation Decomposition — Programme Index

A cross-cutting **view**, not a home. It points to plans that live in their own
collections (homed by what drives them) and gathers them under one programme so the
shared work is discoverable and sequenced. It restates nothing, and it **does not
enumerate concepts** — deriving the concept set is the
[ADR-200](../../../docs/architecture/architectural-decisions/200-intent-as-a-living-idea-graph.md)
graph build's job, and pre-listing them here would bias it. It points.

This index lives in the `architecture-and-infrastructure` collection because that
collection owns cross-cutting architecture and workspace boundaries; its members live
across several collections and stay there.

> **Owner-ratified 2026-06-28** as one programme (Clover mends Hedgerow session).
>
> **Interim and mortal.** This index and the `programmes:` lineage edge it defines are
> scaffolding for the current folder-and-frontmatter plan estate. Neither survives the
> ADR-200 conversion to a living idea-graph — no current plan survives that conversion
> as a plan; concepts are extracted from the plans themselves. Retire both when the
> graph edges land.

## The two areas

The programme spans two areas of separation: **codegen-time vs runtime**, and
**Oak-specific vs general** (framework vs consumer,
[ADR-154](../../../docs/architecture/architectural-decisions/154-separate-framework-from-consumer.md)).
Each member plan sits in one or both. The authoritative consolidation lives in the
canonical plan; this is its navigable cross-collection view.

- **Canonical programme plan:**
  [`future/monorepo-workspace-topology-adr-and-canonical-plan.plan.md`](future/monorepo-workspace-topology-adr-and-canonical-plan.plan.md)
  — authors the ADR superseding
  [ADR-108](../../../docs/architecture/architectural-decisions/108-sdk-workspace-decomposition.md)
  and consolidates the members; owns sequencing.
- **Oak-surface-isolation umbrella:**
  [`future/oak-surface-isolation-and-generic-foundation-programme.plan.md`](future/oak-surface-isolation-and-generic-foundation-programme.plan.md)

## Member plans

Membership is owned here (this index is the membership SSOT); the `programmes:` lineage
edge on each YAML-frontmatter plan mirrors it.

### Area: codegen-time vs runtime

| Plan (home) | Lane | Edge |
| --- | --- | --- |
| [`../sdk-and-mcp-enhancements/current/schema-change-minimal-adaptation.plan.md`](../sdk-and-mcp-enhancements/current/schema-change-minimal-adaptation.plan.md) | current | ✅ |
| [`codegen/future/sdk-codegen-workspace-decomposition.md`](codegen/future/sdk-codegen-workspace-decomposition.md) | future | index-only\* |
| [`codegen/README.md`](codegen/README.md) (codegen-architecture hub) | n/a | index-only\* |
| [`../semantic-search/future/02-schema-authority-and-codegen/bulk-schema-driven-code-generation.md`](../semantic-search/future/02-schema-authority-and-codegen/bulk-schema-driven-code-generation.md) | future | index-only\* |
| [`../semantic-search/future/02-schema-authority-and-codegen/move-search-domain-knowledge-to-codegen-time.md`](../semantic-search/future/02-schema-authority-and-codegen/move-search-domain-knowledge-to-codegen-time.md) | future | index-only\* |

### Area: Oak-specific vs general (framework vs consumer)

| Plan (home) | Lane | Edge |
| --- | --- | --- |
| [`current/workspace-layer-separation-audit.plan.md`](current/workspace-layer-separation-audit.plan.md) | current | ✅ |
| [`future/oak-surface-isolation-and-generic-foundation-programme.plan.md`](future/oak-surface-isolation-and-generic-foundation-programme.plan.md) | future | ✅ |
| [`future/monorepo-workspace-topology-adr-and-canonical-plan.plan.md`](future/monorepo-workspace-topology-adr-and-canonical-plan.plan.md) | future | ✅ |
| [`../sector-engagement/current/sector-reusable-components-adoption.plan.md`](../sector-engagement/current/sector-reusable-components-adoption.plan.md) | current | ✅ |
| [`../semantic-search/future/search-ingestion-sdk-extraction.execution.plan.md`](../semantic-search/future/search-ingestion-sdk-extraction.execution.plan.md) | future | ✅ |
| [`../agentic-engineering-enhancements/current/practice-core-portability-strict-enforcement.plan.md`](../agentic-engineering-enhancements/current/practice-core-portability-strict-enforcement.plan.md) | current | ✅ |

### Spanning both areas

| Plan (home) | Lane | Edge |
| --- | --- | --- |
| [`../sdk-and-mcp-enhancements/active/workspace_topology_exploration.plan.md`](../sdk-and-mcp-enhancements/active/workspace_topology_exploration.plan.md) | active | ✅ |
| [`../speculative/openapi-pipeline-framework.md`](../speculative/openapi-pipeline-framework.md) — generic single-pass generator; **blocked on ADR-108 Step 1** | speculative | index-only\* |

`*` index-only = the plan predates the YAML-frontmatter convention (markdown brief). Membership is
recorded here; retrofitting frontmatter onto those briefs is a separate normalisation.

### Adjacent (touches an area, not core)

[`active/build-tools-workspace-extraction.plan.md`](active/build-tools-workspace-extraction.plan.md),
[`../sdk-and-mcp-enhancements/active/schema-resilience-and-response-architecture.plan.md`](../sdk-and-mcp-enhancements/active/schema-resilience-and-response-architecture.plan.md),
[`../speculative/contract-testing-schema-evolution.md`](../speculative/contract-testing-schema-evolution.md).

## Downstream consumer

[`../sdk-and-mcp-enhancements/current/mcp-tool-taxonomy-and-orientation.plan.md`](../sdk-and-mcp-enhancements/current/mcp-tool-taxonomy-and-orientation.plan.md)
is not a member but depends on this programme: its RQ2 (where a non-curriculum constructed tool
belongs) is answered by the Oak-specific-vs-general split.

## Traversal paths and the maintenance contract

Three well-defined ways to traverse this data coexist by design:

1. **Collection home** (by driver) — each plan lives in the collection of the work that drives it
   (PDR-018). Authoritative for the plan's own content.
2. **This index** — authoritative for programme membership. Points only.
3. **The `programmes:` lineage edge** — on each YAML-frontmatter member, mirrors membership so the
   grouping is greppable.

**Maintenance:** when a member changes lane or moves, update its row here (membership SSOT) and its
`programmes:` edge together. A member is in the programme iff it appears here. On the ADR-200
extraction, retire this index and the edge.

### Lineage edge convention

A top-level frontmatter list (a plan may belong to more than one cross-cutting programme); distinct
from `serves_stream` (the plan's domain stream):

```yaml
programmes:
  - generic-foundation-decomposition
```
