/**
 * Shared errno-code discriminator for filesystem error handling across the
 * collaboration-state modules.
 *
 * Node's fs errors carry a string `code` (`'ENOENT'`, `'EACCES'`, ...) on a
 * plain object shape that TypeScript cannot narrow structurally; this guard
 * centralises the narrowing so each call site states only which code it
 * handles. Extracted at the third consumer — now `state-file-readers`,
 * which took the reader role over from `state-io` — from identical local
 * copies in `watcher-staleness-io` and `state-integrity`.
 */
export function isErrnoCode(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}
