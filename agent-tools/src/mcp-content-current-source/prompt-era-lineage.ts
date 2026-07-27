/**
 * Explicit lineage for the 44 audit rows whose prompt-era source files were
 * removed by MCP-101.
 *
 * Empty targets mean the content retired. Multiple targets preserve split
 * lineage where one historical row now contributes to more than one source.
 */

const GUIDANCE_ROOT = 'packages/sdks/oak-curriculum-sdk/src/mcp/guidance-resources' as const;
const LANDING_ROOT = 'apps/oak-curriculum-mcp-streamable-http/src/landing-page' as const;

const GUIDANCE_SOURCE_BY_WORKFLOW = {
  'find-lessons': `${GUIDANCE_ROOT}/find-lessons.ts`,
  'explore-curriculum': `${GUIDANCE_ROOT}/explore-curriculum.ts`,
  'learning-progression': `${GUIDANCE_ROOT}/learning-progression.ts`,
  'curriculum-mapping': `${GUIDANCE_ROOT}/curriculum-mapping.ts`,
  'adapt-lesson': `${GUIDANCE_ROOT}/adapt-lesson.ts`,
  'continue-progression': `${GUIDANCE_ROOT}/continue-progression.ts`,
} as const;

export const GUIDANCE_SOURCE_ENTRIES = [
  [GUIDANCE_SOURCE_BY_WORKFLOW['find-lessons'], 'docs://oak/guidance/find-lessons.md'],
  [GUIDANCE_SOURCE_BY_WORKFLOW['explore-curriculum'], 'docs://oak/guidance/explore-curriculum.md'],
  [
    GUIDANCE_SOURCE_BY_WORKFLOW['learning-progression'],
    'docs://oak/guidance/learning-progression.md',
  ],
  [GUIDANCE_SOURCE_BY_WORKFLOW['curriculum-mapping'], 'docs://oak/guidance/curriculum-mapping.md'],
  [GUIDANCE_SOURCE_BY_WORKFLOW['adapt-lesson'], 'docs://oak/guidance/adapt-lesson.md'],
  [
    GUIDANCE_SOURCE_BY_WORKFLOW['continue-progression'],
    'docs://oak/guidance/continue-progression.md',
  ],
] as const;

const FIND = GUIDANCE_SOURCE_BY_WORKFLOW['find-lessons'];
const EXPLORE = GUIDANCE_SOURCE_BY_WORKFLOW['explore-curriculum'];
const LEARNING = GUIDANCE_SOURCE_BY_WORKFLOW['learning-progression'];
const MAPPING = GUIDANCE_SOURCE_BY_WORKFLOW['curriculum-mapping'];
const ADAPT = GUIDANCE_SOURCE_BY_WORKFLOW['adapt-lesson'];
const CONTINUE = GUIDANCE_SOURCE_BY_WORKFLOW['continue-progression'];
const ALL_GUIDANCE = [FIND, EXPLORE, LEARNING, MAPPING, ADAPT, CONTINUE] as const;
const LANDING_RESOURCES = `${LANDING_ROOT}/render-resources-section.ts`;
const LANDING_TOOLS = `${LANDING_ROOT}/render-tools-section.ts`;

const PROMPT_ERA_LINEAGE_ENTRIES = [
  ['C178', [FIND]],
  ['C179', []],
  ['C180', [EXPLORE]],
  ['C181', [LEARNING]],
  ['C182', [MAPPING]],
  ['C183', [ADAPT]],
  ['C184', [CONTINUE]],
  ['C185', [FIND]],
  ['C186', [FIND]],
  ['C187', [ADAPT]],
  ['C188', [ADAPT, CONTINUE]],
  ['C189', [EXPLORE]],
  ['C190', [EXPLORE]],
  ['C191', [LEARNING]],
  ['C192', [LEARNING, MAPPING, CONTINUE]],
  ['C193', [MAPPING]],
  ['C194', [MAPPING]],
  ['C195', [CONTINUE]],
  ['C196', [CONTINUE]],
  ['C197', [FIND]],
  ['C198', []],
  ['C199', [EXPLORE]],
  ['C200', [LEARNING]],
  ['C201', [MAPPING]],
  ['C202', [ADAPT]],
  ['C203', [CONTINUE]],
  ['C204', [CONTINUE]],
  ['C205', ALL_GUIDANCE],
  ['C206', [MAPPING, ADAPT, CONTINUE]],
  ['C207', [MAPPING, ADAPT]],
  ['C208', [MAPPING, ADAPT, CONTINUE]],
  ['C209', [MAPPING, ADAPT]],
  ['C329', [FIND]],
  ['C330', []],
  ['C331', [EXPLORE]],
  ['C332', [LEARNING]],
  ['C333', [MAPPING]],
  ['C334', [ADAPT]],
  ['C335', [CONTINUE]],
  ['C356', []],
  ['C357', [LANDING_RESOURCES, LANDING_TOOLS]],
  ['C358', []],
  ['C359', []],
  ['C370', [LANDING_RESOURCES, LANDING_TOOLS]],
] as const;

/** All item-level lineage that supersedes a surviving or removed baseline source. */
export const CURRENT_ITEM_LINEAGE_ENTRIES = [
  ...PROMPT_ERA_LINEAGE_ENTRIES,
  ['C470', ['packages/sdks/oak-sdk-codegen/code-generation/excluded-paths.ts']],
] as const;
