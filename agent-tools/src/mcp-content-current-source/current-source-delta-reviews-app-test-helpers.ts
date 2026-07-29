/**
 * Reviewed post-baseline semantic deltas — App test-helper sources (shared
 * fakes and fixtures under `src/test-helpers/`).
 *
 * Every entry is a compliance review act: the semantic hash pins the exact
 * reviewed state; item ids cite the audit rows the file carries, or one
 * explicit exclusion reason says why the change adds no governed content.
 * Split from `current-source-delta-reviews-app.ts` when the MCP-243 entries
 * took that map over the file-size gate.
 */
import {
  excluded,
  TEST_ONLY,
  type CurrentSourceDeltaReview,
} from './current-source-delta-review-helpers.js';

export const APP_TEST_HELPERS_DELTA_REVIEWS: Readonly<Record<string, CurrentSourceDeltaReview>> = {
  'apps/oak-curriculum-mcp-streamable-http/src/test-helpers/auth-error-test-helpers.ts': excluded(
    '1f09358427ac9ca4f2f0027636515abcfd123c64ae6bf468574c8d767fcccd6c',
    TEST_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/test-helpers/fakes-mcp-server.ts': excluded(
    '587ea4f25b03c4355e71548abc06ddb5b542e83d3bb3078cba215d7d1c5f0a0c',
    TEST_ONLY,
  ),
  // MCP-242: product-analytics test fakes extracted from fakes.ts.
  'apps/oak-curriculum-mcp-streamable-http/src/test-helpers/fakes-product-analytics.ts': excluded(
    'ab5e6009c82e2b213aea36a4c5fc660445e0cb5f50a3f4453973d35edd365999',
    TEST_ONLY,
  ),
  // MCP-242: re-export wiring for the extracted product-analytics fakes.
  'apps/oak-curriculum-mcp-streamable-http/src/test-helpers/fakes.ts': excluded(
    'e38bb464d9b9976d74c795225be2b472b7cfdf47596b4c8c1b1b5084563ff3e3',
    TEST_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/test-helpers/registration-walk.ts': excluded(
    '40cc3397b753b39cf3e6c81bf6154d2f7c3af29e4057e4f8f21dad7a206464e6',
    TEST_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/test-helpers/static-root-fixture.ts': excluded(
    '6350420bb5d4e36cbca9264a0a7b704ebb3dd6ce57027e6073bc60f007447a8d',
    TEST_ONLY,
  ),
};
