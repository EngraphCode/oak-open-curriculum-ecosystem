import { describe, expect, it } from 'vitest';

import {
  buildRegisterContent,
  computeThroughput,
  formatRegisterRow,
  REGISTER_HEADER,
  type MergedPrRecord,
} from './index.js';

const NOW = new Date('2026-07-20T20:00:00Z');

function pr(input: {
  readonly number: number;
  readonly createdAt: string;
  readonly mergedAt: string;
  readonly isDraft?: boolean;
  readonly headRefName?: string;
}): MergedPrRecord {
  return {
    number: input.number,
    createdAt: input.createdAt,
    mergedAt: input.mergedAt,
    isDraft: input.isDraft ?? false,
    headRefName: input.headRefName ?? `feature/pr-${input.number}`,
  };
}

describe('computeThroughput', () => {
  it('counts only merges inside the trailing window and derives merges per day', () => {
    const report = computeThroughput(
      [
        pr({ number: 1, createdAt: '2026-07-20T10:00:00Z', mergedAt: '2026-07-20T11:00:00Z' }),
        pr({ number: 2, createdAt: '2026-07-19T10:00:00Z', mergedAt: '2026-07-19T12:00:00Z' }),
        // Outside the 7-day window: contributes nothing.
        pr({ number: 3, createdAt: '2026-07-01T10:00:00Z', mergedAt: '2026-07-01T11:00:00Z' }),
      ],
      { windowDays: 7, now: NOW },
    );

    expect(report.mergedCount).toBe(2);
    expect(report.mergesPerDay).toBeCloseTo(2 / 7, 5);
    expect(report.windowDays).toBe(7);
  });

  it('excludes drafts and coordination-tracker branches, counting each exclusion', () => {
    const report = computeThroughput(
      [
        pr({ number: 1, createdAt: '2026-07-20T10:00:00Z', mergedAt: '2026-07-20T11:00:00Z' }),
        pr({
          number: 2,
          createdAt: '2026-07-20T10:00:00Z',
          mergedAt: '2026-07-20T11:00:00Z',
          isDraft: true,
        }),
        pr({
          number: 3,
          createdAt: '2026-07-20T10:00:00Z',
          mergedAt: '2026-07-20T11:00:00Z',
          headRefName: 'coordination/estate-2026-07',
        }),
      ],
      { windowDays: 7, now: NOW },
    );

    expect(report.mergedCount).toBe(1);
    expect(report.excludedDraftCount).toBe(1);
    expect(report.excludedCoordinationCount).toBe(1);
  });

  it('computes open-to-merged cycle-time percentiles by nearest rank in minutes', () => {
    // Cycle times: 10, 20, 30, 40, 100 minutes → p50 = 30, p90 = 100.
    const records = [10, 20, 30, 40, 100].map((minutes, index) =>
      pr({
        number: index + 1,
        createdAt: '2026-07-20T10:00:00Z',
        mergedAt: new Date(Date.parse('2026-07-20T10:00:00Z') + minutes * 60_000).toISOString(),
      }),
    );

    const report = computeThroughput(records, { windowDays: 7, now: NOW });

    expect(report.cycleTimeP50Minutes).toBe(30);
    expect(report.cycleTimeP90Minutes).toBe(100);
  });

  it('reports null percentiles for an empty window instead of fabricating zeros', () => {
    const report = computeThroughput([], { windowDays: 7, now: NOW });

    expect(report.mergedCount).toBe(0);
    expect(report.cycleTimeP50Minutes).toBeNull();
    expect(report.cycleTimeP90Minutes).toBeNull();
  });
});

describe('formatRegisterRow', () => {
  it('renders one dated markdown row with minute-rounded percentiles', () => {
    const row = formatRegisterRow(
      computeThroughput(
        [pr({ number: 1, createdAt: '2026-07-20T10:00:00Z', mergedAt: '2026-07-20T10:42:30Z' })],
        { windowDays: 7, now: NOW },
      ),
      { note: 'founding window' },
    );

    expect(row).toBe('| 2026-07-20 | 7d | 1 | 0.14 | 43 | 43 | founding window |');
  });

  it('sanitises the note for the table: pipes escape, line breaks collapse', () => {
    const row = formatRegisterRow(computeThroughput([], { windowDays: 7, now: NOW }), {
      note: 'a|b\nc',
    });

    expect(row).toBe(String.raw`| 2026-07-20 | 7d | 0 | 0.00 | - | - | a\|b c |`);
  });

  it('renders empty-window percentiles as a dash, never zero', () => {
    const row = formatRegisterRow(computeThroughput([], { windowDays: 7, now: NOW }), {
      note: '',
    });

    expect(row).toBe('| 2026-07-20 | 7d | 0 | 0.00 | - | - |  |');
  });
});

describe('buildRegisterContent', () => {
  it('creates the register with the prediction header when none exists', () => {
    const content = buildRegisterContent(
      undefined,
      '| 2026-07-20 | 7d | 23 | 3.29 | 40 | 90 | x |',
    );

    expect(content.startsWith(REGISTER_HEADER)).toBe(true);
    expect(content.trimEnd().endsWith('| 2026-07-20 | 7d | 23 | 3.29 | 40 | 90 | x |')).toBe(true);
    // The falsifiable prediction is load-bearing register content.
    expect(content).toContain('p50');
    expect(content).toContain('Falsifier');
  });

  it('appends a row to an existing register without duplicating the header', () => {
    const first = buildRegisterContent(undefined, '| 2026-07-20 | 7d | 23 | 3.29 | 40 | 90 | a |');
    const second = buildRegisterContent(first, '| 2026-07-27 | 7d | 12 | 1.71 | 35 | 80 | b |');

    expect(second.split('Falsifier').length).toBe(2);
    expect(second.trimEnd().endsWith('| 2026-07-27 | 7d | 12 | 1.71 | 35 | 80 | b |')).toBe(true);
    expect(second).toContain('| 2026-07-20 | 7d | 23 | 3.29 | 40 | 90 | a |');
  });
});
