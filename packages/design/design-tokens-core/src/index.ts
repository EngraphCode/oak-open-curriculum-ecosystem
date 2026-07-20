import type { DtcgTokenLeaf, DtcgTokenTree } from './dtcg-types.js';
import { globalTokenReferencePattern } from './token-reference.js';
export type { DtcgTokenTree, DtcgTokenLeaf } from './dtcg-types.js';

const TOKEN_REFERENCE_PATTERN = globalTokenReferencePattern();

export interface FlattenedDesignToken {
  readonly path: readonly string[];
  readonly cssVariable: string;
  readonly cssValue: string;
}

function isTokenObject(value: unknown): value is DtcgTokenTree | DtcgTokenLeaf {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDtcgTokenLeaf(value: unknown): value is DtcgTokenLeaf {
  return isTokenObject(value) && '$value' in value;
}

function isDtcgTokenTree(value: unknown): value is DtcgTokenTree {
  return isTokenObject(value) && !('$value' in value);
}

function getTokenTier(path: readonly string[]): 'palette' | 'semantic' | 'component' {
  const [rootSegment] = path;

  if (rootSegment === 'semantic') {
    return 'semantic';
  }

  if (rootSegment === 'component') {
    return 'component';
  }

  return 'palette';
}

function normalizePathSegment(segment: string): string {
  return segment
    .trim()
    .replaceAll(/[^a-z0-9-]+/giu, '-')
    .toLowerCase();
}

function toCssVariable(path: readonly string[]): string {
  return `--oak-${path.map(normalizePathSegment).join('-')}`;
}

function extractTokenReferences(value: boolean | number | string): readonly string[][] {
  if (typeof value !== 'string') {
    return [];
  }

  return [...value.matchAll(TOKEN_REFERENCE_PATTERN)].map((match) => match[1].split('.'));
}

function resolveCssValue(value: boolean | number | string): string {
  if (typeof value !== 'string') {
    return String(value);
  }

  return value.replaceAll(
    TOKEN_REFERENCE_PATTERN,
    (_match, tokenPath: string) => `var(${toCssVariable(tokenPath.split('.'))})`,
  );
}

function validateTokenReferenceDirection(
  tokenTier: 'palette' | 'semantic' | 'component',
  references: readonly string[][],
): void {
  if (tokenTier === 'palette' && references.length > 0) {
    throw new Error('Palette tokens must use raw values.');
  }

  if (
    tokenTier === 'semantic' &&
    references.some((referencePath) => getTokenTier(referencePath) !== 'palette')
  ) {
    throw new Error('Semantic tokens must reference palette tokens.');
  }

  if (
    tokenTier === 'component' &&
    references.some((referencePath) => getTokenTier(referencePath) !== 'semantic')
  ) {
    throw new Error('Component tokens must reference semantic tokens.');
  }
}

function walkTokenTree(
  tokenNode: DtcgTokenTree | DtcgTokenLeaf,
  path: readonly string[],
  onLeaf: (token: DtcgTokenLeaf, path: readonly string[]) => void,
): void {
  if (isDtcgTokenLeaf(tokenNode)) {
    onLeaf(tokenNode, path);
    return;
  }

  for (const segment in tokenNode) {
    if (!Object.hasOwn(tokenNode, segment)) {
      continue;
    }

    const childNode = tokenNode[segment];

    if (segment.startsWith('$')) {
      continue;
    }

    if (isDtcgTokenLeaf(childNode) || isDtcgTokenTree(childNode)) {
      walkTokenTree(childNode, [...path, segment], onLeaf);
      continue;
    }

    throw new Error(`Invalid token node at '${[...path, segment].join('.')}'.`);
  }
}

export function validateTierReferences(tokenTree: DtcgTokenTree): void {
  walkTokenTree(tokenTree, [], (token, path) => {
    const tokenTier = getTokenTier(path);
    const references = extractTokenReferences(token.$value);

    validateTokenReferenceDirection(tokenTier, references);
  });
}

export function flattenDesignTokens(tokenTree: DtcgTokenTree): readonly FlattenedDesignToken[] {
  validateTierReferences(tokenTree);

  const flattenedTokens: FlattenedDesignToken[] = [];

  walkTokenTree(tokenTree, [], (token, path) => {
    flattenedTokens.push({
      path,
      cssVariable: toCssVariable(path),
      cssValue: resolveCssValue(token.$value),
    });
  });

  return flattenedTokens;
}

export function emitCssVariables(tokens: readonly FlattenedDesignToken[]): readonly string[] {
  return tokens.map((token) => `  ${token.cssVariable}: ${token.cssValue};`);
}

export function createCssBlock(selector: string, tokens: readonly FlattenedDesignToken[]): string {
  const cssVariables = emitCssVariables(tokens);

  return [`${selector} {`, ...cssVariables, '}'].join('\n');
}

// ---------------------------------------------------------------------------
// Contrast validation re-exports
// ---------------------------------------------------------------------------

export {
  hexToSrgb,
  srgbToRelativeLuminance,
  contrastRatio,
  checkWcagAA,
  checkNonTextContrast,
} from './contrast.js';

export { resolveTokenTreeToHex } from './contrast-resolve.js';

export { validateContrastPairings } from './contrast-validation.js';

export type { InvalidNodeError } from './token-walk.js';

export { composeThemeTree } from './compose-theme-tree.js';

export { validateThemeOverlayCoverage } from './overlay-coverage.js';

export type {
  InvalidThemeNodeError,
  OrphanOverride,
  OrphanOverridesError,
  OverlayCoverage,
  OverlayCoverageError,
  ReservedThemeIdentifierError,
} from './overlay-coverage.js';

export { validateColourLiterals } from './colour-literals.js';

export type {
  ColourLiteralAudit,
  ColourLiteralsError,
  NonLiteralColourError,
  NonLiteralColourOffender,
} from './colour-literals.js';

export { validateTreeRoots } from './root-convention.js';

export type { DisallowedRootGroupsError } from './root-convention.js';

export { parseContrastManifest, SCHEMA_MATCHES_MANIFEST } from './contrast-manifest-parse.js';

export type { ManifestShapeError } from './contrast-manifest-parse.js';

export type {
  SrgbColour,
  ContrastPair,
  ContrastTriad,
  ContrastManifest,
  ContrastReportEntry,
  ContrastReport,
  ContrastValidationError,
  PairContext,
  FgMidContext,
} from './contrast-types.js';
