import { type Result } from '@oaknational/result';
import { z } from 'zod';

import { parseWithSchema } from '../core/schema-parse.js';

/**
 * Pure logic of `refound-batch-status` (R0a cycle 4): the closed
 * `run-state.v1.json` shape and the exit-code contract.
 *
 * @remarks
 * The run-state document is a CACHE the tool OVERWRITES on every completed
 * recompute and never reads as truth (`validators-must-recompute`): the
 * dashboard is derived in-process from the artefacts themselves on every
 * run, so a falsified cache claiming green has ZERO effect on the next
 * recompute (the novel P4 cache-tamper proof). Single writer, closed
 * schema, no timestamps.
 *
 * Stage semantics follow the lattice `freeze ⊂ inventoried ⊂ tiled`: a
 * stage is evaluated only when its predecessor recomputes green, and an
 * ABSENT artefact is the explicit `not-reached` state — never green, never
 * a crash — mechanically distinguished (existence probe) from an `invalid`
 * (present but unreadable or unparseable) artefact.
 *
 * @packageDocumentation
 */

/** Run-state cache basename under the artefact home (versioned-basename). */
export const RUN_STATE_BASENAME = 'run-state.v1.json';

const nonEmptyString = z.string().min(1);
const nonNegativeInt = z.number().int().nonnegative();

/**
 * One stage's recomputed state: `green` (recomputed clean), `red`
 * (recomputed violations), `not-reached` (artefact absent or a predecessor
 * stage not green), `invalid` (artefact present but unreadable or failing
 * its strict parse).
 */
const stageStateSchema = z.enum(['green', 'red', 'not-reached', 'invalid']);
type StageState = z.infer<typeof stageStateSchema>;

const stageSchema = z.strictObject({
  state: stageStateSchema,
  detail: nonEmptyString,
});
export type Stage = z.infer<typeof stageSchema>;

const areaStatusSchema = stageSchema.extend({
  area: nonEmptyString,
  files: nonNegativeInt,
});
export type AreaStatus = z.infer<typeof areaStatusSchema>;

/**
 * The `run-state.v1.json` document: the denominator root, the freeze and
 * inventory stages, per-area tiling states (sorted by area), and the
 * cross-area duplicate-id check (runs once every area tiles green, and at
 * least two exist).
 */
const runStateSchema = z.strictObject({
  version: z.literal(1),
  denominator: stageSchema,
  freeze: stageSchema,
  inventory: stageSchema,
  crossArea: stageSchema,
  areas: z.array(areaStatusSchema),
});
export type RunState = z.infer<typeof runStateSchema>;

/** Parse an unknown value as a {@link RunState} at the read boundary. */
export const parseRunState = (value: unknown): Result<RunState, Error> =>
  parseWithSchema({ label: 'run-state', schema: runStateSchema, value });

/** The entry's decided verdict: the exit code and the exact operator lines. */
export interface BatchStatusVerdict {
  readonly exitCode: number;
  readonly lines: readonly string[];
}

/**
 * True when the state blocks: recomputed red or unreadable artefacts. The
 * switch is exhaustive with no default so a new {@link StageState} member is
 * a compile error here, never a silent exit-0 (fail-closed on enum growth).
 */
function blocks(state: StageState): boolean {
  switch (state) {
    case 'red':
    case 'invalid':
      return true;
    case 'green':
    case 'not-reached':
      return false;
    default: {
      // Exhaustiveness: a new StageState member fails to compile here.
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}

/**
 * Decide the dashboard verdict — pure, so the exit-code contract is
 * unit-testable without capturing stdout: any recomputed `red` or `invalid`
 * stage is exit 1; `not-reached` stages are honest early-protocol states
 * and exit 0. The printer is the only IO.
 */
export function decideBatchStatusVerdict(runState: RunState): BatchStatusVerdict {
  const lines = [
    `denominator: ${runState.denominator.state} — ${runState.denominator.detail}`,
    `freeze: ${runState.freeze.state} — ${runState.freeze.detail}`,
    `inventory: ${runState.inventory.state} — ${runState.inventory.detail}`,
    ...runState.areas.map(
      (area) =>
        `tiled ${area.area} (${String(area.files)} file(s)): ${area.state} — ${area.detail}`,
    ),
    `cross-area: ${runState.crossArea.state} — ${runState.crossArea.detail}`,
  ];
  const anyBlocking =
    blocks(runState.denominator.state) ||
    blocks(runState.freeze.state) ||
    blocks(runState.inventory.state) ||
    blocks(runState.crossArea.state) ||
    runState.areas.some((area) => blocks(area.state));
  return { exitCode: anyBlocking ? 1 : 0, lines };
}
