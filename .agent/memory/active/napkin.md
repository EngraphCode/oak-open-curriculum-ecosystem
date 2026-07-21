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

## 2026-07-20 — Tornado tracks Apex (daace4): Forge-tenure Layer-3 fold (Director succession, owed at first write moment)

Folded verbatim-in-substance from Forge rides Brimstone's full handoff record
(`handoffs/2026-07-20-forge-director-full-handoff.md` Layer 3) at the successor's
first natural write moment, per the record's owed-items sweep:

- **READY+settled merges ahead of granted-but-unsettled** (the #431/#413 and
  #438-yields resequences) — now subsumed by PDR-131; instance conserved.
- **`--body-file` for every comms send; AND >1500-char bodies fail exit-2 silently
  under pipes** (Herring's find) — check send exits in-band. (F-149 recurrence class.)
- **The comms content-validator rejects indefinite-holding-state phrasing** — name the
  gate (Quoll's standby rewrite worked instance).
- **A "verified absent" grep must test CURRENT vendor vocabulary** (allowBuilds vs
  onlyBuiltDependencies — Forge's Sonar-census blind spot, caught by Copilot).
- **Enqueue/auto-merge intents survive rule removal and fire silently** — disarm
  before removing rules (homed in PDR-131 §6; the 11-wide cascade instance).
- **Worktree-CLI bridging restores transport during primary build outages**; the
  consolidation worktree doubles as the bridge environment.
- **Tag-preservation (annotated tag → delete branch) is archive-not-delete for
  preserve-branches** (#401, s2-canary worked instances; worktree-hygiene home).
- **pnpm-wrapped CLI invocations die at postinstall during source breakage** — direct
  `node dist/...` is the resilient path only while dist+deps are coherent.

Cricket A/B (Forge tenure, toward the flip tally): six divergences adjudicated —
context-supply class ×4, vocabulary-collision ×1 (UNSAFE-redirection),
escalating-evidence-bar ×2. Class cures standing: cite grounding events in every
pair's supplied context; define colliding terms. Cited frames converge (Quoll's
pair proved it). Experiment-verdict question consolidated into Siren's merged pass.

Scrutiny pointer (Forge's external-bound datum, consistent with Galago's lineage
lesson): the tenure's three misses all lived in CONFIDENT UNVERIFIED ASSERTIONS —
point verification effort there first.

Host-coordinate conservation (de-hosted from the portable incoming note per
practice-core-portability at PR #434 r3): **Linear AIP-142** is the exchange ticket
for the Resonance wrap-family import (`practice-core/incoming/
resonance-wrap-skill-import-2026-07-20.md`); the import's Director-handoff pointer
was Galago's full handoff record §Import. These coordinates now live ONLY host-side
(here + the Director records).

## 2026-07-21 — Tornado tracks Apex (daace4): Director-tenure wrap fold (evening drive, owner away)

Cricket A/B: one further divergent pair (Foehn, #450 r1 verdict routing) — sonnet
ON-TRACK / haiku DRIFTING, context-supply class; cure applied by inlining the PDR
passages in the routing event. Tally: the class cure (cite + inline grounding)
continues to convert divergence to convergence.

Worked instances conserved (each first-hand this tenure):

- **Armed-behind-red is invisible-stuck** (#439): an armed auto-merge behind a red
  check progresses nothing and alerts nobody; board sweeps must read CHECK state,
  not arm state. Caught by the belief's own author on fresh recheck — the
  confident-unverified-assertion class again.
- **Ruling-consequence propagation must be claim-scoped, not diff-scoped** (#450 r2:
  five findings, one generator — the reclassification was applied to the diff but
  not to every surface repeating the old claim). Cure class: sweep every surface
  carrying the reclassified claim in ONE batch.
- **The step-back tripwire fired and HELD** (#450 r5: fifth distinct finding-class in
  five rounds → halt, owner-gate, decision matrix conserved) — the 5-minute-cure
  temptation at the tripwire is the exact impulse the tripwire exists to refuse;
  upholding one's own binding ruling against a cheap-looking exception is the
  no-escape-hatches doctrine executing.
- **gh-token invalidation masquerades as rate-limiting**: anonymous-tier limits
  (limit:60) after a 401 are the signature — `gh auth status` is the discriminator;
  never diagnose "quota exhausted" from 403s alone. Fleet cure: stop polling, keep
  SSH-git/local work, owner card for the interactive re-auth.
- **Notification-batch time distortion**: a Director reading batched monitor events
  drifts AHEAD of the wall clock and can manufacture false silence windows — the
  tool-computed UTC check (date -u + created_at deltas) caught a false-silence
  escalation before it fired. Hand-computed elapsed time is banned for liveness
  verdicts at this seat, same as hand-computed ages.
- **Heartbeat-autopilot is a seat-level liveness gap**: two peer seats emitted
  perfect ≤4-min heartbeats for 40+ min while their main loops processed nothing
  (no comms absorption, no work artifacts). Process-liveness ≠ delivery-liveness
  now has a SEAT-level instance; the detection is work-evidence (branch tips,
  thread counts) + directed-ping deadlines, never heartbeat presence.
- **Comms content-validator + pipes double-bite**: holding-state phrasing rejected
  (cure: name the gate and the decision inline); a `| tail` swallowed the real
  send exit again — exit-codes-in-band applies to every gated send.

Association-seeds from the owner-invoked exploration/play pass over the day
(seeds, not findings): (1) the evening's three tripwires (step-back, deadline-and-
default, heads-down default) all share one shape — a pre-committed exit that
removes in-the-moment discretion; the estate may want a named "pre-commitment
device" pattern unifying them. (2) Review-round churn on docs PRs behaved like a
reflexive system (each cure surface admits a new finding class) — PDR-132's
authoring-time budgets and the tripwire are two halves of one thermostat; a future
retrospective could measure whether budget-at-authoring reduces tripwire fires.
(3) The false-silence and heartbeat-autopilot instances are duals (observer-side
vs emitter-side liveness illusions) — a single liveness doctrine section could
carry both.
