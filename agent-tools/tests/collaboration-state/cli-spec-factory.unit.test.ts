import { describe, expect, it } from 'vitest';

import { commandSpec } from '../../src/collaboration-state/cli-spec-factory';

const noopHandler = (): string => '';

describe('commandSpec', () => {
  it('builds a spec whose positional key is also a declared option', () => {
    const spec = commandSpec({
      help: 'comms show',
      options: ['comms-dir', 'event-id'],
      positional: 'event-id',
      handler: noopHandler,
    });

    expect(spec.positional).toBe('event-id');
    expect(spec.options.has('event-id')).toBe(true);
  });

  it('rejects a positional key that is not also a declared option', () => {
    // The dispatcher binds the positional into values[positional] and then the
    // option allowlist validates it, so a positional not present in options
    // would fail every positional invocation with a misleading "unknown
    // option" error. Guard the invariant at construction (closed shape).
    expect(() =>
      commandSpec({
        help: 'comms show',
        options: ['comms-dir', 'event-id'],
        positional: 'not-an-option',
        handler: noopHandler,
      }),
    ).toThrow('not-an-option');
  });

  it('builds a spec with no positional', () => {
    const spec = commandSpec({
      help: 'comms list',
      options: ['comms-dir', 'tail'],
      handler: noopHandler,
    });

    expect(spec.positional).toBeUndefined();
  });
});
