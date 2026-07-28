/**
 * Reviewed post-baseline semantic deltas — Curriculum-SDK governed sources (aggregated tools, guidance, orientation).
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
  TYPE_ONLY,
} from './current-source-delta-review-helpers.js';

export const SDK_DELTA_REVIEWS: Readonly<Record<string, CurrentSourceDeltaReview>> = {
  'packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-asset-download/definition.ts': reviewed(
    '7487faee26f8222ef2d7f8412c1c45294b4cc0f8e919da06c73aa23f45af83fb',
    ['C161', 'C162', 'C163', 'C164', 'C165', 'C166', 'C177'],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-asset-download/execution.ts': reviewed(
    '4c88fec1899e18a3f934ddabe4ad79daaabf48300bf9271506c0bca266ee99d6',
    ['C167', 'C168', 'C169'],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-browse/tool-definition.ts': reviewed(
    '38a24f8e5ada622c4a39c872dec240b9f2a70b7073296748248b56059248f55e',
    ['C137', 'C138', 'C139', 'C140', 'C141'],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-curriculum-model/definition.ts': reviewed(
    '2df4fe95e40a23b172d9d6b43466c1a55d6135433f9b87001a2728f4e27f9f14',
    ['C172', 'C173', 'C174', 'C175'],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-eef-evidence.ts': reviewed(
    'a5e9441a87fb7974b4fa6bf4f81dc238691536bed1b70cf6c31a322561c58f95',
    ['C261', 'C262', 'C263', 'C264', 'C265', 'C266', 'C267', 'C268', 'C269', 'C270'],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-explore/tool-definition.ts': reviewed(
    '927759645750d64ee0096122a3201b2ea48b49602270075e00ea34092027ba6c',
    ['C100', 'C101', 'C102', 'C103', 'C104', 'C105'],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-fetch/execution.ts': reviewed(
    '56b062278ecd92c465eacaf96bdf787e2a5b23b10f92a6a9f143485462319550',
    ['C151', 'C152', 'C153', 'C154', 'C155', 'C156', 'C157', 'C158', 'C159'],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-keyword-graph.ts': reviewed(
    '78cdabb13aea1d85623db86cc2e95424e7bbf1da5fa2b7bb175d8bc041c4bca3',
    [
      'C221',
      'C222',
      'C223',
      'C224',
      'C225',
      'C226',
      'C227',
      'C228',
      'C229',
      'C230',
      'C231',
      'C232',
    ],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-misconception-graph.ts': reviewed(
    '123c885c792866dd9b2ec06078c869c1c4b4c3fcd8d36566cb0c235744999659',
    ['C233', 'C234', 'C235', 'C236', 'C237', 'C238', 'C239', 'C240', 'C241'],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-prior-knowledge-graph.ts': reviewed(
    'c85f003e69fe7f2a2da22d65f517334351a244d1085d4e989817ecf54246bacd',
    ['C246', 'C247', 'C248', 'C249', 'C250', 'C251'],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-search/tool-definition.ts': reviewed(
    '31efd948175661a2eeccf1020a56288617179e607517727ee75564cd5f6e775c',
    ['C065', 'C066', 'C067', 'C068'],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-thread-progressions.ts': reviewed(
    '4ec70e248ca3b5851d36ac7b73e32f7c2af274844192a8b49ec0334fa0a773a7',
    ['C252', 'C253', 'C254', 'C255', 'C256', 'C257', 'C258', 'C259', 'C260'],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-user-search/tool-definition.ts': reviewed(
    '5349c6faa562a23619b7f4176b137aa1e6e5682baf1d7dfac8fbb8d5cf6a0a75',
    [
      'C118',
      'C119',
      'C120',
      'C121',
      'C122',
      'C123',
      'C124',
      'C125',
      'C126',
      'C127',
      'C128',
      'C129',
    ],
  ),
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
  'packages/sdks/oak-curriculum-sdk/src/mcp/orientation-guidance.ts': reviewed(
    '541a88e4196d1ca0c1c3fd45fc31d7f662f7cd43a228f37004d40e21b9af0641',
    ['C001', 'C005', 'C006'],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/universal-tool-shared.ts': reviewed(
    '671ccee6dfe7b45ea91b65d67ccd7c72bda60a6354a62a6db648b2856240c3bf',
    ['C059', 'C060', 'C061', 'C062'],
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/universal-tools/definitions.ts': excluded(
    'da82fc8370788eefc4a61b2778b78a2f6b56ec457dec7a146bd50fa774937f65',
    IMPLEMENTATION_ONLY,
  ),
  'packages/sdks/oak-curriculum-sdk/src/mcp/universal-tools/executor.ts': reviewed(
    '6b3007871168f2f388a2f87b895223f03024b8ad7af8781f6a180b4ff3133d10',
    ['C057', 'C058'],
  ),
};
