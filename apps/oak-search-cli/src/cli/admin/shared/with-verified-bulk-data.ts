/**
 * Bulk-data precondition gate for lifecycle ingest commands.
 *
 * Ingest builds a versioned index from a bulk bundle, so a bundle whose
 * vintage cannot be vouched for must stop the command BEFORE any resource
 * is created — no ES client, no OakClient, no lease. This gate resolves
 * the bulk directory, verifies the bundle's vintage, and validates the
 * ingest environment; only then does the handler run, with the resolved
 * directory passed in.
 *
 * Shaped as a higher-order wrapper mirroring `withEsClient` (subject,
 * handler, deps) so refusal is structural: a refused precondition returns
 * without ever calling the handler, rather than returning a flag the
 * caller might forget to check.
 *
 * Filesystem, clock, and reporters are injected (ADR-078); `now` is a
 * value read once at command entry.
 *
 * @see ADR-133 CLI Resource Lifecycle Management
 */

import type { Logger } from '@oaknational/logger/node';
import { sanitiseForJson } from '@oaknational/observability';
import { validateIngestEnv } from '../../shared/index.js';
import { resolveBulkDirFromInputs, type FsPredicates } from '../../shared/resolve-bulk-dir.js';
import { checkBulkDataFreshness, type ManifestFsReader } from '../../shared/bulk-freshness.js';

/** Bundle existence, listing, and manifest reading, all injected. */
export interface BulkDataGateFs extends FsPredicates, ManifestFsReader {}

/** Inputs for the bulk-data gate. */
export interface WithVerifiedBulkDataInput {
  /** Optional `--bulk-dir` CLI flag value. */
  readonly bulkDirFlag: string | undefined;
  /** Optional `BULK_DOWNLOAD_DIR` env value. */
  readonly bulkDirFromEnv: string | undefined;
  /** The Oak API key from the loaded CLI env (may be undefined). */
  readonly oakApiKey: string | undefined;
  /** App root used to resolve relative bulk-directory paths. */
  readonly appRoot: string;
  /** The current time (read once at command entry; no ambient clock). */
  readonly now: Date;
  /** Injected bundle filesystem. */
  readonly fs: BulkDataGateFs;
}

/** Injected dependencies for `withVerifiedBulkData`. */
export interface WithVerifiedBulkDataDeps {
  /** Structured logger for refusal output. */
  readonly logger: Logger;
  /** Human-readable error printer (chalk-formatted stderr). */
  readonly printError: (message: string) => void;
  /** Human-readable info printer (chalk-formatted stdout). */
  readonly printInfo: (message: string) => void;
  /** Exit code setter — composition root passes `(c) => { process.exitCode = c; }`. */
  readonly setExitCode: (code: number) => void;
}

/** Report a refused precondition on every channel and signal failure. */
function refuse(
  error: { readonly type: string; readonly message: string },
  deps: WithVerifiedBulkDataDeps,
): void {
  deps.logger.error(error.message, { error: sanitiseForJson(error) });
  deps.printError(error.message);
  deps.setExitCode(1);
}

/**
 * Run an ingest handler only once the bulk bundle is verified.
 *
 * Resolves the bulk directory, checks the bundle's vintage, and validates
 * the ingest environment. Any failed precondition is reported via `deps`
 * and the handler is never called.
 *
 * @param input - Bulk directory inputs, env key, clock, and filesystem
 * @param handler - The ingest body, receiving the resolved bulk directory
 * @param deps - Injected logger, printers, and exit-code setter
 */
export async function withVerifiedBulkData(
  input: WithVerifiedBulkDataInput,
  handler: (bulkDir: string) => Promise<void>,
  deps: WithVerifiedBulkDataDeps,
): Promise<void> {
  const bulkResult = resolveBulkDirFromInputs({
    bulkDirFlag: input.bulkDirFlag,
    bulkDirFromEnv: input.bulkDirFromEnv,
    appRoot: input.appRoot,
    fs: input.fs,
  });
  if (!bulkResult.ok) {
    refuse(bulkResult.error, deps);
    return;
  }

  const freshnessResult = checkBulkDataFreshness({
    bulkDir: bulkResult.value,
    now: input.now,
    fs: input.fs,
  });
  if (!freshnessResult.ok) {
    refuse(freshnessResult.error, deps);
    return;
  }

  const envResult = validateIngestEnv({ oakApiKey: input.oakApiKey });
  if (!envResult.ok) {
    refuse(envResult.error, deps);
    return;
  }

  deps.logger.info('Bulk data vintage verified', { ...freshnessResult.value });
  deps.printInfo(
    `Bulk data vintage: downloaded ${freshnessResult.value.downloadedAt} ` +
      `(${freshnessResult.value.ageDays} day(s) old)`,
  );

  await handler(bulkResult.value);
}
