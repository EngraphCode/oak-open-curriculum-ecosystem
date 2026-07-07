import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  compareByCodeUnit,
  countLines,
  parseDenominator,
  renderJsonArtefact,
  sha256Hex,
  type Denominator,
  type DenominatorFile,
} from './refounding-artefacts.js';
import {
  INVENTORY_BASENAME,
  NET_DIFF_BASENAME,
  parseInventoryRecord,
  parseNetDiffReport,
  type InventoryRecord,
} from './refound-inventory-model.js';
import { runInventory } from './refound-inventory-runner.js';

/**
 * Integration behaviours of `refound-inventory` over real temporary frozen
 * trees: sorted verbatim capture, md-files-only scope, double-run byte
 * identity, the H2 anchor-ratio halt, and the line-count cross-check halt —
 * each halting with NOTHING written.
 */

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

/** Write frozen files under `<outDir>/archive/frozen-v1` and derive their denominator. */
async function makeArtefactHome(files: Record<string, string | Buffer>): Promise<string> {
  const outDirAbs = await mkdtemp(path.join(tmpdir(), 'refound-inventory-'));
  tempRoots.push(outDirAbs);
  const frozenRoot = path.join(outDirAbs, 'archive/frozen-v1');
  const rows: DenominatorFile[] = [];
  for (const [relPath, content] of Object.entries(files)) {
    const bytes = typeof content === 'string' ? Buffer.from(content) : content;
    const absPath = path.join(frozenRoot, relPath);
    await mkdir(path.dirname(absPath), { recursive: true });
    await writeFile(absPath, bytes);
    const isBinary = bytes.includes(0x00);
    rows.push({
      path: relPath,
      bytes: bytes.length,
      sha256: sha256Hex(bytes),
      lines: countLines(bytes),
      inventory_mode: isBinary ? 'opaque' : relPath.endsWith('.md') ? 'lines' : 'whole-file',
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
  return outDirAbs;
}

/** A small two-md-file corpus whose anchor ratio sits inside the sanity band. */
function inBandCorpus(): Record<string, string | Buffer> {
  return {
    'plans/a.plan.md': [
      '---',
      'title: fixture',
      '---',
      '# Plan A',
      'prose line one',
      'prose line two',
      'prose line three',
      '- [ ] first row item',
      'closing prose',
      'more closing prose',
    ].join('\n'),
    'plans/b.md': 'crlf prose\r\n| cell | cell |\r\nplain tail\r\n',
    'plans/data.tsv': 'x\ty\n1\t2\n',
    'plans/blob.bin': Buffer.from([0x00, 0x01, 0x02]),
  };
}

async function readRecords(outDirAbs: string): Promise<InventoryRecord[]> {
  const raw = await readFile(path.join(outDirAbs, INVENTORY_BASENAME), 'utf8');
  const parsed = raw
    .split('\n')
    .filter((line) => line !== '')
    .map((line): unknown => JSON.parse(line))
    .map((json) => parseInventoryRecord(json));
  expect(parsed.every((record) => record.ok)).toBe(true);
  return parsed.flatMap((record) => (record.ok ? [record.value] : []));
}

describe('runInventory — happy path', () => {
  it('captures md lines only, sorted by (file, line), with verbatim CR bytes', async () => {
    const outDirAbs = await makeArtefactHome(inBandCorpus());
    const result = await runInventory({ outDirAbs });
    expect(result.ok).toBe(true);
    const records = await readRecords(outDirAbs);
    expect(records.every((r) => r.file.endsWith('.md'))).toBe(true);
    const keys = records.map((r) => `${r.file}:${String(r.line)}`);
    expect(keys).toEqual([
      'plans/a.plan.md:1',
      'plans/a.plan.md:2',
      'plans/a.plan.md:3',
      'plans/a.plan.md:4',
      'plans/a.plan.md:8',
      'plans/b.md:2',
    ]);
    const tableRow = records.at(-1);
    expect(tableRow?.text).toBe('| cell | cell |\r');
    expect(tableRow?.nets).toEqual(['B']);
  });

  it('reports totals over lines-mode files only, with per-net unique captures', async () => {
    const outDirAbs = await makeArtefactHome(inBandCorpus());
    const result = await runInventory({ outDirAbs });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.mdFiles).toBe(2);
      expect(result.value.mdLines).toBe(13);
      expect(result.value.anchors).toBe(6);
    }
    const reportRaw: unknown = JSON.parse(
      await readFile(path.join(outDirAbs, NET_DIFF_BASENAME), 'utf8'),
    );
    const report = parseNetDiffReport(reportRaw);
    expect(report.ok).toBe(true);
    if (report.ok) {
      expect(report.value.totals).toMatchObject({ files: 2, lines: 13, anchors: 6 });
      expect(report.value.perNet.B.captured).toBeGreaterThan(0);
    }
  });

  it('writes byte-identical artefacts on a double run (determinism contract)', async () => {
    const outDirAbs = await makeArtefactHome(inBandCorpus());
    expect((await runInventory({ outDirAbs })).ok).toBe(true);
    const firstInventory = await readFile(path.join(outDirAbs, INVENTORY_BASENAME));
    const firstNetDiff = await readFile(path.join(outDirAbs, NET_DIFF_BASENAME));
    expect((await runInventory({ outDirAbs })).ok).toBe(true);
    const secondInventory = await readFile(path.join(outDirAbs, INVENTORY_BASENAME));
    const secondNetDiff = await readFile(path.join(outDirAbs, NET_DIFF_BASENAME));
    expect(firstInventory.equals(secondInventory)).toBe(true);
    expect(firstNetDiff.equals(secondNetDiff)).toBe(true);
  });
});

describe('runInventory — halts (nothing written)', () => {
  it('halts with the named H2 error when the anchor ratio falls outside the band', async () => {
    const outDirAbs = await makeArtefactHome({
      'plans/prose-only.md': Array.from({ length: 40 }, (_, i) => `prose line ${String(i)}`).join(
        '\n',
      ),
    });
    const result = await runInventory({ outDirAbs });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('H2');
      expect(result.error.message).toContain('halt-and-inspect');
    }
    expect(existsSync(path.join(outDirAbs, INVENTORY_BASENAME))).toBe(false);
    expect(existsSync(path.join(outDirAbs, NET_DIFF_BASENAME))).toBe(false);
  });

  /** Bump plans/b.md's recorded line count, keeping the totals consistent. */
  async function tamperDenominatorLineCount(outDirAbs: string): Promise<void> {
    const denominatorPath = path.join(outDirAbs, 'denominator.v1.json');
    const denominatorRaw: unknown = JSON.parse(await readFile(denominatorPath, 'utf8'));
    const parsed = parseDenominator(denominatorRaw);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }
    const denominator = parsed.value;
    const target = denominator.files.find((f) => f.path === 'plans/b.md');
    expect(target).toBeDefined();
    if (target === undefined) {
      return;
    }
    target.lines += 1;
    denominator.totals.lines += 1;
    await writeFile(denominatorPath, renderJsonArtefact(denominator), 'utf8');
  }

  it('halts when a recounted line total disagrees with the denominator row', async () => {
    const outDirAbs = await makeArtefactHome(inBandCorpus());
    await tamperDenominatorLineCount(outDirAbs);
    const result = await runInventory({ outDirAbs });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('plans/b.md');
      expect(result.error.message).toContain('line');
    }
    expect(existsSync(path.join(outDirAbs, INVENTORY_BASENAME))).toBe(false);
  });

  it('halts when a denominator-named md file is missing from the frozen tree', async () => {
    const outDirAbs = await makeArtefactHome(inBandCorpus());
    await rm(path.join(outDirAbs, 'archive/frozen-v1/plans/b.md'));
    const result = await runInventory({ outDirAbs });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('plans/b.md');
    }
    expect(existsSync(path.join(outDirAbs, INVENTORY_BASENAME))).toBe(false);
  });
});

describe('runInventory — the all-or-nothing artefact pair', () => {
  it('rolls back the inventory when the paired net-diff write fails (nothing remains)', async () => {
    const outDirAbs = await makeArtefactHome(inBandCorpus());
    // Plant the failure: the net-diff destination is a DIRECTORY, so its write fails.
    await mkdir(path.join(outDirAbs, NET_DIFF_BASENAME), { recursive: true });
    const summary = await runInventory({ outDirAbs });
    expect(summary.ok).toBe(false);
    if (!summary.ok) {
      expect(summary.error.message).toContain('rolled back');
    }
    expect(existsSync(path.join(outDirAbs, INVENTORY_BASENAME))).toBe(false);
  });
});
