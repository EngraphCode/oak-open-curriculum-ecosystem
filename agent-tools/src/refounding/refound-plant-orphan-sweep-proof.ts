import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { err, isErr, ok, type Result } from '@oaknational/result';

import { classifyInventoryMode, splitLineBytes } from './refounding-artefacts.js';
import { readRule } from './refound-freeze-plan.js';
import { stageCopy } from './refound-plant-orphan-baseline.js';
import {
  insertLinesAtTop,
  SWEEP_CONTROL_PLANT_LINE_V1,
  SWEEP_PARAPHRASE_PLANT_LINE_V1,
  sweepBlindnessFailures,
} from './refound-plant-orphan-model.js';
import { type PlantOrphanOutcome } from './refound-plant-orphan-transcript.js';
import { enumerateSweepFiles, scanSweepFiles } from './refound-sweep-helpers.js';
import { type SweepHit } from './refound-sweep-model.js';

/**
 * Plant 3 of `refound-plant-orphan`: the marker-free work-bearing
 * paraphrase PLUS a marker-bearing live-scanner control, both on a STAGED
 * copy of a sweep surface (plan P4; F2 §6 canary hygiene — the live
 * surfaces are read, never written). In ONE scan the sweep net must return
 * ZERO hits for the paraphrase while the control line HITS: blindness to
 * marker-free work proven against a scanner demonstrably alive (an
 * always-empty scanner fails the proof on the control). This is the honest
 * residue signal the G1 item-6 reader-sample cure exists for. A blindness
 * DISCLOSURE, not a pass.
 *
 * @packageDocumentation
 */

/** Pick the first non-binary staged sweep surface to plant into. */
async function pickSweepPlantFile(
  scratchRoot: string,
  relPaths: readonly string[],
): Promise<Result<string, Error>> {
  for (const relPath of relPaths) {
    const bytes = await readFile(path.join(scratchRoot, relPath));
    if (classifyInventoryMode(relPath, bytes) !== 'opaque') {
      return ok(relPath);
    }
  }
  return err(new Error('sweep plant found no non-binary sweep surface to stage'));
}

/**
 * Plant the paraphrase at line 1 and the live-scanner control at line 2 of
 * the staged file; report the paraphrase's verified presence.
 */
async function plantParaphraseAndControl(scratchRoot: string, relPath: string): Promise<boolean> {
  const plantAbs = path.join(scratchRoot, relPath);
  await writeFile(
    plantAbs,
    insertLinesAtTop(await readFile(plantAbs), [
      SWEEP_PARAPHRASE_PLANT_LINE_V1,
      SWEEP_CONTROL_PLANT_LINE_V1,
    ]),
  );
  const plantedFirstLine = splitLineBytes(await readFile(plantAbs))[0];
  return (
    plantedFirstLine !== undefined &&
    Buffer.from(plantedFirstLine).toString('utf8') === SWEEP_PARAPHRASE_PLANT_LINE_V1
  );
}

/**
 * Plant 3: the sweep net must be provably BLIND to the marker-free plant
 * while the SAME scan HITS the planted control (the scanner is alive).
 */
export async function proveSweepPlant(
  input: { readonly repoRoot: string; readonly ruleAbsPath: string },
  scratchRoots: string[],
): Promise<Result<PlantOrphanOutcome['sweep'], Error>> {
  const rule = await readRule(input.ruleAbsPath);
  if (isErr(rule)) {
    return rule;
  }
  const sweepRelPaths = await enumerateSweepFiles(rule.value, input.repoRoot);
  if (isErr(sweepRelPaths)) {
    return sweepRelPaths;
  }
  const scratch = await stageCopy(input.repoRoot, sweepRelPaths.value);
  scratchRoots.push(scratch);
  const plantFile = await pickSweepPlantFile(scratch, sweepRelPaths.value);
  if (isErr(plantFile)) {
    return plantFile;
  }
  const plantPresentInCopy = await plantParaphraseAndControl(scratch, plantFile.value);
  const swept = await scanSweepFiles({ rootAbs: scratch, relPaths: sweepRelPaths.value });
  if (isErr(swept)) {
    return swept;
  }
  const counts = countPlantHits(swept.value.hits, plantFile.value);
  const failures = sweepBlindnessFailures({ plantPresentInCopy, ...counts });
  if (failures.length > 0) {
    return err(new Error(`sweep blindness plant did NOT behave: ${failures.join('; ')}`));
  }
  return ok({ file: plantFile.value, plantedLine: 1, plantPresentInCopy, ...counts });
}

/** Count the paraphrase and control hits for the planted file, one scan. */
function countPlantHits(
  hits: readonly SweepHit[],
  plantFile: string,
): { readonly sweepHitsForPlant: number; readonly sweepHitsForControl: number } {
  return {
    sweepHitsForPlant: hits.filter((hit) => hit.text === SWEEP_PARAPHRASE_PLANT_LINE_V1).length,
    sweepHitsForControl: hits.filter(
      (hit) => hit.file === plantFile && hit.text === SWEEP_CONTROL_PLANT_LINE_V1,
    ).length,
  };
}
