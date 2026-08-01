import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { typeSafeEntries } from '@oaknational/type-helpers';

import { SCHEMA_FILENAMES } from '../../collaboration-state/collaboration-json-validation.js';
import { CLOSED_CLAIMS_SCHEMA_VERSION } from '../../collaboration-state/types.js';

/**
 * Real-IO temp-repo builder for practice-substrate integration tests
 * (ADR-078: tests import this helper surface, never `node:fs/promises`
 * directly). Mirrors the live layout the substrate evaluators read: the
 * collaboration state root plus the package-relative schema directory.
 */

const SCHEMAS_DIR = fileURLToPath(new URL('../../collaboration-state/schemas/', import.meta.url));

export async function makeTempSubstrateRepo(
  activeClaims: unknown,
  options?: { readonly commsEventFiles?: Readonly<Record<string, string>> },
): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'live-json-characterisation-'));
  const collaborationRoot = join(root, '.agent/state/collaboration');
  const schemaRoot = join(root, 'agent-tools/src/collaboration-state/schemas');
  for (const dir of ['comms', 'conversations', 'escalations']) {
    await mkdir(join(collaborationRoot, dir), { recursive: true });
  }
  await mkdir(schemaRoot, { recursive: true });
  for (const schema of SCHEMA_FILENAMES) {
    await writeFile(join(schemaRoot, schema), await readFile(join(SCHEMAS_DIR, schema), 'utf8'));
  }
  for (const [filename, text] of typeSafeEntries(options?.commsEventFiles ?? {})) {
    await writeFile(join(collaborationRoot, 'comms', filename), text, 'utf8');
  }
  await writeFile(
    join(collaborationRoot, 'active-claims.json'),
    JSON.stringify(activeClaims, null, 2),
    'utf8',
  );
  await writeFile(
    join(collaborationRoot, 'closed-claims.archive.json'),
    JSON.stringify({ schema_version: CLOSED_CLAIMS_SCHEMA_VERSION, claims: [] }, null, 2),
    'utf8',
  );

  return root;
}

export async function removeTempSubstrateRepo(root: string): Promise<void> {
  await rm(root, { recursive: true, force: true });
}
