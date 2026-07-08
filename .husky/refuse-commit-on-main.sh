#!/usr/bin/env sh

# Shared branch guard (.agent/rules/never-commit-to-main.md): main advances
# only via reviewed pull requests. Sourced by pre-commit, pre-merge-commit,
# prepare-commit-msg, and pre-applypatch — git fires a different hook per
# commit-creating path (plain/amend commit; clean merge; sequencer commits
# like cherry-pick and revert; mailbox applies via git am), so the guard
# lives once here and each hook sets GUARD_HINT to its own recovery move. Hooks run with cwd at the working-tree top, so the
# `.husky/`-relative source path resolves in the primary checkout and in
# every worktree. The one sanctioned main writer — semantic-release in CI —
# runs with HUSKY=0 (release.yml): the husky shim (.husky/_/h) exits before
# sourcing any hook script when HUSKY=0, so no guard fires there — this
# script itself never needs to read the variable. Detached-HEAD
# states (e.g. mid-rebase replays) resolve no branch name and pass. Residual
# vectors no client hook can see (fast-forward merges, rebase ref-moves,
# fresh clones before install) are covered by the rule and by remote branch
# protection.
current_branch="$(git symbolic-ref --quiet --short HEAD || true)"
if [ "$current_branch" = "main" ]; then
  echo "❌ Refusing to commit on 'main' — main advances only via pull requests."
  echo "💡 ${GUARD_HINT:-Move the work to a branch: git switch -c <branch>}"
  exit 1
fi
