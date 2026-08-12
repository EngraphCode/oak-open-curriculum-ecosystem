/**
 * The Claude skill-permission census composition: the wiring that reads
 * `.claude/skills`, scopes it to the Practice class, and reports missing
 * `Skill(<name>)` entries. Extracted from the validator script so the
 * composition is importable and testable (the script itself binds its
 * repo root at module load and cannot be aimed at a fixture).
 */
import { lstat } from 'node:fs/promises';
import path from 'node:path';

import { realCarriageReadFs } from '../../skills-adapter-generate/carriage-fs.js';
import { surfaceRootGuardFailure } from '../../skills-adapter-generate/surface-roots.js';

import { listSubdirs, readOptionalText } from './portability-fs.js';
import { getSkillPermissionIssues, selectPracticeSkillDirs } from './skill-permission-checks.js';
import { CLAUDE_SETTINGS_PATH } from './portability-constants.js';

/**
 * The Claude permission census, scoped to the Practice class. Guards the
 * `.claude/skills` surface root first (a symlinked root or ancestor
 * would census directories outside the repo — read-through channel,
 * security round 2 2026-08-12), then selects the marker-carrying
 * projections (`selectPracticeSkillDirs`, whose reader is lstat-gated so
 * a symlinked `SKILL.md` is never read through) and reports any missing
 * `Skill(<name>)` entries. Vendor-class skills are the external
 * machinery's business and never censused.
 */
export async function practiceSkillPermissionIssues(
  repoRoot: string,
  permissions: string[],
): Promise<string[]> {
  const rootGuard = await surfaceRootGuardFailure({
    root: path.join(repoRoot, '.claude/skills'),
    surface: '.claude/skills',
    repoReal: await realCarriageReadFs.resolveRealPath(repoRoot),
    resolveRealPath: (p) => realCarriageReadFs.resolveRealPath(p),
  });
  if (rootGuard !== undefined) {
    return [`${CLAUDE_SETTINGS_PATH}: ${rootGuard}`];
  }
  const claudeSkillDirs = await selectPracticeSkillDirs(
    await listSubdirs(repoRoot, '.claude/skills'),
    (dirName) => readClaudeStubText(repoRoot, dirName),
  );
  return getSkillPermissionIssues({
    claudeCommandFiles: [],
    claudeSkillDirs,
    claudeSettingsPermissions: permissions,
  });
}

/** Read a `.claude/skills/<dir>/SKILL.md` for census classification —
 * `undefined` when absent OR not a regular file (a symlinked stub is
 * never read through to borrow a genuine stub's content). */
async function readClaudeStubText(repoRoot: string, dirName: string): Promise<string | undefined> {
  const stubPath = `.claude/skills/${dirName}/SKILL.md`;
  try {
    if (!(await lstat(path.join(repoRoot, stubPath))).isFile()) {
      return undefined;
    }
  } catch {
    return undefined;
  }
  return (await readOptionalText(repoRoot, stubPath)).value ?? undefined;
}
