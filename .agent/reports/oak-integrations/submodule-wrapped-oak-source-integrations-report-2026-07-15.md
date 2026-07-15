---
title: Submodule-wrapped Oak source integrations
status: complete
date: 2026-07-15
sources:
  oak_openapi: f64b8f3fe8bee849016c61e60cc0a454d424369b
  oak_curriculum_ontology: 610ba79a96bbfa5148e4a50360b05c12e79aaf83
  database_tools: 4e24c728a55f033b6a04c05ee189501b5b9bc2c3
---

# Submodule-Wrapped Oak Source Integrations

## Review Contract

**Purpose and intended impact:** determine whether this monorepo should contain
pinned, locally operable versions of Oak OpenAPI, Oak Curriculum Ontology, and
Oak Database-Tools, and define an implementation boundary that improves
cross-repository development without confusing source authority or production
state.

**Questions for review:**

1. Does the proposed shape preserve authority for API behaviour, ontology
   semantics, database schema, and deployment in the source repositories?
2. Is each wrapper proportionate to the repository it contains rather than an
   imposed one-size-fits-all abstraction?
3. Does the Database-Tools analysis support safe materialised-view design
   and testing without creating a runtime dependency on internal database
   implementation?
4. Are reproducibility, update automation, toolchain isolation, credentials,
   cache invalidation, and conflict ownership addressed?

**Evidence standard and authority boundary:** findings come from the three
local source checkouts at the pinned commits above, this monorepo's live
workspace and CI configuration, and existing architecture and report surfaces.
A source checkout proves what that revision defines; it does not prove what is
currently deployed. Git submodules are evaluated as pinned source references,
not as branch-floating dependencies.

Repository visibility was rechecked on 2026-07-15: Oak OpenAPI and
Database-Tools are private; Oak Curriculum Ontology is public. Visibility is
live state and must be rechecked at implementation. Private source checkouts
cannot become a prerequisite for using this public repository.

**Non-goals:** this report does not add submodules, create source-repository
branches, change production infrastructure, design a particular materialised
view, or authorise direct database access from this repository.

**Successful review:** a reviewer can reproduce the evidence, identify the
authority owner for every output, and either validate the proposed boundaries
or name a specific unsupported assumption, missing source, or contract
mismatch.

## Exploration Synthesis

The evidence supports three role-specific integration workspaces, each
containing a pinned Git submodule and exposing a stable, allowlisted parent
`package.json` interface. It supports sharing provenance, bootstrap, update,
and contract-test mechanisms while keeping the three children distinct. The
linked implementation plan owns the selected mechanics and schedule.

| Source repository | Local role | Stable parent interface | Source authority remains |
|---|---|---|---|
| Oak OpenAPI | independently installed application and deterministic contract producer | source status/bootstrap, contract export/test | router, Zod definitions, runtime and deployment |
| Oak Curriculum Ontology | generation-time semantic-data source | validate, generate, emit provenance, build TypeScript projection | RDF/OWL/SKOS/SHACL sources and release distributions |
| Oak Database-Tools | quarantined database-design and synthetic integration laboratory | inspect, validate migrations, run synthetic pgTAP tests, export representative contracts | SQL, migrations, Hasura metadata, refresh mechanics and deployment |

The evidence supports wrapping Database-Tools. The value is not merely
convenient source browsing: it enables a source-owned materialised-view change,
its migration and pgTAP proof, its OpenAPI consumption, and downstream SDK
generation to be tested as one reproducible vertical slice. A safe boundary
requires a wrapper-owned synthetic estate and excludes staging download,
deployment, credential creation, destructive Docker-volume removal, and
arbitrary child script execution.

## Goal, Scope, and Success

**Goal:** make upstream Oak sources locally reproducible and jointly testable so
provider and consumer changes can evolve coherently while each repository
retains its own authority and release lifecycle.

**In scope:** source pinning; wrapper interfaces; child toolchain isolation;
deterministic contract generation; provenance; branch synchronisation; parent
gitlink updates; CI checkout; cache behaviour; safe materialised-view
experimentation; cross-repository contract testing.

**Out of scope:** absorbing source repositories into the monorepo; treating a
checkout as deployment proof; production database access; defining database
internals as this repository's runtime API; silently floating to child branch
heads; directly re-exporting child filesystem layouts to consumers.

Success means a historical parent commit reconstructs the same child sources,
normal monorepo consumers use stable local contracts rather than child paths,
upstream updates arrive as reviewable, tested gitlink changes, and a public
contributor without Oak credentials or initialised private submodules retains a
complete root install, build, test, and contribution path.

## Concept Exploration

### Movement 1: reflect on the raw observations

The starting idea was mechanically simple: put a Git submodule inside a pnpm
workspace, wrap it with the workspace's `package.json`, maintain minor changes
on a child branch, and keep that branch current with child `main`.

The repositories reveal three different realities:

- Oak OpenAPI is a private Next.js application. Its OpenAPI document is
  generated from its router at runtime, and its child project owns a separate
  pnpm lockfile and application toolchain.
- Oak Curriculum Ontology is primarily a 47 MB RDF data and semantic-constraint
  repository. Its `pyproject.toml` deliberately declares no installable Python
  packages; Python, `uv`, pySHACL and Apache Jena are validation and export
  tools.
- Database-Tools is already a pnpm monorepo governing migrations, Hasura
  metadata, schema packages, materialised-view refresh, synthetic/pgTAP tests,
  Docker services and deployment. Some of its normal developer commands use
  credentials or mutate local volumes.
- This monorepo currently consumes curriculum data only through the published
  Open Curriculum API contract. Its own architecture explicitly forbids
  runtime coupling to Hasura, PostgreSQL or named internal materialised views.
- Current reusable-curriculum work identifies specialised, release-qualified
  materialised views as potentially valuable inputs while preserving a
  provider-owned public contract and a consumer-owned adapter.

The inherited assumption that `package.json` itself creates stability did not
survive inspection. Stability comes from an owned contract, generated outputs,
tests, provenance and refusal behaviour. A manifest that merely forwards every
child command is a convenience alias, not a boundary.

### Movement 2: define the problem space

This is a cross-repository integration and authority problem, not principally a
Git-layout problem.

**Gap:** provider changes and downstream SDK/search/graph changes cannot yet be
proved together from one pinned source estate. Developers inspect sibling
checkouts manually, the SDK usually fetches the deployed Swagger document, and
database or ontology changes require separate setup and coordination.

**Who is harmed:** implementers cannot cheaply prove end-to-end compatibility;
reviewers cannot see one reproducible source tuple; operators can mistake source
revision for deployment state; consumers may inherit accidental child layouts
or duplicated interpretations.

**Causal mechanism:** the repositories have separate histories, toolchains,
release cycles and authority, but there is no local integration substrate that
pins them together and translates their outputs into explicit consumer
contracts.

**Constraints:** exact source pins, no runtime database coupling, schema-first
generation, child-owned changes, safe credentials boundaries, strict
validation, and ordinary TypeScript builds that do not require Python, Jena,
Docker or a nested application installation unless their scoped task runs.
Private upstream checkouts are opt-in capabilities: default clone, install,
workspace discovery, gates, and public-fork CI cannot initialise or require
them.

**Success:** one parent revision identifies an exact source tuple; each source
can be operated through a narrow role-specific wrapper; cross-source changes
can be proven before deployment; and automation stops rather than guessing
through merge conflicts or failed validations.

### Movement 3: reflect on possible solutions

Four credible models were considered.

| Model | Strength | Failure mode |
|---|---|---|
| Continue with independent sibling checkouts | no monorepo complexity | no reproducible source tuple or dependable CI composition |
| Copy selected schema, SQL or ontology files | simple immediate consumption | provenance loss, manual drift and unclear change ownership |
| Publish only contracts or release artefacts | clean long-term dependency boundary | insufficient for source-level vertical development and branch-specific changes |
| Pinned submodules behind role-specific wrappers | reproducible source plus local operability | tooling and maintenance cost unless interfaces are narrow and child projects remain isolated |

Published contracts remain the preferred distribution boundary for ordinary
consumers. They do not replace the source-level integration need: materialised
view, API router, OpenAPI, ontology and SDK changes sometimes need to be tested
before any source project can publish a release.

A single workspace containing three raw submodules was also rejected. It would
couple their update cadence, task graph and failure modes. The reusable part is
the integration protocol; the workspaces remain separate leaves.

### Movement 4: synthesise and propose

The proposal is a small family of integration workspaces with a shared protocol:

```text
useful child change -> reviewed child main PR -> child validation
named temporary delta only -> protected integration branch sync PR
validated child commit -> reviewed parent gitlink update
parent pin -> wrapper contract validation -> optional vertical proof
```

An opt-in integration checkout uses the committed gitlink; the default public
checkout leaves submodules uninitialised. The branch recorded in `.gitmodules`
is update metadata for automation; it never makes builds float.
The child branch should merge `main` rather than rebase and force-push, so
parent-pinned commits remain reachable and audit history remains intelligible.

The evidence supports a shared integration protocol that provides:

- exact repository, commit and branch provenance;
- separate public-root, pinned-consumer, and authoring readiness: an absent or
  uninitialised private checkout is valid for the public root; an exact detached
  gitlink is integration-build-ready; dirty, wrong-commit, or unexpectedly
  attached authoring state refuses mutation;
- explicit child bootstrap using the child's declared package manager or
  language toolchain;
- allowlisted commands rather than arbitrary script forwarding;
- machine-readable task results;
- a branch-sync workflow that opens or updates a PR and stops on conflict;
- a parent-update workflow that changes the gitlink only after child gates pass;
- a task-to-source matrix and proof that a Git-index-derived gitlink change
  invalidates every affected Turbo task;
- dedicated opt-in CI checkout with recursive submodule initialisation, read-only
  non-persistent credentials unavailable to child processes, and ordinary root
  jobs that do not initialise submodules;
- exclusion of child source from parent formatting, lint, dependency and
  packaging surfaces except where explicitly named.

## Oak OpenAPI Integration

The child application constructs its OpenAPI document from the tRPC router and
Zod definitions. Its existing `generate:openapi` command performs a specialised
schema transformation rather than exposing a simple deterministic downstream
export contract.

The generally useful exporter belongs on child `main` first. Until that source
PR lands, a child integration branch can carry a tested pending patch equivalent
to:

```text
pnpm export:openapi --output <file>
```

It should import the same document generator used by the application, accept
explicit base URL and version inputs, produce deterministic JSON, and require
no live server or production credentials. The parent wrapper then exposes that
command as the stable source for local SDK codegen and contract comparison.

The child remains independently installed. Root `pnpm install` must neither
absorb its dependency graph nor mutate its lockfile. Corepack should execute the
child's declared pnpm version. The parent wrapper owns port selection,
environment mapping, readiness checks, logs and shutdown behaviour when a live
server is genuinely needed.

**Warrant:** the OpenAPI schema already governs downstream SDK, MCP and search
codegen; exporting it directly closes the feedback loop without importing API
internals into consumer packages.

**Falsifier:** if importing the router necessarily requires live secrets or
database IO and cannot be separated without rearchitecting the API, the first
integration slice should run the child server against safe fixtures and fetch
Swagger over HTTP instead.

## Oak Curriculum Ontology Integration

The ontology source is data plus semantic constraints, not a Python runtime
library. The parent workspace should therefore expose generation-time tasks and
a TypeScript-facing projection, not Python functions.

The child repository remains authoritative for RDF, OWL, SKOS, SHACL, import
resolution and distribution generation. Scoped regeneration may use Python,
`uv`, pySHACL and Jena. Ordinary parent build, type-check and runtime tasks must
consume a tracked generated projection and provenance record without installing
those tools. A scoped regeneration task and drift verifier keep that output
source-accounted; an ambient cache is not the durable contract.

The parent wrapper should emit a provenance record containing at least child
commit, ontology version, generation mode, input inventory and output hashes.
Its public API should expose validated graph/data structures rather than raw
paths under the child checkout. Existing `@oaknational/graph-ingest/turtle`
support can parse direct Turtle inputs; the ontology's canonical property-graph
JSONL generator is another candidate input. The implementation plan requires a
fixture-backed comparison before choosing between them.

That comparison needs known-answer semantics, not hash equality alone. It must
exercise relevant language tags, typed literals, RDF lists or blank nodes,
import closure, source locations, and SHACL failure so deterministic loss is not
mistaken for semantic equivalence.

**Warrant:** a generation boundary preserves the ontology's semantic authority
while giving TypeScript consumers a stable, source-accounted contract.

**Falsifier:** if published release distributions provide every required field,
provenance element and pre-release testing mode, the submodule can later be
replaced by a release-artefact dependency without changing consumers.

## Database-Tools Integration

### Why the local copy is valuable

Database-Tools already contains the source machinery needed for safe
materialised-view work:

- Hasura migrations and metadata;
- published OpenAPI-oriented materialised views;
- SQL schema documentation linked back to source migrations;
- pgTAP fixtures and affected-test selection;
- local Postgres and Hasura services;
- refresh mechanics and view-version validation;
- a published curriculum-schema package.

Tailored materialised views can reduce repeated joins and payload shaping,
retain placement and release identity that bulk exports currently flatten, and
provide a narrow provider-owned contract for new API capabilities. A pinned
copy makes the view definition, migration, tests, API consumption and SDK
generation jointly reviewable.

### The safety boundary

Database-Tools is not a package dependency of this repository. It is a
development laboratory behind an allowlisted wrapper. The analysed safe
interface may:

- inspect SQL and schema definitions;
- install the child with its own lockfile;
- create and start its own isolated synthetic Compose project and database;
- construct its own DSN and database name rather than accept either from a
  caller;
- verify a wrapper-owned synthetic-fixture marker before mutation;
- apply migrations only to that newly created wrapper-owned estate;
- load committed synthetic fixtures;
- run named pgTAP and contract tests;
- export representative, non-sensitive contract fixtures;
- shut down its own containers without deleting unrelated state.

The process boundary also needs a clean allowlisted environment, an explicit
wrapper-owned Docker context/project/profile, a wrapper-owned temporary state
directory, no inherited cloud/Hasura/PostgreSQL credential variables, and no
home-directory credential mounts. Teardown may select only resources carrying
the wrapper's unique project labels.

The analysed safe interface excludes:

- download or restore staging data;
- create or read Oak credentials;
- deploy migrations or metadata;
- accept any caller-supplied database URL, including a loopback URL;
- target any pre-existing database or any estate without the wrapper-owned
  synthetic-fixture marker;
- run production refresh operations;
- expose `docker:clear` or equivalent destructive volume deletion;
- forward arbitrary child scripts;
- copy SQL into this repository as a second editable source.

Any tailored materialised view is authored and reviewed in Database-Tools. Oak
OpenAPI consumes it and owns the public contract. This monorepo consumes the
OpenAPI document or representative public fixture. The existing prohibition on
direct Hasura/PostgreSQL runtime consumption therefore remains intact.

**Warrant:** the child repository already has the migrations, fixtures,
validation and refresh model; copying only SQL would discard exactly the
context that makes materialised-view changes safe.

**Falsifier:** if the desired API changes can be proved entirely through the
published `@oaknational/oak-curriculum-schema` package and immutable public
fixtures, without source-level view or migration work, wrapping Database-Tools
for that tranche would add cost without increasing assurance.

## Cross-Repository Value Slice

The first complete proof should be deliberately small and synthetic:

1. A Database-Tools fixture and representative materialised-view contract
   expose one release-qualified relationship or field without production data.
2. Oak OpenAPI maps that representative contract into its router/Zod response.
3. The deterministic OpenAPI exporter emits the changed schema.
4. This monorepo runs SDK codegen from that file.
5. A generated-client contract test proves the field, identity and refusal
   semantics end to end.

This proves the integration substrate without choosing or deploying the first
real tailored materialised view. It proves contract correctness, not query
efficiency. A later efficiency claim needs a Database-Tools-owned
representative-scale dataset, fixed workload, query-plan/buffer evidence,
refresh cost, index/storage impact, and regression thresholds.

## Branch and Update Operating Model

The evaluated operating model uses a long-lived, protected integration branch
only where a named child delta exists. Broadly useful changes target child
`main` first. Any temporary integration-only patch has an owner, upstream PR,
reason, and retirement condition in a small patch ledger. Automation
regularly fetches child `main`, opens or refreshes a merge PR, and runs the
child's native gates. A merge conflict or red gate leaves the PR open for an
identified maintainer; no workflow force-pushes through it.

Protected integration refs must forbid force-push and deletion. Every accepted
parent pin is either an ancestor of that protected ref or has an immutable
retained ref, and a recurring audit checks the reachability of historical pins.

After the child branch advances, parent automation opens a gitlink-update PR
containing:

- old and new child commits;
- child commits included by the update;
- child gate links;
- wrapper and cross-contract results;
- generated-output diffs where relevant;
- provenance changes.

Updates should be independently mergeable per source. A single three-source
lockstep PR is reserved for an actual vertical change that requires a coherent
tuple.

## Risks and Stress Test

| Risk | Control | Observation that changes the recommendation |
|---|---|---|
| Private sources make the public repo unusable | uninitialised-by-default checkouts, credential-free root gates and opt-in dedicated jobs | any normal contributor path requires Oak credentials |
| Parent tools traverse child source | narrow wrapper-only workspace globs, immutable-lockfile proof, explicit exclusions and fresh-clone root gates | tools cannot reliably exclude nested repositories |
| Turbo reuses stale outputs after gitlink change | task-to-source matrix, Git-index-derived SHA input and controlled invalidation test | derived SHA and gitlink still fail to invalidate tasks |
| Child branch accumulates permanent divergence | upstream-first changes, small patch ledger, scheduled merge PRs | repeated conflicts cost more than contract publication or upstreaming |
| Historical parent commit references unreachable child commit | no-force-push/no-delete protected refs, immutable retained pins and recurring reachability audit | source host cannot guarantee referenced commit retention |
| Database wrapper enables unsafe operations | wrapper-owned isolated identity, allowlisted commands, marker validation and refusal tests | wrapper-owned and pre-existing estates cannot be distinguished mechanically |
| Python/Jena or Docker burden normal contributors | scoped tasks and CI jobs only | root install or ordinary build still requires them |
| Checkout mistaken for deployment proof | provenance vocabulary distinguishes source, contract, deployment and runtime evidence | no source of deployment provenance can be exposed |
| Three wrappers become maintenance-heavy | shared protocol after the second wrapper, role-specific leaves | common code exceeds the value of source-level vertical tests |

## Sequence Evaluated by the Implementation Plan

The linked plan selects the following sequence from the explored evidence:

1. **Implement Oak OpenAPI first with local provenance and source-state
   handling.** Warrant: its exported contract is already
   the downstream schema authority and creates the shortest value proof.
   Falsifier: deterministic export requires a wider API rearchitecture.
2. **Implement Database-Tools as a safe laboratory, then prove one synthetic
   vertical slice.** Warrant: materialised views are increasingly relevant and
   the source repository already supplies proper test machinery. Falsifier: a
   smaller published contract and fixture flow proves the same changes.
3. **Extract only provenance and source-state behaviour demonstrated by the
   OpenAPI and Database-Tools wrappers.** Warrant: this honours the
   consolidate-at-second-consumer rule. Falsifier: the two wrappers prove no
   meaningful shared behaviour.
4. **Implement ontology generation as an independently shippable tranche.**
   Warrant: it validates the cross-language boundary without delaying the
   Database-Tools value path. Falsifier: release artefacts fully satisfy
   pre-release and provenance needs.
5. **Add branch and parent-update automation only after manual update paths are
   green.** Warrant: automation should conserve a proven process rather than
   encode assumptions. Falsifier: manual operation exposes unresolved
   authority or credential ownership.

## Unresolved Evidence

- Whether the Oak OpenAPI router can be imported for deterministic export with
  no environment or IO side effects.
- Exact Turbo hashing behaviour for a gitlink-only change in this repository.
- Whether GitHub credentials and branch protection can support automated child
  merge PRs and parent gitlink PRs across all three repositories.
- Which ontology representation—direct Turtle, canonical merged Turtle,
  JSON-LD, or property-graph JSONL—best preserves required source locations and
  semantics for current graph consumers.
- The smallest safe Database-Tools Docker profile and fixture set that proves a
  materialised-view contract without staging data or Oak credentials.
- Whether an organisation-level policy governs long-lived integration branches
  or submodules.

These are implementation probes, not reasons to postpone the architectural
direction. Each has a reversible, testable first slice in the linked plan.

## Sources

- [Oak OpenAPI at the inspected commit](https://github.com/oaknational/oak-openapi/tree/f64b8f3fe8bee849016c61e60cc0a454d424369b)
- [Oak Curriculum Ontology at the inspected commit](https://github.com/oaknational/oak-curriculum-ontology/tree/610ba79a96bbfa5148e4a50360b05c12e79aaf83)
- [Oak Database-Tools at the inspected commit](https://github.com/oaknational/Database-Tools/tree/4e24c728a55f033b6a04c05ee189501b5b9bc2c3)
- [Git submodule documentation](https://git-scm.com/docs/git-submodule.html)
- [OpenAPI pipeline authority boundary](../../../docs/architecture/openapi-pipeline.md)
- [Oak OpenAPI integration strategic brief](../../plans/sector-engagement/future/oak-openapi-monorepo-integration.plan.md)
- [Reusable curriculum architecture report family](../oak-reusable-curriculum-architecture/README.md)
- [Related Castr source integration exploration](./castr-source-integration-report-2026-07-15.md)
- [Implementation plan](../../plans/architecture-and-infrastructure/current/oak-source-integration-workspaces.plan.md)
