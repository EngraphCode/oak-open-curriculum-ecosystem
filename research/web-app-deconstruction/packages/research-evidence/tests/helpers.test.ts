import path from 'node:path';

import { test, expect } from 'vitest';

import { parseArgs, resolveFromCwd } from '../lib/cli.js';
import { isProductionFile } from '../lib/source-files.js';

test('parseArgs separates boolean and value flags', () => {
  expect(parseArgs(['--output', 'result.json', '--skip-next'], ['skip-next'])).toEqual({
    output: 'result.json',
    'skip-next': true,
  });
});

test('parseArgs rejects unknown option names when a command declares its allowed set', () => {
  // `--owaa /checkout` must refuse, never fall through to the default OWA
  // checkout and produce normal-looking wrong evidence.
  expect(() => parseArgs(['--owaa', '/checkout'], [], ['owa', 'output'])).toThrow(
    /Unknown option: --owaa/,
  );
  expect(parseArgs(['--owa', '/checkout'], [], ['owa', 'output'])).toEqual({ owa: '/checkout' });
});

test('parseArgs accepts a forwarded option separator', () => {
  expect(parseArgs(['--', '--output', 'result.json'])).toEqual({
    output: 'result.json',
  });
});

test('resolveFromCwd treats an explicit source path as caller-relative', () => {
  expect(resolveFromCwd('../source', '/unused', '/work/dir')).toBe(path.resolve('/work/source'));
});

test('production filtering excludes tests, stories, mocks and snapshots', () => {
  const root = path.resolve('/source/src');
  expect(isProductionFile(path.join(root, 'feature.tsx'), root)).toBe(true);
  expect(isProductionFile(path.join(root, 'feature.test.tsx'), root)).toBe(false);
  expect(isProductionFile(path.join(root, 'feature.stories.tsx'), root)).toBe(false);
  expect(isProductionFile(path.join(root, '__tests__/feature.ts'), root)).toBe(false);
  expect(isProductionFile(path.join(root, '__snapshots__/feature.ts'), root)).toBe(false);
});
