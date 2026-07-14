import { describe, expect, it } from 'vitest';

import { parseFreezeArgs } from './refound-freeze-args.js';
import { DEFAULT_OUT_DIR, DEFAULT_RULE_PATH } from './refound-freeze-helpers.js';

describe('parseFreezeArgs', () => {
  it('applies the documented defaults', () => {
    const result = parseFreezeArgs([]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        rulePath: DEFAULT_RULE_PATH,
        outDir: DEFAULT_OUT_DIR,
        help: false,
      });
    }
  });

  it('honours --rule and --out overrides', () => {
    const result = parseFreezeArgs(['--rule', 'r.json', '--out', 'somewhere']);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ rulePath: 'r.json', outDir: 'somewhere', help: false });
    }
  });

  it.each(['--help', '-h'])('recognises %s as a run-nothing short-circuit request', (flag) => {
    const result = parseFreezeArgs([flag]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.help).toBe(true);
    }
  });

  it.each([[['--']], [['--', '--help']]])(
    'refuses the -- terminator instead of silently swallowing what follows it (argv %j)',
    (argv) => {
      const result = parseFreezeArgs(argv);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('takes no positional arguments');
      }
    },
  );

  it('rejects a dangling flag with no value', () => {
    const result = parseFreezeArgs(['--rule']);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('requires a value');
    }
    expect(parseFreezeArgs(['--out']).ok).toBe(false);
  });

  it('rejects an unknown flag rather than silently ignoring it', () => {
    const result = parseFreezeArgs(['--rules', 'r.json']);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('unknown option');
    }
  });
});
