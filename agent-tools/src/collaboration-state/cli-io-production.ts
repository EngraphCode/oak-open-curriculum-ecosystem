import { appendFile, mkdir, readFile } from 'node:fs/promises';

import { type ScopedContentBlockGroup } from '../hook-policy/types.js';
import { loadCommsConceptGateBlocks } from './comms-concept-gate.js';
import { filesystemLegacyCommsIo, migrateLegacyCommsDirectories } from './comms-migration.js';
import { type GitWorktree, readGitWorktrees } from './git-worktree-list.js';
import {
  readActiveClaimsFile,
  readClosedClaimsFile,
  readCommsEvents,
  readDirectedCommsMessages,
  writeCommsEvent,
} from './state-io.js';
import { writeTextFileAtomically } from './transaction.js';
import {
  type ClosedClaimsArchive,
  type CollaborationRegistry,
  type CommsEvent,
  type DirectedCommsMessage,
} from './types.js';

/**
 * The injected IO surface every collaboration-state CLI command runs
 * against. Production wires {@link productionIo}; tests wire fakes so no
 * command touches the real filesystem, git, or policy file.
 */
export interface CollaborationStateCliIo {
  readonly readActiveClaimsFile: (activePath: string) => Promise<CollaborationRegistry>;
  readonly readClosedClaimsFile: (closedPath: string) => Promise<ClosedClaimsArchive>;
  readonly writeCommsEvent: (input: {
    readonly commsDir: string;
    readonly event: CommsEvent;
    readonly nowIso: string;
  }) => Promise<void>;
  readonly readCommsEvents: (commsDir: string) => Promise<readonly CommsEvent[]>;
  readonly readWorktrees: (cwd: string) => Promise<readonly GitWorktree[]>;
  readonly readDirectedCommsMessages: (
    commsDir: string,
  ) => Promise<readonly DirectedCommsMessage[]>;
  readonly writeTextFile: (input: {
    readonly filePath: string;
    readonly text: string;
  }) => Promise<void>;
  readonly readTextFile: (filePath: string) => Promise<string>;
  readonly readSeenIds: (seenFile: string) => Promise<ReadonlySet<string>>;
  readonly appendSeenMessageIds: (seenFile: string, eventIds: readonly string[]) => Promise<void>;
  readonly migrateLegacyCommsDirectories: (input: {
    readonly eventsDir: string;
    readonly lifecycleDir: string;
    readonly messagesDir: string;
    readonly commsDir: string;
  }) => Promise<number>;
  readonly ensureDirectory: (directory: string) => Promise<void>;
  /**
   * Load the comms-gated PDR-044 concept blocks. Injected (rather than the
   * write paths reading the hook policy directly) so tests supply fixture
   * blocks and never couple to the live `.agent/hooks/policy.json` content;
   * the production implementation is the policy-file SSOT loader.
   */
  readonly loadCommsConceptGateBlocks: () => Promise<readonly ScopedContentBlockGroup[]>;
}

export const productionIo: CollaborationStateCliIo = {
  readActiveClaimsFile,
  readClosedClaimsFile,
  writeCommsEvent,
  readCommsEvents,
  // `async` so a throwing git read (cwd not in a git tree) rejects rather than
  // throwing synchronously at the call site, which would orphan a sibling read
  // in a `Promise.all`.
  readWorktrees: async (cwd) => readGitWorktrees(cwd),
  readDirectedCommsMessages,
  writeTextFile: (input) => writeTextFileAtomically(input),
  readTextFile: (filePath) => readFile(filePath, 'utf8'),
  readSeenIds: readSeenIdsFile,
  appendSeenMessageIds: appendSeenMessageIdsFile,
  migrateLegacyCommsDirectories: (input) =>
    migrateLegacyCommsDirectories(input, filesystemLegacyCommsIo),
  ensureDirectory: (directory) => mkdir(directory, { recursive: true }).then(() => undefined),
  loadCommsConceptGateBlocks: () => loadCommsConceptGateBlocks(),
};

async function readSeenIdsFile(seenFile: string): Promise<ReadonlySet<string>> {
  const text = await readFile(seenFile, 'utf8').catch(() => '');
  return new Set(text.split(/\r?\n/u).filter(Boolean));
}

async function appendSeenMessageIdsFile(
  seenFile: string,
  eventIds: readonly string[],
): Promise<void> {
  await appendFile(seenFile, `${eventIds.join('\n')}\n`);
}
