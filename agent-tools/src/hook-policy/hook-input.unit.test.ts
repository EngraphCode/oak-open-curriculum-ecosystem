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
