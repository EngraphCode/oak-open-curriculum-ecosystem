import type { Result } from '@oaknational/result';
import { describe, expect, it } from 'vitest';
import { buildDesignSystemContrastReports } from './design-system-contrast.js';
import {
  DESIGN_SYSTEM_THEMES,
  EXPECTED_MANIFEST_PAIR_COUNT,
  THEME_GATE_LEVELS,
} from './design-system-expectations.js';

// Wiring proofs only: the pass/fail proof over live data is owned by the
// build gate (src/build.ts), which throws on any failed pairing in CI.

/** Assert the gate result is Ok and return the reports (fail-loud, never a conditional return). */
function assertOkReports<T, E>(result: Result<T, E>): T {
  expect(result.ok).toBe(true);

  if (!result.ok) {
    throw new Error(`Expected Ok, got Err: ${JSON.stringify(result.error)}`);
  }

  return result.value;
}

describe('buildDesignSystemContrastReports', () => {
  it('produces one report per theme, in declared order, stamped with its ratified level', () => {
    const reports = assertOkReports(buildDesignSystemContrastReports());

    expect(reports.map((report) => report.theme)).toEqual([...DESIGN_SYSTEM_THEMES]);

    DESIGN_SYSTEM_THEMES.forEach((theme, index) => {
      expect(reports[index].level).toBe(THEME_GATE_LEVELS[theme]);
      expect(reports[index].summary.total).toBe(EXPECTED_MANIFEST_PAIR_COUNT);
    });
  });

  it('wires the AAA level into the high-contrast run', () => {
    const reports = assertOkReports(buildDesignSystemContrastReports());

    const highContrast = reports.find((report) => report.theme === 'high-contrast');

    expect(highContrast).toBeDefined();
    expect(
      highContrast?.results.some((entry) => entry.context === 'text' && entry.requiredRatio === 7),
    ).toBe(true);
  });
});
