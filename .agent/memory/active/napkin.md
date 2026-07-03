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

## Napkin rotated (2026-07-02 dedicated consolidation, Rosemary stirs Bracken)

Rotated at a goal-gated dedicated-consolidation session. The processed window (2026-06-29 →
2026-07-02: the Falcon arc-closeout tail, Borealis's dedicated pass, the corpus-analysis arc
Wren→Laurel→Linnet→Flare→Tornado→Perseus, the check-encoding sessions Callisto→Limpet, the
statusline session Wyvern, the agent-naming deep-dive Tuna, and the upstream-alignment
closeout
Vanilla) is preserved verbatim in `archive/napkin-2026-07-02-rosemary-consolidation.md`
(byte-identical). Every behaviour-changing entry was dispositioned first-hand before the
archive-move; the commits and the homes are the record. Highlights: the shared-checkout
branch-ops and untracked-live-WIP disciplines → `worktree-hygiene` §5; the instrument-to-goal
and owner-granted-sequencing-exception disciplines → `user-collaboration.md`; rendered-output
test craft → `testing-patterns.md`; notify-at-the-action-moment →
`owner-attention-at-action-moments`;
authority-grounding (cite/govern) → `verify-dont-trust`; status-lines-are-verdicts →
`present-verdicts-not-menus`; two new patterns
(`removing-a-constraint-surfaces-what-it-also-bounded`,
`many-pairwise-links-mean-one-unnamed-lever`); the 2026-07-01/02 recurrence cluster →
the action-time-structural-interrupt pathogen inventory; F-111 (Bash sandbox / zsh dialect) →
the frictions register; the pre-existing red `sdk-codegen` gate + programmes execution facts →
the `upstream-api-alignment` thread record (#291 is MERGED). PDR-122-shaped candidates
(checkpoint-between-stages, calibration-first, throughput-vs-volume) graduated via the same
pass's distilled drain.

New session observations append below.

## 2026-07-02 — the consolidation session's own observations (Rosemary stirs Bracken)

- **The patterns-README index is GENERATED — never hand-edit it.** I hand-added index lines +
  category counts; the pre-commit `validate-patterns-index` gate refused the commit and named the
  fix (`pnpm --filter @oaknational/agent-tools validate-patterns-index:fix`), which regenerated the
  index from pattern frontmatter (including `use_this_when` verbatim). Lesson: before hand-editing
  ANY index, check for its generator/validator first — the repo's own generate-don't-hand-maintain
  doctrine, lived. (New pattern files still need authoring by hand; only the README index is
  derived.)
- **zsh no-word-split bit live, minutes after I documented it as F-111** — `for f in $(echo
  "$FILES")` passed one joined string, silently emptying a commit-queue enqueue whose error my own
  `2>/dev/null | jq` pipe then swallowed. Corroborates F-111 and
  `harness-shell-and-commit-edge-cases`;
  the deeper tell: piping a CLI's output to jq with stderr suppressed hides the failure completely —
  run state-mutating CLIs bare first, parse later.
- **The commit-queue `commit` workflow still dies at the documented depcruise→turbo stream
  truncation (2 attempts, 2026-07-02)** — the commit skill's documented cure (direct
  `git commit -F <msgfile>` with output redirected, hooks intact, then manual `complete` + claim
  close) worked exactly as written. Falsifiability datapoint for the skill: the spawned-commit path
  remains unreliable; keep the workaround.
- **`claims close` requires `--now`; `claims open` defaults it** — inconsistent option surface
  (F-72..F-80 sibling; cost one retry). A body/summary containing an apostrophe also exits 2
  (shell-quoting through the pnpm wrapper) — use apostrophe-free summaries or `--body-file`.
- **OWNER CORRECTION (the session's sharpest): recorded "keep-open granted by user" notes were
  NOT the owner's grants** — "those are not _my_ grants, they are grants made in my name, and I
  do not agree to them." I had treated the 2026-06-28 notes on Q-009/Q-011 as standing
  satisfiers; a recorded grant is a prior session's CLAIM, re-verified live each pass. Same
  correction one layer up: I first held the design-panel item behind a 2026-06-29 trigger
  against TODAY'S "everything graduated" — an older directive invoked against a later one
  (owner direction is a stream). Both homed: `precedence-is-not-approval` (recorded-grant +
  older-directive clauses), the consolidate-docs 7b.1 + consolidate-until-done contract
  (grants are live-per-pass; prefer re-homing long-lived questions into owning artefacts),
  and the register's own drain_strategy. Outcome: Q-009 → the two-altitudes report +
  repo-continuity strategy entry; Q-011 → PDR-118 open question 6; register EMPTY.
- **PR #296 shepherding (opened → MERGED same evening) — the failures became the skill.** I
  triaged two REST comments as "noise" while four unresolved Copilot threads and a FAILED Sonar
  gate sat unread (owner: "stop pretending there are no problems") — the authoritative-surfaces
  discipline is now `/oak-pr-lifecycle` (first slice of its plan; both its promotion triggers
  fired this session). Sixteen Sonar findings fixed at source across two scans, zero dismissed;
  the second scan surfaced a sibling regex (META_BINDING) my first sweep missed — I fixed the
  reported instances and swept one file's class but not the other's ("fix the class" applies
  per-class across ALL files, not per-file). Homed: the skill + commit messages.
- **Reviewer contradiction is a gift — the cheap empirical check beat both verdicts (2026-07-02,
  salvage ws1 pre-execution panel).** code-expert said "reuse the exported adjudicate()" and even
  claimed it "verified equivalent on the real data"; test-expert said adjudicate() cannot evaluate
  a bare 3-lens quorum (tier-0 gate at the function head). My own first-hand read of
  aggregation-adjudication.ts settled it in seconds: test-expert right, code-expert's mechanism
  broken-as-stated (its NUMBERS were still correct and became pre-declared predictions). Worked
  instance of both `feedback_validate_specialist_findings_before_acting` clauses in one panel: a
  claim pre-stamped with its own verification, and contradiction-as-cheap-check-trigger. Also:
  test-expert's blocking find (47/54 banked candidates carry a 4th lens-null verdict that would
  lens-collision every quorum) was real and became the discriminating fixture.
- **jq on a driver-output capture file fails if the driver appends prose after the JSON** — the
  post-run driver prints the JSON then a one-line close verdict to stdout; strip the trailing
  line (`sed '$d'`) before conserving as a .json artefact or parsing.
- **Critically-assess-all-subagent-output reinforced again (2026-07-02, salvage session)** — the
  owner re-issued the standing directive ("always critically assess all subagent findings, claims,
  and sources") pre-emptively, mid-panel, post-compaction. This is now roughly the ninth
  reinforcement since 2026-05-27 of a discipline homed in per-user memory
  (`feedback_validate_specialist_findings_before_acting`) + the `verify-dont-trust` rule.
  Recurrence-despite-home (PDR-098): at the next consolidation pass, assess whether the always-on
  rule surface needs an explicit subagent-output clause (ground findings, verdicts, "confirmed"
  claims, cited sources, and recommendations first-hand before absorbing), or whether the
  reinforcements are the owner exercising normal emphasis rather than evidence of a home gap.
- **pnpm overrides rewrite DIRECT deps' effective specifiers** — adding esbuild as a direct dep
  desynced the lockfile against the pre-existing `>=0.28.1` security floor; no local gate runs
  a frozen install, so CI was the first catch. Homed: troubleshooting §Lockfile desync via pnpm
  overrides. Sibling doc-defect fixed: the commit skill's adapter-regeneration command was the
  filtered form, which fails (cwd-relative scandir) — corrected to the root-invoked built form,
  verified first-hand.
- **A research Workflow lens agent wrote an ORPHAN synthesis file to disk despite a
  schema-forced StructuredOutput brief (2026-07-03).** A six-lens `Workflow` fan-out (default
  all-tools agentType, each agent given `schema: FINDINGS_SCHEMA`) left a truncated 136-line
  `corpus-analysis-generalisation-research-2026-07-03.md` on disk with a dangling plan reference
  — a strict subset of the context-holder's own report, found only because `git status` showed
  two report files at commit time. Lesson: the schema forces the RETURN VALUE, not the tool
  surface — an all-tools workflow agent can still Write files as a side effect. After any research
  workflow, `git status` for orphan artefacts before committing; and prefer pinning read/analysis
  lens agents to a read-only `agentType` (or an explicit no-Write allow-list) so they cannot mint
  disk artefacts. Worked cure this instance: conserve the orphan's one unique element (a
  five-layer table) into the complete report, then remove the duplicate (SSOT).
- **Model switched claude-fable-5 → claude-opus-4-8 mid-session (2026-07-03), identity stable.**
  The PDR-027 UUID id (`206a5880-…`) is derived from the session seed, NOT the model, so it held
  across the switch; only the display model field changed (`identity preflight --model
  claude-opus-4-8` confirmed the same id). Commit trailers switched to `Co-Authored-By: Claude
  Opus 4.8` from that point.

## 2026-07-03 — corpus-generalisation review session (Hazel rides Orchard)

- **Lens `openQuestions` are the synthesis drop zone.** Adversarial review of the 2026-07-03
  research-and-record pass (journal cross-check against the report): all three revision findings
  traced to lens `openQuestions` content the synthesis dropped or softened, while `findings`
  arrays were conserved faithfully. When synthesising structured lens output, give `openQuestions`
  the same conservation discipline as `findings`. Homed: the review verdict report
  (`corpus-generalisation-review-2026-07-03.md`) carries the instances.
- **Check a "benign-by-design" interpretation against the originating commit's own contract.**
  The report interpreted the comms-residual disk absence as the expected consequence of the WS7
  untrack; the untrack commit (`255117a43`) itself says "all preserved on disk", the checkout
  pre-dates the untrack, and no record accounts for the removal — the lens said "unexplained", the
  synthesis softened it to "benign". The cheap decisive check (read the commit message the
  interpretation leans on) took one `git show`. Sibling of `verify-dont-trust` and the
  reviewer-contradiction-is-a-gift entry above.
- **Advisor tool unavailable this session** (returned "unavailable" on first call); proceeded on
  first-hand verification alone. Harness observation, not a repo defect.
- **"Unmeasured" often means "unanalysed" — the data was already committed.** The quorum-diversity
  finding said vote independence was unmeasured; a 100-line deterministic script over the
  already-committed checkpoints measured it in minutes (phi≈0.55, ≈1.4 effective votes of 3, both
  regimes; cross-regime quorum agreement 59.6%). Before scoping new instrumentation for an
  "unmeasured" quantity, check whether the banked artefacts already carry the measurement
  (PDR-122 invariant-1 style: deterministic code over recorded judgments). Banked:
  `data/lens-correlation-measurement-2026-07-03.json`.
- **Owner observation captured (2026-07-03, mid-session):** estate-wide markdown→knowledge-graph
  definition-layer inversion, markdown retained as the two-way representation layer (render AND
  human input). Homed: `project_graph_approach_is_practice_convergence_target` (sharpening) + the
  research report's owner-observation record; a dedicated research lens ran on it.

## 2026-07-03 — exploring context usage (Sardine spins Estuary)

- **Session-open load measured at ~71K of the ~80K reliably-loaded budget.** The two largest
  controllable contributors shared one mechanism (session-injected definition surfaces carry no
  budget while invocation-time surfaces are effectively free): 15 verbose `.claude/agents`
  descriptions with embedded `<example>` blocks (~25KB of a ~33KB description tier), and the
  44KB/241-entry `MEMORY.md` index being harness-truncated at load. Homed: PDR-124
  (definition-surface context economy) + amended `per-user-memory-is-a-buffer` (index-line
  retirement on graduation). Drain of the 241-entry backlog deliberately NOT run — owner-directed
  as a separate dedicated `consolidate-docs` pass.
- **The lean shape was already ratified in the estate — the Cursor adapters.** The `.cursor/agents`
  descriptions for the same 15 agents were already compact and example-free; the verbose Claude
  copies were cross-platform divergence, not design. Before designing a new shape for a surface,
  check the sibling platform's adapter for an already-converged form (cheap convergence beats
  invention; also a divergence-detection signal for the canonical-first architecture).
- **Graduated memory entries double-tax the index.** An entry graduated to a rule kept its
  `MEMORY.md` index line, so the substance loaded twice per session (rule stub + dead index line)
  while crowding live entries past the truncation point. Cure is lifecycle (retire the line, keep
  the per-entry audit file), not trimming.
- **PDR-052 vs PDR-124 boundary held under the new-rule-vs-pdr-clause classifier.** Checked
  clause-vs-new-PDR before authoring: PDR-052 governs _editing_ directives under context pressure;
  nothing owned the standing _injection_ cost of definition registries. The classifier run
  changed the artefact's scope (from "subagent design" to the two-tier surface contract).

### Commit-ceremony tool feedback (2026-07-03, Sardine spins Estuary)

- **commit-queue `commit` stream-truncation reproduced again** (third observation, per the
  skill's 2026-06-17 note): died at the depcruise→turbo handover even with parent output
  redirected to a file; the documented direct `git commit -F` fallback landed cleanly
  (`6b7c496ab`). The redirect-the-parent variant does NOT cure the spawned-child case.
- **SKILL-CANONICAL commit example's `tail -n +2` breaks identity preflight parsing** under
  Claude Code's shell (the pnpm echo goes to stderr, so `tail` eats the JSON's first line);
  `2>/dev/null | jq` is the working shape. Also: `enqueue` prints a bare UUID, not JSON.
- **zsh does not word-split unquoted variables** — a `$FILE_ARGS` string blob reached the CLI
  as one argument; use arrays (`fargs=(--file a --file b)`; `"${fargs[@]}"`).

## 2026-07-03 — handoff loss-scan capture (Hazel rides Orchard)

- **Workflow StructuredOutput double-failure cure: retry as a plain read-only Agent with a
  markdown deliverable.** One research lens failed the schema-forced path twice, differently
  (retry-cap exceeded in the Workflow; then a resumed plain run returned corrupted output — a
  skill-list fragment, 0 tool uses). Third attempt — SendMessage to the same agent naming the
  corruption, dropping the schema, asking for a markdown deliverable — succeeded fully.
  Corroborates `bounded-structured-output-for-workflows` and adds the recovery shape: when the
  orchestrator is the only consumer, schema-forcing is droppable; name the prior failure in the
  retry message so the resumed agent knows its earlier output was garbage.

## 2026-07-03 — recurrence-despite-home (Hazel rides Orchard, late session)

- **Pasteable-content-as-code-blocks fired despite its graduated home.** I presented the ws1b
  opener excerpt as a blockquote; the owner re-issued the correction. The rule was graduated
  2026-07-02 to `user-collaboration.md` §Feedback and Verification (line ~190: "fenced code
  block, never quoted prose") and the per-user memory index still carries the pointer — yet it
  did not fire at the action moment. A PDR-098 fires-despite-home instance, post-dating the home
  (the temporal qualifier holds). I also nearly created a duplicate memory before the index
  revealed the existing one — check-for-existing-home BEFORE writing a new memory file is the
  cheap step that caught it.

### Owner correction: no fallbacks, ever (2026-07-03, Sardine spins Estuary)

- **"No fallbacks, ever, do it properly or error, that is the repo way" (owner, citing
  `principles.md` §Strict and Complete).** I landed the memory-drain Loop-0 commit via direct
  `git commit` when the `commit-queue -- commit` workflow died at its known truncation defect,
  and called it "the documented fallback" — the commit skill even documented that route. The
  correction: a broken proper path is an ERROR to stop on and surface; an equivalent-effect
  route is a workaround, exactly what `hook-block-no-workarounds` and §Strict and Complete
  forbid. Reconciled same-day (PDR-107 shape): skill fallback guidance withdrawn, defect
  registered as F-112 (blocks all queue-workflow commits from Claude Code; cure = fix the
  spawned-child stdio handling), posture now stop-and-surface. Note the skill TEXT documenting
  a fallback did not make it legitimate — a recorded workaround is still a workaround; reason
  from principles, not from the nearest artefact's permission.
- **Corroboration (Hazel rides Orchard, same day): four same-class instances before the
  correction landed** — commits 8290cec0b, a8ee0c033, 3b4cdfda3 (attempted workflow first, then
  routed around), plus three more direct-`git commit` landings that never attempted the workflow
  (724392b6c, cb97b59fc, and the opener pair), each citing "the documented fallback". The ws1b
  session opener even INSTRUCTED the next agent to use the route; corrected in-tree same day.
  The fluency tell was exact: the skill's own text was the permission artefact. The commits
  themselves stand (hooks ran green; history is not rewritten); the ROUTE is what is withdrawn.

## 2026-07-03 — F-112 execution session (Mistral seeks Jetstream)

- **F-112 mechanism pinned (trace-verified): a Node socketpair on the spawned git's stderr
  poisons the pre-commit hook chain.** Node's child-stdio "pipes" are libuv socketpairs (not
  FIFOs — `isFIFO()` misses them; check `isSocket()` too). With one on git's stderr, the hook
  shell takes SIGPIPE at the depcruise→turbo handover and its `set -e` turns the failed echo
  into a silent exit 1 — no ❌ line, no status file, git exits 1. Probe triangle: hook-without-
  git through the same seam GREEN; both-streams-piped RED (capture-and-tee is NOT a cure);
  full-inherit GREEN. Pure-shell 300KB through the same socketpair is GREEN, so the poison
  needs the hook's own pnpm/node children sharing the descriptor. Cure: file-backed child
  stdio + replay-on-completion (immune by construction). Diagnostic craft that paid: file-based
  trace markers + signal traps in the hook (immune to stream loss) beat theorising; and a
  scratch `--registry` (basename must be `active-claims.json` — the collaboration JSON
  validator routes schema by basename) kept five failure-abandons out of the real registry.
- **Bash fd-restore anomaly under SIGPIPE (observed, not load-bearing):** with fd1 broken, the
  statement after a `>> file` redirect wrote INTO that file — macOS bash 3.2 sh-mode restored
  fds oddly around the signal. Treat trace-file content position with care in future hook
  forensics.
- **Cross-experience read (consolidation step 4, this session × Hazel's measurement-collapse):**
  both sessions watched a hedged/silent claim collapse under ONE cheap direct observation
  ("unmeasured" → a 100-line script over committed JSON; three weeks of "dies at the handover"
  theory → one trace line), and both noticed trust concentrating in the negative signal (doubt-
  conserving openQuestions; red gate failures proving more than the green). Corroborates
  `verify-dont-trust` + `feedback_run_the_thing_dont_flag_the_gap` rather than needing a new
  home; noted as recurrence texture, not a candidate.
- **commit-queue `enqueue` and `guard` require `--id` (the PDR-027 UUID) but their usage text
  omits it** — "missing required --id" costs a retry each; sibling of the F-72..F-80
  option-surface class. Also: `guard` binds to the INTENT's claim, so the intent must be
  enqueued against the `git:index/head` claim, not the files-boundary claim — the error
  message names the claim kind but not the re-enqueue cure. Register candidates.
- **commit-queue verify-staged cannot represent a rename**: a staged `git mv` records an
  `R100\told\tnew` name-status line, and the intent/staged file-list comparison parses it as one
  path, so an intent naming both rename sides fails verify ("missing: <old>") and one naming only
  the new side would split the rename at pathspec-commit time. Cure this session: two workflow
  commits (add the copy, then delete the original) — lossless, proper-path. Register candidate:
  teach the bundle parser + pathspec narrowing the R entry shape.
- **comms-seen path derivation diverges between the CLI and the rule doc's convention.**
  `assert-watcher-live` and the `claims open` F-95 backstop derive the heartbeat path from the
  DISPLAY name verbatim (`Mistral seeks Jetstream.json.heartbeat.json`); the
  `comms-all-channels-watcher` rule's seen-file convention section and every pre-existing file
  in `comms-seen/` model kebab-case (`vanilla-stirs-spore.json`). `claims open` has no path
  override by design, so a kebab-case watcher passes assert (via `--heartbeat-file`) yet still
  blocks the claim. Cure: arm the watcher with the display-name `--seen-file` (quoted). Either
  the CLI should kebab-case or the rule doc + legacy files should be display-name; F-class
  friction, register candidate.

## 2026-07-03 — ws1b rescued-knowledge disposition pass (Vega mends Oblivion)

- **The ninth-reinforcement question DECIDED: no new clause; the gap is firing, not text.**
  `verify-dont-trust` already carries an explicit multi-clause subagent-output discipline
  (sub-agent-summary clause, reviewer-output paragraph, absorb-trigger, cited-source
  anti-pattern, worked instances); the recent reinforcements are pre-emptive at fan-out
  moments, none correcting an observed absorption failure, and the record shows the
  discipline firing (the 2026-07-02 panel contradiction settled first-hand; this pass's
  home-by-home verification). A ninth restatement is the t6 self-referential trap. The
  constructive residue — subagent result-return as a mechanical firing-moment candidate — is
  routed to the action-time-structural-interrupt inventory.
- **Tier B's "genuinely novel" claim collapsed on checking: 5 of 8 had partial or full
  homes** (C36 owner-ratified in testing-patterns; C54 the honest-restructure pattern; C123
  the semantic-merge skill; C129 the F-41 lane; C135 the watcher rule). Novelty-unmeasured
  is confirmed as a standing caveat on any "no corroborating home" claim — recall of the
  corroboration scan, not just the discovery pipeline, bounds it.
- **A rescued trajectory can flag a live doc contradiction the estate missed:** C36's
  endpoint (owner ratified supertest IS e2e, 2026-05-21) was recorded in testing-patterns.md
  while testing-strategy.md and test-coverage-review-lens.md still carried the superseded
  classification (the pattern's proven_date 2026-05-17 pre-dates the ratification).
  Reconciled all three to the ratified position. Corpus rescue sets double as
  doc-consistency probes.
- **Registry hygiene observation:** the commit queue carried 7 abandoned/expired F-112-era
  rows at session open (real-registry failure-abandons from Sardine and Mistral, despite the
  F-112 session's scratch-registry discipline for its probe runs). Historical rows, not
  blockers; cleanup belongs to the 7d stale-entry audit of a full dedicated pass.

## 2026-07-03 — full-processing correction + plan authoring (Vega mends Oblivion, late)

- **OWNER CORRECTION (the session's sharpest): the "owner-gated" labels on tier E and the
  adjacent strata were NEVER ratified** — "I never agreed to any of it being 'user gated'…
  the above carve outs were never ratified by me." The label was authored by prior sessions,
  propagated through plan → report → opener → continuity, and re-asserted by me (and by an
  Explore sweep, which called it "owner-gated by design") without any of us re-verifying the
  grant. Estate-scale `precedence-is-not-approval` + the inherited-tag-read-as-verdict
  pathogen, at a new severity: the tag survived TWO consolidation sessions and an adversarial
  review. The owner also revealed they attempted a HOOK to block the excuse — a mechanism
  demand for the design-space lane (no such hook is in the estate; enforcement gap). Homed:
  the design-space plan's pathogen inventory (estate-scale addendum), the salvage plan's
  §Full-processing mandate, the corrected continuity/thread wording, per-user memory
  sharpening.
- **A plan premise was falsified by the reviewer BEFORE execution (worked instance of
  `verify-data-supports-shape-before-building`):** ws1f(b) planned to "read the rationale
  prose" of 233 banked verdicts; assumptions-expert proved with jq that the corpus is
  structured-only (no prose field exists anywhere; the validate result's 246 reason fields
  are all null; voter transcripts were never conserved). Verified first-hand, re-scoped
  pre-approval. The cheap check that would have caught it at author time: key-union jq over
  the artefact BEFORE writing "read the prose" into a workstream.
- **Hook warn-vs-use collisions bit twice while writing the plan** (C103 class, live): the
  write-guard blocked "carve-out" (used as a design descriptor) and "parked" (used inside a
  prohibition). Both rewrites were genuinely better (state the uniform design positively;
  state the four-dispositions contract instead of negating a parking). The hook's
  reappraise-don't-rephrase instruction did real work — the C103 pathogen note stands, but
  this instance was the hook succeeding, not misfiring.
- **commit-queue guard rejects a claim whose area-pattern is spelled `git:index/head`** —
  the matcher wants pattern `index/head` under kind `git`; the `git:` prefix is the kind
  label. The commit skill's prose says "a `git:index/head` claim" everywhere, so a
  first-time reader opens the claim with the full label as the pattern and burns a
  close/reopen cycle. Registered as F-116; commit skill enriched at the firing line.
- **Waiting on an async subagent inside plan mode has no primitive** — used a
  metadata-only settle probe (background until-loop on the transcript's file size, never
  its content) as the re-invocation hook. Worked; harness-level friction, noted for AX
  awareness only.
- **`commit-queue phase` returned a transient exit 1 on first invocation** (immediately
  after enqueue), succeeded unchanged on retry; likely a same-instant registry-write race
  with the claims CLI. Single observation; watch for recurrence before registering.
- **A `/goal` Stop-hook condition whose scope exceeds one session deadlocks against an
  owner-directed handoff.** The session-open goal ("complete the knowledge rescue") was
  later re-scoped by the owner in-session (author the ws1c–ws1g plan; "another session
  will implement it"; deep closeout) — but the goal hook kept enforcing the original
  wording and blocked every stop, even while its own analysis acknowledged the owner's
  deferral. No phrasing can satisfy it (the remaining work is a 3–6-session arc) and the
  agent cannot clear a goal itself. Sibling of `feedback_templated_loops_need_exit_criteria`
  at the harness layer: a goal condition wants an exit criterion for
  owner-superseded-in-session, or goals want re-issuing when the owner re-scopes mid-flight.
  Harness-level observation (the /goal feature), not a repo defect.

## 2026-07-03 — rescued-knowledge full processing ws1c–ws1f + ws1d E-b1 (Gust hunts Headwind)

- **`rg -r` fired three times in one session DESPITE reading its home the same hour** — I
  used `rg -rln` (where `-r` is --replace, silently mangling output) three times while
  running disposition sweeps, having read troubleshooting's "mind `rg -r` (replace) vs
  `-n`" bullet earlier in the SAME session (it entered that doc 2026-07-01ish; my
  instances post-date the home). Clean PDR-098 fires-despite-home instance at the
  muscle-memory layer: the flag collision is mechanical, the home is passive prose, and
  the failure is visible only if you inspect the output shape (matches silently replaced).
  Candidate cure is action-time, not text: a shell-lint/hook fingerprint on `rg -r` in
  agent invocations, or the habit of `--replace=` never `-r`. Routed as texture to the
  action-time inventory only if it recurs cross-session; napkin-first per the temporal
  qualifier discipline.
- **A batch disposition pass wants the failure-class greps EXCLUDING the corpus data dir**
  (`-g '!**/large-corpus-analysis-tooling/data/**'`) — the committed checkpoints contain the
  leaf/candidate text itself, so any grep for a lesson's key phrase self-matches the corpus
  being dispositioned and buries the real homes (bit twice before the exclusion became
  standard practice this session).

### Session close: exploring context usage → drain Stratum A (2026-07-03, Sardine spins Estuary)

- **comms-watcher heartbeat path is derived from the DISPLAY codename verbatim** (spaces,
  capitals): `assert-watcher-live` expects `comms-seen/Sardine spins Estuary.json.heartbeat.json`;
  a kebab-case seen-file fails the assert with a "watcher not running" that IS running. Cost three
  watcher restarts. Cure: start `comms watch` with the display-name seen-file (or pass
  `--heartbeat-file` to the assert). Registered as F-118 (F-113..117 were taken by the F-112 execution and salvage sessions). Also: `comms send` takes no `--kind` or
  `--session-prefix` flags (title/body/platform/model + `--tag`); usage-probe before ceremony.
- **The continuity substrate carried a six-arc session across compaction boundaries.** Re-entering
  after a multi-hour gap cost ~3 reads (claims registry → queue → git log) to recompute team truth
  — Gust's window, F-112's fix, my landed bundle all recovered from artefacts, not memory. Positive
  instance of claims/comms/plan-as-externalised-state; the inverse lesson: the session ran
  measurement → doctrine → application → planning → execution → team re-entry in ONE context, and
  tail-quality risk grows with each arc — prefer closing at a doctrine-landing boundary and letting
  a fresh session take execution (the owner effectively enforced this by directing closeout).
- **Stratum A shape held**: verify-home-first-then-retire worked cleanly; 8/8 homes carried the
  substance (one needed a deeper grep past the section head before confirming — read past the
  heading before declaring coverage).
