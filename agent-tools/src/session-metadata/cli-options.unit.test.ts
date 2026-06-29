import { describe, expect, it } from 'vitest';

import { parseArgs } from './cli-options.js';

const valid = ['--vendor', 'claude', '--model', 'claude-opus-4-8[1m]', '--session-id', 'sess-1'];

describe('parseArgs', () => {
  it('parses the three required value options', () => {
    expect(parseArgs(valid)).toStrictEqual({
      ok: true,
      options: {
        vendor: 'claude',
        model: 'claude-opus-4-8[1m]',
        sessionId: 'sess-1',
        json: false,
        help: false,
      },
    });
  });

  it('parses the --json flag', () => {
    const result = parseArgs([...valid, '--json']);

    expect(result).toStrictEqual({
      ok: true,
      options: {
        vendor: 'claude',
        model: 'claude-opus-4-8[1m]',
        sessionId: 'sess-1',
        json: true,
        help: false,
      },
    });
  });

  it.each(['--help', '-h'])('treats %s as help and skips required-option checks', (flag) => {
    const result = parseArgs([flag]);

    expect(result).toStrictEqual({
      ok: true,
      options: { vendor: '', model: '', sessionId: '', json: false, help: true },
    });
  });

  const missingCases: { readonly argv: readonly string[]; readonly missing: string }[] = [
    { argv: [], missing: '--vendor' },
    { argv: ['--vendor', 'claude'], missing: '--model' },
    { argv: ['--vendor', 'claude', '--model', 'claude-opus-4-8'], missing: '--session-id' },
  ];
  it.each(missingCases)(
    'reports the first missing required option ($missing)',
    ({ argv, missing }) => {
      const result = parseArgs(argv);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.startsWith(`${missing} is required`)).toBe(true);
      }
    },
  );

  it('rejects an unknown option', () => {
    const result = parseArgs([...valid, '--bogus']);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.startsWith('unknown option: --bogus')).toBe(true);
    }
  });

  it('rejects a value option with no value', () => {
    const result = parseArgs(['--vendor', '--model', 'claude-opus-4-8']);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.startsWith('--vendor requires a value')).toBe(true);
    }
  });

  it('rejects an unexpected positional argument', () => {
    const result = parseArgs(['positional']);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.startsWith('unexpected positional argument: positional')).toBe(true);
    }
  });

  it('stops parsing at the -- terminator', () => {
    const result = parseArgs([...valid, '--', '--ignored']);

    expect(result).toStrictEqual({
      ok: true,
      options: {
        vendor: 'claude',
        model: 'claude-opus-4-8[1m]',
        sessionId: 'sess-1',
        json: false,
        help: false,
      },
    });
  });
});
