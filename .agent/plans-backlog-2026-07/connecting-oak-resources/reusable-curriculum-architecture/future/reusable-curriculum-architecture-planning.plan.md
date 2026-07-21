---
title: Reusable curriculum architecture strategic planning brief
status: future-strategic
lane: future
collection: connecting-oak-resources/reusable-curriculum-architecture
lineage:
  serves_thread: connecting-oak-resources
  serves_stream: null
  strategic_choice: null
  derives_from:
    - .agent/reports/oak-reusable-curriculum-architecture/oak-reusable-curriculum-architecture.md
    - .agent/reports/oak-reusable-curriculum-architecture/oak-reusable-curriculum-architecture-this-repository.md
    - .agent/reports/oak-reusable-curriculum-architecture/oak-reusable-curriculum-architecture-current-data-estate.md
---

# Reusable Curriculum Architecture Strategic Planning Brief

**Status:** FUTURE — strategic planning brief, not executable implementation.

This plan governs the planning work needed to turn the report findings into a
coherent portfolio of owner-ratified executable plans. It does not authorise
code changes, choose an upstream migration, or treat any existing projection as
the limit of what can be compiled from the bulk data.

## Problem and Intent

### Gap

The report family identifies a connected architectural problem spanning bulk
acquisition, schema interpretation, extraction, search indexing, vocabulary
generation, graph construction, and user-facing claims. The current plan estate
contains relevant plans in several collections, but they predate some of the
evidence and do not yet form one source-accounted programme of work. Several
existing plans also embed assumptions that now require revalidation, including
that the shipped bulk schema is sufficient authority for every payload fact,
that a unit-slug lesson union is exact containment, and that a thread order can
support prerequisite semantics.

The search estate adds a second connected gap. Current hybrid retrieval is a
strong entity-search baseline, but MCP exploration remains parallel
top-results search; current indexes do not expose a general occurrence or
relationship grain; and the reusable-ingestion boundary does not yet allow
bulk and specialised materialised views to converge on one conserved
curriculum model. The primary website use case also introduces a second search
consumer whose ranking and result-shaping needs must not be assumed identical
to those of an agent.

### Harmed users

- Teachers, developers, and agents can receive confident but unsupported
  relationship, containment, completeness, or freshness claims.
- Operators cannot reliably distinguish a locally retrieved bundle from an
  authoritative upstream release or prove that a generated projection accounted
  for all eligible source data.
- Implementers can improve one projection while leaving the same information
  loss or semantic overclaim in search, vocabulary, or another graph view.
- Agents can retrieve plausible curriculum entities but cannot efficiently
  orient, inspect contextual distributions, follow explicit relationships or
  obtain compact path-and-provenance explanations.
- Website users cannot yet benefit from the same semantic-search substrate
  through a supported materialised-view adapter and independently evaluated
  product-search policy.
- Plan owners can start overlapping work without a shared authority model,
  sequencing contract, or disposition of the existing plan estate.

### Causal mechanism

The repository compiles multiple products directly from a mutable bulk-download
directory through partially duplicated orchestration. It lacks one typed,
loss-aware intermediate boundary that preserves source occurrences, context,
conflicts, provenance, and omissions before consumer-specific projection. When
source ambiguity is resolved inside individual projections, each projection can
silently invent a different answer.

Search compounds this mechanism when entity indexes erase occurrence context,
the CLI-shaped ingestion path becomes the reusable contract, and one fixed
retrieval composition is treated as suitable for every consumer. Adding more
Elasticsearch features inside that shape would increase capability without
establishing which curriculum questions, source grains or user outcomes they
serve.

### Constraints

- The current public Oak Curriculum Ontology is the formal ontology available
  to this work today; this plan does not propose changing it.
- The repository may construct any graph or other projection supported by the
  bulk data. Existing generated artefacts are evidence of current behaviour, not
  a ceiling on future design.
- Exact programme-to-variant selection, durable cross-release identity, and
  authoritative release identity must not be invented downstream.
- Upstream work is a dependency or request, not an assumed deliverable.
- Existing useful behaviour must be preserved where it is semantically honest,
  including thread-progressions naming, internal-edge closure, and integer-depth
  validation.
- Elasticsearch Serverless is the selected search execution platform, but its
  continuously updated feature set must be verified against the live project
  before a plan depends on a particular API or entitlement.
- Domain compilation must remain portable and independently testable;
  Elasticsearch-native pipelines, transforms and joins may own projection-local
  work but not the only interpretation of curriculum meaning.
- Bulk-driven MCP search and materialised-view-driven website search may share
  facts, projection builders and retrieval primitives without sharing one
  ranking or result-shaping policy.
- Implementation must follow schema-first, strict-and-complete,
  replace-don't-bridge, TDD, and workspace-boundary doctrine.

### Success

The planning effort produces a small, sequenced set of owner-ratified executable
plans in their proper collections. Together they assign every repository-owned
finding exactly once, expose every upstream dependency, retire contradictory
assumptions, and define behaviour-level acceptance evidence from acquisition to
consumer answer.

It also produces a decision-complete search-exploration tranche: a source
adapter contract, a justified Elastic projection family, an agent exploration
protocol, independent agent and website policy requirements, and measured
decision gates for every proposed Elasticsearch capability.

## End Goal, Mechanism, and Means

### End goal

A decision-complete implementation portfolio that makes this repository a
faithful compiler of received curriculum releases into explicit, bounded,
question-led projections, without claiming semantic authority it does not have.

### Mechanism

Plan around one conservation boundary:

```text
received bundle
  -> whole-bundle validation and local identity
  -> typed source-accounting representation
  -> explicit graph, search, vocabulary, and analytical projection contracts
  -> consumer-named retrieval and serving policies
  -> MCP, website, graph, vocabulary, and other surfaces
```

Each transition must state its authority, retained information, transformation,
omissions, conflicts, and refusal conditions. Consumer projections may differ
because their questions differ; they may not disagree because information was
silently discarded or semantics were invented.

For search, bulk and materialised-view adapters meet at the source-accounting
representation rather than at either transport shape. Entity, occurrence,
relationship, passage and analytical indexes are selected as explicit
projections. Elasticsearch performs retrieval and projection-local execution;
it does not become the domain authority.

### Means: planning workstreams

These are planning outcomes, not implementation tasks. Promotion must turn each
accepted outcome into executable TDD slices in the owning collection.

1. **Semantic-safety disposition.** Define the smallest independently shippable
   correction plan for false prerequisite, exact-containment, National
   Curriculum completeness, and other user-facing semantic overclaims. Separate
   copy corrections from data-model corrections and typed refusals.
2. **Bundle evidence baseline.** Define a repeatable, non-mutating census of the
   received schema and payloads: cardinalities, duplicates, conflicts, contextual
   definitions, variant factors, requested-versus-returned scope, and current
   projection losses. This evidence is a blocking input to compiler design.
3. **Acquisition and provenance contract.** Decide the local immutable-bundle
   identity, staging, whole-bundle validation, hashing, atomic promotion,
   retention, and requested/returned reconciliation contract. Keep producer
   release identity explicitly separate.
4. **Schema-traceable consumer contract.** Reframe the existing bulk codegen plan
   around the schema-and-payload pair rather than assuming the schema alone is
   complete. Decide how disagreements fail, surface, and remain reproducible.
5. **Source-accounting representation.** Decide the minimum typed intermediate
   representation that preserves entities, occurrences, placements, ordering,
   contextual values, conflicts, source locations, and variant factors. Prove
   that it is simpler than maintaining projection-specific extraction paths.
6. **Projection contracts.** For search, graphs, vocabulary, and other generated
   products, state the user question, allowed inference, bounds, completeness
   semantics, omissions, provenance, and known-answer evidence. Do not choose a
   graph where a simpler typed view answers the question more faithfully.
7. **Search source portability.** Define bulk, API-supplement and public
   materialised-view adapters that emit one conserved curriculum contract while
   declaring and retaining different source capabilities. Reconcile this
   contract with ADR-140's ingestion SDK boundary.
8. **Elastic projection decision.** Evaluate entity, occurrence or placement,
   relationship, passage and analytical-rollup indexes against known-answer
   agent and website questions. Define coherent versioning, atomic promotion,
   population validation, provenance and omission manifests for the accepted
   projection family.
9. **Agent exploration protocol.** Define bounded orient, search, summarise,
   expand, compare, explain and fetch operations with progressive disclosure,
   typed refusal and compact evidence. Compare them with the current aggregated
   search plus graph-tool interaction rather than assuming a larger tool set is
   better.
10. **Consumer retrieval policies.** Define independent agent and website
    acceptance criteria, then evaluate current RRF, weighted RRF, normalised
    linear fusion, semantic reranking, diversification, highlighting,
    contextual aggregation and explicit query rules only where they address a
    named failure mechanism.
11. **Elasticsearch capability probes.** Verify live Serverless availability,
    entitlement, latency and cost for ES|QL lookup joins, transforms, enrich,
    statistical association aggregations and Elastic Graph Explore before any
    executable plan depends on them. Statistical association remains candidate
    evidence, never an authored curriculum relationship.
12. **Workspace ownership and landing map.** Apply the repository topology:
   reusable domain compilation belongs in an SDK or library; generation belongs
   in codegen; the search CLI remains an operator interface; search retrieval
   belongs in the search SDK; graph query views belong in graph-corpus-sdk; MCP
   and other apps remain thin consumers.
13. **Existing-plan reconciliation.** Review every adjacent current and future
   plan against the new evidence, then keep, amend, supersede, split, or reject
   it explicitly. No new executable plan may duplicate an undispositioned plan.
14. **Ratification and documentation propagation.** Decide whether the accepted
   architecture amends ADR-089 and ADR-140 or requires a successor ADR, then
   create the source-adapter capability, consumer-policy, and known-answer
   evaluation contracts in their owning executable plans. Treat these as
   candidates until owner ratification. The current operational semantic-search
   architecture remains authoritative until runtime behaviour actually changes;
   a future design must not be documented as if it were already deployed.

### Elastic build-versus-buy boundary

Use Elasticsearch Serverless's first-party retriever framework, semantic text,
semantic reranking, query rules, highlighting, aggregations, ES|QL, transforms,
ingest pipelines and enrich mechanisms where a probe shows that the native
capability meets the required question, evidence, latency and cost contract.
Do not build bespoke fusion, chunking, diversification, join or analytical
machinery before testing the corresponding supported native mechanism.

The source-accounting curriculum compiler remains repository-owned because no
Elastic integration owns Oak's source authority, occurrence semantics,
epistemic classes, omissions or non-Elastic graph and vocabulary projections.
That is a domain boundary, not a preference for bespoke infrastructure.

## Domain Boundaries and Non-Goals

### In scope for the planning effort

- repository-owned acquisition, validation, identity, compilation, projection,
  serving semantics, and behavioural evidence;
- plan relationships across codegen, curriculum SDK, search CLI, search SDK,
  search contracts, graph corpus, graph substrate, and MCP consumers;
- reusable search composition across bulk and specialised materialised-view
  sources, including the primary website as a distinct consumer;
- Elastic Serverless projection, retrieval, aggregation, relationship-expansion
  and diagnostic opportunities justified by named questions and evidence;
- upstream interface obligations expressed as explicit dependencies or feature
  requests;
- a sequencing and promotion model that permits semantic-safety corrections to
  land before the full compiler architecture.

### Non-goals

- implementing any correction in this strategic brief;
- importing another application repository into this workspace;
- designing or committing the upstream database migration;
- changing the current Oak Curriculum Ontology;
- fabricating canonical programme-to-variant relations, prerequisites, global
  definitions, release identity, or cross-release lineage;
- preserving current workspace boundaries when evidence shows a reusable domain
  capability is misplaced in an app;
- forcing all reusable curriculum questions into one universal graph;
- exposing arbitrary Query DSL or ES|QL as an unrestricted MCP operation;
- encoding curriculum authority only in Elasticsearch configuration;
- assuming Elastic Graph Explore is a domain graph or that current Serverless
  documentation proves its availability in the live project;
- forcing agent and website search to use one retrieval policy without
  independent evidence.

## Dependencies and Sequencing Assumptions

| Dependency | Class | Minimum shippable shape if absent |
| --- | --- | --- |
| Report family remains the accepted evidence base | Blocking | No portfolio should be cut from a different problem statement without first superseding the reports explicitly. |
| Fresh local census of the received bulk bundle and current projections | Blocking for compiler and projection design | Semantic-copy corrections and typed refusals can still be planned and shipped independently. |
| Owner decision on the desired executable-plan tranche boundaries | Blocking for promotion to implementation plans | This brief can propose boundaries, but cannot ratify priority or execution ownership. |
| Producer-supplied immutable release identity and exact variant-placement contract | Beneficial, upstream | Use honest local bundle identity and release-scoped occurrence identity; refuse exact or longitudinal answers the source does not support. |
| Bulk schema exposed separately from a full download | Beneficial | Validate and retain the schema shipped in the same received bundle; do not make a separate endpoint a prerequisite for correctness. |
| Full upstream database migration | Beneficial, long-horizon | Correct local semantics and build a loss-aware compiler from the current published contract without predicting the migration. |
| Existing graph and search plans | Beneficial evidence, not authority over new findings | Reconcile them in the planning pass; preserve only decisions that remain supported. |
| Representative public materialised-view contract and fixtures | Blocking for source-portability acceptance | Bulk-driven compilation and agent exploration can still be planned; do not claim the website adapter is proven. |
| Known-answer agent exploration journeys | Blocking for new index and MCP protocol selection | Preserve the current search baseline; no additional projection or tool is justified by feature availability alone. |
| Website search intent, availability and product-value evidence | Blocking for website retrieval-policy selection | Share source compilation and low-level primitives without selecting a website ranker. |
| Live Elasticsearch Serverless capability and cost verification | Blocking only for the capability that depends on it | Use supported ordinary indexes, filters and retrieval primitives; do not plan around an unverified API. |

### Strategic sequence

1. Cut the semantic-safety correction plan and the evidence-census plan.
2. Use the census to settle acquisition, schema/payload, and source-accounting
   decisions.
3. Cut one compiler-boundary plan and only the projection plans justified by
   named user questions.
4. Establish the known-answer agent and website question sets before selecting
   new Elastic projections or ranking stages.
5. Probe source portability, structural indexes and progressive MCP exploration
   as reversible experiments; retain only mechanisms that improve the named
   outcome.
6. Reconcile search, graph, codegen, SDK, MCP and website-facing plans before
   promoting any overlapping implementation.
7. Keep upstream requests on their own ownership path; do not block safe local
   corrections on long-horizon source redesign.

This is evidence order, not a claim that every implementation must land in one
serial release.

## Adjacent Plans Requiring Explicit Disposition

| Existing plan | Planning question raised by the reports |
| --- | --- |
| [Bulk schema-driven type generation](../../../semantic-search/future/02-schema-authority-and-codegen/bulk-schema-driven-code-generation.md) | How must it change when the shipped schema and payload disagree, and when types must describe the received bundle rather than an ideal schema? |
| [Search-CLI ingestion pipeline consolidation](../../../architecture-and-infrastructure/future/search-cli-ingestion-pipeline-consolidation.plan.md) | Does one loss-aware compiler dissolve the dual-emitter problem more completely than consolidating only Elasticsearch writers? |
| [Graph tools value redesign](../../knowledge-graph-integration/current/graph-tools-value-redesign.plan.md) | Which current edge and coverage semantics must be corrected before further graph feature work, and which useful bounded-view mechanics remain valid? |
| [Graph stack](../../knowledge-graph-integration/active/graph-stack.plan.md) | Which substrate capabilities are reusable unchanged, and which Oak-specific source-accounting concerns belong above the generic graph layer? |
| [Unified versioned ingestion](../../../semantic-search/current/unified-versioned-ingestion.plan.md) | Does its index-version identity preserve the received bundle identity without misrepresenting it as producer release identity? |
| [Search ingestion SDK extraction](../../../semantic-search/future/search-ingestion-sdk-extraction.execution.plan.md) | Is the proposed package boundary the correct home for reusable compilation, or only for Elasticsearch-specific ingestion? |
| [Modern Elasticsearch features](../../../semantic-search/future/04-retrieval-quality-engine/modern-es-features.md) | Which feature candidates remain warranted when evaluated through the source-accounting model, live Serverless availability and agent or website user outcomes? |
| [Document relationships](../../../semantic-search/future/04-retrieval-quality-engine/document-relationships.md) | Should its relationship shape become an explicit occurrence-aware relation projection, and which proposed edges are source facts versus candidates? |
| [Search decision model](../../../semantic-search/future/05-query-policy-and-sdk-contracts/search-decision-model.md) | How should it distinguish agent and website policy while sharing retrieval primitives and curriculum facts? |
| [MCP result pattern unification](../../../semantic-search/future/06-mcp-consumer-integration/mcp-result-pattern-unification.md) | Does its result contract support progressive orientation, expansion, explanation, source capability and epistemic evidence? |
| [Ground-truth expansion](../../../semantic-search/future/09-evaluation-and-evidence/ground-truth-expansion-plan.md) | Does its evidence set cover end-to-end agent exploration journeys, structural correctness, redundancy, tokens and refusal behaviour as well as ranked relevance? |

### Ratification watchlist

- **ADR-089:** clarify that “index everything” means preserve source-supported
  entities, occurrences, relations, provenance and omissions through explicit
  projections; it does not require one universal index or invented semantics.
- **ADR-140:** clarify the reusable ingestion boundary so bulk bundles and
  specialised public materialised views can enter through capability-declaring
  adapters into one conserved curriculum representation.
- **Operational search architecture:** do not rewrite its current-state claims
  during planning. Update it only with implementation evidence when the runtime
  changes.
- **Execution contracts:** make known-answer evaluation, source-adapter
  capabilities, and agent-versus-website consumer policies explicit outputs of
  promoted executable plans rather than implied properties of this brief.

## Strategic Acceptance Criteria and Success Signals

The planning effort is complete when:

1. Every `REPO-*` finding in the repository issue report has one owning
   executable plan, an explicit upstream dependency, or a recorded non-action
   disposition; none is duplicated.
2. The first implementation tranche corrects harmful semantic claims without
   waiting for upstream redesign or the full compiler build.
3. A source-accounting contract defines what is conserved from bundle to
   intermediate representation and from that representation to every accepted
   projection.
4. Acquisition acceptance distinguishes retrieval time, local bundle identity,
   generated artefact identity, and producer release identity.
5. Schema acceptance validates every file in the exact bundle and makes
   schema/payload disagreement visible; no hand-authored template can silently
   narrow the input contract.
6. Search and graph plans each name the user question they answer, their bounds,
   omissions, snapshot semantics, and known-answer behavioural evidence.
7. Existing adjacent plans have explicit keep, amend, supersede, split, or
   reject dispositions, with links from successor plans where needed.
8. Each promoted executable plan specifies TDD slices at the affected unit,
   integration, and running-system levels, using independent known answers
   rather than self-generated baselines.
9. Plan indexes expose every new plan through the canonical root-to-collection
   lifecycle chain.
10. Bulk and representative materialised-view adapters have a strict capability
    contract and prove equivalent canonical output where source semantics match
    without erasing richer source-specific information.
11. Every proposed Elastic index or feature has a named question, independent
    evaluation, cost and latency envelope, live Serverless capability evidence
    and an explicit rejection condition.
12. The selected MCP protocol demonstrates bounded orientation, retrieval,
    contextual summary, relationship expansion, comparison, explanation and
    detail fetch with source and epistemic evidence.
13. Agent and website retrieval policies share conserved facts and primitives
    while each has its own user-outcome acceptance criteria; one shared policy
    is selected only if it independently passes both contracts.

Success is not “a larger graph”, “more generated types” or “more Elastic
features”. It is that supported questions become more answerable and
unsupported questions fail more honestly, with less duplicated transformation
logic and lower agent or user interaction cost.

## Risks and Unknowns

| Risk or unknown | Planning response |
| --- | --- |
| A broad compiler programme delays urgent semantic corrections | Require the semantic-safety tranche to be independently promotable and shippable. |
| The intermediate representation becomes a universal domain model | Size it to information conservation and named consumers; exclude authored semantics the source does not provide. |
| Existing plans are treated as commitments and patched around | Run an explicit disposition pass before creating overlapping executable work. |
| Search indexing needs projection-specific denormalisation | Preserve it as an explicit downstream projection over the source-accounting representation, not as a second source interpretation. |
| Graph enthusiasm drives the data model | Start from known questions and compare graph, ordered sequence, table, and typed-view answers before choosing representation. |
| Local hashes are mistaken for upstream release lineage | Name and type local bundle identity separately and test the distinction at consumer boundaries. |
| Stable variants across releases remain unspecified | Keep identities release-scoped; record continuity as unavailable until the producer publishes durable lineage semantics. |
| Upstream migration changes the eventual source model | Depend on a narrow source contract and regenerate projections; do not mirror an unratified future database design. |
| “Use more Elastic” becomes the objective | Require a known-answer question, causal hypothesis, independent measure and falsifier for every capability. |
| The projection family becomes index proliferation | Add only indexes that materially improve a named question; keep one coherent generation and alias lifecycle. |
| Materialised-view support freezes database internals into the SDK | Adapt a stable public view contract into the conserved representation; prohibit database-table and application-internal imports. |
| Agent and website ranking silently diverge in curriculum facts | Share compiler output and provenance invariants; allow only policy and presentation differences. |
| Statistical association is presented as authored curriculum structure | Label co-occurrence and similarity as candidate evidence and keep them outside source-fact relationship kinds. |
| Domain semantics move into Elastic pipelines or ES\|QL | Restrict Elastic-native transformations to projection-local work reproducible from compiler output. |
| MCP exploration grows into a large, redundant tool surface | Design a small progressive protocol and measure total interaction cost rather than tool count. |

## Promotion Trigger

Promote this brief from `future/` when the owner opens a dedicated planning
session and confirms that the report family is the planning evidence base. The
promoted planning session must begin by:

1. revalidating the current bulk bundle and affected code paths;
2. checking adjacent-plan status and supersession;
3. ratifying the semantic-safety tranche boundary; and
4. establishing the first known-answer agent and website search journeys;
5. verifying the representative public materialised-view contract and the live
   Elasticsearch Serverless capability boundary; and
6. choosing the owners and collections for the remaining executable plans; and
7. ratifying the ADR amendment or successor-ADR path while preserving the
   current operational architecture as current truth until implementation.

Implementation details, cycle boundaries, and commit-sized acceptance tests are
finalised only in those promoted executable plans. Completion of this strategic
brief means the executable portfolio is decision-complete and discoverable; it
does not mean the implementation is complete.

## Foundation

- [Principles](../../../../directives/principles.md)
- [Testing strategy](../../../../directives/testing-strategy.md)
- [Schema-first execution](../../../../directives/schema-first-execution.md)
- [Plan lifecycle and templates](../../../templates/README.md)
- [Lifecycle triggers](../../../templates/components/lifecycle-triggers.md)

First question at every promotion boundary: could this be simpler without
compromising source fidelity, semantic honesty, or user value?
