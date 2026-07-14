# Oak reusable curriculum architecture — source-first synthesis

**Date:** 14 July 2026

**Status:** Canonical final synthesis of the concept exploration; strategic direction, not a ratified implementation plan

**Scope:** Bulk curriculum publication, reusable curriculum meaning, assessment, release identity, cross-estate responsibilities, and deterministic graph serving

## Executive conclusion

Oak needs a faithful, versioned publication of the underlying curriculum data.
For each validated user question, it should then use the simplest truthful
deterministic projection; a purpose-specific graph is warranted where
relational traversal materially improves the workflow.

The underlying curriculum data remains the estate source of truth. Oak OpenAPI
should publish that data without collapsing entities, variants and placements.
This repository should compile the published snapshot completely, then expose
question-led graph or non-graph projections with explicit completeness and
provenance. The Curriculum Ontology should continue to own its formal model
and IRIs. The Atomic Concepts work should continue to explore candidate
reusable meanings, alignment and prerequisite relations without silently
promoting them into authored curriculum fact.

This changes the centre of gravity from a proposed shared semantic record to a
source-first, question-led projection architecture:

- preserve source facts completely before interpreting them;
- distinguish entity, variant, placement, revision and reusable meaning;
- keep authored order, thread participation and prerequisite dependency
  separate;
- label every relation as source fact, deterministic projection, candidate
  inference or reviewed assertion;
- join the estates explicitly at serving boundaries rather than making any one
  graph the master of all the others;
- choose graph views only for questions where relational traversal helps, and
  return complete results inside a declared structural bound.

The current bulk snapshot already supports far more graphs than this repository
happens to emit. The current graph corpus is an implementation selection, not a
capability boundary. However, the same investigation found that the bulk
contract loses programme-variant provenance at precisely the point where KS4
unit variants differ. That loss must be made explicit or repaired before a
programme-structure graph can claim variant-level truth.

The assessment licensing question is resolved for this exploration: quiz
questions are governed by the same licensing position as the other curriculum
data. Structured starter and exit questions should therefore be included in
the normal bulk contract, subject to the ordinary restriction and asset rules.
Licensing is no longer a reason to defer them.

## Decision in one page

| Concern | Direction |
| --- | --- |
| Estate source of truth | The underlying authored curriculum data, not a downstream graph |
| Bulk contract | A faithful, versioned publication with source IDs, variants, placements, questions and release provenance |
| This repository | Source-complete typed compilation plus question-led deterministic projections, graph or non-graph |
| Curriculum Ontology | Formal curriculum vocabulary, constraints and ontology-minted IRIs; authored source identifiers remain source-owned |
| Atomic Concepts | Candidate atomic-item decomposition, semantic clustering, alignment and dependency evidence; approved entity-resolution decisions remain with the authorised review process |
| Graph authority | Qualified by relation and provenance; no universal graph authority |
| Human review | Required for semantic or curriculum judgements, not for faithful source facts |
| Serving | Thin deterministic tools return complete declared views; the consuming agent reasons transparently and the teacher retains pedagogical authority |
| Release comparison | Contracted stable identity or source-authored lineage; release-scoped IDs alone cannot establish continuity |
| Quiz questions | Include as structured bulk data under the same publication rules as other curriculum data |

The immediate architectural correction is upstream and downstream at once:

1. make the bulk publication honest about variants and releases;
2. stop the current graph from naming thread adjacency as prerequisite fact;
3. expand extraction across the available bulk signals;
4. compare bounded graph and simpler typed projections for each user question;
5. keep candidate and reviewed semantic assertions distinct from source-fact
   projections; review changes epistemic status, not provenance or origin.

These are not competing steps. Correcting a false semantic claim does not
require delaying source-complete graph extraction, and extracting more facts
does not require pretending inferred relations are authored facts.

## Source, privacy and evidence boundary

This report synthesises:

- the two earlier anonymised explorations and their first synthesis;
- the current code and documentation in this repository;
- a locally downloaded public bulk snapshot;
- current local source snapshots of Oak OpenAPI, Oak Curriculum Ontology and
  AILA Atomic Concepts;
- the current schema, view definitions and release triggers in Oak
  Database-Tools;
- the repository's concept-exploration, reasoning, metacognition, graph and
  decision-lens guidance;
- the clarification that quiz questions have the same licensing status as the
  other curriculum data.

The private discussion that initiated the exploration is represented only
through the anonymised findings already recorded in the historical drafts. No
quotation, identity, attribution or personal information from that source is
included here. The report contains no host-local paths.

The three earlier reports are retained as history under [`drafts/`](./drafts/):

- [initial concept exploration](./drafts/oak-reusable-curriculum-architecture.md);
- [cross-estate reflection](./drafts/oak-reusable-curriculum-architecture-cross-estate-reflection.md);
- [first final synthesis](./drafts/oak-reusable-curriculum-architecture-final-synthesis.md).

This report supersedes their architectural conclusion. It retains their useful
observations about KLP granularity, entity versus occurrence, subject variation,
assessment identity, review and teacher value, while correcting their inherited
assumption that the current graph corpus or a shared semantic kernel should
define the target architecture.

### Evidence snapshots

The external repositories were inspected at these commits:

| Repository | Commit |
| --- | --- |
| Oak Curriculum Ontology | `610ba79a96bbfa5148e4a50360b05c12e79aaf83` |
| AILA Atomic Concepts | `f5c7ce2030937d469228b894dc0fe5e656ffe839` |
| Oak OpenAPI | `f64b8f3fe8bee849016c61e60cc0a454d424369b` |
| Oak Database-Tools | `4e24c728a55f033b6a04c05ee189501b5b9bc2c3` |

The bulk evidence is the snapshot whose local manifest records a download at
`2026-06-10T16:43:00.027Z`. It contains 30 subject-and-phase data files plus the
JSON schema. That timestamp identifies retrieval, not production: the downloader
writes its own current time, while the OpenAPI route supplies no producer
revision, generation time, release ID or file hash.

That distinction matters. The cached data demonstrably does not have the shape
that the current OpenAPI source would produce in several places. Conclusions
about the cached snapshot are therefore separated from conclusions about the
current producer source.

## The problem, reframed

There are two related but different problems.

The first is faithful publication. A consumer must be able to tell which
programme contains which unit variant, which variant contains which lessons,
and in what order. It must also know which release and producer generated the
claim. This is a data-contract problem. It does not require ontology work or
human semantic review.

The second is reusable curriculum meaning. A teacher or curriculum team may
want to know whether two KLPs express the same knowledge, whether one idea is a
prerequisite for another, or which question checks which learning target. These
are semantic and curriculum judgements. They require evidence, subject-aware
review and lifecycle policy.

Earlier reasoning risked solving both with one canonical semantic record. The
evidence does not warrant that. Faithful source structure can and should be
published directly. Reusable meanings and reviewed relationships can be joined
to it as separate, provenance-rich graphs.

The practical value remains the test:

- a teacher should be able to inspect a lesson's authored targets, which
  questions occur, and any source-authored or reviewed target mappings; the
  surface should provide evidence, caveats and options for the teacher's own
  adaptation decision, not decide what is “safe”;
- a curriculum team should be able to compare programme structure and exact
  repetition; semantic equivalence and potential gaps remain candidate or
  reviewed judgements under declared completeness rules;
- pupils may benefit from clearer progression and better-targeted assessment,
  but those are mediated outcomes to evaluate, not benefits guaranteed by a
  graph model.

## Concept-exploration movements

### Movement 1 — expand the real option space

The source evidence permits at least five broad shapes:

1. Keep the current graph corpus and add a few more node types.
2. Build a single canonical semantic graph shared across the estate.
3. Require all curriculum data to pass through the ontology before serving it.
4. Publish a faithful source snapshot and compile question-led deterministic
   projections, using graphs only where relational traversal adds value.
5. Keep little structured data and ask an AI system to infer relationships on
   demand.

Of the tested shapes, the source-first boundary in the fourth option fits the
evidence without giving one estate authority it does not own. It preserves
source meaning, accommodates formal and experimental graphs, and lets this
repository use all available bulk signals. Graph versus non-graph shape remains
a question-by-question decision.

### Movement 2 — connect the recurring distinctions

The same distinctions recur in all four repositories:

- an entity is not its occurrence or placement;
- a placement is not a content revision;
- authored sequence is not prerequisite dependency;
- exact repetition is not semantic equivalence;
- a deterministic projection is not the underlying source;
- a candidate inference is not a reviewed curriculum decision;
- a graph format is not a graph's authority.

These are more durable than any proposed universal class such as
`CurriculumClaim`. They should become contract rules, not necessarily one
shared data model.

### Movement 3 — stress-test against awkward evidence

The candidate has to survive:

- KS4 units whose lesson membership varies by exam board, tier, pathway or
  child subject;
- a lesson reused across several units or programmes;
- subject knowledge that does not decompose cleanly into context-free atoms;
- identical vocabulary terms with different contextual definitions;
- release edits, renames, moves, splits, merges and retirements;
- assessment questions that may be reused or revised independently of quiz
  placement;
- graph views that must be complete inside a structural bound rather than
  silently truncated;
- consumers that need source facts today even when semantic mappings remain
  unreviewed.

A single slug-keyed master graph fails several of these tests. Explicit source
identity plus purpose-specific projections can pass them; whether any one
projection should be a graph depends on its validated workflow.

### Movement 4 — distil the architecture

The smallest architecture that preserves the required meaning is:

```text
authored curriculum source
          |
          v
faithful, versioned bulk publication
          |
          v
source-complete typed snapshot in this repository
          |
          +--> complete typed lookups, tables and reports
          +--> purpose-specific graphs where traversal helps
          +--> other deterministic question-led projections

ontology graph -------------------- explicit joins at serving surfaces
candidate semantic graph ---------- explicit joins at serving surfaces
```

There is no arrow that turns the ontology or candidate semantic graph into a
mandatory gateway for source-derived graphs. There is also no arrow that turns
this repository's compiled snapshot into the estate authoring source of truth.

## What the bulk snapshot actually carries

The snapshot is already a rich curriculum corpus. Aggregate inspection found:

| Signal | Observed count |
| --- | ---: |
| Unit records | 1,664 |
| Unique unit slugs | 1,634 |
| Lesson records | 12,864 |
| Unique lesson slugs | 12,391 |
| `unitLessons` placement occurrences | 12,446 |
| Thread tags | 3,616 |
| Prior-knowledge statements | 7,929 |
| National Curriculum statement occurrences | 7,473 |
| KLP occurrences | 52,245 |
| Keyword occurrences | 44,974 |
| Misconception occurrences | 12,858 |
| Teacher-tip occurrences | 12,856 |
| Pupil outcomes | 12,864 |
| Content-guidance occurrences | 6,628 |
| Lessons with a transcript | 10,540 |

The repeated slugs are not noise to erase blindly. In the current snapshot:

- 26 unit slugs have more than one distinct full unit record;
- roughly 100 lesson slugs occur under more than one unit slug;
- many KS4 differences are variant or placement differences;
- repeated lesson rows also include producer duplicates with no retained
  variant qualifier.

This data can support many more graph families than the current emitted corpus.
The question is not whether this repository can build them. It can. The first
question is which source claims remain faithful after the bulk producer has
flattened the underlying structure; the second is whether a graph materially
helps a particular user workflow.

## The bulk-signal disagreement

### The two surfaces

Each subject-and-phase file contains two different structural signals:

1. `sequence[].unitLessons` is an ordered unit-membership list derived from
   sequence rows. Each entry has a lesson slug, order and publication state.
2. top-level `lessons[]` contains detailed published lesson rows fetched later
   by bare `unitSlug`.

These are not equivalent projections.

| Signal | Count |
| --- | ---: |
| Raw `sequence[].unitLessons` placements | 12,446 |
| Published placements | 12,298 |
| New placements | 148 |
| Migration placements | 0 |
| Top-level lesson rows | 12,864 |
| Unique published `(unitSlug, lessonSlug)` sequence pairs | 12,088 |
| Unique top-level `(unitSlug, lessonSlug)` pairs | 12,491 |
| Unique pairs present only at top level | 403 |
| Duplicate published sequence-pair occurrences | 210 |
| Duplicate top-level pair occurrences | 373 |

The raw row difference reconciles exactly:

```text
403 variant-union pairs
+ 163 additional duplicate occurrences
- 148 new placements omitted from the published lesson surface
= 418 additional top-level rows
```

The 373 duplicate top-level occurrences are not independent variant evidence.
They are explained by 30 duplicated maths-secondary unit records: the
conditional KS4 option-deduplication path does not run for those records, so the
producer queries the same bare unit slug again and appends the same unqualified
lesson union. In the public shape, the repeated rows carry no identity that
would let a consumer interpret their multiplicity.

### What is not wrong

Publication-state handling is consistent in the observed snapshot:

- every published sequence lesson is represented on the top-level lesson
  surface;
- none of the 148 `new` placements is represented there;
- the schema states that only published lessons appear at top level;
- the reference checker enforces this one-way rule.

The 148-row state difference is intended. It is not the bug.

### Where the real disagreement is

The reverse relation is not true. There are 403 detailed top-level
`(unitSlug, lessonSlug)` pairs that do not occur in any retained
`sequence[].unitLessons` list for that unit slug.

All 403 are KS4 and all occur where a unit slug participates in several
programme variants:

| Subject-and-phase file | Top-only pairs | Affected unit slugs |
| --- | ---: | ---: |
| Computing secondary | 18 | 7 |
| French secondary | 30 | 7 |
| German secondary | 29 | 8 |
| Physical education secondary | 94 | 19 |
| Science secondary | 199 | 45 |
| Spanish secondary | 33 | 9 |

For example, the same unit slug can represent two exam-board variants with
different lesson sets. The cached sequence surface retains one unqualified unit
record plus aggregated option metadata; that metadata does not identify the
variant that supplied `unitLessons`. The historical detailed-lesson query then
asks for every published row matching only that unit slug. It unions the lesson
sets without publishing programme or variant provenance.

```text
programme A -> unit variant A -> lessons 1..8
                                   \
                                    bare unitSlug query -> lessons 1..9
                                   /
programme B -> unit variant B -> lessons 1..9

published top-level row: unitSlug + lessonSlug, without A/B provenance
```

The disagreement is therefore not between two independent sources of
curriculum truth. It is between a variant-derived but variant-collapsed retained
sequence projection and a variant-insensitive detailed-lesson projection
produced from the same upstream estate.

### Why the producer creates it

The producer history makes the loss understandable:

- the upstream sequence view emits programme-specific rows and nested unit
  options;
- the historical released generator consistent with the cached shape
  deduplicated sequence units by bare unit slug, retaining one unqualified row
  and aggregating some option metadata;
- lesson generation extracts every unit slug from the resulting sequence;
- it calls `getAllLessonData(unitSlug)` without a programme or variant key;
- the historical SQL query returns rows across all matching variants;
- it deduplicates lesson slugs only inside that one query;
- where repeated bare unit slugs remain, the outer loop can append the same
  union again;
- the released SQL path selected no programme or variant identity;
- current GraphQL source selects `programmeSlug` but then deletes it as “not
  useful”, even though it is the remaining provenance that could distinguish
  the rows.

Current source has since added unit-option expansion and widened the sequence
deduplication key to unit slug, pathway slug and exam-board slug. It still omits
tier, child subject, year and full programme context. Its detailed GraphQL query
is still keyed only by unit slug but, because of the separate `limit: 1` bug,
currently returns at most one row rather than the historical union. The current
path changes the failure mode without repairing the underlying model.

The source comment correctly notices that one unit slug can have different
lesson sets for different exam boards. The implementation does not actually
query those variants separately. It queries the same bare slug repeatedly.

### Bug verdict

There are four distinct verdicts, and they should not be collapsed.

#### 1. Intended behaviour: unpublished filtering

Omitting `new` lesson placements from top-level published lesson details is
consistent with the schema and the observed data.

#### 2. Deliberate lossy implementation plus contract gap

Fetching all lessons by bare unit slug is an acknowledged design choice, but
publishing the union as unit–lesson rows without programme, variant or placement
provenance is lossy. The public schema does not define this variant-union
semantics or a reverse pair invariant, so it also leaves a contract gap. The
result cannot support an exact programme-structure claim. A downstream graph
must call these associations aggregate or unqualified; it must not present them
as the lesson membership of every variant.

#### 3. Confirmed current-source regression: `limit: 1`

The current GraphQL query in `getAllLessonData` includes `limit: 1`. It was
introduced on 27 May 2026 when the path moved from a SQL query returning all
matching lessons to GraphQL. In Hasura query usage elsewhere in the same source,
`limit: 1` deliberately restricts a row set to one. The accompanying live test
only asserts that the result length is greater than zero, so it cannot catch
the regression. The query has no ordering clause, so even the one retained row
is not a defined representative of the unit's variants.

The analysed cached files contain many lessons per unit, so this current query
did not produce them. That is evidence of source/deployment or source/artifact
drift, not evidence that `limit` has different semantics.

#### 4. Confirmed validation and provenance gaps

The bulk checker verifies only that each published `unitLessons` lesson slug
exists somewhere in `lessons[]` and that each top-level lesson's unit slug
exists somewhere in `sequence[]`. It does not require:

- exact `(unit variant, lesson)` pair agreement;
- reverse inclusion;
- pair uniqueness;
- programme-factor preservation;
- ordered-placement preservation;
- a release or producer identity;
- agreement between generated output and the current schema as part of the
  production job.

The current producer's variant deduplication also omits tier, child subject,
year and full programme context from its key, while the API's newer handlers
recognise several of those dimensions as programme factors. The analysed cached
snapshot shows the consequence in missing maths tier context and
indistinguishable duplicate lesson rows.

The contract drift is not theoretical. All 30 analysed data files fail the
schema bundled in the same download:

- 1,664 unit records lack required `canonicalUrl` and `subjectSlug` fields;
- all 12,864 lesson rows lack required `oakUrl` and `canonicalUrl` fields;
- 776 unit records contain a forbidden `examBoards` property;
- 8,699 lesson rows use the string sentinel `"NULL"` for `contentGuidance`,
  where the schema permits an array or JSON null.

The download route assembles stored JSON artefacts and the running web
application's schema at request time. The files and schema can therefore come
from different producer revisions. The bulk image runs generation without the
available schema-check command, and that check is not a release gate. Current
generation can also add `programmeFactors`, which the manual bulk schema
forbids. This is a broken contract pipeline, not merely untidy data.

## Would a deeper source dive answer everything?

OpenAPI source alone does not, but Database-Tools closes an important part of
the gap. It contains the exact SQL view and materialised-view definitions, base
table schemas, release records and publication triggers. Together the two
repositories answer the disagreement's mechanism and reveal concrete code and
contract defects. They still cannot identify the deployed bulk image or turn
implementation behaviour into an enduring public identity policy.

| Question | What source now answers | What remains outside source inspection |
| --- | --- | --- |
| Why are 148 sequence placements absent at top level? | Publication-state filtering | A regression test should preserve it |
| Why are 403 pairs present only at top level? | Exact SQL proves that a bare-unit query spans programme and unit variants | A live factor-qualified sample would verify the deployed data |
| Is there a current implementation bug? | Yes: `limit: 1`; also factor loss and indistinguishable duplicate emission | A live run confirms operational impact |
| Which code revision generated the cached files? | Not represented in either payload or route | Cloud Run image tag, job record and object metadata |
| What does the Hasura view contain? | Fully defined in Database-Tools | Which version is deployed still needs deployment evidence |
| Do IDs continue across published revisions? | Entity rows with the same numeric ID can retain a UID across states; publication archives and replaces the prior published row for that ID | A public guarantee of non-reuse and authoring semantics |
| Does a rename keep an ID? | The schema permits slug changes while keeping the entity ID | Confirmation that authoring workflows treat rename as revision, not replacement |
| How are placements identified? | Composite endpoint IDs plus state, order and release ID | Whether remove/re-add is one continuing placement; there is no placement UID |
| How are splits, merges and replacements represented? | No general lineage relation was found | Authoring-domain policy and lineage model |
| Are past releases immutable and retrievable? | Release rows, locks and archives exist internally | Public archive/access contract and retention guarantee |
| Which schema version governs a bulk file? | Not present in the current output | Versioned release envelope and content hashes |

The exact OpenAPI wrapper is
`published.view_lesson_open_api_with_transcripts_1`. It is a normal SQL view
over `published.mv_lesson_openapi_1_2_3` and a published transcript materialised
view. The underlying lesson materialised view retains `lessonId`,
`unitVariantId`, `programmeSlug`, unit order, lesson order and programme
context including exam board, tier, subject and year. The wrapper retains
`programmeSlug` but omits the IDs and most of that context. The bulk query then
filters only by `unitSlug` and deletes `programmeSlug`.

That SQL closes the causal question: the query really does range across all
programme/variant rows sharing the unit slug. The 403 pairs are not an
artefact of an uncertain TypeScript type.

Database-Tools also shows that:

- programmes, units, unit variants, lessons, quizzes and questions have numeric
  IDs, UIDs, state and release IDs;
- publishing a new revision with the same entity ID archives the prior
  published row and replaces it;
- insert triggers copy the existing UID for another state of the same ID;
- programme–unit, variant–lesson and quiz–question relationships are persisted
  tables with endpoint-pair-plus-state primary keys, order and release ID;
- `programme_units` records programme-to-unit membership; resolving the
  applicable unit variant is a separate, programme-qualified step;
- those placement tables have no independent placement ID or UID;
- internal releases have numeric IDs, UIDs, approval/lock state and dates;
- archived rows retain source table, source ID/UID, source release and full row.

This is evidence of a revision-replacement mechanism keyed by numeric ID. It is
not yet a consumer contract that IDs are never recycled, that a particular
authoring operation must retain an ID, or that historical releases will remain
available.

The remaining follow-up evidence is therefore narrower:

1. the image tag and job metadata for the stored bulk artefacts;
2. object generation timestamps and hashes;
3. a live factor-qualified check for representative affected KS4 units;
4. two immutable adjacent curriculum releases exported with IDs;
5. an explicit source-owner contract for ID retention, reuse, retirement,
   split, merge and replacement;
6. a decision about public access to release and archive identity.

Source inspection has now taken the implementation diagnosis much further. It
would still be a category error to treat an internal trigger as an immutable
public promise without documenting that promise in the publication contract.

## Stable variants across releases

### “Stable” has several meanings

The earlier reports used stable identity too loosely. At least six different
identities are involved:

| Identity | Meaning | Example use |
| --- | --- | --- |
| Snapshot identity | Unique inside one exported release | Refer to this row while building a graph |
| Curriculum entity identity | The continuing lesson or unit across edits | Preserve review and compare revisions |
| Unit-variant identity | One variant with a particular content membership | Distinguish exam-board or tier lesson sets |
| Placement identity | A programme contains a variant, or a variant contains a lesson, at a position | Preserve order and occurrence-specific metadata |
| Revision identity | An immutable state of an entity or placement in one release | Explain exactly what changed |
| Semantic identity | A reusable meaning judged equivalent across contexts | Reuse mappings without equating source artefacts |

A deterministic hash of a slug identifies only that slug string. In this
snapshot, slugs repeat across variants and placements, so unique snapshot
identity also needs release, entity kind and variant or placement context, or a
source row ID. A hash of content is a useful revision fingerprint, but a
wording edit changes it even when the source considers the lesson to be the
same continuing entity.

### What exists in the current internal source

The bulk output exposes slugs, some programme factors and order fields.
Database-Tools shows that the underlying source is much richer:

- programmes, units, unit variants, lessons, quizzes and questions each have a
  numeric ID, generated UID, state and `_release_id`;
- entity tables use `(entity ID, state)` primary keys;
- after-insert triggers copy an existing UID when another state is inserted for
  the same numeric entity ID;
- publication triggers archive and remove the prior published row when a
  new-state row with the same numeric ID is published;
- programme–unit, unit-variant–lesson and quiz–question tables persist the
  endpoint pair, order, state and release ID;
- the release table has a numeric ID, UID, approval and lock state;
- the archive retains the prior row and its source release.

The OpenAPI lesson materialised view already contains `lessonId`,
`unitVariantId`, `programmeSlug`, quiz IDs and order. The
published-schema/OpenAPI-facing SQL wrapper and bulk query discard much of that
information. The Curriculum Ontology publishes numeric source-ID-derived IRIs
for units, unit variants and lessons, and separately models programme,
unit-variant inclusion and lesson-inclusion structures. Programme and inclusion
IRIs in the pinned data are derived from programme context, sequence position
or endpoint IDs rather than independent source placement IDs.

This proves that better current-snapshot and revision identity is available,
and that the source implements continuity for revisions sharing an ID. It does
not yet make that identity a public non-reuse guarantee or define every
authoring lifecycle decision.

### What must be known

Before an ID is described as stable in the public cross-release contract, the
source owner still needs to confirm these questions:

1. Is each unit, unit variant, lesson, programme, quiz and question ID immutable
   and never recycled?
2. Does a title or slug rename retain the same entity ID?
3. Does a content edit retain the entity ID and create a new revision, or create
   a new entity?
4. When lesson membership changes, is that a revision of one unit variant or a
   new variant?
5. Can the same unit variant be included by several programmes?
6. Is programme identity stable when its factors or unit sequence change?
7. Is an endpoint-pair relationship intended to be the continuing placement,
   or only a release-local membership record?
8. If an item is removed, re-added or reordered, is it the same placement with
   a new revision or a new occurrence?
9. How are split, merge, replacement and retirement represented?
10. Can an ID that has disappeared ever refer to different content later?
11. Can consumers retrieve immutable earlier releases, including the mappings
    needed to join them?
12. Which IDs are public contract and which are implementation detail?

These answers matter only in proportion to the user need. A graph compiled for
one snapshot can use release-scoped occurrence IDs. Cross-release comparison,
preservation of reviewed mappings and historical audit require durable entity
identity or explicit lineage.

### Proposed public identity model

The proposed public model separates the continuing thing from its state and
its uses:

```text
contracted continuing-entity ID -> release-specific revision

programme revision
  -> programme-unit placement revision
  -> unit-variant revision
  -> variant-lesson placement revision
  -> lesson revision
```

Order is a property of placement in a release, not a property of the lesson.
Programme factors qualify the unit variant or programme context; they should
not be inferred later from a slug.

The desired public contract would make change behaviour explicit:

- rename: same entity, new revision, new display slug if required;
- wording or resource edit: same entity, new revision;
- reorder: same endpoint entities, changed placement revision;
- move to another unit: new placement, same lesson entity;
- materially different unit variant: source-owned decision to revise or mint,
  recorded explicitly;
- split or merge: new entities plus predecessor/successor lineage;
- retirement: retained identifier with terminal status, never recycled.

If the source cannot guarantee that model, the fallback is not to invent
permanent hashes. Use release-scoped IDs and publish explicit
`derivedFrom`, `replaces`, `splitFrom` or `mergedFrom` lineage where warranted.

### Minimum bulk release envelope

A longitudinally trustworthy bulk contract needs at least:

```text
releaseId and releaseUid
schemaVersion
generatedAt
producerVersion or producerCommit
sourceCycle
file hashes
```

The structural records then need:

```text
programmeId, programmeUid and programmeSlug
programme factors
unitId and unitUid
unitVariantId and unitVariantUid
programme-unit placement key or ID, order and state
lessonId and lessonUid
variant-lesson placement key or ID, order and state
quizId, quizUid and quiz type
questionId, questionUid and occurrence order
source-owned lineage where it exists
```

Where no independent placement ID exists, a release-scoped composite such as
`(release, parent entity, child entity[, position])` can identify the exported
occurrence. Position alone is insufficient and changes on reorder. The
composite must not be presented as durable placement identity unless the
contract guarantees continuity.

## Quiz questions

The licensing clarification answers the architectural gate: yes, structured
quiz questions can be treated like the other curriculum data. The bulk
recommendation is no longer conditional on a separate quiz-licensing decision.

The current source already exposes starter and exit question structures with
multiple-choice, short-answer, match and order forms. Database-Tools defines
quiz and question entities with IDs, UIDs and release IDs, plus a persisted
`quiz_questions` relationship carrying order and release. The public question
formatter removes those identities. Default/public bulk JSON contains no
structured questions. There is an optional local asset-packaging path for quiz
PDFs, but the upload path uploads only subject JSON and `/api/bulk` serves only
stored subject JSON plus the schema. The optional archive path is not evidence
that quizzes are in the public bundle. The download UI nevertheless says
questions and answers are included.

The corrected bulk shape should include:

- quiz identity and starter/exit role;
- quiz placement on a lesson;
- question identity and question occurrence order;
- question type, stem and any media metadata;
- answers and correctness/default/order data as appropriate;
- ordinary restriction, attribution and asset metadata;
- release provenance.

Licensing does not by itself answer three non-licensing questions:

1. whether image attribution or third-party media needs additional metadata;
2. how restricted lessons and assets affect publication of question content;
3. whether a question retained through an edit keeps its source identity.

It also does not turn question-to-KLP alignment into source fact. Unless that
mapping is authored upstream, it remains a candidate or reviewed assertion.

The assessment graph should distinguish:

```text
lesson -> quiz placement -> quiz -> question occurrence -> question
question -> answer option
question -[candidate or reviewed]-> learning target
```

This preserves reuse and order without treating identical wording as proof of
one semantic question entity.

## Which graphs the bulk can support

### Directly supported by the current snapshot

| Graph family | Supported source signals | Qualification |
| --- | --- | --- |
| Lesson knowledge | Lesson, KLP, outcome, teacher tip, misconception and response, content guidance | Direct source facts and deterministic containment |
| Vocabulary | Keyword occurrences and definitions in lesson context | Keep contextual definitions; do not collapse to one global definition |
| Thread membership | Thread tags on units | Membership only; thread display index is not within-thread curriculum order |
| Prior-knowledge statements | Unit-attached authored text | Text occurrences, not resolved unit-to-unit dependency |
| National Curriculum coverage | Unit-attached statements | Authored occurrence/association, not proof of complete statutory coverage |
| Transcript/content | Lesson transcripts and metadata | Respect restriction and missingness signals |
| Aggregate unit–lesson association | Top-level detailed lesson rows | Variant-unqualified because of the bulk loss described above |
| Retained unit lesson order | `sequence[].unitLessons` | Exact only for the retained flattened unit record, not all programme variants |

### Supported after bulk-contract expansion

| Graph family | Missing source fields |
| --- | --- |
| Exact programme structure | Programme ID, unit ID, programme–unit release-qualified composite and order, plus separately resolved unit-variant ID and factors |
| Exact variant lesson membership | Unit-variant ID, lesson ID, release-qualified composite placement key and order |
| Structured assessment | Quiz/question identity, order, content, answers and media metadata |
| Release diff and lineage | Release envelope, stable entity IDs, immutable revisions and lineage |

### Requires candidate or reviewed semantics

| Graph family | Why it is not a direct source fact |
| --- | --- |
| Unit or KLP prerequisite graph | Sequence and thread adjacency do not establish dependency |
| Question-to-learning-target graph | No authored mapping is present in the bulk snapshot |
| Semantic equivalence graph | Similar text does not establish same meaning |
| Atomic/reusable-meaning graph | Granularity and equivalence require subject-aware judgement |
| Cross-framework alignment | Alignment is a versioned assertion with evidence and scope |

The final category may justify an explicitly candidate graph when traversal
helps the reviewed workflow. It still requires preserved evidence and review
before a relation is presented as an Oak curriculum decision; where traversal
adds no value, a simpler typed candidate projection is preferable.

## What the current graph corpus is — and is not

The emitted graph corpus currently contains:

| Measure | Count |
| --- | ---: |
| Nodes | 40,016 |
| Edges | 74,724 |
| Units | 1,624 |
| Threads | 164 |
| Lessons | 12,391 |
| Misconceptions | 12,385 |
| Keywords | 13,452 |
| `prerequisiteFor` edges | 2,605 |
| `containsUnit` edges | 3,583 |
| `containsLesson` edges | 12,491 |
| `addressesMisconception` edges | 12,385 |
| `containsKeyword` edges | 43,660 |

Those node and edge types reflect the five extractors wired into the current
generator. They do not describe the limit of the bulk data. Ten unique bulk
unit slugs are absent because unit nodes are discovered through selected
relationship inputs rather than enumerated from the source-complete unit set.

Three current transformations need correction:

1. The generator orders units within threads by year and an arbitrary same-year
   slug tie-break, then emits consecutive pairs as `prerequisiteFor`. Its own
   comments say same-year order is not curricular. Thread progression can be a
   useful deterministic projection, but it is not prerequisite evidence.
2. Unit–lesson edges use the top-level bulk lesson rows, so all 403
   variant-unqualified union pairs become apparently exact `containsLesson`
   edges.
3. Keywords are normalised by term and retain the first deterministic
   definition. In the current snapshot, 5,140 normalised terms have more than
   one observed definition, with as many as 49. A deterministic first value is
   not a context-independent definition.

The graph's `sourceVersion` is the downloader's `downloadedAt` timestamp. It is
therefore a retrieval timestamp, not a source release or producer version.

These are correctable projection choices. They are not reasons to reject graph
generation or to constrain future graphs to the current corpus.

## The recommended source-first projection architecture

### Source-complete compilation boundary

This repository should first compile every supported bulk signal into a typed,
loss-aware snapshot. “Source-complete” means complete relative to the declared
bulk release, including duplicates, restrictions, contextual occurrences and
provenance. It does not mean putting every field into every graph.

ADR-086's instruction to mine bulk data speculatively is sound at the
extraction layer. Publication should remain selective and question-led.

### Candidate projection families

The bulk and adjacent sources could support these projection domains. A graph
is a candidate representation, not the default; each domain still needs a
comparison with a simpler typed lookup, table, report or API response.

| Projection domain | Primary questions | Epistemic basis |
| --- | --- | --- |
| Programme structure | What is taught, in which variant, programme and order? What differs between programmes? | Source fact after bulk v2 |
| Lesson knowledge | Which KLPs, outcomes, misconceptions, tips and guidance belong to a lesson? | Source fact |
| Vocabulary progression | Where is a term introduced, revisited and defined in context? | Source fact plus deterministic projection |
| Assessment | Which quizzes and questions occur in a lesson, and in what order? | Source fact; target mappings separate |
| Curriculum coverage | Which authored statements are associated with which units and lessons? | Source fact plus declared aggregation |
| Release change | Which entities, revisions and placements changed? | Deterministic diff over stable/release-scoped identity |
| Candidate dependency | What possible prerequisites are supported by evidence? | Candidate inference or reviewed assertion |
| Candidate reusable meaning | Which occurrences may express the same meaning? | Candidate inference and subject review |
| Formal ontology | How are published curriculum classes and relations expressed and constrained? | Ontology-owned formal assertions |

No projection needs to contain all the others. A serving workflow may join two
or three projections for one user question, with the join and provenance
visible. A graph is appropriate only where those relationships and traversals
are material to answering the question.

### Epistemic status

Every node and relation should be classifiable as one of:

1. **Source fact** — explicitly present in a pinned source release.
2. **Deterministic projection** — reproducibly computed without semantic
   judgement.
3. **Candidate inference** — proposed by a rule, model or analyst for review.
4. **Reviewed assertion** — accepted for a defined scope by an authorised
   curriculum process.

Source facts do not need human review to become source facts. They need schema,
integrity and provenance tests. Candidate semantics do need review; a model
confidence score is evidence for triage, not curriculum authority.

Review promotes a candidate to a reviewed assertion for a declared scope. It
does not rewrite the assertion's origin or merge it into authored source fact.

Each published relation should carry or resolve to:

- source release and source record;
- transform version;
- relation meaning and direction;
- epistemic status;
- scope, subject and framework where applicable;
- reviewer/evidence metadata for reviewed assertions;
- replacement or retirement status where applicable.

### Graph-serving contract

Each graph view must declare:

- the node and edge kinds it includes;
- the projection-membership and structural rules that bound it;
- the release and epistemic classes it includes;
- the completeness rule inside that bound;
- how missing and restricted content is represented.

The tool must return every matching node and every internal edge inside the
declared bound. A subgraph must never be paged, truncated or sampled. A
legitimate window may contain only whole structural members and must include
totals, continuation metadata and anchors for the next bounded call; it must
also report which requested anchors resolved and which remain unknown.

Failure must be a typed refusal, a well-formed empty result or fail-fast corpus
construction, never a degraded list presented as a graph. Deterministic joins
belong in typed corpus or view operations; tools format those results. The
consuming agent performs reasoning, comparison and explanation transparently.
A non-agent application may present deterministic facts and evidenced options,
but should not add hidden recommendation logic. The teacher retains pedagogical
authority.

## Authority by concern

Authority is plural and qualified:

| Concern | Appropriate authority |
| --- | --- |
| Authored curriculum wording and placement | Underlying curriculum authoring/source system |
| Database schema, release mechanics and published-view definitions | Oak Database-Tools |
| Public transport shape and eligibility | Oak OpenAPI bulk/API contract |
| Deterministic source-derived projections | This repository and its versioned generators |
| Formal classes, properties, constraints and ontology IRIs | Oak Curriculum Ontology |
| Candidate atomic items, semantic matches and inferred dependencies | Atomic Concepts candidate pipeline |
| Accepted semantic or alignment decisions | Explicit curriculum review/governance process |
| Teacher adaptation in context | Teacher judgement supported, not replaced, by the tools |

The Curriculum Ontology demonstrates a useful structure for programme,
unit-variant inclusion, unit variant, lesson inclusion and lesson. It publishes
numeric source-ID-derived IRIs for some entities, while programme and inclusion
IRIs use contextual keys. This shows that the distinctions the bulk discards
can be represented; it does not establish independent source placement
identity, make the ontology a mandatory transformation layer, or prove a
cross-release identity guarantee.

Atomic Concepts contributes equally important constraints: entity and
occurrence are separate; sequencing and prerequisite dependency are separate;
exact deduplication may be automatic while semantic merging is staged and
reviewed. Its current hash identities are described as prototype choices, not
proof of production curriculum identity.

## Implications by repository

### This repository

This repository should:

- treat the bulk schema, manifest and observed payload together as compilation
  ground truth, while surfacing their disagreement rather than masking it;
- enumerate source entities directly instead of discovering them only through
  selected relationships;
- create a source-complete typed intermediate representation;
- retain occurrence-level KLPs, keywords, definitions, misconceptions,
  statements, outcomes, tips, guidance and transcripts;
- compare graph and non-graph outputs for known user questions, publishing the
  simplest projection that preserves the required structure and workflow;
- label current unit–lesson associations as aggregate until exact variant
  placements are available;
- remove or rename the false `prerequisiteFor` relation and update generator,
  SDK documentation, MCP descriptions, prompts and tests together;
- model vocabulary definitions in context rather than choosing one global
  first definition;
- replace the retrieval timestamp with a real release/provenance envelope;
- test completeness within each graph's declared structural bound.

The repository should not wait for a complete ontology or semantic-review
system before exposing honest source-derived graphs.

### Oak Database-Tools and the curriculum database

Database-Tools is the missing source layer that the OpenAPI-only inspection
could not see. It should:

- remain the executable authority for table, view, materialised-view, trigger
  and release mechanics;
- expose a purpose-built published view for bulk generation rather than making
  the producer reconstruct variant structure from a lossy wrapper;
- carry entity IDs and UIDs, programme factors, endpoint relationships, order
  and release IDs through that view;
- represent programme-to-unit membership as such, then resolve unit variants
  through a separate programme-qualified relation instead of implying that
  `programme_units` directly selects a variant;
- document which existing revision behaviours are supported public identity
  guarantees;
- make clear that today's placement tables have no independent ID or UID; a
  release-qualified endpoint-pair composite can identify an exported
  occurrence, but continuity through reorder, removal and re-addition needs a
  contract or an independent placement identity;
- expose release metadata and an authorised historical projection without
  requiring consumers to access internal archive tables;
- add explicit lineage for split, merge, replacement and retirement where the
  authoring domain distinguishes those events.

The current schema already contains most of the raw ingredients. The main gap
is faithful publication and a documented contract, not invention of new
downstream identifiers.

### Oak OpenAPI and bulk generation

The OpenAPI/bulk estate should:

- repair the `limit: 1` regression and add a cardinality regression test;
- generate the bulk from programme- and variant-qualified records rather than
  repeated bare-unit queries;
- preserve programme, unit, unit-variant, lesson and placement identities;
- include every programme factor used to distinguish variants, including tier
  and child subject;
- make programme-unit and variant-lesson placements explicit with order and
  publication state;
- include structured quiz questions and answers under the normal eligibility
  rules;
- publish release ID, schema version, producer version, generation time and
  content hashes;
- retain immutable earlier releases when longitudinal use is intended;
- align runtime output, the canonical schema, generated consumer types, UI
  claims and documentation;
- run bidirectional referential-integrity, uniqueness and variant-preservation
  checks as part of production, not only as an optional command.

The API's newer programme and lesson handlers already recognise programme
factors and multi-variant lesson membership. The bulk path should reuse that
more faithful model rather than maintain a separate flattened shape.

### Oak Curriculum Ontology

The ontology should continue to own:

- its formal vocabulary and constraints;
- its IRI minting rules and a lifecycle policy that remains to be documented
  during the early-release period;
- faithful RDF and property-graph representations;
- explicit mappings to published source IDs where the source publishes them.

It should not be required to mediate every source-derived projection. Its current
early-release status and URI-change warning make an explicit versioned join
safer than treating its identifiers as an unqualified estate-wide kernel.

The ontology work can help define the target bulk placement shape, because it
already preserves distinctions the bulk loses. The source estate must still
confirm ID stability and lineage.

### AILA Atomic Concepts

Atomic Concepts should remain a candidate-analysis pipeline; any graph
projection it emits should:

- preserve authored occurrences and provenance;
- propose reusable meanings or prerequisite relations separately from source
  sequence;
- perform automatic duplicate removal only for exact or explicitly validated
  near-exact repeated occurrences;
- emit semantic clusters as candidates and change canonical entity identity
  only through an approved judgement;
- publish confidence, method, model/version and review state;
- join to stable or release-qualified source occurrences.

It should not become the base curriculum fact graph, and its provisional
`entity_id` and `occurrence_id` hash identifiers should not be imported as
source entity or occurrence IDs.

### Authoring and source-data systems

If Oak wants longitudinal curriculum identity, the authoring/source domain must
own the lifecycle decisions. Downstream repositories cannot determine whether
a changed lesson is a revision, replacement, split or new entity by inspecting
text alone.

The source domain should therefore publish or authorise:

- durable entity and variant IDs;
- placement identity or explicit release-scoped placement rules;
- revision and release boundaries;
- retirement and non-reuse guarantees;
- split, merge and replacement lineage;
- the distinction between editable authoring state and immutable release state.

### MCP and consuming applications

Consumer descriptions and prompts are part of the semantic contract. A correct
generator paired with an overclaiming tool description remains an incorrect
system.

Consumers should:

- ask for graph views by user question and release;
- see whether relations are source, projected, candidate or reviewed;
- receive complete declared views;
- avoid presenting thread order as prerequisite truth;
- explain ambiguity where the source is aggregate or variant-unqualified;
- keep teachers in control of adaptation and interpretation.

## Known-answer user questions

Graph work should start from questions whose correct answers can be checked.
Examples include:

- Which exact lessons differ between two KS4 programme variants?
- Where does a vocabulary term first occur within a named programme and
  release, and how is it defined in each lesson context?
- Which lessons contain a given misconception and response?
- Which KLPs, outcomes and questions belong to this lesson release?
- Which published questions recur across quiz placements?
- Which National Curriculum statements are explicitly associated with a unit,
  and what aggregation rule is being used?
- Given contracted stable identity or source-authored lineage, what source
  entities, revisions and placements changed between two releases?
- Which possible prerequisites have evidence, and which have been reviewed?
- Which candidate reusable meanings occur across subjects or phases, without
  erasing the authored wording?

The first seven can be answered primarily from faithful source data once the
required variant, question-identity and lineage fields exist. Release-scoped
IDs alone cannot prove continuity across releases. The last two require
candidate or reviewed semantic projections. That boundary should be visible to
the user.

## Assumptions challenged by the evidence

| Initial assumption | Evidence-led correction |
| --- | --- |
| The current graph shows what bulk-derived graphs are possible | It shows only the extractors currently wired into one generator |
| More graph data should wait until the prerequisite overclaim is fixed | Source-complete extraction and semantic correction can proceed together |
| One canonical semantic record would reduce duplication | It would centralise unlike epistemic claims and create a new authority problem |
| The ontology should be the general semantic authority | It owns its formal assertions, not every curriculum fact or candidate relation |
| Local source-derived graphs would fork the ontology | They are legitimate projections of the curriculum source with explicit joins |
| A slug hash gives stable identity | It gives reproducible minting only while the slug is unchanged |
| The bulk timestamp identifies its source version | It records download time only |
| Sequence and top-level lesson arrays are redundant views | They disagree at variant boundaries because one is flattened differently |
| Duplicate lesson rows preserve variant information | Without factors or placement identity, their multiplicity is not interpretable |
| Keyword normalisation yields a reusable definition | Thousands of normalised terms have several contextual definitions |
| Quiz licensing is an unresolved blocker | The clarification removes that blocker; technical identity and asset questions remain |
| Human review is needed before adding any graph relation | Faithful source facts need validation, while semantic judgements need review |

## Decision lenses

The lenses are ordered decision rules, not votes. The first decisive lens
governs; here long-term architectural excellence settles the source-first
boundary, and lenses two to five test that decision for consistency.

### 1. Long-term architectural excellence

A faithful versioned source contract plus question-led projections preserves
meaning and lets each estate evolve independently. A master graph or slug-keyed
flattened bulk would embed current accidents as permanent architecture.

### 2. Strict and complete

The architecture must reject silent variant union, false prerequisite naming,
context-free first definitions and untraceable release labels. Graph views must
be complete inside explicit structural bounds.

### 3. Simpler without compromising quality

Direct source-derived facts do not need an ontology round trip. One typed
source snapshot feeding the simplest adequate projection for each question is
simpler than one universal semantic schema, while retaining the distinctions
that matter.

### 4. Change the system to dissolve the problem

The 403-pair disagreement cannot be repaired reliably with downstream
precedence rules. Preserving programme, variant and placement identity in the
bulk removes the ambiguity for every consumer.

### 5. User value

User value is an evidence gate: a projection must help teachers or curriculum
teams answer real questions with less reverse engineering and no false
certainty. Graph richness is not the goal; trustworthy, useful workflows are.

## Evidence-led next sequence

This exploration does not authorise implementation across the repositories,
but it identifies a warranted order of proof.

### A. Establish exact bulk provenance and repair the producer defects

Confirm the deployed image and stored-object generation metadata, remove the
one-row query limit, and add cardinality and bidirectional placement tests.

**Falsifier:** a live factor-qualified query or deployment record shows that the
current interpretation of the view or producer revision is wrong.

### B. Agree the release and identity contract

Turn the database's current entity-ID, UID, release and archive behaviour into
an explicit consumer contract. Resolve placement continuity and split/merge
lineage. Publish a minimal release envelope and two immutable snapshots.

**Falsifier:** paired releases show unexplained ID reuse or mutation contrary to
the proposed guarantee.

### C. Produce a faithful bulk v2 slice

Use one affected KS4 subject to preserve programme factors, exact variant
lesson membership and placement order. Include structured starter and exit
questions for the same slice.

**Falsifier:** the new shape cannot reconstruct the public programme and lesson
views without hidden lookups or still produces unqualified union pairs.

### D. Compare graph and simpler typed projections in real workflows

For each selected question, build the smallest bounded graph projection and a
simpler typed non-graph projection. Validate both against source truth and the
intended teacher or curriculum-team workflow. Measure task success and time,
comprehension, confidence, adaptation errors and cognitive load.

**Falsifier:** relational traversal adds no material workflow value, worsens
task performance or comprehension, cannot return a complete answer inside its
declared bound, or loses source provenance.

### E. Evaluate candidate semantic graphs separately

Sample several contrasting subjects and test prerequisite, reusable-meaning and
question-target mappings with curriculum review. Measure agreement, review
time, reversibility and teacher usefulness.

**Falsifier:** the proposed granularity or relation cannot be applied
consistently, does not improve a known workflow, or creates more review burden
than value.

## Remaining decisions

The principal unresolved decisions are now narrower and more concrete:

- Which source owner makes the implemented ID/UID revision behaviour a public
  non-reuse guarantee?
- Which authoring changes revise a unit variant and which mint a new one?
- Is an endpoint-pair relationship the continuing placement through reorder,
  removal and re-addition, or is an independent placement UID required?
- Which historical releases can be made immutable and public to consumers?
- What lineage vocabulary is needed for rename, move, split, merge and
  replacement?
- Which quiz and answer media need attribution beyond the ordinary bulk fields?
- Which user questions justify a graph rather than a simpler typed projection,
  and what are their structural bounds?
- Which semantic relations are already authored facts, and which require a new
  review workflow?

The following questions are no longer open:

- this repository is not limited to the graph it currently emits;
- the 148 unpublished placement difference is expected;
- the 403 top-only pairs arise at programme-variant flattening;
- Database-Tools defines the exact wrapper and materialised views, confirming
  that the bare-unit query spans programme variants;
- the current OpenAPI source contains a one-row lesson-query regression;
- a download timestamp is not source provenance;
- the source database already implements entity IDs/UIDs, release IDs,
  revision replacement and archives, while placement rows use composite keys;
- quiz licensing is not a separate blocker;
- source facts and candidate semantic judgements should not share an
  unqualified authority class.

## Final conclusion

The reusable curriculum opportunity is real, but its foundation is more
concrete than the earlier semantic-kernel framing suggested.

First publish the curriculum source faithfully: programmes, variants,
placements, lessons, questions and releases with identities that mean what
their contracts say. Then let this repository compile that source completely
and expose the simplest deterministic projection for each validated teacher or
curriculum question, using a graph only where traversal materially helps. Join
formal ontology and candidate semantic projections explicitly, without making
either a compulsory gateway or presenting inference as authored fact.

The bulk disagreement is valuable evidence. It shows exactly why entity,
variant and placement cannot be collapsed into a slug pair. The source dive
also shows that code inspection has limits: it can identify the flattening path
and a concrete `limit: 1` bug, but it cannot invent deployment provenance or an
ID lifecycle policy that the source estate has not published.

This architecture is both stricter and simpler. It removes false claims,
preserves all usable source signals, gives each repository a clear authority,
and keeps the measure of success where it belongs: whether teachers and
curriculum teams can understand, compare and adapt curriculum with greater
confidence and less hidden ambiguity.

## Primary references

### Local architecture and data evidence

- [Decision principles](../../../.agent/directives/principles.md)
- [Verify data supports shape before building](../../../.agent/rules/verify-data-supports-shape-before-building.md)
- [ADR-083: complete lesson enumeration](../../../docs/architecture/architectural-decisions/083-complete-lesson-enumeration-strategy.md)
- [ADR-086: vocab-gen graph export](../../../docs/architecture/architectural-decisions/086-vocab-gen-graph-export-pattern.md)
- [ADR-173: graph-stack topology](../../../docs/architecture/architectural-decisions/173-graph-stack-topology.md)
- [ADR-191: deterministic data surface](../../../docs/architecture/architectural-decisions/191-deterministic-data-surface-agent-reasons.md)
- [ADR-194: teacher as expert](../../../docs/architecture/architectural-decisions/194-teacher-as-expert-product-boundary.md)
- [Bulk manifest](../../../apps/oak-search-cli/bulk-downloads/manifest.json)
- [Current generated graph corpus](../../../packages/sdks/oak-sdk-codegen/src/generated/vocab/graph-corpus/data.json)
- [Current graph edge generation](../../../packages/sdks/oak-sdk-codegen/src/bulk/generators/graph-corpus-edges.ts)
- [Current graph node generation](../../../packages/sdks/oak-sdk-codegen/src/bulk/generators/graph-corpus-nodes.ts)
- [Current keyword extraction](../../../packages/sdks/oak-sdk-codegen/src/bulk/extractors/keyword-extractor.ts)
- [Known data variances](../../../docs/domain/DATA-VARIANCES.md)

### Oak OpenAPI at `f64b8f3fe8bee849016c61e60cc0a454d424369b`

- [Bulk data queries](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/src/lib/bulk-data/get-data.ts)
- [Bulk preparation](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/bin/prepare-bulk.ts)
- [Bulk JSON schema](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/src/app/api/bulk/schema.json/schema.json)
- [Bulk reference checks](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/bin/bulk-data-checks/check_references.ts)
- [Bulk route](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/src/app/api/bulk/route.ts)
- [Published-view constants and row types](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/src/lib/owaClient.ts)
- [Programme handlers](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/src/lib/handlers/programmes/programmes.ts)
- [Unit programme factors](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/src/lib/handlers/unitProgrammeFactors.ts)
- [Question formatter](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/src/lib/handlers/questions/helpers.ts)
- [Question types](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/src/lib/handlers/questions/types.ts)
- [Historical generator consistent with the cached bulk shape](https://github.com/oaknational/oak-openapi/blob/2fa4d6b75f9887c334981434cf933a10b5834766/src/lib/bulk-data/get-data.ts)
- [`limit: 1` introduction](https://github.com/oaknational/oak-openapi/commit/01906db02542e21e609b14519317dddae8e39b7c)

### Oak Database-Tools at `4e24c728a55f033b6a04c05ee189501b5b9bc2c3`

- [Lesson-with-transcripts view](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/database-tools/sql-schema-docs/open-api-views/view_lesson_openapi_with_transcripts.sql)
- [Lesson OpenAPI materialised view](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/database-tools/sql-schema-docs/open-api-materialized-views/mv_lesson_openapi.sql)
- [Curriculum-sequence view](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/database-tools/sql-schema-docs/owa-views/view_curriculum_sequence_b.sql)
- [Curriculum-sequence materialised view](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/database-tools/sql-schema-docs/owa-materialized-views/mv_curriculum_sequence_b.sql)
- [Programme schema](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/oak-curriculum-schema/drizzle/schema/public/programmes.ts)
- [Programme–unit placement schema](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/oak-curriculum-schema/drizzle/schema/public/programme_units.ts)
- [Unit-variant schema](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/oak-curriculum-schema/drizzle/schema/public/unitvariants.ts)
- [Variant–lesson placement schema](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/oak-curriculum-schema/drizzle/schema/public/unitvariant_lessons.ts)
- [Quiz–question placement schema](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/oak-curriculum-schema/drizzle/schema/public/quiz_questions.ts)
- [Release schema](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/oak-curriculum-schema/drizzle/schema/internal/releases.ts)
- [Archive schema](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/oak-curriculum-schema/drizzle/schema/internal/archives.ts)
- [Lesson UID continuity trigger](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/database-tools/sql-schema-docs/cat-functions/table-triggers/lessons/function__lessons__after_insert.sql)
- [Lesson publication and archive trigger](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/database-tools/sql-schema-docs/cat-functions/table-triggers/lessons/function__lessons__before_update_publish.sql)
- [Unit-variant publication and archive trigger](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/database-tools/sql-schema-docs/cat-functions/table-triggers/unitvariants/function__unitvariants__before_update_publish.sql)
- [Variant–lesson placement publication trigger](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/database-tools/sql-schema-docs/cat-functions/table-triggers/unitvariant_lessons/function__unitvariant_lessons__before_update_publish.sql)

### Oak Curriculum Ontology at `610ba79a96bbfa5148e4a50360b05c12e79aaf83`

- [Repository overview](https://github.com/oaknational/oak-curriculum-ontology/blob/610ba79a96bbfa5148e4a50360b05c12e79aaf83/README.md)
- [Ontology](https://github.com/oaknational/oak-curriculum-ontology/blob/610ba79a96bbfa5148e4a50360b05c12e79aaf83/ontology/oak-curriculum-ontology.ttl)
- [SHACL constraints](https://github.com/oaknational/oak-curriculum-ontology/blob/610ba79a96bbfa5148e4a50360b05c12e79aaf83/ontology/oak-curriculum-constraints.ttl)
- [Property-graph format](https://github.com/oaknational/oak-curriculum-ontology/blob/610ba79a96bbfa5148e4a50360b05c12e79aaf83/docs/property-graph-format.md)
- [Programme structure data](https://github.com/oaknational/oak-curriculum-ontology/blob/610ba79a96bbfa5148e4a50360b05c12e79aaf83/data/programme-structure.ttl)

### AILA Atomic Concepts at `f5c7ce2030937d469228b894dc0fe5e656ffe839`

- [Repository context](https://github.com/oaknational/aila-atomic-concepts/blob/f5c7ce2030937d469228b894dc0fe5e656ffe839/CONTEXT.md)
- [Atomic-item schemas](https://github.com/oaknational/aila-atomic-concepts/blob/f5c7ce2030937d469228b894dc0fe5e656ffe839/atomic_concepts/schemas.py)
- [Sequence and dependency ADR](https://github.com/oaknational/aila-atomic-concepts/blob/f5c7ce2030937d469228b894dc0fe5e656ffe839/docs/adr/0001-separate-curriculum-sequencing-from-prerequisite-dependency.md)
- [Entity and occurrence ADR](https://github.com/oaknational/aila-atomic-concepts/blob/f5c7ce2030937d469228b894dc0fe5e656ffe839/docs/adr/0002-separate-atomic-item-identity-from-curriculum-occurrence.md)
- [Staged entity-resolution ADR](https://github.com/oaknational/aila-atomic-concepts/blob/f5c7ce2030937d469228b894dc0fe5e656ffe839/docs/adr/0003-use-staged-entity-resolution.md)
- [Alignment workflow](https://github.com/oaknational/aila-atomic-concepts/blob/f5c7ce2030937d469228b894dc0fe5e656ffe839/atomic_concepts/alignment/README.md)
