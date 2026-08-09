/*
 * App-neutral pieces of the fidelity-review runner. Each demo app keeps
 * its own tools/fidelity-review.ts CLI — flag parsing, capture arms, pair
 * map, and orchestration order are app policy — and composes these
 * helpers, which carry the invariant register-load / summarise / report-
 * write mechanics. Paths arrive as parameters: this module lives in a
 * shared package and never derives an app location from its own.
 */
import fs from 'node:fs';
import path from 'node:path';
// Explicit module import, never the ambient global (lib boundary rule):
// the summary lines and the cwd-relative report path are stdout UX.
import process from 'node:process';

import { err, type Result } from '@oaknational/result';

import { parseRegister, type FidelityRegister } from './fidelity-register';
import { renderReportHtml, type PairResult, type RunMeta } from './fidelity-report';
import type { PairingMap } from './pairing-types';

/** Load and strictly parse the disposition register at `registerPath`. */
export function loadRegister(registerPath: string): Result<FidelityRegister, string> {
  if (!fs.existsSync(registerPath)) {
    return err(`fidelity: register not found at ${registerPath}`);
  }
  return parseRegister(fs.readFileSync(registerPath, 'utf8'));
}

/** One line per pair: diff ratio (or status) and disposition state. */
export function summariseToStdout(
  results: readonly PairResult[],
  register: FidelityRegister,
): void {
  for (const result of results) {
    const ratio =
      result.diff === undefined ? result.status : `${(result.diff.changedRatio * 100).toFixed(2)}%`;
    const judged = register.entries.some((entry) => entry.pairId === result.pair.id);
    process.stdout.write(
      `PAIR ${result.pair.id}: ${ratio} disposition=${judged ? 'recorded' : 'UNREGISTERED'}\n`,
    );
  }
}

/** Write results.json and the rendered index.html into `reportDir`. */
export function writeReport(
  results: readonly PairResult[],
  register: FidelityRegister,
  meta: RunMeta,
  map: PairingMap,
  reportDir: string,
): void {
  fs.writeFileSync(
    path.join(reportDir, 'results.json'),
    JSON.stringify({ meta, results }, null, 2),
  );
  fs.writeFileSync(
    path.join(reportDir, 'index.html'),
    renderReportHtml(results, register, meta, map),
  );
  process.stdout.write(`report -> ${path.relative(process.cwd(), reportDir)}/index.html\n`);
}
