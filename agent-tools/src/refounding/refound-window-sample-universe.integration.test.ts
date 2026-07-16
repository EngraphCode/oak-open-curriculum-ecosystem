import { describe, expect, it } from 'vitest';

import { err, ok, unwrap, unwrapErr, type Result } from '@oaknational/result';

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
    const reduced = unwrap(
      reduceGlobsToPrefixes(['.agent/prompts/**', '.agent/memory/operational/threads/**']),
    );
    expect(reduced).toEqual(['.agent/prompts', '.agent/memory/operational/threads']);
  });

  it('refuses every other glob shape, naming the offending glob', () => {
    const extglobShapes = ['+(archive)/**', '@(a|b)/**', 'a|b/**', String.raw`a\b/**`];
    for (const glob of [
      '**',
      '.agent/*.md',
      '.agent/**/x',
      'docs/**/*.md',
      '/abs/**',
      'a/../**',
      ...extglobShapes,
    ]) {
      const error = unwrapErr(reduceGlobsToPrefixes([glob]));
      expect(error.message).toContain(glob);
      expect(error.message).toContain("'<prefix>/**'");
    }
  });

  it('refuses a prefix with a `.`, `..`, or empty segment (tinyglobby normalises, prefix does not)', () => {
    for (const glob of ['./foo/**', 'foo/./bar/**', 'foo//bar/**', 'foo/../bar/**']) {
      const error = unwrapErr(reduceGlobsToPrefixes([glob]));
      expect(error.message).toContain(glob);
      expect(error.message).toContain("'<prefix>/**'");
    }
  });

  it('accepts a plain `<prefix>/**` glob whose segments are all clean names', () => {
    expect(unwrap(reduceGlobsToPrefixes(['foo/**']))).toEqual(['foo']);
    expect(unwrap(reduceGlobsToPrefixes(['foo/bar/**']))).toEqual(['foo/bar']);
  });
});

describe('enumerateUniverse', () => {
  it('admits sweep-class files only (an in-class file is not a sweep surface)', () => {
    const universe = unwrap(
      enumerateUniverse(
        sourceOf({
          '.agent/prompts/a.md': 'one line\n',
          '.agent/plans/in-class.md': 'one line\n',
        }),
        RULE,
      ),
    );
    expect(universe).toEqual([{ relPath: '.agent/prompts/a.md', lineCount: 1 }]);
  });

  it('excludes the instrument homes by construction, even under a covering glob', () => {
    const coveringRule: FreezeRule = {
      version: 1,
      ratifiedBy: '.agent/decisions/g1.md',
      classes: [{ id: 'all', globs: ['.agent/**'], verdict: 'sweep', reason: 'covering' }],
    };
    const universe = unwrap(
      enumerateUniverse(
        sourceOf({
          '.agent/prompts/real.md': 'one line\n',
          '.agent/plans-refounding/decoy.md': 'todo: artefact-home decoy\n',
        }),
        coveringRule,
      ),
    );
    expect(universe.map((file) => file.relPath)).toEqual(['.agent/prompts/real.md']);
  });

  it('skips opaque files (null-byte sniff) but keeps non-opaque ones', () => {
    const universe = unwrap(
      enumerateUniverse(
        sourceOf({
          '.agent/prompts/blob.bin': Buffer.concat([Buffer.from([0x00]), Buffer.from('x\n')]),
          '.agent/prompts/real.md': 'one line\n',
        }),
        RULE,
      ),
    );
    expect(universe.map((file) => file.relPath)).toEqual(['.agent/prompts/real.md']);
  });

  it('keeps a zero-line (empty) file in the universe with lineCount 0', () => {
    const universe = unwrap(enumerateUniverse(sourceOf({ '.agent/prompts/empty.md': '' }), RULE));
    expect(universe).toEqual([{ relPath: '.agent/prompts/empty.md', lineCount: 0 }]);
  });

  it('sorts the universe by code unit regardless of listPaths order', () => {
    const universe = unwrap(
      enumerateUniverse(
        sourceOf({
          '.agent/prompts/z.md': 'one line\n',
          '.agent/prompts/a.md': 'one line\n',
        }),
        RULE,
      ),
    );
    expect(universe.map((file) => file.relPath)).toEqual([
      '.agent/prompts/a.md',
      '.agent/prompts/z.md',
    ]);
  });

  it('halts when a universe file cannot be read at base', () => {
    const broken: ByteSource = {
      listPaths: () => ok(['.agent/prompts/ghost.md']),
      readBytes: () => err(new Error('object not found')),
    };
    const error = unwrapErr(enumerateUniverse(broken, RULE));
    expect(error.message).toContain('.agent/prompts/ghost.md');
    expect(error.message).toContain('object not found');
  });

  it('halts when listPaths itself fails', () => {
    const broken: ByteSource = {
      listPaths: () => err(new Error('bad object')),
      readBytes: () => err(new Error('unreachable')),
    };
    const error = unwrapErr(enumerateUniverse(broken, RULE));
    expect(error.message).toContain('bad object');
  });

  it("refuses a rule that declares no 'sweep' classes", () => {
    const noSweep: FreezeRule = {
      version: 1,
      ratifiedBy: '.agent/decisions/g1.md',
      classes: [{ id: 'plans', globs: ['.agent/plans/**'], verdict: 'in', reason: 'estate' }],
    };
    const error = unwrapErr(enumerateUniverse(sourceOf({}), noSweep));
    expect(error.message).toContain("no 'sweep' classes");
  });

  it('halts on a sweep-class glob outside the `<prefix>/**` shape', () => {
    const driftRule: FreezeRule = {
      version: 1,
      ratifiedBy: '.agent/decisions/g1.md',
      classes: [{ id: 'drift', globs: ['.agent/*.md'], verdict: 'sweep', reason: 'drift' }],
    };
    const error = unwrapErr(enumerateUniverse(sourceOf({}), driftRule));
    expect(error.message).toContain('.agent/*.md');
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
    const error = unwrapErr(parseTreeEntry('120000 blob 8c212300aa\tarchive/link.md'));
    expect(error.message).toContain('mode 120000');
  });

  it('refuses a gitlink entry loudly with its mode named', () => {
    const error = unwrapErr(parseTreeEntry('160000 commit 8c212300aa\tvendor/sub'));
    expect(error.message).toContain('mode 160000');
  });

  it('refuses an entry with no tab separator', () => {
    const error = unwrapErr(parseTreeEntry('100644 blob 8c212300aa docs/a.md'));
    expect(error.message).toContain('no tab separator');
  });
});
