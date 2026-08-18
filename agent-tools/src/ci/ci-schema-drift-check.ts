/**
 * Advisory CI check: compares the committed OpenAPI schema cache against
 * the live upstream spec and renders ONE verdict onto every signal surface —
 * a GitHub Actions warning annotation (drift only), a step-summary line
 * (both verdicts), and an informational commit status (both verdicts).
 * Always exits 0 — this is informational, not blocking.
 *
 * The multi-surface shape is the 2026-08-18 cure: the annotation alone fired
 * correctly on every drifted build while no PR/commit surface carried
 * anything, and a real 0.7.0→0.11.0 drift was found by a live smoke test
 * instead of this sensor. A signal must land on a surface its consumer
 * actually reads.
 *
 * The upstream swagger endpoint is public, so no authentication is required
 * for the fetch; the commit-status POST uses the workflow-provided token and
 * degrades to a notice when absent or refused (fork PRs carry a read-only
 * token by design).
 *
 * @packageDocumentation
 */

import { appendFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { resolveRepoRoot } from '../core/repo-root.js';

import { buildSchemaDriftReport, type SchemaDriftReport } from './ci-schema-drift-report.js';

const SCHEMA_URL = 'https://open-api.thenational.academy/api/v0/swagger.json';
const CACHE_PATH = resolve(
  resolveRepoRoot(import.meta.url),
  'packages/sdks/oak-sdk-codegen/schema-cache/api-schema-original.json',
);
const CACHE_FILE_ANNOTATION =
  'file=packages/sdks/oak-sdk-codegen/schema-cache/api-schema-original.json';

/** The commit-status context under which the drift verdict appears on the PR/commit checks surface. */
const STATUS_CONTEXT = 'schema-drift (advisory)';

/**
 * Abort the advisory upstream fetch after this long. Pre-push runs this check
 * non-blocking, but a stalled connection (offline, captive portal, proxy) would
 * otherwise hang the fetch and block the push regardless of `|| true`, which only
 * catches a non-zero exit after the request returns.
 */
const SCHEMA_FETCH_TIMEOUT_MS = 5000;

function writeLine(message: string): void {
  process.stdout.write(`${message}\n`);
}

async function fetchLiveSchema(): Promise<string | null> {
  const response = await fetch(SCHEMA_URL, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(SCHEMA_FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    writeLine(
      `::notice::Schema drift check skipped — upstream returned HTTP ${String(response.status)}.`,
    );
    return null;
  }

  const liveJson: unknown = await response.json();
  return JSON.stringify(liveJson, undefined, 2);
}

async function readCachedSchema(): Promise<string | null> {
  try {
    return await readFile(CACHE_PATH, 'utf8');
  } catch {
    writeLine(`::warning ${CACHE_FILE_ANNOTATION}::Schema cache file not found.`);
    return null;
  }
}

/**
 * Append the verdict line to the workflow's step summary. Env-gated: local and
 * pre-push runs (no `GITHUB_STEP_SUMMARY`) skip silently and keep today's
 * stdout-only behaviour.
 */
async function appendStepSummary(report: SchemaDriftReport): Promise<void> {
  const summaryPath = process.env['GITHUB_STEP_SUMMARY'];
  if (summaryPath === undefined || summaryPath === '') {
    return;
  }
  try {
    await appendFile(summaryPath, `${report.summaryMarkdown}\n`, 'utf8');
  } catch (error) {
    writeLine(`::notice::Schema drift step summary not written: ${String(error)}`);
  }
}

/**
 * Publish the verdict as an informational commit status (state always
 * `success` — an advisory must never block or read as failure; the
 * DESCRIPTION carries the verdict). Env-gated to CI: requires the token, the
 * repository, and the target sha, which the workflow supplies — on PR events
 * the PR HEAD sha, so the status lands on the PR's checks surface rather
 * than the unrendered merge commit. Any refusal (fork PRs carry a read-only
 * token) degrades to a notice, never a failure.
 */
interface CommitStatusTarget {
  readonly token: string;
  readonly repository: string;
  readonly sha: string;
}

/** The workflow-supplied status target, or undefined outside CI (local/pre-push runs). */
function commitStatusTarget(): CommitStatusTarget | undefined {
  const token = process.env['GH_TOKEN'] ?? '';
  const repository = process.env['GITHUB_REPOSITORY'] ?? '';
  const sha = process.env['DRIFT_STATUS_SHA'] ?? '';
  return token === '' || repository === '' || sha === '' ? undefined : { token, repository, sha };
}

async function postCommitStatus(report: SchemaDriftReport): Promise<void> {
  const target = commitStatusTarget();
  if (target === undefined) {
    return;
  }
  const { token, repository, sha } = target;

  try {
    const response = await fetch(`https://api.github.com/repos/${repository}/statuses/${sha}`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        state: 'success',
        context: STATUS_CONTEXT,
        description: report.statusDescription,
      }),
      signal: AbortSignal.timeout(SCHEMA_FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      writeLine(
        `::notice::Schema drift status not published — GitHub returned HTTP ${String(response.status)}.`,
      );
    }
  } catch (error) {
    writeLine(`::notice::Schema drift status not published: ${String(error)}`);
  }
}

async function main(): Promise<void> {
  let liveText: string | null;

  try {
    liveText = await fetchLiveSchema();
  } catch (error) {
    writeLine(
      `::notice::Schema drift check skipped — failed to fetch upstream schema: ${String(error)}`,
    );
    return;
  }

  if (liveText === null) {
    return;
  }

  const cachedText = await readCachedSchema();

  if (cachedText === null) {
    return;
  }

  const report = buildSchemaDriftReport(cachedText, liveText);

  if (report.annotation === undefined) {
    writeLine('Schema cache is up to date with the live upstream spec.');
  } else {
    writeLine(report.annotation);
  }

  await appendStepSummary(report);
  await postCommitStatus(report);
}

try {
  await main();
} catch (error) {
  process.stdout.write(`::notice::Schema drift check failed unexpectedly: ${String(error)}\n`);
}
