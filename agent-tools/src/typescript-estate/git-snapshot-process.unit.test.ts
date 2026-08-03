import { describe, expect, it } from 'vitest';

import { buildGitInvocation } from './git-snapshot-process.js';

describe('buildGitInvocation', () => {
  it('binds the trusted executable, defensive Git options, root, limits, and scrubbed environment', () => {
    const invocation = buildGitInvocation(
      {
        executable: '/trusted/git',
        cwd: '/repo',
        root: '/repo',
        env: { LANG: 'C.UTF-8', GIT_NO_LAZY_FETCH: '1' },
        stderrLimit: 1024,
        process: {
          run: () => ({
            status: null,
            signal: null,
            stdout: new Uint8Array(),
            stderr: new Uint8Array(),
            error: new Error('process must not run while constructing an invocation'),
          }),
        },
      },
      ['-C', '/repo', 'show', 'abc:path.ts'],
      4096,
    );

    expect(invocation).toEqual({
      executable: '/trusted/git',
      args: ['--no-replace-objects', '--no-lazy-fetch', '-C', '/repo', 'show', 'abc:path.ts'],
      cwd: '/repo',
      env: { LANG: 'C.UTF-8', GIT_NO_LAZY_FETCH: '1' },
      maxStdoutBytes: 4096,
      maxStderrBytes: 1024,
    });
  });
});
