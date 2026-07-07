import { describe, it, expect } from 'vitest';

import { blockSchema } from './schema';
import type { Block } from './types';

/**
 * The block schema is the single source of truth for the content-block contract: the generator
 * validates extracted export content against it before emitting JSON, and the course loader
 * re-validates the committed JSON at module initialisation. These tests pin the contract itself —
 * the closed discriminated union, the strict (no-unknown-keys) shape, the relative-asset-path
 * boundary the views rely on, and the accordion answer normalisation at the data boundary.
 */

/** A minimal valid instance of every block kind — the closed union, exercised end to end. */
const MINIMAL_BLOCKS: readonly Block[] = [
  { t: 'text', paras: ['One paragraph.'] },
  { t: 'heading', text: 'A heading' },
  { t: 'callout', variant: 'info', title: 'Note', text: 'Body' },
  {
    t: 'quiz',
    title: 'Check',
    questions: [{ kind: 'mcq', stem: 'Which?', options: [{ text: 'This', correct: true }] }],
  },
  { t: 'compare', goodText: 'Good', badText: 'Bad' },
  { t: 'tabs', tabs: [{ label: 'One', paras: ['Tab body'] }] },
  { t: 'summary', points: ['Takeaway'] },
  { t: 'flip', chip: 'Concept', cards: [{ badge: '1', front: 'F', back: 'B' }] },
  { t: 'accordion', items: [{ q: 'Q?', a: ['A.'] }] },
  { t: 'stats', items: [{ value: '95%', label: 'of pupils' }] },
  { t: 'columns', cols: [{ title: 'Left', points: ['Point'] }] },
  { t: 'image', placeholder: 'A diagram' },
  { t: 'video', caption: 'Clip', placeholder: 'A clip' },
  { t: 'videoimport', embed: 'framework', filename: 'f.mp4', duration: '2:00', caption: 'C' },
  { t: 'sortable', prompt: 'Order these', items: [{ id: 'a', text: 'First' }], correct: ['a'] },
  { t: 'hotspot', placeholder: 'Scene', spots: [{ title: 'Spot', text: 'Detail' }] },
  { t: 'download', title: 'Tool', desc: 'D', meta: 'PDF', href: 'assets/tool.pdf' },
  { t: 'coursemap' },
];

describe('blockSchema — closed discriminated union', () => {
  it('accepts a minimal instance of every block kind', () => {
    for (const block of MINIMAL_BLOCKS) {
      const parsed = blockSchema.safeParse(block);
      expect(parsed.success, `block kind ${block.t} should parse`).toBe(true);
    }
  });

  it('rejects an unknown discriminant', () => {
    expect(blockSchema.safeParse({ t: 'marquee', text: 'nope' }).success).toBe(false);
  });

  it('rejects unknown keys on a known block (strict shapes, closed contract)', () => {
    expect(blockSchema.safeParse({ t: 'heading', text: 'H', tone: 'loud' }).success).toBe(false);
  });

  it('rejects a quiz question kind outside the closed set', () => {
    const quiz = {
      t: 'quiz',
      title: 'Check',
      questions: [{ kind: 'essay', stem: 'Discuss', options: [] }],
    };
    expect(blockSchema.safeParse(quiz).success).toBe(false);
  });
});

describe('blockSchema — relative asset-path boundary (views render `/${value}`)', () => {
  it('accepts a relative download href and a relative image src', () => {
    expect(
      blockSchema.safeParse({ t: 'image', placeholder: 'P', src: 'assets/x.png' }).success,
    ).toBe(true);
  });

  it('rejects a leading-slash src, naming the value in the issue', () => {
    const parsed = blockSchema.safeParse({ t: 'image', placeholder: 'P', src: '/assets/x.png' });
    expect(parsed.success).toBe(false);
    const messages = parsed.success ? '' : parsed.error.issues.map((i) => i.message).join('\n');
    expect(messages).toContain('/assets/x.png');
    expect(messages).toContain('relative');
  });

  it('rejects a scheme/protocol href, naming the value in the issue', () => {
    const parsed = blockSchema.safeParse({
      t: 'download',
      title: 'T',
      desc: 'D',
      meta: 'M',
      href: 'https://example.org/x.pdf',
    });
    expect(parsed.success).toBe(false);
    const messages = parsed.success ? '' : parsed.error.issues.map((i) => i.message).join('\n');
    expect(messages).toContain('https://example.org/x.pdf');
  });
});

describe('blockSchema — accordion answer normalisation (data boundary)', () => {
  it('normalises a bare-string answer to a single-element paragraph array', () => {
    const parsed = blockSchema.parse({ t: 'accordion', items: [{ q: 'Q?', a: 'One paragraph.' }] });
    expect(parsed).toEqual({ t: 'accordion', items: [{ q: 'Q?', a: ['One paragraph.'] }] });
  });

  it('passes an array answer through unchanged', () => {
    const parsed = blockSchema.parse({ t: 'accordion', items: [{ q: 'Q?', a: ['P1', 'P2'] }] });
    expect(parsed).toEqual({ t: 'accordion', items: [{ q: 'Q?', a: ['P1', 'P2'] }] });
  });
});
