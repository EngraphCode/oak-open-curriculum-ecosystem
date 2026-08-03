import { createHash } from 'node:crypto';

import { err, isErr, ok, type Result } from '@oaknational/result';

import type { AuxiliaryReadRecord } from './document-model.js';
import {
  type AuxiliaryBlobReadRefusal,
  EstateReviewError,
  MissingAuxiliaryBlobRefusal,
  NonRegularAuxiliaryBlobRefusal,
} from './errors.js';
import type {
  AuxiliaryBlobRead,
  AuxiliaryBlobReadObservation,
  GitContext,
  GitSnapshotAuxiliaryReader,
  GitSnapshotLimits,
  RegularBlobTreeEntry,
  SnapshotSource,
  TrackedTreeEntry,
} from './git-snapshot-model.js';
import { runGit } from './git-snapshot-process.js';
import type { RepoPath } from './scalar-model.js';

interface CreateAuxiliaryReaderInput {
  readonly context: GitContext;
  readonly commit: string;
  readonly treeEntries: readonly TrackedTreeEntry[];
  readonly sources: readonly SnapshotSource[];
  readonly limits: GitSnapshotLimits;
}

type CachedBlob = Omit<AuxiliaryBlobRead, 'byteCount'>;
type CapturedSourceBytes = Pick<CachedBlob, 'bytes' | 'contentSha256'>;

export function createAuxiliaryBlobReader(
  input: CreateAuxiliaryReaderInput,
): GitSnapshotAuxiliaryReader {
  return new RunScopedAuxiliaryBlobReader(input);
}

class RunScopedAuxiliaryBlobReader implements GitSnapshotAuxiliaryReader {
  readonly #context: GitContext;
  readonly #commit: string;
  readonly #treeEntries: readonly TrackedTreeEntry[];
  readonly #typescriptPaths: ReadonlySet<RepoPath>;
  readonly #typescriptBytes: ReadonlyMap<RepoPath, CapturedSourceBytes>;
  readonly #limits: GitSnapshotLimits;
  readonly #cache = new Map<RepoPath, CachedBlob>();
  #chargedBytes = 0;
  #terminalError: EstateReviewError | undefined;

  constructor(input: CreateAuxiliaryReaderInput) {
    this.#context = input.context;
    this.#commit = input.commit;
    this.#treeEntries = input.treeEntries.map(({ path, treeEntry }) => ({
      path,
      treeEntry: { ...treeEntry },
    }));
    this.#typescriptPaths = new Set(input.sources.map(({ path }) => path));
    this.#typescriptBytes = captureSourceBytes(input.sources);
    this.#limits = { ...input.limits };
  }

  read(path: RepoPath): Result<AuxiliaryBlobRead, EstateReviewError | AuxiliaryBlobReadRefusal> {
    if (this.#terminalError !== undefined) {
      return err(this.#terminalError);
    }
    const tracked = findTrackedEntry(this.#treeEntries, path);
    if (tracked === undefined) {
      return err(new MissingAuxiliaryBlobRefusal(path));
    }
    if (!isRegularBlob(tracked.treeEntry)) {
      return err(new NonRegularAuxiliaryBlobRefusal(path, tracked.treeEntry));
    }
    const cached = this.#cache.get(path);
    const result = this.#typescriptPaths.has(path)
      ? this.#readCapturedSource(path, tracked.treeEntry)
      : cached === undefined
        ? this.#readAndCache(path, tracked.treeEntry)
        : ok(publicRead(cached));
    if (isErr(result)) {
      this.#terminalError = result.error;
    }
    return result;
  }

  ledger(): Result<readonly AuxiliaryReadRecord[], EstateReviewError> {
    return this.#terminalError === undefined
      ? ok(
          this.#orderedCache().map((cached) => ({
            path: cached.path,
            treeEntry: { ...cached.treeEntry },
            byteCount: cached.bytes.byteLength,
            contentSha256: cached.contentSha256,
          })),
        )
      : err(this.#terminalError);
  }

  observations(): Result<readonly AuxiliaryBlobReadObservation[], EstateReviewError> {
    return this.#terminalError === undefined
      ? ok(
          this.#orderedCache().map((cached) => ({
            path: cached.path,
            treeEntry: { ...cached.treeEntry },
            bytes: Uint8Array.from(cached.bytes),
          })),
        )
      : err(this.#terminalError);
  }

  #readCapturedSource(
    path: RepoPath,
    treeEntry: RegularBlobTreeEntry,
  ): Result<AuxiliaryBlobRead, EstateReviewError> {
    const captured = this.#typescriptBytes.get(path);
    return captured === undefined
      ? err(
          new EstateReviewError(
            'SNAPSHOT_INVALID',
            `regular TypeScript source '${path}' has no captured bytes`,
          ),
        )
      : ok(publicRead({ path, treeEntry, ...captured }));
  }

  #readAndCache(
    path: RepoPath,
    treeEntry: RegularBlobTreeEntry,
  ): Result<AuxiliaryBlobRead, EstateReviewError> {
    const budget = preflightBudget(path, treeEntry.size, this.#chargedBytes, this.#limits);
    if (isErr(budget)) {
      return budget;
    }
    const bytes = runGit(
      this.#context,
      ['-C', this.#context.root, 'show', `${this.#commit}:${path}`],
      this.#limits.maxAuxiliaryBlobBytesPerFile,
      'SOURCE_READ_FAILED',
      `Git auxiliary blob read '${path}'`,
    );
    if (isErr(bytes)) {
      return bytes;
    }
    if (bytes.value.byteLength !== treeEntry.size) {
      return err(
        new EstateReviewError(
          'SNAPSHOT_INVALID',
          `Git tree size and auxiliary bytes differ for '${path}'`,
        ),
      );
    }
    const internalBytes = Uint8Array.from(bytes.value);
    const cached: CachedBlob = {
      path,
      treeEntry: { ...treeEntry },
      bytes: internalBytes,
      contentSha256: createHash('sha256').update(internalBytes).digest('hex'),
    };
    this.#cache.set(path, cached);
    this.#chargedBytes += cached.bytes.byteLength;
    return ok(publicRead(cached));
  }

  #orderedCache(): readonly CachedBlob[] {
    return [...this.#cache.values()].sort((left, right) =>
      left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
    );
  }
}

function preflightBudget(
  path: RepoPath,
  size: number,
  chargedBytes: number,
  limits: GitSnapshotLimits,
): Result<undefined, EstateReviewError> {
  if (size > limits.maxAuxiliaryBlobBytesPerFile) {
    return err(
      new EstateReviewError(
        'RESOURCE_LIMIT',
        `auxiliary blob '${path}' exceeds the per-file byte limit ${String(limits.maxAuxiliaryBlobBytesPerFile)}`,
      ),
    );
  }
  const remaining = limits.maxTotalAuxiliaryBlobBytes - chargedBytes;
  return size <= remaining
    ? ok(undefined)
    : err(
        new EstateReviewError(
          'RESOURCE_LIMIT',
          `auxiliary blob '${path}' exceeds the remaining run-wide byte budget ${String(remaining)}`,
        ),
      );
}

function captureSourceBytes(
  sources: readonly SnapshotSource[],
): ReadonlyMap<RepoPath, CapturedSourceBytes> {
  const captured = new Map<RepoPath, CapturedSourceBytes>();
  for (const source of sources) {
    if ('bytes' in source) {
      captured.set(source.path, {
        bytes: Uint8Array.from(source.bytes),
        contentSha256: source.read.contentSha256,
      });
    }
  }
  return captured;
}

function findTrackedEntry(
  entries: readonly TrackedTreeEntry[],
  path: RepoPath,
): TrackedTreeEntry | undefined {
  let low = 0;
  let high = entries.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const candidate = entries[middle];
    if (candidate?.path === path) {
      return candidate;
    }
    if ((candidate?.path ?? '') < path) {
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return undefined;
}

function isRegularBlob(entry: TrackedTreeEntry['treeEntry']): entry is RegularBlobTreeEntry {
  return (
    entry.type === 'blob' &&
    (entry.mode === '100644' || entry.mode === '100755') &&
    entry.size !== null
  );
}

function publicRead(cached: CachedBlob): AuxiliaryBlobRead {
  return {
    path: cached.path,
    treeEntry: { ...cached.treeEntry },
    bytes: Uint8Array.from(cached.bytes),
    byteCount: cached.bytes.byteLength,
    contentSha256: cached.contentSha256,
  };
}
