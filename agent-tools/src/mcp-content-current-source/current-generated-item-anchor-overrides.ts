/**
 * Reviewed anchors for generated/API-derived items changed after the audit
 * baseline, plus the generator exclusion config relocated on latest main.
 */

const GENERATED_ROOT =
  'packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools';
const LESSONS = `${GENERATED_ROOT}/get-key-stages-subject-lessons.ts`;
const KEY_STAGE_QUESTIONS = `${GENERATED_ROOT}/get-key-stages-subject-questions.ts`;
const PROGRAMME_ASSETS = `${GENERATED_ROOT}/get-programmes-assets.ts`;
const PROGRAMME_QUESTIONS = `${GENERATED_ROOT}/get-programmes-questions.ts`;
const SEQUENCE_QUESTIONS = `${GENERATED_ROOT}/get-sequences-questions.ts`;

export const CURRENT_GENERATED_ITEM_ANCHOR_OVERRIDES = {
  C470: {
    'packages/sdks/oak-sdk-codegen/code-generation/excluded-paths.ts': [
      "export const SKIPPED_PATHS: ReadonlySet<string> = new Set([\n  '/search/lessons',\n  '/search/transcripts',\n  '/lessons/{lesson}/assets/{type}',\n]);",
    ],
  },
  C518: {
    [LESSONS]: [
      '  /** Limit the number of lessons returned per unit. Units with zero lessons after limiting are omitted. Default: 20 */',
    ],
  },
  // MCP-462: upstream's 2026-07 rework changed the limit example 20 → 10, and
  // the generator now carries upstream's `maximum` into the input schema.
  C519: {
    [LESSONS]: [
      String.raw`"default":20,"examples":[10],"maximum":300}},"additionalProperties":false,"required":["keyStage","subject"]}\nRequired: keyStage, subject`,
    ],
  },
  C527: {
    [KEY_STAGE_QUESTIONS]: [
      '  /** Limit the number of lessons, e.g. return a maximum of 300 lessons Default: 20 */',
    ],
  },
  // MCP-462: upstream's 2026-07 rework changed the limit example 20 → 10, and
  // the generator now carries upstream's `maximum` into the input schema.
  C529: {
    [KEY_STAGE_QUESTIONS]: [
      '"default":20,"examples":[10],"maximum":300},"filter":{"type":"string","description":"Optional filter for question results.',
      String.raw`\nRequired: keyStage, subject`,
    ],
  },
  C584: {
    [PROGRAMME_ASSETS]: [
      '  /** Limit the number of lessons, e.g. return a maximum of 300 lessons Default: 20 */',
    ],
  },
  // MCP-462: upstream's 2026-07 rework fixed the "Use the this type" typo, and
  // the generator now carries upstream's `maximum` into the input schema.
  C586: {
    [PROGRAMME_ASSETS]: [
      '"default":20,"examples":[20],"maximum":300},"type":{"type":"string","description":"Use this type',
      String.raw`\nRequired: programme`,
    ],
  },
  C593: {
    [PROGRAMME_QUESTIONS]: [
      '  /** Limit the number of lessons, e.g. return a maximum of 300 lessons Default: 20 */',
    ],
  },
  // MCP-462: the generator now carries upstream's `maximum` into the input schema.
  C595: {
    [PROGRAMME_QUESTIONS]: [
      '"default":20,"examples":[20],"maximum":300},"filter":{"type":"string","description":"Optional filter for question results.',
      String.raw`\nRequired: programme`,
    ],
  },
  C621: {
    [SEQUENCE_QUESTIONS]: [
      'The sequence slug identifier, including the key stage 4 option where relevant.',
      'The sequence slug identifier, including the key stage 4 option where relevant.',
    ],
  },
  C622: {
    [SEQUENCE_QUESTIONS]: [
      'The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used.',
      'The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used.',
    ],
  },
  C623: {
    [SEQUENCE_QUESTIONS]: [
      'If limiting results returned, this allows you to return the next set of results, starting at the given offset point',
      'If limiting results returned, this allows you to return the next set of results, starting at the given offset point',
    ],
  },
  C624: {
    [SEQUENCE_QUESTIONS]: [
      'Limit the number of lessons, e.g. return a maximum of 300 lessons Default: 20',
      'Limit the number of lessons, e.g. return a maximum of 300 lessons',
    ],
  },
  C625: {
    [SEQUENCE_QUESTIONS]: [
      'Optional filter for question results. Use `images` to return only questions with a question image or image answer.',
      'Optional filter for question results. Use `images` to return only questions with a question image or image answer.',
    ],
  },
  // MCP-462: upstream's 2026-07 rework changed the limit example 20 → 100, and
  // the generator now carries upstream's `maximum` into the input schema.
  C626: {
    [SEQUENCE_QUESTIONS]: [
      '"default":20,"examples":[100],"maximum":300},"filter":{"type":"string","description":"Optional filter for question results.',
      String.raw`\nRequired: sequence`,
    ],
  },
} as const;

export const CURRENT_GENERATED_ITEM_REVISION_OVERRIDES = {
  C470: 'relocated',
  C518: 'modified',
  C519: 'modified',
  C527: 'modified',
  C529: 'modified',
  C584: 'modified',
  C586: 'modified',
  C593: 'modified',
  C595: 'modified',
  C621: 'unchanged',
  C622: 'unchanged',
  C623: 'unchanged',
  C624: 'modified',
  C625: 'unchanged',
  C626: 'modified',
} as const;
