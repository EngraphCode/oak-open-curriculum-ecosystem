/**
 * Reviewed post-baseline semantic deltas — the generated stub-mode tool
 * mirrors. Stubs carry no audited items of their own (the served items live
 * on the tools files), so entries here are exclusions pinning the exact
 * reviewed state of generated propagation.
 */
import {
  excluded,
  IMPLEMENTATION_ONLY,
  type CurrentSourceDeltaReview,
} from './current-source-delta-review-helpers.js';

export const SDK_GENERATED_STUBS_DELTA_REVIEWS: Readonly<Record<string, CurrentSourceDeltaReview>> =
  {
    // MCP-462: the stub mirrors gained upstream's new thread-parameter
    // description via regeneration.
    'packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/stubs/tools/get-threads-units.ts':
      excluded(
        '1e2c1d601897ebf8ca317ecbcd4acb4eadb9d25ac1edd59d9ac8fbbac43d7c46',
        IMPLEMENTATION_ONLY,
      ),
    'packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/stubs/tools/get-threads.ts':
      excluded(
        '9d1880bf2a71fa11164344cd91000cfffb415b07c39d8e3fbde4a9b2f730b775',
        IMPLEMENTATION_ONLY,
      ),
  };
