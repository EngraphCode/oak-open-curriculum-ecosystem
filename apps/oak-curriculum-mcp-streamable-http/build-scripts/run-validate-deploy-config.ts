/**
 * Executable entry for the deploy-config validation gate (MCP-475).
 *
 * @remarks
 * Runs FIRST in the app's `build` script — before esbuild and the Sentry
 * build plugin — so an invalid deploy environment fails the build before
 * any release side effect. Composition root: the environment and the
 * package root are read once here and handed to
 * {@link runDeployConfigValidation}; everything decidable lives behind that
 * seam and is proven by `validate-deploy-config.integration.test.ts`.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runDeployConfigValidation } from './validate-deploy-config.js';

const packageRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

process.exitCode = runDeployConfigValidation({
  processEnv: process.env,
  startDir: packageRoot,
  writeLine: (line) => {
    process.stdout.write(`${line}\n`);
  },
});
