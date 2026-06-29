import { describe, expect, it } from 'vitest';

import {
  parseGitWorktreeList,
  readGitWorktrees,
} from '../../src/collaboration-state/git-worktree-list';

const PORCELAIN = [
  'worktree /repo/oak-open-curriculum-ecosystem',
  'HEAD 1111111111111111111111111111111111111111',
  'branch refs/heads/coordination/team-tooling-session-2026-06-28',
  '',
  'worktree /repo/oak-spawn-flow',
  'HEAD 2222222222222222222222222222222222222222',
  'branch refs/heads/feat/spawn-worktree-view',
  '',
  'worktree /repo/oak-detached',
  'HEAD 3333333333333333333333333333333333333333',
  'detached',
  '',
].join('\n');

describe('parseGitWorktreeList — git ground-truth input for the work-state view', () => {
  it('parses path, short branch (refs/heads/ stripped), and HEAD per worktree', () => {
    expect(parseGitWorktreeList(PORCELAIN)).toStrictEqual([
      {
        path: '/repo/oak-open-curriculum-ecosystem',
        branch: 'coordination/team-tooling-session-2026-06-28',
        head: '1111111111111111111111111111111111111111',
      },
      {
        path: '/repo/oak-spawn-flow',
        branch: 'feat/spawn-worktree-view',
        head: '2222222222222222222222222222222222222222',
      },
      {
        path: '/repo/oak-detached',
        head: '3333333333333333333333333333333333333333',
      },
    ]);
  });

  it('leaves a detached-HEAD worktree without a branch', () => {
    const detached = parseGitWorktreeList('worktree /repo/d\nHEAD abc\ndetached\n');

    expect(detached[0].branch).toBeUndefined();
    expect(detached[0].path).toBe('/repo/d');
  });

  it('returns an empty list for empty git output', () => {
    expect(parseGitWorktreeList('')).toStrictEqual([]);
  });

  it('readGitWorktrees runs `git worktree list --porcelain` through the injected runner', () => {
    const calls: { args: readonly string[]; cwd: string }[] = [];
    const worktrees = readGitWorktrees('/repo/oak-spawn-flow', {
      runGit: (args, cwd) => {
        calls.push({ args, cwd });
        return PORCELAIN;
      },
    });

    expect(calls).toStrictEqual([
      { args: ['worktree', 'list', '--porcelain'], cwd: '/repo/oak-spawn-flow' },
    ]);
    expect(worktrees).toHaveLength(3);
  });
});
