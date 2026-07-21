# Corpus-Analysis Generalisation — Phase 0 Design Record

**Date**: 2026-07-05 · **Session**: Hedgehog stirs Rime (`da727a`, claude-code / claude-fable-5).
**Mandate**: the owner-scheduled fresh-seat Phase 0 design-ratification session — the promotion
trigger of
[`corpus-analysis-generalisation-and-knowledge-layer.plan.md`](../../../plans-backlog-2026-07/agentic-engineering-enhancements/future/corpus-analysis-generalisation-and-knowledge-layer.plan.md)
(in `future/` at this pause; the promotion to `current/` is restart work — see §Review), fired
2026-07-05. This session ABSORBS the salvage plan's ws2 readiness review (D1–D6 were PROPOSED
there; this record is their ratification).
**State**: STABLE POINT 2026-07-06 (owner-directed). Both reviews are COMPLETE and conserved in
§Review — assumptions-expert (ratify-with-revisions, 13 items) and architecture-expert-wilma
(sound-with-revisions, 18 findings; the three criticals amend ratified text). The draft
verdicts stand as drafted with the revision queues UNAPPLIED (except the landing-order truth
fixes). Nothing in this record is decision-complete until the queues are worked and the landing
set (PDR-122 amendment + companion-rule + code-site derivation text + plan promotion + salvage
routing) lands — that work continues on a NEW BRANCH after the current branch's PR merges
(owner direction 2026-07-06; the owner holds relevant developments to share post-merge).
**Evidence base**:
[`corpus-generalisation-research-2026-07-03.md`](corpus-generalisation-research-2026-07-03.md)
(adversarially reviewed — [`corpus-generalisation-review-2026-07-03.md`](corpus-generalisation-review-2026-07-03.md),
verdict needs-targeted-revision / core sound, corrections applied in place),
[`burn-analysis-2026-07-02.md`](burn-analysis-2026-07-02.md) (measured unit costs, method of
record), the banked measurement artefacts under `data/` (lens-correlation, banked-verdict
structural mine, probe supersession proof), and PDR-122 with its 2026-07-02/03 amendments.
Load-bearing code facts (dispatch literals, template capability envelopes, dual effort
vocabularies) re-verified first-hand this session against the live tree at `7ee0c8ffd`.
**Review**: assumptions-expert + architecture expert dispatched on this draft; verdicts and
absorbed findings recorded in §Review at the end.

Facts and measurements remain authoritative in the evidence reports; this record states
**decisions** and their warrants. Where a decision amends ratified doctrine (PDR-122), the
amendment text lands in the PDR itself — in the same landing set as this record's completion,
pending at this pause — and this record carries the rationale.

## Ratified decisions (the p0-design-ratify agenda)

### (a) Instrument identity — RATIFIED

The instrument is a **calibrated measurement instrument**: a recall/novelty diff of a document
corpus against the Practice knowledge base, whose validated findings feed the shared conservation
machinery (PDR-014 via PDR-122's feeder clause). Structurally it is **compiler-shaped** (parse →
typed IR → deterministic passes → multiple backends); the knowledge graph is **one optional
downstream backend**, never the identity. The indexer identity and the KG-builder identity are
ruled out on the report's three independent grounds (feeder clause; LazyGraphRAG cost evidence;
derived-not-authored).

**Warrant**: the differentiating value is calibrated judgment — known-answer recall,
conserve-by-default quorums, deterministic aggregation, cost governance — none of which an
indexer or KG-builder identity preserves. **Falsifier**: a consumer-query inventory demonstrating
multi-hop-dominant demand would justify promoting the graph backend to a first-class output — the
gate stays (index-first is the cost-correct default until then).

Honest caveat carried from the review: "calibrated" is the design target, not the current state.
The two calibration debts (the 2026-07-02 regime failure; quorum diversity) are settled by (c)
and (e) below.

### (b) Five-layer decomposition and boundaries — RATIFIED with two refinements

The five layers stand as the report's table: **KERNEL** (adjudication state machine + quorum,
recall engine, triage, salvage stratification, completeness, cost engine, checkpoint IO,
recompute close) · **HARNESS-WORKFLOW KIT** (output contract, emitter, esbuild seeding, stage
guards — the highest-value extraction seam) · **CORPUS FAMILY** (citation locator, taxonomy
vocabularies, prompt/brief builders, recall baselines, partition deriver, negative-space source)
· **REGIME** (per-task-class model/effort/agentType/turn-budget + calibration) · **RUN** (ceiling,
checkpoint paths, resume ids, throughput).

Refinements ratified into the boundary:

1. **Window ordering comes from the partition (family layer), never string collation in the
   kernel** (the R2 behavioural leak: `temporalCoverageReport`'s `localeCompare` assumption).
   The partition deriver is a **declared plug-point of every corpus family**, and it owns window
   ordering. The kernel treats window ids as fully opaque — semantics as well as types.
2. **`aggregation-recall` splits engine/data**: the recall *engine* is kernel; the recall
   *baselines* are family (open question 13, ratified explicitly). The leaf/candidate schemas
   hang off the same boundary: kernel schemas are generic over family-supplied vocabularies
   (see question 4).

### (c) D1–D6 as kernel topology features — RATIFIED; extended by three owner-directed features

All six salvage-plan proposals are ratified **as kernel features** (corpus-agnostic protocol,
landing WITH the kernel extraction — never a napkin-instance patch):

- **D1 — calibration-first ordering.** Known-answer canaries are seeded FIRST in the validate
  stream behind a deterministic abort breaker. A regime failure costs ≤ ~5% of a run's budget.
- **D2 — cellular extraction with overlap.** Windows overlap (≥2 independent cheap extractors
  per corpus region); leaves merge by deterministic dedup. Cost control is **single-turn cells**:
  one file (or bounded chunk) per dispatch, so context never accretes across Read turns. The
  measured warrant: the multi-file mapper burned ~1.27M raw/window because every turn re-reads
  the agent's whole context; N single-file cells cost less than one N-turn agent and parallelise.
- **D3 — progressive power.** Cheap wide pass extracts and ranks; mid pass screens; the
  expensive model touches only contested quorums, top-N candidates, and synthesis. The
  deterministic state machine stays the sole router. Sharpened by the model-tier economy
  invariant below.
- **D4 — pilot-first sizing.** Every full run is preceded by a ~1/10th stratified pilot whose
  calibration must pass (recall-on-canaries + kill-rate + the D7 blindness probe) before the
  remainder is authorised, plus owner go.
- **D5 — pre-run declaration.** Seeding prints agent-count bounds, expected tokens, meter
  points, API dollars, and wall-clock at configured concurrency; post-run accounting closes the
  loop against actuals (the burn-analysis method made permanent tooling).
- **D6 — batch-sequential validate.** Batches of ~25 with the breaker evaluated between batches;
  candidate-granular resume already supports the shape.

Three new kernel features are ratified from the owner's 2026-07-05 design inputs (recorded in
the plan §Phase 0 design inputs; this is their design form):

- **D7 — profiling-derived briefs and the blindness probe.** Miner briefs are **derived from a
  Fable-tier profiling pass** over a corpus sample — never authored a priori (ADR-200's
  vocabularies-discovered discipline applied to briefs). Briefs are versioned family artefacts
  inside the `promptHash` (a brief edit invalidates the stamp exactly as a prompt edit does).
  The D4 pilot includes an **open-ended Fable pass over the same pilot windows** (no brief); the
  deterministic diff between briefed-miner yield and open-ended yield on identical windows is
  the **blindness figure**, recorded in the calibration stamp. Every miner output schema carries
  a **bounded overflow slot** (out-of-brief signals, hard-capped) so signal the brief did not
  anticipate has a path that cannot blow output bounds. This is the design treatment for
  brief-induced blindness — the failure mode all the reliability machinery makes quieter rather
  than louder: the narrower the brief (and narrower is better for miner economy), the more the
  blindness risk concentrates, so the probe is a standing pilot-stage instrument, not a one-off.
- **D8 — synthesis raw-exposure and paired blind duplication.** Fable-tier synthesis agents get
  **direct raw-material exposure**: spot-check some source files in full AND shallow-scan many,
  to understand the corpus and calibrate how the mined data represents it. Exposure is made
  measurable by **paired blind duplication**: the Fable tier re-mines a stratified random sample
  of Sonnet-mined windows; the yield diff is the exposure-calibration statistic recorded in the
  stamp. Every mined claim carries **file:line plus a verbatim quote span**, so synthesis drops
  to raw source on demand (demand-driven exposure), and grounding checks stay deterministic.
- **D9 — fleet output-bounding and completion tracking.** Output-side context is the
  fleet-scale bottleneck: miner structured output is **hard-bounded** (schema caps, the bounded
  overflow slot), reduce is **sharded/hierarchical** where the leaf volume demands it, and every
  stage that can be deterministic code IS workflow code, never an agent. **Per-window/per-cell
  completion tracking** is a kernel close requirement: a dead miner is re-dispatched, never a
  silent recall hole (the existing completeness machinery generalises to cell grain).

### (d) Regime registry and calibration stamps — RATIFIED

A typed **regime registry** keyed by **task-class** (mapper / reducer / voter / meta and future
classes), living **in code as the corpus-family default, with per-run override recorded in the
run manifest** (question 2). Each entry:

```text
RegimeBinding = { model, effort, agentType, maxTurns, toolSurface, lensSet }
CalibrationStamp = { regimeHash, promptHash, corpusFamily, validatingRunId, date,
                     resolvedModelId (recorded, not hashed),
                     measuredTokensPerAgent, measuredQualityFigure,
                     measuredEffectiveVotes, measuredInterLensPhi,
                     blindnessFigure (D7), exposureDiff (D8) }
```

- **Two co-stamped hashes** (question 11/14): `regimeHash` over the binding tuple; `promptHash`
  over the family's prompt/brief builders. Quality figures are valid only for the
  (regimeHash × promptHash × corpusFamily) triple; a change to either hash invalidates.
- **The lens/quorum set is a stamped member** (question 14): changing the lens set changes the
  judgment regime by the same evidence that motivates stamping the model.
- **`resolvedModelId` is recorded post-run from transcripts and checked by the D1 canaries at
  runtime** — the symbolic tier (`'sonnet'`) can silently re-resolve platform-side, so drift
  detection is behavioural, not hash-based.
- **Three-tier enforcement**: (1) build-time stamp-freshness refusal at artefact emit (the
  `--ceiling` no-default refusal shape); (2) test-time mirror conformance asserting the TS
  dispatch literals + template frontmatter + platform adapters equal the registry — the
  registry is the source and the agent-type definition files are **generated or
  conformance-pinned from it** (the harness accepts per-dispatch model/effort/agentType but NOT
  per-dispatch tool allow-lists or turn caps — verified first-hand against the live wrapper
  frontmatter, so templates remain the enforcement vehicle for those members; question 5's
  answer is generate-from-registry, not inline dispatch config); (3) runtime canary drift
  detection. The live TOML/TS drift (mapper `low` vs Codex adapter `high`) is the standing
  worked instance tier 2 must catch; unwired parity adapters are conformed-or-regenerated.
- **The stamp is a comparative promotion gate, not a passive record**: a new regime's quality
  figure is compared against the incumbent stamp on the shared canary set before it may own a
  production run (the MLflow/eval-gated-promotion precedent; Great Expectations is the
  cautionary opposite).
- **Checkpoint merging across differing regime hashes is a typed refusal** (question 2's second
  half): the regime hash is stamped into every envelope, and the incremental fold (watermark
  manifest) keys on it, making invariant-6 recalibration mechanical.

### (e) Quorum diversity — PDR-122 invariant-2 amendment RATIFIED (PDR edit pending at the pause)

**Disposition: amend.** Invariant 2 as written derives the majority licence from lens
distinctness ("distinct lenses so they are uncorrelated"). That derivation is now **measured as
unsupported**: mean pairwise inter-lens phi ≈0.548/0.544 in both measured regimes → **≈1.4
effective votes of 3**; cross-regime quorum agreement 59.6% with an 18-of-19 one-directional
(Sonnet-kill/Opus-keep) asymmetry; the external keystone sources (verified first-hand 2026-07-03)
show cross-family panels reach only ~2 effective votes and accuracy-weighting provably cannot
repair correlation.

The amendment (to land in PDR-122 with this record as evidence; the companion rule
`agentic-judgment-conserve-by-default` lines 27–28 carry the same derivation and take the
matching touch):

1. **Independence is measured, never asserted.** The effective-vote count (n_eff from measured
   inter-voter correlation on canaries) is a calibration-stamp figure; the quorum boundary that
   licenses an irreversible discard is computed from **measured** n_eff, not nominal voter count.
2. **Dependence-aware deterministic aggregation** (remedy A) and **correlation-deflated or
   e-process boundaries** (remedy B) are the first-line cures — deterministic-code changes, no
   new voters, PDR-122-native.
3. **Cross-tier/cross-regime concurrence is the irreversible-discard bias gate** (remedy C): a
   terminal discard from a regime with measured one-directional bias requires the conservative
   regime to concur. A regime whose measured n_eff cannot support its declared quorum boundary
   does not own terminal discards alone.
4. Cross-provider judges, input/evidence diversity across lenses, and a human quorum for the
   irreversible tail (remedies D/E/F) remain scoped experiments, sequenced after A+B+C.

Prompt-lens diversity on one model remains a defensible **cost-tier** choice only while the
measured effective-vote count supports the quorum math it feeds — which is now a stamped,
machine-visible quantity, not an assumption.

## Kernel invariants from the owner design inputs (2026-07-05) — RATIFIED

1. **Model-tier economy.** Bulk mining runs on Sonnet-tier (or equivalent) models under
   **utterly clear and narrow briefs** — the narrower the better; synthesis belongs to
   Fable-tier models. This is a kernel invariant, not a tuning preference: the D3 router and the
   regime registry encode it (mining task-classes bind cheap tiers; synthesis task-classes bind
   powerful tiers), and D7 owns the risk the narrowness creates.
2. **Powerful models get direct raw-material exposure** (D8). Without it, everything the mining
   tier filters out is lost invisibly; with paired blind duplication the loss is measured.
3. **Miners are context-minimal by construction.** No main-repo rules or skills loaded; Read as
   the only tool; `disallowedTools` belts the rest; system prompt inline in the dispatch wrapper
   so turns are spent on corpus reads. The live `corpus-mapper` envelope already embodies this
   shape (verified first-hand) — it is ratified as the **kernel contract for every mining
   task-class**, not a napkin-instance choice. At hundreds of agents, every per-agent context
   line is a budget line.
4. **The token audit deliverable**: satisfied at the baseline by the burn analysis (method of
   record; corpus-mapper ~1.27M raw/window under the multi-file shape, corpus-voter ~48k median
   under the locked single-turn shape — the 7–17× tool-surface lever, measured). The residual is
   forward-looking: the P1 pilot records the **post-D2 single-file-cell miner figure** as
   `measuredTokensPerAgent` in the family's first stamp, making "minimal context" a measured
   budget line per regime, permanently.

## The seventeen open questions — verdicts

1. **Lens set: kernel parameter or frozen?** Kernel takes lens set + quorum size as parameters
   (PDR-122 non-goals already say per-pipeline config); the napkin family pins today's three.
   The quorum *math* is dependence-aware (e): the lens-set parameter travels with its measured
   phi/n_eff in the stamp.
2. **Regime table home?** Corpus-family default in code + per-run override recorded in the run
   manifest; regime hash stamped into every envelope; cross-hash checkpoint merge is a typed
   refusal. Together with the three enforcement tiers this machine-enforces invariant 6. RATIFIED
   in (d).
3. **Extraction sequencing?** Land the kernel WITH the D1–D9 redesign; comms is the second
   consumer that drives the extraction; `packages/*` stays triple-gated. (The plan already
   recorded this resolution; ratified.)
4. **Do the napkin taxonomies generalise?** No — signal categories and pattern kinds are
   **family-owned vocabularies**, discovered from each corpus (ADR-200's vocabularies-discovered
   discipline), never templated across families. Kernel schemas are generic over the injected
   vocabulary; the comms family discovers its own in its profiling pass (D7).
5. **Programmatic tool allow-list / turn cap per dispatch?** Not supported by the harness
   (verified: `tools` / `disallowedTools` / `maxTurns` live in agent-definition frontmatter,
   not the dispatch call). Verdict: the regime registry is the single source and the agent-type
   definitions (× platform adapters) are **generated or conformance-pinned from it** — a regime
   is one declared object; the files are its build artefacts.
6. **Stratum for the extracted kernel?** Intra-workspace layering now (pipeline-general layer vs
   napkin-instance layer inside `agent-tools/src/corpus-analysis/`); `packages/*` decision stays
   with the WS0 architecture-standard fork under the knowledge-layer framing; triple gate
   unchanged.
7. **zod↔JSON-Schema SSOT for idea-node shapes?** DEFERRED to P2, blocked on ADR-200 WS2 (which
   owns the call). Constraint ratified now: whichever direction WS2 picks, the bridge is pinned
   by a conformance test. Not a P1 blocker.
8. **Construction/linking layer home?** DEFERRED placement to P2 (agent-tools vs the idea-graph
   domain SDK — decide when ADR-200 WS2 lands and the second consumer's shape is concrete).
   Ratified now: it is built ONCE, downstream of the pipeline, shared with ADR-200 §8, with a
   reconciliation-API-shaped public surface, and its merge decision is PDR-122-bound under the
   amended invariant 2 (dependence-aware quorum; cross-regime concurrence for the irreversible
   merge).
9. **Vocabulary-discovery pass rigour?** Risk-tiered: vocabulary discovery is reversible →
   lighter judgment (single judge + deterministic screening) is licensed. Irreversible
   dispositions (kills, merges) always take the full quorum. RATIFIED.
10. **Graph-delta: checkpoint kind or post-run artefact?** Post-run renderer artefact, outside
    the stage grammar. The pipeline ends at typed checkpoints; the construction layer begins
    downstream. (Composes with (a): the graph is a backend.)
11. **Prompt version stamped?** YES — `promptHash` co-stamped; includes D7 brief versions.
    RATIFIED in (d).
12. **Novelty-direction calibration?** RATIFIED as a kernel calibration requirement: known-homed
    canaries are seeded through the corroboration stage; a "genuinely novel" claim carries a
    measured false-novelty bound or is explicitly labelled unmeasured.
13. **`aggregation-recall` kernel or family?** Engine kernel, baselines family. RATIFIED in (b).
14. **Stamp membership details?** promptHash YES; lensSet YES (stamped member);
    `resolvedModelId` recorded-not-hashed; and a minimum measured-effective-votes gate on
    terminal-discard ownership falls out of the amended invariant 2 (the boundary is computed
    from measured n_eff — a regime that cannot support its boundary cannot own discards alone).
    RATIFIED in (d)/(e).
15. **Linking-layer specifics?** Shape ratified (Fellegi–Sunter three-band; blocking
    deterministic-first with any embedding model a stamped regime member; per-pair atomic
    judgments; periodic re-blocking sweep as the elusion analogue; three-band thresholds are
    per-corpus-family calibrated artefacts). Numeric thresholds DEFERRED to P2 calibration.
16. **Standing-audit specifics?** Shape ratified: elusion audit over a rolling regime-keyed kill
    pool (pool resets on regime-hash change — the bound is regime-scoped); Clopper–Pearson
    one-sided upper bound, never point estimates; the audit quorum is cross-regime (a same-regime
    audit shares the bias it exists to detect); Krippendorff alpha over the three-category
    nominal disposition PAIRED with n_eff (agreement alone would ratify a correlated echo);
    PRISMA flow rendered deterministically from `disposition-partition`. The recall-floor gate
    threshold lives in the stamp (comparative promotion). Cadence numbers DEFERRED to P1 pilot
    calibration.
17. **Estate-inversion specifics?** OUT of this plan's scope — feeds the proposed estate ADR
    (markdown→graph inversion), which generalises ADR-200 + PDR-119 and must bind the §8
    reconciler to amended PDR-122. Routed: the estate ADR is future work with its own owner
    gate; nothing in P0–P2 depends on it.

## Routed P0 requirements — RATIFIED as kernel close/audit contract

- **Leaf-coverage accounting** (ws1e finding): the close accounts every extraction-stage output;
  leaves entering no candidate are a first-class residual stratum in the close report, never
  silence. (The 2026-07-02 run's `residual=0` was candidate-scoped; 83/580 leaves were invisible
  downstream.)
- **Repeatable-not-heroic** (conservation WS-C, owner-ratified routing): the ratified instrument
  ships as a driveable, documented capability — a skill or equivalent running one analysis end to
  end (cost gate → dispatch → deterministic aggregation → keep-set) handing kept candidates to
  `consolidate-until-done` — never a hand-assembled run. The tested deterministic modules in
  `agent-tools/src/corpus-analysis/` are adopted, not rebuilt (brought into whole-tree gate
  conformance at adoption).
- **Tracked watermark manifest** (the R1 cure + incremental substrate): keyed by (git SHA,
  processed event-UUID set, corpus family, regime hash), with a declared lookback window for
  late arrivals and MERGE-upsert idempotent re-judgment; silent bulk removal of the untracked
  tier trips a validator instead of a forensic accident.
- **Deterministic base rates** (ws1f finding): `baseRateHolds` carries the highest
  low-confidence rate in both main regimes — base rates are computed deterministically from the
  corpus and supplied to voters as grounding, never intuited by them.
- **Run-scoped candidate identity**: candidate IDs are per-run, never stable across corpora; any
  cross-run linking goes through run-scoped identity (and, at P2, the linking layer).

## What must NOT be built (carried forward, unchanged)

No bespoke per-feeder graduation step (PDR-122); no graph emission as an in-pipeline stage; no
construction layer inside the pipeline; no KG-builder identity; nothing in `packages/*` before
the triple gate; no extraction of napkin-instance policy (prompts, vocabularies, baselines,
tier definitions, drivers); no re-run of the 2026-07-02 validate under any regime; no
action-time doctrine-traction mechanism (consolidation-time telemetry only).

## Restart notes for the promotion author (conserved 2026-07-06 loss-scan)

Two pieces of session-context that reached no other durable surface; both are input to the
`current/` plan authoring, non-binding on its final shape:

- **The frozen-math reconciliation.** The salvage plan's non-goal "changing the frozen
  adjudication math or the four conjunctive tests" is NOT in tension with the amended
  invariant 2: the freeze governs **replay of banked ensembles** (banked verdicts re-enter
  `finaliseQuorum` under their original math — the salvage layer's comparability guarantee),
  while dependence-aware aggregation and deflated boundaries land as a **new stamped regime**
  (a design change requiring recalibration, exactly per invariant 6) and are never
  retro-applied to banked verdict corpora. The promoted plan must state this so the quorum-math
  workstream does not read the non-goal as a blocker, and the salvage tooling does not read the
  amendment as licence to re-derive banked outcomes.
- **P1 workstream sketch** (one decomposition that satisfies the ratified decisions; the
  promotion author re-derives freely): (ws-layering) kernel/family intra-workspace split along
  the ratified five-layer boundaries, partition-deriver plug-point, window-ordering cure,
  recall engine/baseline split — boundary pinned by conformance tests; (ws-registry) regime
  registry + two-hash calibration stamp + three-tier enforcement + effort-vocabulary
  unification; (ws-calibration) D1 canary-first + D4 pilot-first + D6 batch-sequential —
  absorbs salvage ws4 and part of ws5; (ws-power) D2 cellular extraction + D3 progressive
  power — absorbs the rest of salvage ws5; (ws-declaration) D5 pre-run declaration + permanent
  burn accounting — absorbs salvage ws3; (ws-quorum) the amended quorum math as deterministic
  code (dependence-aware aggregation, deflated boundaries, cross-tier concurrence gate);
  (ws-comms) the comms family module — stage-0 partitioner composition, mechanical grounding,
  PII screen, watermark manifest, D7 profiling pass + blindness-probe pilot, full run gated on
  pilot + owner go; (ws-package) repeatable-not-heroic packaging — the driveable skill,
  leaf-coverage close, PRISMA render, standing elusion audit.

## Review

Dispatched on this draft: assumptions-expert (2026-07-05, completed);
architecture-expert-wilma (first dispatch 2026-07-05 did not complete — no partial verdict
folded, per `verify-dont-trust`; restarted 2026-07-06 and completed — verdict below).

### assumptions-expert verdict (2026-07-05) — ratify-with-revisions

Overall: "the (a)–(e) core, the seventeen verdicts' dispositions, and the amend-not-record-
why-not call all rest on evidence that genuinely supports them — the invariant-2 finding is the
best-evidenced doctrinal correction I have reviewed in this estate. None [of the revisions]
re-opens a ratified direction." The revision queue below is UNAPPLIED at the pause except item
1's truth fixes; working it is the restart's first task.

**Critical:**

1. **Landing-order claims** — the draft asserted the PDR-122 amendment as landed and linked the
   plan under `current/` before either was true. FIXED in this record 2026-07-05 (pending
   tense); the restart lands the PDR amendment + plan promotion + this record's tense flip as
   one landing set so all claims become true atomically.
2. **A silently dropped owner sharpening: miners are recall-heavy with precision downstream**
   (include-when-uncertain, flagged; the validate quorum supplies precision — plan §Phase 0
   design inputs). Load-bearing, not decorative: a narrow brief plus an unstated
   precision-leaning miner default is precisely how brief-induced blindness compounds. Restore
   as an explicit kernel mining-contract clause (natural home: D7 or kernel invariant 1).

**Important:**

3. **The D7 blindness figure is confounded**: the briefed arm is Sonnet-tier, the open-ended arm
   Fable-tier, so the diff conflates brief-narrowing loss with model-tier capability. State the
   derivation — open-Fable vs briefed-Fable at fixed tier, or open−briefed corrected by
   `exposureDiff` — and record the rule with the stamp fields. (Open question for the restart:
   is D8's Fable re-mine briefed or open-ended? The answer determines whether `exposureDiff`
   and `blindnessFigure` jointly identify the brief effect.)
4. **The token-audit deliverable is a re-scoped owner P0 deliverable, not "satisfied at
   baseline"**: the burn analysis measured the abandoned multi-file mapper, not the
   context-minimal single-file miner the deliverable exists to pin. Present as an explicit
   deferral requiring owner acknowledgement, with the P1-pilot stamp as its named landing home.
5. **Salvage ws3–ws5 routing must be explicit** — ratifying D1–D6 satisfies their ws2 gate, so
   the same builds (D5=ws3, D1/D6=ws4, D2/D3=ws5) become executable in two plans at once. The
   promotion commit states the supersession (intended shape: absorbed into the promoted plan's
   cycles; salvage plan closes truthfully).
6. **`measuredQualityFigure` is under-specified while carrying the promotion-gate load**, and
   stamp fields are task-class-conditional (`measuredInterLensPhi` is meaningless for a reducer;
   `blindnessFigure` only for miner classes). Pin per-task-class quality figures (e.g. canary
   recall + kill-rate for voter classes; blindness/coverage for miner classes) and declare field
   applicability before P1 authors the first stamp.
7. **The ws1f keep-filter kind-bias has no explicit disposition**: D4's "stratified pilot" must
   name the stratum — canary and pilot stratification includes the measured under-weighted
   kinds (trajectory / protocol-evolution / single-window), so the kind-bias is a
   calibration-visible quantity.

**Observations (for the restart's judgment):**

8. D2's always-on ≥2 overlap is an unmeasured-cost default — the single-pass miss-rate it
   insures against has never been measured, and D8's duplication arm is exactly the instrument
   to measure it. Consider overlap degree as a family-calibrated parameter rather than a kernel
   "≥2 always". (The record's one genuine over-engineering candidate.)
9. D7 probe cadence: fires per (regimeHash × promptHash × corpusFamily) triple and per corpus
   advance, not unconditionally per pilot — a repeat probe on an unchanged triple over an
   immutable corpus re-measures a stamped quantity.
10. Amendment altitude: keep points 1 + 3 (and the computed-from-measured-n_eff clause of 2) in
    the PDR; leave technique names and remedy sequencing (dependence-aware aggregation,
    e-processes, the A–F ladder) in this record and the execution plan —
    `no-moving-targets-in-permanent-docs`, and the techniques are literature-backed but locally
    unproven.
11. Q17's estate-ADR routing has no carrying artefact — name a landing surface (a `future/`
    plan stub or a pending-graduations entry) or the routing is a drop in slow motion. (The
    safety half — ADR-200 §8 bound to amended invariant 2 — is already captured in Q8's
    ratified constraint.)
12. The PII screen may be kernel-shaped rather than comms-family-only: two corpora already need
    it and the org posture is unconditional — consider a kernel pre-fan-out screen slot taking
    a family-supplied predicate.
13. Q5's "generated or conformance-pinned" leaves a two-way mechanism choice — the promoted
    plan's cycle picks one.

Blocking-legitimacy assessment: all DEFER verdicts (Q7, Q8, Q15 thresholds, Q16 cadence, Q17)
judged legitimate with named owners/triggers; proportionality judged sound apart from items 8–9;
the stamp field set and three-tier enforcement judged NOT over-engineered (each tier catches a
distinct first-hand-verified drift channel).

### architecture-expert-wilma verdict (2026-07-06, restarted dispatch) — sound-with-revisions

Overall: "the five-layer split, the D1–D9 features, and the invariant-2 amendment are genuinely
grounded in the code — every load-bearing claim I re-verified first-hand held… None of my
findings re-opens a ratified direction. The gaps are all *interaction* failures between
ratified pieces — the individual decisions are sound." The context-holder spot-checked the
critical claims at source before absorbing (all held; two cited paths corrected to their
`workflows/` locations). The findings below are UNAPPLIED at this stable point; findings 1–3
amend ratified text and are worked FIRST at restart, before the landing set lands.

**Critical (block decision-completeness until cured):**

1. **F1 — the abort/partial-result envelope grammar is missing; D6's ratified warrant
   ("candidate-granular resume already supports the shape") is contradicted by the code.** The
   failure envelope is `{ok:false, error}` only (`workflows/stage-io.ts:112-115`) and resume
   derivation rejects any `ok:false` prior wholesale, deriving `resolvedIds` from successes
   only (`workflows/run-inputs.ts:63-68,111`) — so a D1/D6 breaker firing between batches
   after committed spend either loses every resolved disposition (ok:false) or is
   indistinguishable from a clean partial (ok:true). Cure: a third envelope kind — partial
   success with a typed abort marker (`aborted: 'canary-breaker'`, batches completed,
   dispositions so far) that resume accepts and the regime machinery refuses to resume under
   the same regimeHash. (Amends (c) D6's warrant sentence.)
2. **D-1 — the stamped tuple omits the aggregation-math version; remedies A/B mutate the
   frozen replay substrate with no invalidation key.** `aggregation-adjudication.ts:97`
   declares the semantics frozen; the recompute close and salvage replay banked ensembles
   through the same function; RegimeBinding carries no quorum-math member, so the ratified
   cross-hash merge refusal never fires on a math change. Cure: co-stamp a kernel
   aggregation-math version and version the recompute close so replay uses the math recorded
   in the envelope. (Amends (d)'s RegimeBinding tuple; sharpens this record's §Restart-notes
   frozen-math reconciliation with the concrete mechanism.)
3. **B-1 — stale-artefact launch bypasses enforcement tiers 1 and 2 together.** Tier 1 fires
   at emit (`workflows/build/build-run-artefact.ts` writes the seeded artefact) but launch is
   decoupled (`Workflow({scriptPath})` over the old file re-launches forever); tier 2 conforms
   source, not the launched bundle. Cure: inline the regimeHash into the seeded artefact and
   check it in-sandbox (the stage-discriminant precedent) + at close; fold
   regeneration-and-hash-compare into the tier-1 emit refusal (which also closes both
   generated-file drift modes: hand-edited generated file; registry edited, generator not
   run). (Sharpens (d) tier 1/2 without changing direction.)

**Important:**

4. **A-1** — a second behavioural family leak in the same kernel module as R2:
   `post-run/post-run-analysis.ts:65` hardcodes the napkin longitudinal kind-set
   (`LONGITUDINAL_KINDS`), used at :87, as an UNPINNED mirror of the identical inline list in
   `workflows/prompts.ts:124` — the exact mirror class invariant 3 requires a conformance pin
   for. (Spot-verified first-hand at both sites.)
5. **D-3** — cold-start phi default direction unratified: a regime with no banked phi must
   default phi→1 (one effective vote, no discards licensed) until the pilot's canaries bank
   the first measurement; phi→0 reproduces the pre-amendment failure as a config default.
6. **D-2** — an honestly deflated boundary at n_eff≈1.4 may be unsatisfiable by 3 correlated
   voters → every kill-leaning candidate lands held-for-review → validate completeness never
   reads complete and meta refuses to seed (completeness deadlock). Ratify the terminal
   semantics: likely a distinct `conserved-unlicensed` terminal state that closes the run.
7. **C-2** — the D7/D8 diff operator is unspecified and is a judgment in disguise (free-text
   claim matching = the deferred P2 linking problem). Cure inside D8: pin the diff as
   deterministic span-overlap matching and require the open-ended arm to emit the same
   span-anchored schema.
8. **A-2** — `OBSERVED_VALIDATE_TOKENS_PER_VOTER = 50_000` (`run-orchestration.ts:123`) is
   napkin/Sonnet regime calibration baked in as the silent default of the post-reduce money
   re-gate (:148); make unit costs required, stamp-sourced (the `--ceiling` no-default shape).
   Same class, milder: `cost-and-coverage.ts:19` DEFAULT_EFFORT_MULTIPLIERS.
   (Spot-verified first-hand.)
9. **F-2** — the D1 breaker must fail closed on missing canaries: the denominator is canaries
   SEEDED, never canaries returned (dead agents' nulls otherwise shrink it to vacuous success).
10. **D-4** — phi-estimator degeneracy: minimum-n and variance gates before a stamp is
    promotion-eligible; clamp negative phi (zero-variance canary sets are the expected good
    case and leave sample phi undefined).
11. **B-3** — cross-platform conformance is projection, not equality (Codex has no `maxTurns`
    analogue — verified); a registry member with no target representation is a typed
    conformance failure, never a silent omission.
12. **E-2** — three kernel code sites carry the retracted independence derivation verbatim
    (`judgment-schemas.ts:108-111`, `aggregation-adjudication.ts:33,90-92` — spot-verified)
    and are missing from the amendment landing set; add them.
13. **F-4** — watermark manifest: derive it from committed checkpoints (a pure fold — the
    validators-must-recompute shape), never write it independently; and record the partition
    each event folded under so a late arrival invalidates affected WINDOWS, not just its own
    event-grain row.

**Moderate / observations:** **E-1** the "fully general" harness-kit label overstates —
`workflows/harness-types.ts:31` types the model axis as Claude vocabulary; remedy D requires
re-typing the kit's public contract. **C-3** overflow-slot saturation needs a `truncated` flag
+ a close-report saturation stratum (saturation above threshold invalidates the blindness
figure). **C-4** D9 completion ≠ coverage at cell grain — the existing detectors don't
generalise (zero-only completeness; median floors assume comparable windows); D2's overlap is
the real low-yield detector, so the overlap-degree decision (assumptions item 8) and D9 are
COUPLED and must be decided together; re-dispatch needs a structural-impossibility branch and
an exit bound. **A-4** the extraction seam cuts through `workflows/adjudication.ts:28` (kernel
value-imports family prompt builders — they become injected deps). **A-5** path-anchoring
posture inconsistency between `build-run-artefact.ts` (unanchored reads) and
`post-run/checkpoint-io.ts:44` (assertPathWithinBase).

**Structural blind spot named honestly (C-1, not curable by D7 itself):** briefs derive from a
Fable profiling pass and the open-ended probe arm is also Fable over the same pilot windows —
signal invisible to the Fable tier (or absent from the pilot sample) is invisible to BOTH arms,
so `blindnessFigure` is a **lower bound on loss** relative to the profiling model's ceiling,
and the stamp-field semantics must say so. The levers above the ceiling are remedy E (evidence
diversity) and human spot-audit.

**Reviewer routing recommendations for the restart:** dispatch architecture-expert-fred on the
conformance-test design when the registry/generator land (B-3 is his territory);
architecture-expert-betty on the `adjudication.ts` boundary refactor at extraction time (A-4).
