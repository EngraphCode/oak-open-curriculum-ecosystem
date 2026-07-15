import { describe, expect, it } from 'vitest';

import { err, isErr, ok, type Result } from '@oaknational/result';

import { type FreezeRule } from './freeze-rule-schema.js';
import {
  enumerateUniverse,
  parseTreeEntry,
  reduceGlobsToPrefixes,
  type ByteSource,
} from './refound-window-sample-universe.js';

const RULE: FreezeRule = {
  version: 1,
  ratifiedBy: '.agent/decisions/g1.md',
  classes: [
    { id: 'plans', globs: ['.agent/plans/**'], verdict: 'in', reason: 'estate' },
    { id: 'prompts', globs: ['.agent/prompts/**'], verdict: 'sweep', reason: 'live surface' },
  ],
};

/** In-memory {@link ByteSource} fake: listPaths in given (unsorted) order. */
function sourceOf(files: Record<string, string | Uint8Array>): ByteSource {
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

describe('reduceGlobsToPrefixes', () => {
  it('reduces `<prefix>/**` globs to their prefixes', () => {
    const reduced = reduceGlobsToPrefixes([
      '.agent/prompts/**',
      '.agent/memory/operational/threads/**',
    ]);
    expect(reduced.ok).toBe(true);
    if (reduced.ok) {
      expect(reduced.value).toEqual(['.agent/prompts', '.agent/memory/operational/threads']);
    }
  });

  it('refuses every other glob shape, naming the offending glob', () => {
    for (const glob of ['**', '.agent/*.md', '.agent/**/x', 'docs/**/*.md', '/abs/**', 'a/../**']) {
      const reduced = reduceGlobsToPrefixes([glob]);
      expect(reduced.ok).toBe(false);
      if (!reduced.ok) {
        expect(reduced.error.message).toContain(glob);
        expect(reduced.error.message).toContain("'<prefix>/**'");
      }
    }
  });
});

describe('enumerateUniverse', () => {
  it('admits sweep-class files only (an in-class file is not a sweep surface)', () => {
    const universe = enumerateUniverse(
      sourceOf({
        '.agent/prompts/a.md': 'one line\n',
        '.agent/plans/in-class.md': 'one line\n',
      }),
      RULE,
    );
    expect(universe.ok).toBe(true);
    if (universe.ok) {
      expect(universe.value).toEqual([{ relPath: '.agent/prompts/a.md', lineCount: 1 }]);
    }
  });

  it('excludes the instrument homes by construction, even under a covering glob', () => {
    const coveringRule: FreezeRule = {
      version: 1,
      ratifiedBy: '.agent/decisions/g1.md',
      classes: [{ id: 'all', globs: ['.agent/**'], verdict: 'sweep', reason: 'covering' }],
    };
    const universe = enumerateUniverse(
      sourceOf({
        '.agent/prompts/real.md': 'one line\n',
        '.agent/plans-refounding/decoy.md': 'todo: artefact-home decoy\n',
      }),
      coveringRule,
    );
    expect(universe.ok).toBe(true);
    if (universe.ok) {
      expect(universe.value.map((file) => file.relPath)).toEqual(['.agent/prompts/real.md']);
    }
  });

  it('skips opaque files (null-byte sniff) but keeps non-opaque ones', () => {
    const universe = enumerateUniverse(
      sourceOf({
        '.agent/prompts/blob.bin': Buffer.concat([Buffer.from([0x00]), Buffer.from('x\n')]),
        '.agent/prompts/real.md': 'one line\n',
      }),
      RULE,
    );
    expect(universe.ok).toBe(true);
    if (universe.ok) {
      expect(universe.value.map((file) => file.relPath)).toEqual(['.agent/prompts/real.md']);
    }
  });

  it('keeps a zero-line (empty) file in the universe with lineCount 0', () => {
    const universe = enumerateUniverse(sourceOf({ '.agent/prompts/empty.md': '' }), RULE);
    expect(universe.ok).toBe(true);
    if (universe.ok) {
      expect(universe.value).toEqual([{ relPath: '.agent/prompts/empty.md', lineCount: 0 }]);
    }
  });

  it('sorts the universe by code unit regardless of listPaths order', () => {
    const universe = enumerateUniverse(
      sourceOf({
        '.agent/prompts/z.md': 'one line\n',
        '.agent/prompts/a.md': 'one line\n',
      }),
      RULE,
    );
    expect(universe.ok).toBe(true);
    if (universe.ok) {
      expect(universe.value.map((file) => file.relPath)).toEqual([
        '.agent/prompts/a.md',
        '.agent/prompts/z.md',
      ]);
    }
  });

  it('halts when a universe file cannot be read at base', () => {
    const broken: ByteSource = {
      listPaths: () => ok(['.agent/prompts/ghost.md']),
      readBytes: () => err(new Error('object not found')),
    };
    const universe = enumerateUniverse(broken, RULE);
    expect(universe.ok).toBe(false);
    if (!universe.ok) {
      expect(universe.error.message).toContain('.agent/prompts/ghost.md');
      expect(universe.error.message).toContain('object not found');
    }
  });

  it('halts when listPaths itself fails', () => {
    const broken: ByteSource = {
      listPaths: () => err(new Error('bad object')),
      readBytes: () => err(new Error('unreachable')),
    };
    const universe = enumerateUniverse(broken, RULE);
    expect(universe.ok).toBe(false);
    if (!universe.ok) {
      expect(universe.error.message).toContain('bad object');
    }
  });

  it("refuses a rule that declares no 'sweep' classes", () => {
    const noSweep: FreezeRule = {
      version: 1,
      ratifiedBy: '.agent/decisions/g1.md',
      classes: [{ id: 'plans', globs: ['.agent/plans/**'], verdict: 'in', reason: 'estate' }],
    };
    const universe = enumerateUniverse(sourceOf({}), noSweep);
    expect(universe.ok).toBe(false);
    if (!universe.ok) {
      expect(universe.error.message).toContain("no 'sweep' classes");
    }
  });

  it('halts on a sweep-class glob outside the `<prefix>/**` shape', () => {
    const driftRule: FreezeRule = {
      version: 1,
      ratifiedBy: '.agent/decisions/g1.md',
      classes: [{ id: 'drift', globs: ['.agent/*.md'], verdict: 'sweep', reason: 'drift' }],
    };
    const universe = enumerateUniverse(sourceOf({}), driftRule);
    expect(universe.ok).toBe(false);
    if (!universe.ok) {
      expect(universe.error.message).toContain('.agent/*.md');
    }
  });
});

describe('parseTreeEntry', () => {
  it('parses a regular-file blob entry to its repo-relative path', () => {
    const parsed = parseTreeEntry('100644 blob 8c212300aa\tdocs/a.md');
    expect(parsed).toEqual(ok('docs/a.md'));
  });

  it('parses an executable blob entry to its repo-relative path', () => {
    const parsed = parseTreeEntry('100755 blob 8c212300aa\tscripts/run.sh');
    expect(parsed).toEqual(ok('scripts/run.sh'));
  });

  it('keeps a tab-bearing path intact beyond the first separator', () => {
    const parsed = parseTreeEntry('100644 blob 8c212300aa\ta\tb.md');
    expect(parsed).toEqual(ok('a\tb.md'));
  });

  it('refuses a symlink entry loudly with its mode named', () => {
    const parsed = parseTreeEntry('120000 blob 8c212300aa\tarchive/link.md');
    expect(isErr(parsed)).toBe(true);
    if (isErr(parsed)) {
      expect(parsed.error.message).toContain('mode 120000');
    }
  });

  it('refuses a gitlink entry loudly with its mode named', () => {
    const parsed = parseTreeEntry('160000 commit 8c212300aa\tvendor/sub');
    expect(isErr(parsed)).toBe(true);
    if (isErr(parsed)) {
      expect(parsed.error.message).toContain('mode 160000');
    }
  });

  it('refuses an entry with no tab separator', () => {
    const parsed = parseTreeEntry('100644 blob 8c212300aa docs/a.md');
    expect(isErr(parsed)).toBe(true);
    if (isErr(parsed)) {
      expect(parsed.error.message).toContain('no tab separator');
    }
  });
});
