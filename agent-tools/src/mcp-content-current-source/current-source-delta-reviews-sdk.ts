import {
  excluded,
  IMPLEMENTATION_ONLY,
  reviewed,
  type CurrentSourceDeltaReview,
  TYPE_ONLY,
  UPSTREAM_BULK_ONLY,
} from './current-source-delta-review-helpers.js';

export const SDK_DELTA_REVIEWS: Readonly<Record<string, CurrentSourceDeltaReview>> = {
  'packages/sdks/oak-curriculum-sdk/src/mcp/all-resources.ts': excluded(
    'b33adeff668f1bcb72b3d8098e03240db460f02e2ae3d5aced76041335d7f10f',
    IMPLEMENTATION_ONLY,
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/guidance-resources/adapt-lesson.ts': reviewed(
    'c23235066b550162a954fe38c402e630b9bc908854623a23daff99e02b04e694',
    ['A007', 'C183', 'C187', 'C188', 'C202', 'C205', 'C206', 'C207', 'C208', 'C209', 'C334'],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/guidance-resources/agent-guidance-resources.ts':
    reviewed('b72948f5ade5d279b502b43ae5970439985c3d69fcfdab763f865c4bb6156f3a', ['A009']),
  'packages/sdks/oak-curriculum-sdk/src/mcp/guidance-resources/continue-progression.ts': reviewed(
    'd49dc9764828029247ba20261bce0c5c3f39b6e552ebe632458fe0fd3f979e16',
    [
      'A008',
      'C184',
      'C188',
      'C192',
      'C195',
      'C196',
      'C203',
      'C204',
      'C205',
      'C206',
      'C208',
      'C335',
    ],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/guidance-resources/curriculum-mapping.ts': reviewed(
    '002ece2ea42677b6b6105f29f68aefdabeea3f8c0a74cc2e1fccfc2524c6588f',
    [
      'A006',
      'C182',
      'C192',
      'C193',
      'C194',
      'C201',
      'C205',
      'C206',
      'C207',
      'C208',
      'C209',
      'C333',
    ],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/guidance-resources/explore-curriculum.ts': reviewed(
    'b41a89cbd25a0a37ea9dd4eff106e940cc6d6c2cb9a8ec737fcbccaa8c29ca35',
    ['A004', 'C180', 'C189', 'C190', 'C199', 'C205', 'C331'],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/guidance-resources/find-lessons.ts': reviewed(
    'ebf6b9948792b632393cf950cab97fddd582652fcfa4f95c7ba905d0ec6d6717',
    ['A003', 'C178', 'C185', 'C186', 'C197', 'C205', 'C329'],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/guidance-resources/guidance-resource-types.ts':
    excluded('76cf0bd8b14bad736906a9874e1f3211993d5759d658d0eb6bf144e026cd1723', TYPE_ONLY),
  'packages/sdks/oak-curriculum-sdk/src/mcp/guidance-resources/learning-progression.ts': reviewed(
    'fbd5b1c00d1880414394e10c769bd4cfdd8377dea4bf71f16bc0093d81def371',
    ['A005', 'C181', 'C191', 'C192', 'C200', 'C205', 'C332'],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/mcp-resource-types.ts': excluded(
    '0e31c4103c0b45fb5d4f59ff7522684e77adf56978336d8ba7cda817f0580c20',
    TYPE_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/apply-deferred-paths.ts': excluded(
    '7d95eb732a06a198166ebf3733a387e66e6c177c1974d4f3d3f194ec3b546ee0',
    IMPLEMENTATION_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/codegen.ts': excluded(
    '1dadef4f96511ba3a7c8ed3defb8db835173e856dc034a816efe74c6617a81e9',
    IMPLEMENTATION_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/excluded-paths.ts': reviewed(
    '54696cd55ab5ebc2c2015fc30ab3b022f00e97c8a642a101060d0156b34f9aec',
    ['A002', 'C470'],
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/resolve-schema-source.ts': excluded(
    'da1edf8b6b885c8894207e04480ed1f77d54fcfb029cfe2921cd1f781a67d26a',
    IMPLEMENTATION_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/schema-separation-core.ts': excluded(
    '096ce2c5a613a5fa33212ecc6ca1eeba4a575f7d960da32fc3acd1ffd20a4ac9',
    IMPLEMENTATION_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/bulk/schema-templates-part2.ts': excluded(
    '81b743427311cec21ad4a97dff8559e11ee9bfa9df73f3f668d38c7f8f997229',
    UPSTREAM_BULK_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/bulk/schema-templates-part3.ts': excluded(
    '21cd5d519ee7e3885674fbdb1e74082abad84b75112eb942bb14722d7405b2bf',
    UPSTREAM_BULK_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/bulk/schema-templates.ts': excluded(
    'd7cefcfc67a83313bc6a88cffdd09ca510e8d34415f8ab3b3afd5e354cd5ac9b',
    UPSTREAM_BULK_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/cross-domain-constants.ts': reviewed(
    'fd2db884860762272d0c2824c930d09082e46db88f918e2d47a0035483afcb7b',
    ['C479', 'C480'],
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/generate-widget-constants.ts': excluded(
    '2655cff78ca4a1cfb2dd0452f194f6cb33579f2372a0eb1e7ed09e1065e630d5',
    IMPLEMENTATION_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/mcp-tools/mcp-tool-generator.ts': reviewed(
    '7d41ed34891f4c2458eaa927020f622561e9ffeb7941950ce102f0220edeaad7',
    ['C471'],
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/widget-uri-suffix.ts': excluded(
    '8c8c63616d88ddc3a467810c92fb899b241b539e958110d09a1013cdc332238a',
    IMPLEMENTATION_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-key-stages-subject-lessons.ts':
    reviewed('8a0df21041651b201af1e67bc58cc624608b90df4e60803e466f5e7b204b838b', [
      'C511',
      'C512',
      'C513',
      'C514',
      'C515',
      'C516',
      'C517',
      'C518',
      'C519',
      'C520',
    ]),
  'packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-key-stages-subject-questions.ts':
    reviewed('22050191b8b10522620371915786f88e7280beccf736ec1987393cd7cf0fe6bb', [
      'C521',
      'C522',
      'C523',
      'C524',
      'C525',
      'C526',
      'C527',
      'C528',
      'C529',
      'C530',
    ]),
  'packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-programmes-assets.ts':
    reviewed('bd715ef71347add4e9dbe07e2bce44b056c4dfa917ede20459e7dc276f957f4d', [
      'C577',
      'C578',
      'C579',
      'C580',
      'C581',
      'C582',
      'C583',
      'C584',
      'C585',
      'C586',
      'C587',
    ]),
  'packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-programmes-questions.ts':
    reviewed('f80a0834cbe6debe28b84eec991c59cd3716751f0fd1d8758ddf4550da5d9b0c', [
      'C588',
      'C589',
      'C590',
      'C591',
      'C592',
      'C593',
      'C594',
      'C595',
      'C596',
    ]),
  'packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-sequences-questions.ts':
    reviewed('ce006564fad8b5531234881eb76414a43ff3ebcc87d5913d0f00a617efdeef04', [
      'C619',
      'C620',
      'C621',
      'C622',
      'C623',
      'C624',
      'C625',
      'C626',
      'C627',
    ]),
};
