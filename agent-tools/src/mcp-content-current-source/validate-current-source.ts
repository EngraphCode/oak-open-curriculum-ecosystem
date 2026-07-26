#!/usr/bin/env node

/** Recomputes the MCP agent-facing current-source truth set; `--write` refreshes it. */

import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { resolveRepoRoot } from '../core/repo-root.js';
import { writeErrorLine, writeLine } from '../core/terminal-output.js';
import { buildCurrentSourceTruthSet } from './build-current-source-truth-set.js';
import { buildAnchoredDispositions } from './current-source-dispositions.js';
import {
  currentTargetsByAuditId,
  loadAnchorManifest,
  parseBaselineRows,
  readCurrentContent,
  type BaselineEvidenceRow,
} from './current-source-evidence-files.js';
import type {
  CurrentAuditDisposition,
  RegistrationEvidence,
  RegistrationRoot,
} from './current-source-model.js';
import { requireGuidanceRegistrationParity } from './guidance-registration-parity.js';
import { GUIDANCE_SOURCE_ENTRIES, PROMPT_ERA_LINEAGE_ENTRIES } from './prompt-era-lineage.js';
import { walkHttpRegistrationRoot } from './walk-http-registration-root.js';

const AUDIT_ROOT = '.agent/reports/mcp-agent-facing-content-audit';
const BASELINE_ARTIFACT = `${AUDIT_ROOT}/registry.json`;
const CURRENT_SOURCE_ARTIFACT = `${AUDIT_ROOT}/current-source.json`;
const CURRENT_SOURCE_ANCHORS = `${AUDIT_ROOT}/current-source-anchors.json`;
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

function sha256(content: string): string {
  return createHash('sha256').update(content).digest('hex');
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

function serialiseTruthSet(
  baseline: readonly BaselineEvidenceRow[],
  dispositions: {
    readonly current: readonly CurrentAuditDisposition[];
    readonly retiredAuditIds: readonly string[];
  },
  registrationRoot: RegistrationRoot,
): { readonly serialised: string; readonly itemCount: number } {
  const truthSet = buildCurrentSourceTruthSet({
    provenance: {
      title: 'Oak MCP agent-facing content current-source truth set',
      baselineCommit: BASELINE_COMMIT,
      baselineArtifact: BASELINE_ARTIFACT,
      baselineSha256: BASELINE_REGISTRY_SHA256,
      currentEvidence: [
        registrationRoot.rootRef,
        registrationRoot.registrationRef,
        'apps/oak-curriculum-mcp-streamable-http/src/served-surface/served-surface.ts',
        'packages/sdks/oak-curriculum-sdk/src/mcp/guidance-resources/agent-guidance-resources.ts',
      ],
      evidenceCeiling: [
        'This projection accounts for every immutable phase-(a) audit id with reviewed item-level token anchors, not source-file existence alone.',
        'Workspace scope and word authority are independent: scope follows workspace_scope; authority follows source_locus.',
        'The HTTP registration root is recomputed over an in-memory MCP transport; allowlist policy alone is not treated as proof of liveness.',
        'Per-item registration attribution is complete for the six prompt-to-guidance replacements in this first slice. Other current rows retain source custody and lifecycle truth; later migration slices add their exact channel bindings.',
        'Host delivery is not inferred from Oak registration. Host evidence remains empty until separately verified and dated.',
      ],
    },
    baseline,
    current: dispositions.current,
    retiredAuditIds: dispositions.retiredAuditIds,
    registrationRoots: [registrationRoot],
  });
  return {
    serialised: `${JSON.stringify(truthSet, null, 2)}\n`,
    itemCount: truthSet.summary.itemCount,
  };
}

async function recomputeCurrentSource(refreshAnchors: boolean): Promise<{
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
  const targetsByAuditId = await currentTargetsByAuditId(repoRoot, baseline, promptEraLineage);
  const anchorManifest = await loadAnchorManifest({
    repoRoot,
    anchorArtifact: CURRENT_SOURCE_ANCHORS,
    baselineCommit: BASELINE_COMMIT,
    baselineSha256: BASELINE_REGISTRY_SHA256,
    baseline,
    targetsByAuditId,
    refresh: refreshAnchors,
  });
  const registrationWalk = await walkHttpRegistrationRoot(repoRoot);
  const contentByFile = await readCurrentContent(
    repoRoot,
    anchorManifest.items.flatMap((item) => item.evidence.targets.map((target) => target.file)),
  );
  const dispositions = buildAnchoredDispositions({
    baseline,
    registrationsBySource: registrationWalk.guidanceRegistrationsBySource,
    targetsByAuditId,
    anchorManifest,
    contentByFile,
    baselineCommit: BASELINE_COMMIT,
    baselineSha256: BASELINE_REGISTRY_SHA256,
    anchorArtifact: CURRENT_SOURCE_ANCHORS,
  });
  requireCurrentSourceCoverage(
    dispositions.current,
    dispositions.missingAuditIds,
    registrationWalk.guidanceRegistrationsBySource,
  );
  return serialiseTruthSet(baseline, dispositions, registrationWalk.root);
}

async function main(): Promise<number> {
  const refreshAnchors = process.argv.includes('--refresh-anchors');
  const writeMode = process.argv.includes('--write') || refreshAnchors;
  const expected = await recomputeCurrentSource(refreshAnchors);
  const artifactPath = path.join(repoRoot, CURRENT_SOURCE_ARTIFACT);
  if (writeMode) {
    await writeFile(artifactPath, expected.serialised, 'utf8');
    if (refreshAnchors) {
      writeLine(`validate-current-source: wrote ${CURRENT_SOURCE_ANCHORS}`);
    }
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
