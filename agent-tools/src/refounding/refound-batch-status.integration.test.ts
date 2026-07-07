import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { ok, unwrap } from '@oaknational/result';
import { afterEach, describe, expect, it } from 'vitest';

import { renderJsonArtefact } from './refounding-artefacts.js';
import { runBatchStatus } from './refound-batch-status-helpers.js';
import { parseRunState, RUN_STATE_BASENAME, type RunState } from './refound-batch-status-model.js';
import { runDefaultLedger } from './refound-default-ledger-helpers.js';
import { FROZEN_TREE_SEGMENT, type SecretScan } from './refound-freeze-helpers.js';
import { runFreeze } from './refound-freeze-runner.js';
import { INVENTORY_BASENAME } from './refound-inventory-model.js';
import { runInventory } from './refound-inventory-runner.js';
import { LEDGER_DIR_SEGMENT, ledgerBasenameForArea } from './refound-ledger-row.js';

/**
 * Integration behaviours of `refound-batch-status` against GENUINE protocol
 * artefacts: the lattice over a fully-green home, `not-reached` honesty at
 * every early-protocol stage, and the two novel P4 proofs — a falsified
 * run-state cache claiming green has ZERO effect on the recomputed
 * dashboard, and a broken artefact flips the recomputed stage red.
 */

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

const cleanScan: SecretScan = () => Promise.resolve(ok(undefined));

interface StatusFixture {
  readonly repoRoot: string;
  readonly outDirAbs: string;
  readonly frozenRoot: string;
}

/**
 * A two-area corpus (areas derive from the denominator-path rule, never a
 * list) frozen for real; inventory and default ledgers land only when the
 * caller asks, so each lattice stage can be exercised in isolation.
 */
async function makeStatusFixture(stages: {
  readonly inventory: boolean;
  readonly ledgers: boolean;
}): Promise<StatusFixture> {
  const repoRoot = await mkdtemp(path.join(tmpdir(), 'refound-status-'));
  tempRoots.push(repoRoot);
  const rule = {
    version: 1,
    ratifiedBy: '.agent/decisions/g1.md',
    classes: [{ id: 'plans', globs: ['.agent/plans/**'], verdict: 'in', reason: 'estate' }],
  };
  const files: Record<string, string> = {
    '.agent/plans/alpha/x.md': '# X\n\nstatus: pending\nbody line\n',
    '.agent/plans/alpha/y.md': '# Y\n\n- a row\nprose\n',
    '.agent/plans/beta/z.md': '# Z\n\nanother body line\n',
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
  if (stages.inventory) {
    expect((await runInventory({ outDirAbs })).ok).toBe(true);
  }
  if (stages.ledgers) {
    expect((await runDefaultLedger({ outDirAbs })).ok).toBe(true);
  }
  return { repoRoot, outDirAbs, frozenRoot: path.join(outDirAbs, FROZEN_TREE_SEGMENT) };
}

async function recompute(outDirAbs: string): Promise<RunState> {
  const runState = await runBatchStatus({ outDirAbs });
  expect(runState.ok).toBe(true);
  return unwrap(runState);
}

describe('refound-batch-status over genuine protocol artefacts', () => {
  it('reports the full lattice green over a frozen, inventoried, tiled home', async () => {
    const fixture = await makeStatusFixture({ inventory: true, ledgers: true });
    const runState = await recompute(fixture.outDirAbs);
    expect(runState.denominator.state).toBe('green');
    expect(runState.freeze.state).toBe('green');
    expect(runState.inventory.state).toBe('green');
    expect(runState.areas.map((area) => `${area.area}:${area.state}`)).toEqual([
      'plans--alpha:green',
      'plans--beta:green',
    ]);
    expect(runState.crossArea.state).toBe('green');
    const cached = parseRunState(
      JSON.parse(await readFile(path.join(fixture.outDirAbs, RUN_STATE_BASENAME), 'utf8')),
    );
    expect(cached.ok).toBe(true);
  });

  it('reports not-reached honestly before inventory and before tiling', async () => {
    const fixture = await makeStatusFixture({ inventory: false, ledgers: false });
    const runState = await recompute(fixture.outDirAbs);
    expect(runState.freeze.state).toBe('green');
    expect(runState.inventory.state).toBe('not-reached');
    expect(runState.crossArea.state).toBe('not-reached');
    expect(runState.areas).toEqual([]);
  });

  it('reports one untiled area without poisoning the tiled one', async () => {
    const fixture = await makeStatusFixture({ inventory: true, ledgers: true });
    await rm(
      path.join(fixture.outDirAbs, LEDGER_DIR_SEGMENT, ledgerBasenameForArea('plans--beta')),
    );
    const runState = await recompute(fixture.outDirAbs);
    expect(runState.areas.map((area) => `${area.area}:${area.state}`)).toEqual([
      'plans--alpha:green',
      'plans--beta:not-reached',
    ]);
    expect(runState.crossArea.state).toBe('not-reached');
  });

  it('reports not-reached on a bare home (no freeze at all), never a crash', async () => {
    const bareHome = await mkdtemp(path.join(tmpdir(), 'refound-status-bare-'));
    tempRoots.push(bareHome);
    const runState = await recompute(bareHome);
    expect(runState.denominator.state).toBe('not-reached');
    expect(runState.freeze.state).toBe('not-reached');
    expect(runState.areas).toEqual([]);
  });

  it('P4 cache-tamper proof: a falsified all-green cache has ZERO effect on the recompute', async () => {
    const fixture = await makeStatusFixture({ inventory: true, ledgers: true });
    // Break the freeze for real: flip one byte in a frozen copy.
    const target = path.join(fixture.frozenRoot, 'plans/alpha/x.md');
    const bytes = await readFile(target);
    bytes[0] = bytes[0] ^ 0xff;
    await writeFile(target, bytes);
    // Plant the tampered cache claiming everything is green.
    const forged: RunState = {
      version: 1,
      denominator: { state: 'green', detail: 'forged' },
      freeze: { state: 'green', detail: 'forged' },
      inventory: { state: 'green', detail: 'forged' },
      crossArea: { state: 'green', detail: 'forged' },
      areas: [],
    };
    await writeFile(
      path.join(fixture.outDirAbs, RUN_STATE_BASENAME),
      renderJsonArtefact(forged),
      'utf8',
    );
    const runState = await recompute(fixture.outDirAbs);
    expect(runState.freeze.state).toBe('red');
    // The forged cache is overwritten by the recomputed truth.
    const cached = parseRunState(
      JSON.parse(await readFile(path.join(fixture.outDirAbs, RUN_STATE_BASENAME), 'utf8')),
    );
    expect(cached.ok).toBe(true);
    if (cached.ok) {
      expect(cached.value.freeze.state).toBe('red');
      expect(cached.value.freeze.detail).not.toBe('forged');
    }
  });

  it('P4 broken-artefact proof: a corrupted inventory flips the recomputed stage', async () => {
    const fixture = await makeStatusFixture({ inventory: true, ledgers: true });
    await writeFile(path.join(fixture.outDirAbs, INVENTORY_BASENAME), 'not json\n', 'utf8');
    const runState = await recompute(fixture.outDirAbs);
    expect(runState.inventory.state).toBe('invalid');
    expect(runState.crossArea.state).toBe('not-reached');
  });

  it('refuses an ambiguous area derivation before the cache write (nothing written)', async () => {
    // Two DISTINCT directory prefixes deriving one area id (`--` inside a
    // segment name): `plans/x--y/…` and `plans--x/y/…` both derive
    // `plans--x--y`, the collision `groupFilesByArea` refuses.
    const repoRoot = await mkdtemp(path.join(tmpdir(), 'refound-status-collide-'));
    tempRoots.push(repoRoot);
    const rule = {
      version: 1,
      ratifiedBy: '.agent/decisions/g1.md',
      classes: [
        { id: 'plans', globs: ['.agent/plans/**'], verdict: 'in', reason: 'estate' },
        { id: 'plans-x', globs: ['.agent/plans--x/**'], verdict: 'in', reason: 'estate' },
      ],
    };
    const files: Record<string, string> = {
      '.agent/plans/x--y/a.md': '# A\n\nbody\n',
      '.agent/plans--x/y/b.md': '# B\n\nbody\n',
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
    expect((await runInventory({ outDirAbs })).ok).toBe(true);
    const runState = await runBatchStatus({ outDirAbs });
    expect(runState.ok).toBe(false);
    if (!runState.ok) {
      expect(runState.error.message).toContain('ambiguous');
    }
    expect(existsSync(path.join(outDirAbs, RUN_STATE_BASENAME))).toBe(false);
  });

  it('writes a byte-identical cache on a double run (determinism contract)', async () => {
    const fixture = await makeStatusFixture({ inventory: true, ledgers: true });
    await recompute(fixture.outDirAbs);
    const first = await readFile(path.join(fixture.outDirAbs, RUN_STATE_BASENAME));
    await recompute(fixture.outDirAbs);
    const second = await readFile(path.join(fixture.outDirAbs, RUN_STATE_BASENAME));
    expect(second.equals(first)).toBe(true);
    expect(existsSync(path.join(fixture.outDirAbs, RUN_STATE_BASENAME))).toBe(true);
  });
});
