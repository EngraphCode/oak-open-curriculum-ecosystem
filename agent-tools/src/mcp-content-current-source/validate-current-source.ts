#!/usr/bin/env node

/** Recomputes the MCP agent-facing current-source truth set; `--write` refreshes it. */

import { createHash } from 'node:crypto';
import { access, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { resolveRepoRoot } from '../core/repo-root.js';
import { writeErrorLine, writeLine } from '../core/terminal-output.js';
import { buildCurrentSourceTruthSet } from './build-current-source-truth-set.js';
import type {
  BaselineAuditRow,
  CurrentAuditDisposition,
  RegistrationEvidence,
} from './current-source-model.js';
import { requireGuidanceRegistrationParity } from './guidance-registration-parity.js';
import { GUIDANCE_SOURCE_ENTRIES, PROMPT_ERA_LINEAGE_ENTRIES } from './prompt-era-lineage.js';
import { walkHttpRegistrationRoot } from './walk-http-registration-root.js';

const AUDIT_ROOT = '.agent/reports/mcp-agent-facing-content-audit';
const BASELINE_ARTIFACT = `${AUDIT_ROOT}/registry.json`;
const CURRENT_SOURCE_ARTIFACT = `${AUDIT_ROOT}/current-source.json`;
const BASELINE_COMMIT = '240a598607b96485f50c0dfd6df154d673a90a25';
const BASELINE_REGISTRY_SHA256 = '244f9ce421983fbc92dfd12db7d552cf61670c96353d16625adaf56a0bd8a78d';

const repoRoot = resolveRepoRoot(import.meta.url);
const alphabetical = (left: string, right: string) => left.localeCompare(right);
const guidanceSourcePaths = GUIDANCE_SOURCE_ENTRIES.map((entry) => entry[0]);

type RegistrationIndex = Readonly<Record<string, RegistrationEvidence>>;

function createPromptEraLineage(): ReadonlyMap<string, readonly string[]> {
  const lineage = new Map<string, readonly string[]>();
  for (const [id, targets] of PROMPT_ERA_LINEAGE_ENTRIES) {
    lineage.set(id, targets);
  }
  return lineage;
}

const promptEraLineage = createPromptEraLineage();

const baselineRegistrySchema = z
  .object({
    items: z.array(
      z
        .object({
          id: z.string().min(1),
          file: z.string().min(1),
          workspace_scope: z.enum(['in', 'out-upstream-api']),
        })
        .transform((item) => ({
          id: item.id,
          file: item.file,
          workspaceScope: item.workspace_scope,
        })),
    ),
  })
  .transform((registry) => registry.items);

function parseBaselineRows(json: string): readonly BaselineAuditRow[] {
  return baselineRegistrySchema.parse(JSON.parse(json));
}

function sha256(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

async function pathExists(repoRelativePath: string): Promise<boolean> {
  try {
    await access(path.join(repoRoot, repoRelativePath));
    return true;
  } catch {
    return false;
  }
}

function requireSameMembers(
  label: string,
  expected: readonly string[],
  actual: readonly string[],
): void {
  const sortedExpected = [...expected].sort(alphabetical);
  const sortedActual = [...actual].sort(alphabetical);
  if (JSON.stringify(sortedExpected) !== JSON.stringify(sortedActual)) {
    throw new Error(
      `${label} differ\nexpected: ${JSON.stringify(sortedExpected)}\n` +
        `actual: ${JSON.stringify(sortedActual)}`,
    );
  }
}

function registrationsForFiles(
  files: readonly string[],
  bySource: RegistrationIndex,
): readonly RegistrationEvidence[] {
  return files.flatMap((file) => {
    const registration = bySource[file];
    return registration === undefined ? [] : [registration];
  });
}

function requireCurrentSourceCoverage(
  current: readonly CurrentAuditDisposition[],
  missingAuditIds: readonly string[],
  registrationsBySource: RegistrationIndex,
): void {
  requireSameMembers(
    'Absent baseline rows and explicit prompt-era lineage',
    PROMPT_ERA_LINEAGE_ENTRIES.map((entry) => entry[0]),
    missingAuditIds,
  );
  const classifiedSources = new Set(current.flatMap((item) => item.files));
  requireSameMembers(
    'Current guidance replacements and classified current sources',
    guidanceSourcePaths,
    guidanceSourcePaths.filter((source) => classifiedSources.has(source)),
  );
  requireGuidanceRegistrationParity(GUIDANCE_SOURCE_ENTRIES, registrationsBySource);
}

async function buildDispositions(
  baseline: readonly BaselineAuditRow[],
  registrationsBySource: RegistrationIndex,
): Promise<{
  readonly current: readonly CurrentAuditDisposition[];
  readonly retiredAuditIds: readonly string[];
}> {
  const current: CurrentAuditDisposition[] = [];
  const retiredAuditIds: string[] = [];
  const missingAuditIds: string[] = [];

  for (const row of baseline) {
    if (await pathExists(row.file)) {
      current.push({
        auditId: row.id,
        files: [row.file],
        registrations: registrationsForFiles([row.file], registrationsBySource),
      });
      continue;
    }

    missingAuditIds.push(row.id);
    const targets = promptEraLineage.get(row.id);
    if (targets === undefined) {
      continue;
    }
    for (const target of targets) {
      if (!(await pathExists(target))) {
        throw new Error(`Lineage target does not exist for ${row.id}: ${target}`);
      }
    }
    if (targets.length === 0) {
      retiredAuditIds.push(row.id);
    } else {
      current.push({
        auditId: row.id,
        files: targets,
        registrations: registrationsForFiles(targets, registrationsBySource),
      });
    }
  }

  requireCurrentSourceCoverage(current, missingAuditIds, registrationsBySource);
  return { current, retiredAuditIds };
}

async function recomputeCurrentSource(): Promise<{
  readonly serialised: string;
  readonly itemCount: number;
}> {
  const baselinePath = path.join(repoRoot, BASELINE_ARTIFACT);
  const baselineJson = await readFile(baselinePath, 'utf8');
  const actualHash = sha256(baselineJson);
  if (actualHash !== BASELINE_REGISTRY_SHA256) {
    throw new Error(
      `${BASELINE_ARTIFACT} changed; phase-(a) is immutable\n` +
        `expected sha256: ${BASELINE_REGISTRY_SHA256}\nactual sha256:   ${actualHash}`,
    );
  }

  const baseline = parseBaselineRows(baselineJson);
  const registrationWalk = await walkHttpRegistrationRoot(repoRoot);
  const dispositions = await buildDispositions(
    baseline,
    registrationWalk.guidanceRegistrationsBySource,
  );
  const truthSet = buildCurrentSourceTruthSet({
    provenance: {
      title: 'Oak MCP agent-facing content current-source truth set',
      baselineCommit: BASELINE_COMMIT,
      baselineArtifact: BASELINE_ARTIFACT,
      baselineSha256: BASELINE_REGISTRY_SHA256,
      currentEvidence: [
        registrationWalk.root.rootRef,
        registrationWalk.root.registrationRef,
        'apps/oak-curriculum-mcp-streamable-http/src/served-surface/served-surface.ts',
        'packages/sdks/oak-curriculum-sdk/src/mcp/guidance-resources/agent-guidance-resources.ts',
      ],
      evidenceCeiling: [
        'This projection accounts for every immutable phase-(a) audit id against current source paths.',
        'The HTTP registration root is recomputed over an in-memory MCP transport; allowlist policy alone is not treated as proof of liveness.',
        'Per-item registration attribution is complete for the six prompt-to-guidance replacements in this first slice. Other current rows retain source custody and lifecycle truth; later migration slices add their exact channel bindings.',
        'Host delivery is not inferred from Oak registration. Host evidence remains empty until separately verified and dated.',
      ],
    },
    baseline,
    current: dispositions.current,
    retiredAuditIds: dispositions.retiredAuditIds,
    registrationRoots: [registrationWalk.root],
  });
  return {
    serialised: `${JSON.stringify(truthSet, null, 2)}\n`,
    itemCount: truthSet.summary.itemCount,
  };
}

async function main(): Promise<number> {
  const writeMode = process.argv.includes('--write');
  const expected = await recomputeCurrentSource();
  const artifactPath = path.join(repoRoot, CURRENT_SOURCE_ARTIFACT);
  if (writeMode) {
    await writeFile(artifactPath, expected.serialised, 'utf8');
    writeLine(`validate-current-source: wrote ${CURRENT_SOURCE_ARTIFACT}`);
    return 0;
  }

  const actual = await readFile(artifactPath, 'utf8').catch(() => null);
  if (actual !== expected.serialised) {
    writeErrorLine(
      `validate-current-source: ${CURRENT_SOURCE_ARTIFACT} is missing or stale; ` +
        'run this validator with --write and review the generated diff',
    );
    return 1;
  }
  writeLine(
    `validate-current-source: OK (${String(expected.itemCount)} audit ids accounted; HTTP registration root walked).`,
  );
  return 0;
}

process.exitCode = await main().catch((error: unknown) => {
  writeErrorLine(
    `validate-current-source: ${error instanceof Error ? error.message : String(error)}`,
  );
  return 1;
});
