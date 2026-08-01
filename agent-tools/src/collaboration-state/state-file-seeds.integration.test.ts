import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { resolveRepoRoot } from '../core/repo-root.js';
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

describe('start-right seeding snippet', () => {
  it('carries both canonical seed strings verbatim — the snippet cannot import them, so this pin is the lockstep', async () => {
    const root = resolveRepoRoot(import.meta.url, { projectDir: undefined });
    const skill = await readFile(
      join(root, '.agent/skills/start-right-quick/shared/start-right.md'),
      'utf8',
    );

    expect(skill).toContain(`'${EMPTY_ACTIVE_CLAIMS_REGISTRY_JSON}'`);
    expect(skill).toContain(`'${EMPTY_CLOSED_CLAIMS_ARCHIVE_JSON}'`);
  });
});
