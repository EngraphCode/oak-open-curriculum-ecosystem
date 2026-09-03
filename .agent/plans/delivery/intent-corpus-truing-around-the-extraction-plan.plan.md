---
id: intent-corpus-truing-around-the-extraction-plan
node_type: delivery
name: "True the planning and intent corpus around the extraction plan"
overview: >-
  Make every surface that states the repository's strategy, shape or
  ordering agree with the merged extraction plan or say, dated, which part
  of it the plan supersedes — so that anyone choosing work here reads one
  consistent intent, and the owner's word on each amended surface closes
  the loop.
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: planning-and-intent-estate
impact_areas:
  - practice-and-estate
tickets:
  - MCP-673
depends_on: []
owner_gates:
  - awaiting: owner-decision
    clears_when: >-
      The owner gives a separate, locatable word on each act the first pull
      request presents as its own numbered item — the dated note on each
      owner-signed strategy page, the dated amendment to the ratified
      strategic node, the form of the Atlas's amendments block, and the
      archival of the sketch that serves the superseded programme — and, if
      he chooses, the ratification of the two sketch nodes the extraction
      lane landed. A blanket approval of the pull request stamps none of the
      ratifications; each needs its own word.
    expires: 2026-09-24
last_updated: 2026-09-03
---

# True the planning and intent corpus around the extraction plan

## Goal

The third and last step of the owner's objective of 2026-09-02 ("merge 915,
then provide a plan, then make sure that the repo strategy is consistent and
cohesive around that plan"). When this lands, every surface in the planning
and intent corpus that states the repository's strategy, structure or
ordering — the strategy pages, the strategic nodes, the delivery nodes that
touch repository shape, the Oak Toolkit Atlas, and the lane's records — either
agrees with the merged extraction plan
(`oak-open-curriculum-mcp-extraction`, the lane's design step) or carries a
dated note saying which part of it the plan supersedes. Nothing ratified or
owner-signed is rewritten: change arrives dated beside the standing text, and
the owner's word lands with it, one act per surface. A reader who starts at
the strategy index reaches the strategic node in one link and finds the
extraction plan named there as the first step of its delivery order.

This plan also discharges the extraction plan's own amendment item A2 (the
strategic node's ordering amendment, the Atlas's lexeme-gate amendment, and
`public-packages-release`'s alignment and delivery sections), so that the
design step D0a mints no amendments node of its own; the extraction plan's
ledger records the discharge. The extraction plan is already on main, so it
is cited here by id rather than carried as a dependency edge, which would
encode provenance and never clear.

It serves `planning-and-intent-estate` because its outcome is the corpus's
coherence — that node's territory ("what serves what, what was intended and
never came to pass") — even though every surface it amends belongs to the
re-architecture's lane and it discharges an item of a plan that serves
`toolkit-re-architecture`; the ticket is visibility metadata, optional
everywhere since the schema's 2026-08-07 amendment, as the planning estate's
own delivery section records.

## User groups and value

- **The owner.** One consistent statement of intent across the corpus, so
  priority is read from the estate rather than held in his memory; his word
  is asked for on one pull request, act by act, for every owner-signed or
  ratified surface the truing touches — and nowhere else.
- **People and agents choosing work in this repository.** No two surfaces
  give contradictory orders (the strategic node's banked "seam migration
  first" against the plan's "extraction first"; the Atlas's re-home of every
  census row against the plan's per-box decision; a strategy page that says
  the app is delivered from this repository; two parents that call the
  extraction a rehearsal). A one-link reading path from the strategy index
  replaces guesswork about what comes first.
- **The next implementer of the extraction lane** (D0b and D0a). The
  instruments and design record they produce sit under a strategic node
  whose delivery order names their lane first, and the publish-mechanism
  node they depend on is named by its own parent.
- **The product squad, later.** The strategy pages say where the MCP app is
  delivered from once the extraction executes, so the handover is not a
  surprise to anyone reading Oak's strategy for this work.
- **The planning estate itself.** Its loss guarantee holds: the four
  conserved planning corpora are untouched, and the scan that finds the
  surfaces is recorded in this node so the truing is recomputable without a
  ledger.

## Mechanism

### What the corpus is, for this plan

Three tiers, each with its own carrier and its own authority:

| Tier | Surfaces | Authority | How it is amended |
| --- | --- | --- | --- |
| Strategy pages | `docs/strategy/*.md`, `VISION.md` | Owner-signed (2026-06-20; the Kit 2026-08-30); the strategy index calls itself a living strategy and iterates by dated change | A dated additive note, presented for the owner's word as its own act; the signed text stands; `last_updated` bumped |
| Ratified nodes | `toolkit-re-architecture`, the ratified runbooks | Bind | A dated amendment in place (the schema's "smaller amendments are made in place with dated notes"), a ledger row, and the owner's word as its own act; `last_updated` bumped |
| Sketch nodes | `public-packages-release`, `oak-open-curriculum-mcp-extraction`, `toolkit-publish-mechanism`, `workspace-taxonomy-landscape-survey` | Bind nothing | Edited in place with `last_updated` bumped; archival at the owner's word with a one-line disposition note |
| Design reports and lane records | The Oak Toolkit Atlas; the readiness record; the estate-coordination thread record | Reports are the design authority the nodes cite; records are contemporaneous capture | A dated amendments block in the report (form stated below); a true-up entry in the record |

Out of the corpus for this plan, by the estate's own rules: the four
conserved planning corpora (`.agent/plans-backlog-2026-07/`,
`.agent/plans-old-archive/`, `.agent/plans-refounding/`,
`.agent/plans-v0-sketch-2026-07-21/` — `planning-and-intent-estate` keeps
them untouched as the loss guarantee; their dispositions live in the
migration ledger, not here); the architectural decision records the
extraction lane amends at its own later steps (ADR-041 and ADR-108 at the
retirement and first-pack slices); the onboarding pages, which describe the
tree as it stands and change when the tree changes — with one exception: a
statement in them that is false today is corrected to today's truth, never
to a future state.

### The instrument — a pinned scan, recorded here, no ledger

The denominator is produced, not remembered, and it is not accounted for: the
amendments and their commits are the record (the estate's rule that the
permanent document plus the commit is the consolidation record; disposition
ledgers and count proofs are the forms it forbids). The scan is pinned so a
re-run is the same scan:

```bash
git grep -l -i -E \
  'workspace-reorganisation-programme|seam migration|toolkit-re-architecture|oak-open-curriculum-mcp|public-packages-release|extraction test|extraction rehears|extracted squad|one release version|demonstration ladder|rung 2|rung-2|thinnest possible|lexeme|@oaknational (scope|npm)|npm publishing|npmPublish' \
  -- 'VISION.md' 'README.md' 'CONTRIBUTING.md' '.agent/directives' 'docs/strategy' \
     'docs/architecture/architectural-decisions' '.agent/plans/strategic' \
     '.agent/plans/delivery' '.agent/plans/runbooks' '.agent/plans/README.md' \
     '.agent/plans/plan-node-schema.md' '.agent/reports/repo-architecture' \
     '.agent/reports/workspace-classification-census' \
     '.agent/practice-core/decision-records' \
  ':!**/archive/**'
```

The scan cannot see a strategy page that describes the app's home without any
of those words, so the reading adds a judged list: the strategy index and its
four stream pages, the alignment page, the vision, and the directions
register. Each surface either agrees, is amended, or is silent by design;
what this node records is the reasoning behind the amendments (§Inventory at
authoring), never a row per file.

### The amendment class, and the fallback

Reversing the ratified node's banked delivery order and re-homing the
release-mechanism responsibility are in-place dated amendments, not a scope
change: the node's outcome (two families, one seam, three gates) and its bet
are unchanged; §Delivery is the projection of order onto delivery plans, and
§Success's "not claimed" clause names where a decision is carried, not what
the decision is. The schema's status axis keeps the node `ratified` and the
dated note carries the change; the owner's word on that note is the act that
makes the new order binding. If the owner withholds the word on the ordering,
the note stays as a presented proposal with his decline recorded in the
ledger row, the extraction plan's ordering thesis stays "presented", and the
banked order stands — nothing else in this plan depends on it.

### The amendments this plan lands

Each dated, additive, and citing the extraction plan by id and the ruling it
rests on; the amended passage states the new position positively, and the
dated note beside it carries the change story.

- **`toolkit-re-architecture`** (ratified): §Delivery states the order
  positively — the extraction lane first (its design step
  `oak-open-curriculum-mcp-extraction`, then the publish mechanism, then the
  lane's steps), the seam migration of the members outside the product's
  closure after it — with the dated note naming the banked order it replaces
  and the ordering thesis's two falsifiers; §Success looks like states that
  the rung-2 proof is the extraction itself, not a rehearsal, and that the
  release mechanism is carried by `toolkit-publish-mechanism`; one ledger row;
  `last_updated`. The §User groups and value section landed with MCP-661
  takes the owner's word in the same act.
- **`public-packages-release`** (sketch, edited in place): §Alignment says
  the successor node landed on main on 2026-09-02 and that this node's
  clock-group wager now binds to its seam by name; the sequencing
  consequence says publishing proceeds behind the per-package finish checks
  the extraction plan defines (the "deliberate per-package equivalent" the
  passage already allows) ahead of the estate-wide seam; §Success names the
  extraction, not a rehearsal, as the rung-2 consumer; §Delivery names
  `toolkit-publish-mechanism` as the first-publish step and states the
  clock-separation decision as this node's, with the two observations the
  extraction plan will contribute; `last_updated`.
- **`oak-open-curriculum-mcp-extraction`** (sketch): one ledger row recording
  that A2 is discharged by this plan; `last_updated`.
- **`toolkit-publish-mechanism`** (sketch): one line on its live-publish slice
  — it amends the ratified release-process runbook's rollback clause, which
  today rests on publishing being disabled, to cover published packages
  (a published version cannot be withdrawn); `last_updated`.
- **`workspace-taxonomy-landscape-survey`** (sketch): its `serves` edge points
  at `workspace-reorganisation-programme`, superseded on 2026-08-19 by a node
  that retired the target-inventory search the sketch was built to run.
  Presented for archival as its own act: `status: archived`, the one-line
  disposition note ("abandoned 2026-09: its instrument, a search for a
  target workspace inventory, was retired by the successor node's seam
  decision of 2026-08-19"), and the move to `.agent/plans/archive/`; if the
  owner keeps it, it is re-pointed to `toolkit-re-architecture` instead.
- **The Oak Toolkit Atlas**: the form has no precedent in the file, so it is
  stated here and takes the owner's word as its own act — a new dated block
  headed "Amendments" at the head of §8, leaving the ruled prose of every
  change intact, with three entries: Change 3's lexeme gate is scoped per
  class (toolkit and MCP-family sources carry neither Oak nor curriculum
  vocabulary; curriculum-toolkit sources carry curriculum terms but no
  Oak-instance terms; Oak-org packs and products carry both), with a dated
  exemption list the gate reads; Change 3's "census retires into a migration
  map" paragraph is superseded in part by the plan's per-box decision (not
  every row re-homes, and the re-home of the remainder follows the
  extraction); Change 4's residue — the release mechanism riding the seam's
  migration card — is carried by `toolkit-publish-mechanism`, and Change 2's
  one clock per package is reached through one version per repository for
  now (ruling 3). The alternative form, recording the supersessions only in
  the citing nodes, is named for the owner to prefer. The rendered seam
  diagram is unchanged.
- **`docs/strategy/stream-mcp-app.md`** (owner-signed): a dated note after
  the opening paragraph — the app is delivered from
  `oaknational/oak-open-curriculum-mcp` once the extraction plan executes,
  and this repository delivers the platform beneath it (the toolkit and Oak's
  organisation-wide packs) and the app itself until cut-over; the stream's
  bets and keystones are unchanged; `last_updated`.
- **`docs/strategy/alignment-and-streams.md`** (owner-signed): one dated
  clause under "The engineering tools are the foundation" — the foundation
  is published as packages the app's own repository installs, which is how
  the app exercises it after the extraction; `last_updated`.
- **`docs/strategy/README.md`** (owner-signed): one dated line in "How to
  read this" naming the extraction of the MCP app product into its own
  repository as the current structural commitment, linking to the strategic
  node `toolkit-re-architecture` (a stable address) whose delivery order
  names the plan — the reading path AC3 measures; `last_updated`. This line
  is index prose, not one of the signed choices of 2026-06-20, so the owner's
  word on it is a glance rather than a re-signing; it is still presented as
  its own item.
- **Factual true-ups, no owner word needed** (the second pull request): the
  readiness record's verdict sentence says both pull-request rounds (routed
  from PR #954's third round, where the record named only the first); the
  plans index's `archive/` line says "completed or abandoned" (the schema
  keeps superseded nodes in place); the contributor guide's release paragraph
  says version bumps and GitHub releases with no registry publishing (today's
  truth; the release configuration disables it); the estate-coordination
  thread record's dated true-up entry — the objective's three steps
  complete, the lane closed, what the owner holds.

### Two pull requests, one story each

The first carries every surface that needs the owner's word — the strategic
node, the strategy pages, the Atlas block, the archival — and the two sketch
edits that travel with them (`public-packages-release`, the extraction
plan's ledger row), presented as numbered acts he answers one by one. The
second carries the factual true-ups, which merge at green-and-clean without
his word. Splitting keeps each within the size band and stops housekeeping
from waiting on a ratification decision.

### Where the first-principles check fires

Shape: dated notes rather than restructuring, so both pull requests sit
within the round budget; the alternative — one pull request per surface —
would multiply the owner's acts without adding review value. Landing path:
the scan and the judged reading, then the first pull request's amendments
and the owner's acts, then the second's true-ups; the plan-corpus, docs and
link validators run at every commit. Vendor literals: none.

## Acceptance criteria (each with a proof — required)

- **AC1 — no superseded statement remains.** Each passage the survey found
  stating a superseded position — "the seam migration first" as the banked
  order; the release mechanism "carried by the seam delivery plan" or riding
  "the seam's migration card"; the successor "has not yet reached either
  repository's main line"; rung 2 as "extraction-rehearsed" or an
  "extraction rehearsal"; "curriculum terms" in the lexeme list without the
  per-class scope; "the 17 oak-leaf rows re-home under `oak/`" without the
  per-box note — carries its dated amendment, and the pinned scan re-run at
  the end of the first pull request lists no surface where such a passage
  stands unamended. Proof: `repo-safe` — one `git grep` per passage returning
  only its amended form, run and quoted in the pull request.
- **AC2 — the estate validates.** The plan-corpus, docs and markdown-link
  validators are green with every amendment in place. Proof: `repo-safe` —
  `validate-plan-corpus`, `docs-validators:check`, `validate-markdown-links`.
- **AC3 — the reading path exists.** `docs/strategy/README.md` links to
  `toolkit-re-architecture`, and that node's §Delivery names
  `oak-open-curriculum-mcp-extraction` as the first step of its order.
  Proof: `repo-safe` — a `git grep` for the link in the index and for the
  plan's id in the node's §Delivery, plus the link validator resolving the
  link.
- **AC4 — the owner's word has landed, one act per surface.** Every
  owner-signed or ratified surface amended carries his word as its own
  locatable act (a ledger row citing the pull request item, a stamp, or the
  ratification fields), and the archival is his. Proof: `owner-held` — the
  first pull request's per-item answers, pointed at from MCP-673.
- **AC5 — the loss guarantee holds.** Neither pull request touches a
  conserved corpus. Proof: `repo-safe` —
  `git diff --name-only origin/main...HEAD -- .agent/plans-backlog-2026-07 .agent/plans-old-archive .agent/plans-refounding .agent/plans-v0-sketch-2026-07-21`
  returns nothing, quoted in each pull request.

## Todos

Execution order; each slice is a single commit within the PDR-132 default of
two review rounds. T1–T4 and T6 are the first pull request; T5 is the second.

1. **T1** Run the pinned scan and read the judged list; confirm or extend the
   amendment set in §The amendments. Proof: the scan's output quoted in the
   first pull request.
2. **T2** The node amendments: `toolkit-re-architecture` (§Delivery restated,
   §Success, the ledger row, `last_updated`), `public-packages-release` (in
   place), the extraction plan's ledger row, the publish node's line, and the
   archival of `workspace-taxonomy-landscape-survey`. Proof: AC1's greps for
   the node passages; AC2.
3. **T3** The Atlas's dated amendments block, in the stated form. Proof: the
   file's diagrams unchanged (the seam diagram's text line identical);
   AC1's greps for the Atlas passages.
4. **T4** The three strategy-page notes with their `last_updated` bumps.
   Proof: AC3; AC2.
5. **T5** The factual true-ups (the readiness record's sentence, the plans
   index line, the contributor guide's release paragraph, the thread record's
   entry) as the second pull request. Proof: each reads true against its
   source (the record's own tables; the schema; the release configuration);
   AC2; AC5.
6. **T6** At the owner's per-item word on the first pull request: the ledger
   rows citing each item, and the ratification fields on the two sketch
   nodes if he stamps them. Proof: AC4.

## Out of scope

- Executing the extraction plan — D0b, D0a and every later step are the
  implementer's lane; this plan makes the corpus agree with the plan, not
  the tree.
- ADR-041 and ADR-108 — amended at the extraction lane's own slices (A1 at
  retirement, A3 at the first Oak-org pack), where the tree changes.
- The onboarding pages beyond a false-today statement — they describe the
  tree as it stands and change at the extraction's residue slice.
- The release-process runbook — its rollback clause is true today and is
  amended by the publish node's live-publish slice when it stops being true.
- The census matrix's generated prose ("never publish it from here" on the
  MCP app's row) — a generated artefact the extraction plan's design step
  overrides per box and regenerates.
- The directions register (`engineering-directions`) — a chartered outcome
  is not duplicated there by its own rule; its expired gate is a separate
  owner item the drift alert already carries.
- The conserved planning corpora — untouched by the estate's loss guarantee.
- A truing record or disposition ledger — the amendments and their commits
  are the record.
- Any new strategy — this plan propagates a decision already made; it makes
  none.

## Review dispositions

One dated row per routed finding (PDR-140 ledger surface); the picking-up
implementer enumerates and dispositions every row before implementation.

| Date | Source | Finding | Routing |
| --- | --- | --- | --- |
| 2026-09-03 | Corpus survey at authoring | The ratified release-process runbook's rollback clause rests on publishing being disabled | `toolkit-publish-mechanism`'s live-publish slice amends it (this plan adds the line at T2) |
| 2026-09-03 | Corpus survey at authoring | The census matrix's MCP-app row says "never publish it from here" | The extraction plan's D0a per-box override; the matrix regenerates |
| 2026-09-03 | Readiness reviews at authoring (assumptions, docs) | Cured in this draft: the instrument without a ledger, the amendment class and fallback, the stable reading path, one act per surface, the archival's note and path, the Atlas form, the split into two pull requests, the provenance-only dependency edge dropped | None routed onward |
| 2026-09-03 | The two reviews disagreed on the parent node (the docs review: `planning-and-intent-estate`; the assumptions review: `toolkit-re-architecture`) | The author chose the planning estate on the outcome axis (§Goal states the reason); the owner may re-point it at ratification | Presented with the node |

## Inventory at authoring (2026-09-03, main at `b9601ab40`)

The survey's contradictions, each verified against the file:

- `toolkit-re-architecture` §Delivery: "the seam migration first (it carries
  the release-mechanism owner decision and executes the census migration
  map)" — the plan runs the extraction first and presents the reversal with
  two named falsifiers.
- `toolkit-re-architecture` §Success and the Atlas's Change 4: the release
  mechanism "carried by the seam delivery plan" and riding "the seam's
  migration card" — carried by `toolkit-publish-mechanism` now.
- `toolkit-re-architecture` §Success and `public-packages-release` §Success:
  rung 2 as "extraction-rehearsed" and an "extraction rehearsal" — the plan
  makes it the real handover.
- The Atlas's Change 3: the lexeme list "brand names, curriculum terms" and
  "the 17 oak-leaf rows re-home under `oak/`" — the per-class gate and the
  per-box decision.

The stalenesses: `public-packages-release` §Alignment ("has not yet reached
either repository's main line"; "still carries `workspace-reorganisation-programme`
as the standing programme node") and its sequencing clause (publishing waits
on the seam's manifest gate); `workspace-taxonomy-landscape-survey` serving
the superseded programme; the plans index's `archive/` line; the contributor
guide's "npm publishing"; the readiness record's verdict sentence; the
repository name doubling as the error-reporting project name in ADR-159 and
ADR-163 (the extraction plan's gate 2 carries that owner item).

The judged reading list: the strategy index says nothing about repository
shape and gains the reading-path line; the MCP-app stream says this
repository delivers the assistant channel (amended); the engineering-tools
stream's layering statement agrees and is silent on publishing (one clause
via the alignment page); the framework and Kit streams, the vision, the
directives index and the contributor guide (beyond its release paragraph) are
silent by design; the directions register is out of scope by its own rule.
Surfaces that agree as written: `toolkit-publish-mechanism`,
`tango-identity-pack` (defers its tier's re-home to the seam migration, which
now follows the extraction), `innovation-kit` and its capability definition
(topology-neutral), `design-system-as-configured-framework` (the same thin
Oak the five-class test makes), `reliable-atoms-programme` (cedes the
space), ADR-154 (the gradient the plan maps), ADR-041 and ADR-108 (silent on
the extraction, amended at the lane's later slices), PDR-035 (why all agent
tooling stays).
