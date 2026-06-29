import { describe, expect, it } from 'vitest';

import {
  scanArgs,
  standardFlags,
  type CliArgScanSpec,
  type ValueHandler,
} from './cli-arg-parser.js';

interface State {
  values: string[];
  name: string;
  json: boolean;
  help: boolean;
}

const initial = (): State => ({ values: [], name: '', json: false, help: false });

const accumulate: ValueHandler<State> = (state, value) => {
  state.values.push(value);
};
const assignName: ValueHandler<State> = (state, value) => {
  state.name = value;
};

const spec: CliArgScanSpec<State> = {
  flags: standardFlags<State>(),
  valueOptions: { '--value': accumulate, '--name': assignName },
  helpText: 'HELP',
};

describe('scanArgs', () => {
  it('applies flag handlers from standardFlags', () => {
    const result = scanArgs(['--json', '--help'], initial(), spec);

    expect(result).toStrictEqual({
      ok: true,
      state: { values: [], name: '', json: true, help: true },
    });
  });

  it('treats -h as help', () => {
    const result = scanArgs(['-h'], initial(), spec);

    expect(result.ok && result.state.help).toBe(true);
  });

  it('accumulates a repeatable value option', () => {
    const result = scanArgs(['--value', 'a', '--value', 'b'], initial(), spec);

    expect(result.ok && result.state.values).toStrictEqual(['a', 'b']);
  });

  it('assigns a single-valued value option', () => {
    const result = scanArgs(['--name', 'x'], initial(), spec);

    expect(result.ok && result.state.name).toBe('x');
  });

  it('stops scanning at the -- terminator', () => {
    const result = scanArgs(['--name', 'x', '--', '--value', 'ignored'], initial(), spec);

    expect(result).toStrictEqual({
      ok: true,
      state: { values: [], name: 'x', json: false, help: false },
    });
  });

  it('errors when a value option has no value', () => {
    const result = scanArgs(['--name'], initial(), spec);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('--name requires a value\n\nHELP');
    }
  });

  it('errors when a value option is followed by another option', () => {
    const result = scanArgs(['--name', '--json'], initial(), spec);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.startsWith('--name requires a value')).toBe(true);
    }
  });

  it('rejects an unknown option', () => {
    const result = scanArgs(['--bogus'], initial(), spec);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('unknown option: --bogus\n\nHELP');
    }
  });

  it('rejects an unexpected positional argument', () => {
    const result = scanArgs(['positional'], initial(), spec);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('unexpected positional argument: positional\n\nHELP');
    }
  });
});
