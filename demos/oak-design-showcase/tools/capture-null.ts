/**
 * The calibrated arm of capture-pair (S2a, DDR-010 §Known limits): with
 * `--null-runs k` the LEFT url is captured k+1 times and the right once
 * — serial, one fresh browser per capture, every capture through the
 * estate settle recipe, exactly like the live path, because that
 * identity is the exchangeability warrant behind the empirical rank.
 * All k+2 captures crop to their common minimum height so the null and
 * the live pair share one window grid; the same-page pairs' FULL
 * windows pool into the null; the live pair is then calibrated against
 * it. The live pair's LEFT capture also participates in the null pairs
 * — a deliberate double use, consistent with the marginal claim the
 * pooled null licenses (and it keeps every capture informative at small
 * k). Per-capture heights ride the stats block — a height that varies
 * across repeats is itself a settle finding.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { err, ok, type Result } from '@oaknational/result';
import { FONTS_READY_BUDGET_MS, SETTLE_MS } from '@oaknational/fidelity-review/capture-settle';
import { cropToHeight } from '@oaknational/fidelity-review/png-codec';
import { analysePair } from '@oaknational/fidelity-review/visual-stats';
import {
  calibrateAnalysis,
  renderCalibratedHeatmap,
  type CalibratedPairAnalysis,
} from '@oaknational/fidelity-review/visual-calibration';

import { captureRgba, writePairPngs, type CapturePairConfig } from './capture-shared';

interface CalibratedRun {
  readonly analysis: CalibratedPairAnalysis;
  readonly captureHeights: readonly number[];
}

/** Serial settled captures: left ×(k+1), then right — order recorded by
 *  position (index k+1 is the right capture). */
async function captureAll(
  config: CapturePairConfig,
  nullRuns: number,
): Promise<Result<{ rgba: Uint8Array; height: number }[], string>> {
  const captures: { rgba: Uint8Array; height: number }[] = [];
  for (let i = 0; i < nullRuns + 1; i += 1) {
    const capture = await captureRgba(config.left, config.width);
    if (!capture.ok) {
      return err(`left capture ${i + 1}/${nullRuns + 1}: ${capture.error}`);
    }
    captures.push(capture.value);
  }
  const right = await captureRgba(config.right, config.width);
  if (!right.ok) {
    return err(`right: ${right.error}`);
  }
  captures.push(right.value);
  return ok(captures);
}

/** The FULL-window scores of one same-page pair — partial windows never
 *  enter the null (their distribution is wider); the live analysis
 *  marks its own partial windows uncalibrated to match. */
function fullWindowScores(
  a: Uint8Array,
  b: Uint8Array,
  width: number,
  height: number,
  windowSize: number,
): Result<number[], string> {
  const analysis = analysePair(a, b, width, height, { windowSize });
  if (!analysis.ok) {
    return analysis;
  }
  const fullN = windowSize * windowSize;
  return ok(analysis.value.scores.filter((s) => s.n === fullN).map((s) => s.meanAbsDiff));
}

/** Pool the full windows of every same-page left pair. */
function poolNullScores(
  lefts: readonly Uint8Array[],
  width: number,
  height: number,
  windowSize: number,
): Result<number[], string> {
  const scores: number[] = [];
  for (let i = 0; i < lefts.length; i += 1) {
    for (let j = i + 1; j < lefts.length; j += 1) {
      const a = lefts[i];
      const b = lefts[j];
      if (a === undefined || b === undefined) {
        return err('null pairing indexed a missing capture — report this');
      }
      const pairScores = fullWindowScores(a, b, width, height, windowSize);
      if (!pairScores.ok) {
        return err(`null pair ${i}×${j}: ${pairScores.error}`);
      }
      scores.push(...pairScores.value);
    }
  }
  return ok(scores);
}

/** Crop every capture to the common minimum height — null and live pair
 *  must share one window grid. */
function cropAll(
  captures: readonly { rgba: Uint8Array; height: number }[],
  width: number,
): Result<{ cropped: Uint8Array[]; height: number; captureHeights: number[] }, string> {
  const captureHeights = captures.map((c) => c.height);
  const height = Math.min(...captureHeights);
  const cropped: Uint8Array[] = [];
  for (const capture of captures) {
    const crop = cropToHeight(capture.rgba, width, capture.height, height);
    if (!crop.ok) {
      return err('crop refused a capture the codec accepted — report this');
    }
    cropped.push(crop.value);
  }
  return ok({ cropped, height, captureHeights });
}

function writeCalibratedStats(
  config: CapturePairConfig,
  nullRuns: number,
  captureHeights: readonly number[],
  calibrated: CalibratedPairAnalysis,
): void {
  writeFileSync(
    join(config.out, `${config.tag}-stats.json`),
    `${JSON.stringify(
      {
        left: config.left,
        right: config.right,
        nullRuns,
        pairCount: (nullRuns * (nullRuns + 1)) / 2,
        captureHeights,
        settle: {
          fontsReadyBudgetMs: FONTS_READY_BUDGET_MS,
          settleMs: SETTLE_MS,
          animationKill: true,
        },
        thresholdInertUnderCalibration: true,
        ...calibrated,
      },
      null,
      2,
    )}\n`,
  );
}

/** Analyse the live pair and calibrate it against the pooled null. */
function calibrateLivePair(
  config: CapturePairConfig,
  cropped: readonly Uint8Array[],
  height: number,
): Result<{ analysis: CalibratedPairAnalysis; liveLeft: Uint8Array; right: Uint8Array }, string> {
  const right = cropped.at(-1);
  const liveLeft = cropped[0];
  if (right === undefined || liveLeft === undefined) {
    return err('capture set was empty after cropping — report this');
  }
  const nullScores = poolNullScores(cropped.slice(0, -1), config.width, height, config.window);
  if (!nullScores.ok) {
    return nullScores;
  }
  const analysis = analysePair(liveLeft, right, config.width, height, {
    windowSize: config.window,
    threshold: config.threshold,
  });
  if (!analysis.ok) {
    return analysis;
  }
  const calibrated = calibrateAnalysis(analysis.value, nullScores.value);
  return calibrated.ok ? ok({ analysis: calibrated.value, liveLeft, right }) : calibrated;
}

/** Run the calibrated arm end to end and write the four outputs. */
export async function runCalibrated(
  config: CapturePairConfig,
  nullRuns: number,
): Promise<Result<CalibratedRun, string>> {
  const captures = await captureAll(config, nullRuns);
  if (!captures.ok) {
    return captures;
  }
  const crops = cropAll(captures.value, config.width);
  if (!crops.ok) {
    return crops;
  }
  const live = calibrateLivePair(config, crops.value.cropped, crops.value.height);
  if (!live.ok) {
    return live;
  }
  const pngs = writePairPngs(
    config,
    { left: live.value.liveLeft, right: live.value.right, height: crops.value.height },
    renderCalibratedHeatmap(live.value.liveLeft, config.width, live.value.analysis),
  );
  if (!pngs.ok) {
    return pngs;
  }
  writeCalibratedStats(config, nullRuns, crops.value.captureHeights, live.value.analysis);
  return ok({ analysis: live.value.analysis, captureHeights: crops.value.captureHeights });
}

/** The calibrated stdout summary: the calibrated verdict leads, the
 *  naive z rides alongside — their disagreement is the honesty. */
export function summariseCalibrated(run: CalibratedRun): string {
  const { analysis } = run;
  const { calibration } = analysis;
  const top = analysis.calibratedRejecting.slice(0, 10);
  const lines = [
    `calibrated: N=${calibration.n} nullMax=${calibration.nullMax.toFixed(3)} ` +
      `floor=p<${calibration.floor.toExponential(2)} sigma-saturation=${calibration.sigmaSaturation.toFixed(2)} ` +
      `(naive --threshold is INERT under calibration)`,
    `rejecting=${analysis.calibratedRejecting.length} of ${analysis.scores.length} windows ` +
      `(beyond null max; naive z would reject ${analysis.rejecting.length})`,
    ...top.map((windowScore) => {
      // A degenerate null (byte-stable page) has no finite exceedance
      // ratio — name the situation rather than printing a ×0.00 that
      // reads as below the null max.
      const magnitude =
        windowScore.exceedance === undefined
          ? '  reject (nonzero on a byte-stable page — null max is 0) at '
          : `  reject ×${windowScore.exceedance.toFixed(2)} of null max at `;
      return (
        `${magnitude}(${windowScore.x},${windowScore.y}) ${windowScore.w}×${windowScore.h} ` +
        `meanΔ=${windowScore.meanAbsDiff.toFixed(2)} σ=${(windowScore.calibratedSigma ?? 0).toFixed(2)} ` +
        `(naive z=${windowScore.z.toFixed(1)})`
      );
    }),
  ];
  if (analysis.calibratedRejecting.length > top.length) {
    lines.push(
      `  … ${analysis.calibratedRejecting.length - top.length} further calibrated rejections in stats.json`,
    );
  }
  return lines.join('\n');
}
