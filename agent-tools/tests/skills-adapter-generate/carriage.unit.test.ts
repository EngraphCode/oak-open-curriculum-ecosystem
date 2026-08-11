import { describe, expect, it } from 'vitest';

import {
  CARRIED_DIRECTORY_NAMES,
  checkCarriage,
  collectCarriedFiles,
  syncCarriage,
  type CarriageReadFs,
  type CarriageWriteFs,
} from '../../src/skills-adapter-generate/carriage';

const encoder = new TextEncoder();

function bytes(text: string): Uint8Array {
  return encoder.encode(text);
}

/**
 * In-memory read-side carriage fs derived from a flat file map, so directory
 * listings can never disagree with the files they claim to hold.
 */
function makeReadFs(files: ReadonlyMap<string, Uint8Array>): CarriageReadFs {
  return {
    async listSubdirectoryNames(path) {
      const names = new Set<string>();
      const prefix = `${path}/`;
      for (const filePath of files.keys()) {
        if (!filePath.startsWith(prefix)) {
          continue;
        }
        const remainder = filePath.slice(prefix.length);
        const separatorIndex = remainder.indexOf('/');
        if (separatorIndex > 0) {
          names.add(remainder.slice(0, separatorIndex));
        }
      }
      return [...names];
    },
    async listFileNames(path) {
      const names: string[] = [];
      const prefix = `${path}/`;
      for (const filePath of files.keys()) {
        if (filePath.startsWith(prefix) && !filePath.slice(prefix.length).includes('/')) {
          names.push(filePath.slice(prefix.length));
        }
      }
      return names;
    },
    async readFileBytesOrUndefined(path) {
      return files.get(path);
    },
  };
}

/** Mutable write-side fs over the same derived-listing model. */
function makeWriteFs(files: Map<string, Uint8Array>): CarriageWriteFs {
  return {
    ...makeReadFs(files),
    async listSubdirectoryNames(path) {
      return makeReadFs(files).listSubdirectoryNames(path);
    },
    async listFileNames(path) {
      return makeReadFs(files).listFileNames(path);
    },
    async readFileBytesOrUndefined(path) {
      return files.get(path);
    },
    async copyFileWithParents(sourcePath, targetPath) {
      // A missing source is a fixture defect; plant a loud sentinel so the
      // test's byte assertions fail visibly rather than throwing here.
      files.set(targetPath, files.get(sourcePath) ?? bytes(`FIXTURE-MISSING:${sourcePath}`));
    },
    async removeFile(path) {
      files.delete(path);
    },
    async removeDirectoryIfEmpty() {
      // Derived listings cannot hold an empty directory; real-fs empty-dir
      // cleanup is proven in the integration suite.
    },
  };
}

describe('CARRIED_DIRECTORY_NAMES', () => {
  it('carries scripts, references, and assets — and never evals', () => {
    expect([...CARRIED_DIRECTORY_NAMES].sort((a, b) => a.localeCompare(b, 'en'))).toEqual([
      'assets',
      'references',
      'scripts',
    ]);
    expect(CARRIED_DIRECTORY_NAMES).not.toContain('evals');
  });
});

describe('collectCarriedFiles', () => {
  const canonicalDir = '/repo/.agent/skills/cognition/parallax';

  it('collects files under every carried directory, nested arbitrarily deep, sorted', async () => {
    const fs = makeReadFs(
      new Map([
        [`${canonicalDir}/SKILL-CANONICAL.md`, bytes('canonical')],
        [`${canonicalDir}/references/orchestration.md`, bytes('a')],
        [`${canonicalDir}/references/family/graphs/catalogue.json`, bytes('b')],
        [`${canonicalDir}/scripts/render_graph.py`, bytes('c')],
        [`${canonicalDir}/assets/inquiry-charter.yaml`, bytes('d')],
      ]),
    );

    const carried = await collectCarriedFiles(canonicalDir, fs);

    expect(carried).toEqual([
      'assets/inquiry-charter.yaml',
      'references/family/graphs/catalogue.json',
      'references/orchestration.md',
      'scripts/render_graph.py',
    ]);
  });

  it('returns an empty list for a skill with no supporting directories', async () => {
    const fs = makeReadFs(new Map([[`${canonicalDir}/SKILL-CANONICAL.md`, bytes('canonical')]]));

    expect(await collectCarriedFiles(canonicalDir, fs)).toEqual([]);
  });

  it('never collects evals, evaluations, or any other non-carried directory', async () => {
    const fs = makeReadFs(
      new Map([
        [`${canonicalDir}/evals/evals.json`, bytes('e')],
        [`${canonicalDir}/evaluations/routing/evals.json`, bytes('f')],
        [`${canonicalDir}/shared/notes.md`, bytes('g')],
        [`${canonicalDir}/references/kept.md`, bytes('h')],
      ]),
    );

    expect(await collectCarriedFiles(canonicalDir, fs)).toEqual(['references/kept.md']);
  });
});

describe('checkCarriage', () => {
  const canonicalDir = '/repo/.agent/skills/cognition/parallax';
  const adapterDir = '/repo/.claude/skills/oak-parallax';

  it('is clean when every carried file exists byte-identically and nothing else is present', async () => {
    const fs = makeReadFs(
      new Map([
        [`${canonicalDir}/references/a.md`, bytes('alpha')],
        [`${adapterDir}/SKILL.md`, bytes('adapter')],
        [`${adapterDir}/references/a.md`, bytes('alpha')],
      ]),
    );

    const result = await checkCarriage(canonicalDir, adapterDir, fs);

    expect(result).toEqual({
      missing: [],
      drifted: [],
      orphaned: [],
      carriedCount: 1,
    });
  });

  it('reports a carried file missing from the projection', async () => {
    const fs = makeReadFs(
      new Map([
        [`${canonicalDir}/references/a.md`, bytes('alpha')],
        [`${adapterDir}/SKILL.md`, bytes('adapter')],
      ]),
    );

    const result = await checkCarriage(canonicalDir, adapterDir, fs);

    expect(result.missing).toEqual([`${adapterDir}/references/a.md`]);
    expect(result.drifted).toEqual([]);
  });

  it('reports byte drift on a mutated carried file', async () => {
    const fs = makeReadFs(
      new Map([
        [`${canonicalDir}/references/a.md`, bytes('alpha')],
        [`${adapterDir}/SKILL.md`, bytes('adapter')],
        [`${adapterDir}/references/a.md`, bytes('alpha — mutated')],
      ]),
    );

    const result = await checkCarriage(canonicalDir, adapterDir, fs);

    expect(result.drifted).toEqual([`${adapterDir}/references/a.md`]);
    expect(result.missing).toEqual([]);
  });

  it('reports an orphan: a projection file whose canonical source is gone', async () => {
    const fs = makeReadFs(
      new Map([
        [`${canonicalDir}/references/kept.md`, bytes('kept')],
        [`${adapterDir}/SKILL.md`, bytes('adapter')],
        [`${adapterDir}/references/kept.md`, bytes('kept')],
        [`${adapterDir}/references/deleted-upstream.md`, bytes('stale')],
      ]),
    );

    const result = await checkCarriage(canonicalDir, adapterDir, fs);

    expect(result.orphaned).toEqual([`${adapterDir}/references/deleted-upstream.md`]);
    expect(result.drifted).toEqual([]);
  });

  it('treats projection evals content as orphaned — evals are never carried', async () => {
    const fs = makeReadFs(
      new Map([
        [`${canonicalDir}/evals/evals.json`, bytes('cases')],
        [`${adapterDir}/SKILL.md`, bytes('adapter')],
        [`${adapterDir}/evals/evals.json`, bytes('cases')],
      ]),
    );

    const result = await checkCarriage(canonicalDir, adapterDir, fs);

    expect(result.orphaned).toEqual([`${adapterDir}/evals/evals.json`]);
  });

  it('never counts the adapter SKILL.md itself as an orphan', async () => {
    const fs = makeReadFs(new Map([[`${adapterDir}/SKILL.md`, bytes('adapter')]]));

    const result = await checkCarriage(canonicalDir, adapterDir, fs);

    expect(result).toEqual({ missing: [], drifted: [], orphaned: [], carriedCount: 0 });
  });
});

describe('syncCarriage', () => {
  const canonicalDir = '/repo/.agent/skills/cognition/parallax';
  const adapterDir = '/repo/.claude/skills/oak-parallax';

  it('copies every carried file into the projection byte-stably', async () => {
    const files = new Map([
      [`${canonicalDir}/references/a.md`, bytes('alpha')],
      [`${canonicalDir}/scripts/tool.py`, bytes('print("hi")\n')],
      [`${adapterDir}/SKILL.md`, bytes('adapter')],
    ]);

    const outcome = await syncCarriage(canonicalDir, adapterDir, makeWriteFs(files));

    expect(outcome.carried).toEqual([
      `${adapterDir}/references/a.md`,
      `${adapterDir}/scripts/tool.py`,
    ]);
    expect(outcome.pruned).toEqual([]);
    expect(files.get(`${adapterDir}/references/a.md`)).toEqual(bytes('alpha'));
    expect(files.get(`${adapterDir}/scripts/tool.py`)).toEqual(bytes('print("hi")\n'));
  });

  it('overwrites a drifted projection copy with the canonical bytes', async () => {
    const files = new Map([
      [`${canonicalDir}/references/a.md`, bytes('canonical')],
      [`${adapterDir}/SKILL.md`, bytes('adapter')],
      [`${adapterDir}/references/a.md`, bytes('drifted')],
    ]);

    await syncCarriage(canonicalDir, adapterDir, makeWriteFs(files));

    expect(files.get(`${adapterDir}/references/a.md`)).toEqual(bytes('canonical'));
  });

  it('prunes orphans whose canonical source is gone, leaving SKILL.md untouched', async () => {
    const files = new Map([
      [`${canonicalDir}/references/kept.md`, bytes('kept')],
      [`${adapterDir}/SKILL.md`, bytes('adapter')],
      [`${adapterDir}/references/kept.md`, bytes('kept')],
      [`${adapterDir}/references/deleted-upstream.md`, bytes('stale')],
      [`${adapterDir}/evals/evals.json`, bytes('never carried')],
    ]);

    const outcome = await syncCarriage(canonicalDir, adapterDir, makeWriteFs(files));

    expect(outcome.pruned).toEqual([
      `${adapterDir}/evals/evals.json`,
      `${adapterDir}/references/deleted-upstream.md`,
    ]);
    expect(files.has(`${adapterDir}/references/deleted-upstream.md`)).toBe(false);
    expect(files.has(`${adapterDir}/evals/evals.json`)).toBe(false);
    expect(files.get(`${adapterDir}/SKILL.md`)).toEqual(bytes('adapter'));
    expect(files.get(`${adapterDir}/references/kept.md`)).toEqual(bytes('kept'));
  });

  it('carries nothing and prunes nothing for a skill with no supporting content', async () => {
    const files = new Map([[`${adapterDir}/SKILL.md`, bytes('adapter')]]);

    const outcome = await syncCarriage(canonicalDir, adapterDir, makeWriteFs(files));

    expect(outcome).toEqual({ carried: [], pruned: [] });
  });
});
