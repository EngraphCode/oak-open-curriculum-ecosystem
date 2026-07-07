import { describe, expect, it } from 'vitest';

import {
  matchKeywordsInsensitive,
  scanFileLines,
  NET_C_KEYWORDS_V1,
} from './refound-inventory-nets.js';
import {
  CONTROL_KEYWORD_PLANT_LINE_V1,
  insertLineAfter,
  insertLinesAtTop,
  MISSPELT_KEYWORD_PLANT_LINE_V1,
  PREAMBLE_PLANT_LINES_V1,
  selectPlantTarget,
  SWEEP_CONTROL_PLANT_LINE_V1,
  SWEEP_PARAPHRASE_PLANT_LINE_V1,
  sweepBlindnessFailures,
  type PlantTargetCandidate,
} from './refound-plant-orphan-model.js';
import { SWEEP_MARKERS_V1 } from './refound-sweep-model.js';

describe('PREAMBLE_PLANT_LINES_V1 — the anchorless work-bearing plant', () => {
  it('is exactly 30 non-blank prose lines', () => {
    expect(PREAMBLE_PLANT_LINES_V1).toHaveLength(30);
    expect(PREAMBLE_PLANT_LINES_V1.every((line) => line.trim().length > 0)).toBe(true);
  });

  it('matches NO net on any line — anchorless by construction, proven mechanically', () => {
    expect(scanFileLines(PREAMBLE_PLANT_LINES_V1)).toEqual([]);
  });
});

describe('the misspelt-keyword plant pair', () => {
  it('the misspelt line matches no net', () => {
    expect(scanFileLines([MISSPELT_KEYWORD_PLANT_LINE_V1])).toEqual([]);
  });

  it('the control line is captured by Net C alone — the sharp one-net shift', () => {
    expect(scanFileLines([CONTROL_KEYWORD_PLANT_LINE_V1])).toEqual([{ line: 1, nets: ['C'] }]);
    expect(matchKeywordsInsensitive(CONTROL_KEYWORD_PLANT_LINE_V1, NET_C_KEYWORDS_V1)).toEqual([
      'status:',
    ]);
  });
});

describe('SWEEP_PARAPHRASE_PLANT_LINE_V1 — the marker-free work-bearing paraphrase', () => {
  it('is work-bearing prose that NO sweep marker matches (the net is blind to it)', () => {
    expect(SWEEP_PARAPHRASE_PLANT_LINE_V1.trim().length).toBeGreaterThan(0);
    expect(matchKeywordsInsensitive(SWEEP_PARAPHRASE_PLANT_LINE_V1, SWEEP_MARKERS_V1)).toEqual([]);
  });
});

describe('SWEEP_CONTROL_PLANT_LINE_V1 — the live-scanner control', () => {
  it('carries a sweep marker, so a live scanner MUST hit it', () => {
    expect(matchKeywordsInsensitive(SWEEP_CONTROL_PLANT_LINE_V1, SWEEP_MARKERS_V1)).toEqual([
      'todo',
    ]);
  });
});

describe('sweepBlindnessFailures — blind to the paraphrase, alive on the control', () => {
  it('passes only when the plant is present, the paraphrase missed, and the control hit', () => {
    expect(
      sweepBlindnessFailures({
        plantPresentInCopy: true,
        sweepHitsForPlant: 0,
        sweepHitsForControl: 1,
      }),
    ).toEqual([]);
  });

  it('fails an always-empty scanner: zero control hits is no blindness proof', () => {
    const failures = sweepBlindnessFailures({
      plantPresentInCopy: true,
      sweepHitsForPlant: 0,
      sweepHitsForControl: 0,
    });
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain('always-empty');
  });

  it('fails when the sweep SAW the paraphrase or the plant is absent', () => {
    expect(
      sweepBlindnessFailures({
        plantPresentInCopy: true,
        sweepHitsForPlant: 1,
        sweepHitsForControl: 1,
      }),
    ).toHaveLength(1);
    expect(
      sweepBlindnessFailures({
        plantPresentInCopy: false,
        sweepHitsForPlant: 0,
        sweepHitsForControl: 1,
      }),
    ).toHaveLength(1);
  });
});

describe('selectPlantTarget', () => {
  const candidate = (
    path: string,
    overrides: Partial<Omit<PlantTargetCandidate, 'path'>> = {},
  ): PlantTargetCandidate => ({
    path,
    lines: 10,
    anchors: 5,
    firstLineIsHeading: true,
    orphanCandidates: 0,
    ...overrides,
  });

  it('picks the first candidate whose shape keeps the plant proof sharp', () => {
    const result = selectPlantTarget([
      // Frontmatter-led: line 1 is a `---` fence anchor, NOT a heading —
      // planting there would break both proofs (first post-plant anchor at
      // 32, and the keyword plant would land inside frontmatter as Net A).
      candidate('plans/frontmatter-led.md', { firstLineIsHeading: false }),
      candidate('plans/already-orphaned.md', { orphanCandidates: 1 }),
      candidate('plans/too-thin.md', { lines: 40, anchors: 1 }),
      candidate('plans/good.md'),
      candidate('plans/also-good.md'),
    ]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('plans/good.md');
    }
  });

  it('requires the post-plant anchor ratio to stay at or above the residue floor', () => {
    // 2 anchors over 10+30 lines = exactly 5%: acceptable (the floor rule
    // fires strictly below the floor).
    const atFloor = selectPlantTarget([candidate('plans/edge.md', { lines: 10, anchors: 2 })]);
    expect(atFloor.ok).toBe(true);
    // 1 anchor over 10+30 lines = 2.5%: would trip rule (c) and blur the
    // exactly-one-orphan assertion.
    const under = selectPlantTarget([candidate('plans/under.md', { lines: 10, anchors: 1 })]);
    expect(under.ok).toBe(false);
  });

  it('refuses when no candidate qualifies, naming the heading constraint', () => {
    const result = selectPlantTarget([candidate('plans/bad.md', { firstLineIsHeading: false })]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('no plant target');
      expect(result.error.message).toContain('HEADING');
    }
  });
});

describe('insertLinesAtTop', () => {
  it('prepends the plant verbatim, leaving every original byte untouched', () => {
    const planted = insertLinesAtTop(Buffer.from('# H\nbody\r\n'), ['x', 'y']);
    expect(Buffer.from(planted).toString('utf8')).toBe('x\ny\n# H\nbody\r\n');
  });

  it('plants into an empty file', () => {
    expect(Buffer.from(insertLinesAtTop(Buffer.from(''), ['x'])).toString('utf8')).toBe('x\n');
  });
});

describe('insertLineAfter', () => {
  it('inserts a single line after the given 1-based line', () => {
    const planted = insertLineAfter(Buffer.from('l1\nl2\n'), 1, 'planted');
    expect(Buffer.from(planted).toString('utf8')).toBe('l1\nplanted\nl2\n');
  });

  it('preserves CR bytes on surrounding lines and the missing final LF', () => {
    expect(Buffer.from(insertLineAfter(Buffer.from('a\r\nb\r\n'), 1, 'p')).toString('utf8')).toBe(
      'a\r\np\nb\r\n',
    );
    expect(Buffer.from(insertLineAfter(Buffer.from('l1\nl2'), 2, 'p')).toString('utf8')).toBe(
      'l1\nl2\np',
    );
  });
});
