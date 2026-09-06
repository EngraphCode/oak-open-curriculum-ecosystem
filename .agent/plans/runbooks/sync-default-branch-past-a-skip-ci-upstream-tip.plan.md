---
id: sync-default-branch-past-a-skip-ci-upstream-tip
node_type: runbook
name: "Sync a default branch past an upstream tip that carries the CI-skip token"
overview: "Land an upstream sync whose tip is a release commit marked with the CI-skip token, so the default branch's required checks can report, by adding one empty commit on a dated sync branch and merging by merge commit."
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: organisational-identity-below-the-tree
impact_areas:
  - practice-and-estate
tickets: []
depends_on: []
owner_gates: []
last_updated: 2026-09-06
---

# Sync a default branch past an upstream tip that carries the CI-skip token

## When to run

When this repository tracks an upstream whose default-branch tip is a release commit
marked with the CI-skip token: a sync pull request whose head IS that commit gets no
file-based workflow runs on either repository, so the default branch's required checks can
never report, and closing and reopening the pull request changes nothing.

## User groups and value

The seat landing the sync, and every seat whose lane starts from the default branch
afterwards: the default branch carries upstream's tree with its required checks reported,
and no seat re-derives the recipe at the wall.

## Preconditions

- The upstream mirror branch on this remote is at the tip to be synced (check: the remote
  branch's tip equals upstream's default-branch tip).
- The working tree is clean on a dedicated worktree (check: the status read is empty).
- The configured bot identity can commit and push (check: the identity preflight passes);
  the empty commit carries the human's authority through the author field, as every commit
  on this repository does.

## Steps

1. `agent` — cut a dated sync branch at the upstream tip. Verification: the branch's tip
   equals the mirror's tip.
2. `agent` — add ONE empty commit on the normal bot commit path (committer the bot, author
   the human, the repository's standing action map) whose message names the situation
   WITHOUT spelling the skip token: the host scans the whole head commit message, and a first
   attempt that quoted the token was skipped exactly like the release commit (2026-09-02).
   Verification: the commit is empty and its message carries no bracketed marker.
3. `agent` — open the pull request to the default branch. Verification: every workflow
   runs on the empty head.
4. `agent` — triage every reviewer thread under the normal review-round discipline; a
   finding about upstream code is never cured on the sync (a cure would diverge the tree
   from upstream), so its disposition is a signed reply naming the route — an upstream
   report, or a follow-up lane on this repository — and the thread is resolved on that
   route, never on a canned line; a finding about the sync itself (the empty commit, the
   branch shape) is cured here. The ruleset requires resolution. Verification: zero
   unresolved threads, each with a route in its reply.
5. `agent` — merge by MERGE COMMIT with the head pinned; squash or rebase would diverge the
   history from upstream. Verification: the merge commit's second parent is the sync tip.
6. `agent` — delete the sync branch after the merge is proven an ancestor of the default
   branch.

Amendment (2026-09-03): once one sync has landed, the default branch carries that sync's
empty and merge commits, which upstream never sees, so the NEXT sync branch cut at the
upstream tip reads BEHIND under the up-to-date requirement and cannot merge. The cure runs
AFTER step 3, because the host's update-branch acts on an open pull request: open the pull
request, update its branch server-side (a merge of the default branch into the sync
branch), re-verify that every workflow runs on the new head, then steps 4 to 6 as written.

## Verification

The default branch's tree equals the upstream tip's tree: `git diff --quiet <default>
<upstream-tip>` prints nothing and exits zero. The upstream mirror branch on the remote is
untouched.

## Rollback

Steps 1 to 4 change no shared state beyond a branch and a pull request, both deletable.
Step 5 has no rollback beyond a forward-going revert merge, which would itself diverge from
upstream; the owner accepted that shape when the recipe was first used (2026-09-02).
