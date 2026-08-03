/**
 * Executable entry for the deploy-config validation gate (MCP-475).
 *
 * @remarks
 * Runs at the end of the app's `build` script. Composition root: the
 * environment snapshot and working directory are read once here and
 * injected into the pure gate
 * ({@link ./validate-deploy-config.ts | evaluateDeployConfigValidation})
 * and the server's own resolver (`loadRuntimeConfig` — the exact
 * composition the deploy entry runs at first request). A refusal here
 * is the same refusal the deployed function would throw; surfacing it
 * at build time is the whole point.
 */

import { loadRuntimeConfig } from '../src/runtime-config.js';
import { evaluateDeployConfigValidation } from './validate-deploy-config.js';

const processEnv = process.env;
const startDir = process.cwd();

const verdict = evaluateDeployConfigValidation({
  isVercelBuild: typeof processEnv['VERCEL'] === 'string' && processEnv['VERCEL'].length > 0,
  loadConfig: () => loadRuntimeConfig({ processEnv, startDir }),
});

process.stdout.write(`${verdict.message}\n`);
process.exitCode = verdict.exitCode;
