import { describe, expect, it } from 'vitest';

import { serializeThreadProgressionGraph } from './write-graph-file.js';
import type { ThreadProgressionGraph } from './thread-progression-generator.js';

function createThreadProgressionGraph(): ThreadProgressionGraph {
  return {
    version: '1.0.0',
    generatedAt: '2026-03-29T15:00:00.000Z',
    sourceVersion: '2026-03-29',
    stats: {
      threadCount: 1,
      subjectsCovered: ['maths'],
    },
    threads: [
      {
        slug: 'fractions',
        title: 'Fractions',
        subjects: ['maths'],
        firstYear: 2,
        lastYear: 6,
        unitCount: 2,
        units: ['unit-1', 'unit-2'],
      },
    ],
    seeAlso:
      'Use get-curriculum-model for complete orientation (includes property graph). Use get-prior-knowledge-graph for unit dependencies.',
  };
}

describe('serializeThreadProgressionGraph', () => {
  it('does not emit eslint-disable directives in generated output', () => {
    const serialized = serializeThreadProgressionGraph(createThreadProgressionGraph());

    expect(serialized).toContain('export const threadProgressionGraph = {');
    expect(serialized).not.toContain('eslint-disable');
  });

  it('escapes single quotes in thread titles so the generated module stays valid TypeScript', () => {
    const base = createThreadProgressionGraph();
    const graph: ThreadProgressionGraph = {
      ...base,
      threads: [{ ...base.threads[0], title: "Newton's Laws" }],
    };

    const serialized = serializeThreadProgressionGraph(graph);

    expect(serialized).toContain("title: 'Newton\\'s Laws',");
  });

  it('serializes an absent year range as the literal undefined', () => {
    const base = createThreadProgressionGraph();
    const graph: ThreadProgressionGraph = {
      ...base,
      threads: [{ ...base.threads[0], firstYear: undefined, lastYear: undefined }],
    };

    const serialized = serializeThreadProgressionGraph(graph);

    expect(serialized).toContain('firstYear: undefined,');
    expect(serialized).toContain('lastYear: undefined,');
  });
});
