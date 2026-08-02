import { describe, expect, it } from 'vitest';

import { planClaudeSessionIdentityHook } from '../../src/claude/session-identity-hook';
import { deriveIdentity } from '../../src/core/agent-identity';

describe('planClaudeSessionIdentityHook', () => {
  it('returns an empty hook output and no env write when stdin is not JSON', () => {
    expect(
      planClaudeSessionIdentityHook({
        stdinText: 'not json',
        environment: { CLAUDE_ENV_FILE: 'mem://env-file' },
      }),
    ).toStrictEqual({ hookOutput: {} });
  });

  it('returns an empty hook output and no env write when session_id is missing', () => {
    expect(
      planClaudeSessionIdentityHook({
        stdinText: JSON.stringify({ source: 'startup', model: 'claude-opus-4-7' }),
        environment: { CLAUDE_ENV_FILE: 'mem://env-file' },
      }),
    ).toStrictEqual({ hookOutput: {} });
  });

  it('returns an empty hook output and no env write when session_id is empty', () => {
    expect(
      planClaudeSessionIdentityHook({
        stdinText: JSON.stringify({ session_id: '   ' }),
        environment: { CLAUDE_ENV_FILE: 'mem://env-file' },
      }),
    ).toStrictEqual({ hookOutput: {} });
  });

  it('emits additionalContext naming the derived agent identity', () => {
    const sessionId = '22e83599-a627-4427-b23c-fe6ce046e859';
    const expectedDisplayName = deriveIdentity(sessionId).displayName;
    const plan = planClaudeSessionIdentityHook({
      stdinText: JSON.stringify({
        session_id: sessionId,
        source: 'startup',
        model: 'claude-opus-4-7',
      }),
      environment: { CLAUDE_ENV_FILE: 'mem://env-file' },
    });

    expect(plan.hookOutput).toStrictEqual({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: plan.hookOutput.hookSpecificOutput?.additionalContext ?? '',
      },
    });

    const additionalContext = plan.hookOutput.hookSpecificOutput?.additionalContext ?? '';
    expect(additionalContext).toContain('[Practice agent identity]');
    expect(additionalContext).toContain(`Session identity (PDR-027): ${expectedDisplayName}`);
    expect(additionalContext).toContain('PRACTICE_AGENT_SESSION_ID_CLAUDE');
    expect(additionalContext).toContain(`/rename ${expectedDisplayName} - <intent>`);
    expect(additionalContext).toContain('Do not auto-rename');
  });

  it('emits env-file write lines with the session id and resolved display name', () => {
    const sessionId = '22e83599-a627-4427-b23c-fe6ce046e859';
    const displayName = deriveIdentity(sessionId).displayName;
    const plan = planClaudeSessionIdentityHook({
      stdinText: JSON.stringify({ session_id: sessionId }),
      environment: { CLAUDE_ENV_FILE: 'mem://claude-env-file-abc' },
    });

    expect(plan.envFileWrite).toStrictEqual({
      absolutePath: 'mem://claude-env-file-abc',
      appendLine:
        `export PRACTICE_AGENT_SESSION_ID_CLAUDE='${sessionId}'\n` +
        `export OAK_AGENT_IDENTITY_OVERRIDE='${displayName}'\n`,
    });
  });

  it('escapes an apostrophe-bearing session id in the env-file export line', () => {
    // Pins that the host CALLS the quoter: naive interpolation renders
    // 'it's-a-session-seed' (a syntactically broken export line), and every
    // later Bash call in the session would fail to source the env file.
    const sessionId = "it's-a-session-seed";
    const displayName = deriveIdentity(sessionId).displayName;
    const plan = planClaudeSessionIdentityHook({
      stdinText: JSON.stringify({ session_id: sessionId }),
      environment: { CLAUDE_ENV_FILE: 'mem://claude-env-file-quote' },
    });

    expect(plan.envFileWrite).toStrictEqual({
      absolutePath: 'mem://claude-env-file-quote',
      appendLine:
        `export PRACTICE_AGENT_SESSION_ID_CLAUDE=${String.raw`'it'\''s-a-session-seed'`}\n` +
        `export OAK_AGENT_IDENTITY_OVERRIDE='${displayName}'\n`,
    });
  });

  it('omits the env-file write when CLAUDE_ENV_FILE is missing', () => {
    const plan = planClaudeSessionIdentityHook({
      stdinText: JSON.stringify({ session_id: 'session-id-without-env-file' }),
      environment: {},
    });

    expect(plan.envFileWrite).toBeUndefined();
    expect(plan.hookOutput.hookSpecificOutput?.additionalContext).toContain(
      '[Practice agent identity]',
    );
  });

  it('omits the env-file write when CLAUDE_ENV_FILE is whitespace', () => {
    const plan = planClaudeSessionIdentityHook({
      stdinText: JSON.stringify({ session_id: 'session-id-with-blank-env-file' }),
      environment: { CLAUDE_ENV_FILE: '   ' },
    });

    expect(plan.envFileWrite).toBeUndefined();
  });
});
