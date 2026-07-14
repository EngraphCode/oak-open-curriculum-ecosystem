# Oak reusable curriculum architecture — initial concept exploration

**Date:** 2026-07-14  
**Status:** Standalone initial findings, deliberately recorded before cross-repository research  
**Scope:** Anonymised curriculum-tooling observations and directly relevant evidence in this repository

## Source and privacy boundary

This report records the first concept-exploration pass on a private internal
discussion about reusable curriculum architecture. The source was used only to
extract anonymised ideas. No quotation, identity, attribution, or personal
information from it is reproduced here.

This is intentionally the **pre-research record**. It does not incorporate
findings from the Oak Curriculum Ontology, Atomic Concepts, or Oak OpenAPI
repositories. Those sources are examined separately in the
[cross-estate reflection](./oak-reusable-curriculum-architecture-cross-estate-reflection.md).

## Outcome in one sentence

The initial evidence frames the opportunity as a semantic-model and authoring-
lifecycle problem, not principally as a request to add fields to Key Learning
Points (KLPs).

## Initial problem frame

The current curriculum surface asks KLPs and nearby lesson metadata to carry
several meanings at once:

- instructions or prompts for curriculum creators;
- lesson outcomes;
- the knowledge intended to remain after teaching;
- assessment targets;
- alignment anchors;
- audit units;
- machine-readable propositions;
- inputs to cross-unit and cross-time progression.

Those meanings overlap, but they are not identical. They differ in granularity,
scope, ownership, review, versioning, and reuse. Treating them as one text field
creates predictable difficulties:

- one KLP may contain several independently meaningful propositions;
- the same underlying idea can appear in several lessons or year groups;
- an idea's pedagogical role can change with context;
- a question may assess only part of a KLP or several KLPs at once;
- a thread can organise content without stating what pupils should retain;
- alignment by text is brittle under editing and curriculum revision;
- audit findings cannot be distinguished from approved curriculum decisions.

The load-bearing question is therefore:

> Which things need stable identity, which are contextual appearances, which
> are relationships, and which are reviewable assertions rather than intrinsic
> fields?

## Load-bearing observations

### 1. Curriculum meaning is being compressed across several layers

At least seven layers need to remain distinguishable:

| Layer | Purpose | Typical scope |
| --- | --- | --- |
| Curriculum organisation | Locate content in strands, sub-strands, threads, programmes, units, and lessons | Subject to curriculum release |
| Knowledge proposition | State knowledge or capability that can be referred to and reused | Lesson, unit, sequence, or cross-time |
| Subject classification | Describe the subject-specific kind of knowledge or practice | Subject-owned scheme |
| Pedagogical role | State how a proposition functions here, such as core residue or supporting context | One occurrence or placement |
| Instructional sequence | Anchor introduction, development, narrative beat, or checkpoint | Within lesson or unit |
| Evidence and assessment | Connect questions or tasks to intended learning | Question, task, lesson, or assessment form |
| Alignment and lifecycle | Relate internal content to external frameworks and releases, with provenance and review | Versioned assertion |

The first modelling implication is negative but important: these should not all
be optional attributes on KLP.

### 2. KLP is an authored aggregate, not a guaranteed atomic unit

KLP remains valuable as a human-authored lesson-level statement. The problem is
not that KLP should disappear; it is that KLP should not be assumed to be the
smallest stable semantic object.

A KLP may:

- combine a fact, concept, and skill;
- depend on context supplied elsewhere in the lesson;
- use pedagogical wording that is unsuitable as a reusable identifier;
- change wording without changing intended meaning;
- retain wording while its expected depth changes.

The initial architectural hypothesis is therefore that KLP may need to point
to one or more stable curriculum claims or atomic knowledge entities. That
hypothesis is deliberately provisional: subsequent research must establish
whether an existing upstream class already supplies the role.

### 3. Reuse requires separating entity from context

The same underlying knowledge can appear in more than one place while playing
different roles. “Core” in one lesson may be supporting knowledge in another.
A proposition may be taught in one unit, required by another, assessed in a
third context, and aligned to an external descriptor.

The reusable entity should therefore contain only properties intrinsic to its
meaning. Contextual properties belong on an occurrence, placement, or
relationship:

- where it appears;
- why it appears there;
- expected depth or stage;
- pedagogical role;
- source wording;
- review state;
- release membership.

This avoids both extremes: duplicating the same meaning everywhere, and
collapsing distinct contextual uses into one over-general node.

### 4. Thread membership is not a cross-time takeaway

A thread can express that units participate in a recurring theme, idea, or
skill. It does not automatically state the proposition pupils are expected to
retain across time.

Cross-time takeaways need to be explicitly authored or reviewed. Inferring them
from membership would upgrade an organisational relation into a curriculum
claim. Similarly, unit order can be evidence about progression without proving
prerequisite dependency.

The initial model therefore keeps these separate:

- `participatesIn` or equivalent: organisational thread membership;
- ordered placement: the authored curriculum sequence;
- `buildsOn`, `requires`, or equivalent: a reviewed knowledge-dependency
  assertion;
- a cross-time proposition: an explicitly scoped authored object.

### 5. Assessment requires target-level relationships

Starter and exit quiz placement gives useful lesson context, but lesson-level
association is too coarse for assessment analysis.

The relationship between questions and intended learning is many-to-many:

- one question may draw on several propositions;
- one proposition may be checked by several questions;
- a distractor may reveal a misconception rather than assess the whole KLP;
- a checkpoint may gather weaker or different evidence than an exit question.

The candidate relationship is therefore:

```text
question or task ─ assesses/checks → stable learning target
```

The mapping needs provenance and review state. Automated suggestions may help
create candidates, but they should not be presented as approved assessment
truth.

### 6. Alignment is a versioned assertion, not a string match

An internal curriculum proposition may align fully, partially, or in
combination with an external descriptor. The relationship can vary by key
stage, expected depth, curriculum version, and framework release.

Alignment therefore needs:

- stable source and target identifiers;
- relationship meaning and direction;
- source and target release;
- scope;
- evidence or method;
- candidate/reviewed/accepted/rejected/superseded state;
- lineage to earlier decisions.

Mutable KLP text should not be the alignment key. Text similarity can supply
evidence for a candidate, but it cannot carry the governance semantics of the
decision.

### 7. Audit is part of authoring, not merely a score

The initial observations point towards an authoring-and-review workflow rather
than a detached audit report.

Creators and reviewers need to move between scales:

- lesson: wording, intended residue, misconceptions, questions, checkpoints;
- unit: coverage, duplication, gaps, prior knowledge, assessment distribution;
- sequence: progression, multi-unit dependencies, recurring threads, cross-time
  takeaways;
- release: additions, removals, changes, mappings, unresolved candidates.

A single aggregate quality score risks hiding the evidence and becoming a
proxy target. Deterministic checks, explanations, drill-downs, and explicit
review decisions are safer. Where ranking is useful for triage, it should not
be confused with curriculum truth.

### 8. Legacy and refreshed curricula require real versioning

Supporting two curricula at once is not a temporary compatibility problem. It
requires:

- mutable authoring workspaces;
- immutable published releases;
- persistent identity separated from a release-specific revision;
- occurrence and placement scoped to a release;
- lineage for unchanged, revised, split, merged, and superseded objects;
- mappings whose validity is release-specific.

Without these distinctions, editing an apparently shared object can silently
rewrite historical curriculum meaning.

## Direct evidence in this repository

The local repository already reveals the gap between a useful conceptual model
and the data actually available to consumers.

### Public schema projection

The generated OpenAPI cache in
[`api-schema-original.json`](../../../packages/sdks/oak-sdk-codegen/schema-cache/api-schema-original.json)
shows:

- KLPs as an array of objects containing only `keyLearningPoint` text;
- misconceptions as lesson-level text and response pairs;
- starter and exit quiz questions grouped at lesson level;
- no question-to-KLP or question-to-proposition relationship in the public
  response;
- unit threads represented by slug, title, and order;
- prior-knowledge requirements represented as strings.

These shapes are useful delivery projections. They do not supply stable
semantic identity for the proposed audit, alignment, or reuse questions.

### Conceptual graph versus emitted runtime graph

The conceptual graph in
[`property-graph-data.ts`](../../../packages/sdks/oak-sdk-codegen/src/mcp/property-graph-data.ts)
includes:

- KLP, quiz, and question node types;
- lesson `hasQuizzes` quiz;
- quiz `containsQuestions` question;
- lesson `delivers` KLP;
- thread `linksAcrossYears` unit;
- lesson relationships to misconceptions.

The emitted runtime graph in
[`graph-corpus-emitted-index-lines.ts`](../../../packages/sdks/oak-sdk-codegen/src/bulk/generators/graph-corpus-emitted-index-lines.ts)
is narrower:

- node kinds: unit, thread, lesson, misconception, keyword;
- relationship kinds: `prerequisiteFor`, `containsUnit`, `containsLesson`,
  `addressesMisconception`, `containsKeyword`.

KLPs, quizzes, and questions are therefore part of the conceptual description
but not navigable runtime graph entities. Any future claim about the graph must
distinguish modelled, generated, emitted, and served data.

### Progression precision

[`thread-progressions-projection.ts`](../../../packages/sdks/graph-corpus-sdk/src/curriculum/thread-progressions-projection.ts)
records that the exported data has no authoritative within-thread unit order.
Teaching year supplies a coarse sequence, but ties within a year are not a
curriculum ordering claim.

This is a useful precedent for the wider architecture: preserve uncertainty and
do not convert a convenient sort key into a typed semantic relationship.

### Deterministic serving boundary

[`ADR-191`](../../../docs/architecture/architectural-decisions/191-deterministic-data-surface-agent-reasons.md)
requires a deterministic data surface and makes the consuming agent the only
reasoner. It explicitly permits a formal ontology-level crosswalk.

The resulting constraint is clear:

- stable reviewed facts and mappings can be served;
- complete bounded graph views can be constructed;
- the server should not hide heuristic curriculum judgement, opaque scoring,
  or ranking behind factual-looking edges.

## Concept-exploration movements

### Movement 1 — expand the option space

The initial observations admit several model families:

1. **Enriched KLP:** retain KLP as the centre and add classification, role,
   relationships, assessment links, and version metadata.
2. **First-class claim:** retain KLP wording but link it to stable reusable
   curriculum-claim entities.
3. **Atomic knowledge:** decompose authored statements into smaller facts,
   concepts, skills, and misconceptions.
4. **Contextual occurrence:** keep reusable entities small and attach role,
   depth, source, and placement to occurrences.
5. **Assertion graph:** represent dependency, assessment, alignment, and
   equivalence as reviewable relationship objects.
6. **Subject extension schemes:** standardise the classification mechanism but
   let subjects own the vocabulary.
7. **Authoring projections:** expose the same semantic substrate through lesson,
   unit, sequence, and release views.

No single family answers the whole problem. The candidate direction combines
authored artefacts, reusable entities, occurrences, and assertions.

### Movement 2 — connect recurring patterns

Several observations converge:

- contextual role and cross-release placement both require occurrence-level
  metadata;
- assessment and alignment both require many-to-many, provenance-bearing
  assertions;
- progression and prior knowledge both require sequence to remain distinct
  from dependency;
- subject variation and shared infrastructure both require a small common
  kernel plus extension schemes;
- audit and AI-assisted authoring both require candidate state to remain
  separate from approved state;
- graph serving and review both benefit from stable identifiers and explainable
  evidence.

The shared substrate is therefore less about a universal curriculum vocabulary
and more about universal mechanics: identity, scope, occurrence, relationship,
provenance, review, and release.

### Movement 3 — stress-test the candidate

#### Subject heterogeneity

A classification taken from one subject may fail in another. The candidate
survives only if subject-specific schemes can coexist and broad cross-subject
queries do not require flattening every distinction.

#### Context dependency

Some apparent atomic items are fragments whose meaning depends on a source
sentence or narrative. The candidate survives only if source context is
preserved and decomposition can be rejected or revised.

#### Pedagogical role

Core/supporting status can vary between placements. The candidate survives only
if role belongs to an occurrence rather than permanently to the entity.

#### Lesson-internal structure

Narrative beats and checkpoints are useful only if they have stable anchors.
The candidate should not add lesson-segment identity until repeated authoring
and consumer needs justify the maintenance burden.

#### Assessment cardinality

If questions frequently target multiple propositions, a single `targetId`
fails. The relationship must permit many-to-many mappings and explicit review.

#### Version coexistence

If a refreshed curriculum revises meaning while retaining similar wording,
text-derived identity fails. The candidate needs persistent governed identity,
release-specific revisions, and explicit lineage.

#### Graph integrity

A list of related records is not sufficient merely because it is called a
graph. Each served view must be complete within a declared structural bound,
use typed edges, provide navigable stable identifiers, and distinguish an empty
result from an invalid anchor.

### Movement 4 — distil the initial candidate

Before external research, the smallest model that appears to preserve the
important distinctions is:

```text
Curriculum release → sequence → unit → lesson → optional lesson segment
                              ↘
                           authored KLP
                               ↓ decomposes to / realises
                        stable curriculum claim
                         ↙        ↓         ↘
             subject concept   builds on   external alignment

question ─ assesses ─ curriculum claim
checkpoint ─ checks ─ curriculum claim
misconception ─ relates to / is addressed through ─ claim or checkpoint
narrative device ─ spans ─ lessons or segments
```

This is a hypothesis, not a class diagram. In particular, “curriculum claim” is
a placeholder for a stable reusable semantic entity. The follow-up research
must determine whether existing ontology or upstream concepts already fulfil
some or all of that role.

## Candidate responsibilities

### Stable semantic entity

Would carry only intrinsic meaning and stable identity. It should not contain
lesson placement, current pedagogical role, or one release's alignment result.

### Occurrence or placement

Would connect the semantic entity to source wording and curriculum context.
Candidate properties include source artefact, lesson/unit/sequence scope,
pedagogical role, expected depth, classification, release, and review state.

### Relationship assertion

Would represent relationships that need evidence or governance, for example:

- claim builds on claim;
- question assesses claim;
- misconception relates to claim;
- internal claim aligns with external descriptor;
- progression statement realises several claims;
- one revision supersedes or derives from another.

Simple structural relationships may remain direct typed edges. Relationships
with provenance, scope, confidence, or review state need first-class identity
or an equivalent reified representation.

### Subject-owned classification scheme

Would define subject-specific categories without changing the shared identity
and lifecycle mechanics. The common model needs scheme identity, concept
identity, scope, version, hierarchy, and application; it does not need to
predefine every subject category.

### Release and lineage

Would preserve immutable published states and show whether a later object is
unchanged, revised, split, merged, or superseded. A current authoring workspace
should not overwrite what an earlier release meant.

## Authoring-workflow implications

The initial candidate only creates value if the workflow makes its distinctions
usable.

### Lesson view

- preserve authored KLP wording;
- show proposed decompositions with source context;
- classify contextual role;
- map questions and misconceptions to learning targets;
- accept, edit, reject, or defer each candidate explicitly.

### Unit view

- inspect coverage and duplication;
- distinguish authored order from proposed knowledge dependency;
- show prior-knowledge evidence from more than one source where necessary;
- inspect assessment distribution and unmapped targets.

### Sequence view

- show recurring threads without inventing takeaways;
- author cross-time propositions explicitly;
- inspect multi-hop prerequisite candidates;
- detect gaps, unexplained transitions, and changes in expected depth.

### Release view

- compare stable identities and revisions;
- show new, removed, split, merged, and superseded objects;
- version external mappings;
- keep candidate machine output separate from approved curriculum data;
- support export, import, and deterministic diff.

## What the initial findings advise against

- Treating the request as a flat schema-enrichment exercise.
- Making KLP text the identifier for audit, alignment, or reuse.
- Attaching every classification and pedagogical role permanently to a shared
  entity.
- Inferring cross-time takeaways from thread membership.
- Treating order as proof of prerequisite dependency.
- Linking quizzes only to lessons when target-level evidence is required.
- Modelling `afterNarrativeBeat` or similar anchors as mutable strings.
- Automatically accepting AI-produced decomposition, dependency, assessment,
  or alignment claims.
- Using a universal subject enum without cross-subject evidence.
- Reducing audit to a score that cannot show its evidence.
- Serving graph relationships that are conceptual but absent from the emitted
  corpus.
- Solving legacy/new coexistence with compatibility fields instead of release
  and lineage semantics.

## Assumptions changed during the initial exploration

| Starting assumption | Revised initial understanding |
| --- | --- |
| The task is to add fields to KLP. | The task is to separate semantic layers and lifecycle responsibilities. |
| KLP is the natural stable unit. | KLP is a valuable authored aggregate that may refer to smaller reusable meanings. |
| Thread membership expresses progression. | Thread membership organises recurrence; takeaways and dependencies require explicit claims. |
| Assessment is attached to a lesson or quiz. | Useful evidence needs question-to-target relationships. |
| Subject categories can become one shared enum. | Subjects need owned schemes over a small common classification mechanism. |
| Audit is a reporting surface. | Audit is most useful inside contextual authoring and review. |
| A quality score is the natural output. | Explainable checks and evidence preserve meaning; aggregate scores risk distortion. |
| Supporting old and new curricula is compatibility work. | It is a first-class release, identity, occurrence, and lineage problem. |
| A graph diagram proves graph availability. | Conceptual, generated, emitted, and served graph surfaces must be verified separately. |

## Evidence probes proposed by the initial exploration

These are discovery probes, not an implementation plan.

### 1. Cross-subject annotation study

Sample KLPs and related artefacts across structurally different subjects.
Reviewers identify independent propositions, context-dependent fragments,
subject classifications, and pedagogical roles.

- **Warrant:** tests whether a shared entity/occurrence kernel is reusable.
- **Falsifier:** reviewer agreement is too low or exceptions dominate the
  common model.

### 2. KLP corpus profile

Measure multi-proposition rate, duplication, context dependency, wording
stability, and reuse across lessons and releases.

- **Warrant:** establishes the scale and shape of the granularity problem.
- **Falsifier:** current KLPs are already sufficiently atomic and stable for the
  intended queries.

### 3. Enriched-KLP versus first-class-entity comparison

Use known curriculum questions to compare a flat enriched record with a model
containing authored artefacts, entities, occurrences, and assertions.

- **Warrant:** tests whether the richer distinctions answer material questions
  more accurately or explainably.
- **Falsifier:** the extra model cannot demonstrate additional value.

### 4. Assessment-mapping sample

Map starter and exit questions to KLPs and smaller candidate targets.

- **Warrant:** establishes cardinality and useful target granularity.
- **Falsifier:** mappings are not reviewable or lesson-level association is
  sufficient for the intended use cases.

### 5. Versioned alignment sample

Create explicit candidate, accepted, rejected, partial, and superseded mappings
between stable internal targets and a versioned external framework.

- **Warrant:** tests the assertion and lifecycle model.
- **Falsifier:** reviewed decisions cannot be reconstructed without hidden
  application state.

### 6. Unit and sequence authoring prototype

Present contextual evidence, candidates, diffs, import/export, and explicit
review actions at lesson, unit, and sequence scales.

- **Warrant:** tests whether the semantic model reduces real authoring effort.
- **Falsifier:** the workflow increases burden or reviewers need materially
  different boundaries.

### 7. Consumer-question inventory

Define known-answer public, authoring, and agent questions before adding graph
nodes or edges.

- **Warrant:** ties model complexity to observable value.
- **Falsifier:** proposed semantic entities have no justified consumer journey.

## Unresolved evidence at the initial stage

- The separate five-challenge KLP analysis referenced in the source discussion
  was not available as inspectable evidence.
- The distribution of curriculum structures and classifications across all
  subjects was unknown.
- The upstream authoring, review, stable-identity, and publication lifecycle had
  not yet been grounded.
- It was unknown whether richer question-to-target relationships existed
  upstream but were absent from the public schema.
- The identity and versioning policy of external curriculum descriptors was
  unknown.
- Creator time, reviewer agreement, and acceptable review cost had not been
  measured.
- Public and open-data consumer questions had not been prioritised.
- It was unclear whether lesson-segment and narrative-device modelling would
  justify its authoring burden.
- The placeholder `CurriculumClaim` concept had not been reconciled against
  existing ontology or experimental atomic-item models.
- Authority boundaries between authoring data, public API schema, semantic
  graph, and consumer projections had not yet been examined.

## Initial conclusion

The first exploration supports a move away from KLP-centred field accumulation
towards a layered architecture of authored artefacts, reusable semantic
entities, contextual occurrences, typed assertions, subject-owned schemes, and
versioned releases.

That conclusion is directional, not yet architectural authority. Its value is
that it names the distinctions any subsequent model must preserve and supplies
falsifiable probes. The next research stage can now challenge the placeholder
classes, authority assumptions, and lifecycle model without losing the initial
problem framing that motivated them.
