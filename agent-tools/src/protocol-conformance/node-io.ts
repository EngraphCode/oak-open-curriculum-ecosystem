import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { type ConformanceIo } from './types.js';

/**
 * The real-filesystem adapter for the conformance IO seam. Read failures map
 * to `undefined` (an unreadable artefact is an absent artefact to the
 * detectors, which then fail loud with the artefact named) — never a throw,
 * so one broken path cannot mask the rest of the report.
 */
export function buildConformanceNodeIo(
  repoRoot: string,
  env: Readonly<Record<string, string | undefined>>,
): ConformanceIo {
  return {
    fileExists: (relPath) => existsSync(resolve(repoRoot, relPath)),
    readTextFile: (relPath) => {
      try {
        return readFileSync(resolve(repoRoot, relPath), 'utf8');
      } catch {
        return undefined;
      }
    },
    listDir: (relPath) => {
      try {
        return readdirSync(resolve(repoRoot, relPath));
      } catch {
        return undefined;
      }
    },
    absolutePathExists: (path) => existsSync(path),
    env,
  };
}
