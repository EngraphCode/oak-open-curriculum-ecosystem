#!/usr/bin/env sh

# Shared branch guard (.agent/rules/never-commit-to-main.md): main advances
# only via reviewed pull requests. Sourced by the .husky hooks that git
# routes commit-creating or ref-rewriting operations through — pre-commit
# (plain/amend commits), pre-merge-commit (clean merges), prepare-commit-msg
# (sequencer commits: cherry-pick, revert), applypatch-msg (git am, checked
# BEFORE the patch touches the tree so a patch cannot edit its own guard),
# and pre-rebase (a rebase rewriting main). Each hook sets GUARD_HINT to its
# own recovery move; pre-rebase passes the branch under rebase via
# GUARD_BRANCH, and every other hook sets it EMPTY before sourcing so an
# ambient exported value cannot redirect the check (empty falls through to
# the checked-out branch). Hooks run with cwd at the working-tree top, so the
# .husky-relative source path resolves in the primary checkout and in every
# worktree. Detached-HEAD states (e.g. mid-rebase replays) resolve no
# branch name and pass. Residual vectors no client hook can see
# (fast-forward merges, fresh clones before install) are covered by the
# rule and by remote branch protection.
current_branch="${GUARD_BRANCH:-$(git symbolic-ref --quiet --short HEAD || true)}"
if [ "$current_branch" = "main" ]; then
  echo "❌ Refusing to commit on 'main' — main advances only via pull requests."
  echo "💡 ${GUARD_HINT:-Move the work to a branch: git switch -c <branch>}"
  exit 1
fi
