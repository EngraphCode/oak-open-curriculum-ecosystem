import { deriveIdentity } from '../../src/core/agent-identity';
import {
  ACTIVE_NAMING_SCHEMA_ID,
  NAMING_SCHEMAS,
  computeNamingSchemaDigest,
} from '../../src/core/agent-identity/schema-registry';

const APPROVED_V1_GROUPS = [
  'celestial',
  'maritime',
  'botanical',
  'ember',
  'aerial',
  'nocturnal',
] as const;

/**
 * Era-stability table: known seeds and the exact v1 names they derived on
 * 2026-06-11. The v1 era is frozen; any change to these outputs is a
 * naming-schema regression, not a refactor.
 */
const V1_ERA_SEED_TABLE = [
  { seed: 'era-seed-001', displayName: 'Sylvan Twining Petal', slug: 'sylvan-twining-petal' },
  { seed: 'era-seed-002', displayName: 'Moonlit Shimmering Star', slug: 'moonlit-shimmering-star' },
  { seed: 'era-seed-003', displayName: 'Riverine Diving Stern', slug: 'riverine-diving-stern' },
  { seed: 'era-seed-004', displayName: 'Scorched Glowing Pyre', slug: 'scorched-glowing-pyre' },
  { seed: 'era-seed-005', displayName: 'Scorched Charring Kiln', slug: 'scorched-charring-kiln' },
  { seed: 'era-seed-006', displayName: 'Wooded Regrowing Stamen', slug: 'wooded-regrowing-stamen' },
] as const;

describe('naming schema registry', () => {
  it('registers the v1 era with three title-cased columns over the six approved groups', () => {
    const v1 = NAMING_SCHEMAS['v1-adjective-verb-noun'];

    expect(v1.id).toBe('v1-adjective-verb-noun');
    expect(v1.columnCasing).toEqual(['title', 'title', 'title']);
    expect(v1.groups.map((group) => group.group)).toEqual([...APPROVED_V1_GROUPS]);
    expect(v1.groups.every((group) => group.columns.length === 3)).toBe(true);
  });

  it('pins the v1 wordlist digest so wordlist edits cannot land without a version bump', () => {
    const v1 = NAMING_SCHEMAS['v1-adjective-verb-noun'];

    expect(v1.wordlistDigest).toMatch(/^[0-9a-f]{64}$/u);
    expect(computeNamingSchemaDigest(v1)).toBe(v1.wordlistDigest);
  });

  it('keeps v1 as the active schema until the v2 activation cycle lands', () => {
    expect(ACTIVE_NAMING_SCHEMA_ID).toBe('v1-adjective-verb-noun');
  });

  it.each(V1_ERA_SEED_TABLE)(
    'derives the frozen v1 era name for $seed',
    ({ seed, displayName, slug }) => {
      const result = deriveIdentity(seed);

      expect(result.kind).toBe('derived');
      expect(result.displayName).toBe(displayName);
      expect(result.slug).toBe(slug);
    },
  );
});
