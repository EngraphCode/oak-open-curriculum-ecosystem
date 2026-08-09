/**
 * Skills adapter generator.
 *
 * Discovers canonical skills under `.agent/skills/` (flat individuals and
 * concern-tier members — see `discovery.ts`) and emits two adapter surfaces per
 * skill:
 *
 *   - `.claude/skills/<prefix><id>/SKILL.md`  — Claude Code adapter
 *   - `.agents/skills/<prefix><id>/SKILL.md`  — cross-tool stub (Codex, Cursor, Gemini)
 *
 * Adapters are stub pointers: their body links back to the canonical, which
 * remains the single source of truth for workflow content.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { stringify as stringifyYaml } from 'yaml';

import {
  discoverCanonicals,
  type CanonicalFrontmatter,
  type ParsedCanonical,
} from './discovery.js';

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
}

interface AdapterFrontmatter {
  readonly name: string;
  readonly description: string;
}

export type AdapterSurface = 'claude' | 'agents';
export type ParsedCanonicalSkill = ParsedCanonical;

/**
 * Discover, parse, and emit adapters for every canonical skill under
 * `.agent/skills/`. Idempotent — re-running yields byte-identical adapter
 * files when the canonicals are unchanged. Duplicate leaf ids refuse the
 * whole emission: the adapter namespace is flat, and writing either claimant
 * would silently shadow the other.
 */
export async function generateAdapters(options: GeneratorOptions): Promise<GenerateOutcome> {
  const written: string[] = [];
  const discovery = await discoverCanonicals(options.repoRoot);

  if (discovery.duplicates.length > 0) {
    return { written, skipped: discovery.skipped, duplicates: discovery.duplicates };
  }
  for (const parsed of discovery.canonicals) {
    const claudeWritten = await emitAdapter(options, parsed, 'claude');
    const agentsWritten = await emitAdapter(options, parsed, 'agents');
    written.push(claudeWritten, agentsWritten);
  }

  return { written, skipped: discovery.skipped, duplicates: discovery.duplicates };
}

async function emitAdapter(
  options: GeneratorOptions,
  parsed: ParsedCanonical,
  surface: AdapterSurface,
): Promise<string> {
  const target = adapterTargetPath(options.repoRoot, options.prefix, parsed.id, surface);
  const fileContent = renderAdapter(parsed, options.prefix, surface);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, fileContent, 'utf8');
  return target;
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
    `Read and follow \`.agent/skills/${relativeDir}/${canonicalFilename}\`.`,
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
 * leaf id means two canonicals contending for one flat adapter name.
 * Both states must fail loudly rather than ride a warning line to a
 * zero exit (which is how an unsummonable corpus stays silently green).
 */
export function generateExitCode(outcome: GenerateOutcome): number {
  return outcome.skipped.length > 0 || outcome.duplicates.length > 0 ? 1 : 0;
}
