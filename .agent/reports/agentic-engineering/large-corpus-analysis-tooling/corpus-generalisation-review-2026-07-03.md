# Corpus-Generalisation Work — Adversarial Review Verdict

**Date**: 2026-07-03 · **Session**: Hazel rides Orchard (`de9f72`, claude-code / claude-fable-5).
**Reviewed**: the 2026-07-03 research-and-record outputs of Rosemary stirs Bracken — the evidence
report [`corpus-generalisation-research-2026-07-03.md`](corpus-generalisation-research-2026-07-03.md),
the strategic plan
[`corpus-analysis-generalisation-and-knowledge-layer.plan.md`](../../../plans/agentic-engineering-enhancements/future/corpus-analysis-generalisation-and-knowledge-layer.plan.md),
the handoff surfaces (AEE thread record §CORPUS GENERALISATION, `repo-continuity.md` entry,
`future/README.md` row, the agent-tools-architecture-standard WS0 note), the memory
`project_corpus_instrument_is_a_knowledge_layer`, and commits `a5e61a608` + `d6d3fb70e`.
**Method**: every §3 load-bearing `[V]` claim reproduced first-hand against the live tree; the two
workflow journals (six foundation lenses + graph/alternatives lenses, still on disk under the
originating session's `subagents/workflows/` directory) cross-checked against the report's
synthesis; the seven design conclusions steelmanned against their alternatives; the two `[O]`
owner statements checked for dilution or over-commitment.

## Verdict

**Needs targeted revision — the core is sound.** The decomposition, the regime-registry design,
the one-thread merge, the identity verdict, the graph boundary, the packaging nuance, and the
owner-observation capture all survive adversarial re-verification. Three findings need revision or
addition before the Phase 0 design session treats the report as settled ground; the sharpest one
(R1) changes an interpretation the owner was given, not just a detail.

## Facts reproduced (the primary check)

Every sampled `[V]` claim reproduced exactly against the live tree:

- **Quorum model uniformity**: one `dispatchVoter` serves **all tiers**, `model: 'sonnet',
  effort: 'high'` (`agent-tools/src/corpus-analysis/workflows/adjudication.ts:78-79`); lenses
  differ only by prompt. The inline comment records the Sonnet choice as owner-decided 2026-07-02.
  The report's claim is if anything understated — uniformity covers tiers 0–2, not tier 2 alone.
- **Regime drift**: `.codex/agents/corpus-mapper.toml:3` `model_reasoning_effort = "high"` vs
  `map.workflow.ts:42-43` `sonnet/low`. Live drift confirmed. The four dispatch-site literals
  (map sonnet/low, reduce opus/high, meta opus/high, adjudication sonnet/high) all match.
- **Napkin leak points**: `napkinDate` in `judgment-schemas.ts` (grounding-citation schema); the
  four prompt builders in `workflows/prompts.ts` hardcode the napkin corpus description; the meta
  prompt hardcodes the baseline count "18" twice (lines 138, 151).
- **Comms forensics**: `git ls-tree 255117a43^ -- .agent/state/collaboration/comms/ | wc -l` =
  **5,202**; the falsifier `3cc1fb93` is absent from live disk and intact in git at `255117a43^`
  (full body, 2026-05-21). Live dir now holds 2,214 events.
- **ADR-200 two-consumer claim**: §Open lists the same-idea/de-duplication mechanism among the
  "genuinely UN-built" pieces, and §8's reconciliation workflow states "the match step reuses the
  de-duplication / same-idea mechanism (§Open)" — two consumers at design time, confirmed.
- **Zero external consumers**: `rg -l "corpus-analysis" agent-tools/src --glob '*.ts'` outside the
  tree returns nothing.
- Also reproduced: the two effort vocabularies (`cost-and-coverage.ts:13` includes `xhigh`),
  `CHOICE_B` hardcoded in `post-run-driver.ts:56`, `meetsGraduateGate`'s gate-as-parameter TSDoc,
  the comms stage-0 modules in `collaboration-state/archive/`, and `comms-provenance-check.ts`.

Minor drift, not defects: 21 live comms events now contain `/Users/` machine-local paths (report:
17) — the PII leak channel is confirmed and has grown; live event count 2,214 vs the report's
~2,213 (this review session's registration event accounts for one).

## R1 — the comms-residual "benign-by-design" interpretation is wrong (owner attention)

The report frames the disappearance of the pre-mid-June events from the live `comms/` directory as
"the *expected consequence* of the untrack decision (comms events are gitignored local state that
does not travel across checkouts), so it is most likely benign-by-design." That interpretation is
**contradicted by the untrack commit's own contract**: `255117a43` (2026-06-14, WS7 Phase 3) says
the coordination tier leaves git tracking "**all preserved on disk**". Untracking removes files
from the index, not from the working tree — and this checkout is not a fresh clone (git directory
born March 2026; the `comms/` directory inode born 2026-05-13, before the untrack). The
originating comms lens said this plainly and the report softened it: "No manifest row, curator
record, or comms event I found accounts for it (the 06-21 sweep explicitly DEFERRED the residual;
the 06-18/06-29 passes moved only newer heartbeats). Candidates: an unrecorded `git clean` /
checkout reset of the untracked tier, or directory re-creation."

So: roughly three thousand untracked coordination files were removed from the primary checkout by
an unrecorded operation at some point after 2026-06-14, and nothing noticed for weeks. **This is a
real gap in the untracked-state safety story, not a benign consequence**: the pre-untrack window is
recoverable only because it happens to be in git history; any post-untrack event removed the same
way has no recovery path at all, and the archive-move harness (whose manifest is the intended
safety mechanism) was bypassed. The report's *action* recommendations survive intact —
re-materialise the analysis corpus from the git tree at `255117a43^` (the better substrate
regardless) and correct the stale ~1,707-event work-list wording — but the owner should receive
this as "unexplained removal; untracked-tier loss-detection gap", not "benign". A cheap standing
cure candidate for the design session: a tracked manifest/count watermark for the untracked tier,
so silent bulk removal trips a validator instead of a forensic accident.

## R2 — the leak inventory is not "complete by construction"

The report claims exactly three napkin leak points and asserts "Window ids are already opaque
strings, so the **partition axis itself does not leak** [V]". The cartography lens found — and this
review reproduced first-hand — a fourth, behavioural leak the report dropped:
`temporalCoverageReport` (`post-run/post-run-analysis.ts:89`) sorts window ids with
`localeCompare` and derives `earliest`/`latest` from that ordering — silently assuming window ids
collate chronologically. True for date-ranged napkin windows; not guaranteed for another corpus
family (a comms family partitioned by thread or channel would produce nonsense earliest/latest
without any type error). Window ids are opaque in the *schemas* but not in this kernel module's
*semantics*. The lens also supplied the cure, which the design session should adopt: window
ordering comes from the partition (family layer), never from string collation in the kernel; the
partition deriver is a declared plug-point of every family. Revision: reframe the three points as
the three *vocabulary* leaks, add this as a behavioural leak, and drop "complete by construction".

## R3 — three additions to the Phase 0 agenda (dropped lens content)

Cross-checking the journals shows the synthesis is otherwise faithful — every report section maps
to lens findings, and the lens `openQuestions` arrays are where the drops concentrate. Three
dropped items are agenda-worthy:

1. **Prompt version co-calibrates with the regime.** The regime lens asked whether the calibration
   stamp covers the prompt version: invariant 6's own 47%-vs-10.6% measurement held "candidates,
   prompts, and quorum math" constant, so a prompt edit can shift the judgment regime exactly as a
   model edit can — yet the proposed `RegimeBinding` tuple (`model, effort, agentType, maxTurns,
   toolSurface`) omits it. The stamp-hash design should decide whether prompt-builder versions are
   stamped members.
2. **Novelty-direction calibration.** The practice lens: "no corroborating home" is evidence of
   novelty only if the home-naming stage has measured recall over the doctrine estate — seed
   known-homed canaries through the corroboration stage, or "novel" claims (like the salvage run's
   "8 genuinely novel") carry unmeasured false-novelty risk.
3. **Is `aggregation-recall` kernel or family?** The stratum lens questioned whether recall
   calibration is inherently corpus-specific (baselines are napkin memory docs); the report's
   five-layer table places recall in KERNEL without recording that question. The engine/config
   split probably answers it (engine kernel, baselines family) — but Phase 0 should say so
   explicitly, since the leaf/candidate schemas hang off the same boundary.

## The seven design conclusions — ratified

1. **Identity (calibrated measurement instrument)** — SOUND. Grounded in the verified PDR-122
   feeder clause; the alternatives were genuinely steelmanned (embedding index composes as the
   cheap default behind an explicit multi-hop gate; KG-builder ruled out on three independent
   grounds). One honest caveat the report itself carries: "calibrated" is the design target, not
   the current state — the 2026-07-02 regime failure and the unmeasured quorum diversity are the
   two calibration debts, and both are on the P0 agenda.
2. **One thread, not two** — SOUND. D1–D6 re-read against the salvage plan: all six are
   corpus-agnostic protocol; extracting a kernel around the failed all-then-calibrate topology
   would land a known-bad shape as "general" and force a second migration of both families
   (`no-moving-targets`). Folding salvage ws2 into Phase 0 loses nothing — the same fresh-seat
   expert-panel gate applies. Scheduling note, not a defect: Phase 0's agenda is now heavy
   (identity, five layers, D1–D6, regime registry, quorum disposition, ten-plus-three questions);
   plan for it to span more than one sitting rather than compress the ratifications.
3. **Five-layer decomposition** — SOUND as a cut, with R2's completeness revision and R3.3's
   recall-placement question folded in. The kernel/harness-kit split matches what the module reads
   show; the harness emission kit as the highest-value extraction seam is credible.
4. **Regime registry + calibration stamp** — SOUND, and not over-engineering: the live TOML/TS
   drift and the measured 40% one-directional regime divergence are empirical evidence that an
   unstamped config edit is exactly the recurrence channel for the 2026-07-02 failure; the
   stamp-hash makes invariant 6 machine-checkable, which a plain config module plus doctrine
   discipline does not. Add R3.1 (prompt version) to the stamp design.
5. **Packaging seam** — SOUND. The knowledge-subset-moves / operational-tooling-stays split is the
   report's own stress-test, clearly attributed as such and consistent with the owner's "broken
   down along various appropriate seams"; the triple gate is preserved everywhere.
6. **Graph dimension** — SOUND. The construction/linking layer's two design-time consumers are
   verified in ADR-200 (§Open + §8); graph emission as an optional downstream renderer is
   consistent with the feeder clause and derived-not-authored; the pipeline/construction boundary
   is honestly left open as question 10 rather than prematurely settled.
7. **The ten open questions** — the right agenda, extended by R3's three additions (and R2's cure
   folds into the family-descriptor design rather than needing its own question).

**The quorum-diversity finding and the candidate PDR-122 invariant-2 amendment**: the finding is
real and the amendment is warranted. Invariant 2 as written *derives* the majority licence from
lens distinctness ("distinct lenses so they are uncorrelated"); with all voters on one model that
derivation is unsupported, and the repo's own invariant-6 evidence (regime swaps moved quorum
outcomes 40%, one-directionally) shows the model regime dominates the prompt lens. The right
amendment shape is the report's: independence is *measured* (effective-vote count on canaries),
never asserted from prompt diversity; cross-model-family heterogeneity is the remedy direction
when measurement shows correlation. Prompt-lens diversity on one model remains a defensible
*cost-tier* choice only while the measured effective-vote count supports the quorum math it feeds.
The report's disposition — record, do not amend mid-session — was the correct restraint.

## Owner-observation capture ([O] claims) — faithful

Both 2026-07-03 owner statements are represented as the owner meant them, consistently across the
report, plan, memory, WS0 note, and thread record: the knowledge-layer conviction is everywhere a
**destination, not a path**, triple-gated (second consumer + workspace-topology gate + WS0 fork),
with "open to other approaches" preserved; the document→knowledge-graph observation is everywhere a
**candidate goal, not ratified**. The report's one added nuance (not all of agent-tools is the
knowledge layer) is attributed to the report's own stress-test, not to the owner. No dilution, no
over-commitment found.

## Synthesis fidelity (secondary check)

Both workflow journals were on disk and were read. All eight lens results map onto report
sections with correct attribution; no invented findings were detected; external-literature claims
are consistently marked `[L]`. The drops are R1's softening and R2/R3 above — concentrated, as
expected, in lens `openQuestions`. A napkin-worthy method lesson: when synthesising lens output,
the `openQuestions` arrays deserve the same conservation discipline as `findings`.

## Forward action (unchanged, with additions)

The owner-scheduled fresh-seat **Phase 0 design session** stands as the promotion trigger, with:
R1 surfaced to the owner as an unexplained-removal / untracked-tier-safety finding (plus the
watermark-cure candidate); R2's behavioural leak and cure folded into the family-descriptor
design; R3's three questions added to the agenda. Independent and not blocked, as the prior
session correctly recorded: ADR-200 WS2/WS4 and the salvage plan's ws1b disposition pass.
