/**
 * Narrow a caught failure to the `Err` channel: a real `Error` instance
 * passes through as itself. Anything else CRASHES — a non-Error throwable
 * is the system reporting a problem, and we listen rather than accommodate
 * (owner ruling, 2026-07-20): the exception names the anomaly and carries
 * the original value intact as `cause`. It deliberately does NOT enter the
 * Result channel — it is not a legitimate failure mode of the boundary; it
 * is a defect demanding attention.
 *
 * Hoisted from `collaboration-state/state-file-readers.ts` when the
 * state-parsers JSON boundary became a consumer that module imports FROM
 * (`consolidate-at-second-consumer`; a same-module copy would have created
 * an import cycle). `site` names the boundary in the crash message; the
 * default keeps the founding state-file wording for its original callers.
 */
export function failureAsError(failure: unknown, site = 'the state-file read boundary'): Error {
  if (failure instanceof Error) {
    return failure;
  }
  throw new TypeError(`non-Error value thrown at ${site}`, {
    cause: failure,
  });
}
