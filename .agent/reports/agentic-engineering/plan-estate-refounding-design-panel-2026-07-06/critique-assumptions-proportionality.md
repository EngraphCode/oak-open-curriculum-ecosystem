# Critique — assumptions and proportionality lens (PDR-123 critic ensemble)

Critic: assumptions-proportionality seat. Scope audited: unvalidated assumptions
carrying load (each marked with its falsifier), over-engineering vs the actual
goal, under-specification wearing confidence, blocking legitimacy, whether
batch sizes/stable points/thresholds are evidence-derived or invented, and the
owner-gate set. Cross-facet interaction failures were the priority target.

All six designs and the brief were read end to end. Claims below that rest on
repo facts were verified first-hand this session (area count under
`.agent/plans/`; grep confirmation of the pre-partition and segmentation
citations).

Verdict: **sound-with-revisions.** The panel's individual mechanisms are
well-warranted and honest about invented thresholds. The failures are almost
all cross-facet: a load-bearing stage owned by nobody, a phantom cost
mechanism cited circularly, a full-scale judgement pass scheduled before its
own calibration, an incoherent instrument/freeze dependency chain, and an
owner-gate set that every facet declares scale-independent but nobody sums.
None requires re-architecting; all require explicit repair before execution.

---

## CRITICAL findings

### C1 — Ledger-row production (segmentation) is owned by no facet

The conservation ledger's block rows are the protocol's central artefact:
every loss claim, tiling proof, quorum vote, and challenge brief consumes
them. Yet:

- F1 §3 says ledger rows are "produced by F2/F3", and F1 D5 (line 92) says
  "block boundaries are survey-layer output (F2 hypothesis-grade, F3
  challenged)".
- F2 §0 (line 28) explicitly routes "segmentation" AWAY from the worker
  layer: "dispositions, adjudication, segmentation, adversarial challenge →
  F3 judgement agents". F2's two roles (reader, locator) emit candidate
  spans and paraphrase hits — neither is a partition of all lines into
  blocks. F2 designs no survey role.
- F3 presupposes rows exist: J4 assigns "one closed-taxonomy disposition per
  ledger row", and the §2.3 voter judges "every ledger row of that source".
  F3 contains no mechanism, envelope, brief, verification protocol, or cost
  line for MINTING the rows. Grep confirms: "segmentation" appears nowhere in
  F3; "survey" appears nowhere in F2 or F3.

**Failure scenario.** Execution reaches the first batch with a frozen
inventory and no defined producer of `<area>.ledger.jsonl`. The gap gets
improvised in-session — exactly the unplaced judgement F3's own H6 halt
condition forbids — or the anchored-block clustering from F1 §9 (designed for
residue detection, not semantic unit-ing) silently becomes the segmentation,
producing blocks that split concepts mid-thought and forcing quorum voters to
disposition fragments. F3's own map falsifier (§1.1: "any run artefact
records a decision that cannot be attributed to exactly one row of this map")
fires on day one, because segmentation appears in no row of the map.

**Cure.** One facet must own it explicitly. The cheap, doctrine-consistent
shape: default blocks = F1's deterministic anchored blocks (zero LLM tokens),
with a named judgement site (a new J-row in F3's map) for merge/split
adjustments proposed at disposition time and verified by the tiling checker.
Whatever the choice, the row-minting stage needs an envelope, a verification
step, and a cost line — currently it has none of the three.

### C2 — The "mechanical pre-partition" is a phantom mechanism cited circularly by two cost models

- F3 §8 (line 518): "F6's mechanical pre-partition (terminal/archived →
  sweep-class checks) plausibly leaves 40–60% of files in the full pipeline.
  Estimated judgement surface: ~3,000–5,000 ledger rows across ~350–500
  work-bearing sources."
- F4 §14 (line 676): "~618 files (minus F3's mechanical pre-partition of
  terminal/sweep-class sources … assume 350–450 enter the judgement stage)."
- F6 designs no such pre-partition. F6's Wave-0 sweep covers
  `.agent/plans-old-archive/` only (a non-freeze surface); its batches
  process every live area in full. Grep confirms the term appears only in
  the two citing files.

Each facet's cost model rests on a 40–60% volume reduction attributed to a
sibling that never designed it. Meanwhile F6 §10 independently derives
"~8,000 ledger rows" from the 32%/6.5-lines-per-row priors — a ~2×
disagreement with F3's 3,000–5,000 that nobody reconciles.

**Failure scenario.** The pre-run cost declaration (a D-kernel invariant, an
owner-visible artefact) is assembled from facet models. Either the phantom
reduction is silently dropped (declared spend nearly doubles vs F3/F4's
stated totals, surprising the owner at scale-up) or someone builds a
terminal-file filter mid-run without a ratified rule — a per-file judgement
filter, "the single biggest conservation risk" by resonance's own finding and
F1 D2's explicit prohibition.

**Cure.** Either design the pre-partition as a real F1 rule-driven mechanism
(a freeze-rule-grade classifier over lifecycle folders, owner-ratified at G1,
with `archive/`-folder membership as the only mechanical criterion) or delete
the assumption from both cost models and re-issue the estimates at full
volume. Reconcile the 3–5k vs 8k row estimates in the same pass.

### C3 — F4's full-estate lane-evidence quorum runs at scale BEFORE any calibration

F4 §3.2 sends every work-bearing unit (its own estimate: 350–450 files)
through a 3-lens quorum plus cross-regime escalation on 15–25% of files —
~4.6–8.1M tokens by F4's own model — as Walk A's mandatory input. F4 D-6:
Walk A comes "after the bottom-up evidence pass and before ANY authoring".
F6 places Walk A (gate G4) in R1, before pilot batch B1.

So the single largest pre-pilot LLM spend in the whole protocol executes at
full estate scale before the pilot exists. F3's calibration machinery
(canaries, sealed key, abort breaker, scale-up gate OG-5) covers disposition
assignment only — no canary set, planted defect, or pilot gate covers lane
assignment. This directly contradicts the brief's PDR-122 ground truth
("calibrate before scaling spend", pilot-first sizing ~1/10th) that every
facet elsewhere honours.

**Failure scenario.** The lane-assignment briefs are miscalibrated (e.g. the
closed candidate menu is mis-cut — F4's own >25% no-acceptable-anchor
falsifier anticipates exactly this), discovered only after 5–8M tokens are
spent and Walk A is prepared on bad evidence. F4's falsifier then forces
halt + re-derive + full re-run — the most expensive possible place to learn
it.

**Cure.** Stage the evidence pass: run it over the pilot area (plus a small
stratified sample of other areas) first, with a lane-assignment canary set
(known-anchor files sealed like F3's OG-3 key), gate full-estate rollout on
that calibration, and let Walk A ratify from staged evidence with the
remainder folded in at the first ruling batch. This costs one extra
sequencing step and removes the largest uncalibrated spend in the design.

### C4 — The R0/R1 dependency chain is incoherent: SP1's exit proof needs artefacts that only exist at SP2

- F6 SP1 (phase R0 exit): "the recomputation tool's first full-estate
  claim-vs-derived divergence report committed."
- F5 D1: the audit adapter "reads the frozen old-estate inventory (F1's
  scripted extraction output)".
- The frozen inventory exists only after the freeze + inventory run — F6's
  SP2, in R1, a phase AFTER R0.

SP1 as written is unsatisfiable. Compounding it, F6 R1 lists its content as
"Lane-taxonomy owner walk (F4); the whole-estate atomic freeze + denominator
commit; pilot" — walk before freeze — while F4 requires the evidence pass
over the frozen inventory as Walk A's input. The true dependency order
(freeze → inventory → evidence pass → Walk A → pilot) is stated by no facet
and contradicted by two. Finally, F6 makes "R0 before any freeze" a
"phase-ordering commitment" on kit-item-9's authority — but kit item 9
warrants tool-before-AUDIT, not tool-before-FREEZE. The freeze needs only
F1's freeze scripts; holding a cheap, churn-exposed freeze hostage to the
full instrument phase (2–4 sessions) is a blocking-legitimacy defect: the
estate merges daily, and every week of delay grows the amendment stream the
run must absorb.

**Failure scenario.** A Director executing F6 literally either cannot close
SP1, or closes it by running the audit against the live unfrozen tree — an
input the adapter was not designed for and whose numbers the frozen
denominator will not reproduce.

**Cure.** Re-cut the boundary: allow freeze + inventory (S0/S1) to land as
soon as F1's freeze/inventory scripts pass their mutation proofs, in
parallel with the remaining R0 instrument work; move SP1's full-estate
divergence report to a post-freeze checkpoint; restate R1's internal order
as freeze → inventory → evidence pass → Walk A → pilot.

### C5 — The owner-gate union is never aggregated, contains duplicates and a contradiction, and misses one genuine owner moment

Every facet claims a scale-independent owner spine (I8/I11) — but only for
its own gates. The union: F1 G1–G3; F3 OG-1–OG-5; F4 Walk A + 3–6 ruling
batches + Walk C; F5 OG-1–OG-3; F6 G2–G8 (G7 recurring per tranche). Even
with the batching each facet promises, this is ~15–20 distinct owner
sittings/decision packets, and F6's declared spine (8 moments) omits F1's
G1/G2/G3 and F5's OG-3 entirely. Defects within the set:

- **Duplicate:** F3 OG-2 and F5 OG-2 both ratify the status-mapping table
  (F3's version bundles it with taxonomy + thresholds; F5's is a standalone
  PR gate). One table, two ratification ceremonies, no facet reconciles them.
- **Contradiction:** F6 §9 strikes Commission through as done ("this
  directive — done") while F3's OG-1 loads Commission with content not yet
  ratified (the placed-judgement map, the no-discard taxonomy principle). One
  facet believes a gate is closed that another facet is still filling.
- **Missing owner moment:** per-area authority CUTOVER (F4 §9 — the moment
  first-read routing flips to the new lane and the old estate stops being
  the area's execution surface) is gated only on mechanical/challenge
  preconditions; no owner sanction. Yet the strictly less consequential
  retirement (deleting already-superseded bannered files whose bytes are
  frozen) IS owner-gated (F6 G7). The consequence asymmetry is inverted:
  cutover is where a wrong lane taxonomy starts misrouting live work.
- **Gate-theatre risk:** F3 OG-2 asks the owner to ratify invented technical
  constants (the 2% overturn threshold, canary mismatch budget) that F3
  itself says have "no principled derivation". Ratifying numbers the owner
  has no basis to evaluate manufactures accountability without judgement.
  These belong in the packet as declared executor constants, owner-visible,
  not owner-ratified.

**Cure.** One consolidated owner-gate register (natural F6 deliverable):
every gate, owning facet, packet content, expected sitting length; duplicates
merged; Commission's content settled; a per-area cutover sanction added
(cheap — it can ride the existing ruling batches); invented constants
downgraded from ratified to declared.

---

## MAJOR findings

### M1 — F3 and F4 draw opposite conclusions from the same n_eff prior (F3 §2.3 vs F4 §3.2)

F3 rejects the third same-model lens as measured waste ("the third same-model
lens adds ~0.4 effective votes — bought only where it changes routing"),
citing n_eff ≈ 1.4 / phi ≈ 0.55. F4 specifies "3 same-model lenses
(n_eff ≈ 1.4 — treat agreement as weak evidence)" for lane assignment,
citing the same measurement. Same prior, same protocol, opposite spend
decisions, no facet acknowledges the divergence. Either the third lens
changes routing (then F3's dispositions under-spend) or it does not (then
F4's evidence pass over-spends ~33% of its lens budget, ~1.5–2.5M tokens).
**Cure:** one ratified lens-count rule at OG-2, applied by both stages;
the pilot's committed checkpoints already make the third-lens counterfactual
measurable (F3 §10.4) — use that measurement for both.

### M2 — The reader role's warrant is thinner than its price, and its keep/drop bar is not evidence-derived (F2 §2.1, OQ1)

Full tiling (every frozen line in exactly one ledger row) plus
challenge-ALL-loss-bearing-rows already guarantees every line's conservation
regardless of whether any reader ever runs. The reader's actual contribution
is block-granularity/omission hints — quality assistance, not conservation.
The measured prior cuts against it: resonance's workers "caught nothing the
dispatcher missed" (F1 D1 quotes this). Yet F2 defaults to reader coverage of
EVERY window (~3.5–5M tokens plus the full verification machinery), and the
calibration keep/drop bar is "set-difference yield is non-empty" — a single
hit in a 3.5k-line pilot licenses estate-wide rollout at 47× pilot scale.
**Cure:** invert the default (reader earns rollout area-by-area from
measured pilot yield per 1k lines, with a declared value-density threshold),
or re-warrant the reader explicitly as a granularity-quality mechanism and
price it against the challenge layer's existing coverage of the same risk.

### M3 — Invented bounds where a free measurement exists today (F1 §4, F6 §10)

The anchor-ratio halt band (20–70%), the expected anchor set (50–65k), the
32% work-bearing ratio, and the ~8,000-row estimate are all extrapolated
from one resonance datapoint (32.4% of 4,452 lines). But the nets are
deterministic scripts over a corpus that is sitting in the working tree
right now: the actual anchor ratio, per-net capture counts, anchor-block
size distribution, and row-count denominator are measurable this week for
zero LLM tokens, before G1 ratifies the net design and the residue bounds
(25-line block bound, 5% anchor floor) that currently hang off the
extrapolation. Ratifying invented bounds when the true value is a dry run
away violates the estate's own verify-data-supports-shape-before-building
rule. **Cure:** a pre-G1 dry-run of the nets over the live tree (read-only,
freeze-independent); replace the band with the measured value ± a declared
tolerance; size the residue bounds from the real block-size distribution.

### M4 — Mass B1 bannering's merge-conflict blast radius is unexamined (F4 §10, D-10)

B1 inserts a banner block into every in-scope live original (~630 files) in
one operation, on an estate with daily remediation branches merging to main.
Every open branch touching any plan file inherits a conflict or a semantic
merge burden; the designs price the denominator-recheck side (closed
banner-diff class) but never the cost imposed on OTHER lanes' in-flight
branches. Neither F4's nor F6's rejected-alternatives lists consider
per-area bannering at batch open, or a README/registry-level notice for
not-yet-batched areas. **Failure scenario:** week one of the coexistence
window, three active branches hit conflicts on files the refounding never
needed to touch yet, and the refounding becomes the estate's top friction
source before producing any value. **Cure:** banner per-area at batch open
(the freeze copy, not the banner, is what protects the denominator; B1's
reader-routing value for a not-yet-batched area is served by the first-read
surface notice F4 already designs).

---

## MINOR findings

1. **Cost totals do not sum (F6 §10).** Facet models total ≈ 27–46M tokens
   (F2 8–16M + F3 12–18M + F4 ~5–8M + authoring 2–4M); F6 declares "order
   20–40M" for the whole arc. The pre-run declaration doctrine both cite
   demands the summed number with the phantom-pre-partition question (C2)
   resolved first.
2. **F1's batch arithmetic uses a stale area count.** F1 §10 says "17 areas"
   and "All 17 area batches closed" while listing 20 spread values; the live
   tree has 22 top-level directories (verified; F6 measured the same). F1's
   own D9/§10 claim of first-hand grounding is contradicted; harmless only
   because the denominator script re-enumerates — but the S2 definition
   should not hardcode a number at all.
3. **The Wave-0 sweep marker set is an ungoverned placed judgement (F1 §5).**
   `refound-sweep` greps "the fixed non-terminal marker set" — a keyword-list
   judgement exactly like Net C's, but absent from G1's ratification list.
   Add it to G1.
4. **FLOOR selection can reject correct reader behaviour (F2 §6).** Floors
   are "scripted-net hits", but net hits (headings, table rows) are not
   necessarily within the reader's work-bearing target definition; a reader
   correctly omitting a non-work-bearing floor line takes a false FLOOR
   reject. The "checkbox todo" example is safe; the rule "K = min(3,
   scripted hits)" is not restricted to it, and the fallback when a window
   has no checkbox lines is unspecified. Restrict floors to target-definition
   -conforming hit classes.
5. **F5 OG-2 re-ratifies an already-owner-signed artefact.** Table v1 is by
   F5's own account "a transcription plus completion" of the owner-signed V0
   §3.5 map; a full ratification ceremony for a transcription is gate
   inflation — the completion delta is the only genuine owner content. Fold
   into F3's OG-2 (also cures the C5 duplicate).
6. **Several F1 decisions declare no falsifier (D4, D7, D8)** against the
   brief's decision-contract ("each with warrant + falsifier"). For D7 the
   axiom claim is defensible; D4 and D8 could state real falsifiers (e.g.
   gate-runtime cost exceeding a declared bound) rather than "none".

---

## What the lens found sound (stated for balance)

- The freeze-as-data-artefact rule, atomic single denominator, amendment
  mechanics, and discrimination-proof discipline (F1 D2–D8) are
  proportionate and evidence-grounded throughout.
- The no-discard disposition taxonomy enforced by type-system absence
  (F3 §2.1) is the strongest single design move in the set.
- The probe-first, cross-regime-second terminal path (F3 §2.3) spends the
  quorum budget exactly where the measured one-directional kill bias says
  it must.
- The invented thresholds that CANNOT be measured yet (H3's 2%, the 25%
  no-anchor halt, the 20% UNMAPPED halt) are consistently flagged as
  declared-not-derived and scheduled for pilot re-examination — the honest
  handling of an unavoidable invention.
- F5's engine/adapter split, registry-backed proof kinds, and
  attested-as-signal-never-gate are all correctly warranted against
  named doctrine, with real falsifiers.
- F6's pilot choice (whole small area, zero live claims, ~0.8× the only
  existing wall-clock prior) is the best-derived batch decision in the set.
