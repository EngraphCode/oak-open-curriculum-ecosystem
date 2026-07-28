import { typeSafeEntries, typeSafeKeys } from '@oaknational/type-helpers';
import { CURRENT_ITEM_ANCHOR_OVERRIDES } from './current-item-anchor-overrides.js';
import type { RegistrationAnchorSurface } from './current-source-model.js';

const GUIDANCE_ROOT = 'packages/sdks/oak-curriculum-sdk/src/mcp/guidance-resources';

type RegistrationSurfaceOverrides = Readonly<
  Record<string, Readonly<Record<string, readonly RegistrationAnchorSurface[]>>>
>;

const RESOURCE_DESCRIPTION_SURFACE = {
  locus: 'resource-metadata',
  field: 'description',
} as const;
const RESOURCE_TITLE_SURFACE = {
  locus: 'resource-metadata',
  field: 'title',
} as const;
const RESOURCE_TEXT_SURFACE = {
  locus: 'resource-contents',
  field: 'text',
} as const;

function registrationSurfacesFor(
  auditIds: readonly string[],
  surface: RegistrationAnchorSurface,
): RegistrationSurfaceOverrides {
  const result: Record<string, Record<string, readonly RegistrationAnchorSurface[]>> = {};
  for (const auditId of auditIds) {
    const targets = CURRENT_ITEM_ANCHOR_OVERRIDES[auditId];
    if (targets === undefined) {
      throw new Error(`Registration-surface audit id has no reviewed anchors: ${auditId}`);
    }
    const targetSurfaces: Record<string, readonly RegistrationAnchorSurface[]> = {};
    for (const [file, anchors] of typeSafeEntries(targets)) {
      if (file.startsWith(`${GUIDANCE_ROOT}/`)) {
        targetSurfaces[file] = anchors.map(() => surface);
      }
    }
    if (typeSafeKeys(targetSurfaces).length === 0) {
      throw new Error(`Registration-surface audit id has no guidance target: ${auditId}`);
    }
    result[auditId] = targetSurfaces;
  }
  return result;
}

/**
 * Reviewed mapping from source anchors to MCP resource payload fields.
 *
 * Metadata anchors are exposed through resources/list; document-body anchors
 * are exposed through resources/read. Dormant resources retain this semantic
 * locus while advertising no active protocol channel.
 */
export const CURRENT_ITEM_REGISTRATION_SURFACE_OVERRIDES: RegistrationSurfaceOverrides = {
  ...registrationSurfacesFor(
    ['C178', 'C180', 'C181', 'C182', 'C183', 'C184'],
    RESOURCE_DESCRIPTION_SURFACE,
  ),
  ...registrationSurfacesFor(
    ['C329', 'C331', 'C332', 'C333', 'C334', 'C335'],
    RESOURCE_TITLE_SURFACE,
  ),
  ...registrationSurfacesFor(
    [
      'C185',
      'C186',
      'C187',
      'C188',
      'C189',
      'C190',
      'C191',
      'C192',
      'C193',
      'C194',
      'C195',
      'C196',
      'C197',
      'C199',
      'C200',
      'C201',
      'C202',
      'C203',
      'C204',
      'C205',
      'C206',
      'C207',
      'C208',
      'C209',
    ],
    RESOURCE_TEXT_SURFACE,
  ),
};
