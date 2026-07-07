import { describe, expect, it } from 'vitest';

import { type DenominatorFile } from './refounding-artefacts.js';
import {
  buildArrivalsReport,
  hasUnsanctionedArrivals,
  parseArrivalsReport,
  type LiveFileIdentity,
} from './refound-merge-recheck-model.js';

const SHA_A = 'a'.repeat(64);
const SHA_B = 'b'.repeat(64);
const SHA_C = 'c'.repeat(64);
const SHA_D = 'd'.repeat(64);

const denominatorFiles: readonly DenominatorFile[] = [
  { path: 'plans/a.md', bytes: 12, sha256: SHA_A, lines: 3, inventory_mode: 'lines' },
  { path: 'plans/sub/b.md', bytes: 20, sha256: SHA_B, lines: 2, inventory_mode: 'lines' },
];

const liveUnchanged: readonly LiveFileIdentity[] = [
  { sourcePath: '.agent/plans/a.md', frozenPath: 'plans/a.md', sha256: SHA_A },
  { sourcePath: '.agent/plans/sub/b.md', frozenPath: 'plans/sub/b.md', sha256: SHA_B },
];

const emptySanctioned = new Map<string, string>();

describe('buildArrivalsReport — classification in FROZEN coordinate space', () => {
  it('reports a clean live tree as zero deltas of every class', () => {
    const report = buildArrivalsReport({
      denominatorFiles,
      liveFiles: liveUnchanged,
      sanctionedClassBySource: emptySanctioned,
    });
    expect(report.totals).toEqual({
      liveFiles: 2,
      frozenFiles: 2,
      added: 0,
      modified: 0,
      deleted: 0,
      sanctioned: 0,
    });
    expect(hasUnsanctionedArrivals(report)).toBe(false);
  });

  it('classifies a live file with no frozen counterpart as added', () => {
    const report = buildArrivalsReport({
      denominatorFiles,
      liveFiles: [
        ...liveUnchanged,
        { sourcePath: '.agent/plans/new.md', frozenPath: 'plans/new.md', sha256: SHA_C },
      ],
      sanctionedClassBySource: emptySanctioned,
    });
    expect(report.added).toEqual([
      { source: '.agent/plans/new.md', frozenPath: 'plans/new.md', liveSha256: SHA_C },
    ]);
    expect(hasUnsanctionedArrivals(report)).toBe(true);
  });

  it('classifies modified by STRICT byte identity — any hash difference, no banner exemption', () => {
    const report = buildArrivalsReport({
      denominatorFiles,
      liveFiles: [
        { sourcePath: '.agent/plans/a.md', frozenPath: 'plans/a.md', sha256: SHA_D },
        { sourcePath: '.agent/plans/sub/b.md', frozenPath: 'plans/sub/b.md', sha256: SHA_B },
      ],
      sanctionedClassBySource: emptySanctioned,
    });
    expect(report.modified).toEqual([
      {
        source: '.agent/plans/a.md',
        frozenPath: 'plans/a.md',
        frozenSha256: SHA_A,
        liveSha256: SHA_D,
      },
    ]);
    expect(hasUnsanctionedArrivals(report)).toBe(true);
  });

  it('reports deletions in frozen coordinates only (never inverting frozen→source), report-only', () => {
    const report = buildArrivalsReport({
      denominatorFiles,
      liveFiles: liveUnchanged.slice(0, 1),
      sanctionedClassBySource: emptySanctioned,
    });
    expect(report.deleted).toEqual([{ frozenPath: 'plans/sub/b.md', frozenSha256: SHA_B }]);
    expect(hasUnsanctionedArrivals(report)).toBe(false);
  });

  it('classifies an added file under a sanctioned-writer class as sanctioned, never silent', () => {
    const report = buildArrivalsReport({
      denominatorFiles,
      liveFiles: [
        ...liveUnchanged,
        {
          sourcePath: '.agent/plans/lanes/new.md',
          frozenPath: 'plans/lanes/new.md',
          sha256: SHA_C,
        },
      ],
      sanctionedClassBySource: new Map([['.agent/plans/lanes/new.md', 'new-lane-directories']]),
    });
    expect(report.added).toEqual([]);
    expect(report.sanctioned).toEqual([
      {
        change: 'added',
        source: '.agent/plans/lanes/new.md',
        frozenPath: 'plans/lanes/new.md',
        classId: 'new-lane-directories',
        liveSha256: SHA_C,
      },
    ]);
    expect(hasUnsanctionedArrivals(report)).toBe(false);
  });

  it('classifies a modified file under a sanctioned-writer class as sanctioned-modified', () => {
    const report = buildArrivalsReport({
      denominatorFiles,
      liveFiles: [
        { sourcePath: '.agent/plans/a.md', frozenPath: 'plans/a.md', sha256: SHA_D },
        { sourcePath: '.agent/plans/sub/b.md', frozenPath: 'plans/sub/b.md', sha256: SHA_B },
      ],
      sanctionedClassBySource: new Map([['.agent/plans/a.md', 'accretion-logged-plans']]),
    });
    expect(report.modified).toEqual([]);
    expect(report.sanctioned).toEqual([
      {
        change: 'modified',
        source: '.agent/plans/a.md',
        frozenPath: 'plans/a.md',
        classId: 'accretion-logged-plans',
        frozenSha256: SHA_A,
        liveSha256: SHA_D,
      },
    ]);
    expect(hasUnsanctionedArrivals(report)).toBe(false);
  });

  it('does NOT sanction the same delta when its source sits outside the sanctioned map', () => {
    const report = buildArrivalsReport({
      denominatorFiles,
      liveFiles: [
        ...liveUnchanged,
        { sourcePath: '.agent/plans/other.md', frozenPath: 'plans/other.md', sha256: SHA_C },
      ],
      sanctionedClassBySource: new Map([['.agent/plans/lanes/new.md', 'new-lane-directories']]),
    });
    expect(report.sanctioned).toEqual([]);
    expect(report.added).toHaveLength(1);
    expect(hasUnsanctionedArrivals(report)).toBe(true);
  });

  it('sorts every section deterministically regardless of input order', () => {
    const report = buildArrivalsReport({
      denominatorFiles,
      liveFiles: [
        { sourcePath: '.agent/plans/z.md', frozenPath: 'plans/z.md', sha256: SHA_C },
        { sourcePath: '.agent/plans/b.md', frozenPath: 'plans/b.md', sha256: SHA_D },
      ],
      sanctionedClassBySource: emptySanctioned,
    });
    expect(report.added.map((entry) => entry.source)).toEqual([
      '.agent/plans/b.md',
      '.agent/plans/z.md',
    ]);
    expect(report.deleted.map((entry) => entry.frozenPath)).toEqual([
      'plans/a.md',
      'plans/sub/b.md',
    ]);
  });
});

describe('parseArrivalsReport — closed shape', () => {
  it('round-trips a built report through the strict boundary', () => {
    const report = buildArrivalsReport({
      denominatorFiles,
      liveFiles: liveUnchanged,
      sanctionedClassBySource: emptySanctioned,
    });
    const parsed = parseArrivalsReport(JSON.parse(JSON.stringify(report)));
    expect(parsed.ok).toBe(true);
  });

  it('rejects an unknown top-level key', () => {
    const report = buildArrivalsReport({
      denominatorFiles,
      liveFiles: liveUnchanged,
      sanctionedClassBySource: emptySanctioned,
    });
    const parsed = parseArrivalsReport({ ...report, bannerClasses: [] });
    expect(parsed.ok).toBe(false);
  });
});
