import { execFile as execFileCallback } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import type { ExecFileOptions } from 'node:child_process';

import { emitJson, parseArgs, resolveFromCwd, usageError, workspaceRoot } from '../lib/cli.js';
import { codeUnitCompare } from '../lib/compare.js';
import {
  countBy,
  countOpenApiPathKeys,
  extensionOf,
  extractAbsoluteUrls,
  extractExportedStringConstants,
  extractOpenApiMethods,
  extractOpenApiPaths,
  extractSqlObject,
  hasuraResolverForRelation,
  isResolverConsumerFile,
  stripJavaScriptComments,
  summarizeResolverUsage,
  summarizeMigrationPairs,
  summarizeMigrationSql,
  summarizeOpenApiObjectSchemas,
  summarizeOpenApiOperationParameters,
  topLevelOf,
} from '../lib/database-api-chain-inventory.js';

type GitOptions = Omit<ExecFileOptions, 'encoding'>;

interface PackageManifest {
  name?: string;
  version: string;
}

interface WorkspacePackageManifest {
  name?: string;
  version?: string;
  private?: boolean;
}

interface SdkMetadata {
  openapi?: string;
  info?: { title?: string; version?: string };
  servers?: { url: string }[];
  externalDocs?: { url?: string };
  paths?: Record<string, Record<string, unknown>>;
  components?: { schemas?: Record<string, unknown> };
}

interface OpenApiCache {
  openapi?: string;
  info?: { title?: string; version?: string };
  paths?: Record<string, unknown>;
}

interface BulkManifest {
  downloadedAt?: string;
  source?: string;
  files?: { file: string }[];
}

interface BulkSchema {
  title?: string;
  required?: string[];
  properties?: Record<string, unknown>;
}

const execFile = promisify(execFileCallback);
const defaults = {
  databaseTools: path.join(workspaceRoot, 'Database-Tools'),
  oakOpenApi: path.join(workspaceRoot, 'oak-openapi'),
  oce: path.join(workspaceRoot, 'oak-open-curriculum-ecosystem'),
};
const usage = `Usage: pnpm exec tsx scripts/database-api-chain-inventory.ts [options]

Options:
  --database-tools <path>  Database-Tools checkout (default: sibling Database-Tools)
  --oak-openapi <path>     oak-openapi checkout (default: sibling oak-openapi)
  --oce <path>             OCE checkout (default: sibling oak-open-curriculum-ecosystem)
  --output <path>          Write normalized JSON evidence instead of stdout`;

const args = parseArgs(
  process.argv.slice(2),
  [],
  ['database-tools', 'oak-openapi', 'oce', 'output'],
);

function optionalString(value: string | boolean | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

const roots = {
  databaseTools: resolveFromCwd(optionalString(args['database-tools']), defaults.databaseTools),
  oakOpenApi: resolveFromCwd(optionalString(args['oak-openapi']), defaults.oakOpenApi),
  oce: resolveFromCwd(optionalString(args.oce), defaults.oce),
};

async function git(root: string, arguments_: string[], options: GitOptions = {}): Promise<Buffer> {
  const { stdout } = await execFile('git', ['-C', root, ...arguments_], {
    encoding: 'buffer',
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });
  return stdout;
}

async function snapshot(root: string, expectedPackage: string) {
  const [revisionBuffer, status, filesBuffer] = await Promise.all([
    git(root, ['rev-parse', 'HEAD']),
    git(root, ['status', '--porcelain']),
    git(root, ['ls-tree', '-r', '--name-only', '-z', 'HEAD']),
  ]);
  const revision = revisionBuffer.toString('utf8').trim();
  const files = filesBuffer.toString('utf8').split('\0').filter(Boolean).sort();
  const manifest: PackageManifest = JSON.parse(
    (await git(root, ['show', `${revision}:package.json`])).toString('utf8'),
  );
  if (manifest.name !== expectedPackage) {
    throw new Error(
      `Expected ${root} to contain package ${expectedPackage}; found ${manifest.name ?? 'no name'}`,
    );
  }
  return {
    root,
    revision,
    files,
    input: {
      package: manifest.name,
      version: manifest.version,
      revision,
      clean: status.length === 0,
    },
  };
}

type RepositorySnapshot = Awaited<ReturnType<typeof snapshot>>;

async function readBlob(snapshot_: RepositorySnapshot, file: string): Promise<string> {
  if (!snapshot_.files.includes(file)) {
    throw new Error(`Required tracked path is absent from ${snapshot_.input.package}: ${file}`);
  }
  return (await git(snapshot_.root, ['show', `${snapshot_.revision}:${file}`])).toString('utf8');
}

async function mapLimit<T, R>(
  values: T[],
  limit: number,
  mapper: (value: T, index: number) => Promise<R>,
): Promise<R[]> {
  const output: R[] = new Array<R>(values.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < values.length) {
      const index = next;
      next += 1;
      output[index] = await mapper(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, () => worker()));
  return output;
}

function repositoryShape(files: string[]) {
  return {
    trackedFileCount: files.length,
    topLevelCounts: countBy(files, topLevelOf),
    extensionCounts: countBy(files, extensionOf),
  };
}

function countTests(files: string[]): number {
  return files.filter((file) => /\.(?:test|spec)\.[^.]+$/.test(file)).length;
}

async function packageManifests(snapshot_: RepositorySnapshot) {
  const paths = snapshot_.files.filter(
    (file) => file === 'package.json' || file.endsWith('/package.json'),
  );
  return mapLimit(paths, 12, async (file) => {
    const manifest: WorkspacePackageManifest = JSON.parse(await readBlob(snapshot_, file));
    return {
      path: file,
      name: manifest.name ?? null,
      version: manifest.version ?? null,
      private: manifest.private ?? false,
    };
  });
}

async function databaseToolsInventory(snapshot_: RepositorySnapshot) {
  const { files } = snapshot_;
  const migrationUpFiles = files.filter((file) =>
    /^hasura-engine\/migrations\/[^/]+\/[^/]+\/up\.sql$/.test(file),
  );
  const migrationUpSources = await mapLimit(migrationUpFiles, 12, async (file) => ({
    file,
    source: await readBlob(snapshot_, file),
  }));
  const schemaDocFiles = files.filter(
    (file) => file.startsWith('database-tools/sql-schema-docs/') && file.endsWith('.sql'),
  );
  const sqlObjects = await mapLimit(schemaDocFiles, 16, async (file) =>
    extractSqlObject(file, await readBlob(snapshot_, file)),
  );
  const openApiProjectionFiles = schemaDocFiles.filter((file) =>
    file.split('/')[2]?.startsWith('open-api-'),
  );
  const openApiProjectionSet = new Set(openApiProjectionFiles);
  const openApiProjections = sqlObjects.filter((object) => openApiProjectionSet.has(object.file));
  const metadataTables = files.filter(
    (file) =>
      file.startsWith('hasura-engine/metadata/databases/') &&
      /\/tables\/.*\.ya?ml$/.test(file) &&
      !file.endsWith('/tables.yaml'),
  );
  const routeFiles = files.filter((file) => /^mutation-api\/src\/routes\/.*-route\.ts$/.test(file));
  const manualSchemaFiles = files.filter(
    (file) =>
      file.startsWith('oak-curriculum-schema/src/schema/') &&
      file.endsWith('.ts') &&
      !file.endsWith('.test.ts'),
  );
  const drizzleSchemaFiles = files.filter(
    (file) => file.startsWith('oak-curriculum-schema/drizzle/schema/') && file.endsWith('.ts'),
  );

  return {
    repository: repositoryShape(files),
    packages: await packageManifests(snapshot_),
    migrations: {
      ...summarizeMigrationPairs(files),
      sql: summarizeMigrationSql(migrationUpSources),
    },
    sqlSchemaDocs: {
      trackedSqlFileCount: schemaDocFiles.length,
      familyCounts: countBy(schemaDocFiles, (file) => file.split('/')[2]),
      parsedObjectKindCounts: countBy(sqlObjects, (object) => object.kind),
      unparsedFiles: sqlObjects
        .filter((object) => object.kind === 'unparsed')
        .map((object) => object.file),
      openApiProjections,
    },
    hasuraMetadata: {
      tableFileCount: metadataTables.length,
      tableFileCountsByDatabase: countBy(metadataTables, (file) => file.split('/')[3]),
    },
    schemaRepresentations: {
      manualZodTypeScriptFileCount: manualSchemaFiles.length,
      manualCountsBySchema: countBy(manualSchemaFiles, (file) => file.split('/')[3]),
      generatedDrizzleTypeScriptFileCount: drizzleSchemaFiles.length,
      drizzleCountsBySchema: countBy(drizzleSchemaFiles, (file) => file.split('/')[3]),
    },
    mutationApi: {
      routeFileCount: routeFiles.length,
      routeFiles,
      testSpecFileCount: files.filter(
        (file) => file.startsWith('mutation-api/') && /\.(?:test|spec)\.[^.]+$/.test(file),
      ).length,
    },
    assurance: {
      repositoryTestSpecFileCount: countTests(files),
      sqlTestFileCount: files.filter(
        (file) =>
          file.startsWith('database-tools/integration-tests/sql-tests/') && file.endsWith('.sql'),
      ).length,
      databaseIntegrationTypeScriptFileCount: files.filter(
        (file) =>
          file.startsWith('database-tools/integration-tests/ts-tests/') &&
          file.endsWith('.test.ts'),
      ).length,
      workflowFiles: files.filter((file) => /^\.github\/workflows\/.*\.ya?ml$/.test(file)),
    },
    allParsedSqlObjects: sqlObjects,
  };
}

async function oakOpenApiInventory(snapshot_: RepositorySnapshot) {
  const { files } = snapshot_;
  const handlerFiles = files.filter(
    (file) =>
      file.startsWith('src/lib/handlers/') &&
      file.endsWith('.ts') &&
      !/\.(?:test|spec)\.ts$/.test(file),
  );
  const handlerFileSet = new Set(handlerFiles);
  const resolverConsumerFiles = files.filter(isResolverConsumerFile);
  const resolverConsumerSources = await mapLimit(resolverConsumerFiles, 16, async (file) => ({
    file,
    source: await readBlob(snapshot_, file),
  }));
  const handlerSources = resolverConsumerSources.filter(({ file }) => handlerFileSet.has(file));
  const combinedHandlerSource = stripJavaScriptComments(
    handlerSources.map(({ source }) => source).join('\n'),
  );
  const owaClientSource = await readBlob(snapshot_, 'src/lib/owaClient.ts');
  const exportedConstants = extractExportedStringConstants(owaClientSource);
  const resolverRegistry = exportedConstants.filter(
    ({ value }) =>
      (value.startsWith('published_') ||
        value.startsWith('public_') ||
        value.startsWith('internal_')) &&
      !value.endsWith('_bool_exp'),
  );
  const graphQlTypeRegistry = exportedConstants.filter(({ value }) => value.endsWith('_bool_exp'));
  const directTableRegistry = exportedConstants.filter(({ value }) =>
    /^(?:published|public|internal)\./.test(value),
  );
  const sourceSchemas = files.filter(
    (file) =>
      file.startsWith('src/lib/handlers/') &&
      file.includes('/schemas/') &&
      file.endsWith('.schema.ts'),
  );
  const generatedSchemas = files.filter(
    (file) => file.startsWith('src/lib/zod-openapi/generated/') && file.endsWith('.openapi.ts'),
  );
  const endpointPaths = extractOpenApiPaths(combinedHandlerSource);
  const methods = extractOpenApiMethods(combinedHandlerSource);
  const rightsPolicyFiles = [
    'src/lib/queryGateData/assets/blockedLessons.json',
    'src/lib/queryGateData/assets/blockedUnits.json',
    'src/lib/queryGateData/copyright/supportedLessons.json',
    'src/lib/queryGateData/copyright/supportedUnits.json',
    'src/lib/queryGateData/quiz/blockedLessons.json',
  ];
  const rightsPolicyPopulations = Object.fromEntries(
    await mapLimit(rightsPolicyFiles, 5, async (file): Promise<[string, number | null]> => {
      const data: unknown = JSON.parse(await readBlob(snapshot_, file));
      return [file, Array.isArray(data) ? data.length : null];
    }),
  );

  const handlerDirectories = [
    ...new Set(
      handlerFiles.filter((file) => file.split('/').length > 4).map((file) => file.split('/')[3]),
    ),
  ].sort(codeUnitCompare);

  return {
    repository: repositoryShape(files),
    packages: await packageManifests(snapshot_),
    apiSurface: {
      handlerDirectoryCount: handlerDirectories.length,
      handlerDirectories,
      handlerTypeScriptFileCount: handlerFiles.length,
      openApiMetadataBlockCount: (combinedHandlerSource.match(/\bopenapi\s*:\s*\{/g) ?? []).length,
      declaredPathCount: endpointPaths.length,
      declaredPaths: endpointPaths,
      declaredMethodCounts: countBy(methods, (method) => method),
      nextApiRouteFiles: files.filter((file) => /^src\/app\/api\/.*\/route\.ts$/.test(file)),
    },
    upstreamDatabaseContract: {
      resolverRegistry,
      graphQlTypeRegistry,
      directTableRegistry,
      resolverUsage: summarizeResolverUsage(
        resolverConsumerSources,
        resolverRegistry.map(({ symbol }) => symbol),
      ),
    },
    schemaPipeline: {
      sourceSchemaFileCount: sourceSchemas.length,
      sourceSchemaFiles: sourceSchemas,
      generatedOpenApiSchemaFileCount: generatedSchemas.length,
      generatedOpenApiSchemaFiles: generatedSchemas,
      exampleJsonFileCount: files.filter(
        (file) =>
          file.startsWith('src/lib/handlers/') &&
          file.includes('/examples/') &&
          file.endsWith('.json'),
      ).length,
      generatorMarkedBroken: /generate:openapi[^]*currently broken/i.test(
        await readBlob(snapshot_, '.agent/directives/AGENT.md'),
      ),
    },
    rightsPolicy: {
      committedListPopulations: rightsPolicyPopulations,
    },
    assurance: {
      testSpecFileCount: countTests(files),
      topLevelTestFileCount: files.filter((file) => /^__tests__\/.*\.test\.ts$/.test(file)).length,
      workflowFiles: files.filter((file) => /^\.github\/workflows\/.*\.ya?ml$/.test(file)),
    },
  };
}

async function oceConsumerInventory(snapshot_: RepositorySnapshot) {
  const { files } = snapshot_;
  const configPath = 'packages/sdks/oak-curriculum-sdk/src/config/index.ts';
  const generatedSchemaPath =
    'packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/api-schema-base.ts';
  const sdkMetadataPath =
    'packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/api-schema-sdk.json';
  const originalCachePath = 'packages/sdks/oak-sdk-codegen/schema-cache/api-schema-original.json';
  const bulkManifestPath = 'apps/oak-search-cli/bulk-downloads/manifest.json';
  const bulkSchemaPath = 'apps/oak-search-cli/bulk-downloads/schema.json';
  const [
    configSource,
    generatedSchemaSource,
    sdkMetadataSource,
    originalCacheSource,
    bulkManifestSource,
    bulkSchemaSource,
  ] = await Promise.all([
    readBlob(snapshot_, configPath),
    readBlob(snapshot_, generatedSchemaPath),
    readBlob(snapshot_, sdkMetadataPath),
    readBlob(snapshot_, originalCachePath),
    readBlob(snapshot_, bulkManifestPath),
    readBlob(snapshot_, bulkSchemaPath),
  ]);
  const generatedApiFiles = files.filter((file) =>
    file.startsWith('packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/'),
  );
  const mcpGeneratedFiles = generatedApiFiles.filter((file) => file.includes('/mcp-tools/'));
  const mcpGeneratedToolFiles = generatedApiFiles.filter((file) =>
    /\/mcp-tools\/tools\/[^/]+\.ts$/.test(file),
  );

  const sdkMetadata: SdkMetadata = JSON.parse(sdkMetadataSource);
  const originalCache: OpenApiCache = JSON.parse(originalCacheSource);
  const bulkManifest: BulkManifest = JSON.parse(bulkManifestSource);
  const bulkSchema: BulkSchema = JSON.parse(bulkSchemaSource);
  const operations = Object.values(sdkMetadata.paths ?? {}).flatMap((pathItem) =>
    Object.entries(pathItem).filter(([method]) =>
      ['get', 'put', 'post', 'delete', 'patch', 'options', 'head'].includes(method),
    ),
  );

  return {
    input: snapshot_.input,
    source: {
      configPath,
      configuredAbsoluteUrls: extractAbsoluteUrls(configSource),
      generatedSchemaPath,
      generatedSchemaPathCount: countOpenApiPathKeys(generatedSchemaSource),
      sdkMetadataPath,
      sdkMetadata: {
        openapi: sdkMetadata.openapi ?? null,
        title: sdkMetadata.info?.title ?? null,
        version: sdkMetadata.info?.version ?? null,
        serverUrls: (sdkMetadata.servers ?? []).map(({ url }) => url),
        externalDocsUrl: sdkMetadata.externalDocs?.url ?? null,
        pathCount: Object.keys(sdkMetadata.paths ?? {}).length,
        operationCount: operations.length,
        componentSchemaCount: Object.keys(sdkMetadata.components?.schemas ?? {}).length,
      },
      originalCachePath,
      originalCache: {
        openapi: originalCache.openapi ?? null,
        title: originalCache.info?.title ?? null,
        version: originalCache.info?.version ?? null,
        pathCount: Object.keys(originalCache.paths ?? {}).length,
        operationParameterSummary: summarizeOpenApiOperationParameters(originalCache),
        objectSchemaClosure: summarizeOpenApiObjectSchemas(originalCache),
      },
    },
    generatedSurface: {
      generatedApiFileCount: generatedApiFiles.length,
      generatedMcpFileCount: mcpGeneratedFiles.length,
      generatedMcpToolFileCount: mcpGeneratedToolFiles.length,
      generatedMcpToolFiles: mcpGeneratedToolFiles,
      generatedTestSpecFileCount: generatedApiFiles.filter((file) =>
        /\.(?:test|spec)\.[^.]+$/.test(file),
      ).length,
    },
    bulkSnapshotReceipt: {
      manifestPath: bulkManifestPath,
      downloadedAt: bulkManifest.downloadedAt ?? null,
      source: bulkManifest.source ?? null,
      manifestEntryCount: Array.isArray(bulkManifest.files) ? bulkManifest.files.length : null,
      curriculumJsonEntryCount: Array.isArray(bulkManifest.files)
        ? bulkManifest.files.filter(({ file }) => file.endsWith('.json') && file !== 'schema.json')
            .length
        : null,
      manifestFiles: Array.isArray(bulkManifest.files)
        ? bulkManifest.files.map(({ file }) => file)
        : [],
      schemaPath: bulkSchemaPath,
      schemaTitle: bulkSchema.title ?? null,
      topLevelRequired: bulkSchema.required ?? [],
      topLevelProperties: Object.keys(bulkSchema.properties ?? {}).sort(codeUnitCompare),
    },
  };
}

type DatabaseToolsInventory = Awaited<ReturnType<typeof databaseToolsInventory>>;
type OakOpenApiInventory = Awaited<ReturnType<typeof oakOpenApiInventory>>;
type OceConsumerInventory = Awaited<ReturnType<typeof oceConsumerInventory>>;
type SqlObjectRecord = DatabaseToolsInventory['allParsedSqlObjects'][number];
type MatchedSqlObject = SqlObjectRecord & { relation: string };

function crossSystemCorrespondence(
  databaseTools: DatabaseToolsInventory,
  oakOpenApi: OakOpenApiInventory,
  oce: OceConsumerInventory,
) {
  const databaseResolvers = new Map(
    databaseTools.allParsedSqlObjects
      .filter((object): object is MatchedSqlObject => Boolean(object.relation))
      .map((object): [string, MatchedSqlObject] => [
        hasuraResolverForRelation(object.relation),
        object,
      ]),
  );
  const registry = oakOpenApi.upstreamDatabaseContract.resolverRegistry;
  const resolverCorrespondence = registry.map((constant) => ({
    ...constant,
    databaseObject: databaseResolvers.get(constant.value) ?? null,
  }));
  const configuredSchemaUrls = [
    ...oce.source.configuredAbsoluteUrls,
    ...oce.source.sdkMetadata.serverUrls,
    oce.source.sdkMetadata.externalDocsUrl,
  ].filter(Boolean);

  return {
    resolverCorrespondence,
    matchedResolverCount: resolverCorrespondence.filter(
      ({ databaseObject }) => databaseObject !== null,
    ).length,
    unmatchedResolverConstants: resolverCorrespondence
      .filter(({ databaseObject }) => databaseObject === null)
      .map(({ symbol, value }) => ({ symbol, value })),
    oceConfiguredSchemaUrls: [...new Set(configuredSchemaUrls)].sort((left, right) =>
      codeUnitCompare(String(left), String(right)),
    ),
  };
}

async function main(): Promise<void> {
  const [databaseSnapshot, openApiSnapshot, oceSnapshot] = await Promise.all([
    snapshot(roots.databaseTools, 'oak-database-tools'),
    snapshot(roots.oakOpenApi, 'oak-openapi'),
    snapshot(roots.oce, '@oaknational/open-curriculum-ecosystem'),
  ]);
  const [databaseTools, oakOpenApi, oce] = await Promise.all([
    databaseToolsInventory(databaseSnapshot),
    oakOpenApiInventory(openApiSnapshot),
    oceConsumerInventory(oceSnapshot),
  ]);

  const allInputsClean = [databaseSnapshot, openApiSnapshot, oceSnapshot].every(
    (snapshot_) => snapshot_.input.clean,
  );

  await emitJson(
    {
      schemaVersion: 1,
      inputs: {
        databaseTools: databaseSnapshot.input,
        oakOpenApi: openApiSnapshot.input,
        oce: oceSnapshot.input,
        allClean: allInputsClean,
      },
      method: {
        population:
          'Git HEAD trees and committed blobs only; working-tree cleanliness is reported separately',
        qualification: 'Counts are structural evidence, not quality or runtime-outcome measures',
        sqlObjects:
          'Parse the first CREATE MATERIALIZED VIEW, VIEW or FUNCTION declaration in each tracked schema-doc SQL blob',
        apiSurface:
          'Count handler openapi metadata blocks and literal path/method declarations; this is not a live route crawl',
        correspondence:
          "Normalize parsed schema.relation names to Hasura schema_relation resolver names and compare with oak-openapi's exported registry",
        resolverUsage:
          'Count static symbol presence by non-test TypeScript source file outside the defining owaClient.ts registry, split across handlers, bulk-data and other source; this is not runtime call frequency',
        oce: 'Inspect committed configuration, generated schema source and generator metadata; do not fetch the live API or run code generation',
        policyAndBulk:
          'Parse committed rights-list JSON, the OCE OpenAPI cache, and the committed bulk manifest/schema as structural evidence only',
      },
      databaseTools,
      oakOpenApi,
      oceConsumer: oce,
      correspondence: crossSystemCorrespondence(databaseTools, oakOpenApi, oce),
    },
    optionalString(args.output),
  );
}

try {
  await main();
} catch (error) {
  const details = error instanceof Error ? (error.stack ?? error.message) : String(error);
  usageError(details, usage);
}
