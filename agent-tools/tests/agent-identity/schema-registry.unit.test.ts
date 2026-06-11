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

/**
 * v2 era table: pinned at assembly time (2026-06-11). These freeze the exact
 * names the v2 material derives; the activation cycle and any later refactor
 * must keep them byte-identical.
 */
const V2_ERA_SEED_TABLE = [
  { seed: 'era-seed-001', displayName: 'Basil turns Heath', slug: 'basil-turns-heath' },
  { seed: 'era-seed-002', displayName: 'Callisto herds Meridian', slug: 'callisto-herds-meridian' },
  { seed: 'era-seed-003', displayName: 'Corsair rides Ballast', slug: 'corsair-rides-ballast' },
  { seed: 'era-seed-004', displayName: 'Seraph turns Flicker', slug: 'seraph-turns-flicker' },
  { seed: 'era-seed-005', displayName: 'Seraph lifts Heat', slug: 'seraph-lifts-heat' },
  { seed: 'era-seed-006', displayName: 'Vanilla rides Hedgerow', slug: 'vanilla-rides-hedgerow' },
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

  it('uses v2 as the active schema (owner-approved 2026-06-11)', () => {
    expect(ACTIVE_NAMING_SCHEMA_ID).toBe('v2-noun-verb-noun');
  });

  it.each(V1_ERA_SEED_TABLE)(
    'reproduces the frozen v1 era name for $seed under the historical schema id',
    ({ seed, displayName, slug }) => {
      const result = deriveIdentity(seed, { schemaId: 'v1-adjective-verb-noun' });

      expect(result.kind).toBe('derived');
      expect(result.displayName).toBe(displayName);
      expect(result.slug).toBe(slug);
    },
  );

  it('registers the complete v2 era: six themes, title-lower-title casing, U-shaped columns', () => {
    const v2 = NAMING_SCHEMAS['v2-noun-verb-noun'];

    expect(v2.id).toBe('v2-noun-verb-noun');
    expect(v2.columnCasing).toEqual(['title', 'lower', 'title']);
    expect(v2.groups.map((group) => group.group)).toEqual([...APPROVED_V1_GROUPS]);
    for (const group of v2.groups) {
      expect(group.columns).toHaveLength(3);
      expect(group.columns[0]?.length).toBeGreaterThanOrEqual(50);
      expect(group.columns[1]?.length).toBeGreaterThanOrEqual(16);
      expect(group.columns[2]?.length).toBeGreaterThanOrEqual(40);
    }
  });

  it('pins the v2 wordlist digest so wordlist edits cannot land without a version bump', () => {
    const v2 = NAMING_SCHEMAS['v2-noun-verb-noun'];

    expect(v2.wordlistDigest).toMatch(/^[0-9a-f]{64}$/u);
    expect(computeNamingSchemaDigest(v2)).toBe(v2.wordlistDigest);
  });

  it('renders v2 names as micro-sentences with a lowercase middle word', () => {
    const result = deriveIdentity('v2-render-seed', { schemaId: 'v2-noun-verb-noun' });

    expect(result.kind).toBe('derived');
    expect(result.displayName).toMatch(/^[A-Z][a-z]+ [a-z]+ [A-Z][a-z]+$/u);
    expect(result.slug).toMatch(/^[a-z]+-[a-z]+-[a-z]+$/u);
  });

  it.each(V2_ERA_SEED_TABLE)(
    'derives the pinned v2 era name for $seed',
    ({ seed, displayName, slug }) => {
      const result = deriveIdentity(seed, { schemaId: 'v2-noun-verb-noun' });

      expect(result.kind).toBe('derived');
      expect(result.displayName).toBe(displayName);
      expect(result.slug).toBe(slug);
    },
  );
});
