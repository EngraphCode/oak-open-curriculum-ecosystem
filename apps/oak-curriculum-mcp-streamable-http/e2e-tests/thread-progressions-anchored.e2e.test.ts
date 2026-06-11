/**
 * E2E (G3 c2): `tools/call` on the anchored get-thread-progressions.
 *
 * Exercises the real corpus path through the full HTTP stack — no upstream
 * stub is involved because the aggregated graph tool reads the compile-time
 * corpus, not the live API. The anchor is chosen deterministically from the
 * corpus so the test describes behaviour over any valid corpus.
 */

import { graphCorpus } from '@oaknational/sdk-codegen/graph-corpus';
import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { createApp } from '../src/application.js';
import {
  parseSseEnvelope,
  parseJsonRpcResult,
  getContentArray,
  getStructuredContentData,
} from './helpers/sse.js';
import {
  createMockObservability,
  createMockRuntimeConfig,
  createNoOpRateLimiterFactory,
} from './helpers/test-config.js';

const ACCEPT = 'application/json, text/event-stream';

/**
 * Schema-driven narrowing of the loose `structuredContent` record — the
 * test-boundary alternative to a type assertion. Non-strict: the family
 * envelope adds `summary` / `oakContextHint` / `status` alongside the
 * thread-anchored fields.
 */
const THREAD_ENVELOPE = z.object({
  anchorKind: z.literal('thread'),
  threads: z.array(
    z.object({
      thread: z.unknown(),
      totalUnits: z.number(),
      entries: z.array(z.object({ unit: z.unknown(), year: z.number().optional() })),
    }),
  ),
  resolvedAnchors: z.array(z.string()),
  unknownAnchors: z.array(z.string()),
});

/** A thread slug with at least one placement, chosen deterministically (first emitted sequence). */
const firstSequence = graphCorpus.sequences.find((sequence) => sequence.placements.length > 0);
if (firstSequence === undefined) {
  throw new Error('corpus has no non-empty sequence to anchor the e2e test');
}
const knownThreadSlug: string = firstSequence.threadId.slice(
  firstSequence.threadId.indexOf(':') + 1,
);

async function callThreadProgressions(args: unknown): Promise<request.Response> {
  const runtimeConfig = createMockRuntimeConfig({ dangerouslyDisableAuth: true });
  const app = await createApp({
    runtimeConfig,
    observability: createMockObservability(runtimeConfig),
    getWidgetHtml: () => '<!doctype html><html><body>test-widget</body></html>',
    rateLimiterFactory: createNoOpRateLimiterFactory(),
  });
  return request(app)
    .post('/mcp')
    .set('Host', 'localhost')
    .set('Accept', ACCEPT)
    .send({
      jsonrpc: '2.0',
      id: '1',
      method: 'tools/call',
      params: { name: 'get-thread-progressions', arguments: args },
    });
}

describe('get-thread-progressions anchored tools/call', () => {
  it('returns one thread’s year-ordered progression: summary + JSON content and structuredContent', async () => {
    const response = await callThreadProgressions({ threadSlug: knownThreadSlug });

    expect(response.status).toBe(200);
    const envelope = parseSseEnvelope(response.text);
    const result = parseJsonRpcResult(envelope);
    expect(result.isError).not.toBe(true);

    const content = getContentArray(result);
    expect(content).toHaveLength(2);

    const structured = THREAD_ENVELOPE.parse(getStructuredContentData(result));
    expect(structured.resolvedAnchors).toStrictEqual([`thread:${knownThreadSlug}`]);
    expect(structured.unknownAnchors).toStrictEqual([]);
    expect(structured.threads).toHaveLength(1);
    expect(structured.threads[0]?.entries.length).toBeGreaterThan(0);
  });

  it('rejects an anchorless call at the input boundary', async () => {
    const response = await callThreadProgressions({});

    expect(response.status).toBe(200);
    const envelope = parseSseEnvelope(response.text);
    const result = parseJsonRpcResult(envelope);
    expect(result.isError).toBe(true);
  });
});
