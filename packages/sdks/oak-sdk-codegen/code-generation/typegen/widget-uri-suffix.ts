import { createHash } from 'node:crypto';

/**
 * Injected environment values consumed by {@link resolveWidgetUriSuffix}.
 *
 * Mirrors the Vercel system environment variables `VERCEL`,
 * `VERCEL_GIT_COMMIT_SHA`, and `VERCEL_DEPLOYMENT_ID`; injection keeps the
 * resolver pure and fully unit-testable without any `process.env` read in
 * tests. This module is deliberately environment-free — the one
 * `process.env` composition point lives in `cross-domain-constants.ts` —
 * so importing it never evaluates ambient state
 * (`no-global-state-in-tests`).
 */
export interface WidgetUriEnvironment {
  readonly vercel: string | undefined;
  readonly gitCommitSha: string | undefined;
  readonly deploymentId: string | undefined;
}

/**
 * Treats empty or whitespace-only values as absent.
 *
 * Vercel exposes non-applicable system environment variables as empty
 * strings (e.g. git variables on non-git CLI deploys), so a bare `??`
 * fallback would silently hash the empty string. Mirrors the semantics of
 * `trimToUndefined` in `packages/core/build-metadata` (`git-sha.ts`), the
 * repo's canonical build-SHA boundary resolver — consolidation of the two
 * copies to one canonical owner is routed as the named lane MCP-196 per
 * `consolidate-at-second-consumer` (path 2).
 */
function trimToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed === '' ? undefined : trimmed;
}

/**
 * Resolves the widget URI cache-busting suffix for the current build.
 *
 * Deterministic per build: `local` off Vercel; on Vercel, the first 8 hex
 * characters of sha256 of the build identifier — the git commit SHA when
 * present, else the deployment ID. On the commit-SHA path, same code keeps
 * the same URI across redeploys (the widget bundle is a pure function of
 * the commit — no environment reads exist in `widget/vite.config.ts`). The
 * deployment-ID fallback (non-git deploys only) guarantees per-DEPLOYMENT
 * uniqueness instead: each deploy mints a fresh ID, so on that path the
 * URI changes with every deploy. Every identifier this resolver reads is
 * part of the `sdk-codegen` turbo cache key (`env` — including
 * `VERCEL_DEPLOYMENT_ID`), so a cached artefact is only ever restored for
 * identical generator inputs; same-commit redeploys re-run codegen (the
 * deployment ID differs) yet re-derive the identical suffix from the
 * commit SHA. Any code change busts the host cache via a new URI. Hashing
 * (rather than a raw SHA prefix) keeps one uniform 8-hex shape across
 * both identifier kinds.
 *
 * Fails loud when a Vercel build carries no usable identifier: serving a
 * degraded constant URI would silently disable cache-busting, which the
 * MCP Apps standard gives no other lever to recover (see
 * `BASE_WIDGET_URI` in `cross-domain-constants.ts`). Unreachable under
 * Vercel's documented contract (`VERCEL=1` means system environment
 * variables are exposed, which includes the deployment ID) — verified per
 * deploy via the build log.
 *
 * @param environment - Injected Vercel system-environment values
 * @returns The URI suffix: `local`, or 8 lowercase hex characters
 */
export function resolveWidgetUriSuffix(environment: WidgetUriEnvironment): string {
  if (environment.vercel !== '1') {
    return 'local';
  }
  const buildId =
    trimToUndefined(environment.gitCommitSha) ?? trimToUndefined(environment.deploymentId);
  if (buildId === undefined) {
    throw new Error(
      'Widget URI cache-busting needs a per-build identifier on Vercel builds (VERCEL === "1"), ' +
        'but neither VERCEL_GIT_COMMIT_SHA nor VERCEL_DEPLOYMENT_ID carries a non-empty value. ' +
        'Both are Vercel system environment variables — check that "Enable access to System ' +
        'Environment Variables" is on for the project.',
    );
  }
  return createHash('sha256').update(buildId).digest('hex').slice(0, 8);
}
