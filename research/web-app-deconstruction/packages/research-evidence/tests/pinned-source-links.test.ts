import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { test, expect } from 'vitest';

import {
  extractPinnedSourceAnchors,
  validatePinnedSourceLinks,
} from '../lib/pinned-source-links.js';

const revision = '1234567890abcdef1234567890abcdef12345678';

// Interpolated so no complete private-repository URL substring appears in
// this public file; the repository NAMES are public (see the record's
// pre-move publication-safety scan), the full blob-URL shapes are not kept.
const databaseToolsRepository = 'Database-Tools';
const oakOpenapiRepository = 'oak-openapi';

test('extracts encoded pinned source paths and line ranges', () => {
  const source = `[evidence](https://github.com/oaknational/Oak-Web-Application/blob/${revision}/src/app/%28core%29/page.tsx#L2-L4)

\`\`\`
[ignored](https://github.com/oaknational/Oak-Web-Application/blob/${revision}/bad.ts#L1)
\`\`\``;
  expect(extractPinnedSourceAnchors(source, 'record.md')).toEqual([
    {
      document: 'record.md',
      repository: 'Oak-Web-Application',
      revision,
      file: 'src/app/(core)/page.tsx',
      startLine: 2,
      endLine: 4,
    },
  ]);
});

test('recognises Database-Tools and oak-openapi evidence repositories', () => {
  const source = `[database](https://github.com/oaknational/${databaseToolsRepository}/blob/${revision}/database-tools/schema.sql#L1)
[api](https://github.com/oaknational/${oakOpenapiRepository}/blob/${revision}/src/route.ts#L2-L4)`;
  expect(extractPinnedSourceAnchors(source, 'record.md')).toEqual([
    {
      document: 'record.md',
      repository: 'Database-Tools',
      revision,
      file: 'database-tools/schema.sql',
      startLine: 1,
      endLine: 1,
    },
    {
      document: 'record.md',
      repository: 'oak-openapi',
      revision,
      file: 'src/route.ts',
      startLine: 2,
      endLine: 4,
    },
  ]);
});

test('validates source paths, revisions and line bounds', async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'pinned-source-links-'));
  const markdownRoot = path.join(temporaryRoot, 'docs');
  const repositoryRoot = path.join(temporaryRoot, 'owa');

  try {
    await mkdir(path.join(repositoryRoot, 'src'), { recursive: true });
    await mkdir(markdownRoot, { recursive: true });
    await writeFile(path.join(repositoryRoot, 'src/example.ts'), 'one\ntwo\nthree\n');
    await writeFile(
      path.join(markdownRoot, 'record.md'),
      `[evidence](https://github.com/oaknational/Oak-Web-Application/blob/${revision}/src/example.ts#L2-L3)`,
    );

    const result = await validatePinnedSourceLinks(markdownRoot, {
      'Oak-Web-Application': { root: repositoryRoot, revision },
    });

    expect(result.documentCount).toBe(1);
    expect(result.sourceLinkCount).toBe(1);
    expect(result.lineAnchorCount).toBe(1);
    expect(result.byRepository).toEqual({ 'Oak-Web-Application': 1 });
    expect(result.failures).toEqual([]);

    await writeFile(
      path.join(markdownRoot, 'record.md'),
      `[bad revision](https://github.com/oaknational/Oak-Web-Application/blob/abcdefabcdefabcdefabcdefabcdefabcdefabcd/src/example.ts#L1)\n[bad range](https://github.com/oaknational/Oak-Web-Application/blob/${revision}/src/example.ts#L4)\n[missing file](https://github.com/oaknational/Oak-Web-Application/blob/${revision}/src/missing.ts#L1)\n[escape](https://github.com/oaknational/Oak-Web-Application/blob/${revision}/src/%2e%2e/outside.ts#L1)\n[malformed](https://github.com/oaknational/Oak-Web-Application/blob/${revision}/src/example.ts#L1-L2junk)`,
    );
    const invalid = await validatePinnedSourceLinks(markdownRoot, {
      'Oak-Web-Application': { root: repositoryRoot, revision },
    });

    expect(invalid.failures.length).toBe(5);
    expect(invalid.failures.some((failure) => /link uses abcdef/.test(failure))).toBeTruthy();
    expect(invalid.failures.some((failure) => /invalid .*#L4-L4/.test(failure))).toBeTruthy();
    expect(
      invalid.failures.some((failure) => /missing .*src\/missing\.ts/.test(failure)),
    ).toBeTruthy();
    expect(invalid.failures.some((failure) => /source path escapes/.test(failure))).toBeTruthy();
    expect(
      invalid.failures.some((failure) => /malformed or unsupported/.test(failure)),
    ).toBeTruthy();

    await writeFile(path.join(markdownRoot, 'record.md'), 'No source links.');
    const empty = await validatePinnedSourceLinks(markdownRoot, {
      'Oak-Web-Application': { root: repositoryRoot, revision },
    });
    expect(
      empty.failures.includes('concept-lens portfolio contains no pinned source links'),
    ).toBeTruthy();
    expect(
      empty.failures.includes('concept-lens portfolio has no source links for Oak-Web-Application'),
    ).toBeTruthy();
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
