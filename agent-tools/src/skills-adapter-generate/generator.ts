/**
 * Skills adapter generator.
 *
 * Discovers canonical skills under `.agent/skills/` (flat individuals,
 * concern-tier members, and domain-tier members — see `discovery.ts`) and
 * emits two adapter surfaces per skill:
 *
 *   - `.claude/skills/<prefix><id>/SKILL.md`  — Claude Code adapter
 *   - `.agents/skills/<prefix><id>/SKILL.md`  — cross-tool stub (Codex, Cursor, Gemini)
 *
 * Adapters are stub pointers: their body links back to the canonical, which
 * remains the single source of truth for workflow content. Supporting
 * directories (`scripts/`, `references/`, `assets/` — never `evals/`) are
 * carried beside each adapter as byte-stable copies, and carried copies
 * whose canonical source is gone are pruned — see `carriage.ts`.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { stringify as stringifyYaml } from 'yaml';

import { adapterStubPointerLine } from './adapter-stub.js';
import { realCarriageWriteFs, syncCarriage } from './carriage.js';
import {
  discoverCanonicals,
  type CanonicalFrontmatter,
  type ParsedCanonical,
} from './discovery.js';
import { isDiscoveryComplete, sweepStaleProjections } from './projection-roots.js';

export { discoverCanonicals, parseFrontmatter, type DiscoveryFs } from './discovery.js';

const ADAPTER_FILENAME = 'SKILL.md';

export interface GeneratorOptions {
  readonly repoRoot: string;
  readonly prefix: string;
}

export interface GenerateOutcome {
  readonly written: readonly string[];
  readonly skipped: readonly string[];
  readonly duplicates: readonly string[];
  /** Carried copies removed because their canonical source is gone. A cure
   * the run applied, reported for observability — never a failure state. */
  readonly pruned: readonly string[];
  /** Refusals — canonical-side symlinks and seam read failures. A refused
   * skill emits NOTHING (no adapter, no carriage, no pruning): destructive
   * reconciliation over a partially observed tree is how valid copies get
   * deleted. A refusal fails the run. */
  readonly refused: readonly string[];
  /** Whole stale projection-root entries the sweep removed (directories,
   * root-level links) — reported separately from `pruned` so the operator
   * never reads a swept directory as an orphaned carried file. */
  readonly sweptStale: readonly string[];
}

interface AdapterFrontmatter {
  readonly name: string;
  readonly description: string;
}

export type AdapterSurface = 'claude' | 'agents';
export type ParsedCanonicalSkill = ParsedCanonical;

/**
 * Discover, parse, and emit adapters for every canonical skill under
 * `.agent/skills/`, carrying each skill's supporting directories beside the
 * adapter and pruning orphaned carried copies. Idempotent — re-running
 * yields byte-identical projection files when the canonicals are unchanged.
 * Duplicate leaf ids refuse the whole emission: the adapter namespace is
 * flat, and writing either claimant would silently shadow the other.
 */
export async function generateAdapters(options: GeneratorOptions): Promise<GenerateOutcome> {
  const discovery = await discoverCanonicals(options.repoRoot);
  const empty = {
    written: [],
    pruned: [],
    refused: [],
    sweptStale: [],
    skipped: discovery.skipped,
    duplicates: discovery.duplicates,
  };

  if (discovery.duplicates.length > 0) {
    return empty;
  }
  // NOTHING runs over an incomplete discovery — not the sweep and not
  // emission. A skipped directory or an empty canonical set means an
  // unreadable canonical or skills root read as absent, so both the
  // expected-projection set AND the per-skill write targets are
  // unverified: the round-4 probe showed a symlinked projection root
  // being written through (and its contents deleted) exactly because
  // emission continued while the sweep had stood down. The run already
  // exits non-zero on the skipped / no-canonicals streams; a
  // half-applied cure over an unobserved tree is the shape this round
  // deletes.
  if (!isDiscoveryComplete(discovery)) {
    return empty;
  }
  // Sweep BEFORE emission: stale Practice projections (canonical deleted or
  // renamed) leave the surfaces first, so no adapter is ever written into an
  // entry the sweep is about to adjudicate. A sweep read failure refuses the
  // whole run.
  const sweepOutcome = await sweepStaleProjections({
    repoRoot: options.repoRoot,
    projections: discovery.canonicals.map((parsed) => ({
      canonicalRef: `${parsed.relativeDir}/${parsed.canonicalFilename}`,
      expectedName: `${options.prefix}${parsed.id}`,
    })),
    discoveryComplete: true,
  });
  if (sweepOutcome.refusedRun.length > 0) {
    return { ...empty, refused: [...sweepOutcome.refusedRun] };
  }
  const emitted = await emitAllAdapters(options, discovery.canonicals);
  return { ...empty, ...emitted, sweptStale: [...sweepOutcome.pruned] };
}

async function emitAllAdapters(
  options: GeneratorOptions,
  canonicals: readonly ParsedCanonical[],
): Promise<Pick<GenerateOutcome, 'written' | 'pruned' | 'refused'>> {
  const written: string[] = [];
  const pruned: string[] = [];
  const refused: string[] = [];
  for (const parsed of canonicals) {
    for (const surface of ['claude', 'agents'] as const) {
      const emitted = await emitAdapter(options, parsed, surface);
      written.push(...emitted.written);
      pruned.push(...emitted.pruned);
      refused.push(...emitted.refused);
    }
  }
  return { written, pruned, refused };
}

interface EmitAdapterOutcome {
  readonly written: readonly string[];
  readonly pruned: readonly string[];
  readonly refused: readonly string[];
}

async function emitAdapter(
  options: GeneratorOptions,
  parsed: ParsedCanonical,
  surface: AdapterSurface,
): Promise<EmitAdapterOutcome> {
  const target = adapterTargetPath(options.repoRoot, options.prefix, parsed.id, surface);
  // Carriage first: a refused sync (canonical symlink, seam read failure)
  // refuses the whole skill on this surface — not even the adapter stub is
  // written over a state the run could not fully observe.
  const carriage = await syncCarriage(
    dirname(parsed.canonicalPath),
    dirname(target),
    realCarriageWriteFs,
  );
  if (carriage.refused.length > 0) {
    return { written: [], pruned: [], refused: carriage.refused };
  }
  const fileContent = renderAdapter(parsed, options.prefix, surface);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, fileContent, 'utf8');
  return { written: [target, ...carriage.carried], pruned: carriage.pruned, refused: [] };
}

export function renderAdapter(
  parsed: ParsedCanonicalSkill,
  prefix: string,
  surface: AdapterSurface,
): string {
  const frontmatter = buildAdapterFrontmatter(parsed.frontmatter, prefix, parsed.id);
  const surfaceLabel = surface === 'claude' ? 'Claude Code' : 'Cross-tool';
  const body = renderAdapterBody(
    parsed.id,
    parsed.relativeDir,
    surfaceLabel,
    parsed.canonicalFilename,
  );
  const yamlBlock = stringifyYaml(frontmatter, { lineWidth: 0 }).trimEnd();
  return `---\n${yamlBlock}\n---\n\n${body.trimStart()}`;
}

export function adapterTargetPath(
  repoRoot: string,
  prefix: string,
  canonicalId: string,
  surface: AdapterSurface,
): string {
  const surfaceRoot = surface === 'claude' ? '.claude' : '.agents';
  return join(repoRoot, surfaceRoot, 'skills', `${prefix}${canonicalId}`, ADAPTER_FILENAME);
}

/**
 * Construct the adapter frontmatter from the canonical's frontmatter.
 * Always renames the skill: `<prefix><id>`. Description is preserved.
 */
export function buildAdapterFrontmatter(
  canonical: CanonicalFrontmatter,
  prefix: string,
  id: string,
): AdapterFrontmatter {
  return {
    name: `${prefix}${id}`,
    description: canonical.description,
  };
}

/**
 * The stub body's pointer line is the Practice-projection CLASS MARKER:
 * the sweep, the clear pass, and the permission census recognise our
 * projections by parsing it back — built via the one shared definition
 * in `adapter-stub.ts`.
 */
function renderAdapterBody(
  canonicalId: string,
  relativeDir: string,
  surfaceLabel: string,
  canonicalFilename: string,
): string {
  const title = toTitleCase(canonicalId);
  return [
    `# ${title} (${surfaceLabel})`,
    '',
    adapterStubPointerLine(`${relativeDir}/${canonicalFilename}`),
    '',
  ].join('\n');
}

function toTitleCase(id: string): string {
  return id
    .split('-')
    .map((part) => (part.length === 0 ? part : `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`))
    .join(' ');
}

/**
 * A skipped directory means a canonical the generator could not read —
 * content sitting in the corpus that no harness can summon. A duplicate
 * leaf id means two canonicals contending for one flat adapter name. A
 * refusal means a canonical symlink or a read failure stopped a skill's
 * emission. All three states must fail loudly rather than ride a warning
 * line to a zero exit (which is how an unsummonable corpus stays silently
 * green).
 */
export function generateExitCode(outcome: GenerateOutcome): number {
  return outcome.skipped.length > 0 || outcome.duplicates.length > 0 || outcome.refused.length > 0
    ? 1
    : 0;
}
