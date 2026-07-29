import { describe, expect, it } from 'vitest';

import { runCollaborationStateCli } from '../../src/collaboration-state';
import { createFakeCollaborationRuntime } from './fake-collaboration-runtime';

const AGENT_NAME = 'Europa stirs Void';

describe('comms watch coordination-home defaults', () => {
  it('documents the optional pair and its all-or-neither contract in command help', async () => {
    const result = await runCollaborationStateCli({
      argv: ['--', 'comms', 'watch', '--help'],
      env: {},
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('[--comms-dir <dir>] [--seen-file <path>]');
    expect(result.stdout).toContain('provide both, or omit both');
    expect(result.stdout).toContain('--repo-root <path>');
  });

  it.each([
    ['--comms-dir', '/only/comms'],
    ['--seen-file', '/only/seen.json'],
  ])('fails a half-pair (%s) with command help and no filesystem writes', async (flag, value) => {
    const fake = createFakeCollaborationRuntime();
    const result = await runCollaborationStateCli({
      argv: [
        '--',
        'comms',
        'watch',
        flag,
        value,
        '--agent-name',
        AGENT_NAME,
        '--session-prefix',
        '019fad',
      ],
      env: {},
      stdout: { write: () => true },
      io: fake.runtime.io,
      waitForCommsChange: fake.runtime.waitForCommsChange,
    });

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain(
      'comms watch [--comms-dir <dir>] [--seen-file <path>] [--repo-root <path>]',
    );
    expect(result.stderr).toContain('provide both, or omit both');
    expect(fake.ensuredDirectories()).toStrictEqual([]);
  });
});
