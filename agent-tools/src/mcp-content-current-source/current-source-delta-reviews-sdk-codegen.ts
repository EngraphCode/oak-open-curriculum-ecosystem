/**
 * Reviewed post-baseline semantic deltas — codegen generator sources (templates, typegen, constants).
 *
 * Every entry is a compliance review act: the semantic hash pins the exact
 * reviewed state; item ids cite the audit rows the file carries, or one
 * explicit exclusion reason says why the change adds no governed content.
 */
import {
  excluded,
  IMPLEMENTATION_ONLY,
  reviewed,
  type CurrentSourceDeltaReview,
  UPSTREAM_BULK_ONLY,
} from './current-source-delta-review-helpers.js';

export const SDK_CODEGEN_DELTA_REVIEWS: Readonly<Record<string, CurrentSourceDeltaReview>> = {
  'packages/sdks/oak-sdk-codegen/code-generation/apply-deferred-paths.ts': excluded(
    '7d95eb732a06a198166ebf3733a387e66e6c177c1974d4f3d3f194ec3b546ee0',
    IMPLEMENTATION_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/codegen.ts': excluded(
    '1dadef4f96511ba3a7c8ed3defb8db835173e856dc034a816efe74c6617a81e9',
    IMPLEMENTATION_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/excluded-paths.ts': reviewed(
    '54696cd55ab5ebc2c2015fc30ab3b022f00e97c8a642a101060d0156b34f9aec',
    ['A002', 'C470'],
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/resolve-schema-source.ts': excluded(
    'da1edf8b6b885c8894207e04480ed1f77d54fcfb029cfe2921cd1f781a67d26a',
    IMPLEMENTATION_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/schema-separation-core.ts': excluded(
    '096ce2c5a613a5fa33212ecc6ca1eeba4a575f7d960da32fc3acd1ffd20a4ac9',
    IMPLEMENTATION_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/bulk/schema-templates-part2.ts': excluded(
    '81b743427311cec21ad4a97dff8559e11ee9bfa9df73f3f668d38c7f8f997229',
    UPSTREAM_BULK_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/bulk/schema-templates-part3.ts': excluded(
    '21cd5d519ee7e3885674fbdb1e74082abad84b75112eb942bb14722d7405b2bf',
    UPSTREAM_BULK_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/bulk/schema-templates.ts': excluded(
    'd7cefcfc67a83313bc6a88cffdd09ca510e8d34415f8ab3b3afd5e354cd5ac9b',
    UPSTREAM_BULK_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/cross-domain-constants.ts': reviewed(
    'fd2db884860762272d0c2824c930d09082e46db88f918e2d47a0035483afcb7b',
    ['C479', 'C480'],
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/generate-widget-constants.ts': excluded(
    '2655cff78ca4a1cfb2dd0452f194f6cb33579f2372a0eb1e7ed09e1065e630d5',
    IMPLEMENTATION_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/mcp-tools/mcp-tool-generator.ts': reviewed(
    '7d41ed34891f4c2458eaa927020f622561e9ffeb7941950ce102f0220edeaad7',
    ['C471'],
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/mcp-tools/parts/emit-index.ts': reviewed(
    '30f6ee06bf550046782e898b3b4416aa99f693eec8b097f0b97674f586d11390',
    ['C475', 'C476', 'C477', 'C478'],
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/widget-uri-suffix.ts': excluded(
    '8c8c63616d88ddc3a467810c92fb899b241b539e958110d09a1013cdc332238a',
    IMPLEMENTATION_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/mcp-tools/parts/tool-description.ts':
    reviewed('26312f46dbe23f7798a31df5c5850a7fe1c8f262e3a1c66ea1d557cbdf1bd0a0', [
      'C453',
      'C454',
      'C456',
      'C457',
      'C458',
      'C459',
      'C460',
      'C461',
      'C462',
      'C463',
    ]),
};
