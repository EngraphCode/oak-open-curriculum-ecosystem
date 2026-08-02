import { describe, expect, it } from 'vitest';

import {
  EMPTY_ACTIVE_CLAIMS_REGISTRY_JSON,
  EMPTY_CLOSED_CLAIMS_ARCHIVE_JSON,
} from './state-file-seeds.js';
import { readRepoDocument } from './test-helpers/repo-doc.js';

/**
 * Lockstep pin for the hand-written bootstrap snippet: the start-right
 * seeding block cannot import the seed constants (it must run on a fresh
 * checkout before any build), so this test recomputes the expected snippet
 * literals from the constants and reddens when the two drift apart.
 */

describe('start-right seeding snippet', () => {
  it('carries both canonical seed strings verbatim — the snippet cannot import them, so this pin is the lockstep', async () => {
    const skill = await readRepoDocument('.agent/skills/start-right-quick/shared/start-right.md');

    expect(skill).toContain(`'${EMPTY_ACTIVE_CLAIMS_REGISTRY_JSON}'`);
    expect(skill).toContain(`'${EMPTY_CLOSED_CLAIMS_ARCHIVE_JSON}'`);
  });
});
