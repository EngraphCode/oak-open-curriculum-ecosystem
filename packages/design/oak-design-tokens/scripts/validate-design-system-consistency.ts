/**
 * Repo validator: the design system's dtcg export must be value-consistent
 * with its canonical CSS (`colors_and_type.css` + `components.css`'s `:root` block).
 *
 * @remarks
 * Chained into root `repo-validators:check`. Semantic regeneration
 * comparison over live surfaces via `compareDesignSystemConsistency`;
 * the unit tests own the comparison semantics, this script owns the
 * live-data proof (each proof happens once). Exit 1 on any mismatch or
 * comparison error.
 */
import { readFileSync } from 'node:fs';

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { DtcgTokenTree } from '@oaknational/design-tokens-core';
import { compareDesignSystemConsistency } from '../src/design-system-consistency.js';

function writeLine(message: string): void {
  process.stdout.write(`${message}\n`);
}

function writeErrorLine(message: string): void {
  process.stderr.write(`${message}\n`);
}

const designSystemRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'oak-design-system',
);

function readTree(fileName: string): DtcgTokenTree {
  const parseTree: (json: string) => DtcgTokenTree = JSON.parse;
  return parseTree(readFileSync(join(designSystemRoot, 'dtcg', fileName), 'utf8'));
}

/**
 * CSS variables that deliberately carry no dtcg counterpart. Every entry
 * needs a reason; an empty diff against this list is the pass condition
 * for reverse coverage.
 */
const NON_TOKEN_ALLOWLIST: readonly string[] = [
  // Grid-row plumbing in components.css's :root — layout mechanics, not a
  // design decision; the one CSS variable with no dtcg counterpart
  // (verified: the Stage-A report Part 2 §2.1 reverse-coverage finding).
  '--canvas-rows',
];

// The canonical token CSS spans two files: colors_and_type.css (palette,
// primitives, semantic) and components.css (the component tier's :root
// block). brand.css is the consumer-override exemplar, not token source.
const canonicalCss = [
  readFileSync(join(designSystemRoot, 'colors_and_type.css'), 'utf8'),
  readFileSync(join(designSystemRoot, 'components.css'), 'utf8'),
].join('\n');

const result = compareDesignSystemConsistency({
  css: canonicalCss,
  palette: readTree('palette.json'),
  primitives: readTree('primitives.json'),
  component: readTree('component.json'),
  semanticLight: readTree('semantic.light.json'),
  semanticDark: readTree('semantic.dark.json'),
  nonTokenAllowlist: NON_TOKEN_ALLOWLIST,
});

if (!result.ok) {
  writeErrorLine(`design-system consistency: comparison failed — ${JSON.stringify(result.error)}`);
  process.exitCode = 1;
} else if (result.value.mismatches.length > 0) {
  writeErrorLine(
    `design-system consistency: ${String(result.value.mismatches.length)} mismatch(es) across ${String(result.value.comparedCount)} compared values:`,
  );

  for (const mismatch of result.value.mismatches) {
    writeErrorLine(`  ${JSON.stringify(mismatch)}`);
  }

  process.exitCode = 1;
} else {
  writeLine(
    `design-system consistency: OK — ${String(result.value.comparedCount)} values compared, dtcg and CSS agree.`,
  );
}
