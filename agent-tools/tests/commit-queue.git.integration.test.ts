import { execFileSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { getStagedBundle } from '../src/commit-queue/git';
import { resolveTrustedGit } from '../src/core/trusted-git';

function git(cwd: string, ...args: string[]): string {
  return execFileSync(resolveTrustedGit(), args, { cwd, encoding: 'utf8' });
}

describe('getStagedBundle rename representation', () => {
  let repo: string | undefined;

  afterEach(async () => {
    if (repo !== undefined) {
      await rm(repo, { recursive: true, force: true });
      repo = undefined;
    }
  });

  it('reports a staged rename as its deletion AND its addition, never a collapsed pair', async () => {
    repo = await mkdtemp(path.join(tmpdir(), 'commit-queue-git-'));
    git(repo, 'init');
    git(repo, 'config', 'user.email', 'test@example.com');
    git(repo, 'config', 'user.name', 'Test');
    git(repo, 'config', 'commit.gpgsign', 'false');
    await writeFile(path.join(repo, 'old-name.ts'), 'export const value = 1;\n', 'utf8');
    git(repo, 'add', 'old-name.ts');
    git(repo, 'commit', '-m', 'seed');
    git(repo, 'mv', 'old-name.ts', 'new-name.ts');

    const bundle = getStagedBundle({ gitRoot: repo, pathspec: ['old-name.ts', 'new-name.ts'] });

    // Both sides must be visible: the verify comparison is exact against the
    // intent file list, and the pathspec commit needs the deletion side or its
    // temporary index still tracks a file the worktree no longer has.
    const names = bundle.stagedNameOnly.split('\n').filter(Boolean);
    expect(names).toContain('old-name.ts');
    expect(names).toContain('new-name.ts');
    expect(bundle.stagedNameStatus).not.toMatch(/^R/mu);
    expect(bundle.stagedNameStatus).toMatch(/^D\told-name\.ts$/mu);
    expect(bundle.stagedNameStatus).toMatch(/^A\tnew-name\.ts$/mu);
  });
});
