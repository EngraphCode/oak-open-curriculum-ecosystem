/**
 * Readers for the untracked-by-design collaboration state files
 * (ADR-199 / PDR-094). On a fresh checkout or new worktree these files do
 * not exist, so first contact meets ENOENT; the readers convert exactly
 * that case into an `Err` carrying the complete seed content from
 * `state-file-seeds.ts` — instructions sufficient on their own to cure the
 * failure. Absence is never a silent empty registry (a wrong path would
 * masquerade as "no claims" — the F-41 decoy-path class), and every OTHER
 * failure (permissions, invalid content) flows out as an `Err` carrying
 * its original self — the throw happens only at the result package's
 * single sanctioned edge on unwrap, loud and with the cause chain intact
 * (owner ruling, 2026-07-20).
 *
 * The text-read seam is injectable per ADR-078 so tests prove the
 * behaviour with simple fakes and no real IO; production uses the
 * default disk binding.
 */
import { readFile } from 'node:fs/promises';

import { err, ok, type Result } from '@oaknational/result';

import { isErrnoCode } from './errno.js';
import {
  EMPTY_ACTIVE_CLAIMS_REGISTRY_JSON,
  EMPTY_CLOSED_CLAIMS_ARCHIVE_JSON,
  missingStateFileError,
} from './state-file-seeds.js';
import { parseClosedClaimsArchive, parseCollaborationRegistry } from './state-parsers.js';
import { type ClosedClaimsArchive, type CollaborationRegistry } from './types.js';

/**
 * The injectable text-read seam (ADR-078). Production binds the disk;
 * tests inject fakes that resolve text or reject with errno-shaped
 * failures.
 */
export type ReadTextFile = (path: string) => Promise<string>;

const readTextFileFromDisk: ReadTextFile = (path) => readFile(path, 'utf8');

/**
 * Read and parse the active claims registry. See the module doc for the
 * failure contract; callers behind the CLI's exception boundary unwrap
 * with `unwrapOrThrow`.
 */
export async function readActiveClaimsFile(
  activePath: string,
  readTextFile: ReadTextFile = readTextFileFromDisk,
): Promise<Result<CollaborationRegistry, Error>> {
  return readStateFile(activePath, parseCollaborationRegistry, readTextFile, {
    label: 'active-claims registry',
    seedJson: EMPTY_ACTIVE_CLAIMS_REGISTRY_JSON,
  });
}

/**
 * Read and parse the closed claims archive. Failure contract as per the
 * module doc.
 */
export async function readClosedClaimsFile(
  closedPath: string,
  readTextFile: ReadTextFile = readTextFileFromDisk,
): Promise<Result<ClosedClaimsArchive, Error>> {
  return readStateFile(closedPath, parseClosedClaimsArchive, readTextFile, {
    label: 'closed-claims archive',
    seedJson: EMPTY_CLOSED_CLAIMS_ARCHIVE_JSON,
  });
}

async function readStateFile<T>(
  path: string,
  parse: (text: string) => T,
  readTextFile: ReadTextFile,
  seed: { readonly label: string; readonly seedJson: string },
): Promise<Result<T, Error>> {
  // Owner ruling 2026-07-20: every failure flows out as an `Err` carrying
  // the ORIGINAL failure (ENOENT alone is enriched with the seed message);
  // the throw itself happens only at the result package's single
  // sanctioned edge when a caller unwraps — loud, destructive, cause
  // chain intact. No throw statements live here.
  let text: string;
  try {
    text = await readTextFile(path);
  } catch (error) {
    return err(
      isErrnoCode(error, 'ENOENT')
        ? missingStateFileError({ label: seed.label, path, seedJson: seed.seedJson, cause: error })
        : failureAsError(error),
    );
  }
  try {
    return ok(parse(text));
  } catch (error) {
    return err(failureAsError(error));
  }
}

/**
 * Narrow a caught failure to the `Err` channel without losing anything:
 * an Error-shaped failure passes through as ITSELF — the discrimination is
 * structural, not `instanceof`, so cross-realm and structurally-typed
 * `Error` values keep their identity exactly as the result package's raise
 * edge preserves them — while a genuinely non-Error throwable (an anomaly
 * worth surfacing) is named as such with the original preserved intact as
 * `cause`. Never a stringified summary.
 */
function failureAsError(failure: unknown): Error {
  return isErrorShaped(failure)
    ? failure
    : new Error('non-Error value thrown at the state-file read boundary', { cause: failure });
}

function isErrorShaped(failure: unknown): failure is Error {
  return (
    typeof failure === 'object' &&
    failure !== null &&
    'name' in failure &&
    'message' in failure &&
    typeof failure.name === 'string' &&
    typeof failure.message === 'string'
  );
}
