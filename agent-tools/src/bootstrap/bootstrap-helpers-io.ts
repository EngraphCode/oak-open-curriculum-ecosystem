/**
 * Production filesystem binding for the `WorkspaceDepFsIo` seam consumed by
 * `workspaceDepDistIsStale`. Kept as its own module — mirroring
 * `watcher-staleness-io.ts` — so the staleness decision and its recursive `src`
 * walk stay pure, unit-tested functions while the real `node:fs` reads live at a
 * single thin boundary (ADR-078). Every member here is a direct `node:fs` wire
 * with no branching logic of its own, so there is nothing to describe with a
 * real-IO test that the pure decision's fake-seam tests do not already cover.
 *
 * @packageDocumentation
 */
import { existsSync, readdirSync, statSync } from 'node:fs';

import { type WorkspaceDepDirEntry, type WorkspaceDepFsIo } from './bootstrap-helpers.js';

/**
 * The real-filesystem `WorkspaceDepFsIo`. `statMtimeMs` returns `'missing'` for
 * an absent file — the result value IS the absence contract — so a missing dist
 * artifact drives a rebuild rather than throwing during install.
 *
 * Unlike `watcher-staleness-io.ts` (which distinguishes ENOENT from other errno
 * and rethrows the latter), `statMtimeMs` maps *any* unreadable path to
 * `'missing'` by catching every `statSync` throw: the fail-open bootstrap
 * prefers to rebuild over crashing the install, so absence, a list/stat race,
 * and access failure (`EACCES`/`ELOOP`) all mean "rebuild". A single guarded
 * `statSync` — rather than an `existsSync` gate followed by `statSync` — closes
 * the TOCTOU window the recursive `src` walk would otherwise widen (the tree may
 * be rewritten by a concurrent `git checkout` between the two calls).
 * `readDirEntries` returns every entry under `src/`, including co-located
 * `*.test.ts` — so touching a test file conservatively triggers a rebuild
 * (over-rebuild is safe; under-rebuild is the MCP-472 bug).
 */
export const productionWorkspaceDepFsIo: WorkspaceDepFsIo = {
  statMtimeMs: (filePath) => {
    try {
      return statSync(filePath).mtimeMs;
    } catch {
      return 'missing';
    }
  },
  dirExists: (dir) => existsSync(dir),
  readDirEntries: (dir) =>
    readdirSync(dir, { withFileTypes: true }).map((entry): WorkspaceDepDirEntry => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
    })),
};
