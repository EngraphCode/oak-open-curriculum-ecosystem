# Loss / metaloss scan — curriculum-hub-demo context, 2026-07-06

Owner-directed pre-merge scan by Director #10 (Nettle tracks Acorn). **Loss** = work or
knowledge that has fallen out of the durable records. **Metaloss** = the records no longer even
signal that something is missing (the loss of the loss-signal). Evidence gathered by a
read-only sweep agent and re-verified first-hand where load-bearing; each item carries its
disposition.

## Findings — losses (substance at risk or missing)

1. **Six unresolved Codex P2 review threads were absent from the succession map.** The Hyena
   handoff (2026-07-04) and thread record said "resolve the two Copilot threads"; the live PR
   carried EIGHT unresolved threads — six Codex P2s landed 2026-07-02 21:52Z, after Comet's
   retirement and before Hyena's 2026-07-03 PR-surface verification, and never entered any
   record. **Disposition: RECOVERED this session** — all six verified against code and fixed
   (`ba043b917`, `c4f87710f`), all eight PR conversations resolved; the class is named in
   metaloss finding 1.
2. **Napkin buffer at 708 lines vs 300 hard limit (2.4×).** Cross-session lessons from four
   tenures sit in a drainable buffer past its rotation point — at risk of context-pressure
   truncation rather than curated graduation. **Disposition: consolidation pass this session**
   (owner-directed `/oak-consolidate-docs`).
3. **Pending-graduations register at 9 items vs 3 hard limit; 4 marked due; oldest dwell ~5
   days** (limit 7). Decision-debt is accumulating faster than curation drains it.
   **Disposition: partial drain this session; remainder explicitly carried with dwell dates.**
4. **Rendered `shared-comms-log.md` had drifted 4 days behind the comms event store** (newest
   rendered entry 2026-07-02T07:34Z vs newest event 2026-07-06T07:24Z) — any reader of the
   rendered log missed the strictness-train, fidelity-mechanism, and closeout coordination
   events. **Disposition: FIXED this session** (`comms render` re-run; now current).
5. **Thyme's open claim `16be897b` has no `handoff_record_path`.** Three of the four retained
   claims carry pickup records; the hygiene lane's does not — its remaining sequence-locked
   items (WS0 renames, gate parity) survive only in the thread record's pause-freeze note and
   the claim's intent field. **Disposition: recorded here; the WS0 items are also carried in
   the productionisation plan, so no work is lost — but the claim should be closed or given a
   record at the merge boundary.**
6. **The fidelity register's evidence is disk-only by design.** `fidelity-register.json`
   (tracked) cites capture/diff paths under `demo-evidence/`, which is gitignored per ratified
   decision 8 — the register survives a clone; its visual evidence does not, and is
   re-renderable only against a running pair (`tool:fidelity`). **Disposition: by design, not a
   defect — named here so nobody reads the dangling paths as corruption. The regeneration
   command is the recovery path.**
7. **Git stash residue: 8 entries, all 2026-05-06-era, all from other branch lineages**
   (`fix/sonar_high_priority_issues`, `feat/mcp_app*`, etc.), all touching only
   collaboration-state files (claims/comms/thread records) — **no source work trapped**.
   **Disposition: owner-gated cleanup list** (stash drops are destructive;
   never-use-git-to-remove-work).
8. **15 local branches whose upstreams are `: gone`** (remote deleted, local retained) plus
   `pre-merge-backup` (local-only, no upstream). Unmerged-work risk is low (these are
   historical lanes) but unaudited. **Disposition: owner-gated branch-audit item, post-merge.**
9. **A detached-HEAD Codex worktree** at `~/.codex/worktrees/5eb8/…` pinned to `e2796757c`.
   **Disposition: owner-gated; verify clean before any removal (worktree-hygiene rule).**

## Findings — metalosses (missing loss-signals)

1. **Point-in-time counts presented without their evidence window.** "The two Copilot threads"
   was true on 2026-07-03's evidence and silently false by pickup. The record carried no as-of
   stamp and no "recount at pickup" instruction, so the successor had no signal the count could
   be stale. **Cure applied:** the lane-identity block and this scan stamp their counts; the
   napkin carries the class ("opener is a pointer, not the truth" — recount live surfaces at
   pickup, especially externally-mutable ones like PR threads).
2. **The active plan silently predated its own branch.** Its §J deploy instruction pointed at a
   directory dissolved four days earlier (7 stale-path references); it did not know the
   fidelity-review mechanism existed; a superseded operative section ("Pre-push directory
   organisation") still read as a must-do. Nothing in the plan flagged its own staleness.
   **Cure applied 2026-07-06:** operative paths corrected, §D now names the mechanism, the
   superseded section carries an explicit supersession banner (history preserved).
3. **Gitignore suppresses the unsaved-evidence signal.** `git status` reports a clean tree (0
   untracked files) while 51 evidence items exist only on disk — the ignore rule that
   implements ratified decision 8 also silences the one signal that would say "this machine
   holds unpushed evidence". **Disposition: accepted consequence of a ratified decision; named
   here and in the branch record so the silence is a known property, not an unknown one.**
4. **The rendered comms log looked authoritative while stale.** A generated read-model with no
   freshness indicator drifted 4 days without any consumer noticing (loss finding 4 is the
   loss; the metaloss is that nothing flags render-lag). **Disposition: napkin capture —
   candidate friction-register entry: `comms render` staleness check or render-on-append.**
5. **Subagent syntheses can inject confident false negatives.** The branch-record draft claimed
   a plan-cited SHA did not exist; first-hand `git log` shows it does. A record built on the
   draft unverified would have "corrected" a true anchor into a false discrepancy — manufactured
   metaloss. **Cure applied:** every load-bearing SHA verified before landing the record; the
   worked instance is recorded in the branch record's traceability notes.

## What was checked and found sound

- **No untracked source work** anywhere in the tree; no real open items in `conversations/` or
  `escalations/`; `practice-core/incoming/` empty.
- **All four retained claims** map to live intents; three have current pickup records; the
  comms event store is complete and continuous (1,566 events, 2026-06-30 → 2026-07-06).
- **`distilled.md` within fitness** (114/180 lines); patterns library at 173 files.
- **The branch is 74 commits ahead of main, all pushed**, PR #295 all-green as of `345497062`.
- **1,039 dangling git objects** — unremarkable for a repo with this rebase/stash history, and
  some orphan commits are intentional (continuity-surface-commits-as-orphans rule); no action.

## Standing cures proposed (routed, not self-ratified)

- **As-of stamps on volatile counts in handoff records** — candidate PDR-063/ADR-182 amendment:
  a handoff record's externally-mutable facts (PR threads, check states) carry their
  evidence timestamp and a recount-at-pickup instruction. → pending-graduations candidate.
- **Render-freshness signal for generated read-models** — friction-register candidate (F-class):
  `comms render` lag detection, or render-on-append.
- **Claim-close-or-record at arc boundaries** — a merge-boundary sweep that every retained claim
  either closes or carries a pickup record (Thyme's `16be897b` is the live instance).
