import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  compareByCodeUnit,
  countLines,
  renderJsonArtefact,
  sha256Hex,
  type Denominator,
  type DenominatorFile,
} from './refounding-artefacts.js';
import { INVENTORY_BASENAME } from './refound-inventory-model.js';
import { runInventory } from './refound-inventory-runner.js';
import { DISCRIMINATION_PROOF_SEGMENT } from './refound-plant-orphan-transcript.js';
import {
  buildResidueReport,
  parseResidueReport,
  RESIDUE_BASENAME,
  type ResidueReport,
} from './refound-residue-model.js';
import { runResidue } from './refound-residue-helpers.js';

/**
 * Integration behaviours of `refound-residue` over real artefact homes: the
 * anchored-block clustering (fenced content clusters to its opening-fence
 * anchor), end-to-end orphan detection, double-run byte identity, and the
 * refusal chain for missing or disagreeing inputs.
 */

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

/** Write frozen files, derive their denominator, and run the real inventory. */
async function makeInventoriedHome(files: Record<string, string>): Promise<string> {
  const outDirAbs = await mkdtemp(path.join(tmpdir(), 'refound-residue-'));
  tempRoots.push(outDirAbs);
  const frozenRoot = path.join(outDirAbs, 'archive/frozen-v1');
  const rows: DenominatorFile[] = [];
  for (const [relPath, content] of Object.entries(files)) {
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
  const inventoried = await runInventory({ outDirAbs });
  expect(inventoried.ok).toBe(true);
  return outDirAbs;
}

async function readReport(outDirAbs: string): Promise<ResidueReport> {
  const raw: unknown = JSON.parse(await readFile(path.join(outDirAbs, RESIDUE_BASENAME), 'utf8'));
  const parsed = parseResidueReport(raw);
  expect(parsed.ok).toBe(true);
  // The expect above already fails the test on a parse failure; the empty
  // report is a typed fallback so this helper never throws (ADR-088).
  return parsed.ok ? parsed.value : buildResidueReport([]);
}

const FENCED_FILE = ['# Head', '```yaml', 'key: value', '- fenced list', '```', 'tail prose'].join(
  '\n',
);

/** Commit a discrimination-proof transcript so a zero-orphan run is accepted. */
async function writeDiscriminationProof(outDirAbs: string): Promise<void> {
  const proofAbsPath = path.join(outDirAbs, DISCRIMINATION_PROOF_SEGMENT);
  await mkdir(path.dirname(proofAbsPath), { recursive: true });
  await writeFile(proofAbsPath, '# Orphan-discrimination proof (v1)\n', 'utf8');
}

describe('runResidue — clustering and orphans', () => {
  it('clusters fenced content to its opening-fence anchor (F1 §9)', async () => {
    const outDirAbs = await makeInventoriedHome({ 'plans/fenced.md': FENCED_FILE });
    await writeDiscriminationProof(outDirAbs);
    const result = await runResidue({ outDirAbs });
    expect(result.ok).toBe(true);
    const report = await readReport(outDirAbs);
    const file = report.files.find((f) => f.file === 'plans/fenced.md');
    expect(file?.blocks.map((b) => [b.lineStart, b.lineEnd])).toEqual([
      [1, 1],
      [2, 4],
      [5, 6],
    ]);
    expect(file?.orphanCandidates).toEqual([]);
  });

  it('detects a stray non-blank preamble end-to-end (rule a)', async () => {
    const outDirAbs = await makeInventoriedHome({
      'plans/fenced.md': FENCED_FILE,
      'plans/stray.md': ['stray work note', '# Head', 'body'].join('\n'),
    });
    const result = await runResidue({ outDirAbs });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.orphanCandidates).toBe(1);
    }
    const report = await readReport(outDirAbs);
    expect(report.orphanCandidates).toEqual([
      {
        file: 'plans/stray.md',
        lineStart: 1,
        lineEnd: 1,
        nonBlankLines: 1,
        reasons: ['file-preamble'],
      },
    ]);
  });

  it('writes a byte-identical report on a double run (determinism contract)', async () => {
    const outDirAbs = await makeInventoriedHome({ 'plans/fenced.md': FENCED_FILE });
    await writeDiscriminationProof(outDirAbs);
    expect((await runResidue({ outDirAbs })).ok).toBe(true);
    const first = await readFile(path.join(outDirAbs, RESIDUE_BASENAME));
    expect((await runResidue({ outDirAbs })).ok).toBe(true);
    const second = await readFile(path.join(outDirAbs, RESIDUE_BASENAME));
    expect(first.equals(second)).toBe(true);
  });
});

describe('runResidue — the mechanical zero-orphan acceptance gate (F1 §9)', () => {
  it('accepts a zero-orphan result alongside the committed discrimination proof', async () => {
    const outDirAbs = await makeInventoriedHome({ 'plans/fenced.md': FENCED_FILE });
    await writeDiscriminationProof(outDirAbs);
    const result = await runResidue({ outDirAbs });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.orphanCandidates).toBe(0);
    }
    expect(existsSync(path.join(outDirAbs, RESIDUE_BASENAME))).toBe(true);
  });

  it('REFUSES a zero-orphan result without the proof, writing nothing', async () => {
    const outDirAbs = await makeInventoriedHome({ 'plans/fenced.md': FENCED_FILE });
    const result = await runResidue({ outDirAbs });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('zero-orphan acceptance refused');
      expect(result.error.message).toContain(DISCRIMINATION_PROOF_SEGMENT);
    }
    expect(existsSync(path.join(outDirAbs, RESIDUE_BASENAME))).toBe(false);
  });

  it('needs no proof when orphan candidates exist (the gate guards zeroes only)', async () => {
    const outDirAbs = await makeInventoriedHome({
      'plans/stray.md': ['stray work note', '# Head', 'body'].join('\n'),
    });
    const result = await runResidue({ outDirAbs });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.orphanCandidates).toBe(1);
    }
    expect(existsSync(path.join(outDirAbs, RESIDUE_BASENAME))).toBe(true);
  });
});

describe('runResidue — refusal chain', () => {
  it('refuses when the inventory artefact is absent, writing nothing', async () => {
    const outDirAbs = await makeInventoriedHome({ 'plans/fenced.md': FENCED_FILE });
    await rm(path.join(outDirAbs, INVENTORY_BASENAME));
    const result = await runResidue({ outDirAbs });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain(INVENTORY_BASENAME);
    }
    expect(existsSync(path.join(outDirAbs, RESIDUE_BASENAME))).toBe(false);
  });

  it('refuses an inventory record whose line lies beyond its file, writing nothing', async () => {
    const outDirAbs = await makeInventoriedHome({ 'plans/fenced.md': FENCED_FILE });
    const inventoryPath = path.join(outDirAbs, INVENTORY_BASENAME);
    const tampered = `${await readFile(inventoryPath, 'utf8')}${JSON.stringify({
      file: 'plans/fenced.md',
      line: 99,
      nets: ['A'],
      text: 'phantom',
      sha1: 'a'.repeat(40),
    })}\n`;
    await writeFile(inventoryPath, tampered, 'utf8');
    const result = await runResidue({ outDirAbs });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('99');
    }
    expect(existsSync(path.join(outDirAbs, RESIDUE_BASENAME))).toBe(false);
  });

  it('refuses a doubled (file, line) inventory anchor, writing nothing', async () => {
    const outDirAbs = await makeInventoriedHome({ 'plans/fenced.md': FENCED_FILE });
    await writeDiscriminationProof(outDirAbs);
    const inventoryPath = path.join(outDirAbs, INVENTORY_BASENAME);
    const tampered = `${await readFile(inventoryPath, 'utf8')}${JSON.stringify({
      file: 'plans/fenced.md',
      line: 1,
      nets: ['A'],
      text: '# Head',
      sha1: 'a'.repeat(40),
    })}\n`;
    await writeFile(inventoryPath, tampered, 'utf8');
    const result = await runResidue({ outDirAbs });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('doubled anchor');
      expect(result.error.message).toContain('plans/fenced.md');
    }
    expect(existsSync(path.join(outDirAbs, RESIDUE_BASENAME))).toBe(false);
  });

  it('refuses an inventory record naming a file the denominator does not, writing nothing', async () => {
    const outDirAbs = await makeInventoriedHome({ 'plans/fenced.md': FENCED_FILE });
    const inventoryPath = path.join(outDirAbs, INVENTORY_BASENAME);
    const tampered = `${await readFile(inventoryPath, 'utf8')}${JSON.stringify({
      file: 'plans/phantom.md',
      line: 1,
      nets: ['A'],
      text: '# phantom',
      sha1: 'a'.repeat(40),
    })}\n`;
    await writeFile(inventoryPath, tampered, 'utf8');
    const result = await runResidue({ outDirAbs });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('plans/phantom.md');
    }
    expect(existsSync(path.join(outDirAbs, RESIDUE_BASENAME))).toBe(false);
  });
});
