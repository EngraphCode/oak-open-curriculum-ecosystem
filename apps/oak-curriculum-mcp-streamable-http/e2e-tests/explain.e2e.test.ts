/**
 * E2E tests for the explain effort-orientation tool (WS-B D3).
 *
 * These tests exercise the full MCP protocol path, proving that a connected
 * client can:
 * - Discover the explain tool via tools/list (with its effort-scoped
 *   description), alongside the curriculum tools — coexistence.
 * - Call it via tools/call and receive the ADR-058 dual-shape result carrying
 *   the committed effort-orientation body.
 *
 * The served body and description are compared to the imported source-of-truth
 * constants, never grepped for prose — the curriculum / volatility / compliance
 * firewalls are held by construction and PR review, never by tests (see the
 * plan's test-doctrine correction).
 */

import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { createStubbedHttpApp, STUB_ACCEPT_HEADER } from './helpers/create-stubbed-http-app.js';
import { parseSseEnvelope } from './helpers/sse.js';
import { EXPLAIN_TOOL_NAME, EXPLAIN_TOOL_DESCRIPTION } from '../src/explain/explain-tool.js';
import { EXPLAIN_ORIENTATION_BODY } from '../src/generated/explain-content.js';

const ToolsListResultSchema = z.object({
  tools: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
    }),
  ),
});

const ToolsCallResultSchema = z.object({
  content: z.array(
    z.object({
      type: z.string(),
      text: z.string().optional(),
    }),
  ),
  structuredContent: z.object({ orientation: z.string() }),
  isError: z.boolean().optional(),
});

describe('Explain tool E2E', () => {
  describe('tools/list — client can discover the explain tool', () => {
    it('advertises explain with its effort-scoped description, alongside the curriculum tools', async () => {
      const { app } = await createStubbedHttpApp();

      const response = await request(app)
        .post('/mcp')
        .set('Host', 'localhost')
        .set('Accept', STUB_ACCEPT_HEADER)
        .send({ jsonrpc: '2.0', id: '1', method: 'tools/list' });

      expect(response.status).toBe(200);

      const envelope = parseSseEnvelope(response.text);
      const parsed = ToolsListResultSchema.safeParse(envelope.result);
      expect(parsed.success).toBe(true);

      const tools = parsed.data?.tools ?? [];
      const explain = tools.find((t) => t.name === EXPLAIN_TOOL_NAME);

      expect(explain).toBeDefined();
      expect(explain?.description).toBe(EXPLAIN_TOOL_DESCRIPTION);
      // Non-vacuous coexistence: the curriculum tools are still advertised in
      // the same list, so the additive registration did not displace them.
      expect(tools.map((t) => t.name)).toContain('get-curriculum-model');
    });
  });

  describe('tools/call — client receives the effort orientation', () => {
    it('returns the ADR-058 dual-shape result carrying the committed orientation body', async () => {
      const { app } = await createStubbedHttpApp();

      const response = await request(app)
        .post('/mcp')
        .set('Host', 'localhost')
        .set('Accept', STUB_ACCEPT_HEADER)
        .send({
          jsonrpc: '2.0',
          id: '1',
          method: 'tools/call',
          params: { name: EXPLAIN_TOOL_NAME, arguments: {} },
        });

      expect(response.status).toBe(200);

      const envelope = parseSseEnvelope(response.text);
      const parsed = ToolsCallResultSchema.safeParse(envelope.result);
      expect(parsed.success).toBe(true);

      // ADR-058 dual shape: a 2-item content array plus structuredContent.
      expect(parsed.data?.content).toHaveLength(2);
      // content[0] is the human-readable summary slot (text, non-empty) at the wire.
      const summary = parsed.data?.content[0];
      expect(summary).toHaveProperty('type', 'text');
      expect((summary?.text ?? '').length).toBeGreaterThan(0);
      expect(parsed.data?.isError).not.toBe(true);
      // Serves the committed generated body (source-of-truth comparison).
      expect(parsed.data?.structuredContent?.orientation).toBe(EXPLAIN_ORIENTATION_BODY);
    });
  });
});
