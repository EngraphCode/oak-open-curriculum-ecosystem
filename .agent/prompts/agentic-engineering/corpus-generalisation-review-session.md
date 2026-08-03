<!-- User scratchpad: a starting statement for the session that reviews the 2026-07-03
corpus-generalisation research-and-record work. Not doctrine; a pasteable opener. -->

# Corpus-Generalisation Review — Session Opener

## Paste this

ultrathink /oak-metacognition /oak-reason /oak-start-right-thorough

You are opening a **review session**. On 2026-07-03 a prior session (Rosemary stirs Bracken;
model switched claude-fable-5 → claude-opus-4-8 mid-session) ran a deep research-and-record pass on
**how to generalise the corpus-analysis pipeline** and wrote it all down without reshaping anything.
Your job is to **review that session and all its outputs — deeply, critically, adversarially —
before anyone builds on them.** Trust nothing on the prior agent's say-so. It marked each claim
`[V]` (verified first-hand), `[L]` (lens-asserted, cited but not independently re-run), or `[O]`
(owner-stated); treat every marking as a **claim to spot-check, not a guarantee**. The prior work is
a synthesis of eight research subagents plus one agent's own reasoning — both subagent output and
prior-agent work, so the standing directive applies in full: **critically assess all of it, ground
load-bearing claims first-hand, and remember that convergence between lenses is not proof.**

This is review, not execution. Do not re-run the research (it cost ~894k subagent tokens and is
done), do not reshape doctrine, do not build, do not drain buffers. The deliverable is a **verdict**:
sound as recorded / needs revision (with specifics) / gaps found — surfaced to the owner.

### 1. Ground first (do not skip)

Run start-right-thorough. Then read, in this order, so you can judge the work against its own
foundations:

- `.agent/practice-core/decision-records/PDR-122-agentic-judgment-pipelines.md` — the six-invariant
  doctrine spine the whole generalisation rests on. The prior session flags a **candidate
  amendment to invariant 2**; you cannot assess that without reading it.
- `docs/architecture/architectural-decisions/200-intent-as-a-living-idea-graph.md` — §Open and §8;
  the graph dimension depends on what ADR-200 already declares built vs unbuilt.
- `.agent/practice-core/decision-records/PDR-014-consolidation-and-knowledge-flow-discipline.md` and
  `PDR-011` — the knowledge-flow the instrument feeds.
- `.agent/plans/agentic-engineering-enhancements/current/corpus-analysis-salvage-and-topology-redesign.plan.md`
  — the salvage plan whose D1–D6 the prior session claims are "the shape of the general kernel."

Verify state first-hand: `git branch --show-current` (expect `feat/corpus_research_enhancements`),
`git status` (expect clean), `git log --oneline -4` (expect HEAD `d6d3fb70e`, then `a5e61a608`, then
the `#298` merge). Registries: `.agent/state/collaboration/active-claims.json` should show zero
claims and zero queue. No live background tasks.

### 2. The outputs to review (exact homes)

- **Evidence report (the anchor):**
  `.agent/reports/agentic-engineering/large-corpus-analysis-tooling/corpus-generalisation-research-2026-07-03.md`
- **Strategic plan (`future/`):**
  `.agent/plans/agentic-engineering-enhancements/future/corpus-analysis-generalisation-and-knowledge-layer.plan.md`
- **Handoff surfaces edited:** the AEE thread record §CORPUS GENERALISATION
  (`.agent/memory/operational/threads/agentic-engineering-enhancements.next-session.md`),
  the `.agent/memory/operational/repo-continuity.md` large-corpus entry, the collection
  `future/README.md`, and a WS0 note in
  `.agent/plans/agent-tooling/future/agent-tools-architecture-standard.plan.md`.
- **Memory:** `project_corpus_instrument_is_a_knowledge_layer` (in this platform's memory dir).
- **Napkin capture:** the workflow-orphan-file and model-switch entries in
  `.agent/memory/active/napkin.md`.
- **Commits:** `a5e61a608` (report + plan + surfaces) and `d6d3fb70e` (napkin).
- **Raw source of truth for the synthesis** (secondary check to the primary tree-verification below,
  if still on disk): the two workflow journals at
  `~/.claude/projects/<project-slug>/9f59e103-9b58-4ec1-9c5e-98c7b95f0cd6/subagents/workflows/wf_c21301bf-abd/journal.jsonl`
  (six foundation lenses) and the sibling `.../wf_c1ad1062-352/journal.jsonl` (graph + alternatives),
  where `<project-slug>` is this repo's Claude project directory. The report is a synthesis of these;
  if present, check it neither dropped nor overstated their findings. If absent, the report stands on
  its `[V]` markings, which you re-check against the tree.

### 3. Re-verify the load-bearing facts first-hand (the primary check)

Do not trust the `[V]` marks — reproduce a representative sample against the live tree:

- **The sharpest finding — quorum diversity is unmeasured.** Confirm all tier-2 voters share one
  model: read the dispatch site in
  `agent-tools/src/corpus-analysis/workflows/adjudication.ts` (the report cites `model: 'sonnet',
  effort: 'high'` for every lens; the lenses differ only by prompt). If true, the claim that
  PDR-122 invariant 2's "uncorrelated votes license a majority" is *asserted, not measured* stands —
  then judge whether the candidate amendment is warranted or whether prompt-lens diversity is
  defensible for this task.
- **The regime drift:** compare `model_reasoning_effort` in `.codex/agents/corpus-mapper.toml`
  against `effort:` in `agent-tools/src/corpus-analysis/workflows/map.workflow.ts` (report says
  `high` vs `low` — live drift).
- **The napkin leak points:** `agent-tools/src/corpus-analysis/judgment-schemas.ts` (the `napkinDate`
  field) and the four prompt builders in `workflows/prompts.ts`.
- **The comms forensic finding:** `git ls-tree 255117a43^ -- .agent/state/collaboration/comms/ | wc -l`
  (report: 5202); confirm the falsifier `3cc1fb93` is absent from the live `comms/` dir but present
  via `git show 255117a43^:.agent/state/collaboration/comms/3cc1fb93-c8d3-428e-92b5-4c7765355c75.json`.
  Then judge whether the "benign consequence of the WS7 untrack" interpretation is right, or whether
  it signals a real gap in the untracked-state safety story.
- **The construction/linking layer claim:** read ADR-200 §Open (the "genuinely UN-built" list) and
  §8 ("the match step reuses the de-duplication / same-idea mechanism") — the prior session claims
  the missing middle layer has two consumers at design time. Confirm.
- **Zero external consumers of the corpus tree:**
  `rg -l "corpus-analysis" agent-tools/src --glob '*.ts' | grep -v corpus-analysis` (expect none —
  the basis for "no second consumer yet, extract at comms").

### 4. Scrutinise the design conclusions (judgement, not just facts)

For each, steelman the alternative before accepting the prior session's verdict:

1. **Identity:** "a calibrated measurement instrument, not an indexer and not a KG-builder." Is that
   right, or is an embedding index enough / a graph builder actually wanted? (Report §Alternatives
   ruled both out.)
2. **One thread, not two:** does the salvage D1–D6 topology redesign genuinely have to land *with*
   the kernel extraction, or can they be sequenced apart? (This drives whether salvage ws2 folds
   into Phase 0.)
3. **The five-layer decomposition** (kernel / harness-kit / corpus-family / regime / run) — is that
   the right cut, and is the leak inventory actually complete?
4. **The regime registry with a calibration stamp** — the right mechanism for the model/effort
   decoupling, or over-engineering? Does the stamp-hash conformance idea actually enforce invariant 6?
5. **The packaging conviction** (owner: knowledge-curation layer → `packages/`, agent-tools a thin
   CLI) and its nuance (pr-watch / hook-policy / commit-queue / collaboration-state / validators stay
   operational) — is the seam right?
6. **The graph dimension** — graph emission as an optional downstream renderer; is the boundary
   between pipeline / construction-layer / substrate drawn correctly?
7. **The ten open questions** (report §Open questions) — are they the right Phase 0 agenda, or is
   something missing?

### 5. Verify the owner observations were captured faithfully

Two owner statements (2026-07-03), marked `[O]`: the candidate goal (a general document →
knowledge-graph pipeline) and the stronger conviction (the tooling has become a
knowledge-curation-and-expression layer belonging in `packages/` along seams, agent-tools a thin
CLI, open to other approaches). Check the report, plan, and memory represent these as the owner
meant — a destination, not a path; gated on the second consumer + the topology decision + the WS0
fork. If the prior session diluted or over-committed them, that is a defect to surface.

### 6. Output and forward action

Report a verdict to the owner: which conclusions are sound, which need revision (with the specific
evidence), and any gap. **If the review confirms the work**, the forward action is the owner-scheduled
fresh-seat **Phase 0 design session** (the strategic plan's promotion trigger), which ratifies
identity + the five-layer decomposition + D1–D6 + the regime registry + the quorum-diversity
disposition, and **absorbs the salvage plan's ws2 readiness review**. Independent of all this and not
to be blocked by it: ADR-200 WS2/WS4, and the salvage plan's ws1b rescued-knowledge disposition pass.

### Operator discipline (unchanged)

Never `--no-verify` without fresh per-commit owner authorisation; use the commit skill's ceremony;
the `machine-local-path` and `no-hedging-vocabulary` write-hooks are live (the prior session hit
both — expect indefinite-deferral words and `/Users/<user>` paths to be blocked, and reappraise
rather than synonym-swap); the commit-queue spawned-commit workflow dies at the documented
depcruise→turbo truncation, so fall back to a direct `git commit -F <msgfile>` with output redirected,
then `complete` the intent and close the claim manually.
