import { describe, expect, it } from 'vitest';

import { extractContentChange, extractContentChanges } from './hook-input.js';

/**
 * The Copilot CLI inherited-hook payload, structurally verbatim as observed
 * live on 2026-07-25 (Copilot CLI 1.0.75, session 767fc2f8… — captured by the
 * MCP-150 primary-guard instrumentation): `tool_name: "Edit"` with
 * `tool_input` as a raw `apply_patch` program STRING, where Claude's Edit
 * sends an object. Paths are sanitised; the shape is the evidence.
 */
const OBSERVED_COPILOT_EDIT_PAYLOAD = {
  hook_event_name: 'PreToolUse',
  session_id: '00000000-0000-0000-0000-000000000000',
  timestamp: '2026-07-25T13:49:57.489Z',
  cwd: '/workspace/example-repo',
  tool_name: 'Edit',
  tool_input:
    '*** Begin Patch\n*** Add File: files/hook-write-test.txt\n+File write succeeded on 2026-07-25.\n*** End Patch\n',
};

describe('extractContentChanges', () => {
  it('yields one change from a Claude Edit object payload', () => {
    const changes = extractContentChanges({
      tool_input: { file_path: 'a.ts', old_string: 'before', new_string: 'after' },
    });

    expect(changes).toEqual([{ newContent: 'after', priorContent: 'before', filePath: 'a.ts' }]);
  });

  it('parses the observed Copilot string-form Edit payload into per-file changes', () => {
    const changes = extractContentChanges(OBSERVED_COPILOT_EDIT_PAYLOAD);

    expect(changes).toEqual([
      {
        newContent: 'File write succeeded on 2026-07-25.',
        priorContent: '',
        filePath: 'files/hook-write-test.txt',
      },
    ]);
  });

  it('fails closed on a structurally invalid patch program', () => {
    expect(() =>
      extractContentChanges({ ...OBSERVED_COPILOT_EDIT_PAYLOAD, tool_input: 'not a patch' }),
    ).toThrow(/apply_patch payload was invalid/);
  });

  it('fails closed on a payload with neither object nor patch-string input', () => {
    expect(() => extractContentChanges({ tool_input: { irrelevant: true } })).toThrow(
      /did not include writable content/,
    );
  });

  // The five behaviours below are ported from the MCP-150 branch's router
  // suite (PR #707 at f96149836, MCP-183 secondary port): the behaviour
  // holds on this implementation; only the error vocabulary differs where
  // noted. Envelope-shape behaviours the superseding architecture
  // deliberately does NOT carry (documented Copilot object envelopes,
  // tool-name-vs-schema disagreement) are dispositioned in #707's closure
  // rather than ported as failing tests.

  it('uses empty prior content when a Claude Edit omits old_string', () => {
    expect(extractContentChanges({ tool_input: { new_string: 'new content' } })).toStrictEqual([
      { newContent: 'new content', priorContent: '' },
    ]);
  });

  it('extracts the flattened Claude payload (no tool_input envelope)', () => {
    expect(extractContentChanges({ new_string: 'flat new', old_string: 'flat old' })).toStrictEqual(
      [{ newContent: 'flat new', priorContent: 'flat old' }],
    );
  });

  it('extracts the camel-case toolInput envelope', () => {
    expect(
      extractContentChanges({ toolInput: { new_string: 'camel new', old_string: 'camel old' } }),
    ).toStrictEqual([{ newContent: 'camel new', priorContent: 'camel old' }]);
  });

  // The two throws below pin the EXTRACTOR's own refusal only. The
  // system-level fail-closed guarantee for these payloads lives one seam
  // up — no production route matches them, so the dispatcher refuses
  // before extraction runs — and is pinned against the real route table
  // in dispatcher.integration.test.ts.

  it('throws when no container carries writable content (Copilot lifecycle-batch shape)', () => {
    expect(() =>
      extractContentChanges({
        sessionId: 'copilot-session',
        cwd: '/repo',
        toolCalls: [
          {
            id: 'call-create',
            name: 'create',
            args: JSON.stringify({ path: '/repo/new-file.md', file_text: 'new file content' }),
          },
        ],
      }),
    ).toThrow(/did not include writable content/);
  });

  it('throws on the uncarried Copilot toolArgs envelope family (well-formed and malformed alike)', () => {
    const base = {
      sessionId: 'copilot-session',
      timestamp: 1_753_426_800_000,
      cwd: '/repo',
      toolName: 'create',
    };
    expect(() => extractContentChanges({ ...base, toolArgs: '{' })).toThrow(
      /did not include writable content/,
    );
    expect(() =>
      extractContentChanges({
        ...base,
        toolArgs: JSON.stringify({ path: '/repo/new-file.md', file_text: 'new file content' }),
      }),
    ).toThrow(/did not include writable content/);
  });
});

describe('extractContentChange', () => {
  it('keeps the single-change Claude Write behaviour unchanged', () => {
    expect(extractContentChange({ tool_input: { file_path: 'b.md', content: 'body' } })).toEqual({
      newContent: 'body',
      priorContent: '',
      filePath: 'b.md',
      priorFilePath: 'b.md',
    });
  });
});
