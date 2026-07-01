/**
 * Composition root: verify every corpus-analysis workflow artefact on each build.
 *
 * @remarks
 * Bundles every registered stage UNSEEDED (the run-data sentinel) through the shared
 * build core and enforces the full output contract in memory — so `pnpm build` proves
 * each stage still bundles into a valid harness artefact, without writing run scripts
 * nobody should launch. Seeded, launchable artefacts are written only by
 * `build-run-artefact.ts` from validated checkpoint data. This file is the single
 * process boundary: failures become a non-zero exit.
 *
 * @packageDocumentation
 */

import { buildStageArtefact, STAGE_DEFINITIONS } from './workflow-builder.js';

let failed = false;

for (const stage of STAGE_DEFINITIONS) {
  const outcome = await buildStageArtefact({ stage });
  if (outcome.ok) {
    process.stdout.write(
      `verified ${stage.name} (${outcome.value.length} chars, contract green, unseeded)\n`,
    );
  } else {
    process.stderr.write(`${outcome.error.message}\n`);
    failed = true;
  }
}

if (failed) {
  process.exitCode = 1;
}
