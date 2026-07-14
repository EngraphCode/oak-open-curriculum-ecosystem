# Oak reusable curriculum architecture — cross-estate reflection

> Historical draft. Superseded by the canonical report in the parent directory.

**Date:** 2026-07-14  
**Status:** Second-stage exploratory synthesis, not an implementation plan or ratified architecture  
**Scope:** Curriculum semantics, authoring, alignment, assessment, versioning, and graph serving across four Oak repositories

This report follows the standalone
[initial concept exploration](./oak-reusable-curriculum-architecture.md). It
tests and revises those initial findings against the Oak Curriculum Ontology,
Atomic Concepts, Oak OpenAPI, and the local ecosystem repository.

## Executive synthesis

The opportunity is not principally to add more fields to Key Learning Points
(KLPs). It is to make several different kinds of curriculum meaning explicit
without forcing them into one overloaded record.

The four repositories already contain complementary parts of such an
architecture:

- `oak-openapi` is the public delivery contract. It exposes useful curriculum
  records, but often projects semantically important things as strings or
  lesson-level arrays.
- `oak-curriculum-ontology` supplies persistent semantic identity, typed
  relationships, validation constraints, ordered inclusion nodes, subject
  taxonomies, and versioned release distributions.
- `aila-atomic-concepts` explores decomposition below KLP granularity. Its
  entity/occurrence split, staged entity resolution, separation of sequence
  from prerequisite dependency, and candidate-versus-reviewed boundary are
  reusable architectural evidence. Its evaluation also shows that this is
  still experimental work, not a source of approved curriculum truth.
- This repository generates typed consumers from OpenAPI and serves bounded,
  deterministic graph views. Its conceptual property graph is richer than its
  emitted runtime graph, and its architecture deliberately leaves reasoning to
  the consuming agent.

The working synthesis is therefore a **shared semantic kernel with several
distinct layers**, not a universal enlarged KLP:

1. authored curriculum artefacts, such as KLPs, prior-knowledge requirements,
   pupil outcomes, questions, and content descriptors;
2. reusable knowledge entities, with subject-aware kinds such as fact,
   concept, skill, and misconception;
3. occurrences that preserve where an entity appears and the role it plays in
   that context;
4. first-class, reviewable assertions for relationships such as prerequisite,
   assessment, alignment, progression, and equivalence;
5. subject-owned classification schemes and programme structure;
6. immutable releases, lineage, provenance, and review state.

This framing avoids three forms of accidental conflation:

- an authored aggregate is not necessarily one atomic meaning;
- curriculum order is not proof of knowledge dependency;
- automated extraction or matching is not an approved curriculum judgement.

The architecture is reusable when the common layer standardises identity,
provenance, scope, occurrence, assertion, review, and release semantics while
subjects retain authority over their own classifications and pedagogical
structures.

## Scope and evidence handling

This report applies the repository's concept-exploration workflow: expand the
possibility space, connect recurring structures, stress-test assumptions, then
distil the smallest model that preserves the important distinctions. It uses
the graph doctrine that a graph surface must be typed, navigable, and complete
within a declared structural bound.

An internal discussion supplied initial observations about curriculum-tooling
needs. It has been used only as an anonymised source of concepts. No quotation,
identity, attribution, or personal information from that source is reproduced
here.

The external repositories were inspected at these snapshots:

| Repository | Snapshot | Role examined |
| --- | --- | --- |
| [`oak-curriculum-ontology`](https://github.com/oaknational/oak-curriculum-ontology/tree/610ba79a96bbfa5148e4a50360b05c12e79aaf83) | `610ba79a96bbfa5148e4a50360b05c12e79aaf83` | Formal semantics, stable identity, taxonomy, sequencing, constraints, distributions |
| [`aila-atomic-concepts`](https://github.com/oaknational/aila-atomic-concepts/tree/4265cca29410caf5871a3af2ac5e6d417cee3dc4) | `4265cca29410caf5871a3af2ac5e6d417cee3dc4` | Atomic decomposition, occurrence identity, entity resolution, prerequisite and alignment experiments |
| [`oak-openapi`](https://github.com/oaknational/oak-openapi/tree/f64b8f3fe8bee849016c61e60cc0a454d424369b) | `f64b8f3fe8bee849016c61e60cc0a454d424369b` | Public API shapes for lessons, units, threads, questions, and variants |
| This repository | `5d552cd99e22692af49f1727201ee9b2b14568f6` | Generated types, runtime graph corpus, bounded graph views, deterministic serving doctrine |

## The problem frame

Several concerns currently meet at KLP text even though they have different
identity, scope, lifecycle, and review requirements.

| Concern | Question it needs to answer | Why KLP text alone is insufficient |
| --- | --- | --- |
| Curriculum organisation | Where does content sit in a subject, programme, unit, and lesson? | Organisation is contextual and versioned; the same meaning may occur in several places. |
| Knowledge proposition | What independently meaningful knowledge or capability is present? | One KLP may contain several propositions or depend on omitted context. |
| Subject classification | What kind of knowledge is this within the discipline? | Useful categories differ across subjects and should not become one global enum. |
| Pedagogical role | Is this core residue, supporting context, a narrative device, or a checkpoint target here? | Role can change between occurrences of the same underlying meaning. |
| Instructional sequence | When and through what lesson segment is it introduced or checked? | Lesson-level arrays cannot anchor an internal sequence reliably. |
| Evidence and assessment | Which question or task provides evidence about which intended learning? | Lesson membership is too coarse; questions and targets are many-to-many. |
| Progression and dependency | What builds on what, and with what confidence or review state? | Thread membership and authored order are evidence, not dependency proof. |
| Alignment | How does Oak content relate to an external framework or another curriculum release? | Text matching is mutable and cannot carry provenance, scope, or review decisions. |
| Lifecycle | What changed, who or what proposed it, what was approved, and in which release? | A current string cannot represent lineage or coexistence between curricula. |

The central modelling mistake to avoid is treating these as optional attributes
of one object. Many are relationships or contextual assertions. They need
their own identity and provenance if they are to be reviewed, revised, audited,
or served as graph data.

## Movement 1 — expand: what the four estates actually contain

### The public API is an operational projection

The current `oak-openapi` lesson summary returns KLPs as objects containing
only a `keyLearningPoint` string. Misconceptions have text and a response.
Questions have question content, type, images, and answers, grouped into
starter and exit quizzes, but the public response does not express a stable
question identity or a relationship to a KLP or smaller knowledge target.

The unit summary is richer in organisational context: prior-knowledge
requirements, national-curriculum content, rationale, threads, optional
categories, programme factors, unit variants, and ordered lessons. Threads in
the unit shape have slug, title, and order, while the thread endpoint returns a
list of units without an authoritative within-thread curriculum order.

This is a useful delivery API, not a complete semantic model. It answers
questions such as “what content is returned for this lesson?” efficiently. It
does not yet answer “which stable proposition does this question assess?” or
“is this prior-knowledge statement the same entity in two releases?”

The local generated schema confirms the same public contract:

- [`api-schema-original.json`](../../../../packages/sdks/oak-sdk-codegen/schema-cache/api-schema-original.json)
  exposes lesson KLPs as text-only objects and questions at lesson, programme,
  subject, and sequence scopes;
- the distinction between starter questions testing prior knowledge and exit
  questions testing lesson knowledge is a quiz-level description, not a
  question-to-target relationship.

### The ontology is already more than a taxonomy

The current ontology defines a formal RDF/OWL/SKOS/SHACL model with persistent
URIs. Its programme structure separates the identity of units and lessons from
their placement through `UnitVariantInclusion` and `LessonInclusion` nodes.
Those inclusion nodes carry sequence position and choice metadata. This is a
concrete precedent for representing contextual properties on a placement
rather than on the reusable entity.

It also distinguishes several semantic layers:

- programme entities: subject, programme, unit, unit variant, and lesson;
- lesson content entities: KLP, prior-knowledge requirement, misconception,
  keyword, and pupil outcome;
- knowledge taxonomy: discipline, strand, sub-strand, content descriptor, and
  sub-content descriptor;
- cross-cutting thread membership;
- National Curriculum progression and content coverage.

KLPs are first-class lesson-specific entities in the ontology, rather than
bare strings. Content descriptors are separate knowledge statements within a
subject taxonomy. Units can include content descriptors and threads. SHACL
constraints validate shapes and cardinalities, including KLP presence and
contiguous sequence positions.

The ontology's faithful property-graph distribution preserves RDF identities
and typed relationships without silently redesigning the schema. Relationship
properties are empty; metadata-bearing relationships are represented through
nodes such as inclusions. External-reference stubs retain links to separately
published datasets, and shared URI identity permits later graph composition.

Two consequences are important:

1. a new generic `CurriculumClaim` must not be invented without first deciding
   how it differs from KLP, content descriptor, prior-knowledge requirement,
   pupil outcome, and atomic item;
2. occurrence or assertion nodes are consistent with the ontology's existing
   approach when a relationship needs placement, provenance, review, or
   release metadata.

The current ontology also defines `curric:slug` as the application's public URL
identifier, and current unit data contains those slugs. That updates a local
June review which correctly found unit and lesson joins unavailable in the
then-inspected release. Cross-repository identity must therefore be assessed
against a pinned current release, not inherited as a permanent limitation.
The presence, coverage, and stability of slugs still need systematic
verification by entity type before they are treated as universal crosswalks.

### Atomic concepts explore a missing granularity

`aila-atomic-concepts` treats a KLP as a source sentence that may be decomposed
into smaller independently meaningful items. Its current prototype classifies
facts, concepts, misconceptions, and skills. It makes a particularly useful
identity distinction:

- an **atomic item entity** represents the reusable underlying meaning;
- an **atomic item occurrence** represents one appearance in a curriculum
  source and carries source component, lesson, parent KLP, and related
  provenance;
- a run-local object identifier is explicitly not graph identity.

The prototype's deterministic hashes are intentionally provisional. Exact
normalisation is auditable and useful for a technical proof, but it neither
solves semantic equivalence nor supplies production identity governance. The
repository therefore separates automatic duplicate removal, candidate
semantic clustering, and approved entity resolution. Grey-area merges require
a reference set and review.

The repository also records a crucial semantic distinction: authored unit
sequence is not prerequisite dependency. Immediate predecessor order can seed
retrieval, but empirical results show that required knowledge may come from
several earlier or adjacent units. This effect varies by curriculum phase; a
single `previous unit` assumption does not generalise.

Its alignment workflow similarly separates:

- source records and atomic occurrences;
- candidate automated alignment judgements;
- evidence and candidate action recommendations;
- human-authored review decisions.

The evaluation evidence is cautionary as well as promising. The baseline was
small and concentrated in one subject family. Automated embedding metrics did
not correlate reliably with human judgement, extraction quality was a
bottleneck, and performance changed with curriculum structure and key stage.
This supports the entity/occurrence and candidate/review patterns; it does not
validate automatic atomisation or matching as universal curriculum truth.

### This repository contains two different graph realities

The conceptual property graph in
[`property-graph-data.ts`](../../../../packages/sdks/oak-sdk-codegen/src/mcp/property-graph-data.ts)
includes quiz, question, and KLP node types, with relationships such as lesson
`hasQuizzes`, quiz `containsQuestions`, thread `linksAcrossYears`, and lesson
`delivers` KLP.

The emitted runtime graph in
[`graph-corpus-emitted-index-lines.ts`](../../../../packages/sdks/oak-sdk-codegen/src/bulk/generators/graph-corpus-emitted-index-lines.ts)
is narrower. Its emitted node kinds are unit, thread, lesson, misconception,
and keyword; its emitted relationships are `prerequisiteFor`, `containsUnit`,
`containsLesson`, `addressesMisconception`, and `containsKeyword`. KLPs,
quizzes, and questions are therefore present in a conceptual description but
not navigable runtime graph entities.

The graph SDK already serves useful bounded curriculum views for prior
knowledge, misconceptions, thread progression, and keywords. The thread
projection explicitly states that teaching year supplies only coarse sequence
and that no authoritative within-thread ordering is exported. This is sound
epistemic behaviour: the surface does not upgrade a convenient sort key into a
curriculum claim.

ADR-191 supplies the serving constraint for any future architecture: the data
surface is deterministic and the consuming agent is the only reasoner. A
formal ontology-level crosswalk is allowed, but the server should not hide
heuristic judgement, ranking, or curriculum conclusions behind apparently
factual graph edges.

## Movement 2 — connect: the recurring structures

### Entity versus occurrence is the common pattern

Three independently useful structures point in the same direction:

- ontology programme entities are separated from their ordered inclusion;
- atomic item meaning is separated from curriculum occurrence;
- pedagogical role can differ depending on where the same meaning is used.

The reusable abstraction is not “everything is an atomic item”. It is:

> Give a reusable thing stable identity, then represent each contextual
> appearance separately when placement, role, source, or release matters.

This applies beyond atomic knowledge. A lesson may appear in several programme
variants. A question may appear in a quiz or assessment form. A content entity
may support one KLP, be prior knowledge for another unit, and be assessed by
several questions. Those are occurrences and assertions, not changes to the
thing's intrinsic identity.

### Relationship metadata belongs on assertions

Simple, unqualified relationships can remain graph edges. Relationships that
need review or lifecycle metadata should be first-class assertions. An
alignment, for example, may need:

- source and target identifiers;
- relationship kind and direction;
- curriculum and framework release;
- scope or expected depth;
- method and evidence;
- candidate, reviewed, accepted, rejected, or superseded state;
- lineage to a previous decision.

The same pattern applies to prerequisite claims and question-to-learning-target
mapping. It aligns with the ontology's inclusion-node precedent and with the
atomic alignment workflow's separation of evidence from approved decision.

### Subject variation belongs above a small common kernel

Facts, concepts, skills, and misconceptions are a useful experimental
vocabulary, but they are not proof of a universal curriculum taxonomy.
Different subjects need different distinctions: substantive and disciplinary
knowledge, procedures, representations, methods, narrative structures,
practices, conventions, and other subject-specific categories.

A reusable architecture should therefore standardise how a classification is
identified, scoped, versioned, and applied while allowing the scheme itself to
be subject-owned. The common kernel says “this occurrence is classified by
this concept in this scheme”; the subject decides what the concepts mean.

### Serving projections are not the canonical graph

The OpenAPI response, ontology graph, atomic-extraction outputs, and MCP
resource each serve a different audience. Reusability comes from explicit
projection boundaries, not from forcing all consumers to use one enormous
payload.

A canonical semantic record can project to:

- concise OpenAPI delivery shapes;
- RDF/SHACL release artefacts;
- faithful property-graph JSONL;
- generated TypeScript types;
- bounded MCP resources and tools;
- authoring and audit views.

Each projection should declare what it omits. A conceptual node that is absent
from the emitted corpus must not appear navigable merely because a diagram
mentions it.

## Movement 3 — stress-test the candidate architecture

### Granularity stress test

A KLP can be a well-authored lesson outcome while still containing several
atomic meanings. Conversely, some atomic fragments are not independently
meaningful without their source context. The architecture must support both
without assuming that automatic decomposition always succeeds.

This suggests three distinct levels:

| Level | Intended semantics | Example role |
| --- | --- | --- |
| Authored aggregate | Human-composed statement serving a curriculum or pedagogical purpose | KLP, pupil outcome, prior-knowledge statement |
| Reusable semantic entity | Independently meaningful item suitable for identity and reuse | fact, concept, skill, misconception |
| Occurrence | Appearance of an entity within an authored source and release | an atomic entity extracted from or approved within one KLP |

Content descriptors form a related but different layer: they are
framework/taxonomy statements, not automatically identical to Oak-authored
atomic entities. Relationships between them should be explicit mappings.

### Subject stress test

If a shared enum cannot describe a subject's distinctions without flattening
them, the enum belongs in an extension scheme. Shared infrastructure should
still allow cross-subject queries over broad super-types, but it must not make
a discipline-specific example the mandatory ontology for every subject.

Similarly, “core” and “supporting” are usually contextual roles. A fact may be
core in one lesson and supporting background in another. Store that role on an
occurrence or authored placement, not permanently on the reusable entity.

Narrative devices and lesson checkpoints should be modelled only when a
repeated authoring or consumer need justifies their burden. If checkpoints must
refer to “after this narrative beat”, the beat needs stable lesson-internal
identity; a mutable text label is not a durable anchor.

### Progression stress test

Thread membership means that units participate in a recurring theme, skill, or
idea. It does not by itself state what pupils retain across time. Likewise,
programme order does not prove prerequisite dependency.

Three relationships should remain distinct:

- **authored order**: placement in a programme or lesson sequence;
- **thread participation**: membership in a cross-cutting curriculum thread;
- **knowledge dependency**: an explicit, reviewable claim that one semantic
  entity or achievement is required for another.

Cross-time takeaways should be explicitly authored and scoped. They must not be
inferred silently from thread membership. A progression statement may refer to
several atomic entities and several curriculum occurrences; it need not be
reduced to either a thread or a KLP.

### Assessment stress test

Questions and learning targets have a many-to-many relationship. One question
may gather evidence about several entities, while one entity may be checked by
several questions in different forms or releases. A lesson-level quiz link is
therefore insufficient.

A useful assessment assertion could connect a stable question entity or
question occurrence to one or more intended targets, while recording whether
the mapping is authored, reviewed, or generated. Question wording, answer
options, quiz placement, and target mapping may have different lifecycles and
should not share one accidental identifier.

The server can expose reviewed mappings and their provenance deterministically.
It should not convert those mappings into an opaque quality score or decide
that a question “fully assesses” a concept unless that judgement is itself an
explicit approved assertion.

### Alignment stress test

Mutable KLP text is not a safe alignment key. Alignment should connect stable
internal entities or occurrences to versioned external descriptors through an
identified assertion. This preserves cases where:

- one external descriptor maps to several Oak entities;
- one Oak entity contributes only partial coverage;
- expected depth differs by stage or programme;
- a mapping changes between releases;
- an automated candidate is rejected or superseded.

Staged entity resolution is equally important. Exact duplicate removal may be
safe to automate; semantic equivalence is a curriculum decision with merge and
split consequences. Production identity needs governed persistent identifiers,
not text hashes alone.

### Release and legacy stress test

Supporting a legacy curriculum and a refreshed curriculum at the same time is
a first-class versioning problem. It requires more than optional compatibility
fields.

The architecture needs to distinguish:

- mutable authoring workspaces from immutable published releases;
- persistent entity identity from a release-specific revision;
- reusable meaning from occurrence in one curriculum release;
- current mappings from mappings valid for an earlier release;
- lineage from equality.

An unchanged entity may appear in several releases. A changed statement may be
a new revision, a split, a merge, or a genuinely new entity. Those cases need
explicit policy and reversible audit history.

### Graph-integrity stress test

A graph endpoint should declare its structural bound and return a complete
subgraph within it. For example, a question-target view might promise:

- the anchored question occurrence;
- its quiz and lesson placement;
- every reviewed target assertion in the selected release;
- the target entities and their source occurrences;
- typed refusal when the anchor or release is invalid;
- a well-formed empty result when no reviewed mapping exists.

Pagination, ranking, or textual truncation must not silently remove edges that
make the view misleading. Ordering remains a separate projection unless the
order itself is represented by inclusion nodes or typed relationships.

## Movement 4 — distil: a candidate reusable architecture

### A six-layer semantic model

The following layers are conceptual responsibilities, not proposed final class
names.

#### 1. Authored artefact layer

Preserve curriculum-authored objects and wording: KLP, prior-knowledge
requirement, pupil outcome, misconception and correction, question, content
descriptor, progression statement, and similar artefacts. These retain their
pedagogical or framework purpose and source provenance.

#### 2. Reusable semantic-entity layer

Represent independently meaningful knowledge or capability with persistent,
opaque identity. Broad common kinds may exist, but subject classifications are
applied through versioned schemes rather than hard-coded into one universal
record.

#### 3. Occurrence and placement layer

Connect a reusable entity to the authored artefact, lesson, unit, programme,
or release in which it appears. Contextual properties belong here: source
span, pedagogical role, expected depth, classification in context, and review
state of the occurrence.

#### 4. Assertion layer

Represent metadata-bearing relationships as identified assertions. Candidate
relationship families include:

| Relationship family | Source and target | Important qualification |
| --- | --- | --- |
| `isOccurrenceOf` | occurrence → semantic entity | source and release provenance |
| `decomposesTo` | authored artefact → occurrence | method, evidence, review state |
| `requires` / `buildsOn` | target achievement/entity → prerequisite entity | scope, strength, evidence, review |
| `assesses` | question occurrence → entity or authored target | intended evidence, review state |
| `addresses` | teaching response/checkpoint → misconception occurrence/entity | context and release |
| `alignsWith` | Oak entity/occurrence → external descriptor/entity | relationship kind, coverage, release, evidence |
| `participatesIn` | unit/entity/occurrence → thread | explicit membership, not dependency |
| `realises` | authored progression statement → semantic entities | scope and curriculum release |
| `supersedes` / `derivedFrom` | revision/assertion → earlier item | lineage without claiming equality |

Simple structural relationships can remain direct edges. When a relationship
needs evidence, review, provenance, validity interval, or release scope, use an
assertion node or equivalent reification.

#### 5. Taxonomy and programme layer

Retain the ontology's separation of subject knowledge taxonomy from programme
structure. Discipline, strand, sub-strand, content descriptor, subject,
programme, unit variant, lesson, thread, and ordered inclusions answer different
questions and should remain distinct.

#### 6. Governance and release layer

Every publishable entity, occurrence, and assertion needs a clear lifecycle:
candidate, reviewed, accepted, rejected, superseded, and released where
appropriate. Immutable releases identify exactly which graph was published.
Provenance records whether content was authored, imported, deterministically
derived, or machine-proposed without turning provenance into authority.

### The resulting graph shape

```text
CurriculumRelease
  ├─ includes → Programme → UnitInclusion → UnitVariant
  │                                      └→ LessonInclusion → Lesson
  ├─ includes → SubjectClassificationScheme
  └─ includes → reviewed Assertions

Lesson ─ hasAuthoredArtefact → KLP
KLP ─ decomposesTo → AtomicOccurrence ─ isOccurrenceOf → SemanticEntity

ProgressionStatement ─ realises → SemanticEntity
QuestionOccurrence ─ assesses → SemanticEntity / AuthoredTarget
MisconceptionOccurrence ─ isOccurrenceOf → MisconceptionEntity
DependencyAssertion ─ source/target → SemanticEntities
AlignmentAssertion ─ source/target → Oak entity and external descriptor

Unit ─ participatesIn → Thread
UnitInclusion / LessonInclusion ─ sequencePosition → integer
```

This graph keeps programme order, thread membership, semantic dependency, and
alignment independently queryable. It also makes it possible to show the
evidence behind a relationship without asking a serving layer to reason.

### Authority by concern

Calling any one repository “the source of truth” is too coarse. A reusable
architecture needs an authority ledger.

| Concern | Candidate authority | Other estates' role |
| --- | --- | --- |
| Authored curriculum wording and placement | Authoring source behind the public API | OpenAPI publishes selected projections; ontology publishes semantic release representations. |
| Public delivery payload | `oak-openapi` schema and version | This repository code-generates clients and consumers. |
| Published semantic identity and typed relations | Versioned ontology release | OpenAPI may expose identifiers; consumers ingest rather than fork. |
| Automated decomposition, match, or recommendation | No curriculum authority; candidate evidence only | Atomic pipeline proposes; review process decides; approved results may later be published. |
| Consumer graph views and MCP tools | This repository's generated, deterministic projections | They preserve upstream authority and declare structural bounds. |
| External alignment decision | Reviewed, versioned alignment assertion | Extraction and similarity supply evidence, not the final decision. |

The unresolved architectural tension is that this repository currently derives
its public curriculum types and bulk data from OpenAPI, while the ontology's
roadmap positions the ontology as a canonical semantic substrate for MCP. These
can coexist only if “canonical” is qualified:

- OpenAPI can remain canonical for public delivery shape;
- ontology can be canonical for published semantic identity and relationships;
- the authoring system remains canonical for editable curriculum records;
- candidate pipelines remain non-authoritative;
- MCP views can combine pinned projections without inventing a second semantic
  authority.

Turning that qualification into a supported data flow would require an
explicit architecture decision. It should not emerge accidentally from which
repository happens to be easiest to query.

### Candidate publication flow

```text
Authoring source
  ├─ publishes → OpenAPI delivery release
  └─ publishes → Ontology semantic release

Candidate extraction/alignment pipeline
  └─ proposes → occurrences, entity matches, and assertions
                    └─ expert review → accepted/rejected decisions
                                         └─ eligible for semantic publication

Pinned OpenAPI + ontology releases
  └─ generated ingestion/projection in this repository
       └─ complete bounded resources and deterministic MCP tools
```

The flow makes candidate and reviewed data visibly different, and it prevents
the consumer repository from becoming an ungoverned fork of upstream semantic
truth.

## Authoring and audit implications

The data model alone will not solve the problem. The authoring experience needs
to expose the relevant context at the scale where decisions are made.

A useful workflow would support:

- lesson view for KLP wording, decomposition candidates, question mappings,
  misconceptions, and lesson-internal checkpoints;
- unit view for coverage, prior knowledge, dependency evidence, repeated or
  missing entities, and assessment distribution;
- sequence or programme view for cross-unit progression, multi-hop
  prerequisites, thread participation, and gaps;
- release comparison for additions, removals, splits, merges, changed
  mappings, and unresolved candidates;
- import/export and stable diffs so review is not trapped in one interface;
- drill-down evidence rather than a single aggregate “quality” score.

Automated suggestions should enter a review queue with their evidence and
method. Acceptance, alteration, rejection, and deferral are separate human
actions. Aggregate metrics may help prioritise inspection, but they should not
become a proxy target that obscures why a curriculum decision was made.

Unit-level review is a practical minimum for many quality questions. It is not
enough for properties that only become visible across a sequence or across
time. The interface should change projection rather than pretending every
decision belongs to one universal form.

## What this exploration advises against

- Adding every desired classification, relationship, and lifecycle field as
  optional properties on KLP.
- Using mutable KLP or descriptor text as stable graph identity.
- Treating KLP, content descriptor, atomic item, and progression statement as
  interchangeable because all contain curriculum language.
- Inferring a cross-time takeaway from thread membership.
- Treating authored sequence or `previous unit` as a prerequisite edge.
- Automatically merging semantically similar items without a reference set,
  review policy, and reversible provenance.
- Mixing candidate alignments with approved curriculum decisions in one
  statusless dataset.
- Making one subject's useful categories a compulsory cross-subject enum.
- Publishing graph diagrams whose nodes or edges do not exist in the emitted
  runtime corpus.
- Moving reasoning, opaque scoring, or curriculum judgement into deterministic
  MCP servers.
- Forking ontology identities or semantic facts locally when upstream can
  publish them.
- Treating compatibility between legacy and refreshed curricula as a temporary
  field-mapping problem instead of release and lineage design.

## Assumptions changed by the exploration

| Starting assumption | Revised understanding |
| --- | --- |
| The main task is enriching KLP schema. | The main task is separating authored artefacts, reusable meanings, occurrences, and assertions. |
| KLP text can anchor alignment and audit. | Stable entity, occurrence, and assertion identifiers are required; text is content, not identity. |
| A new generic curriculum-claim node is obviously missing. | The ontology already has KLPs and content descriptors, while the atomic work adds a third granularity. Their semantics must be reconciled before adding another class. |
| Threads express progression sufficiently. | Threads express participation; authored order and prerequisite dependency remain separate. |
| Lesson quizzes imply assessment coverage. | Evidence requires question-level, many-to-many target mappings with review state. |
| Immediate predecessor units are a usable general prerequisite model. | They are a retrieval heuristic whose validity varies by curriculum structure and stage. |
| A shared subject classification can be designed centrally. | The reusable layer should host versioned subject-owned schemes with only a small common superstructure. |
| An audit tool is mainly a report or score. | The durable value is an authoring and review workflow with explainable evidence and cross-scale projections. |
| Legacy/new coexistence is compatibility work. | It is release, identity, occurrence, lineage, and mapping lifecycle work. |
| Unit and lesson cross-source joins are permanently unavailable. | Current ontology releases now define public slugs and current unit data uses them; coverage and stability need fresh entity-by-entity verification. |
| The conceptual graph describes the served graph. | The current runtime corpus omits several conceptual nodes and relationships, so runtime completeness must be demonstrated separately. |

## Evidence probes before architecture commitment

These are probes, not a delivery sequence.

### 1. Cross-subject decomposition and classification study

Annotate a deliberately varied sample across declarative, procedural,
interpretive, creative, linguistic, and physical subjects.

- **Warrant:** tests whether entity/occurrence is reusable while taxonomies
  remain subject-owned.
- **Falsifier:** reviewers cannot agree that the proposed semantic entities are
  independently meaningful, or the common kernel requires so many exceptions
  that it provides no useful interoperability.

### 2. Current KLP granularity and identity profile

Measure multi-proposition rate, context dependency, duplicate wording,
cross-release stability, and reuse across lessons.

- **Warrant:** establishes whether first-class atomic entities solve a material
  corpus problem.
- **Falsifier:** most KLPs are already stable, atomic, and adequately identified
  for the target queries.

### 3. Competing-model query test

Implement no production system; instead, answer a known set of curriculum
questions using three paper or disposable models: enriched KLP, authored
artefact plus atomic entities, and ontology-only existing classes.

- **Warrant:** exposes which distinctions are actually needed by consumers.
- **Falsifier:** the richer model cannot answer important questions more
  accurately or explainably than a smaller existing model.

### 4. Question-to-target mapping sample

Have subject reviewers map a sample of starter and exit questions to authored
and atomic targets, recording ambiguous and multi-target cases.

- **Warrant:** tests cardinality, target granularity, and useful review fields.
- **Falsifier:** mappings are too subjective or costly to maintain, or
  lesson-level association answers the intended product questions sufficiently.

### 5. Multi-hop prerequisite study

Compare authored prior knowledge with candidates retrieved from immediate
predecessors, thread neighbours, and a bounded earlier-programme graph.

- **Warrant:** tests the observed separation of sequence from dependency and
  whether a knowledge graph improves recall.
- **Falsifier:** broader traversal adds noise without finding reviewed
  prerequisites, or source data lacks enough identity to make results auditable.

### 6. Versioned alignment round trip

Create a small set of candidate, accepted, rejected, superseded, partial, and
release-specific mappings, then export and re-import them through RDF and
property-graph forms.

- **Warrant:** tests whether assertion identity and provenance survive real
  workflows.
- **Falsifier:** the model cannot reconstruct the reviewed decision and its
  release scope without hidden application state.

### 7. Authoring interaction prototype

Test lesson, unit, and sequence projections with decomposition candidates,
assessment mappings, evidence, diffs, and explicit review actions.

- **Warrant:** validates that the semantic distinctions reduce reviewer effort
  rather than merely improving the database.
- **Falsifier:** reviewers need the information organised along materially
  different boundaries, or review time and disagreement make the workflow
  impractical.

### 8. Bounded graph-view contract test

Choose a small set of known-answer queries and declare the structural bound for
each response before adding nodes to the runtime corpus.

- **Warrant:** ensures new graph data is navigable, complete, and useful to an
  agent.
- **Falsifier:** the data cannot be emitted completely within an affordable
  bound, or consumers do not need graph traversal for the question.

## Unresolved evidence and decisions

The following remain open and should not be filled by architectural taste:

- Which existing upstream system owns stable editable identity before ontology
  publication, and how ontology URIs are fed back into authoring and OpenAPI.
- Slug coverage and stability for every entity type required for cross-source
  joins, especially lessons, KLPs, questions, and variants.
- Whether KLP ontology identity is stable across releases or identifies a
  release-specific lesson occurrence.
- The intended semantic boundary between content descriptor, atomic entity,
  KLP, pupil outcome, and a possible progression statement.
- The five-challenge KLP analysis referenced by the internal discussion but not
  available as inspectable evidence here.
- Corpus-wide decomposition quality and reviewer agreement outside the current
  experimental subject scope.
- Whether richer assessment mappings already exist upstream but are omitted
  from the public API.
- The stable identifiers and version policy of external curriculum frameworks.
- Which relationships require first-class assertion nodes and which can remain
  unqualified direct edges.
- Whether lesson-segment and narrative-device modelling earns its authoring and
  governance cost.
- The public/open-data consumer questions that justify exposing each new
  semantic layer.
- Governance for entity merges, splits, redirects, and reversals.
- Acceptable reviewer time, disagreement rate, and evidence threshold for
  approving decomposition, dependency, assessment, and alignment assertions.
- Whether ontology should become the semantic input to MCP generation, coexist
  beside OpenAPI-derived data, or be projected upstream into OpenAPI. This
  requires an explicit authority and generation decision.

## Conclusion

The four repositories do not reveal four competing solutions. They reveal four
parts of one possible architecture, each with a different responsibility.

The reusable centre is a small semantic and governance kernel: persistent
identity, occurrence, contextual role, typed assertion, provenance, review
state, and immutable release membership. KLPs, content descriptors, atomic
items, questions, threads, and programme entities remain distinct because they
answer different curriculum questions. Subject-owned schemes specialise the
kernel without fragmenting its identity and lifecycle rules.

The immediate architectural question is therefore not “which fields should be
added to KLP?” It is “which meanings are authored artefacts, which are reusable
entities, which are contextual occurrences, which relationships are reviewed
assertions, and which repository is authoritative for each published
projection?”

Answering that question with the evidence probes above would create a sound
basis for later planning. Until then, this report records the candidate model,
the convergent evidence, the counter-evidence, and the decisions that remain
genuinely open.

## Primary references

- [Oak Curriculum Ontology README](https://github.com/oaknational/oak-curriculum-ontology/blob/610ba79a96bbfa5148e4a50360b05c12e79aaf83/README.md)
- [Oak Curriculum Ontology schema](https://github.com/oaknational/oak-curriculum-ontology/blob/610ba79a96bbfa5148e4a50360b05c12e79aaf83/ontology/oak-curriculum-ontology.ttl)
- [Oak Curriculum Ontology constraints](https://github.com/oaknational/oak-curriculum-ontology/blob/610ba79a96bbfa5148e4a50360b05c12e79aaf83/ontology/oak-curriculum-constraints.ttl)
- [Ontology property-graph format](https://github.com/oaknational/oak-curriculum-ontology/blob/610ba79a96bbfa5148e4a50360b05c12e79aaf83/docs/property-graph-format.md)
- [Atomic Concepts README](https://github.com/oaknational/aila-atomic-concepts/blob/4265cca29410caf5871a3af2ac5e6d417cee3dc4/README.md)
- [Atomic item schema](https://github.com/oaknational/aila-atomic-concepts/blob/4265cca29410caf5871a3af2ac5e6d417cee3dc4/atomic_concepts/schemas.py)
- [Entity/occurrence identity ADR](https://github.com/oaknational/aila-atomic-concepts/blob/4265cca29410caf5871a3af2ac5e6d417cee3dc4/docs/adr/0002-separate-atomic-item-identity-from-curriculum-occurrence.md)
- [Staged entity-resolution ADR](https://github.com/oaknational/aila-atomic-concepts/blob/4265cca29410caf5871a3af2ac5e6d417cee3dc4/docs/adr/0003-use-staged-entity-resolution.md)
- [Sequence/dependency ADR](https://github.com/oaknational/aila-atomic-concepts/blob/4265cca29410caf5871a3af2ac5e6d417cee3dc4/docs/adr/0001-separate-curriculum-sequencing-from-prerequisite-dependency.md)
- [Atomic alignment workflow](https://github.com/oaknational/aila-atomic-concepts/blob/4265cca29410caf5871a3af2ac5e6d417cee3dc4/atomic_concepts/alignment/README.md)
- [OpenAPI lesson summary schema](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/src/lib/handlers/lesson/schemas/lessonSummaryResponse.schema.ts)
- [OpenAPI question schema](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/src/lib/handlers/questions/types.ts)
- [OpenAPI unit summary schema](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/src/lib/handlers/units/schemas/unitSummaryResponse.schema.ts)
- [Local deterministic-data ADR](../../../../docs/architecture/architectural-decisions/191-deterministic-data-surface-agent-reasons.md)
- [Local thread-progression projection](../../../../packages/sdks/graph-corpus-sdk/src/curriculum/thread-progressions-projection.ts)
- [Local ontology deep review, June snapshot](../../oak-kg-ontology-deep-review-2026-06-04.md)
