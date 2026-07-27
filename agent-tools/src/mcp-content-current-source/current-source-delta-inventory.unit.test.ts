import { describe, expect, it } from 'vitest';
import {
  buildCurrentSourceDeltaInventory,
  deriveCurrentDeltaFiles,
  semanticSourceSha256,
} from './current-source-delta-inventory.js';

describe('buildCurrentSourceDeltaInventory', () => {
  const current = [
    {
      auditId: 'C001',
      files: ['content.ts'],
      evidence: { revision: 'unchanged', targets: [] },
      registrations: [],
    },
  ] as const;

  const review = (file: string, content: string, itemIds: readonly string[]) => ({
    semanticSha256: semanticSourceSha256(content, file),
    itemIds,
  });

  const exclusion = (file: string, content: string, exclusionReason: string) => ({
    semanticSha256: semanticSourceSha256(content, file),
    itemIds: [],
    exclusionReason,
  });

  it('binds exact reviewed semantic states to explicit item ids and exclusions', () => {
    const inventory = buildCurrentSourceDeltaInventory({
      baselineCommit: 'baseline',
      changedFiles: ['content.ts', 'machinery.ts'],
      contentByFile: new Map([
        ['content.ts', 'content\r\n'],
        ['machinery.ts', 'machinery\n'],
      ]),
      current,
      additions: [],
      reviews: {
        'content.ts': review('content.ts', 'content\r\n', ['C001']),
        'machinery.ts': exclusion('machinery.ts', 'machinery\n', 'Reviewed implementation only.'),
      },
    });

    expect(inventory.files).toMatchObject([
      { file: 'content.ts', itemIds: ['C001'] },
      {
        file: 'machinery.ts',
        itemIds: [],
        exclusionReason: 'Reviewed implementation only.',
      },
    ]);
    expect(inventory.files[0]?.semanticSha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it('rejects a changed file that is neither inventoried nor explicitly reviewed out', () => {
    expect(() =>
      buildCurrentSourceDeltaInventory({
        baselineCommit: 'baseline',
        changedFiles: ['content.ts', 'unreviewed.ts'],
        contentByFile: new Map([
          ['content.ts', 'content\n'],
          ['unreviewed.ts', 'new instruction\n'],
        ]),
        current,
        additions: [],
        reviews: {
          'content.ts': review('content.ts', 'content\n', ['C001']),
        },
      }),
    ).toThrow('Reviewed semantic-delta files differ');
  });

  it('rejects new content in an already-bound file until the exact semantic state is reviewed', () => {
    expect(() =>
      buildCurrentSourceDeltaInventory({
        baselineCommit: 'baseline',
        changedFiles: ['content.ts'],
        contentByFile: new Map([
          ['content.ts', "export const content = 'new agent instruction';\n"],
        ]),
        current,
        additions: [],
        reviews: {
          'content.ts': review('content.ts', 'export const content = 1;\n', ['C001']),
        },
      }),
    ).toThrow('Reviewed semantic delta is stale for content.ts');
  });

  it('ignores formatting, line endings, comments, optional punctuation, and quote style', () => {
    expect(
      semanticSourceSha256(
        "const content = ['one', 'two',];\r\nconst other = { value: 'same', };\n",
        'content.ts',
      ),
    ).toBe(
      semanticSourceSha256(
        '/** Documentation trivia. */\n// note\nconst  content=["one","two"]\nconst other={value:"same"}\n',
        'content.ts',
      ),
    );
    expect(semanticSourceSha256('type Content = First | Second;\n', 'content.ts')).toBe(
      semanticSourceSha256('type Content =\n  | First\n  | Second\n', 'content.ts'),
    );
  });

  it('changes the semantic source hash for wording and structural controls', () => {
    const hash = (content: string) => semanticSourceSha256(content, 'content.ts');

    expect(hash("const content = 'first';")).not.toBe(hash("const content = 'second';"));
    expect(hash("const content = new Set(['one']);")).not.toBe(
      hash("const content = new Set(['one', 'two']);"),
    );
  });

  it('distinguishes operators and declaration flags represented as scalar AST properties', () => {
    const hash = (content: string) => semanticSourceSha256(content, 'content.ts');

    expect(hash('const content = +value;')).not.toBe(hash('const content = -value;'));
    expect(hash('content++;')).not.toBe(hash('content--;'));
    expect(hash('let content = value;')).not.toBe(hash('const content = value;'));
    expect(hash("import { type Content } from './content.js';")).not.toBe(
      hash("import { Content } from './content.js';"),
    );
    expect(hash('const content = (value?.field).nested;')).not.toBe(
      hash('const content = value?.field.nested;'),
    );
    expect(hash('const content = (value?.method)();')).not.toBe(
      hash('const content = value?.method();'),
    );
  });

  it('ignores redundant expression and type parentheses without erasing their structure', () => {
    const hash = (content: string) => semanticSourceSha256(content, 'content.ts');

    expect(hash('const content = value + other;')).toBe(hash('const content = (value + other);'));
    expect(hash('type Content = First | Second;')).toBe(hash('type Content = (First | Second);'));
  });

  it('includes untracked governed source files before they are staged', () => {
    const calls: string[][] = [];
    const governedFile = 'apps/oak-curriculum-mcp-streamable-http/src/new-agent-facing-content.ts';
    const changed = deriveCurrentDeltaFiles('/repo', 'baseline', {
      git: (args) => {
        calls.push([...args]);
        return args.includes('diff') ? '' : `${governedFile}\n`;
      },
      readFile: () => {
        throw new Error('untracked additions do not need a baseline comparison');
      },
    });

    expect(changed).toEqual([governedFile]);
    expect(calls.some((args) => args.includes('--others'))).toBe(true);
  });
});
