import { test, expect } from 'vitest';

import {
  appRouteRole,
  classifyArea,
  externalPackageRoot,
  importShapeHasRuntimeBinding,
  stronglyConnectedComponents,
} from '../lib/owa-architecture-inventory.js';

test('classifies top-level source areas', () => {
  expect(classifyArea('src/app/layout.tsx')).toBe('app');
  expect(classifyArea('src/node-lib/cache/index.ts')).toBe('node-lib');
});

test('recognises App Router convention files only', () => {
  expect(appRouteRole('src/app/(core)/teachers/page.tsx')).toBe('page');
  expect(appRouteRole('src/app/api/items/route.ts')).toBe('route');
  expect(appRouteRole('src/app/components/Card.tsx')).toBe(null);
  expect(appRouteRole('src/pages/index.tsx')).toBe(null);
});

test('normalises external package roots', () => {
  expect(externalPackageRoot('@clerk/nextjs/server')).toBe('@clerk/nextjs');
  expect(externalPackageRoot('next/cache')).toBe('next');
  expect(externalPackageRoot('node:path')).toBe('node:');
});

test('keeps default imports runtime-relevant beside type-only named imports', () => {
  expect(
    importShapeHasRuntimeBinding({
      clauseIsTypeOnly: false,
      hasDefaultBinding: true,
      namedSpecifierTypeOnly: [true],
    }),
  ).toBe(true);
  expect(
    importShapeHasRuntimeBinding({
      clauseIsTypeOnly: false,
      hasDefaultBinding: false,
      namedSpecifierTypeOnly: [true, true],
    }),
  ).toBe(false);
});

test('finds strongly connected components', () => {
  const graph = new Map<string, Set<string>>([
    ['a', new Set(['b'])],
    ['b', new Set(['a', 'c'])],
    ['c', new Set()],
  ]);
  const result = stronglyConnectedComponents(['a', 'b', 'c'], graph);
  expect(
    result.map((component) => component.sort()).sort((a, b) => a[0].localeCompare(b[0])),
  ).toEqual([['a', 'b'], ['c']]);
});
