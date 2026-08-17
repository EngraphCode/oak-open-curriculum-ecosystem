/**
 * Pure checks behind scripts/validate-boundaries.ts.
 *
 * Two check families, both returning failure strings (empty array = green)
 * so the script can report every problem in one run and exit non-zero once:
 *
 * - diffInventory: the declared-vs-live workspace comparison the flat tiers
 *   (libs, apps, sdks, design, tooling) already rely on.
 * - checkIdentityPackTier: the identity-pack tier (packages/design/identities)
 *   has no hand-declared inventory BY DESIGN — the identity-№N property
 *   requires that adding a pack needs zero framework-code edits, so a
 *   declared tuple here would itself violate the property the tier exists to
 *   prove. The tier is validated structurally instead: the directory must
 *   exist (a rename must fail loud, never silently shrink the checked
 *   surface — the tier is invisible to the package.json-keyed scans above),
 *   and every child must be a pack-shaped, data-only, private workspace.
 */

export function diffInventory(
  label: string,
  declared: readonly string[],
  actual: readonly string[],
): readonly string[] {
  const declaredSorted = [...declared].sort((a, b) => a.localeCompare(b));
  const actualSorted = [...actual].sort((a, b) => a.localeCompare(b));

  if (JSON.stringify(declaredSorted) === JSON.stringify(actualSorted)) {
    return [];
  }

  return [
    [
      `${label} is out of sync with the live workspace inventory.`,
      `Declared: ${JSON.stringify(declaredSorted)}`,
      `Live:     ${JSON.stringify(actualSorted)}`,
    ].join('\n'),
  ];
}

export interface IdentityPackTierEntry {
  readonly directoryName: string;
  /** Parsed package.json content, or undefined when the directory has none. */
  readonly packageJson: unknown;
  /**
   * Set when the directory HAS a package.json that could not be parsed —
   * the third input state, distinct from absent and from parsed, so a
   * malformed manifest becomes a located finding rather than a bare crash.
   */
  readonly parseFailure?: string;
}

const TIER_PATH = 'packages/design/identities';

export function checkIdentityPackTier(
  tierExists: boolean,
  entries: readonly IdentityPackTierEntry[],
): readonly string[] {
  if (!tierExists) {
    return [
      `Identity-pack tier directory ${TIER_PATH} is missing. The tier is a checked surface: ` +
        'if it was renamed or removed, move this leg with it rather than letting it vanish silently.',
    ];
  }

  return entries.flatMap((entry) => checkPackEntry(entry));
}

function checkPackEntry(entry: IdentityPackTierEntry): readonly string[] {
  const location = `${TIER_PATH}/${entry.directoryName}`;

  if (entry.parseFailure !== undefined) {
    return [`${location}/package.json could not be parsed: ${entry.parseFailure}`];
  }

  if (entry.packageJson === undefined) {
    return [
      `${location} has no package.json. Every child of the identity-pack tier is a pack ` +
        'workspace; anything else breaks the tier homogeneity the identity-№N enumeration relies on.',
    ];
  }

  if (typeof entry.packageJson !== 'object' || entry.packageJson === null) {
    return [`${location}/package.json is not an object.`];
  }

  const packageJson: Record<string, unknown> = { ...entry.packageJson };
  const failures: string[] = [];
  const expectedName = `@oaknational/identity-pack-${entry.directoryName}`;

  if (packageJson['name'] !== expectedName) {
    failures.push(
      `${location} must be named ${expectedName}, got: ${JSON.stringify(packageJson['name'])}.`,
    );
  }

  if (packageJson['private'] !== true) {
    failures.push(
      `${location} must set "private": true — identity packs carry identity content and must ` +
        'never become publishable by accident.',
    );
  }

  if ('scripts' in packageJson) {
    failures.push(
      `${location} declares scripts. Identity packs are data-only workspaces (manifest + CSS + ` +
        'assets + licence surface) and contribute nothing to the task graph.',
    );
  }

  if (typeof packageJson['license'] !== 'string' || packageJson['license'].length === 0) {
    failures.push(
      `${location} must declare a "license" field — each identity pack carries its own licence surface.`,
    );
  }

  return failures;
}
