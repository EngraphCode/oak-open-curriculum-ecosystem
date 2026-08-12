import { afterEach, describe, expect, it } from 'vitest';

import { adapterStubPointerLine } from '../../src/skills-adapter-generate/adapter-stub';
import { practiceSkillPermissionIssues } from '../../src/validators/portability/skill-census';

import {
  cleanupSandboxes,
  removeRepoPath,
  sandboxRepo,
  symlinkRepoPath,
  writeRepoFile,
} from './test-helpers/skills-repo-sandbox';

const stub = (title: string, pointer: string): string =>
  `---\nname: x\ndescription: y\n---\n\n# ${title} (Claude Code)\n\n${adapterStubPointerLine(pointer)}\n`;

afterEach(() => {
  cleanupSandboxes();
});

describe('practiceSkillPermissionIssues over a real filesystem', () => {
  it('censuses only marker-carrying projections, ignoring a Vendor entry — and reports the missing Skill() entry', async () => {
    const root = sandboxRepo();
    writeRepoFile(
      root,
      '.claude/skills/oak-commit/SKILL.md',
      stub('Commit', 'commit/SKILL-CANONICAL.md'),
    );
    writeRepoFile(root, '.claude/skills/clerk/SKILL.md', '# Clerk\n\nVendor body, no marker.\n');

    const issues = await practiceSkillPermissionIssues(root, []);

    expect(issues).toStrictEqual([
      '.claude/settings.json: Claude skill adapter "oak-commit" has no Skill(oak-commit) entry in permissions.allow',
    ]);
  });

  it('is silent when the sole Practice projection is permitted', async () => {
    const root = sandboxRepo();
    writeRepoFile(
      root,
      '.claude/skills/oak-commit/SKILL.md',
      stub('Commit', 'commit/SKILL-CANONICAL.md'),
    );

    const issues = await practiceSkillPermissionIssues(root, ['Skill(oak-commit)']);

    expect(issues).toStrictEqual([]);
  });

  it('refuses a symlinked surface root rather than censusing directories outside the repo', async () => {
    const root = sandboxRepo();
    const outside = sandboxRepo();
    writeRepoFile(
      outside,
      'skills/oak-external/SKILL.md',
      stub('External', 'external/SKILL-CANONICAL.md'),
    );
    removeRepoPath(root, '.claude/skills');
    symlinkRepoPath(root, '.claude/skills', `${outside}/skills`);

    const issues = await practiceSkillPermissionIssues(root, []);

    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatch(/resolves outside/);
    expect(issues.some((issue) => issue.includes('oak-external'))).toBe(false);
  });
});
