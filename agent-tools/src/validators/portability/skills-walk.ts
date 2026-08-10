/**
 * Canonical-skill tree walk for the portability validator.
 *
 * The ratified skills-estate shape is three tiers, closed: flat
 * (`<id>/SKILL-CANONICAL.md`), concern member (`<concern>/<id>/`), and
 * domain member (`<concern>/<domain>/<id>/`, owner-ruled 2026-08-10 —
 * e.g. `domain-craft/ui-design/`). A fourth level is never walked.
 * Directories with no canonical at any tier are the adapter checker's
 * loud-skip territory, not this validator's.
 */

export interface SkillsWalkFs {
  listSubdirs(relPath: string): Promise<readonly string[]>;
  exists(relPath: string): Promise<boolean>;
}

export interface CanonicalSkillWalk {
  /** Repo-relative canonical paths for frontmatter validation. */
  readonly canonicalPaths: string[];
  /** Flat leaf-name namespace for skills-lock shadow detection. */
  readonly leafNames: string[];
}

/**
 * Collect every canonical `SKILL-CANONICAL.md` at the three ratified tiers,
 * so frontmatter validation and the skills-lock cross-reference see the
 * same corpus.
 */
export async function collectCanonicalSkillPaths(fs: SkillsWalkFs): Promise<CanonicalSkillWalk> {
  const walk: CanonicalSkillWalk = { canonicalPaths: [], leafNames: [] };
  for (const rootDir of await fs.listSubdirs('.agent/skills')) {
    if (await collectIfCanonical(fs, walk, rootDir)) {
      continue;
    }
    await collectConcernMembers(fs, walk, rootDir);
  }
  return walk;
}

/** Concern tier: direct members, or one domain tier below — never deeper. */
async function collectConcernMembers(
  fs: SkillsWalkFs,
  walk: CanonicalSkillWalk,
  concernDir: string,
): Promise<void> {
  for (const memberDir of await fs.listSubdirs(`.agent/skills/${concernDir}`)) {
    const memberRel = `${concernDir}/${memberDir}`;
    if (await collectIfCanonical(fs, walk, memberRel)) {
      continue;
    }
    for (const leafDir of await fs.listSubdirs(`.agent/skills/${memberRel}`)) {
      await collectIfCanonical(fs, walk, `${memberRel}/${leafDir}`);
    }
  }
}

async function collectIfCanonical(
  fs: SkillsWalkFs,
  walk: CanonicalSkillWalk,
  relDir: string,
): Promise<boolean> {
  if (!(await fs.exists(`.agent/skills/${relDir}/SKILL-CANONICAL.md`))) {
    return false;
  }
  walk.canonicalPaths.push(`.agent/skills/${relDir}/SKILL-CANONICAL.md`);
  walk.leafNames.push(relDir.split('/').at(-1) ?? relDir);
  return true;
}
