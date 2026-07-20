import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  EMPTY_ACTIVE_CLAIMS_REGISTRY_JSON,
  EMPTY_CLOSED_CLAIMS_ARCHIVE_JSON,
} from './state-file-seeds.js';
import { readActiveClaimsFile, readClosedClaimsFile } from './state-io.js';

// On a fresh checkout or new worktree the collaboration-state files are
// untracked-by-design (ADR-199 / PDR-094), so the very first CLI invocation
// that reads them meets ENOENT. The system state these tests describe: that
// first contact fails loud with instructions that are themselves sufficient
// to seed the file — never a bare fs error, and never a silent empty
// registry (which would let a wrong path masquerade as "no claims").

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'state-io-test-'));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('readActiveClaimsFile on a fresh checkout', () => {
  it('rejects a missing registry with an actionable seeding error, not a bare ENOENT', async () => {
    await expect(readActiveClaimsFile(join(dir, 'active-claims.json'))).rejects.toThrow(
      /active-claims registry not found[\s\S]*untracked-by-design[\s\S]*"schema_version": "1\.3\.0"/,
    );
  });

  it('offers a seed that the reader itself accepts (the instructions are sufficient)', async () => {
    const path = join(dir, 'active-claims.json');
    await writeFile(path, EMPTY_ACTIVE_CLAIMS_REGISTRY_JSON, 'utf8');

    const registry = await readActiveClaimsFile(path);

    expect(registry.claims).toEqual([]);
    expect(registry.commit_queue).toEqual([]);
  });

  it('still surfaces parser errors for a present-but-invalid file (no ENOENT masking)', async () => {
    const path = join(dir, 'active-claims.json');
    await writeFile(path, 'not json at all', 'utf8');

    await expect(readActiveClaimsFile(path)).rejects.toThrow(/not valid JSON/);
  });
});

describe('readClosedClaimsFile on a fresh checkout', () => {
  it('rejects a missing archive with an actionable seeding error, not a bare ENOENT', async () => {
    await expect(readClosedClaimsFile(join(dir, 'closed-claims.archive.json'))).rejects.toThrow(
      /closed-claims archive not found[\s\S]*untracked-by-design[\s\S]*"schema_version": "1\.3\.0"/,
    );
  });

  it('offers a seed that the reader itself accepts', async () => {
    const path = join(dir, 'closed-claims.archive.json');
    await writeFile(path, EMPTY_CLOSED_CLAIMS_ARCHIVE_JSON, 'utf8');

    const archive = await readClosedClaimsFile(path);

    expect(archive.claims).toEqual([]);
  });
});
