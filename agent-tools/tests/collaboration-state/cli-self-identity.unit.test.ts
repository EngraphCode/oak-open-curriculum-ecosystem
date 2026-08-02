import { describe, expect, it } from 'vitest';

import { resolveSelfIdentity } from '../../src/collaboration-state/cli-self-identity';
import { type Options } from '../../src/collaboration-state/cli-options';
import { type CollaborationStateEnvironment } from '../../src/collaboration-state/types';

// Decision 1 of the ratified follow-on-cures plan (WS-B): an empty
// session_id_prefix is OPERATOR ERROR on any explicitly supplied
// --session-prefix, never a silent default — an empty prefix writes a
// wire-invalid identity (the heartbeat wire schema requires a non-empty
// prefix) and blinds self-match reads (the override id derives from the
// name+prefix pair). The 'unknown' sentinel remains reserved for HARNESS
// absence and never enters here.
function makeOptions(values: Record<string, string>): Options {
  return {
    command: 'comms',
    topic: 'watch',
    values: new Map(Object.entries(values)),
    files: [],
    areaPatterns: [],
    tags: [],
    excludeTags: [],
    positionals: [],
  };
}

const env: CollaborationStateEnvironment = {
  PRACTICE_AGENT_SESSION_ID_CLAUDE: '22e83599-a627-4427-b23c-fe6ce046e859',
};

describe('resolveSelfIdentity override path (--agent-name)', () => {
  it('derives the override identity when a non-empty prefix is supplied', () => {
    const identity = resolveSelfIdentity(
      makeOptions({ 'agent-name': 'Override Test', 'session-prefix': 'ovr123' }),
      env,
    );
    expect(identity.agent_name).toBe('Override Test');
    expect(identity.session_id_prefix).toBe('ovr123');
    expect(identity.id).toBeDefined();
  });

  it('rejects a missing --session-prefix with a teaching error', () => {
    expect(() => resolveSelfIdentity(makeOptions({ 'agent-name': 'Override Test' }), env)).toThrow(
      /--session-prefix is required with --agent-name/u,
    );
  });

  it('rejects an empty --session-prefix with a teaching error', () => {
    expect(() =>
      resolveSelfIdentity(
        makeOptions({ 'agent-name': 'Override Test', 'session-prefix': '' }),
        env,
      ),
    ).toThrow(/--session-prefix/u);
  });

  it('rejects a whitespace-only --session-prefix with a teaching error', () => {
    expect(() =>
      resolveSelfIdentity(
        makeOptions({ 'agent-name': 'Override Test', 'session-prefix': '   ' }),
        env,
      ),
    ).toThrow(/--session-prefix/u);
  });

  it('trims a padded prefix so no whitespace enters the wire field', () => {
    const identity = resolveSelfIdentity(
      makeOptions({ 'agent-name': 'Override Test', 'session-prefix': ' ovr123 ' }),
      env,
    );
    expect(identity.session_id_prefix).toBe('ovr123');
  });
});

describe('resolveSelfIdentity derived path (env seed)', () => {
  const base = { platform: 'claude', model: 'claude-fable-5' };

  it('derives prefix and id from the session seed when no flag is supplied', () => {
    const identity = resolveSelfIdentity(makeOptions(base), env);
    expect(identity.session_id_prefix).toBe('22e835');
    expect(identity.id).toBeDefined();
  });

  it('replaces only the prefix when a non-empty --session-prefix is supplied', () => {
    const withOverride = resolveSelfIdentity(
      makeOptions({ ...base, 'session-prefix': 'zz9999' }),
      env,
    );
    const withoutOverride = resolveSelfIdentity(makeOptions(base), env);
    expect(withOverride.session_id_prefix).toBe('zz9999');
    expect(withOverride.id).toBe(withoutOverride.id);
  });

  it('rejects a supplied empty --session-prefix instead of writing it', () => {
    expect(() => resolveSelfIdentity(makeOptions({ ...base, 'session-prefix': '' }), env)).toThrow(
      /--session-prefix/u,
    );
  });

  it('rejects a supplied whitespace-only --session-prefix instead of writing it', () => {
    expect(() =>
      resolveSelfIdentity(makeOptions({ ...base, 'session-prefix': '  ' }), env),
    ).toThrow(/--session-prefix/u);
  });

  it('trims a padded supplied prefix so no whitespace enters the wire field', () => {
    const identity = resolveSelfIdentity(
      makeOptions({ ...base, 'session-prefix': ' zz9999 ' }),
      env,
    );
    expect(identity.session_id_prefix).toBe('zz9999');
  });
});
