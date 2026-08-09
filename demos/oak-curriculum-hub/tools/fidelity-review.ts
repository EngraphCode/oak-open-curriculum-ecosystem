/*
 * The fidelity review CLI: one command that serves the canonical
 * export, ensures the dev server, captures both sides at matched
 * geometry, perceptually diffs every eligible pair, and writes the
 * review surface — demo-evidence/fidelity-report/index.html +
 * results.json — with the disposition register rendered beside each
 * pair. The run skeleton (flags, diff loop, report assembly, the
 * teardown bracket) is @oaknational/fidelity-review/orchestrator; this
 * file keeps only the hub's composition root: paths, its four capture
 * arms, and a main that always ensures its own server.
 *
 * EXIT SEMANTICS: diff magnitude NEVER affects the exit code (the diff
 * is triage; section-D acceptance stays human judgment). Non-zero
 * means a mechanical failure only — see the orchestrator module
 * header. Corrupt evidence (a PNG that exists but cannot decode) fails
 * the run mechanically since the orchestrator consolidation; it was
 * previously mis-rendered as a missing-evidence row whose `missing`
 * list carried a decode error where the report promises paths.
 *
 * USAGE:
 *   pnpm --filter @oaknational/oak-curriculum-hub tool:fidelity
 *   pnpm --filter @oaknational/oak-curriculum-hub tool:fidelity -- --report-only
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
  reportDirFor,
  resolveRunFlags,
  type CaptureRun,
  type RunFlags,
  type ServerMode,
} from '@oaknational/fidelity-review/orchestrator';
import { describeThrown, runTool } from '@oaknational/fidelity-review/support';
import { ok, err, type Result } from '@oaknational/result';

import { DEFAULT_BASE, SERVER_HINT } from './capture-checks';
import { runCaptures } from './capture-live-demo';
import { captureLiveSections } from './capture-live-sections';
import { driveExportSections } from './drive-export-sections';
import { FIDELITY_PAIRS } from './fidelity-pairs';
import { renderCanonicalTargets } from './render-canonical-targets';

const TOOLS_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEMO_DIR = path.resolve(TOOLS_DIR, '..');
const EXPORT_SECTIONS_OUT = path.join(DEMO_DIR, 'demo-evidence', 'export-sections');

/** The page routes the live capture arm must shoot: every non-section pair's
 *  route (section pairs are captured per-element by their own arm). */
function pageRoutes(): readonly string[] {
  const routes = FIDELITY_PAIRS.pairs
    .filter((pair) => pair.kind !== 'section-element')
    .map((pair) => pair.liveRoute);
  return [...new Set(routes)];
}

/** Run all four capture arms; any arm failure is mechanical and fails the run. */
async function capturePhase(base: string, width: number): Promise<Result<void, string>> {
  const render = await renderCanonicalTargets(width);
  if (!render.ok) {
    return render;
  }
  const sections = await driveExportSections(EXPORT_SECTIONS_OUT);
  if (!sections.ok) {
    return err(sections.error);
  }
  if (sections.value > 0) {
    return err(`fidelity: ${sections.value} export-section capture(s) failed`);
  }
  const live = await runCaptures(base, width, pageRoutes());
  if (live) {
    return err('fidelity: a live page capture looked blank — investigate before trusting diffs');
  }
  const liveSections = await captureLiveSections(base);
  if (!liveSections.ok) {
    return err(liveSections.error);
  }
  if (liveSections.value > 0) {
    return err(`fidelity: ${liveSections.value} live-section capture(s) failed`);
  }
  return ok(undefined);
}

function report(flags: RunFlags, serverMode: ServerMode): Result<void, string> {
  return buildAndWriteReport(flags, serverMode, new Date().toISOString(), {
    map: FIDELITY_PAIRS,
    demoDir: DEMO_DIR,
  });
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
