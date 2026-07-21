---
name: Oak source integration workspaces
overview: >-
  Implement four source-authority-preserving integration workspaces for Oak
  OpenAPI, Castr, Oak Curriculum Ontology, and Oak Database-Tools, with optional
  pinned Git submodules, stable allowlisted interfaces, safe update automation,
  a rapid Castr/OCE development loop, and one synthetic vertical contract proof.
status: ready-for-execution
lane: current
collection: architecture-and-infrastructure
priority: P0A
lineage:
  serves_thread: connecting-oak-resources
  serves_stream: reusable-curriculum-architecture
  strategic_choice: source-authority-preserving-local-integration
  derives_from:
    - .agent/reports/oak-integrations/submodule-wrapped-oak-source-integrations-report-2026-07-15.md
    - .agent/reports/oak-integrations/castr-source-integration-report-2026-07-15.md
    - .agent/plans/sector-engagement/future/oak-openapi-monorepo-integration.plan.md
    - .agent/plans/connecting-oak-resources/reusable-curriculum-architecture/future/reusable-curriculum-architecture-planning.plan.md
todos:
  - id: preflight-source-and-policy
    content: >-
      Preflight: confirm source heads, integration-branch policy, required
      cross-repository permissions, workspace-audit placement, and the exact
      current vendor call shapes before mutation.
    status: pending
  - id: ws1-cycle-1-openapi-export
    content: >-
      WS1 cycle 1: add a deterministic, fixture-proven OpenAPI export command
      to Oak OpenAPI main first, or record a temporary integration-branch patch
      with an upstream PR and retirement condition. Test and code land together.
    status: pending
    depends_on: [preflight-source-and-policy]
  - id: ws1-cycle-2-openapi-wrapper-and-ci
    content: >-
      WS1 cycle 2: add the Oak OpenAPI submodule and private parent wrapper,
      with source-state refusal tests, bootstrap/export scripts, provenance,
      gitlink cache inputs, dedicated checkout, and parent-isolation proof.
      Test and product code land together.
    status: pending
    depends_on: [ws1-cycle-1-openapi-export]
  - id: ws2-cycle-1-castr-source-wrapper
    content: >-
      WS2 cycle 1: add the optional public Castr submodule and private source-
      first wrapper, with explicit authoring and pinned-consumer states, native
      child build invocation, OCE contract generation, provenance, dedicated
      checkout, and parent-isolation proof. Test and code land together.
    status: pending
    depends_on: [ws1-cycle-2-openapi-wrapper-and-ci]
  - id: ws2-cycle-2-castr-capability-loop
    content: >-
      WS2 cycle 2: implement the Phase 1 Zod v4 and endpoint-metadata capability
      in a short-lived Castr branch, prove it through Castr-native and OCE side-
      by-side tests, merge upstream, and advance the parent gitlink. Test and
      product code land together in their owning repositories.
    status: pending
    depends_on: [ws2-cycle-1-castr-source-wrapper]
  - id: ws2-checkpoint-later-capabilities
    content: >-
      WS2 checkpoint: promote detailed document/IR, TypeScript writer, generic
      fetch-companion, Oak policy, and reverse-generation contracts into the
      canonical Castr requirements; rerun architecture and test readiness before
      any later capability slice.
    status: pending
    depends_on: [ws2-cycle-2-castr-capability-loop]
  - id: ws2-cycle-3-document-ir
    content: >-
      WS2 cycle 3: prove core Castr document validation and IR types can replace
      OCE's direct openapi3-ts seams, ending green in Castr and OCE while the
      legacy public-root path remains intact.
    status: pending
    depends_on: [ws2-checkpoint-later-capabilities]
  - id: ws2-cycle-4-typescript-writer
    content: >-
      WS2 cycle 4: prove core Castr TypeScript/path/client-type output can
      replace openapi-typescript, ending green in Castr and OCE while the legacy
      public-root path remains intact.
    status: pending
    depends_on: [ws2-cycle-3-document-ir]
  - id: ws2-cycle-5-fetch-companion
    content: >-
      WS2 cycle 5: create and prove the generic Castr fetch companion aligned
      with ADR-043, port Oak client policy onto its hooks without moving policy
      authority, and make the openapi-fetch targets ready for atomic deletion.
    status: pending
    depends_on: [ws2-cycle-4-typescript-writer]
  - id: ws2-cycle-6-reverse-generation
    content: >-
      WS2 cycle 6: prove the Search CLI zod-to-openapi declaration is stale and
      delete it, or stop and plan a separately reviewed Castr code-first
      companion if a live consumer is found.
    status: pending
    depends_on: [ws2-checkpoint-later-capabilities]
  - id: ws2-cycle-7-publish-and-cutover
    content: >-
      WS2 cycle 7: publish and provenance-map the proved Castr core and fetch
      companion, switch the ordinary public-root pipeline to them, prove byte-
      identical source/package output, delete the adapter workspace, and remove
      every superseded direct OpenAPI dependency and configuration surface.
    status: pending
    depends_on: [ws2-cycle-5-fetch-companion, ws2-cycle-6-reverse-generation]
  - id: ws3-cycle-1-extract-shared-core
    content: >-
      WS3 cycle 1: at the proven second wrapper, extract only shared source
      state and provenance behaviour into its own private workspace, preserving
      OpenAPI and Castr contracts. Test and code land together.
    status: pending
    depends_on: [ws1-cycle-2-openapi-wrapper-and-ci, ws2-cycle-1-castr-source-wrapper]
  - id: ws4-cycle-1-database-safety
    content: >-
      WS4 cycle 1: implement and prove the Database-Tools operation allowlist,
      wrapper-owned resource identity, clean child environment, and zero-call
      refusal policy before adding any operational command surface.
    status: pending
    depends_on: [ws3-cycle-1-extract-shared-core]
  - id: ws4-cycle-2-database-lab-and-ci
    content: >-
      WS4 cycle 2: add the Database-Tools submodule and synthetic laboratory
      wrapper with migration, named pgTAP, contract export, bounded teardown,
      dedicated checkout, and parent-isolation proof. Test and code land together.
    status: pending
    depends_on: [ws4-cycle-1-database-safety]
  - id: ws4-cycle-3-vertical-contract
    content: >-
      WS4 cycle 3: prove one synthetic database-to-OpenAPI-to-Castr-to-generated-
      client contract change, including identity and refusal semantics. Test and
      code land together in their owning repositories.
    status: pending
    depends_on: [ws4-cycle-2-database-lab-and-ci, ws2-cycle-4-typescript-writer]
  - id: ws5-probe-ontology-representation
    content: >-
      WS5 probe: compare direct Turtle, canonical merged Turtle, and property
      graph JSONL with known-answer semantic and provenance fixtures; record one
      input/output decision before product implementation.
    status: pending
    depends_on: [ws1-cycle-2-openapi-wrapper-and-ci]
  - id: ws5-cycle-1-ontology-wrapper-and-ci
    content: >-
      WS5 cycle 1: add the ontology submodule and private generation-time
      wrapper with validation, tracked generated projection, drift verifier,
      provenance, dedicated checkout, and parent-isolation proof.
    status: pending
    depends_on: [ws3-cycle-1-extract-shared-core, ws5-probe-ontology-representation]
  - id: ws6-cycle-1-update-automation
    content: >-
      WS6 cycle 1: automate independently reviewable parent gitlink PRs and,
      only for named temporary deltas, conflict-stopping child
      main-to-integration PRs, with reachability and gate evidence.
    status: pending
    depends_on: [ws4-cycle-3-vertical-contract, ws5-cycle-1-ontology-wrapper-and-ci]
  - id: ws7-documentation-and-gates
    content: >-
      WS7: propagate settled contracts and operating guidance, run focused
      gates in every repository and the canonical parent aggregate gate, and
      retain an addressable evidence bundle for every acceptance id.
    status: pending
    depends_on: [ws6-cycle-1-update-automation, ws2-cycle-7-publish-and-cutover]
  - id: ws8-adversarial-review
    content: >-
      WS8: run architecture, security, test, docs, onboarding, and release
      readiness reviews; resolve every actionable finding before completion.
    status: pending
    depends_on: [ws7-documentation-and-gates]
  - id: ws9-consolidation-and-archive
    content: >-
      WS9: consolidate durable outcomes, close cross-repository claims and
      handoffs, update continuity, and archive the completed plan only after
      all acceptance ids are proven.
    status: pending
    depends_on: [ws8-adversarial-review]
---

# Oak Source Integration Workspaces

**Last Updated:** 2026-07-15  
**Status:** READY FOR EXECUTION — queued immediately after the P0 workspace
layer-separation audit  
**Scope:** a coordinated, cross-repository implementation spanning this
monorepo and source PRs in Oak OpenAPI, Oak Curriculum Ontology, and Oak
Database-Tools, plus upstream PRs in Castr. A protected integration branch
exists only for a named temporary child delta; Castr normally uses short-lived
feature branches merged directly to `main`.

## Decision and Schedule

The implementation will create four private pnpm integration workspaces under
`integrations/`, each with an `upstream/` Git submodule and a narrow stable
interface. Every submodule is uninitialised by default. The currently private
Oak OpenAPI and Database-Tools checkouts are strictly opt-in. Public Castr and
Curriculum Ontology are also opt-in because their nested repositories and
toolchains are not part of ordinary root work. No source checkout is required
by the public clone, root install, root workspace graph, root gates, or ordinary
contributor CI. The work is priority P0A: it is the next architecture-and-
infrastructure plan after
[the P0 workspace layer-separation audit](./workspace-layer-separation-audit.plan.md).
The plan itself selects `integrations/` as one coherent repo-local integration
layer. The preceding audit records that choice in the repo-wide matrix and may
surface contradictory evidence that forces readiness re-review; it does not
hold an otherwise open topology choice.

The four sources are not normal root package dependencies:

```text
integrations/
  oak-openapi/                 private contract-producer wrapper
    upstream/                  Git submodule
  castr/                       private source-first compiler wrapper
    upstream/                  public, locally editable Git submodule
  oak-curriculum-ontology/     private generation-time data wrapper
    upstream/                  Git submodule
  oak-database-tools/          private synthetic database-lab wrapper
    upstream/                  Git submodule
  source-integration-core/     private shared mechanism, extracted in WS3
```

Product and runtime packages must not import these workspaces. Codegen and
integration tasks consume their explicit generated contracts. SQL, ontology
source, routers, migrations, and deployment configuration remain authored in
their source repositories.

As verified on 2026-07-15, Oak OpenAPI and Database-Tools are private, while Oak
Curriculum Ontology and Castr are public. Castr declares `@engraph/castr`, but a
live npm registry query found no published package and GitHub exposed no
release. Visibility and distribution are rechecked in preflight because they
can change. A public contributor with no Oak credentials and no local
submodules must retain a complete, useful root development and test path.

## Problem Frame

### Gap

Provider changes to database projections, API schemas, Castr capabilities,
ontology sources, and downstream generated clients cannot currently be proved
together from one historically reproducible source tuple. Sibling checkouts are
mutable and manually coordinated; deployed Swagger cannot prove an unshipped
provider change; package publication is too slow for Castr/OCE capability
co-development; copying source files would create a second authority.

### Harm

- Implementers cannot cheaply prove a cross-repository change before release.
- Castr implementers cannot edit missing capability and immediately exercise it
  against the OCE contract through a canonical reproducible path.
- Reviewers cannot reconstruct the exact provider revisions behind a local
  generated contract.
- Database experiments risk losing migrations, fixtures, refresh mechanics,
  and pgTAP evidence if only SQL fragments are copied.
- Ordinary contributors could inherit Python, Jena, Docker, nested pnpm, or
  credential requirements if the boundary is not deliberately isolated.

### Causal mechanism

The repositories have separate histories, toolchains, release cycles, and
authority, but no local substrate pins them together or translates their
outputs into explicit parent contracts. A `package.json` that forwards child
scripts does not cure this; stable behaviour requires allowlists, refusal
semantics, generated outputs, provenance, cache inputs, and tests.

### Success

A parent commit reconstructs exact child sources; each child can be operated
through a role-specific stable interface; Castr source can be edited locally and
proved against OCE without a publication cycle; normal root work remains
independent of nested toolchains; a safe synthetic materialised-view change can
be proved through OpenAPI, Castr, and generated-client consumption; and branch
updates arrive as reviewable PRs that stop on conflicts or red gates.

## End Goal, Mechanism, and Means

### End goal

Give Oak implementers a reproducible, safe local integration estate for
co-evolving source-owned contracts, without transferring runtime, semantic,
database, or deployment authority into this monorepo.

### Mechanism

Gitlinks provide immutable source identity. Role-specific wrappers turn each
child's outputs into an allowlisted contract. Castr's wrapper additionally
admits an explicit attached-authoring state so a source edit can run child-native
tests, build the CLI, generate the OCE contract, and exercise OCE behaviour in
one loop. Generated artefacts and provenance decouple normal consumers from
nested source layouts. Child branch PRs and parent gitlink PRs make every
advance explicit. A synthetic vertical test proves the seams that individual
repository tests cannot.

### Means

1. Add a deterministic OpenAPI exporter in its source repository and wrap it.
2. Add a source-first Castr wrapper and prove one missing OCE capability through
   a rapid local edit/build/generate/verify loop before upstreaming it.
3. Extract shared source-state/provenance code only after OpenAPI and Castr
   prove the common behaviour.
4. Add a refusal-first Database-Tools wrapper and prove one synthetic
   database-to-OpenAPI-to-Castr-to-client contract slice.
5. Select and wrap one ontology projection as an independently shippable
   tranche, keeping Python/Jena scoped to regeneration.
6. Automate safe branch synchronisation and gitlink updates.
7. Prove CI, cache, toolchain, and parent-quality-gate isolation.

## Source and Authority Contract

| Surface | Local role | Authoritative owner | Parent may consume |
|---|---|---|---|
| Oak OpenAPI | deterministic contract producer | Oak OpenAPI router, Zod schemas, runtime, deployment | emitted OpenAPI document plus provenance |
| Castr core | locally editable schema compiler | Castr source, canonical representation, parsers, writers, metadata, CLI, core package and releases | source-built compiler contract in authoring mode; released core in ordinary public-root mode |
| Proposed `@engraph/castr-fetch` companion | generic typed-fetch and transport-hook building blocks under Castr ADR-043 | its separate source, package, generic client/type/hook contract and releases | source-built companion in authoring mode; released companion in ordinary public-root mode |
| Oak Curriculum Ontology | semantic source and generator input | ontology RDF/OWL/SKOS/SHACL and release distributions | validated generated projection plus provenance |
| Oak Database-Tools | synthetic database design laboratory | SQL, migrations, Hasura metadata, view refresh and deployment | representative non-sensitive public contract fixtures |
| This monorepo | integration, consumer proof, and Oak runtime policy | wrappers, generated SDK/search/graph consumers, auth, retry, rate-limit, serialisation, response augmentation and public SDK compatibility | explicit outputs only; never nested source paths at runtime |

Source revision is not deployment evidence. Provenance must distinguish at
least `source_commit`, `generated_contract`, `published_release`, and
`deployment_observation`; no wrapper may infer one from another.

## Prerequisites and Sequence

### Blocking

1. **Cross-repository authority:** before execution, the owner or repository
   maintainers confirm that this delivery may open source and gitlink PRs. A
   protected `integration/oak-open-curriculum-ecosystem` branch is created only
   in a source repository with a named temporary delta; generally useful
   changes target child `main` first. Castr uses short-lived feature branches
   and upstream PRs rather than a standing OCE branch. This does not authorise
   production changes.
2. **Private-source read access:** internal opt-in integration jobs need
   read-only access to the currently private Oak OpenAPI and Database-Tools
   repositories. Public root jobs, external forks, and ordinary contributors
   must have neither this credential nor a dependency on it.
3. **Automation identity:** the preflight identifies a least-privilege GitHub
   App installation able to open same-repository sync PRs and cross-repository
   parent update PRs. The repository-scoped `GITHUB_TOKEN` is not treated as a
   cross-repository credential, and no personal long-lived token is the design.
4. **Live source baseline:** the inspected commits are report evidence, not
   permanent execution inputs. WS preflight records the live `main` head,
   lockfile/tool versions, gates, branch rules, and Castr package/release state
   for every child.
5. **Castr publication authority:** before package-dependent work, verify
   control of the `@engraph` npm scope, availability/ownership of
   `@engraph/castr` and the proposed `@engraph/castr-fetch` name, publish rights,
   2FA/recovery posture, trusted OIDC publishing with provenance from a
   protected GitHub release environment, and one named release owner. If either
   package cannot be published through that boundary, stop before cutover and
   keep the legacy public-root path.

### Beneficial

1. **Workspace-audit evidence:** this plan is sequenced after the P0 audit so
   the audit can record the selected `integrations/*` layer and enforcement
   ownership. The minimum shippable plan is already decision-complete about
   that layer; contradictory audit evidence triggers re-review rather than an
   unrecorded topology choice.
2. **A published ontology distribution:** useful for equivalence comparison,
   but the minimum shippable ontology wrapper validates and projects pinned
   source data directly with hashes and source locations.
3. **A candidate real materialised view:** useful after the substrate lands,
   but the minimum shippable database proof uses a synthetic representative
   contract and does not design or deploy a production view.

## Non-Goals

- No production database connection, staging restore, credential creation,
  migration deployment, metadata deployment, or production refresh.
- No caller-supplied database URL, including loopback, and no attachment to a
  pre-existing database. The wrapper constructs and owns the Compose project,
  network, ports, DSN, database name, sentinel, and temporary state.
- No `docker:clear`, destructive volume removal, arbitrary child command
  forwarding, inherited cloud/database credentials, or home-directory mounts.
- No copying SQL, ontology source, Zod schemas, or migrations into this repo as
  a second editable authority.
- No runtime import from any `integrations/*/upstream` path.
- No `workspace:*`, `link:`, or file dependency from the root graph to Castr's
  nested package. The rapid loop crosses a named command and generated-artefact
  boundary.
- No root install that mutates a child lockfile or absorbs a child dependency
  graph.
- No default or public-fork job that initialises any source submodule, and no
  required generated artefact or root gate that assumes a source checkout.
- No claim that a source checkout proves published or deployed state.
- No first production materialised-view design in this plan; the plan proves
  the safe laboratory and contract path it will use.
- No long-lived Castr/OCE integration branch while upstream contribution remains
  available through short-lived PRs.
- No claim that a declared but unavailable npm package is current distribution.
- No permanent Castr/legacy dual stack. Side-by-side validation has a named
  cutover and deletion cycle.
- No direct generic OCE OpenAPI implementation dependency after cutover except
  Castr core and the one ADR-043-aligned fetch companion. Remaining
  OpenAPI-named transitives are classified rather than hidden.
- No movement of Oak auth, retry, rate-limit, serialisation,
  response-augmentation, or public SDK compatibility policy into Castr core or
  its generic companion.
- No speculative replacement of unrelated third-party functionality. A later
  candidate needs a named capability, authority argument, parity proof, and
  deletion target before entering an executable plan.
- No lockstep update of all four gitlinks unless one reviewed vertical change
  requires a coherent source tuple.
- No compatibility facade if a wrapper contract proves wrong; replace the
  wrong contract and regenerate consumers.

## Build-vs-Buy Attestation

This plan adopts the vendors' first-party primitives and builds only the
Oak-specific contract boundary they do not provide.

| First-party surface | Decision |
|---|---|
| Git submodules | Adopt for immutable repository-and-commit identity; do not build a source-copy or custom vendoring system. |
| GitHub Dependabot `gitsubmodule` ecosystem | Probe first and adopt for parent gitlink PRs where it can update the private pins and the PR needs no additional Oak evidence; bespoke orchestration is limited to unmet evidence/gating needs. |
| GitHub Actions `actions/checkout` submodule support | Adopt only in dedicated opt-in integration jobs, pinned by immutable action commit; ordinary root jobs do not initialise submodules. |
| GitHub CLI and GitHub App installation tokens | Adopt for PR metadata and cross-repository writes after gates; the write identity is never present while child code executes. |
| Corepack and each child `packageManager` declaration | Adopt; do not impose the parent's pnpm version on nested projects. |
| Castr core public CLI/package | Adopt for compiler/IR/parser/writer capability in source mode and as a provenance-bearing released package at cutover. Do not add transport/runtime policy to core or link the nested workspace into the parent graph. |
| Castr ADR-043 companion model | Adopt a separately published generic fetch companion, proposed as `@engraph/castr-fetch` subject to blocking name/scope verification; retain Oak-specific policy in OCE. |
| `uv` and the ontology's existing validation/export tools | Adopt only in the scoped ontology job; do not recreate Python dependency management in pnpm. |
| Database-Tools Docker/Hasura/pgTAP estate | Adopt a named safe subset; do not reproduce its migrations or database harness in the parent. |
| Turborepo task inputs and dependency graph | Adopt for scoped task orchestration and caching; add explicit gitlink/provenance inputs because Turbo does not define the domain contract. |

The bespoke code is limited to typed source-state validation, provenance,
role-specific allowlists, deterministic adapter outputs, and refusal behaviour.
No first-party primitive provides that Oak authority boundary.

Workflow security is part of the selected shape: checkout credentials are
read-only, non-persistent, scrubbed from logs/artefacts, and unavailable to
child processes; write tokens are minted only after gates. No workflow executes
untrusted child changes with `pull_request_target`.

## Workspace and Interface Rules

Each wrapper is `private: true` and exposes stable named scripts. It must not
expose a generic `run <child-script>` escape hatch.

| Wrapper | Required stable scripts | Explicitly unavailable |
|---|---|---|
| Oak OpenAPI | `source:status`, `source:bootstrap`, `contract:export`, `test:contract` | arbitrary server commands, production-secret loading |
| Castr | `source:status`, `source:bootstrap`, `castr:build`, `contract:generate:source`, `contract:generate:released`, `contract:verify`, `contract:parity`, `test:contract`, `package:verify` | arbitrary child commands, imports from `upstream/src` or `upstream/dist`, implicit package linking, silent mode fallback |
| Ontology | `source:status`, `source:bootstrap`, `source:validate`, `projection:generate`, `test:contract` | Python runtime API, implicit network imports, ordinary-root regeneration |
| Database-Tools | `source:status`, `source:bootstrap`, `lab:up`, `lab:migrate`, `lab:fixtures`, `lab:test`, `contract:export`, `lab:down` | staging restore, credentials, deploy, refresh against remote, destructive clear, arbitrary scripts |

The eventual `source-integration-core` API is earned at WS3 from the OpenAPI
and Castr wrappers, not presupposed.
Its maximum allowed scope is:

- parse `.gitmodules` and gitlink/source state supplied through injected IO;
- distinguish `public_root_available` from integration source state;
- return typed pinned-consumer states including `unavailable`,
  `ready_detached`, `dirty`, and `wrong_commit`;
- return separate authoring states in which an attached expected branch is
  writable and an unexpected attached branch refuses mutation;
- form deterministic provenance and cache-input records;
- render actionable, non-secret refusal messages.

It must not know OpenAPI, RDF, SQL, Docker, Hasura, GitHub, child toolchain
execution, or child-specific commands. Git/gitlink semantics are explicitly in
scope.

## Proof Contract

| ID | Acceptance outcome | Proof level | Deterministic proof |
|---|---|---|---|
| INT-00 | A public clone with no Oak credentials and no initialised source submodules completes root install, package enumeration, build, test, and `pnpm check`. | e2e | external-equivalent clean CI job with private-source credentials absent and all submodule initialisation disabled |
| INT-01 | Each opt-in integration job resolves its exact gitlink and distinguishes unavailable public-root, detached pinned-consumer, and attached authoring states. | integration | source-state fixtures plus one dedicated fresh-checkout job per source; absence remains valid for the public root |
| INT-02 | Oak OpenAPI emits byte-stable JSON from explicit base URL/version inputs without a live server or production credentials. | integration | child focused exporter test twice, hash comparison, and child aggregate gate |
| INT-03 | Local SDK codegen consumes the emitted document and fails on an unsupported or malformed contract. | integration | focused codegen contract test plus `pnpm sdk-codegen` |
| INT-04 | Ontology generation preserves known-answer semantics, source locations, provenance, inventory, and hashes in a tracked generated projection with drift verification. | value-proxy | fixtures cover language tags, typed literals, lists/blank nodes where relevant, import closure and SHACL failure; focused generator/drift tests and native validation pass |
| INT-05 | Root workspace discovery contains wrappers but no `upstream` package; install and root lifecycle scripts do not enter children or mutate parent/child lockfiles. | e2e | before/after lockfile hashes, recursive package enumeration, lifecycle trace, absent child toolchains, and `pnpm check` exit 0, proven as each wrapper lands |
| INT-06 | Database wrapper accepts only named safe commands against its internally constructed, sentinel-verified synthetic resources. | unit | table-driven operation/identity/environment/refusal tests with injected config and no spawned process |
| INT-07 | Every caller URL, pre-existing/unmarked resource, inherited credential, and forbidden operation fails before child execution. | integration | injected boundary tests assert zero calls; bounded command smoke proves owned processes are reaped and unrelated resources remain untouched |
| INT-08 | A synthetic representative database contract flows through Oak OpenAPI export and Castr into a generated-client behavioural test. | e2e | coordinated child fixture tests, exporter, Castr generation, parent codegen, and client contract test |
| INT-09 | Git-index-derived SHAs invalidate exactly the tasks in a recorded task-to-source matrix; unrelated tasks remain cacheable. | integration | verify derived SHA against the Git index, then a two-run Turbo probe per source with machine-readable summary |
| INT-10 | Useful child changes target `main`; named temporary patches sync by protected merge PR; Dependabot or minimal orchestration creates independent parent gitlink PRs with Oak evidence and stop behaviour. | e2e | evidence-schema unit tests plus thin workflow smoke for success, red gate and conflict |
| INT-11 | Parent lint, format, knip, depcruise, packaging, and test discovery neither traverse nor publish nested child source. | integration | wrapper-specific boundary proof as each lands, then root focused checks and canonical `pnpm check` |
| INT-12 | Historical pins remain reachable and provenance never labels source state as deployment state. | integration | no-force-push/no-delete protection evidence, ancestor-or-immutable-ref proof, recurring reachability audit, and provenance tests |
| INT-13 | An attached `feat/oce-*` Castr branch can be edited, built, and exercised against the OCE contract without publication, package linking, or root lockfile mutation; dirty authoring records base commit plus content hash and is forbidden in CI/release/pin updates. | e2e | disposable authoring checkout proves clean and dirty-authoring states, refuses direct `main` mutation, runs named commands, and records source/output provenance |
| INT-14 | Castr-generated OCE output is deterministic, passes product-owned contract fixtures, and is consumed without imports from nested source or build paths. | integration | repeated generation/hash comparison, fixture verifier, dependency-boundary check, type-check, and focused OCE behavioural test |
| INT-15 | The first OCE-enabling Castr capability lands through a short-lived upstream PR to `main`, and a merged parent commit advances only to the merged reachable commit or an immutable retained ref. | integration | Castr PR/native gates plus parent old/new pin, included commits, contract diff, reachability evidence, and rejection of a deletable feature-only pin |
| INT-16 | Released Castr core and fetch companion map installable versions to proved commits without becoming the local authoring dependency or declaring/requiring `openapi-fetch`. | e2e | packed-manifest assertions find no `openapi-fetch` dependency, peer dependency, or optional-peer metadata in either package; a strict-peer clean consumer installs them with no `openapi-fetch`, generates and runs the representative client, observes no peer warning/import/runtime resolution, and records registry provenance/release evidence |
| INT-17 | OCE's direct generic OpenAPI implementation dependencies converge on Castr core plus the approved fetch companion; all superseded manifests, imports, generated imports, workspace entries, Knip exceptions, tests, docs/config allowlists, lockfile entries, and the adapter workspace are deleted. | integration | declaration/owner ledger, capability-parity tests, public SDK API/type compatibility or reviewed breaking-version decision, clean install, depcruise/knip, repo-wide scan, and aggregate gates |
| INT-18 | Explicit source-built and released Castr-family modes produce byte-identical OCE contract files for the same commits and inputs, while the no-submodule public root uses only released mode. | e2e | byte hash comparison of generated contract files, separately asserted mode-specific provenance envelope, public clean-clone `pnpm sdk-codegen` and `pnpm check`, plus source authoring-loop proof |

`READY FOR EXECUTION` is valid only after the plan-phase reviewers accept this
shape. `complete` is valid only when INT-00 through INT-18 have addressable
green evidence, all repository-native gates are green, the parent `pnpm check`
is green, and no unresolved reviewer finding remains. A landed wrapper or
closed claim is only a partial slice.

## Execution Workstreams

Every product-bearing cycle is one landing unit: its failing behavioural test,
minimal implementation, and refactor land together, and every owning
repository is green at the end. Cross-repository commits may be separate
because repositories are separate authorities; the cycle evidence records the
ordered commit tuple and no repository receives a red intermediate commit.

### Preflight — source, policy, and topology

**Starting state:** this plan in `current/`, no integration branches or
submodules assumed.

**Permitted scope:** read-only inspection of all five repositories; this plan,
the workspace-audit output, and coordination records.

**Acceptance:**

1. Record live source heads, clean state, native gates, toolchain declarations,
   existing export/generation commands, branch protection, and retention.
2. Recheck repository visibility; record that private checkouts are optional
   and root/public-fork gates have no private credential or source input.
3. Record `integrations/*` in the workspace-audit matrix and its one-way
   dependency rules; surface contradictory evidence for re-review.
4. Confirm named child deltas, upstream-first PRs, any temporary branch/patch
   ledger, maintainers, GitHub App identity, and PR ownership.
5. Verify Castr ADR-043 still governs core/companion ownership; confirm the
   exact fetch-companion package name and source workspace before its first
   product cycle.
6. Verify npm scope and package-name control, trusted/provenance publishing,
   protected release environment, strict peer behaviour, and named release
   ownership for Castr core and the companion.
7. Re-verify Git submodule, Dependabot `gitsubmodule`, checkout, GitHub App,
   GitHub CLI, npm publishing, Turbo, Corepack, Castr package/CLI, `uv`, and
   Database-Tools literals against live first-party sources.
8. Stop before mutation if any authority or least-privilege requirement is
   unresolved; do not replace it with a personal-token workaround.

**Proof:** non-code evidence bundle linked from the plan; no completion id is
claimed by preflight alone.

### WS1 — deterministic Oak OpenAPI contract

#### Cycle 1.1: child exporter

**Scope:** Oak OpenAPI `main` PR for the document-generator seam, exporter entry
point, fixture tests, and its manifest script. A temporary integration-branch
patch is permitted only with a named owner, upstream PR, reason, and retirement
condition in the patch ledger.

**Do not touch:** deployment, router semantics unrelated to deterministic
export, parent SDK output, or secrets.

**Red:** a child integration test proves deterministic key ordering/output,
explicit base URL/version inputs, schema validity, no server, and no credential
read. It fails because the export seam is absent.

**Green:** add the minimal exporter using the same document generator as the
runtime. It writes one deterministic JSON document to an explicit output.

**Acceptance:** INT-02; child focused test and child aggregate gate exit 0.

#### Cycle 1.2: parent wrapper and gitlink

**Scope:** root `.gitmodules`, narrow wrapper-only `pnpm-workspace.yaml` entry,
Turbo/root tool exclusions, `integrations/oak-openapi/**` including its README,
dedicated opt-in integration CI, and the smallest SDK-codegen file-input seam.

**Do not touch:** ontology/database wrappers or create a shared core package.

**Red:** pure source-state/provenance tests cover unavailable public-root,
detached exact pin, dirty/wrong pin, expected authoring branch, and unexpected
authoring branch. A codegen contract test fails without a supplied document.
Boundary tests show no `upstream` package in the root workspace graph, no root
lifecycle entry into the child, and no lockfile mutation.

**Green:** add the pinned submodule and private wrapper, local source-state
implementation, Corepack child bootstrap, contract export, provenance, and
Git-index-derived Turbo inputs. The SDK generator consumes an explicit file
rather than the child's filesystem. The README documents the opt-in bootstrap,
canonical export, unavailable/refusal states, and source/deployment authority.
Ordinary CI leaves the private submodule absent; a dedicated job checks it out
with read-only non-persistent credentials unavailable to child processes.

**Acceptance:** INT-00; INT-01/INT-03/INT-05/INT-09/INT-11 for Oak OpenAPI;
focused tests, opt-in `pnpm sdk-codegen`, relevant parent gates, and the public
root job exit 0.

### WS2 — source-first Castr/OCE capability loop

#### Cycle 2.1: optional source wrapper and contract seam

**Scope:** root `.gitmodules`, one explicit wrapper entry in
`pnpm-workspace.yaml`, Turbo/root tool exclusions, `integrations/castr/**`
including product-owned minimum contract fixtures and README, and dedicated
opt-in integration CI. The nested `upstream/lib` package is not a parent
workspace.

**Do not touch:** adapter removal, Database-Tools, ontology, root dependency
overrides, or Castr product behaviour.

**Red:** source-state tests cover unavailable public-root, exact detached pin,
clean attached `feat/oce-*` authoring branch, dirty authoring, direct `main`,
wrong pin, and unexpected branch. Boundary tests prove root package discovery,
install, lifecycle, Turbo, knip, depcruise, publishing, and lockfiles do not
traverse Castr. A focused contract test fails because no named Castr
build/generate seam exists.

**Green:** add the pinned public submodule and private wrapper. Bootstrap uses
Castr's own `packageManager` declaration and frozen lockfile. Named commands
build Castr, invoke its built public CLI with explicit input/output paths,
validate deterministic OCE output, and emit provenance. The wrapper neither
imports `upstream/src`/`upstream/dist` nor links Castr into the root graph; the
CLI path is an adapter implementation detail. Ordinary CI leaves the submodule
absent. Local dirty authoring is allowed only on `feat/oce-*` and provenance
records base commit plus deterministic content hash; CI, release, pin updates,
and direct `main` mutation refuse it. Dedicated CI initialises only Castr and
runs the exact-pin contract proof.

**Acceptance:** INT-00; Castr parts of INT-01/INT-05/INT-09/INT-11 plus
INT-13/INT-14; focused wrapper tests, Castr build, repeated generation, OCE
type/behaviour checks, and public root gates exit 0.

#### Cycle 2.2: Phase 1 Zod v4 and endpoint metadata

**Scope:** the canonical Phase 1 Castr contract only: Zod v4 generation,
endpoint definitions, parameter/response metadata, deterministic output, one
short-lived Castr branch/PR, matching OCE side-by-side tests, and the parent
gitlink update after upstream merge.

**Red:** a Castr-native test and an OCE contract test express the same missing
behaviour at their respective boundaries and fail for the same evidenced gap.
The existing adapter remains the comparison oracle only where its behaviour is
still intended.

**Green:** implement the minimum general core-Castr capability, run focused then
aggregate Castr gates, and exercise the local edit/build/generate/verify loop
before publishing anything. Merge the feature branch to Castr `main`; advance
the parent gitlink to that merged reachable commit and record the generated
diff and provenance. Mark the adapter slice `proved-and-ready-to-delete`; do not
remove anything required by the default public root before released-mode
cutover.

**Acceptance:** INT-13 through INT-15. Castr and OCE evidence identifies the
ordered commit tuple, native gates, generated diff, and exact merged pin.

#### Checkpoint 2.C: later-capability contract readiness

After Phase 1 is green, promote detailed document/IR, TypeScript writer,
generic fetch-companion, Oak-policy, public-SDK-compatibility, strict-peer, and
reverse-generation contracts into the canonical Castr requirements. Name the
companion source workspace and confirm or revise the proposed
`@engraph/castr-fetch` package through Castr's own architecture process. Rerun
architecture and test readiness. Later cycles do not start while any authority,
API compatibility, or proof contract remains implicit.

#### Cycle 2.3: core document validation and IR types

**Scope:** one Castr core PR for validated OpenAPI document/IR types and one OCE
side-by-side slice covering the adapter and codegen `openapi3-ts` imports.

**Red:** Castr-native and OCE characterisation tests prove the exact document,
schema, path, operation, response, validation, and failure behaviour needed at
the compiler seam.

**Green:** add the minimum core types/validation and consume them in explicit
source mode. Keep the legacy declarations required by ordinary public-root mode
until final cutover; mark each declaration and configuration target
`proved-and-ready-to-delete`.

**Acceptance:** INT-14/INT-15 for this ledger slice; Castr and OCE focused and
aggregate gates exit 0.

#### Cycle 2.4: core TypeScript writer

**Scope:** one Castr core PR for TypeScript path/client-type output and one OCE
side-by-side slice covering the `openapi-typescript` consumer.

**Red:** characterisation proves literals, optionality, error responses, path
parameters, strictness, and public generated type compatibility.

**Green:** implement the minimum core writer and prove source-mode output. Keep
the released public-root path intact and mark the dependency/import targets
`proved-and-ready-to-delete`.

**Acceptance:** INT-14/INT-15 for this ledger slice; byte-deterministic output,
type checks, generated-consumer behaviour, and aggregate gates exit 0.

#### Cycle 2.5: generic fetch companion and retained Oak policy

**Scope:** one ADR-043-aligned Castr companion workspace/PR, proposed package
`@engraph/castr-fetch` subject to preflight, and one OCE side-by-side slice for
both `openapi-fetch` declarations and their import/public-API surfaces.

**Red:** characterisation tests record intended OCE behaviour for document
client construction, request/response typing, serialisation and generic hooks;
separate tests prove Oak auth, retry, rate-limit, response augmentation, and
public client aliases remain OCE-owned and compatible.

**Green:** add only generic typed-fetch/hook building blocks to the companion;
port Oak policy onto those hooks in source mode. Core Castr remains a compiler.
Generated output and consumers have no `openapi-fetch` import or peer reliance.
Remove core Castr's stale optional peer and assert the packed manifests for core
and companion contain no `openapi-fetch` dependency, peer dependency, or
optional-peer metadata.
Keep the legacy public-root path until cutover and mark both manifest/import
surfaces `proved-and-ready-to-delete`.

**Acceptance:** INT-14/INT-15 plus the public API/type compatibility part of
INT-17; focused generic-companion and Oak-policy tests and aggregate gates exit
0.

#### Cycle 2.6: reverse-generation declaration

**Scope:** `apps/oak-search-cli/package.json`, its Knip exception, and a focused
usage proof.

**Red:** a repository scan and focused test establish whether
`@asteasolutions/zod-to-openapi` has a live consumer.

**Green:** if unused, delete the declaration and Knip exception as stale. If a
live use exists, stop this cycle and create a separately reviewed code-first
companion contract under ADR-043; do not fold it into core or improvise a
replacement inside this cycle.

**Acceptance:** stale deletion plus clean Search CLI gates, or an explicit
blocked verdict with the new authority-bearing plan.

#### Cycle 2.7: publish, cut over, and delete the legacy stack

**Scope:** Castr core and fetch-companion package metadata/release workflows,
clean strict-peer consumers, ordinary OCE codegen/runtime, explicit source-mode
generation, every ledger-owned manifest/import/generated/config/test/docs/
workspace/Knip/lockfile surface, and the adapter workspace.

**Red:** the live 2026-07-15 state has no installable Castr release, source and
package modes have no parity proof, and OCE still directly depends on multiple
OpenAPI implementations.

**Green:** publish provenance-bearing core and companion versions mapped to
proved commits. Make ordinary no-submodule OCE codegen use those releases;
retain the optional wrapper as explicit source mode. Prove byte-identical
contract files for equal inputs/commits and compare provenance envelopes
separately. In a clean strict-peer consumer with no `openapi-fetch`, generate
and run the representative client with no peer warning, generated import, or
runtime resolution. Reassert that both packed manifests contain no
`openapi-fetch` declaration of any kind. Atomically delete the adapter workspace
and every superseded ledger/configuration surface, regenerate the lockfile,
verify the SDK public API/types or approve a breaking version, and classify
remaining OpenAPI-named transitives as Castr-owned or unrelated.

**Acceptance:** INT-00 and INT-16 through INT-18; clean package install,
byte-identical source/package contracts, public-root `pnpm sdk-codegen`, focused
runtime/client behaviour, dependency-boundary checks, and aggregate gates exit
0.

### WS3 — shared core at the actual second wrapper

#### Cycle 3.1: extract shared source state and provenance

**Scope:** `integrations/source-integration-core/**` and the OpenAPI and Castr
wrappers' source-state/provenance imports.

**Red:** contract tests express only behaviour proven common by those two live
wrappers; compile/type tests fail because the shared interface is absent.

**Green:** move the shared pure Git/gitlink state and provenance mechanism into
the private core workspace and delete duplicate implementations. Child
allowlists, toolchain execution, GitHub, OpenAPI, and Castr concepts remain
in their leaves.

**Acceptance:** both wrappers remain green; the core has no child-domain,
toolchain-execution, or GitHub dependency; INT-00/INT-01/INT-12 pass for both.
Do not expand for a hypothetical consumer.

### WS4 — Database-Tools laboratory and first vertical value

#### Cycle 4.1: safety policy before operations

**Scope:** `integrations/oak-database-tools` pure policy module and tests only;
no submodule checkout and no executable child command yet.

**Red:** table-driven tests reject staging restore, credentials, deploy,
refresh, destructive clear, arbitrary scripts, every caller URL including
loopback, every pre-existing/unmarked database, inherited cloud/Hasura/Postgres
credentials, home-directory mounts, and unknown operations. They accept only
named operations against wrapper-constructed identities.

**Green:** implement an exhaustive typed operation/environment/resource policy
with injected IO and execution ports. The wrapper constructs a unique Compose
project, network, bound ports, DSN, database name, sentinel, and temporary state
directory. Unknown values remain `unknown` until validated. Unit tests neither
spawn a process nor read environment variables.

**Acceptance:** INT-06; focused unit tests, type-check, and lint exit 0.

#### Cycle 4.2: submodule, synthetic lab, and isolation

**Scope:** root `.gitmodules`, narrow wrapper workspace/exclusions,
`integrations/oak-database-tools/**` including its README, dedicated opt-in CI,
and the smallest source-owned Database-Tools fixture/export change.

**Red:** injected boundary tests prove forbidden inputs make zero child calls.
A command smoke outside Vitest proves owned project creation, sentinel
verification, migration, fixture, named pgTAP, contract export, bounded process
reaping, labelled teardown, and that unrelated containers/volumes survive.

**Green:** add the pinned private submodule and adapter with a clean allowlisted
child environment, explicit Docker context/project/profile, no credential
inheritance or home mounts, and wrapper-owned temporary state. Teardown selects
only uniquely labelled owned resources and does not delete volumes. The README
co-lands one canonical safe sequence, forbidden operations, refusal behaviour,
teardown semantics, optional-checkout rule, and authority warning. Dedicated CI
uses read-only non-persistent checkout credentials; the public root stays green
with no submodule.

**Acceptance:** INT-00; Database-Tools parts of INT-01/INT-05/INT-07/INT-09/
INT-11; focused tests, safe smoke, native child gates, and public root gates
exit 0.

#### Cycle 4.3: database through Castr to generated client

**Scope:** one Database-Tools synthetic representative materialised-view
contract, one Oak OpenAPI fixture/router/Zod response, deterministic OpenAPI
output, explicit source-mode Castr generation through the proved TypeScript
writer, and one parent generated-client behavioural test. This proof does not
wait for the fetch companion, registry publication, or full cutover.

**Red:** the client test asserts one release-qualified relationship or field,
its stable identity, and typed absence/refusal against the pre-change tuple.

**Green:** land the minimum source-owned changes in order: Database-Tools
fixture/contract, Oak OpenAPI mapping/schema, exported document, Castr output,
generated client. No view is deployed and the parent gains no SQL/Hasura runtime
coupling.

**Acceptance:** INT-08. Evidence identifies every commit and owning repository
gate. This is contract-correctness evidence only; it makes no efficiency claim.

### WS5 — ontology projection after the first private-source proof

#### Probe 5.0: representation decision

Compare direct Turtle, canonical merged Turtle, and property-graph JSONL using
known-answer fixtures/queries for identifiers, language tags, typed literals,
RDF lists or blank nodes where relevant, imports, relationships, source
locations, SHACL failure, ordering, losses, and TypeScript ingestion. Record one
input and durable tracked-output verdict in the wrapper README. This read-only
probe may run alongside WS4, but implementation follows WS3.

#### Cycle 5.1: ontology wrapper, tracked projection, and isolation

**Scope:** root `.gitmodules`, narrow workspace/tool exclusions, the ontology
source PR only if a generally useful deterministic projection change is needed,
`integrations/oak-curriculum-ontology/**` including its README, and dedicated
integration CI.

**Red:** projection tests prove every known-answer semantic case, source
locations, validation failure, commit/version provenance, inventory, hashes,
byte stability, and tracked-output drift. Boundary tests prove root workspace,
lockfile, lifecycle, cache, and toolchain isolation.

**Green:** add the pinned public submodule and private wrapper. Python, `uv`,
pySHACL, and Jena run only in named regeneration jobs. Commit the selected
generated projection and provenance under the wrapper with a deterministic
drift verifier; ordinary TypeScript builds consume the tracked output. Co-land
the README with canonical regeneration, drift, toolchain, and authority rules.

**Acceptance:** INT-00; INT-01/INT-04/INT-05/INT-09/INT-11 for ontology;
focused tests, native ontology validation, drift check, dedicated CI, and public
root gates exit 0.

### WS6 — branch and gitlink update automation

#### Cycle 6.1: conserve the proven manual flow

**Scope:** Dependabot `gitsubmodule` capability/configuration probe, only the
native source-repository workflows required for named temporary patches, any
minimum unmet parent evidence orchestrator, tests/fixtures, and operating docs.

**Red:** Oak evidence-schema and decision tests prove no-op, independent-source
updates, included commits, red child gate, merge conflict, unreachable commit,
dirty/generated diff, and stop behaviour. A thin workflow smoke proves the
selected GitHub surface conforms without making YAML configuration the product.

**Green:** adopt Dependabot for parent gitlink updates wherever its private-repo
access and PR payload satisfy the contract. Add bespoke orchestration only for
named unmet evidence/gating needs. Where a temporary patch exists, scheduled
and dispatched child workflows merge `main` into its protected integration
branch through a PR, never rebase/force-push. Parent PRs include old/new pins,
included commits, reachability, child gates, wrapper/contract results,
provenance, and generated diffs. Conflicts/failures stop with a named owner.
Actions are pinned by immutable SHA. Read credentials are non-persistent and
unavailable to child processes. A fresh downstream job/runner that never checks
out or executes child code consumes only strictly parsed, non-executable,
hash-bound gate evidence, revalidates the exact source/head SHA, and then mints
a GitHub App token with only the repository/PR permissions required for the
write. No `pull_request_target` runs untrusted changes.

Castr's normal path is simpler: short-lived feature branches receive `main` as
needed, useful changes merge upstream, and the parent pin advances only after
Castr-native and OCE contract gates pass. Automation may open the independent
pin PR; it never keeps a feature branch alive merely to service OCE.

**Acceptance:** INT-10 and INT-12; dry-run/test-branch evidence proves the
fresh-runner write boundary, evidence/SHA revalidation, least privilege, and
success/red/conflict behaviour; all script and native workflow gates pass.

### WS7 — documentation, full gates, and evidence

Consolidate and cross-link the wrapper READMEs already co-landed with their
interfaces. Update root workspace/build-system guidance, OpenAPI pipeline docs,
Castr requirements, source-repository contributor guidance, and any ADR whose
intent changes. Link rather than duplicate the report's analysis. Record the
final interface, public-without-source-checkouts invariant, Castr authoring
loop, provenance schema, safe/forbidden Database-Tools operations, update
runbook, conflict owner, and removal path.

Run focused tests first, native aggregate gates in each changed child, then the
parent canonical aggregate gate:

```bash
pnpm check
```

The exact child commands are recorded in preflight from their live manifests;
the plan must not preserve stale command literals. All gates must pass. See
[Quality Gates](../../../plans/templates/components/quality-gates.md).

### WS8 — adversarial review

Dispatch after green implementation evidence:

- architecture specialist: authority, layer, dependency, and abstraction
  boundaries;
- security specialist: credentials, remote-target refusal, workflow tokens,
  and destructive operations;
- test specialist: TDD pairing, no-IO unit shape, smoke/E2E boundary, and
  acceptance coverage;
- docs/ADR and onboarding specialists: contributor discoverability and intent
  drift;
- release-readiness specialist: INT-00 through INT-18 and cross-repo tuple.

Resolve every actionable finding and rerun affected gates. Three independent
friction signals against the chosen shape stop execution for shape review; they
do not trigger a fourth tactical patch.

### WS9 — learning loop and closeout

Run the consolidation workflow, promote durable outcomes into architecture and
engineering documentation, close every repository claim, record explicit
cross-repository custody, and update the serving thread's continuity record.
Archive this plan only after the proof contract supports `complete`.

## Parallelisation and Ownership

- WS1 is the first proven slice because the private OpenAPI source is the
  downstream schema authority and validates the optional-checkout design.
- WS2 is the independently shippable Castr/OCE co-development tranche. It
  follows WS1 so it can exercise a deterministic input contract, but does not
  wait for Database-Tools or ontology.
- WS3 extracts shared behaviour from OpenAPI and Castr, the actual second
  wrapper; it does not speculate for Database-Tools or ontology.
- WS4 is the independently shippable Database-Tools/OpenAPI/Castr value tranche.
  It uses the intended generator rather than extending proof around the adapter
  scheduled for retirement.
- The read-only ontology representation probe may run alongside WS4. Ontology
  implementation remains an independently shippable tranche after WS3, so the
  Database-Tools value path never waits for it.
- Every wrapper cycle owns its checkout, cache, toolchain, root-gate, and public
  no-submodule proof. Automation waits for all manual paths to be green.

Any delegated cycle brief must restate its repository, starting commit,
permitted paths, forbidden paths, acceptance ids, commands, reintegration
owner, and stop-on-conflict rule. Cross-repository join/claim doctrine applies
before edits.

## Risks and Controls

| Risk | Control | Stop/reconsider signal |
|---|---|---|
| Child divergence accumulates | upstream changes first; small patch ledger; protected merge PRs | repeated sync conflicts outweigh source-level proof value |
| Gitlinks become unreachable | protected no-delete/no-force-push refs, immutable retained pins, recurring reachability audit | source host cannot guarantee retention |
| Private sources erode open-source usefulness | absent-by-default private checkouts, credential-free public CI, INT-00 per wrapper | any root or public-fork path requires private access |
| Public nested sources become an accidental root prerequisite | all source submodules absent by default, no nested workspace/link dependencies, INT-00 per wrapper | ordinary install/build/test traverses Castr or ontology |
| Parent tools traverse children | narrow wrapper globs, lock/lifecycle proof, explicit exclusions, fresh-clone CI | canonical gates cannot exclude nested source reliably |
| Cache reuses stale contracts | task-to-source matrix, Git-index-derived SHA inputs and controlled probe | affected task still hits after gitlink change |
| Database wrapper reaches unsafe state | constructed resource identity/sentinel, clean environment, bounded processes, zero-call refusal | wrapper-owned and pre-existing resources cannot be distinguished mechanically |
| Normal contributors inherit heavy tools | scoped jobs and tracked ontology output | root install/build requires Python, Jena, Docker, Hasura, nested pnpm, or Oak credentials |
| Source mistaken for deployment | typed provenance vocabulary and refusal to infer deployment | no truthful deployment evidence class can be represented |
| Shared core becomes a framework | extract at second consumer and forbid domain/vendor knowledge | third wrapper needs exceptions or core grows child concepts |
| Castr source-first loop leaks internal paths | named CLI/artefact adapter, dependency-boundary tests, INT-14 | OCE package imports nested source/dist or a Castr refactor breaks consumers without wrapper mediation |
| Castr feature branch becomes permanent | upstream-first short PRs, merged-pin completion, INT-15 | repeated upstream delay requires an explicit branch-policy re-review |
| Package intent is mistaken for distribution | live registry/release preflight, clean pack proof separated from published provenance | docs or provenance call an unavailable package released |
| Automation credentials overreach | separate read/write identities, immutable actions, no `pull_request_target`, no child-process token | required token can mutate deployments, read production data, or reach child code |

## Foundation Alignment

- [Principles](../../../directives/principles.md): long-term architectural
  excellence; strict and complete; simplest shape without lost value;
  separate framework from consumer; consolidate at the second consumer.
- [Testing strategy](../../../directives/testing-strategy.md): tests prove
  Oak-authored behaviour; pure logic receives injected IO; test and product
  code land as pairs; no in-process test spawns child processes.
- [Schema-first execution](../../../directives/schema-first-execution.md):
  downstream SDK/runtime behaviour remains generated from OpenAPI artefacts;
  authored facades do not mirror or widen generated contracts.
- Existing OpenAPI architecture: this repository consumes a provider-owned
  public contract and does not gain a Hasura/PostgreSQL runtime dependency.
- Workspace doctrine: wrappers, the shared mechanism, and runtime consumers
  are separate coherent workspaces with one-way dependencies.

## Plan-Body First-Principles Check

Before every prescribed test, implementation, doctrine edit, or completion
claim, apply
[the five-clause check](../../../rules/plan-body-first-principles-check.md):

1. **Shape:** unit tests prove pure Oak policy; command smoke/E2E proves real
   nested tools outside Vitest; no test merely asserts vendor configuration.
2. **Landing path:** preflight verifies each repository's test discovery,
   hooks, CI inclusion, generated-file policy, and gate ownership before files
   are named or landed.
3. **Vendor literal and capability locus:** re-verify action inputs, GitHub
   permissions, CLI commands, package managers, paths, and tool ownership at
   execution; inspected 2026-07-15 literals are evidence, not eternal API.
4. **Optionality:** the design has two explicit states, not silent fallbacks:
   the complete credential-free public root and an explicitly invoked
   integration capability with an exact source tuple. Unknowns become failing
   probes or blockers, never partial source substitution.
5. **Rules tier:** screen every cycle against `RULES_INDEX.md`, especially
   replace-don't-bridge, verify-don't-trust, no-IO tests, strict package
   boundaries, and consolidate-at-second-consumer.

## Lifecycle Triggers

This cross-repository plan follows
[Lifecycle Triggers](../../../plans/templates/components/lifecycle-triggers.md):

1. Start each execution session with `oak-start-right-thorough`; inspect live
   claims, directed messages, collaboration logs, source heads, and the serving
   thread.
2. Promote this plan from `current/` to `active/` only when implementation
   starts; its todo list is the execution work shape.
3. Open repository- and path-specific claims before every edit, including the
   source repositories through their own join ceremony.
4. Record source tuple, ownership, conflict, direction, and reviewer changes in
   the serving thread during work.
5. At handoff, close claims, transfer every residual boundary explicitly,
   refresh continuity, and run the consolidation trigger check.
6. On completion, run deep consolidation and archive per ADR-117; no useful
   slice is reported as whole-plan completion.

## Readiness Review Record

The original three-Oak-source shape completed plan-phase review on 2026-07-15:

- **Assumptions/proportionality — APPROVE.** Initial findings required the
  OpenAPI → Database-Tools → earned core → ontology sequence, Dependabot
  evaluation, correct GitHub identity classification, detached-consumer versus
  authoring states, per-wrapper CI, and tracked ontology output. All were
  incorporated; the final re-review found no remaining blocker.
- **Architecture/security — APPROVE.** Initial findings strengthened private
  source isolation, workspace/lockfile/lifecycle proof, upstream-first patch
  policy, pin retention, Database-Tools resource/environment/process ownership,
  ontology known-answer evidence, cache inputs, and the fresh-runner write-token
  boundary. The final re-review approved every disposition.
- **Docs/onboarding — APPROVE.** Report/plan authority was separated; wrapper
  READMEs now co-land with interfaces; Database-Tools safety is visible at the
  family entry; public-checkout wording and indexes are consistent; new local
  links resolve.
- **Owner requirement — incorporated.** Oak OpenAPI and Database-Tools are
  currently private. Their local checkouts remain opt-in, and INT-00 makes the
  credential-free, no-private-submodule public path a completion invariant.
- **Owner Castr requirements — incorporated.** Castr
  is the correct name; its checkout is optional but source-first for rapid OCE
  capability development. The end state deletes the adapter and other direct
  OCE OpenAPI dependencies, leaving the released Castr compiler family as the
  ordinary public-root boundary and the submodule as the explicit authoring
  mode.
- **Castr amendment assumptions/proportionality — APPROVE.** Revisions preserve
  core `@engraph/castr` as compiler-only, place generic transport in a separately
  preflighted companion, retain Oak policy in OCE, make publication authority a
  blocker, split convergence into atomic slices, and let the Database-Tools
  proof depend only on the source-mode TypeScript writer.
- **Castr amendment architecture/security — APPROVE.** Revisions prevent
  public-root deletion before atomic cutover, require post-Phase-1 contract
  readiness, byte-identical mode output, strict-peer and packed-manifest proof
  with no `openapi-fetch` declaration, complete configuration/API deletion,
  explicit dirty-authoring semantics, and retained parent pins.
- **Castr amendment docs/onboarding — APPROVE.** The future wrapper runbook is
  clearly non-runnable until WS2.1, command modes and naming align, Castr casing
  is consistent, status/discoverability surfaces agree, and local links resolve.

Any further material change to this solution class reruns the affected
readiness review.

## Source Evidence

- [Architecture report](../../../reports/oak-integrations/submodule-wrapped-oak-source-integrations-report-2026-07-15.md)
- [Castr source integration report](../../../reports/oak-integrations/castr-source-integration-report-2026-07-15.md)
- [OCE requirements for Castr](../../sector-engagement/castr/README.md)
- [Castr ADR-043 core/companion boundary](https://github.com/EngraphCode/castr/blob/4be99dae5d8b0c24e4f22436b856b592637dc9d1/docs/architectural_decision_records/ADR-043-core-vs-companion-workspaces.md)
- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)
- [npm provenance](https://docs.npmjs.com/generating-provenance-statements/)
- [Git submodule documentation](https://git-scm.com/docs/git-submodule.html)
- [GitHub Dependabot supported ecosystems](https://docs.github.com/en/code-security/reference/supply-chain-security/supported-ecosystems-and-repositories)
- [GitHub workflow token scope](https://docs.github.com/en/actions/concepts/security/github_token)
- [GitHub App authentication in workflows](https://docs.github.com/en/enterprise-cloud@latest/apps/creating-github-apps/authenticating-with-a-github-app/making-authenticated-api-requests-with-a-github-app-in-a-github-actions-workflow)
- [GitHub checkout action](https://github.com/actions/checkout)
- [Turborepo task configuration](https://turborepo.com/docs/crafting-your-repository/configuring-tasks)
- [OpenAPI pipeline authority boundary](../../../../docs/architecture/openapi-pipeline.md)
- [Reusable curriculum architecture reports](../../../reports/oak-reusable-curriculum-architecture/README.md)
