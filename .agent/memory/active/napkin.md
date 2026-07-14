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

## Napkin rotated (2026-07-14 dedicated consolidation, Dolphin weaves Reef)

Rotated after full bottom-up processing. The processed window (2026-07-08 Bora/Corsair/Elder/
Salamander/Gale/Callisto through 2026-07-14's ten-seat planning-and-visibility team arc —
Quasar, Foxglove, Phosphor holds Tallow, Cedar, the F-138 repair lane, Parsec, Rosemary, Sardine,
Weasel, Galleon) is preserved verbatim in `archive/napkin-2026-07-14.md` (byte-identical, `cmp`
-proven). Every behaviour-changing item was read and dispositioned before the archive-move:

- **New Practice governance authored** (previously only untracked comms narrative): PDR-127
  (the team-branch coordination protocol — scope/reconciliation/comms-sweep, ratified live
  2026-07-14 but with no durable home until now); PDR-128 (review conversations are first-class
  — the portable form of the pr-lifecycle "what a PR is" doctrine, draining the oldest pending-
  graduations item).
- **Rule amendments landed**: `comms-all-channels-watcher.md` (supervision must live on the
  notification path, never a wrapper loop — two independent silent-death instances);
  `rules-have-no-exceptions.md` (audience-scope a rule rather than document a bypass mechanism);
  `plan-body-first-principles-check.md` (capability-locus folded into the vendor-literal clause,
  three recurrences); `user-collaboration.md` (doctrine is the agent's yardstick, never its
  authority over the owner). New rule: `records-are-technical-not-emotional.md` (drains the
  second pending-graduations item).
- **Five new patterns graduated**: `scope-bound-negative-existence-claims`,
  `review-artefacts-must-render-the-assembled-whole`, `one-clause-of-many-truing-trap`,
  `adversarial-verify-plus-self-pass-on-refutations`, `visibility-before-validation`; a seventh
  worked instance added to `inherited-framing-without-first-principles-check.md`.
- **pending-graduations.md drained to zero** (both items graduated to durable homes, verified
  live); **open-questions.md confirmed already empty**.
- Two PR #376 tail Copilot findings fixed (the Sentry plan's stale `documentation-sync-log.md`
  retargets; the `bounded-metaloss-recursion.md` pattern's moving-target napkin citations, now
  pointing at this dated archive instead of the live rotating file).
- Practice Box: light pass complete (three resonance exchange bundles well-formedness-checked,
  not cleared); full design-adoption decision queued in `repo-continuity.md` §Agentic-Engineering
  Curation item 4, cross-linked to the live `strategy-and-plan-estate-holistic-review` thread
  since it bears on the active plan-corpus-refounding effort.
- Thread-register and claims/comms audits run (informational; no malformed state; two
  already-known stale threads reconfirmed, one new marginal stale flag on `orientation-skills-family`
  at 16 days).

## 2026-07-14 — Dolphin weaves Reef (ffedcf): full session handoff, loss-scan, and recursive metaloss

Session-completion consolidation ran under `oak-consolidate-until-done` (see the rotation entry
above for the graduation content). This entry is the mandatory 6e.2 loss-scan — run from inside
this context, non-delegable — followed by a second recursive metaloss pass over the scan itself.
A background verification workflow (12 fresh-context, no-memory agents) adversarially checked
every load-bearing claim from the consolidation closeout against source; all 12 confirmed, zero
refutations — that pass is the **6e.1 verification complement**, not this loss-scan; the two are
deliberately distinct per the skill (a fresh reader can verify claims but cannot detect what
never reached a claim in the first place).

### First-order loss scan — what this context holds that no durable artefact captures

- **A reproducible, undiagnosed tooling anomaly: the commit-queue tool's internal pre-commit
  invocation raced a peer's file six consecutive times; a direct `bash .husky/pre-commit` and
  then a plain `git commit` both passed clean on the first try, seconds later, on the identical
  tree.** Mechanism traced as far as: `validate-no-machine-local-paths` throws (does not just
  fail) when `git ls-files -z` names a tracked path that is momentarily absent from disk — by
  design, a fail-loud choice, not a bug in that validator itself. But WHY the commit-queue
  workflow's path hit this six times running while direct invocation of the identical hook
  script passed immediately, twice, is unconfirmed. Working hypothesis (not verified): the
  commit-queue's `commit` action runs a slower composite chain (verify-staged →
  advisory-orchestrator [fitness + vocab + message checks] → phase → verify-staged-again → the
  real `git commit`, which re-runs the FULL pre-commit hook a second time) — strictly more
  wall-clock time than one direct hook run, widening whatever race window a concurrently-active
  peer session was creating by touching
  `.agent/reports/oak-reusable-curriculum-architecture/oak-reusable-curriculum-architecture-cross-estate-reflection.md`.
  This was NOT written to `frictions-register.md` — it should be, as a new numbered entry (the
  register's next number is F-143 as of this scan), with the mechanism hypothesis flagged
  explicitly as unconfirmed and a recipe for reproducing it (stage a bundle, have a second
  process repeatedly rename/recreate one tracked file, run `commit-queue -- commit` several
  times back-to-back vs. one direct `git commit`). **Not yet homed — routed here for the next
  consolidation or the frictions-register maintainer to promote.**
- **The napkin's ~30 distinct candidate lessons were each individually triaged, and roughly a
  third of that triage was "leave as archived-only, do not graduate"** — Sloop holds Lagoon's
  markdown-table/prettier-reflow facts, the `.mcp.json`-is-gitignored-by-design note, several
  seats' CLI-asymmetry trivia (`claims open` defaults `--now`, `claims close` requires it),
  Cedar's r1-lane-specific G2/G3 sitting mechanics — on the judgment that these are either too
  narrow/single-instance to clear the pattern barrier, or already fully owned by an active
  thread's own record. That judgment call, and the reasoning behind each specific exclusion, was
  made in this context and is **not recorded anywhere** — the rotation summary above correctly
  avoids a disposition ledger per `permanent-doc-is-the-consolidation-record`, but that means a
  future reader of the archived pre-rotation napkin who sees a `candidate:` tag has no way to
  tell "reviewed and rejected" from "missed". This is a structural trade-off of the
  no-ledger doctrine, not a defect in this session's work — flagged here so it is a *named*
  trade-off rather than a silent one (the recursive pass below returns to this).
- **The specific rationale for bundling related lessons into single pattern files** rather than
  one file per lesson (Beacon's two 2026-07-09 candidates → one
  `review-artefacts-must-render-the-assembled-whole.md`; the 2026-07-08 subtree-scope trap +
  Foxglove's 2026-07-14 reviewer-clearance instance → one `scope-bound-negative-existence-claims.md`)
  was a judgment that the two instances in each pair are genuinely the same failure class at
  different altitude, not merely adjacent — that reasoning lives only here.
- **Two audits in this session's own consolidation pass were bounded, not exhaustive, and the
  closeout report did not say so explicitly enough**: the `consolidate-docs` 7c thread-register
  audit ran checks 1 (staleness), 5 (record correspondence), and 6 (retired-banner hygiene) in
  full, but checks 2–4 (orphan threads, missing required identity fields, duplicate identity
  rows) were not run file-by-file across every thread record — only inferred as "probably fine"
  from the repo-continuity index. Similarly the 7d claims/comms audit's point 11 (schema
  validation) ran a bare `JSON.parse`, not a real conformance check against
  `active-claims.schema.json` / `closed-claims.schema.json`. Both gaps are genuine scope
  narrowing under session-length pressure, not silent — naming them here so a future consolidator
  does not assume 7c/7d ran to full depth from this session's say-so.
- **The commit_queue count I reported mid-session (35 stale entries) is already stale by the
  time of this entry — it is now 42**, seven of which are this very session's own enqueue/
  abandon cycle during the six-failure commit race (each abandoned intent stays in the queue by
  design, per the rollback-discipline invariant). None of the 42 were cleaned up: `active-claims.json`
  is inside Quasar mends Umbra's claimed area
  (`.agent/state/collaboration/**`), not mine, so this session correctly left them for that
  claim's owner or the next warden-lane sweep rather than writing into a peer's claimed surface.
- **The peer whose in-flight file move caused the race above was never identified** — no
  `git:index/head` or `.agent/reports/**` claim was visible in `active-claims.json` at any point
  I checked, so either that session was not following the claim protocol for a plain filesystem
  operation, or it was the owner working directly in the same shared checkout. The commit
  (`SHA:725749349`) now carries that session's ~1788-line expansion of
  `oak-reusable-curriculum-architecture.md` under this session's authorship framing, per the
  owner's explicit "commit everything as it is now" direction — correct to do, but this session
  never verified that peer's work was actually *finished* rather than mid-draft; that is a live
  open question for whoever next reads that report.
- **The push to `origin/team/planning_and_visibility` that landed this session's commit was not
  performed by this session** — verified just now via `git reflog show origin/team/planning_and_visibility`:
  an "update by push" event at `2026-07-14T20:18:59+01:00`, three minutes after the commit
  landed locally. This session never ran `git push`. Attribution (owner vs. another live agent
  in the same shared checkout) is unconfirmed; stated here as an unconfirmed fact rather than
  silently assumed either way.
- **The exact five-move decision sequence with the user this session** (quota-pacing directive
  scoped to the prior team window, not this solo one; Practice Box light-pass-not-full-adoption;
  commit-everything-as-is including the peer's files) lives in this conversation's transcript,
  which is not the same discoverability surface as the napkin/comms tier for a future agent who
  was not party to this conversation. The rotation summary above and this entry are the mirror of
  those decisions into a surface a future session can actually find.

### Recursive metaloss — a second pass over the scan above

Per the `bounded-metaloss-recursion` pattern this session itself graduated: one recursive
challenge to the first scan's own selection function, then stop on semantics, not exhaustion.

1. **The first scan's own selection is itself context-state that dies with this context** — the
   items listed above are what felt load-bearing to enumerate; the true complement (what I did
   not think to list) is by definition invisible to this pass, exactly as the pattern predicts.
   The mitigating fact: this session wrote at occurrence for its actual doctrine work (the
   napkin rotation summary, the PDRs, the rules) rather than deferring everything to this
   closing entry — the closing entry's job was narrower than a full session reconstruction, and
   it stayed narrow.
2. **The "no ledger for napkin triage decisions" point above is itself a two-sided finding, and
   the first-order scan only fully argued one side.** The no-ledger doctrine
   (`permanent-doc-is-the-consolidation-record`) exists specifically to prevent an
   accounting-shaped artefact from substituting for the substance-shaped one — a disposition
   ledger of "item X → home Y, item Z → rejected because W" is exactly the anti-pattern the
   doctrine forbids, not an oversight this session fell into. So the honest framing is not "a gap
   this session left" but "a designed trade-off of the doctrine, restated here because THIS
   scan's job is naming what a fresh reader could not otherwise reconstruct" — the archived
   napkin plus this session's commit diff *are* jointly sufficient for a sufficiently patient
   future reader to reconstruct every disposition (every graduated candidate has a citable new
   file; every non-graduated one is absent from the diff), it is merely not indexed for cheap
   lookup. Recorded so a future reader does not mistake "not indexed" for "not recorded."
3. **The frictions-register candidate (the commit-race anomaly) was the single highest-value item
   in the first-order scan and the one most at risk of being read as "already handled" because it
   was extensively discussed in chat** — completion drive at the finish line
   (`fluency-clusters-at-the-finish-line`) is exactly the failure this recursive pass exists to
   catch: a thoroughly-discussed-in-conversation finding FEELS captured, and is not, until it has
   a durable home. Caught by this pass and homed before commit: `frictions-register.md` F-143,
   with the mechanism hypothesis marked explicitly unconfirmed and a reproduction recipe
   recorded — the discipline this recursive step exists to enforce.
4. **Scan scope, stated per the pattern's own discipline**: this pass reviewed the chat arc for
   this final handoff turn, the full six-day napkin content already processed in the rotation
   above, the git log/reflog/status of the current tree, the active-claims.json queue count, and
   the verification workflow's 12 confirmed verdicts. A representative sample of what was
   deliberately NOT re-litigated here (consciously dropped, not overlooked): the specific grep
   commands used to confirm existing doctrine homes during graduation triage; the exact wording
   iterations of each new pattern/rule/PDR before their final form; the AskUserQuestion tool's
   internal option-preview text. None of these carry decision, evidence, authority, or
   next-action weight beyond what is already in the commit and this entry.
5. **Recursion stops here** — a third pass over this metaloss pass would restate its own filter
   rather than surface new decision-changing information, which is precisely the stopping
   condition the pattern names.

### Closeout disposition

Verdict: **complete** for this session's scope. The one item the recursive pass caught
(the commit-race anomaly) is homed at `frictions-register.md` F-143, not merely noted for later.
`pnpm check` to be run next as the standing session-handoff gate (step 11) before this entry's
commit.

## New session observations append below.

## 2026-07-14 — Quasar mends Umbra (52b4de): Director #1 session closeout — loss scan + bounded metaloss

**Landed outcome (PDR-026):** the commissioned two-objective day landed end-to-end. Objective 1
(GitHub/Linear/Notion stakeholder-visibility proof slice) ratified complete, Sentry leg open and
routed. Objective 2 ran the whole runway: registers re-homed, Walk-A priors recorded, the
dedicated consolidation executed (Dolphin: PDR-127/128, napkin rotation), the freeze-planning
sitting RULED (rule ratified — record `freeze-planning-sitting-2026-07-14.md`), reconciliation
PR #377 merged (`SHA:019448a16`), **the S0 hard window OPENED**, S0 staged, and the Director
seat TRANSFERRED to Barnacle calls Spray (PDR-064 Moment 2, 20:42:46Z, claim `0f4be777`
adopted after their 9-agent verification). Fifteen PRs merged through this seat's day.

**Surprise — false-orphan verdicts from two verification methods (the sharp lesson):** my
worktree-orphan audit produced three "genuine orphan" verdicts; closeout re-verification
retracted TWO. (b) the codex Sentry config: a `git diff origin/main...<sha>` THREE-DOT diff
compares against the MERGE-BASE, not current main — the config had landed via PR #372 after
the base; a plain two-dot content check against `origin/main:<path>` refutes it in one line.
(c) the index-hygiene paragraph: an exact-line diff/grep containment check is
line-wrapping-sensitive — prettier/markdownlint rewrapping made present content look absent;
SUBSTANCE-PROBES (grep for several distinctive short phrases) settle it. Conversely (a) — the
48-line compaction napkin entry from `SHA:882e82687` — SURVIVED the stricter re-check: the
archive's same-titled entry is Cedar's, and every unique substance-probe (seven-branch
enumeration, push-rule rejection, heartbeat-lapse specifics) hits zero. One real orphan, two
false alarms, one method upgrade. Handoff-record addendum carries the corrected inventory.

**Surprise — a "retained" claim can vanish without archive closure:** curriculum-hub claim
`35d9c8f2` (retained 2026-07-06 for a successor pickup) is in NEITHER `active-claims.json`
NOR `closed-claims.archive.json` (both verified, zero hits). Annotated in director-handoff.md:
pickup opens a fresh claim; the pickup record path is the substance carrier. Registry-hygiene
sweeps should archive-close, never plain-delete.

**Owner-interaction learning:** major directives arrive embedded in structured-question
answers — "delete all three, **and pass the seat to Barnacle**" rode an artefact-clearance
answer. Parse every answer in full, not just against the question asked. (→ user memory.)

**Harness learning:** the auto-mode classifier refuses agent-chosen deletion targets under a
generic authorisation — the owner must name the exact paths. Correct behaviour, worth
expecting: surface deletion lists as named targets in the authorisation ask itself.

**Loss scan (6e.2, from inside this context, against the grain):** enumerated candidates and
their homes — the S0 execution order (handoff record §2); the corrected orphan inventory
(addendum); the 35d9c8f2 vanish (annotation); the neo-sentry worktree keep-condition void →
removed at closeout (addendum); the org Claude-review billing cap (handoff record); the
undiagnosed push-ruleset (register + record); the team branch now behind main again, my
closeout commits ride the next paired reconciliation (PDR-127 governs; Barnacle knows);
Barnacle's verification pattern (9-agent adversarial re-check of a handoff record) worked and
is worth repeating — visible in their Moment-2 event for any future consolidation. Nothing
else in-context survives the subtraction: today's decisions round-tripped through comms,
PRs, and records at occurrence.

**Metaloss (bounded per the graduated pattern):** the scan enumerates what this seat
RECOGNISED as load-bearing; unrecognised loss is structurally mitigated by
round-trip-at-occurrence. The day's own evidence sharpens the residual-risk class: BOTH real
losses found today (the #376 silent drop of the napkin entry + handoff refresh) and both
false verdicts (three-dot diff, exact-line grep) were failures of VERIFICATION METHOD at
landing boundaries, not failures of capture — so the residue to guard is "content believed
landed/absent on the strength of a method that answers a different question". Cure captured
as the distilled lesson + a pending-graduations candidate (containment checks =
substance-probes against current main). Representative reject: monitor task-IDs and re-arm
counts — reconstructible from the transcript, zero decision value. Recursion bottoms out;
further passes add words, not information.
