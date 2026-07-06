import { describe, expect, it } from 'vitest';

import { parseFreezeRule } from './freeze-rule-schema.js';

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
