# Oak reusable curriculum architecture — issues in the current data estate

**Date:** 14 July 2026; updated 15 July 2026 with the materialised-view search
consumer contract

**Status:** Canonical issue register for the inspected public source revisions
and analysed bulk snapshot; architectural diagnosis, not an implementation
plan

**Report family:** [index and reading order](./README.md)

**Companion reports:** [strategic synthesis](./oak-reusable-curriculum-architecture.md)
and [issues in this repository](./oak-reusable-curriculum-architecture-this-repository.md)

## Executive conclusion

The inspected public source definitions contain enough information to design a
much more faithful bulk release. They carry entity IDs, unit-variant IDs,
programme context, order, release data and structured assessment. Successive
wrappers and TypeScript transformations in the pinned source discard much of
that information, then the bulk endpoint combines stored data files with a
schema from the running application. The resulting design is lossy, difficult
to identify and internally inconsistent. Correspondence with a deployed
environment is a separate evidence question.

There is also a narrower confirmed source-code regression: the pinned lesson
query applies `limit: 1` to a unit-slug query that historically returned a
cross-variant union. Removing the limit is necessary, but is not a complete
fix. It would restore the historical union without restoring programme or
variant provenance.

The long-standing programme-to-variant relationship should be treated
differently from these immediate defects. The authoritative source-data domain
should own the canonical relationship rather than a consumer encoding another
interim interpretation into a new materialised view. That does not require the
estate to keep publishing ambiguous data. A current producer can:

- publish the raw release-qualified entities and relationship records it does
  know;
- preserve IDs, factors, order and row provenance already present in the
  pinned view layer;
- label any legacy programme-variant resolution as a release-local projection,
  not timeless base truth;
- fix query, schema, publication, upload and assessment defects now;
- define the minimum source-authority contract needed by future consumers.

The pinned public Hasura and SQL definitions are implementation and design
evidence for their source revision. They are not proof of any deployed metadata
version, materialised-view refresh state, bulk image or object generation. The
report can reason about the design they contain; operational claims require
separate deployment evidence.

## Authority and scope

This report is the detailed authority for issues outside this repository that
were revealed by the current investigation. It covers:

- Oak OpenAPI and bulk generation;
- current public database/view definitions in Oak Database-Tools;
- the bulk publication boundary;
- release, identity and historical-access contracts;
- structured assessment publication;
- the current Oak Curriculum Ontology as a fixed consumer-facing formal model;
- candidate semantic analysis in AILA Atomic Concepts;
- repository/workspace boundaries where they affect the contract.

It does not claim to inventory every Oak data system. It relies only on the
inspected public source revisions, the local public bulk snapshot and explicit
source-neutral analysis constraints. It contains no local path, private
repository detail or non-public implementation fact. The current ontology is
the fixed formal input for this analysis and is not changed by this proposal.

Within this report family, the synthesis governs strategy and this register
governs current estate issue detail. Ratified schemas, executable contracts and
ADRs retain authority in their own domains. A conflict at the same scope is a
documentation defect, not permission to choose the most convenient report.

## Problem frame

The estate problem has two layers that should not be collapsed.

### Current publication correctness

Can the producer publish a self-consistent, immutable release that preserves
the facts its current source already contains?

This includes query cardinality, retained IDs and factors, assessment content,
schema/data agreement, generation completion, object publication and release
provenance. These are current engineering obligations.

### Canonical domain redesign

What is the enduring relationship among programmes, unit placements, unit
variants and revisions, and how does it behave across releases?

That is an authoritative source-domain question. It cannot be settled by
whichever downstream consumer first needs an exact graph. Treating both layers
as one problem either blocks safe present-day corrections or cements a legacy
resolution rule as permanent architecture.

## Concept exploration

### Expand the options

The estate could:

1. remove `limit: 1` and otherwise preserve the historical bulk shape;
2. add more fields to the current denormalised lesson view;
3. define a new all-purpose materialised view that resolves every programme
   and variant relationship now;
4. publish normalised, release-qualified source records and a versioned bulk
   compiler, while leaving canonical programme-to-variant semantics to the
   authoritative source domain;
5. move the OpenAPI application into this repository and use code colocation as
   the integration mechanism.

The fourth option best preserves future freedom while correcting current
publication. The first restores a known lossy union. The second helps but leaves
contract and lifecycle ambiguity. The third risks freezing an old complexity
into a new public promise. The fifth may improve delivery coordination, but
repository topology cannot establish domain truth.

### Connect the recurring failures

Several symptoms come from treating a running application version as the
release boundary:

- a dynamic endpoint combines stored JSON with its current schema;
- generated files do not identify the producer code or source release;
- optional validation is not part of publication;
- upload completion is not awaited;
- retry behaviour can reuse existing output directories;
- a source query can change cardinality without a release-level invariant test;
- useful IDs and questions can be removed by formatters without a loss budget.

The missing concept is an immutable publication unit: schema, data, manifest,
provenance and validation results produced and promoted together.

### Stress-test the candidate architecture

The publication boundary must survive:

- different lesson sets for one unit slug across KS4 factors;
- new and published states coexisting;
- a bulk generation job failing after some subjects are written;
- an application deployment occurring after data generation but before
  download;
- a future source-contract revision changing how programme-to-variant
  selection is represented;
- a quiz or question being reused or revised;
- two adjacent releases being compared;
- current view definitions differing from the exact live deployment.

A normalised release bundle can survive these cases because it separates source
records, release identity and compiler version. A single denormalised response
assembled at request time cannot.

### Distil the estate architecture

```text
current authored database
  -> release-qualified published source views
  -> provider-owned pure bulk compiler
  -> immutable schema + data + manifest + validation bundle
  -> downstream consumers

authoritative source-domain contract
  -> canonical programme/variant and lineage semantics
  -> later compatible publication revision
```

Current publication and any future source redesign meet at an explicit
contract, not through a consumer inference.

## What the bulk disagreement proves

The analysed snapshot contains two structural surfaces:

- `sequence[].unitLessons`, an ordered list on one retained flattened unit
  record;
- top-level `lessons[]`, detailed rows historically queried by bare unit slug.

The relevant counts are:

| Signal | Count |
| --- | ---: |
| Raw sequence lesson placements | 12,446 |
| Published sequence placements | 12,298 |
| New sequence placements | 148 |
| Top-level lesson rows | 12,864 |
| Top-only unique `(unitSlug, lessonSlug)` pairs | 403 |
| Duplicate top-level occurrences | 373 |

The 148 omitted `new` placements are consistent with intended publication-state
filtering. The 403 top-only pairs are all at KS4 variant boundaries. The
historical detailed-lesson query ranged across rows sharing a bare unit slug,
so it unioned lesson membership from several programme/variant contexts while
publishing no qualifier that would let a consumer separate them. Repeated
maths-secondary unit fetches account for the additional indistinguishable
duplicates.

Neither surface is exact variant truth:

- the sequence surface is variant-derived but variant-collapsed;
- the lesson surface is variant-insensitive and historically unioned;
- the pinned source's `limit: 1` changes that union to an unspecified single
  row rather than repairing provenance.

This is why a consumer precedence rule cannot solve the disagreement.

## Evidence status by issue

The report distinguishes source shape, cached artefact and live deployment:

| Issue | Evidence status |
| --- | --- |
| ESTATE-001 | Confirmed in pinned source; deployment impact unverified |
| ESTATE-002 | Confirmed in the pinned view/API source; deployed revision unverified |
| ESTATE-003 | Snapshot-confirmed and source-mechanism-confirmed |
| ESTATE-004 | Source-confirmed validation gap |
| ESTATE-005 | Pinned-source reliability gap; operational occurrence unverified |
| ESTATE-006 | Snapshot-confirmed omission; public source structures present; publication eligibility not established by this report |
| ESTATE-007 | Current implementation behaviour confirmed; public lifecycle policy unresolved |
| ESTATE-008 | Source-authority-owned structural decision; a ratified contract is absent from the inspected public sources |
| ESTATE-009 | Confirmed in pinned public definitions; deployed configuration unverified |
| ESTATE-010 | Snapshot-confirmed provenance absence |
| ESTATE-011 | Architectural ownership correction supported by the preceding defects |
| ESTATE-012 | Current formal/candidate boundaries confirmed; no ontology change proposed |
| ESTATE-013 | Snapshot-confirmed omission; current producer eligibility requires revalidation |

Deployment-impact claims require an image, job/object record or live query. A
source-level bug does not cease to be a source-level bug when its deployment is
unknown, but the report does not claim observed production impact without that
evidence.

## Prioritised issue register

### ESTATE-001 — One-row lesson-query regression

**Priority:** P0

The pinned `getAllLessonData` GraphQL query includes `limit: 1` while
querying by unit slug. It was introduced when the implementation moved from a
SQL query returning all matching rows to GraphQL. The pinned test asserts only
that at least one lesson is returned, so it cannot detect the regression. The
query has no ordering clause, making the one selected row an undefined
representative.

**Required correction now:** remove the limit, add affected multi-lesson and
multi-variant cardinality fixtures, and assert intended row identity rather
than `length > 0`.

**Important qualification:** removing the limit restores the historical
cross-variant union if the query remains keyed only by unit slug. The durable
fix is a variant-qualified source record or a normalised relationship export,
not merely a larger result set.

**Acceptance condition:** the producer has an explicit, tested cardinality and
qualification contract for each query.

**Falsifier:** the deployed query or generated artefact is shown to use a
different factor-qualified path. That would change live-impact assessment, not
the source-code defect in the inspected revision.

### ESTATE-002 — Useful source provenance is selected and then deleted

**Priority:** P0

The pinned lesson wrapper/query retains `programmeSlug`, but bulk generation
deletes it as not useful. The underlying materialised view contains more:
`lessonId`, `unitVariantId`, programme context, unit and lesson order, quiz
IDs, programme factors and structured starter/exit questions. Successive layers
discard these fields before publication.

**Required correction now:** preserve source IDs, variant ID, programme context,
orders, factors and assessment identity already present in the current
published layer. If the programme context represents a legacy resolution,
label it as that release's projection rather than a canonical future relation.

The pinned sequence deduplication key also does not cover the full programme
context: tier, child subject, year and full programme identity are among the
dimensions that can be lost even though newer API handlers recognise several
of them. A faithful export should retain the source factors instead of relying
on a consumer to reconstruct them from a widened slug key.

**Acceptance condition:** every discarded field has an explicit loss decision
and consumer impact statement. Identity and placement provenance are retained
by default.

### ESTATE-003 — Schema and data are not one atomic contract

**Priority:** P0

The route dynamically zips stored subject JSON with the schema from the running
application. The stored data and schema can therefore come from different
producer revisions. In the analysed download, all 30 data files fail the schema
bundled with them: required fields are absent, forbidden fields are present,
and a string `"NULL"` sentinel appears where the schema permits an array or
JSON null.

The observed failures are concrete:

- 1,664 unit records lack required `canonicalUrl` and `subjectSlug` fields;
- all 12,864 lesson rows lack required `oakUrl` and `canonicalUrl` fields;
- 776 unit records contain the forbidden `examBoards` property;
- 8,699 lesson rows use the string `"NULL"` for `contentGuidance`.

The pinned generation source can also add `programmeFactors` while the manual bulk schema
forbids it. This is contract drift in both historical artefacts and current
source, not a one-off malformed row.

**Required correction now:** generate schema, data, manifest and validation
results in one job; hash them; promote them atomically under an immutable
release ID; make the download route serve that bundle without substituting
runtime files.

**Acceptance condition:** every published file validates against the exact
schema in its bundle, all cross-file integrity checks pass, and a manifest
binds their hashes, producer version and source release.

### ESTATE-004 — Publication checks do not prove the claimed structure

**Priority:** P0

The pinned reference checks prove only one-way slug existence. They do not enforce
exact pair agreement, reverse inclusion, uniqueness, factor preservation,
ordered placement, variant identity, release identity or schema agreement as a
production gate.

**Required correction now:** add bidirectional referential checks at the
qualified relationship level, uniqueness/cardinality invariants, publication
state checks, factor-preservation checks, assessment relationship checks and
schema validation to the required release job.

Where exact programme-to-variant selection is not yet authoritative, the check
should verify the normalised records that are published and explicitly mark the
canonical selection relation absent. It must not fabricate a passing invariant
from bare slugs.

### ESTATE-005 — Generation and upload can report success prematurely

**Priority:** P0

The inspected producer code has two operational hazards:

- storage upload returns no useful publication result and is not awaited by the
  generation path;
- generation can skip already-existing sequence directories, allowing stale or
  partial retry output to survive.

**Required correction now:** make generation write into a new release staging
area, await every upload, verify object hashes, publish a completion marker only
after validation, and make retries idempotent by immutable release ID.

**Acceptance condition:** job success means the complete validated bundle is
durably available; partial output can never be promoted or mistaken for a
release.

### ESTATE-006 — Structured questions are absent

**Priority:** P1

The pinned public database and materialised-view definitions expose
quiz/question structures and identifiers, while public formatters remove
identities and the analysed bulk bundle contains no structured questions. The
inspected public bulk description nevertheless says questions and answers are
included. Optional PDF packaging is not a substitute for a queryable assessment
contract, and the UI, schema, documentation and payload should not describe
different products. This report does not assert a licensing determination;
publication remains conditional on verified public eligibility, restriction,
attribution and asset rules.

**Required correction now:** include quiz identity and role, lesson-quiz
placement, question identity, occurrence order, question type, stem, answers,
correctness/order data, media/attribution metadata, restriction status and
release provenance.

**Acceptance condition:** a consumer can reconstruct the structured starter and
exit assessments in their authored order without matching on text.

**Boundary:** question-to-KLP or outcome alignment remains candidate or reviewed
unless it is explicitly authored upstream.

### ESTATE-007 — Stable-identity behaviour is implementation, not contract

**Priority:** P1

The pinned public tables expose numeric IDs, UIDs, state and release IDs. Publication
triggers archive and replace prior published rows for the same entity ID, and
UID-copying triggers preserve a UID across states. Relationship tables retain
endpoint pairs, order, state and release, but have no independent placement
UID.

This is strong evidence of the inspected revision's behaviour. It does not yet promise
that IDs are never reused, that a rename retains identity, that removal and
re-addition are one placement, or that splits and merges have lineage.

**Required current correction:** publish release-scoped IDs and immutable
revision records exactly as implemented. Document which IDs are public and
which are implementation details.

**Source-authority decision:** define continuing entity, variant and placement
identity; non-reuse; rename/edit behaviour; retirement; split/merge/replacement
lineage; and public historical access.

**Acceptance condition:** consumers can distinguish snapshot identity from
cross-release continuity and never need to match entities by slug, text or
content hash as an undocumented fallback.

### ESTATE-008 — Programme-to-variant semantics belong at source authority

**Priority:** structural dependency, not a reason to block current fixes

The pinned public schema records programme-to-unit membership and
unit-variant-to-lesson membership. Selecting the applicable unit variant for a
programme is a separate, historically complex step. A new purpose-built view
could reproduce today's resolution, but presenting that as the canonical model
would create a long-lived public promise without an authoritative source-domain
contract.

“Source-authority-owned” identifies where the decision belongs. It does not
assert that a particular redesign exists or has accepted the obligation; the
minimum contract must be ratified explicitly.

**Recommended boundary:**

- publish current programme, unit, variant and relationship records without
  collapsing their identities;
- preserve the current release's resolved context where it already exists, but
  label its provenance and scope;
- do not ask a downstream repository to infer the relationship;
- do not make a new “canonical” materialised view whose main purpose is to
  freeze the legacy resolution;
- make the authoritative source-domain contract responsible for the durable
  relation and lifecycle semantics.

If an exact interim programme graph is operationally essential, it needs an
explicit source-owner decision: a named, versioned, release-local projection
with documented resolution rules and tests. It must not be described as base
truth or silently promoted into a later source contract.

**Acceptance condition:** the source-authority contract publishes, at minimum:

- programme entity and release-specific revision identity;
- unit entity and revision identity;
- unit-variant entity and revision identity;
- programme-unit placement, order and state;
- an explicit programme-placement-to-applicable-variant relation or equivalent
  authoritative rule;
- variant-lesson placement, order and state;
- factors and provenance used in selection;
- continuity, retirement and lineage semantics across releases.

**Falsifier:** the source-domain owner establishes that the current relationship
is already canonical, complete and stable. In that case it should be contracted
and tested directly rather than re-inferred downstream.

### ESTATE-009 — The current wrapper is too lossy for bulk publication

**Priority:** P1

In the inspected definitions,
`published.view_lesson_open_api_with_transcripts_1` is a normal view over the
lesson materialised view and published transcript data. The underlying
materialised view already carries many fields needed for faithful publication;
the wrapper discards most IDs, factors, orders and questions.

**Required correction now:** add a bulk-facing published source view or export
that retains those raw release-qualified fields. Prefer normalised record sets
over another consumer-specific mega-row. SQL should own faithful selection and
relationship rows; TypeScript should own transport normalisation, manifesting,
hashing and schema generation.

The view does not need to settle the future canonical programme-to-variant
model. It can expose the current records and the precise provenance of any
resolution already performed.

### ESTATE-010 — No immutable public release envelope

**Priority:** P1

A trustworthy bundle needs at least release ID and UID, schema version,
generation time, producer version, source cycle or release, file hashes and the
validation-result version. Its records need source IDs and release-specific
revision/placement keys for programmes, units, variants, lessons, quizzes and
questions.

Where no durable placement ID exists, a release-scoped composite can identify
an occurrence but must not be advertised as stable across releases.

**Acceptance condition:** two downloaded releases can be retained, verified and
compared without consulting mutable runtime endpoints or guessing identity from
slugs.

### ESTATE-011 — Contract ownership is blurred

**Priority:** P1

The database owns authored facts and release mechanics; the API owns public
eligibility and transport; consumers own deterministic projections. Today the
bulk shape encodes database loss in API formatters and asks consumers to recover
meaning from slugs.

**Required correction:** create a provider-owned, versioned bulk contract and a
pure compiler with fixtures. Its schema and invariant tests should be usable by
the producer and consumers without importing the web application or database
internals.

**Acceptance condition:** a change to a published field, identity rule or
cardinality fails contract tests at the producer boundary before it reaches a
consumer release.

### ESTATE-012 — Formal and candidate semantic estates need explicit joins

**Priority:** P2

The current Oak Curriculum Ontology already distinguishes programmes,
inclusions, unit variants and lessons. It remains the formal model consumers
have today, and this work does not propose changing it or routing every source
fact through it. Its IRIs and constraints are ontology-owned; source record IDs
remain source-owned.

AILA Atomic Concepts appropriately separates entity from occurrence, sequence
from dependency, and automatic exact deduplication from reviewed semantic
merging. Its candidate identities and relations should not become authored
source truth merely because they are graph-shaped.

**Required correction:** publish explicit, versioned mappings at serving
boundaries and retain provenance and epistemic status. Do not make either
formal ontology or candidate semantic analysis a mandatory gateway for faithful
bulk publication.

### ESTATE-013 — Published subject coverage is not explicit

**Priority:** P2 revalidation candidate

The analysed bundle contains 30 subject-and-phase data files and omits the two
RSHE/PSHE files requested by the current downloader. The current API schema
recognises the subject. This may reflect snapshot age, eligibility, absence of
publishable data or a producer omission; the inspected artefact cannot
distinguish them.

**Required correction:** publish a machine-readable eligible/requested/
included/excluded subject-phase inventory in each release. Revalidate the live
bulk route before labelling the omission current.

**Acceptance condition:** a consumer can prove that the bundle is complete for
its declared subject-phase scope and every exclusion has a reason.

**Falsifier:** a current immutable release already carries an equivalent
coverage manifest and accounts for both subject-phase keys.

## Hasura and materialised-view evidence

The pinned public Hasura definitions establish what their source revision
defines. No private operational assertion is used to increase that evidence.
Three claims remain distinct:

| Claim | Confidence |
| --- | --- |
| The pinned SQL defines the inspected view and materialised-view shapes | Confirmed in public source |
| A deployed environment uses the same shape | Not established by the source checkout |
| The metadata revision, refresh state and bulk job used for the analysed artefact are known | Not verified |

This is sufficient to identify loss in the pinned design and propose a contract.
It is not sufficient to attribute a cached bulk file to a deployed environment.
Deployment metadata or object/job records would be required for that claim.

## Could a better materialised view and API be designed?

Yes, with a narrower claim than an all-purpose canonical view.

### Safer current view family

The current estate could expose normalised, release-qualified published views
for:

- programme records and programme-unit placements;
- unit and unit-variant records;
- unit-variant-lesson placements;
- lesson content and transcript metadata;
- quizzes, questions and their ordered placements;
- release metadata.

If a current programme-to-variant resolution is exported, it should be a
separate named projection that records its factors, rule/version and release.
That makes it removable or replaceable when the authoritative source contract
publishes the canonical relation.

### API/compiler responsibilities

The TypeScript layer should:

- consume those views through one pure bulk compiler;
- normalise transport values without deleting identity;
- generate the schema from the actual output model;
- validate every record and cross-reference;
- create the manifest and hashes;
- stage, upload, verify and atomically promote one immutable bundle;
- serve stored schema and data from the same release;
- test cardinality with multi-variant fixtures;
- make retries deterministic and observable.

This answers the publication problem without pre-empting the source-domain
decision.

### Search-consumer contract

Specialised materialised views can also support reusable semantic and
relationship-aware search for the primary website. That use case does not make
the view schema the search system's internal domain model.

The producer side should publish a stable, versioned and release-qualified view
contract with explicit grain, keys, relationship meaning, eligibility,
freshness and historical-access semantics. The search consumer should own an
adapter from that contract into its source-accounting curriculum
representation, then reuse the same projection builders and lifecycle
mechanisms used for bulk-derived search.

This permits a materialised view to expose richer placement, relationship or
availability signals than the current bulk without requiring the consumer to
import database tables, Hasura configuration or API-application internals. It
also avoids forcing the primary website and bulk-driven MCP service to maintain
separate interpretations of curriculum meaning.

The contract must not promise semantic equivalence with bulk merely because
the two transports contain similarly named fields. Equivalence and capability
differences require representative contract fixtures and consumer tests.

## Would moving Oak OpenAPI into this workspace help?

It would help integration mechanics, but it would not change the source of
truth.

Potential benefits include one pull request for producer and consumer changes,
shared fixtures, shared contract generation, end-to-end tests and coordinated
release tooling. The risks are substantial: importing a web/API application,
deployment configuration, infrastructure, secrets boundaries and different
toolchain versions turns a data-contract correction into a replatforming
programme.

The preferred boundary is independent of repository topology:

```text
provider-owned bulk contract
provider-owned pure compiler
immutable release fixtures
consumer contract tests
```

Those components can live in separate repositories, be published as packages,
or later share a workspace. Colocation is warranted if Oak already wants the
broader replatforming and ownership model. It should not be undertaken merely
to fix `limit: 1`, preserve fields or publish atomic bundles.

Bringing only the contract and pure compiler into a shared workspace is much
lower risk than absorbing the full application. Even then, publication
authority should remain provider-owned and the consumer should not import API
application internals.

## Decision lenses

### 1. Long-term architectural excellence

Normalised release-qualified publication plus a source-authority-owned
programme/variant relation avoids turning legacy resolution into permanent
public architecture. This is decisive.

### 2. Strict and complete

One-row queries, bare-slug unions, deleted provenance, schema/data mismatch,
unawaited upload and mutable retry output all fail strictness today. They should
be fixed even while the canonical domain relationship remains unresolved.

### 3. Simpler without compromising quality

One provider-owned compiler and immutable bundle is simpler than dynamic
assembly from stored data and running-app schema. Normalised views are simpler
to reason about than an ever-wider mega-view.

### 4. Change the system to dissolve the problem

The programme-to-variant ambiguity belongs at the authoritative source-data
boundary. Publishing raw relationships and later publishing a canonical
relation removes the need for every consumer to develop its own slug-based
resolver.

### 5. User value

Users gain reliable programme comparison, assessment access and release
explanation only when the data is identifiable and qualified. A repository move
or richer schema has no value by itself; it matters only insofar as it makes
those workflows truthful and maintainable.

## Two-horizon action boundary

### Correct now

- remove the one-row query regression and add cardinality tests;
- stop deleting IDs, factors, order and current row provenance;
- publish eligible structured questions under verified public licensing,
  restriction and attribution rules;
- generate and validate schema and data together;
- await, verify and atomically promote complete uploads;
- make generation retries release-scoped and idempotent;
- publish release, producer, generation and hash metadata;
- expose normalised current relationship records;
- create a provider-owned contract and pure compiler;
- publish and validate the subject-phase eligibility and coverage inventory.

### Assign explicitly to the authoritative source domain

- canonical programme-placement-to-unit-variant semantics;
- durable entity, variant and placement identity guarantees;
- rename, edit, retirement, split, merge and replacement behaviour;
- lineage across releases;
- authoritative immutable historical projections.

### Do not do

- restore the historical union and call it fixed;
- infer canonical variant membership downstream;
- describe a pinned Hasura checkout as deployment proof;
- freeze a legacy resolution rule into a supposedly canonical new view without
  source-owner agreement;
- postpone unrelated correctness defects until a future source redesign;
- merge repositories as a substitute for a contract.

## Completion criteria

The estate part is complete for the current horizon when:

- a bulk release is an immutable atomic schema-and-data bundle;
- every file validates and every required qualified reference is checked;
- source IDs, factors, orders and assessment occurrences already available are
  preserved;
- generation success proves durable verified publication;
- consumers can identify release, producer and file hashes;
- each release accounts for its complete declared subject-phase scope;
- current legacy projections are labelled as such;
- the source-domain owner has published a written canonical
  programme-to-variant and lineage contract;
- no consumer must infer missing authority from slug or text equality.

## Primary references

### Oak OpenAPI at `f64b8f3fe8bee849016c61e60cc0a454d424369b`

- [Bulk data queries](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/src/lib/bulk-data/get-data.ts)
- [Bulk preparation](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/bin/prepare-bulk.ts)
- [Bulk JSON schema](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/src/app/api/bulk/schema.json/schema.json)
- [Bulk reference checks](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/bin/bulk-data-checks/check_references.ts)
- [Bulk route](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/src/app/api/bulk/route.ts)
- [Programme handlers](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/src/lib/handlers/programmes/programmes.ts)
- [Unit programme factors](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/src/lib/handlers/unitProgrammeFactors.ts)
- [Question formatter](https://github.com/oaknational/oak-openapi/blob/f64b8f3fe8bee849016c61e60cc0a454d424369b/src/lib/handlers/questions/helpers.ts)
- [Historical bulk query](https://github.com/oaknational/oak-openapi/blob/2fa4d6b75f9887c334981434cf933a10b5834766/src/lib/bulk-data/get-data.ts)
- [`limit: 1` introduction](https://github.com/oaknational/oak-openapi/commit/01906db02542e21e609b14519317dddae8e39b7c)

### Oak Database-Tools at `4e24c728a55f033b6a04c05ee189501b5b9bc2c3`

- [Lesson-with-transcripts view](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/database-tools/sql-schema-docs/open-api-views/view_lesson_openapi_with_transcripts.sql)
- [Lesson OpenAPI materialised view](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/database-tools/sql-schema-docs/open-api-materialized-views/mv_lesson_openapi.sql)
- [Curriculum-sequence view](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/database-tools/sql-schema-docs/owa-views/view_curriculum_sequence_b.sql)
- [Curriculum-sequence materialised view](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/database-tools/sql-schema-docs/owa-materialized-views/mv_curriculum_sequence_b.sql)
- [Programme schema](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/oak-curriculum-schema/drizzle/schema/public/programmes.ts)
- [Programme-unit placement schema](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/oak-curriculum-schema/drizzle/schema/public/programme_units.ts)
- [Unit-variant schema](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/oak-curriculum-schema/drizzle/schema/public/unitvariants.ts)
- [Variant-lesson placement schema](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/oak-curriculum-schema/drizzle/schema/public/unitvariant_lessons.ts)
- [Quiz-question placement schema](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/oak-curriculum-schema/drizzle/schema/public/quiz_questions.ts)
- [Release schema](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/oak-curriculum-schema/drizzle/schema/internal/releases.ts)
- [Archive schema](https://github.com/oaknational/Database-Tools/blob/4e24c728a55f033b6a04c05ee189501b5b9bc2c3/oak-curriculum-schema/drizzle/schema/internal/archives.ts)

### Current formal and candidate semantic sources

- [Oak Curriculum Ontology overview](https://github.com/oaknational/oak-curriculum-ontology/blob/610ba79a96bbfa5148e4a50360b05c12e79aaf83/README.md)
- [Oak Curriculum Ontology programme structure](https://github.com/oaknational/oak-curriculum-ontology/blob/610ba79a96bbfa5148e4a50360b05c12e79aaf83/data/programme-structure.ttl)
- [AILA sequence/dependency decision](https://github.com/oaknational/aila-atomic-concepts/blob/f5c7ce2030937d469228b894dc0fe5e656ffe839/docs/adr/0001-separate-curriculum-sequencing-from-prerequisite-dependency.md)
- [AILA entity/occurrence decision](https://github.com/oaknational/aila-atomic-concepts/blob/f5c7ce2030937d469228b894dc0fe5e656ffe839/docs/adr/0002-separate-atomic-item-identity-from-curriculum-occurrence.md)
