/*
 * The fidelity review orchestrator: one command that serves the canonical
 * export over the studio overlay, ensures the dev server, captures both
 * sides at matched geometry, perceptually diffs every eligible pair, and
 * writes the review surface — demo-evidence/fidelity-report/index.html +
 * results.json — with the disposition register rendered beside each pair.
 *
 * EXIT SEMANTICS: diff magnitude NEVER affects the exit code (the diff is
 * triage; acceptance stays human judgment). Non-zero means a mechanical
 * failure only: capture arm failed, register invalid, server never ready,
 * teardown failed.
 *
 * USAGE:
 *   pnpm --filter @oaknational/oak-design-showcase tool:fidelity
 *   pnpm --filter @oaknational/oak-design-showcase tool:fidelity -- --report-only
 *   flags: --base <url> --width <px> --report-only --keep-server
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ok, err, type Result } from '@oaknational/result';

import { resolveBase, resolveWidth } from './capture-checks';
import { assertServerUp, captureLivePages } from './capture-live-pages';
import { ensureDevServer, type DevServerHandle } from './dev-server';
import { FIDELITY_PAIRS } from './fidelity-pairs';
import { parseRegister, type FidelityRegister } from './fidelity-register';
import { renderReportHtml, type PairResult, type RunMeta } from './fidelity-report';
import { diffPngs } from './image-diff';
import { renderExportTargets } from './render-export-targets';
import { describeThrown, runTool } from './support';

const TOOLS_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEMO_DIR = path.resolve(TOOLS_DIR, '..');
const REPORT_DIR = path.join(DEMO_DIR, 'demo-evidence', 'fidelity-report');
const REGISTER_PATH = path.join(DEMO_DIR, 'fidelity-register.json');

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

/** Diff one eligible pair and write its diff PNG into the report dir. */
function diffPair(pair: (typeof FIDELITY_PAIRS.pairs)[number]): PairResult {
  const exportPath = path.resolve(DEMO_DIR, pair.exportPng);
  const livePath = path.resolve(DEMO_DIR, pair.livePng);
  const missing = [pair.exportPng, pair.livePng].filter(
    (candidate) => !fs.existsSync(path.resolve(DEMO_DIR, candidate)),
  );
  if (missing.length > 0) {
    return { pair, status: 'missing-evidence', missing };
  }
  if (!pair.diffEligible) {
    return { pair, status: 'reference-only' };
  }
  const outcome = diffPngs(fs.readFileSync(exportPath), fs.readFileSync(livePath));
  if (!outcome.ok) {
    return { pair, status: 'missing-evidence', missing: [outcome.error] };
  }
  const diffPngName = `diff-${pair.id}.png`;
  fs.writeFileSync(path.join(REPORT_DIR, diffPngName), outcome.value.diffPng);
  const { changedRatio, exportDims, liveDims, croppedTo, caveats } = outcome.value;
  return {
    pair,
    status: 'diffed',
    diff: { changedRatio, diffPngName, exportDims, liveDims, croppedTo, caveats },
  };
}

function loadRegister(): Result<FidelityRegister, string> {
  if (!fs.existsSync(REGISTER_PATH)) {
    return err(`fidelity: register not found at ${REGISTER_PATH}`);
  }
  return parseRegister(fs.readFileSync(REGISTER_PATH, 'utf8'));
}

function summariseToStdout(results: readonly PairResult[], register: FidelityRegister): void {
  for (const result of results) {
    const ratio =
      result.diff === undefined ? result.status : `${(result.diff.changedRatio * 100).toFixed(2)}%`;
    const judged = register.entries.some((entry) => entry.pairId === result.pair.id);
    process.stdout.write(
      `PAIR ${result.pair.id}: ${ratio} disposition=${judged ? 'recorded' : 'UNREGISTERED'}\n`,
    );
  }
}

function writeReport(
  results: readonly PairResult[],
  register: FidelityRegister,
  meta: RunMeta,
): void {
  fs.writeFileSync(
    path.join(REPORT_DIR, 'results.json'),
    JSON.stringify({ meta, results }, null, 2),
  );
  fs.writeFileSync(path.join(REPORT_DIR, 'index.html'), renderReportHtml(results, register, meta));
  process.stdout.write(`report -> ${path.relative(process.cwd(), REPORT_DIR)}/index.html\n`);
}

interface Flags {
  readonly base: string;
  readonly width: number;
  readonly reportOnly: boolean;
  readonly keepServer: boolean;
}

function parseFlags(): Result<Flags, string> {
  const argv = process.argv.slice(2);
  const width = resolveWidth(argv, process.env);
  if (!width.ok) {
    return err(width.error.message);
  }
  return ok({
    base: resolveBase(argv, process.env),
    width: width.value,
    reportOnly: argv.includes('--report-only'),
    keepServer: argv.includes('--keep-server'),
  });
}

/** Diff every pair against the register and write the report + results. */
function buildAndWriteReport(
  flags: Flags,
  serverMode: RunMeta['serverMode'],
): Result<void, string> {
  const register = loadRegister();
  if (!register.ok) {
    return register;
  }
  const results = FIDELITY_PAIRS.pairs.map((pair) => diffPair(pair));
  summariseToStdout(results, register.value);
  writeReport(results, register.value, {
    base: flags.base,
    widthCssPx: flags.width,
    deviceScaleFactor: 2,
    serverMode,
    generatedAt: new Date().toISOString(),
  });
  return ok(undefined);
}

/** Capture both sides, then report; tear down a spawned server on every path. */
async function captureAndReport(
  flags: Flags,
  server: DevServerHandle,
): Promise<Result<void, string>> {
  const captured = await capturePhase(flags.base, flags.width);
  const reported = captured.ok ? buildAndWriteReport(flags, server.mode) : captured;
  if (server.mode === 'spawned' && !flags.keepServer) {
    const stopped = await server.stop();
    if (!stopped.ok) {
      return err(reported.ok ? stopped.error : `${reported.error}; then ${stopped.error}`);
    }
  }
  return reported;
}

async function main(): Promise<Result<void, string>> {
  const flags = parseFlags();
  if (!flags.ok) {
    return flags;
  }
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  if (flags.value.reportOnly) {
    return buildAndWriteReport(flags.value, 'attached');
  }

  const server = await ensureDevServer(flags.value.base);
  if (!server.ok) {
    return server;
  }
  const up = await assertServerUp(flags.value.base);
  if (!up.ok) {
    return err(`fidelity: ${describeThrown(up.error)}`);
  }
  return captureAndReport(flags.value, server.value);
}

const invokedPath = process.argv.at(1);
if (invokedPath !== undefined && path.resolve(invokedPath) === fileURLToPath(import.meta.url)) {
  await runTool(main, (error) => `FIDELITY FAIL: ${describeThrown(error)}`);
}
