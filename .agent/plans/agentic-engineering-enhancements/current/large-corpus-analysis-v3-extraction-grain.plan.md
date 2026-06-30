---
lineage:
  serves_thread: agentic-engineering-enhancements
  serves_stream: continuity-memory-and-knowledge-flow
  strategic_choice: agent-as-thinker capabilities are Practice substance (PDR-035)
  derives_from: .agent/reports/agentic-engineering/large-corpus-analysis-v2-rerun-result-2026-06-30.md
todos:
  - id: author-grain-preserving-prompts
    content: "Rewrite the MAP and REDUCE stage prompts in the conserved tooling to preserve mechanism specificity. MAP: each leaf statement must name its ACTUATOR (the specific file, command, lifecycle moment, template, or tuple that did it) alongside the theme — not the theme alone. REDUCE: (a) DELETE the hard 'Aim for 15-25 candidates' count cap and replace it with 'emit as many distinct candidates as the leaves support; do NOT merge two signals that name different actuators or lifecycle-moments even when they share a broad theme'; (b) REPLACE 'a single-window signal is usually NOT an emergent candidate' with 'a recurring MECHANISM is a candidate even when it also fits a broader theme — preserve the specific actuator as its own candidate alongside any broad parent'. Keep the negative-space probe unchanged. Edit map-reduce-validate-meta.workflow.mjs only; the deterministic aggregation layer is NOT touched."
    status: pending
  - id: cheap-grain-probe
    content: "Run the CHEAP grain probe: NEW map (windows w08, w10, w11) + NEW reduce ONLY. No validate, no meta adversary. ~1.2M tokens (~9% of a full rerun). PRECONDITION: the baselines cite synthesis docs, NOT the raw napkins — so before launch, derive the baseline-id -> source-napkin -> window provenance trace for each of the 5 failing baselines and CONFIRM each source napkin falls inside the probe windows, RE-CONFIRMED against the freshly re-derived partition (a grown/re-balanced corpus can shuffle a source napkin out of w08/w10/w11 and silently test the wrong slice). If a source has moved, adjust the probe window set. Inspect the reduce output against the probe-gate criterion below."
    status: pending
    depends_on: [author-grain-preserving-prompts]
  - id: probe-gate
    content: "Gate on the probe. The probe tests SURFACING only (does the candidate appear?), NOT survival through the validate quorum — survival is re-checked at graduate-or-decide, so a probe PASS is never a graduation pre-confirmation. PASS = all 5 failing baselines (cron-template-overrides-owner-direction, coordinator-amplifies-unseen-defect, repo-wide-autofix-sweep-footgun, compaction-is-a-checkpoint, peer-primary-topology-regime) appear as DISTINCT actuator-naming candidates, AND the broad leg holds deterministically: each broad C01-C03-class theme still surfaces as at least one coherent candidate AND the total candidate count stays within a stated band (no runaway fragmentation), not a purely-subjective 'coheres' judgment. FAIL on any of the 5 absent OR the broad leg breached → iterate author-grain-preserving-prompts and re-probe. Loop-exit: 5/5 named with the broad leg intact, or after 3 prompt iterations escalate to the owner with the probe evidence."
    status: pending
    depends_on: [cheap-grain-probe]
  - id: full-v3-rerun
    content: "OWNER-AUTHORISED ACTION (a one-way ~13.2M-token spend). Re-derive the partition from the LIVE corpus first (never trust the frozen v2 PARTITION_WINDOWS — the corpus has grown). Run the pre-spend cost gate. Run map -> reduce. Run the POST-REDUCE cost re-gate (validateStagePlan with the REAL candidate count) BEFORE dispatching validate. Run validate (the settled quorum-floor adjudication) -> meta. Feed the result to the deterministic aggregation driver. The aggregation/adjudication layer is UNCHANGED from v2."
    status: pending
    depends_on: [probe-gate]
  - id: graduate-or-decide
    content: "Compute the Choice-B verdict deterministically (strict within-remit >= 0.6 AND lenient within-remit >= 0.85). Apply the regression guard: confirm within-remit strict recall IMPROVED net (the 5 failing baselines converted to subsumes/refines/equal) AND the broad-cluster baselines did not regress — the fix must not trade narrow-mechanism recall for broad-theme recall. On PASS: graduate the method to a reference runbook (PDR-120) + adopting PDR (PDR-035), and feed any newly-surfaced finer candidates into the conservation machinery (consolidate-until-done). On FAIL: name the residual defect and route it. No holding state."
    status: pending
    depends_on: [full-v3-rerun]
---

# Large-corpus analysis v3 — extraction grain

> **STATUS: REVIEWED — READY FOR EXECUTION (2026-06-30, Linnet binds Leeward).**
> `assumptions-expert`: READY-WITH-AMENDMENTS, all integrated (probe provenance trace,
> surfacing-vs-survival, three-layer broad-leg guardrail, sandbox-mirror demoted to a launch
> pre-flight). Successor to the DONE/SUPERSEDED
> [`large-corpus-analysis-v2-implementation.plan.md`](./large-corpus-analysis-v2-implementation.plan.md).
> The v2 rerun verdict was **REFINE**; this plan executes that refinement. The full rerun
> (`full-v3-rerun`) is the one gated step: a one-way ~13.2M-token owner-authorised action, not run
> by authoring this plan and not gated on plan readiness.

The v2 rerun proved the machinery and the deterministic aggregation, but failed Choice B on
fidelity: **strict within-remit recall 5/10 = 0.50** (< 0.60). The residual gap is **extraction
altitude, not measurement** — the aggregation layer is proven correct (deterministic,
recompute-validated; the quorum-floor adjudication is settled by
[PDR-122](../../../practice-core/decision-records/PDR-122-agentic-judgment-pipelines.md)). This
plan improves the map/reduce prompts to preserve the specific mechanism each baseline names, then
re-proves the method.

## End goal

A large-corpus-analysis Discovery pass that surfaces specific recurring **mechanisms** as distinct
candidates — not only the broad themes that subsume them — so the method's within-remit recall
clears Choice B (strict ≥ 0.60, lenient ≥ 0.85) and the finer-grained, often most actionable
patterns (the cron-template override, the autofix sweep, the compaction checkpoint) are surfaced
rather than dissolved into a broad parent. The user impact is the standing one for this thread:
**the curation, conservation, discoverability and utility of understanding** — a discovery feeder
whose findings are mechanism-specific enough to home as durable doctrine, repeatable not heroic.

## Mechanism

First-hand reading of the v2 stage prompts (not the meta agent's discount note alone) pinpoints
two blurring drivers, both at the LLM layer, both prompt-only fixable:

1. **The reduce prompt rewards consolidation.** `"Aim for 15-25 candidates"` is a hard compression
   target; with 682 leaves it forces distinct mechanisms to be merged into broad parents (this is
   precisely why C10/C11/C12 dissolved four distinct commit-mechanism baselines, per the corrected
   findings discount note). And `"a single-window signal is usually NOT an emergent candidate"`
   discards narrow actuators outright — why `cron-template-overrides-owner-direction` was missed
   ("no broad recurrence parent to absorb it").
2. **The map prompt extracts themes, not actuators.** Leaves are one-sentence theme statements
   with no requirement to name the specific actuator, so reduce has no fine signal to preserve even
   when it wants to.

The fix removes the compression incentive and adds an actuator-preservation requirement at both
stages — **changing only the prompts**, which is exactly the lever the owner scoped and leaves the
proven aggregation layer untouched. A staged cheap probe resolves the key warrant (that
preserving grain does not shatter the broad-theme cluster) before the one-way full-rerun spend.

## Means

The workstreams above. WS `author-grain-preserving-prompts` is prompt engineering on the conserved
`.mjs`; `cheap-grain-probe` and `full-v3-rerun` are multi-agent Workflow runs (real actions);
`probe-gate` and `graduate-or-decide` are deterministic assessments.

## Acceptance criteria

- **Prompts changed, aggregation untouched.** The diff for `author-grain-preserving-prompts`
  touches only the map/reduce prompt strings in the conserved `.mjs` (and, if the probe forces the
  fallback, the leaf/candidate boundary schema — never `aggregation-*.ts` or the adjudication state
  machine). Proof: `git diff --stat` shows no change under `agent-tools/src/corpus-analysis/aggregation-*`.
- **Probe success criterion met** (`probe-gate`): all 5 failing emergent baselines appear as
  distinct actuator-naming candidates in the new reduce output, with the broad-theme cluster still
  coherent. Proof: a value-proxy inspection recorded against the 5 baseline ids + the broad cluster.
- **Choice B met within-remit** (`graduate-or-decide`): strict ≥ 0.60 AND lenient ≥ 0.85, computed
  by the existing deterministic `recallReport` + `meetsGraduateGate`. Proof: the aggregation
  driver's JSON report.
- **Regression guard clears**: within-remit strict recall is net-improved AND no previously-passing
  broad baseline regressed to partial/missed. Proof: a baseline-by-baseline diff of v2 vs v3 recall
  matches.
- **Deterministic recompute clean**: every disposition replays identically through `adjudicate`;
  `findRecallIntegrityViolations` is empty. Proof: the driver's recompute-vs-recorded diff.

## Proof contract

| Acceptance id | Proof level | Command / observation |
| --- | --- | --- |
| prompts-only diff | non-code | `git diff --stat` excludes `aggregation-*.ts` / adjudication |
| probe 5/5 named | value-proxy | inspection of reduce candidates vs the 5 baseline ids |
| Choice B met | integration | aggregation driver report (`recallReport`, `meetsGraduateGate`) |
| regression guard | value-proxy | v2-vs-v3 per-baseline recall-match diff |
| recompute clean | unit/integration | `findRecallIntegrityViolations` empty; disposition replay matches |

## Prerequisites

- **Blocking** — an execution-authorised session for `cheap-grain-probe` (a bounded ~1.2M-token
  action), and a **separately** owner-authorised session for `full-v3-rerun` (the one-way ~13.2M
  spend). A corpus "run" is an action, not a read; execution authority is confirmed independently
  of agreeing *what* to run.
- **Launch pre-flight invariant** (not a plan-readiness blocker) — the sandbox routing mirror is
  re-checked against `workflow-routing-mirror.conformance.test.ts` (39 cases green) before each
  launch, per PDR-122 invariant 3. It is a standing operating condition checked at every launch,
  recorded in the lifecycle triggers, not a dependency that gates plan readiness.
- **Beneficial** — the `oak-corpus-analysis` skill + agent-tools scripts (the conservation plan's
  WS-C). Minimum shippable without it: run from the conserved `.mjs` tooling + the README's
  documented aggregation-driver shape, exactly as the v2 rerun did.

## Non-goals

- **Touching the aggregation / adjudication layer.** It is proven correct and settled (PDR-122);
  this plan changes prompts only.
- **Changing the Choice-B gate** (strict ≥ 0.60 AND lenient ≥ 0.85 — owner-confirmed).
- **Schema enrichment as the first move.** A leaf/candidate `mechanism` field is a *fallback*,
  considered only if the prompt-only probe fails to surface the actuators — and even then it is a
  boundary-schema change, never an aggregation-logic change.
- **The memory event-graph** (PDR-119 / ADR-200) — Lens-4 verdict remains defer.

## Risks

| Risk | Mitigation |
| --- | --- |
| Removing the count cap over-fragments and shatters the broad-theme cluster, trading broad recall for narrow | Three layers: (1) the probe's deterministic broad-leg floor catches it **pre-spend** (each broad theme retains a coherent candidate; count within a band); (2) the proven post-reduce cost re-gate (`validateStagePlan`) aborts on runaway candidate count **before** the expensive validate dispatches; (3) the `graduate-or-decide` regression guard is the **backstop** — fails the run if any broad baseline regressed to partial/missed. The probe makes the broad leg a guardrail, not only a post-hoc detector on a sunk spend |
| Prompt-only proves insufficient to surface actuators | Scoped fallback: a leaf/candidate `mechanism` boundary-schema field (NOT aggregation) — decided at the probe, not pre-committed |
| Full rerun overspends (v2 hit ~13.2M, 1.75× its pre-estimate) | The proven `validateStagePlan` post-reduce cost re-gate runs with the REAL candidate count before validate dispatches |
| Corpus grew since the v2 partition → silent coverage gap | Re-derive the partition from the live corpus at launch; never reuse the frozen `PARTITION_WINDOWS` |
| Sandbox mirror drift misroutes the adversary | Conformance test re-checked before every launch (blocking prerequisite) |

## Plan-body first-principles check

Per [`plan-body-first-principles-check`](../../../rules/plan-body-first-principles-check.md): the
**shape clause** fires at `author-grain-preserving-prompts` — the change is prompt-text only and
must not reach into `aggregation-*.ts`; if a fix appears to need the aggregation layer, that is a
signal the diagnosis is wrong, stop and re-ground. The **landing-path clause** fires at
`full-v3-rerun` — it is an owner-authorised action gated on a passing probe, never run to "confirm"
a plan. The **vendor-literal clause** fires on the harness Workflow footguns (args-as-JSON-string,
`.output` wraps `.result`, `node --check` false-positives top-level `return`) — verified first-hand
in the v2 run and conserved in the tooling README; re-confirm against the live harness at launch.

## Readiness reviewers

Before this plan is marked READY FOR EXECUTION: `assumptions-expert` (proportionality of the staged
probe-then-rerun shape and the regression guard). A technical lens is not required — the change is
prompt text plus a re-run of a proven pipeline.

## Learning loop

`graduate-or-decide` runs the consolidation workflow: a PASS graduates the runbook + adopting PDR
and feeds new finer-grained candidates into `consolidate-until-done` (the conservation machinery,
per PDR-122 — this pipeline is a FEEDER, never a bespoke graduation); a FAIL routes the residual.

## Lifecycle triggers

Per [`lifecycle-triggers`](../../templates/components/lifecycle-triggers.md): session-open
grounding reads this plan + the v2 rerun result report + PDR-122; the full rerun emits a
curator-pass run-record; completion runs the learning loop above and sweeps the discoverability
surfaces (this README row, the thread record, the reference hub).

## Lineage

Serves the `agentic-engineering-enhancements` thread, continuity/memory/knowledge-flow stream.
Chain origin: [`large-corpus-analysis-runbook-build-and-prove.plan.md`](./large-corpus-analysis-runbook-build-and-prove.plan.md)
→ [`large-corpus-analysis-v2-implementation.plan.md`](./large-corpus-analysis-v2-implementation.plan.md)
(direct parent, DONE/SUPERSEDED) → this plan. Derives from the v2 rerun result report and PDR-122.
The conserved tooling and corrected findings are at
[`.agent/reports/agentic-engineering/large-corpus-analysis-tooling/`](../../../reports/agentic-engineering/large-corpus-analysis-tooling/).
Graduation lands the runbook in the discovery surfaces seeded by
[`agentic-corpus-discoverability-and-deep-dive-hub.plan.md`](./agentic-corpus-discoverability-and-deep-dive-hub.plan.md).
