/**
 * One-time migration of a legacy active-claims file (schema_version 1.3.0,
 * carrying the flat `commit_queue` array) into the 1.4.0 split: live queue
 * entries move to the per-intent store, expired entries drop as ephemera,
 * and the claims file rewrites in the new shape with its claims rows carried
 * over value- and key-order-intact, re-serialised at the canonical two-space
 * format. REPLACE, never bridge: the runtime readers accept only
 * the new shape and route a legacy file through this migration on first
 * contact (owner ruling 2026-08-17, QUEUE-LOCAL).
 */
import { readFile } from 'node:fs/promises';

import { collect, err, flatMap, map, ok, unwrapOrThrow, type Result } from '@oaknational/result';
import { typeSafeEntries } from '@oaknational/type-helpers';

import { getJsonValue, isJsonObject, parseJsonTextResult } from '../core/json.js';
import { createCollaborationJsonSchemaValidator } from './collaboration-json-validation.js';
import { type CollaborationCommitQueueEntryDraft } from './commit-queue-entry-types.js';
import {
  commitQueueDirForActivePath,
  isCommitQueueEntryLive,
  writeCommitQueueEntry,
} from './commit-queue-store.js';
import { parseStrictCommitQueueEntryDraft } from './registry-entry-parser.js';
import { activeClaimsWriteValidator } from './state-io-write-validators.js';
import { runJsonStateTransaction, writeJsonFileWithinTransaction } from './transaction.js';
import { ACTIVE_CLAIMS_SCHEMA_VERSION, type CollaborationCommitQueueEntry } from './types.js';

/**
 * A legacy file is valid JSON at exactly schema_version 1.3.0 still carrying
 * a `commit_queue` array — the one shape this migration is defined over.
 * Malformed JSON is NOT legacy, and neither is any OTHER version: both flow
 * to the current parser's loud failure path unchanged (latest-only support;
 * a 1.1.0/1.2.0 file keeps its actionable version-pin rejection).
 */
export function isLegacyActiveClaimsText(text: string): boolean {
  const parsed = parseJsonTextResult(text, 'active-claims registry');
  return (
    parsed.ok &&
    isJsonObject(parsed.value) &&
    getJsonValue(parsed.value, 'schema_version') === '1.3.0' &&
    Array.isArray(getJsonValue(parsed.value, 'commit_queue'))
  );
}

interface LegacyActiveClaimsMigrationPlan {
  /** The rewritten claims file: new schema version, claims rows preserved. */
  readonly claimsFileValue: {
    readonly schema_version: typeof ACTIVE_CLAIMS_SCHEMA_VERSION;
    readonly claims: readonly unknown[];
  };
  /** Queue entries still live by TTL, bound for per-intent files. */
  readonly liveEntries: readonly CollaborationCommitQueueEntry[];
  /**
   * The same live rows as their RAW legacy JSON with the order key added:
   * exactly the file each is about to become, for the schema check that
   * must run before reconstruction.
   */
  readonly liveRawRows: readonly LiveRawRow[];
}

interface LiveRawRow {
  readonly index: number;
  readonly text: string;
}

/**
 * Pure migration decision over the legacy file's text. Claims rows pass
 * through as their raw parsed values (content-preservation: this migration
 * moves the queue, it does not audit claims); queue entries parse strictly
 * so a row that cannot be represented in the store fails loudly instead of
 * being silently dropped.
 */
function planLegacyActiveClaimsMigration(input: {
  readonly text: string;
  readonly path: string;
  readonly nowIso: string;
}): Result<LegacyActiveClaimsMigrationPlan, Error> {
  return flatMap(parseJsonTextResult(input.text, input.path), (parsed) => {
    if (!isJsonObject(parsed)) {
      return err(new Error(`${input.path} must contain a JSON object`));
    }
    const commitQueue: unknown = getJsonValue(parsed, 'commit_queue');
    const claims = getJsonValue(parsed, 'claims');
    if (!Array.isArray(commitQueue) || !Array.isArray(claims)) {
      return err(
        new Error(
          `${input.path} is not a legacy registry: claims and commit_queue arrays required`,
        ),
      );
    }

    // Queue-row parse failures carry the file path, matching the store's
    // path-labelled convention: this failure names a machine-local file the
    // operator must find, and the parser's message alone does not say which.
    const parsedRows = collect(Array.from(commitQueue, parseStrictCommitQueueEntryDraft));
    if (!parsedRows.ok) {
      return err(new Error(`${input.path} commit_queue: ${parsedRows.error.message}`));
    }
    const entries = parsedRows.value;
    // Spread, never reconstruct: every sibling write preserves unrecognised
    // top-level fields so the write gate can refuse them loudly, and the
    // migration is not the one write allowed to drop them in silence.
    const preservedTopLevel = Object.fromEntries(
      typeSafeEntries(parsed).filter(([key]) => key !== 'commit_queue'),
    );
    return flatMap(planLiveQueueEntries(entries, input), (liveEntries) =>
      map(liveRawRows(commitQueue, liveEntries, input.path), (rawRows) => ({
        claimsFileValue: {
          ...preservedTopLevel,
          schema_version: ACTIVE_CLAIMS_SCHEMA_VERSION,
          claims,
        },
        liveEntries,
        liveRawRows: rawRows,
      })),
    );
  });
}

/**
 * The parser RECONSTRUCTS known fields, so an unknown key or an ill-typed
 * optional field on a live legacy row would be destroyed by the migration
 * in silence; the raw row (with its order key) is kept for a schema check
 * against the exact file it becomes. Expired rows drop as ephemera and are
 * not judged.
 */
function liveRawRows(
  rawRows: readonly unknown[],
  liveEntries: readonly CollaborationCommitQueueEntry[],
  path: string,
): Result<readonly LiveRawRow[], Error> {
  return collect(
    liveEntries.map((entry) => {
      const raw = rawRows[entry.queued_seq];
      if (!isJsonObject(raw)) {
        return err(new Error(`${path} commit_queue[${entry.queued_seq}]: entries must be objects`));
      }
      return ok({
        index: entry.queued_seq,
        text: JSON.stringify({ ...raw, queued_seq: entry.queued_seq }),
      });
    }),
  );
}

/**
 * The legacy schema declared the ARRAY order to BE the queue order, so the
 * index is the order key. It is taken before the liveness filter, so dropping
 * an expired row leaves a gap rather than promoting the rows behind it past
 * each other; `queued_seq` is relative, and gaps are as ordered as a dense
 * run. The legacy array never required unique ids (its enqueue appended),
 * while the store publishes one file per id: two live rows sharing an id
 * would land on one filename and the later would silently replace the
 * earlier, so the plan refuses before any file is written.
 */
function planLiveQueueEntries(
  rows: readonly CollaborationCommitQueueEntryDraft[],
  input: { readonly path: string; readonly nowIso: string },
): Result<readonly CollaborationCommitQueueEntry[], Error> {
  const liveEntries = rows
    .map((entry, index) => ({ ...entry, queued_seq: index }))
    .filter((entry) => isCommitQueueEntryLive(entry, input.nowIso));
  const seen = new Set<string>();
  for (const entry of liveEntries) {
    if (seen.has(entry.intent_id)) {
      return err(
        new Error(
          `${input.path} commit_queue: two live entries share intent_id ${entry.intent_id}; ` +
            `the per-intent store keeps one file per id, so the file cannot migrate until ` +
            `one of them is removed by hand`,
        ),
      );
    }
    seen.add(entry.intent_id);
  }
  return ok(liveEntries);
}

/**
 * Execute the migration under the claims file's transaction lock. The text
 * is re-read and re-detected inside the lock, so a concurrent reader that
 * migrated first turns this call into a no-op instead of a double-write.
 */
export async function migrateLegacyActiveClaimsFile(input: {
  readonly activePath: string;
  readonly nowIso: string;
}): Promise<void> {
  await runJsonStateTransaction({
    filePaths: [input.activePath],
    operation: async () => {
      const text = await readFile(input.activePath, 'utf8');
      if (!isLegacyActiveClaimsText(text)) {
        return;
      }
      const plan = unwrapOrThrow(
        planLegacyActiveClaimsMigration({
          text,
          path: input.activePath,
          nowIso: input.nowIso,
        }),
      );

      // Strict at the boundary: each live raw row must satisfy the intent
      // schema as the file it is about to become, BEFORE reconstruction
      // can drop what the parser does not read.
      const validator = await createCollaborationJsonSchemaValidator();
      for (const row of plan.liveRawRows) {
        const validated = validator.validateText('commit-queue-intent.schema.json', row.text);
        if (!validated.ok) {
          unwrapOrThrow(
            err(
              new Error(
                `${input.activePath} commit_queue[${row.index}]: ${validated.error.message}`,
              ),
            ),
          );
        }
      }

      const queueDir = commitQueueDirForActivePath(input.activePath);
      for (const entry of plan.liveEntries) {
        await writeCommitQueueEntry({ queueDir, entry, nowIso: input.nowIso });
      }
      await writeJsonFileWithinTransaction({
        filePath: input.activePath,
        value: plan.claimsFileValue,
        validateText: activeClaimsWriteValidator(input.activePath),
      });
    },
  });
}
