import { describe, expect, it } from 'vitest';

import { sha256Hex } from './refounding-artefacts.js';
import {
  buildSweepHits,
  parseSweepHit,
  sortSweepHits,
  SWEEP_MARKERS_V1,
  type SweepHit,
} from './refound-sweep-model.js';

describe('SWEEP_MARKERS_V1', () => {
  it('carries the G1-packet §6 candidate marker set verbatim, in packet order', () => {
    expect(SWEEP_MARKERS_V1).toEqual([
      'todo',
      'next step',
      'not yet',
      'pending',
      'blocked',
      'open question',
      'unresolved',
      'follow-up',
      'deferred',
      'still needs',
      'remaining',
      'incomplete',
      'carry-over',
      'promotion trigger',
      'reopen',
    ]);
  });
});

describe('buildSweepHits', () => {
  it('captures marker lines verbatim with raw-byte sha256 and matched markers in list order', () => {
    const bytes = Buffer.from('clean line\nTODO: port this, still NEEDS a home\r\n');
    expect(buildSweepHits('.agent/prompts/p.md', bytes)).toEqual([
      {
        file: '.agent/prompts/p.md',
        line: 2,
        markers: ['todo', 'still needs'],
        text: 'TODO: port this, still NEEDS a home\r',
        sha256: sha256Hex(Buffer.from('TODO: port this, still NEEDS a home\r')),
      },
    ] satisfies SweepHit[]);
  });

  it('is a raw keyword net: fenced content is NOT exempt', () => {
    const bytes = Buffer.from('```\ntodo inside a fence\n```\n');
    const hits = buildSweepHits('.agent/prompts/p.md', bytes);
    expect(hits).toHaveLength(1);
    expect(hits[0]?.line).toBe(2);
  });

  it('returns nothing for marker-free or empty files', () => {
    expect(buildSweepHits('.agent/prompts/p.md', Buffer.from('plain prose\n'))).toEqual([]);
    expect(buildSweepHits('.agent/prompts/p.md', Buffer.from(''))).toEqual([]);
  });
});

describe('sortSweepHits', () => {
  it('orders hits by (file, line) in code-unit order', () => {
    const hit = (file: string, line: number): SweepHit => ({
      file,
      line,
      markers: ['todo'],
      text: 'todo',
      sha256: sha256Hex(Buffer.from('todo')),
    });
    const sorted = sortSweepHits([hit('b.md', 1), hit('a.md', 9), hit('a.md', 2)]);
    expect(sorted.map((h) => `${h.file}:${String(h.line)}`)).toEqual([
      'a.md:2',
      'a.md:9',
      'b.md:1',
    ]);
  });
});

describe('parseSweepHit', () => {
  const valid = (): Record<string, unknown> => ({
    file: '.agent/prompts/p.md',
    line: 2,
    markers: ['todo'],
    text: 'todo',
    sha256: sha256Hex(Buffer.from('todo')),
  });

  it('parses a valid hit', () => {
    expect(parseSweepHit(valid()).ok).toBe(true);
  });

  it('rejects unknown keys, empty marker lists, and malformed digests', () => {
    expect(parseSweepHit({ ...valid(), spare: 1 }).ok).toBe(false);
    expect(parseSweepHit({ ...valid(), markers: [] }).ok).toBe(false);
    expect(parseSweepHit({ ...valid(), sha256: 'zz' }).ok).toBe(false);
  });
});
