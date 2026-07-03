<!-- User scratchpad: a starting statement for the fresh-seat ws1b rescued-knowledge
consolidation session. Not doctrine; a pasteable opener. -->

> **CONSUMED + SUPERSEDED (2026-07-03).** ws1b was executed (all 59 A–D entries
> dispositioned; commit `1cfbb4e10`). Do not paste this opener again. Two of its
> statements were later corrected: the commit-workflow guidance (F-112 is FIXED
> at `b2ae96898`; the queue workflow is the working path) and the "tier E is
> OUT of scope / the owner's manual round" framing (never owner-ratified;
> withdrawn 2026-07-03). The live successor opener is
> [`rescued-knowledge-full-processing-session.md`](rescued-knowledge-full-processing-session.md).

# ws1b Rescued-Knowledge Consolidation — Session Opener

## Paste this

/oak-consolidate-until-done

You are opening a **dedicated knowledge-curation session**. The goal is **ws1b of
`.agent/plans/agentic-engineering-enhancements/current/corpus-analysis-salvage-and-topology-redesign.plan.md`**:
disposition every entry of the 2026-07-02 discovery-run rescue set into its canonical home, via
`consolidate-until-done` with `consolidate-docs` §Discovery-Run Rescue Sets governing the
mechanics. This is disposition of recovered knowledge, not execution of the generalisation plan —
do not build, do not reshape Phase-0-gated design, never re-run the 2026-07-02 validate.

### Ground (verify first-hand, do not skip)

Stay on branch `feat/corpus_research_enhancements` (expect a clean tree, HEAD at or after
`663ea0bde` — the commit that added this opener) — it
carries the review-corrected continuity surfaces; do not ground on `main`'s stale wordings. The
comms-residual work-list correction matters if you touch comms curation: the residual lives in
git at `255117a43^`, not on live disk (removal unexplained — see the review report, R1).
Registries: `.agent/state/collaboration/active-claims.json` should show zero claims, zero queue.
Register on comms, open your claim, then work.

### The intake (plan-carried work-list; the todo is the contract)

- Report: `.agent/reports/agentic-engineering/large-corpus-analysis-tooling/discovery-run-salvage-report-2026-07-02.md`
- Tier table: `.agent/reports/agentic-engineering/large-corpus-analysis-tooling/data/discovery-run-salvage-tiers-2026-07-02.json`
- The ws1b todo carries the evidence-tiered order — **D (18 proven-real false kills, routing
  hints in `namingBaselineIds`) → C (15 non-D cross-regime rescues, judged against existing
  homes) → B (8 uncorroborated keeps as novel candidates; check partial homes first) → A (18
  corroborated re-finds: verify-and-enrich the `corroboratedBy` homes)** — plus per-tier
  disposition shapes. Tier E (187 ranked kills) is the owner's manual round: OUT of scope.

Three nuances from the corpus-generalisation review/research (2026-07-03), applied here:

1. **Temporal qualifier on recurrence**: an instance is fires-despite-home (PDR-098) evidence
   only if it post-dates the home's landing — relevant when routing C183/C184 to the
   action-time-structural-interrupt lane.
2. **Novelty is unmeasured**: "no corroborating home" was never recall-calibrated, so treat tier
   B's "genuinely novel" as a claim to check (partial homes first — already in the todo).
3. **A pure tier-A re-find is a duplicate disposition** confirming pipeline recall — record it as
   that, not as a new graduation.

### Also in this pass (the buffers-empty contract)

The live napkin carries the 2026-07-03 window (the review session's method lessons; the Sardine
commit-ceremony tool feedback) — disposition it as part of the same pass. One flagged assessment
falls due here: the napkin's 2026-07-02 entry asks the next consolidation pass to decide whether
the always-on rule surface needs an explicit **critically-assess-subagent-output clause** (ninth
owner reinforcement) or whether the reinforcements are normal emphasis — decide it, with reasons.

### Done and discipline

Done = all 59 A–D entries dispositioned (graduated / enriched / duplicate / rejected-with-reason),
buffers empty or explicitly owner-gated, the ws1b todo completed, closeout reporting value and
impact, never accounting. Conserve-by-default throughout (PDR-122): rejection needs a named
reason; when in doubt, hold for review rather than drop. Operator notes: the spawned commit-queue
`commit` workflow is BROKEN from Claude Code sessions (F-112, frictions register; the
depcruise→turbo stream truncation) — per the owner directive 2026-07-03 ("no fallbacks, ever —
do it properly or error") its failure is an ERROR to stop on and surface, never a trigger for a
direct-`git commit` equivalent route; check F-112's status and the commit skill's current
guidance before your first commit. zsh does not word-split unquoted variables (use arrays or
explicit arguments); never `--no-verify`.
