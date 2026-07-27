/**
 * Pure construction of the MCP content current-source truth set.
 *
 * IO and live registration walks belong to the validator adapter. This seam
 * only reconciles their supplied evidence against the immutable audit rows.
 */

import type {
  BaselineAuditRow,
  BuildCurrentSourceTruthSetInput,
  ContentAuthority,
  CurrentAuditDisposition,
  CurrentSourceTruthItem,
  CurrentSourceTruthSet,
  RegistrationEvidence,
  RegistrationRoot,
  SourceLocus,
} from './current-source-model.js';
import { buildCurrentSourceSummary } from './build-current-source-summary.js';

const alphabetical = (left: string, right: string) => left.localeCompare(right);

function duplicateValues(values: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }
  return [...duplicates].sort(alphabetical);
}

function requireNoDuplicates(values: readonly string[], label: string): void {
  const duplicates = duplicateValues(values);
  if (duplicates.length > 0) {
    throw new Error(`Duplicate ${label}: ${duplicates.join(', ')}`);
  }
}

function requireKnownIds(
  ids: readonly string[],
  baselineById: ReadonlyMap<string, BaselineAuditRow>,
  label: string,
): void {
  const unknown = ids.filter((id) => !baselineById.has(id)).sort(alphabetical);
  if (unknown.length > 0) {
    throw new Error(`Unknown ${label}: ${unknown.join(', ')}`);
  }
}

const AUTHORITY_BY_SOURCE_LOCUS: Readonly<Record<SourceLocus, ContentAuthority>> = {
  'this-repo': 'workspace',
  'upstream-in-house-api': 'upstream-api',
  'upstream-in-house-skills': 'upstream-skills',
  'external-third-party': 'external-third-party',
};

const authorityFor = (sourceLocus: SourceLocus): ContentAuthority =>
  AUTHORITY_BY_SOURCE_LOCUS[sourceLocus];

function lineageDisposition(
  baselineFile: string,
  currentFiles: readonly string[],
): CurrentSourceTruthItem['lineage']['disposition'] {
  if (currentFiles.length > 1) {
    return 'split';
  }
  return currentFiles[0] === baselineFile ? 'retained' : 'relocated';
}

function sortedRegistrationEvidence(
  registrations: readonly RegistrationEvidence[],
): readonly RegistrationEvidence[] {
  return [...registrations]
    .map((registration) => ({
      ...registration,
      anchorSurfaces: [...registration.anchorSurfaces].sort(
        (left, right) =>
          left.locus.localeCompare(right.locus) ||
          left.field.localeCompare(right.field) ||
          left.anchorCount - right.anchorCount,
      ),
      channels: [...registration.channels].sort(alphabetical),
    }))
    .sort(
      (left, right) =>
        left.rootId.localeCompare(right.rootId) ||
        left.primitive.localeCompare(right.primitive) ||
        left.selector.localeCompare(right.selector),
    );
}

function buildAvailableItem(
  baseline: BaselineAuditRow,
  disposition: CurrentAuditDisposition,
): CurrentSourceTruthItem {
  if (disposition.files.length === 0) {
    throw new Error(`Current audit id ${disposition.auditId} has no source files`);
  }
  const files = [...disposition.files].sort(alphabetical);
  const evidence = {
    revision: disposition.evidence.revision,
    anchorTargetCount: disposition.evidence.targets.length,
    anchorCount: disposition.evidence.targets.reduce(
      (count, target) => count + target.anchors.length,
      0,
    ),
  };
  return {
    id: baseline.id,
    authority: authorityFor(baseline.sourceLocus),
    workspaceScope: baseline.workspaceScope,
    source: { state: 'available', files, evidence },
    lineage: {
      disposition: lineageDisposition(baseline.file, files),
      baselineFile: baseline.file,
    },
    registrations: sortedRegistrationEvidence(disposition.registrations),
  };
}

function buildRetiredItem(baseline: BaselineAuditRow): CurrentSourceTruthItem {
  return {
    id: baseline.id,
    authority: authorityFor(baseline.sourceLocus),
    workspaceScope: baseline.workspaceScope,
    source: { state: 'retired', files: [] },
    lineage: { disposition: 'retired', baselineFile: baseline.file },
    registrations: [],
  };
}

function validateRegistrationRoots(
  current: readonly CurrentAuditDisposition[],
  roots: readonly RegistrationRoot[],
): void {
  requireNoDuplicates(
    roots.map((root) => root.id),
    'registration root ids',
  );
  const knownRoots = new Set(roots.map((root) => root.id));
  const unknownRoots = current
    .flatMap((item) => item.registrations.map((registration) => registration.rootId))
    .filter((rootId) => !knownRoots.has(rootId));
  if (unknownRoots.length > 0) {
    throw new Error(
      `Unknown registration root ids: ${[...new Set(unknownRoots)].sort(alphabetical).join(', ')}`,
    );
  }
}

function sortedRegistrationRoots(roots: readonly RegistrationRoot[]): readonly RegistrationRoot[] {
  return [...roots]
    .map((root) => ({
      ...root,
      observation: {
        ...root.observation,
        tools: {
          live: [...root.observation.tools.live].sort(alphabetical),
          dormant: [...root.observation.tools.dormant].sort(alphabetical),
        },
        resources: {
          live: [...root.observation.resources.live].sort(alphabetical),
          dormant: [...root.observation.resources.dormant].sort(alphabetical),
        },
      },
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
}

function validateInput(
  input: BuildCurrentSourceTruthSetInput,
): ReadonlyMap<string, CurrentAuditDisposition> {
  requireNoDuplicates(
    input.baseline.map((item) => item.id),
    'baseline audit ids',
  );
  requireNoDuplicates(
    input.current.map((item) => item.auditId),
    'current audit ids',
  );
  requireNoDuplicates(input.retiredAuditIds, 'retired audit ids');

  const baselineById = new Map(input.baseline.map((item) => [item.id, item]));
  const currentIds = input.current.map((item) => item.auditId);
  requireKnownIds(currentIds, baselineById, 'current audit ids');
  requireKnownIds(input.retiredAuditIds, baselineById, 'retired audit ids');

  const retired = new Set(input.retiredAuditIds);
  const overlap = currentIds.filter((id) => retired.has(id)).sort(alphabetical);
  if (overlap.length > 0) {
    throw new Error(`Audit ids cannot be current and retired: ${overlap.join(', ')}`);
  }

  const accounted = new Set([...currentIds, ...input.retiredAuditIds]);
  const unaccounted = input.baseline
    .map((item) => item.id)
    .filter((id) => !accounted.has(id))
    .sort(alphabetical);
  if (unaccounted.length > 0) {
    throw new Error(`Unaccounted baseline audit ids: ${unaccounted.join(', ')}`);
  }
  validateRegistrationRoots(input.current, input.registrationRoots);
  return new Map(input.current.map((item) => [item.auditId, item]));
}

function buildItems(
  baseline: readonly BaselineAuditRow[],
  currentById: ReadonlyMap<string, CurrentAuditDisposition>,
): readonly CurrentSourceTruthItem[] {
  return [...baseline]
    .sort((left, right) => left.id.localeCompare(right.id))
    .map((baseline) => {
      const disposition = currentById.get(baseline.id);
      return disposition ? buildAvailableItem(baseline, disposition) : buildRetiredItem(baseline);
    });
}

/**
 * Reconciles current and retired evidence into one total projection.
 *
 * Throws when any baseline row is duplicated, unknown, or unaccounted.
 */
export function buildCurrentSourceTruthSet(
  input: BuildCurrentSourceTruthSetInput,
): CurrentSourceTruthSet {
  const items = buildItems(input.baseline, validateInput(input));
  return {
    schemaVersion: 2,
    provenance: {
      ...input.provenance,
      currentEvidence: [...input.provenance.currentEvidence].sort(alphabetical),
      evidenceCeiling: [...input.provenance.evidenceCeiling],
    },
    summary: buildCurrentSourceSummary(items),
    registrationRoots: sortedRegistrationRoots(input.registrationRoots),
    items,
    hostEvidence: [],
  };
}
