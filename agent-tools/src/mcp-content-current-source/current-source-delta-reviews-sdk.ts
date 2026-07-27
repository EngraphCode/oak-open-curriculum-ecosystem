import {
  excluded,
  IMPLEMENTATION_ONLY,
  reviewed,
  type CurrentSourceDeltaReview,
  TYPE_ONLY,
} from './current-source-delta-review-helpers.js';

export const SDK_DELTA_REVIEWS: Readonly<Record<string, CurrentSourceDeltaReview>> = {
  'packages/sdks/oak-curriculum-sdk/src/mcp/all-resources.ts': excluded(
    'c24c4a2bedd54ca65ec471bffddadd3fb7676d35677fa38b9f965eee61d22bc8',
    IMPLEMENTATION_ONLY,
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/guidance-resources/adapt-lesson.ts': reviewed(
    'c5cf6a1e265b5bcf1fa216a94ec0fd6fc3fe7a52cda17e8374483cc1722c76ff',
    ['A007', 'C183', 'C187', 'C188', 'C202', 'C205', 'C206', 'C207', 'C208', 'C209', 'C334'],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/guidance-resources/agent-guidance-resources.ts':
    reviewed('b62c12e02477dd091f567f5eada6daa1b10e438d89d938511b8deae51b5cd3db', ['A009']),
  'packages/sdks/oak-curriculum-sdk/src/mcp/guidance-resources/continue-progression.ts': reviewed(
    '91f20cc4b98329583662c7049de90e1debb4d1f7a53987a05cb0d549871cd31a',
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
    'e06782ed9df42b9e52b6dbcdba082625e9971b8ea612fa787feb940bee6251a6',
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
    '07fef5f9147242ed72fb5eeda1cf2afcbd651ee15884be2f0899325e3df4b677',
    ['A004', 'C180', 'C189', 'C190', 'C199', 'C205', 'C331'],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/guidance-resources/find-lessons.ts': reviewed(
    '9c4fa350e00f23e60f5a9314ccf8af82dcc1b7c8b1e2c2ffb9b2c10f45a4d792',
    ['A003', 'C178', 'C185', 'C186', 'C197', 'C205', 'C329'],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/guidance-resources/guidance-resource-types.ts':
    excluded('8796e6a1afedd5fac86b942715e433b46f500e86a42cf6561872a5be3b00cf28', TYPE_ONLY),
  'packages/sdks/oak-curriculum-sdk/src/mcp/guidance-resources/learning-progression.ts': reviewed(
    'd73527adabfb39d92ed966bfa13c83c0ec5492dae94e8c6cfa218787937de595',
    ['A005', 'C181', 'C191', 'C192', 'C200', 'C205', 'C332'],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/mcp-resource-types.ts': excluded(
    'a2ed9cbf6ca75945220afda0b49af837ba6c043e7e774e3fced73fa8c3b39bd7',
    TYPE_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/apply-deferred-paths.ts': excluded(
    '8a3e3b76070cc91ff2cb0a541d1a46273c1c930ce77785d0dedd994b20aeb820',
    IMPLEMENTATION_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/codegen.ts': excluded(
    'ccfb0f67588886fc2793c2af9adc0c42c5018b590015100653095899e530c544',
    IMPLEMENTATION_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/excluded-paths.ts': reviewed(
    '38b8d1e4d203b1ead5654fc112fdc34ef646a3948de72ca7f0b0cd03353e09a5',
    ['A002', 'C470'],
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/resolve-schema-source.ts': excluded(
    '3b3ce79c0e5f50eeda6568ee22be0f80741c1f4f9380658af1ae514c42379d6a',
    IMPLEMENTATION_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/schema-separation-core.ts': excluded(
    'd93f7fb05575827fb0112743597aea35ed09cbf1739d536cd7db89cef4a913bf',
    IMPLEMENTATION_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/cross-domain-constants.ts': reviewed(
    'b484d7841cc96e2d4a1a5b82291b365ce99dd500f90a780c135d512d243486cd',
    ['C479', 'C480'],
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/generate-widget-constants.ts': excluded(
    '9a9cadbe8236d693c08852a82dd2a9231b1bc45ed59cd6ff4a32907643bbf8dd',
    IMPLEMENTATION_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/mcp-tools/mcp-tool-generator.ts': reviewed(
    '985339d8739c8526696fce3e03bb595ff133d40ab95cd8fb437507341af7089e',
    ['C471'],
  ),
  'packages/sdks/oak-sdk-codegen/code-generation/typegen/widget-uri-suffix.ts': excluded(
    '7f89317484bed2d46f21a5b96d1eb460dba210c0e08f36c67260ebb129074f96',
    IMPLEMENTATION_ONLY,
  ),
  'packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-key-stages-subject-lessons.ts':
    reviewed('fe7dcf08f44b4fb810598474bb09aca0ab40a4d82d5a26cd260f69808091943e', [
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
    reviewed('f78d1b36222eda00e6c711bbd628e54ee17bc89c2636865c7e167951046e05a7', [
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
    reviewed('84c68b8644286c7c7c921d27f89f8904c744470b3a7ef0ddbfb6435d781e5b98', [
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
    reviewed('981814fbe2d03c211fc2d8510937b5b24523f272091e57d19342c24cea61efc7', [
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
    reviewed('93b166911a82f95210e22360afbe042db99d17eabab95bf9bc084c5484bb0019', [
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
