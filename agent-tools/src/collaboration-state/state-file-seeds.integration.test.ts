import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  EMPTY_ACTIVE_CLAIMS_REGISTRY_JSON,
  EMPTY_CLOSED_CLAIMS_ARCHIVE_JSON,
} from './state-file-seeds.js';

/**
 * Lockstep pin for the hand-written bootstrap snippet: the start-right
 * seeding block cannot import the seed constants (it must run on a fresh
 * checkout before any build), so this test recomputes the expected snippet
 * literals from the constants and reddens when the two drift apart.
 */

function repoRoot(): string | undefined {
  let dir = dirname(fileURLToPath(import.meta.url));
  const filesystemRoot = parse(dir).root;
  while (dir !== filesystemRoot) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) {
      return dir;
    }
    dir = dirname(dir);
  }
  return undefined;
}

describe('start-right seeding snippet', () => {
  it('carries both canonical seed strings verbatim — the snippet cannot import them, so this pin is the lockstep', async () => {
    const root = repoRoot();
    expect(root).toBeDefined();
    const skill = await readFile(
      join(root ?? '', '.agent/skills/start-right-quick/shared/start-right.md'),
      'utf8',
    );

    expect(skill).toContain(`'${EMPTY_ACTIVE_CLAIMS_REGISTRY_JSON}'`);
    expect(skill).toContain(`'${EMPTY_CLOSED_CLAIMS_ARCHIVE_JSON}'`);
  });
});
