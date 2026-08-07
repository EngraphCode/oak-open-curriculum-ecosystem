---
id: longitudinal-napkin-synthesis-2026-08
node_type: delivery
name: Longitudinal napkin synthesis (step 6a, 2026-08 window)
overview: >-
  Run the consolidate-docs step-6a archive-scale synthesis over the 37-napkin
  window since the 2026-05-29 marker on the as-built corpus-analysis engine,
  and conserve every finding.
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: outcome-informed-practice-learning
impact_areas:
  - practice-and-estate
tickets: []
depends_on: []
owner_gates:
  - awaiting: owner-decision
    clears_when: >-
      Owner authorises the validate-stage token ceiling at launch, priced from
      the launch preflight's candidate projection (the pre-spend gate the
      tooling hard-aborts on).
    expires: 2026-08-10
last_updated: 2026-08-07
---

# Longitudinal napkin synthesis (step 6a, 2026-08 window)

## Goal

The napkin archive since the 2026-05-29 synthesis marker — 37 files spanning
the estate's three regime changes (June solo→team comms substrate, July
fleet/coordination-branch era, hardened August practice) — has been read as one
historical corpus and synthesised into a marker-ledger report
(`historical-napkin-synthesis-YYYY-MM-DD.md` under
`.agent/research/agentic-engineering/continuity-memory-and-knowledge-flow/`),
with every finding dispositioned and conserved into permanent homes. What the
archive knows that no individual rotation could have known is durable doctrine,
not archive residue. Owner agreement for the pass: 2026-08-07 (brief homed in
`napkin.md` §"Next-session brief", commit `4ded82566`).

## Mechanism

One dedicated-knowledge-curation seat (Director-routed, own worktree) drives
the four checkpointed stages of the corpus-analysis engine
(`agent-tools/src/corpus-analysis/`): map → reduce → validate → meta, each
stage committed as a checkpoint before the next, then the deterministic
post-run driver recomputes every disposition and the findings route through
the `consolidate-docs` step-6a report contract into the ordinary graduation
destinations (`consolidate-until-done` frame for the conservation hand-off).

Fleet topology (deliberate, from the 2026-08-07 reflection): a single seat is
the right shape — the stages are sequential, the harness workflow already
fans out inside each stage (mappers in parallel, adversary voters in
parallel), and the committed checkpoints make any failure a resume, never a
re-spend. Model tiers follow the estate gradient: economy-tier mapper legs,
high-tier reduce/validate/meta judge legs (the adversary-voter design is the
frame-challenger). No separate verifier seat: the deterministic post-run
driver is the independent check by construction (it recomputes dispositions
by replaying adjudication; integrity violations must be empty).

## Adopted amendments (owner-directed 2026-08-07: "adopt all")

1. **Partition re-derived from the live corpus at launch** — never a frozen
   window list — **with seams aligned to the two regime boundaries** (June
   team-substrate start; July fleet/coordination-branch start), so no mapper
   window straddles a regime change. Falsifier: if the token-balanced
   greedy-walk partitioner cannot take seam hints, pre-split the corpus into
   the three regime segments and partition within each.
2. **Prior-run dedup before validate dispatch**: candidates overlapping the
   2026-07-01/02 discovery run's adjudicated set (the June overlap of this
   window) are checked against banked verdicts and deduplicated, not
   re-adjudicated blind.
3. **First-hand recompute only**: recall and dispositions enter the report
   from the deterministic post-run driver's replay, never from a stage's
   self-reported aggregate (the v1 proving run's meta-defect precedent).
4. **Explicit marker-chain statement** in the report: the ledger runs
   2026-05-09 → 2026-05-13 → 2026-05-29 → this pass; the 2026-05-31
   longitudinal review sits outside the marker ledger by filename contract.
   The processed marker is set per step 6a.
5. **Launch proportionality pass**: the running seat sizes the validate
   ceiling from the preflight's candidate projection (probe-calibrated
   voters-per-candidate arithmetic) before the owner gate clears — the July
   run's calibration failure is the named risk this prices.

## Acceptance criteria (each with a proof)

- The synthesis report exists at the step-6a home carrying all seven contract
  sections (corpus window, selection rationale, processed marker, emergent
  findings, evidence arcs, rejected near-patterns, routing decisions) plus
  the amendment-4 marker-chain statement. Proof `repo-safe`: the committed
  report checked against the step-6a section list; `pnpm check:docs` green.
- All four stage checkpoints and the post-run driver output are committed,
  with map coverage complete (zero zero-leaf windows — a partial map cannot
  seed reduce, structurally) and recall-integrity violations empty. Proof
  `repo-safe`: the committed checkpoint artefacts and the driver's own
  integrity output.
- Every kept or rerouted candidate carries a conservation disposition
  (`graduated` / `rejected` / `duplicate` / counted decision-debt), recorded
  in the committed conservation buffer with per-candidate routing. Proof
  `repo-safe`: the committed buffer table; register deltas in the same
  commits.
- The napkin-archive sources are unmodified by the pass (evidence, never
  rewritten). Proof `repo-safe`: `git status` clean over
  `.agent/memory/active/archive/` at close.

## Todos

- Mint the thin MCP-team Linear ticket at pickup and link it here before
  ratification (execution state lives there).
- Launch preflight: re-derive the seam-aligned partition, project the
  candidate count, set the validate ceiling, surface it for the owner gate.
- Run map → reduce → validate → meta with checkpoint commits (single-story
  PRs / coordination-branch doc commits per the estate's landing rules).
- Post-run driver, synthesis report, processed marker, conservation hand-off.

## Out of scope

- Rewriting or editing archived napkins — step 6a names them evidence.
- Engine code changes — the grain and longitudinal refinements are as-built
  (discovery-run plan, all steps done); further tuning is a separate lane
  informed by this run's recall data, not a precondition.
- The comms-event corpus — a different corpus under a paused processing
  boundary this plan does not touch.
