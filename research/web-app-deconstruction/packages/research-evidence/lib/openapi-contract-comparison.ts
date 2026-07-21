import { codeUnitCompare } from './compare.js';

const topLevelDeploymentKeys = new Set(['info', 'servers', 'externalDocs']);
const proseKeys = new Set(['description', 'summary', 'example', 'examples', 'bearerFormat']);
const namedMemberContainers = new Set([
  '$defs',
  'callbacks',
  'content',
  'examples',
  'headers',
  'links',
  'parameters',
  'pathItems',
  'paths',
  'properties',
  'requestBodies',
  'responses',
  'schemas',
  'securitySchemes',
  'webhooks',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function canonicalizeJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalizeJson);
  }
  if (!isRecord(value)) {
    return value;
  }
  return Object.fromEntries(
    Object.keys(value)
      .sort((left, right) => left.localeCompare(right))
      .map((key) => [key, canonicalizeJson(value[key])]),
  );
}

function stripKeys(
  value: unknown,
  omittedKeys: Set<string>,
  containerName: string | null = null,
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => stripKeys(item, omittedKeys));
  }
  if (!isRecord(value)) {
    return value;
  }
  const keysAreNames = containerName !== null && namedMemberContainers.has(containerName);
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => keysAreNames || !omittedKeys.has(key))
      .map(([key, child]) => [key, stripKeys(child, omittedKeys, keysAreNames ? null : key)]),
  );
}

export function contractProjection(
  document: Record<string, unknown>,
  { includeProse }: { includeProse: boolean },
): unknown {
  const withoutDeployment = Object.fromEntries(
    Object.entries(document).filter(([key]) => !topLevelDeploymentKeys.has(key)),
  );
  return canonicalizeJson(
    includeProse
      ? stripKeys(withoutDeployment, new Set(['bearerFormat']))
      : stripKeys(withoutDeployment, proseKeys),
  );
}

export function collectJsonDifferencePaths(left: unknown, right: unknown): string[] {
  const differences: string[][] = [];

  function compare(leftValue: unknown, rightValue: unknown, currentPath: string[]): void {
    if (Object.is(leftValue, rightValue)) {
      return;
    }
    if (Array.isArray(leftValue) || Array.isArray(rightValue)) {
      if (!Array.isArray(leftValue) || !Array.isArray(rightValue)) {
        differences.push(currentPath);
        return;
      }
      const length = Math.max(leftValue.length, rightValue.length);
      for (let index = 0; index < length; index += 1) {
        compare(leftValue[index], rightValue[index], [...currentPath, String(index)]);
      }
      return;
    }
    if (!isRecord(leftValue) || !isRecord(rightValue)) {
      differences.push(currentPath);
      return;
    }
    const keys = new Set([...Object.keys(leftValue), ...Object.keys(rightValue)]);
    for (const key of [...keys].sort((a, b) => a.localeCompare(b))) {
      compare(leftValue[key], rightValue[key], [...currentPath, key]);
    }
  }

  compare(left, right, []);
  return differences.map((parts) => parts.join('.'));
}

interface OpenApiDocumentLike {
  openapi?: unknown;
  info?: { version?: unknown } | null;
  paths?: Record<string, unknown> | null;
  components?: { schemas?: Record<string, unknown> | null } | null;
}

export interface OpenApiSummary {
  openapi: unknown;
  version: unknown;
  pathCount: number;
  operationCount: number;
  operations: string[];
  componentSchemaCount: number;
}

export function summarizeOpenApiDocument(document: OpenApiDocumentLike): OpenApiSummary {
  const operations: string[] = [];
  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    if (!isRecord(pathItem)) {
      continue;
    }
    for (const method of ['get', 'put', 'post', 'delete', 'patch', 'options', 'head']) {
      if (pathItem[method]) {
        operations.push(`${method} ${path}`);
      }
    }
  }
  return {
    openapi: document.openapi ?? null,
    version: document.info?.version ?? null,
    pathCount: Object.keys(document.paths ?? {}).length,
    operationCount: operations.length,
    operations: operations.toSorted(codeUnitCompare),
    componentSchemaCount: Object.keys(document.components?.schemas ?? {}).length,
  };
}
