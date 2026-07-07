# F3 — Judgement and Error Correction

Facet design for the Oak plan-corpus refounding protocol (design brief
`tmp/refounding-designs/brief.md`, panel per PDR-123). This facet owns:
where judgement is PLACED; quorum design for dispositions; the
disposition-class-stratified adversarial challenge; calibration canaries and
pilot gating; per-batch loss checks; and the error-correction ladder.

Governing doctrine honoured throughout: PDR-122 (atomic judgement,
deterministic aggregation, conserve-by-default, calibrate before scaling
spend), `agentic-judgment-conserve-by-default`, invariants I1–I12 from the
ARC channel (`.agent/collaboration/rapid-comms/wildfire-herds-sulphur-and-kiln-tracks-basalt.md`
— treated as ground-truth constraints), and the resonance measured priors
(n_eff ≈ 1.4 effective votes from 3 same-model lenses, phi ≈ 0.55;
cross-regime disagreement 40%, one-directional toward kill; zero overturns /
33 weakens localised in named-home/merged-into).

Design stance: restraint by default. Every mechanism below carries its
warrant and a falsifier. Where a sibling facet owns a mechanism, this design
names the interface and does not re-design it.

---

## 1. The placed-judgement map

Kiln's Q2 finding is the organising truth of this facet: **judgement is never
eliminated, it is placed** — made once, above the line, ratified, then frozen
into mechanism below the line. The owner's "if they make judgements we lose
information" is a statement about *unplaced* judgement (micro-judgement
leaking into workers as "fixes"), not a demand for a judgement-free protocol.
A protocol with no placed judgement is impossible; a protocol with unplaced
judgement is lossy. So the first deliverable of this facet is the complete
map: every site where judgement exists, who holds it, what ratifies it, and
what mechanism executes below it.

### 1.1 The map

| # | Judgement site | Holder | Ratified by | Mechanism below the line | Facet owning the mechanism |
| --- | --- | --- | --- | --- | --- |
| J1 | **Rule authoring** — the freeze source rule (which surface classes can hold a conservable planning concept), extraction-net design, tiling-unit definition, probe design, batch-partition rule (terminal vs orphaned vs live-linked) | Protocol executor (Director seat) | Owner sign-off at commission; adversarial review by a fresh-context critic before execution (I1) | Scripts apply the rules deterministically; rules are versioned files; a rule change mid-run is a versioned amendment that re-runs the affected class | F1 |
| J2 | **Versioned mapping tables** — (a) status-vocabulary map: every emergent `status:` value → V0 axes, extending the ratified §3.5 migration map in `.agent/plans/product-development-governance/plan-node-schema.v0.md`; (b) free-text-axis maps: `serves_stream` values → governed lane/stream registry entries; (c) the reference-class table for repoint (work-ref / record-ref / name-only / STOP) | Executor authors; owner ratifies | Owner gate OG-2 (§6) before batch 1; amendments are versioned rows with dates, batched to mid-flight rulings | Script applies the table per item — zero judgement per item; **unmappable values are a NAMED residue class routed to J3, never squeezed into the nearest type** (Kiln Q4.2) | F3 (this design, §1.2) with F5 (table lives beside the V0 schema) |
| J3 | **Adjudication** — net set-differences, orphan candidates, residue blocks, mapping-table residue, quorum non-concurrence fallout | In-session executor (context-holder), by design; each instance recorded with its evidence | Recorded per instance in the batch record; owner-grade items batch to OG-4 | Deterministic routing decides *what reaches* adjudication (set-difference arithmetic, residue clustering, quorum math); adjudication decides only the item in front of it | F3 |
| J4 | **Disposition assignment** — one closed-taxonomy disposition per ledger row (§2.1) | Quorum of single-turn voter agents; aggregation in code | Quorum design §2; challenge layer §3; canaries §4 | Code computes every count, class census, routing, and the disposition itself from typed per-row votes (PDR-122 inv 1); voters never see or compute aggregates | F3 |
| J5 | **Re-expression authoring** — writing the new intent-lane plans that coherently re-express what the old corpus expressed (the Oak-specific step resonance did not need at this intensity) | Synthesist agent(s) with full frozen-source context | Verified by the challenge layer (§3) — 100% of loss-bearing rows — plus the frozen-spec binding clause bound at authoring (I7/kit 2) | Binding clause + stable-id citation are template-enforced at authoring, not post-hoc | F4 (lane content), F2 (authoring envelope); F3 owns the verification |
| J6 | **Owner gates** — commission; lane-taxonomy walk; mapping-table ratification; batched mid-flight rulings; `owner-rejected` dispositions; proof-typed-todo extension sign-off; final recomputed-state walk | Owner, exclusively | The gates ARE the ratification; scale-independent count (I8/I11) | Everything between gates is delegated and verifiable; gate inputs are recomputed, never remembered | F3 (§6) with F4 (walk designs) |

Below the line, and therefore **forbidden to carry judgement**: extraction,
counting, tiling arithmetic, byte-identity, denominator derivation and
re-derivation, quorum arithmetic, budget arithmetic, batch routing, loss
checks, planted-defect injection and detection bookkeeping. All scripts
(F1); scripts recompute, never record.

**Warrant**: this is resonance's measured residual-judgement map (Kiln Q2)
made explicit for Oak, plus PDR-122 invariant 1. Every judgement-leak
resonance recorded (worker "fixes", mis-designed probes, false gate premises)
traces to judgement that had escaped placement.

**Falsifier**: if during the pilot any run artefact records a decision that
cannot be attributed to exactly one row of this map, the map is incomplete
and the run halts for a map amendment (this is itself a Level-3 halt
condition, §5.4 H6).

### 1.2 The versioned mapping tables — construction rules

- **Never normalise at extraction** (Kiln Q4.1). Workers and scripts carry
  both status vocabularies and all free-text axis values VERBATIM into the
  inventory. The ledger conserves lines, not interpretations.
- **One table, versioned, script-applied.** Each table is a committed file:
  `old value → typed target`, with a version header, a date, and the owner
  ratification reference. Judgement placed at the table, zero judgement per
  item. The §3.5 migration map already covers the ~30 emergent `status:`
  values — the protocol *extends* it (any value the census finds that §3.5
  lacks becomes a residue row), it does not re-author it.
- **Residue is a named class.** A script hit with no table row emits
  `UNMAPPED: <value> at <file>:<line>` into the adjudication queue (J3).
  The per-batch residue count is a declared metric with a threshold (§5.4);
  growth past threshold forces a versioned table amendment and a class
  re-run, not per-item improvisation.
- **The old fields never produce state verdicts.** Recorded status is a
  claim; the two-verdict probe set (F5) produces truth (Kiln Q4.3). Expect a
  high `attested` count on first typing — that count is the honest quality
  signal, reported, never silently converted.

---

## 2. Quorum design for disposition assignment

### 2.1 The closed disposition taxonomy

Six classes, closed at owner gate OG-2. Adapted from resonance's five to
Oak's re-expression mandate (not all Oak plans align with current strategy;
NEVER discard contents or concepts):

| Disposition | Meaning | Loss profile | Verification lane |
| --- | --- | --- | --- |
| `named-home` | Content re-expressed into a named todo/section of a new intent-lane plan, with a frozen-spec binding clause | **Loss-bearing** (concept kept, spec detail dropped — resonance's 33-weakens class; Oak's re-expression raises the risk because prose is rewritten, not transplanted) | Adversarial challenge, ALL rows (§3) |
| `merged-into` | Content merged with other rows into one new home (semantic-union, PDR-049) | **Loss-bearing** (union may drop a member's distinct detail) | Adversarial challenge, ALL rows |
| `holding-lane` | Not currently strategic; conserved verbatim-by-reference in the holding lane (F4) with a one-line intent summary + binding clause to the frozen file | **Loss-bearing in one direction only**: mis-parking (live strategic intent buried). Detail loss is structurally excluded — the frozen file IS the content | Adversarial challenge, ALL rows, with a narrowed mis-park brief (§3.3) |
| `already-complete` | The work landed; the row records completion with a typed proof | Re-expression-ending (§2.2) | Mechanical two-verdict probe (F5): the claimed proof must recompute green AND the did-it-already-land probe confirms; no semantic challenge needed |
| `superseded-because` | A named successor plan already carries this intent; `superseded_by` edge present | Re-expression-ending (§2.2) | Mechanical probe: successor exists, edge present, successor names the superseded item; the frozen original remains the detail contract |
| `owner-rejected` | Owner, per item, at a gate, with a recorded reason | Owner-only; **no agent or batch operation may assign it** | The gate record is the proof (`ratified` kind) |

There is deliberately no `discard` class. Conserve-by-default means the
taxonomy itself has no lossy exit an agent can take: every agent-assignable
class conserves (a new home, a merge, a holding-lane parking with the frozen
file as detail contract, or a proof that the intent is already realised or
carried). "Discard is never a batch operation" is enforced by the type
system, not by vigilance.

**Warrant**: PDR-122 invariant 2 + the measured ~80% false-kill rate of lone
adversaries; the owner directive "NEVER discard contents or concepts".
**Falsifier**: if the pilot surfaces content that genuinely fits no class
(not even holding-lane), the taxonomy is wrong and goes back to OG-2 as an
amendment — SURVEY-MAY-ADD-VALUES is the V0-sanctioned path.

### 2.2 The reversibility split — which dispositions need what

The irreversibility axis here is subtle and must be stated exactly. Because
the freeze conserves every byte, no disposition destroys content. What a
wrong disposition destroys is **re-expression**: a false `already-complete`
or false `superseded-because` means live intent is never carried into the
working corpus — recoverable in principle from the frozen archive, silently
wrong in practice. That is exactly the false-kill error class (visible
false-keep vs vanishing false-kill), so PDR-122 risk-tiering applies to it:

- **Conserving dispositions** (`named-home`, `merged-into`, `holding-lane`):
  a mistake is visible and reversible downstream — the challenge layer
  attacks every one of these rows anyway (§3), and a mis-assignment between
  conserving classes loses nothing (the binding clause reaches the frozen
  detail either way).
- **Re-expression-ending dispositions** (`already-complete`,
  `superseded-because`): a mistake is the silent-kill class. The measured
  cross-regime result (40% disagreement, one-directional toward kill) says
  same-model quorums are structurally biased toward exactly this error.

### 2.3 The quorum mechanism

**Design principle from the n_eff measurement**: 3 same-model lenses buy
≈ 1.4 effective votes (phi ≈ 0.55). Adding same-model voters buys almost
nothing — correlated confidence is the trap. The levers that work are
(a) regime diversity for the dangerous direction, and (b) mechanical proof
replacing votes wherever a probe can decide. Spend accordingly.

**Voter envelope** (interfaces to F2): single-turn, no-tools voters
(measured 7–17× cheaper, ~3× faster — PDR-122 inv 4). One voter call per
SOURCE, judging every ledger row of that source in one pass (per-item typed
verdicts, per-row rationale ≤ 2 sentences; the call context is the source's
frozen text + its ledger rows + the closed taxonomy + the ratified lane
registry). Per-source calls follow Kiln Q1.4's economics: cost scales with
source count, not line count. Voters emit per-row judgements ONLY — never a
count, never a batch summary, never "and overall…" (PDR-122 inv 1).

**The quorum ladder** (all aggregation in deterministic code):

1. **Two regime-A lenses vote every row.** Lenses are distinct briefs over
   the same model: Lens-C (*conservation lens*: "what does this content
   express; where must it live so nothing is lost?") and Lens-S (*strategy
   lens*: "what is this content's relationship to the current vision/
   strategy/lane registry?"). Two, not three: the third same-model lens adds
   ~0.4 effective votes — it is bought only where it changes routing (step
   3), not as default spend.
2. **Code routes on agreement:**
   - Both lenses agree on a **conserving** class → disposition assigned;
     row proceeds to the challenge layer like every other row.
   - Lenses disagree, but both name conserving classes → row is assigned
     the MORE conserving class deterministically (`holding-lane` >
     `merged-into` > `named-home` in conservation order is NOT assumed;
     instead: disagreement between conserving classes routes to J3
     adjudication with both rationales attached — cheap, and the executor
     sees the real ambiguity rather than a coin-flip).
   - **Any lens proposes a re-expression-ending class** → step 3. Never
     assigned from step 1, regardless of agreement.
3. **Re-expression-ending path — proof first, then cross-regime:**
   - The row is handed to the mechanical probe (F5): for
     `already-complete`, the two-verdict probe; for `superseded-because`,
     the successor/edge probe. **A green probe decides the row** — a
     recomputation outranks any number of votes and costs no judgement.
   - Probe cannot decide (no artefact to probe, successor coverage
     ambiguous) → **cross-regime concurrence required**: one regime-B vote
     (a genuinely different judgement regime — different model tier, or
     materially different envelope: tools + multi-turn where regime A was
     no-tools single-turn; the regime pair is declared at OG-2 and
     recalibrated on any change, PDR-122 inv 6). Code requires regime A
     (both lenses) AND regime B to concur on the terminal class.
   - Non-concurrence → **conserve**: the row takes `holding-lane` (or
     `named-home` if a lens proposed one) and is flagged
     `terminal-candidate` for the next batched owner ruling (OG-4). Nothing
     is terminal by fallback.

**Warrant**: the cross-regime measurement (40% disagreement, one-directional
toward kill) is direct evidence that same-model concurrence on a kill-shaped
verdict is uninformative; PDR-122 inv 2 places the quorum burden on the
irreversible side only, which is what keeps this affordable at 37× scale.
**Falsifier for the two-lens default**: if pilot canaries show
conserving-class assignment errors that a third lens would have caught
(measured, not assumed — re-run the pilot votes with a third lens over the
committed checkpoints, PDR-122 inv 5's "unmeasured often means unanalysed"),
promote to three lenses for the full run.

**Rejected alternatives**:
- *Five same-model voters with majority*: buys ≈ 1.6–1.8 effective votes for
  2.5× the spend of two lenses; the n_eff measurement says count is the
  wrong lever. Rejected on measured economics.
- *Single strong adjudicator per row*: the lone-voter ~80% false-kill result
  forbids it for terminal classes, and for conserving classes it removes the
  disagreement signal that feeds adjudication. Rejected on PDR-122.
- *Letting a unanimous regime-A quorum assign `already-complete` without
  probe or regime B*: the one-directional-toward-kill measurement is
  precisely about confident same-regime agreement being wrong. Rejected on
  the measurement.

---

## 3. Disposition-class-stratified adversarial challenge

### 3.1 Stratification (the resonance zero-overturns/33-weakens lesson, applied)

Semantic loss localises entirely in the classes where prose is re-expressed.
The challenge budget goes there — all of it:

| Class | Challenge treatment |
| --- | --- |
| `named-home`, `merged-into` | Fresh-context adversarial challenge of **ALL rows — including, especially, the clean-looking ones** (the 33 weakens were all in clean rows). **Never sample within these classes.** |
| `holding-lane` | Challenge ALL rows with the narrowed mis-park brief (§3.3): "does this frozen content express intent that IS strategically live under the ratified lane registry?" Detail-loss challenge is unnecessary by construction (the frozen file is the content). |
| `already-complete`, `superseded-because` | **Mechanical probes, not semantic challenge** — the probe already ran at quorum time (§2.3); at batch close it re-runs as part of the loss check (§5). Planted-defect discipline per §4. |
| `owner-rejected` | The gate record is checked for existence (`ratified` proof); nothing to challenge. |

**Warrant**: Kiln Q1.2 verbatim — "challenge ALL rows of the loss-bearing
classes; probe the rest… never sample within a loss-bearing class". This
preserves challenge-the-clean while cutting challenger volume to where loss
can exist.
**Falsifier**: if any pilot probe-class row is later found semantically
wrong in a way the probe passed (e.g. a successor that names but does not
carry the intent), the class is re-tiered to challenged and the pilot
re-runs that class.

### 3.2 Challenger design

- **Fresh context, per-source briefs** (cost scales with sources). A
  challenger sees: the source's full frozen text (untruncated — kit item 7),
  the unit definition, the source's loss-bearing ledger rows with their
  dispositions, and the TARGET text each row maps to (the new plan section /
  merge home / holding-lane entry, with its binding clause).
- **The binding clause narrows the brief** (Kiln Q1.3 corollary): the
  question is never "is all detail conserved in the new prose?" but "does
  the named home PLUS its binding clause reach this content?" — cheaper
  challenges, same guarantee, because conserved todos execute against their
  frozen spec sections as the authoritative detail contracts.
- **Closed verdict schema per row** (typed, code-aggregated):
  - `uphold` — mapping reaches the content;
  - `weaken: <named detail>` — right disposition, a specific spec detail the
    home + clause does not reach;
  - `overturn: <proposed class>` — wrong disposition, with evidence.
- Challengers judge rows; **code computes** the per-batch uphold/weaken/
  overturn census, routes weakens to cures and overturns to re-quorum, and
  evaluates the halt thresholds. A challenger is never asked whether "the
  batch" is sound.
- **Decision-complete briefs or the findings are noise** (kit item 7,
  measured: two of nine resonance critic findings were artefacts of their
  own briefs). The brief template carries the unit definition and forbids
  truncation; F2 owns the template mechanics.

### 3.3 The holding-lane mis-park brief

One question, one direction: given the ratified lane registry (F4) and this
frozen content, name any live strategic intent this content expresses that a
registry lane serves. A hit is a `weaken` routed to re-quorum toward
`named-home`. The reverse direction (strategic content wrongly parked OUT of
holding) is covered by the standard challenge on `named-home`/`merged-into`
rows. Mis-parking INTO holding loses availability, not content — which is
why it is challenged but does not need cross-regime treatment.

### 3.4 What challenge findings do (routing, in code)

- `weaken` → **cure structurally**: amend the binding clause or the home to
  reach the named detail; re-challenge the cured row (same challenger class,
  fresh instance). Cures are the expected steady-state finding (resonance:
  33 of 33 findings were weakens); with binding-at-authoring (I7) the rate
  should be low — and the pass is kept regardless, it is the only layer that
  finds semantic loss.
- `overturn` → re-run the §2.3 quorum for the row WITH the challenge
  evidence attached; count toward the batch overturn budget (§5.4 H3). An
  overturn toward a re-expression-ending class still walks the full
  probe/cross-regime path.
- Every finding, upheld or not, is a committed record (PDR-122 inv 5:
  checkpoints are a measurement corpus).

---

## 4. Calibration canaries and pilot gating

### 4.1 Known-answer canaries, seeded first (PDR-122 inv 6, D1 kernel)

Before any real batch, a canary set is constructed and sealed:

- **Composition** (~12–15 plan files, chosen so every disposition class and
  every failure direction is represented): 3–4 plans whose completion is
  independently provable from git facts (true `already-complete`); one
  known superseded pair (true `superseded-because`); 3–4 clearly live
  strategic plans (true `named-home` in an obvious lane); 2 clearly
  non-strategic but content-bearing files (true `holding-lane`); and 2–3
  deliberately hard mixed files (one file, multiple true dispositions across
  its blocks). The executor authors the answer key from first-hand repo
  evidence; the owner ratifies the key at OG-3 (cheap: it is ~15 rows). The
  key is committed sealed — voters and challengers never see it.
- **Planted defects prove every detector fires** (I4; resonance design
  property 2 — a zero from a detector never shown to fire is not a
  finding). Three standing plants, refreshed per batch:
  1. a **synthetic weakened row** — a real conserving mapping with one spec
     detail deliberately unreachable from its home + clause; the challenge
     layer must emit that `weaken` or the batch's challenge zeros are void;
  2. a **falsified `already-complete`** — a claimed-done row whose proof is
     deliberately broken; the two-verdict probe must go red;
  3. a **planted orphan line** in the extraction residue (F1 owns the
     injection harness; F3 owns the acceptance rule: no residue zero is
     accepted until the orphan is caught).
- **Deterministic abort breaker** — code, not judgement, evaluates canary
  results against the sealed key BEFORE the first real batch dispatches:
  - any canary assigned a re-expression-ending class whose key says
    conserving → **immediate halt** (the kill-direction error at
    calibration means the regime is miscalibrated exactly where it is
    dangerous);
  - more than 1 of the ~15 canaries class-mismatched in any direction →
    halt;
  - any planted defect uncaught → halt (the detector, not the corpus, is
    the defect; every zero that detector produced is void).
  Halt here costs one canary run; it is the cheapest possible place to
  discover miscalibration.

### 4.2 Pilot gating (~1/10th before any full run)

- The pilot is one plan area, ~30–60 files (F6 chooses which area; F3
  states the pilot's gate). The pilot runs the ENTIRE pipeline —
  freeze-tile (F1), worker extraction verification (F2), quorum,
  challenge, loss check, batch close — end to end.
- **Scale-up gate, evaluated in code from pilot artefacts**: canaries green
  (re-run within the pilot); per-batch loss check green (§5); overturn rate
  within threshold; weaken rate reported (informational — it calibrates
  binding-at-authoring quality); adjudication-queue rate reported; measured
  cost per source within the pre-declared estimate band (PDR-122 inv 4:
  the full-run cost estimate is RE-GATED on the pilot's real numbers, never
  carried from the guess).
- **Any judgement-regime change after the pilot** (model tier, voter
  envelope, brief template, lens set, challenge brief) is a design change
  requiring recalibration — re-run the canary set under the new regime
  before it touches a real batch. Never a drop-in swap (the 47% vs 10.6%
  regime measurement is the warrant).

---

## 5. Per-batch loss checks against the frozen denominator

### 5.1 The denominator contract

The atomic freeze commit (F1) fixes the denominator: the enumerated source
set, per-source line counts, per-source hashes. Every batch check divides by
these numbers. At Oak's daily-merge velocity, the denominator is RE-DERIVED
at every merge into the working branch (I2/I6); a re-derivation that changes
any batch-relevant count re-opens that batch's tiling before the batch may
close. F1 owns the scripts; F3 owns what "green" means.

### 5.2 The batch-close checklist (all scripted, all recomputed)

A batch closes only when every item recomputes green:

1. **Tiling**: every inventory line of the batch's sources appears in
   exactly one ledger row — zero gaps, zero overlaps — recomputed from the
   frozen files, not read from the ledger's own bookkeeping (I5/I6;
   `validators-must-recompute-not-just-record`).
2. **Disposition completeness**: every ledger row carries exactly one
   disposition from the closed taxonomy, with its required evidence
   attached — quorum record for conserving rows, probe transcript or
   cross-regime record for terminal rows, gate record for `owner-rejected`.
3. **No lossy residue**: zero rows in any non-conserving, non-proven state.
   A row that reached no disposition is a batch-blocking defect, never a
   silent skip.
4. **Challenge coverage**: 100% of loss-bearing-class rows have a challenge
   verdict; all weakens cured-and-rechallenged or explicitly carried open
   (an open weaken blocks the batch's sources from any retirement tranche —
   interface to F1's repoint-before-retire).
5. **Planted defects caught**: all three §4.1 plants for this batch fired
   and were detected.
6. **Residue audit**: the batch's uncaptured-line detector ran, its planted
   orphan was caught, and every surviving orphan was individually
   adjudicated (cure / owner-ruled-live / register-routed /
   already-absorbed — the resonance orphan-disposition taxonomy; an orphan
   is a disposition candidate, not an automatic loss).
7. **Denominator freshness**: no un-reconciled merge arrival since batch
   open (re-derive; if changed, re-tile affected sources first).
8. **Class census**: per-class row counts computed by code and appended to
   the run record — the census is where a drifting kill-rate becomes
   visible across batches (e.g. terminal-class share climbing batch over
   batch is an H4 trigger even if no single check fails).

A failed item does not "warn" — the batch stays open and the ladder (§5.4)
engages. No-warning-toleration applies.

### 5.3 What the loss check is NOT

It is not a semantic guarantee — that is the challenge layer's job, and only
its job (the layered-verification economics: mechanical recomputation
catches count/byte drift; fresh-context attack catches meaning). The loss
check's claim is exact and arithmetic: *every frozen line is reachable
through exactly one conserving or proven row*. Asking it for more would be
theatre; delivering less would be a hole.

### 5.4 Halt conditions (deterministic, pre-declared at OG-2)

| # | Condition | Action |
| --- | --- | --- |
| H1 | Canary breaker fires (§4.1) | Halt the run before batch 1 / before scale-up |
| H2 | Any planted defect uncaught | Halt; the detector's zeros for the batch are void; fix detector, re-verify the batch's affected checks from committed checkpoints |
| H3 | Challenge overturn rate exceeds threshold (default: >2% of challenged rows in a batch, or ANY overturn of a probe-decided terminal row) | Halt; executor first-hand analysis; owner briefed — an overturned probe result means the probe set itself is unsound, which contaminates every terminal row |
| H4 | Batch-close item fails and survives one deterministic re-run/re-derivation | Halt the batch (run may continue on other areas only if the failure is provably batch-local — a denominator or detector failure is never batch-local) |
| H5 | Cost backstop fires (pre-declared per-batch budget in every billing denomination) | **Fork, not failure** (PDR-122 inv 4): analyse the real number, commit checkpoints, prepare launch-ready forks, surface with a brief, stop the spend |
| H6 | An unplaced judgement is discovered (§1.1 falsifier) | Halt for a judgement-map amendment; the amendment is a versioned rule change (J1) |

Thresholds (the 2%, the canary mismatch count) are proposals ratified at
OG-2 and re-examined against pilot data at the scale-up gate — they are
declared numbers, never mid-run improvisation.

---

## 6. Owner gates (F3's slice of the scale-independent spine)

Per I8/I11 the owner-moment count does not scale with corpus size. F3
contributes these gates (F4 owns the lane-taxonomy and final-walk designs;
listed here only where F3 supplies the gate's content):

- **OG-1 Commission** — includes ratifying the placed-judgement map (§1.1)
  and the no-discard taxonomy principle.
- **OG-2 Tables + thresholds** — ratify: the disposition taxonomy (§2.1),
  the mapping tables (§1.2) including the §3.5 extension policy, the
  regime-A/regime-B pair definition, and the H-thresholds (§5.4). One
  sitting; these are a handful of small committed files.
- **OG-3 Canary key** — ratify the sealed answer key (~15 rows, each with
  first-hand evidence attached).
- **OG-4 Batched mid-flight rulings** — the standing queue: adjudication
  items the executor marks owner-grade, `terminal-candidate` flags from
  quorum non-concurrence, `owner-rejected` candidates (owner-only class),
  mapping-table amendments with policy weight, lane-registry gaps
  surfaced by mis-park challenges (routed to F4's walk design). Batched,
  never one-at-a-time interrupts; ping-before-escalate cadence.
- **OG-5 Scale-up gate** — after the pilot: the owner sees the pilot's
  recomputed metrics (canary result, loss-check record, overturn/weaken/
  adjudication rates, measured cost vs declaration) and rules scale-up.
- **(F5-owned but F3-flagged) Proof-typed todo extension** — V0 todos carry
  no proof field; adopting proof-typed todos is an additive LOCKED-model
  change requiring owner re-ratification. F3's §2.3 probe path and §5
  checks work either way (probes run against repo facts, not todo fields),
  but the destination corpus is born gated only if this signs off before
  authoring starts — sequencing input to F6.

---

## 7. The error-correction ladder

What re-runs, what escalates, what halts — every rung deterministic in its
trigger, with judgement only where the map (§1.1) places it.

**Level 0 — deterministic re-run (mechanical faults).**
Script count mismatch, parse failure at the schema-pinned boundary, format
nonconformance, hash mismatch → re-run the mechanical step once. A parse
failure is a typed value at the call site, never a default (PDR-122 inv 3).
Persisting mismatch is not a flake — it is a rule or tool defect →
Level 2.

**Level 1 — item-scope repair.**
- A worker reply failing the four-step verification (F2's protocol): one
  re-dispatch with the deviation named, then the task is pulled in-session.
  F3 consumes the signal: per-batch pulled-task and rejection rates are
  recorded metrics (resonance measured ~26 rejections / 74 dispatches —
  the rate is diagnostic of task design).
- A quorum disagreement between conserving classes → J3 adjudication with
  both rationales (§2.3).
- A challenge `weaken` → structural cure + re-challenge of the cured row
  (§3.4). Never cure by weakening the challenge.

**Level 2 — class/batch-scope escalation (design faults).**
- A **refusal-clause firing** (worker outputs `JUDGEMENT-REQUIRED`) means
  the TASK was mis-designed: the fix is at J1/J2 — re-design the task or
  amend the table (versioned), then re-run the affected class within the
  batch. **Never re-word to squeeze the judgement out of the worker** —
  that loses information silently (the owner's directive, and resonance's
  measured worker-fidelity taxonomy).
- A challenge `overturn` → re-quorum with evidence (§3.4) + overturn-budget
  accounting.
- Mapping-table residue past threshold → versioned table amendment (OG-4 if
  policy-weighted) → script re-applies to the whole affected class, not
  just new items.
- A probe or gate found to behave differently from its documented contract
  (resonance's two false runbook premises) → verify the contract first-hand,
  amend the rule, re-run every check that consumed the false premise.

**Level 3 — halt (H1–H6, §5.4).** Halts are cheap by construction: stages
are checkpointed (PDR-122 inv 5), so a halt loses wall-clock, never spend
already banked. Recovery is seeded continuation from the committed
checkpoint with a stage discriminant — never a blind resume.

**Level 4 — owner.** Only through OG-4's batched queue or an H-halt brief.
The ladder never converts a mechanical fault into an owner interrupt, and
never converts an owner-grade question into an agent improvisation.

**What never happens on any rung**: sampling to shrink a red check's scope;
batch-level discard; proceeding past a void detector zero; re-running a
failed check until it passes without a first-hand cause; silent table edits.

---

## 8. Cost model sketch

Grounded in the measured priors; every number is a pre-run declaration to be
RE-GATED when the real inventory exists (PDR-122 inv 4 — the row count below
is a guess until F1's scripts produce it, and the estimate is re-issued at
that moment and again at the pilot gate).

Assumptions: resonance density ≈ 1,443 inventory lines / 223 rows over
4,452 source lines. Oak: 165,066 lines ≈ 37×. F6's mechanical pre-partition
(terminal/archived → sweep-class checks) plausibly leaves 40–60% of files in
the full pipeline. Estimated judgement surface: **~3,000–5,000 ledger rows
across ~350–500 work-bearing sources** (~6–9 rows/source, matching
resonance density).

| Stage | Unit economics | Estimate |
| --- | --- | --- |
| Regime-A votes | 2 lenses × per-source single-turn no-tools calls; ~6–10k tokens/call (frozen source excerpt + rows + taxonomy + lane registry) | ~400 sources × 2 × 8k ≈ **6–8M tokens** |
| Probe-decided terminal rows | script + probe run; **zero LLM tokens** | — |
| Regime-B concurrence | only rows where a terminal class is proposed AND the probe cannot decide; assume 5–10% of rows, grouped per source | ~0.5–1.5M tokens |
| Adversarial challenge | per-source fresh-context briefs over loss-bearing rows; ~10–15k tokens/brief (untruncated source + targets) | ~350–450 briefs ≈ **4–7M tokens** |
| Canaries + planted defects | ~15 files through the full pipeline + per-batch plants | ~0.5M tokens |
| Cures + re-challenges + re-quorums | scales with weaken/overturn rates; binding-at-authoring should hold weakens low; budget 15% of challenge spend | ~1M tokens |
| Adjudication (J3) | in-session executor context, not fan-out spend | wall-clock, not fleet tokens |

**Total F3-owned fleet spend: roughly 12–18M tokens** — an order of
magnitude under resonance's ~1.3M-per-223-rows verification-wave intensity
scaled naively (~40× would be ~50M+), because the mechanical layers are
scripted (F1), voters are single-turn no-tools, terminal rows are
probe-decided where possible, and challenge briefs are narrowed by the
binding clause. Wall-clock: quorum and challenge calls are
embarrassingly parallel per source; the serial spine is batch-close checks
and adjudication. Per-area batch ≈ 0.5–1.5 sessions; 17 areas with F6's
stable points ≈ a multi-session arc by design, exit criterion the proof,
never the clock.

---

## 9. Interfaces to other facets

| Facet | F3 consumes | F3 provides |
| --- | --- | --- |
| F1 mechanical-substrate | Frozen denominator + re-derivation events; inventory + tiling arithmetic; planted-defect injection harness; batch/stable-point structure | The batch-close check semantics (§5.2) F1's scripts implement; H-condition definitions the breaker code evaluates; the no-retirement-with-open-weakens constraint on repoint tranches |
| F2 worker-layer | Four-step verification signals (rejection/pull rates); refusal-clause firings; voter/challenger envelope mechanics and brief templates | The voter and challenger BRIEF CONTENT contracts (closed verdict schemas §2.3/§3.2); the rule that a refusal is a J1/J2 defect, never a re-wording target |
| F4 intent-layer-and-lanes | The ratified lane registry (quorum + challenge input); holding-lane definition; owner-walk designs | Mis-park challenge findings (lane-registry gap signals); `terminal-candidate` and `owner-rejected` queues for the batched rulings; the disposition taxonomy the lanes receive rows under |
| F5 recomputable-state | The two-verdict probe set (probes decide terminal rows, §2.3); the recomputation tool (batch-close item 2's proof transcripts; the final walk's recomputed state); attested-count reporting | The versioned status-mapping table discipline (§1.2, extending V0 §3.5); the rule that old fields are claims and probes are truth; the proof-typed-extension gate flag (OG note, §6) |
| F6 sequencing-and-roadmap | Pilot-area choice; batch ordering; stable-point placement; cast design | The pilot scale-up gate definition (§4.2, OG-5); the canary-first sequencing constraint (nothing dispatches before the breaker passes); the recalibrate-on-regime-change constraint across sessions |

## 10. Open questions

1. **Regime-B definition**: is a distinct model tier available under the
   run's billing envelope, or is regime B an envelope change (tools +
   multi-turn) on the same model? The cross-regime measurement used
   distinct regimes; an envelope-only regime B needs a small calibration
   check of its own (do the two regimes actually disagree on planted
   kill-direction canaries?). Decide at OG-2.
2. **Threshold values** (H3's 2%, canary mismatch budget): proposed here,
   ratified at OG-2, re-examined at OG-5 with pilot data. No principled
   derivation exists yet — they are declared, conservative starting points.
3. **Holding-lane challenge depth**: this design rules holding-lane rows
   challenged for mis-parking only (§3.3), on the structural argument that
   the frozen file is the content. If F4's holding-lane design carries any
   re-expressed summary richer than a one-line intent pointer, the class
   re-tiers to full challenge.
4. **Third-lens promotion**: resolved empirically at the pilot (§2.3
   falsifier) — the committed pilot checkpoints make the third-lens
   counterfactual measurable for ~zero new instrumentation.
5. **Canary key authorship**: executor-authored, owner-ratified is the
   default here; if the owner prefers to author a subset personally, the
   key gets stronger and OG-3 gets slightly longer. Owner's call.

## 11. Rejected alternatives (summary)

- **Judgement-free protocol** — impossible; the honest shape is placed
  judgement (§1). Pretending otherwise is how judgement leaks into workers.
- **Bigger same-model quorums** — n_eff ≈ 1.4 from 3 lenses; count is the
  wrong lever (§2.3).
- **Single adjudicator per row** — measured ~80% lone-voter false-kill rate.
- **Sampling within loss-bearing classes** — the 33 weakens were all in
  clean rows; sampling is structurally blind to exactly the loss class this
  protocol exists to catch.
- **Semantic challenge for probe-decided classes** — spends the expensive
  layer where recomputation already decides; violates the earned-vs-theatre
  law (a check earns its cost iff it recomputes or attacks from fresh
  context).
- **A `discard` disposition with a high quorum bar** — conserve-by-default
  is stronger as a type-system absence than as a threshold; the owner
  directive says NEVER, and the taxonomy encodes never (§2.1).
- **LLM-computed batch statistics or verdicts** — the measured aggregate
  self-report defect (~0.72 self-reported vs ~0.28 actual); all aggregation
  is code (PDR-122 inv 1).
- **Post-hoc frozen-spec binding** — resonance's do-not-copy list; bind at
  authoring, keep the challenge anyway.
