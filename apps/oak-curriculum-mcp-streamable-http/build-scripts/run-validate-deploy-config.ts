/**
 * Executable entry for the deploy-config validation gate (MCP-475).
 *
 * @remarks
 * Runs at the end of the app's `build` script. Composition root: the
 * environment snapshot and working directory are read once here and
 * injected into the pure gate
 * ({@link evaluateDeployConfigValidation})
 * and the server's own resolver (`loadRuntimeConfig` — the exact
 * composition the deploy entry runs at first request). A refusal here
 * is the same refusal the deployed function would throw; surfacing it
 * at build time is the whole point.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveEnv } from '@oaknational/env-resolution';
import { z } from 'zod';
import { loadRuntimeConfig } from '../src/runtime-config.js';
import { evaluateDeployConfigValidation } from './validate-deploy-config.js';

const packageRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

/** The one build-system value this entry reads: Vercel sets `VERCEL=1` in every build. */
const BuildSystemEnvSchema = z.object({
  VERCEL: z.string().optional(),
});

const buildEnv = resolveEnv({
  schema: BuildSystemEnvSchema,
  processEnv: process.env,
  startDir: packageRoot,
});

if (!buildEnv.ok) {
  process.stdout.write(
    `deploy-config validation could not read the build environment: ${buildEnv.error.message}\n`,
  );
  process.exitCode = 1;
} else {
  const vercel = buildEnv.value.VERCEL;
  const verdict = evaluateDeployConfigValidation({
    isVercelBuild: typeof vercel === 'string' && vercel.length > 0,
    loadConfig: () => loadRuntimeConfig({ processEnv: process.env, startDir: packageRoot }),
  });

  process.stdout.write(`${verdict.message}\n`);
  process.exitCode = verdict.exitCode;
}
