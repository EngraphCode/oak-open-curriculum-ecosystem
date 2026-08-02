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

import { closureFailures, KIT_ASSET_COPIES } from './kit-asset-parity';
import type { KitAssetPair } from './kit-asset-parity';

// The manifest's resolution anchor (this workspace's root) — not a
// containment boundary: manifest rows may traverse into a sibling demo.
const manifestRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const kitRoot = dirname(
  createRequire(import.meta.url).resolve('@oaknational/oak-design-system/styles.css'),
);

const copyPaths = new Set(KIT_ASSET_COPIES.map((pair) => pair.copy));

function pairFailures(pair: KitAssetPair): readonly string[] {
  // Failure messages print the resolved path: a manifest-relative `../…`
  // is ambiguous to a reader who doesn't know the anchor.
  const copyPath = join(manifestRoot, pair.copy);
  let source: Buffer;
  let copy: Buffer;
  try {
    source = readFileSync(join(kitRoot, pair.source));
    copy = readFileSync(copyPath);
  } catch (error) {
    return [`${copyPath}: unreadable pair (${String(error)})`];
  }
  const parity = source.equals(copy)
    ? []
    : [
        `${copyPath}: drifted from ${pair.source} — re-copy the kit file (the package is the single source)`,
      ];
  return [...parity, ...closureFailures(pair.copy, copy.toString('utf8'), copyPaths)];
}

const failures: readonly string[] =
  KIT_ASSET_COPIES.length === 0
    ? ['the kit-asset manifest is empty — nothing validated']
    : KIT_ASSET_COPIES.flatMap((pair) => pairFailures(pair));

if (failures.length > 0) {
  for (const failure of failures) {
    process.stderr.write(`validate-kit-assets: ${failure}\n`);
  }
  process.exitCode = 1;
} else {
  process.stdout.write(
    `validate-kit-assets: ${String(KIT_ASSET_COPIES.length)} copies byte-identical, closure complete\n`,
  );
}
