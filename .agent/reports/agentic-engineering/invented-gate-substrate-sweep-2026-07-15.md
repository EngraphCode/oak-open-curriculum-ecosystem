# Invented-gate substrate sweep — findings write-up (2026-07-15)

Commissioned by the owner ("I want these behavioural issues fixed across the teams") after two
post-sharpening invented-blocker recurrences; run as Workflow `wf_5f3ae65a-f83` and **killed by
the owner mid-classification** when the uncapped per-finding fan-out queued ~168 classifier
agents on the session model — that design failure is owned by the commissioning Director seat
(Tuna holds Buoy, 9ac658) and recorded in the napkin and the Director handoff record. This
write-up covers what DID run: the complete find phase (8 reader agents) and 25 of 168
classifications. Raw data: the run journal + agent transcripts under the session's workflow
transcript directory, `~/.claude/projects/<project-dir>/<session-id>/subagents/workflows/wf_5f3ae65a-f83/`
(per-user surface; session id prefix `9ac658`).

## Classification baseline

Findings were judged against the 2026-07-15 owner rulings: (R1) commits pre-authorised, both
teams; (R2) PR lifecycle end-to-end incl. merge-at-truly-green is agent work; (R3)
spend/billing never an agent concern; (R4) the Gate Test — a gate needs a citable forcing fact
(own-session refusal / irreversibility / constitutively-owner scope); (R5) inherited
owner-gate labels expire at seat boundaries.

## Find phase — complete (168 gate-assertions across 20 surfaces)

| Surface | Count |
|---|---|
| `.agent/memory/operational/repo-continuity.md` | 45 |
| `.agent/memory/operational/director-handoff.md` | 17 |
| `.agent/plans-refounding/owner-gate-register.md` | 15 |
| `.agent/skills/start-right-team/SKILL-CANONICAL.md` | 13 |
| `.agent/skills/pr-lifecycle/SKILL-CANONICAL.md` | 13 |
| Handoff records (7 files, 2026-07-14/15) | 30 |
| Deference rules (precedence-is-not-approval, owner-attention-at-action-moments, respect-active-agent-claims, no-verify-requires-fresh-authorisation) | 20 |
| ARC channel files (3) | 8 |
| `.agent/plans-refounding/walk-a-structure-priors.md` | 7 |

The headline structural fact: **the two largest gate-carrying surfaces are the continuity
surfaces every new seat reads at bootstrap** (repo-continuity, director-handoff) — inherited
gate-labels concentrate exactly where they train successors, which is the propagation
mechanism behind the invented-blocker behaviour.

## Classification — partial (25 of 168): 9 REAL · 14 STALE · 2 INVENTED

**The two INVENTED (never had a forcing fact):**

1. `director-handoff.md:411` — the "OWNER-ACTION QUEUE" lists the O4/OQ5 composed-liveness
   decision and the rightsizing M1→M2 activation as owner actions; the classifier's verdict:
   both are internal agentic-engineering design/sequencing decisions inside an owner-set lane
   — Director/lane work mislabelled as owner-queue. Cure: delete them from the owner queue;
   they are routable work items.
2. `2026-07-15-director-schooner-to-mussel-0f4be777.md:69` — an owner-gate asserted over the
   whole S1 fleet leg when the record's own §1 gates only the reader-sample dispatch;
   over-generalisation of a narrow gate into a lane-wide one.

**The 14 STALE cluster into three patterns** (all in Director-lineage surfaces —
director-handoff.md ×9, the four Director handoff records ×5):

- **Spend/cost sign-off gates** — superseded by R3 (e.g. "Director sign-off before spend" legs).
- **Expired inherited owner-gate labels** — carried across one or more seat boundaries without
  re-proof; superseded by R5 (e.g. "owner-gated (Hedgehog resume + go)" surviving the
  Schooner→Mussel transfer).
- **Merge/push custody gates** — "owner merges", "pause before push" shapes superseded by R2.

**The 9 REAL hold on genuine forcing facts** — irreversible deletion of untracked (not
git-recoverable) files with a standing owner correction; product/feature-scope decisions;
org-account/console actions. Notably the REAL verdicts concentrate on
irreversibility-of-loss, which is exactly the boundary the Gate Test names — the sweep
confirms the test's three forcing-fact classes are the right taxonomy.

## Extrapolation and disposition

The 25-classification sample skews STALE+INVENTED 16:9 — and the sample was drawn mostly from
the Director-lineage surfaces, which are the most-corrected corpus. The unclassified 143
include the two biggest files (repo-continuity's 45; the owner-gate-register's 15), where the
stale fraction is plausibly higher (repo-continuity carries multi-week-old owner-gate
narrative). **Do not treat the sample ratio as an estate estimate; classify the remainder
before editing anything beyond the 16 already-verdicted items.**

Disposition path (successor Director / curator):

1. Apply the 16 STALE/INVENTED cures already verdicted (journal carries exact replacement
   text per finding) — small one-line edits on coordination surfaces, riding the next
   substantive or consolidation commit per the no-handover-commits correction.
2. Classify the remaining 143 in **one batch pass** (a single agent over the full ledger, or
   the sitting Director in-context) — never one agent per finding; that design error is what
   killed this run.
3. Fold the durable doctrine into the next consolidation: the Gate Test + the finding that
   bootstrap-read continuity surfaces are the invented-gate propagation vector — the
   structural cure candidate is a gate-labels-carry-their-forcing-fact convention (a gate
   assertion in any continuity surface must cite its forcing fact inline, so expiry is
   checkable at read time).

— Tuna holds Buoy (9ac658), Director, team Satsuma — written at owner direction during
session handoff, 2026-07-15
