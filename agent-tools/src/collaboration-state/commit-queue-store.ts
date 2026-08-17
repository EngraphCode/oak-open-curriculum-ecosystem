/**
 * The machine-local per-intent commit-queue store (owner ruling 2026-08-17,
 * rulings ledger row QUEUE-LOCAL): one JSON file per intent at
 * `.agent/state/collaboration/commit-queue/<intent-id>.json`, mirroring the
 * comms event store's file conventions (id-named files, atomic validated
 * writes, loud path-labelled parse failures). Queue state is ephemera —
 * never in version control (the collaboration-state ignore file covers the
 * directory), expiring one hour after its last write (`updated_at`).
 *
 * TTL discipline: reads treat an expired file as absent; every write
 * operation sweeps (deletes) the expired files it encounters. Deletion is
 * correct here by owner definition — TTL-expired queue state is ephemera,
 * not work. `expires_at` is stored for view parity and always derives as
 * `updated_at` plus exactly the TTL; the liveness decision reads
 * `updated_at`, never the stored derivative.
 */
import { mkdir, readdir, readFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { unwrapOrThrow } from '@oaknational/result';

import { failureAsError } from '../core/failure-as-error.js';
import { isErrnoCode } from './errno.js';
import { parseCommitQueueIntentText } from './registry-entry-parser.js';
import { commitQueueIntentWriteValidator } from './state-io-write-validators.js';
import { writeJsonFileWithinTransaction } from './transaction.js';
import { type CollaborationCommitQueueEntry } from './types.js';

/** Queue entries expire one hour after their last write (owner ruling). */
export const COMMIT_QUEUE_TTL_SECONDS = 3600;

const COMMIT_QUEUE_DIRNAME = 'commit-queue';

/** The store directory is the claims file's `commit-queue/` sibling. */
export function commitQueueDirForActivePath(activePath: string): string {
  return join(dirname(activePath), COMMIT_QUEUE_DIRNAME);
}

/** The derived view-parity expiry: `updated_at` plus exactly the TTL. */
export function commitQueueEntryExpiresAt(updatedAtIso: string): string {
  return new Date(Date.parse(updatedAtIso) + COMMIT_QUEUE_TTL_SECONDS * 1000).toISOString();
}

/**
 * Liveness by TTL: live up to and including one TTL after `updated_at`
 * (matching the pre-split `secondsUntilExpiry >= 0` boundary), expired
 * strictly after it.
 */
export function isCommitQueueEntryLive(
  entry: CollaborationCommitQueueEntry,
  nowIso: string,
): boolean {
  return Date.parse(nowIso) <= Date.parse(entry.updated_at) + COMMIT_QUEUE_TTL_SECONDS * 1000;
}

/**
 * Read every live intent in the store, ordered by (queued_at, intent_id) —
 * the FIFO order the flat registry's append order expressed. Expired files
 * are treated as absent (never deleted here: reads do not write). A missing
 * directory is an empty queue: unlike the claims file, the store directory
 * legitimately does not exist until the first enqueue.
 */
export async function readCommitQueueEntries(input: {
  readonly queueDir: string;
  readonly nowIso: string;
}): Promise<readonly CollaborationCommitQueueEntry[]> {
  const entries: CollaborationCommitQueueEntry[] = [];
  for (const filename of await listIntentFilenames(input.queueDir)) {
    const entry = await readIntentFile(input.queueDir, filename);
    if (entry !== undefined && isCommitQueueEntryLive(entry, input.nowIso)) {
      entries.push(entry);
    }
  }

  return entries.toSorted(compareQueueOrder);
}

/** Read one intent by id; absent and expired files both read as undefined. */
export async function readCommitQueueEntry(input: {
  readonly queueDir: string;
  readonly intentId: string;
  readonly nowIso: string;
}): Promise<CollaborationCommitQueueEntry | undefined> {
  const entry = await readIntentFile(input.queueDir, `${input.intentId}.json`);
  return entry !== undefined && isCommitQueueEntryLive(entry, input.nowIso) ? entry : undefined;
}

/**
 * Create or rewrite one intent file atomically, sweeping expired peers first
 * (the lazy sweep every write operation owes). `expires_at` is recomputed
 * from the entry's `updated_at` so the stored derivative can never disagree
 * with the TTL clock.
 */
export async function writeCommitQueueEntry(input: {
  readonly queueDir: string;
  readonly entry: CollaborationCommitQueueEntry;
  readonly nowIso: string;
}): Promise<void> {
  await mkdir(input.queueDir, { recursive: true });
  await sweepExpiredCommitQueueEntries({ queueDir: input.queueDir, nowIso: input.nowIso });
  const entry: CollaborationCommitQueueEntry = {
    ...input.entry,
    expires_at: commitQueueEntryExpiresAt(input.entry.updated_at),
  };
  const filePath = join(input.queueDir, `${entry.intent_id}.json`);
  await writeJsonFileWithinTransaction({
    filePath,
    value: entry,
    validateText: commitQueueIntentWriteValidator(filePath),
  });
}

/** Delete one intent file, sweeping expired peers (a write operation). */
export async function deleteCommitQueueEntry(input: {
  readonly queueDir: string;
  readonly intentId: string;
  readonly nowIso: string;
}): Promise<void> {
  await rm(join(input.queueDir, `${input.intentId}.json`), { force: true });
  await sweepExpiredCommitQueueEntries({ queueDir: input.queueDir, nowIso: input.nowIso });
}

/**
 * Delete every expired intent file in the store. Corrupt files fail loudly
 * rather than being swept: only a file that provably carries a TTL-expired
 * entry is ephemera by the owner's definition.
 */
export async function sweepExpiredCommitQueueEntries(input: {
  readonly queueDir: string;
  readonly nowIso: string;
}): Promise<void> {
  for (const filename of await listIntentFilenames(input.queueDir)) {
    const entry = await readIntentFile(input.queueDir, filename);
    if (entry !== undefined && !isCommitQueueEntryLive(entry, input.nowIso)) {
      await rm(join(input.queueDir, filename), { force: true });
    }
  }
}

/**
 * Read one listed intent file; a file deleted between the directory listing
 * and this read (a concurrent locked complete or sweep racing an unlocked
 * reader) reads as undefined — a deleted file is simply an absent entry.
 * Every OTHER failure (a corrupt file above all) stays loud.
 */
async function readIntentFile(
  queueDir: string,
  filename: string,
): Promise<CollaborationCommitQueueEntry | undefined> {
  let text: string;
  try {
    text = await readFile(join(queueDir, filename), 'utf8');
  } catch (error) {
    const failure = failureAsError(error, 'the commit-queue store read boundary');
    if (isErrnoCode(failure, 'ENOENT')) {
      return undefined;
    }
    throw failure;
  }
  return parseIntentFileText(queueDir, filename, text);
}

function parseIntentFileText(
  queueDir: string,
  filename: string,
  text: string,
): CollaborationCommitQueueEntry {
  const path = join(queueDir, filename);
  const entry = unwrapOrThrow(parseCommitQueueIntentText(text, path));
  // Filenames are `<intent_id>.json` (the comms-store convention): the id is
  // known from the listing alone, and delete-by-id depends on the equality.
  if (`${entry.intent_id}.json` !== filename) {
    throw new Error(
      `commit-queue intent file ${path} carries intent_id ${entry.intent_id}, ` +
        `which disagrees with its filename`,
    );
  }
  return entry;
}

async function listIntentFilenames(queueDir: string): Promise<readonly string[]> {
  let filenames: readonly string[];
  try {
    filenames = await readdir(queueDir);
  } catch (error) {
    const failure = failureAsError(error, 'the commit-queue store list boundary');
    if (isErrnoCode(failure, 'ENOENT')) {
      return [];
    }
    throw failure;
  }

  return filenames
    .filter((filename) => filename.endsWith('.json'))
    .toSorted((left, right) => left.localeCompare(right));
}

function compareQueueOrder(
  left: CollaborationCommitQueueEntry,
  right: CollaborationCommitQueueEntry,
): number {
  const byQueuedAt = Date.parse(left.queued_at) - Date.parse(right.queued_at);
  if (byQueuedAt !== 0) {
    return byQueuedAt;
  }
  return left.intent_id.localeCompare(right.intent_id);
}
