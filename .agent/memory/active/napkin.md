---
fitness_line_target: 220
fitness_line_limit: 300
fitness_char_limit: 18000
fitness_line_length: 100
drain_strategy: "Extract settled entries to permanent docs, PDRs, rules, or archived napkins"
merge_class: append-only-narrative
fitness_content_role: drainable-buffer
---

# Napkin

Current-session observations. Append below. Rotate when over ~400 lines (`consolidate-docs`
step 6): extract every behaviour-changing entry, merge into `distilled.md` or graduate to a
permanent home, verify the home, then archive and start fresh.

## Napkin rotated (2026-06-28 dedicated consolidation, Clover lifts Root)

Rotated at a goal-gated dedicated-consolidation session. The processed window (the 2026-06-26 →
2026-06-28 entries — Sonar idiom-rule tranching, tests-prove-behaviour, cross-worktree
fragmentation, the #259/#260 memory-reconciliation arc, n=2 shared-tree commit hazards, and the
docs-reviewer-split) is preserved verbatim in
`archive/napkin-2026-06-28-clover-consolidation.md` (tracked, byte-identical). Every
behaviour-changing entry was dispositioned first-hand against its home before the archive-move.
As in prior rotations the substrate was mature: most entries were worked instances of live
patterns/rules/frictions (`shared-state-topology-is-a-coordinator-question`,
`fluency-is-a-failure-vector`, `governance-claim-needs-a-scanner`, `cross-lane-commit-blocking`,
`wrapped-exit-codes-false-green`, `whole-tree-gate-red-on-untouched-files`, `worktree-hygiene`,
F-98/F-101/F-102/F-103). The genuinely-new doctrine graduated **on first instance** (owner
direction: promote and trust the Practice to invalidate a wrong promotion through experience):
the owner-sharpened tests-prove-behaviour six-screen + firewall-is-review rule →
`testing-strategy.md §Rules`; schema-as-SSOT-for-vendor-surfaces → a new `patterns/` file; the
mechanical lossless-reconciliation proof (set-diff + merge-base-diff) → the `semantic-merge`
skill §Verify; the new-eslint-rules warn-vs-error boundary, the re-litigation and
supersession-vs-sequencing facets, and the fresh-worktree Playwright-browser step → per-user
memories; and the F-95 watcher-gate false-negative → F-104. `distilled` and `pending-graduations`
are empty. The commits and the homes are the record of where each piece went.

New session observations append below.

## 2026-06-28 — runbook kind defined; n=2 shared-checkout operational lessons (Clover lifts Root, deep closeout)

Session arc (all committed to `coordination/team-tooling-session-2026-06-28`, n=2 with Beluga rides
Wave): dedicated consolidation (napkin drained, doctrine graduated, **#267 merged to main**);
repo-continuity curated 575→308 (role-drift cure); open-questions driven to zero (Q-009/Q-011
user-granted keep-open) + the drive-to-zero directive homed; **runbook defined as a content kind
(PDR-120)** + host wiring + Runbook Index + discoverability cross-links.

- **A recurring procedure forced into a `current/` plan is a taxonomy-gap tell, not a storage
  problem.** My repo-continuity-curation "plan" was really a runbook (a procedure that RECURS) wearing
  a plan's clothes (a plan COMPLETES). The owner caught it and asked the substrate question; the cure
  (PDR-120) defines "runbook" as a content kind delivered via skills/reference-docs/rule-embedding by
  the skill-load-budget triage — NOT a new surface (a new invocable surface would re-open the retired
  parallel-command decision). The mis-shaped plan was created then dissolved within the session (loop
  closed; the runbook re-homed into `continuity-practice` §Disposition, the rule it enacts). Tell:
  procedure-that-recurs inside artefact-that-completes ⇒ ask lens-4 "would the system changing dissolve
  it?" Sibling: [[feedback_design_from_the_substrate_not_the_instance]], PDR-120.
- **Shared-checkout (co-resident, n=2) format hazard: `pnpm format:root` is whole-tree and would
  clobber a peer's live uncommitted WIP.** Pre-commit prettier-staged flagged 2 of my files; the
  canonical fix `format:root` would have reformatted Beluga's dirty plan files too (forbidden). Cure:
  scope the format to your own files (`pnpm exec prettier --write <my-files>`), confirm the peer's files
  unchanged, re-stage. The repo-scripts-over-npx preference yields to don't-touch-peer-WIP when the repo
  script is whole-tree on a shared checkout. Candidate friction (F-83 family). Sibling:
  [[feedback_no_underscore_rename_unused]]-adjacent discipline, cross-lane-commit-blocking.
- **File-changed-under-me on a shared branch: re-read, don't trust memory.** repo-continuity grew +14
  lines mid-turn via Beluga's commit; a line-number mismatch between two reads at the same offset caught
  it before a large edit. On a co-resident shared checkout the working tree moves under you — re-read
  fresh before a big rewrite. Sibling: [[verify-dont-trust]].
- **n=2 serialized commit window worked cleanly** — ARC + canonical ping-before-window; whoever is
  mid-flight commits first to a gate-green HEAD, pings closed, the peer commits on a clean tree (F-83
  full-tree pre-commit gate is why serialization is needed). Two clean exchanges this session.
- **Critically-assessing the subagent overrode its disposition.** The mixed-concern sweep recommended
  extracting the curation runbook to a new `docs/` file; PDR-120 #3 says embed it in the rule it enacts
  (fragmenting doctrine from enactment is the anti-pattern). A plausible subagent suggestion was wrong;
  the owner's standing "critically assess subagent results" caught it. Sibling: [[verify-dont-trust]].
