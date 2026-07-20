/**
 * Derive and RE-VALIDATE one stage's run data from committed checkpoint file paths.
 *
 * @remarks
 * Split out of `build-run-artefact.ts` (file-length discipline): this module owns the
 * checkpoint-read + pipeline-glue + boundary-re-parse logic; the CLI entry owns argv
 * parsing and the write. The re-parse through `stage-io.ts`'s parsers after
 * `run-inputs.ts` derivation is the boundary guarantee `stage-io.ts` promises
 * ("validated before inlining") — it also catches flag-level slips the derivations cannot
 * (e.g. a fractional `--ceiling` surviving `Number()`).
 *
 * @packageDocumentation
 */

import { readFile } from 'node:fs/promises';

import { err, ok, type Result } from '@oaknational/result';

import { resolveReadPathWithinRepo } from '../../../core/flag-path-resolve.js';
import { resolveRepoRoot } from '../../../core/repo-root.js';
import { parseGazetteerFile, projectGazetteer } from '../gazetteer-schema.js';
import { metaRunDataFrom, reduceRunDataFrom, validateRunDataFrom } from '../run-inputs.js';
import type {
  MapRunData,
  MetaRunData,
  ReduceRunData,
  ValidateResult,
  ValidateRunData,
} from '../stage-io.js';
import {
  parseMapResult,
  parseMapRunData,
  parseMetaRunData,
  parsePartitionFile,
  parseReduceResult,
  parseReduceRunData,
  parseValidateResult,
  parseValidateRunData,
} from '../stage-io.js';

export interface CliFlags {
  readonly stage: string;
  readonly partition?: string;
  readonly gazetteer?: string;
  readonly mapResult?: string;
  readonly reduceResult?: string;
  readonly validateResults: readonly string[];
  readonly ceiling?: number;
}

/** Every stage's run data, as the concrete union — never widened back to unknown. */
export type StageRunData = MapRunData | ReduceRunData | ValidateRunData | MetaRunData;

async function readJson(filePath: string): Promise<Result<unknown, Error>> {
  // Containment before I/O (the render-ledger-cli.ts precedent, AIP-126 item 7): a
  // checkpoint flag must never read/inline JSON from outside the repository. Relative
  // flags DELIBERATELY resolve against the repo root, not process.cwd(): pnpm pins the
  // script cwd to the agent-tools workspace wherever the operator stands, so a cwd base
  // would make the committed `.agent/reports/...` checkpoint paths unreachable — the
  // repo-root base is the deterministic convention every flag-path CLI here shares.
  const safePath = resolveReadPathWithinRepo(resolveRepoRoot(import.meta.url), filePath);
  if (!safePath.ok) {
    return safePath;
  }
  try {
    const raw = await readFile(safePath.value, 'utf8');
    return ok(JSON.parse(raw));
  } catch (cause) {
    return err(
      new Error(
        `Cannot read checkpoint ${filePath}: ${cause instanceof Error ? cause.message : String(cause)}`,
        { cause },
      ),
    );
  }
}

async function readAnd<T>(
  filePath: string | undefined,
  label: string,
  parse: (value: unknown) => Result<T, Error>,
): Promise<Result<T, Error>> {
  if (filePath === undefined) {
    return err(new Error(`Missing required checkpoint flag for ${label}.`));
  }
  const json = await readJson(filePath);
  return json.ok ? parse(json.value) : json;
}

async function readValidateResults(
  paths: readonly string[],
): Promise<Result<ValidateResult[], Error>> {
  const results: ValidateResult[] = [];
  for (const filePath of paths) {
    const parsed = await readAnd(filePath, '--validate-result', parseValidateResult);
    if (!parsed.ok) {
      return parsed;
    }
    results.push(parsed.value);
  }
  return ok(results);
}

async function deriveMapRunData(flags: CliFlags): Promise<Result<MapRunData, Error>> {
  // The closed canonical {"windows": [...]} shape — parsePartitionFile rejects a typo'd
  // key, a stray sibling key, or a bare window array (AIP-126 item 8).
  const partition = await readAnd(flags.partition, '--partition', parsePartitionFile);
  if (!partition.ok) {
    return partition;
  }
  const gazetteerFile = await readAnd(flags.gazetteer, '--gazetteer', parseGazetteerFile);
  if (!gazetteerFile.ok) {
    return gazetteerFile;
  }
  return parseMapRunData({
    windows: partition.value.windows,
    gazetteer: projectGazetteer(gazetteerFile.value),
  });
}

async function deriveValidateRunData(flags: CliFlags): Promise<Result<ValidateRunData, Error>> {
  const mapResult = await readAnd(flags.mapResult, '--map-result', parseMapResult);
  if (!mapResult.ok) {
    return mapResult;
  }
  const reduceResult = await readAnd(flags.reduceResult, '--reduce-result', parseReduceResult);
  if (!reduceResult.ok) {
    return reduceResult;
  }
  const priors = await readValidateResults(flags.validateResults);
  if (!priors.ok) {
    return priors;
  }
  if (flags.ceiling === undefined || Number.isNaN(flags.ceiling)) {
    return err(new Error('validate requires an explicit --ceiling (no default, ever).'));
  }
  return validateRunDataFrom({
    mapResult: mapResult.value,
    reduceResult: reduceResult.value,
    priorValidateResults: priors.value,
    validateTokenCeiling: flags.ceiling,
  });
}

async function deriveMetaRunData(flags: CliFlags): Promise<Result<MetaRunData, Error>> {
  const mapResult = await readAnd(flags.mapResult, '--map-result', parseMapResult);
  if (!mapResult.ok) {
    return mapResult;
  }
  const reduceResult = await readAnd(flags.reduceResult, '--reduce-result', parseReduceResult);
  if (!reduceResult.ok) {
    return reduceResult;
  }
  // Zero --validate-result flags is VALID for a zero-cluster reduce (validate was
  // rightly skipped); metaRunDataFrom's coverage gate errs when clusters exist
  // without dispositions, naming each one.
  const validateResults = await readValidateResults(flags.validateResults);
  if (!validateResults.ok) {
    return validateResults;
  }
  return metaRunDataFrom({
    mapResult: mapResult.value,
    reduceResult: reduceResult.value,
    validateResults: validateResults.value,
  });
}

async function deriveReduceRunData(flags: CliFlags): Promise<Result<ReduceRunData, Error>> {
  const mapResult = await readAnd(flags.mapResult, '--map-result', parseMapResult);
  if (!mapResult.ok) {
    return mapResult;
  }
  return reduceRunDataFrom(mapResult.value);
}

/** Derive and RE-VALIDATE the stage's run data from checkpoint file paths named in `flags`. */
export async function deriveRunData(flags: CliFlags): Promise<Result<StageRunData, Error>> {
  if (flags.stage === 'map') {
    return deriveMapRunData(flags);
  }
  if (flags.stage === 'reduce') {
    const derived = await deriveReduceRunData(flags);
    return derived.ok ? parseReduceRunData(derived.value) : derived;
  }
  if (flags.stage === 'validate') {
    const derived = await deriveValidateRunData(flags);
    return derived.ok ? parseValidateRunData(derived.value) : derived;
  }
  const derived = await deriveMetaRunData(flags);
  return derived.ok ? parseMetaRunData(derived.value) : derived;
}
