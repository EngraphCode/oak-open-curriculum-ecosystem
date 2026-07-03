# Corpus-Analysis Generalisation — Research and Evidence Report

**Date**: 2026-07-03 · **Session**: Rosemary stirs Bracken (`9f59e1`; authored under
claude-fable-5, model switched to claude-opus-4-8 mid-session for this review-and-record pass).
**Status**: Research complete; no reshaping performed. This report is the durable evidence base
for the strategic plan
[`corpus-analysis-generalisation-and-knowledge-layer.plan.md`](../../../plans/agentic-engineering-enhancements/future/corpus-analysis-generalisation-and-knowledge-layer.plan.md).

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

**The three napkin leak points** (enumerable, complete by construction): the `napkinDate` field;
the four prompt builders (hardcoded corpus description; the meta prompt hardcodes the baseline
count "18" twice); and the workflow meta names. Window ids are already opaque strings, so the
**partition axis itself does not leak** — a key enabler for the comms/planning families. [V]

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

## Sharpest correctness finding — the quorum's diversity is unmeasured

**Two independent lenses (cross-field and alternatives) converged on this, and the repo-internal
half is verified [V].** PDR-122 invariant 2 asserts the tier-2 lenses are "distinct so they are
uncorrelated, which is what licenses a simple majority." But **all three tier-2 voters run on the
same model** (`adjudication.ts:78-79`: every voter `model: 'sonnet', effort: 'high'`; lenses differ
only by prompt [V]). Condorcet's jury theorem and ensemble theory license a majority vote *only*
when voter errors are uncorrelated; correlation destroys the guarantee. External 2026 evidence [L]:
nine frontier judges from different families delivered only ~2 effective independent votes;
aggregation closes ≤11% of the gap when judges correlate. The repo's own data points the same way
[V]: the 47% vs 10.6% keep-rate divergence between regimes (PDR-122:106-108) shows **regime
dominates lens** — prompt-lens diversity on one model may be ~1–2 effective votes.

This is a genuine gap in *ratified doctrine*, not just the tooling. **Disposition: recorded as a
candidate PDR-122 amendment; NOT amended this session** (recording, not reshaping). The design
session should: (a) measure inter-lens error correlation / effective-vote count on the canaries
(invariant 6 already mandates canaries); (b) seek diversity across model *regimes/families*, not
prompts alone — the salvage layer already cross-checks against an Opus banked quorum, so the
heterogeneity remedy exists but only post-hoc; (c) consider the weak-supervision label model as a
second-order upgrade (it cannot manufacture independence, so it is downstream of fixing the
diversity axis).

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
  path — **17 live events embed a `/Users/<user>/…` path** [V]. Responsible analysis requires a
  deterministic pre-fan-out PII screen (emails, machine-local paths, human-name patterns) before
  bodies reach voters or any artefact, and published findings should aggregate by role/pattern, not
  build per-agent dossiers without owner sign-off.
- **FORENSIC FINDING — the "~1,707-event residual" work-list is stale as described [V].** The live
  `comms/` directory contains no events older than mid-June (spot: oldest alphabetical file is
  `2026-06-27`); the archive manifest's 3,176 rows are all `routine` heartbeats; the falsifier event
  `3cc1fb93` is **absent from live disk but intact in git at `255117a43^`** (2026-05-21, full body).
  `git ls-tree 255117a43^ -- .agent/state/collaboration/comms/ | wc -l` = **5,202** [V]. The
  residual is fully recoverable and immutable in git (events were tracked until the WS7 untrack at
  `255117a43`). This is the *expected consequence* of the untrack decision (comms events are
  gitignored local state that does not travel across checkouts), so it is most likely benign-by-
  design — but the standing curator obligation and `repo-continuity.md` point agents at a disk state
  that no longer exists. **Surface to owner; correct the stale work-list wording;** the correct
  corpus substrate for the archived residual is the **git tree at `255117a43^`**, which is a better
  substrate anyway (immutable, complete, mechanically groundable, no live-watcher risk).
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

## What must NOT be built / must NOT wait

- **Must not build:** any bespoke per-feeder graduation step (PDR-122 forbids); graph emission as an
  in-pipeline stage (it is a downstream renderer); the construction layer inside the pipeline
  (shared, downstream, once); a KG-builder identity; anything in `packages/*` before the triple gate.
- **Must not wait on this research:** ADR-200 WS2 (idea-node schema — an *input*) and WS4 (hand-
  harvested thin slice); the salvage plan's `ws1b` rescued-knowledge disposition pass (independent,
  needs no build); the owner's tier-E manual round.
