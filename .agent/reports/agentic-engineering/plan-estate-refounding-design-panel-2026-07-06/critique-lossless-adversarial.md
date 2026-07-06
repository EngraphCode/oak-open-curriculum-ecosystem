# Lossless-adversarial critique — combined F1–F6 refounding design

Lens: lossless-adversarial (PDR-123 diverse-lens critic ensemble). Attack
surface: every path by which information can be lost or a completeness claim
can be false, with cross-facet interaction failures as the priority target.
Every finding cites file + section, states a concrete loss scenario, and
names the cheapest structural cure. Findings without a concrete failure path
were discarded.

Ground rule applied throughout (the designs' own): a zero from a detector
never shown to fire is not a finding (I4); the loss arithmetic's claim is
only as good as the set it divides by.

Verdict: **needs-rework** — the six facets are individually strong, but the
combined design has eight critical interaction failures, of which three break
the losslessness claim outright (C1, C4, C5), two make the run unexecutable
as sequenced (C2, C3), and one inflates the headline "two-verdict audit as
recomputation" claim (C8). All cures are structural and cheap relative to the
run; none requires abandoning the architecture.

---

## Critical findings

### C1 — Coexistence-window deltas have no working conservation path; retirement can destroy content while every loss check reads green

**Cited:** F1 §7 (amendments), F1 §5 (`refound-merge-recheck` row), F1 D4;
F4 §9 (C1 write class, "addenda diff"), F4 D10 ("banner-only diffs …
recognises by exact banner-text match"); F6 D8 (§6).

Four independent defects compose into one loss channel:

1. **Modified-arrival amendment mechanics are broken.** F1 §7 routes an
   arrival (a file *added or modified* on an `in` surface) to "(a) freeze the
   arrival — verbatim copy into `frozen-v1/…` under its mirrored path". For a
   MODIFIED file the mirrored path is already occupied by the S0 copy, and
   `refound-verify-freeze` (F1 §5) fails on "any diff, missing, or extra file
   under `frozen-*`". Route (a) is mechanically impossible as specified.
   Route (b) is "a recorded exclusion" — i.e. the delta stays outside the
   denominator, outside the inventory, outside the tiling, outside every
   proof.
2. **F4 assumes a mechanism F1 never designed.** F4 §9 C1 says post-freeze
   status/todo edits are "caught mechanically … deltas enter the inventory as
   addenda at the next stable point (scripted diff of freeze manifest vs main
   HEAD; F1)". F1's script catalogue (§5) contains no addenda-diff: only
   `refound-merge-recheck` (reports file names, not line deltas) and
   `refound-inventory --amend` (whole amendment files, which C1 arrivals
   cannot become per defect 1).
3. **Banner insertion floods the arrival detector.** F1 D6/§5 says banners
   land on live originals after freeze; every one of ~630 `in`-surface files
   then diffs against its frozen copy forever. F4 D10 asserts "the
   denominator re-derivation recognises [banner-only diffs] by exact
   banner-text match" — but F1's `refound-merge-recheck` spec has no
   banner-stripping logic at all. Either every merge-recheck reports ~630
   arrivals (halting every batch per F1 D4), or an improvised suppression is
   added under which a real edit on a bannered file hides.
4. **The detector's trigger references an abolished branch.** F1 D4/§5 runs
   merge-recheck "after every merge of `main` into the working branch". F6 D8
   abolishes the long-lived working branch (short-lived per-batch branches
   off `main`). Between batches there is no working branch and no merge
   event; C1 edits accumulate undetected until the next batch's stable
   point — and nothing at all requires a recheck between the last batch close
   and the retirement tranche, weeks later, during which F4 §9 explicitly
   keeps the old estate the live execution surface.

**Loss scenario.** Mid-window, a live lane adds a todo to a bannered plan
(sanctioned class C1). The delta either drowns in banner-diff noise (3), is
excluded via route (b) because route (a) cannot execute (1), or is simply
never detected before the tranche (4). Retirement (F6 G7; F4 §9 cutover
preconditions) checks green ledger + challenge + banners — none of which
covers post-freeze live bytes. The file is retired; the todo is destroyed;
the tiling, byte-identity, and loss checks all remain green because they
divide by the frozen denominator. This is precisely the false-completeness
class the owner directive forbids.

**Cheapest cure.** (a) Version modified-arrival copies (`frozen-v2/<path>` or
amendment-numbered paths) with their own identity proofs and scoped
inventory/tiling extension — the ledger gains delta rows, the arithmetic
stays exact. (b) Specify banner-aware comparison in `refound-merge-recheck`:
strip the exact ratified banner block (a closed sanctioned-survivor set, kit
item 4 shape), then byte-compare; anything else is an arrival. (c) Re-bind
the recheck cadence to events that exist: every stable point, every batch
open/close, AND a scripted retirement-tranche precondition — per retired
file, `live bytes == frozen + banner + routed amendments` proven in the
tranche commit gate. (d) Mutation-prove the new comparator (planted
post-banner edit must go red) per F1 D8.

### C2 — Ledger-row production is orphaned: every facet disclaims segmentation, and two unjoined quorum stages both claim the judgement

**Cited:** F1 D5 ("block boundaries are survey-layer output (F2
hypothesis-grade, F3 challenged)"); F2 §0 ("dispositions, adjudication,
segmentation, adversarial challenge → F3 judgement agents") and F2 D1 (no
role for segmentation exists); F3 §1.1/§2.3 (J4 quorum consumes "ledger
rows" that already exist; no row-production stage is designed); F4 §3.2
(lane-evidence quorum, 3 lenses per unit) vs F3 §2.3 (disposition quorum, 2
lenses per source).

F1 hands block granularity to F2; F2 explicitly routes segmentation to F3;
F3 designs no stage that produces ledger rows — its quorum votes on rows,
its challenge attacks rows, its J5 authors from rows already grouped into
homes. The single most loss-critical transformation in the whole pipeline —
turning ~55k anchored lines into ~8k semantically-bounded rows with proposed
homes — has no owner, no envelope, no verification protocol, and no entry in
F3's placed-judgement map (which is itself an H6 halt per F3 §1.1's own
falsifier: a decision attributable to no map row).

Compounding it, TWO separately-designed judgement passes overlap without a
join: F4 §3.2's lane-evidence quorum (3 same-model lenses, closed candidate
menu, per work-bearing unit, pre-Walk-A) and F3 §2.3's disposition quorum
(2 lenses, per source, post-Walk-A). Both are costed independently (F4 §14
~4–7M tokens; F3 §8 ~6–8M tokens), neither references the other's output,
and no rule reconciles a unit whose lane-evidence verdict says lane X with a
disposition row whose `home` lands in lane Y.

**Loss scenario.** Either the run stalls at S1 with no mechanism to produce
rows, or a mid-run improvisation (dispatcher "just segments") becomes exactly
the unplaced judgement the owner directive forbids — a segmenter who merges
two anchored blocks "because they obviously belong together" silently welds
a live caveat onto a completed item, and the welded row takes the completed
item's terminal disposition. Separately, an unreconciled lane-evidence/home
disagreement mis-parks content with both stages' records claiming success.

**Cheapest cure.** Declare rows = F1's mechanical anchored blocks by default
(zero judgement, already defined in F1 §9); permit block-MERGE proposals
only as an output column of a single unified judgement stage owned by F3
that emits (segmentation delta, disposition, home, lane) per row in one
quorum pass, with F4's lane evidence as an input column, and add a
mechanical reconciliation check (row home's lane must equal the lane
verdict, else J3). Add the stage to the J-map. This deletes the duplicate
quorum and its double-counted spend.

### C3 — F6's phase table inverts its own data dependencies: R0 cannot close and Walk A as sequenced drops the owner-mandated bottom-up side

**Cited:** F6 §1 (SP1 exit proof: "the recomputation tool's first
full-estate claim-vs-derived divergence report committed"); F5 D1 (audit
adapter input = "the frozen old-estate inventory (F1's scripted extraction
output)"); F6 §1 R1 row (walk listed before freeze) and §9 G4; F4 §6 (Walk A
"after the bottom-up evidence pass", warrant requiring two-verdict audit
results visible at the walk) and F4 §3.2 (evidence pass consumes F1's
denominator).

SP1 (phase R0) requires a full-estate divergence report; the audit adapter
that produces it consumes the frozen inventory that exists only after SP2
(phase R1). The gate adapter cannot substitute: the old estate carries no
V0.1 proof-typed frontmatter, so a pre-freeze gate-mode run is vacuous.
As written, R0's exit proof is unsatisfiable — and since every phase's exit
criterion "is the proof, never the clock", the roadmap deadlocks at its
first stable point. Meanwhile F6's R1 row sequences the lane-taxonomy walk
before the freeze, but F4 requires the walk after the bottom-up evidence
pass over the frozen inventory, with audit results visible. A walk run as
F6 sequences it ratifies lanes from the top-down seed alone — the "empty
cathedrals" failure F4 §3 names, and a silent drop of the owner directive's
"understand them fully, identify what they express" mandate.

**Loss scenario.** The taxonomy is ratified blind; the >25% no-acceptable-
anchor halt (F4 §3.3 falsifier) then fires mid-run against a ratified
registry, forcing either a re-walk (owner cost) or — worse — pressure to
squeeze residue into ill-fitting lanes to avoid re-opening a ratified gate.

**Cheapest cure.** Re-state SP1 as fixture-and-mutation-proof completeness
only (tool green on fixtures, red on all §3.5 mutations); insert the
explicit R1 ordering `freeze → inventory → estate-wide audit-mode run →
lane-evidence pass → Walk A → pilot authoring`. One table edit; no mechanism
changes.

### C4 — Sweep surfaces (~242k lines, ~59% of all in-scope text) are screened by a single net whose zero is never proven fireable

**Cited:** F1 §2 (sweep verdicts: `plans-old-archive` 229,768 lines;
`prompts` 11,894 lines; thread records), F1 §5 (`refound-sweep`: "fixed
non-terminal marker set"), F1 D8 (discrimination proofs enumerated for
"the residue detector, the tiling verifier, the freeze gate, and the merge
recheck" — the sweep is absent); F2 §2.1 (archive readers visit "only
windows containing at least one scripted-sweep hit"); brief (owner: "NEVER
discard contents or concepts").

The frozen denominator gets three overlapping nets, per-net diffs, residue
clustering, orphan candidates, and planted-orphan proofs. The sweep surfaces
get one keyword list, no discrimination proof (D8 omits it), no second net
(readers are gated on the very net whose misses are the question), and no
residue analysis (inventory/residue run only over the frozen tree). The
design's own blind-overlapping-nets doctrine is violated on the majority of
the line count, and the brief's Wave-0 exists precisely because non-terminal
concepts hide in the archive.

**Loss scenario.** A live intention parked in a thread record or archive
file in paraphrase — "worth returning to the ingestion redesign once the
graph lands" — matches no marker. Zero sweep hit, zero reader window, zero
residue row. The protocol closes SP6 claiming completeness; the concept is
unreachable from the new corpus forever. Nobody can even say the miss rate,
because the detector was never shown to fire.

**Cheapest cure.** (a) Extend `refound-plant-orphan` with a sweep mutation:
plant a marker-free, work-bearing paraphrase in a scratch archive copy and
assert the accepted detection path catches it — which forces the design to
HAVE a detection path. (b) Cheapest real second net: reader dispatches over
a declared-rate deterministic sample of NON-hit sweep windows (the same
grep-first, read-second economics F2 already prices), with the measured
sample yield deciding whether full coverage is needed. (c) At minimum, a
kit-10 declared residue: the G1 freeze-rule packet states verbatim that
sweep surfaces carry single-net, unproven-zero coverage, and the owner signs
that risk knowingly. (a) costs minutes; (b) costs ~1–2M cheap-tier tokens;
(c) costs a paragraph. Silence costs the completeness claim.

### C5 — Probe-decided block interiors are a silently-squeezed residue class, and the one detector covering them is never proven able to fire on net-invisible content

**Cited:** F3 §3.1 (`already-complete`/`superseded-because`: "Mechanical
probes, not semantic challenge"), F3 §5.3 (the loss check's exact claim);
F2 §6 (floors = scripted-net hits; calibration canaries = "a fabricated
work-bearing line inserted by script" with no net-invisibility requirement);
F2 D1 falsifier / OQ1 (empty set-difference drops the reader); F3 §1.1 J3
(lone in-session adjudicator).

A re-expression-ending row's probe verifies the CLAIM (artefact exists,
gate green, successor named) — it never verifies that every interior line of
the block is subsumed by that claim. F3 §5.3 is honest that the arithmetic
guarantee is "every frozen line reachable through exactly one conserving or
proven row" — but for proven rows, "reachable" means reachable in the frozen
archive only; nothing re-expresses interior content the claim does not
cover. F3's canary set (§4.1) includes mixed files ("multiple true
dispositions across its blocks") but no mixed BLOCK — the intra-block case
is untested by construction.

The sole detector for such lines is the reader's (reader ∖ script) yield.
But every continuous fireability proof the reader has (D5 floors) is drawn
from scripted-net hits — proving only that the reader recalls what the
script already found — and the calibration canaries are not required to be
regex-invisible. A reader that only ever recalls net-visible content passes
calibration perfectly, contributes zero unique coverage, and then OQ1's
falsifier ("empty set-difference → drop the reader") retires the semantic
net on the strength of a miscalibrated instrument. Finally, whatever the
reader does find routes to J3 — a lone adjudicator, the exact ~80%
lone-judge false-kill regime F3 §2.3 forbids for dispositions — on the most
loss-adjacent call in the pipeline.

**Loss scenario.** Block anchored by `status: done`, interior prose "…but
the retry logic is still unwired." Quorum assigns `already-complete`; the
probe recomputes green (the claimed artefact did land); no challenge runs
(§3.1); the reader either never fires on the caveat (unproven) or its
finding is dismissed by a lone J3 judgement. The caveat retires with the
file. Every check is green.

**Cheapest cure.** (a) Require calibration canaries AND per-batch planted
floors on pure-prose windows to be regex-invisible by construction
(misspelt-keyword shape, exactly F1 §9's plant #2 — the mechanism already
exists, it is just not wired into F2's calibration acceptance). (b) One
mechanical routing rule: a verified reader finding whose span lies inside a
re-expression-ending block voids that row's probe-decided status and routes
it to challenge/cross-regime — never lone J3. (c) Add to the batch-close
checklist (F3 §5.2): no terminal-class row may close with an
un-dispositioned reader finding inside its span. (d) Add one mixed-block
canary to the §4.1 key.

### C6 — The destination corpus's rooting collides with the freeze denominator's `in` surface

**Cited:** F1 §2 (class `plans`, glob `.agent/plans/**`, verdict `in`); F1
§5 (`refound-merge-recheck`: any add on an `in` surface = arrival, halts the
affected batch); F4 §15 OQ4 ("`.agent/plans/` refounded in place vs a new
sibling root" — open); F6 §7 (new lanes land "under `.agent/plans/`").

F6 commits the new lanes to `.agent/plans/`; F4 leaves rooting open; F1's
freeze rule makes all of `.agent/plans/**` an arrival-detection surface. If
in-place rooting is chosen, every authored new-lane plan, every accretion
(F4 §9 C2 post-Walk-A writes go "directly into the ratified lane"), and
every banner-driven README edit is an "arrival" — a permanent flood that
either halts batches continuously or gets suppressed by an ad-hoc path
exclusion, under which a GENUINE arrival (a live lane authoring an old-style
plan into a lane directory by mistake, carrying new intent) hides.

**Loss scenario.** After the exclusion is improvised, a live session writes
a real new plan under an excluded lane path in old-estate form; it enters
neither denominator nor lane validation (LR-2 runs only on lane-registered
plans that declare `serves_strategic_choice`); its intent is invisible to
both estates' proofs through retirement of everything around it.

**Cheapest cure.** Force the rooting decision to G1 and encode it in the
freeze rule itself: a named `new-corpus` class with an explicit verdict and
sub-reason (kit item 10), consumed by merge-recheck by rule; pair it with an
LR-side rule that any file under the new root NOT conforming to V0-plus-
registry is a red gate (so the carve-out cannot shelter non-lane content).

### C7 — Cross-batch shared homes mutate after challenge, un-verifying earlier batches with no re-challenge trigger

**Cited:** F1 §10 ("batches share no mutable state except the append-only
denominator" — false once homes are shared); F3 §3.4 (re-challenge fires
only on cure); F4 §9 (accretion log records additions, triggers nothing);
F3 §2.1 (`merged-into` = "union may drop a member's distinct detail").

`merged-into` and `named-home` destinations accrete rows across batches
(cross-area concept moves are exactly why F6 D7 keeps one global freeze).
Batch 2's row is challenged against the home AS IT EXISTS at batch-2 close.
When batch 7 semantic-unions its rows into the same home, the home's prose
is rewritten — the measured 33-weakens class operating on ALREADY-VERIFIED
mappings — and nothing re-opens batch 2's challenge: the ledger row stays
VERIFIED, the accretion log records the edit inertly, and Walk C's per-lane
tiling still reads green because tiling is arithmetic over rows, not prose.

**Loss scenario.** Batch 2 maps a spec constraint into home H; challenge
upholds. Batch 7's merge into H rewrites the section and drops the
constraint's operative sentence; the binding clause still points at the
frozen spec, but the re-expressed corpus no longer carries the constraint
and no check ever looks again. The owner ratifies at Walk C over green
numbers.

**Cheapest cure.** One mechanical trigger: a script joining ledger `home`
ids against git diffs of the new corpus — any commit touching a home cited
by VERIFIED loss-bearing rows flips those rows to `challenge-stale`;
`challenge-stale` rows block the affected batches' retirement tranches and
appear in Walk C inputs. Re-challenge cost is bounded by real home-edit
volume and the binding clause keeps briefs narrow (F3 §3.2).

### C8 — The "two-verdict audit as recomputation" claim is inflated: no facet designs the claim census or the claim→probe step for the old estate

**Cited:** F5 D1 ("this makes the r2-equivalent two-verdict audit a
*recomputation*"); F5 §3.1 (`proof` absent in audit mode = attested-shaped);
F2 §9/OQ2 ("unknown until F5's claim census"; "the claim census defines
locator targets"); F5 §7 F2-interface row (consumes "nothing at worker
level"); F3 §1.1 (no J-map row for per-claim probe selection).

Old-estate todos carry no proof fields; the mapping table types statuses, it
does not manufacture probes. So the audit adapter, as designed, can
recompute only that recorded values were typed — nearly the whole old estate
lands `ATTESTED`, and the audit's headline direction (resonance's
pending-but-done finds, which "justified the entire arc") requires someone
to select a probe per claim: is completion of THIS todo provable by
`merged-to-main` of WHICH ref, `path-exists` of WHICH artefact? That
selection is judgement; it appears in no J-map row (an H6 condition by F3's
own falsifier), and the census enumerating prose completion claims — which
F2 sizes its entire locator budget on (~300–700 targets, a 2× cost band) —
is designed by nobody: F2 attributes it to F5; F5's design never mentions
it. F4 §6's warrant ("audit-adjusted boundaries require the two-verdict
audit results to be visible at the walk") is therefore resting on a stage
that does not exist.

**Loss scenario direction 1 (false completeness):** the audit runs, returns
mostly `ATTESTED`, the walk sees a green-looking report, and the
pending-but-done and done-but-pending divergences the audit exists to find
are never sought. **Direction 2 (silent kill):** quorum lenses propose
`already-complete` from prose; the probe path (F3 §2.3) finds "no artefact
to probe" and falls to cross-regime concurrence — two regimes agreeing on a
plausible-sounding prose claim, with no locator-anchored evidence, is
exactly the correlated-confidence trap the measured priors warn about.

**Cheapest cure.** Add one designed stage with a J-map row: a deterministic
claim census (F1-style script: every mapped `todo_claim`/status instance +
every Net-C completion-keyword line = the census, closed and counted), then
probe-proposal as an F3-placed judgement (per claim, propose a probe from
the closed registry or emit `NO-PROBE`), with F2 locators supplying
candidate anchors for `NO-PROBE` claims before any terminal disposition.
Recompute F2's locator budget from the census, per its own pre-run
declaration doctrine.

---

## Major findings

1. **Phantom pre-partition in F3's cost model** (F3 §8: "F6's mechanical
   pre-partition (terminal/archived → sweep-class checks) plausibly leaves
   40–60% of files in the full pipeline"). No facet designs any
   pre-partition; F1 deliberately refuses per-file filters (D2) and F6's
   batches cover whole areas. Either the pre-run cost declaration is false
   by ~2× (a completeness-claim defect under PDR-122's declaration
   doctrine), or someone improvises a terminal filter — the "single biggest
   conservation risk" re-entering through the budget. Cure: delete the
   assumption or design the partition as a freeze-rule-grade, G1-ratified,
   mechanical rule (e.g. lifecycle-folder membership only).
2. **F4 consumes "inventory with stable ids" that F1 never mints** (F4 §12
   interface table, §3.3 "exemplar refs by stable inventory id … never line
   numbers"; F5 §3.1 same doctrine; F1 §3 inventory records are keyed
   `(file, line)` with no id, and F1 D6 argues frozen line citations
   suffice). The candidate-table folding script and rulings queue cannot
   cite as specified. Cure: one derived field — deterministic id =
   hash(file, line, sha1) — added to `inventory.v1.jsonl`; reconcile the
   D6-vs-kit-6 doctrine in one sentence (frozen line spans for byte
   citation, ids for cross-artefact reference).
3. **Loss-bearing locator-target classes: consumed, never produced.** F2 §5
   step 4 and §10 require F3 to declare which locator-target classes are
   loss-bearing (drives quorum-of-absence); F3 declares loss-bearing
   DISPOSITION classes only (§3.1) and its interface table (§9) never
   supplies the target-class list. A standing negative on a loss-bearing
   target would take the weak single-pass label by default. Cure: one
   declared table at OG-2.
4. **Banner coverage under defer-don't-contest is partial and untracked**
   (F4 §11 defers writes on actively-claimed areas; F4 D10's guarantee "no
   fresh reader is ever routed into an unsigned estate" then fails silently
   for deferred areas; nothing tracks banner-coverage gaps). Cure: a
   banner-coverage report (frozen manifest ⋈ live banner presence) as a
   stable-point artefact; deferred areas listed explicitly.
5. **Calibration staged-canary verification contradicts step-3 ground
   truth** (F2 §5 step 3 verifies quotes "against the FROZEN corpus at the
   cited path:lines"; §6 plants canaries in staged copies; OQ5 defers the
   path scheme). Canary replies would BYTE-reject against frozen bytes and
   trip the abort breaker; inserted lines also shift all subsequent line
   numbers, re-introducing the offset class during calibration. Cure:
   define verification ground truth as the dispatched manifest's
   hashes/bytes (the dispatcher already verifies manifest hashes), staged
   or frozen alike.
6. **F5 gate adapter wired into `repo-validators:check` over a mixed
   estate** (F5 §2 wiring; gate adapter reads "V0.1 proof-typed frontmatter
   from `.agent/plans/**`" while ~600 old-estate files are not V0 for the
   whole coexistence window). Warn-stage noise at that volume is a
   no-warning-toleration breach and trains everyone to ignore the report.
   Cure: scope the gate adapter to ratified lane roots (which requires C6's
   rooting decision — the couplings compound).
7. **F2's reader scope wording drops milestones/proposals** (F2 §2.1 "Every
   window of the frozen live-plans denominator" vs F1 §2's denominator =
   plans + milestones + proposals; F2's cost model uses 618 files/165,066
   lines — the plans class only). If window manifests are generated from
   the phrase rather than the artefact, 1,761 lines get no semantic net and
   nobody's arithmetic notices (windows ARE the reader denominator). Cure:
   one sentence — reader windows are generated from `denominator.v1.json`
   plus amendments, never from a surface name.

## Minor findings

1. F1 §5 `refound-tile` requires "block starts on anchor lines" while F1 §9
   defines `file-preamble` blocks that by construction start on non-anchor
   lines — the verifier as specified rejects its own legitimate row class.
   Cure: type preamble rows and exempt them in the rule.
2. Quorum-doctrine inconsistency: F4 §3.2 specifies 3 same-model lenses
   where F3 §2.3 rejects the third lens on measured n_eff economics —
   symptom of C2's unjoined stages, but worth one reconciling sentence even
   after the merge.
3. F1 §8.3 secret-scan hits at freeze escalate to the owner, but no
   resolution path is named that satisfies both byte-identity and
   never-discard (redaction breaks the former; freezing propagates the
   secret into history). Needs one pre-agreed rule at G1.
4. Area-count drift: brief says 17 areas, F6 §0 measures 22, F1 §10 lists
   ~20 sizes. All three defer to the enumeration script (correctly), but
   the F1 batch list should be marked derived-not-normative to stop a
   future reader treating it as the denominator.
5. Whole-file rows for non-md files (F1 §2, 38 files) reach J4 quorum whose
   voter context is "the source's frozen text" — a multi-thousand-line TSV
   in a single-turn voter context is unpriced and unexamined; declare a
   whole-file-row voting form (metadata + head sample + by-reference
   disposition) before calibration.

---

## Summary judgement

The architecture is right: scripted mechanical substrate, thin blind
workers, placed judgement, conserve-by-default taxonomy, recomputable state,
proof-gated stable points. What fails is the connective tissue — exactly the
class the panel shape predicts. Three cross-facet channels can lose content
while every proof reads green (coexistence deltas, sweep surfaces,
probe-decided block interiors); two sequencing/ownership gaps stall the run
or invite improvised judgement (row production, R0/R1 ordering); one
headline claim (audit-as-recomputation) is currently unearned. Every cure
above is a rule, a field, a script clause, or a re-ordering — cheap relative
to a 20–40M-token run, and all of them belong in the designs BEFORE G1,
because each one changes what the owner is asked to ratify.
