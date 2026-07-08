import { describe, expect, it } from 'vitest';

import {
  analyseFileResidue,
  buildFileBlocks,
  buildResidueReport,
  isBlankLine,
  parseResidueReport,
  RESIDUE_BOUNDS_V1,
  type FileResidue,
} from './refound-residue-model.js';

describe('RESIDUE_BOUNDS_V1', () => {
  it('publishes the G1-packet orphan bounds as a versioned constant', () => {
    expect(RESIDUE_BOUNDS_V1).toEqual({
      maxBlockNonBlankLines: 25,
      minFileAnchorRatioPercent: 5,
    });
  });
});

describe('isBlankLine', () => {
  it('treats empty and whitespace-only lines (including a bare CR) as blank', () => {
    expect(isBlankLine('')).toBe(true);
    expect(isBlankLine('   ')).toBe(true);
    expect(isBlankLine('\t')).toBe(true);
    expect(isBlankLine('\r')).toBe(true);
    expect(isBlankLine(' x ')).toBe(false);
  });
});

describe('buildFileBlocks — the F1 §9 unit definition', () => {
  it('returns no blocks for an empty file', () => {
    expect(buildFileBlocks({ lineCount: 0, anchorLines: [] })).toEqual([]);
  });

  it('makes the whole file a file-preamble block when it has no anchors', () => {
    expect(buildFileBlocks({ lineCount: 4, anchorLines: [] })).toEqual([
      { kind: 'file-preamble', lineStart: 1, lineEnd: 4 },
    ]);
  });

  it('runs each anchor block to the next anchor (exclusive) or EOF', () => {
    expect(buildFileBlocks({ lineCount: 7, anchorLines: [3, 5] })).toEqual([
      { kind: 'file-preamble', lineStart: 1, lineEnd: 2 },
      { kind: 'anchored', lineStart: 3, lineEnd: 4 },
      { kind: 'anchored', lineStart: 5, lineEnd: 7 },
    ]);
  });

  it('emits no preamble block when the first line is an anchor', () => {
    expect(buildFileBlocks({ lineCount: 5, anchorLines: [1] })).toEqual([
      { kind: 'anchored', lineStart: 1, lineEnd: 5 },
    ]);
  });

  it('tiles the file exactly: blocks cover every line once, in order', () => {
    const blocks = buildFileBlocks({ lineCount: 9, anchorLines: [2, 3, 8] });
    let expectedStart = 1;
    for (const block of blocks) {
      expect(block.lineStart).toBe(expectedStart);
      expectedStart = block.lineEnd + 1;
    }
    expect(expectedStart).toBe(10);
  });
});

describe('analyseFileResidue — orphan-candidate rules', () => {
  const proseLines = (count: number): string[] =>
    Array.from({ length: count }, (_, i) => `prose line ${String(i + 1)}`);

  it('flags a non-blank file preamble as an orphan candidate (rule a)', () => {
    const lineTexts = ['stray work note', '', '# Heading', 'body'];
    const residue = analyseFileResidue({ file: 'plans/a.md', lineTexts, anchorLines: [3] });
    expect(residue.orphanCandidates).toEqual([
      {
        file: 'plans/a.md',
        lineStart: 1,
        lineEnd: 2,
        nonBlankLines: 1,
        reasons: ['file-preamble'],
      },
    ]);
  });

  it('does not flag a blank-only preamble', () => {
    const residue = analyseFileResidue({
      file: 'plans/a.md',
      lineTexts: ['', '  ', '# Heading', 'body'],
      anchorLines: [3],
    });
    expect(residue.orphanCandidates).toEqual([]);
  });

  it('flags a block whose non-blank count exceeds the bound (rule b), not one at it', () => {
    // Anchor + 26 non-blank followers = 27 > the 25 bound; the trailing
    // anchor keeps the file's anchor ratio above rule (c)'s floor so the
    // oversized rule is isolated.
    const over = analyseFileResidue({
      file: 'plans/a.md',
      lineTexts: ['# H', ...proseLines(26), '# H2'],
      anchorLines: [1, 28],
    });
    expect(over.orphanCandidates).toHaveLength(1);
    expect(over.orphanCandidates[0]?.reasons).toEqual(['oversized-block']);
    expect(over.orphanCandidates[0]?.nonBlankLines).toBe(27);

    // Anchor + 24 non-blank followers = 25, exactly at the bound: no flag.
    const at = analyseFileResidue({
      file: 'plans/a.md',
      lineTexts: ['# H', ...proseLines(24), '# H2'],
      anchorLines: [1, 26],
    });
    expect(at.orphanCandidates).toEqual([]);
  });

  it('flags every block of a file whose anchor ratio is under the floor (rule c)', () => {
    // 1 anchor over 40 lines = 2.5% < 5%.
    const residue = analyseFileResidue({
      file: 'plans/low.md',
      lineTexts: [...proseLines(20), '# H', ...proseLines(19)],
      anchorLines: [21],
    });
    expect(residue.anchorRatioPercent).toBe(2.5);
    expect(residue.orphanCandidates.map((c) => c.reasons)).toEqual([
      ['file-preamble', 'low-anchor-file'],
      ['low-anchor-file'],
    ]);
  });

  it('keeps the ratio floor comparison exact at the boundary (5% is not under it)', () => {
    // 1 anchor over 20 lines = exactly 5%: rule (c) must NOT fire.
    const residue = analyseFileResidue({
      file: 'plans/edge.md',
      lineTexts: ['# H', ...proseLines(19)],
      anchorLines: [1],
    });
    expect(residue.orphanCandidates).toEqual([]);
  });

  it('merges reasons when one block trips several rules', () => {
    // Anchorless 30-non-blank-line file: preamble + oversized + low-anchor.
    const residue = analyseFileResidue({
      file: 'plans/orphan.md',
      lineTexts: proseLines(30),
      anchorLines: [],
    });
    expect(residue.orphanCandidates).toEqual([
      {
        file: 'plans/orphan.md',
        lineStart: 1,
        lineEnd: 30,
        nonBlankLines: 30,
        reasons: ['file-preamble', 'oversized-block', 'low-anchor-file'],
      },
    ]);
  });
});

describe('buildResidueReport', () => {
  const fileResidue = (file: string): FileResidue =>
    analyseFileResidue({ file, lineTexts: ['# H', 'body'], anchorLines: [1] });

  it('carries version, bounds, recomputed totals, and per-file blocks', () => {
    const withOrphan = analyseFileResidue({
      file: 'plans/stray.md',
      lineTexts: ['stray note', '# H'],
      anchorLines: [2],
    });
    const report = buildResidueReport([fileResidue('plans/a.md'), withOrphan]);
    expect(report.version).toBe(1);
    expect(report.bounds).toEqual(RESIDUE_BOUNDS_V1);
    expect(report.totals).toEqual({
      files: 2,
      lines: 4,
      anchors: 2,
      blocks: 3,
      orphanCandidates: 1,
    });
    expect(report.files.map((f) => f.file)).toEqual(['plans/a.md', 'plans/stray.md']);
    expect(report.orphanCandidates).toHaveLength(1);
  });

  it('round-trips through the strict parser; unknown keys are rejected', () => {
    const report = buildResidueReport([fileResidue('plans/a.md')]);
    const reparsed = parseResidueReport(JSON.parse(JSON.stringify(report)));
    expect(reparsed.ok).toBe(true);
    const tampered: Record<string, unknown> = { ...report, spare: 1 };
    expect(parseResidueReport(tampered).ok).toBe(false);
  });
});
