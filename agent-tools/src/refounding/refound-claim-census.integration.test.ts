import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { ok } from '@oaknational/result';
import { afterEach, describe, expect, it } from 'vitest';

import { renderJsonArtefact } from './refounding-artefacts.js';
import { CLAIM_CENSUS_BASENAME, parseCensusRecord } from './refound-claim-census-model.js';
import { CLAIM_CENSUS_REPORT_BASENAME, parseCensusReport } from './refound-claim-census-report.js';
import { runClaimCensus } from './refound-claim-census-helpers.js';
import { type SecretScan } from './refound-freeze-helpers.js';
import { runFreeze } from './refound-freeze-runner.js';

/**
 * Integration behaviours of `refound-claim-census` against GENUINE freeze
 * artefacts (never hand-rolled approximations): frozen-coordinate extraction,
 * the whole-file/opaque mode skip, double-run byte identity, the injected
 * mapping table, the refusal set proven nothing-written (missing
 * denominator; the over-20-percent UNMAPPED halt), and the all-or-nothing
 * artefact pair (a failed report write rolls back the records).
 */

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

const cleanScan: SecretScan = () => Promise.resolve(ok(undefined));

interface CensusFixture {
  readonly repoRoot: string;
  readonly outDirAbs: string;
}

/**
 * A real freeze whose corpus plants one frontmatter status, one body
 * completion claim, one fenced (blacked-out) status, and a `whole-file`-mode
 * TSV carrying a status line that must never be scanned.
 */
async function makeCensusFixture(): Promise<CensusFixture> {
  const repoRoot = await mkdtemp(path.join(tmpdir(), 'refound-census-'));
  tempRoots.push(repoRoot);
  const rule = {
    version: 1,
    ratifiedBy: '.agent/decisions/g1.md',
    classes: [{ id: 'plans', globs: ['.agent/plans/**'], verdict: 'in', reason: 'estate' }],
  };
  const files: Record<string, string> = {
    '.agent/plans/a.md': '---\nstatus: pending\n---\n\n# A\n\nThe first slice landed.\n',
    '.agent/plans/sub/b.md': '# B\n\n```text\nstatus: done\n```\n\nstill open here\n',
    '.agent/plans/data.tsv': 'status: done\tx\n',
    '.agent/plans-refounding/freeze-rule.json': `${JSON.stringify(rule, null, 2)}\n`,
  };
  for (const [relPath, content] of Object.entries(files)) {
    const absPath = path.join(repoRoot, relPath);
    await mkdir(path.dirname(absPath), { recursive: true });
    await writeFile(absPath, content);
  }
  const outDirAbs = path.join(repoRoot, '.agent/plans-refounding');
  const frozen = await runFreeze({
    repoRoot,
    ruleAbsPath: path.join(outDirAbs, 'freeze-rule.json'),
    outDirAbs,
    secretScan: cleanScan,
  });
  expect(frozen.ok).toBe(true);
  return { repoRoot, outDirAbs };
}

async function readRecordLines(outDirAbs: string): Promise<readonly unknown[]> {
  return (await readFile(path.join(outDirAbs, CLAIM_CENSUS_BASENAME), 'utf8'))
    .split('\n')
    .filter((line) => line !== '')
    .map((line): unknown => JSON.parse(line));
}

describe('refound-claim-census over genuine freeze artefacts', () => {
  it('extracts status and completion lines in frozen coordinates, skipping fenced content and non-line modes', async () => {
    const fixture = await makeCensusFixture();
    const summary = await runClaimCensus({ outDirAbs: fixture.outDirAbs, mappingAbsPath: null });
    expect(summary.ok).toBe(true);
    if (summary.ok) {
      expect(summary.value.statusLines).toBe(1);
      expect(summary.value.keywordLines).toBe(1);
      expect(summary.value.mapping).toBeNull();
    }

    const rawRecords = await readRecordLines(fixture.outDirAbs);
    const records = rawRecords.map((raw) => parseCensusRecord(raw));
    expect(records.every((record) => record.ok)).toBe(true);
    const parsed = records.flatMap((record) => (record.ok ? [record.value] : []));
    expect(parsed.map((record) => `${record.file}:${String(record.line)}`)).toEqual([
      'plans/a.md:2',
      'plans/a.md:7',
    ]);
    expect(parsed[0].statusValue).toBe(' pending');
    expect(parsed[1].markers).toEqual(['landed']);

    const rawReport: unknown = JSON.parse(
      await readFile(path.join(fixture.outDirAbs, CLAIM_CENSUS_REPORT_BASENAME), 'utf8'),
    );
    const report = parseCensusReport(rawReport);
    expect(report.ok).toBe(true);
    if (report.ok) {
      // data.tsv is whole-file mode: its planted status line is never scanned.
      expect(report.value.totals.files).toBe(2);
      expect(report.value.totals.statusLines).toBe(1);
    }
  });

  it('writes byte-identical artefacts on a double run (determinism contract)', async () => {
    const fixture = await makeCensusFixture();
    expect((await runClaimCensus({ outDirAbs: fixture.outDirAbs, mappingAbsPath: null })).ok).toBe(
      true,
    );
    const firstRecords = await readFile(path.join(fixture.outDirAbs, CLAIM_CENSUS_BASENAME));
    const firstReport = await readFile(path.join(fixture.outDirAbs, CLAIM_CENSUS_REPORT_BASENAME));
    expect((await runClaimCensus({ outDirAbs: fixture.outDirAbs, mappingAbsPath: null })).ok).toBe(
      true,
    );
    expect(
      (await readFile(path.join(fixture.outDirAbs, CLAIM_CENSUS_BASENAME))).equals(firstRecords),
    ).toBe(true);
    expect(
      (await readFile(path.join(fixture.outDirAbs, CLAIM_CENSUS_REPORT_BASENAME))).equals(
        firstReport,
      ),
    ).toBe(true);
  });

  it('applies an injected mapping table and reports typed verdicts', async () => {
    const fixture = await makeCensusFixture();
    const tableAbsPath = path.join(fixture.repoRoot, 'status-mapping.v1.json');
    await writeFile(
      tableAbsPath,
      renderJsonArtefact({ version: 1, entries: [{ value: 'pending', verdict: 'open' }] }),
      'utf8',
    );
    const summary = await runClaimCensus({
      outDirAbs: fixture.outDirAbs,
      mappingAbsPath: tableAbsPath,
    });
    expect(summary.ok).toBe(true);
    if (summary.ok) {
      expect(summary.value.mapping).toEqual({ verdicts: 1, unmapped: 0 });
    }
  });

  it('halts on >20% UNMAPPED, writing nothing', async () => {
    const fixture = await makeCensusFixture();
    const tableAbsPath = path.join(fixture.repoRoot, 'status-mapping.v1.json');
    await writeFile(
      tableAbsPath,
      renderJsonArtefact({ version: 1, entries: [{ value: 'no-such-status', verdict: 'open' }] }),
      'utf8',
    );
    const summary = await runClaimCensus({
      outDirAbs: fixture.outDirAbs,
      mappingAbsPath: tableAbsPath,
    });
    expect(summary.ok).toBe(false);
    if (!summary.ok) {
      expect(summary.error.message).toContain('halt');
    }
    expect(existsSync(path.join(fixture.outDirAbs, CLAIM_CENSUS_BASENAME))).toBe(false);
    expect(existsSync(path.join(fixture.outDirAbs, CLAIM_CENSUS_REPORT_BASENAME))).toBe(false);
  });

  it('refuses a home without a denominator, writing nothing', async () => {
    const bareHome = await mkdtemp(path.join(tmpdir(), 'refound-census-bare-'));
    tempRoots.push(bareHome);
    const summary = await runClaimCensus({ outDirAbs: bareHome, mappingAbsPath: null });
    expect(summary.ok).toBe(false);
    expect(existsSync(path.join(bareHome, CLAIM_CENSUS_BASENAME))).toBe(false);
  });
});

describe('runClaimCensus — the all-or-nothing artefact pair', () => {
  it('rolls back the records when the paired report write fails (nothing remains)', async () => {
    const fixture = await makeCensusFixture();
    // Plant the failure: the report destination is a DIRECTORY, so its write fails.
    await mkdir(path.join(fixture.outDirAbs, CLAIM_CENSUS_REPORT_BASENAME), { recursive: true });
    const summary = await runClaimCensus({ outDirAbs: fixture.outDirAbs, mappingAbsPath: null });
    expect(summary.ok).toBe(false);
    if (!summary.ok) {
      expect(summary.error.message).toContain('rolled back');
    }
    expect(existsSync(path.join(fixture.outDirAbs, CLAIM_CENSUS_BASENAME))).toBe(false);
  });
});
