import { describe, expect, it } from 'vitest';

import {
  checkMapCoverage,
  DEFAULT_EFFORT_MULTIPLIERS,
  estimatePipelineCost,
  type Effort,
  type StageCost,
  type StagePlan,
} from './cost-and-coverage.js';

describe('estimatePipelineCost', () => {
  const baseStages: readonly StagePlan[] = [
    { name: 'map', invocations: 14, tokensPerInvocation: 75_000, effort: 'low' },
    { name: 'reduce', invocations: 1, tokensPerInvocation: 120_000, effort: 'high' },
    { name: 'meta', invocations: 1, tokensPerInvocation: 80_000, effort: 'high' },
  ];

  it('pins the default effort multipliers (calibration data)', () => {
    expect(DEFAULT_EFFORT_MULTIPLIERS).toEqual({ low: 1, medium: 1.5, high: 2.5, xhigh: 4 });
  });

  it('sums per-stage cost as invocations x tokens x effort multiplier', () => {
    const estimate = estimatePipelineCost({ stages: baseStages, ceiling: 5_000_000 });
    // map: 14 * 75000 * 1 = 1,050,000; reduce: 120000 * 2.5 = 300,000; meta: 80000 * 2.5 = 200,000
    const expected: readonly StageCost[] = [
      { name: 'map', tokens: 1_050_000 },
      { name: 'reduce', tokens: 300_000 },
      { name: 'meta', tokens: 200_000 },
    ];
    expect(estimate.perStage).toEqual(expected);
    expect(estimate.totalTokens).toBe(1_550_000);
    expect(estimate.withinCeiling).toBe(true);
  });

  it('shows the v1 overspend when xhigh is inherited on every map window', () => {
    const xhighEverywhere = baseStages.map((stage): StagePlan => ({ ...stage, effort: 'xhigh' }));
    const honest = estimatePipelineCost({ stages: baseStages, ceiling: 5_000_000 });
    const inherited = estimatePipelineCost({ stages: xhighEverywhere, ceiling: 5_000_000 });
    // The inherited-effort run costs multiples of the effort-tiered estimate (the v1 defect).
    expect(inherited.totalTokens).toBeGreaterThan(honest.totalTokens * 2);
  });

  it('fails the ceiling gate when the estimate exceeds it', () => {
    const estimate = estimatePipelineCost({ stages: baseStages, ceiling: 1_000_000 });
    expect(estimate.totalTokens).toBeGreaterThan(estimate.ceiling);
    expect(estimate.withinCeiling).toBe(false);
  });

  it('honours an overridden effort-multiplier table (effort is data, not a constant)', () => {
    const flat: Record<Effort, number> = { low: 1, medium: 1, high: 1, xhigh: 1 };
    const estimate = estimatePipelineCost({
      stages: baseStages,
      ceiling: 5_000_000,
      effortMultipliers: flat,
    });
    expect(estimate.totalTokens).toBe(14 * 75_000 + 120_000 + 80_000);
  });
});

describe('checkMapCoverage', () => {
  it('flags a window that extracted nothing', () => {
    const report = checkMapCoverage({
      windows: [
        { window: 'W01', leafCount: 30 },
        { window: 'W02', leafCount: 28 },
        { window: 'W03', leafCount: 0 },
      ],
    });
    expect(report.underExtracting).toEqual(['W03']);
  });

  it('flags a window far below the median', () => {
    const report = checkMapCoverage({
      windows: [
        { window: 'W01', leafCount: 40 },
        { window: 'W02', leafCount: 40 },
        { window: 'W03', leafCount: 40 },
        { window: 'W04', leafCount: 5 },
      ],
    });
    expect(report.medianLeafCount).toBe(40);
    expect(report.underExtracting).toEqual(['W04']);
  });

  it('flags nothing when extraction is even across windows', () => {
    const report = checkMapCoverage({
      windows: [
        { window: 'W01', leafCount: 30 },
        { window: 'W02', leafCount: 32 },
        { window: 'W03', leafCount: 28 },
      ],
    });
    expect(report.underExtracting).toEqual([]);
  });
});
