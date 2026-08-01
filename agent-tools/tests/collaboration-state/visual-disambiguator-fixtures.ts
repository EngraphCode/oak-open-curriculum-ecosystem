import {
  collaborationAgentIdSchema,
  type CollaborationAgentId,
} from '../../src/collaboration-state/types';

// Shared fixture surface for the visual-disambiguator tests, extracted at the
// second consumer. Fixtures are schema-parsed literal blocks (testing-strategy
// §Test Data Anchoring): the parse proves each block schema-legal. The
// anchored UUIDv4 row's values were recorded once from the live seed
// derivation (seed 22e83599-a627-4427-b23c-fe6ce046e859, 2026-07-31) and are
// exported as named constants so the sibling token table and the docs-drift
// example stay cross-checkable by mechanism rather than by copied literals.
export const UUIDV4_ANCHORED_PREFIX = '22e835';
export const UUIDV4_ANCHORED_ID = '1bb4df59-58e8-5b71-b41b-eebd1f587dda';

export function parsedBlock(fields: {
  readonly session_id_prefix: string;
  readonly id?: string;
}): CollaborationAgentId {
  return collaborationAgentIdSchema.parse({
    agent_name: 'Fixture Agent',
    platform: 'codex',
    model: 'GPT-5',
    ...fields,
  });
}
