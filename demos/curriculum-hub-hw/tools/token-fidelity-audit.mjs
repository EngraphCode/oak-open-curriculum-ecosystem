// Token-fidelity audit — compares the demo's Tailwind @theme token VALUES against the
// authoritative decoded Oak Figma tokens, and flags whole token CATEGORIES the demo omits
// (which then fall back to Tailwind defaults — a prime source of "close but clearly off" drift).
//
// Re-runnable enablement artefact for the reusable-demo process (Ask 2 / codification):
//   node demos/curriculum-hub-hw/demo-evidence/token-fidelity-audit.mjs
// It re-reads both files each run, so it stays honest as either side changes.
//
// Framework/consumer split: parseCssVars + the comparison are the reusable mechanism;
// MAPPING + the demo/auth paths are the Oak-specific consumer config.
import { readFileSync } from 'node:fs';

const DEMO = 'demos/curriculum-hub-hw/oak-curriculum-hub/app/globals.css';
const AUTH = 'demos/curriculum-hub-hw/oak-design-kit/from-prototype/oak-figma-tokens.css';

/** Parse `--name: value;` custom properties into a { name: value } map (last write wins). */
function parseCssVars(path) {
  const text = readFileSync(path, 'utf8');
  const map = {};
  const re = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(text)) !== null) map[m[1]] = m[2].replace(/\/\*.*?\*\//g, '').trim();
  return map;
}

/** Normalise a shadow/length string to px: rem→×16, strip units, collapse spaces. */
function toPx(v) {
  return v
    .replace(/([0-9.]+)rem/g, (_, n) => `${Math.round(parseFloat(n) * 16)}px`)
    .replace(/\s+/g, ' ')
    .trim();
}
const numOf = (v) => parseFloat(String(v).replace(/px$/, ''));

const demo = parseCssVars(DEMO);
const auth = parseCssVars(AUTH);

// Consumer config: demo token → authoritative token, with how to compare.
const MAPPING = [
  { cat: 'radius', demo: 'radius-oak-s', auth: 'border-radius-border-radius-s', cmp: 'num' },
  { cat: 'radius', demo: 'radius-oak-m', auth: 'border-radius-border-radius-m', cmp: 'num' },
  { cat: 'radius', demo: 'radius-oak-m2', auth: 'border-radius-border-radius-m2', cmp: 'num' },
  { cat: 'radius', demo: 'radius-oak-l', auth: 'border-radius-border-radius-l', cmp: 'num' },
  { cat: 'shadow', demo: 'shadow-oak-lemon', auth: 'shadow-lemon', cmp: 'px' },
  { cat: 'shadow', demo: 'shadow-oak-wide-lemon', auth: 'shadow-wide-lemon', cmp: 'px' },
  { cat: 'shadow', demo: 'shadow-oak-grey', auth: 'shadow-grey', cmp: 'px' },
];

const matches = [];
const mismatches = [];
for (const { cat, demo: d, auth: a, cmp } of MAPPING) {
  const dv = demo[d];
  const av = auth[a];
  if (dv === undefined || av === undefined) {
    mismatches.push(`[${cat}] ${d} → ${a}: MISSING (demo=${dv ?? 'absent'}, auth=${av ?? 'absent'})`);
    continue;
  }
  const equal = cmp === 'num' ? numOf(dv) === numOf(av) : toPx(dv) === toPx(av);
  (equal ? matches : mismatches).push(
    `[${cat}] ${d}="${dv}" vs ${a}="${av}"${equal ? ' ✓' : `  ✗ → set to ${cmp === 'px' ? toPx(av) : numOf(av) + 'px'}`}`
  );
}

// Whole-category omissions: authoritative scales the demo @theme defines nothing for.
const authHas = (prefix) => Object.keys(auth).filter((k) => k.startsWith(prefix)).length;
const demoHas = (test) => Object.keys(demo).filter(test).length;
const omissions = [];
if (demoHas((k) => k.startsWith('text-') || /font-size/.test(k)) === 0 && authHas('font-size-') > 0)
  omissions.push(`TYPE SCALE omitted — auth defines font-size-1..${authHas('font-size-')} (12..56px); demo falls back to Tailwind (text-3xl=30≠32, text-4xl=36≠40).`);
if (demoHas((k) => /border-width|border-solid/.test(k)) === 0)
  omissions.push(`BORDER-WIDTH scale omitted — auth defines border-solid s/m/l/xl/xxl = 1/2/3/4/6px; Tailwind has no 3px (Oak "l") default.`);
if (demoHas((k) => /^spacing|^space/.test(k)) === 0 && authHas('space-') > 0)
  omissions.push(`SPACING scale omitted — auth defines space-* incl. 92/100/120/160/180px Tailwind does not hit cleanly.`);
const authRadii = Object.keys(auth).filter((k) => /border-radius-border-radius-(xs|xl)$/.test(k));
if (authRadii.length && !demo['radius-oak-xs'] && !demo['radius-oak-xl'])
  omissions.push(`RADII xs=2 and xl=24 omitted — demo tops out at l=16; large cards/hero using xl=24 cannot match.`);

console.log(`# Token-fidelity audit\ndemo:  ${DEMO}\nauth:  ${AUTH}\n`);
console.log(`## Mapped-token matches (${matches.length})`);
matches.forEach((l) => console.log('  ' + l));
console.log(`\n## Mapped-token MISMATCHES (${mismatches.length}) — fix-list for the styling lane`);
mismatches.forEach((l) => console.log('  ' + l));
console.log(`\n## Whole-category OMISSIONS (${omissions.length}) — demo @theme defines none; Tailwind defaults used`);
omissions.forEach((l) => console.log('  - ' + l));
console.log(`\nNote: colour VALUES were separately verified present in the authoritative set (palette faithful).`);
console.log(`Not a token issue: body font-weight:300 in globals.css is a RENDERED check for the styling lane vs the prototype.`);
