/**
 * Deterministic pre-spend cost model and map-coverage check for the large-corpus-analysis
 * pipeline (v2 design changes 5 and 7).
 *
 * Cost is arithmetic over a known stage partition and an explicit effort table — never
 * inherited from the session. The v1 run overspent (~4.4M tokens against a ~1.3M estimate,
 * rate-limit-truncated) precisely because effort was omitted and xhigh was inherited on all
 * 14 map agents. Here every stage names its effort as data, so the estimate is honest and a
 * ceiling can gate the run before the spend.
 */

/** Reasoning-effort tiers. The multiplier table below is calibration DATA, not a constant. */
export type Effort = 'low' | 'medium' | 'high' | 'xhigh';

/**
 * Default effort multipliers — how much a tier inflates a stage's token estimate relative to
 * a low-effort baseline. Calibration data: override per run as the model and tiering evolve.
 */
export const DEFAULT_EFFORT_MULTIPLIERS: Record<Effort, number> = {
  low: 1,
  medium: 1.5,
  high: 2.5,
  xhigh: 4,
};

export interface StagePlan {
  readonly name: string;
  /** How many times this stage is invoked (e.g. 14 map windows, candidates times voters). */
  readonly invocations: number;
  /** Input-plus-output token estimate for a single invocation at the baseline effort. */
  readonly tokensPerInvocation: number;
  readonly effort: Effort;
}

export interface StageCost {
  readonly name: string;
  readonly tokens: number;
}

export interface CostEstimate {
  readonly perStage: readonly StageCost[];
  readonly totalTokens: number;
  readonly ceiling: number;
  /** Whether the estimate is within the abort ceiling — the pre-spend gate. */
  readonly withinCeiling: boolean;
}

/**
 * Estimate the whole pipeline's token cost and gate it against a ceiling. Each stage's cost
 * is invocations times per-invocation tokens times its effort multiplier; the total is
 * compared to the ceiling before any agent is dispatched.
 */
export function estimatePipelineCost(input: {
  readonly stages: readonly StagePlan[];
  readonly ceiling: number;
  readonly effortMultipliers?: Record<Effort, number>;
}): CostEstimate {
  const multipliers = input.effortMultipliers ?? DEFAULT_EFFORT_MULTIPLIERS;
  const perStage = input.stages.map(
    (stage): StageCost => ({
      name: stage.name,
      tokens: Math.round(stage.invocations * stage.tokensPerInvocation * multipliers[stage.effort]),
    }),
  );
  const totalTokens = perStage.reduce((sum, stage) => sum + stage.tokens, 0);
  return {
    perStage,
    totalTokens,
    ceiling: input.ceiling,
    withinCeiling: totalTokens <= input.ceiling,
  };
}

export interface WindowExtraction {
  readonly window: string;
  readonly leafCount: number;
}

export interface CoverageReport {
  readonly medianLeafCount: number;
  /** Windows that extracted nothing, or far below the median — silent under-extraction. */
  readonly underExtracting: readonly string[];
}

function median(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Flag windows that silently under-extracted — the upstream analogue of the C06 stranded
 * voter. A window with zero leaves, or far below the median leaf count (default a quarter),
 * is surfaced so the run is not scored over a window that quietly contributed nothing. The
 * floor is exclusive: a window exactly at `minFraction` times the median is not flagged.
 */
export function checkMapCoverage(input: {
  readonly windows: readonly WindowExtraction[];
  readonly minFraction?: number;
}): CoverageReport {
  const minFraction = input.minFraction ?? 0.25;
  const medianLeafCount = median(input.windows.map((window) => window.leafCount));
  const floor = medianLeafCount * minFraction;
  const underExtracting = input.windows
    .filter((window) => window.leafCount === 0 || window.leafCount < floor)
    .map((window) => window.window);
  return { medianLeafCount, underExtracting };
}
