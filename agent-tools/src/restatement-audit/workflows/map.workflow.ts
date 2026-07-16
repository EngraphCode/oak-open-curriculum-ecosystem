/**
 * MAP stage workflow: extract quote-anchored restatement instances from every T3 window.
 *
 * @remarks
 * Thin composition root over tested logic: the seeded partition (run-data), the finder
 * prompt (with the inlined gazetteer), the derived finder schema, and the shared throttle
 * (`runCapped` at `MAP_CONCURRENCY` with deterministic per-window jitter) — mirrors
 * `corpus-analysis/workflows/map.workflow.ts`'s rate-limit-burst cure. Positional
 * alignment `results[i] <-> partition[i]` is load-bearing: a dead window maps to zero
 * instances at its own position and is surfaced by the completeness verdict, never
 * silently absorbed.
 *
 * @packageDocumentation
 */

import { deterministicJitterMs, runCapped } from '../../corpus-analysis/run-orchestration.js';
import type {
  HarnessAgent,
  HarnessLog,
  HarnessParallel,
  HarnessPhase,
} from '../../corpus-analysis/workflows/harness-types.js';
import { AGENT_JSON_SCHEMAS } from './agent-schemas.js';
import type { FinderStageOutput } from './agent-schemas.js';
import { flattenGazetteerSubjects } from './gazetteer.js';
import type { Gazetteer } from './gazetteer.js';
import { finderPrompt } from './prompts.js';
import { RUN_DATA, RUN_DATA_STAGE } from './run-data.js';
import { isMapRunData, unseededRunDataError } from './stage-guards.js';
import type { MapResult, PartitionWindow } from './stage-io.js';

declare const agent: HarnessAgent;
declare const parallel: HarnessParallel;
declare const phase: HarnessPhase;
declare const log: HarnessLog;

/** Peak in-flight map agents — the load-bearing throttle (mirrors corpus-analysis). */
const MAP_CONCURRENCY = 4;
/** Max deterministic per-window dispatch delay (ms) to flatten the burst. */
const JITTER_MS = 250;

async function mapWindow(
  w: PartitionWindow,
  gazetteer: Gazetteer,
): Promise<FinderStageOutput | null> {
  if (typeof setTimeout === 'function' && JITTER_MS > 0) {
    await new Promise((done) => setTimeout(done, deterministicJitterMs(w.window, JITTER_MS)));
  }
  return agent<FinderStageOutput>(finderPrompt(w, gazetteer), {
    label: `map:${w.window}`,
    phase: 'map',
    model: 'sonnet',
    effort: 'low',
    // Read-only agent type (Read allow-list, capped turns): the stage's whole purpose is
    // reading the window's named files; nothing else is granted.
    agentType: 'corpus-mapper',
    schema: AGENT_JSON_SCHEMAS.finderStage,
  });
}

interface WindowInstances {
  readonly window: string;
  readonly instances: readonly FinderStageOutput['instances'][number][];
}

/**
 * Code owns the two fields agents cannot be trusted with: instance ids are re-minted per
 * window+position (uniqueness by construction, never by agent discipline), and
 * subjectFromGazetteer is recomputed as the pure function of subject + gazetteer it is.
 */
function remintWindowInstances(
  windows: readonly PartitionWindow[],
  mapResults: readonly (FinderStageOutput | null)[],
  gazetteer: Gazetteer,
): WindowInstances[] {
  const subjectIds = new Set(flattenGazetteerSubjects(gazetteer));
  return windows.map((w, index) => ({
    window: w.window,
    instances: (mapResults[index]?.instances ?? []).map((instance, position) => ({
      ...instance,
      id: `${w.window}-I${String(position + 1).padStart(2, '0')}`,
      subjectFromGazetteer: subjectIds.has(instance.subject),
    })),
  }));
}

interface MapCompleteness {
  readonly mapComplete: boolean;
  readonly incompleteWindows: readonly string[];
}

/**
 * Completeness is DISPATCH death (a null agent result), never instance count: a
 * successfully-returned empty window is a genuinely clean file (per-file zero-count
 * honesty), not a coverage gap.
 */
function deriveCompleteness(
  windows: readonly PartitionWindow[],
  mapResults: readonly (FinderStageOutput | null)[],
): MapCompleteness {
  const incompleteWindows = windows.flatMap((w, index) =>
    mapResults[index] === null ? [w.window] : [],
  );
  return { mapComplete: incompleteWindows.length === 0, incompleteWindows };
}

/** One loud line each for dead windows and clean (zero-instance) windows. */
function logCoverageHonesty(
  completeness: MapCompleteness,
  windowCount: number,
  coverage: readonly { readonly window: string; readonly instanceCount: number }[],
): void {
  if (!completeness.mapComplete) {
    log(
      `MAP INCOMPLETE — ${completeness.incompleteWindows.length}/${windowCount} window agent(s) died: ${completeness.incompleteWindows.join(', ')} — do NOT commit this as full coverage.`,
    );
  }
  const cleanWindows = coverage.filter((c) => c.instanceCount === 0).map((c) => c.window);
  if (cleanWindows.length > 0) {
    log(`clean windows (agent returned, zero instances): [${cleanWindows.join(', ')}]`);
  }
}

/** Run the map stage over the seeded partition. */
export async function main(): Promise<MapResult> {
  phase('map');
  if (!isMapRunData(RUN_DATA, RUN_DATA_STAGE)) {
    return { ok: false, error: unseededRunDataError('map') };
  }
  const { windows, gazetteer } = RUN_DATA;
  const fileCount = windows.reduce((sum, w) => sum + w.files.length, 0);
  log(
    `partition: ${windows.length} windows, ${fileCount} files; MAP_CONCURRENCY=${MAP_CONCURRENCY}, jitter<=${JITTER_MS}ms`,
  );

  const mapResults = await runCapped(
    windows,
    MAP_CONCURRENCY,
    (w) => mapWindow(w, gazetteer),
    parallel,
  );
  const windowInstances = remintWindowInstances(windows, mapResults, gazetteer);
  const coverage = windowInstances.map((w) => ({
    window: w.window,
    instanceCount: w.instances.length,
  }));
  const completeness = deriveCompleteness(windows, mapResults);
  logCoverageHonesty(completeness, windows.length, coverage);
  const allInstances = windowInstances.flatMap((w) => w.instances);
  log(
    `map done: ${allInstances.length} instances; per-window=[${coverage.map((c) => c.instanceCount).join(',')}]`,
  );

  return {
    ok: true,
    partition: windows.map((w) => ({ window: w.window, fileCount: w.files.length })),
    coverage,
    mapComplete: completeness.mapComplete,
    incompleteWindows: [...completeness.incompleteWindows],
    instanceCount: allInstances.length,
    instances: allInstances,
  };
}
