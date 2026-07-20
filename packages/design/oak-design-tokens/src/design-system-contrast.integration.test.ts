import { describe, expect, it } from 'vitest';
import { buildDesignSystemContrastReports } from './design-system-contrast.js';
import {
  DESIGN_SYSTEM_THEMES,
  EXPECTED_MANIFEST_PAIR_COUNT,
  THEME_GATE_LEVELS,
} from './design-system-expectations.js';

// Wiring proofs only: the pass/fail proof over live data is owned by the
// build gate (src/build.ts), which throws on any failed pairing in CI.

describe('buildDesignSystemContrastReports', () => {
  it('produces one report per theme, in declared order, stamped with its ratified level', () => {
    const result = buildDesignSystemContrastReports();

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.map((report) => report.theme)).toEqual([...DESIGN_SYSTEM_THEMES]);

    DESIGN_SYSTEM_THEMES.forEach((theme, index) => {
      expect(result.value[index].level).toBe(THEME_GATE_LEVELS[theme]);
      expect(result.value[index].summary.total).toBe(EXPECTED_MANIFEST_PAIR_COUNT);
    });
  });

  it('wires the AAA level into the high-contrast run', () => {
    const result = buildDesignSystemContrastReports();

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    const highContrast = result.value.find((report) => report.theme === 'high-contrast');

    expect(highContrast).toBeDefined();
    expect(
      highContrast?.results.some((entry) => entry.context === 'text' && entry.requiredRatio === 7),
    ).toBe(true);
  });
});
