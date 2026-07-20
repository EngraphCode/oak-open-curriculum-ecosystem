// Token-fidelity audit — compares the demo's Tailwind @theme token VALUES against the
// authoritative token files inside the canonical Claude-Design export, and flags whole token
// CATEGORIES the demo omits (which then fall back to Tailwind defaults — a prime source of
// "close but clearly off" drift).
//
// Re-runnable enablement artefact for the reusable-demo process (Ask 2 / codification):
//   pnpm --filter @oaknational/oak-curriculum-hub tool:token-audit
//   tsx demos/oak-curriculum-hub/tools/token-fidelity-audit.ts   # direct form, from the repo root
// It re-reads every file each run, so it stays honest as either side changes.
//
// Framework/consumer split: css-token-parse.ts (parseCssVars + the value normalisers) is the
// reusable mechanism; MAPPING + the demo/auth paths here are the Oak-specific consumer config.
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { numOf, parseCssVars, toPx } from './css-token-parse';
import { MAPPING, type TokenMapping } from './token-audit-mapping';

// Repo-root-relative paths, kept relative because they ARE the report header; reads resolve them
// against the repo root derived from this file's own location, so the tool is cwd-independent.
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DEMO = 'demos/oak-curriculum-hub/app/globals.css';
// The authority is the canonical export's OWN token surface, in two files under its design-system
// directory: `tokens/fig-tokens.css` (the Figma-variables export: radii, border widths, palette)
// and `colors_and_type.css` (the curated oak-components augmentation — shadows, type scale,
// spacing; source: oaknational/oak-components src/styles/theme/*). The two define disjoint token
// names, so the union is well-defined. The `_ds/*` directory is resolved dynamically so a
// re-pulled export with a different design-system id still resolves.
const EXPORT_DS_PARENT = 'demos/oak-curriculum-hub/claude-design-canonical-export/_ds';

/** Resolve the export's authoritative token files (repo-root-relative), or an error line. */
function resolveAuthFiles(): { files: string[] } | { error: string } {
  const parentAbs = path.resolve(REPO_ROOT, EXPORT_DS_PARENT);
  const matches = readdirSync(parentAbs, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `${EXPORT_DS_PARENT}/${entry.name}`)
    .filter((dir) => existsSync(path.resolve(REPO_ROOT, dir, 'tokens', 'fig-tokens.css')))
    .sort((a, b) => a.localeCompare(b));
  const dsDir = matches[0];
  if (dsDir === undefined || matches.length > 1) {
    return {
      error: `expected exactly one ${EXPORT_DS_PARENT}/*/tokens/fig-tokens.css, found ${matches.length}`,
    };
  }
  const files = [`${dsDir}/tokens/fig-tokens.css`, `${dsDir}/colors_and_type.css`];
  const missing = files.find((file) => !existsSync(path.resolve(REPO_ROOT, file)));
  if (missing !== undefined) {
    return { error: `authoritative token file missing from the export: ${missing}` };
  }
  return { files };
}

/** Union-parse the authoritative files (disjoint names; later files would win on a clash). */
function parseAuthVars(files: readonly string[]): Map<string, string> {
  const merged = new Map<string, string>();
  for (const file of files) {
    for (const [name, value] of parseCssVars(path.resolve(REPO_ROOT, file))) {
      merged.set(name, value);
    }
  }
  return merged;
}

/** One report line for a mapped pair where both sides exist. */
function comparisonLine(mapping: TokenMapping, dv: string, av: string, equal: boolean): string {
  const fix = mapping.cmp === 'px' ? toPx(av) : `${numOf(av)}px`;
  const suffix = equal ? ' ✓' : `  ✗ → set to ${fix}`;
  return `[${mapping.cat}] ${mapping.demoToken}="${dv}" vs ${mapping.authToken}="${av}"${suffix}`;
}

interface ComparisonReport {
  matches: string[];
  /** Demo tokens whose value is a var() alias into the kit (post-ADR-213
   *  convergence): not literal-comparable here — the kit's own build gate and
   *  the fidelity register's global entries govern them. */
  aliased: string[];
  mismatches: string[];
}

/** One mapping's verdict: missing side, kit-aliased demo value (post-ADR-213
 *  the demo tokens alias the kit's roles — a literal comparison against the
 *  export would compare a var() reference string, so the aliasing is reported
 *  honestly instead of a false mismatch), or a literal match/mismatch. */
function classifyMapping(
  mapping: TokenMapping,
  dv: string | undefined,
  av: string | undefined,
): { kind: 'match' | 'mismatch' | 'aliased' | 'missing'; line: string } {
  if (dv === undefined || av === undefined) {
    return {
      kind: 'missing',
      line: `[${mapping.cat}] ${mapping.demoToken} → ${mapping.authToken}: MISSING (demo=${dv ?? 'absent'}, auth=${av ?? 'absent'})`,
    };
  }
  if (dv.includes('var(')) {
    return {
      kind: 'aliased',
      line: `[${mapping.cat}] ${mapping.demoToken}="${dv}" — kit-aliased; governed by the kit build gate + the register's global entries`,
    };
  }
  const equal = mapping.cmp === 'num' ? numOf(dv) === numOf(av) : toPx(dv) === toPx(av);
  return { kind: equal ? 'match' : 'mismatch', line: comparisonLine(mapping, dv, av, equal) };
}

/** Compare every mapped token pair; the returned lines are the report's fix-list surface. */
function compareMappedTokens(
  demoVars: Map<string, string>,
  authVars: Map<string, string>,
): ComparisonReport {
  const matches: string[] = [];
  const mismatches: string[] = [];
  const aliased: string[] = [];
  for (const mapping of MAPPING) {
    const verdict = classifyMapping(
      mapping,
      demoVars.get(mapping.demoToken),
      authVars.get(mapping.authToken),
    );
    if (verdict.kind === 'match') {
      matches.push(verdict.line);
    } else if (verdict.kind === 'aliased') {
      aliased.push(verdict.line);
    } else {
      mismatches.push(verdict.line);
    }
  }
  return { matches, mismatches, aliased };
}

/** Count of authoritative tokens whose name starts with `prefix`. */
function authCount(authVars: Map<string, string>, prefix: string): number {
  return [...authVars.keys()].filter((key) => key.startsWith(prefix)).length;
}

/** Count of demo tokens matching `test` (arrow-wrapped call — no bare function reference, S7727). */
function demoCount(demoVars: Map<string, string>, test: (key: string) => boolean): number {
  return [...demoVars.keys()].filter((key) => test(key)).length;
}

/** True when the authoritative set carries the xs/xl radii but the demo defines neither. */
function radiiEndsOmitted(demoVars: Map<string, string>, authVars: Map<string, string>): boolean {
  const authRadii = [...authVars.keys()].filter(
    (k) =>
      k.endsWith('border-radius-border-radius-xs') || k.endsWith('border-radius-border-radius-xl'),
  );
  return authRadii.length > 0 && !demoVars.has('radius-oak-xs') && !demoVars.has('radius-oak-xl');
}

/** Whole-category omissions: authoritative scales the demo theme defines nothing for. */
function collectOmissions(demoVars: Map<string, string>, authVars: Map<string, string>): string[] {
  const omissions: string[] = [];
  const fontSizes = authCount(authVars, 'font-size-');
  if (
    demoCount(demoVars, (k) => k.startsWith('text-') || k.includes('font-size')) === 0 &&
    fontSizes > 0
  ) {
    omissions.push(
      `TYPE SCALE omitted — auth defines font-size-1..${fontSizes} (12..56px); demo falls back to Tailwind (text-3xl=30≠32, text-4xl=36≠40).`,
    );
  }
  if (demoCount(demoVars, (k) => k.includes('border-width') || k.includes('border-solid')) === 0) {
    omissions.push(
      `BORDER-WIDTH scale omitted — auth defines border-solid s/m/l/xl/xxl = 1/2/3/4/6px; Tailwind has no 3px (Oak "l") default.`,
    );
  }
  const spaceOmitted =
    demoCount(demoVars, (k) => k.startsWith('spacing') || k.startsWith('space')) === 0;
  if (spaceOmitted && authCount(authVars, 'space-') > 0) {
    omissions.push(
      `SPACING scale omitted — auth defines space-* incl. 92/100/120/160/180px Tailwind does not hit cleanly.`,
    );
  }
  if (radiiEndsOmitted(demoVars, authVars)) {
    omissions.push(
      `RADII xs=2 and xl=24 omitted — demo tops out at l=16; large cards/hero using xl=24 cannot match.`,
    );
  }
  return omissions;
}

/** Print the audit report — the stdout lines ARE the tool's interface. */
function printReport(
  authFiles: readonly string[],
  matches: readonly string[],
  aliased: readonly string[],
  mismatches: readonly string[],
  omissions: readonly string[],
): void {
  process.stdout.write(
    `# Token-fidelity audit\ndemo:  ${DEMO}\nauth:  ${authFiles.join(' + ')}\n\n`,
  );
  process.stdout.write(`## Mapped-token matches (${matches.length})\n`);
  for (const line of matches) {
    process.stdout.write(`  ${line}\n`);
  }
  process.stdout.write(
    `\n## Kit-aliased tokens (${aliased.length}) — governed by the kit build gate + register\n`,
  );
  for (const line of aliased) {
    process.stdout.write(`  ${line}\n`);
  }
  process.stdout.write(
    `\n## Mapped-token MISMATCHES (${mismatches.length}) — fix-list for the styling lane\n`,
  );
  for (const line of mismatches) {
    process.stdout.write(`  ${line}\n`);
  }
  process.stdout.write(
    `\n## Whole-category OMISSIONS (${omissions.length}) — demo @theme defines none; Tailwind defaults used\n`,
  );
  for (const line of omissions) {
    process.stdout.write(`  - ${line}\n`);
  }
  process.stdout.write(
    '\nNote: colour VALUES were separately verified present in the authoritative set (palette faithful).\n',
  );
  process.stdout.write(
    'Not a token issue: body font-weight:300 in globals.css is a RENDERED check for the styling lane vs the prototype.\n',
  );
}

function main(): void {
  const auth = resolveAuthFiles();
  if ('error' in auth) {
    process.stderr.write(`TOKEN AUDIT FAIL: ${auth.error}\n`);
    process.exitCode = 1;
    return;
  }
  const demoVars = parseCssVars(path.resolve(REPO_ROOT, DEMO));
  const authVars = parseAuthVars(auth.files);
  const { matches, mismatches, aliased } = compareMappedTokens(demoVars, authVars);
  printReport(auth.files, matches, aliased, mismatches, collectOmissions(demoVars, authVars));
}

main();
