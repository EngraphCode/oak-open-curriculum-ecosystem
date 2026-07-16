/**
 * CLI: read a committed META stage result checkpoint and write the final fix-ledger.
 *
 * @remarks
 * Reads the meta stage's own `MetaResult` checkpoint JSON (re-validated with
 * `parseMetaResult` — the Node-side boundary re-parses everything it reads back), then
 * writes `fix-ledger.v1.json` + `fix-ledger.v1.md` via `render-ledger.ts`.
 *
 * Usage (relative flag paths resolve against the repository root; both paths must stay
 * inside the repository — traversal and symlink escapes refuse, per tssecurity:S8707):
 *
 * ```bash
 * pnpm restatement-audit-render-ledger --meta-result <meta.result.json> --out-dir <dir>
 * ```
 *
 * @packageDocumentation
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

import {
  resolveReadPathWithinRepo,
  resolveWriteTargetWithinRepo,
} from '../core/flag-path-resolve.js';
import { resolveRepoRoot } from '../core/repo-root.js';
import { renderLedgerJson, renderLedgerMarkdown } from './render-ledger.js';
import { parseMetaResult } from './workflows/stage-io.js';

const { values } = parseArgs({
  options: {
    'meta-result': { type: 'string' },
    'out-dir': { type: 'string' },
  },
});

const metaResultPath = values['meta-result'];
const outDirFlag = values['out-dir'];
if (metaResultPath === undefined || outDirFlag === undefined) {
  process.stderr.write('Usage: --meta-result <meta.result.json> --out-dir <dir>\n');
  process.exitCode = 1;
} else {
  const repoRoot = resolveRepoRoot(import.meta.url);
  const safeMetaResult = resolveReadPathWithinRepo(repoRoot, metaResultPath);
  const safeOutDir = resolveWriteTargetWithinRepo(repoRoot, outDirFlag);
  if (!safeMetaResult.ok) {
    process.stderr.write(`${safeMetaResult.error.message}\n`);
    process.exitCode = 1;
  } else if (!safeOutDir.ok) {
    process.stderr.write(`${safeOutDir.error.message}\n`);
    process.exitCode = 1;
  } else {
    const raw: unknown = JSON.parse(await readFile(safeMetaResult.value, 'utf8'));
    const parsed = parseMetaResult(raw);
    if (!parsed.ok) {
      process.stderr.write(`${parsed.error.message}\n`);
      process.exitCode = 1;
    } else if (!parsed.value.ok) {
      process.stderr.write(`meta stage did not succeed: ${parsed.value.error}\n`);
      process.exitCode = 1;
    } else {
      await mkdir(safeOutDir.value, { recursive: true });
      const jsonPath = path.join(safeOutDir.value, 'fix-ledger.v1.json');
      const mdPath = path.join(safeOutDir.value, 'fix-ledger.v1.md');
      await writeFile(jsonPath, renderLedgerJson(parsed.value.rows), 'utf8');
      await writeFile(mdPath, renderLedgerMarkdown(parsed.value.rows), 'utf8');
      process.stdout.write(
        `wrote ${jsonPath} and ${mdPath} (${parsed.value.rows.length} row(s))\n`,
      );
    }
  }
}
