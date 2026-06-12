/**
 * Dispatcher-level coverage for `claims open --role`: the flag passes
 * through TWO allowlists — `KNOWN_OPTION_KEYS` at parse time and the
 * `claims:open` command spec at dispatch time — and a unit test below the
 * dispatcher cannot see the second one (a live `claims open --role`
 * invocation failed on exactly that gap, 2026-06-12). Integration-tier
 * because the dispatcher's write path validates against the schema set on
 * disk by design: real temp-directory IO, no seam to fake.
 */
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { runCollaborationStateCli } from '../../src/collaboration-state';
import { writeCollaborationSchemaSet } from './active-claims-schema-fixture.js';

describe('claims open --role through the CLI dispatcher', () => {
  it('accepts --role and writes it to the registry', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'cli-claim-role-'));
    // The write path validates by canonical basename against the full schema
    // set in the same directory, so the temp registry mirrors the canonical
    // layout: registry file plus every collaboration schema.
    const activePath = join(tempDir, 'active-claims.json');
    await writeCollaborationSchemaSet(tempDir);
    await writeFile(
      activePath,
      `${JSON.stringify({ schema_version: '1.3.0', commit_queue: [], claims: [] })}\n`,
    );

    try {
      const result = await runCollaborationStateCli({
        argv: [
          '--',
          'claims',
          'open',
          '--active',
          activePath,
          '--thread',
          'agentic-engineering-enhancements',
          '--area-kind',
          'files',
          '--file',
          'agent-tools/src/collaboration-state/cli-claim-commands.ts',
          '--intent',
          'Exercise the dispatcher-level role flag.',
          '--now',
          '2026-06-12T15:00:00Z',
          '--platform',
          'codex',
          '--model',
          'GPT-5',
          '--role',
          'director',
        ],
        env: { CODEX_THREAD_ID: '019dd34d-cb6a-74e0-a29d-6cb8a65ea14b' },
      });

      expect(result.stderr).toBe('');
      expect(result.exitCode).toBe(0);
      const written: unknown = JSON.parse(await readFile(activePath, 'utf8'));
      expect(written).toMatchObject({
        claims: [{ role: 'director', intent: 'Exercise the dispatcher-level role flag.' }],
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
