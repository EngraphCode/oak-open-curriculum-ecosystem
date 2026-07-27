import { EventEmitter } from 'node:events';
import { describe, expect, it } from 'vitest';

import { tolerateEpipeOnStdout } from '../src/bin/stdout-epipe';

/** An errno-shaped error as Node's stream machinery raises it. */
function errnoError(code: string): NodeJS.ErrnoException {
  const error: NodeJS.ErrnoException = new Error(`write ${code}`);
  error.code = code;
  return error;
}

describe('tolerateEpipeOnStdout', () => {
  it('swallows an EPIPE error and stays armed for the next one', () => {
    const stream = new EventEmitter();
    tolerateEpipeOnStdout(stream);

    // With a listener attached, emit does not throw; without one, Node
    // throws the error — so the absence of a throw IS the swallow proof.
    expect(() => stream.emit('error', errnoError('EPIPE'))).not.toThrow();
    // The guard stays armed: a second EPIPE is swallowed too (the F-101
    // shutdown path can produce several writes into a dead pipe).
    expect(() => stream.emit('error', errnoError('EPIPE'))).not.toThrow();
  });

  it('re-surfaces a non-EPIPE error with default crash semantics', () => {
    const stream = new EventEmitter();
    tolerateEpipeOnStdout(stream);

    // The guard detaches itself and re-emits; with no listener left the
    // re-emit throws exactly as an unguarded stream would.
    expect(() => stream.emit('error', errnoError('ENOSPC'))).toThrow(/ENOSPC/u);
  });

  it('re-surfaces a non-EPIPE error exactly once (no re-entrant loop)', () => {
    const stream = new EventEmitter();
    tolerateEpipeOnStdout(stream);
    const seen: string[] = [];
    // A downstream listener attached after the guard receives the re-emit;
    // a re-entrant guard would deliver it more than once (or overflow).
    stream.on('error', (error: NodeJS.ErrnoException) => {
      seen.push(error.code ?? '?');
    });

    stream.emit('error', errnoError('EACCES'));

    expect(seen).toStrictEqual(['EACCES']);
  });
});
