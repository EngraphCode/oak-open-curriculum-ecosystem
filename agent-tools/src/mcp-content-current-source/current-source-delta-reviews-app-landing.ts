/**
 * Reviewed post-baseline semantic deltas — Landing-page and widget governed sources (the MCP-128 React rebuild era).
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
} from './current-source-delta-review-helpers.js';

export const APP_LANDING_DELTA_REVIEWS: Readonly<Record<string, CurrentSourceDeltaReview>> = {
  'apps/oak-curriculum-mcp-streamable-http/src/landing-page/components/design-system-refs.ts':
    excluded(
      'db743e3bd9e6062ec741e3756133c91034bde439e85b3dc8369e92efe60308c3',
      IMPLEMENTATION_ONLY,
    ),
  'apps/oak-curriculum-mcp-streamable-http/src/landing-page/components/landing-page-document.tsx':
    reviewed('7b911a1ae13a5a064e6d2c47dd50604240b4701a60993dd211dad68b0a392f8e', ['C341', 'C353']),
  'apps/oak-curriculum-mcp-streamable-http/src/landing-page/components/page-sections.tsx': reviewed(
    'c797cf038730f25cdc0410d0cba0bd4cd94072832a4cf612214b4d09db669be8',
    ['C343', 'C344', 'C345', 'C346', 'C347', 'C348', 'C349', 'C350', 'C351', 'C352'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/landing-page/components/resources-section.tsx':
    reviewed('eeb707b5df366897049e0599b65abb41cdacec4e102a4a6b37687fa7094088c5', [
      'C357',
      'C360',
      'C361',
    ]),
  'apps/oak-curriculum-mcp-streamable-http/src/landing-page/components/site-chrome.tsx': excluded(
    '112bc8e8fa31768b6a90496e4ff5e60d51e6b85758700d9f9c843cafb342a735',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/landing-page/components/tools-section.tsx': reviewed(
    'df1dc60bea02eb3c0ff243c7a3dcee632610adaf2c241e2f9531a2e33fb49d7a',
    ['C357', 'C362', 'C363', 'C364', 'C365', 'C366', 'C367', 'C368'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/landing-page/create-snippet.ts': reviewed(
    '24c94ac7e14c6f998b84db525cf1f0a656ebb8a0269d25fc002722741b0a3359',
    ['C354'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/landing-page/derive-view-props.ts': reviewed(
    '97b50f25358e22f8bb2b90dcfcca3d9ed4eddeb4cd34c7d6c6c7f161980407ab',
    ['C369'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/landing-page/index.ts': excluded(
    '5440a4e6a5395f51973cd475d8fcaf65d75fcb8d2eff0590aa36d4f179192fe4',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/landing-page/render-landing-page.tsx': excluded(
    'c8ae88ca78a96601ac77e78b4b969141026496b3bc57ad64c6ead3151ba11207',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/landing-page/resolve-canonical-url.ts': reviewed(
    '23fb2c3120a6fcf39bb0e334a9f5f6af90db9682f9f94a24bdce952e3455dfbf',
    ['C355'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/landing-page/view-props.ts': excluded(
    '937dcd100db80d18463b6f3b8bf2aa6f6c78bc7693d5ef4fd7778bfa2c466fef',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/widget/src/App.tsx': reviewed(
    '798dc0c115d201f46266ca448be7df7c665d397ae14f136d72f84ccdcead28b9',
    ['C384', 'C385', 'C386', 'C387', 'C717'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/widget/src/BrandBanner.tsx': reviewed(
    '57d012a77be646b3d61186f7cbbee9d7b77f3c070acb502f911915e5db0c087d',
    ['C390', 'C391', 'C392', 'C393'],
  ),
};
