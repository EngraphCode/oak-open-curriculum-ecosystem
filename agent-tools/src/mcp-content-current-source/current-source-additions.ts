import type {
  CurrentSourceAdditionDisposition,
  RegistrationEvidence,
  RegistrationSourceEvidence,
} from './current-source-model.js';
import {
  CURRENT_SOURCE_ADDITION_DEFINITIONS,
  type CurrentSourceAdditionDefinition,
  type ReviewedAdditionAnchor,
} from './current-source-addition-definitions.js';
import { buildTokenAnchor, requireItemEvidenceTargets } from './item-anchor-evidence.js';
import { requireSameStringMembers } from './require-same-string-members.js';

function requireUniqueAdditionIds(definitions: readonly CurrentSourceAdditionDefinition[]): void {
  const ids = definitions.map((definition) => definition.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    throw new Error(
      `Duplicate current-source addition ids: ${[...new Set(duplicates)].join(', ')}`,
    );
  }
  const malformed = ids.filter((id) => !/^A\d{3}$/.test(id));
  if (malformed.length > 0) {
    throw new Error(`Malformed current-source addition ids: ${malformed.join(', ')}`);
  }
}

/** Files needed to build the reviewed post-baseline addition evidence. */
export function currentSourceAdditionFiles(): readonly string[] {
  return [...new Set(CURRENT_SOURCE_ADDITION_DEFINITIONS.map((definition) => definition.file))];
}

function registrationSourceFor(
  definition: CurrentSourceAdditionDefinition,
  registrationsBySource: Readonly<Record<string, RegistrationSourceEvidence>>,
): RegistrationSourceEvidence {
  const registration = definition.registration;
  if (registration === undefined) {
    throw new Error(`Current-source addition ${definition.id} has no registration definition`);
  }
  const source = registrationsBySource[definition.file];
  if (source === undefined) {
    throw new Error(`Current-source addition ${definition.id} registration proof is absent`);
  }
  if (
    source.rootId !== 'oak-curriculum-http' ||
    source.primitive !== 'resource' ||
    source.state !== registration.state ||
    source.selector !== registration.selector
  ) {
    throw new Error(`Current-source addition ${definition.id} registration proof differs`);
  }
  return source;
}

function additionAnchorSurfaces(
  anchors: readonly ReviewedAdditionAnchor[],
): RegistrationEvidence['anchorSurfaces'] {
  return anchors.flatMap((anchor) =>
    anchor.registrationSurfaces === undefined
      ? []
      : anchor.registrationSurfaces.map((surface) => ({
          locus: surface.locus,
          field: surface.field,
          anchorCount: 1,
        })),
  );
}

function registrationChannels(
  definition: CurrentSourceAdditionDefinition,
  anchorSurfaces: RegistrationEvidence['anchorSurfaces'],
): readonly string[] {
  if (definition.registration?.state !== 'live') {
    return [];
  }
  return [
    ...new Set(
      anchorSurfaces.map((surface) =>
        surface.locus === 'resource-metadata'
          ? 'resources/list.resources[]'
          : 'resources/read.contents[]',
      ),
    ),
  ];
}

function requireRegistrationSurfaces(
  definition: CurrentSourceAdditionDefinition,
  source: RegistrationSourceEvidence,
): void {
  for (const anchor of definition.reviewedAnchors) {
    if (anchor.registrationSurfaces === undefined) {
      continue;
    }
    if (anchor.registrationValue === undefined) {
      throw new Error(`Current-source addition ${definition.id} registration value is absent`);
    }
    for (const expected of anchor.registrationSurfaces) {
      const actual = source.surfaces.find(
        (surface) => surface.locus === expected.locus && surface.field === expected.field,
      );
      if (actual?.value !== anchor.registrationValue) {
        throw new Error(
          `Current-source addition ${definition.id} registration surface differs: ${expected.locus}.${expected.field}`,
        );
      }
    }
  }
}

function registrationFor(
  definition: CurrentSourceAdditionDefinition,
  registrationsBySource: Readonly<Record<string, RegistrationSourceEvidence>>,
): readonly RegistrationEvidence[] {
  if (definition.registration === undefined) {
    return [];
  }
  const source = registrationSourceFor(definition, registrationsBySource);
  requireRegistrationSurfaces(definition, source);
  const anchorSurfaces = additionAnchorSurfaces(definition.reviewedAnchors);
  const channels = registrationChannels(definition, anchorSurfaces);
  requireSameStringMembers(
    `Current-source addition ${definition.id} registration channels`,
    source.channels,
    channels,
  );
  return [
    {
      rootId: source.rootId,
      state: source.state,
      primitive: source.primitive,
      selector: source.selector,
      anchorSurfaces,
      channels: source.channels,
    },
  ];
}

/** Builds anchored current-source items from the reviewed additions ledger. */
export function buildCurrentSourceAdditions(
  contentByFile: ReadonlyMap<string, string>,
  registrationsBySource: Readonly<Record<string, RegistrationSourceEvidence>> = {},
): readonly CurrentSourceAdditionDisposition[] {
  requireUniqueAdditionIds(CURRENT_SOURCE_ADDITION_DEFINITIONS);
  return CURRENT_SOURCE_ADDITION_DEFINITIONS.map((definition) => {
    const content = contentByFile.get(definition.file);
    if (content === undefined) {
      throw new Error(
        `Current-source addition ${definition.id} file is absent: ${definition.file}`,
      );
    }
    const anchors = definition.reviewedAnchors.map((reviewedAnchor) =>
      buildTokenAnchor(reviewedAnchor.content, content),
    );
    const evidence = {
      revision: 'added',
      targets: [
        {
          file: definition.file,
          anchors,
        },
      ],
    } as const;
    requireItemEvidenceTargets(definition.id, evidence.targets, contentByFile);
    return {
      id: definition.id,
      title: definition.title,
      reviewDomain: definition.reviewDomain,
      impactTier: definition.impactTier,
      behaviouralIntent: definition.behaviouralIntent,
      workspaceScope: definition.workspaceScope,
      sourceLocus: definition.sourceLocus,
      file: definition.file,
      evidence,
      registrations: registrationFor(definition, registrationsBySource),
    };
  });
}
