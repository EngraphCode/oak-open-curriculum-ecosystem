import type {
  CurrentAuditDisposition,
  CurrentItemEvidence,
  CurrentSourceAnchorManifest,
  RegistrationEvidence,
} from './current-source-model.js';
import type { BaselineEvidenceRow } from './current-source-evidence-files.js';
import { requireItemEvidenceTargets } from './item-anchor-evidence.js';

type RegistrationIndex = Readonly<Record<string, RegistrationEvidence>>;
const alphabetical = (left: string, right: string) => left.localeCompare(right);

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

function evidenceByAuditId(
  manifest: CurrentSourceAnchorManifest,
): ReadonlyMap<string, CurrentItemEvidence> {
  const ids = manifest.items.map((item) => item.auditId);
  requireSameMembers('Unique current item anchor ids', ids, [...new Set(ids)]);
  return new Map(manifest.items.map((item) => [item.auditId, item.evidence]));
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

function buildCurrentDisposition(
  row: BaselineEvidenceRow,
  targets: readonly string[],
  evidence: CurrentItemEvidence,
  registrationsBySource: RegistrationIndex,
  contentByFile: ReadonlyMap<string, string>,
): CurrentAuditDisposition {
  requireSameMembers(
    `Current targets and item evidence targets for ${row.id}`,
    targets,
    evidence.targets.map((target) => target.file),
  );
  requireItemEvidenceTargets(row.id, evidence.targets, contentByFile);
  return {
    auditId: row.id,
    files: targets,
    evidence,
    registrations: registrationsForFiles(targets, registrationsBySource),
  };
}

interface BuildDispositionsInput {
  readonly baseline: readonly BaselineEvidenceRow[];
  readonly registrationsBySource: RegistrationIndex;
  readonly targetsByAuditId: ReadonlyMap<string, readonly string[]>;
  readonly anchorManifest: CurrentSourceAnchorManifest;
  readonly contentByFile: ReadonlyMap<string, string>;
  readonly baselineCommit: string;
  readonly baselineSha256: string;
  readonly anchorArtifact: string;
}

export function buildAnchoredDispositions(input: BuildDispositionsInput): {
  readonly current: readonly CurrentAuditDisposition[];
  readonly retiredAuditIds: readonly string[];
  readonly missingAuditIds: readonly string[];
} {
  if (
    input.anchorManifest.baselineCommit !== input.baselineCommit ||
    input.anchorManifest.baselineSha256 !== input.baselineSha256
  ) {
    throw new Error(`${input.anchorArtifact} does not bind the immutable phase-(a) baseline`);
  }
  const anchorsById = evidenceByAuditId(input.anchorManifest);
  const expectedAnchoredIds = input.baseline
    .filter((row) => (input.targetsByAuditId.get(row.id)?.length ?? 0) > 0)
    .map((row) => row.id);
  requireSameMembers('Available audit ids and current item anchor ids', expectedAnchoredIds, [
    ...anchorsById.keys(),
  ]);

  const current: CurrentAuditDisposition[] = [];
  const retiredAuditIds: string[] = [];
  for (const row of input.baseline) {
    const targets = input.targetsByAuditId.get(row.id);
    if (targets === undefined) {
      throw new Error(`Current targets are unaccounted for audit item ${row.id}`);
    }
    if (targets.length === 0) {
      retiredAuditIds.push(row.id);
      continue;
    }
    const evidence = anchorsById.get(row.id);
    if (evidence === undefined) {
      throw new Error(`Current audit item ${row.id} has no item-level anchor evidence`);
    }
    current.push(
      buildCurrentDisposition(
        row,
        targets,
        evidence,
        input.registrationsBySource,
        input.contentByFile,
      ),
    );
  }
  const missingAuditIds = input.baseline
    .filter((row) => !input.targetsByAuditId.get(row.id)?.includes(row.file))
    .map((row) => row.id);
  return { current, retiredAuditIds, missingAuditIds };
}
