import { describe, expect, it } from 'vitest';

import { adapterStubPointerLine } from '../../src/skills-adapter-generate/adapter-stub';
import {
  clearGeneratedAdapters,
  isMissingSurface,
  type ClearFs,
} from '../../src/skills-adapter-generate/clear';

const OURS = `# Commit (Claude Code)\n\n${adapterStubPointerLine('commit/SKILL-CANONICAL.md')}\n`;
const FOREIGN = '# Clerk\n\nVendor skill body — no derivation marker.\n';

function makeClearFs(input: {
  readonly subdirectories: ReadonlyMap<string, readonly string[]>;
  readonly stubs: ReadonlyMap<string, string>;
}): {
  readonly fs: ClearFs;
  readonly removed: string[];
} {
  const removed: string[] = [];
  return {
    fs: {
      async listSubdirectoryNames(path) {
        return { kind: 'ok', names: input.subdirectories.get(path) ?? [] };
      },
      async readStubOrUndefined(path) {
        return { kind: 'ok', value: input.stubs.get(path) };
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
  const stubs = new Map<string, string>([
    ['/repo/.claude/skills/oak-commit/SKILL.md', OURS],
    ['/repo/.claude/skills/skill-creator/SKILL.md', FOREIGN],
    ['/repo/.agents/skills/oak-commit/SKILL.md', OURS],
    ['/repo/.agents/skills/clerk/SKILL.md', FOREIGN],
    // skill-creator on the agents surface has no SKILL.md at all.
  ]);

  it('removes exactly the directories whose stub carries the class marker — membership by content, never by name', async () => {
    const { fs, removed } = makeClearFs({ subdirectories: surfaces, stubs });

    const result = await clearGeneratedAdapters(repoRoot, fs);

    expect(result).toEqual({ kind: 'ok' });
    expect(new Set(removed)).toEqual(
      new Set(['/repo/.claude/skills/oak-commit', '/repo/.agents/skills/oak-commit']),
    );
  });

  it('collects a projection generated under a previous prefix: the marker recognises it whatever the directory is called', async () => {
    const { fs, removed } = makeClearFs({
      subdirectories: new Map([['/repo/.claude/skills', ['legacy-commit']]]),
      stubs: new Map([['/repo/.claude/skills/legacy-commit/SKILL.md', OURS]]),
    });

    const result = await clearGeneratedAdapters(repoRoot, fs);

    expect(result).toEqual({ kind: 'ok' });
    expect(removed).toEqual(['/repo/.claude/skills/legacy-commit']);
  });

  it('aborts with an error and removes nothing when a surface cannot be listed', async () => {
    const removed: string[] = [];
    const fs: ClearFs = {
      async listSubdirectoryNames() {
        return { kind: 'error', message: 'cannot list /repo/.claude/skills: EACCES' };
      },
      async readStubOrUndefined() {
        return { kind: 'ok', value: undefined };
      },
      async removeDirectory(path) {
        removed.push(path);
      },
    };

    const result = await clearGeneratedAdapters(repoRoot, fs);

    expect(result.kind).toBe('error');
    expect(removed).toEqual([]);
  });

  it('aborts with an error when an entry cannot be classified: an unreadable stub is never silently kept or removed', async () => {
    const removed: string[] = [];
    const fs: ClearFs = {
      async listSubdirectoryNames(path) {
        return path === '/repo/.claude/skills'
          ? { kind: 'ok', names: ['oak-commit'] }
          : { kind: 'ok', names: [] };
      },
      async readStubOrUndefined(path) {
        return { kind: 'error', message: `cannot read ${path}: EACCES` };
      },
      async removeDirectory(path) {
        removed.push(path);
      },
    };

    const result = await clearGeneratedAdapters(repoRoot, fs);

    expect(result.kind).toBe('error');
    expect(removed).toEqual([]);
  });
});

describe('isMissingSurface', () => {
  it('classifies an absent surface (ENOENT) as missing — read as empty, not an error', () => {
    expect(isMissingSurface({ code: 'ENOENT', message: 'no such file' })).toBe(true);
  });

  it('classifies every other failure as an error, never an empty surface', () => {
    expect(isMissingSurface({ code: 'EACCES', message: 'permission denied' })).toBe(false);
    expect(isMissingSurface({ code: 'ENOTDIR', message: 'not a directory' })).toBe(false);
    expect(isMissingSurface(new Error('plain error, no code'))).toBe(false);
    expect(isMissingSurface(undefined)).toBe(false);
  });
});
