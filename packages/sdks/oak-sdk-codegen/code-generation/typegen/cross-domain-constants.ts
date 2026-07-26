import { createHash } from 'node:crypto';

/**
 * Injected environment values consumed by {@link resolveWidgetUriSuffix}.
 *
 * Mirrors the Vercel system environment variables `VERCEL`,
 * `VERCEL_GIT_COMMIT_SHA`, and `VERCEL_DEPLOYMENT_ID`; injection keeps the
 * resolver pure and fully unit-testable without any `process.env` read in
 * tests.
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
 * repo's canonical build-SHA boundary resolver — mirrored rather than
 * imported because this generation-time package carries no dependency on
 * that runtime workspace.
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
 * the commit — no environment reads exist in `widget/vite.config.ts`); the
 * deployment-ID fallback guarantees only per-build uniqueness
 * (`VERCEL_DEPLOYMENT_ID` is deliberately excluded from the turbo cache
 * key — `passThroughEnv`, not `env` — so same-code redeploys may reuse the
 * cached artefact rather than regenerating per deploy). Any code
 * change busts the host cache via a new URI. Hashing (rather than a raw
 * SHA prefix) keeps one uniform 8-hex shape across both identifier kinds.
 *
 * Fails loud when a Vercel build carries no usable identifier: serving a
 * degraded constant URI would silently disable cache-busting, which the
 * MCP Apps standard gives no other lever to recover (see
 * {@link BASE_WIDGET_URI}). Unreachable under Vercel's documented contract
 * (`VERCEL=1` means system environment variables are exposed, which
 * includes the deployment ID) — verified per deploy via the build log.
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

/**
 * Base widget URI with a deterministic per-build cache-busting suffix.
 *
 * Generated at sdk-codegen time so every consumer — the tool definitions
 * advertising `_meta.ui.resourceUri` and the app's served-surface
 * registration — derives from this one constant.
 *
 * URI identity is the only cache-invalidation lever the MCP Apps standard
 * gives a server: hosts MAY prefetch and cache `ui://` resource content,
 * and the standard defines no invalidation, freshness, or versioning
 * mechanism — so a changed URI is what forces hosts to reload the widget
 * bundle instead of serving a stale cached copy.
 *
 * Format: ui://widget/oak-curriculum-app-<suffix>.html
 * Example: ui://widget/oak-curriculum-app-abc12345.html
 *
 * @see https://modelcontextprotocol.io/extensions/apps/overview (MCP Apps standard)
 */
export const BASE_WIDGET_URI = `ui://widget/oak-curriculum-app-${resolveWidgetUriSuffix({
  vercel: process.env.VERCEL,
  gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA,
  deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
})}.html`;

/**
 * Tools that should advertise a widget UI via `_meta.ui.resourceUri`.
 *
 * Only allowlisted **names** emit `_meta.ui.resourceUri` in codegen and in
 * aggregated tool definitions. Other tools must not include `resourceUri`
 * in `_meta.ui` (even if they use `_meta.ui.visibility` for app-only helpers).
 *
 * Tools in this set get `_meta.ui.resourceUri` in their codegen output
 * and in aggregated definitions.
 *
 * @see https://modelcontextprotocol.io/extensions/apps/overview (MCP Apps standard)
 */
export const WIDGET_TOOL_NAMES: ReadonlySet<string> = new Set([
  'get-curriculum-model',
  'user-search',
]);
