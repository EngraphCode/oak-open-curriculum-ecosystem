/**
 * Reviewed anchors for the generated tool descriptions MCP-300 rewrote in
 * place (4e3ba6964): every generated description gained task-shaped "Use
 * when" prose and lost its PREREQUISITE imperative injection (those rows
 * retire via lineage, not here). Anchors are verbatim prefixes of the
 * current single-line description strings, plus the surviving injected
 * fragments (licensing, download-asset NOTE, token-limit NOTE,
 * WHEN-TO-PREFER) at their current wording.
 */

const ROOT = 'packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools';

const LICENSING_SENTENCE =
  'licence. Attribution required — see https://open-api.thenational.academy/docs/about-oaks-api/terms.';
// The leading literal \n\n rides in each anchor because the tokeniser glues
// a string-escape's trailing letter onto the following word (\nNOTE tokenises
// as one word token), so the escape must be part of the anchored sequence.
const DOWNLOAD_ASSET_NOTE = String.raw`\n\nNOTE: The asset ${'`'}url${'`'} fields returned by this tool are authenticated API endpoints`;
const TOKEN_LIMIT_NOTE = String.raw`\n\nNOTE: This tool can return a large payload at broad scope and may exceed a host`;

export const CURRENT_GENERATED_DESCRIPTION_ANCHOR_OVERRIDES = {
  C500: {
    [`${ROOT}/get-key-stages-subject-assets.ts`]: [
      'description: "Downloadable assets by key stage and subject',
    ],
  },
  C501: { [`${ROOT}/get-key-stages-subject-assets.ts`]: [LICENSING_SENTENCE] },
  C503: { [`${ROOT}/get-key-stages-subject-assets.ts`]: [DOWNLOAD_ASSET_NOTE] },
  C504: { [`${ROOT}/get-key-stages-subject-assets.ts`]: [TOKEN_LIMIT_NOTE] },
  C512: {
    [`${ROOT}/get-key-stages-subject-lessons.ts`]: [
      'description: "List lessons in a key stage and subject',
    ],
  },
  C522: {
    [`${ROOT}/get-key-stages-subject-questions.ts`]: [
      'description: "Quiz questions by key stage and subject',
    ],
  },
  C532: {
    [`${ROOT}/get-key-stages-subject-units.ts`]: ['description: "Units in a key stage and subject'],
  },
  C539: { [`${ROOT}/get-key-stages.ts`]: ['description: "All key stages'] },
  C544: { [`${ROOT}/get-keywords.ts`]: ['description: "Keywords by subject and key stage'] },
  C546: {
    [`${ROOT}/get-keywords.ts`]: [
      String.raw`\n\nWHEN TO PREFER WHICH KEYWORDS TOOL: this tool returns the LIVE keyword set`,
    ],
  },
  C550: { [`${ROOT}/get-lessons-assets.ts`]: ['description: "Downloadable assets for a lesson'] },
  C551: { [`${ROOT}/get-lessons-assets.ts`]: [LICENSING_SENTENCE] },
  C553: { [`${ROOT}/get-lessons-assets.ts`]: [DOWNLOAD_ASSET_NOTE] },
  C559: { [`${ROOT}/get-lessons-quiz.ts`]: ['description: "Quiz questions for a lesson'] },
  C566: { [`${ROOT}/get-lessons-summary.ts`]: ['description: "Lesson summary by slug'] },
  C572: { [`${ROOT}/get-lessons-transcript.ts`]: ['description: "Lesson video transcript'] },
  C578: {
    [`${ROOT}/get-programmes-assets.ts`]: ['description: "Downloadable assets in a programme'],
  },
  C579: { [`${ROOT}/get-programmes-assets.ts`]: [LICENSING_SENTENCE] },
  C581: { [`${ROOT}/get-programmes-assets.ts`]: [DOWNLOAD_ASSET_NOTE] },
  C589: {
    [`${ROOT}/get-programmes-questions.ts`]: ['description: "Quiz questions in a programme'],
  },
  C598: { [`${ROOT}/get-programmes-units.ts`]: ['description: "Units in a programme'] },
  C604: { [`${ROOT}/get-programmes.ts`]: ['description: "Get a programme by slug'] },
  C613: {
    [`${ROOT}/get-sequences-assets.ts`]: ['description: "Downloadable assets in a sequence'],
  },
  C620: {
    [`${ROOT}/get-sequences-questions.ts`]: ['description: "Quiz questions across a sequence'],
  },
  C629: { [`${ROOT}/get-sequences-units.ts`]: ['description: "Units in a curriculum sequence'] },
  C635: {
    [`${ROOT}/get-sequences.ts`]: [
      'description: "Sequencing information for a given sequence slug',
    ],
  },
  C640: {
    [`${ROOT}/get-subject-detail.ts`]: [
      'description: "Single subject with sequences, key stages, and years',
    ],
  },
  C645: { [`${ROOT}/get-subjects-key-stages.ts`]: ['description: "Key stages for a subject'] },
  C650: {
    [`${ROOT}/get-subjects-programmes.ts`]: ['description: "Get all programmes for a subject slug'],
  },
  C655: { [`${ROOT}/get-subjects-years.ts`]: ['description: "Year groups for a subject'] },
  C660: { [`${ROOT}/get-subjects.ts`]: ['description: "All subjects'] },
  C664: { [`${ROOT}/get-threads-units.ts`]: ['description: "Units in a thread'] },
  C669: { [`${ROOT}/get-threads.ts`]: ['description: "All threads'] },
  C673: { [`${ROOT}/get-units-summary.ts`]: ['description: "Unit summary by slug'] },
} as const;

export const CURRENT_GENERATED_DESCRIPTION_REVISION_OVERRIDES = {
  C500: 'modified',
  C501: 'modified',
  C503: 'modified',
  C504: 'modified',
  C512: 'modified',
  C522: 'modified',
  C532: 'modified',
  C539: 'modified',
  C544: 'modified',
  C546: 'modified',
  C550: 'modified',
  C551: 'modified',
  C553: 'modified',
  C559: 'modified',
  C566: 'modified',
  C572: 'modified',
  C578: 'modified',
  C579: 'modified',
  C581: 'modified',
  C589: 'modified',
  C598: 'modified',
  C604: 'modified',
  C613: 'modified',
  C620: 'modified',
  C629: 'modified',
  C635: 'modified',
  C640: 'modified',
  C645: 'modified',
  C650: 'modified',
  C655: 'modified',
  C660: 'modified',
  C664: 'modified',
  C669: 'modified',
  C673: 'modified',
} as const;
