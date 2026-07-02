import { describe, it, expect } from 'vitest';

import {
  QUALITY_STANDARD_TYPES,
  QUALITY_STANDARD_STATES,
  isQualityStandardType,
  isQualityStandardState,
  qualityStandards,
} from './static-quality-standards';

/**
 * The quality-standards data is GENERATED (`data/quality-standards.generated.ts`) from the vendored
 * snapshot and compile-time-validated against the closed `type`/`state` value sets (the generator's
 * fail-loud boundary is pinned in `scripts/generate-quality-standards.test.ts`). These tests pin the
 * public shape the Standards filter UI builds against — the loaded set and the boundary guards.
 */
describe('quality-standards closed value sets', () => {
  it('every generated standard carries a known type and state (685 rows)', () => {
    expect(qualityStandards).toHaveLength(685);
    const types: ReadonlySet<string> = new Set(QUALITY_STANDARD_TYPES);
    const states: ReadonlySet<string> = new Set(QUALITY_STANDARD_STATES);
    expect(qualityStandards.every((s) => types.has(s.type))).toBe(true);
    expect(qualityStandards.every((s) => states.has(s.state))).toBe(true);
  });

  it('enumerates exactly the observed type and state values', () => {
    expect([...QUALITY_STANDARD_TYPES]).toEqual(['Required standard', 'Model Practice', '']);
    expect([...QUALITY_STANDARD_STATES]).toEqual(['Active', 'Future']);
  });
});

describe('closed-set narrowing guards (the StandardsFilter boundary)', () => {
  it('accepts every closed type/state value', () => {
    expect(QUALITY_STANDARD_TYPES.every((v) => isQualityStandardType(v))).toBe(true);
    expect(QUALITY_STANDARD_STATES.every((v) => isQualityStandardState(v))).toBe(true);
  });

  it('rejects an off-set value, including the `all` filter sentinel', () => {
    expect(isQualityStandardType('all')).toBe(false);
    expect(isQualityStandardType('Requird standard')).toBe(false);
    expect(isQualityStandardState('all')).toBe(false);
    expect(isQualityStandardState('Retired')).toBe(false);
  });
});
