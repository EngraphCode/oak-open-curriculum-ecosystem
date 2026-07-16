/**
 * CLI: read a committed META stage result checkpoint and write the final fix-ledger.
 *
 * @remarks
 * Reads the meta stage's own `MetaResult` checkpoint JSON (re-validated with
 * `parseMetaResult` — the Node-side boundary re-parses everything it reads back), then
 * writes `fix-ledger.v1.json` + `fix-ledger.v1.md` via `render-ledger.ts`.
 *
 * Usage (cwd = the agent-tools workspace):
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

import { renderLedgerJson, renderLedgerMarkdown } from './render-ledger.js';
import { parseMetaResult } from './workflows/stage-io.js';

const { values } = parseArgs({
  options: {
    'meta-result': { type: 'string' },
    'out-dir': { type: 'string' },
  },
});

const metaResultPath = values['meta-result'];
const outDir = values['out-dir'];
if (metaResultPath === undefined || outDir === undefined) {
  process.stderr.write('Usage: --meta-result <meta.result.json> --out-dir <dir>\n');
  process.exitCode = 1;
} else {
  const raw: unknown = JSON.parse(await readFile(metaResultPath, 'utf8'));
  const parsed = parseMetaResult(raw);
  if (!parsed.ok) {
    process.stderr.write(`${parsed.error.message}\n`);
    process.exitCode = 1;
  } else if (!parsed.value.ok) {
    process.stderr.write(`meta stage did not succeed: ${parsed.value.error}\n`);
    process.exitCode = 1;
  } else {
    await mkdir(outDir, { recursive: true });
    const jsonPath = path.join(outDir, 'fix-ledger.v1.json');
    const mdPath = path.join(outDir, 'fix-ledger.v1.md');
    await writeFile(jsonPath, renderLedgerJson(parsed.value.rows), 'utf8');
    await writeFile(mdPath, renderLedgerMarkdown(parsed.value.rows), 'utf8');
    process.stdout.write(`wrote ${jsonPath} and ${mdPath} (${parsed.value.rows.length} row(s))\n`);
  }
}
