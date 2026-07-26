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
import { buildMcpConformanceNodeIo } from '../mcp-conformance/node-io.js';
import { runMcpConformance } from '../mcp-conformance/report.js';
import { UNATTENDED_SUITES } from '../mcp-conformance/runner.js';
import {
  conformanceSuiteSchema,
  type ConformanceMode,
  type ConformanceSuite,
} from '../mcp-conformance/types.js';

const HELP_TEXT = `Usage: agent-tools mcp-conformance --target <url> [options]

Runs MCPJam conformance suites (lockfile-installed @mcpjam/cli) against a
deployed MCP surface and verdicts them BY NAME against committed baselines:
pass requires zero unexpected failures AND the observed skip/fail sets
exactly matching the baseline. Raw json-summary reports are retained
verbatim before parsing.

Options:
  --target <url>             MCP server URL (required), e.g. https://<host>/mcp
  --unattended               Headless credential-free plan (protocol + oauth DCR
                             discovery legs); forbids --credentials-file
  --suite <name>             protocol | apps | oauth (repeatable; default: the
                             mode's full plan)
  --credentials-file <path>  OAuth credentials file for authed suites
  --report-dir <path>        Raw-report dir, absolute or repo-root-relative
                             (default tmp/mcp-conformance/<utc-stamp>)
  --baseline-dir <path>      Baseline dir (default: the committed baselines)
  -h, --help                 Show this help
`;

interface CliState {
  help: boolean;
  unattended: boolean;
  target: string | undefined;
  suites: ConformanceSuite[];
  credentialsFile: string | undefined;
  reportDir: string | undefined;
  baselineDir: string | undefined;
  suiteError: string | undefined;
}

const INITIAL_STATE: CliState = {
  help: false,
  unattended: false,
  target: undefined,
  suites: [],
  credentialsFile: undefined,
  reportDir: undefined,
  baselineDir: undefined,
  suiteError: undefined,
};

function scanCliArgs(
  argv: readonly string[],
):
  { readonly ok: true; readonly state: CliState } | { readonly ok: false; readonly error: string } {
  return scanArgs<CliState>(
    argv,
    { ...INITIAL_STATE, suites: [] },
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
            state.suiteError = `unknown suite "${value}" (expected protocol | apps | oauth)`;
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
  if (state.suiteError !== undefined) {
    return `${state.suiteError}\n${HELP_TEXT}`;
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
    mode,
    suites,
    baselines: loadBaselines({
      reader: baselineReaderFor(resolve(repoRoot, baselineDir)),
      suites,
      mode,
    }),
    ...(state.credentialsFile === undefined ? {} : { credentialsFile: state.credentialsFile }),
  });
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
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
