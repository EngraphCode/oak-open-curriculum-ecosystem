# Never Commit to Main

Local `main` receives no commits, ever. `main` advances only via reviewed
pull requests. This covers every commit-creating operation — `git commit`,
`git merge`, `git cherry-pick`, `git commit --amend`, and any operation that
moves the `main` ref (e.g. `git pull --rebase` on a diverged `main`) — run
while `main` is the checked-out branch, in the primary checkout or any
worktree.

## Trigger

Any commit-creating git operation is about to run, or a session discovers
work-in-progress sitting on a checkout of `main`.

## Action

Branch first: `git switch -c <branch>` (staged and unstaged changes travel
with the switch), then commit on the branch and land via a pull request.

If commits are discovered already sitting on local `main` (the failure this
rule exists to prevent), do not push and do not delete them: fetch first
(`git fetch origin` — an unfetched `origin/main` ref is a cached read of a
moving target), preserve the commits on a branch (`git switch -c <branch>`),
re-home `main` to the remote (`git branch -f main origin/main` while `main`
is not checked out — git itself refuses if any worktree has it checked out),
and land the branch via a pull request.

## Failure Mode Prevented

Remote `main` is protected (pull requests required, non-fast-forward pushes
blocked, required status checks), so locally-authored `main` commits can
never be pushed directly — they strand, and while they sit, remote `main`
moves. Worked instance (2026-07-08): a session landed three commits on local
`main`; by discovery, remote `main` had advanced eleven commits, leaving a
diverged local `main` that took a preserve-and-re-home surgery plus a
pull request to resolve.

## Enforcement

Mechanical for every commit-creating path git exposes a pre-hook for; the
shared guard `.husky/refuse-commit-on-main.sh` is sourced by three hooks,
each covering the path git actually routes it through:

- `pre-commit` — plain `git commit` and `git commit --amend`;
- `pre-merge-commit` — clean merges, including a reflexive `git pull` on a
  diverged `main`;
- `prepare-commit-msg` — sequencer commits (`git cherry-pick`, `git revert`),
  which stay on the branch and never reach `pre-commit`.

Residual vectors NO client-side hook can see remain **rule-covered only**:
a fast-forward merge (a ref update, no commit created — and `git pull` on
`main` is the legitimate fast-forward from `origin/main`, so no hook could
distinguish the sanctioned case), a rebase moving the `main` ref, and a
fresh clone before `pnpm install` wires `core.hooksPath`. Remote branch
protection (pull requests required, non-fast-forward pushes blocked) is the
invariant that holds regardless; the guards are local hygiene that fails
fast.

The one sanctioned `main` writer — semantic-release in CI — commits with
`HUSKY=0` (`release.yml`), so the guards never fire there. That carve-out is
category delimitation (a sanctioned automated writer), not an exemption an
agent or human may use: `HUSKY=0` skips ALL hooks and is governed by the
same fresh per-invocation owner-authorisation discipline as `--no-verify`
([`no-verify-requires-fresh-authorisation`](no-verify-requires-fresh-authorisation.md)).
Neither bypass lifts this rule: even with a hook bypass authorised for
another reason, `main` still receives no local commits.

## Related Surfaces

- [`.husky/refuse-commit-on-main.sh`](../../.husky/refuse-commit-on-main.sh)
  — the shared mechanical gate, sourced by `pre-commit`, `pre-merge-commit`,
  and `prepare-commit-msg`.
- [PDR-126](../practice-core/decision-records/PDR-126-gates-land-strict-in-one-landing.md)
  — this gate landed strict with conformance in one landing (the stranded
  commits were re-homed in the same change).
- [`never-use-git-to-remove-work`](never-use-git-to-remove-work.md) — the
  recovery shape preserves the stranded commits on a branch; nothing is
  discarded.
- [The commit skill](../skills/commit/SKILL-CANONICAL.md) — carries this
  prohibition at the workflow moment.
