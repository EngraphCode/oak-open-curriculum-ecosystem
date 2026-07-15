# Oak reusable curriculum architecture — source-first, authority-aware synthesis

**Date:** 14 July 2026; updated 15 July 2026 with the Elasticsearch Serverless
curriculum-exploration synthesis

**Status:** Canonical strategic synthesis for this concept exploration; not a
ratified architecture, implementation plan or substitute for executable
contracts

**Report family:** [index and reading order](./README.md)

**Detailed issue registers:** [this repository](./oak-reusable-curriculum-architecture-this-repository.md)
and [the current Oak data estate](./oak-reusable-curriculum-architecture-current-data-estate.md)

## Executive conclusion

Oak should publish a faithful, immutable and release-qualified curriculum data
bundle, then derive the simplest truthful projection for each validated user
question. A graph is appropriate when relationships and traversal materially
help; an ordered projection, hierarchy, lookup, page or report is preferable
when it preserves the required meaning more directly.

This repository should become a source-complete, loss-aware compiler of that
bundle and a reusable curriculum exploration engine over its projections. It
can construct any graph or Elasticsearch index supported by the bulk data; its
current corpus and indexes are only implementation selections. It must
nevertheless refuse to
turn missing upstream authority into inferred fact. In particular:

- thread adjacency is not prerequisite dependency;
- a unit-slug lesson union is not exact variant membership;
- a retrieval timestamp is not source release identity;
- one chosen keyword definition is not context-independent meaning;
- candidate semantic similarity is not an authored curriculum assertion.

The programme-to-variant relationship is a long-standing domain complexity.
Its durable meaning belongs at the authoritative source-data boundary rather
than in a new consumer-owned interim view or downstream graph compiler. This
does not justify waiting on unrelated defects:

- **correct now:** false local graph semantics, unsupported National Curriculum
  completeness claims, one-row API querying, schema/data drift, deleted IDs and
  factors, missing structured questions, mutable downloads, non-atomic
  publication, incomplete provenance and weak graph contracts;
- **assign to source authority:** canonical
  programme-placement-to-unit-variant semantics, durable
  entity/variant/placement identity, longitudinal lineage and authoritative
  historical release behaviour;
- **until then:** preserve all source-backed records and factors, label legacy
  or aggregate projections explicitly, and do not infer a canonical mapping.

The current Oak Curriculum Ontology remains the formal ontology available
today. This work neither changes it nor makes it a mandatory gateway for every
source-derived view. Candidate reusable meanings, alignments and prerequisites
remain separate, evidence-bearing semantic work.

The proposed three-report structure is sound if it is an authority split:

- the [local issue register](./oak-reusable-curriculum-architecture-this-repository.md)
  owns current defects and acceptance conditions in this repository;
- the [data-estate issue register](./oak-reusable-curriculum-architecture-current-data-estate.md)
  owns current producer, database and publication issues;
- this synthesis owns the stable architectural direction and decision
  boundaries.

Without that distinction, the same mutable diagnosis would be copied three
times and drift. Ratified schemas, code, ADRs and source-owner contracts still
govern their own domains; “canonical” here means canonical within this research
report family.

## Decision capsule

> **Canonical programme-to-variant semantics should be owned and published at
> the authoritative source-data boundary. Until that contract is ratified and
> published, consumers preserve only source-backed relations and identifiers,
> label variant-unqualified or legacy-resolved associations explicitly, and do
> not infer or mint a canonical programme-to-variant mapping.**

This is not a general deferral. Current publication can and should expose
normalised programme, unit, variant, lesson, quiz and question records with
release-qualified identities, factors, order and relationship rows. What is
deferred is the claim that an interim resolution is the enduring canonical
domain relationship.

“Source-authority-owned” is a responsibility boundary, not evidence that a
particular change programme exists or has accepted the obligation. A written,
ratified source contract is part of the gate.

## Source, privacy and evidence boundary

This synthesis draws on:

- the two companion issue registers;
- current code, documentation and the downloaded bulk snapshot in this
  repository;
- public source snapshots of Oak OpenAPI, Oak Database-Tools, Oak Curriculum
  Ontology and AILA Atomic Concepts;
- the repository's concept-exploration, reasoning, metacognition, graph and
  decision-lens guidance;
- the evidence boundary that deployment state and licensing determinations are
  not established by a source checkout.

The motivating requirements are represented only as de-identified,
source-neutral concepts. This report contains no quotation, identity,
attribution, local path, private repository detail or private implementation
fact. No conclusion depends on a non-public source.

The public repositories were inspected at:

| Repository | Commit |
| --- | --- |
| Oak Curriculum Ontology | 610ba79a96bbfa5148e4a50360b05c12e79aaf83 |
| AILA Atomic Concepts | f5c7ce2030937d469228b894dc0fe5e656ffe839 |
| Oak OpenAPI | f64b8f3fe8bee849016c61e60cc0a454d424369b |
| Oak Database-Tools | 4e24c728a55f033b6a04c05ee189501b5b9bc2c3 |

The analysed bulk snapshot records retrieval on
2026-06-10T16:43:00.027Z. That is the downloader's time, not producer
generation or source release identity.

The checked-out Hasura and SQL definitions establish the design and
implementation present at their pinned public source revision. They do not
establish the metadata revision, refresh state, producer image or object
generation used by any deployed environment. A materially different deployed
definition would change operational conclusions about that environment, not
the source-level findings at the pinned commits.

## The problem, reframed

The opportunity is not to create one universal curriculum graph. It is to make
several different kinds of curriculum knowledge reusable without erasing their
origin or authority.

Four concerns recur:

1. **Faithful publication** — what entities, revisions, placements, factors,
   questions and orders did a source release contain?
2. **Deterministic projection** — what complete, reproducible view answers a
   bounded user question?
3. **Reusable meaning** — which occurrences may express the same concept,
   dependency, assessment target or framework alignment?
4. **Workflow and judgement** — how should curriculum teams and teachers
   inspect, compare, review and adapt the evidence?

The first two are principally data and software-contract problems. The third
requires subject-aware evidence and review. The fourth is a product and
governance problem. A single master record would centralise unlike claims and
create a new authority dispute.

The durable distinctions are:

- entity versus occurrence or placement;
- continuing entity versus release-specific revision;
- programme membership versus variant selection;
- authored sequence versus prerequisite dependency;
- exact repetition versus semantic equivalence;
- source fact versus deterministic projection;
- candidate inference versus reviewed assertion;
- graph representation versus authority.

## Concept-exploration movements

### Movement 1 — expand the option space

The evidence supports at least six broad approaches:

1. keep the current graph corpus and add a few types;
2. create a single estate-wide semantic graph;
3. require every source-derived view to pass through the current ontology;
4. wait for a future source-system redesign before improving any consumer;
5. publish a faithful source bundle and build question-led projections;
6. colocate the API and consumer repositories and treat shared code as the
   architecture.

The fifth option is the strongest foundation. It can coexist with any future
source-system redesign without depending on a non-public design, keeps the
current ontology usable, and lets this repository exploit all available bulk
signals. Waiting would leave known false claims in place; colocation can
improve integration but cannot create domain authority.

### Movement 2 — connect the observations

The source disagreement, current graph overclaims and general curriculum-tooling
needs are connected by one recurring error: collapsing context before
knowing which user question makes that context irrelevant.

- flattening variants creates ambiguous lesson membership;
- flattening occurrences hides where a KLP, question or term appears;
- flattening revision and entity prevents release comparison;
- flattening evidence status turns candidates into facts;
- flattening output structures calls every result a graph;
- flattening curriculum context encourages isolated lesson review.

The counter-principle is:

> Preserve source context and identity first; make a named, bounded and
> reversible projection only for a validated question.

### Movement 3 — stress-test the architecture

The architecture must survive:

- one unit slug with different lesson sets across programme factors;
- the same lesson reused in several units or programmes;
- same-spelled terms with different contextual definitions;
- incomplete or contradictory schema and payload;
- the source system changing relationship representation;
- release edits, moves, splits, merges and retirements;
- assessment questions reused or revised independently of placement;
- a graph request too large to return completely;
- candidate semantic work remaining unreviewed;
- a user needing useful lesson and unit context before the upstream redesign is
  complete.

A source-first, loss-aware architecture can represent or explicitly refuse each
case. A slug-keyed master graph cannot.

### Movement 4 — distil the architecture

~~~text
current authored curriculum database
              |
              v
release-qualified current source records
              |
              v
provider-owned pure bulk compiler
              |
              v
immutable schema + data + manifest + validation bundle
              |
              v
source-complete, loss-aware typed snapshot in this repository
              |
              +--> complete typed lookups, tables and reports
              +--> ordered, ranked or hierarchical projections
              +--> bounded graphs where traversal helps

authoritative source-domain contract
  -> canonical programme/variant + longitudinal identity semantics
  -> a later compatible versioned source publication

current ontology -------- explicit mapping at serving boundaries
candidate semantics ----- explicit mapping at serving/review boundaries
~~~

No projection becomes the authored source of truth. No ontology or candidate
semantic graph becomes a compulsory transport layer. A future source change
revises the published contract deliberately rather than being
reverse-engineered by a consumer.

## Generalised curriculum capability requirements

The architecture must support broad, source-neutral capability classes:
richer curriculum classification, contextual and sequential relationships,
connections between curriculum and assessment, review at multiple levels,
version-aware comparison and explicit framework alignment. These are generic
architectural themes, not a transcription or attribution of any private
discussion.

The public evidence separates those themes into the following categories.

### Present in public bulk but underused downstream

The bulk already includes KLP occurrences, pupil outcomes, misconceptions and
responses, teacher tips, content guidance, contextual vocabulary, transcripts,
prior-knowledge text, threads and National Curriculum statement occurrences.
This repository can preserve and project them more fully now.

### Present in pinned public source definitions but lost before bulk publication

The inspected view and schema layers contain entity IDs, unit-variant IDs,
programme context, factors, orders, quiz/question identities and structured
starter/exit questions. A better current bulk publication can retain them
without waiting for new curriculum semantics.

### Not established by the public sources

The inspected sources do not establish:

- additional pedagogical classifications;
- semantic equivalence or dependency relationships;
- mappings from assessment items to curriculum claims;
- fine-grained alignment between different curriculum frameworks.

These need new authoring, evidence or reviewed candidate workflows. A richer
bulk bundle cannot invent them.

### Product and workflow requirements

Multi-granularity review, version comparison, subject-aware modelling and
framework alignment are product and workflow requirements. Better data is
necessary but not sufficient. They should be prototyped with curriculum
creators and teachers and evaluated for task success, comprehension, friction
and reversibility.

This separation preserves the architectural insight without exposing the
wording, provenance or distinctive taxonomy of any private source.

## Evidence capsule: the bulk disagreement

The current snapshot has two structural lesson surfaces:

| Signal | Count |
| --- | ---: |
| Raw sequence unit-lesson occurrences | 12,446 |
| Published sequence occurrences | 12,298 |
| New sequence occurrences | 148 |
| Top-level lesson rows | 12,864 |
| Top-only unique unit/lesson slug pairs | 403 |
| Duplicate top-level occurrences | 373 |

The 148 unpublished placements reconcile with intended state filtering. The 403
top-only pairs occur at KS4 variant boundaries. The retained sequence surface
collapses variant context, while the historical top-level lesson query unions
rows by bare unit slug and then discards remaining programme provenance.
Repeated bare-slug fetches also create indistinguishable duplicates.

The pinned OpenAPI source adds a separate limit-one regression. Removing it
restores the earlier union if no qualification changes. The pinned public
lesson materialised-view definition contains lesson ID, unit-variant ID,
programme slug, factors, unit/lesson order and assessment data; the inspected
wrappers and formatters drop much of it.

The detailed diagnosis and acceptance conditions are ESTATE-001 through
ESTATE-010 in the [data-estate issue register](./oak-reusable-curriculum-architecture-current-data-estate.md).

The conclusion is narrower than “the database is wrong”:

- publication-state filtering behaves as intended in the snapshot;
- the historical bulk shape is deliberately lossy at variant boundaries;
- current source contains a confirmed one-row regression;
- schema, data and runtime publication are not one atomic release;
- neither current bulk surface supports exact programme-variant membership;
- the source layer can publish more faithful records without settling the
  source-authority-owned canonical relationship.

## Stable variants and releases

“Stable” must name the identity being promised:

| Identity | Purpose |
| --- | --- |
| Snapshot row | Refer to one record in one immutable bundle |
| Curriculum entity | Continue a lesson, unit, programme, quiz or question across revisions |
| Unit variant | Distinguish one content-membership variant |
| Placement | Identify one use of an entity by a parent and its order/state |
| Revision | Identify immutable state in one release |
| Semantic meaning | Link reviewed equivalent meaning across contexts |

The current database implementation exposes numeric IDs, UIDs, state, release
IDs and archives. It appears to preserve UIDs across states for a continuing
numeric entity ID. Relationship tables use endpoint composites, state, order
and release rather than independent placement UIDs.

That is useful implementation evidence, not yet a public lifecycle guarantee.
For snapshot-local graphs, release plus source entity/variant/placement identity
is sufficient. Cross-release comparison requires a contracted continuing ID or
source-authored lineage. Slug, text and content hashes are not acceptable
undocumented fallbacks.

The source-authority contract needs to answer:

- whether entity and variant IDs are immutable and never reused;
- whether rename and content edit retain identity;
- when a changed membership revises or replaces a variant;
- whether endpoint-pair relationships continue through reorder, removal and
  re-addition;
- how moves, splits, merges, replacements and retirement are represented;
- which historical releases are immutable and retrievable.

Until then, the bulk should expose release-scoped identity honestly and avoid
claiming longitudinal continuity.

## Assessment and quiz questions

The public source and analysed bundle establish a technical discrepancy:
structured assessment exists in the pinned source definitions but is absent
from the analysed bulk payload. This report does not publish a non-public
licensing determination. Any inclusion must follow verified public eligibility,
restriction, attribution and asset rules.

~~~text
lesson -> quiz placement -> quiz
quiz -> question placement -> question
question -> answer option
question -[candidate or reviewed]-> learning target
~~~

Question identity, order and reuse are source concerns. Question-to-learning
target mapping is not established by publication eligibility or textual
similarity; it remains authored, candidate or reviewed according to its actual
provenance.

## What this repository should become

The local issue register identifies seventeen current problems. The governing
direction is:

1. acquire and identify one immutable bundle;
2. validate its schema, records and cross-references completely;
3. compile one source-accounting, occurrence-preserving typed snapshot;
4. record conflicts and omissions rather than applying “first seen wins”;
5. derive a named projection only for a known user question;
6. make graph completeness, bounds, anchors and failure modes explicit;
7. expose source release, transform version and epistemic status.

The first local corrections are independent of any upstream redesign:

- REPO-001 retires false prerequisite semantics;
- REPO-002 qualifies variant-unqualified lesson association;
- REPO-003 and REPO-004 repair local schema generation and acquisition
  integrity while preserving the upstream release-identity boundary;
- REPO-005 through REPO-007 establish one loss-aware, source-accounting
  compiler and separate independent conflict mechanisms;
- REPO-008 through REPO-010 preserve already-correct projection and edge-closure
  behaviour while correcting remaining names, bounds, continuation and
  user-facing language;
- REPO-011 makes local corpus identity and integrity inspectable without
  inventing producer provenance;
- REPO-012 prevents reported National Curriculum associations from being
  presented as complete coverage or gap evidence;
- REPO-013 is an acquisition acceptance slice of REPO-004: reconcile requested
  and returned subject files while leaving eligibility rules producer-owned.
- REPO-014 through REPO-017 turn search from a fixed set of entity lookups into
  a source-portable curriculum exploration capability: a real MCP exploration
  protocol, explicit source adapters, occurrence and relationship projections,
  and separately evaluated agent and website retrieval policies.

Source-accounting completeness belongs at the compiler boundary and is relative
to the declared bundle, not the underlying database. A representation/omission
manifest must make that boundary machine-visible. Individual projections remain
deliberately scoped; graph completeness means complete membership and internal
edges inside a declared structural bound, not a copy of the entire bundle.

## Elasticsearch Serverless as a curriculum exploration engine

### The problem is exploration, not “adding graph to search”

The repository already has a credible hybrid-search baseline. Lesson and unit
search use four-way reciprocal rank fusion over lexical and ELSER retrieval on
content and structural fields; thread and sequence search use two-way hybrid
retrieval. The `explore-topic` MCP tool searches lessons, units and threads in
parallel and formats a small cross-scope result.

That operation is useful discovery, but it is not yet structural exploration.
It cannot orient an agent to the available corpus, expose contextual result
distributions, follow an explicit curriculum relation, compare two contexts or
releases, or explain a result with path and provenance evidence. Increasing
result counts or adding a statistical graph feature would not close that gap.

The target question is:

> How can agents and product search users explore curriculum entities, text,
> placements and relationships efficiently, while every result remains
> traceable to the conserved source and every unsupported semantic claim is
> refused or qualified?

Elasticsearch should be one projection and execution engine for that question.
It should not become the authority for curriculum meaning or the only place
where source interpretation exists.

### Reusable architecture

The search capability should be separated into six boundaries:

1. **Source adapters** acquire bulk bundles, API supplements or specialised
   materialised-view records and declare their source identity and
   capabilities.
2. **Curriculum compiler** produces the source-accounting intermediate
   representation: entities, occurrences, placements, relationships,
   provenance, conflicts, omissions and release identity.
3. **Elastic projections** produce purpose-built documents and mappings from
   that representation.
4. **Ingestion and lifecycle** upload, validate, atomically promote, roll back
   and report mapping and population integrity.
5. **Retrieval policies** compose query, filtering, expansion, fusion,
   reranking, diversification and result shaping for a named consumer.
6. **Consumer adapters** expose those policies through MCP tools, the primary
   website, the CLI and future hosts without reimplementing search logic.

ADR-140 already establishes the adjacent requirement for a reusable search
ingestion SDK and a thin CLI. It does not yet establish the source-adapter
contract, the materialised-view use case, the source-accounting compiler as the
portability seam, or separate retrieval policies for agent exploration and the
primary website. The new direction should extend that decision rather than
create a second ingestion architecture.

“Modularise all search functionality” must not produce one package that owns
acquisition, domain modelling, Elasticsearch administration, ranking and
presentation. The modules above have different reasons to change. Reuse should
occur through their explicit contracts.

### Source portability

Bulk JSON and specialised materialised views are alternative inputs, not the
stable interface. Each adapter should emit the same conserved conceptual model
where the sources are semantically equivalent and should retain declared
source-specific capabilities where they are not.

A materialised view may expose exact placement identity, relationship rows or
release metadata that the current bulk omits. Its adapter must not down-convert
those signals into the lossier bulk shape. Conversely, a bulk adapter must not
fabricate capabilities merely so that both adapters appear symmetrical.

Each adapter should therefore declare capabilities such as occurrence support,
explicit relationship kinds, structured assessment availability, stable source
identifiers, release comparison and historical access. A consumer can then
answer, qualify or refuse a question from the actual source capability rather
than an assumed lowest common denominator.

### Purpose-built Elasticsearch projection family

One complete conserved representation does not imply one universal search
document. The smallest useful projection family is:

1. **Entity indexes** for direct lesson, unit, sequence, thread, keyword and
   other entity retrieval.
2. **Occurrence or placement index** with one document per curriculum
   placement, retaining programme, variant, order, release and source context.
3. **Relationship index** with one document per supported source-to-target
   relation, its type, context, provenance, release and epistemic class.
4. **Passage index** for transcript sections and other substantial text, with
   entity and occurrence context suitable for semantic retrieval and compact
   evidence extraction.
5. **Analytical rollups** for coverage, distributions, integrity and other
   explicit read models.

The relationship index is the initial structural-search primitive. A relation
document can be queried, filtered, aggregated and joined to lightweight entity
details without requiring Elasticsearch to pretend that statistical
co-occurrence is an authored graph. Elasticsearch Serverless does not support
the Elasticsearch `join` field; current Elastic guidance identifies ES|QL
`LOOKUP JOIN` and lookup indexes as the corresponding Serverless mechanism.
Ordinary relation-index queries remain appropriate for bounded one-hop
expansion.

The index family must be promoted as one coherent projection generation. Every
result should be able to expose upstream release identity, local bundle
identity, compiler version, projection schema version and physical index or
alias generation without conflating them.

ADR-089's “index everything” intent should consequently be interpreted as
conserving and making supported information queryable through explicit
projections. It must not require every value and occurrence to be flattened
into one oversized document or concatenated into searchable text.

### Relationship-aware retrieval

The useful graph-enhanced search pattern is:

~~~text
lexical or semantic seed
  -> retrieve candidate entities or passages
  -> expand explicit, context-filtered relationships
  -> rerank and diversify the expanded candidates
  -> return compact results, paths, provenance and qualifications
~~~

The graph corpus and Elasticsearch have complementary roles:

- the graph corpus answers exact, bounded graph questions and returns complete
  subgraphs inside declared bounds;
- Elasticsearch finds candidates, filters contexts, aggregates distributions,
  discovers statistical associations and ranks compact evidence;
- the exploration service composes those operations behind consumer-oriented
  contracts.

Search-derived co-occurrence, similarity and association remain candidate
signals. They must never be returned as curriculum dependency, containment or
equivalence without the corresponding authored or reviewed evidence.

### Agent exploration protocol

MCP should expose a small exploration protocol rather than an expanding set of
unrelated search tools:

- **orient** — describe available entity kinds, releases, filters,
  relationships and source capabilities;
- **search** — retrieve compact hybrid candidates across selected scopes;
- **summarise** — return contextual facets and distributions for the matched
  set;
- **expand** — traverse one explicit relationship kind from selected entities;
- **compare** — contrast contexts, placements, releases or result sets where
  source identity permits it;
- **explain** — expose lexical or semantic match evidence, relationship paths,
  provenance and epistemic qualification;
- **fetch** — retrieve complete entity or passage detail only when selected.

This is progressive disclosure for an agent: orientation, compact candidates,
structural expansion and full details on demand. Its success measures include
answer completeness, tool-call count, response tokens, redundant-result rate,
latency, provenance use and the rate at which agents correctly refuse
unsupported questions.

Raw Query DSL or ES|QL should not be delegated to an arbitrary consuming
agent. Parameterised, bounded SDK operations preserve security, cost and
semantic contracts while still benefiting from ES|QL filtering, aggregation
and lookup joins.

### Agent and website policies

The same conserved substrate can serve agents and `thenational.academy`, but a
single ranking policy should not be assumed.

Agent exploration values breadth, diversity, stable identifiers, explicit
structure, provenance, uncertainty and useful next operations. Product search
is more likely to value immediate intent resolution, current content
availability, user-facing summaries, editorial controls, predictable latency
and measured user outcomes.

The two consumers should share source adapters, compilation, projection
builders, lifecycle mechanisms and low-level retrieval primitives. They should
have separately evaluated policy composition and result shaping. Separate
aliases or selected consumer-specific projections are justified if measured
workloads diverge; divergence must not cause the underlying curriculum facts to
disagree.

### Elasticsearch capabilities worth evaluating

The current fixed RRF implementation is a baseline, not the target architecture.
Current Elastic capabilities support bounded experiments with:

- weighted RRF and linear fusion with score normalisation;
- semantic reranking over a hybrid candidate window;
- query rules and pinned or excluded results for explicit editorial policy;
- maximum-marginal-relevance diversification to reduce near-duplicate context;
- `semantic_text` passage chunking and semantic highlighting;
- contextual aggregations rather than only static facet enumerations;
- ES|QL filtering, statistics, lookup joins and parameterised analysis;
- transforms, ingest pipelines and enrich policies for projection-local read
  models;
- `significant_terms`, `significant_text` and adjacency-matrix aggregations as
  labelled hypothesis generators for unusual associations.

Diversification is particularly relevant to MCP consumers because five near-
duplicate lessons consume agent context without expanding understanding.
Semantic highlighting is similarly valuable because it can return the most
relevant passage and match evidence rather than a full transcript.

Elastic Graph Explore may help discover statistically significant term and
document associations if it is supported and entitled in the live Serverless
project. It is not a domain-graph substrate. Serverless exposes only a subset
of Elasticsearch APIs and is continuously updated, so availability must be
proven against the live project before Graph Explore becomes even an optional
experiment.

Ingest pipelines, transforms and enrich processors may efficiently implement
projection-local normalisation and read models. They must not become the only
implementation of curriculum compilation: encoding source meaning solely in
Elastic configuration would reduce portability, testability and the ability to
produce non-Elastic projections.

### Additional opportunities

The same projection family can support capabilities that are not primarily
search:

- **curriculum-data diagnostics** — orphaned placements, missing relationship
  targets, inconsistent metadata, mapping-but-unpopulated fields, weak
  searchable content and release-to-release coverage differences;
- **source comparison** — discrepancies between semantically equivalent bulk
  and materialised-view projections without exposing private implementation
  detail;
- **assessment exploration** — when structured questions are published, index
  questions and placements at their own grain and relate them to lessons,
  units, concepts and misconceptions rather than concatenating them into lesson
  text;
- **candidate vocabulary discovery** — statistically unusual terms and
  co-occurrences can produce review candidates while preserving the boundary
  between statistical association and formal ontology;
- **agent-oriented result manifests** — compact results can include source
  capability, omissions, continuation and suggested next operations so agents
  reason about the evidence rather than merely consume ranked strings.

The assessment licensing question is resolved: question content follows the
same licensing boundary as the rest of the curriculum material. The remaining
constraint is whether structured question, answer, ordering and placement data
are actually present in the selected source contract.

### Assumptions and falsifiers

| Assumption | Challenge | Evidence that would change the direction |
| --- | --- | --- |
| More Elastic functionality produces better exploration | Features add value only through a known user question and measured outcome | No improvement in correctness, task completion, tokens or latency over the current baseline |
| A graph element requires Elastic Graph or another graph database | Explicit relation documents and the graph corpus may already answer the bounded structural questions | Required multi-hop questions cannot be answered completely or efficiently through those surfaces |
| One index and ranker can serve agents and website users | The consumers have materially different result and interaction needs | Independent evaluation shows one policy meets both sets of acceptance criteria without hidden compromises |
| A materialised view is only another ingestion format | It may be more authoritative or retain richer placement and release signals | Representative contracts prove semantic and capability equivalence with the bulk adapter |
| Semantic ranking is the primary agent bottleneck | Tool granularity, redundancy, missing provenance or navigation may dominate | Agent-journey evidence isolates ranking quality as the largest failure mechanism |
| Elasticsearch should own all transformation | Domain compilation must remain portable and independently testable | A projection-local transform is proven to carry no domain interpretation and is reproducible from the compiler output |

### Reversible probes before commitment

1. Establish known-answer agent exploration journeys covering orientation,
   search, structural expansion, comparison, explanation and refusal.
2. Generate a small occurrence and relationship projection from a pinned bulk
   fixture and compare semantic-seed-to-one-hop exploration with current MCP
   search plus separate graph calls.
3. Compare current equal RRF with weighted RRF, normalised linear fusion,
   semantic reranking and diversification using independent relevance and task
   evidence.
4. Compare the current `explore-topic` response with the progressive protocol,
   measuring answer completeness, tool calls, tokens, redundancy and latency.
5. Prove that a bulk adapter and a public representative materialised-view
   contract can produce equivalent core entities while retaining different
   declared capabilities.
6. Evaluate a website-specific search policy independently from the agent
   policy over the same conserved projection family.
7. Treat any Elastic Graph, transform, enrich or ES|QL mechanism as selected
   only after its live Serverless availability, cost and operational behaviour
   are proven.

These are probes rather than a disguised implementation sequence. Failure to
improve the named user outcomes is the reason not to add the corresponding
index or Elastic mechanism.

## Which projections are warranted

### Direct source-backed projections from the current snapshot

- lesson knowledge: KLPs, outcomes, misconceptions, responses, tips and
  guidance;
- vocabulary occurrences and contextual definitions;
- thread membership, without prerequisite inference;
- authored prior-knowledge text occurrences;
- National Curriculum statement occurrences and declared aggregations;
- transcript and restriction/missingness views;
- aggregate unit-slug lesson association, explicitly qualified;
- retained flattened unit lesson order, explicitly qualified.

### Source-backed after current publication correction

- structured quiz and question occurrence;
- source-ID and unit-variant-qualified lesson rows;
- release-specific programme, unit, variant and relationship records;
- deterministic snapshot-local comparisons.

### Deferred to the source-authority contract

- exact canonical programme-to-unit-variant structure;
- durable placement continuity;
- authoritative cross-release entity and relationship lineage.

### Candidate or reviewed semantics

- prerequisite dependency;
- question-to-learning-target alignment;
- semantic equivalence and reusable meaning;
- cross-framework alignment;
- subject-specific semantic extension layers.

Each projection should label its epistemic status:

1. source fact;
2. deterministic projection;
3. candidate inference;
4. reviewed assertion.

Review changes acceptance status for a scope. It does not erase origin or turn a
candidate into authored source fact.

## Graph-serving contract

A graph is not a list with graph terminology. Every graph view must declare:

- node and edge kinds;
- projection-membership and structural bounds;
- release and epistemic classes;
- completeness inside the bound;
- treatment of missing, restricted and unresolved content;
- maximum unique roots and finite non-negative integer depth where applicable.

The result must include every matching node and internal edge inside that
bound. An oversize request receives a typed refusal. An unknown anchor is
explicit. A legitimate window or page returns whole structural members, totals
and a usable continuation anchor; it is not called a complete subgraph.

This yields a clearer local classification:

| User need | Likely structure |
| --- | --- |
| Multi-hop relationship neighbourhood | Bounded graph |
| Thread curriculum order | Ordered projection |
| Misconception detail grouping | Hierarchical projection |
| Most relevant terms or lessons | Ranked page |
| Programme or variant membership | Typed placement projection |
| Release change summary | Deterministic diff/report, optionally graph-backed |

The consuming agent may reason over deterministic results, explain ambiguity
and compare evidence. Hidden recommendation logic does not belong in a thin
tool. Teachers retain pedagogical authority.

## Authority by concern

| Concern | Appropriate authority |
| --- | --- |
| Authored curriculum content and current release records | Curriculum source system |
| Published database schema, view definitions and release mechanics | Database-Tools at a pinned public revision; deployed configuration requires separate evidence |
| Public eligibility, transport and bundle publication | Oak OpenAPI/bulk producer |
| Canonical programme/variant and longitudinal relationship model | Authoritative source-domain owner and its ratified contract |
| Deterministic source-derived projections | This repository's versioned compiler and SDK |
| Formal vocabulary, constraints and ontology IRIs | Current Oak Curriculum Ontology |
| Candidate reusable meanings, alignments and dependencies | Candidate semantic pipeline |
| Accepted semantic judgements | Authorised curriculum review process |
| Adaptation in teaching context | Teacher judgement supported by evidence |

Authority is relation-specific. No graph is universally authoritative because
it contains several node kinds.

## Implications across the repositories

### This repository

Act now on the local issue register. Do not wait for exact programme-variant
semantics before correcting false edges, preserving current signals, unifying
the compiler or hardening graph contracts. Do refuse exact programme-variant
claims until the upstream authority exists.

### Oak OpenAPI and bulk generation

Act now on ESTATE-001 through ESTATE-006 and ESTATE-010 through ESTATE-011:
repair query cardinality; preserve identities, factors and order; include
structured questions; generate and validate schema and data together; await and
verify publication; issue an immutable release envelope.

The API should use a provider-owned pure compiler and normalised source records.
It should not restore a bare-slug union and describe that as the final fix.

### Database-Tools and current published views

The pinned public definitions show that useful source fields exist below the
wrapper. A better bulk-facing view family can expose normalised,
release-qualified programme-unit, unit-variant-lesson, lesson, quiz and
question records without claiming to solve the canonical programme-to-variant
model. Correspondence with a deployed configuration must be verified
separately.

If a currently resolved programme context is exported, it should be a named,
versioned, release-local projection with its rule and provenance. The
authoritative source-domain owner owns the durable relationship and identity
contract.

### Oak Curriculum Ontology

The current ontology remains fixed for today's work. It continues to own its
formal vocabulary, constraints, IRIs and representations. Source-derived
projections may map to it explicitly, but do not need an ontology round trip to
be legitimate source facts.

The programme/inclusion/unit-variant distinctions in the current ontology are
useful evidence that those concepts should not be flattened. They do not by
themselves prove source placement identity or override the source-authority
boundary.

### AILA Atomic Concepts

Retain the existing separation of entity and occurrence, sequence and
dependency, and exact deduplication and reviewed semantic merging. Candidate
hash identities and inferred edges remain candidate-pipeline artefacts; they do
not replace source IDs or authored facts.

### Authoring and curriculum workflows

Any richer authored semantics or reviewed relationships require explicit
source authority or governed review. A transport repair can make the substrate
visible but cannot create curriculum judgement.

## Would a shared workspace help?

Bringing the whole OpenAPI application into this workspace could enable one
pull request, shared fixtures and end-to-end tests. It would also import a web
application, infrastructure, deployment and secrets boundaries, release
automation and toolchain differences. That is a replatforming decision, not a
data-contract fix.

The useful boundary is smaller and works with either topology:

~~~text
provider-owned bulk contract
provider-owned pure compiler
immutable fixtures and release bundles
consumer compatibility tests
~~~

Publishing those as packages or sharing them in a workspace can reduce drift.
The full application should move only if Oak wants the wider ownership and
platform change. Colocation does not solve programme-to-variant semantics,
stable identity, release provenance or deployment truth.

## Known-answer user questions

Evaluation should begin with questions whose answers can be checked:

- Which KLPs, outcomes, misconceptions, tips and contextual terms occur in this
  lesson?
- Which lessons contain a named misconception and response?
- Where does a term occur and how is it defined in each lesson context?
- What authored prior-knowledge statements and thread memberships are attached
  to this unit?
- Which structured starter and exit questions occur, and in what order?
- What records and placements changed between two immutable releases when
  contracted identity permits the comparison?
- Which exact lessons differ between two programme variants once the
  source-authority relation is published?
- Which possible prerequisites or reusable meanings have evidence, and which
  have been reviewed?

For each, compare the smallest graph with a simpler typed projection. Measure
answer correctness, completeness, time, comprehension, confidence, adaptation
errors, cognitive load and review effort. Graph richness is not success.

## Assumptions challenged

| Assumption | Evidence-led correction |
| --- | --- |
| Current emitted graphs define what the bulk can support | They reflect only the extractors currently wired into one corpus |
| Programme-variant ambiguity must be solved before any local progress | Truthful local compilation and current producer corrections can proceed now |
| A new consumer-specific materialised view should define the canonical relationship | That risks freezing legacy complexity; the authoritative source domain should own the durable model |
| Removing the one-row limit fixes bulk lessons | It restores the historical unqualified union unless the query contract also changes |
| Checked-out Hasura definitions prove exact deployment state | They establish only their pinned source revision; deployment provenance is separate |
| A shared workspace fixes cross-estate drift | It improves mechanics; an owned contract and immutable release fix drift |
| The ontology should mediate every graph | It owns formal assertions, not all source projections |
| A slug or content hash is stable identity | It is a reproducible fingerprint, not a lifecycle contract |
| The source checkout establishes whether questions may be published | Licensing and publication eligibility require their own public authority; the source checkout establishes only technical availability |
| Every useful relation needs human review | Source facts need validation; semantic judgements need review |

## Decision lenses

The lenses are ordered. The first decisive lens governs; the later lenses test
the decision.

### 1. Long-term architectural excellence

A faithful release boundary plus loss-aware projections allows current systems,
the fixed ontology and any future source redesign to evolve without making
today's flattening permanent. Source-domain ownership of canonical
programme-to-variant semantics is correct so long as the published estate
exposes honest raw facts and a written contract. This lens is decisive.

### 2. Strict and complete

The architecture rejects false prerequisite naming, unqualified containment,
one-row query regressions, silent definition selection, schema/data mismatch,
untraceable releases and truncated “graphs”. Deferral is explicit and bounded;
it is not permission to publish ambiguity as truth.

### 3. Simpler without compromising quality

One provider-owned compiler, one immutable bundle and one local loss-aware
compiler are simpler than dynamic schema assembly, duplicate pipelines and a
universal semantic graph. Named non-graph projections reduce conceptual load.

### 4. Change the system to dissolve the problem

The authoritative source domain should publish the programme/variant relation
once. Consumers should not each reconstruct it. Meanwhile the publication
system should stop discarding the records and provenance that make future
compatibility possible.

### 5. User value

Teachers and curriculum teams need trustworthy contextual evidence, comparison
and assessment, not graph-shaped certainty. The architecture succeeds only if
it improves real tasks while preserving human curriculum and pedagogical
authority.

## Strategic gates

This exploration does not authorise implementation, but it establishes six
gates that any plan should respect.

### Gate 1 — Semantic honesty now

Remove or qualify false local prerequisite and containment claims, and stop
presenting reported National Curriculum associations as exhaustive coverage or
gap evidence, before expanding their public use.

**Falsifier:** authoritative source evidence supports the stronger meanings.

### Gate 2 — Current publication integrity

Produce an immutable schema-and-data bundle; correct query cardinality; retain
available identities, factors, orders and questions; make publication
completion verifiable.

**Falsifier:** a current end-to-end release already proves all those properties
against the exact stored artefact.

### Gate 3 — Source-authority contract

Obtain explicit source-domain ownership of canonical programme/variant
selection, continuing identity, lineage and historical-access semantics.
Define the minimum source contract before consumers depend on it.

**Falsifier:** a ratified source contract already provides that model and paired
immutable releases demonstrate it.

### Gate 4 — Source-accounting local compilation

Represent or account for every supported signal and occurrence in the validated
bundle at one loss-aware compilation boundary, with conflicts and omissions
visible. Derive narrower projections explicitly.

**Falsifier:** the current compiler accounts for every record and dimension
through one contract and exposes equivalent evidence.

### Gate 5 — Question-led projection evaluation

Compare graph and simpler projections for known-answer workflows. Require
complete bounded results and measured user value.

**Falsifier:** relational traversal adds no material benefit or cannot meet the
completeness contract.

### Gate 6 — Separate semantic review

Evaluate proposed richer semantics and inferred relationships as
candidate/reviewed work, never as an incidental bulk transform.

**Falsifier:** the relevant relation is shown to be explicitly authored and
release-qualified in the source.

### Gate 7 — Evidence-led curriculum exploration

Select source adapters, Elastic projections, retrieval stages and MCP
operations only through known-answer agent and website questions. Preserve one
conserved curriculum model while allowing consumer-specific retrieval policy.

**Falsifier:** the current indexes, aggregate MCP search and one shared
retrieval policy already meet the independent correctness, evidence, latency,
cost and interaction criteria for both consumers.

## Remaining questions

The important unresolved questions are now:

- Which current source fields can be published immediately without reinforcing
  a legacy programme-variant interpretation?
- Does any near-term user need justify a named interim resolved projection?
- What exact minimum contract will the authoritative source domain ratify for
  programme, variant, placement, revision and lineage?
- Which IDs are public contract, never reused and stable through rename or edit?
- Which historical releases can consumers retrieve immutably?
- Which media, attribution and restriction fields must accompany questions?
- Which user questions genuinely benefit from graph traversal?
- Which agent exploration journeys fail because of ranking, and which fail
  because orientation, structural navigation, provenance or progressive
  disclosure is missing?
- Which public materialised-view contract can serve as the representative
  website source, and which capabilities does it expose beyond or below bulk?
- Which entity, occurrence, relationship, passage and analytical projections
  materially improve a named question enough to justify their operational cost?
- Can one retrieval policy independently satisfy both agent and website
  acceptance criteria, or should only their facts and primitives be shared?
- Which current Elastic Serverless APIs and entitlements are proven in the live
  project, and what are their observed latency and cost envelopes?
- Which missing curriculum concepts should become authored data, and which
  belong in reviewed semantic overlays?

Questions that are no longer open include:

- this repository can build many more graphs than it currently emits;
- the 148 unpublished placement difference is expected state filtering;
- the 403 top-only pairs arise at variant flattening;
- current OpenAPI source contains a one-row lesson-query regression;
- removing that limit alone is not a provenance fix;
- the current database/view source carries more identity and assessment data
  than the bulk publishes;
- the pinned source establishes technical question availability but does not
  establish publication eligibility;
- exact canonical programme-to-variant semantics should not be invented
  downstream;
- a pinned Hasura source definition is design evidence, not deployment proof.

## Final conclusion

The better architecture is both less centralised and more exact.

Oak should preserve authored facts in an immutable release-qualified bundle,
keep the current ontology as the formal model it is today, assign the enduring
programme-to-variant and lineage contract to the authoritative source domain,
and let this repository compile every available source signal before deriving
bounded, question-specific views.

That boundary makes useful work possible now. False graph semantics, local
schema generation, download integrity, producer query bugs, missing questions,
deleted provenance and non-atomic publication can all be corrected without
pretending the programme-to-variant domain has been redesigned. Conversely, a
future source-contract revision can publish a better relationship model without
undoing a consumer-invented canonical graph.

The original reusable-curriculum ambition remains. Better data publication
provides the structural substrate; explicit authoring and reviewed semantic
work provide the meanings the source does not yet contain; question-led
projections turn both into useful evidence. The measure of success is not how
much data becomes a graph, but whether teachers and curriculum teams can
understand, compare, review and adapt curriculum with less hidden ambiguity.

For search, that means a reusable curriculum exploration engine rather than a
larger collection of indexes: one source-accounting compiler, explicit
source-capability adapters, purpose-built Elastic projections, progressive MCP
exploration and separately evaluated agent and website policies. Elasticsearch
supplies powerful retrieval and analysis mechanisms; the conserved curriculum
contract supplies meaning, portability and truth.

## Primary references

### Report family

- [Issues in this repository](./oak-reusable-curriculum-architecture-this-repository.md)
- [Issues in the current Oak data estate](./oak-reusable-curriculum-architecture-current-data-estate.md)

### Local doctrine and evidence

- [Decision principles](../../../.agent/directives/principles.md)
- [Graph doctrine](../../../.agent/skills/working-with-graphs/SKILL-CANONICAL.md)
- [Verify data supports shape before building](../../../.agent/rules/verify-data-supports-shape-before-building.md)
- [ADR-086: vocab-gen graph export](../../../docs/architecture/architectural-decisions/086-vocab-gen-graph-export-pattern.md)
- [ADR-173: graph-stack topology](../../../docs/architecture/architectural-decisions/173-graph-stack-topology.md)
- [ADR-191: deterministic data surface](../../../docs/architecture/architectural-decisions/191-deterministic-data-surface-agent-reasons.md)
- [ADR-194: teacher as expert](../../../docs/architecture/architectural-decisions/194-teacher-as-expert-product-boundary.md)
- [ADR-074: Elastic-native-first](../../../docs/architecture/architectural-decisions/074-elastic-native-first-philosophy.md)
- [ADR-089: index everything](../../../docs/architecture/architectural-decisions/089-index-everything-principle.md)
- [ADR-093: bulk-first ingestion](../../../docs/architecture/architectural-decisions/093-bulk-first-ingestion-strategy.md)
- [ADR-138: shared search field contracts](../../../docs/architecture/architectural-decisions/138-shared-search-field-contract-surface.md)
- [ADR-140: search ingestion SDK boundary](../../../docs/architecture/architectural-decisions/140-search-ingestion-sdk-boundary.md)
- [MCP aggregated exploration](../../../packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-explore/execution.ts)
- [Hybrid RRF query builders](../../../packages/sdks/oak-search-sdk/src/retrieval/rrf-query-builders.ts)
- [Bulk manifest](../../../apps/oak-search-cli/bulk-downloads/manifest.json)
- [Bulk schema snapshot](../../../apps/oak-search-cli/bulk-downloads/schema.json)
- [Current graph corpus](../../../packages/sdks/oak-sdk-codegen/src/generated/vocab/graph-corpus/data.json)

### Current public source snapshots

- [Oak OpenAPI bulk data queries](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/src/lib/bulk-data/get-data.ts)
- [Oak OpenAPI bulk route](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/src/app/api/bulk/route.ts)
- [Oak OpenAPI limit-one change](https://github.com/oaknational/oak-openapi/commit/01906db02542e21e609b14519317dddae8e39b7c)
- [Database-Tools lesson OpenAPI materialised view](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/database-tools/sql-schema-docs/open-api-materialized-views/mv_lesson_openapi.sql)
- [Database-Tools lesson-with-transcripts view](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/database-tools/sql-schema-docs/open-api-views/view_lesson_openapi_with_transcripts.sql)
- [Database-Tools programme-unit schema](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/oak-curriculum-schema/drizzle/schema/public/programme_units.ts)
- [Database-Tools unit-variant-lesson schema](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/oak-curriculum-schema/drizzle/schema/public/unitvariant_lessons.ts)
- [Oak Curriculum Ontology](https://github.com/oaknational/oak-curriculum-ontology/blob/610ba79a96bbfa5148e4a50360b05c12e79aaf83/ontology/oak-curriculum-ontology.ttl)
- [Oak Curriculum Ontology programme structure](https://github.com/oaknational/oak-curriculum-ontology/blob/610ba79a96bbfa5148e4a50360b05c12e79aaf83/data/programme-structure.ttl)
- [AILA sequence/dependency decision](https://github.com/oaknational/aila-atomic-concepts/blob/f5c7ce2030937d469228b894dc0fe5e656ffe839/docs/adr/0001-separate-curriculum-sequencing-from-prerequisite-dependency.md)
- [AILA entity/occurrence decision](https://github.com/oaknational/aila-atomic-concepts/blob/f5c7ce2030937d469228b894dc0fe5e656ffe839/docs/adr/0002-separate-atomic-item-identity-from-curriculum-occurrence.md)
- [Elastic retrievers](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/retrievers)
- [Elastic semantic text](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/semantic-text-reference/)
- [Elastic ES|QL lookup joins](https://www.elastic.co/docs/reference/query-languages/esql/esql-lookup-join)
- [Elastic significant terms](https://www.elastic.co/docs/reference/aggregations/search-aggregations-bucket-significantterms-aggregation)
- [Elastic Serverless and hosted differences](https://www.elastic.co/docs/deploy-manage/deploy/elastic-cloud/differences-from-other-elasticsearch-offerings)
- [Elastic Graph Explore API](https://www.elastic.co/guide/en/elasticsearch/reference/current/graph-explore-api.html)
