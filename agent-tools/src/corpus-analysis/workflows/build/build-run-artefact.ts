/**
 * Build one SEEDED, launchable workflow artefact from committed checkpoint files.
 *
 * @remarks
 * The operator's launch tool. Reads the named checkpoint JSONs, re-parses them with the
 * zod stage contracts (strict validation at the Node boundary — the sandbox receives
 * only data that passed here), derives the stage's run data through the pipeline glue
 * (`run-inputs.ts` — partial-map refusal, grounding projection, resume-id derivation,
 * the merged-set meta gate), bundles the stage seeded, and writes
 * `dist/corpus-analysis/workflows/<stage>.workflow.seeded.mjs` for
 * `Workflow({scriptPath})`.
 *
 * Usage (cwd = the agent-tools workspace):
 *
 * ```bash
 * pnpm build-run-artefact --stage map --partition <partition.json>
 * pnpm build-run-artefact --stage reduce --map-result <leaves.json>
 * pnpm build-run-artefact --stage validate --map-result <leaves.json> \
 *   --reduce-result <candidates.json> --ceiling 30000000 [--validate-result <prior.json> ...]
 * pnpm build-run-artefact --stage meta --reduce-result <candidates.json> \
 *   --validate-result <dispositions.json> [--validate-result <tail.json> ...]
 * ```
 *
 * @packageDocumentation
 */

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

import { err, ok, type Result } from '@oaknational/result';

import type { ValidateResult } from '../stage-io.js';
import {
  parseMapResult,
  parseMapRunData,
  parseReduceResult,
  parseValidateResult,
} from '../stage-io.js';
import { metaRunDataFrom, reduceRunDataFrom, validateRunDataFrom } from '../run-inputs.js';
import { buildStageArtefact, STAGE_DEFINITIONS, WORKFLOW_OUT_DIR } from './workflow-builder.js';

interface CliFlags {
  readonly stage: string;
  readonly partition?: string;
  readonly mapResult?: string;
  readonly reduceResult?: string;
  readonly validateResults: readonly string[];
  readonly ceiling?: number;
}

async function readJson(filePath: string): Promise<Result<unknown, Error>> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return ok(JSON.parse(raw));
  } catch (cause) {
    return err(
      new Error(
        `Cannot read checkpoint ${filePath}: ${cause instanceof Error ? cause.message : String(cause)}`,
        {
          cause,
        },
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

async function deriveRunData(flags: CliFlags): Promise<Result<unknown, Error>> {
  if (flags.stage === 'map') {
    return readAnd(flags.partition, '--partition', parseMapRunData);
  }
  if (flags.stage === 'reduce') {
    const mapResult = await readAnd(flags.mapResult, '--map-result', parseMapResult);
    return mapResult.ok ? reduceRunDataFrom(mapResult.value) : mapResult;
  }
  if (flags.stage === 'validate') {
    return deriveValidateRunData(flags);
  }
  if (flags.stage === 'meta') {
    return deriveMetaRunData(flags);
  }
  return err(
    new Error(`Unknown stage "${flags.stage}" — expected map | reduce | validate | meta.`),
  );
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

async function deriveValidateRunData(flags: CliFlags): Promise<Result<unknown, Error>> {
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

async function deriveMetaRunData(flags: CliFlags): Promise<Result<unknown, Error>> {
  const reduceResult = await readAnd(flags.reduceResult, '--reduce-result', parseReduceResult);
  if (!reduceResult.ok) {
    return reduceResult;
  }
  if (flags.validateResults.length === 0) {
    return err(new Error('meta requires at least one --validate-result.'));
  }
  const validateResults = await readValidateResults(flags.validateResults);
  if (!validateResults.ok) {
    return validateResults;
  }
  return metaRunDataFrom({
    reduceResult: reduceResult.value,
    validateResults: validateResults.value,
  });
}

const { values } = parseArgs({
  options: {
    stage: { type: 'string' },
    partition: { type: 'string' },
    'map-result': { type: 'string' },
    'reduce-result': { type: 'string' },
    'validate-result': { type: 'string', multiple: true },
    ceiling: { type: 'string' },
  },
});

const flags: CliFlags = {
  stage: values.stage ?? '',
  partition: values.partition,
  mapResult: values['map-result'],
  reduceResult: values['reduce-result'],
  validateResults: values['validate-result'] ?? [],
  ceiling: values.ceiling === undefined ? undefined : Number(values.ceiling),
};

const stageDefinition = STAGE_DEFINITIONS.find((stage) => stage.name === flags.stage);
const runData =
  stageDefinition === undefined
    ? err(new Error(`Unknown stage "${flags.stage}" — expected map | reduce | validate | meta.`))
    : await deriveRunData(flags);

if (!runData.ok || stageDefinition === undefined) {
  process.stderr.write(`${runData.ok ? 'Unknown stage.' : runData.error.message}\n`);
  process.exitCode = 1;
} else {
  const artefact = await buildStageArtefact({ stage: stageDefinition, runData: runData.value });
  if (!artefact.ok) {
    process.stderr.write(`${artefact.error.message}\n`);
    process.exitCode = 1;
  } else {
    const outPath = path.join(WORKFLOW_OUT_DIR, `${flags.stage}.workflow.seeded.mjs`);
    await mkdir(WORKFLOW_OUT_DIR, { recursive: true });
    await writeFile(outPath, artefact.value, 'utf8');
    process.stdout.write(
      `seeded ${outPath} (${artefact.value.length} chars, contract green) — launch with Workflow({scriptPath}) from the repo root.\n`,
    );
  }
}
