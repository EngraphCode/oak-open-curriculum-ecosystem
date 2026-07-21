# DORA × the intent graph — synthesis (2026-07-21, owner-commissioned)

Commissioned by the owner at the net-to-zero drive's close ("take a look at
anything in the repo related to DORA, measuring throughput, how that relates
to the intent graph concept"). Sources: full-repo sweep (pr-throughput
module + register, the 2026-07-20 latency corpus, PDR-130/131/132, ADR-200/
207/212, the strategy measures/stream docs, the lineage discipline and the
bridging plans). This report is synthesis over those sources; each claim's
authority stays with its cited home.

## Review contract

**Purpose**: name the current shape of delivery measurement, the intent
graph, and their connection, so sequencing decisions are made from structure
rather than memory. **Review should test**: does each state-of-play claim
match its cited source; does the sequencing verdict follow. **Evidence
standard**: cited repo surfaces only; the empirical claims cite the dated
latency corpus. **Non-goals**: no new doctrine minted here; no build
authorised. **Successful review**: mismatches reported against this section.

## State of play

- **Measurement is live**: the pr-throughput register (PDR-131's
  instrument) computes merges/day + cycle p50/p90 today, with a falsifiable
  prediction (p50 ≤45min; two red weekly windows kills it). Beneath it: the
  89-PR ready→merged corpus and analysis (2026-07-20 files beside this).
- **Intent-side doctrine is accepted, build gated**: ADR-200 (living idea
  graph; `serves`/`realised_by` edges; documents as altitude projections)
  and ADR-207 (DORA metrics as a STRUCTURAL PROPERTY — projections over the
  graph; planned-vs-rework attribution as a traversal of
  `serves_strategic_choice`+`kind`+`disposition` joined to commits).
  ADR-212 separates the evidence classes. The build waits on the ADR-200
  graph, which waits on the plan-corpus refounding.
- **The interim bridge is the `lineage:` frontmatter** (plan skill §7):
  hand-written serves-edges, "so work is homed where it is driven" — the
  manual V0 of the graph's edges, already adopted across the plan estate.

## What the 2026-07-20/21 drive proved empirically

The drive validated ADR-207's thesis from below: **throughput was a
property of intent structure, not of pipeline mechanics.** Rounds-per-PR
predicted latency at Spearman +0.63 vs +0.25 for diff size; the latency
model (latency ≈ final commits × ~38m + availability-wait) decomposes DORA
lead time into causes that are graph-visible — round counts are fixed at
authoring (PDR-132 therefore binds slicing at PLANNING, making the round
budget an edge-quality metric on plan→implementation edges), and the tail
was silent-wait states, an attention property. Two live specimens for the
future tooling: the register's rows are already realisation-edge-shaped
(doctrine → prediction → dated evidence), and the #437 fix-forward arc
(import → red gate → commission → two cure PRs) is a complete labelled
rework-subgraph for ADR-207's classifier.

## Gaps and sequencing verdict

1. **Attribution is the weakest live edge**: 27/89 merged PRs carried a
   ticket ref. Universal PR↔ticket refs is a one-clause pr-lifecycle
   amendment (Phase 2) and the cheap prerequisite for every graph-native
   DORA projection. First.
2. **The register lacks PDR-132's named dimensions** (commits, threads,
   changeset class, opening-commit count) — exactly D3 of the
   pr-state-instrumentation plan. Second.
3. **Change-failure-rate and MTTR have no measurement**, but their raw
   material now exists (Phase-8 harvests and fix-forward lanes ARE
   failure/recovery events); graph incident edges make both traversals.
   With the graph, not before.
4. **The graph build stays gated** per ADR-200's refounding-first
   amendment; lineage blocks + the register carry the load meanwhile.

Weekly register read (~2026-07-27) becomes the first recurring DORA-shaped
review; with (1) landed it reads with real attribution.

## Free-play seed (association, not finding)

"Silent-wait" may want to be a graph concept: a node in flight with no
watching edge. The shepherd/sweep doctrine informally asserts "every live
node names its observer"; encoded, watcher coverage becomes checkable
structure — ADR-207's move, applied to attention.
