import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  compareByCodeUnit,
  renderJsonArtefact,
  renderJsonlArtefact,
} from './refounding-artefacts.js';
import { runChallengePlant } from './refound-challenge-helpers.js';
import { runPlantMode, runSealMode, type CanaryArgs } from './refound-challenge-modes.js';
import { runChallengeScore, runChallengeSeal } from './refound-challenge-scoring.js';
import {
  CHALLENGE_COMMITMENT_SEGMENT,
  CHALLENGE_STREAM_SEGMENT,
  parseChallengeKeySet,
  type ChallengeLedgerRow,
} from './refound-challenge-model.js';

/**
 * Integration behaviours of `refound-plant-challenge-canary`: one full
 * sealed-then-revealed cycle on fixtures (plant → seal → findings → score
 * green), the plausible-but-wrong plant discipline (no mechanical stream
 * scan separates planted from real rows), the sealed salt (selection not
 * recomputable from stream + rate), the dispatcher-held key location (never
 * adjacent to the stream), score RED when a plant is missed, the tamper
 * refusal when the revealed keys do not match the commitment, the
 * rate-boundary refusals, and double-run byte identity.
 */

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

const FIXTURE_SALT = 'fixture-dispatcher-seal-1';

const LEDGER_ROWS: ChallengeLedgerRow[] = Array.from({ length: 40 }, (_, index) => ({
  block_id: `pilot-${String(index).padStart(4, '0')}`,
  file: 'plans/pilot/foo.plan.md',
  line_start: index * 10 + 1,
  line_end: index * 10 + 10,
  disposition: 'named-home',
  home: 'lane/pilot',
  binding:
    `plans/pilot/foo.plan.md:${String(index * 10 + 1)}-${String(index * 10 + 10)} ` +
    `detail ${String(index).padStart(4, '0')}`,
}));

interface Fixture {
  readonly outDirAbs: string;
  readonly ledgerAbsPath: string;
  readonly streamAbsPath: string;
  readonly keysAbsPath: string;
  readonly commitmentAbsPath: string;
}

/**
 * A fixture whose key set lives in a SEPARATE dispatcher-held directory —
 * never adjacent to the stream under the artefact home.
 */
async function makeFixture(rows: readonly ChallengeLedgerRow[] = LEDGER_ROWS): Promise<Fixture> {
  const outDirAbs = await mkdtemp(path.join(tmpdir(), 'refound-challenge-'));
  tempRoots.push(outDirAbs);
  const dispatcherDirAbs = await mkdtemp(path.join(tmpdir(), 'refound-dispatcher-'));
  tempRoots.push(dispatcherDirAbs);
  const ledgerAbsPath = path.join(outDirAbs, 'pilot.ledger.jsonl');
  await writeFile(ledgerAbsPath, renderJsonlArtefact(rows), 'utf8');
  return {
    outDirAbs,
    ledgerAbsPath,
    streamAbsPath: path.join(outDirAbs, CHALLENGE_STREAM_SEGMENT),
    keysAbsPath: path.join(dispatcherDirAbs, 'challenge-keys.v1.json'),
    commitmentAbsPath: path.join(outDirAbs, CHALLENGE_COMMITMENT_SEGMENT),
  };
}

/** The standard plant input for a fixture (rate 25, the fixture salt). */
function plantInput(
  fixture: Fixture,
  overrides: Partial<Parameters<typeof runChallengePlant>[0]> = {},
): Parameters<typeof runChallengePlant>[0] {
  return {
    ledgerAbsPath: fixture.ledgerAbsPath,
    ratePercent: 25,
    salt: FIXTURE_SALT,
    outDirAbs: fixture.outDirAbs,
    keysOutAbsPath: fixture.keysAbsPath,
    ...overrides,
  };
}

async function readPlantedIds(keysAbsPath: string): Promise<readonly string[]> {
  const keysRaw: unknown = JSON.parse(await readFile(keysAbsPath, 'utf8'));
  const parsed = parseChallengeKeySet(keysRaw);
  expect(parsed.ok).toBe(true);
  // The expect above already fails the test on a parse failure; the empty
  // list is a typed fallback so this helper never throws (ADR-088).
  return parsed.ok ? parsed.value.plantedBlockIds : [];
}

const streamRowShape = z.object({ block_id: z.string(), binding: z.string() });

async function readStreamRows(
  streamAbsPath: string,
): Promise<readonly z.infer<typeof streamRowShape>[]> {
  const jsonLines = (await readFile(streamAbsPath, 'utf8'))
    .split('\n')
    .filter((line) => line !== '')
    .map((line): unknown => JSON.parse(line));
  const parsed = z.array(streamRowShape).safeParse(jsonLines);
  expect(parsed.success).toBe(true);
  // The expect above already fails the test on a parse failure (ADR-088).
  return parsed.success ? parsed.data : [];
}

async function writeFindings(fixture: Fixture, lossBlockIds: readonly string[]): Promise<string> {
  const findingsAbsPath = path.join(fixture.outDirAbs, 'findings.v1.json');
  await writeFile(
    findingsAbsPath,
    renderJsonArtefact({ version: 1, lossBlockIds: [...lossBlockIds] }),
    'utf8',
  );
  return findingsAbsPath;
}

/**
 * Assert the stream carries every row in order, no key material, and that
 * EXACTLY the keyed rows' bindings were re-pointed — one closed-list
 * comparison against the true bindings, no per-row conditionals.
 */
async function expectStreamMatchesKeys(fixture: Fixture): Promise<void> {
  const streamRows = await readStreamRows(fixture.streamAbsPath);
  expect(streamRows.map((row) => row.block_id)).toEqual(LEDGER_ROWS.map((row) => row.block_id));
  const trueBindings = new Map(LEDGER_ROWS.map((row) => [row.block_id, row.binding]));
  const repointedIds = streamRows
    .filter((row) => row.binding !== trueBindings.get(row.block_id))
    .map((row) => row.block_id)
    .sort(compareByCodeUnit);
  expect(repointedIds).toEqual([...(await readPlantedIds(fixture.keysAbsPath))]);
  expect(await readFile(fixture.streamAbsPath, 'utf8')).not.toContain(FIXTURE_SALT);
}

describe('the sealed-then-revealed cycle', () => {
  it('plant -> seal -> all-plants-caught findings -> score GREEN', async () => {
    const fixture = await makeFixture();
    const planted = await runChallengePlant(plantInput(fixture));
    expect(planted.ok).toBe(true);
    if (planted.ok) {
      expect(planted.value.rows).toBe(40);
      expect(planted.value.planted).toBeGreaterThan(0);
    }
    await expectStreamMatchesKeys(fixture);
    const plantedIds = await readPlantedIds(fixture.keysAbsPath);

    const sealed = await runChallengeSeal({
      keysAbsPath: fixture.keysAbsPath,
      commitmentAbsPath: fixture.commitmentAbsPath,
    });
    expect(sealed.ok).toBe(true);

    const findingsAbsPath = await writeFindings(fixture, [...plantedIds, 'pilot-0003']);
    const score = await runChallengeScore({
      findingsAbsPath,
      keysAbsPath: fixture.keysAbsPath,
      commitmentAbsPath: fixture.commitmentAbsPath,
    });
    expect(score.ok).toBe(true);
    if (score.ok) {
      expect(score.value.pass).toBe(true);
      expect(score.value.missed).toEqual([]);
      expect(score.value.caught).toEqual([...plantedIds]);
    }
  });

  it('scores RED (pass false, missed named) when a planted loss is not caught', async () => {
    const fixture = await makeFixture();
    expect((await runChallengePlant(plantInput(fixture))).ok).toBe(true);
    expect(
      (
        await runChallengeSeal({
          keysAbsPath: fixture.keysAbsPath,
          commitmentAbsPath: fixture.commitmentAbsPath,
        })
      ).ok,
    ).toBe(true);
    const plantedIds = await readPlantedIds(fixture.keysAbsPath);
    expect(plantedIds.length).toBeGreaterThan(1);
    const findingsAbsPath = await writeFindings(fixture, plantedIds.slice(1));
    const score = await runChallengeScore({
      findingsAbsPath,
      keysAbsPath: fixture.keysAbsPath,
      commitmentAbsPath: fixture.commitmentAbsPath,
    });
    expect(score.ok).toBe(true);
    if (score.ok) {
      expect(score.value.pass).toBe(false);
      expect(score.value.missed).toEqual([plantedIds[0]]);
    }
  });

  it('REFUSES to score when the revealed keys do not match the commitment (tamper)', async () => {
    const fixture = await makeFixture();
    expect((await runChallengePlant(plantInput(fixture))).ok).toBe(true);
    expect(
      (
        await runChallengeSeal({
          keysAbsPath: fixture.keysAbsPath,
          commitmentAbsPath: fixture.commitmentAbsPath,
        })
      ).ok,
    ).toBe(true);
    const plantedIds = await readPlantedIds(fixture.keysAbsPath);
    // Tamper: quietly drop one planted id from the revealed key set.
    await writeFile(
      fixture.keysAbsPath,
      renderJsonArtefact({
        version: 1,
        ratePercent: 25,
        salt: FIXTURE_SALT,
        plantedBlockIds: plantedIds.slice(1),
      }),
      'utf8',
    );
    const findingsAbsPath = await writeFindings(fixture, plantedIds);
    const score = await runChallengeScore({
      findingsAbsPath,
      keysAbsPath: fixture.keysAbsPath,
      commitmentAbsPath: fixture.commitmentAbsPath,
    });
    expect(score.ok).toBe(false);
    if (!score.ok) {
      expect(score.error.message).toContain('commitment');
      expect(score.error.message).toContain('refusing');
    }
  });
});

describe('the plausible-but-wrong plant discipline (B1/M5)', () => {
  it('no mechanical stream scan separates planted from real rows', async () => {
    const fixture = await makeFixture();
    expect((await runChallengePlant(plantInput(fixture))).ok).toBe(true);
    const streamRows = await readStreamRows(fixture.streamAbsPath);
    // The mechanical scan a contaminated challenger could run over the
    // stream ALONE: empty bindings, malformed span citations, duplicated
    // binding values. It must come back empty-handed.
    const wellFormedBinding = /^\S+:\d+-\d+ /;
    const bindingCounts = new Map<string, number>();
    for (const row of streamRows) {
      bindingCounts.set(row.binding, (bindingCounts.get(row.binding) ?? 0) + 1);
    }
    const suspects = streamRows
      .filter(
        (row) =>
          row.binding === '' ||
          !wellFormedBinding.test(row.binding) ||
          (bindingCounts.get(row.binding) ?? 0) > 1,
      )
      .map((row) => row.block_id);
    expect(suspects).toEqual([]);
  });

  it('planted bindings cite REAL frozen spans from the ledger — wrong, not ill-formed', async () => {
    const fixture = await makeFixture();
    expect((await runChallengePlant(plantInput(fixture))).ok).toBe(true);
    const streamRows = await readStreamRows(fixture.streamAbsPath);
    const plantedIds = new Set(await readPlantedIds(fixture.keysAbsPath));
    const ledgerSpans = new Set(
      LEDGER_ROWS.map((row) => `${row.file}:${String(row.line_start)}-${String(row.line_end)}`),
    );
    const plantedSpanRefs = streamRows
      .filter((row) => plantedIds.has(row.block_id))
      .map((row) => row.binding.split(' ')[0] ?? '');
    expect(plantedSpanRefs.length).toBeGreaterThan(0);
    expect(plantedSpanRefs.every((spanRef) => ledgerSpans.has(spanRef))).toBe(true);
  });

  it('derives a DIFFERENT selection from a different salt on the same fixture', async () => {
    const fixtureA = await makeFixture();
    const fixtureB = await makeFixture();
    expect((await runChallengePlant(plantInput(fixtureA, { salt: 'seal-alpha' }))).ok).toBe(true);
    expect((await runChallengePlant(plantInput(fixtureB, { salt: 'seal-beta' }))).ok).toBe(true);
    const selectionA = await readPlantedIds(fixtureA.keysAbsPath);
    const selectionB = await readPlantedIds(fixtureB.keysAbsPath);
    expect(selectionA).not.toEqual(selectionB);
  });

  it('writes the key set ONLY to the dispatcher path — nothing adjacent to the stream', async () => {
    const fixture = await makeFixture();
    expect((await runChallengePlant(plantInput(fixture))).ok).toBe(true);
    expect(existsSync(fixture.keysAbsPath)).toBe(true);
    expect(existsSync(path.join(fixture.outDirAbs, 'challenge/challenge-keys.v1.json'))).toBe(
      false,
    );
  });
});

/** Full CanaryArgs with every flag defaulted empty, as the parser yields. */
function canaryArgs(overrides: Partial<CanaryArgs>): CanaryArgs {
  return {
    mode: '',
    ledgerPath: '',
    rate: '',
    salt: '',
    outDir: '.agent/plans-refounding',
    keysOutPath: '',
    keysPath: '',
    commitmentPath: '',
    findingsPath: '',
    ...overrides,
  };
}

describe('mode-layer write-target resolution (the CLI creates its own artefacts)', () => {
  it('plant mode succeeds when --out and --keys-out point at not-yet-existing dirs', async () => {
    const repoRoot = await mkdtemp(path.join(tmpdir(), 'refound-canary-repo-'));
    tempRoots.push(repoRoot);
    await writeFile(
      path.join(repoRoot, 'pilot.ledger.jsonl'),
      renderJsonlArtefact(LEDGER_ROWS),
      'utf8',
    );
    const outcome = await runPlantMode(
      repoRoot,
      canaryArgs({
        mode: 'plant',
        ledgerPath: 'pilot.ledger.jsonl',
        rate: '25',
        salt: FIXTURE_SALT,
        outDir: 'artefacts/challenge-out',
        keysOutPath: 'dispatcher/keys/challenge-keys.v1.json',
      }),
    );
    expect(outcome.ok).toBe(true);
    expect(
      existsSync(path.join(repoRoot, 'artefacts/challenge-out', CHALLENGE_STREAM_SEGMENT)),
    ).toBe(true);
    expect(existsSync(path.join(repoRoot, 'dispatcher/keys/challenge-keys.v1.json'))).toBe(true);
  });

  it('seal mode succeeds when the commitment default dir does not exist yet', async () => {
    const repoRoot = await mkdtemp(path.join(tmpdir(), 'refound-canary-repo-'));
    tempRoots.push(repoRoot);
    await writeFile(
      path.join(repoRoot, 'keys.v1.json'),
      renderJsonArtefact({
        version: 1,
        ratePercent: 25,
        salt: FIXTURE_SALT,
        plantedBlockIds: ['pilot-0001'],
      }),
      'utf8',
    );
    const outcome = await runSealMode(
      repoRoot,
      canaryArgs({ mode: 'seal', keysPath: 'keys.v1.json', outDir: 'artefacts/absent-out' }),
    );
    expect(outcome.ok).toBe(true);
    expect(
      existsSync(path.join(repoRoot, 'artefacts/absent-out', CHALLENGE_COMMITMENT_SEGMENT)),
    ).toBe(true);
  });

  it('plant mode refuses a `..`-escaping --out, writing nothing', async () => {
    const repoRoot = await mkdtemp(path.join(tmpdir(), 'refound-canary-repo-'));
    tempRoots.push(repoRoot);
    await writeFile(
      path.join(repoRoot, 'pilot.ledger.jsonl'),
      renderJsonlArtefact(LEDGER_ROWS),
      'utf8',
    );
    const outcome = await runPlantMode(
      repoRoot,
      canaryArgs({
        mode: 'plant',
        ledgerPath: 'pilot.ledger.jsonl',
        rate: '25',
        salt: FIXTURE_SALT,
        outDir: '../escaped-out',
        keysOutPath: 'dispatcher/keys.v1.json',
      }),
    );
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.error.message).toContain('resolves outside the repository');
    }
    expect(existsSync(path.join(repoRoot, 'dispatcher'))).toBe(false);
  });
});

describe('plant-mode guards and determinism', () => {
  it.each([[0], [-5], [101], [150]])(
    'refuses rate %d at the runChallengePlant boundary, writing nothing',
    async (ratePercent) => {
      const fixture = await makeFixture();
      const planted = await runChallengePlant(plantInput(fixture, { ratePercent }));
      expect(planted.ok).toBe(false);
      if (!planted.ok) {
        expect(planted.error.message).toContain('--rate must be a percentage greater than 0');
      }
      expect(existsSync(fixture.streamAbsPath)).toBe(false);
      expect(existsSync(fixture.keysAbsPath)).toBe(false);
    },
  );

  it('refuses an empty salt (an unsalted selection is publicly recomputable, M5)', async () => {
    const fixture = await makeFixture();
    const planted = await runChallengePlant(plantInput(fixture, { salt: '' }));
    expect(planted.ok).toBe(false);
    if (!planted.ok) {
      expect(planted.error.message).toContain('--salt must be non-empty');
    }
    expect(existsSync(fixture.streamAbsPath)).toBe(false);
    expect(existsSync(fixture.keysAbsPath)).toBe(false);
  });

  it('refuses a rate that plants nothing (a vacuous challenge proves nothing)', async () => {
    const fixture = await makeFixture(LEDGER_ROWS.slice(0, 2));
    const planted = await runChallengePlant(plantInput(fixture, { ratePercent: 0.01 }));
    expect(planted.ok).toBe(false);
    if (!planted.ok) {
      expect(planted.error.message).toContain('no rows');
    }
    expect(existsSync(fixture.streamAbsPath)).toBe(false);
    expect(existsSync(fixture.keysAbsPath)).toBe(false);
  });

  it('refuses duplicate block ids in the input ledger', async () => {
    const fixture = await makeFixture([LEDGER_ROWS[0], LEDGER_ROWS[0]]);
    const planted = await runChallengePlant(plantInput(fixture, { ratePercent: 100 }));
    expect(planted.ok).toBe(false);
    if (!planted.ok) {
      expect(planted.error.message).toContain('duplicate');
    }
  });

  it('writes byte-identical stream and keys on a double run (determinism contract)', async () => {
    const fixture = await makeFixture();
    expect((await runChallengePlant(plantInput(fixture))).ok).toBe(true);
    const firstStream = await readFile(fixture.streamAbsPath);
    const firstKeys = await readFile(fixture.keysAbsPath);
    expect((await runChallengePlant(plantInput(fixture))).ok).toBe(true);
    expect((await readFile(fixture.streamAbsPath)).equals(firstStream)).toBe(true);
    expect((await readFile(fixture.keysAbsPath)).equals(firstKeys)).toBe(true);
  });
});

describe('the all-or-nothing plant artefact pair', () => {
  it('rolls back the stream when the key-set write fails (no stream without keys)', async () => {
    const fixture = await makeFixture();
    // Plant the failure: the key-set destination is a DIRECTORY, so its write fails.
    await rm(fixture.keysAbsPath, { force: true });
    await mkdir(fixture.keysAbsPath, { recursive: true });
    const planted = await runChallengePlant(plantInput(fixture));
    expect(planted.ok).toBe(false);
    if (!planted.ok) {
      expect(planted.error.message).toContain('rolled back');
    }
    expect(existsSync(fixture.streamAbsPath)).toBe(false);
  });
});

describe('the vacuous-challenge refusal (P4)', () => {
  it('REFUSES to score a committed key set with no planted ids', async () => {
    const fixture = await makeFixture();
    await writeFile(
      fixture.keysAbsPath,
      renderJsonArtefact({ version: 1, ratePercent: 25, salt: FIXTURE_SALT, plantedBlockIds: [] }),
      'utf8',
    );
    expect(
      (
        await runChallengeSeal({
          keysAbsPath: fixture.keysAbsPath,
          commitmentAbsPath: fixture.commitmentAbsPath,
        })
      ).ok,
    ).toBe(true);
    const findingsAbsPath = await writeFindings(fixture, []);
    const score = await runChallengeScore({
      findingsAbsPath,
      keysAbsPath: fixture.keysAbsPath,
      commitmentAbsPath: fixture.commitmentAbsPath,
    });
    expect(score.ok).toBe(false);
    if (!score.ok) {
      expect(score.error.message).toContain('vacuous');
    }
  });
});
