/**
 * Build one SEEDED, launchable workflow artefact from committed checkpoint files.
 *
 * @remarks
 * Mirrors `corpus-analysis/workflows/build/build-run-artefact.ts`. Argv parsing and the
 * write live here; checkpoint-read + pipeline-glue + boundary re-parse live in
 * `derive-stage-run-data.ts` (file-length discipline). Writes
 * `dist/restatement-audit/workflows/<stage>.workflow.seeded.mjs` for
 * `Workflow({scriptPath})`.
 *
 * Usage (cwd = the agent-tools workspace):
 *
 * ```bash
 * pnpm restatement-audit-build-run-artefact --stage map --partition <partition.json> --gazetteer <gazetteer.v1.json>
 * pnpm restatement-audit-build-run-artefact --stage reduce --map-result <instances.json>
 * pnpm restatement-audit-build-run-artefact --stage validate --map-result <instances.json> \
 *   --reduce-result <clusters.json> --ceiling 5000000 [--validate-result <prior.json> ...]
 * pnpm restatement-audit-build-run-artefact --stage meta --map-result <instances.json> \
 *   --reduce-result <clusters.json> --validate-result <dispositions.json> [--validate-result <tail.json> ...]
 * ```
 *
 * @packageDocumentation
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

import { err, ok, type Result } from '@oaknational/result';

import { deriveRunData, type CliFlags, type StageRunData } from './derive-stage-run-data.js';
import { buildStageArtefact, STAGE_DEFINITIONS, WORKFLOW_OUT_DIR } from './workflow-builder.js';

function parseCliFlags(): Result<CliFlags, Error> {
  try {
    const { values } = parseArgs({
      options: {
        stage: { type: 'string' },
        partition: { type: 'string' },
        gazetteer: { type: 'string' },
        'map-result': { type: 'string' },
        'reduce-result': { type: 'string' },
        'validate-result': { type: 'string', multiple: true },
        ceiling: { type: 'string' },
      },
    });
    return ok({
      stage: values.stage ?? '',
      partition: values.partition,
      gazetteer: values.gazetteer,
      mapResult: values['map-result'],
      reduceResult: values['reduce-result'],
      validateResults: values['validate-result'] ?? [],
      ceiling: values.ceiling === undefined ? undefined : Number(values.ceiling),
    });
  } catch (cause) {
    return err(
      new Error(`Invalid flags: ${cause instanceof Error ? cause.message : String(cause)}`, {
        cause,
      }),
    );
  }
}

async function resolveRunData(): Promise<
  Result<{ stage: (typeof STAGE_DEFINITIONS)[number]; data: StageRunData }, Error>
> {
  const flags = parseCliFlags();
  if (!flags.ok) {
    return flags;
  }
  const stage = STAGE_DEFINITIONS.find((definition) => definition.name === flags.value.stage);
  if (stage === undefined) {
    return err(
      new Error(`Unknown stage "${flags.value.stage}" — expected map | reduce | validate | meta.`),
    );
  }
  const data = await deriveRunData(flags.value);
  return data.ok ? ok({ stage, data: data.value }) : data;
}

const resolved = await resolveRunData();

if (resolved.ok) {
  const artefact = await buildStageArtefact({
    stage: resolved.value.stage,
    runData: resolved.value.data,
  });
  if (artefact.ok) {
    const outPath = path.join(WORKFLOW_OUT_DIR, `${resolved.value.stage.name}.workflow.seeded.mjs`);
    await mkdir(WORKFLOW_OUT_DIR, { recursive: true });
    await writeFile(outPath, artefact.value, 'utf8');
    process.stdout.write(
      `seeded ${outPath} (${artefact.value.length} chars, contract green) — launch with Workflow({scriptPath}) from the repo root.\n`,
    );
  } else {
    process.stderr.write(`${artefact.error.message}\n`);
    process.exitCode = 1;
  }
} else {
  process.stderr.write(`${resolved.error.message}\n`);
  process.exitCode = 1;
}
