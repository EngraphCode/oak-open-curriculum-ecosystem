#!/usr/bin/env node
/**
 * `agent-tools mcp-conformance` (MCP-189): MCPJam conformance suites against
 * a deployed MCP surface, with named verdicts against committed baselines.
 *
 * NAMING: distinct from `protocol-conformance` (the estate's
 * collaboration-protocol tier validator) — this command targets MCP servers.
 */
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { scanArgs } from '../core/cli-arg-parser.js';
import { resolveRepoRoot } from '../core/repo-root.js';
import { loadBaselines, type BaselineRead } from '../mcp-conformance/load-baselines.js';
import { buildMcpConformanceNodeIo, writeRunSummary } from '../mcp-conformance/node-io.js';
import { runMcpConformance } from '../mcp-conformance/report.js';
import { UNATTENDED_SUITES } from '../mcp-conformance/runner.js';
import {
  conformanceSuiteSchema,
  type ConformanceMode,
  type ConformanceOperation,
  type ConformanceRunReport,
  type ConformanceSuite,
} from '../mcp-conformance/types.js';

const HELP_TEXT = `Usage: pnpm -s mcp:conformance --target <url> [options]
(the -s keeps stdout pure JSON: without it, pnpm's own failure reporter
appends to stdout when a failing run exits 1)

Runs MCPJam conformance suites (lockfile-installed @mcpjam/cli) against a
deployed MCP surface. Two operations:

VERDICT (default): each suite is compared BY NAME against its committed
baseline — pass requires a usable baseline, retained raw evidence, no
duplicate check ids, zero unexpected failures, and the observed skip/fail
sets exactly matching the baseline. Baselines are validated UP FRONT: a
missing or unusable baseline fails the run immediately, with no network
contact, naming the --seed path.

SEED (--seed): capture-only. Runs the suites live, retains each raw
json-summary report verbatim (the observation seed for authoring
baselines), performs no comparison, and exits 0 iff every capture
succeeded. Without --unattended, the plan drives all three suites LIVE
against the target (the oauth leg is interactive), bounded at 120s/suite.

The wrapper's aggregate report goes to stdout AND <report-dir>/summary.json.

Options:
  --target <url>             MCP server URL (required), e.g. https://<host>/mcp
  --unattended               Headless credential-free plan (protocol + oauth DCR
                             discovery legs); forbids --credentials-file
  --seed                     Capture-only operation (no baseline verdicts)
  --suite <name>             protocol | apps | oauth (repeatable, no duplicates;
                             default: the mode's full plan)
  --credentials-file <path>  OAuth credentials file for authed suites
  --report-dir <path>        Raw-report dir, absolute or repo-root-relative
                             (default tmp/mcp-conformance/<utc-stamp>)
  --baseline-dir <path>      Baseline dir (default: the committed baselines)
  -h, --help                 Show this help
`;

interface CliState {
  help: boolean;
  unattended: boolean;
  seed: boolean;
  target: string | undefined;
  suites: ConformanceSuite[];
  credentialsFile: string | undefined;
  reportDir: string | undefined;
  baselineDir: string | undefined;
  suiteErrors: string[];
}

const INITIAL_STATE: CliState = {
  help: false,
  unattended: false,
  seed: false,
  target: undefined,
  suites: [],
  credentialsFile: undefined,
  reportDir: undefined,
  baselineDir: undefined,
  suiteErrors: [],
};

function scanCliArgs(
  argv: readonly string[],
):
  { readonly ok: true; readonly state: CliState } | { readonly ok: false; readonly error: string } {
  return scanArgs<CliState>(
    argv,
    { ...INITIAL_STATE, suites: [], suiteErrors: [] },
    {
      flags: {
        '--help': (state) => {
          state.help = true;
        },
        '-h': (state) => {
          state.help = true;
        },
        '--unattended': (state) => {
          state.unattended = true;
        },
        '--seed': (state) => {
          state.seed = true;
        },
      },
      valueOptions: {
        '--target': (state, value) => {
          state.target = value;
        },
        '--suite': (state, value) => {
          const parsed = conformanceSuiteSchema.safeParse(value);
          if (parsed.success) {
            state.suites.push(parsed.data);
          } else {
            state.suiteErrors.push(`unknown suite "${value}" (expected protocol | apps | oauth)`);
          }
        },
        '--credentials-file': (state, value) => {
          state.credentialsFile = value;
        },
        '--report-dir': (state, value) => {
          state.reportDir = value;
        },
        '--baseline-dir': (state, value) => {
          state.baselineDir = value;
        },
      },
      helpText: HELP_TEXT,
    },
  );
}

function validateCliState(state: CliState): string | undefined {
  if (state.suiteErrors.length > 0) {
    return `${state.suiteErrors.join('; ')}\n${HELP_TEXT}`;
  }
  const duplicates = [...new Set(state.suites.filter((s, i) => state.suites.indexOf(s) !== i))];
  if (duplicates.length > 0) {
    return `duplicate --suite value(s): ${duplicates.join(', ')} — each suite runs once and writes one <suite>.json raw report\n${HELP_TEXT}`;
  }
  if (state.target === undefined || state.target.trim() === '') {
    return `--target is required\n${HELP_TEXT}`;
  }
  if (state.unattended && state.credentialsFile !== undefined) {
    return `--unattended forbids --credentials-file (the unattended plan is credential-free by definition)\n${HELP_TEXT}`;
  }
  return undefined;
}

/**
 * Real baseline reader over one directory: ENOENT is the ABSENT state,
 * every other read error is preserved as the true cause.
 */
function baselineReaderFor(baselineDirAbsolute: string) {
  return (fileName: string): BaselineRead => {
    try {
      return { kind: 'ok', content: readFileSync(join(baselineDirAbsolute, fileName), 'utf8') };
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return { kind: 'absent' };
      }
      return { kind: 'error', message: error instanceof Error ? error.message : String(error) };
    }
  };
}

const DEFAULT_BASELINE_DIR = 'agent-tools/src/mcp-conformance/baselines';

function defaultReportDir(): string {
  const utcStamp = new Date()
    .toISOString()
    .replaceAll(':', '-')
    .replace(/\.\d+Z$/u, 'Z');
  return join('tmp', 'mcp-conformance', utcStamp);
}

function runFromCli(state: CliState, target: string): 0 | 1 {
  const operation: ConformanceOperation = state.seed ? 'seed' : 'verdict';
  const mode: ConformanceMode = state.unattended ? 'unattended' : 'attended';
  const defaultSuites: readonly ConformanceSuite[] = state.unattended
    ? UNATTENDED_SUITES
    : ['protocol', 'apps', 'oauth'];
  const suites = state.suites.length > 0 ? state.suites : defaultSuites;

  // projectDir is explicitly disabled, matching the protocol-conformance bin:
  // a worktree invocation must report on the tree it runs inside, never be
  // rebound to the primary checkout.
  const repoRoot = resolveRepoRoot(import.meta.url, { projectDir: undefined });
  const reportDir = state.reportDir ?? defaultReportDir();
  const baselineDir = state.baselineDir ?? DEFAULT_BASELINE_DIR;

  // `resolve` (not `join`): an absolute --baseline-dir stands as given, a
  // relative one resolves against the repo root.
  const { report, exitCode } = runMcpConformance(buildMcpConformanceNodeIo(repoRoot, reportDir), {
    target,
    operation,
    mode,
    suites,
    baselines: loadBaselines({
      reader: baselineReaderFor(resolve(repoRoot, baselineDir)),
      suites,
      mode,
    }),
    ...(state.credentialsFile === undefined ? {} : { credentialsFile: state.credentialsFile }),
  });
  emitReport(repoRoot, reportDir, report);
  return exitCode;
}

/** Emit the aggregate report to stdout AND `<report-dir>/summary.json`. */
function emitReport(repoRoot: string, reportDir: string, report: ConformanceRunReport): void {
  const reportJson = `${JSON.stringify(report, null, 2)}\n`;
  const summary = writeRunSummary(repoRoot, reportDir, reportJson);
  if (!summary.ok) {
    process.stderr.write(`summary.json could not be written: ${summary.error}\n`);
  }
  process.stdout.write(reportJson);
}

function main(): void {
  const scanned = scanCliArgs(process.argv.slice(2));
  if (!scanned.ok) {
    process.stderr.write(`${scanned.error}\n`);
    process.exitCode = 2;
    return;
  }
  if (scanned.state.help) {
    process.stdout.write(HELP_TEXT);
    return;
  }
  const validationError = validateCliState(scanned.state);
  if (validationError !== undefined || scanned.state.target === undefined) {
    const message = validationError ?? `--target is required\n${HELP_TEXT}`;
    process.stderr.write(`${message}\n`);
    process.exitCode = 2;
    return;
  }
  process.exitCode = runFromCli(scanned.state, scanned.state.target);
}

main();
