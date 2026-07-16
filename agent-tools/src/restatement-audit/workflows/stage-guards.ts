/**
 * Sandbox-side run-data guards — defence in depth at the artefact boundary.
 *
 * @remarks
 * Mirrors `corpus-analysis/workflows/stage-guards.ts`: run data reaches an artefact only
 * through `build-run-artefact`, which fully validates it with the zod stage contracts
 * (`stage-io.ts`) BEFORE inlining, and tags it with the stage it was validated FOR (the
 * `RUN_DATA_STAGE` discriminant). These guards are the in-sandbox second line — pure
 * functions with no value imports, safe to inline into any artefact.
 *
 * @packageDocumentation
 */

import type { MapRunData, MetaRunData, ReduceRunData, ValidateRunData } from './stage-io.js';

function nonEmptyArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

/** Map run data: tagged for map, with a non-empty window partition and a gazetteer. */
export function isMapRunData(value: unknown, stage: string): value is MapRunData {
  return (
    stage === 'map' &&
    typeof value === 'object' &&
    value !== null &&
    'windows' in value &&
    nonEmptyArray(value.windows) &&
    'gazetteer' in value &&
    typeof value.gazetteer === 'object' &&
    value.gazetteer !== null
  );
}

/** Reduce run data: tagged for reduce, with non-empty instances. */
export function isReduceRunData(value: unknown, stage: string): value is ReduceRunData {
  return (
    stage === 'reduce' &&
    typeof value === 'object' &&
    value !== null &&
    'instances' in value &&
    nonEmptyArray(value.instances)
  );
}

function hasExplicitCeiling(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    'validateTokenCeiling' in value &&
    typeof value.validateTokenCeiling === 'number' &&
    value.validateTokenCeiling > 0
  );
}

function hasValidateArrays(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    'clusters' in value &&
    nonEmptyArray(value.clusters) &&
    'groundingInstances' in value &&
    nonEmptyArray(value.groundingInstances) &&
    'resolvedClusterIds' in value &&
    Array.isArray(value.resolvedClusterIds)
  );
}

/** Validate run data: tagged for validate, with clusters + grounding + an explicit ceiling. */
export function isValidateRunData(value: unknown, stage: string): value is ValidateRunData {
  return stage === 'validate' && hasValidateArrays(value) && hasExplicitCeiling(value);
}

/** Meta run data: tagged for meta, with non-empty flagged clusters. */
export function isMetaRunData(value: unknown, stage: string): value is MetaRunData {
  return (
    stage === 'meta' &&
    typeof value === 'object' &&
    value !== null &&
    'clusters' in value &&
    nonEmptyArray(value.clusters)
  );
}

/** The uniform message an unseeded or wrong-stage artefact fails with. */
export function unseededRunDataError(stage: string): string {
  return `${stage} run data has the wrong shape or stage tag — this artefact is unseeded or seeded for a different stage; build it with build-run-artefact.`;
}
