/**
 * Integration tests for the anchored get-thread-progressions tool (G3 c2).
 *
 * @remarks
 * Integration, not unit: the tool reads the compile-time graph corpus, whose
 * module loads `data.json` at import time (IO), and the anchor fixtures are
 * derived from that corpus.
 *
 * These tests describe the TOOL ENVELOPE: input parsing at the MCP boundary
 * (exactly one anchor mode per call — `threadSlug` detail, or
 * `subject`+`keyStage` discovery), dispatch to the thread-progressions view,
 * and the response shape (summary TextContent + serialised JSON TextContent +
 * structuredContent). The retrieval semantics themselves — year ordering,
 * descriptor shape, anchor resolution — are specified by the view's own tests
 * in `@oaknational/graph-corpus-sdk` and are not re-specified here.
 *
 * Anchor fixtures are chosen deterministically from the corpus so the tests
 * describe behaviour over any valid corpus rather than pinning content.
 * The one deliberate exception is the advertised-examples coherence block,
 * which pins that the schema's own example values resolve against the
 * shipped corpus (MCP-319).
 */

import { graphCorpus } from '@oaknational/sdk-codegen/graph-corpus';
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  GET_THREAD_PROGRESSIONS_TOOL_DEF,
  GET_THREAD_PROGRESSIONS_INPUT_SCHEMA,
  runThreadProgressionsTool,
} from './aggregated-thread-progressions.js';

/** Narrows a deterministic fixture pick, failing loudly if the corpus cannot supply it. */
function required<T>(value: T | undefined, message: string): T {
  if (value === undefined) {
    throw new Error(message);
  }
  return value;
}

const bareSlug = (id: string): string => id.slice(id.indexOf(':') + 1);

/** A thread slug carrying at least one placement (lexicographic minimum sequence). */
const knownThreadSlug = bareSlug(
  required(
    graphCorpus.sequences.filter((sequence) => sequence.placements.length > 0)[0]?.threadId,
    'corpus has no non-empty sequence to anchor the tool tests',
  ),
);

/** A (subject, keyStage) pair known to exist on a sequenced unit. */
const knownSubjectKeyStage = required(
  (() => {
    const placedUnitIds = new Set(
      graphCorpus.sequences.flatMap((sequence) =>
        sequence.placements.map((placement) => placement.unitId),
      ),
    );
    const unit = graphCorpus.nodes.find(
      (node) => node.kind === 'unit' && placedUnitIds.has(node.id),
    );
    return unit?.kind === 'unit' ? { subject: unit.subject, keyStage: unit.keyStage } : undefined;
  })(),
  'corpus has no sequenced unit to derive a subject+keyStage anchor',
);

const TEXT_CONTENT = z.object({ type: z.literal('text'), text: z.string() });

/** Non-strict envelope narrowing per anchor kind (the family envelope adds summary/status fields). */
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

const DISCOVERY_ENVELOPE = z.object({
  anchorKind: z.literal('subjectKeyStage'),
  subject: z.string(),
  keyStage: z.string(),
  threads: z.array(
    z.object({ thread: z.unknown(), totalUnits: z.number(), subjects: z.array(z.string()) }),
  ),
});

describe('GET_THREAD_PROGRESSIONS_TOOL_DEF', () => {
  it('describes the anchored bounded contract, not a whole-corpus dump', () => {
    expect(GET_THREAD_PROGRESSIONS_TOOL_DEF.description).toContain('anchor');
    expect(GET_THREAD_PROGRESSIONS_TOOL_DEF.description).toContain('threadSlug');
    expect(GET_THREAD_PROGRESSIONS_TOOL_DEF.description).toContain('subject + keyStage');
    expect(GET_THREAD_PROGRESSIONS_TOOL_DEF.description).not.toContain('complete static graph');
  });

  it('states the year-axis ordering semantics honestly', () => {
    expect(GET_THREAD_PROGRESSIONS_TOOL_DEF.description).toContain('teaching year');
    expect(GET_THREAD_PROGRESSIONS_TOOL_DEF.description).toContain(
      'Within one year the order is not curricular',
    );
  });

  it('is read-only, idempotent, and closed-world', () => {
    expect(GET_THREAD_PROGRESSIONS_TOOL_DEF.annotations).toEqual({
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
      title: GET_THREAD_PROGRESSIONS_TOOL_DEF.title,
    });
  });
});

describe('runThreadProgressionsTool — anchor exclusivity at the boundary', () => {
  it('rejects a call with no anchor', () => {
    const result = runThreadProgressionsTool({});

    expect(result.isError).toBe(true);
  });

  it('rejects combining threadSlug with the discovery anchor', () => {
    const result = runThreadProgressionsTool({
      threadSlug: knownThreadSlug,
      subject: knownSubjectKeyStage.subject,
      keyStage: knownSubjectKeyStage.keyStage,
    });

    expect(result.isError).toBe(true);
  });

  it('rejects a discovery anchor missing its other half', () => {
    const result = runThreadProgressionsTool({ subject: knownSubjectKeyStage.subject });

    expect(result.isError).toBe(true);
  });
});

describe('runThreadProgressionsTool — thread detail anchor', () => {
  it('returns one thread’s progression in structuredContent with paired TextContent', () => {
    const result = runThreadProgressionsTool({ threadSlug: knownThreadSlug });

    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(2);
    for (const block of result.content) {
      expect(TEXT_CONTENT.safeParse(block).success).toBe(true);
    }

    const envelope = THREAD_ENVELOPE.parse(result.structuredContent);
    expect(envelope.threads).toHaveLength(1);
    expect(envelope.resolvedAnchors).toEqual([`thread:${knownThreadSlug}`]);
    expect(envelope.threads[0]?.entries.length).toBeGreaterThan(0);
  });

  it('reports an unknown thread slug without erroring (well-formed empty)', () => {
    const result = runThreadProgressionsTool({ threadSlug: 'no-such-thread' });

    expect(result.isError).toBeUndefined();
    const envelope = THREAD_ENVELOPE.parse(result.structuredContent);
    expect(envelope.threads).toEqual([]);
    expect(envelope.unknownAnchors).toEqual(['no-such-thread']);
  });
});

describe('runThreadProgressionsTool — subject+keyStage discovery anchor', () => {
  it('returns bounded descriptors without sequences', () => {
    const result = runThreadProgressionsTool(knownSubjectKeyStage);

    expect(result.isError).toBeUndefined();
    const envelope = DISCOVERY_ENVELOPE.parse(result.structuredContent);
    expect(envelope.threads.length).toBeGreaterThan(0);
    expect(envelope.threads.length).toBeLessThan(graphCorpus.sequences.length);
    expect(envelope.threads[0]).not.toHaveProperty('entries');
  });

  it('returns a well-formed empty result for an unmatched anchor', () => {
    const result = runThreadProgressionsTool({ subject: 'no-such-subject', keyStage: 'ks2' });

    expect(result.isError).toBeUndefined();
    const envelope = DISCOVERY_ENVELOPE.parse(result.structuredContent);
    expect(envelope.threads).toEqual([]);
  });
});

describe('advertised examples are true of the shipped corpus', () => {
  // INVARIANT, do not loosen on a corpus rename: every advertised example
  // must be resolvable by the bundled corpus this package ships — a red here
  // means the metadata and the data have diverged, which is the MCP-319
  // defect class. Deployed truth for ES/API-backed examples (search, fetch,
  // download-asset) is proven by the live drive (MCP-303), not here.
  const shape = GET_THREAD_PROGRESSIONS_INPUT_SCHEMA;

  function advertisedExamples(schema: z.ZodType, name: string): unknown[] {
    return z
      .array(z.unknown())
      .min(1, `no advertised examples on ${name}`)
      .parse(schema.meta()?.examples);
  }

  it('resolves every advertised threadSlug example as a detail anchor', () => {
    for (const example of advertisedExamples(shape.threadSlug, 'threadSlug')) {
      const result = runThreadProgressionsTool({ threadSlug: example });
      expect(result.isError, `threadSlug example ${String(example)} must resolve`).toBeUndefined();
      expect(result.structuredContent).toMatchObject({ unknownAnchors: [] });
      const { resolvedAnchors } = z
        .object({ resolvedAnchors: z.array(z.unknown()) })
        .parse(result.structuredContent);
      expect(
        resolvedAnchors,
        `threadSlug example ${String(example)} must resolve an anchor`,
      ).not.toHaveLength(0);
    }
  });

  it('advertises every example on the wire JSON Schema', () => {
    // The corpus tests above read `.meta()` off the Zod objects; agents
    // read the CONVERTED wire form. This proves the authored metadata
    // survives `z.toJSONSchema()` for every field, wrapped or not.
    const WIRE_PROPERTIES = z.object({
      properties: z.record(
        z.string(),
        z.looseObject({ examples: z.array(z.unknown()).optional() }),
      ),
    });
    const { properties } = WIRE_PROPERTIES.parse(z.toJSONSchema(z.object(shape)));
    for (const [field, schema] of Object.entries(shape)) {
      expect(properties[field]?.examples, `${field} examples on the wire`).toEqual(
        schema.meta()?.examples,
      );
    }
  });

  it('resolves the advertised subject and keyStage examples as a discovery anchor', () => {
    const [subject] = advertisedExamples(shape.subject, 'subject');
    const [keyStage] = advertisedExamples(shape.keyStage, 'keyStage');
    const result = runThreadProgressionsTool({ subject, keyStage });
    expect(result.isError).toBeUndefined();
    const { threads } = z.object({ threads: z.array(z.unknown()) }).parse(result.structuredContent);
    expect(threads.length).toBeGreaterThan(0);
  });
});
