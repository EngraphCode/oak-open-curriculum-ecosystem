---
name: "Corpus-Analysis Generalisation and the Knowledge-Curation Layer"
plan_id: corpus-analysis-generalisation-and-knowledge-layer
collection: agentic-engineering-enhancements
lane: future
status: "STRATEGIC BRIEF — Phase 0 design session EXECUTED to a STABLE POINT 2026-07-05/06
  (Hedgehog stirs Rime; owner-directed pause-then-stabilise). The design record
  reports/agentic-engineering/large-corpus-analysis-tooling/corpus-generalisation-phase0-design-record-2026-07-05.md
  carries drafted verdicts on the full p0 agenda ((a)-(e), D1-D9, seventeen questions) plus BOTH
  review verdicts conserved in its Review section (assumptions ratify-with-revisions 13 items;
  architecture sound-with-revisions 18 findings) and restart notes. NOT yet decision-complete:
  the revision queues are unapplied and the landing set (PDR-122 amendment + companion rule +
  code-site derivation text + promotion of THIS plan to current/ absorbing salvage ws3-ws5) is
  unlanded. The restart runs on a NEW BRANCH after the feat/corpus_research_enhancements PR
  merges (owner-directed 2026-07-06). Self-contained restart brief: the AEE thread record
  §PHASE 0. Evidence base unchanged: corpus-generalisation-research-2026-07-03.md (reviewed,
  corrections applied) + corpus-generalisation-review-2026-07-03.md + burn-analysis-2026-07-02.md."
created: 2026-07-03
owner_thread: agentic-engineering-enhancements
lineage:
  serves_thread: agentic-engineering-enhancements
  serves_stream: "the agentic framework value stream (Practice tooling as a value stream)"
  strategic_choice: "generalise the calibrated corpus instrument as shared knowledge-curation
    infrastructure, rather than maintain per-corpus forks"
  derives_from:
    - .agent/plans/agentic-engineering-enhancements/current/corpus-analysis-salvage-and-topology-redesign.plan.md
    - .agent/reports/agentic-engineering/large-corpus-analysis-tooling/corpus-generalisation-research-2026-07-03.md
    - .agent/reports/agentic-engineering/large-corpus-analysis-tooling/corpus-generalisation-review-2026-07-03.md
    - docs/architecture/architectural-decisions/200-intent-as-a-living-idea-graph.md
    - .agent/practice-core/decision-records/PDR-122-agentic-judgment-pipelines.md
overview: >-
  Generalise the napkin corpus-analysis pipeline into a reusable, calibrated knowledge instrument
  that ingests any document corpus and feeds validated findings into the shared conservation
  machinery (and, optionally, into the intent knowledge graph). The generalisation contains the
  salvage plan's topology redesign (the D1-D6 protocol changes ARE the shape of the general
  kernel), is driven by the comms-event corpus as the forcing second consumer, and extends to the
  planning corpus to feed ADR-200's idea-graph. Cross-cutting: the owner's conviction (2026-07-03)
  that this has become a knowledge curation and expression layer belonging in packages/ along
  seams, with agent-tools reduced to a thin CLI — captured here as the destination, gated on the
  standing sequencing constraints.
todos:
  - id: p0-design-ratify
    content: "PHASE 0 (design ratification; fresh-seat, owner-scheduled; ABSORBS salvage ws2).
      Ratify: (a) the instrument identity (calibrated measurement instrument / compiler with
      optional graph backend — report §Alternatives); (b) the five-layer decomposition and the
      general/family/regime/run boundaries (report §General-vs-specific); (c) the D1-D6 topology
      redesign from the salvage plan (canary-first calibration, cellular extraction, progressive
      power, pilot-first sizing, pre-run declaration, batch-sequential validate) as KERNEL
      features; (d) the regime-registry design and the calibration-stamp mechanism (report
      §Regime registry); (e) the quorum-diversity correctness finding and whether it forces a
      PDR-122 invariant-2 amendment (report §Sharpest correctness finding). Dispatch
      assumptions-expert + an architecture expert; the burn-analysis + this research report are
      the evidence base. Output: a ratified design decision record and a promoted current/ plan."
    status: pending
  - id: p1-comms-instance
    content: "PHASE 1 (comms-event corpus — the forcing second consumer, the extraction trigger).
      Generalise by authoring the comms corpus-family module as a COMPOSITION of existing strata
      (corpus-analysis kernel + collaboration-state/archive stage-0 partitioner + the
      comms-provenance-check grounding validator), NOT a rebuild. The intra-workspace kernel
      extraction happens here, driven by this second consumer (consolidate-at-second-consumer),
      landing WITH the D1-D6 redesign. Corpus substrate = the git tree at 255117a43^
      (re-materialised; the live-disk residual is gone — report §Comms forensic finding).
      Deterministic grounding, PDR-094 disposition enum behind the quorum, mandatory PII screen,
      calibration on graduated-doctrine canaries + ~1/10 pilot before the full run. Feeds the
      rescue funnel → conservation. depends_on: p0."
    status: pending
    depends_on: [p0-design-ratify]
  - id: p2-planning-corpus-and-graph
    content: "PHASE 2 (planning corpus → intent graph). Author the planning corpus-family module
      (typed frontmatter parsed in CODE, prose extracted via schema-guided closed-IE against the
      WS2 idea-node schema). Build the CONSTRUCTION/LINKING layer ONCE, shared between this harvest
      and ADR-200 §8 reconciliation, downstream of the pipeline (never inside it). Add the
      optional graph-delta renderer (checkpoints + target JSON Schemas + node index → proposed
      deltas via the evolution ops). depends_on: p0; also depends on ADR-200 WS2 (idea-node
      schema) landing and WS4 (thin-slice) proving the graph end-to-end — but WS2/WS4 do NOT
      depend on this plan."
    status: pending
    depends_on: [p0-design-ratify]
  - id: xc-knowledge-layer-reframe
    content: "CROSS-CUTTING (owner conviction 2026-07-03, destination not path). Feed the
      'agent-tools has become a knowledge-curation-and-expression layer → packages/ along seams,
      agent-tools reduced to a thin CLI' reframe into the agent-tools-architecture-standard WS0
      fork, reframing its packaging question from 'extract a pure kernel' to 'recognise and
      re-home a mislabelled product layer'. Physical packages/* moves stay triple-gated (second
      consumer + topology gate lifting after graph MVP + WS0 fork); intra-workspace layering
      proceeds in P1 without any gate."
    status: pending
isProject: false
---

# Corpus-Analysis Generalisation and the Knowledge-Curation Layer

/ Facts and evidence are authoritative in the research report; this plan states intent,
sequencing, and gates, and references the report rather than restating it (ADR-117). /

## Problem and intent

**Gap.** The napkin corpus-analysis pipeline is a calibrated judgment instrument whose deterministic
kernel is already corpus-agnostic, but its generality collapses at three surfaces: composition
roots hardcode run/family config, the boundary vocabulary is napkin-branded at named points, and
the judgment **regime (model, effort, tool surface, turn budget) has no first-class
representation** — it is smeared across TS literals, subagent-template frontmatter, and prompt
text, with live drift already present (report §General-vs-specific, §Regime registry). Two more
corpora are waiting to be analysed (comms events, then the planning estate for the intent graph),
and re-instantiating by forking would fragment the exact conservation and calibration machinery
PDR-122 declares shared.

**Who it harms / mechanism.** Without generalisation: every new corpus re-implements the pipeline
(fragmentation); the un-reified regime lets the 2026-07-02 judgment-regime failure recur as a
config edit (the 47% vs 10.6% keep-rate divergence); and the knowledge layer stays mislabelled as
agent tooling, buried where its architecture cannot be reasoned about as a product.

**Intent.** Generalise the instrument into shared, calibrated knowledge-curation infrastructure —
one kernel, per-corpus family modules, a calibration-stamped regime registry, feeding the shared
conservation machinery and (optionally) the intent graph — and recognise it as the
knowledge-curation-and-expression layer it has become.

**Success looks like.** A new corpus is analysed by authoring a family module + a calibrated regime
stamp (a data addition, not a code fork); a regime change cannot ship without recalibration
(machine-enforced); the comms and planning corpora are analysed and their findings homed via the
existing rescue funnel; and the packaging destination is decided in the architecture-standard fork
with the knowledge-layer framing.

## End goal, mechanism, means

- **End goal (user-impact).** The Practice can turn any document corpus into calibrated, conserved
  knowledge — and, where wanted, into intent-graph deltas — with governed cost and no silent loss.
- **Mechanism.** (i) Reify the three collapse surfaces as injected config (family descriptor,
  regime registry with calibration stamps, run manifest) — report §General-vs-specific, §Regime
  registry. (ii) Land the D1-D6 topology redesign as kernel features so the extracted kernel embodies
  the corrected topology, not the failed all-then-calibrate shape. (iii) Drive kernel extraction by
  the comms second consumer (consolidate-at-second-consumer). (iv) Keep graph emission a downstream
  optional renderer over typed checkpoints; build the construction/linking layer once, shared,
  downstream. (v) Feed everything into the shared conservation machinery via the canonical
  rescue-set intake — never a per-feeder graduation step.
- **Means.** The three phases + the cross-cutting reframe in the todos above.

## Domain boundaries and non-goals

- **Non-goal: a knowledge-graph builder identity.** The instrument is a calibrated
  measurement/feeder; the durable graph is derived downstream (report §Alternatives, §Practice).
- **Non-goal: graph emission as an in-pipeline stage.** It is a post-run renderer over checkpoints.
- **Non-goal: a bespoke per-feeder graduation step.** Forbidden by PDR-122; conservation is shared.
- **Non-goal: moving anything into `packages/*` before the triple gate** (second consumer +
  topology gate lifting after the graph MVP tranche + the WS0 execution-model fork).
- **Non-goal: extracting the napkin instance's policy** (prompts, vocabularies, recall baselines,
  salvage tier definitions, drivers) — that is the cowpath anti-pattern; it stays in agent-tools.
- **Non-goal: re-running the 2026-07-02 validate under any regime** (owner-directed; pilots are the
  instrument).
- **Non-goal: building the action-time doctrine-traction mechanism** PDR-098 leaves open — this
  instrument is consolidation-time detection telemetry only.

## Dependencies and sequencing (blocking vs beneficial)

- **P0 blocks P1 and P2** (design ratification precedes build).
- **Salvage ws2 folds INTO P0** (blocking merge — the topology review is the same decision).
- **P1 (comms) is the extraction trigger** — beneficial-to-P2 (proves the kernel/family split) but
  not blocking; P1 and P2 are otherwise independent.
- **ADR-200 WS2 (idea-node schema) is BLOCKING for P2's closed-IE extraction and graph renderer**
  (schema-first: the target shape must exist). ADR-200 WS4 (thin slice) is BENEFICIAL for P2
  (supplies calibration canaries; proves the graph end-to-end). **Neither WS2 nor WS4 depends on
  this plan** — they proceed independently.
- **The workspace-topology gate (owner decision 2026-05-09; resumes after the graph MVP tranche)
  and the agent-tools-architecture-standard WS0 fork are BLOCKING for any `packages/*` move**, and
  BENEFICIAL-only for the intra-workspace layering (which proceeds without them).
- **Minimum shippable shape without the beneficial prerequisites:** P1 ships as intra-workspace
  layering feeding the rescue funnel (no `packages/*` move, no graph emission); P2's deterministic
  frontmatter harvest ships without the LLM prose pass or the graph renderer.

## Strategic acceptance criteria and success signals

- P0: a ratified design decision record exists; the D1-D6 topology decision is settled (ratify or
  revise); the quorum-diversity finding has an explicit disposition (amend PDR-122 or record why
  not); a `current/` executable plan is promoted.
- P1: the comms corpus is analysed via a family module that reused the kernel with zero engine
  fork; a calibration pilot passed before the full run; findings entered the rescue funnel; the
  kernel/family boundary proved real (the extraction did not churn the kernel surface).
- P2: planning-corpus concepts extracted with frontmatter parsed deterministically; the shared
  construction/linking layer serves both the harvest and ADR-200 §8; graph deltas (if emitted)
  entered via the evolution ops and validated.
- Cross-cutting: the architecture-standard WS0 fork carries the knowledge-layer framing.

## Risks and unknowns

- **Quorum diversity is unmeasured (highest).** The tier-2 lenses run on one model; prompt-lens
  diversity may be ~1-2 effective votes (report §Sharpest correctness finding). Mitigation: measure
  effective-vote count on canaries in P0; pursue cross-model heterogeneity; candidate PDR-122
  amendment.
- **Enforce-edge back-pressure.** Scaling the feeder without graduate-edge throughput amplifies the
  known open loop (C185). Mitigation: verify drain capacity before scaling; coordinate with
  `knowledge-flow-pipeline-mechanisms.plan.md` rather than re-deciding its frame.
- **Regime drift shipping silently.** Mitigation: the calibration-stamp hash + conformance test
  make a regime change without recalibration a typed failure.
- **Comms residual provenance — and an untracked-tier loss-detection gap.** The archived residual
  is git-history-only, and its removal from live disk is UNEXPLAINED (review R1: the untrack commit
  says "all preserved on disk"; no record accounts for the removal). Mitigation: re-materialise
  from `255117a43^`; the owner receives this as a safety-story gap, not a benign consequence; P0
  weighs a tracked count/watermark manifest for the untracked tier.
- **Leaf-coverage accounting is a P0 pipeline requirement (routed 2026-07-03, ws1e).** The
  2026-07-02 run's deterministic close reported `residual=0`, but that accounting was
  candidate-scoped: it proved every reduce candidate had a disposition and never accounted the
  leaf-to-candidate seam. 83 of 580 map leaves (14%) entered no candidate and were invisible to
  every downstream disposition surface until a manual set-difference recomputed them. The
  generalised pipeline's close must account every extraction-stage output — leaves without a
  candidate are a first-class residual stratum in the close report, not silence.
- **Keep-filter kind-bias is measured, not hypothesised (routed 2026-07-03, ws1f).** The meta
  stage's synthesis notes name the bias (the run under-weights trajectory / protocol-evolution /
  single-window kinds; positive-value reviewer patterns and emergent-coordination baselines fared
  worst), and the deterministic mine of the banked verdict corpora
  (`data/banked-verdict-structural-mine-2026-07-03.json`) quantifies the regime texture: the
  no-tools Sonnet run failed `grounded` on 46.7% of verdicts vs free-tool Opus's 11.9% and
  `baseRateHolds` 59.3% vs 7.9% — **tool access (the voter's ability to verify grounding
  first-hand) is the dominant regime variable**, while `notArtefact` is the discriminating blade
  in every regime (involved in 99% of run kills, the sole failing test 23× vs 2-3× for the
  others). `baseRateHolds` carries the highest low-confidence rate in both main regimes (11.4% /
  9.9%) — voters lack base-rate evidence, so P0 should weigh computing base rates
  deterministically instead of asking voters to intuit them. Cross-regime disagreement is
  one-directional (18 of 20 disagreements are opus-keep/run-kill) and kind-skewed (trajectory
  5/11 vs recurrence 15/43), corroborating the kind-bias with numbers. Caveat: the
  sonnet-freetool bank (31 verdicts, 8 candidates) is a biased re-run sample, not a regime
  baseline.
- **The seventeen open questions (report §Open questions: ten original, three restored by the
  review, four from the further-research pass) are the P0 agenda** — unknowns to resolve, not
  risks to mitigate here. The further-research pass (report §Further research) supplies measured
  quorum-correlation figures, the two-hash stamp design, the linking-layer blueprint, the
  standing-audit statistics, and the estate-inversion ADR direction as P0 inputs.
- **Routed in from the conservation plan's superseded WS-C (owner-ratified 2026-07-04) — the
  repeatable-not-heroic acceptance criterion**: whatever instrument P0 ratifies must ship as a
  driveable, documented capability — a skill or equivalent that runs one analysis end to end
  (cost gate → dispatch → deterministic aggregation → keep-set) and hands kept candidates to
  `consolidate-until-done` — never a hand-assembled run. The tested deterministic modules to
  adopt (not rebuild) are in `agent-tools/src/corpus-analysis/`
  (aggregation-adjudication/recall/verdict, cost-and-coverage; the lane currently fails
  whole-tree knip and lint — bring into conformance at adoption). Run-artefact identity note
  from the drain: candidate IDs are per-run, never stable across corpora — any cross-run
  linking needs run-scoped identity.

## Phase 0 design inputs (owner-directed, 2026-07-05)

Owner-stated core concept for the design session, recorded verbatim in
substance; Phase 0 ratifies these as kernel invariants alongside items
(a)-(e) in the p0 todo:

- **Model-tier economy is a kernel invariant.** Quota limits mean the bulk of
  data mining is done by Sonnet-5-or-equivalent models — and that works only
  when each miner is handed an utterly clear and NARROW brief (the narrower
  the better). Synthesis belongs to powerful models (Fable-tier).
- **Powerful models must have direct raw-material exposure.** Otherwise
  everything is lost by filtering through the mining tier: a Fable-tier agent
  spot-checks some source files AND shallow-scans many files, to understand
  the corpus and to calibrate how the synthesis agents handle the mined data.
- **Mining subagents are context-minimal by construction.** Main-repo rules
  and skills are NOT loaded for miners; no tool access beyond Read; at
  hundreds of agents even the smallest per-agent context optimisation is
  worthwhile.

Session-dialogue sharpenings accepted into the same agenda (Hedgehog stirs
Rime, 2026-07-05): make exposure measurable via paired blind duplication
(Fable re-mines a stratified random sample of Sonnet-mined windows; the diff
is the calibration statistic the stamp records); treat brief-induced
blindness as a first-class risk (briefs derived FROM a Fable profiling pass,
versioned in the regime registry, pilot includes an open-ended Fable pass as
the blindness probe, schemas carry a bounded overflow slot); miners are
recall-heavy with precision downstream (include-when-uncertain, flagged —
the validate quorum supplies precision); every mined claim carries file:line
plus a verbatim quote so synthesis drops to raw source on demand;
output-side context is the fleet-scale bottleneck (hard-bounded structured
output, sharded hierarchical reduce, deterministic stages in workflow code);
per-window completion tracking so dead miners are re-dispatched rather than
becoming silent recall holes; and a token audit of one real miner dispatch
as a Phase 0 deliverable so "minimal context" is a measured budget line, not
an assumption.

## Promotion trigger into `current/`

An owner-scheduled fresh-seat Phase-0 design session, which absorbs the salvage plan's ws2
readiness review. On ratification, author a `current/` executable plan mining P0's decisions into
TDD cycles. Execution decisions finalise only at that promotion (per `/oak-plan` §Strategic Plan
Requirements).

## Relationships

- **Salvage plan** (`corpus-analysis-salvage-and-topology-redesign.plan.md`): its ws2 folds into
  P0; its ws1b (rescued-knowledge disposition) is independent and proceeds regardless.
- **ADR-200** (intent idea-graph): P2 consumes WS2's schema and feeds the graph; the construction
  layer is shared with ADR-200 §8 reconciliation.
- **agent-tools-architecture-standard.plan.md** (WS0 fork): owns the packaging question the
  cross-cutting reframe feeds.
- **PDR-122** (agentic judgment pipelines): the doctrine this generalises; a candidate invariant-2
  amendment is on P0's agenda.

## Plan-body first-principles check

This is a `future/` strategic brief — no plan-prescribed tests, implementation, or
vendor-literal claims execute from it. The `plan-body-first-principles-check` shape/landing-path/
vendor-literal clauses fire at promotion to `current/`, when executable cycles are authored. The
one vendor-shape claim carried as reference (gh/graph tooling) is out of scope here; the load-bearing
vendor facts in the evidence report were verified first-hand this session (report legend).
