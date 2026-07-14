import { describe, expect, it } from 'vitest';

import { resolveInvokingGitRoot } from '../src/commit-queue/git-root';

/**
 * Unit-scale description of the F-138 invoking-git-root resolver through its
 * injected git-runner seam. The two states that matter: a resolvable cwd
 * yields the worktree top level verbatim (trimmed), and an unresolvable cwd
 * is a LOUD refusal that names the cwd and the no-fallback contract — never
 * a silent fall-through to the coordination home.
 */
describe('resolveInvokingGitRoot', () => {
  it('returns the trimmed worktree top level reported by git', () => {
    const calls: { args: readonly string[]; cwd: string }[] = [];
    const root = resolveInvokingGitRoot('/repo-worktrees/lane/sub/dir', (args, cwd) => {
      calls.push({ args, cwd });
      return '/repo-worktrees/lane\n';
    });

    expect(root).toBe('/repo-worktrees/lane');
    expect(calls).toStrictEqual([
      { args: ['rev-parse', '--show-toplevel'], cwd: '/repo-worktrees/lane/sub/dir' },
    ]);
  });

  it('refuses loudly, naming the cwd and the no-fallback contract, when git cannot resolve a worktree', () => {
    const gitFailure = new Error('fatal: not a git repository');

    expect(() =>
      resolveInvokingGitRoot('/not-a-repo', () => {
        throw gitFailure;
      }),
    ).toThrow(
      /'\/not-a-repo' is not inside a git working tree.*no fallback to the coordination home/s,
    );
  });

  it('refuses loudly when git reports an empty top level rather than treating it as a root', () => {
    expect(() => resolveInvokingGitRoot('/somewhere', () => '\n')).toThrow(
      /returned.*nothing for '\/somewhere'.*no fallback to the coordination home/s,
    );
  });
});
