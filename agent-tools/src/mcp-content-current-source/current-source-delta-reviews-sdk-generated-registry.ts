/**
 * Reviewed post-baseline semantic deltas — the generated registry layer: the
 * tool catalogue (definitions) and executor (runtime/execute), plus tool
 * files removed from the catalogue. Each hash pins the exact reviewed state;
 * item ids cite the audit rows the file carries.
 */
import {
  DELETED_SOURCE,
  excluded,
  IMPLEMENTATION_ONLY,
  reviewed,
  type CurrentSourceDeltaReview,
} from './current-source-delta-review-helpers.js';

export const SDK_GENERATED_REGISTRY_DELTA_REVIEWS: Readonly<
  Record<string, CurrentSourceDeltaReview>
> = {
  // MCP-653: upstream removed /changelog and /changelog/latest (404 on the
  // live API), and the two dead tools were disabled via DEFERRED_PATHS
  // ahead of the MCP-630 schema-cache refresh. The tool files regenerated
  // away (rows C491-C498 retired via lineage); the catalogue and executor
  // shrank to 27 entries.
  'packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-changelog.ts':
    excluded('c93921c255d001f89b661af93c692cc54563db108e0ab07f356128282d313cd6', DELETED_SOURCE),
  'packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-changelog-latest.ts':
    excluded('badcff725f64ce53610f60241f68c52a82cab44dcec309ec3ff78f2ef28de8d0', DELETED_SOURCE),
  'packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/definitions.ts': reviewed(
    '78e630df5fca0a39861bd3b290cd8ead01cadc85887952b4999acc8931ae957b',
    ['C677', 'C678', 'C679', 'C680'],
  ),
  'packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/runtime/execute.ts':
    excluded(
      'bfd537c9ab9012b7847638826074173b1dff63f04bb2dd71df42b1cfc8ed4315',
      IMPLEMENTATION_ONLY,
    ),
};
