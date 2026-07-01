/**
 * Sandbox-side run-data guards — defence in depth at the artefact boundary.
 *
 * @remarks
 * Run data reaches an artefact only through `build-run-artefact`, which fully validates
 * it with the zod stage contracts (`stage-io.ts`) BEFORE inlining. These guards are the
 * in-sandbox second line: shallow structural checks that catch an unseeded artefact
 * (the `run-data.ts` sentinel) or a wrong-stage seeding, without dragging zod into the
 * bundle. Their type predicates promise the full stage type on the strength of that
 * pipeline invariant — the deep validation has already happened, on the same data, at
 * the Node boundary.
 *
 * Pure functions with no value imports — safe to inline into any artefact.
 *
 * @packageDocumentation
 */

import type { MapRunData, MetaRunData, ReduceRunData, ValidateRunData } from './stage-io.js';

function nonEmptyArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

/** Map run data: a non-empty window partition. */
export function isMapRunData(value: unknown): value is MapRunData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'windows' in value &&
    nonEmptyArray(value.windows)
  );
}

/** Reduce run data: non-empty leaves. */
export function isReduceRunData(value: unknown): value is ReduceRunData {
  return (
    typeof value === 'object' && value !== null && 'leaves' in value && nonEmptyArray(value.leaves)
  );
}

function hasValidateArrays(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    'candidates' in value &&
    nonEmptyArray(value.candidates) &&
    'groundingLeaves' in value &&
    nonEmptyArray(value.groundingLeaves) &&
    'resolvedIds' in value &&
    Array.isArray(value.resolvedIds)
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

/** Validate run data: candidates + grounding leaves + resume ids + an explicit ceiling. */
export function isValidateRunData(value: unknown): value is ValidateRunData {
  return hasValidateArrays(value) && hasExplicitCeiling(value);
}

/** Meta run data: non-empty terminally-dispositioned candidates. */
export function isMetaRunData(value: unknown): value is MetaRunData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'candidates' in value &&
    nonEmptyArray(value.candidates)
  );
}

/** The uniform message an unseeded or wrong-stage artefact fails with. */
export function unseededRunDataError(stage: string): string {
  return `${stage} run data has the wrong shape — this artefact is unseeded or seeded for a different stage; build it with build-run-artefact.`;
}
