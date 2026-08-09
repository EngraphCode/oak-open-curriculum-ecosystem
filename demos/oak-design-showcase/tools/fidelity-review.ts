/*
 * The fidelity review CLI: one command that serves the canonical export
 * over the studio overlay, ensures the dev server, captures both sides
 * at matched geometry, perceptually diffs every eligible pair, and
 * writes the review surface — demo-evidence/fidelity-report/index.html
 * + results.json — with the disposition register rendered beside each
 * pair. The run skeleton (flags, diff loop, report assembly, the
 * teardown bracket) is @oaknational/fidelity-review/orchestrator; this
 * file keeps only the showcase's composition root: paths, capture
 * arms, and a main that attaches to custom bases.
 *
 * EXIT SEMANTICS: diff magnitude NEVER affects the exit code (the diff
 * is triage; acceptance stays human judgment). Non-zero means a
 * mechanical failure only — see the orchestrator module header.
 *
 * USAGE:
 *   pnpm --filter @oaknational/oak-design-showcase tool:fidelity
 *   pnpm --filter @oaknational/oak-design-showcase tool:fidelity -- --report-only
 *   flags: --base <url> --width <px> --report-only --keep-server
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { assertServerUp, ensureDevServer } from '@oaknational/fidelity-review/dev-server';
import {
  buildAndWriteReport,
  captureAndReport,
  nodeEvidenceIo,
  reportDirFor,
  resolveRunFlags,
  type CaptureRun,
  type RunFlags,
  type ServerMode,
} from '@oaknational/fidelity-review/orchestrator';
import { describeThrown, runTool } from '@oaknational/fidelity-review/support';
import { ok, err, type Result } from '@oaknational/result';

import { DEFAULT_BASE, SERVER_HINT } from './capture-checks';
import { captureLivePages } from './capture-live-pages';
import { FIDELITY_PAIRS } from './fidelity-pairs';
import { renderExportTargets } from './render-export-targets';

const TOOLS_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEMO_DIR = path.resolve(TOOLS_DIR, '..');

/** Run both capture arms; any arm failure is mechanical and fails the run. */
async function capturePhase(base: string, width: number): Promise<Result<void, string>> {
  const render = await renderExportTargets(width);
  if (!render.ok) {
    return render;
  }
  const suspect = await captureLivePages(base, width, FIDELITY_PAIRS.pairs);
  if (suspect) {
    return err('fidelity: a live page capture looked blank — investigate before trusting diffs');
  }
  return ok(undefined);
}

function report(flags: RunFlags, serverMode: ServerMode): Result<void, string> {
  return buildAndWriteReport(
    flags,
    serverMode,
    new Date().toISOString(),
    { map: FIDELITY_PAIRS, demoDir: DEMO_DIR },
    nodeEvidenceIo(DEMO_DIR),
  );
}

async function main(): Promise<Result<void, string>> {
  const flags = resolveRunFlags(process.argv.slice(2), process.env, DEFAULT_BASE);
  if (!flags.ok) {
    return flags;
  }
  fs.mkdirSync(reportDirFor(DEMO_DIR), { recursive: true });

  if (flags.value.reportOnly) {
    return report(flags.value, 'report-only');
  }

  const run: CaptureRun = {
    assertServerUp: (base) => assertServerUp(base, SERVER_HINT),
    capturePhase,
    report: (serverMode) => report(flags.value, serverMode),
  };

  // A custom --base is never spawned: the workspace dev script binds the
  // default port, so spawning for any other base would wait the full
  // ready deadline on a port nothing will answer. Custom bases attach to
  // a pre-started server or fail loud.
  if (flags.value.base !== DEFAULT_BASE) {
    return captureAndReport(flags.value, { mode: 'attached' }, run);
  }

  const server = await ensureDevServer(flags.value.base, DEMO_DIR);
  if (!server.ok) {
    return server;
  }
  return captureAndReport(flags.value, server.value, run);
}

const invokedPath = process.argv.at(1);
if (invokedPath !== undefined && path.resolve(invokedPath) === fileURLToPath(import.meta.url)) {
  await runTool(main, (error) => `FIDELITY FAIL: ${describeThrown(error)}`);
}
