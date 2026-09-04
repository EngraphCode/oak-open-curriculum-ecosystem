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
 * decision (`evaluateDeployConfigValidation`), the configuration preflight
 * (`preflightDeployConfig` — the boot-time verdicts that need no runtime)
 * and the runner (`runDeployConfigValidation`). The executable entry
 * `run-validate-deploy-config.ts` is the build's composition root and only
 * supplies `process.env`, the package root and stdout. Enforcement is scoped
 * to Vercel builds (the `VERCEL` system env is always present there); local
 * builds lack the deploy environment by design and are skipped with an
 * explicit line, never silently.
 */

import { err, ok, type Result } from '@oaknational/result';
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
    message: 'deploy configuration is valid: the deployed server will boot with this environment',
  };
}

/** The environment seam the preflight reads: injected, never `process.env` here. */
export interface DeployConfigPreflightInput {
  /** The environment to resolve from (the build's, or a test fixture). */
  readonly processEnv: NodeJS.ProcessEnv;
  /** Where env-file resolution starts (the package root on a real build). */
  readonly startDir: string;
}

/**
 * The boot-time configuration verdicts that need no runtime, in boot order:
 * the env schema and the product-analytics bootstrap (`loadRuntimeConfig`,
 * the deploy entry's first step) and the Sentry configuration parse
 * (`parseHttpSentryConfig`, the pure half of `createHttpObservability`).
 * Not exercised, by design: SDK initialisation and the analytics client —
 * runtime composition, not configuration.
 *
 * @param input - The environment and env-file start directory.
 * @returns Ok when the deployed server would boot on this configuration.
 */
export function preflightDeployConfig(
  input: DeployConfigPreflightInput,
): Result<void, { readonly message: string }> {
  const loaded = loadRuntimeConfig(input);

  if (!loaded.ok) {
    return err({ message: loaded.error.message });
  }

  const sentryConfig = parseHttpSentryConfig(loaded.value.runtimeConfig);

  if (!sentryConfig.ok) {
    return err({ message: describeHttpObservabilityError(sentryConfig.error) });
  }

  return ok(undefined);
}

/** The runner's seams: the environment, the env-file start directory and the build-log sink. */
export interface RunDeployConfigValidationInput extends DeployConfigPreflightInput {
  /** Receives the one verdict line the build log shows. */
  readonly writeLine: (line: string) => void;
}

/**
 * The whole gate behind one seam: read the Vercel flag from the injected
 * environment, decide, print the verdict line, return the exit code.
 *
 * @param input - The environment, start directory and line sink.
 * @returns The process exit code the entry sets.
 */
export function runDeployConfigValidation(input: RunDeployConfigValidationInput): 0 | 1 {
  const vercel = input.processEnv['VERCEL'];
  const verdict = evaluateDeployConfigValidation({
    isVercelBuild: typeof vercel === 'string' && vercel.length > 0,
    loadConfig: () =>
      preflightDeployConfig({ processEnv: input.processEnv, startDir: input.startDir }),
  });

  input.writeLine(verdict.message);

  return verdict.exitCode;
}
