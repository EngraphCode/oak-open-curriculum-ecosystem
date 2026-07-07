import { isErr, isOk } from '@oaknational/result';
import { describe, it, expect } from 'vitest';

import { normaliseSnapshot } from './generate-quality-standards';

/**
 * The QS generator validates the vendored snapshot against the quality-standard schema (the single
 * source of truth, `lib/quality-standards-types.ts`) and re-emits it as normalised JSON. These
 * tests pin the fail-loud boundary — a drifted `type`/`state` value or an unknown field halts the
 * generate run with diagnostics naming the offending path and value, never reaching the runtime —
 * and the normalised emission shape.
 */
const validRow = {
  id: 'QS-1',
  text: 'A standard.',
  type: 'Required standard',
  areas: ['Explanation'],
  components: ['Component A'],
  rubrics: ['Pedagogical Rubric'],
  code: 'PR1',
  state: 'Active',
  subject: 'English',
};

const snapshotOf = (rows: readonly unknown[]): string => JSON.stringify(rows);

describe('normaliseSnapshot (schema validation boundary)', () => {
  it('accepts a valid snapshot and emits it as normalised two-space JSON', () => {
    const emitted = normaliseSnapshot(snapshotOf([validRow]));
    expect(isOk(emitted)).toBe(true);
    if (isOk(emitted)) {
      expect(JSON.parse(emitted.value)).toEqual([validRow]);
      expect(emitted.value.endsWith('\n')).toBe(true);
    }
  });

  it('is idempotent: normalising its own output is a fixed point', () => {
    const once = normaliseSnapshot(snapshotOf([validRow]));
    expect(isOk(once)).toBe(true);
    if (isOk(once)) {
      const twice = normaliseSnapshot(once.value);
      expect(isOk(twice)).toBe(true);
      if (isOk(twice)) {
        expect(twice.value).toBe(once.value);
      }
    }
  });

  it('fails loud on a type outside the closed set, naming the path and received value', () => {
    const emitted = normaliseSnapshot(snapshotOf([{ ...validRow, type: 'Requird standard' }]));
    expect(isErr(emitted)).toBe(true);
    if (isErr(emitted)) {
      expect(emitted.error).toMatch(/0\.type/);
      expect(emitted.error).toContain('Requird standard');
    }
  });

  it('fails loud on a state outside the closed set (drifted vendored data)', () => {
    const emitted = normaliseSnapshot(snapshotOf([{ ...validRow, state: 'Retired' }]));
    expect(isErr(emitted)).toBe(true);
    if (isErr(emitted)) {
      expect(emitted.error).toMatch(/0\.state/);
      expect(emitted.error).toContain('Retired');
    }
  });

  it('fails loud on an unknown field (strict shape) and on non-JSON input', () => {
    const unknownField = normaliseSnapshot(snapshotOf([{ ...validRow, tier: 'gold' }]));
    expect(isErr(unknownField)).toBe(true);
    expect(isErr(normaliseSnapshot('not json'))).toBe(true);
  });
});
