---
name: "Corpus-Analysis Salvage and Topology Redesign"
plan_id: corpus-analysis-salvage-and-topology-redesign
collection: agentic-engineering-enhancements
lane: current
status: "FULL-PROCESSING nearly complete: ws1c + ws1e + ws1f + ws1g EXECUTED and ws1d batch E-b1 EXECUTED 2026-07-03 (Gust hunts Headwind; commits 6708fb8eb, 3d8781aac, ea9c16054, 89208e0d2, then ws1g 64f0fab51, 2fbab3d15 + closure). SOLE REMAINING WORK: ws1d batches E-b7 + E-b8 (tier E ranks 151-187, 37 items; E-b2..E-b6 EXECUTED 2026-07-04, Otter hunts Jetty) — jq recipe: .tierE[150:175] of .agent/reports/agentic-engineering/large-corpus-analysis-tooling/data/discovery-run-salvage-tiers-2026-07-02.json for E-b7, one commit per batch; the ws1d todo carries the worked shape. The set-level acceptance (mandate item 2) fires when ws1d finishes. Workstreams ws1c-ws1g ADDED 2026-07-03 (Vega mends Oblivion, owner-directed): EVERY remaining rescued-knowledge stratum processed in full — the prior 'owner-gated manual round' framing was NEVER owner-ratified (precedence-is-not-approval) and is withdrawn; comms events alone are owner-routed to a separate plan. ws1b EXECUTED 2026-07-03 (Vega): all 59 A-D rescue entries dispositioned. ws1 EXECUTED 2026-07-02 (Rosemary stirs Bracken): A=18 B=8 C=18 D=18 E=187 residual=0. ws2+ (topology redesign) still requires a fresh-session readiness review before build (folds into the corpus-generalisation Phase 0). Session opener for the remaining ws1d batches: .agent/prompts/agentic-engineering/rescued-knowledge-full-processing-session.md"
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
    content: "ws1c EXECUTED 2026-07-03 (Gust hunts Headwind): every stratum recomputed first-hand with jq — tierE 187 (all full-text, disjoint from A-D; rank is ARRAY POSITION — entries carry no rank field, only the tiebreak fields distinctWindows/supportingLeafCount/candidateId); unclustered leaves 83 (580 map leaves minus 497 unique supportingLeafIds, all full statements); meta synthesisNotes 8 (plus recallMatches 18, corroborationClaims 18); banked verdicts 202 Opus (54 candidates) + 31 Sonnet (8 candidates), structured-only reconfirmed (key union candidateId/lens/regime/verdict; all 246 validate reason fields null); v2 50=45+5 full-text with 31 corroborationClaims (claimedHomePaths) + 18 recallMatches; probe 75 candidates + 167 leaves full-text on w08/w10/w11 vs the 15-window full-run partition (file lists committed — ws1g(d) inputs present). Kill accounting reconciles: 246 = 26 keep + 220 kill; 220 = C18 + D18 - 3 (C-and-D overlap) + E187; A-D = 62 rows - 3 overlap = ws1b's 59. RECORDED VERDICT (not a gap): the v1 stratum has no per-item JSON — its committed disposition base is napkin-discovery-pass-1-2026-06-29.md (10 kept described in full; 9 kills as the named speculative-narrative-arc class; C06 unadjudicated) + the curator-pass metadata record; ws1g(c) body-reads those committed descriptions. Zero re-spend confirmed for all other strata. Comms-corpus artefacts OUT (owner-routed separate plan)."
    status: completed
  - id: ws1d-tier-e-disposition
    content: "ws1d: tier E full disposition, 187 ranked kills, rank-ordered batches of ~25 (E-b1 ranks 1-25 ... E-b8 ranks 176-187), one commit per batch. E-b1 EXECUTED 2026-07-03 (Gust hunts Headwind): 25/25 dispositioned first-hand — 22 duplicates with homes verified on disk (owner-attention/present-verdicts rules, harness-shell-and-commit-edge-cases + scope-as-goal + route-reviewers-by-abstraction-layer patterns, PDR-026 deferral-honesty, PDR-046/PDR-100/PDR-101, sonar-disposition-policy, no-moving-targets + hook-substring rules, use-built-agent-tools-cli, practice-core-portability, tool-error-as-question, whole-tree-gate doctrine, v1 report's negative-space note), 3 enrichments landed (C43 knip entry-point gotcha to troubleshooting; C91 reviewer-convergence + 2-3-rounds craft to invoke-code-experts executive memory; C244 executable-enforcement pendulum evidence to the action-time design-space plan), 0 rejects. E-b2 EXECUTED 2026-07-04 (Otter hunts Jetty): 25/25 (ranks 26-50) dispositioned first-hand — 22 duplicates with homes verified on disk (ADR-144 advisory-vs-blocking resolution + no-verify rule; consolidate-at-second-consumer rule + ADR-173 canonical-identity; C190's cascade-counting superseded by the stronger promote-on-first-instance owner direction in distilled's header; PDR-089/090/091 + metacognition directive for the cowpath family; read-diagnostic-artefacts-in-full clause-for-clause; ADR-125 + orientation layering + portability:check mechanical gate; pr-lifecycle fix-the-class + review-thread harvesting; wrapped-exit-codes-false-green pattern incl. the exact unpiped-push + ls-remote proof; PDR-117 + check-singleton-per-window with C152's session-handoff every-agent-gates collision verified no longer present; start-right-team pressure-not-menu + dissolve-on-pressure-clear; threads README + session-handoff/consolidate-docs scope split; tdd-as-design one-act doctrine + testing-strategy §Refactoring TDD satisfies-anchor covering type-checker-as-RED; principles §absolute excellence + consolidate-until-done no-limit-raises; consolidate-docs process-before-archive with C213's pass-log endpoint itself superseded by permanent-doc-is-the-consolidation-record; PDR-012/PDR-026 smuggled-drop + deferral-honesty family for label-smuggled scope; stage-what-you-commit R100 tripwire exact; build-system turbo inputs discipline; testing-strategy §Canonical Vitest Configuration naming the exact E2E leak; tdd-as-design audit-shaped-test doctrine + test-expert charter; quality-gates component pnpm-check-canonical; strict-validation-at-boundary + ADR-085 validators + domain README bulk-download issues; ADR-010 standing with the app-level esbuild build-scripts embodying C76's endpoint and the release-identifier plan owning C71's SHA-decoupling facet — C71 is a split-facet item counted once, under its enrichment), 3 enrichments landed at firing surfaces (C94 conflicting-verdicts-resolve-by-authority-scope clause to invoke-code-experts executive memory; C164 scope-the-PR-for-review clause to pr-lifecycle Phase 1; C71 corrupted-lockfile diagnostic to troubleshooting §Lockfile), 0 rejects. Batch-level note: no PDR-098 fires-despite-home routing — the corpus window pre-dates the homes (several homes were built FROM these arcs). E-b3 EXECUTED 2026-07-04 (Otter hunts Jetty, same-seat owner-directed continuation): 25/25 (ranks 51-75) dispositioned first-hand — 23 duplicates with homes verified on disk (verify-dont-trust read-the-failure-surface + proving-surface + governing-decision clauses covering C78/C84/C217/C218; PDR-043 no-sed-bypass cue; no-machine-local-paths rule + the policy regex now covering the flattened project-id form; no-moving-targets + ADR-117 for plans-vs-ADRs; handoff-messages-self-contained + PDR-075; agent-collaboration shared-state-writes doctrine for additive concurrent edits; the watcher rule's rendered-log-is-generated clause; threads convention + consolidate-docs 7c + plan lineage for discoverability; PDR-027 identity preflight hard-fail; the coordination-home F-41 plan owning C148's endpoint; start-right §8 worktree build exact; pr-lifecycle merge-ready + its jobs-JSON-not-log-failed clause exact for C165/C168; PDR-085 missing-autonomy-primitive for C182; PDR-038 maturity amendment; retired tracks/workstreams embodied for C189; rules-have-no-exceptions + replace-dont-bridge for C193; use-agent-comms-log plain-reading for solo transparency; ping-before-escalate exact for C209; the consolidate skills' first-hand mandates + PDR-089 for C212), 2 enrichments landed at firing surfaces (C176 rule-out-stale-deployment triage preamble + differential local-vs-prod query into production-debugging-runbook §Common Scenarios; C79 split-facet — ANSI/PUA invisible-bytes detection bullet into troubleshooting §Static-analyser gotchas, the PUA facet already homed in chatgpt-report-normalisation), 0 rejects. PDR-098 note: C78's pipe-masked-verdict class shows fresh post-home instances (this session's napkin carries three) — recurrence texture routed via the napkin to the action-time inventory at the next consolidation. E-b4 EXECUTED 2026-07-04 (Otter hunts Jetty, same seat): 25/25 (ranks 76-100) dispositioned first-hand — 22 duplicates with homes verified on disk (naming endpoint embodied in the oak-kg tool surface + the audit-sweep/zero-match-false-green sweep patterns for C223; owner-direction-stream for the C224 milestone renegotiations; continuous-napkin-capture + impact-backward doctrine for C231; value-stream + collaboration-is-value-contingent for C232; present-verdicts §Pre-Pose Viability Check exact for C236; never-disable-checks fix-the-step clause + tool-error-as-question for C237; widget delivery embodied in codegen-DI + widget ADRs for C16; elasticsearch-ingest-lifecycle chunking/_count clauses exact for C24; no-warning-toleration whose recorded falsification IS C70's instance; ADR-159 for C73; vendor-doc-review + verify-vendor-call-shapes for C74; the F-41 coordination-home lane + the watcher rule's silent-failure class for C130; read-diagnostic-artefacts-in-full for C200; PDR-089 for C219 by the entry's own citation; the oak-plan self-check greps + documentation-is-infrastructure for C226; schema-first-execution + the live validate-subagents gate for C238; the embodied eslint resolver chain + cache doctrine for C58; ADR-152 for C112; the agent-collaboration shared-state graduation for C126; the built conversations/coordination layer superseding C127's motivating gap; the comms-event schema's kind discriminator embodying C132's cure; worktree-hygiene's three-leak-paths naming C151's wrong-base path exactly), 2 enrichments landed at firing surfaces (C59 activating-new-rules caution — type-affecting idiom autofixes, error-only-with-sound-same-commit-clearing, warn-first otherwise — into the oak-eslint README; C30 undeclared-dependencies-present-as-race-shaped-failures / never-mask-with-concurrency-clamps into build-system §Task Dependencies), 1 REJECT with named reason (C90 stale-repo-name false-positives: the cause was removed at the 2026-02-27 rename, the verify-before-asserting reflex is homed in verify-dont-trust, and no live surface exists to enrich). E-b5 EXECUTED 2026-07-04 (Otter hunts Jetty, same seat): 25/25 (ranks 101-125) dispositioned first-hand — 23 duplicates with homes verified on disk (poll-after-comms + ping-before-escalate with the comms CLI curing C156's authoring friction; pr-lifecycle code-owner gate + the per-user index-line-retirement discipline for C166; the ci.yml fan-in wiring embodying C167; PDR-122 invariant-1 + agentic-judgment-conserve-by-default for C171's zero-heuristics directive; ADR-113 for C173; ADR-134 for C178; the onboarding status register + consolidate-docs step-1 persona-simulation check for C196; PDR-052 for C206's directives half with its practice-core half superseded by the later care-not-hands-off owner position; loop-exit-criteria-required for C229; the removing-a-constraint and many-pairwise-links patterns C233 itself founded; the split map/reduce workflow files embodying C234; the settings.json deny/ask blocks embodying C08; the commit skill's record-staged-last + no-restage clause exact for C12 and its constraint table for C13; ADR-112 for C14; C17's Link-header pagination superseded by the graph-anchors design; the SDK architecture canonical-URLs doc + verify-dont-trust for C26; the upstream-alignment runbook class for C27; the derived AggregatedToolName type + generator-first-mindset embodying C28; ADR-121 verify-vs-mutate + build-system cache-masking notes for C31/C32; testing-strategy fixture doctrine for C41; troubleshooting's empty-barrel bullet exact for C44), 1 enrichment landed (C22 keyof-over-union-is-intersection silent-trap note into the type-helpers README), 1 REJECT with named reason (C23 discriminated-union narrowing dispatch: compiler-loud generic TS semantics, official-docs territory, and the local dispatch solution is embodied in the module that needed it — no repo surface fires it). E-b6 EXECUTED 2026-07-04 (Otter hunts Jetty, same seat): 25/25 (ranks 126-150) dispositioned first-hand — 22 duplicates with homes verified on disk (the .markdownlint.json siblings_only setting embodying C48; the ADR-121 gate matrix as authority over C49's stale all-four-surfaces claim — knip is deliberately NOT in pre-commit per troubleshooting; the knip entry-point bullet for C50; the format-before-measure ordering embodied in pnpm check + the commit skill's formatting-proof step for C53; the oak-eslint README boundary sections + upstream eslint docs for C56; aggregate-gate-blind + stay-with-stated-scope for C66; build-system's stale-dist masking note for C67; build-system's clean-vs-generate:clean doctrine for C68; verify-dont-trust exact for C75; troubleshooting's dotdir bullet exact for C82; frictions F-111 exact for C83; the policy.json sha-regex lookahead embodying C85; ADR-125 + portability:check superseding C87's undocumented-coverage complaint; invoke-code-experts tiers for C92; the sub-agents templates' should-exist clauses for C96 by its own citation; unknown-is-type-destruction + validate-specialist-findings for C97; pr-lifecycle's GraphQL-recount clauses for C100; the harness's explicit per-user memory path superseding C106; the practice-core package shape embodying C113; handoff-messages-self-contained's voice-teaches clause exact for C119; consolidate-docs step-6 rotation-diff discipline for C124; ADR-144's declared-envelope model for C125), 2 enrichments landed (C57 code-that-generates-code-is-product-code section into development-practice.md; C61 CodeQL-re-keys-alerts clause onto troubleshooting's CodeQL bullet), 1 REJECT with named reason (C55 nullish-chain complexity extraction: lint-loud generic refactor craft, embodied where fixed, no repo surface fires it). NEXT BATCH: E-b7 (ranks 151-175; jq .tierE[150:175]). Per-item protocol = ws1b's: read the full pattern text; judge against existing homes first-hand; graduate / enrich / duplicate / reject-with-named-reason; conserve-by-default (PDR-122); PDR-098 recurrence check with the temporal qualifier (an instance is fires-despite-home evidence only if it post-dates the home). Subagents may propose home candidates; every disposition is adjudicated first-hand by the context-holder. Every entry receives one of the four dispositions in this pass: an entry hinging on an undecided design question routes INTO the owning artefact as content — routing IS its disposition. Batch boundary = handoff boundary. Rank tiebreak fields: distinctWindows, supportingLeafCount, candidateId."
    status: pending
  - id: ws1e-unclustered-leaves
    content: "ws1e EXECUTED 2026-07-03 (Gust hunts Headwind): all 83 unclustered leaves (recomputed set) body-read and dispositioned first-hand. Most are single-instance textures of already-graduated classes — duplicates verified against their live homes (rules, patterns, skills, PDR-018, thread records; several homes verified as carrying the exact cure, e.g. session-handoff 11a PENDING-reviewer dispatch, session-handoff 6d default-plus-extensions, the audit-rule-body and commit-window-discipline patterns). Five rejects with named reasons (stale one-off version note; superseded by ADR-144; validator defect cured in agent-tools practice-fitness link-reference handling, verified in code; EEF-specific one-off; thread-local design note already in the statusline record). Enrichments landed: verify-dont-trust read-side hedge clause; use-monitor stderr-swallowing clause; consolidate-docs step-2 navigation-vs-prescription reference modes; troubleshooting type-check-undercounts-migration-surface gotcha; frictions F-117 (opaque unknown claim_id); architecture-standard WS1 pure-orchestrator/runtime-wiring convention. Structural finding routed: leaf-coverage accounting requirement added to the generalisation plan's P0 agenda (residual=0 was candidate-scoped; 83/580 leaves entered no candidate and were invisible downstream)."
    status: completed
  - id: ws1f-synthesis-notes-and-verdict-corpus
    content: "ws1f EXECUTED 2026-07-03 (Gust hunts Headwind): (a) all 8 meta synthesisNotes verified against live homes first-hand — the disposition-not-discovery driver and corroboration-robust notes are embodied by the salvage tiers + ws1b execution; C146's two named pattern homes verified on disk; the capture-does-not-cure half (C183/C184) verified routed to the action-time-structural-interrupt design-space plan; the coarse-keep-masks-fine-kill texture (C01/C146 vs killed C03/C04/C07) is the v3 extraction-grain plan's founding evidence (verified); the recall-bimodal + reviewer-polarity + keep-filter kind-bias notes folded into one calibration item routed to the generalisation plan P0 agenda. (b) bounded deterministic mine of the banked verdict corpora executed and banked at data/banked-verdict-structural-mine-2026-07-03.json: per-test kill drivers per regime (notArtefact the discriminating blade everywhere; grounded/baseRateHolds fail rates 4-7x higher under no-tools Sonnet than free-tool Opus — tool access is the dominant regime variable), confidence textures (baseRateHolds least confident in both main regimes), cross-regime disagreement by kind (one-directional, trajectory-skewed 5/11 vs 15/43). Findings routed to the P0 agenda as calibration input. Corpus disposition: committed evidence corpus, mechanically mined (recorded decision)."
    status: completed
  - id: ws1g-prior-generation-strata
    content: "ws1g EXECUTED 2026-07-03 (Gust hunts Headwind, owner-directed same-seat continuation; commits 64f0fab51 + 2fbab3d15 + the slice-3 closure commit). (a) All 31 v2 corroborated re-finds verified first-hand: 27 pure re-finds (homes carry the substance — strong recall confirmation), 4 nuance enrichments landed at the firing surfaces (reviewer-convergence independence qualifier; no-tombstones recursive-removal reflex; register-at-session-open second firing moment; skill-invocation-is-not-owner-direction into precedence-is-not-approval) plus one GRADUATION — the unconditional shared memory/state writes doctrine into agent-collaboration.md, whose claimed home (important-state-not-in-temp-files) did not carry it (corroboration-scan defect recorded; the repo-continuity invariant line had no canonical home). (b) v2 kills: 4 duplicates of live doctrine; C34 a genuine false kill — worktree-hygiene now names the three isolation leak paths. (c) v1 supersession from the committed report base: memory-granularity, substrate-reframing, deferral-as-avoidance, and ceremony-bias arcs superseded by later grounded coverage (C25/C107, C19, C08/C160, collaboration-is-value-contingent); the pathogen-deepening arc's kill STANDS (apophenia, never resurrected — the grounded pathogen substance is in the design-space inventory without the narrative); the 4 unnamed kills take the class verdict (per-item texts never conserved, ws1c recorded verdict); C06 superseded (C109's grounded form + live endpoints PDR-100/PDR-101). (d) Probe supersession proof BANKED at data/probe-supersession-proof-2026-07-03.json (code-expert-reviewed pre-banking; the review re-tiered the headline — strict 72/167 leaves, partial 71, none 24; candidates 52/20/3): all 24 none-tier leaves and the 3 uncovered candidates' supporting leaves individually dispositioned (23 duplicates/superseded incl. record-staged fixed by the intent-scoped cure, seen-file format superseded by the current CLI proven green twice this session; 1 reject — the machine-local plugin-path diagnosis, no repo surface); probe candidates = superseded instrument-calibration artefacts consumed by the recorded launch-preflight. (e) Residue: all 8 v2 synthesisNotes verified (note-8's every-home-verified claim corrected by the C28 finding); 18 recallMatches = calibration evidence consumed by the REFINE verdict + v3 grain plan, both missed baselines confirmed homed by construction; keep-set reconciliation 45 = 31 corroborated + 13 conservation-ledger + C39 (duplicate of PDR-122 inv-1 + agentic-judgment-conserve-by-default, verified incl. the measured false-kill rate); metadata strata (opusQuorum, partition/coverage blocks, post-run-close, v2 recall/verdict/discountNote scalars) recorded as run metadata. INVENTORY RE-RUN: every ws1g-owned stratum per-item dispositioned; tier E = 25 dispositioned (E-b1) + 162 in-drain via the ws1d batch todos (the mandate's batch-todos-carry-drain-state; the set-level acceptance fires when ws1d finishes — interpretation flagged to owner at plan approval)."
    status: completed
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
