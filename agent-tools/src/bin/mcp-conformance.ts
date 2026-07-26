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
import { HELP_TEXT } from './mcp-conformance-help.js';
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
  return emitReport(repoRoot, reportDir, report, exitCode);
}

// Emit to stdout AND <report-dir>/summary.json. A failed summary write
// fails the run — a silently-missing documented output is a false green.
function emitReport(
  repoRoot: string,
  reportDir: string,
  report: ConformanceRunReport,
  exitCode: 0 | 1,
): 0 | 1 {
  const reportJson = `${JSON.stringify(report, null, 2)}\n`;
  const summary = writeRunSummary(repoRoot, reportDir, reportJson);
  process.stdout.write(reportJson);
  if (!summary.ok) {
    process.stderr.write(`summary.json could not be written: ${summary.error}\n`);
    return 1;
  }
  return exitCode;
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
