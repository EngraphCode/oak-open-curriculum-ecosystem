import { mkdtemp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { ok, unwrap } from '@oaknational/result';
import { afterEach, describe, expect, it } from 'vitest';

import { compareByCodeUnit } from './refounding-artefacts.js';
import { runChallengePlant } from './refound-challenge-helpers.js';
import { runDefaultLedger } from './refound-default-ledger-helpers.js';
import { type SecretScan } from './refound-freeze-helpers.js';
import { runFreeze } from './refound-freeze-runner.js';
import { runInventory } from './refound-inventory-runner.js';
import { parseLedgerJsonl } from './refound-ledger-row.js';

/**
 * The default-ledger emitter's proofs (F1 §3, cycle-2 contract): per-area
 * sentinel ledgers derived deterministically from denominator + inventory,
 * byte-stable across runs, refusal-proven-nothing-written, and REFUSED by
 * the challenge boundary (a default block asserts the ABSENCE of judgement
 * and must never enter a challenge stream).
 */

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

const cleanScan: SecretScan = () => Promise.resolve(ok(undefined));

const RULE = {
  version: 1,
  ratifiedBy: '.agent/decisions/g1.md',
  classes: [{ id: 'plans', globs: ['.agent/plans/**'], verdict: 'in', reason: 'estate' }],
};

const CORPUS: Record<string, string> = {
  '.agent/plans/alpha/one.md': '# Alpha one\n\nProse line one.\n\n- first item\n\nProse tail.\n',
  '.agent/plans/alpha/data.tsv': 'x\ty\n',
  '.agent/plans/beta/three.md': '# Beta three\n\nBody text.\n\n- only item\n',
  '.agent/plans/root.md': '# Root navigation\n\nPointer prose.\n',
};

interface EmitterFixture {
  readonly repoRoot: string;
  readonly outDirAbs: string;
  readonly ledgerDirAbs: string;
}

/** Freeze + inventory over the fixture corpus (no ledgers yet). */
async function makeInventoriedFixture(): Promise<EmitterFixture> {
  const repoRoot = await mkdtemp(path.join(tmpdir(), 'refound-emitter-'));
  tempRoots.push(repoRoot);
  const files: Record<string, string> = {
    ...CORPUS,
    '.agent/plans-refounding/freeze-rule.json': `${JSON.stringify(RULE, null, 2)}\n`,
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
  const inventoried = await runInventory({ outDirAbs });
  expect(inventoried.ok).toBe(true);
  return { repoRoot, outDirAbs, ledgerDirAbs: path.join(outDirAbs, 'ledger') };
}

describe('runDefaultLedger — deterministic per-area sentinel ledgers', () => {
  it('writes one sorted ledger per area; every row parses through the canonical schema', async () => {
    const fixture = await makeInventoriedFixture();
    const summary = await runDefaultLedger({ outDirAbs: fixture.outDirAbs });
    expect(summary.ok).toBe(true);
    if (summary.ok) {
      expect(summary.value.areas).toBe(3);
    }
    const basenames = (await readdir(fixture.ledgerDirAbs)).sort(compareByCodeUnit);
    expect(basenames).toEqual([
      'plans--alpha.ledger.jsonl',
      'plans--beta.ledger.jsonl',
      'plans.ledger.jsonl',
    ]);
    for (const basename of basenames) {
      const rows = unwrap(
        parseLedgerJsonl(
          basename,
          await readFile(path.join(fixture.ledgerDirAbs, basename), 'utf8'),
        ),
      );
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) {
        expect(row.disposition).toBe('default-block');
        expect(row.binding).toBe('');
      }
    }
  });

  it('is byte-identical across two independent runs over identical inputs', async () => {
    const first = await makeInventoriedFixture();
    const second = await makeInventoriedFixture();
    expect((await runDefaultLedger({ outDirAbs: first.outDirAbs })).ok).toBe(true);
    expect((await runDefaultLedger({ outDirAbs: second.outDirAbs })).ok).toBe(true);
    const basenames = await readdir(first.ledgerDirAbs);
    // Guard against a vacuous pass: an empty ledger dir would skip the loop and
    // the byte-identity assertion would never run.
    expect(basenames.length).toBeGreaterThan(0);
    for (const basename of basenames) {
      const firstBytes = await readFile(path.join(first.ledgerDirAbs, basename));
      const secondBytes = await readFile(path.join(second.ledgerDirAbs, basename));
      expect(firstBytes.equals(secondBytes)).toBe(true);
    }
  });

  it('REFUSES when any target ledger already exists, writing nothing at all', async () => {
    const fixture = await makeInventoriedFixture();
    await mkdir(fixture.ledgerDirAbs, { recursive: true });
    const preexistingAbsPath = path.join(fixture.ledgerDirAbs, 'plans--alpha.ledger.jsonl');
    await writeFile(preexistingAbsPath, '{"judgement": "bearing"}\n', 'utf8');

    const summary = await runDefaultLedger({ outDirAbs: fixture.outDirAbs });
    expect(summary.ok).toBe(false);
    if (!summary.ok) {
      expect(summary.error.message).toContain('plans--alpha.ledger.jsonl');
    }
    expect(await readdir(fixture.ledgerDirAbs)).toEqual(['plans--alpha.ledger.jsonl']);
    expect(await readFile(preexistingAbsPath, 'utf8')).toBe('{"judgement": "bearing"}\n');
  });

  it('refuses a missing inventory, writing nothing', async () => {
    const fixture = await makeInventoriedFixture();
    await rm(path.join(fixture.outDirAbs, 'inventory.v1.jsonl'));
    const summary = await runDefaultLedger({ outDirAbs: fixture.outDirAbs });
    expect(summary.ok).toBe(false);
    await expect(readdir(fixture.ledgerDirAbs)).rejects.toThrow();
  });

  it('emits rows the challenge boundary REFUSES end-to-end (do-not-weaken proof)', async () => {
    const fixture = await makeInventoriedFixture();
    expect((await runDefaultLedger({ outDirAbs: fixture.outDirAbs })).ok).toBe(true);
    const planted = await runChallengePlant({
      ledgerAbsPath: path.join(fixture.ledgerDirAbs, 'plans--alpha.ledger.jsonl'),
      ratePercent: 100,
      salt: 'test-salt',
      outDirAbs: fixture.outDirAbs,
      keysOutAbsPath: path.join(fixture.repoRoot, 'keys/challenge-keys.json'),
    });
    expect(planted.ok).toBe(false);
    if (!planted.ok) {
      expect(planted.error.message).toContain('line 1');
    }
  });
});
