import { describe, expect, it } from 'vitest';

import { resolveTranscriptPath } from './transcript-locator.js';

describe('resolveTranscriptPath', () => {
  it('builds the Claude transcript path with the project key derived from cwd', () => {
    const result = resolveTranscriptPath({
      vendor: 'claude',
      home: '/h',
      cwd: '/ws/code/oak.repo',
      sessionId: 'sess-123',
    });

    expect(result).toStrictEqual({
      ok: true,
      path: '/h/.claude/projects/-ws-code-oak-repo/sess-123.jsonl',
    });
  });

  it('replaces every slash and dot in the cwd with a hyphen', () => {
    const result = resolveTranscriptPath({
      vendor: 'claude',
      home: '/h',
      cwd: '/a.b/c',
      sessionId: 's',
    });

    expect(result).toStrictEqual({ ok: true, path: '/h/.claude/projects/-a-b-c/s.jsonl' });
  });

  it('returns a typed error for an unsupported vendor', () => {
    const result = resolveTranscriptPath({
      vendor: 'codex',
      home: '/h',
      cwd: '/a',
      sessionId: 's',
    });

    expect(result).toStrictEqual({
      ok: false,
      error: 'unsupported vendor: codex (supported: claude)',
    });
  });
});
