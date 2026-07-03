---
name: "Corpus-Analysis Salvage and Topology Redesign"
plan_id: corpus-analysis-salvage-and-topology-redesign
collection: agentic-engineering-enhancements
lane: current
status: "FULL-PROCESSING workstreams ws1c-ws1g ADDED 2026-07-03 (Vega mends Oblivion, owner-directed): EVERY remaining rescued-knowledge stratum is processed in full — the prior 'owner-gated manual round' framing was NEVER owner-ratified (precedence-is-not-approval) and is withdrawn; tier E (187), the 83 unclustered leaves, the 8 meta synthesis notes, the structured banked-verdict corpus, and the v2/v1/probe strata are all in scope; comms events alone are owner-routed to a separate plan. ws1b EXECUTED 2026-07-03 (Vega): all 59 A-D rescue entries dispositioned into canonical homes; C36 supertest contradiction reconciled across three surfaces. ws1 EXECUTED 2026-07-02 (Rosemary stirs Bracken): corroboration cwd bug fixed (18/18), salvage tooling TDD-landed, tier table + discovery report committed — A=18 B=8 C=18 D=18 E=187 residual=0. ws2+ (topology redesign) still requires a fresh-session readiness review before build. Session opener for ws1c-ws1g: .agent/prompts/agentic-engineering/rescued-knowledge-full-processing-session.md"
created: 2026-07-02
owner_thread: agentic-engineering-enhancements
overview: >-
  Two coupled deliverables from the 2026-07-02 discovery run: (1) SALVAGE —
  extract the discovery value already paid for from the committed checkpoints
  without re-running anything; (2) REDESIGN — replace the naive
  all-then-calibrate pipeline topology with a cellular, progressively-powered,
  canary-gated design that detects judgment-regime failures inside the first
  ~5% of spend and aborts deterministically.
todos:
  - id: ws1-salvage
    content: "WS1 (executable now): stratified salvage report from committed checkpoints — no new validate spend. Tiers: A = Sonnet-keeps that are corroborated or Opus-quorum-keeps (highest confidence); B = remaining Sonnet keeps (survived the harshest filter); C = Opus-quorum-keep / Sonnet-kill disagreements (18 named candidates); D = killed candidates named in meta recall notes as baseline-matching (proven-real, false kills); E = remaining kills ranked by triage-style evidence (window span, grounding count) for the owner's manual round. Deterministic code over existing JSONs + the banked verdict corpora; fix the post-run driver corroboration cwd bug (existsSync resolved against agent-tools/ — resolve claimed paths against the repo root, TDD; note the driver's readCheckpoint already anchors its flag paths with assertPathWithinBase(repoRoot) since the S8707 fix on PR #296 — follow that precedent, the corroboration site is separate and still unfixed) so tier A is computable. Output: discovery report with novelty stratification + the full tier table, conserved per the run plan."
    status: completed
  - id: ws1b-rescued-knowledge-disposition
    content: "WS1b (DECISION-COMPLETE; fresh-seat dedicated pass, executable now; pasteable
      session opener: .agent/prompts/agentic-engineering/ws1b-rescued-knowledge-consolidation-session.md,
      run on feat/corpus_research_enhancements): disposition every ws1 rescue-set entry into the canonical surfaces via consolidate-until-done, with the salvage report + data/discovery-run-salvage-tiers-2026-07-02.json as the plan-carried intake work-list (consolidate-docs §Discovery-Run Rescue Sets governs the mechanics). Evidence-tiered order: (1) tier D — 18 proven-real false kills; each entry's namingBaselineIds pre-addresses its knowledge lane (the capture-does-not-cure pair C183/C184 routes to the action-time-structural-interrupt design lane as PDR-098 recurrence evidence; C139/C140 to the identity doctrine; C154 to the peer-sidebar doctrine; C163 to definition-of-delivery). (2) tier C — the 15 non-D cross-regime rescues, judged individually against existing homes (graduate, enrich, or reject-as-subsumed with reason). (3) tier B — the 8 uncorroborated keeps as novel-discovery candidates for new pattern files or rule clauses (C36 supertest-classification trajectory; C46/C54/C64/C129/C135 tooling findings; C116 memory-plugin post-mortem; C123 semantic-merge — check partial homes first). (4) tier A — 18 corroborated re-finds: verify-and-enrich the homes each corroboratedBy names; a pure re-find is a duplicate disposition confirming pipeline recall, a nuance-adding re-find amends the home. Tier E (187 ranked kills) stays OWNER-GATED (the manual round) and is outside this workstream's done. Done = all 59 A-D entries dispositioned (graduated/duplicate/rejected), buffers empty at close, this todo completed; closeout reports value and impact, never accounting."
    status: completed
  - id: ws1c-estate-inventory
    content: "ws1c EXECUTED 2026-07-03 (Gust hunts Headwind): every stratum recomputed first-hand with jq — tierE 187 (all full-text, disjoint from A-D, rank fields present); unclustered leaves 83 (580 map leaves minus 497 unique supportingLeafIds, all full statements); meta synthesisNotes 8 (plus recallMatches 18, corroborationClaims 18); banked verdicts 202 Opus (54 candidates) + 31 Sonnet (8 candidates), structured-only reconfirmed (key union candidateId/lens/regime/verdict; all 246 validate reason fields null); v2 50=45+5 full-text with 31 corroborationClaims (claimedHomePaths) + 18 recallMatches; probe 75 candidates + 167 leaves full-text on w08/w10/w11 vs the 15-window full-run partition (file lists committed — ws1g(d) inputs present). Kill accounting reconciles: 246 = 26 keep + 220 kill; 220 = C18 + D18 - 3 (C-and-D overlap) + E187; A-D = 62 rows - 3 overlap = ws1b's 59. RECORDED VERDICT (not a gap): the v1 stratum has no per-item JSON — its committed disposition base is napkin-discovery-pass-1-2026-06-29.md (10 kept described in full; 9 kills as the named speculative-narrative-arc class; C06 unadjudicated) + the curator-pass metadata record; ws1g(c) body-reads those committed descriptions. Zero re-spend confirmed for all other strata. Comms-corpus artefacts OUT (owner-routed separate plan)."
    status: completed
  - id: ws1d-tier-e-disposition
    content: "ws1d: tier E full disposition, 187 ranked kills, rank-ordered batches of ~25 (E-b1 ranks 1-25 ... E-b8 ranks 176-187), one commit per batch. Per-item protocol = ws1b's: read the full pattern text; judge against existing homes first-hand; graduate / enrich / duplicate / reject-with-named-reason; conserve-by-default (PDR-122); PDR-098 recurrence check with the temporal qualifier (an instance is fires-despite-home evidence only if it post-dates the home). Subagents may propose home candidates; every disposition is adjudicated first-hand by the context-holder (owner standing directive: critically assess all subagent output). Every entry receives one of the four dispositions in this pass: an entry hinging on an undecided design question routes INTO the owning artefact (e.g. the Phase-0 agenda in the generalisation plan) as content — routing to the owning artefact IS its disposition. Expect 2-4 sessions; batch boundary = handoff boundary. Rank tiebreak fields: distinctWindows, supportingLeafCount, candidateId."
    status: pending
  - id: ws1e-unclustered-leaves
    content: "ws1e (independent of ws1d): disposition the unclustered map leaves (recompute the set; 83 as of 2026-07-03). Body-read all; disposition each (duplicate against A-E homes / graduate novel singles / reject noise with reason; conserve-by-default). Route the structural finding — the deterministic close's residual=0 was candidate-scoped and never accounted the leaf-to-candidate seam — into the ws2/Phase-0 agenda as a leaf-coverage accounting requirement. One or two commits."
    status: pending
  - id: ws1f-synthesis-notes-and-verdict-corpus
    content: "ws1f (independent): (a) verify each of the meta stage's 8 synthesisNotes against live homes; route the keep-filter kind-bias note (the run under-weights trajectory/protocol-evolution/single-window kinds) into the Phase-0/ws2 agenda + the corpus-generalisation future plan. (b) The banked verdict corpus (202 Opus + 31 Sonnet) is STRUCTURED-ONLY, no prose (verified 2026-07-03, twice — key union {candidateId, lens, regime, verdict}, verdict fields {grounded, baseRateHolds, survivesNull, notArtefact, importance}; the validate result's 246 reason fields are all null; voter transcripts were session-temp and never conserved, so the committed corpus is the totality): run a bounded deterministic read of the unconsumed structured signal — per-test kill drivers per regime, confidence textures, cross-regime disagreement by candidate kind — beyond the committed lens-correlation measurement, routing findings to the Phase-0/ws2 agenda as calibration input. The corpus's disposition: committed evidence corpus, mechanically mined (a recorded decision)."
    status: pending
  - id: ws1g-prior-generation-strata
    content: "ws1g (after ws1c): (a) verify-and-enrich the 31 v2 corroborated re-finds against their named homes (tier-A protocol — path-existence corroboration hides enrichments, 3/18 rate on tier A; a pure re-find is a duplicate confirming recall, nuance amends the home); (b) body-read the 5 v2 kills for false-kill substance; (c) per-item supersession verification of the 9 v1 kills PLUS v1's C06 (recorded neither-kept-nor-killed — undisposed; a v1 item absent from both later runs' candidate sets earns a body-read, not an assertion); (d) deterministic supersession proof for the probe candidates (probe windows subset of the full-run partition over the same corpus files); (e) any ws1c residue. Completes only when the re-run inventory shows no stratum without a per-item disposition."
    status: pending
    depends_on: [ws1c-estate-inventory]
  - id: ws2-readiness-review
    content: "WS2 GATE: fresh-session readiness review of the topology redesign (D1-D6 below are PROPOSED, authored post-peak). Dispatch assumptions-expert + architecture expert; ratify or revise; the burn-analysis report is the evidence base."
    status: pending
  - id: ws3-instrumentation
    content: "WS3: pre-run declaration + burn accounting as first-class tooling. build-run-artefact prints the agent-count bounds (map W; validate min 2C / max 4C; meta 1) and the token/dollar estimate from the measured unit-cost table before seeding; a post-run agent-tools command sums transcript usage per run/agent-type (the ad-hoc script from burn-analysis-2026-07-02.md made permanent). Estimates in raw tokens, meter points (~1M/pt), and API dollars."
    status: pending
    depends_on: [ws2-readiness-review]
  - id: ws4-canary-gate
    content: "WS4: canary-based early abort. Seed the recall baselines' matching candidates (known-real) FIRST in the validate stream, interleaved in the first batch; deterministic circuit breaker: if more than K of the first M canaries are killed, hard-abort the stage with a typed failure before the remaining candidates dispatch. Kill-rate running gate as a second breaker (e.g. batch kill-rate > threshold vs the pilot's calibrated rate). PDR-122-aligned: code computes the gate, agents never see the canary marking."
    status: pending
    depends_on: [ws2-readiness-review]
  - id: ws5-cellular-topology
    content: "WS5: cellular extraction + progressive-power validation per D2/D3 — overlapping windows at extraction (shot-noise reduction), cheap wide pass ranking candidate signals, powerful models re-reading only the top-N / contested cells, batch-sequential validate (batches of ~25 with gate checks between batches) instead of all-at-once fan-out. Pilot-first sizing: every full run is preceded by a 1/10th pilot whose calibration must pass before the remainder is authorised."
    status: pending
    depends_on: [ws2-readiness-review, ws4-canary-gate]
isProject: false
---

# Corpus-Analysis Salvage and Topology Redesign

## Problem (framed before any solution)

- **Gap**: the pipeline spends 100% of its budget before its only calibration
  instrument (the recall gate at meta) reads anything. A judgment-regime
  failure — the exact thing that happened on 2026-07-02 (Sonnet no-tools
  voters killed 11/18 known-real baselines the run had correctly found) — is
  invisible until everything is spent. Power is also allocated uniformly:
  every candidate gets the same voter cost regardless of stake, and every
  window the same extraction cost regardless of signal.
- **Who it harms**: the owner's quota and money (the 5h window silently
  overflows to API billing — ~$448 spent this session, ~$220 of it on
  regimes later abandoned); the discovery itself (over-kill masks value).
- **Mechanism**: batch-sequential topology with calibration terminal, no
  interleaved known-answer probes, no running kill-rate breaker, no pre-run
  agent/token/dollar declaration, and single-pass disjoint windows at
  extraction (shot noise at window boundaries).
- **Constraints**: PDR-122 (agents judge atomically, code computes and
  routes); the frozen adjudication math; conservation-first (kills are
  conserved, never deleted); owner directives 2026-07-02: NEVER re-run the
  full validate under a changed regime to test it — pilots at ~1/10th corpus
  are the instrument; every run pre-declares its agent count and cost;
  candidate concurrency 8.
- **Success looks like**: a regime failure costs ≤ ~5% of a run's budget
  before a typed abort; every run's cost is predicted before launch within
  ~2x and measured after; extraction noise is reduced by overlap; expensive
  models touch only the candidates whose disposition is contested or
  high-stakes.

## Full-processing mandate (ws1c–ws1g; owner-directed 2026-07-03)

The owner directed (2026-07-03, verbatim intent): ALL rescued knowledge is
processed and critically assessed — the prior "owner's manual round" /
"owner-gated" framing on tier E and the adjacent strata was **never ratified by
the owner** and is withdrawn (`precedence-is-not-approval`: a recorded gate is
a prior session's claim, re-verified live, never standing authority). The sole
owner-stated boundary: comms events are handled in a separate session under a
separate plan. The reports stay immutable point-in-time records; this plan is
where the supersession lives.

**Acceptance (outcome-level)** for ws1c–ws1g as a set:

1. Re-running the ws1c inventory at the end shows every stratum with every
   item dispositioned — the falsifier is any item lacking a home/commit trail.
2. All five todos completed; this status line carries no un-ratified gating
   language.
3. Each executing session's closeout reports value and impact (what knowledge
   reached which home, what behaviour it changes), never accounting.

**Method invariants** (every workstream): first-hand, critically assessed
(`verify-dont-trust` — subagent findings verified before absorption);
conserve-by-default with named-reason rejections (PDR-122); the PDR-098
recurrence check with the temporal qualifier; no ledgers
(`permanent-doc-is-the-consolidation-record` — the batch todos carry drain
state, homes + commits are the per-item record); commits via the commit-queue
workflow only (F-112 fixed at `b2ae96898`; a workflow failure is an error to
stop on, never a trigger for an equivalent route); buffers empty at each
session close; fitness signals route structure work and never license
trimming. Whole-set effort estimate: roughly 3–6 sessions (tier E is ~3×
ws1b's volume; ws1c/e/f/g are single-sitting scale); ws1d/e/f are mutually
independent, ws1g depends on ws1c.

**Out of scope for ws1c–ws1g**: re-running any judgment stage; building
pipeline code (the leaf-coverage accounting gap and the keep-filter kind-bias
are design input routed to ws2/Phase-0); comms-event processing (separate
owner-routed plan); the v2 conservation plan's WS-C/WS-D tail (tooling
promotion / discoverability, owned there); the pre-2026-02-15
experience-corpus backlog (a different corpus family with its own plan).

## Evidence base

[`../../../reports/agentic-engineering/large-corpus-analysis-tooling/burn-analysis-2026-07-02.md`](../../../reports/agentic-engineering/large-corpus-analysis-tooling/burn-analysis-2026-07-02.md)
— measured unit costs per agent type, meter calibration (~1M raw tokens/point),
counter biases, agent-count formulas. Judgment evidence: the committed
checkpoints (map 580 leaves / reduce 246 candidates / validate 26-keep-220-kill
/ meta 2-subsumes-5-partial-11-missed) plus 202 banked Opus free-tool verdicts
(54 candidates, 47 complete quorums; 40% quorum-level disagreement with the
Sonnet regime, one-directional toward kill).

## PROPOSED design decisions (ratify at ws2)

- **D1 — calibration-first ordering.** The known-answer probes run FIRST, not
  last. The recall baselines map to candidates before validate dispatch (the
  meta agent proved this mapping is computable); those candidates are seeded
  into the first validate batch as canaries and a deterministic breaker
  aborts the stage when canary kills exceed the threshold.
- **D2 — cellular extraction with overlap.** Map windows overlap (e.g. 50%
  stride, the semantic-vector analogy): each corpus region is read by ≥2
  independent cheap extractors; leaves are merged by deterministic dedup.
  Cost control comes from single-turn cells: one file (or one bounded chunk)
  per dispatch so context never accretes across many Read turns (the measured
  mapper burned ~1.27M raw/window because every extra turn re-reads the
  agent's whole context; 12 single-file cells cost less than one 12-turn
  agent and parallelise).
- **D3 — progressive power.** Tier the spend by stake: cheap wide pass
  (Haiku/Sonnet-low) extracts and RANKS; mid pass (Sonnet/high, locked
  single-turn) screens candidates; the expensive model (Opus) touches only
  (a) contested quorums, (b) the top-N ranked candidates, (c) synthesis
  stages. The deterministic state machine stays the sole router.
- **D4 — pilot-first sizing.** A full run is always preceded by a ~1/10th
  pilot (stratified window sample). The pilot's recall-on-canaries and
  kill-rate calibrate the regime; the remainder launches only on a passing
  pilot verdict plus owner go.
- **D5 — pre-run declaration.** Seeding prints: agent-count bounds, expected
  tokens (unit-cost table × counts), meter points, API dollars, and the
  wall-clock estimate at the configured concurrency. The post-run accounting
  command closes the loop against actuals.
- **D6 — batch-sequential validate.** Batches of ~25 candidates with the
  breaker evaluated between batches; candidate-granular resume already
  supports this shape. Concurrency 8 within a batch.

## Non-goals

- Re-running the 2026-07-02 validate under any regime (owner-directed).
- Changing the frozen adjudication math or the four conjunctive tests.
- LLM-emitted scores anywhere (PDR-122).

## Lifecycle

ws1 is conservation work on the current thread and can execute immediately.
ws2+ builds only after the readiness review ratifies D1-D6 in a fresh seat.
