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
    '1faaaf1621ed2b634bcb369d1142f3f8108d0bf326a8f6bc5d91964ac0afabcf',
    ['C323', 'C324'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/application.ts': excluded(
    '234036ead555fe082aba797e3977f4739ed48a4e120e5ab7b8ae93608f0d400c',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/auth/public-resources.ts': reviewed(
    '61ec42be45a3e7fa5d72747702b78fe035a1fc1c0e042498cbc1679a9a3ca0b0',
    ['C413'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/env.ts': excluded(
    'b9e3801157f8cc13763ff5b145a853088ee9b22a2379d92c0d793641a78eb74f',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/feature-flags.ts': excluded(
    'c227635693b7d2fa14dd1884a1823ff2192c6e28a475a4154e281235359727df',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/handlers.ts': excluded(
    'ce2b82958f8c60ce3374e347b67334c609ec92c8909478e80075d3554d576f9a',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/landing-page/render-landing-page.ts': reviewed(
    '623b9d9d5a77e82fdc0730a6f821b546aeb5d2adc9067a1a1c94e2e12aee3713',
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
    '06d880ad1ea2c9eb3bdeaa2c171aaded3723ff44190693a3ec2765caec46d555',
    ['C357', 'C360', 'C361', 'C370'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/landing-page/render-tools-section.ts': reviewed(
    '8ad1b35cd7320352fe1366616f67ccefd0bebcac66fbb161bef505d3f9f18fa3',
    ['C357', 'C362', 'C363', 'C364', 'C365', 'C366', 'C367', 'C368', 'C369', 'C370'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/mcp-middleware.ts': excluded(
    '1e2ddb0c1fe7fa72927a66f4e4434e495958d6b6dee7c92019e7c72241450273',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/register-resource-helpers.ts': excluded(
    '50d5f94696309a4554a5db93283ca3b47a4ce24b4c2d57a2cc52ebf8774284d2',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/register-resources.ts': reviewed(
    'c3f04808233dd698f70541a56de0151d162dcb7ab125b63b29b0fb3e5171fd93',
    ['C336', 'C337', 'C338', 'C339', 'C340'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/registration-proof/current-source-guidance-map.ts':
    excluded('d98eb98fa16fd1e93cdaf9d210d4986b462d58bd5ee30e6e9643c4d3da0f5198', VALIDATION_ONLY),
  'apps/oak-curriculum-mcp-streamable-http/src/registration-proof/current-source-guidance-registration-evidence.ts':
    excluded('3b9a6b6247d95c2039735b6cd55c8802a45f6a181a41f8969c6834fee778efc3', VALIDATION_ONLY),
  'apps/oak-curriculum-mcp-streamable-http/src/registration-proof/current-source-registration-proof.ts':
    excluded('d2294caf5a8a07a1428d9f0cae68bd501e134ce330a4254b43949c7baf4ed7fb', VALIDATION_ONLY),
  'apps/oak-curriculum-mcp-streamable-http/src/registration-proof/guidance-list-parity.ts':
    excluded('9ccb4969241d55ba0141fc9fe88dc51785cbd93a057f5dbc685b52335781b9f8', VALIDATION_ONLY),
  'apps/oak-curriculum-mcp-streamable-http/src/registration-proof/guidance-read-parity.ts':
    excluded('3c9d6af55dbe0d2566d2c3d32018ffc3cd0f5650a47cee0cd466b2a095e73c1d', VALIDATION_ONLY),
  'apps/oak-curriculum-mcp-streamable-http/src/registration-proof/require-mcp-error-code.ts':
    excluded('3b87a95df483b0e53a554804ff4ef341e7f1b99f97055dc460f02e7e6a0cb101', VALIDATION_ONLY),
  'apps/oak-curriculum-mcp-streamable-http/src/runtime-config-from-validated-env.ts': excluded(
    '4ba87d77215346608d31d9e85aac19032f85d5648174618281f2ffe606b62707',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/runtime-config-support.ts': excluded(
    'b2b4554218a0a03a4710b4cdef839f7dcf5442666aa2930087dddb5eeee705ac',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/served-surface/filter-guidance-content.ts': excluded(
    '74c0d523614af5af34b9e4fdf3bba176cb9569a3e4a6b7cad48652dce591cbd9',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/served-surface/served-surface.ts': reviewed(
    '89f7dc395d5e71694f9f123f6330e4f4aa0f4872c30c1dad32e96e45879fac25',
    ['A001'],
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/app/static-asset-paths.ts': excluded(
    'd42c567fadff20a447f45c556660793fae1422e165518937e061182557ee49d4',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/app/static-content.ts': excluded(
    'de2eb5677fb4743a57885b6c6754d52a9180d2e6c2ae9d1db830d3709b5ac8f3',
    IMPLEMENTATION_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/test-helpers/auth-error-test-helpers.ts': excluded(
    'fa6d81f0fa564e508c926428a65fec671b3d50c1cf9de349793127470148e9dc',
    TEST_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/test-helpers/registration-walk.ts': excluded(
    '2751fa4d161977c06780be18143d073c452d34f2580b5f84dfb1d51c6760cfef',
    TEST_ONLY,
  ),
  'apps/oak-curriculum-mcp-streamable-http/src/test-helpers/static-root-fixture.ts': excluded(
    '4159a349a8de63073b16011c1ffbf28807e6b539b9da24c3375b6f013d5d757a',
    TEST_ONLY,
  ),
};
