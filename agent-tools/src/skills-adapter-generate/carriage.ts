/**
 * Supporting-directory carriage for skill projections.
 *
 * A canonical skill may carry supporting directories per the agent-skills
 * spec's optional-directory set — `scripts/`, `references/`, `assets/` —
 * and the projection surfaces must serve them byte-stably beside each
 * generated `SKILL.md`, or the projected skill silently loses the substance
 * its entry file points at. `evals/` is deliberately NOT carried: evals are
 * development/QA artifacts, not runtime skill content (skill-standard-pilot
 * plan, carriage decision). Empty directories are omitted, never
 * scaffolded — carriage moves files, and a directory exists in a projection
 * only because a carried file lives in it (git cannot represent an empty
 * directory, so a scaffolded one could not survive a fresh checkout anyway).
 *
 * The generated skill directory is generator-owned in whole (the `--clear`
 * path already removes it wholesale), so any file in it beyond the generated
 * `SKILL.md` and the expected carried set is an orphan: a copy whose
 * canonical source is gone. The checker reports orphans; a generator run
 * prunes them.
 *
 * I/O is injected through the {@link CarriageReadFs}/{@link CarriageWriteFs}
 * seams (defined with their real-filesystem adapters in `carriage-fs.ts`),
 * mirroring the checker's pattern, so unit tests run on deterministic
 * in-memory maps.
 */
import { join } from 'node:path';

import type { CarriageReadFs, CarriageWriteFs } from './carriage-fs.js';

export {
  realCarriageReadFs,
  realCarriageWriteFs,
  type CarriageReadFs,
  type CarriageWriteFs,
} from './carriage-fs.js';

/**
 * The carried supporting-directory names (spec §optional-directories).
 * `evals/` is excluded by decision, not omission — see the module doc.
 */
export const CARRIED_DIRECTORY_NAMES = ['assets', 'references', 'scripts'] as const;

const ADAPTER_ENTRY_FILENAME = 'SKILL.md';

/** Deterministic, locale-pinned path ordering for emission and reporting. */
const byPath = (a: string, b: string): number => a.localeCompare(b, 'en');

/**
 * Enumerate the canonical skill's carried files as sorted
 * projection-relative paths (e.g. `references/family/architecture.md`).
 * Only files under {@link CARRIED_DIRECTORY_NAMES} qualify; nesting is
 * unbounded below a carried root. Sorted for deterministic emission,
 * comparison, and reporting.
 */
export async function collectCarriedFiles(
  canonicalDir: string,
  fs: CarriageReadFs,
): Promise<readonly string[]> {
  const collected: string[] = [];
  for (const directoryName of CARRIED_DIRECTORY_NAMES) {
    await collectFilesUnder(join(canonicalDir, directoryName), directoryName, fs, collected);
  }
  return collected.sort(byPath);
}

/**
 * Enumerate every file in the generated skill directory except its
 * top-level `SKILL.md`, as sorted directory-relative paths. This is the
 * orphan-detection ground truth: the projection holds exactly the entry
 * file plus the carried set, and anything else is a copy without a source.
 */
async function collectProjectionFiles(
  adapterDir: string,
  fs: CarriageReadFs,
): Promise<readonly string[]> {
  const collected: string[] = [];
  for (const fileName of await fs.listFileNames(adapterDir)) {
    if (fileName !== ADAPTER_ENTRY_FILENAME) {
      collected.push(fileName);
    }
  }
  for (const directoryName of await fs.listSubdirectoryNames(adapterDir)) {
    await collectFilesUnder(join(adapterDir, directoryName), directoryName, fs, collected);
  }
  return collected.sort(byPath);
}

async function collectFilesUnder(
  absoluteDir: string,
  relativeDir: string,
  fs: CarriageReadFs,
  collected: string[],
): Promise<void> {
  for (const fileName of await fs.listFileNames(absoluteDir)) {
    collected.push(`${relativeDir}/${fileName}`);
  }
  for (const childName of await fs.listSubdirectoryNames(absoluteDir)) {
    await collectFilesUnder(
      join(absoluteDir, childName),
      `${relativeDir}/${childName}`,
      fs,
      collected,
    );
  }
}

/** Read-only carriage verdict for one skill on one projection surface. */
export interface CarriageCheck {
  /** Expected carried files absent from the projection (absolute paths). */
  readonly missing: readonly string[];
  /** Carried files whose projection bytes differ from the canonical. */
  readonly drifted: readonly string[];
  /** Projection files whose canonical source is gone (absolute paths). */
  readonly orphaned: readonly string[];
  /** How many carried files the canonical declares for this skill. */
  readonly carriedCount: number;
}

/**
 * Compare one skill's carried set against one projection surface, bytewise,
 * and detect orphans. Read-only — the generator's {@link syncCarriage} is
 * the curing counterpart.
 */
export async function checkCarriage(
  canonicalDir: string,
  adapterDir: string,
  fs: CarriageReadFs,
): Promise<CarriageCheck> {
  const carried = await collectCarriedFiles(canonicalDir, fs);
  const missing: string[] = [];
  const drifted: string[] = [];

  for (const relativePath of carried) {
    const targetPath = join(adapterDir, relativePath);
    const expected = await fs.readFileBytesOrUndefined(join(canonicalDir, relativePath));
    const actual = await fs.readFileBytesOrUndefined(targetPath);
    if (actual === undefined) {
      missing.push(targetPath);
    } else if (expected === undefined || !bytesEqual(expected, actual)) {
      drifted.push(targetPath);
    }
  }

  const carriedSet = new Set(carried);
  const orphaned = (await collectProjectionFiles(adapterDir, fs))
    .filter((relativePath) => !carriedSet.has(relativePath))
    .map((relativePath) => join(adapterDir, relativePath));

  return { missing, drifted, orphaned, carriedCount: carried.length };
}

/** Outcome of one skill/surface carriage sync (absolute paths). */
export interface SyncCarriageOutcome {
  readonly carried: readonly string[];
  readonly pruned: readonly string[];
}

/**
 * Make one projection surface's carried set true for one skill: copy every
 * canonical carried file byte-stably (unconditionally — the copy is the
 * cure for drift), prune every orphan, and sweep directories the pruning
 * emptied so the projection never accumulates scaffolding.
 */
export async function syncCarriage(
  canonicalDir: string,
  adapterDir: string,
  fs: CarriageWriteFs,
): Promise<SyncCarriageOutcome> {
  const carriedRelative = await collectCarriedFiles(canonicalDir, fs);
  const carriedSet = new Set(carriedRelative);
  const carried: string[] = [];
  const pruned: string[] = [];

  for (const relativePath of carriedRelative) {
    const targetPath = join(adapterDir, relativePath);
    await fs.copyFileWithParents(join(canonicalDir, relativePath), targetPath);
    carried.push(targetPath);
  }

  for (const relativePath of await collectProjectionFiles(adapterDir, fs)) {
    if (!carriedSet.has(relativePath)) {
      await fs.removeFile(join(adapterDir, relativePath));
      pruned.push(join(adapterDir, relativePath));
    }
  }

  await removeEmptiedDirectories(adapterDir, fs);

  return { carried, pruned };
}

/**
 * Bottom-up sweep removing directories the orphan pruning emptied. The
 * skill directory itself is never removed — it always holds `SKILL.md`.
 */
async function removeEmptiedDirectories(adapterDir: string, fs: CarriageWriteFs): Promise<void> {
  for (const childName of await fs.listSubdirectoryNames(adapterDir)) {
    await removeIfEmptyDeep(join(adapterDir, childName), fs);
  }
}

async function removeIfEmptyDeep(absoluteDir: string, fs: CarriageWriteFs): Promise<void> {
  for (const childName of await fs.listSubdirectoryNames(absoluteDir)) {
    await removeIfEmptyDeep(join(absoluteDir, childName), fs);
  }
  await fs.removeDirectoryIfEmpty(absoluteDir);
}

function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((byte, index) => byte === right[index]);
}
