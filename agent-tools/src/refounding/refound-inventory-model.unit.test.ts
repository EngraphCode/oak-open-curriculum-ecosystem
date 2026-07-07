import { describe, expect, it } from 'vitest';

import { sha256Hex } from './refounding-artefacts.js';
import {
  ANCHOR_RATIO_SANITY_BAND_V1,
  buildInventoryRecords,
  buildNetDiffReport,
  checkAnchorRatioBand,
  parseInventoryRecord,
  type InventoryRecord,
} from './refound-inventory-model.js';

describe('buildInventoryRecords', () => {
  it('emits verbatim text, raw-byte sha256, and 1-based lines, in line order', () => {
    const bytes = Buffer.from('# Title\nprose\nstatus: pending\r\n');
    const records = buildInventoryRecords('plans/a.md', bytes);
    expect(records).toEqual([
      {
        file: 'plans/a.md',
        line: 1,
        nets: ['A'],
        text: '# Title',
        sha256: sha256Hex(Buffer.from('# Title')),
      },
      {
        file: 'plans/a.md',
        line: 3,
        nets: ['B', 'C'],
        text: 'status: pending\r',
        sha256: sha256Hex(Buffer.from('status: pending\r')),
      },
    ] satisfies InventoryRecord[]);
  });

  it('captures nothing from an empty file', () => {
    expect(buildInventoryRecords('plans/empty.md', Buffer.from(''))).toEqual([]);
  });
});

describe('parseInventoryRecord', () => {
  const valid = (): Record<string, unknown> => ({
    file: 'plans/a.md',
    line: 1,
    nets: ['A'],
    text: '# Title',
    sha256: sha256Hex(Buffer.from('# Title')),
  });

  it('parses a valid record (empty text is legal: a blank frontmatter line)', () => {
    expect(parseInventoryRecord(valid()).ok).toBe(true);
    expect(
      parseInventoryRecord({ ...valid(), text: '', sha256: sha256Hex(Buffer.from('')) }).ok,
    ).toBe(true);
  });

  it('rejects unknown keys, empty net lists, unknown nets, and malformed digests', () => {
    expect(parseInventoryRecord({ ...valid(), spare: 1 }).ok).toBe(false);
    expect(parseInventoryRecord({ ...valid(), nets: [] }).ok).toBe(false);
    expect(parseInventoryRecord({ ...valid(), nets: ['D'] }).ok).toBe(false);
    expect(parseInventoryRecord({ ...valid(), sha256: 'abc' }).ok).toBe(false);
  });
});

describe('buildNetDiffReport', () => {
  const record = (
    file: string,
    line: number,
    nets: InventoryRecord['nets'],
    text: string,
  ): InventoryRecord => ({ file, line, nets, text, sha256: sha256Hex(Buffer.from(text)) });

  it('counts per-net captures and isolates single-net (unique) captures', () => {
    const records = [
      record('plans/a.md', 1, ['A'], '# Title'),
      record('plans/a.md', 2, ['B', 'C'], 'status: pending'),
      record('plans/a.md', 3, ['C'], 'work is blocked'),
    ];
    const report = buildNetDiffReport({ records, totalFiles: 1, totalLines: 10 });
    expect(report.version).toBe(1);
    expect(report.totals).toEqual({ files: 1, lines: 10, anchors: 3, anchorRatioPercent: 30 });
    expect(report.perNet).toEqual({
      A: { captured: 1, unique: 1 },
      B: { captured: 1, unique: 0 },
      C: { captured: 2, unique: 1 },
    });
    expect(report.uniqueCaptures.A.map((r) => r.line)).toEqual([1]);
    expect(report.uniqueCaptures.B).toEqual([]);
    expect(report.uniqueCaptures.C.map((r) => r.line)).toEqual([3]);
  });
});

describe('checkAnchorRatioBand', () => {
  it('accepts ratios inside the band, including both edges', () => {
    expect(checkAnchorRatioBand({ anchorLines: 20, totalLines: 100 }).ok).toBe(true);
    expect(checkAnchorRatioBand({ anchorLines: 70, totalLines: 100 }).ok).toBe(true);
    expect(checkAnchorRatioBand({ anchorLines: 32, totalLines: 100 }).ok).toBe(true);
  });

  it('halts outside the band with the named H2 halt-and-inspect error', () => {
    const low = checkAnchorRatioBand({ anchorLines: 19, totalLines: 100 });
    expect(low.ok).toBe(false);
    if (!low.ok) {
      expect(low.error.message).toContain('H2');
      expect(low.error.message).toContain('halt-and-inspect');
      expect(low.error.message).toContain('19%');
    }
    expect(checkAnchorRatioBand({ anchorLines: 71, totalLines: 100 }).ok).toBe(false);
  });

  it('halts on an empty corpus (a ratio nothing can be divided into)', () => {
    expect(checkAnchorRatioBand({ anchorLines: 0, totalLines: 0 }).ok).toBe(false);
  });

  it('publishes the ratified band as a versioned constant', () => {
    expect(ANCHOR_RATIO_SANITY_BAND_V1).toEqual({ minPercent: 20, maxPercent: 70 });
  });
});
