import { describe, expect, it } from 'vitest';

import {
  clearGeneratedAdapters,
  readLockedSkillIds,
  type ClearFs,
} from '../../src/skills-adapter-generate/clear';

function makeClearFs(subdirectories: ReadonlyMap<string, readonly string[]>): {
  readonly fs: ClearFs;
  readonly removed: string[];
} {
  const removed: string[] = [];
  return {
    fs: {
      async listSubdirectoryNames(path) {
        return subdirectories.get(path) ?? [];
      },
      async removeDirectory(path) {
        removed.push(path);
      },
    },
    removed,
  };
}

describe('clearGeneratedAdapters', () => {
  const repoRoot = '/repo';
  const surfaces = new Map<string, readonly string[]>([
    ['/repo/.claude/skills', ['oak-commit', 'skill-creator']],
    ['/repo/.agents/skills', ['oak-commit', 'clerk', 'skill-creator']],
  ]);

  it('removes generated adapter directories while preserving every lock-pinned id', async () => {
    const { fs, removed } = makeClearFs(surfaces);
    const lockedIds = new Set(['clerk', 'skill-creator']);

    await clearGeneratedAdapters(repoRoot, lockedIds, fs);

    expect(new Set(removed)).toEqual(
      new Set(['/repo/.claude/skills/oak-commit', '/repo/.agents/skills/oak-commit']),
    );
  });

  it('removes every subdirectory when the lock pins nothing', async () => {
    const { fs, removed } = makeClearFs(surfaces);

    await clearGeneratedAdapters(repoRoot, new Set<string>(), fs);

    expect(new Set(removed)).toEqual(
      new Set([
        '/repo/.claude/skills/oak-commit',
        '/repo/.claude/skills/skill-creator',
        '/repo/.agents/skills/oak-commit',
        '/repo/.agents/skills/clerk',
        '/repo/.agents/skills/skill-creator',
      ]),
    );
  });
});

describe('readLockedSkillIds', () => {
  const lockPath = '/repo/skills-lock.json';
  const validLock = JSON.stringify({
    version: 1,
    skills: {
      clerk: { source: 'clerk/skills', sourceType: 'github', computedHash: 'abc' },
      'skill-creator': { source: 'anthropics/skills', sourceType: 'github', computedHash: 'def' },
    },
  });

  it('returns the locked id set for a valid lock file', async () => {
    const result = await readLockedSkillIds(lockPath, async () => validLock);

    expect(result).toEqual({ kind: 'ok', value: new Set(['clerk', 'skill-creator']) });
  });

  it('returns an error when the lock file cannot be read — never an empty set', async () => {
    const result = await readLockedSkillIds(lockPath, () =>
      Promise.reject(new Error('ENOENT: no such file')),
    );

    expect(result.kind).toBe('error');
    expect(result.kind === 'error' && result.message).toContain(lockPath);
  });

  it('returns an error when the lock file is not valid JSON', async () => {
    const result = await readLockedSkillIds(lockPath, async () => '{ not json');

    expect(result.kind).toBe('error');
    expect(result.kind === 'error' && result.message).toContain('invalid skills-lock.json');
  });

  it('returns an error when the lock file fails schema validation', async () => {
    const invalidLock = JSON.stringify({ version: 1, skills: { clerk: { source: 'x' } } });

    const result = await readLockedSkillIds(lockPath, async () => invalidLock);

    expect(result.kind).toBe('error');
    expect(result.kind === 'error' && result.message).toContain('invalid skills-lock.json');
  });
});
