import { test, expect } from 'vitest';

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

test('repository path helpers produce stable structural groups', () => {
  const files = ['README.md', 'src/a.ts', 'src/b.test.ts', 'Dockerfile'];
  expect(countBy(files, topLevelOf)).toEqual({
    Dockerfile: 1,
    'README.md': 1,
    src: 2,
  });
  expect(extensionOf('Dockerfile')).toBe('[none]');
  expect(extensionOf('src/a.TS')).toBe('.ts');
});

test('migration pairs separate complete and irreversible directories', () => {
  const summary = summarizeMigrationPairs([
    'hasura-engine/migrations/Oak DB/001_init/up.sql',
    'hasura-engine/migrations/Oak DB/002_add/down.sql',
    'hasura-engine/migrations/Oak DB/002_add/up.sql',
    'unrelated/up.sql',
  ]);
  expect(summary).toEqual({
    directoryCount: 2,
    upCount: 2,
    downCount: 1,
    missingUp: [],
    missingDown: ['Oak DB/001_init'],
  });
});

test('migration SQL summary measures lines and explicit relational constraints', () => {
  expect(
    summarizeMigrationSql([
      {
        file: '001/up.sql',
        source: 'CREATE TABLE parent (id integer PRIMARY KEY);\n',
      },
      {
        file: '002/up.sql',
        source:
          'CREATE TABLE child (parent_id integer REFERENCES parent(id), CHECK (parent_id > 0));\nALTER TABLE child ADD FOREIGN KEY (parent_id) REFERENCES parent(id);\n',
      },
    ]),
  ).toEqual({
    upFileCount: 2,
    lineCount: 3,
    referencesKeywordCount: 2,
    foreignKeyKeywordCount: 1,
    checkConstraintTokenCount: 1,
  });
});

test('SQL object extraction records relation and unique-index evidence', () => {
  expect(
    extractSqlObject(
      'view.sql',
      `CREATE MATERIALIZED VIEW published.mv_example_1_0_0 AS SELECT 1;
       CREATE UNIQUE INDEX mv_example_unique ON published.mv_example_1_0_0 (id);`,
    ),
  ).toEqual({
    file: 'view.sql',
    kind: 'materialized-view',
    schema: 'published',
    name: 'mv_example_1_0_0',
    relation: 'published.mv_example_1_0_0',
    hasUniqueIndex: true,
  });
  expect(hasuraResolverForRelation('"Oak DB"."table_name"')).toBe('Oak_DB_table_name');
});

test('oak-openapi source extraction finds registry values and endpoint metadata', () => {
  const source = `
export const sequenceView =
  'published_mv_curriculum_sequence_b_13_0_21';
export const ignored = 42;
const meta = { openapi: { method: 'GET', path: '/sequences/{sequence}' } };
const duplicate = { method: 'GET', path: '/sequences/{sequence}' };
const jsonPath = { path: 'programme_fields' };
`;
  expect(extractExportedStringConstants(source)).toEqual([
    {
      symbol: 'sequenceView',
      value: 'published_mv_curriculum_sequence_b_13_0_21',
    },
  ]);
  expect(extractOpenApiPaths(source)).toEqual(['/sequences/{sequence}']);
  expect(extractOpenApiMethods(source)).toEqual(['GET', 'GET']);
});

test('resolver usage includes bulk-data consumers and reports file scope', () => {
  const entries = [
    {
      file: 'src/lib/owaClient.ts',
      source: "export const lessonView = 'published_lesson';",
    },
    {
      file: 'src/lib/handlers/lesson/lesson.ts',
      source: 'lessonView; lessonView;',
    },
    {
      file: 'src/lib/bulk-data/get-data.ts',
      source: 'lessonOpenApiWithTranscriptsView;',
    },
    {
      file: 'src/lib/report.ts',
      source: '// lessonView\nconst value = lessonViewTable;',
    },
    {
      file: 'src/lib/bulk-data/get-data.test.ts',
      source: 'lessonOpenApiWithTranscriptsView;',
    },
  ];
  const consumers = entries.filter(({ file }) => isResolverConsumerFile(file));

  expect(consumers.map(({ file }) => file)).toEqual([
    'src/lib/handlers/lesson/lesson.ts',
    'src/lib/bulk-data/get-data.ts',
    'src/lib/report.ts',
  ]);
  expect(
    summarizeResolverUsage(consumers, ['lessonView', 'lessonOpenApiWithTranscriptsView']),
  ).toEqual({
    sourceFileCount: 3,
    sourceFileCountsBySurface: {
      handlers: 1,
      bulkData: 1,
      otherSource: 1,
    },
    resolverFileCounts: {
      lessonView: 1,
      lessonOpenApiWithTranscriptsView: 1,
    },
    resolverFileCountsBySurface: {
      handlers: {
        lessonView: 1,
        lessonOpenApiWithTranscriptsView: 0,
      },
      bulkData: {
        lessonView: 0,
        lessonOpenApiWithTranscriptsView: 1,
      },
      otherSource: {
        lessonView: 0,
        lessonOpenApiWithTranscriptsView: 0,
      },
    },
  });
});

test('comment stripping preserves strings while removing inactive metadata', () => {
  const source = `
const url = "https://example.test/path";
// const inactive = { method: 'GET', path: '/inactive' };
const active = { method: 'GET', path: '/active' };
/* const old = { method: 'POST', path: '/old' }; */
`;
  const stripped = stripJavaScriptComments(source);
  expect(stripped).toMatch(/https:\/\/example\.test\/path/);
  expect(extractOpenApiPaths(stripped)).toEqual(['/active']);
  expect(extractOpenApiMethods(stripped)).toEqual(['GET']);
});

test('OCE extraction distinguishes configured URLs and generated path keys', () => {
  const source = `
const defaultBaseUrl = 'https://open-api.thenational.academy/';
const docs = "https://example.test/docs";
`;
  expect(extractAbsoluteUrls(source)).toEqual([
    'https://example.test/docs',
    'https://open-api.thenational.academy/',
  ]);
  expect(
    countOpenApiPathKeys(`{
      "paths": {
        "/lessons/{lesson}/summary": {},
        "/subjects": {}
      },
      "components": {}
    }`),
  ).toBe(2);
  expect(countOpenApiPathKeys('export const value = {};')).toBe(null);
});

test('OpenAPI summaries expose response openness and operation bounds', () => {
  const document = {
    paths: {
      '/things': {
        parameters: [{ in: 'header', name: 'shared', schema: { type: 'string' } }],
        get: {
          parameters: [
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'number', maximum: 100 },
            },
            { $ref: '#/components/parameters/Cursor' },
          ],
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      open: { type: 'object' },
                      closed: { type: 'object', additionalProperties: false },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  expect(summarizeOpenApiOperationParameters(document)).toEqual({
    inlineParameterCount: 1,
    referenceParameterCount: 1,
    locationCounts: { query: 1 },
    maximumConstraintCount: 1,
    maximums: [{ method: 'get', path: '/things', name: 'limit', maximum: 100 }],
  });
  expect(summarizeOpenApiObjectSchemas(document)).toEqual({
    objectSchemaCount: 3,
    additionalPropertiesAbsentCount: 2,
    additionalPropertiesAbsentPaths: [
      'paths./things.get.responses.200.content.application/json.schema',
      'paths./things.get.responses.200.content.application/json.schema.properties.open',
    ],
    additionalPropertiesFalseCount: 1,
    additionalPropertiesOtherCount: 0,
  });
});
