/**
 * Reviewed post-baseline semantic deltas — App-served governed sources
 * (bootstrap, tool, and proof surfaces; the auth family lives in
 * current-source-delta-reviews-app-auth.ts).
 *
 * Every entry is a compliance review act: the semantic hash pins the exact
 * reviewed state; item ids cite the audit rows the file carries, or one
 * explicit exclusion reason says why the change adds no governed content.
 */
import {
  DELETED_SOURCE,
  excluded,
  IMPLEMENTATION_ONLY,
  reviewed,
  TEST_ONLY,
  type CurrentSourceDeltaReview,
} from './current-source-delta-review-helpers.js';

export const APP_DELTA_REVIEWS: Readonly<Record<string, CurrentSourceDeltaReview>> = {
  'apps/oak-curriculum-mcp-streamable-http/src/app/app-version-header.ts': excluded(
    '9871f2ded345a8785aabf2d70baa2368690e398c3edfae900eca5073ea2c6891',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/app/bootstrap-finalize.ts': excluded(
    '7011f33a6e30c2eb67bd9342259e310462bc126e37b41158c37e872f09238838',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/app/bootstrap-security.ts': excluded(
    'dc2928ae4481038f30a4d19abc3c81747cf73f37b1711b284acdc568e59f8d02',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/app/core-endpoints.ts': reviewed(
    '0c263bbcb4c3a6e920fce3ab280d89958c4c849ce5fc9c2846209583d690b1df',
    ['C323', 'C324'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/app/create-app-options.ts': excluded(
    'c6f46c27110ad8591bc9cf4546db0f39d9756690dc251c3898333d10d04d81b7',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/app/landing-page-artefact.ts': excluded(
    'e62f6c8466af6c86bf6eba00b7d1c3085d0032d0f4ce4c0a821e6fe76d33f08e',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/app/landing-page-baked.ts': excluded(
    '2a1b210c2232d07408a1a1730c315b0c33ce77346beff3210ee56d2ed2098fc5',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/app/oauth-and-caching-setup.ts': excluded(
    'cfadc964d6f74706565393acb0962b6b733ca6e5b97fd0b6dff5866ed4eb60a8',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/app/orchestration.ts': excluded(
    'b001a6245d49fdf70ca41ff77e26a7f97305e85d2270bf6574f7ea8f02a78133',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/app/static-asset-paths.ts': excluded(
    '75ec72e78389124bcb0f7e881e0ae45f8ce0e0df1b4e5f1ef035e9a77e842c03',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/app/static-content.ts': excluded(
    '17ed6c9d1d12ef8bbd0b953c3a0b52213867066699100632b548962b1c055299',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/application.ts': excluded(
    '240376b016d16c344d25a7a1f6bb181234cef9d0a80cf481202d6d570bf07e7e',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/canonical-origin.ts': excluded(
    '01d279a964b9f05d18c8a7b56724aafe1e17f71c2eb98897d15fa7fd5199cabe',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/compose-product-analytics-runtime.ts': excluded(
    'df0cfab0201177986caa0454d94407077f5930f45a8e34d6d15f6ea4b625b35b',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/env-product-analytics.ts': excluded(
    '5db6bd709ae01cd9ed1e9a51fe063d01f41669e3d0e9fb0e3fc924f9a5676d39',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/env.ts': excluded(
    'e60da305584aefe3084546c39cd659024329a099645b3eceb1139e31fd1364ad',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/feature-flags.ts': excluded(
    '0078dfaf0635235210ac1be277692f97d6b87a1e6e7c49ac7f6169c87bbb17aa',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/generated/oak-under-the-hood-content.ts': reviewed(
    '775eeb6826d2538daa5c92905be153b0a7d46de53a9b60258f1d1a52e8852254',
    ['A010'],
  ),
  // MCP-368: regenerated via build:widget after the wordmark swap — the
  // embed now carries the wide-wordmark geometry and the merged
  // visually-hidden accessible name (+20.2KB, matching the review's
  // predicted +19KB).
  'apps/oak-curriculum-mcp-streamable-http/src/generated/widget-html-content.ts': reviewed(
    'c47281d52e75d324b44e98f00df18506a9d841874877301a54825414e45f5437',
    ['C394'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/handlers.ts': excluded(
    '54ef89d4c749af313238024e7fe64012c509202d09ecd8bc4d326b47fb116dbf',
    IMPLEMENTATION_ONLY,
  ),
  // MCP-392: wildcard host matching no longer builds a RegExp from
  // allow-list entries (structural CodeQL cure) — pure engineering, no
  // agent-facing content in this file.
  'apps/oak-curriculum-mcp-streamable-http/src/host-header-validation.ts': excluded(
    '22a5ce24820a998f391c89ded676191d64e4761275766cac748747a222662bf1',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/host-validation-error.ts': reviewed(
    '3873184adb7f9ef5dbb9344487a412a8fa7e891a0ddcc6aa9b2b7513a583134b',
    ['C702', 'C703', 'C704'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/index.ts': excluded(
    '32c881e576b2bf44237639c5a49f6877720f1586bbd112eae8965df53701bbbc',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/logging/index.ts': excluded(
    '2cfad19d9ebd98c1c417b7641c651ae271e399a3448d1b26fbc7da1bd11e6d2f',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/mcp-middleware.ts': excluded(
    '7499e649d7c2e4cc5f7f8d27fe63c39b485921a1b17a1b27692b09f4652a2f04',
    IMPLEMENTATION_ONLY,
  ),
  // MCP-353 (§2.F cure): the fetch trigger, canonical URL, and resource_link
  // rows (C375, C377, C380–C383) retired via lineage; the baked orientation
  // body is A010 in src/generated/oak-under-the-hood-content.ts.
  'apps/oak-curriculum-mcp-streamable-http/src/oak-under-the-hood/oak-under-the-hood-tool.ts':
    reviewed('2c28587c89c4b3c691c9f39a3b8e3e28946f470b74b235325d8c1fd7085f7a1f', [
      'C371',
      'C372',
      'C373',
      'C374',
      'C376',
      'C378',
      'C379',
    ]),
  'apps/oak-curriculum-mcp-streamable-http/src/oauth-proxy/oauth-proxy-handlers.ts': reviewed(
    'ab2dd71908871e8552d0b53a92f275541bdb73fc06e95081f0f2f8b44e49aee4',
    ['C401'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/oauth-proxy/oauth-proxy-redirect-uri-validation.ts':
    excluded(
      'e558e4cecc9d7e8cb6dbb20b2cc4734efc09a2a0e5f074cbb7bc7db235b0663a',
      IMPLEMENTATION_ONLY,
    ),
  // MCP-243: process-level close funnel for analytics + observability —
  // pure lifecycle plumbing, serves no agent-facing content.
  'apps/oak-curriculum-mcp-streamable-http/src/process-close-owner.ts': excluded(
    'dca53600544a92785e66fd3a48fb0f59e4bcc5d2ffce20aff4dfd853a9218d66',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/product-analytics-config.ts': excluded(
    '19d598ca413c7eeb9e509ddc38d44e006b761f8654c0a7e641b68b232d7c8610',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/runtime-config-from-validated-env.ts': excluded(
    '1b0a02d27b6f29e88a0cc9c4aa5576ee72bbf0770f44a56ccab423668acb1043',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/runtime-config-support.ts': excluded(
    '4b9051b733ea0e6cef7e072352c597117d24b330c3df3697978332bf0c6af4f3',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/runtime-config.ts': excluded(
    'd0efa55d83f113991bacb5f629c918067ae1907665b4df12670ccae605c603da',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/security-config.ts': excluded(
    'df1573e40a58a0957ffce6c145f29b19951e28c7bf90a6772ddb736033e03b50',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/security-headers.ts': excluded(
    '34c260d44df8b6314b7b3958c627a3491264d916ca41aff0aafef07f2e8ab24d',
    IMPLEMENTATION_ONLY,
  ),
  // MCP-351: the landing page's canonical-URL resolution promoted here as the
  // one per-deployment self-description derivation; C355's endpoint URL
  // strings relocated with it.
  'apps/oak-curriculum-mcp-streamable-http/src/served-origin.ts': reviewed(
    '0cc2add70d350afd3957791b29b4663bc4cc56813e6e6865c4d4900977cb4b70',
    ['C355'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/served-surface/filter-guidance-content.ts': excluded(
    '9a97e4382a301bc9b2b6ea0461f8ba0dffd087d7d026e4634855e3d5682e7a12',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/served-surface/served-surface.ts': reviewed(
    '15c76f4100bec4a96aa51d7b082262b02043666b8fb74a3cf2d1b6250ad09efb',
    ['A001'],
  ),
  // MCP-243: HTTP server bootstrap wiring the close funnel into every exit
  // path — pure lifecycle plumbing, serves no agent-facing content.
  'apps/oak-curriculum-mcp-streamable-http/src/server-runtime.ts': excluded(
    'b408cd0cd9df7ff44374befbb87a7ed14a505fd36bf7b80dc706151cd495b28f',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/server.ts': excluded(
    'f06ab4d0a5e270a5220ce39f003ae2d59c11ee1fdd9b287035270fbd0f67d252',
    IMPLEMENTATION_ONLY,
  ),
  // MCP-403 review round: check-then-patch guard on the fetch sentinel so a
  // second in-process execution cannot capture the blocking fetch as original.
  'apps/oak-curriculum-mcp-streamable-http/src/test.setup.ts': excluded(
    'b01e9673dddd262878ca8a768bce108bb697af23ad4a9d6957a9ed1ddaa0c1f2',
    TEST_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/prompt-schemas.ts': excluded(
    'b72ba8cceb54d32bf4346f202d1c13193bd9c4006a3426a555869ad7f112f7ca',
    DELETED_SOURCE,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/register-prompts.ts': excluded(
    '3260d7418fadfadd67e209a927f0a87d30645dfcbd94beb1f75833cf1f8d2842',
    DELETED_SOURCE,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/mcp-handler.ts': excluded(
    '7f58aa789c930b5e95a9cc1cc18330be5b6f9ebf99c6464e7a6af2865766d7f7',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/mcp-request-context.ts': excluded(
    'c9a8034e012985e0178537f7381243f5b461a97c444b0fe02f1df28efdd5d1f8',
    IMPLEMENTATION_ONLY,
  ),
};
