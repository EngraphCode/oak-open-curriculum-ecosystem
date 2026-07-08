import { describe, expect, it } from 'vitest';

import {
  isHeadingLine,
  matchKeywordsInsensitive,
  NET_C_KEYWORDS_V1,
  scanFileLines,
} from './refound-inventory-nets.js';

/** Net verdicts for one fixture file, keyed by 1-based line number. */
function netsByLine(lineTexts: readonly string[]): ReadonlyMap<number, readonly string[]> {
  return new Map(scanFileLines(lineTexts).map((capture) => [capture.line, capture.nets]));
}

describe('matchKeywordsInsensitive', () => {
  it('matches case-insensitively and returns the matched keywords in list order', () => {
    expect(matchKeywordsInsensitive('STATUS: Blocked on the gate', NET_C_KEYWORDS_V1)).toEqual([
      'status:',
      'blocked',
      'gate',
    ]);
  });

  it('matches substrings mechanically (stem behaviour is deliberate)', () => {
    expect(matchKeywordsInsensitive('Superseded by v2', NET_C_KEYWORDS_V1)).toEqual(['supersede']);
    expect(matchKeywordsInsensitive('serves_semantic_search', NET_C_KEYWORDS_V1)).toEqual([
      'serves_',
    ]);
  });

  it('returns an empty list when nothing matches', () => {
    expect(matchKeywordsInsensitive('plain prose line', NET_C_KEYWORDS_V1)).toEqual([]);
  });
});

describe('scanFileLines — Net A structure', () => {
  it('captures heading levels one to six, not seven, not missing-space', () => {
    const nets = netsByLine(['# one', '###### six', '####### seven', '#none', 'prose']);
    expect(nets.get(1)).toEqual(['A']);
    expect(nets.get(2)).toEqual(['A']);
    expect(nets.has(3)).toBe(false);
    expect(nets.has(4)).toBe(false);
    expect(nets.has(5)).toBe(false);
  });

  it('captures a leading YAML frontmatter fence pair inclusively', () => {
    const nets = netsByLine(['---', 'title: x', '', '---', 'prose after']);
    expect(nets.get(1)).toEqual(['A']);
    expect(nets.get(2)).toEqual(['A', 'B']);
    expect(nets.get(3)).toEqual(['A']);
    expect(nets.get(4)).toEqual(['A']);
    expect(nets.has(5)).toBe(false);
  });

  it('treats an unclosed leading --- as no frontmatter at all', () => {
    const nets = netsByLine(['---', 'prose', 'more prose']);
    expect(nets.size).toBe(0);
  });

  it('does not treat a mid-file --- pair as frontmatter', () => {
    const nets = netsByLine(['prose', '---', 'title: x', '---']);
    expect(nets.has(2)).toBe(false);
    expect(nets.get(3)).toEqual(['B']);
    expect(nets.has(4)).toBe(false);
  });

  it('recognises frontmatter fences with trailing CR bytes (CRLF, no normalisation)', () => {
    const nets = netsByLine(['---\r', 'title: x\r', '---\r']);
    expect(nets.get(1)).toEqual(['A']);
    expect(nets.get(2)).toEqual(['A', 'B']);
    expect(nets.get(3)).toEqual(['A']);
  });

  it('captures code-fence lines and blacks out every net inside the fence', () => {
    const nets = netsByLine([
      '```bash',
      '# a comment, not a heading',
      '- not a list row',
      'status: not a capture',
      '```',
      '## real heading',
    ]);
    expect(nets.get(1)).toEqual(['A']);
    expect(nets.has(2)).toBe(false);
    expect(nets.has(3)).toBe(false);
    expect(nets.has(4)).toBe(false);
    expect(nets.get(5)).toEqual(['A']);
    expect(nets.get(6)).toEqual(['A']);
  });

  it('PINNED: fence-in-fence — a fence line inside an open fence CLOSES it (blunt toggle)', () => {
    // Deliberate semantics, pinned by name: the scanner has no fence
    // nesting. Any ``` line toggles the blackout state, so an "inner" fence
    // opener (as in a markdown example showing a code block) ends the
    // blackout and the following lines are captured again. Conservation-
    // safe: over-capture routes to adjudication; silent blackout would not.
    const nets = netsByLine([
      '```markdown',
      'blacked out inside the outer fence',
      '```bash',
      'status: captured again after the toggle',
      '```',
    ]);
    expect(nets.get(1)).toEqual(['A']);
    expect(nets.has(2)).toBe(false);
    expect(nets.get(3)).toEqual(['A']);
    expect(nets.get(4)).toEqual(['B', 'C']);
    expect(nets.get(5)).toEqual(['A']);
  });

  it('PINNED: an unclosed fence blacks out every net to EOF', () => {
    // Deliberate semantics, pinned by name: no closing fence means the
    // blackout runs to end of file — the opening fence stays the block's
    // only anchor, so the whole tail clusters to it (F1 §9).
    const nets = netsByLine(['```bash', 'todo: hidden to EOF', '- hidden row', '# hidden heading']);
    expect(nets.get(1)).toEqual(['A']);
    expect(nets.has(2)).toBe(false);
    expect(nets.has(3)).toBe(false);
    expect(nets.has(4)).toBe(false);
  });
});

describe('isHeadingLine', () => {
  it('recognises headings and rejects frontmatter fences and near-misses', () => {
    expect(isHeadingLine('# Head')).toBe(true);
    expect(isHeadingLine('###### six')).toBe(true);
    expect(isHeadingLine('---')).toBe(false);
    expect(isHeadingLine('#none')).toBe(false);
    expect(isHeadingLine('prose')).toBe(false);
  });
});

describe('scanFileLines — Net B rows', () => {
  it('captures list items, checkbox todos, table rows, and definition keys', () => {
    const nets = netsByLine([
      '- item',
      '* item',
      '+ item',
      '  1. numbered',
      '2) numbered',
      '- [ ] unchecked box',
      '\t| cell | cell |',
      '|---|---|',
      'due_date: tomorrow',
      'Key-Name: value',
    ]);
    for (const line of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      expect(nets.get(line)).toContain('B');
    }
    expect(nets.get(6)).toEqual(['B']);
  });

  it.each([['x'], ['X'], ['~'], ['-']])(
    'captures the checkbox state variant "- [%s]" as a Net-B row',
    (state) => {
      expect(netsByLine([`- [${state}] a tracked item`]).get(1)).toEqual(['B']);
    },
  );

  it('does not capture near-misses as rows', () => {
    const nets = netsByLine([
      'word:no-space-after-colon',
      'two words: not a key line',
      '-not a list',
      '3 not numbered',
    ]);
    expect(nets.size).toBe(0);
  });
});

describe('scanFileLines — Net C keywords', () => {
  it('captures keyword lines case-insensitively wherever the keyword sits', () => {
    const nets = netsByLine([
      'this work is BLOCKED on the review',
      'we follow-up next week',
      'Definition of Done for the lane',
    ]);
    expect(nets.get(1)).toEqual(['C']);
    expect(nets.get(2)).toEqual(['C']);
    expect(nets.get(3)).toEqual(['C']);
  });

  it('lets the nets overlap on one line, reporting each net once, sorted', () => {
    const nets = netsByLine(['- [ ] todo: unblock the gate']);
    expect(nets.get(1)).toEqual(['B', 'C']);
  });
});
