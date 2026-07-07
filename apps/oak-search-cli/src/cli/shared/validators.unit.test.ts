/**
 * Unit tests for the positive-integer CLI option parser.
 *
 * The parser is a Commander argParser: it runs at the option boundary so
 * command handlers receive a validated `number`, never a raw string.
 */
import { describe, expect, it } from 'vitest';
import { InvalidArgumentError } from 'commander';

import { parsePositiveIntOption } from './validators.js';

describe('parsePositiveIntOption', () => {
  it('parses a positive decimal integer string to its number value', () => {
    expect(parsePositiveIntOption('25')).toBe(25);
  });

  it('parses the minimum accepted value', () => {
    expect(parsePositiveIntOption('1')).toBe(1);
  });

  it.each([['abc'], ['25.5'], ['0'], ['-5'], [''], ['1e3'], [' 25'], ['0x10']])(
    'rejects %j with a Commander invalid-argument error',
    (value) => {
      expect(() => parsePositiveIntOption(value)).toThrow(InvalidArgumentError);
    },
  );
});
