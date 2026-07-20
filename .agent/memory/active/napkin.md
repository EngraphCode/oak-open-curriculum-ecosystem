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
permanent home, verify the home, then archive and start fresh. Rotation is the preservation
step AFTER processing — never a fitness-relief move or a queue (owner correction, 2026-07-06).

## Napkin rotated (2026-07-20 dedicated consolidation, Siren lifts Trench)

Rotated after full bottom-up processing at the owner-named dedicated consolidation.
The processed window (2026-07-14 Dolphin rotation-marker through the 2026-07-20
AIP-137 net-to-zero merge-drive entries, ~30 seats) is preserved verbatim in
`archive/napkin-2026-07-20.md` (byte-identical, `cmp`-proven). The archive carries
"(union variant)" duplicate blocks from a twice-applied mechanical append union
(Foundry, 2026-07-17) — conserved as-is; the duplication is historical record, and
the fresh restart resolves it for the live surface. Every behaviour-changing item
was read and dispositioned before the archive-move. Headline graduations (the
commits and homes are the record):

- **The closure-over-open-sets generator** (seven review-arc firings, one merge
  drive) → `no-moving-targets-in-permanent-docs` §Authoring-Time Open-Set Clause;
  its reasoning-time face → new PDR-129 (diagnosis reads whole surfaces first;
  failure catalogues are open sets).
- **pr-lifecycle state machine**: settled-round predicate binds GRANTS;
  generator-vs-singleton classification on the step-back arms; the reflexive-loop
  ROI exit (Resonance import); merge-queue enqueue mechanics + armed-intent quirk;
  supervised-watch spin/stuck-state coverage; shared-credential reply signing and
  tally exclusion.
- **New rule** `exit-codes-in-band-never-piped` (six recurrences, five seats; all
  four adapter forms).
- **Absoluteness doctrine pair**: no-escape-hatches (principles §Strict and
  Complete) + a-safety-proof-never-licenses-the-class
  (`never-use-git-to-remove-work`).
- **Five new patterns**: verification-method-must-answer-the-question,
  derived-output-conservation, llm-fleet-task-design-point-and-pilot,
  zod-boundaries-in-sandbox-harness-modules, amending-doctrine-binds-the-editor.
- **Coordination rules**: cut-branch roll-ups + PDR-127 scope
  (`no-parallel-long-lived-branches`); dual-surface heartbeats
  (`liveness-heartbeat-cron`, F-92); watcher cd-repo-root + dormancy cursor-init +
  high-volume drain-deadline evidence (`comms-all-channels-watcher`); annotated-tag
  branch preservation (`worktree-hygiene`); PDR-117 "nothing is 'mine'" amendment.
- **Cricket A/B tally**: the Forge-tenure five-divergence batch, class-cure v2→v4,
  and the flip-decision routing (the report carries the open evidence-bar item).
- **Cross-machine collaboration** reference note (SSH bridge + deterministic-seed
  identity); F-149 (`--body-file` always) in the frictions register; ADR-041
  docs-truth corrections (runtime dependency edge; foundation-libs matrix cell).

Corroborating-instance classes (probe-is-an-execution, cwd drift F-125,
capture-full-output, classifier terrain maps, treadmill mechanics superseded by the
merge queue) were confirmed already-homed and rest in the archive.

## New session observations append below.

## 2026-07-20 — Siren lifts Trench (af11f9): Eagle wrap-record fold (Director-routed input, post-rotation)

Folded from the Eagle herds Cirrus (055d36) hub-lane wrap record at the Director's
word, after this pass's rotation. Items 2/3/5/8 of its Layer 3 are confirmed
instances of already-graduated classes (metadata-staleness → volatile-value/
moving-target doctrine; exit-codes-in-band rule; merge-queue mechanics in
pr-lifecycle). Genuinely new captures, conserved here for the next pass's routing:

- **CI test-merge parity class**: PR CI runs on the test-merge with CURRENT main,
  so a mid-round main landing that moves a mirrored asset (kit file vs a tracked
  public/ copy) reds a parity test with no push of yours. Cure: fold main + refresh
  the copy byte-identically in one push. Any lane carrying a tracked parity copy
  inherits this class.
- **Server-side `gh pr update-branch` leaves the local worktree behind**: the merge
  commit exists only on the remote; commit-then-push from the stale local is
  rejected non-FF. `git merge origin/<branch>` before pushing post-update work.
- **Prettier must run with the worktree as cwd** — a root-anchored relative path
  from a reset shell cwd silently formats the wrong checkout (one pre-commit red).
- `GID` is a zsh READONLY integer parameter — assigning a uuid to it fails as
  "bad math expression"; never use it as a shell variable name.

## 2026-07-20 — Siren lifts Trench (af11f9): retrospective tail (play seed)

- Play seed (from the consolidation retrospective's free-play harvest, association not
  finding): an instrument that filters out a signal class will someday be asked about
  exactly that class — the seat's heartbeat-filtered watcher was briefly blind to the one
  question that arose (a liveness read), cured by a direct stream read. Rides here for a
  future pass; no action proposed.

## 2026-07-20 — Siren lifts Trench (af11f9): wrap #2 (retrospective tail close)

Session-close capture for the owner-commissioned retrospective tail. Landed: the
retrospective record + three enacted fast-lane proposals on PR #450 (branch pushed,
ref-verified). Loss scan: proposal 4 (the single-owner-interface stall class) routed to
the Director via the closeout broadcast, deliberately unlegislated; PR #450's
rounds-first shepherding transfers to the Director's drain tail per the owner's
session-end word — the branch is pushed and on a PR, so the work is safe at every
outcome. Metaloss: the scan's one structural bound is unchanged from wrap #1 (watcher
blind windows during drain deaths; mitigated by seen-file cursor + Director sweeps); a
further pass would only re-find it — the recursion closes at that named point. Surprise
worth one line: the estate's loop latency is now short enough that this session imported
a skill, ran it live, was retrospected under it, and amended its neighbours — same day.

## 2026-07-20 — Deimos tracks Perigee (73e4ab): fresh-checkout collaboration-substrate frictions

Owner named this session "a good opportunity to improve the fresh checkout experience";
these are the first-hand observations from bootstrapping start-right-team on a fresh clone
(install/build already done; tree clean on main @ SHA:b58d42e12):

- **`comms send` hard-fails ENOENT on a fresh checkout** — it unconditionally reads
  `.agent/state/collaboration/active-claims.json` (cli-comms-send.ts hardcodes the path),
  which is untracked-by-design (ADR-199/PDR-094) and therefore absent on every fresh
  clone/worktree. First team-start broadcast on a fresh checkout is guaranteed to die.
  Workaround applied: hand-seed the minimal registry
  `{"schema_version":"1.3.0","claims":[],"commit_queue":[]}` (shape from
  state-parsers.ts). Cure candidates: treat missing registry as empty, or a
  `collaboration-state init`/`check --seed` step in start-right, or seed from the
  SessionStart hook. Candidate frictions-register entry.
- **`comms/` and `comms-seen/` do not exist on a fresh checkout** and the CLI does not
  create `comms-seen/` (documented in comms-all-channels-watcher §Seen-file convention:
  appendFile fails silently → watcher re-emits everything). `mkdir -p` both before arming;
  same seeding-step cure would cover it.
- **Ergonomic inconsistency**: `comms send` defaults `--comms-dir` (and resolves
  `--active` itself) while `comms inbox` requires `--comms-dir`/`--seen-file` explicitly.
  Minor, but a fresh-checkout agent following the rule text hits the usage error first.
- **What worked well**: agent-tools dist present on fresh checkout meant every CLI call
  worked without a build step; identity preflight + assert-watcher-live both green
  first-try; the watcher heartbeat/assert loop is a solid fresh-checkout experience.
