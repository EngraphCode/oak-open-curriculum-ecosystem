/**
 * Skills adapter drift checker.
 *
 * Generates adapter content in memory and compares it bytewise against the
 * on-disk adapters, and compares every carried supporting file (`scripts/`,
 * `references/`, `assets/` — see `carriage.ts`) bytewise against its
 * canonical source. Read-only. Used by `skills-adapter-generate --check` to
 * gate CI / pre-merge runs against drift between canonical sources and their
 * generated projections.
 *
 * Discovery is shared with the generator ({@link discoverCanonicals}) so the
 * checker walks exactly the corpus the generator would emit — flat
 * individuals, concern-tier members, and domain-tier members alike. I/O is
 * injected through the {@link CheckerFs} seam so unit tests can pass a
 * deterministic in-memory map without touching the real filesystem.
 */
import { readFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import {
  checkCarriage,
  collectCarriedFiles,
  realCarriageReadFs,
  type CarriageReadFs,
} from './carriage.js';
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
  /** Projection files whose canonical source is gone — a failing state: a
   * copy without a source serves content nobody authors any more. The
   * generator run prunes these; the checker only reports them. */
  readonly orphaned: readonly string[];
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
  /** How many canonicals discovery produced. Zero is never a healthy estate
   * state — it means a missing or unreadable `.agent/skills` root (the
   * injected fs collapses read errors to empty lists), and check mode must
   * refuse rather than certify an empty corpus as up to date. */
  readonly canonicalCount: number;
  /** How many carried supporting files the canonical corpus declares (per
   * skill, before the ×2 surface fan-out). Reported so a run over the live
   * estate proves the whole carried set was compared — a silent subset
   * would show up as a wrong count, not a green lie. */
  readonly carriedFileCount: number;
}

export type CheckerFs = DiscoveryFs & CarriageReadFs;

const defaultCheckerFs: CheckerFs = {
  ...realCarriageReadFs,
  async readFileOrUndefined(path) {
    try {
      return await readFile(path, 'utf8');
    } catch {
      return undefined;
    }
  },
};

export async function checkAdapters(
  options: GeneratorOptions,
  fs: CheckerFs = defaultCheckerFs,
): Promise<CheckOutcome> {
  const drifted: string[] = [];
  const missing: string[] = [];
  const orphaned: string[] = [];
  let carriedFileCount = 0;
  const discovery = await discoverCanonicals(options.repoRoot, fs);

  for (const parsed of discovery.canonicals) {
    const canonicalDir = dirname(parsed.canonicalPath);
    for (const surface of SURFACES) {
      const target = adapterTargetPath(options.repoRoot, options.prefix, parsed.id, surface);
      const expected = renderAdapter(parsed, options.prefix, surface);
      const actual = await fs.readFileOrUndefined(target);
      if (actual === undefined) {
        missing.push(target);
      } else if (actual !== expected) {
        drifted.push(target);
      }

      const carriage = await checkCarriage(canonicalDir, dirname(target), fs);
      missing.push(...carriage.missing);
      drifted.push(...carriage.drifted);
      orphaned.push(...carriage.orphaned);
    }
    // Counted once per skill: the carried set is per-canonical; the surface
    // loop above compared its ×2 fan-out.
    carriedFileCount += (await collectCarriedFiles(canonicalDir, fs)).length;
  }

  return {
    drifted,
    missing,
    orphaned,
    duplicates: discovery.duplicates,
    skipped: discovery.skipped,
    canonicalCount: discovery.canonicals.length,
    carriedFileCount,
  };
}
