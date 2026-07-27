/**
 * Swallow EPIPE on the process stdout stream. Long-lived streaming commands
 * (`comms watch`) write into a supervisor-owned pipe; when the supervisor
 * dies harshly (the F-101 SIGKILL class) the reader end closes and the next
 * write surfaces as an asynchronous `'error'` event that would otherwise
 * crash the process with a non-zero exit — inverting the orderly-exit
 * contract of the WATCHER EXIT line, whose emission is exactly such a
 * write. Non-EPIPE errors keep the default crash behaviour: the listener
 * detaches itself and re-emits, so the error surfaces exactly as it would
 * with no listener at all.
 */
export function tolerateEpipeOnStdout(stream: NodeJS.WriteStream): void {
  const tolerateEpipe = (error: NodeJS.ErrnoException): void => {
    if (error.code === 'EPIPE') {
      return;
    }
    stream.off('error', tolerateEpipe);
    stream.emit('error', error);
  };
  stream.on('error', tolerateEpipe);
}
