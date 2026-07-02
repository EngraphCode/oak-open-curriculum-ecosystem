// Token-fidelity audit — compares the demo's Tailwind @theme token VALUES against the
// authoritative decoded Oak Figma tokens, and flags whole token CATEGORIES the demo omits
// (which then fall back to Tailwind defaults — a prime source of "close but clearly off" drift).
//
// Re-runnable enablement artefact for the reusable-demo process (Ask 2 / codification):
//   pnpm --filter @oaknational/oak-curriculum-hub tool:token-audit
//   tsx demos/oak-curriculum-hub/tools/token-fidelity-audit.ts   # direct form, from the repo root
// It re-reads both files each run, so it stays honest as either side changes.
//
// Framework/consumer split: parseCssVars + the comparison are the reusable mechanism;
// MAPPING + the demo/auth paths are the Oak-specific consumer config.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Repo-root-relative paths, kept relative because they ARE the report header; reads resolve them
// against the repo root derived from this file's own location, so the tool is cwd-independent.
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DEMO = 'demos/oak-curriculum-hub/app/globals.css';
const AUTH = 'demos/oak-curriculum-hub/vendor-reference/oak-figma-tokens.css';

interface CssDeclaration {
  name: string;
  value: string;
}

function isNameChar(ch: string): boolean {
  return /[a-zA-Z0-9-]/.test(ch);
}

/** Remove every complete inline block comment from a value — linear scan, no regex. */
function stripBlockComments(value: string): string {
  let out = '';
  let idx = 0;
  while (idx < value.length) {
    const open = value.indexOf('/*', idx);
    if (open === -1) {
      out += value.slice(idx);
      break;
    }
    const close = value.indexOf('*/', open + 2);
    if (close === -1) {
      out += value.slice(idx);
      break;
    }
    out += value.slice(idx, open);
    idx = close + 2;
  }
  return out;
}

/** Parse `name<ws>:<value>` at the start of `rest` (the text just after a `--`). */
function parseDeclarationAt(rest: string): CssDeclaration | undefined {
  let nameEnd = 0;
  while (nameEnd < rest.length && isNameChar(rest.charAt(nameEnd))) {
    nameEnd += 1;
  }
  if (nameEnd === 0) {
    return undefined;
  }
  let colon = nameEnd;
  while (colon < rest.length && rest.charAt(colon).trim() === '') {
    colon += 1;
  }
  if (rest.charAt(colon) !== ':') {
    return undefined;
  }
  const rawValue = rest.slice(colon + 1);
  if (rawValue === '') {
    return undefined;
  }
  return { name: rest.slice(0, nameEnd), value: stripBlockComments(rawValue).trim() };
}

/** Find the `--name: value` declaration in one `;`-delimited chunk — linear scan, replacing the
 *  Sonar-S8786-flagged whole-file declaration regex with non-regex string parsing. */
function parseDeclaration(chunk: string): CssDeclaration | undefined {
  for (let dash = chunk.indexOf('--'); dash !== -1; dash = chunk.indexOf('--', dash + 1)) {
    const declaration = parseDeclarationAt(chunk.slice(dash + 2));
    if (declaration !== undefined) {
      return declaration;
    }
  }
  return undefined;
}

/** Parse `--name: value;` custom properties into a name-to-value map (last write wins). */
function parseCssVars(filePath: string): Map<string, string> {
  const text = readFileSync(filePath, 'utf8');
  const vars = new Map<string, string>();
  const chunks = text.split(';');
  // The final chunk has no terminating ';', so it can never hold a complete declaration.
  chunks.pop();
  for (const chunk of chunks) {
    const declaration = parseDeclaration(chunk);
    if (declaration !== undefined) {
      vars.set(declaration.name, declaration.value);
    }
  }
  return vars;
}

/** Convert a `<number>rem` token to px (multiplied by 16, rounded); other tokens pass through. */
function remTokenToPx(token: string): string {
  if (!token.endsWith('rem')) {
    return token;
  }
  const n = Number.parseFloat(token.slice(0, -3));
  if (Number.isNaN(n)) {
    return token;
  }
  return `${Math.round(n * 16)}px`;
}

/** Normalise a shadow/length string to px: rem tokens scaled by 16, spaces collapsed. */
function toPx(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((token) => remTokenToPx(token))
    .join(' ');
}

/** Numeric magnitude of a bare-number or `px`-suffixed token. */
function numOf(value: string): number {
  return Number.parseFloat(value.endsWith('px') ? value.slice(0, -2) : value);
}

interface TokenMapping {
  cat: string;
  demoToken: string;
  authToken: string;
  cmp: 'num' | 'px';
}

// Consumer config: demo token vs authoritative token, with how to compare.
const MAPPING: readonly TokenMapping[] = [
  { cat: 'radius', demoToken: 'radius-oak-s', authToken: 'border-radius-border-radius-s', cmp: 'num' },
  { cat: 'radius', demoToken: 'radius-oak-m', authToken: 'border-radius-border-radius-m', cmp: 'num' },
  { cat: 'radius', demoToken: 'radius-oak-m2', authToken: 'border-radius-border-radius-m2', cmp: 'num' },
  { cat: 'radius', demoToken: 'radius-oak-l', authToken: 'border-radius-border-radius-l', cmp: 'num' },
  { cat: 'shadow', demoToken: 'shadow-oak-lemon', authToken: 'shadow-lemon', cmp: 'px' },
  { cat: 'shadow', demoToken: 'shadow-oak-wide-lemon', authToken: 'shadow-wide-lemon', cmp: 'px' },
  { cat: 'shadow', demoToken: 'shadow-oak-grey', authToken: 'shadow-grey', cmp: 'px' },
];

/** One report line for a mapped pair where both sides exist. */
function comparisonLine(mapping: TokenMapping, dv: string, av: string, equal: boolean): string {
  const fix = mapping.cmp === 'px' ? toPx(av) : `${numOf(av)}px`;
  const suffix = equal ? ' ✓' : `  ✗ → set to ${fix}`;
  return `[${mapping.cat}] ${mapping.demoToken}="${dv}" vs ${mapping.authToken}="${av}"${suffix}`;
}

interface ComparisonReport {
  matches: string[];
  mismatches: string[];
}

/** Compare every mapped token pair; the returned lines are the report's fix-list surface. */
function compareMappedTokens(demoVars: Map<string, string>, authVars: Map<string, string>): ComparisonReport {
  const matches: string[] = [];
  const mismatches: string[] = [];
  for (const mapping of MAPPING) {
    const dv = demoVars.get(mapping.demoToken);
    const av = authVars.get(mapping.authToken);
    if (dv === undefined || av === undefined) {
      mismatches.push(
        `[${mapping.cat}] ${mapping.demoToken} → ${mapping.authToken}: MISSING (demo=${dv ?? 'absent'}, auth=${av ?? 'absent'})`,
      );
      continue;
    }
    const equal = mapping.cmp === 'num' ? numOf(dv) === numOf(av) : toPx(dv) === toPx(av);
    (equal ? matches : mismatches).push(comparisonLine(mapping, dv, av, equal));
  }
  return { matches, mismatches };
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
    (k) => k.endsWith('border-radius-border-radius-xs') || k.endsWith('border-radius-border-radius-xl'),
  );
  return authRadii.length > 0 && !demoVars.has('radius-oak-xs') && !demoVars.has('radius-oak-xl');
}

/** Whole-category omissions: authoritative scales the demo theme defines nothing for. */
function collectOmissions(demoVars: Map<string, string>, authVars: Map<string, string>): string[] {
  const omissions: string[] = [];
  const fontSizes = authCount(authVars, 'font-size-');
  if (demoCount(demoVars, (k) => k.startsWith('text-') || k.includes('font-size')) === 0 && fontSizes > 0) {
    omissions.push(
      `TYPE SCALE omitted — auth defines font-size-1..${fontSizes} (12..56px); demo falls back to Tailwind (text-3xl=30≠32, text-4xl=36≠40).`,
    );
  }
  if (demoCount(demoVars, (k) => k.includes('border-width') || k.includes('border-solid')) === 0) {
    omissions.push(
      `BORDER-WIDTH scale omitted — auth defines border-solid s/m/l/xl/xxl = 1/2/3/4/6px; Tailwind has no 3px (Oak "l") default.`,
    );
  }
  const spaceOmitted = demoCount(demoVars, (k) => k.startsWith('spacing') || k.startsWith('space')) === 0;
  if (spaceOmitted && authCount(authVars, 'space-') > 0) {
    omissions.push(`SPACING scale omitted — auth defines space-* incl. 92/100/120/160/180px Tailwind does not hit cleanly.`);
  }
  if (radiiEndsOmitted(demoVars, authVars)) {
    omissions.push(
      `RADII xs=2 and xl=24 omitted — demo tops out at l=16; large cards/hero using xl=24 cannot match.`,
    );
  }
  return omissions;
}

/** Print the audit report — the stdout lines ARE the tool's interface. */
function printReport(matches: readonly string[], mismatches: readonly string[], omissions: readonly string[]): void {
  console.log(`# Token-fidelity audit\ndemo:  ${DEMO}\nauth:  ${AUTH}\n`);
  console.log(`## Mapped-token matches (${matches.length})`);
  for (const line of matches) {
    console.log(`  ${line}`);
  }
  console.log(`\n## Mapped-token MISMATCHES (${mismatches.length}) — fix-list for the styling lane`);
  for (const line of mismatches) {
    console.log(`  ${line}`);
  }
  console.log(`\n## Whole-category OMISSIONS (${omissions.length}) — demo @theme defines none; Tailwind defaults used`);
  for (const line of omissions) {
    console.log(`  - ${line}`);
  }
  console.log('\nNote: colour VALUES were separately verified present in the authoritative set (palette faithful).');
  console.log(
    'Not a token issue: body font-weight:300 in globals.css is a RENDERED check for the styling lane vs the prototype.',
  );
}

function main(): void {
  const demoVars = parseCssVars(path.resolve(REPO_ROOT, DEMO));
  const authVars = parseCssVars(path.resolve(REPO_ROOT, AUTH));
  const { matches, mismatches } = compareMappedTokens(demoVars, authVars);
  printReport(matches, mismatches, collectOmissions(demoVars, authVars));
}

main();
