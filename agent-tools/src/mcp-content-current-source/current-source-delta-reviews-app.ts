import {
  excluded,
  IMPLEMENTATION_ONLY,
  reviewed,
  TEST_ONLY,
  type CurrentSourceDeltaReview,
  VALIDATION_ONLY,
} from './current-source-delta-review-helpers.js';

export const APP_DELTA_REVIEWS: Readonly<Record<string, CurrentSourceDeltaReview>> = {
  'apps/oak-curriculum-mcp-streamable-http/src/app/core-endpoints.ts': reviewed(
    'd75b779e3b6bf2553ddb9cf7e8121d0591c21b56c4f2148110b507f5c423954d',
    ['C323', 'C324'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/application.ts': excluded(
    '7981d787848abce458859bfd93210b0710f8c312d1e45ecb33a77038bbfa0e0a',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/auth/public-resources.ts': reviewed(
    '5d0cb6266065faa21923f9c757c41c18a2aaba1259a91caa95c76176be85a280',
    ['C413'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/env.ts': excluded(
    'd0f50068f88735433b31c390c3efcde703d5a79abec3af0aee729c01fc081c3f',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/feature-flags.ts': excluded(
    '0078dfaf0635235210ac1be277692f97d6b87a1e6e7c49ac7f6169c87bbb17aa',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/handlers.ts': excluded(
    '611e15b474f72e2d7a2782ca329a7afd1fa4615f5d725de54807038d0275df22',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/landing-page/render-landing-page.ts': reviewed(
    '0f628eb82fef727eb33e31742699053175581e68bc1161a0ae94956b63068108',
    [
      'C342',
      'C343',
      'C344',
      'C345',
      'C346',
      'C347',
      'C348',
      'C349',
      'C350',
      'C351',
      'C352',
      'C353',
    ],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/landing-page/render-resources-section.ts': reviewed(
    '5bbcaa809de11c10d7808e92e95b5abb3428de97c48678a8a2512fa430f31a4c',
    ['C357', 'C360', 'C361', 'C370'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/landing-page/render-tools-section.ts': reviewed(
    '33a0983d382163d74c8027afd23c26f43e92101f0dbfd3f06e37c4aa4492c432',
    ['C357', 'C362', 'C363', 'C364', 'C365', 'C366', 'C367', 'C368', 'C369', 'C370'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/mcp-middleware.ts': excluded(
    '7499e649d7c2e4cc5f7f8d27fe63c39b485921a1b17a1b27692b09f4652a2f04',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/register-resource-helpers.ts': excluded(
    '6656626f8c88298c26ed09d8c9e56474fe12c369c6f521dcd2667a255e94a135',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/register-resources.ts': reviewed(
    'c9a21ef405f7f91b9c9b870e748a278ed7cf3fd5054760a94b7de1f3b78b2856',
    ['C336', 'C337', 'C338', 'C339', 'C340'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/registration-proof/current-source-guidance-registration-evidence.ts':
    excluded('49f654ce6379cab1f07621104b33c8407d7f3380c1c71a4dd31bd44423020469', VALIDATION_ONLY),
  'apps/oak-curriculum-mcp-streamable-http/src/registration-proof/current-source-registration-proof.ts':
    excluded('69262ce768bb2f430c74643d230ec0172c57abee0ea13f15822558c9695306c5', VALIDATION_ONLY),
  'apps/oak-curriculum-mcp-streamable-http/src/registration-proof/guidance-list-parity.ts':
    excluded('ebb75cfdf95db96e295c62b54fc8f63e349d0749e447dbefffedcb2355dc43df', VALIDATION_ONLY),
  'apps/oak-curriculum-mcp-streamable-http/src/registration-proof/guidance-read-parity.ts':
    excluded('6a8d90126daa6a0e6e786c4d71b9b79d1db8241d7db5dfec8425c8bad3fe8f67', VALIDATION_ONLY),
  'apps/oak-curriculum-mcp-streamable-http/src/registration-proof/require-mcp-error-code.ts':
    excluded('50edf574104e4412b9a573b347995eb6943e7ea5365f1762b26300b83c8da79f', VALIDATION_ONLY),
  'apps/oak-curriculum-mcp-streamable-http/src/runtime-config-from-validated-env.ts': excluded(
    'cf7ca321b00465c21adcf97368178ff9f4fdfbd30f09b52406a5fa03a9146624',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/runtime-config-support.ts': excluded(
    '4b9051b733ea0e6cef7e072352c597117d24b330c3df3697978332bf0c6af4f3',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/served-surface/filter-guidance-content.ts': excluded(
    '9a97e4382a301bc9b2b6ea0461f8ba0dffd087d7d026e4634855e3d5682e7a12',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/served-surface/served-surface.ts': reviewed(
    'e0f2380c71c99f3e0e0887fbe99a3380a7b4783086fda9d3c16eedfe136f0a0b',
    ['A001'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/app/static-asset-paths.ts': excluded(
    '75ec72e78389124bcb0f7e881e0ae45f8ce0e0df1b4e5f1ef035e9a77e842c03',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/app/static-content.ts': excluded(
    '78647cffca4cbde93e40deee62b9a5b29d701660c65ad41fe04093effdf845e8',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/test-helpers/auth-error-test-helpers.ts': excluded(
    '1f09358427ac9ca4f2f0027636515abcfd123c64ae6bf468574c8d767fcccd6c',
    TEST_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/test-helpers/registration-walk.ts': excluded(
    '8be967b282c26c71ec071108bf81fdea505dec8e2a90467e043274bde55d692d',
    TEST_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/test-helpers/static-root-fixture.ts': excluded(
    '6350420bb5d4e36cbca9264a0a7b704ebb3dd6ce57027e6073bc60f007447a8d',
    TEST_ONLY,
  ),
};
