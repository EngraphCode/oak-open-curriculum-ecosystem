/**
 * Pure report builder for the schema-drift signal. One verdict renders every
 * consuming surface — the `::warning` annotation, the step-summary line, and
 * the commit-status description — so the signal cannot fire on one surface
 * and silently miss another (the 2026-08-18 failure: the annotation fired on
 * every drifted build while no PR/commit surface carried anything, and the
 * 0.7.0→0.11.0 drift was found by a live smoke test instead).
 *
 * Side-effect-free (no fetch, no fs, no env) like its sibling
 * {@link file://./ci-schema-drift-eval.ts}; the runner owns all IO.
 *
 * @packageDocumentation
 */

import { isJsonObject } from '../core/json.js';

import { evaluateSchemaDrift } from './ci-schema-drift-eval.js';

/**
 * The commit-status API truncates descriptions beyond 140 characters; the
 * builder stays inside the limit so the API never truncates mid-verdict.
 */
export const STATUS_DESCRIPTION_LIMIT = 140;

const CACHE_FILE_ANNOTATION =
  'file=packages/sdks/oak-sdk-codegen/schema-cache/api-schema-original.json';

/** Everything the drift signal's surfaces render from. */
export interface SchemaDriftReport {
  readonly drifted: boolean;
  readonly cachedVersion: string;
  readonly liveVersion: string;
  /** GitHub Actions `::warning` line; absent when in sync (annotations are drift-only). */
  readonly annotation: string | undefined;
  /** One markdown line for `$GITHUB_STEP_SUMMARY` — BOTH verdicts get a line, so absence is never the signal. */
  readonly summaryMarkdown: string;
  /** Commit-status description, always within {@link STATUS_DESCRIPTION_LIMIT}. */
  readonly statusDescription: string;
}

function extractVersion(schemaText: string): string {
  try {
    const parsed: unknown = JSON.parse(schemaText);
    if (isJsonObject(parsed) && isJsonObject(parsed['info'])) {
      const version: unknown = parsed['info']['version'];
      if (typeof version === 'string') {
        return version;
      }
    }
  } catch {
    // fall through to the honest unknown
  }
  return 'unknown';
}

function truncateToLimit(text: string): string {
  return text.length <= STATUS_DESCRIPTION_LIMIT
    ? text
    : `${text.slice(0, STATUS_DESCRIPTION_LIMIT - 1)}…`;
}

/** Build the single drift verdict every signal surface renders from. */
export function buildSchemaDriftReport(cachedText: string, liveText: string): SchemaDriftReport {
  const cachedVersion = extractVersion(cachedText);
  const liveVersion = extractVersion(liveText);
  const { drifted } = evaluateSchemaDrift(cachedText, liveText);

  if (!drifted) {
    return {
      drifted,
      cachedVersion,
      liveVersion,
      annotation: undefined,
      summaryMarkdown: `✅ Schema cache in sync with the live upstream spec (version ${liveVersion}).`,
      statusDescription: truncateToLimit(`Schema cache in sync with upstream ${liveVersion}`),
    };
  }

  const versionNote =
    liveVersion === cachedVersion
      ? `Both are version ${liveVersion} but content differs (upstream may have changed without a version bump).`
      : `Cached: ${cachedVersion}, live: ${liveVersion}.`;

  return {
    drifted,
    cachedVersion,
    liveVersion,
    annotation: `::warning ${CACHE_FILE_ANNOTATION}::Schema cache has drifted from the live upstream spec. ${versionNote} Run \`pnpm sdk-codegen:refresh\` to update the cache and rebuild.`,
    summaryMarkdown: `⚠️ **Schema cache drifted from upstream.** ${versionNote} Run \`pnpm sdk-codegen:refresh\`.`,
    statusDescription: truncateToLimit(
      `Schema cache drifted: cached ${cachedVersion}, live ${liveVersion} — pnpm sdk-codegen:refresh`,
    ),
  };
}
