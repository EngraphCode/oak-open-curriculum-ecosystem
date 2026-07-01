import { describe, it, expect } from 'vitest';

import { emitModule, generate, parseQualityStandard } from './generate-quality-standards';

/**
 * The QS generator validates the vendored snapshot's closed `type`/`state` value sets at BUILD time
 * and emits the compile-time-typed module. These tests pin the fail-loud boundary (a drifted
 * vendored value halts the build rather than reaching the runtime) and the emitted-module shape.
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

describe('parseQualityStandard (build-time boundary validator)', () => {
  it('returns the row narrowed to the closed value sets for valid data', () => {
    const parsed = parseQualityStandard(validRow);
    expect(parsed.type).toBe('Required standard');
    expect(parsed.state).toBe('Active');
  });

  it('fails loud on a type outside the closed set (drifted vendored data)', () => {
    expect(() => parseQualityStandard({ ...validRow, type: 'Requird standard' })).toThrow(/type/);
  });

  it('fails loud on a state outside the closed set (drifted vendored data)', () => {
    expect(() => parseQualityStandard({ ...validRow, state: 'Retired' })).toThrow(/state/);
  });
});

describe('emitModule + generate', () => {
  it('generates the typed, compile-time-validated module from the real snapshot', () => {
    const source = generate();
    expect(source).toContain("import type { QualityStandard } from '../quality-standards-types'");
    expect(source).toContain('export const qualityStandards: readonly QualityStandard[]');
  });

  it('emits a row as a literal under the compile-time-annotated export', () => {
    const source = emitModule([parseQualityStandard(validRow)]);
    expect(source).toContain(': readonly QualityStandard[]');
    expect(source).toContain('"id": "QS-1"');
  });
});
