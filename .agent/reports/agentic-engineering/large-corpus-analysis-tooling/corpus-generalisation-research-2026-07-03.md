# Corpus-Analysis Generalisation — Research and Evidence Report

**Date**: 2026-07-03 · **Session**: Rosemary stirs Bracken (`9f59e1`; authored under
claude-fable-5, model switched to claude-opus-4-8 mid-session for this review-and-record pass).
**Status**: Research complete; no reshaping performed. This report is the durable evidence base
for the strategic plan
[`corpus-analysis-generalisation-and-knowledge-layer.plan.md`](../../../plans-backlog-2026-07/agentic-engineering-enhancements/future/corpus-analysis-generalisation-and-knowledge-layer.plan.md).
**Revised 2026-07-03** (Hazel rides Orchard, `de9f72`) per the first-hand adversarial review
[`corpus-generalisation-review-2026-07-03.md`](corpus-generalisation-review-2026-07-03.md), which
reproduced every sampled `[V]` claim and applied three corrections in place: the comms-residual
interpretation (R1), the leak-inventory completeness (R2), and three restored open questions (R3).
The review report preserves the pre-correction wording and the evidence for each change.

## Provenance and verification legend

Produced from an eight-lens research fan-out (two `Workflow` runs: six foundation lenses
`wf_c21301bf-abd`, two graph/alternatives lenses `wf_c1ad1062-352`; ~894k subagent tokens total).
Every lens returned structured findings with file:line or URL evidence. Per owner direction
("deeply, critically, adversarially evaluate all subagent responses"), the load-bearing claims
were re-verified first-hand by the context-holder before entering this report.

- **[V]** verified first-hand this session (command output or file read reproduced the claim).
- **[L]** lens-asserted with cited evidence, not independently re-run here (lower-stakes or
  external-literature claims); still carries its citation.
- **[O]** owner-stated intent or observation (2026-07-03), recorded verbatim in substance.

Absolute paths from the raw lens output have been rewritten to repo-relative form
(`no-machine-local-paths`).

## The question (owner brief, restated)

How do we generalise the corpus-analysis pipeline? What is the general
protocol/pipeline/infrastructure/substrate/core, and what is specific to analysing napkins? What
underlying patterns generalise, and are there well-known approaches in other fields (AI, data
science, biology, physics)? How do we pull **model** and **effort** out as separate, configurable
axes decoupled from pipeline logic, and configure which task types use which models/effort? How do
we apply the instrument to the **comms-event** corpus (live and archived), and to the **planning**
corpus to feed the intent knowledge graph? When/how should outputs become **graph-native**, kept
optional and general, with caller-specified node/edge shapes? What belongs in a deeper stratum
(`packages/libs`, `packages/core`)? What can the main tooling learn from the salvage tooling and
the rescued-knowledge funnel? How does it relate to the Practice, the knowledge flow, and the
learning loop? What are the alternative framings we have not explored?

## Headline verdict

1. **Identity — a calibrated measurement instrument, not an indexer and not a KG-builder.** The
   instrument's differentiating value is *calibrated judgment* (known-answer recall, conserve-by-
   default diverse-lens quorums, deterministic aggregation, cost governance). Extraction and
   indexing are commoditising (Google LangExtract, embedding RAG); graph construction is the
   expensive wrong default (Microsoft's own LazyGraphRAG defers it at ~0.1% of GraphRAG indexing
   cost). The defensible core is the *judgment layer*; the graph is one optional downstream
   backend. This answers the owner's dichotomy: **neither pole** — a calibrated recall/novelty
   *diff of a corpus against the Practice knowledge base*, whose validated findings feed the shared
   conservation machinery; the durable graph is derived downstream. [V: PDR-122:121-127 forbids
   per-feeder graduation; `agent-tools/src/corpus-analysis/aggregation-recall.ts` already computes
   the diff] [L: LazyGraphRAG cost, LangExtract — URLs in lens 8]

2. **One thread, not two.** The salvage plan's topology redesign (D1–D6) is *entirely
   corpus-agnostic protocol* — canary-first calibration behind a deterministic breaker,
   cellular/overlapped extraction, progressive power, pilot-first sizing, pre-run declaration,
   batch-sequential validate. You cannot extract a clean general core while freezing the failed
   all-then-calibrate topology: **the redesign is the shape of the general kernel.** Therefore the
   generalisation thread *contains* the topology redesign, and the salvage plan's `ws2` readiness
   review folds into this thread's Phase 0 design ratification. [V: D1–D6 in
   `corpus-analysis-salvage-and-topology-redesign.plan.md:43-112`, all protocol-level]

3. **Generalisation is mostly configuration-reification, not an engine rewrite.** The judgment
   kernel is already pure and corpus-agnostic; generality collapses at exactly three surfaces:
   composition roots hardcode run/family config, the boundary vocabulary leaks napkin-ness at named
   points, and the judgment **regime has no first-class representation**. [V — see §General vs
   specific]

4. **Owner observation [O], candidate goal:** this "is starting to feel like a pipeline for
   ingesting general documents and outputting a knowledge graph." Recorded as a candidate explicit
   goal — and it converges independently with the adversarial research (the compiler/instrument-
   with-graph-backend identity, and the four-layer construction pipeline below).

5. **Owner conviction [O], stronger ("more definite in my mind"):** what started as *agent tooling*
   has become a **knowledge curation and expression layer** that likely belongs in the main
   `packages/` collection, broken down along appropriate seams, with the agent-tools piece reduced
   to a **thin CLI**. Open to other approaches. This substantially sharpens the stratum destination
   (below), while the *path* still respects the standing sequencing gates.

6. **Owner observation [O], 2026-07-03 (added at the further-research pass):** "the emergent
   subtext seems to me to be that everywhere we are moving from markdown as the knowledge
   definition layer, to a knowledge graph as the knowledge definition layer, while retaining the
   markdown representation layer as both a rendering and an input layer that works well for
   humans." This is the estate-wide generalisation of what ADR-200 ratifies for the intent corpus
   (graph authoritative; documents the co-equal human embodiment; §8 reconciliation for
   human-edited prose), with one sharpening: markdown's role is precisely **two-way
   representation** — render target AND human input surface — while definition/authority moves to
   the graph. The corpus instrument is the migration engine for the shift. Homed in memory
   `project_graph_approach_is_practice_convergence_target`; a dedicated research lens covers the
   precedents and the genuinely-new decisions (§Further research).

## General vs corpus-specific vs regime vs run (the decomposition)

The cartography lens classified every module; the load-bearing boundaries were re-verified.

- **GENERAL PROTOCOL (kernel + harness kit).** The deterministic judgment engines —
  `aggregation-adjudication.ts` (the tiered state machine + quorum), `aggregation-verdict.ts`,
  `aggregation-recall.ts`, `cost-and-coverage.ts` (cost estimator), `run-orchestration.ts` (resume,
  completeness, re-gate, jitter, capped concurrency), `stage-io.ts` envelopes, `run-inputs.ts`, all
  of `workflows/build/` (the harness emission kit), and all `post-run/` modules except one regex.
  The library signatures **already honour the engine/config split**: e.g. `meetsGraduateGate` takes
  the gate as caller data and its own TSDoc says "the specific thresholds (0.6 / 0.85) are the
  run's configuration, passed by the caller; this function is the engine." [V: `aggregation-recall.ts`
  gate-as-parameter]

- **CORPUS-FAMILY-SPECIFIC (napkin).** `workflows/prompts.ts`, `recall-baseline-fixture.ts`, the
  `napkinDate` grounding-citation field (`judgment-schemas.ts:64-67` [V]), the signal-category and
  pattern-kind enums, the napkin-branded `*.meta.ts` workflow names, and partition derivation
  (currently operator-authored, no module).

- **REGIME-SPECIFIC (the missing first-class axis).** Model, effort, tool surface, turn budget —
  **smeared across three uncoordinated estates**: model/effort literals at four TS dispatch sites
  (`map.workflow.ts:42-43` sonnet/low, `reduce.workflow.ts:37-38` opus/high, `meta.workflow.ts`
  opus/high, `adjudication.ts:78-79` sonnet/high [V]); tool surface + `maxTurns` in the four
  `.agent/sub-agents/templates/corpus-*.md` frontmatter; and reified as data only *post hoc* in the
  hand-authored banked-verdict corpus. [V]

- **RUN-SPECIFIC.** `validateTokenCeiling`, checkpoint paths, `resolvedIds`, `CHOICE_B` (hardcoded
  in the driver [V]), and the throughput constants (concurrency, jitter).

The five-layer factoring, compactly (the general/family/regime/run split refined to separate the
pure kernel from the general harness kit):

| Layer | Content | State |
| --- | --- | --- |
| KERNEL | adjudication state machine + quorum, recall, triage, salvage stratification, completeness, cost engine, checkpoint IO, recompute close | exists, corpus-agnostic |
| HARNESS-WORKFLOW KIT | output contract, emitter, esbuild seeding, stage guards (`workflows/build/`) | exists, fully general; highest-value extraction seam |
| CORPUS FAMILY | citation locator, taxonomy enums, prompt builders, recall baselines, partition deriver, negative-space source | napkin-specific today; the plug-point |
| REGIME | per-stage model/effort/agentType/turn-budget + unit-cost calibration | unreified — smeared across three estates |
| RUN | ceiling, checkpoint paths, resume ids, concurrency/jitter | per-run; `--ceiling` already no-default |

**The napkin leak points** — three *vocabulary* leaks (enumerable): the `napkinDate` field; the
four prompt builders (hardcoded corpus description; the meta prompt hardcodes the baseline count
"18" twice); and the workflow meta names. Plus one *behavioural* leak the review restored from the
cartography lens (R2): `temporalCoverageReport` (`post-run/post-run-analysis.ts:89`) sorts window
ids by `localeCompare` and derives `earliest`/`latest` from that ordering — silently assuming ids
collate chronologically, true for date-ranged napkin windows, not guaranteed for another family.
Window ids are opaque strings in the *schemas*, so the partition axis does not leak at the type
level [V] — but it does leak in that module's semantics; the cure is that window ordering comes
from the partition (family layer), never string collation in the kernel, and the partition deriver
is a declared plug-point of every corpus family.

**The implicit general protocol, written out** (the reusable contract): (1) partition
`{window, files[]}`; (2) per stage: strict zod re-parse of committed checkpoints at the Node
boundary → structural gates → re-validate → bundle seeded with a stage discriminant → machine
output contract → launch; (3) in-sandbox: stage guard, least-privilege typed dispatch throttled by
capped concurrency + deterministic jitter, atomic judgments only, deterministic state machine
routes, agent death = first-class `unadjudicated`, `ok`-discriminated envelope with self-declared
completeness; (4) operator commits the envelope as the next checkpoint; resume is
candidate-granular; (5) cost = pre-spend estimate + post-reduce re-gate against an explicit
no-default ceiling; (6) post-run deterministic close: integrity → disposition recompute to
zero-diff → recall report + gate verdict → coverage/temporal/corroboration → triage banding;
(7) salvage stratification on regime failure; (8) findings feed the shared conservation machinery.
This eight-step sequence IS the reusable pipeline contract, with **corpus family, regime, and run
config as its three injected parameter blocks.** [L, structurally V via the module reads]

**The salvage layer is the architectural exemplar the run layer should converge to** [V]: a typed
conservation invariant (every candidate lands in exactly one stratum or the whole computation is a
typed failure — `salvage-tiers.ts`), frozen-math replay (banked ensembles re-enter
`finaliseQuorum`, never a re-derivation), single-definition exported supersession semantics
(`terminalResolutions` exported "a re-derivation there could silently disagree"), fail-loud
referential joins at every seam, injectable IO seams, and repo-root-anchored existence checks (the
cwd bug that reported 0/18 when the truth was 18/18). The run layer predates these lessons;
back-porting them (a partition-conservation invariant on validate/meta envelopes, referential
fail-loud at every stage seam, regime provenance recorded at write time) removes the run layer's
two known gaps and makes a future salvage bank-free.

## Model and effort as calibrated axes — the regime registry

The strongest external precedent [L] is the **scientific-workflow-manager split** (Nextflow /
Snakemake): a task declares its *resource requirements* as data and an executor abstraction
translates them, so the same pipeline runs on any backend without editing the workflow body. We
lack exactly this — model+effort are hardcoded inline per stage.

The design the evidence supports is **not a free-floating config file** but a typed **regime
registry** keyed by task-class (`corpus-mapper` / `-reducer` / `-voter` / `-meta`), where each
entry is a *calibrated artefact*:

```text
RegimeBinding = { model, effort, agentType, maxTurns, toolSurface }
             + CalibrationStamp = { validatingRunId, corpusFamily, date,
                                    resolvedModelId, measuredTokensPerAgent,
                                    measuredQualityFigure }
```

The stamp is what makes PDR-122 invariant 6 ("a regime change is a design change requiring
recalibration") **machine-checkable rather than a doctrine to remember**: a hash over the regime
tuple, and any edit to a member without a fresh stamp is a typed conformance failure ("recalibration
required"). This directly closes the free-floating-config failure mode — the mode that would let the
exact 2026-07-02 regime failure recur as a one-keystroke config edit.

Load-bearing evidence and constraints:

- **The axis split falls straight out of the doctrine [V].** Invariant 4 declares *throughput*
  (concurrency, batching, checkpointing) orthogonal to rigour → belongs in a run manifest, freely
  tunable. Invariant 6 declares the *regime* calibration-locked → belongs in code with a stamp,
  never a manifest. Budget is already run-manifest-shaped (`build-run-artefact.ts` requires an
  explicit `--ceiling`, "no default, ever"). So: **regime = code + stamp; throughput = run manifest;
  budget = mandatory per-run declaration in every billing denomination.**
- **Regime drift is already live, not hypothetical [V]:** `corpus-mapper` runs effort `low` in the
  TS dispatch but `model_reasoning_effort = "high"` in its Codex TOML adapter. The registry must be
  the single source, pinned to the wrapper/adapter mirrors by a conformance test (the PDR-122
  invariant-3 mirror pattern applied to configuration).
- **Two effort vocabularies exist [V]:** cost-model `Effort = 'low'|'medium'|'high'|'xhigh'` vs
  harness `effort = 'low'|'medium'|'high'`. Unify into one registry enum.
- **The burn report is the registry's seed content [L]:** per-agent-type unit costs are already
  keyed by regime tuple, with the 7–17× tool-surface lever measured (locking the voter's tool
  surface collapsed 8–14 turns to 1, ~48k vs ~814k raw tokens). These become `CalibrationStamp`
  fields the cost estimator and the operator read from one source.
- **The model tier is a symbol the platform resolves [V]:** the harness takes `'sonnet'|'opus'|…`
  but economics are priced against concrete snapshots (Sonnet 5, Opus 4.8), so a platform-side
  re-resolution silently changes the regime with zero repo diff. The stamp records the *resolved*
  model id from transcripts; the invariant-6 canaries behind the abort breaker double as the
  structural detector for silent tier drift.
- **Task-class, not stage name, is the right key [V]:** the four templates define
  platform-independent roles; applying to a new corpus reuses the same task classes with new prompts
  and a fresh per-corpus-family stamp — a *data addition*, not a code fork.

## Cross-field precedents (the transferable mechanisms)

Each stage has a named precedent in another field; the mapping both validates PDR-122 and exposes
gaps. [L unless marked]

- **Cascade classifiers (Viola-Jones) and HEP triggers (L1/L2/HLT):** cheap high-recall early
  stages reject the easy majority; expensive stages see only survivors; early stages tune for
  *recall*, and the cheap trigger **never owns a terminal discard** — the expensive stage owns
  rejection. Independently validates invariant 2 (conserve-by-default; the irreversible discard
  earns the highest rigour). [V: tiers 0/1 are single-voter and route kills to the tier-2 ensemble
  rather than terminally killing — `aggregation-adjudication.ts`]
- **Sequential hypothesis testing (Wald SPRT):** principled stopping — accumulate evidence and stop
  at a likelihood-ratio boundary with bounded error, versus our fixed `MAX_ROUNDS=8` cap and fixed
  pilot fraction. Applies to the canary abort breaker and the adjudication loop.
- **Biological spike-ins / positive controls:** insert known-answer items to measure the assay's own
  sensitivity/specificity before trusting verdicts — exactly invariant 6's canaries. Stratify
  canaries across the difficulty range and report measured recovery rate as the scale-up gate metric.
- **Weak supervision (Snorkel / Dawid-Skene / CARE):** a deterministic label model learns each
  source's accuracy *and inter-source correlations* from observed agreement, upgrading equal-weight
  majority to accuracy-weighted aggregation — fully compatible with invariant 1 (code computes the
  aggregate). A drop-in upgrade path, not a rebuild; raw per-lens votes are already recorded.
- **Active learning (uncertainty sampling) + FrugalGPT/RouteLLM cascade routing:** spend expensive
  judgment on the least-certain items; a stop-judger decides whether the cheap tier is confident
  enough to terminate. Our escalation is by verdict pattern, not an explicit uncertainty score.
- **e-discovery TAR (technology-assisted review) — [previously unnamed frame]:** the only mature
  field engineered around *exactly* our conserve-by-default asymmetry (a missed responsive doc is
  the irreversible harm, recall must be statistically certified). Contributes **elusion audits**:
  sample the *kill pile*, quorum-judge the sample, compute a statistical false-kill bound per run —
  a cheap standing calibration signal where our one-off full re-validation (which found ~80%
  false-kill) was the expensive discovery of the same quantity.
- **Computational grounded theory / qualitative coding — [previously unnamed frame]:** map→reduce is
  literally deductive coding with a codebook (the category enum) then axial coding (clustering);
  supplies the calibration statistic we lack a name for — **inter-rater reliability** (Cohen κ /
  Krippendorff α) on canaries, a per-item deterministically-computable "is this regime calibrated"
  number comparable across regime changes.
- **PRISMA / systematic review:** dual-LLM screening with human arbitration hit ~91% automation at
  ~8% error (validates the salvage/hold-for-review shape); the **PRISMA flow diagram** is a reporting
  standard (counts in/excluded per stage with reasons) that makes a run auditable by a
  non-participant — renderable deterministically from the existing `disposition-partition.ts` for
  near-zero cost.

## Sharpest correctness finding — quorum diversity was asserted; now measured at ≈1.4 effective votes

**Two independent lenses (cross-field and alternatives) converged on this, and the repo-internal
half is verified [V].** PDR-122 invariant 2 asserts the tier-2 lenses are "distinct so they are
uncorrelated, which is what licenses a simple majority." But **every voter at every tier runs on
the same model** — the single `dispatchVoter` serves tiers 0–2 with `model: 'sonnet', effort:
'high'` (`adjudication.ts:78-79`; the review sharpened the original tier-2-only phrasing); lenses
differ only by prompt [V]. The inline dispatch comment records the Sonnet choice as owner-decided
2026-07-02 — the finding is about the *doctrine's independence derivation*, not that choice. Condorcet's jury theorem and ensemble theory license a majority vote *only*
when voter errors are uncorrelated; correlation destroys the guarantee. External 2026 evidence [L]:
nine frontier judges from different families delivered only ~2 effective independent votes;
aggregation closes ≤11% of the gap when judges correlate. The repo's own data points the same way
[V]: the 47% vs 10.6% keep-rate divergence between regimes (PDR-122:106-108) shows **regime
dominates lens** — prompt-lens diversity on one model may be ~1–2 effective votes.

**MEASURED (2026-07-03, further-research pass) — no longer an estimate [V].** Deterministic code
over the committed checkpoints (banked at
[`data/lens-correlation-measurement-2026-07-03.json`](data/lens-correlation-measurement-2026-07-03.json);
vote = the four conjunctive tests all pass): mean pairwise inter-lens phi is **0.548** in the
Sonnet locked regime (246 complete three-lens quorums) and **0.544** in the banked Opus free-tool
quorums (54) — **≈1.4 effective votes out of 3, identically in both regimes**, so the correlation
is a property of prompt-lens-on-one-model, not of a tier. Cross-regime, the same candidates'
2-of-3 quorum outcomes agree only **59.6%** (47 comparable candidates; 18 of 19 disagreements
one-directional, Sonnet-kill/Opus-keep — the salvage tier-C set exactly). Within-regime voters
agree ~90% pairwise while cross-regime *majorities* barely beat a coin flip: **regime dominates
lens, measured**. Method caveat, honestly held: phi over live candidates conflates true-signal
agreement with error correlation (no per-candidate ground truth), so the canary-based measurement
stays the P0 instrument for error correlation specifically — but the invariant-2 derivation
("distinct lenses, therefore uncorrelated") is now *measured* as unsupported, not just argued.

This is a genuine gap in *ratified doctrine*, not just the tooling. **Disposition: recorded as a
candidate PDR-122 amendment; NOT amended this session** (recording, not reshaping). The design
session should: (a) measure inter-lens error correlation / effective-vote count on the canaries
(invariant 6 already mandates canaries); (b) seek diversity across model *regimes/families*, not
prompts alone — the salvage layer already cross-checks against an Opus banked quorum, so the
heterogeneity remedy exists but only post-hoc; (c) consider the weak-supervision label model as a
second-order upgrade (it cannot manufacture independence, so it is downstream of fixing the
diversity axis). **Refined by the further-research pass (§Quorum heterogeneity): cross-family
diversity is itself a weak independence lever (verified source: cross-family error correlations
can exceed same-family); the first moves are dependence-aware aggregation over the banked phi and
corrected quorum boundaries, with cross-tier concurrence as the irreversible-discard bias gate.**

## The comms-event corpus — the forcing second instance

The comms corpus is a *stronger* second instance than napkins on every axis that matters, and it is
the natural **extraction trigger** (`consolidate-at-second-consumer`). [V unless marked]

- **Grounding verification becomes MECHANICAL.** Events are immutable JSON keyed by UUID; a
  fail-closed provenance checker already exists (`agent-tools/src/bin/comms-provenance-check.ts`
  [V]). A deterministic substring/blob check against the event validates every citation at *zero LLM
  cost* — grounding moves from the judgment stratum into the deterministic core. This is a strict
  improvement over napkin quote-matching.
- **It is a COMPOSITION of existing strata, not a rebuild.** The general pipeline is
  `agent-tools/src/corpus-analysis/`; the comms-specific stage-0 partitioner and disposition
  write-back adapter already exist as tested modules in `agent-tools/src/collaboration-state/archive/`
  (`event-classification.ts`, `disposition-policy.ts`, `event-projection.ts`, `manifest.ts` [V])
  from the WS7 archive-move harness (ADR-199).
- **PDR-094 supplies the typed verdict enum and risk-tiering:** dispositions are `absorbed` /
  `routine` / `quarantined`; `routine` is the discard-equivalent → behind the diverse-lens quorum;
  `absorbed` requires an existence-verified durable-home pointer; the **body-read safeguard** (the
  `3cc1fb93` falsifier: a throwaway title over a live three-way session-split proposal) becomes a
  mandatory pre-fan-out stage — voters receive bodies, never titles.
- **Recall baseline is richer than the napkin run's [L]:** already-graduated comms-derived doctrine
  (PDR-094, ADR-199, the rules citing events, a 12-event provenance digest, WS1–WS6 reports citing
  ~900 event ids) supplies ready-made known-answer canaries and a theme taxonomy as ground truth.
- **Size for cost planning [V/L]:** live ~2,213 events / ~790k tokens; archive 3,176 (all heartbeat
  "routine") / ~520k tokens; the pre-untrack git tree has 5,202 events. Distinct union ≈ ~7,500
  events ≈ ~2.1M raw tokens; the substantive non-heartbeat subset ≈ ~2,900 events ≈ ~1.2M tokens.
  Peak live emission ~870 events/day. A quorum pass over the substantive subset with single-turn
  no-tools voters is order 5–15M tokens — pre-declare in every billing denomination and re-gate
  after stage-0.
- **PII/identity posture [V]:** authors are pseudonymous agent identities; zero human-name mentions
  in live bodies; the owner appears by role only. The one real leak channel is a machine-local home
  path — **17 live events embedded a `/Users/<user>/…` path at research time; 21 files matched by
  the 2026-07-03 review — the channel is live and growing** [V]. Responsible analysis requires a
  deterministic pre-fan-out PII screen (emails, machine-local paths, human-name patterns) before
  bodies reach voters or any artefact, and published findings should aggregate by role/pattern, not
  build per-agent dossiers without owner sign-off.
- **FORENSIC FINDING — the "~1,707-event residual" work-list is stale as described [V].** The live
  `comms/` directory contains no events older than mid-June (spot: oldest alphabetical file is
  `2026-06-27`); the archive manifest's 3,176 rows are all `routine` heartbeats; the falsifier event
  `3cc1fb93` is **absent from live disk but intact in git at `255117a43^`** (2026-05-21, full body).
  `git ls-tree 255117a43^ -- .agent/state/collaboration/comms/ | wc -l` = **5,202** [V]. The
  residual is fully recoverable and immutable in git (events were tracked until the WS7 untrack at
  `255117a43`). **The removal from live disk is UNEXPLAINED, not benign-by-design** (R1 — the
  review corrected this report's original interpretation): the untrack commit itself says "all
  preserved on disk", this checkout pre-dates the untrack (git directory born March 2026; the
  `comms/` directory inode 2026-05-13), and no manifest row, curator record, or comms event
  accounts for the removal — the 06-21 sweep explicitly deferred the residual and the 06-18/06-29
  passes moved only newer heartbeats. Candidates: an unrecorded `git clean` / checkout reset of the
  untracked tier. **This is a live gap in the untracked-state safety story**: the pre-untrack
  window is recoverable only because it happens to be in git; a post-untrack event removed the same
  way has no recovery path, and the archive-move harness (the intended safety mechanism) was
  bypassed. **Surface to owner; correct the stale work-list wording;** the correct corpus substrate
  for the archived residual is the **git tree at `255117a43^`** (immutable, complete, mechanically
  groundable, no live-watcher risk). Cure candidate for the design session: a tracked count/
  watermark manifest for the untracked tier, so silent bulk removal trips a validator instead of a
  forensic accident.
- **Channel coverage caveat [L]:** the canonical stream has a proven blind spot — during WS7 it was
  silent ~4h while all design dialogue ran on the ArcAngel rapid-comms channel. The corpus
  definition must either include the rapid-comms markdown channels (+ `conversations/`,
  `escalations/`, `sidebars/`) or declare a canonical-only bound explicitly.
- **New surface the napkin instance never faced:** the atomic unit is conversational, not a
  self-contained document (only 4 of 2,213 live events carry `in_reply_to`), so thread context must
  be *derived* (time-window × author/pair × tag/channel); and a live instance needs an
  incremental/watermark mode against the ~870/day rate. A disposition write-back home is also needed
  (the append-only `manifest.jsonl` has no row shape for a git-history-only event).

## The planning corpus and the graph dimension

The corpus tooling generalises to the planning corpus **by parameterisation, not new grammar**, and
the graph dimension resolves into a clean four-layer architecture. [V unless marked]

- **The four layers:** (1) *extraction/judgment core* (exists); (2) a **construction/linking layer**
  (id-minting, entity resolution, canonicalisation onto a target schema, mapping extracted concepts
  onto *existing* graph nodes, delta assembly) — **genuinely missing, and demanded twice**; (3)
  *graph substrate* (graph-core + a new idea-graph domain SDK); (4) *per-consumer renderers*.
- **The middle layer is real and already named piecemeal [V].** ADR-200 §Open enumerates as
  "genuinely UN-built" exactly these pieces: "the idea-node JSON Schema + id-minting + store layout;
  a new idea-graph domain SDK; the evolution tooling (`supersede`/`split`/`merge`/`redirect` with
  reference-rewrite + history — `graph-core` has only dataset CRUD); the frontmatter↔store validator;
  the harvest pipeline." And ADR-200 §8's prose→graph reconciliation workflow states "the match step
  **reuses** the de-duplication / same-idea mechanism (§Open)" [V:200-*.md:185] — so the linking
  layer has *two* consumers at design time (the harvest and the reconciliation workflow). **Build it
  once, shared, never inside the pipeline** (PDR-122's feeder clause).
- **Its grammar is already ratified — it IS PDR-122 invariant 1 applied to links [V].** ADR-200's
  dedup direction: "semantic judgement proposes merges → a deterministic merge op with
  reference-rewrite executes → the validator verifies." Identical to atomic-LLM-proposal /
  deterministic-execution / recomputing-validator. Entity resolution is not new doctrine.
- **The embryos exist as tested code [V].** The reduce stage's clustering is within-corpus entity
  resolution; `real-world-signal.ts` corroboration + `post-run/claimed-home-existence.ts` are the
  "map concept onto existing node" pattern — the LLM atomically names candidate home paths; code
  verifies each against a caller-supplied index; misses are reported, never crash. Generalise the
  "existing home paths" set to an existing-graph node index (id + statement + aliases). The layer
  stays pure; the caller scans the store and passes the index in.
- **Graph emission stays OPTIONAL as a renderer [V-doctrine].** Typed JSON checkpoints remain the
  pipeline's only contract; graph emission is a *downstream* transform `(checkpoints + target
  node/edge JSON Schemas + existing-graph index) → schema-validated PROPOSED deltas` that enter the
  graph only through the evolution ops and the recomputing validator. This preserves optionality (no
  graph target → skip the renderer, exactly as post-run/salvage is optional), derived-not-authored
  (the pipeline derives proposals; the graph's authority is exercised at ingestion), and the
  two-altitudes "thin deterministic formatter over a smart corpus" — *provided* the linking
  judgments are checkpointed upstream so the emitter stays deterministic.
- **Callers ask for node/edge shapes by injecting target JSON Schemas** into both the closed-IE
  extraction prompts and the emitter. This forces the WS2 **zod↔JSON-Schema single-source-of-truth
  decision** (ADR-200 mandates JSON Schema in-repo; the pipeline is zod-at-boundary) — pin the bridge
  with a conformance test.
- **Planning-corpus extraction is two-mode [V].** Documents are typed with owner-locked frontmatter
  (the `plan-node-schema.v0.md` exists [V]); a large fraction of the intent graph is
  **deterministically parseable** (frontmatter fields, typed edges, links, todo ids) — parse it in
  *code*, never ask the LLM for what the document states machine-readably (invariant-1 spirit applied
  to input). The LLM does only *prose* extraction, schema-guided closed-IE against the WS2 idea-node
  structure, with open-vocabulary capture feeding the V1/V2 vocabulary reassessment.
- **WS2 and WS4 must NOT wait for this [V].** WS2 (idea-node schema + id-minting) is an *input* to
  the extraction, authored now as pure schema work; WS4's thin slice is hand-harvested by design.
  The generalised pipeline earns its place at the broad-shallow vocabulary-discovery pass and the
  WS6 deep harvest (~573 docs), with WS4's hand-harvested ideas doubling as invariant-6 canaries.
- **The strategy thread already directed the transfer [V]:** parameterise the partition axis
  (subgraph/neighbourhood weighted by leverage, not recency) and the negative-space source
  (relational absence — orphan plans, unserved goals); "the method becomes a renderer over the
  idea-graph and its highest-value lens (absence detection)" once the graph exists. **The tooling
  and the graph are convergent in both directions:** pipeline output feeds the graph now; the graph
  later becomes the pipeline's partition source and makes absence detection cheap and exact.

## Alternatives and identity (the reframe hunt)

Seven-plus competing identities were steelmanned; the verdict on which compose vs conflict:

- **Compiler frame (COMPOSES — adopt as structural identity):** parse → typed IR → passes →
  multiple deterministic backends. The codebase already is this (stage discriminants, mirrored
  schemas, deterministic aggregation) and the IR already contains graph edges
  (`supportingLeafIds`/`supportingWindows` [V]). Graph is one backend; backends never feed back into
  passes.
- **Measurement-instrument frame (COMPOSES — the primary identity):** the recall machinery already
  diffs findings against a baseline, with query-shaped function names anticipating a future
  memory-event-graph swap. The instrument measures what conservation missed; the knowledge base is
  the reference standard it diffs against, owned downstream.
- **ETL/event-log fold (COMPOSES):** treat the corpus as an append-only log; incremental map over
  new windows; checkpoints/materialised views keyed by `(corpus range, judgment regime)` so re-runs
  are folds not replays — the regime key makes invariant-6's recalibration boundary mechanical and
  prevents cache reuse across a regime change. PDR-014's marker ledger is the existing precedent
  [V: PDR-014:136-139].
- **KB/ontology population (COMPOSES as a stage):** the classic gap is *extraction without linking* —
  candidates are canonicalised against each other but not against the knowledge base they feed.
  Promote candidate→existing-Practice-doc linking (`equal`/`refines`/`subsumes`/`novel`) into the
  main pipeline; it converts downstream consolidation from re-discovery into review.
- **Embedding/RAG index WITHOUT a graph (COMPOSES as the cheap default):** benchmarks show dense RAG
  matches GraphRAG on single-hop lookup and graph wins only on multi-hop. The dedup/"have we seen
  this" queries the instrument implies are single-hop → **index-first is the cost-correct default;
  gate any graph backend on a demonstrated multi-hop consumer-query inventory.**
- **GraphRAG / LLM-KG construction (CONFLICTS as identity, composes as a backend topology):** its
  community summaries are LLM aggregates over many items — the exact invariant-1 defect — and it has
  no calibration or conserve/kill discipline. Composes only if each community summary decomposes
  into per-item judgments + deterministic grouping.
- **KG-builder identity (RULED OUT):** PDR-122 forbids per-feeder graduation; LazyGraphRAG shows
  upfront graph build is the expensive wrong default; derived-not-authored puts the graph downstream.
  All three agree.

## Practice integration — the feeder seat, the funnel, the three-way diff

- **The feeder half is already ratified doctrine [V].** PDR-122:121-127 — the pipeline is "a
  discovery FEEDER, not a conservation engine"; findings flow into PDR-014
  `capture→distil→graduate→enforce`; a bespoke per-feeder graduation step is forbidden. The precise
  seat is the **mechanisation of PDR-014 §Archive-scale historical synthesis** operating at the
  capture+distil edges (bounded corpus, synthesis report before doctrine mutation, marker ledger for
  incremental since-last-marker runs) [V].
- **The rescue funnel is the graduate-edge work-list generator, already canonicalised [V]:**
  `consolidate-docs` §Discovery-Run Rescue Sets — immutable report + machine-readable tier table +
  plan-carried drain state, explicitly bypassing the buffer that "cannot hold a corpus-scale set."
  Its teachings as a general intake pattern: order intake by **evidence provenance, not pipeline
  verdict** (rescued kills outrank keeps); conservation-check the partition to residual zero; per-tier
  disposition protocols differ.
- **The corroboration/novelty inversion is a THREE-way diff [V].** Corroboration against on-disk
  homes yields: *novel discovery* (no home), *re-find* (recall validation), and — the third —
  **recurrence-despite-home** (the PDR-098 fires-despite-home signal). Per-home recurrence rates from
  corpus runs ARE the data feed for PDR-098's explicitly-unbuilt semantic-pathogen inventory. The
  instrument becomes the Practice's **consolidation-time doctrine-traction telemetry** — with a hard
  boundary: it is *detection at consolidation cadence*, never the *action-time mechanism* PDR-098
  deliberately leaves open. **Design gap found:** "recurrence by construction" needs a *temporal*
  qualifier — an instance is fires-despite-home evidence only if it post-dates the home's landing;
  otherwise it is the pre-history that *motivated* the home. Reconcile the `consolidate-docs` wording
  when this lands.
- **Scaling risk the corpus itself surfaced [V]:** tier-A candidate C185 — "the *enforce* edge is
  the open loop; graduated lessons land as passive prose." Scaling the feeder without enforce-edge
  throughput amplifies the known bottleneck. `knowledge-flow-pipeline-mechanisms.plan.md` owns the
  "consumer-rate falls behind producer-rate" back-pressure frame this touches. Name the touch;
  verify graduate-edge drain capacity before scaling; coordinate with that plan rather than silently
  re-deciding its frame.

## Stratum and packaging verdict

- **Move nothing to `packages/` *now* — but the destination is now owner-clarified.** The corpus
  tree has **zero consumers outside `agent-tools/src/corpus-analysis/`** [V]; the second-consumer
  rule has not fired yet; workspace topology is owner-gated (decided 2026-05-09; resumes after the
  graph MVP tranche); and the destination question is already a named deliverable of the
  `agent-tools-architecture-standard.plan.md` WS0/WS1 fork. Physical `packages/*` extraction is
  triple-gated: the second consumer arriving (comms) **and** the topology gate lifting **and** the
  WS0 execution-model fork.
- **Do the generalisation as intra-workspace layering now** (no gate blocks it): split
  `corpus-analysis/` into a pipeline-general layer and a napkin-instance layer, along the boundaries
  §General-vs-specific already draws. `agent-tools/src/core/` is the established precedent stratum for
  the smallest shared pieces (`parseWithSchema` already has 5 consumers [V] and is a clean `core`
  candidate).
- **Owner conviction [O] sharpens the destination.** "What started as agent tooling has become a
  knowledge curation and expression layer, and likely belongs in the main `packages/` collection,
  broken down along various appropriate seams, with the agent-tools piece reduced to a thin CLI."
  **Stress-test (applied with the same rigour as to the lenses):** sound, with one nuance — *not
  all* of agent-tools is the knowledge layer. `pr-watch`, `hook-policy`, `commit-queue`,
  `collaboration-state`, `validators` are genuinely agent-operational tooling. So the move is "the
  knowledge-curation *subset* → `packages/` along seams; the operational tooling stays behind a thin
  CLI" — which is exactly the owner's "broken down along various appropriate seams." The conviction
  sets the *destination*; it does not override the *sequencing gates*. It should reshape the framing
  of the `agent-tools-architecture-standard` WS0 fork (the packaging question that plan already owns)
  from "extract a pure kernel" to "recognise and re-home a mislabelled product layer."
- **When the gate lifts, argue the split by the documented core-decomposition principle [L]:**
  schemas + pure deterministic math (judgment schemas, aggregation, cost model, salvage
  stratification) are `core`-shaped; the runtime pipeline (esbuild emission build, fs checkpoint IO,
  drivers) is `libs`-shaped. Do not presume `packages/libs` is the band for agent-tooling-general
  packages — the topology ADR's generality×stage matrix decides. Practice-core portability (PDR-035)
  is the one pressure that could justify a standalone package earlier; that intent belongs in the WS0
  pass.
- **Keep permanently in agent-tools regardless:** prompts, run seeds, the napkin lens/category
  vocabulary, recall baselines, salvage strata/tier definitions, drivers — these are Oak-repo
  *policy* and run-instance forensics (the "consumer" side of the framework/consumer split).
  Extracting them would be the cowpath anti-pattern (generalising the instance, not the substrate).

## Open questions (the design-session agenda)

1. Does "the frozen adjudication math" freeze the three-lens *set* for the kernel, or only for the
   napkin family? (PDR-122 non-goals say lenses/quorum size are per-pipeline config → kernel takes
   them as parameters; napkin family pins today's three.) Interacts with the **quorum-diversity
   correctness finding** — the answer may be "make the lens set a parameter AND make it
   model-heterogeneous."
2. Where does the regime table live — per-run seeded data, or a corpus-family default with per-run
   override — and does stamping a regime discriminant into every envelope suffice to machine-enforce
   invariant 6 (e.g. refuse to merge checkpoints across regime hashes)?
3. Extraction sequencing: is comms the second consumer that triggers kernel extraction *now*, or must
   the ws2-ratified topology redesign (D1–D6) land first so the kit is not extracted mid-reshape?
   (`consolidate-at-second-consumer` vs `no-moving-targets` — the resolution recorded in the plan is
   *land the kernel WITH the redesign*, then comms is the second consumer, then consider `packages/`.)
4. Do the five signal categories and eight pattern kinds generalise to comms/planning, or are they
   napkin-method choices? They gate the leaf/candidate schemas → decides kernel vs family.
5. Can the harness accept a programmatic tool allow-list and turn cap per dispatch, so a regime is
   one declared object instead of a hand-authored template file (× four platform adapters) per
   variant?
6. Which stratum for the extracted kernel — agent-tools-internal, `packages/libs`, or
   `packages/core` — given the owner's knowledge-layer conviction, practice-core portability, and the
   WS0 fork?
7. The zod↔JSON-Schema single-source-of-truth for idea-node shapes (WS2's call; both extraction and
   emission block on it).
8. Where does the construction/linking layer live — agent-tools (where the harvest runs) or the new
   idea-graph domain SDK (where ADR-200 §8 reconciliation needs it product-side)?
9. Does the broad-shallow vocabulary-discovery pass need full validate-quorum rigour, or a lighter
   judge (vocabulary grounding is reversible, so risk-tiering may licence cheaper)?
10. Is a graph-delta proposal a new checkpoint *kind* in the stage grammar, or strictly a post-run
    artefact outside it — where exactly does the pipeline end and the construction layer begin?
11. *(restored by the review, R3)* Does the calibration stamp cover the **prompt version**?
    Invariant 6's own 47%-vs-10.6% measurement held "candidates, prompts, and quorum math"
    constant — so a prompt edit can shift the judgment regime exactly as a model edit can, yet the
    proposed `RegimeBinding` tuple omits it. Decide whether prompt-builder versions are stamped
    members.
12. *(restored, R3)* **Novelty-direction calibration**: "no corroborating home" is evidence of
    novelty only if the home-naming stage has measured recall over the doctrine estate — seed
    known-homed canaries through the corroboration stage, or "genuinely novel" claims carry
    unmeasured false-novelty risk.
13. *(restored, R3)* Is **`aggregation-recall` kernel or family**? Recall calibration may be
    inherently corpus-specific (baselines are napkin memory docs); the five-layer table places the
    recall *engine* in the kernel — Phase 0 should ratify the engine-kernel / baselines-family
    split explicitly, since the leaf/candidate schemas hang off the same boundary.

## Further research (2026-07-03, post-review pass)

The model switch interrupted the research *programme* (no workflow died mid-run — the two named
runs completed; five other same-session workflows were reviewer panels for other lanes [V]).
Five gap lenses ran in a second fan-out (Hazel rides Orchard; read-only agents; ~420k tokens).
The load-bearing repo claims below were spot-checked first-hand; external claims carry URLs and
are [L]. The measured quorum figures feeding this pass are in §Sharpest correctness finding and
banked at `data/lens-correlation-measurement-2026-07-03.json`.

### Regime registry — the stamp resolves to two co-stamped hashes plus measured figures

- **Prompt version IS stamped — the open question 11 resolves decisively [L+V].** Internal:
  invariant 6's own 47%-vs-10.6% measurement held prompts constant, so a prompt edit is a regime
  change by the same evidence that motivates stamping the model. External: 2025–26 LLMOps practice
  co-versions prompt-hash + model + eval run as one lineage node (MLflow 3.0, Braintrust). Clean
  shape given the five-layer table (prompts are *family*, model/effort are *regime*): **one stamp
  binding two hashes** — `regimeHash{model, effort, agentType, maxTurns, toolSurface}` +
  `promptHash{family prompt builders}` — with the quality figures valid only for the
  (regimeHash × promptHash × corpusFamily) triple; a change to either invalidates.
- **`resolvedModelId` is the digest-pin and cannot live in the build hash [L+V].** Snakemake/
  Nextflow pin executors by resolved digest because a symbolic tag silently re-resolves — exactly
  the harness's `'sonnet'` symbol. Only knowable post-run from transcripts → recorded field,
  checked at runtime by the invariant-6 canaries, not hashed at build.
- **The stamp gains the measured quorum figures**: `measuredEffectiveVotes` / `measuredInterLensPhi`
  join `measuredTokensPerAgent` and `measuredQualityFigure` — the effective-vote count is the
  quantity that licenses (or refuses) a majority vote, and stamping it makes the diversity gap
  machine-visible. Whether a minimum effective-vote count *gates* a regime from owning terminal
  discards is a P0 decision (question 14).
- **Enforcement is three-tier, each with a live precedent [V]:** (1) build-time stamp-freshness
  refusal at artefact emit — the `--ceiling` "no default, ever" refusal shape
  (`build-run-artefact.ts:146-147` [V]); (2) test-time mirror-conformance asserting the four TS
  dispatch literals + template frontmatter + platform adapters equal the registry — this catches
  the live TOML drift, and the drift's true nature is now confirmed: **pipeline dispatch is
  Claude-harness-only; the `corpus-*.toml` Codex adapters are unwired parity artefacts** (zero
  Codex references in the corpus-analysis TS [V]), so conform-or-regenerate the adapters from the
  registry; (3) runtime canary drift detection for `resolvedModelId`. Cross-field anchors [L]:
  DVC `dvc.lock` (params are hashed first-class dependencies; any change re-invalidates the
  stage), Great Expectations as the *cautionary* precedent (validation without owned invalidation
  — the stamp must be a lineage lock, not a checkpoint operators remember to re-run), and
  MLflow/SageMaker/W&B eval-gated promotion: the quality figure is a **comparative promotion gate
  against the incumbent stamp on the shared canary set**, not a passive record.

### Construction/linking layer — a solved external shape that maps 1:1 onto ratified grammar

- **Fellegi–Sunter is the blueprint [L]:** deterministic blocking (candidate generation) →
  deterministic scoring → a **three-band decision** (auto-link / clerical-review / non-match).
  The three bands are conserve-by-default expressed as arithmetic: auto-merge only above the high
  threshold AND quorum-confirmed; the middle band held for review; below = keep-distinct/mint-
  novel. Measured LLM entity-linking precision is materially below auto-merge-safe on its own [L]
  (EntGPT ~+2.1% avg over supervised baselines; 54.1-vs-86.5 F1 method spread) — quantitative
  backing for putting the merge, not the keep, behind the quorum (ADR-200's own "a wrong merge
  silently loses a distinct idea").
- **The OpenRefine / W3C reconciliation API is the propose-confirm wire protocol [L]:**
  query → scored candidates `{id, name, type, score, match}` → confirm. Shape the shared layer's
  public surface as a reconciliation-style service so the harvest, ADR-200 §8 prose
  reconciliation, and the corpus pipeline call **one interface**.
- **Id-minting and entity resolution are one mechanism viewed twice [V-doctrine].** ADR-200
  requires minting idempotent-across-re-harvest AND a de-dup mechanism as two §Open items — they
  are the same layer: resolve every (re-)harvested candidate against the existing-node index
  first; a matched candidate reuses the existing id; **minting a fresh id is the terminal "novel"
  branch**. This closes both §Open items at once and means linking runs at harvest time. Wikidata's
  QID model (opaque, never reassigned, label separate and mutable, alias set accumulating
  superseded labels) directly validates ADR-200's lens-resolved id direction [L]; content hashing
  stays OUT of identity but IN blocking as a cheap fingerprint predicate.
- **The merge decision cannot rest on a same-model prompt-lens majority.** The measured phi
  applies to merge/novel calls exactly as to keep/kill (both are regime-governed semantic
  dispositions); ≈1.4 effective votes is too weak for the irreversible merge. Per §Quorum
  heterogeneity, the cure is dependence-aware aggregation + a corrected boundary + cross-tier
  concurrence as the bias gate — not simply adding another model family.
- **The repo embryo is verified [V]:** `post-run/claimed-home-existence.ts` (LLM names candidate
  homes atomically; code verifies each against a repo-anchored index; misses reported, never
  crash) — the layer is a generalisation of a tested pattern, not greenfield. The audit trail must
  checkpoint: the blocking candidate set + admitting predicate, each atomic per-pair judgment
  (never the merge decision), the deterministic band + thresholds, and per merge the quorum votes
  + reference-rewrite manifest + retained superseded node — all under a stamped regime with
  same-idea/known-distinct canary pairs (blocking-recall misses are silent false-novels).

### Standing calibration and incremental operation

- **Elusion audit over the kill pile [L]:** sample the kills, re-judge with a quorum, report the
  Clopper–Pearson one-sided upper bound on the false-kill rate (never normal-approximation point
  estimates — poor coverage, Webber 2013), and translate it into a **recall lower bound**
  (elusion is not recall — the low-prevalence trap). Sample-size formulas for the design session:
  zero-defect n = ln(1−C)/ln(1−p0) (95%/5% → 59; 95%/1% → 299); estimation regime n≈100 → ±10%,
  n≈385 → ±5% at p=0.5. Given ~870 events/day, accumulate kills into a **rolling regime-keyed
  pool** so the per-cadence sample reaches adequacy. **The audit quorum must be cross-regime** —
  an audit drawn from the production regime shares the correlation and one-directional bias it is
  meant to detect (direct consequence of the 59.6% / 18-of-19 measurement).
- **The IRR calibration figure is a PAIR [L+V]:** Krippendorff's alpha (the only standard
  statistic tolerating our >2-rater, missing-vote shape — Cohen is two-rater, Fleiss needs fixed
  counts) for agreement, AND n_eff = n/(1+(n−1)·phi) for independence. High alpha with high phi
  means the quorum agrees because it is *redundant*, not corroborating — reporting agreement alone
  would ratify a correlated echo.
- **PRISMA-2020 flow render is a pure formatter [V]:** `disposition-partition.ts` already carries
  keeps/kills/residual with typed reason states; add elusion-audit and canary-recovery boxes.
- **Incremental substrate = a tracked watermark manifest** keyed by (git commit SHA, processed
  event-UUID set, corpus-family, **regime hash**), generalising PDR-014's marker ledger [V], with
  a declared lookback window for late arrivals (comms threads are *derived* — only 4/2,213 events
  carry `in_reply_to`, so a late event silently changes an already-processed window's context) and
  MERGE-upsert idempotent re-judgment. The regime hash in the key makes invariant-6 recalibration
  mechanical (a regime change invalidates the fold), and **the tracked manifest is the R1 cure**:
  silent bulk removal of the untracked tier trips a validator instead of a forensic accident.

### The markdown→graph inversion, estate-wide (owner observation 6)

- **The inversion is already instantiated twice, in two different round-trip shapes [V]:** ADR-200
  (plan corpus: graph authoritative, prose co-equal, §8 semantic reconciler) and PDR-119 (memory
  as an immutable event graph with deterministic renderers and **no reconciler at all** — status
  Proposed, direction owner-ratified 2026-06-27). The estate-wide inversion is genuinely NOT
  ratified — ADR-200 scopes itself to the plan corpus and forbids the family expanding it — so the
  estate move needs its **own proposed ADR** that generalises ADR-200 + PDR-119: a surface-class
  taxonomy, per-surface round-trip assignment, PDR-122 binding, and cross-graph identity.
- **The round-trip verdict from precedents is unambiguous [L]:** deterministic bidirectional sync
  works only for the structured projection (bidirectional lenses/Boomerang; JetBrains MPS
  projectional editing; DITA / headless-CMS author-in-structure). Free prose has no deterministic
  put-back; CRDTs (Automerge/Peritext) converge concurrent edits but cannot decide whether an
  edited sentence still means what the node asserts. Three round-trip classes follow: (a)
  append-only → events + renderers, no reconciler (PDR-119); (b) free prose → the §8 semantic
  reconciler; (c) **new content → author-graph-first (the default going forward)**. The estate
  occupies a graph-shapedness gradient [V]: comms events are already pure graph; memory patterns
  the most graph-shaped markdown (typed frontmatter); PDRs/rules are edge-rich but their edges
  live in prose links; **reports are prose-first and should NOT invert** — the feeder machinery
  graduates their claims instead.
- **The sharpest new finding: ADR-200 §8's reconciler and dedup matcher predate PDR-122.** A
  supersede/merge is an irreversible discard-equivalent (ADR-200's own no-loss-breach wording), so
  it falls under invariant 2's quorum — and the measured phi means that quorum must be
  **model-regime-diverse**, a constraint neither ratified record carries. The estate ADR must bind
  the reconciler to PDR-122 (atomic proposal → deterministic evolution op → recomputing validator,
  merge behind a regime-diverse stamped quorum).
- **The silent-projection failure mode has a named precedent [L]:** the Wikidata↔Wikipedia infobox
  governance revolt — auto-projecting graph values into human documents without editor review.
  ADR-200's co-equal + active-gate stance is the proven counter; the estate ADR must forbid silent
  auto-projection.
- **Cheap first increments:** lift PDR `Related` sections and rule `Operationalises` pointers into
  typed frontmatter edges (the governance graph is *entailed* by ADR-200's realisation edges —
  every PDR/ADR must be a resolvable node); render `practice-index.md` (49.6k hand-authored
  consolidated store [V] — exactly the merge-conflict magnet ADR-200's L1 lens rejected) as a
  projection over the doctrine graph. Reconciliation *frequency* is the estate cost driver (~98
  rules, 123 PDRs [V]) → a per-surface rigour policy, risk-tiered by reversibility (ties to
  question 9).

### Quorum heterogeneity — independence is engineered at the aggregator, not bought by families

The repo half first [V]: pipeline dispatch is Claude-harness-only (models
`'sonnet' | 'opus' | 'haiku' | 'fable'` at the dispatch seam; the Codex TOMLs are unwired parity
adapters), so live cross-*provider* voting requires a new dispatch seam. The external half
delivered the pass's second direction-bending result — **the two keystone sources were verified
first-hand this session** (titles and every quoted number reproduced by direct fetch):

- **Cross-family diversity does NOT manufacture independence, and can be anti-correlated with it
  [L, source verified].** "Nine Judges, Two Effective Votes" (arXiv 2605.29800): a 9-judge panel
  across 7 model families carried n_eff = 2.18 (mean pairwise phi 0.391); the *highest* error
  correlations were cross-family (Claude×Gemini 0.603, GPT-4o×Claude 0.588) vs same-family
  OpenAI×OpenAI 0.437; restricting to one judge per family *lowered* n_eff to 1.93; human
  annotators reached n_eff 4.0–5.8. Correlation is driven by shared pretraining data and shared
  item difficulty, not vendor. Our measured 1.43 at phi≈0.548 is near the structural ceiling for
  same-model lenses, and swapping in another family is a weak lever.
- **Accuracy-weighting provably cannot fix correlation [L, source verified].** The Ising
  label-model paper (arXiv 2601.22336): a conditional-independence aggregator fed *correct*
  per-voter marginals can assign ~96.8% to the wrong label where the true posterior is ~3.8%, and
  Theorem 1 shows the risk gap does not vanish as judges → ∞. Dependence-aware (class-dependent
  Ising) aggregation gains +7–8pp over weighted majority vote. Snorkel/Dawid–Skene weighting on
  top of our correlated lenses would over-count agreement — the banked pairwise phi is exactly the
  second-order statistic a dependence-aware aggregator consumes.
- **A k-of-n quorum over correlated votes overstates confidence [L]:** SPRT-style validity assumes
  independent evidence; the mature corrections are group-sequential/alpha-spending boundaries or
  anytime-valid e-processes (valid under arbitrary dependence and optional stopping).

**The reconciled remedy ladder for Phase 0** (refining this report's earlier "seek cross-family
heterogeneity" phrasing — heterogeneity's real value is *bias-asymmetry detection and
self-preference washing*, not independence): (A) **dependence-aware deterministic aggregation**
over the existing lenses, consuming the banked phi — no new voters, PDR-122-native, the measured
+7–8pp class of gain; (B) **correlation-deflated or e-process quorum boundaries** so the discard
threshold reflects ≈1.4 effective votes rather than a nominal 3; (C) **cross-tier concurrence as
the irreversible-discard safety gate** — the measured 18-of-19 one-directional Sonnet-kill/
Opus-keep asymmetry is exactly what a require-the-conservative-regime-to-concur gate catches
(this is the refined form of "the merge/audit quorum is cross-regime": a bias probe, not an
independence source); (D) cross-provider judges only for self-preference decorrelation, costed
against the new dispatch seam; (E) **input/evidence diversity across lenses** (different evidence
views, not different prompts on the same context) — the only lever the literature shows
materially lowers phi; (F) a small **human quorum reserved for the irreversible-discard tail**
(the only voters measured at n_eff 4–6). Recommended sequence: A+B first, C as the discard gate,
D/E/F as scoped experiments.

### New Phase 0 questions from this pass (extending §Open questions)

14. Stamp membership details to ratify: promptHash co-stamping (research direction: **yes**);
    lens/quorum-set identity in the stamp; `resolvedModelId` recorded-not-hashed; and does a
    minimum `measuredEffectiveVotes` gate a regime from owning terminal discards?
15. Linking-layer specifics: are the two three-band thresholds per-corpus-family calibrated
    artefacts; is blocking deterministic-only or embedding-based (an embedding model is itself a
    stamped regime member); constrained multiple-choice vs per-pair relation judgments; and what
    recovers a blocking miss on re-harvest (a periodic re-blocking sweep as the elusion-audit
    analogue)?
16. Standing-audit specifics: cadence and rolling-pool boundary (reset on regime-hash change?);
    the recall-floor gate threshold and its home (stamp vs run manifest); alpha over binary
    keep/kill vs the three-category nominal.
17. Estate-inversion specifics (feeds the proposed estate ADR, not this plan): which round-trip
    class do PDRs/rules take; one estate graph vs N graphs with cross-graph id-namespacing and a
    cross-graph referential validator; the earn-its-graph trigger per surface; whether
    `practice-index.md` renders now as the cheap proof.

## What must NOT be built / must NOT wait

- **Must not build:** any bespoke per-feeder graduation step (PDR-122 forbids); graph emission as an
  in-pipeline stage (it is a downstream renderer); the construction layer inside the pipeline
  (shared, downstream, once); a KG-builder identity; anything in `packages/*` before the triple gate.
- **Must not wait on this research:** ADR-200 WS2 (idea-node schema — an *input*) and WS4 (hand-
  harvested thin slice); the salvage plan's `ws1b` rescued-knowledge disposition pass (independent,
  needs no build); the owner's tier-E manual round.
