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

import {
  assessMapCompleteness,
  deterministicJitterMs,
  runCapped,
} from '../../corpus-analysis/run-orchestration.js';
import type {
  HarnessAgent,
  HarnessLog,
  HarnessParallel,
  HarnessPhase,
} from '../../corpus-analysis/workflows/harness-types.js';
import { AGENT_JSON_SCHEMAS } from './agent-schemas.js';
import type { FinderStageOutput } from './agent-schemas.js';
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
  const windowInstances = windows.map((w, index) => ({
    window: w.window,
    instances: mapResults[index]?.instances ?? [],
  }));
  const coverage = windowInstances.map((w) => ({
    window: w.window,
    instanceCount: w.instances.length,
  }));
  const completeness = assessMapCompleteness(
    coverage.map((c) => ({ window: c.window, leafCount: c.instanceCount })),
  );
  if (!completeness.mapComplete) {
    log(
      `MAP INCOMPLETE — ${completeness.incompleteWindows.length}/${windows.length} windows produced 0 instances: ${completeness.incompleteWindows.join(', ')} — do NOT commit this as full coverage.`,
    );
  }
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
