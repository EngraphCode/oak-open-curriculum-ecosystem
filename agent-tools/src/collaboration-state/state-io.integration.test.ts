import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { unwrapErr, unwrapOrThrow } from '@oaknational/result';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  EMPTY_ACTIVE_CLAIMS_REGISTRY_JSON,
  EMPTY_CLOSED_CLAIMS_ARCHIVE_JSON,
} from './state-file-seeds.js';
import {
  readActiveClaimsFile,
  readClosedClaimsFile,
  updateActiveClaimsFile,
  updateClaimStateFiles,
} from './state-io.js';

// On a fresh checkout or new worktree the collaboration-state files are
// untracked-by-design (ADR-199 / PDR-094), so the very first CLI invocation
// that reads them meets ENOENT. The system state these tests describe: that
// first contact fails with an error whose message embeds the COMPLETE seed
// content — instructions sufficient on their own to cure the failure — and
// absence is never a silent empty registry (which would let a wrong path
// masquerade as "no claims").

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'state-io-test-'));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('readActiveClaimsFile on a fresh checkout', () => {
  it('returns an Err whose message embeds the complete registry seed', async () => {
    const error = unwrapErr(await readActiveClaimsFile(join(dir, 'active-claims.json')));

    expect(error.message).toContain('active-claims registry not found');
    expect(error.message).toContain('untracked-by-design');
    expect(error.message).toContain(EMPTY_ACTIVE_CLAIMS_REGISTRY_JSON);
  });

  it('accepts a file seeded with exactly the content the error prescribes', async () => {
    const path = join(dir, 'active-claims.json');
    await writeFile(path, EMPTY_ACTIVE_CLAIMS_REGISTRY_JSON, 'utf8');

    const registry = unwrapOrThrow(await readActiveClaimsFile(path));

    expect(registry.claims).toEqual([]);
    expect(registry.commit_queue).toEqual([]);
  });

  it('still surfaces parser errors for a present-but-invalid file (no ENOENT masking)', async () => {
    const path = join(dir, 'active-claims.json');
    await writeFile(path, 'not json at all', 'utf8');

    const error = unwrapErr(await readActiveClaimsFile(path));

    expect(error.message).toMatch(/not valid JSON/);
  });
});

describe('readClosedClaimsFile on a fresh checkout', () => {
  it('returns an Err whose message embeds the complete archive seed', async () => {
    const error = unwrapErr(await readClosedClaimsFile(join(dir, 'closed-claims.archive.json')));

    expect(error.message).toContain('closed-claims archive not found');
    expect(error.message).toContain('untracked-by-design');
    expect(error.message).toContain(EMPTY_CLOSED_CLAIMS_ARCHIVE_JSON);
  });

  it('accepts a file seeded with exactly the content the error prescribes', async () => {
    const path = join(dir, 'closed-claims.archive.json');
    await writeFile(path, EMPTY_CLOSED_CLAIMS_ARCHIVE_JSON, 'utf8');

    const archive = unwrapOrThrow(await readClosedClaimsFile(path));

    expect(archive.claims).toEqual([]);
  });
});

// The claims lifecycle CLI commands (`claims open`, `claims close`,
// `claims archive-stale`) reach the state files through the transactional
// update paths, not the plain readers — the seeding error must surface there
// too, or the CLI paths keep the bare ENOENT the readers were cured of.

describe('updateClaimStateFiles on a fresh checkout', () => {
  it('rejects a missing closed-claims archive with the seed-bearing error (the claims close path)', async () => {
    const activePath = join(dir, 'active-claims.json');
    await writeFile(activePath, EMPTY_ACTIVE_CLAIMS_REGISTRY_JSON, 'utf8');

    await expect(
      updateClaimStateFiles({
        activePath,
        closedPath: join(dir, 'closed-claims.archive.json'),
        transform: (state) => state,
      }),
    ).rejects.toThrow(EMPTY_CLOSED_CLAIMS_ARCHIVE_JSON);
  });
});

describe('updateActiveClaimsFile on a fresh checkout', () => {
  it('rejects a missing registry with the seed-bearing error (the claims open path)', async () => {
    await expect(
      updateActiveClaimsFile({
        activePath: join(dir, 'active-claims.json'),
        transform: (registry) => registry,
      }),
    ).rejects.toThrow(EMPTY_ACTIVE_CLAIMS_REGISTRY_JSON);
  });
});
