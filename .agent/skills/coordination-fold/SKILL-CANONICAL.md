---
name: coordination-fold
classification: active
description: >-
  Fold the live coordination branch to main and rotate — the full
  converge-and-rotate ceremony: ownership-aware dirty-file sweep, merge
  main in with a stale-capture probe, bot fold PR carrying the
  product-gravity line, full-condition merge, day-stamped successor cut,
  branch-labelled surface refresh, rotation broadcast, and a
  wrap-not-closeout loss scan. Invoked at the 24h rule's DUE check, at
  owner word ("fold and rotate", "converge the coordination branch"), or
  before any boundary that needs the coordination record durable on main.
---

# Coordination Fold

Executes the converge-and-rotate shape whose doctrine lives in
[`coordination-branch-24h-lifetime`](../../rules/coordination-branch-24h-lifetime.md)
— the rule owns WHAT and WHEN; this skill owns the ceremony's HOW. The
seat running it is normally the Director/principal (the primary checkout
resides on the coordination branch).

## Preconditions

1. Confirm the primary sits on the live coordination branch and no fold
   PR is already open for it (`gh pr list`).
2. **Working-tree survey with ownership.** Classify every dirty and
   untracked path: (a) own work or settled fleet docs — fold them, with
   authorship named in the commit message for peer-authored files;
   (b) a peer's possible mid-edit — check completeness first (a settled
   edit reads whole: closing signature, complete table row, clean diff
   boundaries) and coordinate on their channel when in doubt. Never
   capture a half-state; never delete or revert anything found
   (`never-use-git-to-remove-work`).

## Ceremony

3. Commit by explicit pathspec (`stage-by-explicit-pathspec`);
   lowercase-start subjects (commitlint).
4. `git fetch origin main`, then merge `origin/main` INTO the branch.
   Probe the merge for silent stale-capture reverts (a clean merge can
   still revert an approved newer version — marker-probe suspicious
   files against main) before pushing.
5. Push with a 600s timeout; exit codes in-band and unpiped — a piped
   `$?` reads the pipe's tail, not the push.
6. Open the fold PR under BOT identity (mint per merge-bot discipline).
   The body carries the **product-gravity line** (rule Action 3):
   `moved for teachers: … / moved for the Practice: …` — honest, no
   quota, drift made glanceable.
7. Arm a settle watch (Monitor) whose filter is loud on EVERY terminal
   state (`silence-is-never-liveness`). Full condition = the four
   required checks BY NAME (CodeQL, SonarCloud Code Analysis,
   run-quality-gates, Vercel) all green + zero unresolved review
   threads + MERGEABLE.
8. Bot REST merge at the FETCHED full head sha — fetched at merge time,
   never typed from memory, never expanded from an abbreviation — with
   `merge_method=merge`, never squash.
9. Cut the successor `coordination/<today UTC>-<sha6>` from post-fold
   `origin/main`, minting the name MECHANICALLY, never by transcription
   (after `git fetch origin main`):

   ```bash
   git switch -c "coordination/$(date -u +%F)-$(git rev-parse --short=6 origin/main)" origin/main
   ```

   `<sha6>` resolves to the fold-merge commit step 8 just created (the
   post-fold tip). The suffix is deliberate owner policy, not
   decoration: on a real repo with many live checkouts, a date-only
   name lets two checkouts mint the SAME branch and collide silently —
   the sha suffix makes a checkout cutting from a different tip mint a
   different name instead. It also disambiguates same-day rotations
   (two branches dated 2026-08-13 exist in the lineage) and makes the
   chain walkable from names alone
   (`7b3df0 → 169e3e → 219095 → ca6b0f → c8586f`). This step
   previously read `coordination/estate-<today UTC>` from the skill's
   birth — a form that never matched practice; the recipe lived only in
   continuity records, and the first seat to follow this line literally
   broke the convention (2026-08-17). The cut is tree-preserving (dirty
   files carry across); `git push -u`, and the primary now resides
   there. GitHub
   auto-deleting the merged head branch is expected, not loss. If main
   moves again during or just after the ceremony (a lane PR merging
   mid-rotation), merge `origin/main` in and rebuild promptly: until
   that merge, the primary's dist and its generated read models run the
   pre-merge contract, so every seat's primary-dist tooling (renders,
   watchers, sends) is one contract behind — cosmetic for render-time
   formats, load-bearing the day a change alters event files (worked
   instance 2026-08-01: cross-branch format skew read as read-model
   drift).
10. **Refresh every branch-labelled surface**: stop and re-arm the
    heartbeat loop with the new `--branch` label; append the fold entry
    (with the same product-gravity line) to the Director seated block;
    broadcast the rotation on the canonical comms stream so every seat
    re-homes.

## Wrap-not-closeout

11. The ceremony doubles as the durability wrap at a NON-terminal
    boundary: finish with a loss scan — `git status` clean, no unpushed
    refs, napkin and seated block current — with monitors up and the
    seat live. A terminal boundary (seat or session ending) is
    [`wrap`](../wrap/SKILL-CANONICAL.md)'s moment instead, which this
    skill never substitutes for.

## Related surfaces

- [`coordination-branch-24h-lifetime`](../../rules/coordination-branch-24h-lifetime.md)
  — the doctrine: lifetime, DUE check, what rides the branch.
- [`silence-is-never-liveness`](../../rules/silence-is-never-liveness.md)
  — the settle watch and heartbeat re-arm discipline.
- [`stage-by-explicit-pathspec`](../../rules/stage-by-explicit-pathspec.md),
  [`never-use-git-to-remove-work`](../../rules/never-use-git-to-remove-work.md)
  — the sweep's git discipline.
