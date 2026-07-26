/**
 * Source-path bindings for the six MCP-101 guidance replacements.
 *
 * Paths are repo-relative because the generated current-source projection is
 * reviewed and diffed outside the TypeScript package graph.
 */

const GUIDANCE_ROOT = 'packages/sdks/oak-curriculum-sdk/src/mcp/guidance-resources';

export const CURRENT_SOURCE_GUIDANCE = [
  { source: `${GUIDANCE_ROOT}/find-lessons.ts`, uri: 'docs://oak/guidance/find-lessons.md' },
  {
    source: `${GUIDANCE_ROOT}/explore-curriculum.ts`,
    uri: 'docs://oak/guidance/explore-curriculum.md',
  },
  {
    source: `${GUIDANCE_ROOT}/learning-progression.ts`,
    uri: 'docs://oak/guidance/learning-progression.md',
  },
  {
    source: `${GUIDANCE_ROOT}/curriculum-mapping.ts`,
    uri: 'docs://oak/guidance/curriculum-mapping.md',
  },
  { source: `${GUIDANCE_ROOT}/adapt-lesson.ts`, uri: 'docs://oak/guidance/adapt-lesson.md' },
  {
    source: `${GUIDANCE_ROOT}/continue-progression.ts`,
    uri: 'docs://oak/guidance/continue-progression.md',
  },
] as const;
