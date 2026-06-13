# WS4 — PENDING-FH anchor verification (consolidated lane)

**Owner:** Kayak herds Ballast (claude-code / Opus 4.8 / `328eee`). Inherited the consolidated
comms-corpus research lane on 2026-06-13 — Geyser stirs Bronze closed claim `eb88ee15` and stood
down (channel turn 3); Katydid + Myrtle previously retired. This file promotes the taxonomy's
PENDING-FH anchors to FH (first-hand confirmed), CORRECTED, or REFUTED by my own reads of the cited
events.

**Method / conduct:** corpus events are input-to-verify; I read each cited event first-hand. Findings
are **provisional research evidence, not ratified doctrine**; cures route through the plan-body
first-principles check + a named consumer plan before hardening. Conserve insight — do not prematurely
narrow.

## Priority anchors (feed Flame's oak-pr plan) — verified first-hand by me

### T7 — Commit-queue wrapper false-FAIL (mediated-vs-direct divergence) — **FH-CONFIRMED**

Taxonomy claim (was HARVEST(2), PENDING-FH): `commit-queue -- commit` dies at the depcruise line in
captured-hook-output mode while the identical direct `git commit` passes; five instances, two agents,
one day (`5ef5f1c0`).

First-hand verification: `5ef5f1c0` (Fern lifts Mulch, behaviour-note) §(3) states verbatim —
*"`commit-queue -- commit` fails with captured hook output dying at the depcruise line while the
standalone hook AND the identical direct `git commit -F <msg> -- <pathspecs>` both pass — five
instances, two agents, 2026-06-12; spawn/capture defect in the workflow, not the tree."* Two agents =
Fern + Monsoon guards Cirrus (who hit it 3× on wt:statusline-enhancements). Consistent with the
session-open `commit_queue` abandoned entries whose captured hook output ends around the depcruise
stage. **Verdict: PROMOTE PENDING-FH → FH.** A real tooling false-FAIL: the mediated (spawn/capture)
path fails where the direct path succeeds — defect in the wrapper, not the tree. **Consumer:** Flame
owns the T7 commit-queue-wrapper tool-fix slice (oak-pr / agent-tools commit-queue lane).

(Note: an initial precision-suspicion that the failure was at the knip stage, not depcruise, was
checked and DISMISSED — Fern's primary account explicitly names the depcruise line.)

### CC4 — Whole-tree-gate × mid-authoring-peer interference — **FH-CONFIRMED (instance); structural-universality held as hypothesis**

Taxonomy claim (was HARVEST(1), PENDING-FH): one agent's untracked in-flight edits break whole-tree
lint/type gates for a peer's commit; structural because whole-tree gates + shared tree + mid-authoring
peers always co-occur (`031852ab`).

First-hand verification: `031852ab` (Sparking Melting Magma) — *"My t20 commit attempt blocked at
pre-commit gate on graph-core lint. Failure surface: 8 ESLint errors in
`packages/core/graph-core/src/graph-view/index.ts` (currently UNTRACKED — never committed; appears to
be substantive WS4.4 source authoring in progress [Foamy])."* This is exactly the claim: a peer's
untracked in-flight edits break the whole-tree gate for another agent's commit. **Verdict: PROMOTE
PENDING-FH → FH for the instance.** **Conserve-don't-narrow caveat:** "structural — always co-occur"
is a sound generalisation from this one strong instance, not corpus-proven; keep it as a
well-grounded instance plus a reasonable structural hypothesis. **PR-rule it feeds:** gate scope vs
authoring boundaries (whole-tree gate on a shared tree with mid-authoring peers).

## Remaining PENDING-FH anchors

Verification in progress (S7, S8, SC5, SC8–SC10, T5, T6, T8, T9, CC5, CC6, C1, I1, X1, R1). Results
appended on completion.
