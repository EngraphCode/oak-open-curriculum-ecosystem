import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { resolveSweepPaths } from './refound-sweep.js';
import { runSweep } from './refound-sweep-helpers.js';
import { parseSweepHit, SWEEP_HITS_SEGMENT, type SweepHit } from './refound-sweep-model.js';

/**
 * Integration behaviours of `refound-sweep` over real temporary live trees:
 * sweep-class-only scope, instrument self-exclusion under a covering glob,
 * verbatim hits as an adjudication queue (a hit run still succeeds), binary
 * skip, the unratified-rule refusal, and double-run byte identity.
 */

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

/** Write a tree of files (string or bytes) under `root`, creating parents. */
async function writeTree(root: string, files: Record<string, string | Buffer>): Promise<void> {
  for (const [relPath, content] of Object.entries(files)) {
    const absPath = path.join(root, relPath);
    await mkdir(path.dirname(absPath), { recursive: true });
    await writeFile(absPath, content);
  }
}

interface Fixture {
  readonly repoRoot: string;
  readonly ruleAbsPath: string;
  readonly outDirAbs: string;
}

async function makeFixture(options: {
  readonly ratifiedBy?: string | null;
  readonly sweepGlobs?: readonly string[];
  readonly files: Record<string, string | Buffer>;
}): Promise<Fixture> {
  const repoRoot = await mkdtemp(path.join(tmpdir(), 'refound-sweep-'));
  tempRoots.push(repoRoot);
  const rule = {
    version: 1,
    ratifiedBy: 'ratifiedBy' in options ? options.ratifiedBy : '.agent/decisions/g1.md',
    classes: [
      { id: 'plans', globs: ['.agent/plans/**'], verdict: 'in', reason: 'estate' },
      {
        id: 'sweep-surfaces',
        globs: [...(options.sweepGlobs ?? ['.agent/prompts/**'])],
        verdict: 'sweep',
        reason: 'live operational surface',
      },
    ],
  };
  await writeTree(repoRoot, {
    ...options.files,
    '.agent/plans-refounding/freeze-rule.json': `${JSON.stringify(rule, null, 2)}\n`,
  });
  const outDirAbs = path.join(repoRoot, '.agent/plans-refounding');
  return { repoRoot, ruleAbsPath: path.join(outDirAbs, 'freeze-rule.json'), outDirAbs };
}

async function readHits(outDirAbs: string): Promise<SweepHit[]> {
  const raw = await readFile(path.join(outDirAbs, SWEEP_HITS_SEGMENT), 'utf8');
  const parsed = raw
    .split('\n')
    .filter((line) => line !== '')
    .map((line): unknown => JSON.parse(line))
    .map((json) => parseSweepHit(json));
  expect(parsed.every((hit) => hit.ok)).toBe(true);
  return parsed.flatMap((hit) => (hit.ok ? [hit.value] : []));
}

describe('runSweep — the adjudication queue', () => {
  it('captures verbatim marker lines from sweep classes only, and still succeeds', async () => {
    const fixture = await makeFixture({
      files: {
        '.agent/prompts/opener.md': 'clean line\nTODO: port the opener\n',
        '.agent/prompts/clean.md': 'nothing to see\n',
        '.agent/plans/in-class.md': 'todo: an in-class file is NOT a sweep surface\n',
      },
    });
    const result = await runSweep(fixture);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.scannedFiles).toBe(2);
      expect(result.value.hits).toBe(1);
    }
    const hits = await readHits(fixture.outDirAbs);
    expect(hits).toHaveLength(1);
    expect(hits[0]?.file).toBe('.agent/prompts/opener.md');
    expect(hits[0]?.line).toBe(2);
    expect(hits[0]?.text).toBe('TODO: port the opener');
    expect(hits[0]?.markers).toEqual(['todo']);
  });

  it('excludes the instrument homes by construction, even under a covering glob', async () => {
    const fixture = await makeFixture({
      sweepGlobs: ['**'],
      files: {
        '.agent/prompts/real.md': 'todo: a real sweep hit\n',
        '.agent/plans-refounding/decoy.md': 'todo: artefact-home decoy\n',
        'agent-tools/src/refounding/decoy.ts': '// todo: instrument decoy\n',
      },
    });
    const result = await runSweep(fixture);
    expect(result.ok).toBe(true);
    const hits = await readHits(fixture.outDirAbs);
    expect(hits.map((h) => h.file)).toEqual(['.agent/prompts/real.md']);
  });

  it('skips binary files (null-byte sniff) instead of matching inside them', async () => {
    const fixture = await makeFixture({
      files: {
        '.agent/prompts/blob.bin': Buffer.concat([Buffer.from([0x00]), Buffer.from('todo\n')]),
        '.agent/prompts/real.md': 'still needs a home\n',
      },
    });
    const result = await runSweep(fixture);
    expect(result.ok).toBe(true);
    const hits = await readHits(fixture.outDirAbs);
    expect(hits.map((h) => h.file)).toEqual(['.agent/prompts/real.md']);
  });

  it('writes byte-identical hits on a double run (determinism contract)', async () => {
    const fixture = await makeFixture({
      files: { '.agent/prompts/opener.md': 'TODO one\npending two\n' },
    });
    expect((await runSweep(fixture)).ok).toBe(true);
    const first = await readFile(path.join(fixture.outDirAbs, SWEEP_HITS_SEGMENT));
    expect((await runSweep(fixture)).ok).toBe(true);
    const second = await readFile(path.join(fixture.outDirAbs, SWEEP_HITS_SEGMENT));
    expect(first.equals(second)).toBe(true);
  });
});

describe('runSweep — refusal chain (nothing written)', () => {
  it('refuses an unratified rule', async () => {
    const fixture = await makeFixture({
      ratifiedBy: null,
      files: { '.agent/prompts/opener.md': 'todo\n' },
    });
    const result = await runSweep(fixture);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('unratified');
    }
    expect(existsSync(path.join(fixture.outDirAbs, SWEEP_HITS_SEGMENT))).toBe(false);
  });

  it('refuses a sweep set that matches no files (a mis-run, not an empty queue)', async () => {
    const fixture = await makeFixture({
      files: { '.agent/plans/only-in-class.md': 'no sweep surfaces exist\n' },
    });
    const result = await runSweep(fixture);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('no files');
    }
    expect(existsSync(path.join(fixture.outDirAbs, SWEEP_HITS_SEGMENT))).toBe(false);
  });
});

describe('resolveSweepPaths (entry-level write-target resolution)', () => {
  it('accepts a not-yet-existing out dir alongside an existing rule (the sweep creates its own artefact home)', async () => {
    const rootAbs = await mkdtemp(path.join(tmpdir(), 'refound-sweep-resolve-'));
    tempRoots.push(rootAbs);
    await writeFile(path.join(rootAbs, 'freeze-rule.json'), '{}', 'utf8');
    const resolved = resolveSweepPaths(rootAbs, {
      rulePath: 'freeze-rule.json',
      outDir: 'artefacts/fresh-home',
    });
    expect(resolved.ok).toBe(true);
    if (resolved.ok) {
      expect(resolved.value.outDirAbs).toBe(path.join(rootAbs, 'artefacts/fresh-home'));
    }
    expect(existsSync(path.join(rootAbs, 'artefacts'))).toBe(false);
  });

  it('refuses a `..`-escaping out dir with a containment verdict, and a missing rule', async () => {
    const rootAbs = await mkdtemp(path.join(tmpdir(), 'refound-sweep-resolve-'));
    tempRoots.push(rootAbs);
    await writeFile(path.join(rootAbs, 'freeze-rule.json'), '{}', 'utf8');
    const escaped = resolveSweepPaths(rootAbs, {
      rulePath: 'freeze-rule.json',
      outDir: '../escaped-home',
    });
    expect(escaped.ok).toBe(false);
    if (!escaped.ok) {
      expect(escaped.error.message).toContain('resolves outside the repository');
    }
    expect(resolveSweepPaths(rootAbs, { rulePath: 'absent-rule.json', outDir: '.' }).ok).toBe(
      false,
    );
  });
});
