/**
 * Script grader for eval case (b) — theme correctness against DDR-003/004.
 *
 *   pnpm exec tsx <this file> <page-or-component-file> [...]
 *
 * Three assertions, all decidable from the artefact text:
 *
 *   - five selections offered (light, dark, system, high-contrast,
 *     colour-safe) — DDR-004 makes a subset control non-conformant;
 *   - the four palette themes are the only `data-theme` values written —
 *     an implementation minting `data-theme="system"` FAILS, because
 *     `system` resolves and carries no token tree (DDR-003/004);
 *   - the applied value never round-trips into state: no read of the
 *     applied `data-theme` attribute back into stored/selected state
 *     (DDR-003).
 *
 * Exits non-zero if any assertion fails.
 */
import { readFileSync } from 'node:fs';

const PALETTE_THEMES = ['light', 'dark', 'high-contrast', 'colour-safe'] as const;
const SELECTIONS = [...PALETTE_THEMES, 'system'] as const;

/** Every literal written as a `data-theme` value anywhere in the artefact. */
function writtenThemeValues(text: string): ReadonlySet<string> {
  const found = new Set<string>();
  for (const match of text.matchAll(/data-theme\s*=\s*["']([a-z-]+)["']/g)) {
    found.add(match[1]);
  }
  for (const match of text.matchAll(
    /(?:setAttribute|dataset\.theme\s*=)\s*\(?\s*['"]data-theme['"]\s*,\s*['"]([a-z-]+)['"]/g,
  )) {
    found.add(match[1]);
  }
  return found;
}

/** Reads of the applied attribute — the DDR-003 conflation shape. */
function appliedValueReads(text: string): readonly string[] {
  const patterns = [
    /getAttribute\s*\(\s*['"]data-theme['"]\s*\)/g,
    /dataset\.theme(?!\s*=)/g,
    /matchMedia\([^)]*prefers-color-scheme[^)]*\)[\s\S]{0,120}?(?:setState|store|persist|save)/gi,
  ];
  const hits: string[] = [];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      hits.push(match[0].replace(/\s+/g, ' ').slice(0, 80));
    }
  }
  return hits;
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('usage: grade-theming.ts <file> [<file> ...]');
  process.exit(2);
}

let anyFailed = false;
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const lower = text.toLowerCase();
  const missingSelections = SELECTIONS.filter((theme) => !lower.includes(theme));
  const written = writtenThemeValues(text);
  const illegalWritten = [...written].filter(
    (value) => !PALETTE_THEMES.includes(value as (typeof PALETTE_THEMES)[number]),
  );
  const reads = appliedValueReads(text);

  const grade = {
    artefact: file,
    assertions: {
      'five-selections-offered': {
        pass: missingSelections.length === 0,
        evidence:
          missingSelections.length === 0
            ? 'all five selections named'
            : `missing: ${missingSelections.join(', ')} (DDR-004: a subset control is non-conformant)`,
      },
      'only-palette-themes-carry-trees': {
        pass: illegalWritten.length === 0,
        evidence:
          illegalWritten.length === 0
            ? `data-theme values written: ${[...written].join(', ') || 'none'}`
            : `mints a token tree for a non-palette value: ${illegalWritten.join(', ')} (DDR-004: system resolves, it has no tree)`,
      },
      'applied-value-never-round-trips': {
        pass: reads.length === 0,
        evidence:
          reads.length === 0
            ? 'no read of the applied attribute back into state'
            : `${reads.length} applied-value read(s): ${reads.slice(0, 3).join(' | ')} (DDR-003)`,
      },
    },
  };
  if (Object.values(grade.assertions).some((assertion) => !assertion.pass)) {
    anyFailed = true;
  }
  console.log(JSON.stringify(grade, null, 2));
}
process.exit(anyFailed ? 1 : 0);
