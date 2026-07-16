/**
 * Composition root: verify every corpus-analysis workflow artefact on each build.
 *
 * @remarks
 * Passes this module's config + stage registry to the shared verification runner
 * (`src/workflow-build/run-verification-build.ts`). This file is the single process
 * boundary: failures become a non-zero exit.
 *
 * @packageDocumentation
 */

import { runVerificationBuild } from '../../../workflow-build/run-verification-build.js';
import { BUILD_CONFIG, STAGE_DEFINITIONS } from './build-config.js';

const green = await runVerificationBuild({
  config: BUILD_CONFIG,
  stages: STAGE_DEFINITIONS,
  writeOut: (line) => process.stdout.write(line),
  writeErr: (line) => process.stderr.write(line),
});

if (!green) {
  process.exitCode = 1;
}
