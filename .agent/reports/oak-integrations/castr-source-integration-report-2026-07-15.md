---
title: Castr source integration
status: complete
date: 2026-07-15
sources:
  castr: 4be99dae5d8b0c24e4f22436b856b592637dc9d1
---

# Castr Source Integration

## Review Contract

**Purpose and intended impact:** explore how this monorepo should collaborate
with Castr while Castr gains the functionality required by the Oak Open
Curriculum Ecosystem (OCE). The review must preserve a rapid local edit,
generate, and verify loop without making Castr source a prerequisite for using
this public repository.

**Questions for review:**

1. Does the shape let an implementer edit Castr locally and immediately exercise
   those edits against OCE's real code-generation contract?
2. Is the stable boundary an Oak-owned command and artefact contract rather
   than Castr's changeable internal filesystem or unpublished package shape?
3. Does the ordinary public clone remain complete when the Castr checkout is
   uninitialised?
4. Can useful Castr changes flow through short-lived upstream branches to
   `main`, without a permanently diverging OCE integration branch?

**Evidence standard and authority boundary:** findings come from the public
`EngraphCode/castr` repository at the commit above, its manifests, source,
tests, workflows, and recent pull-request history; this monorepo's current
OpenAPI/codegen pipeline and Castr requirements estate; and live GitHub and npm
registry checks on 2026-07-15. The inspected source proves repository state,
not a published release or future API.

**Non-goals:** this report does not add a submodule, change Castr, publish a
package, remove the current OpenAPI adapter, or decide that every Castr consumer
must use a source checkout.

**Successful review:** a reviewer can distinguish ordinary OCE work, active
Castr/OCE co-development, upstream release proof, and generated-contract
consumption; every state has explicit commands, provenance, and failure
semantics.

## Exploration Synthesis

The central need is not dependency installation. OCE is a design partner for
functionality that Castr does not yet provide, so the shortest useful feedback
loop is:

```text
edit Castr source
  -> run Castr's focused tests/build
  -> generate the OCE contract through the parent wrapper
  -> verify generated output and OCE behaviour
  -> repeat
```

The evidence therefore supports a **source-first development integration**:
an optional public Castr submodule inside a private parent pnpm workspace. The
submodule remains its own pnpm/Turbo repository and is deliberately absent from
the parent workspace graph. The parent wrapper invokes only named Castr build,
generation, and verification operations and exposes generated artefacts to OCE.
It does not make the Castr package a `workspace:*`, `link:`, or filesystem
dependency of ordinary OCE packages.

This gives the two repositories different stable surfaces:

| Surface | Role | Stability promise |
|---|---|---|
| `integrations/castr/package.json` | OCE entry point | named scripts and refusal semantics remain stable |
| `integrations/castr/upstream/` | locally editable Castr source | pinned by gitlink; internals may change |
| generated Castr/OCE contract | hand-off to OCE codegen and tests | deterministic, validated, provenance-bearing |
| `@engraph/castr` package | ordinary public-root compiler after cutover | compiler/IR/parsers/writers only; not the rapid authoring loop |
| proposed `@engraph/castr-fetch` companion | generic typed-fetch building blocks after cutover | separate Castr-owned transport companion; exact npm name and authority must pass preflight |
| OCE SDK client layer | Oak-specific runtime policy | retains auth, retry, rate-limit, and response-augmentation policy without `openapi-fetch` |

The parent `package.json` is a stable interface to a changeable child, but its
stability is behavioural rather than a promise to preserve child paths. The
wrapper owns how it invokes Castr and translates outputs. OCE consumers receive
an explicit generated file or bundle and never import from `upstream/src` or
`upstream/dist`.

## Raw Observations

### Repository and distribution state

- `EngraphCode/castr` is public, is not a fork, and uses `main` as its default
  branch.
- At the inspected commit it is a Node 24, pnpm 11.8, Turborepo repository with
  `lib` and `agent-tools` workspaces. That currently matches this monorepo's
  Node and pnpm declarations, but the integration must not rely on permanent
  version equality.
- `lib/package.json` declares the public package `@engraph/castr` at `1.18.3`,
  an exported API, and a `castr` CLI. It also has strict packaging checks.
- Castr currently declares `openapi-fetch` as an optional peer dependency, but
  accepted Castr ADR-043 explicitly keeps typed clients, retry, middleware, and
  runtime transport out of core `@engraph/castr`. Replacing OCE's
  `openapi-fetch` usage therefore requires a separate generic Castr companion
  (proposed package name `@engraph/castr-fetch`) or an explicit architecture
  re-decision. Oak-specific auth, retry, rate-limit, and response-augmentation
  policy remains in OCE. Moving `openapi-fetch` behind core Castr would not
  satisfy the boundary or the replacement goal. The cutover proof must inspect
  packed manifests and remove every `openapi-fetch` dependency, peer dependency,
  and optional-peer metadata entry from both core and companion packages.
- A live npm registry query returned `404 Not Found` for `@engraph/castr`, and
  GitHub exposed no releases. The manifest and README are publication intent,
  not present distribution.
- Castr's recent history is active and upstream-oriented: small feature branches
  are merged to `main` through pull requests. Because the owner controls the
  repository, OCE-specific enabling work can usually become general Castr
  capability with low coordination cost.

### Existing OCE contract

- OCE already owns a substantial Castr requirements and fixtures estate under
  `.agent/plans/sector-engagement/castr/`.
- The current production path still uses
  `packages/core/openapi-zod-client-adapter`, consumed by
  `packages/sdks/oak-sdk-codegen`. That adapter is explicitly intended to be
  replaced only after side-by-side Castr validation succeeds.
- Castr's current CLI is built to `lib/dist/cli/index.js`. A wrapper can build
  and run that public CLI without linking Castr into the parent dependency
  graph.
- Tests must not consume `.agent/` as runtime test data. When implementation
  begins, the approved contract fixtures needed by automated product tests must
  move or be copied deliberately into a product-owned fixture surface; the
  planning estate remains the explanatory authority.

### Current OpenAPI replacement ledger

The intended end state is larger than adapter replacement. A live manifest and
import scan found these direct third-party OpenAPI capability dependencies:

| Declaration and consumer | Current role | Target owner before deletion |
|---|---|---|
| `packages/core/openapi-zod-client-adapter/package.json`: adapter workspace plus `openapi-zod-client`; consumed by `packages/sdks/oak-sdk-codegen`; registered in `pnpm-workspace.yaml` and `knip.config.ts` | Zod generation, endpoint extraction, Zod v3-to-v4 conversion | core `@engraph/castr` Zod v4 writer and metadata output |
| `openapi3-ts` in the adapter's peer/dev declarations and `packages/sdks/oak-sdk-codegen/package.json`, with broad codegen/test imports | OpenAPI 3.1 document, schema, path, operation, and response types | core `@engraph/castr` validated document/IR types at OCE seams |
| `openapi-typescript` in `packages/sdks/oak-sdk-codegen/package.json` and its type-generation code | generated path/client TypeScript types | core `@engraph/castr` TypeScript writer output |
| `openapi-fetch` in `packages/sdks/oak-sdk-codegen/package.json` and generated client templates | generated client shape and types | generic `@engraph/castr-fetch` companion building blocks |
| `openapi-fetch` in `packages/sdks/oak-curriculum-sdk/package.json`, base client, middleware, tests, and public client aliases | runtime fetch client and middleware protocol | generic companion hook/transport seam; Oak auth, retry, rate-limit, serialisation, augmentation, and public API policy stay OCE-owned |
| `@asteasolutions/zod-to-openapi` in `apps/oak-search-cli/package.json`, with no source import found and a Knip ignore | apparently stale reverse-generation declaration | delete as stale; if live use is later proved, route a separately reviewed code-first companion per Castr ADR-043 |

The success condition is not that no package name containing `openapi` remains
anywhere in the lockfile. Castr may itself use parser/type libraries, and
unrelated tools such as GitHub SDKs have OpenAPI-derived transitive packages.
The meaningful condition is that OCE manifests use the Castr compiler family as
the direct generic OpenAPI implementation boundary: core `@engraph/castr` plus
only the named transport companion justified by Castr ADR-043. Oak policy stays
in OCE without third-party OpenAPI implementation imports. Every other
OpenAPI-named occurrence is Castr-transitive or explicitly classified as
unrelated.

This makes package publication a mandatory cutover prerequisite even though it
is not the preferred authoring loop. Before cutover, the current stack remains
the public-root path while source Castr is developed and validated side by
side. At cutover, released core and companion packages give contributors a
complete root install and codegen path without the submodule. The optional
source wrapper provides an explicit source mode with output parity against the
released mode; there is no implicit fallback between them. This remains blocked
until npm scope/package ownership, publish authority, trusted/provenance
publishing, and a named release owner are verified.

### Public-repository constraint

Castr itself is public, but its source checkout must still be optional. Making
the submodule mandatory would add a nested repository, install, build, and
quality-gate cost to every contributor. It would also couple root behaviour to
a rapidly changing external source tree. The complete default state is
therefore an uninitialised Castr submodule with no root lifecycle traversal.

## Problem Frame

### Gap

OCE cannot yet validate missing Castr functionality in the place where it will
be used without either copying work between sibling checkouts or waiting for a
package publication cycle. The former is non-reproducible; the latter makes the
design feedback loop needlessly slow while the contract is still forming.

### Harm

- Castr changes can pass isolated tests yet miss OCE's required OpenAPI,
  generated-code, metadata, or type-discipline behaviour.
- Package-only iteration introduces version, publication, installation, and
  lockfile steps between a source edit and its first OCE proof.
- A direct filesystem dependency would improve speed but leak Castr internals
  into OCE, make an absent checkout an install failure, and blur repository
  authority.
- A long-lived OCE branch in Castr would accumulate avoidable divergence even
  though upstream contribution is easy.

### Causal mechanism

The repositories have a productive but currently informal co-development
relationship. The missing mechanism is a reproducible local seam that is
editable on the Castr side and contract-bound on the OCE side. Source identity,
command invocation, generated output, and consumer proof need to be joined;
package installation alone joins only release distribution to consumption.

## Solution-Class Reflection

| Candidate | Feedback speed | Public-root optionality | Boundary quality | Verdict from evidence |
|---|---:|---:|---:|---|
| Published package only | low while capability is forming | strong | strong after release | required steady-state distribution, not primary authoring path |
| Root `link:`/workspace dependency on Castr | high | weak | weak; leaks nested graph and paths | reject |
| Sibling checkout discovered by host-local path | high | weakly reproducible | weak; machine-local | reject |
| Copy Castr source into OCE | high | strong | breaks source authority | reject |
| Optional submodule plus command/artefact wrapper | high | strong when isolated | strong | selected by the linked plan |

The submodule is not valuable because it makes Git exotic. It is valuable
because the parent commit can name the exact editable source baseline while the
child remains a normal Git repository. An authoring command may permit a clean,
attached `feat/oce-*` branch or a dirty authoring tree so an edit can be tested
before commit. Dirty authoring provenance records the base commit plus a
deterministic content/patch hash. Dirty state and direct mutation on Castr
`main` are forbidden in CI, release, and parent-pin updates. A consumer or CI
command requires the exact detached pin. Those states must be reported rather
than silently normalised.

## Proposed Integration Contract

The linked implementation plan should create:

```text
integrations/castr/
  package.json             private OCE workspace and stable command surface
  README.md                states, workflow, authority, and failure guidance
  src/                     source-state, invocation, and provenance adapter
  test-fixtures/           product-owned minimum OCE contract fixtures
  generated/               deterministic contract output where tracking is chosen
  upstream/                optional public Castr Git submodule
```

The minimum interface is:

- `source:status` — report unavailable, exact pinned consumer, or attached
  authoring state;
- `source:bootstrap` — initialise the submodule explicitly and install Castr
  using Castr's own package-manager declaration and lockfile;
- `castr:build` — run the named child build only;
- `contract:generate:source` — invoke the built source-checkout Castr CLI
  against explicit OCE input and output locations;
- `contract:generate:released` — invoke the released package surface against
  the same contract after publication;
- `contract:verify` — validate deterministic output, schema/type discipline,
  and provenance without importing child internals;
- `contract:parity` — compare source and released modes for the same Castr
  commit without silently falling back between them;
- `test:contract` — compose the focused Castr and OCE proof;
- `package:verify` — later pack/install the same Castr revision in a clean
  consumer to prove the release surface without becoming the local loop.

No script forwards an arbitrary child command. Direct Castr development remains
available by entering the submodule, but that is explicitly Castr authoring,
not part of the wrapper's compatibility promise.

## Branch and Update Model

Castr does not need a standing OCE integration branch. A change starts from the
pinned or latest reviewed `main`, uses a short-lived feature branch in the
submodule, and runs both Castr-native tests and the parent contract proof. The
change is then merged upstream to `main`; the parent gitlink advances to the
merged commit in a separate reviewable OCE change.

During active co-development the parent may temporarily point at, or an
authoring checkout may be ahead of, a feature-branch commit. Provenance and CI
must say so. The completion state is an upstream-reachable commit and a parent
gitlink update, not a permanently floating branch. Upstream `main` updates are
merged into the short-lived feature branch when needed; conflicts stop for
human resolution. A feature-branch pin may exist locally or on an unmerged OCE
pull request. A merged parent commit points to merged Castr `main` or to an
explicit immutable retained ref satisfying the reachability contract; it never
depends only on a deletable feature branch.

## Cutover and Deletion Contract

Castr capability lands as small upstream slices, but OCE does not finish in a
permanent dual-stack state. Side-by-side comparison is a migration technique
with an exit condition. The final cutover must:

1. prove source-built and released-package Castr produce byte-identical OCE
   contract files for the same commit and inputs; compare mode-specific
   provenance separately;
2. move compiler capabilities into core `@engraph/castr`, generic typed-fetch
   building blocks into the approved companion, retain Oak runtime policy in
   OCE, and prove reverse-generation declarations unused or route them through a
   separately reviewed companion;
3. switch ordinary OCE codegen to the released Castr compiler family and remove
   third-party OpenAPI runtime imports from the generated and Oak client layers;
4. retain the optional submodule wrapper as the explicit rapid authoring mode;
5. delete `packages/core/openapi-zod-client-adapter` and remove the direct
   dependencies in the replacement ledger from OCE manifests and lockfile;
6. run a repo-wide import/manifest scan and classify any remaining OpenAPI-named
   package as Castr-transitive or unrelated.

Future third-party replacements may follow this model when Castr has a coherent
reason to own the capability. They require a named current dependency, an
authority argument, behavioural parity, a deletion target, and an upstream
Castr contract. This report does not turn a possible consolidation direction
into permission for speculative rewrites.

## Relationship to the Other Source Integrations

Castr belongs in the same integration family because it is pinned source behind
a stable parent contract, but it has a different reason for existing. Oak
OpenAPI and Database-Tools are private authorities that must remain optional;
Castr is a public, rapidly co-developed compiler whose local edit loop is the
value. Ontology is a generation-time semantic source.

The useful implementation sequence becomes:

1. prove the optional-wrapper mechanics with Oak OpenAPI;
2. add Castr's source-first wrapper and prove OpenAPI-to-generated-output
   iteration;
3. extract the genuinely shared gitlink/provenance core at the second wrapper;
4. add the refusal-first Database-Tools laboratory and extend the vertical proof
   through Database-Tools → OpenAPI → Castr → generated OCE behaviour;
5. add the ontology projection and then automate independent updates.

This order earns the shared mechanism earlier and makes the database vertical
exercise the intended generator rather than the adapter already scheduled for
retirement.

## Warrants, Falsifiers, and Review Triggers

| Claim | Warrant | Falsifier or re-review trigger |
|---|---|---|
| Source-first is proportionate | OCE must drive missing Castr capability and upstreaming is low effort | Castr stabilises and releases so rapidly that source edits cease to be normal |
| The checkout can remain optional | wrapper is explicit and generated outputs decouple ordinary consumers | root install/build/test requires `upstream/` or its lockfile |
| A stable wrapper can tolerate changing Castr internals | only named commands and artefacts cross the boundary | OCE imports Castr source/dist paths or relies on private symbols |
| No long-lived branch is needed | repository is controlled and recent changes merge through small PRs | upstream declines or repeatedly delays generally useful OCE-enabling changes |
| Package publication is required for cutover | public-root install and codegen cannot require the optional submodule | OCE deliberately changes its public-root completeness contract |
| The Castr compiler family should replace the direct generic OpenAPI stack | the owner intends one ecosystem boundary and Castr ADR-043 supplies a core/companion split | a named capability is shown to belong to Oak policy or a different authority and is explicitly retained |

## Related Surfaces

- [Oak integrations report family](./README.md)
- [Oak source integration implementation plan](../../plans-backlog-2026-07/architecture-and-infrastructure/current/oak-source-integration-workspaces.plan.md)
- [OCE requirements for Castr](../../plans-backlog-2026-07/sector-engagement/castr/README.md)
- [Castr repository](https://github.com/EngraphCode/castr)
- [Castr ADR-043: core compiler and companion workspaces](https://github.com/EngraphCode/castr/blob/4be99dae5d8b0c24e4f22436b856b592637dc9d1/docs/architectural_decision_records/ADR-043-core-vs-companion-workspaces.md)
- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)
- [npm provenance](https://docs.npmjs.com/generating-provenance-statements/)
