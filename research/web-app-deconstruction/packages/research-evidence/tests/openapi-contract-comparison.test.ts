import { test, expect } from 'vitest';

import {
  canonicalizeJson,
  collectJsonDifferencePaths,
  contractProjection,
  summarizeOpenApiDocument,
} from '../lib/openapi-contract-comparison.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function digRecord(value: unknown, ...keys: string[]): Record<string, unknown> {
  let current: unknown = value;
  for (const key of keys) {
    if (!isRecord(current)) {
      throw new TypeError(`Cannot read properties, expected record before '${key}'`);
    }
    current = current[key];
  }
  if (!isRecord(current)) {
    throw new TypeError('Expected record');
  }
  return current;
}

test('contract projections distinguish prose from structure', () => {
  const left = {
    openapi: '3.1.0',
    info: { title: 'deployment A' },
    paths: {
      '/things': {
        get: {
          summary: 'Old words',
          responses: { 200: { description: 'Old response' } },
        },
      },
    },
  };
  const right = {
    openapi: '3.1.0',
    info: { title: 'deployment B' },
    paths: {
      '/things': {
        get: {
          summary: 'New words',
          responses: { 200: { description: 'New response' } },
        },
      },
    },
  };

  expect(contractProjection(left, { includeProse: true })).not.toEqual(
    contractProjection(right, { includeProse: true }),
  );
  expect(contractProjection(left, { includeProse: false })).toEqual(
    contractProjection(right, { includeProse: false }),
  );
});

test('structural projection preserves schema members named like prose keywords', () => {
  const projection = contractProjection(
    {
      paths: {},
      components: {
        schemas: {
          Example: {
            type: 'object',
            description: 'annotation',
            properties: {
              description: { type: 'string', description: 'annotation' },
              example: { type: 'boolean', example: true },
              summary: { type: 'number' },
            },
          },
        },
      },
    },
    { includeProse: false },
  );

  expect(digRecord(projection, 'components', 'schemas', 'Example', 'properties')).toEqual({
    description: { type: 'string' },
    example: { type: 'boolean' },
    summary: { type: 'number' },
  });
  expect(
    Object.hasOwn(digRecord(projection, 'components', 'schemas', 'Example'), 'description'),
  ).toBe(false);
});

test('container-like domain property names do not change traversal context', () => {
  const projection = contractProjection(
    {
      paths: {},
      components: {
        schemas: {
          content: {
            type: 'object',
            description: 'component annotation',
            properties: {
              content: {
                type: 'object',
                description: 'property annotation',
                properties: {
                  value: { type: 'string', description: 'leaf annotation' },
                },
              },
              responses: {
                type: 'string',
                description: 'another property annotation',
              },
            },
          },
        },
      },
    },
    { includeProse: false },
  );

  expect(digRecord(projection, 'components', 'schemas', 'content')).toEqual({
    properties: {
      content: {
        properties: { value: { type: 'string' } },
        type: 'object',
      },
      responses: { type: 'string' },
    },
    type: 'object',
  });
});

test('canonicalization and differences are stable', () => {
  expect(canonicalizeJson({ z: 1, a: { y: 2, x: 3 } })).toEqual({
    a: { x: 3, y: 2 },
    z: 1,
  });
  expect(
    collectJsonDifferencePaths({ a: [{ value: 1 }], b: true }, { a: [{ value: 2 }], c: true }),
  ).toEqual(['a.0.value', 'b', 'c']);
});

test('OpenAPI summary records operations and component populations', () => {
  expect(
    summarizeOpenApiDocument({
      openapi: '3.1.0',
      info: { version: '1.2.3' },
      paths: {
        '/b': { post: { responses: {} } },
        '/a': { get: { responses: {} }, parameters: [] },
      },
      components: { schemas: { One: {}, Two: {} } },
    }),
  ).toEqual({
    openapi: '3.1.0',
    version: '1.2.3',
    pathCount: 2,
    operationCount: 2,
    operations: ['get /a', 'post /b'],
    componentSchemaCount: 2,
  });
});
