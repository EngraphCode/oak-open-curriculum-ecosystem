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
SP3 re-prices from pilot actuals. **H5 (cost backstop) binds to this ledger** — see
§H-series binding.

## 1. Billing denominations and unit prices

Declared in all three denominations PDR-122 requires: **tokens**, **currency (USD)**, and
**wall-clock (seat-sessions; calendar conditional)**.

Unit prices (Anthropic list, cached 2026-06-24 via the claude-api reference; re-check at
each re-issue):

| Tier | Input $/Mtok | Output $/Mtok | Blended 90/10 in/out |
| --- | --- | --- | --- |
| Fable 5 (`claude-fable-5`) | 10.00 | 50.00 | ~14.00 |
| Opus 4.8 (`claude-opus-4-8`) | 5.00 | 25.00 | ~7.00 |
| Sonnet 5 (`claude-sonnet-5`) | 3.00 (2.00 intro to 2026-08-31) | 15.00 (10.00 intro) | ~4.20 |
| Haiku 4.5 (`claude-haiku-4-5`) | 1.00 | 5.00 | ~1.40 |

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

| Line | Tokens (band) | Tier | USD (uncached ceiling) | Source |
| --- | --- | --- | --- | --- |
| F1 run-time (all mechanical layers) | ≈0 | — | ≈0 | F1 §15; critique §1.2 (verified sound) |
| F1/F5 build residual (r1+ machinery: amendment writer, probe executors, table v2) | 0.3–1.5M | Fable (implementer sessions) | 4–21 | F1 §15 + F5 §11, as claimed |
| F2 workers (reader net + locator + quorum-of-absence + re-dispatch allowance) | 12–24M | Haiku/Sonnet | 17–101 | Critique C2/M2/M3 corrected band |
| F3 quorum + challenge (dominant token term, ~40–45%) | 20–28M | Sonnet 60% / Fable 40% (declared) | 120–320 | Critique C1 corrected band |
| F4 lane-evidence pass (cured shape: 2 lenses + escalation-only third) | 2–4M | Sonnet | 8–17 | Critique C3, cured band |
| Adjudication + dispositions (~8.3k rows, routed residues) | 4–8M | Fable | 56–112 | F6 §10 |
| Authoring (~100–170 refounded plans, 10–20k each + cure loops) | 2–4M | Fable | 28–56 | F6 §10 |
| Challenger-finding adjudication (first-class line; donor's hidden dominant seat cost — potentially ~2k findings at ~26/100 rows) | inside adjudication + wall-clock line below | Fable | — | plan §Economics; pilot measures findings/100 rows by class |
| Canaries, schema retries, cures/re-challenges (~15% of challenge spend) | 3–5M | mixed | 25–70 | F2 §9 + F3 §8 allowances |

## 4. Run totals (the numbers H5 fires against)

| Denomination | Declared band | Hard ceiling (H5 run-total trigger) |
| --- | --- | --- |
| LLM tokens | **40–60M** | 60M |
| Currency | **~USD 300–700** (uncached ceiling at the §2 mix) | USD 700 |
| Seat-sessions | **25–45** (decomposition in §5) | 45 |
| Calendar | 6–14 weeks, **conditional on ≥2 concurrent seats** (seat-hours are the true unit, C5c) | not a gate (P12: exit criteria are proofs, never the clock) |

Crossing a ceiling is an **H5 fork, not a failure** (PDR-122 inv 4): analyse the real
number, commit checkpoints, prepare launch-ready forks, surface to the owner with a brief,
stop the spend.

## 5. Wall-clock decomposition and throughput lines (C5 cure)

| Line | Band | Notes |
| --- | --- | --- |
| R0 instruments (ACTUALS — see §7) | 5 seat-sessions spent | vs F6's declared 2–4; rotations under context budget, not scope growth |
| Pilot B1 | 1.5–2 sessions, ~8–12h wall, 1.5–3M tokens | F6 §10; under donor's 17h (scripted mechanicals) |
| Batch execution (fleet + loss checks) | 12–18 sessions | F6 §10; re-priced at SP3 |
| **Author-seat throughput** | 5–15 plans/session incl. cure loops → **7–30 sessions** for ~100–170 plans | C5b; the largest unpriced serial term — pilot measures the real rate |
| **Adjudicator-seat throughput** | 400–800 queue items through one executor context (5–10% routing rate × ~8.3k rows); declare items/session at pilot | C5b; the seat that dominated the donor's 17h at 223 rows |
| Fixed vs marginal | **UNKNOWN until pilot** — SP3's single most valuable economic output (C5a); the 25–45 total assumes calibration cost amortises; if pilot marginal rate holds estate-wide, the honest projection is 60–75 sessions and SP3 re-declares | |

## 6. Arrival-routing overhead (per week of arc — C5d; the compounding feedback term)

Oak merges to `main` roughly daily; every arrival halts the affected batch at its next
stable point until routed (F1 §7). Priced per week of arc length so the feedback loop is
visible: **~0.25–0.5 seat-sessions/week + 50–200k tokens/week** (routing analysis;
merge-recheck itself is scripted, ≈0). The compounding term: underestimated wall-clock →
more weeks → more arrivals → more halts → more weeks. A calendar overrun therefore raises
the run total superlinearly — one more reason H5 watches the SUM, not only per-batch lines.

## 7. R0 actuals (recorded against the declaration — the honesty row)

Measured this arc (session records: Stoat/Goshawk/Rigel napkin economics entries):
R0a tranche reviewer rounds ~85–140k tokens/reviewer; R0a cycles-3–4 six-seat gateway
~664k; R0b pre-execution review ~154k; R0b seven-seat gateway ~505k. Order-of-magnitude
R0 fleet total: **~3–6M tokens ≈ USD 40–90**, plus five interactive seat-sessions
(Stoat → Leopard → Goshawk → Rigel → Pelican) against F6's declared 2–4. The overrun
mechanism was context-budget rotation, not scope growth — an input to SP3's
fixed-vs-marginal split, and the first live datum that seat-session bands should price
rotation overhead.

## 8. H-series binding and the per-batch pre-run declaration

**H5 (cost backstop) is re-defined against this ledger** (C4 cure): it fires when
(a) a batch exceeds its own pre-run declaration in ANY denomination without a green loss
check, OR (b) cumulative arc spend crosses a §4 run-total ceiling. All other H-conditions
(H1–H4, H6; F3 §5.4) are unchanged and cite this ledger only through H5.

Every batch opens with this declaration (all denominations, before any fleet dispatch —
the R0c acceptance bar) and closes with actuals recorded next to it:

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
| SP3 (pilot close; feeds G-SP3) | Everything: fixed-vs-marginal split, Author/Adjudicator measured throughput, cache-hit rate, findings/100 rows by class, ruling-demand sizing; the G-SP3 sitting sanctions the re-priced declaration |
