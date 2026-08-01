import { describe, expect, it } from 'vitest';

import { collaborationAgentIdSchema } from '../../src/collaboration-state/types';
import {
  displayPrefix,
  visualDisambiguator,
} from '../../src/collaboration-state/visual-disambiguator';
import {
  parsedBlock,
  UUIDV4_ANCHORED_ID,
  UUIDV4_ANCHORED_PREFIX,
} from './visual-disambiguator-fixtures';

// Fixtures are schema-parsed literal blocks (testing-strategy §Test Data
// Anchoring): the parse proves each block schema-legal, and pinning the full
// id literal beside each expected token keeps the `<prefix>-<last 3 of id>`
// relation eye-verifiable without executing any derivation. The id values
// were recorded once from the live seed derivation at authoring time
// (2026-07-31; the originating seed is noted per row, and the session-id
// seeds are shared with session-id-prefix-across-host-identity-hooks
// .unit.test.ts so the tables stay cross-checkable). Anchoring the literals
// here rather than deriving through the identity module keeps this file
// independent of the PDR-076a host-local namespace, which
// identity.unit.test.ts deliberately never pins. The block factory and the
// UUIDv4 row's anchored values live in visual-disambiguator-fixtures.ts,
// shared with the docs-drift test.
const tokenRows = [
  // seed 22e83599-a627-4427-b23c-fe6ce046e859 (UUIDv4)
  {
    label: 'a UUIDv4-seeded block',
    prefix: UUIDV4_ANCHORED_PREFIX,
    id: UUIDV4_ANCHORED_ID,
    token: '22e835-dda',
  },
  // seed 019dd34d-cb6a-74e0-a29d-6cb8a65ea14b (UUIDv7 family)
  {
    label: 'a UUIDv7-seeded block',
    prefix: '019dd3',
    id: '76e5570d-e568-55cd-9dce-119f6bd382e4',
    token: '019dd3-2e4',
  },
  // seed antigravity-conversation-seed (non-UUID conversation id)
  {
    label: 'a non-UUID conversation-id-seeded block',
    prefix: 'antigr',
    id: '0981a8eb-2232-5e27-ac45-a89c3f19d33e',
    token: 'antigr-33e',
  },
  // seed 22E83599-A627-4427-B23C-FE6CE046E859 (uppercase, hyphen-bearing)
  {
    label: 'an uppercase-seeded block, prefix rendered verbatim',
    prefix: '22E835',
    id: 'e9b15d1b-e928-5537-8ee2-60e681b3f675',
    token: '22E835-675',
  },
  // deriveOverrideCollaborationIdentity('Override Test' | 'override-prefix')
  {
    label: 'an override identity with a hyphenated prefix',
    prefix: 'override-prefix',
    id: '5ec175cf-ec76-57f0-aed6-33a3fd835265',
    token: 'override-prefix-265',
  },
  // the UUIDv4 row's id upcased: uuidV5Schema admits uppercase hex (a block
  // parsed from external JSON), and the suffix renders verbatim
  {
    label: 'an uppercase-id block, suffix rendered verbatim',
    prefix: '22e835',
    id: '1BB4DF59-58E8-5B71-B41B-EEBD1F587DDA',
    token: '22e835-DDA',
  },
] as const;

describe('the visual-disambiguator token an identity block renders', () => {
  it.each(tokenRows)('derives $token for $label', ({ prefix, id, token }) => {
    expect(visualDisambiguator(parsedBlock({ session_id_prefix: prefix, id }))).toBe(token);
  });

  it('returns undefined for an id-less legacy block', () => {
    const legacy = collaborationAgentIdSchema.parse({
      agent_name: 'Legacy Agent',
      platform: 'claude',
      model: 'opus-4-5',
      session_id_prefix: 'abc123',
    });
    expect(visualDisambiguator(legacy)).toBeUndefined();
  });

  it('distinguishes two same-window seats whose prefixes are identical', () => {
    // seeds 019f93aa-0000-7000-8000-000000000001 / 019f93bb-…-000000000002:
    // both UUIDv7-family seeds derive the same first-6 prefix (the real
    // 2026-07-24 collision shape) and different UUIDv5 ids
    const a = parsedBlock({
      session_id_prefix: '019f93',
      id: '16ea4357-6424-574e-863e-4d81f7fdc508',
    });
    const b = parsedBlock({
      session_id_prefix: '019f93',
      id: '608c6e45-7a5d-5161-bdd6-f403e03ee114',
    });
    expect(visualDisambiguator(a)).toBe('019f93-508');
    expect(visualDisambiguator(b)).toBe('019f93-114');
  });

  it('yields the same token for identically configured override identities', () => {
    const overrideFields = {
      session_id_prefix: 'override-prefix',
      id: '5ec175cf-ec76-57f0-aed6-33a3fd835265',
    } as const;
    expect(visualDisambiguator(parsedBlock(overrideFields))).toBe('override-prefix-265');
    expect(visualDisambiguator(parsedBlock(overrideFields))).toBe('override-prefix-265');
  });

  it('is pure: the same block derives the same token', () => {
    const block = parsedBlock({
      session_id_prefix: '22e835',
      id: '1bb4df59-58e8-5b71-b41b-eebd1f587dda',
    });
    expect(visualDisambiguator(block)).toBe('22e835-dda');
    expect(visualDisambiguator(block)).toBe('22e835-dda');
  });

  it('renders the final fields of a block whose prefix was replaced', () => {
    // models the resolveSelfIdentity --session-prefix override shape:
    // { ...agent_id, session_id_prefix: overridePrefix }
    const block = parsedBlock({
      session_id_prefix: '22e835',
      id: '1bb4df59-58e8-5b71-b41b-eebd1f587dda',
    });
    expect(visualDisambiguator({ ...block, session_id_prefix: 'zz9999' })).toBe('zz9999-dda');
  });

  it('renders the final fields of a block whose id was replaced', () => {
    const block = parsedBlock({
      session_id_prefix: '22e835',
      id: '1bb4df59-58e8-5b71-b41b-eebd1f587dda',
    });
    const replacement = parsedBlock({
      session_id_prefix: '019dd3',
      id: '76e5570d-e568-55cd-9dce-119f6bd382e4',
    });
    expect(visualDisambiguator({ ...block, id: replacement.id })).toBe('22e835-2e4');
  });
});

describe('the display prefix a renderer shows', () => {
  it('is the token for an id-bearing block', () => {
    const block = parsedBlock({
      session_id_prefix: '22e835',
      id: '1bb4df59-58e8-5b71-b41b-eebd1f587dda',
    });
    expect(displayPrefix(block)).toBe('22e835-dda');
  });

  it('is the bare prefix for an id-less legacy block', () => {
    expect(displayPrefix(parsedBlock({ session_id_prefix: 'abc123' }))).toBe('abc123');
  });
});
