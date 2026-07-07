import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { glob } from 'tinyglobby';
import { afterEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  compareByCodeUnit,
  countLines,
  renderJsonArtefact,
  sha256Hex,
  type Denominator,
  type DenominatorFile,
} from './refounding-artefacts.js';
import { DISCRIMINATION_PROOF_SEGMENT } from './refound-plant-orphan-transcript.js';
import { runPlantOrphan } from './refound-plant-orphan-runner.js';

/**
 * Integration behaviours of `refound-plant-orphan`: all three plants fire
 * their detectors on staged scratch copies, the transcript lands with a
 * parseable machine block, and the REAL frozen tree is never mutated —
 * asserted byte-for-byte.
 */

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

/** Write a tree of files under `root`, creating parents. */
async function writeTree(root: string, files: Record<string, string>): Promise<void> {
  for (const [relPath, content] of Object.entries(files)) {
    const absPath = path.join(root, relPath);
    await mkdir(path.dirname(absPath), { recursive: true });
    await writeFile(absPath, content);
  }
}

const TARGET_MD = [
  '# Target',
  'prose',
  '- item one',
  'prose two',
  '## Section',
  'prose three',
  'status: open',
  'prose four',
  'prose five',
  'prose six',
].join('\n');

// Frontmatter-led: line 1 is a `---` fence — a Net-A anchor but NOT a
// heading. It sorts BEFORE plans/target.md and would otherwise qualify, so
// selection passing over it pins the heading-anchor requirement (planting
// here would break both proofs: first post-plant anchor at 32, and the
// keyword plant would land inside frontmatter as a Net-A capture).
const FRONTMATTER_LED_MD = [
  '---',
  'title: frontmatter led',
  '---',
  '# Head',
  '- item',
  'status: open',
  'prose tail',
].join('\n');

interface Fixture {
  readonly repoRoot: string;
  readonly ruleAbsPath: string;
  readonly outDirAbs: string;
  readonly frozenRoot: string;
}

/** A repo fixture: artefact home with frozen tree + a live sweep surface. */
async function makeFixture(frozenFiles: Record<string, string>): Promise<Fixture> {
  const repoRoot = await mkdtemp(path.join(tmpdir(), 'refound-plant-'));
  tempRoots.push(repoRoot);
  const outDirAbs = path.join(repoRoot, '.agent/plans-refounding');
  const frozenRoot = path.join(outDirAbs, 'archive/frozen-v1');
  const rule = {
    version: 1,
    ratifiedBy: '.agent/decisions/g1.md',
    classes: [
      { id: 'plans', globs: ['.agent/plans/**'], verdict: 'in', reason: 'estate' },
      { id: 'prompts', globs: ['.agent/prompts/**'], verdict: 'sweep', reason: 'live surface' },
    ],
  };
  await writeTree(repoRoot, {
    '.agent/prompts/opener.md': 'intro line\ntodo: port me\n',
    '.agent/plans-refounding/freeze-rule.json': `${JSON.stringify(rule, null, 2)}\n`,
  });
  const rows: DenominatorFile[] = [];
  for (const [relPath, content] of Object.entries(frozenFiles)) {
    const bytes = Buffer.from(content);
    const absPath = path.join(frozenRoot, relPath);
    await mkdir(path.dirname(absPath), { recursive: true });
    await writeFile(absPath, bytes);
    rows.push({
      path: relPath,
      bytes: bytes.length,
      sha256: sha256Hex(bytes),
      lines: countLines(bytes),
      inventory_mode: 'lines',
    });
  }
  rows.sort((a, b) => compareByCodeUnit(a.path, b.path));
  const denominator: Denominator = {
    version: 1,
    generatedFrom: { freezeRuleVersion: 1, ratifiedBy: '.agent/decisions/g1.md' },
    files: rows,
    totals: {
      files: rows.length,
      lines: rows.reduce((sum, row) => sum + row.lines, 0),
      bytes: rows.reduce((sum, row) => sum + row.bytes, 0),
    },
  };
  await writeFile(
    path.join(outDirAbs, 'denominator.v1.json'),
    renderJsonArtefact(denominator),
    'utf8',
  );
  return {
    repoRoot,
    ruleAbsPath: path.join(outDirAbs, 'freeze-rule.json'),
    outDirAbs,
    frozenRoot,
  };
}

/** Hash every file under a root, keyed by relative path. */
async function hashTree(rootAbs: string): Promise<Map<string, string>> {
  const relPaths = await glob(['**'], { cwd: rootAbs, dot: true });
  const hashes = new Map<string, string>();
  for (const relPath of [...relPaths].sort(compareByCodeUnit)) {
    hashes.set(relPath, sha256Hex(await readFile(path.join(rootAbs, relPath))));
  }
  return hashes;
}

/** Assert the ONLY change under the whole fixture repo is the transcript. */
async function expectOnlyTranscriptAdded(
  fixture: Fixture,
  before: ReadonlyMap<string, string>,
): Promise<void> {
  const after = await hashTree(fixture.repoRoot);
  const transcriptRel = path
    .join('.agent/plans-refounding', DISCRIMINATION_PROOF_SEGMENT)
    .split(path.sep)
    .join('/');
  for (const [relPath, hash] of before) {
    expect(after.get(relPath)).toBe(hash);
  }
  expect([...after.keys()].filter((rel) => !before.has(rel))).toEqual([transcriptRel]);
}

describe('runPlantOrphan — the discrimination proofs', () => {
  it('fires all three detectors, passes over the frontmatter-led candidate, and never mutates the real frozen tree', async () => {
    const fixture = await makeFixture({
      'plans/frontmatter-led.md': FRONTMATTER_LED_MD,
      'plans/other.md': '# Other\nbody\n',
      'plans/target.md': TARGET_MD,
    });
    const before = await hashTree(fixture.repoRoot);
    const result = await runPlantOrphan(fixture);
    expect(result.ok).toBe(true);
    if (result.ok) {
      // plans/frontmatter-led.md sorts first and would otherwise qualify;
      // its non-heading first line makes the selector pass over it.
      expect(result.value.preamble.file).toBe('plans/target.md');
      expect(result.value.preamble.lineStart).toBe(1);
      expect(result.value.preamble.lineEnd).toBe(30);
      expect(result.value.preamble.reasons).toEqual(['file-preamble', 'oversized-block']);
      expect(result.value.keyword.misspeltInInventory).toBe(false);
      expect(result.value.keyword.misspeltInResidueBlock).toBe(true);
      expect(result.value.keyword.controlNets).toEqual(['C']);
      expect(result.value.keyword.netCShift).toBe(1);
      expect(result.value.sweep.plantPresentInCopy).toBe(true);
      expect(result.value.sweep.sweepHitsForPlant).toBe(0);
      expect(result.value.sweep.sweepHitsForControl).toBe(1);
    }
    await expectOnlyTranscriptAdded(fixture, before);
  });

  it('writes a transcript whose machine block parses and reports every plant caught', async () => {
    const fixture = await makeFixture({
      'plans/other.md': '# Other\nbody\n',
      'plans/target.md': TARGET_MD,
    });
    expect((await runPlantOrphan(fixture)).ok).toBe(true);
    const transcript = await readFile(
      path.join(fixture.outDirAbs, DISCRIMINATION_PROOF_SEGMENT),
      'utf8',
    );
    expect(transcript).toContain('# Orphan-discrimination proof');
    const machineBlock = /```json\n([\s\S]*?)\n```/.exec(transcript);
    expect(machineBlock).not.toBeNull();
    const machineShape = z.object({
      preamble: z.object({ reasons: z.array(z.string()) }),
      keyword: z.object({ misspeltInInventory: z.boolean(), netCShift: z.number() }),
      sweep: z.object({
        sweepHitsForPlant: z.number(),
        sweepHitsForControl: z.number(),
        plantPresentInCopy: z.boolean(),
      }),
    });
    const machineRaw: unknown = JSON.parse(machineBlock?.[1] ?? '{}');
    const machine = machineShape.safeParse(machineRaw);
    expect(machine.success).toBe(true);
    if (machine.success) {
      expect(machine.data.preamble.reasons).toContain('file-preamble');
      expect(machine.data.keyword.misspeltInInventory).toBe(false);
      expect(machine.data.keyword.netCShift).toBe(1);
      expect(machine.data.sweep.sweepHitsForPlant).toBe(0);
      expect(machine.data.sweep.sweepHitsForControl).toBe(1);
      expect(machine.data.sweep.plantPresentInCopy).toBe(true);
    }
  });

  it('writes a byte-identical transcript on a double run (determinism contract)', async () => {
    const fixture = await makeFixture({
      'plans/other.md': '# Other\nbody\n',
      'plans/target.md': TARGET_MD,
    });
    expect((await runPlantOrphan(fixture)).ok).toBe(true);
    const first = await readFile(path.join(fixture.outDirAbs, DISCRIMINATION_PROOF_SEGMENT));
    expect((await runPlantOrphan(fixture)).ok).toBe(true);
    const second = await readFile(path.join(fixture.outDirAbs, DISCRIMINATION_PROOF_SEGMENT));
    expect(first.equals(second)).toBe(true);
  });
});

describe('runPlantOrphan — refusal chain (no transcript written)', () => {
  it('refuses when no file qualifies as a plant target', async () => {
    const fixture = await makeFixture({
      'plans/no-first-anchor.md': 'prose first\n# H\n- item\nstatus: x\n',
    });
    const result = await runPlantOrphan(fixture);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('no plant target');
    }
    expect(existsSync(path.join(fixture.outDirAbs, DISCRIMINATION_PROOF_SEGMENT))).toBe(false);
  });

  it('refuses when the denominator is absent', async () => {
    const fixture = await makeFixture({ 'plans/target.md': TARGET_MD });
    await rm(path.join(fixture.outDirAbs, 'denominator.v1.json'));
    const result = await runPlantOrphan(fixture);
    expect(result.ok).toBe(false);
    expect(existsSync(path.join(fixture.outDirAbs, DISCRIMINATION_PROOF_SEGMENT))).toBe(false);
  });
});
