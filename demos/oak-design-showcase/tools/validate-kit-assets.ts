/**
 * Gating validator for the tracked kit-asset copies (wired into the root
 * `repo-validators:check` chain, so CI runs it uncached on every pass).
 * Three obligations, each loud:
 *
 * 1. PARITY — every copy is byte-identical to its kit source (the copy is
 *    a serving constraint, never a fork; the workspace package stays the
 *    single source).
 * 2. COMPLETENESS — recomputed, not recorded: closureFailures (pure,
 *    unit-tested in kit-asset-parity) re-walks each copied sheet's local
 *    references against the manifest.
 * 3. NON-VACUITY — an empty manifest or unreadable file is a failure,
 *    never a silent pass.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { closureFailures, SHOWCASE_KIT_ASSETS } from './kit-asset-parity';
import type { KitAssetPair } from './kit-asset-parity';

const workspaceRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const kitRoot = dirname(
  createRequire(import.meta.url).resolve('@oaknational/oak-design-system/styles.css'),
);

const copyPaths = new Set(SHOWCASE_KIT_ASSETS.map((pair) => pair.copy));

function pairFailures(pair: KitAssetPair): readonly string[] {
  let source: Buffer;
  let copy: Buffer;
  try {
    source = readFileSync(join(kitRoot, pair.source));
    copy = readFileSync(join(workspaceRoot, pair.copy));
  } catch (error) {
    return [`${pair.copy}: unreadable pair (${String(error)})`];
  }
  const parity = source.equals(copy)
    ? []
    : [
        `${pair.copy}: drifted from ${pair.source} — re-copy the kit file (the package is the single source)`,
      ];
  return [...parity, ...closureFailures(pair.copy, copy.toString('utf8'), copyPaths)];
}

const failures: readonly string[] =
  SHOWCASE_KIT_ASSETS.length === 0
    ? ['the kit-asset manifest is empty — nothing validated']
    : SHOWCASE_KIT_ASSETS.flatMap((pair) => pairFailures(pair));

if (failures.length > 0) {
  for (const failure of failures) {
    process.stderr.write(`validate-kit-assets: ${failure}\n`);
  }
  process.exitCode = 1;
} else {
  process.stdout.write(
    `validate-kit-assets: ${String(SHOWCASE_KIT_ASSETS.length)} copies byte-identical, closure complete\n`,
  );
}
