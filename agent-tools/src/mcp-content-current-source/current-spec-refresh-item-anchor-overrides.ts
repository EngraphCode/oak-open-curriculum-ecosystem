/**
 * Reviewed current-source anchors for items whose baseline fragments moved
 * with the MCP-462 upstream spec refresh (spec 0.7.x, 2026-07 → aligned
 * 2026-08-03): the "Use the this type" typo fix, generic pagination
 * rewording, changed example values, and newly-added parameter
 * descriptions. Each entry is a compliance review act; the paired revision
 * verdicts live in the companion export below.
 */

const GENERATED_ROOT =
  'packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools';
const TOOL_DESCRIPTION_PARTS =
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/mcp-tools/parts/tool-description.ts';
const PARAM_OVERRIDES =
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/mcp-tools/parts/param-description-overrides.ts';

export const CURRENT_SPEC_REFRESH_ITEM_ANCHOR_OVERRIDES = {
  // The disambiguation note dropped "full" (the keywords endpoint is now
  // server-paginated, so "full keyword set" was no longer accurate).
  C458: {
    [TOOL_DESCRIPTION_PARTS]: [
      'WHEN TO PREFER WHICH KEYWORDS TOOL: this tool returns the LIVE keyword set',
    ],
  },
  // Upstream's rework replaced the transposed offset/limit descriptions
  // with generic whole-list wording (still wrong for the per-unit
  // behaviour); upstreamBuggyDescription re-pinned at the 2026-08-03 owner
  // card, keep + re-pin.
  C464: {
    [PARAM_OVERRIDES]: [
      "'/key-stages/{keyStage}/subject/{subject}/lessons:offset': {\n    correctDescription: 'Offset applied to lessons within each unit (not to the unit list).',",
    ],
  },
  C465: {
    [PARAM_OVERRIDES]: [
      "'/key-stages/{keyStage}/subject/{subject}/lessons:limit': {\n    correctDescription:\n      'Limit the number of lessons returned per unit. Units with zero lessons after limiting are omitted.',",
    ],
  },
  // The "Use the this type" typo fix (TSDoc line, then the args surface).
  C507: {
    [`${GENERATED_ROOT}/get-key-stages-subject-assets.ts`]: [
      String.raw`  /** Use this type and the lesson slug in conjunction to get a signed download URL to the asset type from the /api/lessons/\{slug\}/assets/\{type\} endpoint Allowed values: slideDeck, exitQuiz, exitQuizAnswers, starterQuiz, starterQuizAnswers, supplementaryResource, video, worksheet, worksheetAnswers */`,
    ],
  },
  C509: {
    [`${GENERATED_ROOT}/get-key-stages-subject-assets.ts`]: [
      "const toolArgsDescription = 'Invalid request parameters. Please match the following schema:",
      '"description":"Use this type and the lesson slug in conjunction to get a signed download URL',
    ],
  },
  // The units examBoard parameter gained a description.
  C536: {
    [`${GENERATED_ROOT}/get-key-stages-subject-units.ts`]: [
      "const toolArgsDescription = 'Invalid request parameters. Please match the following schema:",
      '"examBoard":{"type":"string","description":"Optional exam board slug to filter units by',
    ],
  },
  // The keywords endpoint gained offset/limit pagination.
  C547: {
    [`${GENERATED_ROOT}/get-keywords.ts`]: [
      "const toolArgsDescription = 'Invalid request parameters. Please match the following schema:",
      '"offset":{"type":"number","description":"If limiting results returned, this allows you to return the next set of results, starting at the given offset point","default":0,"examples":[0]}',
    ],
  },
  // The lessons-assets type parameter's wording became "Optional asset
  // type specifier" plus an Available-values list.
  C555: {
    [`${GENERATED_ROOT}/get-lessons-assets.ts`]: [
      '  /** Optional asset type specifier',
      'Available values: slideDeck, exitQuiz, exitQuizAnswers, starterQuiz, starterQuizAnswers, supplementaryResource, video, worksheet, worksheetAnswers Allowed values: slideDeck',
    ],
  },
  C556: {
    [`${GENERATED_ROOT}/get-lessons-assets.ts`]: [
      "const toolArgsDescription = 'Invalid request parameters. Please match the following schema:",
      String.raw`"type":{"type":"string","description":"Optional asset type specifier\\n\\nAvailable values: slideDeck`,
    ],
  },
  // The lesson slug example changed.
  C569: {
    [`${GENERATED_ROOT}/get-lessons-summary.ts`]: [
      "const toolArgsDescription = 'Invalid request parameters. Please match the following schema:",
      '"lesson":{"type":"string","description":"The slug of the lesson","examples":["using-vector-tools-to-draw-and-modify-shapes"]}',
    ],
  },
  // The "Use the this type" typo fix, programmes-assets TSDoc.
  C585: {
    [`${GENERATED_ROOT}/get-programmes-assets.ts`]: [
      String.raw`  /** Use this type and the lesson slug in conjunction to get a signed download URL to the asset type from the /api/lessons/\{slug\}/assets/\{type\} endpoint Allowed values: slideDeck, exitQuiz, exitQuizAnswers, starterQuiz, starterQuizAnswers, supplementaryResource, video, worksheet, worksheetAnswers */`,
    ],
  },
  // The sequence slug example changed (english-primary → maths-primary);
  // C614/C615/C616 share the file's zod-lines baseline fragment.
  C614: {
    [`${GENERATED_ROOT}/get-sequences-assets.ts`]: [
      'export const toolZodSchema = z.object({ params: z.object({ path: z.object({ sequence: z.string().describe("The sequence slug identifier, including the key stage 4 option where relevant.") })',
      'sequence: z.string().describe("The sequence slug identifier, including the key stage 4 option where relevant.").meta({ examples: ["maths-primary"] })',
    ],
  },
  C615: {
    [`${GENERATED_ROOT}/get-sequences-assets.ts`]: [
      'export const toolZodSchema = z.object({ params: z.object({ path: z.object({ sequence: z.string().describe("The sequence slug identifier, including the key stage 4 option where relevant.") })',
      'sequence: z.string().describe("The sequence slug identifier, including the key stage 4 option where relevant.").meta({ examples: ["maths-primary"] })',
    ],
  },
  C616: {
    [`${GENERATED_ROOT}/get-sequences-assets.ts`]: [
      'export const toolZodSchema = z.object({ params: z.object({ path: z.object({ sequence: z.string().describe("The sequence slug identifier, including the key stage 4 option where relevant.") })',
      'sequence: z.string().describe("The sequence slug identifier, including the key stage 4 option where relevant.").meta({ examples: ["maths-primary"] })',
    ],
  },
  C617: {
    [`${GENERATED_ROOT}/get-sequences-assets.ts`]: [
      "const toolArgsDescription = 'Invalid request parameters. Please match the following schema:",
      '"sequence":{"type":"string","description":"The sequence slug identifier, including the key stage 4 option where relevant.","examples":["maths-primary"]}',
    ],
  },
  // The sequence slug example changed (english-secondary →
  // english-secondary-aqa).
  C636: {
    [`${GENERATED_ROOT}/get-sequences.ts`]: [
      'export const toolZodSchema = z.object({ params: z.object({ path: z.object({ sequence: z.string().describe("The sequence slug identifier") }) }) });',
      'sequence: z.string().describe("The sequence slug identifier").meta({ examples: ["english-secondary-aqa"] })',
    ],
  },
  C637: {
    [`${GENERATED_ROOT}/get-sequences.ts`]: [
      "const toolArgsDescription = 'Invalid request parameters. Please match the following schema:",
      '"sequence":{"type":"string","description":"The sequence slug identifier","examples":["english-secondary-aqa"]}',
    ],
  },
  // The thread parameter gained a description.
  C665: {
    [`${GENERATED_ROOT}/get-threads-units.ts`]: [
      '"thread":{"type":"string","description":"The thread identifier for a given unit","examples":["number-multiplication-and-division"]}',
      'thread: z.string().describe("The thread identifier for a given unit").meta({ examples: ["number-multiplication-and-division"] })',
    ],
  },
  C666: {
    [`${GENERATED_ROOT}/get-threads-units.ts`]: [
      "const toolArgsDescription = 'Invalid request parameters. Please match the following schema:",
      '"thread":{"type":"string","description":"The thread identifier for a given unit","examples":["number-multiplication-and-division"]}',
    ],
  },
  // The units-summary narrowing parameters gained descriptions.
  C674: {
    [`${GENERATED_ROOT}/get-units-summary.ts`]: [
      'export const toolMcpFlatInputSchema = z.strictObject({ unit: z.string().describe("The unit slug").meta({ examples: ["programming-subroutines"] })',
      `examBoard: z.enum(["aqa", "edexcel", "eduqas", "ocr", "wjec", "edexcelb"] as const).describe("Optional exam board slug to narrow the unit to a specific programme variant, e.g. 'aqa'.").meta({ examples: ["aqa"] }).optional()`,
    ],
  },
  C675: {
    [`${GENERATED_ROOT}/get-units-summary.ts`]: [
      "const toolArgsDescription = 'Invalid request parameters. Please match the following schema:",
      `"examBoard":{"type":"string","description":"Optional exam board slug to narrow the unit to a specific programme variant, e.g. 'aqa'.","examples":["aqa"]`,
    ],
  },
} as const;

/** Revision verdicts for the spec-refresh re-pins above (all in-place). */
export const CURRENT_SPEC_REFRESH_ITEM_REVISION_OVERRIDES = {
  C458: 'modified',
  C464: 'modified',
  C465: 'modified',
  C507: 'modified',
  C509: 'modified',
  C536: 'modified',
  C547: 'modified',
  C555: 'modified',
  C556: 'modified',
  C569: 'modified',
  C585: 'modified',
  C614: 'modified',
  C615: 'modified',
  C616: 'modified',
  C617: 'modified',
  C636: 'modified',
  C637: 'modified',
  C665: 'modified',
  C666: 'modified',
  C674: 'modified',
  C675: 'modified',
} as const;
