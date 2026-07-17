# Team session completion — the four-PR merge arc (2026-07-16)

Compound pair: Mussel rides Coral (6f8857, Director) + Vole hunts Perch (36c6ca,
implementer), with three owner hand-interventions and a rotating cast of tightly-briefed
Opus delegates. Written at session close by the Director; claims verified against the
repo by independent subagents. (Truing 2026-07-17: the promised appended verification
table never landed in this file; the verification outcome is recorded instead in the
Director current-state record's final line — 14 pagination-missed threads found and
dispositioned, two genuine defects extending AIP-126 to 8 items.)

## Outcome

All four open PRs merged to main, fully green, every review thread resolved:

| PR | Content | Merge commit | Executed by |
|---|---|---|---|
| #392 | pr-lifecycle skill + review-round state machine | `SHA:30d20fa71` | agent, recomputed gate |
| #394 | continuity-truth pass + re-homed living plan | `SHA:10527eb53` | owner |
| #389 | reader-sample instrument (adopted orphan) + six hardening classes | `SHA:5a617ba5a` | owner |
| #393 | restatement-audit module (Job 1) | `SHA:9a5bf6bc2` | agent, recomputed gate |

Scale of the arc: ~340 review threads across the four PRs (Vole's measured corpus:
326 at 20:00, more landed after), every one discharged with an evidence-bearing cure,
disposition, or refutation; ~12 hours of active development; two owner hand-merges
cutting non-converging loops; one cross-branch integration break diagnosed and cured
at root.

## The day's diagnostic arc (the part worth re-reading)

The owner's corrections arrived as an escalation ladder, each rung landing after the
team optimised *within* the previous frame instead of questioning the frame:

1. **Batch the rounds** — one push per adjudicated round (cure for push-per-finding).
2. **Disposition-first** — non-defects get evidence + a named lane, never a push.
3. **Fix the generator** — a review round's first move is class analysis over the
   finding corpus; the fix kills the cause, never chases the merge.
4. **Small PRs, short-lived branches, main is where code lives** — the
   `refound-path-resolve` break was the worked instance (its consolidated
   replacement is `flag-path-resolve`): a module deleted
   cross-branch-blind (its only consumers on another unmerged branch) broke main
   integration the moment both merged.
5. **Ticket-first + DORA-tight** — a Linear ticket before work, PR linked to ticket,
   cycle time in hours; a 12-hour/hundreds-of-comments PR is a red flag; arcs live in
   repo plans projected to Linear, never bucket PRs.

Each rung is now a persistent memory (`pr-review-convergence-batch-and-disposition`,
`future-work-items-are-pointers-not-specs`, `small-prs-fix-the-generator-not-the-merge`,
`linear-ticket-first-dora-tight`) and the ladder as a whole routes to the pr-lifecycle
mechanisation lane as the enforcement contract (see the enforcement plan below).

## Process findings with measured evidence (Vole's 326-thread corpus analysis +
Director observations)

- **Reviewer monoculture**: every review round this arc came from ONE machine reviewer
  (Copilot); all other reviewers (Bugbot, Codex, claude) were spend-limited. Every
  merge rode one reviewer + self-attestation.
- **Author-assertion resolution has no re-verify step**: a "Cured in SHA:x" reply once
  shipped a regression (the ENOENT guard) — caught only by the next review round.
- **~23% of all findings were the restatement classes Job 2 exists to catch** — 74
  labelled instances now banked as ground-truth seed for the v2 key battery.
- **Out-of-order review binding is routine**: rounds repeatedly bound superseded tips;
  the state machine's late-arrival amendment case fired several times and held.
- **Prose surfaces never settle by curing**: sealed records and future-work plan items
  re-raise identical findings every round; only dispositions-with-precedent or surface
  shrinkage (cite-not-restate, de-claiming) end the loop.
- **The infra was the flakiest teammate**: the comms watcher drain step died three
  times (60s/120s/300s deadlines) — profiled as a tooling defect, workaround
  seed-from-now; a stale day-old `index.lock` blocked the primary; hook policies
  substring-matched innocent commands three times (`pgrep -fl`, the word "restore" in
  a commit message, `--no-verify` correctly).
- **Instrument blindness at the thread boundary (found by the close-out verification
  subagent)**: every thread ceremony all day queried `reviewThreads(first: 100)`;
  #394 had 134 threads, so its second page — six unresolved threads — was invisible
  to every read, and #393's post-merge composing round landed eight more. The
  "every thread resolved" state was only reached in the close-out's PAGINATED
  Phase 8 pass (14 post-merge dispositions/routings, two new genuine defects added
  to AIP-126). Lesson with teeth: the WS1 merge-readiness checker MUST paginate,
  and any "all N verified" claim needs its instrument's window checked against
  totalCount first.

## Estate produced (beyond the merges)

- Linear tickets **AIP-126** (restatement-audit boundary hardening, six specs) and
  **AIP-127** (continuity landing + primary fast-forward discharge) — the first worked
  instances of ticket-before-work.
- The living plan (`restatement-remediation.plan.md`) now carries a complete,
  machine-enforceable todo dependency graph (module → v2-cycle → fleet-run → cures →
  freeze-recut) with d1 completed.
- The v2-fold input bank: the 74-instance ground-truth corpus, the K5/K7
  replacement-detector gap, the 6M ceiling arithmetic (measured maxima + inclusive
  costs), and the six-raise chunking cast chain.
- Routed estate lanes (each has a named home, none started): pr-lifecycle
  mechanisation additions; comms-watch drain profiling; corpus-analysis CLI help gap;
  the process-spawning-test pair; the README knip-authoring-note drift.

## The critical path from here (owner-named)

AIP-126 and AIP-127 are fresh-session starters. Then the compressed v2 cycle
(F8 fold → gazetteer/key v2 → re-pilot → S3 pilot) → **Job 2 dispatch: the framework
actually runs** → fix-ledger cures + prevention validators → freeze-recut ruling →
the plan sweep → the new plan estate → work starts.

— Mussel rides Coral (6f8857), sitting Director, team Mango, agent under shared
credentials
