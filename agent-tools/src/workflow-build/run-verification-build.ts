/**
 * Shared verification-build runner: prove every registered stage still bundles into a
 * valid harness artefact.
 *
 * @remarks
 * Bundles every registered stage UNSEEDED (the run-data sentinel) through the build
 * core and enforces the full output contract in memory — so `pnpm build` proves each
 * stage still bundles, without writing run scripts nobody should launch. Seeded,
 * launchable artefacts are written only by each module's `build-run-artefact.ts` from
 * validated checkpoint data. Each module's `build-workflows.ts` entry is the process
 * boundary: it passes its config + registry here and turns the returned verdict into a
 * non-zero exit.
 *
 * @packageDocumentation
 */

import { checkHarnessArtefactContract } from './output-contract.js';
import {
  buildStageArtefact,
  type StageDefinition,
  type WorkflowBuildConfig,
} from './workflow-builder.js';

/**
 * Verify every stage; returns true when all green. Writes one verdict line per stage
 * (stdout on green, stderr on failure) via the injected writers so the caller stays the
 * only process boundary.
 */
export async function runVerificationBuild(input: {
  readonly config: WorkflowBuildConfig;
  readonly stages: readonly StageDefinition[];
  readonly writeOut: (line: string) => void;
  readonly writeErr: (line: string) => void;
}): Promise<boolean> {
  let green = true;

  // Contract canary: prove the REAL parser leg rejects a known-bad artefact (a
  // redeclared injected global + a dynamic import) before trusting the green verdicts
  // below. A green gate that cannot go red proves nothing.
  const canary = checkHarnessArtefactContract(
    'export const meta = {};\nlet log = 1;\nasync function main() {\n  return import("x");\n}\nreturn await main();\n',
  );
  if (canary.ok) {
    input.writeErr('output-contract canary FAILED: a known-bad artefact passed the contract\n');
    green = false;
  } else {
    input.writeOut('output-contract canary green (known-bad artefact rejected)\n');
  }

  for (const stage of input.stages) {
    const outcome = await buildStageArtefact({ config: input.config, stage });
    if (outcome.ok) {
      input.writeOut(
        `verified ${stage.name} (${outcome.value.length} chars, contract green, unseeded)\n`,
      );
    } else {
      input.writeErr(`${outcome.error.message}\n`);
      green = false;
    }
  }

  return green;
}
