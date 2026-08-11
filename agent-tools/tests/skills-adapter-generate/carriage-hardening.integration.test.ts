import { afterEach, describe, expect, it } from 'vitest';

import { checkAdapters } from '../../src/skills-adapter-generate/checker';
import { generateAdapters } from '../../src/skills-adapter-generate/generator';

import {
  chmodRepoFile,
  cleanupSandboxes,
  readRepoBytes,
  repoFileIsExecutable,
  repoPathExists,
  removeRepoPath,
  renameRepoPath,
  repoPathIsSymlink,
  sandboxRepo,
  symlinkRepoPath,
  writeRepoFile,
} from './test-helpers/skills-repo-sandbox';

const canonicalBody = `---
name: parallax
description: A canonical skill with supporting directories.
---

# Parallax

Body.
`;

const CANONICAL_DIR = '.agent/skills/cognition/parallax';

const EMPTY_LOCK: ReadonlySet<string> = new Set();

function seedSkill(root: string): void {
  writeRepoFile(root, `${CANONICAL_DIR}/SKILL-CANONICAL.md`, canonicalBody);
  writeRepoFile(root, `${CANONICAL_DIR}/references/orchestration.md`, '# Orchestration\n');
  writeRepoFile(root, `${CANONICAL_DIR}/scripts/render_graph.py`, 'print("render")\n');
}

afterEach(() => {
  cleanupSandboxes();
});

describe('symlink safety over a real filesystem', () => {
  it('never writes through a projected carried-file symlink: the external target keeps its bytes and the link is replaced by a real copy', async () => {
    const root = sandboxRepo();
    const outside = sandboxRepo();
    seedSkill(root);
    await generateAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });

    writeRepoFile(outside, 'victim.txt', 'external bytes stay\n');
    const linkPath = '.claude/skills/oak-parallax/references/orchestration.md';
    writeRepoFile(root, linkPath, ''); // ensure parent exists, then replace with a link
    removeRepoPath(root, `${linkPath}`);
    symlinkRepoPath(root, linkPath, `${outside}/victim.txt`);

    await generateAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });

    expect(readRepoBytes(outside, 'victim.txt')).toEqual(
      new TextEncoder().encode('external bytes stay\n'),
    );
    expect(repoPathIsSymlink(root, linkPath)).toBe(false);
    expect(readRepoBytes(root, linkPath)).toEqual(new TextEncoder().encode('# Orchestration\n'));
  });

  it('never arms a dangling projected symlink: regeneration must not create the link target', async () => {
    const root = sandboxRepo();
    const outside = sandboxRepo();
    seedSkill(root);
    await generateAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });

    const linkPath = '.claude/skills/oak-parallax/scripts/render_graph.py';
    removeRepoPath(root, `${linkPath}`);
    symlinkRepoPath(root, linkPath, `${outside}/hooks/pre-commit`);

    await generateAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });

    expect(repoPathExists(outside, 'hooks/pre-commit')).toBe(false);
    expect(repoPathIsSymlink(root, linkPath)).toBe(false);
    expect(readRepoBytes(root, linkPath)).toEqual(new TextEncoder().encode('print("render")\n'));
  });

  it('reports a projected symlink as a failing state instead of certifying green through it', async () => {
    const root = sandboxRepo();
    const outside = sandboxRepo();
    seedSkill(root);
    await generateAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });

    writeRepoFile(outside, 'victim.txt', '# Orchestration\n'); // byte-identical: only link-awareness can catch it
    const linkPath = '.claude/skills/oak-parallax/references/orchestration.md';
    removeRepoPath(root, `${linkPath}`);
    symlinkRepoPath(root, linkPath, `${outside}/victim.txt`);

    const result = await checkAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });

    const failing = [...result.orphaned, ...result.drifted, ...result.missing];
    expect(failing).toContain(`${root}/${linkPath}`);
  });

  it('prunes a symlinked carried-root directory as the link: the external tree stays untouched and a real directory replaces it', async () => {
    const root = sandboxRepo();
    const outside = sandboxRepo();
    seedSkill(root);
    writeRepoFile(outside, 'deep/existing.md', 'external tree stays\n');
    writeRepoFile(root, '.claude/skills/oak-parallax/SKILL.md', 'stub\n');
    symlinkRepoPath(root, '.claude/skills/oak-parallax/references', outside);

    await generateAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });

    expect(readRepoBytes(outside, 'deep/existing.md')).toEqual(
      new TextEncoder().encode('external tree stays\n'),
    );
    expect(repoPathExists(outside, 'orchestration.md')).toBe(false);
    expect(repoPathIsSymlink(root, '.claude/skills/oak-parallax/references')).toBe(false);
    expect(readRepoBytes(root, '.claude/skills/oak-parallax/references/orchestration.md')).toEqual(
      new TextEncoder().encode('# Orchestration\n'),
    );
  });

  it('refuses a canonical carried ROOT that is itself a symlink: nothing external is smuggled and both surfaces report the refusal', async () => {
    const root = sandboxRepo();
    const outside = sandboxRepo();
    writeRepoFile(root, `${CANONICAL_DIR}/SKILL-CANONICAL.md`, canonicalBody);
    writeRepoFile(outside, 'secret.txt', 'SECRET-EXTERNAL-BYTES\n');
    symlinkRepoPath(root, `${CANONICAL_DIR}/references`, outside);

    const generated = await generateAdapters({
      repoRoot: root,
      prefix: 'oak-',
      lockedIds: EMPTY_LOCK,
    });
    expect(generated.refused.some((message) => /symlink/.test(message))).toBe(true);
    expect(repoPathExists(root, '.claude/skills/oak-parallax/references/secret.txt')).toBe(false);
    expect(repoPathExists(root, '.claude/skills/oak-parallax/SKILL.md')).toBe(false);

    const checked = await checkAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });
    expect(checked.refused.some((message) => /symlink/.test(message))).toBe(true);
  });

  it('refuses a symlinked surface-root ANCESTOR: nothing in the linked tree is removed or written', async () => {
    const root = sandboxRepo();
    const outside = sandboxRepo();
    seedSkill(root);
    writeRepoFile(outside, 'skills/precious-external/KEEP.md', 'external tree stays\n');
    symlinkRepoPath(root, '.claude', outside);

    const generated = await generateAdapters({
      repoRoot: root,
      prefix: 'oak-',
      lockedIds: EMPTY_LOCK,
    });
    expect(generated.refused.some((message) => /resolves outside/.test(message))).toBe(true);
    expect(readRepoBytes(outside, 'skills/precious-external/KEEP.md')).toEqual(
      new TextEncoder().encode('external tree stays\n'),
    );

    const checked = await checkAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });
    expect(checked.refused.some((message) => /resolves outside/.test(message))).toBe(true);
    expect(checked.stale).toEqual([]);
  });

  it('refuses a canonical-side symlink loudly: nothing is emitted for the skill and both surfaces report the refusal', async () => {
    const root = sandboxRepo();
    const outside = sandboxRepo();
    seedSkill(root);
    writeRepoFile(outside, 'smuggled.md', 'external content\n');
    symlinkRepoPath(root, `${CANONICAL_DIR}/references/smuggled.md`, `${outside}/smuggled.md`);

    const generated = await generateAdapters({
      repoRoot: root,
      prefix: 'oak-',
      lockedIds: EMPTY_LOCK,
    });
    expect(generated.refused.some((message) => /symlink/.test(message))).toBe(true);
    expect(repoPathExists(root, '.claude/skills/oak-parallax/references/smuggled.md')).toBe(false);
    expect(repoPathExists(root, '.claude/skills/oak-parallax/SKILL.md')).toBe(false);

    const checked = await checkAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });
    expect(checked.refused.some((message) => /symlink/.test(message))).toBe(true);
  });
});

describe('shape transitions over a real filesystem', () => {
  it('cures a canonical file-to-directory transition instead of failing on the stale projected file', async () => {
    const root = sandboxRepo();
    seedSkill(root);
    writeRepoFile(root, `${CANONICAL_DIR}/references/topic`, 'was a file\n');
    await generateAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });

    removeRepoPath(root, `${CANONICAL_DIR}/references/topic`);
    writeRepoFile(root, `${CANONICAL_DIR}/references/topic/deep.md`, 'now a directory\n');

    await generateAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });

    expect(readRepoBytes(root, '.claude/skills/oak-parallax/references/topic/deep.md')).toEqual(
      new TextEncoder().encode('now a directory\n'),
    );
  });

  it('cures a canonical directory-to-file transition instead of failing on the stale projected directory', async () => {
    const root = sandboxRepo();
    seedSkill(root);
    writeRepoFile(root, `${CANONICAL_DIR}/references/topic/deep.md`, 'was a directory\n');
    await generateAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });

    removeRepoPath(root, `${CANONICAL_DIR}/references/topic`);
    writeRepoFile(root, `${CANONICAL_DIR}/references/topic`, 'now a file\n');

    await generateAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });

    expect(readRepoBytes(root, '.claude/skills/oak-parallax/references/topic')).toEqual(
      new TextEncoder().encode('now a file\n'),
    );
  });
});

describe('executable-mode carriage over a real filesystem', () => {
  it('reports executable-bit drift on a byte-identical carried copy, and regeneration restores the mode', async () => {
    const root = sandboxRepo();
    seedSkill(root);
    chmodRepoFile(root, `${CANONICAL_DIR}/scripts/render_graph.py`, 0o755);
    await generateAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });

    const projected = '.claude/skills/oak-parallax/scripts/render_graph.py';
    expect(repoFileIsExecutable(root, projected)).toBe(true);
    chmodRepoFile(root, projected, 0o644);

    const flagged = await checkAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });
    expect(flagged.drifted).toContain(`${root}/${projected}`);

    await generateAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });
    expect(repoFileIsExecutable(root, projected)).toBe(true);
  });
});

describe('projection-root reconciliation over a real filesystem', () => {
  it('reports a renamed canonical’s whole old projection as stale, and a generator run removes it from both surfaces', async () => {
    const root = sandboxRepo();
    seedSkill(root);
    await generateAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });

    renameRepoPath(root, CANONICAL_DIR, '.agent/skills/cognition/parallax-two');

    const flagged = await checkAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });
    expect(flagged.stale).toEqual([
      `${root}/.agents/skills/oak-parallax`,
      `${root}/.claude/skills/oak-parallax`,
    ]);

    await generateAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });

    expect(repoPathExists(root, '.claude/skills/oak-parallax')).toBe(false);
    expect(repoPathExists(root, '.agents/skills/oak-parallax')).toBe(false);
    expect(repoPathExists(root, '.claude/skills/oak-parallax-two/SKILL.md')).toBe(true);
    expect(repoPathExists(root, '.agents/skills/oak-parallax-two/scripts/render_graph.py')).toBe(
      true,
    );

    const after = await checkAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });
    expect(after.stale).toEqual([]);
  });

  it('never touches a lock-pinned vendored directory, whatever the sweep finds around it', async () => {
    const root = sandboxRepo();
    seedSkill(root);
    writeRepoFile(root, '.claude/skills/clerk/SKILL.md', 'vendored — generation cannot recreate\n');
    const lockedIds: ReadonlySet<string> = new Set(['clerk']);

    const flagged = await checkAdapters({ repoRoot: root, prefix: 'oak-', lockedIds });
    expect(flagged.stale).toEqual([]);

    await generateAdapters({ repoRoot: root, prefix: 'oak-', lockedIds });

    expect(readRepoBytes(root, '.claude/skills/clerk/SKILL.md')).toEqual(
      new TextEncoder().encode('vendored — generation cannot recreate\n'),
    );
  });

  it('never sweeps while discovery is incomplete: a skipped directory protects every projection', async () => {
    const root = sandboxRepo();
    seedSkill(root);
    await generateAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });

    // A hollow directory (no canonical inside) makes discovery incomplete;
    // an unreadable canonical presents identically. The existing projection
    // must survive — sweeping against a partial expected-set is deletion of
    // legitimate copies.
    renameRepoPath(
      root,
      `${CANONICAL_DIR}/SKILL-CANONICAL.md`,
      '.agent/skills/parked-canonical.md',
    );

    const outcome = await generateAdapters({
      repoRoot: root,
      prefix: 'oak-',
      lockedIds: EMPTY_LOCK,
    });

    expect(outcome.skipped.length).toBeGreaterThan(0);
    expect(repoPathExists(root, '.claude/skills/oak-parallax/SKILL.md')).toBe(true);
    expect(repoPathExists(root, '.agents/skills/oak-parallax/scripts/render_graph.py')).toBe(true);
  });

  it('reports no stale entries while discovery is incomplete — the checker never demands a sweep the generator refuses', async () => {
    const root = sandboxRepo();
    seedSkill(root);
    await generateAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });

    renameRepoPath(
      root,
      `${CANONICAL_DIR}/SKILL-CANONICAL.md`,
      '.agent/skills/parked-canonical-two.md',
    );

    const result = await checkAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });

    expect(result.skipped.length).toBeGreaterThan(0);
    expect(result.stale).toEqual([]);
  });

  it('never sweeps against an empty canonical set: an empty skills root protects every projection', async () => {
    const root = sandboxRepo();
    seedSkill(root);
    await generateAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });

    removeRepoPath(root, '.agent/skills/cognition');

    const outcome = await generateAdapters({
      repoRoot: root,
      prefix: 'oak-',
      lockedIds: EMPTY_LOCK,
    });

    expect(outcome.written).toEqual([]);
    expect(repoPathExists(root, '.claude/skills/oak-parallax/SKILL.md')).toBe(true);
    expect(repoPathExists(root, '.agents/skills/oak-parallax/SKILL.md')).toBe(true);
  });

  it('prunes a symlinked projection-root entry as the link, leaving its target untouched', async () => {
    const root = sandboxRepo();
    const outside = sandboxRepo();
    seedSkill(root);
    writeRepoFile(outside, 'elsewhere/SKILL.md', 'external skill tree\n');
    symlinkRepoPath(root, '.claude/skills/linked-estate', `${outside}/elsewhere`);

    const flagged = await checkAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });
    expect(flagged.stale).toEqual([`${root}/.claude/skills/linked-estate`]);

    await generateAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });

    expect(repoPathExists(root, '.claude/skills/linked-estate')).toBe(false);
    expect(readRepoBytes(outside, 'elsewhere/SKILL.md')).toEqual(
      new TextEncoder().encode('external skill tree\n'),
    );
  });
});

describe('same-length drift over a real filesystem', () => {
  it('detects a same-length byte difference in a carried copy (length comparison alone cannot)', async () => {
    const root = sandboxRepo();
    seedSkill(root);
    await generateAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });

    const projected = '.claude/skills/oak-parallax/references/orchestration.md';
    writeRepoFile(root, projected, '# Orchestratioz\n'); // same byte length as '# Orchestration\n'

    const flagged = await checkAdapters({ repoRoot: root, prefix: 'oak-', lockedIds: EMPTY_LOCK });

    expect(flagged.drifted).toEqual([`${root}/${projected}`]);
  });
});
