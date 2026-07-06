import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { ok, unwrap } from '@oaknational/result';
import { afterEach, describe, expect, it } from 'vitest';

import { compareByCodeUnit, parseDenominator, type Denominator } from './refounding-artefacts.js';
import { type SecretScan } from './refound-freeze-helpers.js';
import { runFreeze } from './refound-freeze-runner.js';
import { verifyFreeze } from './refound-verify-freeze-helpers.js';

/**
 * The D8 discrimination proofs and read-boundary behaviours of the freeze
 * verifier, exercised against genuine freeze artefacts on a temporary tree —
 * a verifier that has never gone red is theatre.
 */

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

const cleanScan: SecretScan = () => Promise.resolve(ok(undefined));

interface FrozenFixture {
  readonly repoRoot: string;
  readonly outDirAbs: string;
  readonly frozenRoot: string;
  readonly denominatorPath: string;
}

/**
 * Build a real freeze (via {@link runFreeze}) to mutate: the discrimination
 * proofs must fire against genuine artefacts, not hand-rolled approximations.
 */
async function makeFrozenFixture(): Promise<FrozenFixture> {
  const repoRoot = await mkdtemp(path.join(tmpdir(), 'refound-verify-'));
  tempRoots.push(repoRoot);
  const rule = {
    version: 1,
    ratifiedBy: '.agent/decisions/g1.md',
    classes: [{ id: 'plans', globs: ['.agent/plans/**'], verdict: 'in', reason: 'estate' }],
  };
  const files: Record<string, string> = {
    '.agent/plans/a.md': '# A\n\nbody line\n',
    '.agent/plans/sub/b.md': 'line one\nline two\n',
    '.agent/plans/data.tsv': 'x\ty\n',
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
  return {
    repoRoot,
    outDirAbs,
    frozenRoot: path.join(outDirAbs, 'archive/frozen-v1'),
    denominatorPath: path.join(outDirAbs, 'denominator.v1.json'),
  };
}

async function readFixtureDenominator(fixture: FrozenFixture): Promise<Denominator> {
  const raw: unknown = JSON.parse(await readFile(fixture.denominatorPath, 'utf8'));
  const parsed = parseDenominator(raw);
  expect(parsed.ok).toBe(true);
  return unwrap(parsed);
}

describe('verifyFreeze — discrimination proofs (D8)', () => {
  it('is green over an untouched freeze', async () => {
    const fixture = await makeFrozenFixture();
    const report = await verifyFreeze({ outDirAbs: fixture.outDirAbs });
    expect(report.ok).toBe(true);
    if (report.ok) {
      expect(report.value.checkedFiles).toBe(3);
      expect(report.value.violations).toEqual([]);
    }
  });

  it('goes red on a single flipped byte in a frozen copy', async () => {
    const fixture = await makeFrozenFixture();
    const target = path.join(fixture.frozenRoot, 'plans/a.md');
    const bytes = await readFile(target);
    bytes[0] = bytes[0] ^ 0xff;
    await writeFile(target, bytes);

    const report = await verifyFreeze({ outDirAbs: fixture.outDirAbs });
    expect(report.ok).toBe(true);
    if (report.ok) {
      expect(report.value.violations).toHaveLength(1);
      const violation = report.value.violations[0];
      expect(violation.kind).toBe('hash-mismatch');
      if (violation.kind === 'hash-mismatch') {
        expect(violation.path).toBe('plans/a.md');
        expect(violation.actualSha256).not.toBe(violation.expectedSha256);
      }
    }
  });

  it('goes red on a deleted frozen file', async () => {
    const fixture = await makeFrozenFixture();
    await rm(path.join(fixture.frozenRoot, 'plans/sub/b.md'));

    const report = await verifyFreeze({ outDirAbs: fixture.outDirAbs });
    expect(report.ok).toBe(true);
    if (report.ok) {
      expect(report.value.violations).toEqual([{ kind: 'missing', path: 'plans/sub/b.md' }]);
    }
  });

  it('goes red on an extra file planted under the frozen tree', async () => {
    const fixture = await makeFrozenFixture();
    await writeFile(path.join(fixture.frozenRoot, 'plans/planted.md'), 'not in denominator\n');

    const report = await verifyFreeze({ outDirAbs: fixture.outDirAbs });
    expect(report.ok).toBe(true);
    if (report.ok) {
      expect(report.value.violations).toEqual([{ kind: 'extra', path: 'plans/planted.md' }]);
    }
  });

  it('goes red when the recorded totals disagree with the recomputed file list', async () => {
    const fixture = await makeFrozenFixture();
    const denominator = await readFixtureDenominator(fixture);
    const tampered = {
      ...denominator,
      totals: { ...denominator.totals, files: denominator.totals.files + 1 },
    };
    await writeFile(fixture.denominatorPath, `${JSON.stringify(tampered, null, 2)}\n`);

    const report = await verifyFreeze({ outDirAbs: fixture.outDirAbs });
    expect(report.ok).toBe(true);
    if (report.ok) {
      expect(report.value.violations).toHaveLength(1);
      expect(report.value.violations[0].kind).toBe('totals-mismatch');
    }
  });

  it('goes red on a consistently tampered row (lines edited, totals adjusted to match)', async () => {
    const fixture = await makeFrozenFixture();
    const denominator = await readFixtureDenominator(fixture);
    const tampered = {
      ...denominator,
      files: denominator.files.map((file) =>
        file.path === 'plans/a.md' ? { ...file, lines: file.lines + 1 } : file,
      ),
      totals: { ...denominator.totals, lines: denominator.totals.lines + 1 },
    };
    await writeFile(fixture.denominatorPath, `${JSON.stringify(tampered, null, 2)}\n`);

    const report = await verifyFreeze({ outDirAbs: fixture.outDirAbs });
    expect(report.ok).toBe(true);
    if (report.ok) {
      expect(report.value.violations).toHaveLength(1);
      const violation = report.value.violations[0];
      expect(violation.kind).toBe('recount-mismatch');
      if (violation.kind === 'recount-mismatch') {
        expect(violation.path).toBe('plans/a.md');
        expect(violation.detail).toContain('lines');
      }
    }
  });

  it('reports every violation when several are present at once', async () => {
    const fixture = await makeFrozenFixture();
    const target = path.join(fixture.frozenRoot, 'plans/a.md');
    const bytes = await readFile(target);
    bytes[0] = bytes[0] ^ 0xff;
    await writeFile(target, bytes);
    await writeFile(path.join(fixture.frozenRoot, 'plans/planted.md'), 'not in denominator\n');

    const report = await verifyFreeze({ outDirAbs: fixture.outDirAbs });
    expect(report.ok).toBe(true);
    if (report.ok) {
      expect(report.value.violations).toHaveLength(2);
      const kinds = report.value.violations
        .map((violation) => violation.kind)
        .sort(compareByCodeUnit);
      expect(kinds).toEqual(['extra', 'hash-mismatch']);
    }
  });
});

describe('verifyFreeze — denominator read boundary', () => {
  it('returns a typed error when the denominator artefact is absent', async () => {
    const emptyOut = await mkdtemp(path.join(tmpdir(), 'refound-verify-empty-'));
    tempRoots.push(emptyOut);
    const report = await verifyFreeze({ outDirAbs: emptyOut });
    expect(report.ok).toBe(false);
    if (!report.ok) {
      expect(report.error.message).toContain('denominator');
    }
  });

  it('returns a typed error, never a throw, on an invalid-JSON denominator', async () => {
    const fixture = await makeFrozenFixture();
    await writeFile(fixture.denominatorPath, 'not json{', 'utf8');
    const report = await verifyFreeze({ outDirAbs: fixture.outDirAbs });
    expect(report.ok).toBe(false);
    if (!report.ok) {
      expect(report.error.message).toContain('not valid JSON');
    }
  });

  it('returns a typed error on a schema-invalid denominator document', async () => {
    const fixture = await makeFrozenFixture();
    await writeFile(fixture.denominatorPath, '{"version": 1}\n', 'utf8');
    const report = await verifyFreeze({ outDirAbs: fixture.outDirAbs });
    expect(report.ok).toBe(false);
    if (!report.ok) {
      expect(report.error.message).toContain('failed validation');
    }
  });
});
