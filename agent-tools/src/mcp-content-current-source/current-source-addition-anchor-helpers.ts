/**
 * Anchor constructors for reviewed current-source additions.
 *
 * Split from `current-source-addition-definitions.ts` when the MCP-353
 * addition took that file over the file-size gate: these are the anchor
 * primitives; the definitions file carries the reviewed entries.
 */
import type { RegistrationAnchorSurface } from './current-source-model.js';

export interface ReviewedAdditionAnchor {
  readonly content: string;
  readonly registrationSurfaces?: readonly RegistrationAnchorSurface[];
  readonly registrationValue?: string;
}

export function structuralAnchor(content: string): ReviewedAdditionAnchor {
  return { content };
}

export function metadataAnchor(
  content: string,
  field: Extract<RegistrationAnchorSurface, { locus: 'resource-metadata' }>['field'],
  registrationValue: string,
): ReviewedAdditionAnchor {
  return {
    content,
    registrationSurfaces: [{ locus: 'resource-metadata', field }],
    registrationValue,
  };
}

export function contentsAnchor(
  content: string,
  field: Extract<RegistrationAnchorSurface, { locus: 'resource-contents' }>['field'],
  registrationValue: string,
): ReviewedAdditionAnchor {
  return {
    content,
    registrationSurfaces: [{ locus: 'resource-contents', field }],
    registrationValue,
  };
}

export function sharedEnvelopeAnchor(
  content: string,
  field: 'uri' | 'mimeType',
  registrationValue: string,
): ReviewedAdditionAnchor {
  return {
    content,
    registrationSurfaces: [
      { locus: 'resource-metadata', field },
      { locus: 'resource-contents', field },
    ],
    registrationValue,
  };
}
