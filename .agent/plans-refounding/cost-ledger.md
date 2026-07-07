# R0c cost ledger (DRAFT skeleton)

> Director-owned, per plan todo `r0c-registers-and-declaration`. Drafted 2026-07-06 by
> Stoat rides Gloaming (432a41). Acceptance: the pre-run declaration exists in EVERY
> billing denomination before any fleet dispatch; the H-series halt conditions reference
> the run total. Declared bands come from the ratified plan and design record; lines
> marked TO-DERIVE are completed at R0c landing and re-priced from actuals at SP3
> (G-SP3 sanction). Currency lines compute at a declared per-token rate table recorded
> alongside at landing — rates are a declaration input, never an assumption.

## Denominations

Tokens (by tier: cheap worker / judgement / challenge / seat), currency (at the
declared rate table), wall-clock, seat-sessions, owner sittings.

## Ledger lines (fixed vs marginal)

| Line | Class | Band (pre-pilot) | Basis | SP3 evidence status |
| --- | --- | --- | --- | --- |
| R0a mechanical instrument build | FIXED | ~0.2–1M seat tokens; 1–2 sessions | F1 §15 (10 programs, 100–300 LOC each) | actuals at R0a close |
| R0b plan-state tool build | FIXED | ~0.2–0.5M seat tokens; 0.5–1 day | F5 §11 (1,200–2,000 LOC) | actuals at R0b close |
| R0c registers + G1 packet | FIXED | seat-time only | this work | actuals |
| Mechanical layer RUN (freeze/inventory/tile/gates) | MARGINAL ≈0 | 0 LLM tokens; minutes wall-clock | F1 §15 | recomputed each run |
| refound-reader windows (live corpus) | MARGINAL | ~3.5–5M cheap-tier | F2 §9 (~140 dispatches × ~30k) | pilot measures |
| refound-locator dispatches | MARGINAL | ~3–9M cheap-tier | F2 §9 (target volume = F2 OQ2, closed per batch) | pilot + claim census close OQ2 |
| Archive sweep readers (declared-rate sample) | MARGINAL | ~1–2M cheap-tier | F2 §9; G1 packet item 6 rate | pilot measures |
| Unified row-judgement stage (J4: 2-lens + escalation) | MARGINAL, DOMINANT | TO-DERIVE (~8.3k-row prior × per-row quorum cost) | plan §Economics; PDR-122 inv-4 inlined briefs | pilot measures per-row actuals + segmentation-disagreement rate |
| Challenge layer (every class, per-class questions) | MARGINAL, DOMINANT | TO-DERIVE (linear-in-corpus label; brief narrowness is the lever) | P7; donor linearity label | pilot measures per 100 rows |
| Challenger-finding adjudication | MARGINAL, DOMINANT (the donor's hidden seat-cost) | TO-DERIVE (donor prior ~26 findings/100 rows → potentially ~2k findings) | design record M4 | pilot metric: findings per 100 rows BY CLASS |
| Author seat throughput (J7 co-authoring) | MARGINAL | TO-DERIVE (wall-clock long pole) | design record §6 | pilot measures |
| Adjudicator throughput (J3/J5 queues) | MARGINAL | TO-DERIVE (wall-clock long pole) | design record §6 | pilot measures |
| Owner ruling demand | BOUNDED | ≤15/batch; register slots ~45–90 vs pre-thinning demand 100–200 | P11; Walk-A thinning tables | re-sized at SP3 |
| Arrival-routing overhead | MARGINAL | TO-DERIVE per week of arc length | plan §Economics | measured weekly |
| **Run total** | | **40–60M tokens / 25–45 seat-sessions** (declared band, not commitment) | plan §Economics ensemble | re-priced at SP3 |

## H-series halt conditions (reference the run total)

- H1: any batch loss-check failure → halt THAT batch (P12).
- H2: anchor ratio outside 20–70% at inventory → halt-and-inspect (net mis-fit).
- H3: worker abort breaker (≥2 BYTE rejects from one role / ≥2 FLOOR misses / a refusal
  recurring on a redesigned task) → halt the batch (F2 §6).
- H4: >20% UNMAPPED status instances → halt for status-mapping table v2 (F5 D4).
- H5: planted-loss challenge canaries NOT all caught → the batch's challenge pass is
  rejected; the batch stays open (P4 / cross-estate review B1).
- H6: out-of-map judgement observed (a J-row boundary breach) → halt the batch;
  protocol defect record (J3 gate).
- H7: run-total spend crossing the declared band ceiling → no further batch opens until
  owner re-sanction (the declaration is a ceiling, not a note).
- H8: hash-layer vs line-count-layer disagreement → halt (an encoding/EOL surprise must
  be understood, never absorbed) (F1 §6).

## SP3 evidence-labelling clause (design-record M6)

SP3 explicitly labels which declaration lines carry pilot evidence and which remain
priors; the pilot area has no active lanes, so the arrivals machinery, the
challenge-stale trigger (P13), and live-lane ruling demand stay PRIOR-priced until
batch 2 (chosen WITH active lanes) re-confirms those three terms before full
parallelism.
