import { describe, expect, it } from 'vitest';
import {
  checkIdentityPackTier,
  diffInventory,
  type IdentityPackTierEntry,
} from './boundary-inventory.js';

// Assertion style, per testing-strategy §"Prove behaviour, never config or
// content": a refusal's observable contract is that a report EXISTS and that
// it names the concern and locates the offender. Tests therefore assert
// token presence on the joined report — never failure counts, ordering, or
// message prose, which are implementation granularity free to change.

describe('diffInventory', () => {
  it('returns no failures when declared and actual agree (order-insensitive)', () => {
    expect(
      diffInventory(
        'Design boundary inventory',
        ['@oaknational/b', '@oaknational/a'],
        ['@oaknational/a', '@oaknational/b'],
      ),
    ).toEqual([]);
  });

  it('reports a live workspace member the declaration lacks, attributed to the live side', () => {
    const failures = diffInventory(
      'Design boundary inventory',
      ['@oaknational/a'],
      ['@oaknational/a', '@oaknational/b'],
    );
    const report = failures.join('\n');
    const lineNamingMember = report
      .split('\n')
      .filter((line) => line.includes('@oaknational/b'))
      .join('\n');

    expect(report).toContain('Design boundary inventory');
    expect(lineNamingMember).toContain('Live');
  });

  it('reports a declared member the live workspace lacks, attributed to the declared side', () => {
    const failures = diffInventory('Library boundary inventory', ['@oaknational/gone'], []);
    const report = failures.join('\n');
    const lineNamingMember = report
      .split('\n')
      .filter((line) => line.includes('@oaknational/gone'))
      .join('\n');

    expect(report).toContain('Library boundary inventory');
    expect(lineNamingMember).toContain('Declared');
  });
});

const validPackJson: Record<string, unknown> = {
  name: '@oaknational/identity-pack-tango',
  version: '0.0.0-development',
  private: true,
  license: 'SEE LICENSE IN LICENCES.md',
};

function packIn(directoryName: string, overrides: Record<string, unknown>): IdentityPackTierEntry {
  return {
    directoryName,
    packageJson: {
      ...validPackJson,
      name: `@oaknational/identity-pack-${directoryName}`,
      ...overrides,
    },
  };
}

function reportFor(entries: readonly IdentityPackTierEntry[]): string {
  return checkIdentityPackTier(true, entries).join('\n');
}

describe('checkIdentityPackTier', () => {
  it('refuses a missing tier directory, naming the tier path', () => {
    const report = checkIdentityPackTier(false, []).join('\n');

    expect(report).toContain('packages/design/identities');
  });

  it('passes on an existing tier with zero packs (the tier is minted before its first pack)', () => {
    expect(checkIdentityPackTier(true, [])).toEqual([]);
  });

  it.each(['tango', 'delta'])(
    'passes a well-shaped data-only pack in directory %s',
    (directoryName) => {
      expect(checkIdentityPackTier(true, [packIn(directoryName, {})])).toEqual([]);
    },
  );

  it.each(['tango', 'delta'])(
    'derives the required name from the directory: a pack in %s named for another slug is refused',
    (directoryName) => {
      const report = reportFor([packIn(directoryName, { name: '@oaknational/some-other-pack' })]);

      expect(report).toContain(`@oaknational/identity-pack-${directoryName}`);
      expect(report).toContain('@oaknational/some-other-pack');
      expect(report).toContain(`packages/design/identities/${directoryName}`);
    },
  );

  it('refuses a tier child with no package.json — every child is a pack workspace', () => {
    const report = reportFor([{ directoryName: 'stray-dir', packageJson: undefined }]);

    expect(report).toContain('packages/design/identities/stray-dir');
    expect(report).toContain('package.json');
  });

  it('reports an unparseable package.json as a located finding, not a crash', () => {
    const report = reportFor([
      {
        directoryName: 'tango',
        packageJson: undefined,
        parseFailure: 'Unexpected token } in JSON at position 40',
      },
    ]);

    expect(report).toContain('packages/design/identities/tango');
    expect(report).toContain('could not be parsed');
    expect(report).toContain('Unexpected token');
  });

  it.each([null, 'a string', 42])(
    'refuses a package.json that parses to a non-object (%j), locating the pack',
    (parsed) => {
      const report = reportFor([{ directoryName: 'tango', packageJson: parsed }]);

      expect(report).toContain('packages/design/identities/tango');
      expect(report).toContain('not an object');
    },
  );

  it.each([{ private: false }, { private: 'yes' }])(
    'refuses a pack whose private field is anything but literal true (%j)',
    (override) => {
      const report = reportFor([packIn('tango', override)]);

      expect(report).toContain('private');
      expect(report).toContain('packages/design/identities/tango');
    },
  );

  it('refuses a pack that declares scripts, even an empty scripts object — packs are data-only', () => {
    const report = reportFor([packIn('tango', { scripts: {} })]);

    expect(report).toContain('scripts');
    expect(report).toContain('packages/design/identities/tango');
  });

  it('refuses a pack whose license declaration is an empty string', () => {
    const report = reportFor([packIn('tango', { license: '' })]);

    expect(report).toContain('license');
    expect(report).toContain('packages/design/identities/tango');
  });

  it('refuses a pack with no license declaration — each pack carries its own licence surface', () => {
    const report = reportFor([
      {
        directoryName: 'tango',
        packageJson: {
          name: '@oaknational/identity-pack-tango',
          version: '0.0.0-development',
          private: true,
        },
      },
    ]);

    expect(report).toContain('license');
    expect(report).toContain('packages/design/identities/tango');
  });

  it('reports every fault of a single pack — a misnamed AND public pack has both concerns named', () => {
    const report = reportFor([
      packIn('tango', { name: '@oaknational/some-other-pack', private: false }),
    ]);

    expect(report).toContain('@oaknational/identity-pack-tango');
    expect(report).toContain('private');
  });

  it('reports faults across entries — each offending pack is located in the report', () => {
    const report = reportFor([
      { directoryName: 'stray-dir', packageJson: undefined },
      packIn('delta', { private: false }),
    ]);

    expect(report).toContain('packages/design/identities/stray-dir');
    expect(report).toContain('packages/design/identities/delta');
  });
});
