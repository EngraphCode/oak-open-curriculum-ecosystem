/**
 * Reviewed post-baseline semantic deltas — App-served governed sources (bootstrap, auth, tool, and proof surfaces).
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
    '978ce22917b4dc054f7263be8cca527399a08ab9202243c10f695edbdd1657fb',
    ['C323', 'C324'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/app/create-app-options.ts': excluded(
    '24a8d136111eca039f8cd3e47e5d4e9061a3e55ba0c917efe1975e7a2fecaf7d',
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
    '255eec09af82f1a2fc38dc79d8e29383dea9f4dbf4b1fdea1f401bdfc022e11e',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/auth-routes.ts': reviewed(
    'd66cab19995a2a427d60af54b7959ef1621ea8ca23da195d017e2dddc217eec3',
    ['C705', 'C706', 'C707', 'C708'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/auth/mcp-auth/get-mcp-resource-url.ts': excluded(
    '9a3c49786601405a30a0791d12e6b55f6c472c8a7646fa2ce0cbddf142410b3f',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/auth/mcp-auth/get-prm-url.ts': excluded(
    'b1f16b2ef7993d70924ef5a6da0fe4bb0bf27e5bfed796022bfa0c610fc13f41',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/auth/mcp-auth/mcp-auth-clerk.ts': excluded(
    '86cc00d1dea41e43cf51bba107b0505e4728e7498f28d7bdadf91dff44a42a72',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/auth/mcp-auth/mcp-auth.ts': reviewed(
    '359d2f7517dff42d7ba32b2c0a2577e727c2529ec79f41ed29b5dd590a15d77a',
    ['C395', 'C396', 'C397', 'C398', 'C399', 'C400'],
  ),
  // MCP-353: the under-the-hood allowlist row (C413) retired with the deleted
  // resource; the file now composes SDK-owned URI sets only.
  'apps/oak-curriculum-mcp-streamable-http/src/auth/public-resources.ts': excluded(
    '75bbea61c4b91c53a1ec93133852f9841844f94eb448973f9bbecfd855239227',
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
  'apps/oak-curriculum-mcp-streamable-http/src/generated/widget-html-content.ts': reviewed(
    '7c7ce8dff941cc26621bafaef3846c6aab52769785032db708aac151b306b7a3',
    ['C394'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/handlers.ts': excluded(
    'e9fdec5d9c5ddddcba5fd7d30f848ce3adb347012b0829c4f7a6c9754ba852ea',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/host-validation-error.ts': reviewed(
    '0e9ada42470d98bc29f33ed6d8db74a34d6db6dcf6c37008c1bf4c916463a313',
    ['C702', 'C703', 'C704'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/index.ts': excluded(
    '975a695b97e183b658c3cc4c031a0cf07cf43ad484a79c6a6e0d1689f82ac646',
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
  'apps/oak-curriculum-mcp-streamable-http/src/served-surface/filter-guidance-content.ts': excluded(
    '9a97e4382a301bc9b2b6ea0461f8ba0dffd087d7d026e4634855e3d5682e7a12',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/served-surface/served-surface.ts': reviewed(
    '15c76f4100bec4a96aa51d7b082262b02043666b8fb74a3cf2d1b6250ad09efb',
    ['A001'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/server.ts': excluded(
    'f06ab4d0a5e270a5220ce39f003ae2d59c11ee1fdd9b287035270fbd0f67d252',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/test-helpers/auth-error-test-helpers.ts': excluded(
    '1f09358427ac9ca4f2f0027636515abcfd123c64ae6bf468574c8d767fcccd6c',
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
  'apps/oak-curriculum-mcp-streamable-http/src/test-helpers/fakes-mcp-server.ts': excluded(
    '587ea4f25b03c4355e71548abc06ddb5b542e83d3bb3078cba215d7d1c5f0a0c',
    TEST_ONLY,
  ),
};
