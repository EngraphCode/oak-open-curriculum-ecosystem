import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { isErr, ok, type Result } from '@oaknational/result';

import { FROZEN_TREE_SEGMENT } from './refound-freeze-helpers.js';
import { buildNetDiffReport, type NetDiffReport } from './refound-inventory-model.js';
import { isHeadingLine } from './refound-inventory-nets.js';
import { scanTreeInventory, type TreeInventory } from './refound-inventory-runner.js';
import { selectPlantTarget, type PlantTargetCandidate } from './refound-plant-orphan-model.js';
import { computeResidue } from './refound-residue-helpers.js';
import { type ResidueReport } from './refound-residue-model.js';
import { readDenominator } from './refound-verify-freeze-helpers.js';

/**
 * Staging and baseline derivation for the `refound-plant-orphan` proofs:
 * scratch-copy staging (mkdtemp — sources are read, never written), the
 * scan-and-cluster pipeline over a staged tree THROUGH THE REAL inventory
 * and residue code paths, and the deterministic baseline + plant-target
 * choice every proof diffs against.
 *
 * @packageDocumentation
 */

/** Stage a scratch copy of `relPaths` from `srcRoot` under a fresh mkdtemp. */
export async function stageCopy(srcRoot: string, relPaths: readonly string[]): Promise<string> {
  const scratchRoot = await mkdtemp(path.join(tmpdir(), 'refound-plant-stage-'));
  for (const relPath of relPaths) {
    const destAbs = path.join(scratchRoot, relPath);
    await mkdir(path.dirname(destAbs), { recursive: true });
    await writeFile(destAbs, await readFile(path.join(srcRoot, relPath)));
  }
  return scratchRoot;
}

/** One tree's scan, residue clustering, and net-diff arithmetic. */
export interface ClusteredTree {
  readonly scan: TreeInventory;
  readonly residue: ResidueReport;
  readonly netDiff: NetDiffReport;
}

/** Scan + cluster one staged tree through the real code paths. */
export async function scanAndCluster(
  rootAbs: string,
  relPaths: readonly string[],
): Promise<Result<ClusteredTree, Error>> {
  const scan = await scanTreeInventory({ rootAbs, relPaths });
  if (isErr(scan)) {
    return scan;
  }
  const residue = await computeResidue({ rootAbs, relPaths, records: scan.value.records });
  if (isErr(residue)) {
    return residue;
  }
  const netDiff = buildNetDiffReport({
    records: scan.value.records,
    totalFiles: relPaths.length,
    totalLines: scan.value.totalLines,
  });
  return ok({ scan: scan.value, residue: residue.value, netDiff });
}

/** Baseline facts plus the deterministic plant-target choice. */
export interface Baseline {
  readonly relPaths: readonly string[];
  readonly frozenRootAbs: string;
  readonly state: ClusteredTree;
  readonly targetPath: string;
}

/** Shape the per-file facts into plant-target candidates, in file order. */
function buildTargetCandidates(state: ClusteredTree): readonly PlantTargetCandidate[] {
  // A frontmatter fence is also a Net-A line-1 anchor, so the selector
  // demands a HEADING first line specifically (see selectPlantTarget).
  const headingsAtLineOne = new Set(
    state.scan.records
      .filter((record) => record.line === 1 && isHeadingLine(record.text))
      .map((record) => record.file),
  );
  const orphansByFile = new Map(
    state.residue.files.map((file) => [file.file, file.orphanCandidates.length]),
  );
  return state.scan.perFile.map((file) => ({
    path: file.path,
    lines: file.lines,
    anchors: file.anchors,
    firstLineIsHeading: headingsAtLineOne.has(file.path),
    orphanCandidates: orphansByFile.get(file.path) ?? 0,
  }));
}

/**
 * Derive the baseline: scan + cluster the REAL frozen tree (read-only) and
 * pick the deterministic plant target.
 */
export async function prepareBaseline(input: {
  readonly outDirAbs: string;
}): Promise<Result<Baseline, Error>> {
  const denominator = await readDenominator(input.outDirAbs);
  if (isErr(denominator)) {
    return denominator;
  }
  const relPaths = denominator.value.files
    .filter((row) => row.inventory_mode === 'lines')
    .map((row) => row.path);
  const frozenRootAbs = path.join(input.outDirAbs, FROZEN_TREE_SEGMENT);
  const state = await scanAndCluster(frozenRootAbs, relPaths);
  if (isErr(state)) {
    return state;
  }
  const targetPath = selectPlantTarget(buildTargetCandidates(state.value));
  if (isErr(targetPath)) {
    return targetPath;
  }
  return ok({ relPaths, frozenRootAbs, state: state.value, targetPath: targetPath.value });
}
