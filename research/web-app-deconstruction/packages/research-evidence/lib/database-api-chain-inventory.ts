import path from 'node:path';

import { codeUnitCompare } from './compare.js';

export interface SourceEntry {
  source: string;
  file?: string;
}

export interface ResolverEntry {
  file: string;
  source: string;
}

interface MigrationEntry {
  database: string;
  directory: string;
  up: boolean;
  down: boolean;
}

export interface MigrationPairsSummary {
  directoryCount: number;
  upCount: number;
  downCount: number;
  missingUp: string[];
  missingDown: string[];
}

export interface MigrationSqlSummary {
  upFileCount: number;
  lineCount: number;
  referencesKeywordCount: number;
  foreignKeyKeywordCount: number;
  checkConstraintTokenCount: number;
}

export type SqlObjectKind = 'materialized-view' | 'view' | 'function';

interface SqlObjectPattern {
  kind: SqlObjectKind;
  pattern: RegExp;
}

export interface ParsedSqlObject {
  file: string;
  kind: SqlObjectKind;
  schema: string | null;
  name: string;
  relation: string;
  hasUniqueIndex: boolean;
}

export interface UnparsedSqlObject {
  file: string;
  kind: 'unparsed';
  schema: null;
  name: null;
  relation: null;
}

export type SqlObject = ParsedSqlObject | UnparsedSqlObject;

export interface ExportedStringConstant {
  symbol: string;
  value: string;
}

type ResolverSurface = 'handlers' | 'bulkData' | 'otherSource';

export interface ResolverUsageSummary {
  sourceFileCount: number;
  sourceFileCountsBySurface: Record<string, number>;
  resolverFileCounts: Record<string, number>;
  resolverFileCountsBySurface: Record<string, Record<string, number>>;
}

export interface OpenApiObjectSchemaSummary {
  objectSchemaCount: number;
  additionalPropertiesAbsentCount: number;
  additionalPropertiesAbsentPaths: string[];
  additionalPropertiesFalseCount: number;
  additionalPropertiesOtherCount: number;
}

export interface OpenApiMaximumConstraint {
  method: string;
  path: string;
  name: string | null;
  maximum: number;
}

export interface OpenApiOperationParametersSummary {
  inlineParameterCount: number;
  referenceParameterCount: number;
  locationCounts: Record<string, number>;
  maximumConstraintCount: number;
  maximums: OpenApiMaximumConstraint[];
}

interface OpenApiParameterLike {
  $ref?: unknown;
  in?: string;
  name?: string;
  schema?: { maximum?: number } | null;
}

interface OpenApiDocumentLike {
  paths?: Record<string, unknown>;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isOperationLike(value: unknown): value is { parameters?: unknown[] } {
  return typeof value === 'object' && value !== null;
}

function isParameterLike(value: unknown): value is OpenApiParameterLike {
  return typeof value === 'object' && value !== null;
}

export function countBy<T>(
  values: Iterable<T>,
  keyFor: (value: T) => string,
): Record<string, number> {
  const counts = new Map<string, number>();
  for (const value of values) {
    const key = keyFor(value);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Object.fromEntries(
    [...counts.entries()].sort(([left], [right]) => left.localeCompare(right)),
  );
}

export function topLevelOf(file: string): string {
  return file.split('/', 1)[0];
}

export function extensionOf(file: string): string {
  const extension = path.posix.extname(file).toLowerCase();
  return extension || '[none]';
}

export function summarizeMigrationPairs(files: string[]): MigrationPairsSummary {
  const migrations = new Map<string, MigrationEntry>();

  for (const file of files) {
    const match = /^hasura-engine\/migrations\/([^/]+)\/([^/]+)\/(up|down)\.sql$/.exec(file);
    if (!match) {
      continue;
    }
    const [, database, directory, direction] = match;
    const key = `${database}/${directory}`;
    const migration: MigrationEntry = migrations.get(key) ?? {
      database,
      directory,
      up: false,
      down: false,
    };
    if (direction === 'up' || direction === 'down') {
      migration[direction] = true;
    }
    migrations.set(key, migration);
  }

  const entries = [...migrations.values()].sort((left, right) =>
    `${left.database}/${left.directory}`.localeCompare(`${right.database}/${right.directory}`),
  );

  return {
    directoryCount: entries.length,
    upCount: entries.filter((entry) => entry.up).length,
    downCount: entries.filter((entry) => entry.down).length,
    missingUp: entries
      .filter((entry) => !entry.up)
      .map(({ database, directory }) => `${database}/${directory}`),
    missingDown: entries
      .filter((entry) => !entry.down)
      .map(({ database, directory }) => `${database}/${directory}`),
  };
}

export function summarizeMigrationSql(entries: SourceEntry[]): MigrationSqlSummary {
  const combined = entries.map(({ source }) => source).join('\n');
  const lineCount = entries.reduce((total, { source }) => {
    if (source.length === 0) {
      return total;
    }
    const lines = source.split(/\r?\n/).length;
    return total + lines - (/\r?\n$/.test(source) ? 1 : 0);
  }, 0);

  function matches(pattern: RegExp): number {
    return [...combined.matchAll(pattern)].length;
  }

  return {
    upFileCount: entries.length,
    lineCount,
    referencesKeywordCount: matches(/\bREFERENCES\b/gi),
    foreignKeyKeywordCount: matches(/\bFOREIGN\s+KEY\b/gi),
    checkConstraintTokenCount: matches(/\bCHECK\s*\(/gi),
  };
}

// The identifier tail parses `[schema.]name` with optional double quotes.
// `(?=(...))\1` emulates a possessive quantifier (no backtracking into the
// captured run) — safe here because the run classes exclude the `"` and `.`
// that must follow, so backtracking could never have produced a different
// match; it only removes the super-linear worst case (S8786).
const sqlIdentifierTail = String.raw`(?:"?(?=([\w -]+))\1"?\.)?"?(?=(\w+))\2"?`;

const sqlObjectPatterns: SqlObjectPattern[] = [
  {
    kind: 'materialized-view',
    pattern: new RegExp(
      String.raw`\bCREATE\s+MATERIALIZED\s+VIEW\s+(?:IF\s+NOT\s+EXISTS\s+)?` + sqlIdentifierTail,
      'i',
    ),
  },
  {
    kind: 'view',
    pattern: new RegExp(
      String.raw`\bCREATE\s+(?:OR\s+REPLACE\s+)?VIEW\s+` + sqlIdentifierTail,
      'i',
    ),
  },
  {
    kind: 'function',
    pattern: new RegExp(
      String.raw`\bCREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+` + sqlIdentifierTail,
      'i',
    ),
  },
];

export function extractSqlObject(file: string, source: string): SqlObject {
  for (const { kind, pattern } of sqlObjectPatterns) {
    const match = pattern.exec(source);
    if (!match) {
      continue;
    }
    const schema = match[1] ?? null;
    const name = match[2];
    return {
      file,
      kind,
      schema,
      name,
      relation: schema ? `${schema}.${name}` : name,
      hasUniqueIndex: kind === 'materialized-view' && /\bCREATE\s+UNIQUE\s+INDEX\b/i.test(source),
    };
  }
  return { file, kind: 'unparsed', schema: null, name: null, relation: null };
}

export function hasuraResolverForRelation(relation: string): string {
  return relation.replaceAll('"', '').replaceAll('.', '_').replaceAll(' ', '_');
}

export function extractExportedStringConstants(source: string): ExportedStringConstant[] {
  const constants: ExportedStringConstant[] = [];
  // `\s*` after `=` already spans newlines, so the former optional
  // `(?:\r?\n\s*)?` group matched nothing extra and only created the
  // overlapping-quantifier ambiguity S8786 flags.
  const pattern = /export\s+const\s+(\w+)\s*=\s*['"]([^'"]+)['"]\s*;/g;
  for (const match of source.matchAll(pattern)) {
    constants.push({ symbol: match[1], value: match[2] });
  }
  return constants;
}

export function isResolverConsumerFile(file: string): boolean {
  return (
    file.startsWith('src/') &&
    /\.(?:ts|tsx)$/.test(file) &&
    file !== 'src/lib/owaClient.ts' &&
    !/\.(?:test|spec)\.[^.]+$/.test(file)
  );
}

function resolverConsumerSurface(file: string): ResolverSurface {
  if (file.startsWith('src/lib/handlers/')) {
    return 'handlers';
  }
  if (file.startsWith('src/lib/bulk-data/')) {
    return 'bulkData';
  }
  return 'otherSource';
}

export function countSymbolUsageFiles(
  entries: SourceEntry[],
  symbols: string[],
): Record<string, number> {
  const sources = entries.map(({ source }) => stripJavaScriptComments(source));
  return Object.fromEntries(
    symbols.map((symbol): [string, number] => {
      const escapedSymbol = symbol.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
      const pattern = new RegExp(String.raw`\b${escapedSymbol}\b`);
      return [symbol, sources.filter((source) => pattern.test(source)).length];
    }),
  );
}

export function summarizeResolverUsage(
  entries: ResolverEntry[],
  symbols: string[],
): ResolverUsageSummary {
  const sourcesBySurface: Record<ResolverSurface, ResolverEntry[]> = {
    handlers: [],
    bulkData: [],
    otherSource: [],
  };
  for (const entry of entries) {
    sourcesBySurface[resolverConsumerSurface(entry.file)].push(entry);
  }

  return {
    sourceFileCount: entries.length,
    sourceFileCountsBySurface: Object.fromEntries(
      Object.entries(sourcesBySurface).map(([surface, sources]): [string, number] => [
        surface,
        sources.length,
      ]),
    ),
    resolverFileCounts: countSymbolUsageFiles(entries, symbols),
    resolverFileCountsBySurface: Object.fromEntries(
      Object.entries(sourcesBySurface).map(
        ([surface, sources]): [string, Record<string, number>] => [
          surface,
          countSymbolUsageFiles(sources, symbols),
        ],
      ),
    ),
  };
}

export function extractOpenApiPaths(source: string): string[] {
  const paths: string[] = [];
  const pattern = /\bpath:\s*['"]([^'"]+)['"]/g;
  for (const match of source.matchAll(pattern)) {
    if (match[1].startsWith('/')) {
      paths.push(match[1]);
    }
  }
  return [...new Set(paths)].sort(codeUnitCompare);
}

export function extractOpenApiMethods(source: string): string[] {
  const methods: string[] = [];
  const pattern = /\bmethod:\s*['"]([A-Z]+)['"]/g;
  for (const match of source.matchAll(pattern)) {
    methods.push(match[1]);
  }
  return methods;
}

export function extractAbsoluteUrls(source: string): string[] {
  const urls: string[] = [];
  const pattern = /https:\/\/[^'"\s)]+/g;
  for (const match of source.matchAll(pattern)) {
    urls.push(match[0]);
  }
  return [...new Set(urls)].sort(codeUnitCompare);
}

export function stripJavaScriptComments(source: string): string {
  let output = '';
  let state = 'code';
  let quote: string | null = null;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next: string | undefined = source[index + 1];

    if (state === 'line-comment') {
      if (character === '\n') {
        state = 'code';
        output += character;
      } else {
        output += ' ';
      }
      continue;
    }

    if (state === 'block-comment') {
      if (character === '*' && next === '/') {
        output += '  ';
        index += 1;
        state = 'code';
      } else {
        output += character === '\n' ? '\n' : ' ';
      }
      continue;
    }

    if (state === 'string') {
      output += character;
      if (character === '\\') {
        if (next !== undefined) {
          output += next;
          index += 1;
        }
      } else if (character === quote) {
        state = 'code';
        quote = null;
      }
      continue;
    }

    if (character === "'" || character === '"' || character === '`') {
      state = 'string';
      quote = character;
      output += character;
    } else if (character === '/' && next === '/') {
      state = 'line-comment';
      output += '  ';
      index += 1;
    } else if (character === '/' && next === '*') {
      state = 'block-comment';
      output += '  ';
      index += 1;
    } else {
      output += character;
    }
  }

  return output;
}

export function countOpenApiPathKeys(source: string): number | null {
  const pathsStart = source.indexOf('"paths"');
  if (pathsStart === -1) {
    return null;
  }
  const componentsStart = source.indexOf('"components"', pathsStart);
  const pathsSource = source.slice(
    pathsStart,
    componentsStart === -1 ? source.length : componentsStart,
  );
  return [...pathsSource.matchAll(/^[ \t]*"(\/[^"?]+)"\s*:/gm)].length;
}

export function summarizeOpenApiObjectSchemas(value: unknown): OpenApiObjectSchemaSummary {
  const summary: OpenApiObjectSchemaSummary = {
    objectSchemaCount: 0,
    additionalPropertiesAbsentCount: 0,
    additionalPropertiesAbsentPaths: [],
    additionalPropertiesFalseCount: 0,
    additionalPropertiesOtherCount: 0,
  };

  function visit(node: unknown, currentPath: string[] = []): void {
    if (Array.isArray(node)) {
      for (const [index, item] of node.entries()) {
        visit(item, [...currentPath, String(index)]);
      }
      return;
    }
    if (!isObjectRecord(node)) {
      return;
    }

    if (node.type === 'object') {
      summary.objectSchemaCount += 1;
      if (!Object.hasOwn(node, 'additionalProperties')) {
        summary.additionalPropertiesAbsentCount += 1;
        summary.additionalPropertiesAbsentPaths.push(currentPath.join('.'));
      } else if (node.additionalProperties === false) {
        summary.additionalPropertiesFalseCount += 1;
      } else {
        summary.additionalPropertiesOtherCount += 1;
      }
    }

    for (const [key, child] of Object.entries(node)) {
      visit(child, [...currentPath, key]);
    }
  }

  visit(value);
  return summary;
}

export function summarizeOpenApiOperationParameters(
  document: OpenApiDocumentLike,
): OpenApiOperationParametersSummary {
  const maximums: OpenApiMaximumConstraint[] = [];
  const locations: string[] = [];
  let inlineParameterCount = 0;
  let referenceParameterCount = 0;

  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    if (!isObjectRecord(pathItem)) {
      continue;
    }
    for (const [method, operation] of Object.entries(pathItem)) {
      if (
        !['get', 'put', 'post', 'delete', 'patch', 'options', 'head'].includes(method) ||
        !isOperationLike(operation)
      ) {
        continue;
      }
      for (const parameter of operation.parameters ?? []) {
        if (!isParameterLike(parameter)) {
          continue;
        }
        if ('$ref' in parameter) {
          referenceParameterCount += 1;
          continue;
        }
        inlineParameterCount += 1;
        locations.push(parameter.in ?? '[unspecified]');
        if (
          parameter.schema !== null &&
          typeof parameter.schema === 'object' &&
          typeof parameter.schema.maximum === 'number'
        ) {
          maximums.push({
            method,
            path,
            name: parameter.name ?? null,
            maximum: parameter.schema.maximum,
          });
        }
      }
    }
  }

  return {
    inlineParameterCount,
    referenceParameterCount,
    locationCounts: countBy(locations, (location) => location),
    maximumConstraintCount: maximums.length,
    maximums,
  };
}
