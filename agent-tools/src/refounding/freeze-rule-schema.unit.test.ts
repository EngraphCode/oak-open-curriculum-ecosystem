import { describe, expect, it } from 'vitest';

import { parseFreezeRule, sanctionedWriterClasses } from './freeze-rule-schema.js';

/** A minimal valid rule document, spreadable per-test for targeted mutations. */
const validRule = (): Record<string, unknown> => ({
  version: 1,
  ratifiedBy: '.agent/collaboration/decisions/g1-ratification.md',
  classes: [
    {
      id: 'plans',
      globs: ['.agent/plans/**'],
      verdict: 'in',
      reason: 'The estate being refounded.',
    },
  ],
});

describe('parseFreezeRule', () => {
  it('parses a valid rule document', () => {
    const result = parseFreezeRule(validRule());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.version).toBe(1);
      expect(result.value.ratifiedBy).toBe('.agent/collaboration/decisions/g1-ratification.md');
      expect(result.value.classes).toHaveLength(1);
      expect(result.value.classes[0].verdict).toBe('in');
    }
  });

  it('accepts ratifiedBy null at the schema layer (the freeze-level refusal is separate)', () => {
    const result = parseFreezeRule({ ...validRule(), ratifiedBy: null });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.ratifiedBy).toBeNull();
    }
  });

  it('rejects an unknown top-level key (closed shape)', () => {
    const result = parseFreezeRule({ ...validRule(), surprise: true });
    expect(result.ok).toBe(false);
  });

  it('rejects an unknown key inside a class (closed shape)', () => {
    const rule = validRule();
    rule.classes = [
      {
        id: 'plans',
        globs: ['.agent/plans/**'],
        verdict: 'in',
        reason: 'r',
        extra: 'nope',
      },
    ];
    expect(parseFreezeRule(rule).ok).toBe(false);
  });

  it('rejects a verdict outside in|sweep|out', () => {
    const rule = validRule();
    rule.classes = [{ id: 'plans', globs: ['.agent/plans/**'], verdict: 'maybe', reason: 'r' }];
    expect(parseFreezeRule(rule).ok).toBe(false);
  });

  it('rejects a class with an empty glob list', () => {
    const rule = validRule();
    rule.classes = [{ id: 'plans', globs: [], verdict: 'in', reason: 'r' }];
    expect(parseFreezeRule(rule).ok).toBe(false);
  });

  it('rejects a non-integer version', () => {
    expect(parseFreezeRule({ ...validRule(), version: 1.5 }).ok).toBe(false);
  });

  it('returns a typed error naming the boundary, never throwing', () => {
    const result = parseFreezeRule('not even an object');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toContain('freeze rule');
    }
  });
});

/** A minimal valid v2 rule document (sanctioned-writer classes, P2). */
const validRuleV2 = (): Record<string, unknown> => ({
  ...validRule(),
  version: 2,
  sanctionedWriters: [
    {
      id: 'new-lane-directories',
      globs: ['.agent/plans/lanes/**'],
      reason: 'Destination plans authored by the refounding under Walk-A-ratified lane roots.',
    },
  ],
});

describe('parseFreezeRule — v2 (sanctioned-writer classes)', () => {
  it('parses a valid v2 document', () => {
    const result = parseFreezeRule(validRuleV2());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.version).toBe(2);
      expect(sanctionedWriterClasses(result.value)).toHaveLength(1);
      expect(sanctionedWriterClasses(result.value)[0]?.id).toBe('new-lane-directories');
    }
  });

  it('keeps v1 documents parsing unchanged, with zero sanctioned-writer classes', () => {
    const result = parseFreezeRule(validRule());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.version).toBe(1);
      expect(sanctionedWriterClasses(result.value)).toEqual([]);
    }
  });

  it('rejects a v2 document without sanctionedWriters (that shape is v1)', () => {
    const rule = validRuleV2();
    delete rule.sanctionedWriters;
    expect(parseFreezeRule(rule).ok).toBe(false);
  });

  it('rejects a v2 document with an EMPTY sanctionedWriters array (no placeholder shapes)', () => {
    expect(parseFreezeRule({ ...validRuleV2(), sanctionedWriters: [] }).ok).toBe(false);
  });

  it('rejects sanctionedWriters on a version-1 document (closed shape per version)', () => {
    const rule = validRule();
    rule.sanctionedWriters = [
      { id: 'new-lane-directories', globs: ['.agent/plans/lanes/**'], reason: 'r' },
    ];
    expect(parseFreezeRule(rule).ok).toBe(false);
  });

  it('rejects a sanctioned-writer class with an empty glob list', () => {
    const rule = validRuleV2();
    rule.sanctionedWriters = [{ id: 'x', globs: [], reason: 'r' }];
    expect(parseFreezeRule(rule).ok).toBe(false);
  });

  it('rejects an unknown key inside a sanctioned-writer class (closed shape)', () => {
    const rule = validRuleV2();
    rule.sanctionedWriters = [
      { id: 'x', globs: ['.agent/plans/lanes/**'], reason: 'r', verdict: 'in' },
    ];
    expect(parseFreezeRule(rule).ok).toBe(false);
  });

  it('rejects an unratified-unknown version (neither 1 nor 2)', () => {
    expect(parseFreezeRule({ ...validRule(), version: 3 }).ok).toBe(false);
  });
});
