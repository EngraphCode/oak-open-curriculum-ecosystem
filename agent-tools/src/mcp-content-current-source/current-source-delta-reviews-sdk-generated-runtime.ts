/**
 * Reviewed post-baseline semantic deltas — the generated MCP runtime files
 * (contract, executor, alias types). These entered the walked current-source
 * set when the pagination echo gave paginated tools a value import of the
 * contract's Link-header helper (2026-09-01 payload audit). Each hash pins
 * the exact reviewed state; every entry is plumbing or types only, with no
 * authored agent-facing prose.
 */
import {
  excluded,
  IMPLEMENTATION_ONLY,
  TYPE_ONLY,
  type CurrentSourceDeltaReview,
} from './current-source-delta-review-helpers.js';

export const SDK_GENERATED_RUNTIME_DELTA_REVIEWS: Readonly<
  Record<string, CurrentSourceDeltaReview>
> = {
  'packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/aliases/types.ts':
    excluded('fb9f88dab2aa595bd9066c625f7bdcc99bd68e16950c5ad928c6d3e59d759ee0', TYPE_ONLY),
  'packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/contract/tool-descriptor.contract.ts':
    excluded(
      'c5de5df4daa9d3634d9df71a7f5a27a5b64fedf4ce29722e54ab5817a0c0d655',
      IMPLEMENTATION_ONLY,
    ),
  'packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/runtime/execute.ts':
    excluded(
      '6f836ac597d992ede4d35c42f31f454268bd2a2c733582b282f764bf81196f33',
      IMPLEMENTATION_ONLY,
    ),
};
