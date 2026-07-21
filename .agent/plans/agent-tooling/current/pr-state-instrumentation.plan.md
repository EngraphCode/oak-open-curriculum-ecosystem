---
lineage:
  serves_thread: agentic-engineering-enhancements
  serves_stream: agent-tooling
  derives_from:
    - PDR-131 (merge concurrency free; quality binds at settled-READY)
    - PDR-132 (changeset health; round budgets bind at authoring time)
    - pr-lifecycle SKILL §review-round state machine + §silent-wait sweeps
---

# PR-state instrumentation — one verified instrument instead of per-seat bash

Owner-commissioned 2026-07-21 ("let's use these to improve our tooling
around PRs") after the 2026-07-20/21 net-to-zero drive.

## End goal

Any seat answers "what state is this PR actually in, and is anything
silently stuck?" with one command whose verdict is computed, validated,
and tested — and watches PRs through events, not hand-rolled polling.

## Mechanism

The drive's evidence: six bespoke bash monitors were hand-rolled in one
night, three carried distinct script defects (SHA-prefix reconstruction,
a zsh readonly-parameter collision, unguarded grep exits), and every
silent-wait miss of the night (armed-behind-red, reviewer-unrequested,
review-run-never-started, quota-bounce-read-as-review) was a state no
ad-hoc read modelled. The pr-lifecycle state machine already SPECIFIES
the compound read and its legs; making it executable code removes the
per-seat reimplementation generator entirely — the same fix-the-generator
move PDR-132 legislates for review rounds.

Verified vendor shapes (2026-07-21, first-hand): `gh agent-task list
--json id,name,createdAt,completedAt` (no PR number in list);
`gh agent-task view <session-id> --json` adds
`pullRequestNumber/State/Title` (the PR-number positional is
interactive-only, so run→PR mapping goes view-per-session-id);
`completedAt` null means the review run is in flight; a quota bounce
arrives as a completed review whose body is a quota notice, not a review.

## Means — PR-shaped execution units (PDR-132 item 8; each code-class, round-budgeted)

1. **D1 — `agent-tools pr state <n>`** (one PR-shaped unit): the compound
   read (tip, `mergeStateStatus`, checks rollup, unresolved threads,
   per-reviewer tip binding, review requests, auto-merge intent, agent-task
   run liveness) → one typed verdict from a closed state set:
   `SETTLE-READY | SETTLING-QUIET-WINDOW | WAITING-REVIEW-RUN-LIVE |
   SILENT-WAIT-NO-REVIEWER | SILENT-WAIT-RUN-DEAD | CHECKS-RUNNING |
   CHECKS-RED | THREADS-OPEN | ARMED-BEHIND-RED | QUOTA-SKIPPED | MERGED |
   CLOSED | CONFLICT-DIRTY` (trued at D1 r1, 2026-07-21: `CLOSED` is the
   typed refusal for closed-unmerged PRs; `SETTLING-QUIET-WINDOW` withholds
   settlement inside the SKILL item-4 async-lag window). Zod
   validation at every gh boundary; TDD pair per testing-strategy; JSON
   and single-line outputs. If authoring exceeds the PDR-132 size smells,
   the states module and the CLI wrapper split into two PRs at that
   moment, not at review round three.
2. **D2 — `agent-tools pr watch <n...>`**: loop wrapper over D1 emitting
   only state TRANSITIONS (Monitor-friendly lines), with
   `--until <state>` and `--emit-json`; replaces every hand-rolled settle
   watch. Consumes D1's module; breaks visibly if D1's verdict set drifts.
3. **D3 — register wiring**: per-PR final commits, review threads, and a
   diff-path class label appended to the pr-throughput register row
   (the named follow-ups from PDR-132's falsifier and #448's review),
   plus opening-commit capture at `pr state` first sight of a PR.

## Acceptance criteria

- D1: for a live PR, the verdict matches a hand-verified compound read;
  each silent-wait class from 2026-07-20/21 has a regression fixture that
  yields its named state (an armed intent behind a red check can never
  read healthy); a quota-bounce body never reads as a SATISFIED reviewer
  leg — it settles the leg as SKIPPED per the pr-lifecycle SKILL's
  scope-declared-marker clause (owner ruling 2026-07-21), and a
  settled-with-quota-skip round reads `QUOTA-SKIPPED`, never a silent
  `SETTLE-READY`.
- D2: a scripted state change (thread resolve, check completion) emits
  exactly one transition line; quiet states emit nothing.
- D3: a merged PR's register row carries commits, threads, and class;
  the PDR-132 falsifier's one-month read runs from the register alone.

## Prerequisites

- Blocking: none. D3 beneficial-prereq: PR #448 (register) landed —
  minimum shape without it: emit the same row as JSON to stdout.

## Non-goals

- No mutation in v1: the instrument reads and reports; arming, merging,
  and reviewer-request mutations stay with the pr-lifecycle skill's
  explicit human-authorised boundary.
- No re-specification of the state machine: the SKILL stays canonical;
  this tool executes it and links back.
