---
id: oak-open-curriculum-mcp-extraction
node_type: delivery
name: "Extract the MCP app product into oak-open-curriculum-mcp"
overview: >-
  Cut the Oak MCP product out of this repository along the line that runs
  through every workspace it touches — the thin product slice above, the
  reusable and Oak-org parts below — and assemble the slices in the public
  repository oaknational/oak-open-curriculum-mcp, aimed at junior developers,
  building from registry dependencies alone and rarely needing this
  repository; everything below the line stays here and is published.
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: toolkit-re-architecture
impact_areas:
  - packaging-and-distribution
  - practice-and-estate
  - guidance-content
tickets:
  - MCP-661
depends_on:
  - plan: public-packages-release
    kind: beneficial
owner_gates:
  - awaiting: owner-decision
    clears_when: >-
      The owner ratifies the design record slice D0 produces — the per-box
      dispositions under the five-class test, the target workspace set of the
      new repository, the thinness ceilings, the finish list, and the search
      instance boundary — or amends it on the ticket.
    expires: 2026-09-23
  - awaiting: owner-decision
    clears_when: >-
      The owner confirms on the ticket the two org-level prerequisites this
      plan cannot supply — publish rights for the @oaknational npm scope from
      this repository's release workflow, and the creation of the public
      repository oaknational/oak-open-curriculum-mcp — or names who holds them.
    expires: 2026-09-23
  - awaiting: owner-decision
    clears_when: >-
      The owner names the production deploy project and DNS for the new
      repository's MCP server on the ticket, so that the cut-over slice has a
      target.
    expires: 2026-09-23
last_updated: 2026-09-02
---

# Extract the MCP app product into oak-open-curriculum-mcp

## Goal

The Oak MCP product — the MCP server and its search instance (the owner's
ruling: "the search app is effectively part of the MCP app") — lives in the
public repository `oaknational/oak-open-curriculum-mcp` as a small set of thin
workspaces made of the product's configuration, content and domain logic over
published packages, and builds, tests and deploys there from registry
dependencies alone. Every aspect of that repository is aimed at junior
developers (§Decision log, rulings 7 and 8), with a minimal, streamlined
Practice of its own, and the need to touch this repository is rare by
construction and junior-safe when it happens (ruling 13), because this
repository is not suitable for junior developers. Everything reusable, and
everything Oak-wide, stays in this repository and is published to the
`@oaknational` scope: the toolkit, the curriculum and MCP-family machinery, the
Oak corpus and Oak's curriculum types, the design system and Oak's identity
pack, the demos, the Practice and all agent tooling. A product squad makes
significant product changes in the new repository without touching this one.
The owner's purpose, verbatim: "to hand over a maintainable surface for the
'MCP App' to a squad, without burdening them with the agentic engineering
material or the libraries etc. ... the new repo must be functional, if devs
need to come to this repo to make significant changes that is a problem. We
are in no way constrained to the workspaces we happen to have today, I am
expected multiple workspaces to be split, including non-app workspaces" (sic).

This is rung 2 of the demonstration ladder `toolkit-re-architecture` sets ("an
extracted squad consumes it from the registry — the extraction test is an oak
product workspace building in a fresh repo from registry dependencies alone"),
made the product rather than a rehearsal, and the first run of a lifecycle:
products are born here, thin by construction on the toolkit, and leave at
handover. It is not a move of today's workspaces: today's apps are mechanism
with a thin product layer inside them (§Evidence), and a move would hand junior
developers the mechanism.

## User groups and value

- **The product squad.** A repository they own end to end: the product's
  configuration, content and domain logic in a few thin workspaces, with
  every mechanism and every Oak-wide asset arriving as a versioned package
  they never edit. In experience terms: a product change is one PR in one
  repo with its own release; an upstream need is an issue on this repository,
  fixed and released here, and picked up there as a dependency-update PR.
  Claim boundary: the dip rate (AC8) — how often the squad needs anything
  from this repository — measured after cut-over, with the change-class map
  of the last quarter (D0) as the authoring-time estimate.
- **Junior developers on the squad — the audience every aspect is aimed at.**
  A repository a junior developer can clone, run, change and release without
  a senior in the loop: one documented path per common task, a check behind
  each rail with a message that says what to do next, as few workspaces and
  concepts as the product needs, no mechanism to maintain, no fleet or estate
  machinery to learn, and one documented way to say "this is upstream".
- **Agents in this repository, as the platform.** The reusable and Oak-wide
  packages the product depends on are finished before the product leaves and
  maintained here afterwards under the upstream contract (§Rare dips by
  construction): an issue arrives, agents fix and release, the product's bot
  opens the update. All agent tooling stays here for that reason (ruling 6).
- **The owner.** Cost of change on both sides: the product's change surface
  becomes the squad's; the toolkit's generality stops being asserted and is
  demonstrated by a real registry consumer, and shaped against two more apps
  (§The three apps).
- **Teachers using Oak's product daily.** No change to the served surface at
  cut-over; the value routes through the squad's cycle time afterwards and is
  claimed there, never here.
- **Future non-Oak builders.** A published toolkit with an MCP server
  framework, a search framework and an app template that did not exist as
  packages before. Offered value only: rung 3 (a greenfield non-Oak service)
  remains the honest test and is out of this plan's scope.

## Mechanism

### The model — one line through every box, three bands

The owner's diagram (2026-09-02, at this seat; ruling 11): every workspace the
product touches is a box with a dotted line through it. Below the line is the
reusable part; above it is the Oak slice — Oak-specific configuration or Oak
domain logic, different in size per box, always thin, often zero at the lower
tiers. The design thought experiment of the same hour (ruling 13) splits the
Oak slice in two: Oak-the-organisation (brand, privacy posture, attribution,
Oak's curriculum types and corpus, the Practice story), shared by every Oak app
and owned here; and Oak-the-product (this app's configuration, content and
domain logic), owned by the squad. Only the product band leaves. The new
repository is the union of the product bands; this repository is everything
else, published.

### The three apps — the classification every piece takes

The thought experiment names three apps: the Oak MCP product (extracted — rung
2), a second Oak app, a homework app (in this repository — rung 1), and a
library service built with the Innovation Kit that is not an Oak app (in this
repository — rung 3). For every piece of the estate the product touches, two
questions classify it: which of the three need it, and who changes it when it
changes.

| Class | Needed by | Changed by | Home |
| --- | --- | --- | --- |
| Toolkit | all three | agents here | this repository, published |
| Curriculum toolkit | the two curriculum apps | agents here | this repository, published |
| MCP-family toolkit | the MCP product now; any app that exposes an MCP surface later | agents here | this repository, published |
| Oak-org packs | the two Oak apps | agents here | this repository, published as packs (licensed by class) |
| Product | one app | the squad | the product repository |

Toolkit: observability, error reporting, logging, the env mechanism, feature
flags and surface gating, the analytics client and its allowlist enforcement,
the design-system framework, the app shell and deploy conventions, the search
framework. Curriculum toolkit: the generic curriculum client, the codegen
pipeline. MCP-family toolkit: the server framework, OAuth-for-MCP, the widget
kit, the conformance harness. Oak-org packs: Oak's curriculum types and API
configuration, the Oak corpus and its vocabulary, synonyms and ground truth,
the identity pack, the privacy and PII posture, the analytics allowlist,
attribution text, the Practice tour. Product: the served surface, the MCP tool
definitions and guidance content, the search instance, auth and env values,
the app's own event names and SLOs.

### The decision per box — taken once, on evidence

Not every box is cut (ruling 12). Each workspace the product touches takes one
of three dispositions at the design slice (D0), with the measurement recorded:

- **split** — the product band is thin and separable: it moves; the rest stays
  here and publishes in its class;
- **stay whole, publish** — the product band is zero or too thin to be worth a
  seam: the workspace stays here as it is and publishes in its class;
- **move whole** — the box is product configuration or content through and
  through, and nothing that stays consumes it.

A box whose product band is thick and inseparable is the Atlas's falsifier for
that box (a true hybrid): it stops the line for that box and is remeasured,
never forced. The two apps are the only boxes where the split is mandatory,
because the product is their product band. The census
(`.agent/reports/workspace-classification-census/matrix.md`, the one-time
migration map `toolkit-re-architecture` names), the co-change of the last
quarter and the line counts of §Evidence are the evidence; the five-class test
is the rule. This is the Atlas's per-package classification used once as a
migration map, never as a standing activity.

### Search — infrastructure, corpus, instance

The homework app would have semantic search on Elasticsearch Serverless,
populated from the same Oak data, with no need to share a service or an index
(ruling 13). That settles what search is at each band:

| Piece | Class | What a second app does differently |
| --- | --- | --- |
| Serverless client, retries, auth, observability wiring | toolkit | nothing |
| Index lifecycle: create, version, alias, roll over, verify | toolkit | its own names and versions, by configuration |
| Ingestion runtime: fetch, transform, embed or ELSER, bulk write | toolkit | nothing |
| Hybrid retrieval, fusion, query building, caching | toolkit | its own weights, boosts and cache policy |
| Evaluation and benchmark harness, diagnostics | toolkit | runs against its own index |
| Command shell for admin, ingest, evaluate, observe | toolkit | its own command set from the same shell |
| The Oak corpus: bulk download, the canonical document model, Oak's curriculum types, vocabulary and synonyms, ground-truth query sets | Oak-org pack | consumes the same versioned pack |
| The index: mapping, embedded fields, chunking, included content, retrieval profile, scopes, schedule, credentials, SLOs, search events | product (instance) | all of it |

Data preparation is org infrastructure and indexing is instance: the Oak corpus
is built once, here, as a versioned pack both instances ingest from, so the
normalisation never forks; each app owns its index lifecycle end to end from
its own thin configuration through the published framework; whether two
instances share a Serverless project is an operational choice per instance,
and sharing an index is the hidden coupling to avoid. Ground truth is org data
and results are instance data, which keeps instances comparable. The search
app that goes with the MCP product is therefore its search instance —
configuration and commands, thin — and ruling 1 holds as given. The Serverless
specifics (project per app or shared, ELSER deployment per index, quota shape)
take the estate's Elasticsearch expert at D0.

### First cut per box (the design slice ratifies or overrides each)

| Box | Stays here (class) | Product band (moves) | First cut |
| --- | --- | --- | --- |
| MCP server (`apps/oak-curriculum-mcp-streamable-http`) | server framework, OAuth-for-MCP, widget kit, observability and logging glue, landing page, asset download (MCP-family and toolkit) — ~19,800 hand-written lines | served surface, under-the-hood tour, generated tool metadata, auth and env values, the widget's product UI — ~700 lines plus configuration | **split** (mandatory) |
| Search CLI (`apps/oak-search-cli`) | ingestion runtime, index lifecycle, diagnostics, evaluation harness, command shell (toolkit); the Oak data adapters and document model (Oak-org, into the corpus pack) — ~31,500 hand-written lines between them | the MCP search instance: index configuration, scopes, schedule, its commands composed from the shell | **split** (mandatory), three ways |
| Curriculum SDK (`packages/sdks/oak-curriculum-sdk`) | generic client, config, validation (curriculum toolkit) — ~3,400 lines; Oak's curriculum types and API configuration (Oak-org pack) | the MCP tool layer, guidance resources and agent-support metadata — ~8,500 lines, co-changing with the app above everything else (379 touches) | **split**, three ways; D0 measures how much of the tool layer thins to configuration and generated code |
| Search SDK (`packages/sdks/oak-search-sdk`) | retrieval and admin machinery (toolkit) — most of ~8,500 lines; Oak index contracts, scopes and synonyms (Oak-org, into the corpus pack) | the MCP instance's retrieval profile and scopes | **split**, three ways |
| Codegen chain (`packages/sdks/oak-sdk-codegen`, with `search-contracts`) | the OpenAPI-to-types, Zod and MCP generation pipeline (curriculum toolkit); the Oak schema cache and generated Oak artefacts (Oak-org) | the product's generation configuration, if any remains | **split** along ADR-108's own line; nineteen consumed subpaths, so a per-subpath table first |
| `graph-corpus-sdk` | the corpus substrate (toolkit); the Oak curriculum subpath (Oak-org) | none | D0 decides; stays whole and publishes if the split is not worth a seam |
| Libs and core (`result`, `type-helpers`, `observability`, `safe-path`, `graph-core`, `openapi-zod-client-adapter`, `env-resolution`, `sentry-node`, `workspace-config`, `env`, `logger`, `build-metadata`, `oak-eslint`) | all of it (toolkit); Oak defaults that are Oak-wide become org configuration | per-app values: Oak env contracts, one default sink path, release-policy wording, the lint exception list | **stay whole, publish**; four small relocations (R1–R4) |
| `posthog-node` | the client and allowlist enforcement (toolkit); the Oak allowlist and privacy posture (Oak-org pack) | the product's own event names | **split**, three ways |
| Design tier (`oak-design-system`, `oak-design-tokens`, `oak-design-assets`, `design-tokens-core`) | the framework (toolkit); the Oak identity pack (Oak-org), shared with the demos and the homework app | none | **stay whole here, publish** |
| Demos (`oak-curriculum-hub`, `oak-design-showcase`) | — | — | stay (ruling 9) |

Outside the product's closure and untouched by this plan: `agent-tools`,
`fidelity-review`, `graph-ingest`, `graph-project`, `oak-design-ink`,
`oak-design-react`.

### Designed for junior developers — the constraint on every slice

The owner's requirement (ruling 8) binds the whole new repository, not one
slice. Each slice that touches it answers the same question before it lands:
could a junior developer, new to the product, do this task from the repository
alone?

- **Structure.** As few workspaces as the product needs, decided at D0 with
  the junior test as the criterion, and a thinness ceiling per workspace
  (hand-written, non-test, non-generated lines) recorded in the design
  record; the counts are reported at cut-over and re-measured on every
  release.
- **One app shape.** The new repository is an instance of the app template
  this repository's own apps use (§Scaffold): the same CI, deploy,
  observability wiring, flags, design-system consumption and README shape,
  so there is one documented way to build an app on the toolkit and the two
  repositories cannot drift apart.
- **Tooling.** Standard, widely documented tools in their default shapes
  (pnpm, turbo, ESLint from the published preset, Vitest, Playwright,
  semantic-release), configured once at the root; no bespoke wrappers, no
  hook chains that need explaining; every script named for what it does; a
  dependency-update bot so releases from here arrive as small PRs.
- **Checks and messages.** Every failing check says what failed, why it
  matters and what to do next, in plain language; a red check is a teaching
  moment, never a puzzle.
- **Documentation.** A README that gets a junior from clone to a running
  server in the fewest steps; a contributor guide that walks one change end
  to end, including the "this is upstream" path; the app tour of
  oak-under-the-hood written for the same reader.
- **Practice.** Minimal and on the rails (§Agent tooling stays here); each
  rule short, each skill a single path; nothing that presumes the estate.

### Rare dips by construction

Dips into this repository must be rare, not merely cheap, because a junior
developer cannot make them at all. Three mechanisms make them rare and one
makes the rare ones safe:

- **Knobs by construction.** Everything that varies with the product — tool
  definitions, guidance content, the search instance, auth and env values,
  event names, SLOs, themes — lives in the product band as configuration or
  content over a published extension point. D0's change-class map classifies
  the last quarter's app changes by kind and checks each lands in the product
  band under the design; a class that does not is a missing extension point,
  fixed here before the move.
- **Oak-wide assets are platform work.** A curriculum-API schema refresh,
  a corpus rebuild, an identity change or a privacy-posture change is done
  here by agents and reaches the product as a version bump; the squad never
  regenerates types or ingests the corpus.
- **Finish before extracting.** Every package the product repository will
  depend on reaches the finishable bar (the Atlas's Change 1: a finished
  foundation, adopted where the ecosystem's canonical form exists, owned to
  the charter bar where nothing external serves) before cut-over; D0's finish
  list names each package and its status, and F1 works the list. A finished
  foundation rarely changes; an unfinished one is a dip generator.
- **The upstream contract.** The product repository's Practice carries one
  rule for the rare dip: "this is upstream" means an issue on this repository
  from a template; agents here fix and release; the product's bot opens the
  update PR. The junior's escape hatch is a version pin or a rollback, never
  a visit here. This repository commits to that response path as its platform
  contract, which is what all agent tooling staying here is for.

### Thin in place, then move the thin thing

Each cut lands here first, where the suites and CI already run: the reusable
or Oak-org part of a box becomes a published package and the box consumes it
in place, proven by the box's existing tests and by the MCP conformance check;
the box gets thinner in this repository, slice by slice, until what remains is
the product band. Only then does the band move — by a history-preserving
export of the files it is made of (`git filter-repo` per path) — into the new
repository's thin workspaces, and the extraction test proves the assembly
builds from the registry alone. The retirement PR here for each move removes
the moved paths from the workspace globs, `turbo.json`, `knip.config.ts`, the
root scripts and `.releaserc.mjs` (whose npm plugin entries and git assets
name the curriculum SDK's path today), in the same PR, so every intermediate
state builds in both repositories. The order is bottom-up: the libs and core
publish as they are; the SDK and codegen boxes cut per D0; the corpus pack is
built; the two apps' big extractions follow; the finish list closes; the
product bands move last, together.

### Publish first

Nothing the product depends on is published today (one closure member carries
a publishable manifest; none is on the registry). Everything below the line
publishes from this repository under ruling 3, "one release version per repo
for now": every published package ships at this repository's semantic-release
version, from the existing release workflow. The mechanics that ruling does
not settle, each carried by a slice:

- **Stamping.** The release configuration bumps only two manifests today (the
  root and the curriculum SDK); every other package sits at
  `0.0.0-development`. P2 carries the stamping step that writes the release
  version into every published manifest before publish. Two packages carry
  their own version lines today (`oak-design-system` at 1.8.x; the curriculum
  SDK at the repository's line); both move to the repository's version at
  their first publish, a recorded discontinuity (§Decision log).
- **Order and atomicity.** `pnpm -r publish` is not atomic and rewrites
  `workspace:*` to exact versions. P2 publishes in topological order, then
  resolves the full published set from a clean store before the release is
  marked done, and re-runs to completion on failure. Provenance needs
  `id-token: write` on the release job, which the job does not grant today —
  P2 adds it or drops the provenance claim.
- **The validated tip.** The release job checks out no explicit ref on its
  `workflow_run` trigger, so a merge racing CI could be versioned unvalidated
  (`public-packages-release` records the defect). Pinning the checkout would
  detach HEAD and break the release plugin's push, so P1 asserts that the tip
  equals the validated SHA and exits cleanly otherwise, letting the newer run
  release; its proof includes a run where main advanced during CI.
- **Installability.** The packed-form smoke the SDK already runs extends to
  every published package and installs under a real pnpm store layout, not
  only from a tarball: module-load path arithmetic that reaches the monorepo
  root (the `env` package reads `package.json` four levels up at import)
  passes a tarball check and fails an install. Packages whose consumers copy
  files by path from the installed package root (the widget build copies
  fonts and icons from the design system) prove those files resolve from the
  packed tarball.
- **The release-age floor.** This repository's workspace sets a 24-hour
  minimum release age for dependencies. The new repository excludes the
  `@oaknational` scope from that floor (first-party packages are the trusted
  exception the floor's own comment names), so a release here is installable
  there the same hour.
- **The clock trigger.** "For now" ends when a second product ships from this
  repository: a daily-releasing app here would bump every toolkit package on
  every release and flood the product repository's dependency bot with
  no-op updates. At the first production release of a second app here, the
  toolkit's clock separates from the products' clock — the refinement
  `public-packages-release` frames (one clock per lifecycle group), which is
  why that dependency is `beneficial`: the minimum shippable shape is the
  single repository version until that trigger.

### Scaffold the new repository functional — the app template

`oaknational/oak-open-curriculum-mcp`, public, licensed per ruling 2 (code
MIT, content OGL, Oak branding under the Oak brand usage guidelines), is the
first instance of an app template this repository's own apps also use:
repository, workspace and tooling; CI (install, build, type-check, lint,
unit, end-to-end, the MCP conformance check, preview-serves, CodeQL,
dependency review); deploy configuration and the environment contract;
observability, error reporting and analytics wiring from the toolkit; flags;
the README and contributor guide. The template lives here as toolkit; the new
repository instantiates it in four single-story slices, and a release at one
version per repository is its own slice. The scaffold is proven functional
before any product code arrives.

### Agent tooling stays here; the product repository gets a minimal Practice

Owner rulings 6 and 7. Nothing of `agent-tools` moves — not the fleet and
collaboration machinery, not the validators, not the generators. Three
consequences:

- The `agent-tools` instruments that reached into the apps — the MCP-content
  current-source machinery (reviewed anchors over the served surface, the
  under-the-hood content and the SDK's guidance resources) and its two
  `repo-validators:check` entries — retire here at cut-over, because their
  subject leaves. The content discipline they enforced becomes one of the
  product repository's rails: a plain check the squad owns in that
  repository's own CI.
- The MCP conformance harness (the unattended MCPJam subset with baselines
  adjudicated by name) lives in `agent-tools` and stays. The product still
  needs a conformance check, so T1 gives it one: the harness's generic core
  published as an MCP-family toolkit package (the source stays here; the
  product consumes an artefact), with the product's baselines re-seeded in
  the new repository; the alternative, a plain MCPJam-driven check written
  there for the junior audience, is decided at T1.
- The product repository's Practice is its own slice (S3): a short
  `AGENTS.md`, a small rule set (ticket first, small PRs, review triage, never
  commit to main, design-system consumption, guidance-content provenance and
  attribution, "this is upstream"), one skill per common product task (add
  or change an MCP tool; change served guidance; change the search instance;
  run the conformance check; release; raise an upstream issue), thin platform
  adapters that point at those files, and its own plain git hooks. "On the
  rails" means every common task has one documented path with a check behind
  it; the rails are the checks. No comms, claims, fleet, plan estate or memory
  machinery travels. Its content is sliced from this repository's Practice by
  subtraction and rewritten for its audience, not copied.

### oak-under-the-hood — the owner's open question, with a recommendation

Owner ruling 4. The tool's content is generated at build time by this
repository's tooling from its Practice files; after the move the product can
reach neither. Three options, one recommended:

- **A (recommended): two tours.** An app tour authored in the new repository
  as part of its minimal Practice (the squad owns it; plain files, no
  generator), and a Practice tour published from this repository as an
  Oak-org content pack (generated here by the existing generator at release)
  that the server installs like any dependency. Keeps the product buildable
  without `.agent/`; keeps the Practice story served; no agent tooling
  travels.
- **B: one tour, one content pack.** All content authored here and published;
  the server only renders it. Cost: the product's own orientation is authored
  outside the product repository, against the handover's purpose.
- **C: app tour only.** The Practice tour retires from the served surface.
  Cost: the served orientation loses the Practice story the tool exists to tell.

The implementer decides at the server's move and records the choice in the
decision log; the slices assume A.

### Cut over and keep the seam honest

Production moves to the new repository's deploy with the conformance check
green against it, then the old deploy retires. From then on the seam is a
construction fact on both sides: this repository's CI runs the three gates
over the published toolkit set — imports (a toolkit package never imports an
Oak pack or an unpublished package, checked at subpath granularity), lexemes
(no Oak vocabulary inside toolkit sources; the `@oaknational` scope stays as
provenance), manifests (every toolkit package carries a publishable manifest)
— and reports the size of what is Oak-side here, the owner's "thinnest
possible Oak" as a number with a trend; the new repository reports its own
hand-written line counts against the ceilings and its dip rate on every
release.

### The lifecycle, and the second run

This plan is the first run of a repeatable extraction: a product born here on
the toolkit, thin by construction, leaves at handover. The second Oak app is
the next candidate. At the second run the procedure graduates to a runbook
node (the estate's rule: consolidate at the second consumer); this plan
records what the runbook will need — the five-class test, the per-box
decision, the finish list, the app template, the upstream contract — without
authoring it now.

### Where the first-principles check fires

Shape: the five-class test, the per-box decision and the first cut (a boundary
move that reshapes every surface it lived on — the retirement PRs carry every
root surface that named a moved path, and ADR-041 and ADR-108 are amended with
the moves, not after them). Landing path: publish first, thin in place, finish
the dependency set, scaffold from the template, move the product bands, cut
over, each slice a two-round PR with its proof named. Vendor literals: the
deploy target, the registry, the search host and the dependency-update bot
are named as classes here; their products and settings ride the ticket.

## Acceptance criteria (each with a proof — required)

- **AC1 — the extraction test.** A clean clone of `oaknational/oak-open-curriculum-mcp`
  installs from the registry, builds, passes its unit, end-to-end and
  conformance checks, and serves a preview, with no dependency on anything in
  this repository. Proof: `owner-held` — the new repository's CI run on its
  default branch, recorded on the ticket by the implementer (this repository's
  instruments cannot run it).
- **AC2 — the seam over the published set.** The three gates run in this
  repository's CI and refuse a seeded violation of each kind before they pass
  green. Proof: `repo-safe` — the gate jobs and their red-first seeds.
- **AC3 — thin, measured.** Every workspace in the new repository sits under
  the thinness ceiling the design record set for it, and no module in it
  implements a mechanism a non-Oak MCP service would also need. Proof:
  `owner-held` — the line-count script run in the new repository's CI on
  every release, recorded on the ticket, plus the readiness review of the
  moved bands at their move.
- **AC4 — thinning here is real.** Each extraction slice leaves the box's own
  suites and the conformance check green and reduces the box's hand-written
  lines by the extracted part's size; the trend is reported per slice. Proof:
  `repo-safe` — the box's suites and the line-count script in this repository.
- **AC5 — production from the new repository.** The served surface is
  identical before and after cut-over (the conformance check and the served
  tool table), and production serves from the new deploy. Proof: `owner-held` —
  the owner confirms the deploy project and DNS (gate 3); recorded on the
  ticket.
- **AC6 — a squad-shaped change.** The first real product change after
  cut-over lands in the new repository without a commit here. Proof:
  `owner-held` — the PR named on the ticket.
- **AC7a — the rails hold.** Two seeded mistakes (a tool without a
  conformance case; guidance content without attribution) fail their checks
  in the new repository's CI with messages that say what to do next. Proof:
  `owner-held` — the CI runs recorded on the ticket.
- **AC7b — aimed at junior developers.** Given only the product repository, a
  junior developer new to the product (or a fresh agent session without this
  repository's Practice, as the rehearsal proxy) goes from clone to a running
  server, lands a representative change — adding an MCP tool — by following
  the documented path, and cuts a release. Proof: `owner-held` — the
  rehearsal recorded on the ticket, with the time taken and every point where
  the reader had to ask.
- **AC8 — dips are rare.** In the first quarter after cut-over, the squad's
  upstream issues on this repository number near zero per month, and every
  one is resolved by a release here and a bot PR there, never by a squad
  member working in this repository. Proof: `owner-held` — the issue count
  and their resolutions on the ticket; at authoring, D0's change-class map is
  the estimate (`repo-safe`, the classification script and its output landed
  with the design record).

## Todos

Each slice is a single-story PR within the PDR-132 default of two review
rounds; the big extractions are sliced further at their own authoring. A slice
names its proof.

Design:

1. **D0** The design record: the per-box disposition under the five-class test
   with its measurement (this node's first cut confirmed or overridden), the
   search instance boundary with the Elasticsearch expert's answers, the new
   repository's target workspace set and file tree, the thinness ceiling per
   workspace, the finish list (every package the product will depend on and
   its finishable-bar status), the change-class map of the last quarter's app
   changes, and the lever inventory in extraction order. Proof: the owner's
   word (gate 1); the record and the map land beside this node.

Publish path (this repository):

1. **P1** The release job asserts the tip equals the validated SHA and exits
   cleanly otherwise. Proof: a run where main advanced during CI exits
   without releasing; the next run releases.
2. **P2** Publish configuration and the stamping step on the libs and core
   that stay whole; topological publish with the clean-store resolve check;
   the packed-form smoke under a pnpm store layout; `id-token: write` or no
   provenance claim. Proof: a dry run lists exactly that set; the first real
   publish at the next release; the smoke green for each.
3. **R1–R4** The four configuration relocations out of `env`, `logger`,
   `build-metadata` and `oak-eslint` — Oak-wide defaults into org
   configuration, per-app values into the product, the lint exception list
   made consumer-supplied — with `env` injecting the root version (ADR-024)
   instead of reading `package.json` at import. Proof: the packed core imports
   under a pnpm store layout; this repository builds and lints unchanged.
4. **P3** Publish configuration on the design packs with their licence
   words, with the widget's copied files proven to resolve from the packed
   tarball. Proof: as P2.
5. **P4** The three seam gates over the published toolkit set, red-first,
   with the import gate at subpath granularity. Proof: AC2.
6. **T1** The MCP conformance check the product will run (§Agent tooling stays
   here). Proof: the check runs against a local server from the published
   artefact or the rewritten check, with the product's baselines.

Cutting the SDK boxes and building the corpus pack (per D0):

1. **K1** The codegen chain along ADR-108's line: the per-subpath disposition
   table first, then the pipeline publishes as curriculum toolkit and the Oak
   schema cache and generated artefacts publish as an Oak-org pack. Proof:
   the product's artefacts regenerate from the published pipeline; the SDK
   suites green.
2. **K2** The curriculum SDK three ways: the generic client, config and
   validation publish as curriculum toolkit; Oak's types and API configuration
   publish as an Oak-org pack; the MCP tool layer, guidance and metadata thin
   toward configuration and generated code as D0 measured, and what remains
   is the product's. Proof: the MCP server's suites and the conformance check
   green on the split.
3. **K3** The search SDK three ways: retrieval and admin machinery publish as
   toolkit; Oak's index contracts, scopes and synonyms join the corpus pack;
   the MCP instance's retrieval profile and scopes are the product's. Proof:
   the search suites green on the split.
4. **K4** `graph-corpus-sdk` per D0's disposition (its barrel rewritten in the
   same slice if it splits, with its test pressure named). Proof: the corpus
   suites green.
5. **K5** The Oak corpus pack: bulk download, the canonical document model,
   vocabulary and synonyms, ground-truth query sets, versioned and published
   as an Oak-org pack; the MCP search instance ingests from it. Proof: a full
   ingest from the pack reproduces today's index contents.
6. **K6** `posthog-node` three ways: client and allowlist enforcement publish
   as toolkit; the Oak allowlist and posture publish as an Oak-org pack; the
   product keeps its event names. Proof: the MCP server's analytics suites
   green on the split.

Cutting the apps (sliced further at authoring; each extraction a published
package the app consumes in place):

1. **E1** The MCP server framework: composition, transport, sessions,
   registration, health. Proof: AC4 on the server.
2. **E2** OAuth-for-MCP: the proxy and auth. Proof: AC4; the registration
   proof re-run.
3. **E3** The widget build kit, the landing page and asset download; the
   widget's cross-workspace token watcher goes, the registry version bump
   being the token path. Proof: AC4; the widget build from the kit.
4. **E4** The observability, logging and correlation glue folded into the
   existing cores or a small framework module. Proof: AC4.
5. **E5** The search framework: ingestion runtime, versioned ingest, index
   lifecycle, diagnostics, the command shell. Proof: AC4 on the CLI; a full
   ingest of the MCP instance from the corpus pack.
6. **E6** The evaluation and benchmark harness. Proof: AC4; a benchmark run
   from the published harness against the Oak ground truth.
7. **E7** The app template as toolkit: the shape this repository's apps and
   the new repository share. Proof: the MCP server here builds from the
   template's conventions unchanged.

Finishing:

1. **F1** The finish list closes: every package on D0's list reaches the
   finishable bar, sliced per package. Proof: the bar's checks per package;
   the list on the ticket with each status.

Scaffold (the new repository; gate 2):

1. **S1a** Repository, licences, workspace and tooling from the template, the
   workspace layout from D0. Proof: install and lint green on an empty
   workspace set.
2. **S1b** CI jobs. Proof: green on the empty set; each job's failure message
   read for the junior audience.
3. **S1c** Deploy configuration, the environment contract, observability and
   analytics wiring. Proof: a preview deploy of an empty server responds and
   reports.
4. **S1d** README and contributor guide, including the "this is upstream"
   path and the issue template on this repository. Proof: clone to running
   server by the README alone, timed.
5. **S2** Release at one version per repository, with the dependency-update
   bot configured for the `@oaknational` scope. Proof: a tagged pre-release
   from a no-op commit class; the bot opens a PR for a toolkit release.

Moves (one PR in the new repository plus the retirement PR here):

1. **M1** The product bands move together — the server's band with the
   under-the-hood decision recorded, the search instance, and the SDK bands
   D0 assigned to the product — into the workspaces D0 set; the retirement PR
   here removes every root surface that named them and carries ADR-041's and
   ADR-108's dated amendments (A1). Proof: AC1 and AC3.
2. **S3** The product repository's minimal Practice, authored once the
   product's real tasks are in that repository. Proof: AC7a and AC7b.

Cut-over and amendments:

1. **C1** Production deploy from the new repository; the old deploy retires.
   Proof: AC5. Gate 3.
2. **C2** The residue here: the two content validators whose subject left,
   onboarding pointers, and the Oak-side size report. Proof:
   `repo-validators:check` green; the number on the ticket.
3. **A1** Rides M1's retirement PR: ADR-041's dated amendment (its tier layout
   names `apps/` as the MCP servers and search CLI and lists the demos and
   SDKs by name; after M1 the `apps/` tier here holds this repository's own
   apps and the layout describes the estate after extraction) and ADR-108's
   dated amendment (the split executed at the product boundary, with the
   Castr composition pointer). Proof: the docs validators.
4. **A2** `toolkit-re-architecture`'s dated ordering amendment, presented for
   the owner's word (the consolidation step's act), and
   `public-packages-release` §Alignment and §Delivery naming this plan and
   the clock trigger. Proof: the plan-corpus validator; the owner's stamp.
5. **V1** The line-count and change-class scripts in `agent-tools` (here) and
   the line-count twin in the new repository's CI. Proof: AC3, AC4, AC8.

## Out of scope

- Moving today's apps as they are — the product is their product band, not
  the workspace.
- The demos — both stay here (ruling 9).
- The second Oak app and the library service — design inputs to this plan,
  not its deliverables; their own plans consume what this plan publishes.
- The second extraction's runbook — authored at the second run.
- The estate-wide `toolkit/` and `oak/` re-home of the members outside the
  product's closure — the strategic node's existing delivery order owns it.
- The Innovation Kit and its definition corpus — topology-neutral by its own
  declaration; it stays here as the way new apps are born.
- Castr adoption timing — owner-schedulable; the Castr fixture pack's contract
  content is not superseded here.
- A separate toolkit repository — deferred by the strategic node with its flip
  condition named.
- The design lane's identity-pack programme — continues here; the product
  consumes its output as published packs.
- Rung 3 of the demonstration ladder — a greenfield non-Oak service is its own
  plan.
- Any agent tooling in the product repository (ruling 6).

## Decision log

- **Owner rulings, verbatim (2026-09-02; the durable record is the
  estate-coordination thread record §2026-09-02 FOLD LANDED):** (1) "yes the
  search app is effectively part of the MCP app"; (2) "the published packages
  will be on the @oaknational org scope, public, code is MIT, content OGL, any
  included Oak branding is covered by the Oak branding usage guidelines... so
  same as everywhere else"; (3) "releases: up to the implementing person, I
  would go with one release version per repo for now"; (4) "oak-under-the-hood,
  leave it as an open question for whomever picks up the plan, maybe we split
  it into two separate skills/tours"; (5) "all Oak work is public and open by
  default, the name will be oak-open-curriculum-mcp in the oaknational github
  org"; (6) "all agent tooling stays with the primary repo, not the oak app
  repo"; (7) "the oak app repo will have a minimal, streamlined Practice
  designed for on the rails use by less experienced devs"; (8) "in fact that
  is a requirement, every aspect of the oak app repo must be aimed at junior
  devs"; (9) "all of the demos stay with the core repo, only the mcp app and
  search app and any thin but absolutely necessary layers move to the new
  repo"; (10) "there is no way that the requirements are met by shuffling
  existing workspaces, and I said that from the very beginning"; (11) the
  diagram: "the Oak parts are above the dotted lines, the reusable parts
  below, and all the different heights represent is that the oak-specific
  config or oak-specific domain logic will be different, but always thin,
  amounts in each case, often zero at the lower levels"; (12) "in each
  existing workspace it may be reasonable for the entire workspace to stay in
  this core repo, not every workspace will require a split"; (13) the design
  thought experiment — three apps (the MCP product, a second Oak homework
  app, a library service built with the Innovation Kit that is not an Oak
  app), "only the MCP app and friends go in the new repo, _but_ the need to
  dip into this repo to fix things must be strongly minimised in order to
  satisfy the 'suitable for junior devs' requirement, because this repo is not
  suitable for junior devs", and on search: "there is no need for it to be
  the same service, or have the same indexes".
- **The frame (authoring seat, 2026-09-02, after rulings 10–13).** The
  seat's first two drafts moved existing workspaces; both were shuffles. The
  product is the product band of every box it touches, today's apps are
  mechanism with that band inside them (§Evidence), and the band is thinner
  than the Oak slice because Oak-wide assets are platform work; so the plan
  cuts boxes along the owner's line under the five-class test and moves only
  the product bands, thinning in place first.
- **The ordering thesis (presented for the owner's word).** The extraction
  runs before the estate-wide seam re-home: cutting the product's boxes IS
  the seam for the part of the estate that carries most of the Oak-mixed
  mechanism, and the gates apply per package, so a published subset is
  checkable. The counterframe — the strategic node's banked "seam migration
  first" — would have the handover wait on members the squad never sees.
  Falsifiers of the ordering itself, each tested at a named slice: the
  extraction test (M1) finds the product reaching a member outside its
  closure that can be neither published nor moved; or P4 cannot enforce the
  gates per package over a published subset. Either reopens the order in
  favour of the estate-wide re-home first.
- **Search: infrastructure, corpus, instance (§Search).** Ruling 1 holds as
  given: the search app that leaves is the MCP instance. The corpus is an
  Oak-org pack built once here; the framework is toolkit.
- **Rare dips, not cheap dips.** The seat's third draft made the upstream
  change cheap (automatic publishing, a dependency bot); ruling 13 requires
  it rare and junior-safe, hence knobs by construction, platform-owned
  Oak-wide assets, the finish list as a precondition, and the upstream
  contract, with the dip rate as the criterion (AC8) in place of the commit
  replay.
- **Publish-first at one version; the clock trigger; the version
  discontinuity.** Ruling 3 read for this repository, ending at the first
  production release of a second app here; the two packages with their own
  version lines join the repository's version at first publish.
- **Agent tooling stays; the content instruments retire at cut-over; the
  conformance check is re-provided (T1).** From rulings 6 and 7 and the
  readiness reviews.
- **oak-under-the-hood: option A recommended, decided at the server's move.**
- **Free-play seeds recorded, not decided:** the library service's identity
  could be the design lane's fourth, product-led identity, which would give
  identity-№N a production first light; the served-surface manifest
  generalises to the surface gating a marketing site with a service behind
  flags needs. Both are inputs to D0 and the design lane, not this plan's
  scope.

## Review dispositions

One dated row per routed finding (PDR-140 ledger surface); the picking-up
implementer enumerates and dispositions every row before implementation.

| Date | Source | Finding | Routing |
| --- | --- | --- | --- |
| — | — | (none at birth) | — |

## Evidence at authoring (2026-09-02, tree at `777e9131c`)

- The apps are mechanism with a thin product band inside. Hand-written,
  non-test, non-generated lines: the MCP server ~20,500, of which the served
  surface (285), the under-the-hood tour (181) and the generated tool metadata
  (~200) are the product band and the rest is the server framework and
  composition (~1,850), build scripts and widget build (~2,100), OAuth proxy
  and auth (~1,700), observability, logging, correlation and test-error
  plumbing (~1,800), landing page (~1,050), registration proof and asset
  download (~1,000), scripts, operations and test helpers (~2,300); the search
  CLI ~31,500 across `adapters`, `cli`, `lib`, `observability` and
  `test-helpers`; the curriculum SDK ~12,000, of which the MCP tool layer,
  guidance and metadata are ~8,500 and the generic client, config and
  validation ~3,400; the search SDK ~8,500.
- Dependency map from the manifests: 33 workspace members. The two apps'
  runtime closure is 19 members (the two apps and 17 packages); with the six
  dev-time members (`design-tokens-core`, `oak-design-assets`,
  `oak-design-system`, `oak-design-tokens`, `eslint-plugin-standards`,
  `workspace-config`) it is 25. Six members sit outside it, plus the two
  demos. One publishable manifest; nothing published. The thread record's
  earlier figure of 22 was the morning's chat-derived count and is superseded.
- Co-change, `git log` from 2026-06-04: 255 commits touched `apps/`; 75 touched
  only `apps/`; 78 also touched `packages/`, led by the curriculum SDK (379 file
  touches) and the codegen chain (305), then `graph-corpus-sdk` (46),
  `oak-eslint` (42), `oak-search-sdk` (29); every other package under 25. The
  MCP-content current-source machinery in `agent-tools` (195 touches) and its
  validators (63) co-changed with the apps more than any library did; both
  retire at cut-over. The quarter was an agent-driven build phase and
  over-represents mechanism changes; D0's change-class map classifies it, and
  AC8 measures the truth after cut-over.
- Root couplings the template replaces and the retirement PR removes: turbo
  pipeline entries for the MCP server; three root scripts; knip entries; the
  curriculum SDK's entries in `.releaserc.mjs`; six workflows; the deploy
  configuration; the under-the-hood generator's reach into `.agent/`.
- Readiness reviews (dispositioned by ID) and the Atlas render proof:
  `.agent/reports/repo-architecture/oak-open-curriculum-mcp-extraction-readiness-reviews-2026-09-02.md`.
