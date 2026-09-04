/**
 * Deploy-config validation gate for Vercel builds (MCP-475).
 *
 * @remarks
 * The Vercel required status check's predicate is "build + deploy
 * completed", but this app resolves its runtime configuration lazily at
 * first request — so an invalid environment value used to ship a
 * deployment that 500s on every route while the check stayed green
 * (the 2026-07-31 preview outage). This gate runs the server's OWN
 * configuration resolution during the build, so an invalid deploy
 * environment turns the Vercel build red instead of shipping a
 * boot-dead function.
 *
 * Everything decidable lives here behind injectable seams: the pure
 * decision (`evaluateDeployConfigValidation`), the environment filter
 * (`filterDeployGateEnv`), the configuration preflight
 * (`preflightDeployConfig` — the boot-time verdicts that need no runtime)
 * and the runner (`runDeployConfigValidation`). The executable entry
 * `run-validate-deploy-config.ts` is the build's composition root and only
 * supplies `process.env` and the two output sinks. Enforcement is scoped to
 * Vercel builds (the `VERCEL` system env is always present there); local
 * builds lack the deploy environment by design and are skipped with an
 * explicit line, never silently.
 *
 * The four clauses of the gate's execution contract (the deploy-config plan
 * node): always executed, never cached — the orchestration side, a
 * non-cacheable Turbo task the build depends on, proven by the contract
 * test beside this module; narrow import, filtered credentials — the gate
 * imports the runtime-config composition module directly and sees only
 * the validated variables; explicit deployment environment — the rehearsal
 * reads the process environment alone, never `.env` files; output
 * discipline — the verdict lines carry key names and refusal text, never
 * values, proven by the secrets test.
 */

import { err, ok, type Result } from '@oaknational/result';
import { HTTP_ENV_KEYS } from '../src/env.js';
import { describeHttpObservabilityError } from '../src/observability/http-observability-error.js';
import { parseHttpSentryConfig } from '../src/observability/http-sentry-config.js';
import { loadRuntimeConfig } from '../src/runtime-config.js';

/** The gate's decision: an exit code and the line to print. */
export interface DeployConfigVerdict {
  /** Process exit code: 0 = build proceeds, 1 = build fails. */
  readonly exitCode: 0 | 1;
  /** Human-readable outcome line for the build log. */
  readonly message: string;
}

/** Input seam: build-environment flag plus the config-loading thunk. */
export interface DeployConfigValidationInput {
  /** True when running inside a Vercel build (`VERCEL` env present). */
  readonly isVercelBuild: boolean;
  /**
   * Loads the runtime configuration. Only invoked for Vercel builds —
   * local builds must not require deploy environment values.
   */
  readonly loadConfig: () => Result<unknown, { readonly message: string }>;
}

/**
 * Decide whether the build proceeds, fails, or skips the gate.
 *
 * @param input - The build-environment flag and config-loading thunk.
 * @returns The verdict with exit code and build-log line.
 */
export function evaluateDeployConfigValidation(
  input: DeployConfigValidationInput,
): DeployConfigVerdict {
  if (!input.isVercelBuild) {
    return {
      exitCode: 0,
      message:
        'deploy-config validation skipped: not a Vercel build (VERCEL env absent; local builds lack deploy environment values by design)',
    };
  }

  const loaded = input.loadConfig();

  if (!loaded.ok) {
    return {
      exitCode: 1,
      message: `deploy configuration is invalid — failing the build so this cannot ship as a boot-dead deployment: ${loaded.error.message}`,
    };
  }

  return {
    exitCode: 0,
    message:
      'deploy configuration is valid: the environment resolves and the observability configuration parses (runtime initialisation — the Sentry SDK and the analytics client — is not exercised here)',
  };
}

/**
 * The variables the gate is allowed to see: exactly the validated surface.
 * Build-only credentials the platform injects (a Sentry auth token, a
 * remote-cache token) are outside it, so the gate process's reachable
 * secret set is the validated set and nothing more.
 */
export const DEPLOY_GATE_ENV_KEYS: readonly string[] = HTTP_ENV_KEYS;

/**
 * A start directory that exists nowhere: env-file resolution walks up from
 * it, finds no repository root and loads no `.env` file, so the rehearsal
 * reads the process environment alone — Vercel's deployment condition,
 * with no local file precedence able to change the verdict.
 */
export const DEPLOY_REHEARSAL_START_DIR = '/deploy-config-gate-rehearsal';

/**
 * Keep only the validated variables of an environment.
 *
 * @param env - The environment to filter (the build's, or a fixture).
 * @returns A fresh environment carrying the validated keys that were set.
 */
export function filterDeployGateEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const filtered: Record<string, string> = {};
  for (const key of DEPLOY_GATE_ENV_KEYS) {
    const value = env[key];
    if (typeof value === 'string') {
      filtered[key] = value;
    }
  }
  return filtered;
}

/** The environment seam the preflight reads: injected, never `process.env` here. */
export interface DeployConfigPreflightInput {
  /** The (already filtered) environment to resolve from. */
  readonly processEnv: NodeJS.ProcessEnv;
}

/**
 * The boot-time configuration verdicts that need no runtime, in boot order:
 * the env schema and the product-analytics bootstrap (`loadRuntimeConfig`,
 * the deploy entry's first step) and the Sentry configuration parse
 * (`parseHttpSentryConfig`, the pure half of `createHttpObservability`).
 * Not exercised, by design: SDK initialisation and the analytics client —
 * runtime composition, not configuration.
 *
 * @param input - The environment to rehearse.
 * @returns Ok when the deployed server's configuration resolves.
 */
export function preflightDeployConfig(
  input: DeployConfigPreflightInput,
): Result<void, { readonly message: string }> {
  const loaded = loadRuntimeConfig({
    processEnv: input.processEnv,
    startDir: DEPLOY_REHEARSAL_START_DIR,
  });

  if (!loaded.ok) {
    return err({ message: loaded.error.message });
  }

  const sentryConfig = parseHttpSentryConfig(loaded.value.runtimeConfig);

  if (!sentryConfig.ok) {
    return err({ message: describeHttpObservabilityError(sentryConfig.error) });
  }

  return ok(undefined);
}

/** The runner's seams: the environment and the two build-log sinks. */
export interface RunDeployConfigValidationInput {
  /** The build's environment; the runner filters it to the validated keys. */
  readonly processEnv: NodeJS.ProcessEnv;
  /** Receives the verdict line when the build proceeds (pass or skip). */
  readonly writeOut: (line: string) => void;
  /** Receives the verdict line when the build fails. */
  readonly writeErr: (line: string) => void;
}

/**
 * The whole gate behind one seam: filter the environment to the validated
 * surface, read the Vercel flag, decide, print the verdict line to the sink
 * the outcome belongs on, return the exit code.
 *
 * @param input - The environment and the two line sinks.
 * @returns The process exit code the entry sets.
 */
export function runDeployConfigValidation(input: RunDeployConfigValidationInput): 0 | 1 {
  const env = filterDeployGateEnv(input.processEnv);
  const vercel = env['VERCEL'];
  const verdict = evaluateDeployConfigValidation({
    isVercelBuild: typeof vercel === 'string' && vercel.length > 0,
    loadConfig: () => preflightDeployConfig({ processEnv: env }),
  });

  if (verdict.exitCode === 0) {
    input.writeOut(verdict.message);
  } else {
    input.writeErr(verdict.message);
  }

  return verdict.exitCode;
}
