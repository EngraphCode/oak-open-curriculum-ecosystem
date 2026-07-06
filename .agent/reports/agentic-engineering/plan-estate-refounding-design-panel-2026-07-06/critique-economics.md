# Economics critique — Oak plan-corpus refounding designs (F1–F6)

Critic seat: economics lens, PDR-123 diverse-lens ensemble. Date: 2026-07-06.
Method: independent cost model built from the stated priors, then each facet's
cost claims attacked against it. Every finding cites file + section and carries
a concrete failure scenario. All paths repo-root-relative.

Priors used (from `tmp/refounding-designs/brief.md` and first-hand measurement
this session):

- Resonance: 15 sources / 4,452 lines / 1,443 inventory lines / 223 ledger
  rows ≈ 17 h wall incl. owner gates; ~1.3M subagent tokens on verification
  waves. Density: **223 rows / 15 sources ≈ 14.9 rows per source**; 1 ledger
  row per ~20 source lines; 6.5 inventory lines per row.
- Oak: 618 md files / 165,066 lines, measured again this session:
  **8,809,086 bytes ≈ 53 bytes/line ≈ 13–15 tokens/line**, so one full LLM
  reading pass over the corpus ≈ **2.2–2.5M input tokens** before any output,
  brief, or re-dispatch overhead.
- Corpus-instrument measures: dominant cost lever = turns × context, not model
  tier; least-privilege agent types 7–17× cheaper; mapper-class Read agent
  ≈ 48k tokens per window locked vs ~1.27M free-tool; zero-tools voter
  ≈ 14.9k tokens.
- The verification law (brief, F3 §11): a check earns its cost iff it
  recomputes or attacks from fresh context.

---

## 1. The independent cost model

### 1.1 The reading-pass floor

Count the distinct LLM reading passes over (approximately) the whole frozen
corpus that the six designs commit to:

| # | Pass | Facet | Coverage |
| --- | --- | --- | --- |
| 1 | `refound-reader` semantic recall net | F2 §2.1 | every window of the live denominator |
| 2 | Quorum Lens-C (conservation) | F3 §2.3 | every in-pipeline source |
| 3 | Quorum Lens-S (strategy) | F3 §2.3 | every in-pipeline source |
| 4 | Adversarial challengers, untruncated source | F3 §3.2 | every source with loss-bearing rows (most sources) |
| 5–7 | Lane-evidence lenses × 3 | F4 §3.2 | 350–450 sources (excerpt-grade briefs) |

That is **5–7 corpus-scale reading passes ≈ 12–17M input tokens as a hard
floor** (passes 1–4 near-full-text at ~2.2–2.5M each; passes 5–7
excerpt-grade at ~1–1.5M each), before adding: outputs, dispatcher briefs,
schema retries, the +15% re-dispatch allowance (F2 §9), locators (3–9M, F2
§9), regime-B concurrence, cures/re-challenges (~15% of challenge spend, F3
§8), canaries, and authoring (2–4M, F6 §10). The floor arithmetic alone puts
the credible run at **~30M tokens minimum**; my corrected central estimate is
**~40–60M tokens** (per-facet corrections in §2). F6 §10's headline
"order 20–40M" has a lower band below the physical reading floor once outputs
and multi-turn billing are included, and a centre that is only reachable if
every facet's most optimistic assumption holds simultaneously.

### 1.2 Corrected per-facet bands

| Facet | Claimed | Corrected | Why |
| --- | --- | --- | --- |
| F1 run-time | ≈ 0 LLM tokens (F1 §15) | ≈ 0 — **verified sound** | All mechanical work is deterministic code; this is the design's genuine headline saving and it survives attack |
| F1/F5 build | 10⁵–10⁶ (F1 §15) + 200–500k (F5 §11) | as claimed | Precedent-anchored (patterns-index validator); credible |
| F2 workers | 8–16M (F2 §9) | **12–24M** | Reader per-dispatch priced below F2's own cited prior (finding C2); locator window token math thin (finding M3); quorum-of-absence unpriced (M2) |
| F3 quorum + challenge | 12–18M (F3 §8) | **20–28M** | Denominator rests on a phantom mechanism and a false density claim (finding C1) |
| F4 lane pass | ~5–8M (F4 §14) | 2–4M if cured, 5–8M as designed | Census-priced taxonomy derivation + a third lens F3's own doctrine rejects (finding C3) |
| F6 whole arc | 20–40M / 12–18 sessions / 4–8 weeks (F6 §10) | **40–60M / 25–45 seat-sessions** | No roll-up owns the ensemble total (C4); wall-clock contradicts the pilot anchor under the designs' own scaling law (C5) |

The **dominant term** of the corrected model: F3's quorum + challenge
(~40–45% of tokens), with F2's reader/locator layer second (~30%). In
wall-clock the dominant term is different and unpriced: **re-expression
authoring plus in-session adjudication** (finding C5). In money terms the
totals are stated in undifferentiated tokens with no tier split, so the
billing-denomination declaration PDR-122 requires cannot be derived from
these documents at all (part of C4): cheap-tier reader/voter tokens and
Fable-tier challenge/authoring tokens (F6 §10 "Fable-tier authoring") differ
in price by an order of magnitude, so the *dollar* dominant term is
plausibly challenge + authoring even where their token share is minority.

---

## 2. Critical findings

### C1 — F3's cost denominator rests on a mechanism no facet designs, plus an arithmetically false density claim

**Cite:** `tmp/refounding-designs/F3-judgement-and-error-correction.md` §8
("F6's mechanical pre-partition (terminal/archived → sweep-class checks)
plausibly leaves 40–60% of files in the full pipeline… ~3,000–5,000 ledger
rows across ~350–500 work-bearing sources (~6–9 rows/source, matching
resonance density)"); `tmp/refounding-designs/F4-intent-layer-and-lanes.md`
§14 ("minus F3's mechanical pre-partition of terminal/sweep-class sources");
`tmp/refounding-designs/F6-sequencing-and-roadmap.md` — contains **no
pre-partition design anywhere** (grep-verified this session; F6's Wave-0
sweep in §5 covers `.agent/plans-old-archive/` only, a different surface).

**The defect, twice over:**

1. *Phantom mechanism, circularly attributed.* F3 charges its spend against
   "F6's mechanical pre-partition"; F4 charges its spend against "F3's
   mechanical pre-partition"; F6 designs neither. F1's freeze is explicitly
   all of `.agent/plans/**` with no per-file filter (F1 D2, §2), and F1 D5
   requires every line of every frozen file in exactly one ledger row, every
   row carrying a disposition with quorum evidence for conserving rows (F3
   §5.2 item 2). Nothing in any design removes a source from the per-source
   quorum vote before it happens. The 40–60% discount is unbacked.
2. *False density claim.* "~6–9 rows/source, matching resonance density" —
   resonance density is 223 rows / 15 sources ≈ **14.9 rows/source** (equivalently
   1 row per 20 lines → 165k lines ≈ 8.3k rows, which is exactly F6 §10's own
   "~8,000 ledger rows"). F3's 6–9 appears to be a transcription of the
   *6.5 inventory-lines-per-row* figure into the wrong unit. F3 and F6
   disagree by ~2× on the run's fundamental unit count and neither notices.

**Failure scenario:** the pre-run cost declaration ships at F3's 12–18M; the
real inventory (SP1) produces ~8k rows over 618 sources; quorum spend alone
recomputes to ~11M (618 × 2 lenses × ~9k weighted) and challenge to ~8–11M
(most sources hold at least one loss-bearing row, F3 §3.1 forbids sampling
within those classes); the H5 cost backstop fires mid-R2 on a budget that was
never real, forcing the fork-not-failure path on every batch after B4 — pure
schedule loss caused by an estimate, not by the work.

**Cure:** delete the phantom citation; either (a) actually design the
mechanical pre-partition (a deterministic rule over lifecycle folders +
probe-decided terminal files, owned by F1, ratified at G1 with the freeze
rule) or (b) re-declare at 618 sources / ~8.3k rows. Reconcile F3 §8 with F6
§10's row estimate in one place, and re-gate at SP1 when `refound-inventory`
produces the true number (the designs already promise this re-gating —
PDR-122 inv 4 — so the cure is cheap; the defect is shipping a known-broken
prior as the declaration).

### C2 — F2 prices reader dispatches below its own cited measured prior and ignores the turns × context law it headlines

**Cite:** `tmp/refounding-designs/F2-worker-layer.md` §9 ("Tokens per reader
dispatch ~25–35k… window read ~20–25k"; subtotal 3.5–5M) against F2 §0/§1 D3
(the design's own load-bearing prior: "the dominant cost lever is turns ×
context, not model tier (PDR-122 measured)") and the brief's mapper
measurement (~48k/window for the **locked** Read-mode agent — the very
envelope `refound-reader` copies, F2 §2.1 "the probed mapper arithmetic").

**The defect:** a `maxTurns: 16` Read-only agent reading ≤10 files pays
input on the *cumulative* conversation each turn. A 10-file window at ~22k
window tokens bills ≈ Σ cumulative ≈ 120–150k raw input per dispatch;
only aggressive prompt-cache discounting brings that near 25–35k, and the
design nowhere states a cache assumption. Meanwhile the one directly
comparable measurement in evidence — the locked corpus-mapper — is ~48k per
window. F2 chose a re-derived optimistic number over its own measured
precedent. At ~140 dispatches + 15% re-dispatch: claimed 3.5–5M; at the
measured prior ≈ 7–8M; at uncached multi-turn billing ≈ 17–24M.

**Failure scenario:** calibration (1/10th of the pilot) passes on quality;
the per-dispatch cost actual comes in at 2–4× declaration; under PDR-122's
"measured cost per source within the pre-declared estimate band" scale-up
gate (F3 §4.2), the pilot FAILS its own gate for a pricing error rather than
a protocol error — or worse, the band is quietly widened, which is exactly
the estimate-rot the pre-declaration doctrine exists to prevent.

**Cure:** declare at the measured 48k/window prior; state the cache
assumption explicitly if a lower number is claimed; carry the uncached
number as the ceiling in the declaration. One-line fix, order-of-magnitude
consequence for trust in the declaration mechanism.

### C3 — F4 buys the third same-model lens that F3 explicitly rejects on the same measured prior, and the lane judgement is bought twice

**Cite:** `tmp/refounding-designs/F4-intent-layer-and-lanes.md` §3.2 ("3
same-model lenses (n_eff ≈ 1.4…)") and §14 ("3 cheap lenses ⇒ ~4–7M
tokens") versus `tmp/refounding-designs/F3-judgement-and-error-correction.md`
§2.3 ("Two, not three: the third same-model lens adds ~0.4 effective votes —
it is bought only where it changes routing… not as default spend") and §2.3
rejected alternatives. Then F3 §2.3's Lens-S brief ("what is this content's
relationship to the current vision/strategy/lane registry?" with "the
ratified lane registry" in the call context) versus F4 §3.2's whole
lane-evidence pass.

**The defect, twice over:**

1. Two facets apply the same measured prior (n_eff ≈ 1.4 from 3 lenses,
   phi ≈ 0.55) and reach opposite spending rules. F4's third lens over
   350–450 files is ~1.5–2.5M tokens buying ~0.4 effective votes — the
   precise spend class F3 §2.3 rejects as "count is the wrong lever".
2. The same underlying judgement — *which lane/strategic anchor does this
   content serve* — is purchased twice at census scale: once in F4's
   pre-Walk-A evidence pass (3 lenses × 350–450 files), then again inside
   F3's per-source disposition quorum whose Lens-S asks the same question of
   the same frozen text against the same registry. Neither cost model nets
   the other out; the ensemble pays ~4–8M for one judgement.

Moreover the F4 pass's *deliverable* is a candidate-lane table of 8–16 rows
(F4 §6). Deriving a taxonomy is a coverage problem, not a census problem: a
stratified sample (every area, every no-anchor cluster surfaced by a cheap
single-lens sweep) bounds the same table at roughly a quarter of the spend,
and the per-file assignments get re-made at disposition time anyway.

**Failure scenario:** the run pays 5–8M for the F4 pass; Walk A ratifies a
16-row table a 100-file stratified sample would have produced identically;
then F3's quorum re-derives every per-file lane relationship because
disposition rows must cite ratified `home` ids, making the F4 per-file
verdicts dead weight. 4–8M tokens with no surviving artefact that a cheaper
design would not also have produced.

**Cure:** one of — (a) fold the two passes: F4's evidence pass becomes F3's
Lens-S output consumed twice (taxonomy derivation pre-Walk-A from the same
per-row verdicts the quorum will use post-Walk-A); or (b) demote the F4 pass
to a stratified taxonomy sample at 2 lenses with escalation-only third-lens
purchase, per F3's own rule. Either way the two facets must cite one shared
lens-count doctrine.

### C4 — No facet owns the ensemble total; the headline 20–40M omits named terms and no billing denomination is derivable

**Cite:** `tmp/refounding-designs/F6-sequencing-and-roadmap.md` §10 — itemises
challenge (6–9M), adjudication + dispositions (4–8M), authoring (2–4M),
pilot (1.5–3M): **named items sum to 14–24M**, yet the headline is "order
20–40M". F2 §9's worker layer (8–16M claimed) and F4 §14's lane pass (5–8M)
appear nowhere in F6's roll-up as line items. Summing the facets' own claims
gives 27–46M *before* the C1/C2 corrections; after them, 40–60M.

**The defect:** the D-kernel doctrine both F3 and F6 invoke requires a
pre-run cost declaration "in every billing denomination" (brief; F2 §9; F6
§10). Six mutually non-additive sketches, two of which price the same work
differently (F3 §8 challenge 4–7M vs F6 §10 challenge 6–9M — same layer, no
reconciliation), with zero tier-weighting (cheap-tier voters vs Fable-tier
challenge/authoring differ ~10× in unit price), cannot produce that
declaration. There is no single number the owner can sanction and no single
number H5's cost backstop can fire against at run grain.

**Failure scenario:** each seat opens its batch with a facet-local
declaration; the run's cumulative spend crosses what any owner would have
sanctioned as a whole-arc figure without any individual H5 tripping, because
no backstop watches the sum. The scale-independent owner-gate spine (I8)
becomes the mechanism by which the aggregate number is never seen.

**Cure:** R0 produces one owned cost ledger (Director-owned per F6 §6):
per-facet lines, tier-weighted, in tokens AND currency AND wall-clock, with
the facet sketches as feeder rows; H5 re-defined against the ledger's run
total as well as per-batch lines; re-issued at SP1 (real inventory) and SP3
(pilot actuals). This is one artefact and one ownership sentence — the
cheapest critical cure in this document.

### C5 — The wall-clock claim contradicts the designs' own pilot anchor and scaling law; authoring and adjudication carry no session budget

**Cite:** `tmp/refounding-designs/F6-sequencing-and-roadmap.md` §10 ("Pilot
B1… ~1.5–2 sessions" for 16 md files / 3,537 lines; "12–18 batch working
sessions" for the whole arc; "4–8 calendar weeks"); F6 §10 and F3 §8 both
adopt Kiln Q1.4 — "cost scales with source count, not line count"; F3 §8
("Adjudication (J3): in-session executor context, not fan-out spend —
wall-clock, not fleet tokens"); F6 §10 ("~100–170 refounded plans…
10–20k tokens each") prices authoring in tokens only.

**The defect:** apply the designs' own law to their own anchor. Pilot: 16
sources per 1.5–2 sessions ≈ 8–10 sources/session. Estate: 618 sources →
**60–75 sessions at pilot rate**. F6 claims 12–18 — a 4–5× production-rate
improvement over the pilot asserted without warrant (calibration overhead
explains some of the pilot's cost, but nobody separates fixed from marginal
cost, which is the one decomposition a pilot exists to produce). Two serial
terms are absent from the session count entirely:

- **Authoring:** ~100–170 V0 plans with frozen-spec binding, provenance
  blocks, and challenge response. At any credible authoring throughput
  (5–15 plans per session including cure loops) that is **7–30 sessions of
  Author-seat time on its own** — up to double F6's entire arc budget.
- **In-session adjudication (J3):** priced by F3 as "wall-clock, not fleet
  tokens" and then never priced in wall-clock either. Queues feeding it:
  reader set-differences, orphan candidates, UNMAPPED statuses,
  conserving-class disagreements, sweep hits, DONE_BUT_RED rows, PULLED
  tasks. At ~8k rows and a 5–10% aggregate routing rate that is 400–800
  items through a single executor context — the exact in-session judgement
  load that dominated resonance's 17 h at **223** rows. The design
  concentrates judgement into one seat (correct epistemically) and then
  omits the seat's throughput from the model (fatal economically).

**Failure scenario:** the arc is declared at 4–8 weeks; authoring +
adjudication push it to 3–4 months; at Oak's daily-merge velocity the
arrival stream (F1 §7 — every arrival halts the affected batch at its next
stable point until routed) scales with calendar length, so underestimated
wall-clock *compounds*: more weeks → more arrivals → more halts and
amendment routing → more weeks. None of the six cost sketches prices this
feedback term.

**Cure:** (a) make SP3's re-pricing explicitly separate fixed calibration
cost from marginal per-source cost — the pilot's single most valuable
economic output; (b) add Author-seat and Adjudicator-seat throughput lines
(sessions per N plans / per N queue items) to the cost ledger of C4;
(c) declare the calendar figure as conditional on the multi-seat cast
running concurrently (F6 §6), since seat-hours, not calendar, is the true
unit; (d) price the arrival-routing overhead per week of arc length so the
feedback loop is visible in the declaration.

### C6 — "Scale-independent owner attention" is asserted while the designs' own escalation arithmetic saturates the ruling capacity

**Cite:** `tmp/refounding-designs/F4-intent-layer-and-lanes.md` §7 (batches
"≤ ~15 rulings", "3–6 batches across the arc" → total capacity ≈ 45–90
rulings; falsifier ">~25 open rulings" = upstream under-deciding) and §14
(cross-regime escalations "~60–110 files"); F3 §2.3 (every quorum
non-concurrence on a terminal class → `terminal-candidate` flagged "for the
next batched owner ruling"); F3 §1.2 + F5 §4 (UNMAPPED residue with policy
weight → OG-4); F6 §9 (G6 "per ~2–3 batches").

**The defect:** ruling *capacity* is fixed by design (I8) but ruling *demand*
scales with corpus size, and the designs' own estimates already exceed
capacity: 60–110 cross-regime lane escalations (F4 §14) + terminal-candidates
from non-concurrence (measured prior: cross-regime disagreement is 40%
one-directional — i.e. non-concurrence on terminal proposals is the
*expected* case, and every one becomes a queued flag, F3 §2.3 step 3) +
UNMAPPED policy rows + holding-boundary calls + new-lane candidates. Even a
conservative sum lands at 100–200 queue entries against 45–90 slots. The
scale-independence claim is a hope about upstream deciding, not a mechanism.

**Failure scenario:** by B5 the queue holds 60+ open rulings; the F4 §7
falsifier fires ("audit the escalation criteria") mid-run; batches stall at
stable points waiting on rulings that gate their loss checks
(`terminal-candidate` rows cannot close as terminal); either the owner's
15–30-minute batches become hour-long slogs (I8 broken in substance) or
agents start pre-deciding owner-grade items to keep batches moving (the
worse failure — exactly what the queue exists to prevent).

**Cure:** size ruling demand from pilot actuals at SP3 and ratify
*escalation-thinning tables* at OG-2/Walk A: classes of recurring escalation
(e.g. "schools-serving material vs the confirmed non-goal" — F4 §7 already
names its standing answer) become one owner-ratified policy row each,
consumed thereafter by code/adjudicator, with only novel shapes reaching the
queue. The design already has the right primitive (G3 in F1 §12 does this
for arrivals); apply it to ruling classes.

### C7 — F2 spends 1–2M reader tokens on the archive, a surface F1 designs as scripted-sweep-only and which sits outside the conservation guarantee

**Cite:** `tmp/refounding-designs/F2-worker-layer.md` §2.1 ("For
`.agent/plans-old-archive/**`… only windows containing at least one
scripted-sweep hit enter reader scope") and §9 ("Archive sweep readers
~1–2M tokens") versus `tmp/refounding-designs/F1-mechanical-substrate.md` §2
(sweep verdict: "Non-terminal concepts hiding in it are caught by the
scripted Wave-0 sweep (§9); sweep hits promote via denominator amendment")
and §5 (`refound-sweep`: "hits are an F3 adjudication queue, never
auto-promoted") — F1's sweep pipeline has **no reader stage**.

**The defect:** an unreconciled interface with a token bill attached. F1's
design: scripted grep → F3 adjudication → promotion via denominator
amendment (at which point the promoted file gets the full pipeline,
including F2 readers, legitimately). F2's design inserts a semantic reading
pass over grep-hit windows of a 229,768-line surface that is *not in the
denominator* — so the spend buys recall on a surface whose losses the
protocol's arithmetic cannot even express (no tiling, no ledger, no loss
check covers it). Under the verification law this is neither recomputation
nor a fresh-context attack on a claim — it is discretionary reading with no
guarantee attached. Either the archive's non-terminal content matters (then
hits promote into the denominator and the *normal* pipeline pays for the
reading, once) or it does not (then grep + adjudication suffices).

**Failure scenario:** the archive readers surface 200 candidate spans; F3
adjudicates them; the ones that matter get promoted and then read *again*
inside the normal pipeline (double spend); the ones that do not were 1–2M
tokens of reading whose omissions nobody can quantify because the surface
has no denominator — unfalsifiable insurance, which is the definition of
theatre under the design's own law.

**Cure:** delete the archive reader line; route sweep hits grep →
adjudication → promotion (F1's design as written); promoted files enter
reader scope through the amendment mechanics F1 §7 already provides.

---

## 3. Major findings

### M1 — The reader's kill-test measures the wrong counterfactual

`F2 §13 OQ1` drops the reader only if (reader ∖ script) is *empty* across the
pilot. But three downstream layers already read every line with fresh eyes:
F3's two quorum lenses (full source per vote) and F3's challengers
(untruncated source). The reader's marginal value is not reader-vs-script;
it is reader-vs-(script + quorum + challenge). A reader yielding a non-empty
set-difference that never changes a single disposition or ledger row after
adjudication passes OQ1's test and keeps its ~5–8M corrected budget while
adding nothing the ensemble would not have caught. **Cure:** define reader
yield as *disposition-changing* yield (candidates that altered a row after
adjudication), measured at SP3; drop or downscope on that number. Also note
D2's falsifier (F2 §1) explicitly forbids ever granting a filtering clause,
so a low-value-but-nonzero reader has no exit at all as designed.

### M2 — Quorum-of-absence is same-regime and unpriced

`F2 §5 step 4` requires a second blind locator to concur on loss-bearing
negatives. Same model, same envelope, same brief: the phi ≈ 0.55 correlation
prior says the second pass adds ~0.3–0.4 effective votes against the exact
error class (correlated blindness) it is bought to catch — weak insurance
that F3's cross-regime doctrine (§2.2: kill-direction errors need regime
diversity) would call miscalibrated, since a standing negative *feeds
terminal dispositions*. And it appears in no cost line: at a plausible
30–50% notFound rate over 300–700 targets it is 1–3M tokens. **Cure:**
either make the absence-confirmer regime-B (priced) or route standing
negatives on loss-bearing targets straight to F3 adjudication (F2's own OQ3
already poses this; decide it *in the declaration*, not at calibration).

### M3 — Locator inline pricing is thin at its own stated window ceiling

`F2 §2.2` sets the inline threshold at ≤1,500 source lines; at the measured
53 bytes/line that ceiling window alone is ~20–22k tokens, yet `F2 §9`
prices inline locators at 8–15k total. The band holds only if typical
windows are ≤800 lines; the design never states a typical-window assumption.
Failure mode: locator subtotal (3–9M) drifts to 5–14M and nobody can say the
declaration was wrong because it never stated its window-size basis.
**Cure:** one sentence declaring the assumed window distribution, and the
ceiling-window price as the band top.

### M4 — Two denominators circulate

F1 §2 defines the freeze denominator as 629 md / ~166,827 lines + 38 non-md
(plans + milestones + proposals); F2 §9, F3 §8, F4 §14, F6 §10 all price
against 618 / 165,066 (plans only). ~1% in lines but ~2% in sources, and —
more importantly — milestone/proposal sources enter quorum, challenge, and
lane-evidence flows that are priced per source. Trivial to fix, corrosive if
left: the first loss check divides by a number the cost model never used.
**Cure:** all facet models re-declare against F1's denominator at SP1.

### M5 — Tier mix is never declared, so the money denomination is undefined

F2 fixes workers at "cheapest tier passing calibration"; F3 voters are
cheap-tier; F6 names "Fable-tier authoring"; challengers' tier is never
stated anywhere. With a ~10× unit-price spread across tiers, the same 40M
tokens spans nearly an order of magnitude in spend depending on the
challenge layer's tier — which is the largest single line. **Cure:** the C4
cost ledger carries a tier column; challenger tier is declared at OG-2 with
the regime pair (it is the same decision — regime definitions fix tiers).

---

## 4. Insurance vs theatre — the law applied

The law: a check earns its cost iff it recomputes or attacks from fresh
context.

| Check | Verdict | Notes |
| --- | --- | --- |
| F1 byte-identity, tiling, merge recheck, discrimination proofs (F1 §5–§9) | **Earned** | Pure recomputation at ~seconds; the standing re-hash is the freeze contract made mechanical. The cheapest real insurance in the ensemble. |
| F2 four-step verification, 100% full-set byte equality (F2 §5) | **Earned** | Deterministic recompute over frozen bytes at ~0 tokens; the measured sampling failures (missed +1 offset, truncation) justify full-set. |
| Known-answer floors + file echoes (F2 D5/D8) | **Earned** | Continuous prove-it-fires at near-zero marginal cost. |
| F3 challenge of ALL named-home/merged-into rows incl. clean ones (F3 §3.1) | **Earned** | Fresh-context attack; the 33-weakens-all-in-clean-rows measurement is direct evidence sampling would be blind. This spend (the largest LLM line) is justified insurance. |
| Probe-decided terminal rows (F3 §2.3 step 3) | **Earned** | Recomputation replacing votes — the single best economics decision in F3. |
| Planted defects per batch, mutation suites (F3 §4.1, F5 §3.5) | **Earned** | Detector-fires proofs at trivial cost. |
| Quorum-of-absence, second same-regime locator (F2 §5 step 4) | **Theatre-adjacent** | Fresh context but correlated regime against a kill-direction error class; see M2. |
| Archive reader pass (F2 §2.1/§9) | **Theatre** | Neither recomputation nor an attack on any claim in the guarantee's scope; see C7. |
| F4 third lane lens (F4 §3.2) | **Theatre-adjacent** | ~0.4 effective votes as default spend, contra F3's own rule; see C3. |
| Reader over every live window (F2 §2.1) | **Conditionally earned** | Legitimate as the second blind net, but its value test is mis-specified (M1); it is the largest *discretionary* line in the ensemble. |

The verification architecture as a whole passes the law far better than
resonance's did: the ~1.3M-token verification-wave class is genuinely
deleted (F1 §15 is correct), and the surviving LLM verification spend is
concentrated where the measurements say loss actually lives.

## 5. Where LLM tokens buy work a script could do

Short answer: almost nowhere at the task level — the facet boundary
discipline (extract = script, read = worker, judge = placed) is the
strongest part of these designs. The leaks are at the *pass* level, not the
task level:

1. F4's census-scale evidence pass to answer a 16-row taxonomy question
   (C3) — not scriptable, but sample-able, which is the economic equivalent.
2. The duplicated lane judgement across F4 and F3 (C3) — the second purchase
   buys re-derivation of something already in hand.
3. The archive reader (C7) — replaceable by the grep + adjudication +
   promotion path F1 already designed.
4. Reader floors force every reply to re-transcribe scripted-net hits the
   dispatcher already holds (F2 D5) — correct as a detector, but it means
   ~all reader output tokens on floor lines are duplicate bytes; harmless at
   current scale, worth remembering if window sizes grow.

## 6. What breaks first at scale

In order of expected first failure:

1. **The owner ruling queue (C6)** — demand scales with rows, capacity is
   fixed by doctrine; F4's own numbers already breach it. Breaks during R2.
2. **In-session adjudication throughput (C5)** — 400–800 queue items through
   one executor context re-creates resonance's 17-hour regime at 37× the
   input; the designs shrank fan-out cost and concentrated the residual into
   the one seat with no budget. Breaks as batches queue behind adjudication
   from B4–B5 onward.
3. **The arrival-halt feedback loop (C5)** — wall-clock underestimate →
   longer arc → more daily-merge arrivals → more batch halts and amendments
   → longer arc. Unpriced in every sketch; compounds silently.
4. **The declaration mechanism itself (C1/C2/C4)** — if the first pre-run
   declarations are built on the phantom pre-partition, the sub-prior reader
   price, and no roll-up, the pilot's actuals will contradict them broadly
   enough that re-gating discipline erodes ("estimates are always wrong
   anyway") — the cultural failure PDR-122's declaration doctrine exists to
   prevent.

## 7. Verdict

**Sound-with-revisions.** The architecture's core economic claims survive
attack: scripting the mechanical substrate to ~zero LLM tokens is real and
verified (F1); probe-first terminal decisions, stratified challenge, and
least-privilege single-turn envelopes all spend where the measurements point;
the verification layers overwhelmingly pass the earned-vs-theatre law. What
does not survive is the *bookkeeping*: the ensemble total is understated
roughly 1.5–2× in tokens (corrected central estimate 40–60M vs the 20–40M
headline) and ~2–3× in seat-sessions, driven by a phantom pre-partition
cited circularly by two facets and designed by none, a reader price below
the design's own measured prior, a duplicated lane-judgement purchase, two
unpriced serial terms (authoring, adjudication) that are the probable
wall-clock long pole, and the absence of any single owned roll-up from which
the doctrinally-required billing-denomination declaration could even be
derived. Every cure above is cheap relative to the run; all of them belong
in R0/SP1, before the first declaration is signed.
