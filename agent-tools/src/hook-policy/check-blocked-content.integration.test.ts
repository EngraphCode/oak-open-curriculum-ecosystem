import { describe, expect, it } from 'vitest';

import { runPreToolUseContentGuard } from './check-blocked-content.js';

/**
 * Guard-level behaviour for both host payload shapes, with injected policy
 * seams (no live `.agent` tree reads). The Copilot string-form fixture is the
 * observed live shape (2026-07-25, Copilot CLI 1.0.75) with sanitised paths.
 */

function stdinFrom(payload: unknown): AsyncIterable<string> {
  return (async function* generate(): AsyncGenerator<string> {
    yield JSON.stringify(payload);
  })();
}

function collector(): { write(text: string): void; text(): string } {
  let buffer = '';
  return {
    write(text: string): void {
      buffer += text;
    },
    text(): string {
      return buffer;
    },
  };
}

function copilotEditPayload(patchBody: string): unknown {
  return {
    hook_event_name: 'PreToolUse',
    session_id: '00000000-0000-0000-0000-000000000000',
    timestamp: '2026-07-25T13:49:57.489Z',
    cwd: '/workspace/example-repo',
    tool_name: 'Edit',
    tool_input: patchBody,
  };
}

const CLEAN_PATCH =
  '*** Begin Patch\n*** Add File: files/hook-write-test.txt\n+File write succeeded on 2026-07-25.\n*** End Patch\n';

const BLOCKED_MARKER = 'FORBIDDEN-TEST-MARKER';

const BLOCKED_PATCH = `*** Begin Patch\n*** Add File: files/hook-write-test.txt\n+contains ${BLOCKED_MARKER} here\n*** End Patch\n`;

describe('runPreToolUseContentGuard', () => {
  it('allows the observed clean Copilot string-form payload with an explicit decision', async () => {
    const stdout = collector();
    const stderr = collector();

    const { exitCode } = await runPreToolUseContentGuard({
      stdin: stdinFrom(copilotEditPayload(CLEAN_PATCH)),
      stdout,
      stderr,
      blockedPatterns: [BLOCKED_MARKER],
      scopedBlocks: [],
      readPriorContent: () => null,
    });

    expect(exitCode).toBe(0);
    expect(JSON.parse(stdout.text())).toEqual({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'allow',
        permissionDecisionReason: 'no policy match',
      },
    });
  });

  it('denies a Copilot string-form payload whose added lines match policy', async () => {
    const stdout = collector();
    const stderr = collector();

    const { exitCode } = await runPreToolUseContentGuard({
      stdin: stdinFrom(copilotEditPayload(BLOCKED_PATCH)),
      stdout,
      stderr,
      blockedPatterns: [BLOCKED_MARKER],
      scopedBlocks: [],
      readPriorContent: () => null,
    });

    expect(exitCode).toBe(0);
    const decision: unknown = JSON.parse(stdout.text());
    expect(decision).toMatchObject({
      hookSpecificOutput: { permissionDecision: 'deny' },
    });
  });

  it('fails closed on a malformed string-form payload', async () => {
    const stdout = collector();
    const stderr = collector();

    const { exitCode } = await runPreToolUseContentGuard({
      stdin: stdinFrom(copilotEditPayload('not a patch')),
      stdout,
      stderr,
      blockedPatterns: [],
      scopedBlocks: [],
      readPriorContent: () => null,
    });

    expect(exitCode).toBe(2);
    expect(stderr.text()).toContain('apply_patch payload was invalid');
  });

  it('keeps Claude object payload behaviour: clean write allows explicitly', async () => {
    const stdout = collector();
    const stderr = collector();

    const { exitCode } = await runPreToolUseContentGuard({
      stdin: stdinFrom({
        session_id: 't',
        hook_event_name: 'PreToolUse',
        tool_name: 'Write',
        tool_input: { file_path: 'notes.md', content: 'plain content' },
      }),
      stdout,
      stderr,
      blockedPatterns: [BLOCKED_MARKER],
      scopedBlocks: [],
      readPriorContent: () => null,
    });

    expect(exitCode).toBe(0);
    expect(JSON.parse(stdout.text())).toMatchObject({
      hookSpecificOutput: { permissionDecision: 'allow' },
    });
  });

  it('keeps Claude object payload behaviour: blocked addition denies', async () => {
    const stdout = collector();
    const stderr = collector();

    const { exitCode } = await runPreToolUseContentGuard({
      stdin: stdinFrom({
        session_id: 't',
        hook_event_name: 'PreToolUse',
        tool_name: 'Edit',
        tool_input: {
          file_path: 'notes.md',
          old_string: 'clean',
          new_string: `now with ${BLOCKED_MARKER}`,
        },
      }),
      stdout,
      stderr,
      blockedPatterns: [BLOCKED_MARKER],
      scopedBlocks: [],
      readPriorContent: () => null,
    });

    expect(exitCode).toBe(0);
    expect(JSON.parse(stdout.text())).toMatchObject({
      hookSpecificOutput: { permissionDecision: 'deny' },
    });
  });
});
