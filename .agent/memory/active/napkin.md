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

## 2026-06-28 — MCP orientation-discoverability + planning-vocabulary arc (Clover mends Hedgerow, closeout)

Session arc: read-only review of the under-the-hood work → verified the reframe DONE (W1–W3 merged via #243, true merge not squash, first-hand) → owner reframed the discoverability problem as STRUCTURAL → authored `mcp-tool-taxonomy-and-orientation.plan.md` (decision-incomplete, WS0=architectural review gated on owner go-ahead) → the `generic-foundation-decomposition` programme (index + 8 `programmes:` lineage edges) → ADR-209 + mirroring PDR-121 (planning vocabulary; programme disambiguated from curriculum programme). All authored + on disk; **commit HELD pending Badger seeks Tunnel's window** (n=2, F-83 serialization).

- **Light scan BEFORE deep scan — reframe the questions cheaply before the expensive fan-out.** I launched two deep ultracode workflows before any light scan; the owner stopped both and prescribed light-scan → re-examine-questions → deep-scan. The cheap light read (handlers.ts + mcp-tools.ts + tool-guidance-data.ts) reframed everything — it revealed the two-type registry already exists and that the real defect is three drifting *hand-authored* tool-listing surfaces. Committing a 7-lane deep workflow to still-settling questions is the waste this order prevents. Sibling: [[feedback_ground_state_before_planning]].
- **An index/view POINTS; it does not MODEL. Pre-naming concepts biases a downstream derived graph.** I gave the programme index a "concepts named for extraction" section; the owner corrected — enumerating concepts pre-empts and biases the ADR-200 concept-graph build (which must derive concepts from the plans themselves). A navigation index describes ≤2 areas and points to plans; the concept taxonomy is the graph's to derive, not the index's to assert. Sibling: [[feedback_premature_crystallization]], ADR-200.
- **Malleable-shape stance RECURRED (PDR-098 recurrence evidence).** I framed an existing coupling (the curriculum hint in `universal-tool-shared.ts`) as a possible "make-or-break" blocker; the owner corrected: ask *"what would need to change to make it configurable"*, never *"does the current code permit it."* This is already homed (principles.md §Architectural Excellence / [[feedback_cowpath_anti_pattern]] / [[feedback_design_from_the_substrate_not_the_instance]]) yet recurred despite the home — the passive-guidance-loses-at-the-action-moment signal. Route as recurrence evidence, not a fresh duplicate.
- **Subagent search results need verbatim quote verification; the `speculative/` plan lane is a sweep blind spot.** The Explore agent's plan-search returned 11 real paths but only 7/11 verbatim quotes (1 fabricated, 3 paraphrased), 2 over-inclusions, 1 misclassification, and missed 2 core plans plus the entire `.agent/plans/speculative/` lane (13 docs). Cross-checking each cited quote against the file and sweeping the doctrinal homes recovered them. Sibling: [[feedback_validate_specialist_findings_before_acting]], [[verify-dont-trust]].
- **WS0 method-pointer is ephemeral.** The new plan's WS0 cites a session-scoped workflow-script path (`<session>/workflows/scripts/…`) that will not survive context-end; the method is re-derivable from the plan's lane prose, so this is a convenience-loss only, not substance-loss.
- **REFINE (tooling-friction): the `never-use-git-to-remove-work` hook over-blocks `git restore --staged`.** The hook substring-matches `git restore` and blocks all forms, but `git restore --staged <path>` (alias `-S`) restores only the INDEX from a source (default HEAD) — it unstages, leaving working-tree content and on-disk edits untouched (non-destructive). Only `git restore <path>` and `git restore --worktree` (`-W`) overwrite the working tree (destructive). This session the hook blocked a safe unstage during a shared-index closeout, leaving my files staged with no clean way to unstage. The refinement IS feasible (the flags are parseable): allow `git restore --staged` when `--worktree`/`-W` is absent (index-only); keep blocking `git restore <path>`, `--worktree`, and `--staged --worktree`. Same safe-vs-destructive split applies to `git reset -- <paths>` (unstage, safe) vs `git reset --hard`/`--keep`/`--merge` (destructive). Candidate home: [[hook-policy-substring-discipline]] (parse-don't-substring). Do NOT bypass the hook — refine it.

## 2026-06-28 — completed-plans/good-first-issues retirement; symmetric-HOLD deadlock (Badger seeks Tunnel)

Session arc (n=2 with Clover mends Hedgerow, shared checkout): owner-directed dedicated consolidation — retired the two deprecated files `.agent/plans/completed-plans.md` (harvest-then-retire, no new index, ADR-200-aligned) and `.agent/plans/good-first-issues.md` (dissolved — a cowpath over an empty `good first issue` label with no external contributions; brought nothing into CONTRIBUTING). Reconciled ADR-117 + `templates/README.md` archival doctrine to ADR-200; swept ~21 live references; three reviewers (docs-adr LEGITIMATE, onboarding COHERENT, assumptions SOUND+1) critically assessed; the one finding (a dated experience file asserting the retired index as current) cured with a dated supersession note, not a scrub.

- **EXPLORE (owner-directed): apply CSMA with randomised backoff to agent-coordination defaults — and anywhere peer agents defer to each other.** The symmetric "default to HOLD if no reply" both Badger and Clover posted is a mutual-politeness *deadlock* (no designated mover → tree never clears → neither can ever commit). Liveness needs injected asymmetry. Owner's immediate cure: first-to-commit commits the whole file, other re-edits (cheap-clobber tiebreaker). The deeper design question to explore: where no deterministic tiebreaker (lowest `session_id_prefix`/oldest claim/gatekeeper role) fits, borrow **CSMA/CD randomised exponential backoff** — on collision each agent waits a random interval, re-senses the shared channel (claims/comms/tree state), and retries; symmetry breaks probabilistically. Candidate application points beyond commit windows: claim adoption, who-drains-a-buffer, who-answers-the-owner, who-opens-the-PR, any "after you / no, after you" peer default. Home: [[feedback_symmetric_hold_default_deadlocks]] (per-user memory); this is a Practice design-exploration item, not yet a plan. Sibling: [[feedback_gatekeeper_specialisation]], `fluency-is-a-failure-vector` (I copied the HOLD default without ratifying it).
