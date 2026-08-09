/**
 * Skills adapter drift checker.
 *
 * Generates adapter content in memory and compares it bytewise against the
 * on-disk adapters. Read-only. Used by `skills-adapter-generate --check` to
 * gate CI / pre-merge runs against drift between canonical sources and their
 * generated adapter pointers.
 *
 * Discovery is shared with the generator ({@link discoverCanonicals}) so the
 * checker walks exactly the corpus the generator would emit — flat
 * individuals and family bundles alike. I/O is injected through the
 * {@link DiscoveryFs} seam so unit tests can pass a deterministic in-memory
 * map without touching the real filesystem.
 */
import { readFile, readdir } from 'node:fs/promises';

import {
  adapterTargetPath,
  discoverCanonicals,
  renderAdapter,
  type AdapterSurface,
  type DiscoveryFs,
  type GeneratorOptions,
} from './generator.js';

const SURFACES: readonly AdapterSurface[] = ['claude', 'agents'];

export interface CheckOutcome {
  readonly drifted: readonly string[];
  readonly missing: readonly string[];
  /** Leaf ids contending for one flat adapter name — a failing state: the
   * on-disk adapter can only match one claimant, silently shadowing the
   * other. Mirrors the generator's emission refusal. */
  readonly duplicates: readonly string[];
  /** Directories discovery walked past without producing a canonical — a
   * failing state in check mode exactly as in generate mode: a skipped
   * directory is content no harness can summon, and a checker that stays
   * green over it certifies an incomplete corpus (worked instance: nine
   * canonicals sat unsummonable on main behind a green `--check`). */
  readonly skipped: readonly string[];
}

export type CheckerFs = DiscoveryFs;

const defaultCheckerFs: CheckerFs = {
  async readFileOrUndefined(path) {
    try {
      return await readFile(path, 'utf8');
    } catch {
      return undefined;
    }
  },
  async listSubdirectoryNames(path) {
    try {
      const dirents = await readdir(path, { withFileTypes: true });
      return dirents.filter((d) => d.isDirectory()).map((d) => d.name);
    } catch {
      return [];
    }
  },
};

export async function checkAdapters(
  options: GeneratorOptions,
  fs: CheckerFs = defaultCheckerFs,
): Promise<CheckOutcome> {
  const drifted: string[] = [];
  const missing: string[] = [];
  const discovery = await discoverCanonicals(options.repoRoot, fs);

  for (const parsed of discovery.canonicals) {
    for (const surface of SURFACES) {
      const target = adapterTargetPath(options.repoRoot, options.prefix, parsed.id, surface);
      const expected = renderAdapter(parsed, options.prefix, surface);
      const actual = await fs.readFileOrUndefined(target);
      if (actual === undefined) {
        missing.push(target);
      } else if (actual !== expected) {
        drifted.push(target);
      }
    }
  }

  return { drifted, missing, duplicates: discovery.duplicates, skipped: discovery.skipped };
}
