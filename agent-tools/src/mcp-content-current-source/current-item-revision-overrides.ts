/**
 * Explicit content-revision verdicts for items whose anchors are overridden
 * in place; relocated items derive their revision from lineage instead.
 */
import { CURRENT_AGGREGATED_ITEM_REVISION_OVERRIDES } from './current-aggregated-item-anchor-overrides.js';
import { CURRENT_GENERATED_DESCRIPTION_REVISION_OVERRIDES } from './current-generated-description-anchor-overrides.js';
import { CURRENT_GENERATED_ITEM_REVISION_OVERRIDES } from './current-generated-item-anchor-overrides.js';

export const CURRENT_ITEM_REVISION_OVERRIDES = {
  ...CURRENT_GENERATED_ITEM_REVISION_OVERRIDES,
  ...CURRENT_GENERATED_DESCRIPTION_REVISION_OVERRIDES,
  ...CURRENT_AGGREGATED_ITEM_REVISION_OVERRIDES,
  C354: 'modified',
  C355: 'modified',
  C313: 'unchanged',
  // MCP-241: name/title promoted to a shared const — identical strings,
  // new source form.
  C337: 'unchanged',
  C690: 'unchanged',
  C413: 'expanded',
  C479: 'modified',
} as const;
