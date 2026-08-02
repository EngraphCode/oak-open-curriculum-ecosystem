import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { resolveRepoRoot } from '../../core/repo-root.js';

/**
 * Real-IO reader for repo-root-relative documents (ADR-078: integration
 * tests import this helper surface, never `node:fs` directly). Root
 * discovery goes through the canonical resolver — no second sentinel walk.
 */
export function readRepoDocument(repoRelativePath: string): Promise<string> {
  return readFile(
    join(resolveRepoRoot(import.meta.url, { projectDir: undefined }), repoRelativePath),
    'utf8',
  );
}
