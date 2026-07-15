import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rename, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { err, ok, type Result } from '@oaknational/result';

import { renderJsonlArtefact, sha256Hex } from './refounding-artefacts.js';
import { type SweepHit } from './refound-sweep-model.js';
import { parseWindowSampleArgs, resolveWindowSamplePaths } from './refound-window-sample.js';
import { runWindowSample, type ByteSourceFactory } from './refound-window-sample-helpers.js';
import {
  parseWindowSampleManifest,
  WINDOW_SAMPLE_SEGMENT,
  type WindowSampleManifest,
} from './refound-window-sample-schema.js';
import { type ByteSource } from './refound-window-sample-universe.js';

/**
 * Integration behaviours of `refound-window-sample` over real temporary
 * artefact trees and an INJECTED byte source (no process is ever spawned —
 * the git seam has its own in-process proof in
 * `refound-window-sample-git.integration.test.ts`): the universe comes from
 * the injected base, live-tree files are invisible, the artefact is
 * byte-identical across runs, every refusal (expectation mismatch,
 * evidence/base disagreement, unratified rule, malformed hits row,
 * symlinked write dir) writes nothing, and the entry-level flag parsing and
 * path constraints hold.
 */

const BASE = 'ab'.repeat(20);

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

/** In-memory {@link ByteSource} fake carrying the fixture's base content. */
function sourceOf(files: Record<string, string | Buffer>): ByteSource {
  const byPath = new Map<string, Uint8Array>(
    Object.entries(files).map(([relPath, content]) => [
      relPath,
      typeof content === 'string' ? Buffer.from(content, 'utf8') : content,
    ]),
  );
  return {
    listPaths: () => ok([...byPath.keys()]),
    readBytes: (relPath): Result<Uint8Array, Error> => {
      const bytes = byPath.get(relPath);
      return bytes === undefined ? err(new Error(`no bytes staged for '${relPath}'`)) : ok(bytes);
    },
  };
}

/** Write a tree of files (string or bytes) under `root`, creating parents. */
async function writeTree(root: string, files: Record<string, string | Buffer>): Promise<void> {
  for (const [relPath, content] of Object.entries(files)) {
    const absPath = path.join(root, relPath);
    await mkdir(path.dirname(absPath), { recursive: true });
    await writeFile(absPath, content);
  }
}

/** `n` LF-terminated lines with optional 1-indexed line overrides. */
function mdLines(n: number, overrides: Record<number, string> = {}): string {
  return Array.from(
    { length: n },
    (_, index) => overrides[index + 1] ?? `line ${String(index + 1)}`,
  )
    .map((line) => `${line}\n`)
    .join('');
}

function hitRow(file: string, line: number, text: string): SweepHit {
  return { file, line, markers: ['todo'], text, sha256: sha256Hex(Buffer.from(text)) };
}

interface Fixture {
  readonly repoRoot: string;
  readonly ruleAbsPath: string;
  readonly outDirAbs: string;
  readonly evidenceAbsPath: string;
  readonly baseSha: string;
  readonly makeByteSource: ByteSourceFactory;
}

/**
 * A real temporary artefact tree (rule + evidence + hits + any live-only
 * files) around an injected in-memory byte source carrying `baseFiles` —
 * only the injected source can appear in the universe, exactly as only the
 * base commit can in production.
 */
async function makeFixture(options: {
  readonly ratifiedBy?: string | null;
  readonly baseFiles: Record<string, string | Buffer>;
  readonly liveFiles?: Record<string, string | Buffer>;
  readonly hits?: readonly SweepHit[];
  readonly hitsJsonl?: string;
  readonly expected: { scannedFiles: number; hitFiles: number; hitLines: number };
  readonly evidenceBaseSha?: string;
}): Promise<Fixture> {
  const repoRoot = await mkdtemp(path.join(tmpdir(), 'refound-window-sample-'));
  tempRoots.push(repoRoot);
  const rule = {
    version: 1,
    ratifiedBy: 'ratifiedBy' in options ? options.ratifiedBy : '.agent/decisions/g1.md',
    classes: [
      { id: 'plans', globs: ['.agent/plans/**'], verdict: 'in', reason: 'estate' },
      {
        id: 'sweep-surfaces',
        globs: ['.agent/prompts/**'],
        verdict: 'sweep',
        reason: 'live operational surface',
      },
    ],
  };
  const evidence = {
    schemaVersion: 1,
    runBaseSha: options.evidenceBaseSha ?? BASE,
    sweep: {
      filesScanned: options.expected.scannedFiles,
      hits: options.expected.hitLines,
      filesWithHits: options.expected.hitFiles,
    },
  };
  const outDirAbs = path.join(repoRoot, '.agent/plans-refounding');
  await writeTree(repoRoot, {
    ...options.liveFiles,
    '.agent/plans-refounding/freeze-rule.json': `${JSON.stringify(rule, null, 2)}\n`,
    '.agent/plans-refounding/proofs/evidence.v1.json': `${JSON.stringify(evidence, null, 2)}\n`,
    '.agent/plans-refounding/sweep/sweep-hits.v1.jsonl':
      options.hitsJsonl ?? renderJsonlArtefact([...(options.hits ?? [])]),
  });
  return {
    repoRoot,
    ruleAbsPath: path.join(outDirAbs, 'freeze-rule.json'),
    outDirAbs,
    evidenceAbsPath: path.join(outDirAbs, 'proofs/evidence.v1.json'),
    baseSha: BASE,
    makeByteSource: () => ok(sourceOf(options.baseFiles)),
  };
}

async function readManifest(outDirAbs: string): Promise<WindowSampleManifest | undefined> {
  const raw = await readFile(path.join(outDirAbs, WINDOW_SAMPLE_SEGMENT), 'utf8');
  const json: unknown = JSON.parse(raw);
  const parsed = parseWindowSampleManifest(json);
  expect(parsed.ok).toBe(true);
  return parsed.ok ? parsed.value : undefined;
}

const HAPPY = {
  baseFiles: {
    '.agent/prompts/a.md': mdLines(600, { 2: 'todo: port the opener' }),
    '.agent/prompts/b.md': mdLines(3),
    '.agent/plans/in-class.md': mdLines(1),
  },
  hits: [hitRow('.agent/prompts/a.md', 2, 'todo: port the opener')],
  expected: { scannedFiles: 2, hitFiles: 1, hitLines: 1 },
};

describe('runWindowSample — the batch-open computation', () => {
  it('writes the every-10th non-hit window sample bound to the injected base', async () => {
    const fixture = await makeFixture(HAPPY);
    const run = await runWindowSample(fixture);
    expect(run.ok).toBe(true);
    if (run.ok) {
      expect(run.value.base).toBe(BASE);
    }
    const manifest = await readManifest(fixture.outDirAbs);
    expect(manifest?.base).toBe(BASE);
    expect(manifest?.universe).toEqual({
      files: 2,
      windows: 3,
      hit_windows: 1,
      non_hit_windows: 2,
    });
    expect(manifest?.expectations).toEqual({ scanned_files: 2, hit_files: 1, hit_lines: 1 });
    expect(manifest?.sample).toEqual([
      {
        file: '.agent/prompts/a.md',
        window_index: 1,
        start_line: 501,
        end_line: 600,
        line_count: 100,
      },
    ]);
  });

  it('enumerates the universe from the injected base: live-tree files are invisible', async () => {
    const fixture = await makeFixture({
      ...HAPPY,
      liveFiles: {
        '.agent/prompts/b.md': mdLines(900),
        '.agent/prompts/live-only.md': mdLines(5),
      },
    });
    const run = await runWindowSample(fixture);
    expect(run.ok).toBe(true);
    const manifest = await readManifest(fixture.outDirAbs);
    // live-only.md is not in the universe; b.md still counts its 3 base lines.
    expect(manifest?.universe).toEqual({
      files: 2,
      windows: 3,
      hit_windows: 1,
      non_hit_windows: 2,
    });
  });

  it('writes a byte-identical artefact on a double run (determinism contract)', async () => {
    const fixture = await makeFixture(HAPPY);
    expect((await runWindowSample(fixture)).ok).toBe(true);
    const first = await readFile(path.join(fixture.outDirAbs, WINDOW_SAMPLE_SEGMENT));
    expect((await runWindowSample(fixture)).ok).toBe(true);
    const second = await readFile(path.join(fixture.outDirAbs, WINDOW_SAMPLE_SEGMENT));
    expect(first.equals(second)).toBe(true);
  });
});

describe('runWindowSample — refusal chain (nothing written)', () => {
  async function expectRefusal(fixture: Fixture, fragment: string): Promise<void> {
    const run = await runWindowSample(fixture);
    expect(run.ok).toBe(false);
    if (!run.ok) {
      expect(run.error.message).toContain(fragment);
    }
    expect(existsSync(path.join(fixture.outDirAbs, WINDOW_SAMPLE_SEGMENT))).toBe(false);
  }

  it('halts on a scanned-file expectation mismatch', async () => {
    const fixture = await makeFixture({
      ...HAPPY,
      expected: { ...HAPPY.expected, scannedFiles: 3 },
    });
    await expectRefusal(fixture, 'universe');
  });

  it("halts when --base disagrees with the evidence's runBaseSha", async () => {
    const fixture = await makeFixture({ ...HAPPY, evidenceBaseSha: 'ff'.repeat(20) });
    await expectRefusal(fixture, 'runBaseSha');
  });

  it('refuses an unratified rule', async () => {
    const fixture = await makeFixture({ ...HAPPY, ratifiedBy: null });
    await expectRefusal(fixture, 'unratified');
  });

  it('refuses a malformed hits row, naming the offending line', async () => {
    const fixture = await makeFixture({
      ...HAPPY,
      hitsJsonl: '{"file":"broken"\n',
    });
    await expectRefusal(fixture, 'sweep hit line 1');
  });

  it('refuses to write through a symlinked sweep directory', async () => {
    const fixture = await makeFixture(HAPPY);
    const sweepDirAbs = path.join(fixture.outDirAbs, 'sweep');
    const decoyDirAbs = path.join(fixture.repoRoot, 'decoy-sweep');
    await rename(sweepDirAbs, decoyDirAbs);
    await symlink(decoyDirAbs, sweepDirAbs);
    const run = await runWindowSample(fixture);
    expect(run.ok).toBe(false);
    if (!run.ok) {
      expect(run.error.message).toContain('symlink');
    }
    expect(existsSync(path.join(decoyDirAbs, 'window-sample.v1.json'))).toBe(false);
  });
});

describe('parseWindowSampleArgs (entry-level flag surface)', () => {
  it('requires --base and rejects a non-40-hex value', () => {
    expect(parseWindowSampleArgs([]).ok).toBe(false);
    expect(parseWindowSampleArgs(['--base', 'abc123']).ok).toBe(false);
    const parsed = parseWindowSampleArgs(['--base', 'ab'.repeat(20)]);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.baseSha).toBe('ab'.repeat(20));
    }
  });
});

describe('resolveWindowSamplePaths (entry-level path constraints)', () => {
  it('accepts a not-yet-existing out dir alongside existing rule and evidence', async () => {
    const rootAbs = await mkdtemp(path.join(tmpdir(), 'refound-window-sample-resolve-'));
    tempRoots.push(rootAbs);
    await writeFile(path.join(rootAbs, 'freeze-rule.json'), '{}', 'utf8');
    await writeFile(path.join(rootAbs, 'evidence.json'), '{}', 'utf8');
    const resolved = resolveWindowSamplePaths(rootAbs, {
      rulePath: 'freeze-rule.json',
      evidencePath: 'evidence.json',
      outDir: 'artefacts/fresh-home',
    });
    expect(resolved.ok).toBe(true);
    if (resolved.ok) {
      expect(resolved.value.outDirAbs).toBe(path.join(rootAbs, 'artefacts/fresh-home'));
    }
    expect(existsSync(path.join(rootAbs, 'artefacts'))).toBe(false);
  });

  it('refuses a `..`-escaping out dir, a missing rule, and a missing evidence file', async () => {
    const rootAbs = await mkdtemp(path.join(tmpdir(), 'refound-window-sample-resolve-'));
    tempRoots.push(rootAbs);
    await writeFile(path.join(rootAbs, 'freeze-rule.json'), '{}', 'utf8');
    await writeFile(path.join(rootAbs, 'evidence.json'), '{}', 'utf8');
    const escaped = resolveWindowSamplePaths(rootAbs, {
      rulePath: 'freeze-rule.json',
      evidencePath: 'evidence.json',
      outDir: '../escaped-home',
    });
    expect(escaped.ok).toBe(false);
    if (!escaped.ok) {
      expect(escaped.error.message).toContain('resolves outside the repository');
    }
    expect(
      resolveWindowSamplePaths(rootAbs, {
        rulePath: 'absent-rule.json',
        evidencePath: 'evidence.json',
        outDir: '.',
      }).ok,
    ).toBe(false);
    expect(
      resolveWindowSamplePaths(rootAbs, {
        rulePath: 'freeze-rule.json',
        evidencePath: 'absent-evidence.json',
        outDir: '.',
      }).ok,
    ).toBe(false);
  });
});
