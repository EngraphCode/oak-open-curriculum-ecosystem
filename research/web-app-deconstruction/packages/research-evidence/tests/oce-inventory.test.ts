import { test, expect } from 'vitest';

import {
  hubRouteFromPage,
  parseRuleIndexRows,
  parseWorkspacePatterns,
  resolveWorkspaceDirectories,
  summarizeCourse,
  summarizeGraphCorpus,
} from '../lib/oce-inventory.js';

test('workspace patterns resolve explicit and wildcard package directories', () => {
  const source = `packages:
  - apps/service
  - packages/design/*

minimumReleaseAge: 1440
`;
  const files = [
    'package.json',
    'apps/service/package.json',
    'packages/design/core/package.json',
    'packages/design/oak/package.json',
    'packages/ignored/package.json',
  ];

  const patterns = parseWorkspacePatterns(source);
  expect(patterns).toEqual(['apps/service', 'packages/design/*']);
  expect(resolveWorkspaceDirectories(files, patterns)).toEqual([
    'apps/service',
    'packages/design/core',
    'packages/design/oak',
  ]);
});

test('Hub route derivation handles root, dynamic and grouped pages', () => {
  expect(hubRouteFromPage('demos/oak-curriculum-hub/app/page.tsx')).toBe('/');
  expect(hubRouteFromPage('demos/oak-curriculum-hub/app/(core)/lesson/[slug]/page.tsx')).toBe(
    '/lesson/[slug]',
  );
  expect(hubRouteFromPage('demos/oak-curriculum-hub/app/api/search/route.ts')).toBeNull();
});

test('graph summary separates reported coverage from node subject values', () => {
  const summary = summarizeGraphCorpus({
    version: '1',
    generatedAt: 'now',
    sourceVersion: 'source',
    stats: {
      totalNodes: 2,
      totalEdges: 1,
      subjectsCovered: ['science'],
    },
    nodes: [{ subject: 'science' }, { subject: 'combined-science' }],
    edges: [{ source: 'a', target: 'b' }],
  });

  expect(summary.reportedCountsMatchPayload).toBe(true);
  expect(summary.reportedSubjectsCoveredCount).toBe(1);
  expect(summary.distinctNodeSubjectValueCount).toBe(2);
});

test('course summary counts blocks across intro and module sections', () => {
  expect(
    summarizeCourse({
      units: [{ id: 'unit' }],
      intro: {
        sections: [{ blocks: [{ t: 'text' }] }],
      },
      modules: [
        {
          sections: [{ blocks: [{ t: 'heading' }, { t: 'text' }] }, { blocks: [] }],
        },
      ],
    }),
  ).toEqual({
    unitCount: 1,
    moduleCount: 1,
    introSectionCount: 1,
    moduleSectionCount: 2,
    sectionCount: 3,
    blockCount: 3,
  });
});

test('rule index parsing captures canonical paths and classifications', () => {
  expect(
    parseRuleIndexRows(`
| Rule | Classification | Trigger |
| --- | --- | --- |
| \`.agent/rules/always.md\` | always-on | - |
| \`.agent/rules/trigger.md\` | trigger-loaded | Event |
`),
  ).toEqual([
    { path: '.agent/rules/always.md', classification: 'always-on' },
    {
      path: '.agent/rules/trigger.md',
      classification: 'trigger-loaded',
    },
  ]);
});
