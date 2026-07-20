import { mkdir, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { createCommsEvent } from './comms.js';
import { isErrnoCode } from './errno.js';
import {
  EMPTY_ACTIVE_CLAIMS_REGISTRY_JSON,
  EMPTY_CLOSED_CLAIMS_ARCHIVE_JSON,
  missingStateFileError,
} from './state-file-seeds.js';
import { validateCollaborationJsonFileText } from './collaboration-json-validation.js';
import {
  parseClosedClaimsArchive,
  parseCollaborationRegistry,
  parseCommsEvent,
} from './state-parsers.js';
import {
  createJsonFileAtomically,
  runJsonStateTransaction,
  updateJsonFileWithRetry,
  writeJsonFileWithinTransaction,
} from './transaction.js';
import {
  type ClosedClaimsArchive,
  type CollaborationRegistry,
  type CommsEvent,
  type DirectedCommsMessage,
} from './types.js';

export { parseClosedClaimsArchive, parseCollaborationRegistry } from './state-parsers.js';

/**
 * Read and parse the active claims registry.
 *
 * A missing file fails loud with seeding instructions rather than being
 * treated as an empty registry: silently tolerating absence would let a
 * wrong `--active` path masquerade as "no claims" (the F-41 decoy-path
 * failure class), while the fresh-checkout case genuinely needs the file
 * seeded once.
 */
export async function readActiveClaimsFile(activePath: string): Promise<CollaborationRegistry> {
  let text: string;
  try {
    text = await readFile(activePath, 'utf8');
  } catch (error) {
    if (isErrnoCode(error, 'ENOENT')) {
      throw missingStateFileError({
        label: 'active-claims registry',
        path: activePath,
        seedJson: EMPTY_ACTIVE_CLAIMS_REGISTRY_JSON,
        cause: error,
      });
    }
    throw error;
  }
  return parseCollaborationRegistry(text);
}

/**
 * Read and parse the closed claims archive. Missing-file handling mirrors
 * {@link readActiveClaimsFile}.
 */
export async function readClosedClaimsFile(closedPath: string): Promise<ClosedClaimsArchive> {
  let text: string;
  try {
    text = await readFile(closedPath, 'utf8');
  } catch (error) {
    if (isErrnoCode(error, 'ENOENT')) {
      throw missingStateFileError({
        label: 'closed-claims archive',
        path: closedPath,
        seedJson: EMPTY_CLOSED_CLAIMS_ARCHIVE_JSON,
        cause: error,
      });
    }
    throw error;
  }
  return parseClosedClaimsArchive(text);
}

/**
 * Append an immutable communication event to the canonical comms directory by
 * exclusive file create.
 */
export async function writeCommsEvent(input: {
  readonly commsDir: string;
  readonly event: CommsEvent;
  readonly nowIso: string;
}): Promise<void> {
  await mkdir(input.commsDir, { recursive: true });
  const existingIds = await listCommsEventIds(input.commsDir);
  const event = createCommsEvent(input.event, {
    nowIso: input.nowIso,
    existingEventIds: existingIds,
  });

  const path = eventPath(input.commsDir, event.event_id);
  await createJsonFileAtomically({
    filePath: path,
    value: event,
    validateText: async (text) => {
      parseCommsEvent(text);
      await validateCollaborationJsonFileText(path, text);
    },
  });
}

/**
 * Read all canonical immutable communication events from the unified comms
 * directory.
 */
export async function readCommsEvents(commsDir: string): Promise<readonly CommsEvent[]> {
  return readEventDirectory(commsDir, parseCommsEvent);
}

/**
 * Read all immutable directed communication messages from the canonical comms
 * directory.
 */
export async function readDirectedCommsMessages(
  commsDir: string,
): Promise<readonly DirectedCommsMessage[]> {
  return filterEvents(await readCommsEvents(commsDir), 'directed');
}

/**
 * Transactionally update the active claims registry.
 *
 * The pre-transaction read surfaces the fresh-checkout seeding error (see
 * {@link readActiveClaimsFile}) before the retry transaction's generic read
 * meets a bare ENOENT; the transaction still re-reads under its lock.
 */
export async function updateActiveClaimsFile(input: {
  readonly activePath: string;
  readonly transform: (registry: CollaborationRegistry) => CollaborationRegistry;
}): Promise<void> {
  await readActiveClaimsFile(input.activePath);
  await updateJsonFileWithRetry({
    filePath: input.activePath,
    parseText: parseCollaborationRegistry,
    validateText: (text) => validateActiveClaimsText(input.activePath, text),
    transform: input.transform,
    maxAttempts: 5,
  });
}

/**
 * Transactionally update the active and closed claim state together.
 */
export async function updateClaimStateFiles(input: {
  readonly activePath: string;
  readonly closedPath: string;
  readonly transform: (state: {
    readonly active: CollaborationRegistry;
    readonly closed: ClosedClaimsArchive;
  }) => {
    readonly active: CollaborationRegistry;
    readonly closed: ClosedClaimsArchive;
  };
}): Promise<void> {
  await runJsonStateTransaction({
    filePaths: [input.activePath, input.closedPath],
    operation: async () => {
      const active = await readActiveClaimsFile(input.activePath);
      const closed = await readClosedClaimsFile(input.closedPath);
      const next = input.transform({ active, closed });

      await writeJsonFileWithinTransaction({
        filePath: input.activePath,
        value: next.active,
        validateText: (text) => validateActiveClaimsText(input.activePath, text),
      });
      await writeJsonFileWithinTransaction({
        filePath: input.closedPath,
        value: next.closed,
        validateText: (text) => validateClosedClaimsText(input.closedPath, text),
      });
    },
  });
}

async function readEventDirectory<TEvent>(
  directory: string,
  parser: (text: string) => TEvent,
): Promise<readonly TEvent[]> {
  const filenames: readonly string[] = await readdir(directory);
  const events: TEvent[] = [];

  for (const filename of filenames
    .filter((entry) => entry.endsWith('.json'))
    .toSorted((left, right) => left.localeCompare(right))) {
    const path = join(directory, filename);
    try {
      const text = await readFile(path, 'utf8');
      const event = parser(text);
      await validateCollaborationJsonFileText(path, text);
      events.push(event);
    } catch (error) {
      throw new Error(
        `failed to parse collaboration JSON file ${path}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        { cause: error },
      );
    }
  }

  return events;
}

function listCommsEventIds(eventsDir: string): Promise<readonly string[]> {
  return readdir(eventsDir)
    .then((entries) =>
      entries
        .filter((entry) => entry.endsWith('.json'))
        .map((entry) => entry.slice(0, -'.json'.length)),
    )
    .catch(() => []);
}

function eventPath(eventsDir: string, eventId: string): string {
  return join(eventsDir, `${eventId}.json`);
}

async function validateActiveClaimsText(path: string, text: string): Promise<void> {
  parseCollaborationRegistry(text);
  await validateCollaborationJsonFileText(path, text);
}

async function validateClosedClaimsText(path: string, text: string): Promise<void> {
  parseClosedClaimsArchive(text);
  await validateCollaborationJsonFileText(path, text);
}

function filterEvents<TKind extends CommsEvent['kind']>(
  events: readonly CommsEvent[],
  kind: TKind,
): readonly Extract<CommsEvent, { readonly kind: TKind }>[] {
  return events.filter((event): event is Extract<CommsEvent, { readonly kind: TKind }> => {
    return event.kind === kind;
  });
}
