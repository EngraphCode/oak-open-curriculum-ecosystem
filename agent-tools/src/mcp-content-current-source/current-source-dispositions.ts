import type {
  CurrentAuditDisposition,
  CurrentItemEvidence,
  CurrentItemEvidenceTarget,
  CurrentSourceAnchorManifest,
  RegistrationAnchorSurface,
  RegistrationEvidence,
  RegistrationSourceEvidence,
  TokenAnchor,
} from './current-source-model.js';
import type { BaselineEvidenceRow } from './current-source-evidence-files.js';
import { requireItemEvidenceTargets, requireTokenAnchorsPresent } from './item-anchor-evidence.js';
import { requireSameStringMembers } from './require-same-string-members.js';

type RegistrationIndex = Readonly<Record<string, RegistrationSourceEvidence>>;

function evidenceByAuditId(
  manifest: CurrentSourceAnchorManifest,
): ReadonlyMap<string, CurrentItemEvidence> {
  const ids = manifest.items.map((item) => item.auditId);
  requireSameStringMembers('Unique current item anchor ids', ids, [...new Set(ids)]);
  return new Map(manifest.items.map((item) => [item.auditId, item.evidence]));
}

function channelForSurface(surface: RegistrationAnchorSurface): string {
  if (surface.locus === 'resource-metadata') {
    return 'resources/list.resources[]';
  }
  return 'resources/read.contents[]';
}

function anchorsByRegistrationSurface(
  target: CurrentItemEvidenceTarget,
): ReadonlyMap<string, readonly TokenAnchor[]> {
  const result = new Map<string, TokenAnchor[]>();
  for (const anchor of target.anchors) {
    const surface = anchor.registrationSurface;
    if (surface !== undefined) {
      const key = `${surface.locus}:${surface.field}`;
      const anchors = result.get(key) ?? [];
      anchors.push(anchor);
      result.set(key, anchors);
    }
  }
  return result;
}

interface RegistrationSurfaceProjection {
  readonly anchorSurface: RegistrationEvidence['anchorSurfaces'][number];
  readonly activeChannel?: string;
}

function projectRegistrationSurface(
  auditId: string,
  key: string,
  anchors: readonly TokenAnchor[],
  source: RegistrationSourceEvidence,
): RegistrationSurfaceProjection {
  const registrationSurface = anchors[0]?.registrationSurface;
  if (registrationSurface === undefined) {
    throw new Error(`Current audit item ${auditId} has an empty registration-surface group`);
  }
  const sourceSurface = source.surfaces.find(
    (surface) =>
      surface.locus === registrationSurface.locus && surface.field === registrationSurface.field,
  );
  if (sourceSurface === undefined) {
    throw new Error(
      `Current audit item ${auditId} registration surface is absent from ${source.selector}: ${key}`,
    );
  }
  requireTokenAnchorsPresent(`Current audit item ${auditId} ${key}`, anchors, sourceSurface.value);
  const channel = channelForSurface(registrationSurface);
  if (source.state === 'live' && !source.channels.includes(channel)) {
    throw new Error(
      `Current audit item ${auditId} channel is absent from live source evidence: ${channel}`,
    );
  }
  return {
    anchorSurface: {
      locus: registrationSurface.locus,
      field: registrationSurface.field,
      anchorCount: anchors.length,
    },
    ...(source.state === 'live' ? { activeChannel: channel } : {}),
  };
}

function registrationForTarget(
  auditId: string,
  target: CurrentItemEvidenceTarget,
  source: RegistrationSourceEvidence,
): RegistrationEvidence | null {
  const anchorsBySurface = anchorsByRegistrationSurface(target);
  if (anchorsBySurface.size === 0) {
    return null;
  }
  const projections = [...anchorsBySurface].map(([key, anchors]) =>
    projectRegistrationSurface(auditId, key, anchors, source),
  );

  return {
    rootId: source.rootId,
    state: source.state,
    primitive: source.primitive,
    selector: source.selector,
    anchorSurfaces: projections.map((projection) => projection.anchorSurface),
    channels: [
      ...new Set(
        projections.flatMap((projection) =>
          projection.activeChannel === undefined ? [] : [projection.activeChannel],
        ),
      ),
    ],
  };
}

function registrationsForEvidence(
  auditId: string,
  evidence: CurrentItemEvidence,
  bySource: RegistrationIndex,
): readonly RegistrationEvidence[] {
  return evidence.targets.flatMap((target) => {
    const source = bySource[target.file];
    if (source === undefined) {
      return [];
    }
    const registration = registrationForTarget(auditId, target, source);
    return registration === null ? [] : [registration];
  });
}

function buildCurrentDisposition(
  row: BaselineEvidenceRow,
  targets: readonly string[],
  evidence: CurrentItemEvidence,
  registrationsBySource: RegistrationIndex,
  contentByFile: ReadonlyMap<string, string>,
): CurrentAuditDisposition {
  requireSameStringMembers(
    `Current targets and item evidence targets for ${row.id}`,
    targets,
    evidence.targets.map((target) => target.file),
  );
  requireItemEvidenceTargets(row.id, evidence.targets, contentByFile);
  return {
    auditId: row.id,
    files: targets,
    evidence,
    registrations: registrationsForEvidence(row.id, evidence, registrationsBySource),
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
  requireSameStringMembers('Available audit ids and current item anchor ids', expectedAnchoredIds, [
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
