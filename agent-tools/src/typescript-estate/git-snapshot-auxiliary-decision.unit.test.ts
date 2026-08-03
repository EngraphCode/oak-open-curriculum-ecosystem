import { err, ok } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { EstateReviewError } from './errors.js';
import {
  applyAuxiliaryBlobFetch,
  decideAuxiliaryBlobRead,
  type AuxiliaryBlobCacheState,
} from './git-snapshot-auxiliary-decision.js';
import type { GitSnapshotLimits, RegularBlobTreeEntry } from './git-snapshot-model.js';

const LIMITS: GitSnapshotLimits = {
  maxTrackedPaths: 20,
  maxTreeListingBytes: 4096,
  maxGitStderrBytes: 1024,
  maxTotalSourceBytes: 4096,
  maxSourceBytesPerFile: 1024,
  maxTotalAuxiliaryBlobBytes: 8,
  maxAuxiliaryBlobBytesPerFile: 4,
};

const REGULAR_ENTRY: RegularBlobTreeEntry = {
  mode: '100644',
  type: 'blob',
  object: 'a'.repeat(40),
  size: 3,
};

const EMPTY_CACHE: AuxiliaryBlobCacheState = {
  entries: [],
  chargedBytes: 0,
  terminalError: null,
};

const FETCH_ACTION = {
  path: 'config.json',
  treeEntry: REGULAR_ENTRY,
  maxBytes: 4,
} as const;

describe('auxiliary blob read decision', () => {
  it('emits a fetch action only after a successful budget preflight', () => {
    const decision = decideAuxiliaryBlobRead({
      path: 'config.json',
      trackedEntry: REGULAR_ENTRY,
      isTypescriptPath: false,
      capturedSource: undefined,
      cache: EMPTY_CACHE,
      limits: LIMITS,
    });

    expect(decision).toEqual({
      kind: 'fetch-required',
      action: FETCH_ACTION,
    });
  });

  it('applies one successful fetch as a defensive, hashed, charged cache transition', () => {
    const bytes = Uint8Array.from([0x61, 0x62, 0x63]);
    const transition = applyAuxiliaryBlobFetch(EMPTY_CACHE, FETCH_ACTION, ok(bytes));
    bytes[0] = 0;

    expect(transition.state).toMatchObject({ chargedBytes: 3, terminalError: null });
    expect(transition.state.entries).toHaveLength(1);
    expect(transition.result).toEqual(
      ok({
        path: 'config.json',
        treeEntry: REGULAR_ENTRY,
        bytes: Uint8Array.from([0x61, 0x62, 0x63]),
        byteCount: 3,
        contentSha256: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
      }),
    );
  });

  it('latches an operational fetch failure without changing the cache charge', () => {
    const failure = new EstateReviewError('SOURCE_READ_FAILED', 'read failed');

    const transition = applyAuxiliaryBlobFetch(EMPTY_CACHE, FETCH_ACTION, err(failure));

    expect(transition.state).toEqual({
      entries: [],
      chargedBytes: 0,
      terminalError: failure,
    });
    expect(transition.result).toEqual(err(failure));
  });
});
