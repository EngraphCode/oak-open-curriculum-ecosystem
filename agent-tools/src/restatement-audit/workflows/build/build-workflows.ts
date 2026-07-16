/**
 * Composition root: verify every restatement-audit workflow artefact on each build.
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

/** The full usage block the agent-tools help contract requires (README §CLI help contract). */
const USAGE = `Usage: pnpm build:restatement-audit-workflows [--help]

Verify every restatement-audit workflow artefact (map, reduce, validate, meta):
builds each unseeded artefact, checks the output contract (including the
known-bad canary), and exits non-zero on any failure. Takes no flags other
than --help.

Example:
  pnpm build:restatement-audit-workflows
`;

const args = process.argv.slice(2);
if (args.includes('--help')) {
  process.stdout.write(USAGE);
} else if (args.length > 0) {
  process.stderr.write(`Unknown argument(s): ${args.join(' ')}\n\n${USAGE}`);
  process.exitCode = 1;
} else {
  const green = await runVerificationBuild({
    config: BUILD_CONFIG,
    stages: STAGE_DEFINITIONS,
    writeOut: (line) => process.stdout.write(line),
    writeErr: (line) => process.stderr.write(line),
  });

  if (!green) {
    process.exitCode = 1;
  }
}
