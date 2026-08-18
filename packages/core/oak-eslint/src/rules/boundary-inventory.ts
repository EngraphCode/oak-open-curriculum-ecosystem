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
   * Pack-relative paths of every file in the pack (`node_modules` and
   * dot-entries excluded — those are local tool artefacts, not pack
   * content). The anatomy check runs over this listing, so a pack's
   * data-only invariant is enforced on contents, never inferred from the
   * absence of a `scripts` field alone.
   */
  readonly files: readonly string[];
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

  if (typeof packageJson['license'] !== 'string' || packageJson['license'].trim().length === 0) {
    failures.push(
      `${location} must declare a non-blank "license" field — each identity pack carries its own licence surface.`,
    );
  }

  failures.push(...checkPackAnatomy(location, entry.files));

  return failures;
}

/**
 * The permitted pack anatomy — a closed shape (tier README §Tier
 * invariants). Data-only means manifest/data JSON, authored CSS, docs,
 * licence surfaces, and vendored assets; source, executables, tool
 * configuration, and any file class this list has never admitted are
 * refused by default rather than admitted by omission.
 */
const PERMITTED_FILE_EXTENSIONS: ReadonlySet<string> = new Set([
  'json',
  'css',
  'md',
  'txt',
  'svg',
  'png',
  'webp',
  'avif',
  'jpg',
  'jpeg',
  'gif',
  'ico',
  'woff',
  'woff2',
  'ttf',
  'otf',
]);

const PERMITTED_EXTENSIONLESS_BASENAMES: ReadonlySet<string> = new Set([
  'LICENSE',
  'LICENCE',
  'NOTICE',
]);

const SOURCE_FILE_EXTENSIONS: ReadonlySet<string> = new Set([
  'ts',
  'tsx',
  'js',
  'jsx',
  'mjs',
  'cjs',
  'mts',
  'cts',
  'sh',
]);

const REFUSED_CONFIG_BASENAMES =
  /^(?:eslint\.config\..+|tsconfig(?:\..+)?\.json|turbo\.json|vite\.config\..+|vitest\.config\..+|playwright\.config\..+)$/;

function checkPackAnatomy(location: string, files: readonly string[]): readonly string[] {
  return files.flatMap((file) => {
    const basename = file.split('/').at(-1) ?? file;
    const dotIndex = basename.lastIndexOf('.');
    const extension = dotIndex > 0 ? basename.slice(dotIndex + 1).toLowerCase() : undefined;

    if (REFUSED_CONFIG_BASENAMES.test(basename)) {
      return [
        `${location}/${file} is tool configuration. Identity packs carry no build, lint, or ` +
          'test configuration — packs are data-only workspaces outside the task graph.',
      ];
    }

    if (extension !== undefined && SOURCE_FILE_EXTENSIONS.has(extension)) {
      return [
        `${location}/${file} is source or executable code. Data-only packs refuse source as a ` +
          "shape error (see the tier README's boundary-zone depth note): packs carry no ESLint " +
          'config, so source here would bypass the boundary rules entirely.',
      ];
    }

    if (
      (extension !== undefined && PERMITTED_FILE_EXTENSIONS.has(extension)) ||
      PERMITTED_EXTENSIONLESS_BASENAMES.has(basename)
    ) {
      return [];
    }

    return [
      `${location}/${file} is outside the permitted pack anatomy (manifest/data JSON, authored ` +
        'CSS, docs, licence surfaces, vendored assets). The anatomy is a closed shape: a new ' +
        'file class enters by amending the permitted set deliberately, never by omission.',
    ];
  });
}
