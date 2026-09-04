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
 * Pure decision logic only — the executable entry is
 * `run-validate-deploy-config.ts`, which composes the real `loadRuntimeConfig` at the build's
 * composition root. Enforcement is scoped to Vercel builds (the
 * `VERCEL` system env is always present there); local builds lack the
 * deploy environment by design and are skipped with an explicit line,
 * never silently.
 */

import type { Result } from '@oaknational/result';

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
