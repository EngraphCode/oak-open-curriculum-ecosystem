import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { err, isErr, ok, type Result } from '@oaknational/result';

import {
  scanAndCluster,
  stageCopy,
  type Baseline,
  type ClusteredTree,
} from './refound-plant-orphan-baseline.js';
import {
  CONTROL_KEYWORD_PLANT_LINE_V1,
  insertLineAfter,
  insertLinesAtTop,
  MISSPELT_KEYWORD_PLANT_LINE_V1,
  PREAMBLE_PLANT_LINES_V1,
} from './refound-plant-orphan-model.js';
import { type PlantOrphanOutcome } from './refound-plant-orphan-transcript.js';

/**
 * The residue-side discrimination proofs of `refound-plant-orphan` (F1 §9
 * plants 1 and 2), each on its own staged scratch copy, each asserted
 * against the baseline from `refound-plant-orphan-baseline.ts`. The sweep
 * blindness plant lives in `refound-plant-orphan-sweep-proof.ts`. A proof
 * that does not fire returns a typed error naming the plant — never a
 * transcript.
 *
 * @packageDocumentation
 */

const KEYWORD_PLANT_LINE_NUMBER = 2; // Inserted after the target's line-1 anchor.

/** Stage a scratch copy, mutate the target file's bytes, scan + cluster. */
async function plantIntoScratch(
  baseline: Baseline,
  scratchRoots: string[],
  mutate: (bytes: Uint8Array) => Uint8Array,
): Promise<Result<ClusteredTree, Error>> {
  const scratch = await stageCopy(baseline.frozenRootAbs, baseline.relPaths);
  scratchRoots.push(scratch);
  const targetAbs = path.join(scratch, baseline.targetPath);
  await writeFile(targetAbs, mutate(await readFile(targetAbs)));
  return scanAndCluster(scratch, baseline.relPaths);
}

/** Plant 1: the anchorless preamble — residue must gain exactly one orphan. */
export async function provePreamblePlant(
  baseline: Baseline,
  scratchRoots: string[],
): Promise<Result<PlantOrphanOutcome['preamble'], Error>> {
  const planted = await plantIntoScratch(baseline, scratchRoots, (bytes) =>
    insertLinesAtTop(bytes, PREAMBLE_PLANT_LINES_V1),
  );
  if (isErr(planted)) {
    return planted;
  }
  const plantedTotal = planted.value.residue.totals.orphanCandidates;
  const baselineTotal = baseline.state.residue.totals.orphanCandidates;
  const targetCandidates = planted.value.residue.orphanCandidates.filter(
    (candidate) => candidate.file === baseline.targetPath,
  );
  const first = targetCandidates[0];
  const plantLineCount = PREAMBLE_PLANT_LINES_V1.length;
  if (
    plantedTotal !== baselineTotal + 1 ||
    targetCandidates.length !== 1 ||
    first === undefined ||
    first.lineStart !== 1 ||
    first.lineEnd !== plantLineCount ||
    !first.reasons.includes('file-preamble')
  ) {
    return err(
      new Error(
        `preamble plant did NOT fire cleanly: expected exactly one new file-preamble orphan at ` +
          `lines 1-${String(plantLineCount)} of '${baseline.targetPath}' ` +
          `(baseline ${String(baselineTotal)} orphan(s), planted ${String(plantedTotal)})`,
      ),
    );
  }
  return ok({
    file: baseline.targetPath,
    lineStart: first.lineStart,
    lineEnd: first.lineEnd,
    reasons: first.reasons,
  });
}

/** What the misspelt-keyword run showed. */
interface MisspeltAssessment {
  readonly misspeltInInventory: boolean;
  readonly misspeltInResidueBlock: boolean;
  readonly countsUnchanged: boolean;
}

/** Assess the misspelt run: residue-only presence, per-net counts steady. */
function assessMisspeltRun(baseline: Baseline, planted: ClusteredTree): MisspeltAssessment {
  const misspeltInInventory = planted.scan.records.some(
    (record) => record.text === MISSPELT_KEYWORD_PLANT_LINE_V1,
  );
  const targetResidue = planted.residue.files.find((file) => file.file === baseline.targetPath);
  const containingBlock = targetResidue?.blocks.find(
    (block) =>
      block.lineStart <= KEYWORD_PLANT_LINE_NUMBER && KEYWORD_PLANT_LINE_NUMBER <= block.lineEnd,
  );
  const misspeltInResidueBlock =
    containingBlock !== undefined && containingBlock.lineStart !== KEYWORD_PLANT_LINE_NUMBER;
  const countsUnchanged = (['A', 'B', 'C'] as const).every(
    (net) => planted.netDiff.perNet[net].captured === baseline.state.netDiff.perNet[net].captured,
  );
  return { misspeltInInventory, misspeltInResidueBlock, countsUnchanged };
}

/** Misspelt-run rule violations, as operator-readable failure strings. */
function misspeltFailures(assessment: MisspeltAssessment): string[] {
  const failures: string[] = [];
  if (assessment.misspeltInInventory) {
    failures.push('the misspelt line was captured by a net (it must live in residue only)');
  }
  if (!assessment.misspeltInResidueBlock) {
    failures.push('the misspelt line did not land inside an anchored residue block');
  }
  if (!assessment.countsUnchanged) {
    failures.push('per-net capture counts moved on the misspelt plant');
  }
  return failures;
}

/** What the correctly-spelt control run showed. */
interface ControlAssessment {
  readonly controlNets: readonly string[] | undefined;
  readonly netCShift: number;
  readonly uniqueCShift: number;
  readonly abUnchanged: boolean;
}

/** Assess the control run: the sharp one-net (C) shift. */
function assessControlRun(baseline: Baseline, control: ClusteredTree): ControlAssessment {
  const controlRecord = control.scan.records.find(
    (record) => record.text === CONTROL_KEYWORD_PLANT_LINE_V1,
  );
  return {
    controlNets: controlRecord?.nets,
    netCShift: control.netDiff.perNet.C.captured - baseline.state.netDiff.perNet.C.captured,
    uniqueCShift:
      control.netDiff.uniqueCaptures.C.length - baseline.state.netDiff.uniqueCaptures.C.length,
    abUnchanged: (['A', 'B'] as const).every(
      (net) => control.netDiff.perNet[net].captured === baseline.state.netDiff.perNet[net].captured,
    ),
  };
}

/** Control-run rule violations, as operator-readable failure strings. */
function controlFailures(assessment: ControlAssessment): string[] {
  const failures: string[] = [];
  if (assessment.controlNets === undefined || assessment.controlNets.join(',') !== 'C') {
    failures.push('the control line was not captured by Net C alone');
  }
  if (assessment.netCShift !== 1 || assessment.uniqueCShift !== 1) {
    failures.push('the control did not shift Net C by exactly one (captured and unique)');
  }
  if (!assessment.abUnchanged) {
    failures.push('Nets A/B moved on the control plant');
  }
  return failures;
}

/** Plant 2: misspelt keyword in residue only; control shifts Net C by one. */
export async function proveKeywordPlant(
  baseline: Baseline,
  scratchRoots: string[],
): Promise<Result<PlantOrphanOutcome['keyword'], Error>> {
  const misspelt = await plantIntoScratch(baseline, scratchRoots, (bytes) =>
    insertLineAfter(bytes, 1, MISSPELT_KEYWORD_PLANT_LINE_V1),
  );
  if (isErr(misspelt)) {
    return misspelt;
  }
  const control = await plantIntoScratch(baseline, scratchRoots, (bytes) =>
    insertLineAfter(bytes, 1, CONTROL_KEYWORD_PLANT_LINE_V1),
  );
  if (isErr(control)) {
    return control;
  }
  const misspeltFacts = assessMisspeltRun(baseline, misspelt.value);
  const controlFacts = assessControlRun(baseline, control.value);
  const failures = [...misspeltFailures(misspeltFacts), ...controlFailures(controlFacts)];
  if (failures.length > 0) {
    return err(new Error(`keyword plant did NOT discriminate: ${failures.join('; ')}`));
  }
  return ok({
    file: baseline.targetPath,
    plantedLine: KEYWORD_PLANT_LINE_NUMBER,
    misspeltInInventory: misspeltFacts.misspeltInInventory,
    misspeltInResidueBlock: misspeltFacts.misspeltInResidueBlock,
    controlNets: [...(controlFacts.controlNets ?? [])],
    netCShift: controlFacts.netCShift,
  });
}
