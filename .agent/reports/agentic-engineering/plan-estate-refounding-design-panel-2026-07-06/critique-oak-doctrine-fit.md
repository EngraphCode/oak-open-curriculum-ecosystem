# Critique — oak-doctrine-fit lens (PDR-123 critic ensemble)

Critic: oak-doctrine-fit. Date: 2026-07-06. Inputs read end-to-end first-hand:
`tmp/refounding-designs/brief.md`, F1–F6 designs, ADR-200, `planning-estate-rewrite.plan.md`,
`plan-node-schema.v0.md`, PDR-049, the corpus-generalisation plan
(`.agent/plans/agentic-engineering-enhancements/future/corpus-analysis-generalisation-and-knowledge-layer.plan.md`),
and the rules `replace-dont-bridge`, `never-use-git-to-remove-work`,
`knowledge-preservation-over-fitness-warnings`, `no-moving-targets-in-permanent-docs`,
`stage-by-explicit-pathspec`.

Overall verdict: **sound-with-revisions.** The ensemble is doctrinally literate — most oak
rules are cited by name and honoured structurally (never-discard as a type-system absence,
frozen copies for never-use-git-to-remove-work, explicit-pathspec staging, additive dated
amendments, owner-gated LOCKED changes at F5 OG-1). The failures that remain are
concentrated at cross-facet seams and at the two owner-ratified records the protocol
touches hardest: ADR-200's Decision sections and the V0 LOCKED contract.

---

## CRITICAL findings

### C1 — The ADR-200 change is Decision-level, not a §Sequence insert; F6's own falsifier fires on F6's design

**Where:** F6 §1 (D1), §2 (D3), §7 (ADR amendment row); F4 (no citation of the ADR-200
§Consequences taxonomy constraint anywhere).

**Doctrine:** ADR-200 §Consequences ("The boundary (Q3, made explicit)"): *"Rewriting the
existing estate into the strategy-aligned corpus is gated on the idea-graph"*; V0-bridge is
*"never a licence to author the whole corpus ahead of the graph"* and V0-bridge plans
*"must not invent a competing plan-organising taxonomy the graph would have to fight."*
ADR-200 §5 (Decision, owner-ratified 2026-06-22): the no-loss guarantee is the two-direction
audit with harvest-recall against **re-read sources of the existing corpus**. ADR-200
§Open (owner, 2026-06-22): the corpus organises `thread → plan` under given streams and
does **not** derive organising structure bottom-up.

**Conflict:** The refounding (a) authors the whole corpus ahead of the graph, directly
inverting the Q3 boundary; (b) mints a new estate-wide organising taxonomy (F4 lanes:
directories + registry) before the idea-graph exists; (c) re-scopes WS6's harvest substrate
and converts WS7's owner-ratified two-direction audit into a transitive composition
(F6 §2). The owner's 2026-07-06 directive plainly authorises the work — that is not in
question. The doctrinal defect is that F6 records this as *"a dated amendment... the
inserted step between §Sequence 5 and 6"* and asserts D1 (*"not a rival architecture"*)
while its own falsifier says *"if executing the refounding forces a change to ADR-200's
Decision sections (not merely its §Sequence), D1 is wrong and a new ADR is required."*
The Q3 boundary and the §5 no-loss design are Decision/Consequences text, and both are
materially changed. An additive sequence note that quietly inverts an owner-ratified
boundary is exactly the drift class `no-moving-targets`/I12 discipline exists to prevent —
the record would say one thing while the estate does another.

**Cure:** Present the ADR-200 change at G5 as a **Decision-level owner re-ratification**:
either a successor/companion ADR ("the refounding as an inserted conservation stage") or an
amendment that explicitly names and re-rules (i) the Q3 rewrite-gated-on-graph boundary,
(ii) the §5 audit re-scope (old→refounded proven by the conservation chain; refounded→graph
by WS7; composition as the new acceptance), and (iii) the lane taxonomy's compatibility
claim. F4 must add the compatibility argument explicitly: lanes are registered values
anchored to the standing strategy registry, projected as folders, carried by
`serves_strategic_choice` — i.e. a graph-compatible partition, not a competing taxonomy —
and this claim is ratified at Walk A, not assumed.

### C2 — F4 LR-3 silently narrows a V0 LOCKED contract (the `"pending"` sentinel)

**Where:** F4 §2 (LR-3: *"the `"pending"` sentinel is valid ONLY inside the holding lane.
Anywhere else in the new corpus it is a red gate"*); F4 §4 (`serves_strategic_choice:
"pending"` — *"valid here and only here"*).

**Doctrine:** V0 §2.3 (`serves_strategic_choice`: *"strategic-choice ID, or `"pending"`"*,
LOCKED shape); V0 §4 authority invariant 1: *"Every `executable` plan resolves
`serves_strategic_choice` to a published registry ID **or** carries the explicit `"pending"`
sentinel (the pending-gate)."* LOCKED means owner re-ratification is the change path
(V0 §0 exposure table).

**Failure scenario:** A genuinely new executable plan authored mid-window (F6 §2
mechanism 2: WS4's proof plan or any live-lane plan landing in a ratified choice-anchored
lane) whose finest choice ID is still being decided carries `pending` per V0's sanctioned
pending-gate — and LR-3 red-gates the tree. The author's options are then: mis-assign a
choice ID to pass the gate (a false edge — worse than pending), park a live executable
plan in the holding lane (mis-park; and LR-4 forces `kind: strategic`, which V0 §2.4
forbids `todos` on, stripping the plan's todo list), or fight the validator. Note the
rewrite plan itself carries `serves_strategic_choice: pending` today. LR-3 as designed is
a semantics change to a LOCKED shape presented as lane policy and ratified at the wrong
gate (Walk A ratifies lane taxonomy, not V0 contracts).

**Cure:** Either (a) route LR-3 through the V0 re-ratification path (bundle it into F5's
OG-1 sitting as an explicit V0.1 narrowing, with the mis-assignment risk stated), or
(b) soften LR-3 outside the holding lane to a **warn-with-expiry** shaped like V0 §3.4's
gate discipline (a pending value outside holding must carry a `gate` with `expires`),
which achieves the located-and-countable goal without breaking the LOCKED pending-gate.

### C3 — The closed disposition taxonomy has no permanent-home exit; ADR-200 §Goals routing is structurally unreachable

**Where:** F3 §2.1 (six classes: `named-home`, `merged-into`, `holding-lane`,
`already-complete`, `superseded-because`, `owner-rejected`); F1 §9 (orphan adjudication
mentions `register-routed` for orphans only).

**Doctrine:** ADR-200 §Goals: *"Valuable non-plan knowledge discovered en route is routed
to its permanent home (ADRs/PDRs/docs), not lost."* `no-moving-targets` /PDR-105
directionality: permanent knowledge does not live on ephemeral surfaces; plans are
ephemeral. `knowledge-preservation-over-fitness`: every item gets a disposition to its
**correct** home.

**Failure scenario:** A ledger block carrying doctrine-grade content (a hard-won
architectural constraint, a measured result, a governance rule embedded in an old plan
body — the estate demonstrably holds many; the corpus-salvage plan's entire tier-E drain
is evidence of plan-resident doctrine) reaches disposition. Every agent-assignable class
either re-expresses it into a **new plan** (`named-home`/`merged-into` — permanent
knowledge parked on an ephemeral surface, to drift again at the next estate turnover) or
parks it in holding (mislabelled as "not currently strategic" when it is actually
"not plan-shaped"). The taxonomy's closed set makes the ADR-200-required routing to
ADRs/PDRs/docs/reference impossible without a per-block taxonomy amendment. F3's falsifier
("content that fits no class") would fire at pilot — but this class is foreseeable now,
and discovering it at pilot forces an OG-2 re-ratification mid-arc.

**Cure:** Add a seventh conserving class at OG-2 — `permanent-home-routed` (content
re-expressed/routed into an ADR, PDR, rule, reference doc, or register, with the frozen
binding clause and the destination's own review path, e.g. PDR-101 quorum for doctrine
minting) — challenge-covered like the other loss-bearing classes.

### C4 — The estate-wide lane-evidence pass runs before the pilot can calibrate it (PDR-122 inversion at the F3×F4×F6 seam)

**Where:** F4 §3.2–§3.3 (bottom-up evidence verdict for *"every work-bearing inventory
unit"*, ~350–450 files, 3 lenses + cross-regime escalations, ~4.7–8.1M tokens, F4 §14) and
F4 D-6 (Walk A *"after the bottom-up evidence pass and before ANY authoring"*); F6 §1
(R1 = walk + freeze + pilot; G4 *"before any pilot authoring"*); F3 §4.2 (pilot runs the
ENTIRE pipeline; scale-up gate re-prices from pilot actuals).

**Doctrine:** PDR-122 / brief kernel: *"calibrate before scaling spend"*; *"pilot-first
sizing (~1/10th)"*; pre-run declaration re-gated on pilot actuals. F3 and F6 both bind to
this; F4's own §3.2 quorum is a judgement regime that per F3 §4.2 requires canary
calibration before real batches.

**Failure scenario:** To ratify lanes at Walk A, F4 needs the bottom-up verdicts over the
whole work-bearing estate. The pilot (B1) needs ratified lanes to exercise dispositions
and the holding lane. Therefore the single largest judgement fan-out in the protocol
(~5–8M tokens across the entire estate) executes **before** the pilot has calibrated any
judgement regime, canary set, or cost declaration — the exact "scale spend before
calibration" failure PDR-122 was minted from. If the lane-assignment regime turns out
miscalibrated at pilot (e.g. holding over-routing near F4's own 25% halt threshold), the
whole-estate evidence pass is already spent and must re-run.

**Cure:** Stage the evidence pass pilot-first, same as everything else: (i) top-down seed
+ bottom-up evidence over the **pilot area only** + F4's seed-hypothesis table → Walk A
ratifies the taxonomy with non-pilot lanes at `candidate` status and boundary sentences;
(ii) the remaining areas' evidence passes run per-batch after SP3 under the re-priced
declaration, with lane confirmations/amendments folded into the existing ruling batches
(F4 §7 already has the `taxonomy-amendment` class); or, minimally, declare the estate-wide
pass as its own owner-gated calibration tranche with canaries. F4/F6 must agree the
ordering explicitly — today F6's R1 row and F4's D-6 sequencing cannot both be executed
as written.

### C5 — Artefact homes contradict across F1/F5/F6, and one option puts the protocol's outputs inside its own denominator

**Where:** F1 D9/§3 (everything under `.agent/plans-refounding/`; frozen tree at
`.agent/plans-refounding/archive/frozen-v1/`); F6 §7 (frozen archive *"dated directory;
exact rule = F1"* — F1's rule is not dated; ledger + inventory + **mapping-table**
artefacts *"under the governing plan's directory"* — i.e. under
`.agent/plans/product-development-governance/`); F5 §4 (mapping table is
`agent-tools/src/plan-state/status-mapping/v1.ts`); F6 §7 (new lanes under
`.agent/plans/`).

**Doctrine/mechanics:** F1's own freeze rule verdicts `.agent/plans/**` (ALL files) `in`.
`important-state-not-in-temp-files` is honoured by all three — but three homes are named
for one artefact set, and F6's choice nests run artefacts inside the frozen `in` surface.

**Failure scenario:** If ledgers/inventories land under the governing plan's directory
(F6 §7), every stable-point commit writes files inside `.agent/plans/**` — every
`refound-merge-recheck` run reports the protocol's own outputs as arrivals; the amendment
queue is dominated by self-noise; and the freeze-rule's kit-4 self-exclusion (F1 §8
excludes `.agent/plans-refounding/**`, not the governing plan's directory) does not cover
them. Independently: every newly authored lane plan under `.agent/plans/` is an arrival on
an `in` surface — ~100–170 plans plus edits flow through the arrivals path with no
sanctioned-writer class, unless the freeze rule names one. And the status-mapping table
cannot be both a governed TypeScript registry (F5, correct per
`source-is-typescript-esm-only` and no-parallel-prose-copy) and a plan-directory artefact
(F6).

**Cure:** One canonical artefact map, settled at synthesis: F1's sibling root
`.agent/plans-refounding/` for run artefacts (it is outside the denominator by
construction); the mapping table lives in `agent-tools` per F5 with at most a pointer from
the governing plan; the freeze rule gains an explicit **sanctioned-writer path class**
(new-lane directories, banner diffs — F4 D-10 already closes the banner-diff class — and
accretion-logged C2 plans) so merge-recheck classifies protocol-authored writes
deterministically instead of adjudicating them as arrivals.

### C6 — New multi-writer append-only surfaces are minted without PDR-049 merge classes, in a design that maximises branch divergence

**Where:** F4 §7 (`owner-rulings-queue.md`, append-only YAML entries); F4 §9 (the
accretion log, append-only); F1 §3/§7 (`amendments/`, `sweep/sweep-hits.v1.jsonl`,
`ledger/*.ledger.jsonl`); F2 §7 (the dispatch ledger, append-only JSONL). F6 D8 runs each
batch on its own short-lived branch/worktree with multiple concurrent seats (Director,
mechanical runner, dispatcher, adjudicator, author, challengers).

**Doctrine:** PDR-049 §File-Level Metadata Contract: shared memory/state surfaces declare
`merge_class:` so semantic-union merge is mechanical
(`append-only-narrative` / `append-only-structured-by-<key>`); forbidden resolutions
include silently discarding either side. `oak-semantic-merge` is cited by F6 only for
`planning-estate-rewrite.plan.md`.

**Failure scenario:** Batch B4's branch and the Director's ruling-batch branch both append
to `owner-rulings-queue.md` (or two batches append amendments); the PR merge conflicts;
without a declared merge class the resolver line-merges or picks a side — losing a ruling
entry or an amendment row is precisely a conservation breach inside the conservation
protocol, and the denominator arithmetic (`v1 + all amendments`) silently diverges from
the amendment files' union.

**Cure:** Every new shared append-only artefact declares its PDR-049 merge class at
creation: `append-only-structured-by-ruling_id` (rulings queue),
`append-only-structured-by-amendment-id` (amendments), stable-key JSONL union for
sweep-hits/dispatch-ledger rows (taskId/attempt as key), and the accretion log by
`{date,target,source_ref}` key. F6 §6 adds a claims/queue note that single-writer-per-file
is the preferred shape where possible (one ledger file per area already achieves this) and
PDR-049 union governs the rest.

---

## MAJOR findings

### M1 — B2 banners write V0 vocabulary onto non-V0 old plans and mint a third parallel disposition vocabulary

F4 D-10: B2 sets `superseded_by: <new-plan-id>` and *"`disposition: superseded` where a
status-bearing block permits it"* on old-estate files, while F3 §2.1's ledger taxonomy uses
`superseded-because` and V0 §3.3's plan-level enum uses `superseded`. Three near-identical
labels across three vocabularies is the exact two-parallel-vocabularies defect the brief
records as a known estate disease; and editing old plans' frontmatter toward V0 shapes
brushes ADR-200 §Non-goals (*"conformance of old plans is NOT an objective"*). The body
banner + the ledger row already carry the full routing; the frontmatter edit adds a
mixed-vocabulary state on files that are about to retire. **Cure:** keep B2 body banners
(generated from ledger rows — sound) and drop the frontmatter mutation of old files, or
constrain it to `superseded_by` only and register the ledger↔V0 disposition-name mapping
explicitly in the OG-2 table so the three vocabularies have one declared join.

### M2 — `status-mapping/v1.ts` + `v2.ts` re-exporting v1 + deltas is the named forbidden parallel-file family

`replace-dont-bridge` §Forbidden explicitly lists `*.v2.ts` parallel families *"where git
history should carry the evolution."* F5 §4's need (a stable-point artefact is never
silently reinterpreted; re-runs are explicit) is real, but is satisfied by one module
exporting a versioned table structure (rows carry `added_in_version`; the module exports
`getTable(version)`), with git history carrying evolution and the run output recording the
version applied. **Cure:** single-module versioned-rows shape; the audit CLI keeps
`--mapping v1` semantics unchanged.

---

## MINOR findings

1. **S0 staging mechanics unstated at 630 files** (F1 §5 `refound-freeze` row).
   `stage-by-explicit-pathspec` demands named paths and blocks `git add -A/.`; naming ~630
   paths by hand is not going to happen honestly. Cure: stage from the freeze-manifest's
   file list (`git add` with the manifest-derived pathspec set, or `git add --pathspec-from-file`
   generated from `denominator.v1.json`) — deliberate, auditable, rule-conformant.
2. **Ledger `disposition` axis lacks a named membership validator** (F1 §3, F3 §2.1).
   The governing invariant (registry + validation for every organising axis) is honoured
   for lanes (LR-1..5) and proof kinds (registries) but the ledger's disposition column has
   no named closed-enum gate — only schema-by-convention. Cure: the tiling verifier (or a
   sibling check) rejects rows whose `disposition` is outside the OG-2 registry.
3. **F3 quorum voters get a "frozen source excerpt" (cost table §8) while kit item 7 /
   F3 §3.2 mandate untruncated decision-complete briefs for challengers.** If voter briefs
   truncate long sources, the quorum judges on partial evidence. Cure: state the voter
   brief's completeness contract (full source or per-window voting), and price it.
4. **F4's bottom-up lane derivation vs ADR-200's "streams are not derived bottom-up"
   (owner, 2026-06-22).** Lanes are not streams and new anchors are owner-gated additive
   choices (F4 §5), which respects the ruling — but the design never cites the ruling it is
   navigating around. Cure: one sentence in F4 D-3 naming the constraint and why
   choice-anchored lanes + owner-gated additive proposals satisfy it.
5. **Holding-lane items are `kind: strategic`, and V0 §2.4 forbids `todos` on strategic
   plans** — conserved todo-shaped content in held material survives only via the frozen
   binding clause. Correct by construction, but F4 §4 should say so explicitly (a held
   item's todos are conserved-by-reference, never transcribed), so an author does not
   "helpfully" copy todos into a held plan and fail the V0 gate.
6. **F6's frozen-archive row says "dated directory" while F1 names `frozen-v1`** —
   trivially reconcilable, but the synthesiser must pick one (versioned beats dated: F1's
   amendment mechanics key off the version).

---

## Conformance confirmations (checked, no finding)

- **WS2/WS4 must not wait:** honoured with real mechanisms in all six designs (F6 §2's four
  disjointness mechanisms; F5 §3.6 embeds rather than waits on WS2; F6 G1 parallel track;
  the only WS gated is WS6, which the owner rulings never protected, and the added gate is
  owner-ratified at G5). No hidden serialisation found.
- **Corpus-generalisation pending atomic landing set:** F6 D5's borrow/build boundary
  matches the plan's own dependency text (P0 blocks P1/P2; WS2 blocks P2; the refounding
  borrows ratified doctrine + tested modules, builds no closed-IE extraction, no regime
  registry, no graph renderer); the B9–B10 late ordering plus
  re-derivation-absorbs-if-timing-inverts handles the shared write surface. No
  contradiction, no duplicate machinery — with the F6 D5 falsifier standing as the tripwire.
- **never-use-git-to-remove-work:** retirement is forward filesystem change against a
  green ledger, with byte-identical frozen copies in-tree and one commit per tranche
  (I9/I10); history recoverable by construction. Conformant.
- **knowledge-preservation-over-fitness:** no discard class, no fitness-gated conservation
  anywhere; F5 D5 explicitly refuses attested-count as a gate. Conformant (subject to C3's
  missing permanent-home route).
- **V0 LOCKED handling elsewhere:** F5's proof-typed-todo extension is correctly staged as
  additive + owner re-ratification (OG-1) with the decline path priced; execution status
  stays un-stored (F5 rejects a `linear-fact` kind for exactly V0 §3.2's reason).
- **stage-by-explicit-pathspec / commit discipline:** cited and designed-in (F1 §5, F4
  D-11 commit queue, F6 D8 PR-per-stable-point), subject to Minor 1.
- **no-moving-targets:** ADR amendment content is repo-bound (allowed); run artefacts and
  banners live on ephemeral surfaces; the deferred PDR (F6 §7) keeps portable doctrine
  post-evidence. Conformant.
