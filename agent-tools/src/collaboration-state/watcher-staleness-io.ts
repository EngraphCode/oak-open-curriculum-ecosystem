/**
 * Production filesystem binding for the `WatcherStalenessIo` seam consumed by
 * `detectStaleWatcher`. Kept as its own module rather than widening
 * `CollaborationStateCliIo` (which deliberately excludes `stat`): only the
 * liveness/presence path needs file mtime, so the dependency stays local.
 *
 * `statMtimeMs` returns the literal `'missing'` for an absent file (the result
 * type IS the absence contract) and rethrows any other error (e.g. EACCES) so
 * an unreadable-but-present heartbeat fails loud rather than masquerading as a
 * watcher that was never started.
 */
import { readFile, stat } from 'node:fs/promises';

import { isErrnoCode } from './errno.js';
import { type WatcherStalenessIo } from './watcher-staleness.js';

export const productionWatcherStalenessIo: WatcherStalenessIo = {
  readTextFile: (filePath) => readFile(filePath, 'utf8'),
  statMtimeMs: async (filePath) => {
    try {
      const stats = await stat(filePath);
      return stats.mtimeMs;
    } catch (error) {
      if (isErrnoCode(error, 'ENOENT')) {
        return 'missing';
      }
      throw error;
    }
  },
};
