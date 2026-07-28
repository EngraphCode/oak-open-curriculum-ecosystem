import type {
  ContentAuthority,
  RegistrationEvidence,
  SourceLocus,
} from './current-source-model.js';

const alphabetical = (left: string, right: string) => left.localeCompare(right);

const AUTHORITY_BY_SOURCE_LOCUS: Readonly<Record<SourceLocus, ContentAuthority>> = {
  'this-repo': 'workspace',
  'upstream-in-house-api': 'upstream-api',
  'upstream-in-house-skills': 'upstream-skills',
  'external-third-party': 'external-third-party',
};

export const authorityFor = (sourceLocus: SourceLocus): ContentAuthority =>
  AUTHORITY_BY_SOURCE_LOCUS[sourceLocus];

export function sortedRegistrationEvidence(
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
