---
title: 'Plan-corpus refounding — cost ledger (pre-run declaration)'
type: register
status: active
governed_by: plan-corpus-refounding.plan.md
issued: 2026-07-08 (R0c)
reissue_points: 'SP1 (real inventory), SP3 (pilot actuals — fixed-vs-marginal decomposition)'
owner: Director (per F6 §6 / economics-critique C4 cure)
---

# Plan-Corpus Refounding — Cost Ledger

The ONE owned cost declaration for the refounding arc (economics-critique **C4 cure**: no
facet owns the ensemble total; this artefact does). The facet sketches (F1 §15, F2 §9,
F3 §8, F4 §14, F5 §11, F6 §10) and the independent economics critique's corrected bands
(§1.2) are **feeder rows**, reconciled here. Every figure is a **declared band, not a
commitment** (PDR-122 pre-declaration doctrine); SP1 re-issues on the real inventory and
SP3 re-prices from pilot actuals. **H7 (cost backstop) binds to this ledger** — see
§H-series binding.

## 1. Billing denominations and unit prices

Declared in all three denominations PDR-122 requires: **tokens**, **currency (USD)**, and
**wall-clock (seat-sessions; calendar conditional)**.

Unit prices (Anthropic public pricing — an EXTERNAL source; retrieved 2026-06-24,
independently re-verified 2026-07-08 by the R0c review pass. This table is itself the
committed, diffable baseline: re-check the live price list at each re-issue and diff
against these rows):

| Tier | Input $/Mtok | Output $/Mtok | Blended 90/10 in/out |
| --- | --- | --- | --- |
| Fable 5 (`claude-fable-5`) | 10.00 | 50.00 | ~14.00 |
| Opus 4.8 (`claude-opus-4-8`) | 5.00 | 25.00 | ~7.00 |
| Sonnet 5 (`claude-sonnet-5`) | 3.00 (2.00 intro to 2026-08-31) | 15.00 (10.00 intro) | ~4.20 |
| Haiku 4.5 (`claude-haiku-4-5`) | 1.00 | 5.00 | ~1.40 |

**Declared blend ASSUMPTION**: the 90/10 input/output split models the reading-dominant
fleet classes (workers emit verbatim quotes only; challenge briefs are input-dominant).
It is an assumption, not a measurement — the pilot measures the real split per class.
**Authoring is the named exception** (its product IS output): assumed ~50/50 → Fable
blended ~$30/Mtok; the §3 authoring row prices at that exception.

Prompt-cache economics (reduction lever, NOT baked into the ceilings below — the
declaration is the uncached ceiling): cache reads ≈0.1× input price; writes 1.25× (5-min
TTL) or 2× (1-h TTL). Repeated-prefix fleet dispatches (same frozen window, same brief
scaffold) are the main cacheable class; the pilot measures the realised cache rate.

## 2. Declared tier mix (M5 cure — the money denomination is defined by this mix)

| Work class | Tier | Rationale |
| --- | --- | --- |
| Mechanical substrate (freeze/inventory/tile/census/merge-recheck/plan-state) | none | Zero LLM by design (F1; verified sound in critique §1.2) |
| Workers: `refound-reader`, `refound-locator` | Haiku 4.5 → Sonnet 5 where window size demands | Zero-judgement, verbatim-anchored, dispatcher-verified |
| Quorum lenses + regime-B concurrence | Sonnet 5 | Bounded judgement under canaries + breaker |
| Adversarial challengers (untruncated source) | Fable 5 | The loss-bearing layer; capability-sensitive |
| Adjudication (J3, in-session executor) | Fable 5 | Concentrated judgement, context-holder seat |
| Authoring (J7, co-authored destinations) | Fable 5 | F6 §10 "Fable-tier authoring"; frozen-spec binding |

## 3. Per-facet feeder rows (tokens → USD at the declared mix)

| Line | Class | Tokens (band) | Tier | USD (uncached ceiling) | Source |
| --- | --- | --- | --- | --- | --- |
| F1 run-time (all mechanical layers) | MARGINAL ≈0 | ≈0 | — | ≈0 | F1 §15; critique §1.2 (verified sound) |
| F1/F5 build residual (r1+ machinery: amendment writer, probe executors, table v2, batch-open declaration check) | FIXED | 0.3–1.5M | Fable (implementer sessions) | 4–21 | F1 §15 + F5 §11, as claimed |
| F2 workers (reader net + locator + quorum-of-absence + re-dispatch allowance) | MARGINAL | 12–24M | Haiku/Sonnet | 17–101 | Critique C2/M2/M3 corrected band |
| F3 quorum + challenge (dominant token term, ~40–45%) | MARGINAL, DOMINANT | 20–28M | Sonnet 60% / Fable 40% (declared; presented for the OG-2 judgement-machinery ruling per M5 — the tier declaration IS the regime-pair decision) | 160–230 at the declared mix (derived: 0.6×4.20 + 0.4×14.00 ≈ $8.1/Mtok) | Critique C1 corrected band |
| F4 lane-evidence pass (cured shape: 2 lenses + escalation-only third) | MARGINAL | 2–4M | Sonnet | 8–17 | Critique C3, cured band |
| Adjudication + dispositions (~8.3k rows, routed residues) | MARGINAL, DOMINANT | 4–8M | Fable | 56–112 | F6 §10 |
| Authoring (~100–170 refounded plans, 10–20k each + cure loops) | MARGINAL, DOMINANT (wall-clock) | 2–4M | Fable at the ~50/50 output exception (§1) | 60–120 | F6 §10 |
| Challenger-finding adjudication (first-class line; donor's hidden dominant seat cost — potentially ~2k findings at ~26/100 rows) | MARGINAL, DOMINANT (seat) | inside adjudication + the §5 throughput line | Fable | — | plan §Economics; pilot measures findings/100 rows by class |
| Arrival-routing (per-week overhead accrued over the arc — see §6) | MARGINAL (calendar-coupled) | 0.3–2.8M | mixed | 2–15 | §6 derivation |
| Canaries, schema retries, cures/re-challenges (~15% of challenge spend) | MARGINAL | 3–5M | mixed | 25–70 | F2 §9 + F3 §8 allowances |

## 4. Run totals (the numbers H7 fires against)

**Aggregation policy (declared)**: the run-total bands are the economics critique's
ENSEMBLE estimate (§1.2 F6 row), NOT the sum of §3 row tops — the rows are not
co-maximal (the §3 token tops sum to ~75M and the USD tops to ~700; every line hitting
its top simultaneously is outside the model). The hard ceilings below are therefore
central-estimate caps: H7 firing while individual lines sit within their own bands is a
DESIGNED mid-arc owner checkpoint, not a declaration failure. One method across all
three denominations.

| Denomination | Declared band | Hard ceiling (H7 run-total trigger) |
| --- | --- | --- |
| LLM tokens | **40–60M** | 60M |
| Currency | **~USD 300–700** (uncached ceiling at the §2 mix + §1 blend assumption) | USD 700 |
| Seat-sessions | **25–45** (decomposition and overlap semantics in §5; the ceiling counts the 5 already-spent R0 sessions; the §5 honest projection names 60–75 as the plausible outcome if the pilot marginal rate holds — reaching the 45 ceiling then IS the designed SP3-adjacent owner checkpoint) | 45 |
| Calendar | 6–14 weeks, **conditional on ≥2 concurrent seats** (seat-hours are the true unit, C5c) | not a gate (P12: exit criteria are proofs, never the clock) |

Crossing a ceiling is an **H7 fork, not a failure** (PDR-122 inv 4): analyse the real
number, commit checkpoints, prepare launch-ready forks, surface to the owner with a brief,
stop the spend.

## 5. Wall-clock decomposition and throughput lines (C5 cure)

**Overlap semantics (declared)**: Author-seat and Adjudicator-seat sessions are
ADDITIVE serial terms BESIDE batch execution (they cannot be subsets: 30 > 18); the 5
spent R0 sessions count inside the total. The §4 band (25–45) therefore assumes heavy
within-session overlap of batch + adjudication work and calibration amortisation of the
Author rate — the decomposition tops sum well past it (that tension is the point: the
fixed-vs-marginal row and the 60–75 honest projection carry it openly, and SP3
re-declares from actuals).

| Line | Band | Notes |
| --- | --- | --- |
| R0 instruments (ACTUALS — see §7) | 5 seat-sessions spent | vs F6's declared 2–4; rotations under context budget, not scope growth |
| Pilot B1 | 1.5–2 sessions, ~8–12h wall, 1.5–3M tokens | F6 §10; under donor's 17h (scripted mechanicals) |
| Batch execution (fleet + loss checks) | 12–18 sessions | F6 §10; re-priced at SP3 |
| **Author-seat throughput** | 5–15 plans/session incl. cure loops → **7–30 sessions** for ~100–170 plans | C5b; the largest serial term — pilot measures the real rate |
| **Adjudicator-seat throughput** | 400–800 queue items (5–10% routing rate × ~8.3k rows) at a prior of 50–100 items/session → **4–16 sessions**, partly overlapping batch sessions; pilot measures items/session | C5b; the seat that dominated the donor's 17h at 223 rows |
| Arrival routing | 0.25–0.5 sessions/week × arc length → **1.5–7 sessions** at the §4 calendar band | §6; calendar-coupled |
| Owner ruling demand (the fourth denomination — owner attention) | ≤15 rulings/batch; register capacity ~45–90 slots vs pre-thinning measured demand 100–200 | P11; thinned by the Walk-A escalation tables; re-sized at SP3 |
| Fixed vs marginal | **UNKNOWN until pilot** — SP3's single most valuable economic output (C5a); the 25–45 total assumes calibration cost amortises; if the pilot marginal rate holds estate-wide, the honest projection is 60–75 sessions and SP3 re-declares | |

## 6. Arrival-routing overhead (per week of arc — C5d; the compounding feedback term)

Oak merges to `main` roughly daily; every arrival halts the affected batch at its next
stable point until routed (F1 §7). Priced per week of arc length so the feedback loop is
visible: **~0.25–0.5 seat-sessions/week + 50–200k tokens/week** (routing analysis;
merge-recheck itself is scripted, ≈0). The compounding term: underestimated wall-clock →
more weeks → more arrivals → more halts → more weeks. A calendar overrun therefore raises
the run total superlinearly — one more reason H7 watches the SUM, not only per-batch lines.

## 7. R0 actuals (recorded against the declaration — the honesty row)

Measured this arc. Auditable evidence in committed/durable homes: the PR #321 and #323
review transcripts on GitHub (the fleet dispatches and their token receipts), and the
session-close continuity stack riding **PR #324** — the PDR-063 handoff records (Stoat's
tranche-3 execution record; Goshawk's G1/R0b-runway record; Rigel's R0b-merged record and
its gateway-adjudications companion) plus the napkin economics entries. Until #324
merges, those records are branch-side, not in this tree — the SP1 re-issue re-verifies
the citations resolve on `main`:
R0a tranche reviewer rounds ~85–140k tokens/reviewer; R0a cycles-3–4 six-seat gateway
~664k; R0b pre-execution review ~154k; R0b seven-seat gateway ~505k. Order-of-magnitude
R0 fleet total: **~3–6M tokens ≈ USD 40–90**, plus five interactive seat-sessions
(Stoat → Leopard → Goshawk → Rigel → Pelican) against F6's declared 2–4. The overrun
mechanism was context-budget rotation, not scope growth — an input to SP3's
fixed-vs-marginal split, and the first live datum that seat-session bands should price
rotation overhead.

## 8. H-series binding and the per-batch pre-run declaration

**H7 (the cost backstop) is defined against this ledger** (C4 cure). It fires when
(a) a batch exceeds its own pre-run declaration in ANY denomination —
**unconditionally**: the backstop is budget-based and orthogonal to proof success
(PDR-122 inv 4; a green loss check does not excuse an overrun — the fork conversation
happens either way), OR (b) cumulative arc spend crosses a §4 run-total ceiling (no
further batch opens until owner re-sanction).

**The one H-numbering is the OPERATIONAL series — the numbering the implemented runners
emit** (`refound-inventory-model.ts` emits `H2 halt-and-inspect`; the series was drafted
alongside the R0a build and the code follows it). F3 §5.4's design-era H1–H6 is feeder
material, mapped in the last column:

| H | Condition | Action | Source (design-era map) |
| --- | --- | --- | --- |
| H1 | Any batch loss-check failure | Halt THAT batch | P12 (F3-H4) |
| H2 | Inventory anchor ratio outside the 20–70% band | Halt-and-inspect (net mis-fit) | F1 (implemented) |
| H3 | Worker abort breaker: ≥2 BYTE rejects from one role / ≥2 FLOOR misses / a refusal recurring on a redesigned task | Halt the batch | F2 §6 |
| H4 | >20% UNMAPPED status instances at the audit run | Halt for status-mapping table v2 (the OG-2 row's designed-residue ruling) | F5 D4 |
| H5 | Planted-loss challenge canaries not all caught | Reject the batch's challenge pass; batch stays open | P4 / cross-estate B1 (F3-H1/H2) |
| H6 | Out-of-map judgement observed (a J-row boundary breach) | Halt the batch; protocol defect record | J3 (F3-H6) |
| H7 | **Cost backstop** — per-batch declaration exceeded in any denomination, or run total crossed | Fork, not failure: analyse, checkpoint, launch-ready forks, owner brief, stop the spend | This ledger (F3-H5) |
| H8 | Hash-layer vs line-count-layer disagreement | Halt (an encoding/EOL surprise must be understood, never absorbed) | F1 §6 |
| H9 | Challenge overturn rate >2% of challenged rows in a batch, or ANY overturn of a probe-decided terminal row | Halt; executor first-hand analysis; owner briefed | F3-H3 (threshold ratified at the OG-2 machinery half) |

Only H7 is cost-coupled; the table lives here solely so the series has one home and one
numbering, aligned with the code.

Every batch opens with this declaration (all denominations, before any fleet dispatch —
the R0c acceptance bar) and closes with actuals recorded next to it. **Enforcement is
owed mechanically, not by diligence** (prove-it-fires applied to H7 itself: a batch that
never declares makes H7(a) unfireable): the batch-open tooling (`refound-batch-status` /
the breaker) REFUSES a batch open without a parseable declaration block — owed with the
pre-pilot batch machinery (r1/r2 landing); until it lands, declaration-presence is an
explicit Director check at every batch open:

```text
Batch pre-run declaration:
- Batch id / scope: <sources, rows>
- Agents: <count × tier per §2>
- Tokens ceiling: <n>
- USD ceiling: <n at §1 prices>
- Wall-clock ceiling: <seat-sessions / hours>
- Canary set: <sealed key sha256, per OG-3>
- Loss-check criterion: <the P12 batch-close proof>
- Cumulative arc spend after this batch if ceiling hit: <n of the §4 run total>
```

## 9. Re-issue schedule

| Point | What re-prices |
| --- | --- |
| SP1 (freeze + real inventory landed) | Row prior (~8.3k) → measured; F2 window count → measured |
| SP3 (pilot close; feeds G-SP3) | Everything: fixed-vs-marginal split, Author/Adjudicator measured throughput, cache-hit rate, findings/100 rows by class, ruling-demand sizing; the G-SP3 sitting sanctions the re-priced declaration. **Evidence-labelling clause (design-record M6)**: SP3 explicitly labels which declaration lines carry pilot evidence and which remain priors — the pilot area has no active lanes, so the arrivals machinery, the challenge-stale trigger (P13), and live-lane ruling demand stay PRIOR-priced until batch 2 (chosen WITH active lanes) re-confirms those three terms before full parallelism |
