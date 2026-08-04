/**
 * Bulk-data freshness check over the bundle's `manifest.json`.
 *
 * Bulk DATA files are downloaded per-checkout and gitignored, while the
 * manifest and schema are TRACKED — so a clean checkout carries a manifest
 * whose listed data files are absent, and checkouts with data silently
 * diverge in vintage. The manifest's `downloadedAt` is the bundle's
 * vintage record (written by `scripts/download-bulk.ts`, which rewrites
 * the manifest with every download). Every consumer that reads bulk data
 * runs this check first: an unreadable or invalid manifest fails loud,
 * listed-but-absent data files fail loud (the tracked manifest cannot
 * vouch for data it ships without — presence only, never sizes: the
 * downloader stats the directory before writing the new manifest, so its
 * own size entry is stale by construction), data older than the named age
 * fails loud, and a fresh complete bundle surfaces its vintage for the
 * consumer to report.
 *
 * FS reading and the clock are injected for testability (ADR-078).
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { ok, err, type Result } from '@oaknational/result';

/**
 * Maximum accepted bulk-data age. Stale is strictly past this age: a
 * bundle downloaded exactly this many days ago still passes. The value
 * bounds how far a checkout's vintage can silently trail upstream before
 * ingest and ground-truth generation refuse to build on it.
 */
export const MAX_BULK_DATA_AGE_DAYS = 14;

/**
 * Tolerated forward clock skew between the downloader's clock and the
 * consumer's. A manifest dated further in the future than this fails as
 * invalid — an unbounded clamp would let a corrupt timestamp suppress
 * the staleness guard for an arbitrary period.
 */
const MAX_FUTURE_SKEW_MS = 5 * 60_000;

const MS_PER_DAY = 86_400_000;

/**
 * The manifest exactly as `scripts/download-bulk.ts` writes it. Strict on
 * every level: the writer and this reader live in the same repository and
 * change together, so shape drift is a defect to surface, not tolerate.
 */
const bulkManifestSchema = z
  .object({
    downloadedAt: z.iso.datetime(),
    source: z.string(),
    files: z.array(z.object({ file: z.string(), sizeBytes: z.number() }).strict()),
  })
  .strict();

/** Vintage facts surfaced to consumers on a fresh bundle. */
export interface BulkFreshness {
  /** ISO datetime the bundle was downloaded (verbatim from the manifest). */
  readonly downloadedAt: string;
  /** Whole days elapsed since download, clamped to zero on clock skew. */
  readonly ageDays: number;
}

/** Error from the bulk-data freshness check. */
export interface BulkFreshnessError {
  readonly type: 'manifest_missing' | 'manifest_invalid' | 'bulk_data_missing' | 'bulk_data_stale';
  readonly message: string;
}

/** Injected bundle readers; throws are reported as missing surfaces. */
export interface ManifestFsReader {
  readonly readFileSync: (path: string) => string;
  readonly readdirSync: (path: string) => string[];
}

/** The real-filesystem reader both production consumers use. */
export const nodeManifestFsReader: ManifestFsReader = {
  readFileSync: (path) => readFileSync(path, 'utf8'),
  readdirSync: (path) => readdirSync(path),
};

/** Inputs for the freshness check. */
interface CheckBulkDataFreshnessInputs {
  /** Resolved bulk-download directory containing `manifest.json`. */
  readonly bulkDir: string;
  /** The current time (injected; no ambient clock). */
  readonly now: Date;
  /** Injected reader (use real `readFileSync` in production). */
  readonly fs: ManifestFsReader;
}

/** Read and strictly parse the manifest; any read throw reports as missing. */
function readManifest(
  manifestPath: string,
  fs: ManifestFsReader,
): Result<z.infer<typeof bulkManifestSchema>, BulkFreshnessError> {
  let raw: string;
  try {
    raw = fs.readFileSync(manifestPath);
  } catch {
    return err({
      type: 'manifest_missing',
      message:
        `Bulk data manifest not readable: ${manifestPath}\n` +
        'The bundle has no recorded vintage, so its freshness cannot be verified. ' +
        'Run "pnpm bulk:download" to fetch a fresh bundle with its manifest.',
    });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return err({
      type: 'manifest_invalid',
      message:
        `Bulk data manifest is not valid JSON: ${manifestPath}\n` +
        'Run "pnpm bulk:download" to rewrite the bundle and its manifest.',
    });
  }

  const manifest = bulkManifestSchema.safeParse(parsed);
  if (!manifest.success) {
    return err({
      type: 'manifest_invalid',
      message:
        `Bulk data manifest does not match the downloader's shape: ${manifestPath}\n` +
        `${z.prettifyError(manifest.error)}\n` +
        'The manifest writer (scripts/download-bulk.ts) and this checker change together; ' +
        'run "pnpm bulk:download" or reconcile the shapes.',
    });
  }
  return ok(manifest.data);
}

/**
 * Check the bulk bundle's vintage against {@link MAX_BULK_DATA_AGE_DAYS}.
 *
 * @returns `ok({downloadedAt, ageDays})` for a fresh bundle, or
 * `err(BulkFreshnessError)` with an actionable message when the manifest
 * is unreadable, malformed, or the data is stale.
 */
/**
 * Verify every data file the manifest lists is present in the directory.
 * Presence only, never sizes — the manifest's own size entries are stale
 * by construction (the downloader stats before writing the manifest).
 */
function checkListedFilesPresent(
  bulkDir: string,
  files: readonly { readonly file: string }[],
  fs: ManifestFsReader,
): Result<true, BulkFreshnessError> {
  let present: Set<string>;
  try {
    present = new Set(fs.readdirSync(bulkDir));
  } catch {
    return err({
      type: 'bulk_data_missing',
      message:
        `Bulk download directory is not readable: ${bulkDir}\n` +
        'Run "pnpm bulk:download" to fetch the bundle.',
    });
  }
  const missing = files.map((entry) => entry.file).filter((file) => !present.has(file));
  if (missing.length > 0) {
    return err({
      type: 'bulk_data_missing',
      message:
        `Bulk data is absent: the manifest lists ${files.length} data file(s) but ` +
        `${missing.length} are missing from ${bulkDir} ` +
        `(first missing: ${missing.slice(0, 3).join(', ')}).\n` +
        'The manifest is tracked and travels with the repository; the data files are ' +
        'downloaded per-checkout. Run "pnpm bulk:download" to fetch them.',
    });
  }
  return ok(true);
}

export function checkBulkDataFreshness(
  input: CheckBulkDataFreshnessInputs,
): Result<BulkFreshness, BulkFreshnessError> {
  const manifestResult = readManifest(join(input.bulkDir, 'manifest.json'), input.fs);
  if (!manifestResult.ok) {
    return manifestResult;
  }

  const presence = checkListedFilesPresent(input.bulkDir, manifestResult.value.files, input.fs);
  if (!presence.ok) {
    return presence;
  }

  const { downloadedAt } = manifestResult.value;
  const elapsedMs = input.now.getTime() - new Date(downloadedAt).getTime();

  if (elapsedMs < -MAX_FUTURE_SKEW_MS) {
    return err({
      type: 'manifest_invalid',
      message:
        `Bulk data manifest is dated in the future: downloadedAt ${downloadedAt} is ` +
        `ahead of the current clock beyond the tolerated ` +
        `${MAX_FUTURE_SKEW_MS / 60_000}-minute skew.\n` +
        'A corrupt timestamp or a badly skewed downloader clock would otherwise ' +
        'suppress the staleness guard. Run "pnpm bulk:download" to rewrite the ' +
        'bundle and its manifest.',
    });
  }

  // Staleness compares EXACT elapsed time — the floored day-count is for
  // display only (comparing the floor would accept data until ~15 days).
  const ageDays = Math.max(0, Math.floor(elapsedMs / MS_PER_DAY));
  if (elapsedMs > MAX_BULK_DATA_AGE_DAYS * MS_PER_DAY) {
    return err({
      type: 'bulk_data_stale',
      message:
        `Bulk data is stale: downloaded ${downloadedAt} (${ageDays} days ago; ` +
        `the accepted maximum is ${MAX_BULK_DATA_AGE_DAYS} days).\n` +
        'Checkouts download bulk data independently, so this checkout has silently ' +
        'trailed upstream. Run "pnpm bulk:download" to refresh before ingesting or ' +
        'regenerating ground truths.',
    });
  }

  return ok({ downloadedAt, ageDays });
}
