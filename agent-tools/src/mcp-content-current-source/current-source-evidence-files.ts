import { execFileSync } from 'node:child_process';
import { access, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { resolveTrustedGit } from '../core/trusted-git.js';
import {
  CURRENT_ITEM_ANCHOR_OVERRIDES,
  CURRENT_ITEM_REVISION_OVERRIDES,
} from './current-item-anchor-overrides.js';
import {
  buildCurrentSourceAnchorManifest,
  type BaselineAnchorRow,
} from './current-source-anchor-manifest.js';
import type { BaselineAuditRow, CurrentSourceAnchorManifest } from './current-source-model.js';

export type BaselineEvidenceRow = BaselineAuditRow & BaselineAnchorRow;

const baselineRegistrySchema = z
  .object({
    items: z.array(
      z
        .object({
          id: z.string().min(1),
          file: z.string().min(1),
          lines: z.string().min(1),
          workspace_scope: z.enum(['in', 'out-upstream-api']),
          source_locus: z.enum([
            'this-repo',
            'upstream-in-house-api',
            'upstream-in-house-skills',
            'external-third-party',
          ]),
        })
        .transform((item) => ({
          id: item.id,
          file: item.file,
          lines: item.lines,
          workspaceScope: item.workspace_scope,
          sourceLocus: item.source_locus,
        })),
    ),
  })
  .transform((registry) => registry.items);

const tokenAnchorSchema = z.object({
  tokenCount: z.number().int().positive(),
  tokenSha256: z.string().regex(/^[a-f0-9]{64}$/),
  indexToken: z.string().min(1),
  indexOffset: z.number().int().nonnegative(),
});

const currentSourceAnchorManifestSchema = z.object({
  schemaVersion: z.literal(1),
  baselineCommit: z.string().min(1),
  baselineSha256: z.string().regex(/^[a-f0-9]{64}$/),
  items: z.array(
    z.object({
      auditId: z.string().min(1),
      evidence: z.object({
        revision: z.enum(['unchanged', 'expanded', 'modified', 'relocated']),
        targets: z
          .array(
            z.object({
              file: z.string().min(1),
              anchors: z.array(tokenAnchorSchema).min(1),
            }),
          )
          .min(1),
      }),
    }),
  ),
});

export function parseBaselineRows(json: string): readonly BaselineEvidenceRow[] {
  return baselineRegistrySchema.parse(JSON.parse(json));
}

function parseAnchorManifest(json: string): CurrentSourceAnchorManifest {
  return currentSourceAnchorManifestSchema.parse(JSON.parse(json));
}

async function pathExists(repoRoot: string, repoRelativePath: string): Promise<boolean> {
  try {
    await access(path.join(repoRoot, repoRelativePath));
    return true;
  } catch {
    return false;
  }
}

export async function currentTargetsByAuditId(
  repoRoot: string,
  baseline: readonly BaselineEvidenceRow[],
  promptEraLineage: ReadonlyMap<string, readonly string[]>,
): Promise<ReadonlyMap<string, readonly string[]>> {
  const targets = new Map<string, readonly string[]>();
  for (const row of baseline) {
    if (await pathExists(repoRoot, row.file)) {
      targets.set(row.id, [row.file]);
      continue;
    }
    const lineageTargets = promptEraLineage.get(row.id);
    if (lineageTargets === undefined) {
      throw new Error(`Missing current source and explicit lineage for ${row.id}: ${row.file}`);
    }
    targets.set(row.id, lineageTargets);
  }
  return targets;
}

export async function readCurrentContent(
  repoRoot: string,
  files: readonly string[],
): Promise<ReadonlyMap<string, string>> {
  const entries = await Promise.all(
    [...new Set(files)].map(
      async (file) => [file, await readFile(path.join(repoRoot, file), 'utf8')] as const,
    ),
  );
  return new Map(entries);
}

function readBaselineContent(
  repoRoot: string,
  baselineCommit: string,
  files: readonly string[],
): ReadonlyMap<string, string> {
  return new Map(
    [...new Set(files)].map((file) => [
      file,
      execFileSync(resolveTrustedGit(), ['show', `${baselineCommit}:${file}`], {
        cwd: repoRoot,
        encoding: 'utf8',
      }),
    ]),
  );
}

interface LoadAnchorManifestInput {
  readonly repoRoot: string;
  readonly anchorArtifact: string;
  readonly baselineCommit: string;
  readonly baselineSha256: string;
  readonly baseline: readonly BaselineEvidenceRow[];
  readonly targetsByAuditId: ReadonlyMap<string, readonly string[]>;
  readonly refresh: boolean;
}

export async function loadAnchorManifest(
  input: LoadAnchorManifestInput,
): Promise<CurrentSourceAnchorManifest> {
  const artifactPath = path.join(input.repoRoot, input.anchorArtifact);
  if (!input.refresh) {
    return parseAnchorManifest(await readFile(artifactPath, 'utf8'));
  }
  const manifest = buildCurrentSourceAnchorManifest({
    baselineCommit: input.baselineCommit,
    baselineSha256: input.baselineSha256,
    rows: input.baseline,
    targetsByAuditId: input.targetsByAuditId,
    baselineContentByFile: readBaselineContent(
      input.repoRoot,
      input.baselineCommit,
      input.baseline.map((row) => row.file),
    ),
    currentContentByFile: await readCurrentContent(
      input.repoRoot,
      [...input.targetsByAuditId.values()].flat(),
    ),
    overrides: CURRENT_ITEM_ANCHOR_OVERRIDES,
    revisionOverrides: CURRENT_ITEM_REVISION_OVERRIDES,
  });
  await writeFile(artifactPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return manifest;
}
