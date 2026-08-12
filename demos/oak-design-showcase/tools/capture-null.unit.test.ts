/**
 * The calibrated summary carries the correlation diagnostic line when
 * the calibration block holds one — the wiring between the library's
 * printer and the CLI's stdout summary (the estimator contracts
 * themselves are proven in the library's own suite).
 */
import type { CalibratedPairAnalysis } from '@oaknational/fidelity-review/visual-calibration';
import { describe, expect, it } from 'vitest';

import { summariseCalibrated } from './capture-null';

function calibratedFixture(
  correlation: CalibratedPairAnalysis['calibration']['correlation'],
): CalibratedPairAnalysis {
  return {
    width: 32,
    height: 32,
    sigma0: 0.5,
    windowSize: 32,
    threshold: 6,
    scores: [],
    rejecting: [],
    calibratedRejecting: [],
    calibration: {
      n: 3,
      nullMax: 0.5,
      floor: 0.25,
      sigmaSaturation: 0.674,
      tailOrderStats: [0.5, 0.4, 0.3],
      quantiles: { p50: 0.4, p90: 0.5, p99: 0.5 },
      ...(correlation ? { correlation } : {}),
    },
  };
}

describe('summariseCalibrated — correlation line wiring', () => {
  it('prints the diagnostic line when the calibration carries one', () => {
    const summary = summariseCalibrated({
      analysis: calibratedFixture({
        kind: 'estimated',
        lag1Row: 0.62,
        lag1Col: 0.58,
        nEff: { kind: 'estimated', value: 0.062 },
        pairCount: 3,
        estimablePairCount: 3,
        captureCount: 3,
      }),
      captureHeights: [32, 32, 32, 32],
    });
    expect(summary).toContain('null correlation (diagnostic only)');
  });

  it('omits the line only when no diagnostics were computed at all', () => {
    const summary = summariseCalibrated({
      analysis: calibratedFixture(undefined),
      captureHeights: [32, 32, 32, 32],
    });
    expect(summary).not.toContain('null correlation');
  });
});
