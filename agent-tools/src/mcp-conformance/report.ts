/**
 * Orchestration for `agent-tools mcp-conformance` (MCP-189): run each
 * requested suite through the spawn seam, retain the raw stdout VERBATIM
 * before any parsing (a schema rejection must never destroy the evidence),
 * parse at the strict boundary, compare against the committed baseline, and
 * aggregate `{ report, exitCode }`.
 *
 * Aggregation semantics: a failing, unlaunchable, or unparseable suite does
 * not abort the remaining suites — every requested suite runs, every outcome
 * is reported, and the aggregate exit code is 0 iff every suite verdict is
 * `pass`. Failure reasons name the suite and the retained raw file path so
 * triage starts from the verbatim artefact.
 */
import { err, isErr, ok, type Result } from '@oaknational/result';

import { parseWithSchema } from '../core/schema-parse.js';
import { compareRunToBaseline } from './baseline.js';
import { composeSuiteArgs, type McpjamRunner } from './runner.js';
import {
  mcpjamReportSchema,
  type Baseline,
  type ConformanceMode,
  type ConformanceRunReport,
  type ConformanceSuite,
  type McpjamReport,
  type SuiteOutcome,
} from './types.js';

/**
 * How a baseline arrived for one suite: loaded and valid, or present but
 * unusable (with the true cause — JSON syntax, schema rejection, or a
 * non-absent read error). An ABSENT baseline is the absence of an entry,
 * so "file missing" and "file broken" can never be conflated in outcomes.
 */
export type BaselineLoadOutcome =
  | { readonly kind: 'loaded'; readonly baseline: Baseline }
  | { readonly kind: 'invalid'; readonly reason: string };

/** Outcome of one raw-report retention attempt. */
export type RetentionOutcome =
  | { readonly ok: true; readonly reportedPath: string }
  | { readonly ok: false; readonly error: string };

/** IO seam for the orchestration: spawn + raw-report retention only. */
export interface McpConformanceIo {
  readonly runMcpjam: McpjamRunner;
  /**
   * Persist one suite's raw stdout verbatim. A retention failure is loud in
   * the outcome but does not abort the suite — the parse still proceeds
   * from the in-memory stdout so the operator sees both problems at once.
   */
  readonly retainRawReport: (suite: ConformanceSuite, content: string) => RetentionOutcome;
}

export interface McpConformanceRunInput {
  readonly target: string;
  readonly mode: ConformanceMode;
  readonly suites: readonly ConformanceSuite[];
  /** Per-suite baseline load outcomes; an absent entry means no baseline file. */
  readonly baselines: Readonly<Partial<Record<ConformanceSuite, BaselineLoadOutcome>>>;
  readonly credentialsFile?: string;
}

function failedOutcome(
  suite: ConformanceSuite,
  failureReason: string,
  detail?: { readonly rawReportPath?: string; readonly mcpjamExitCode?: number },
): SuiteOutcome {
  return {
    suite,
    verdict: 'fail',
    ...(detail?.rawReportPath === undefined ? {} : { rawReportPath: detail.rawReportPath }),
    ...(detail?.mcpjamExitCode === undefined ? {} : { mcpjamExitCode: detail.mcpjamExitCode }),
    failureReason,
    divergences: [],
  };
}

function parseRawReport(suite: ConformanceSuite, stdout: string): Result<McpjamReport, Error> {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(stdout);
  } catch (error) {
    // The syntax error is the operator-facing cause; the raw is already retained.
    return err(
      new Error(
        `mcpjam stdout for the "${suite}" suite was not JSON: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ),
    );
  }
  return parseWithSchema({
    label: `mcpjam json-summary report ("${suite}" suite)`,
    schema: mcpjamReportSchema,
    value: parsedJson,
  });
}

function comparedOutcome(input: {
  readonly suite: ConformanceSuite;
  readonly report: McpjamReport;
  readonly baseline: Baseline;
  readonly retention: RetentionOutcome;
  readonly mcpjamExitCode: number | undefined;
}): SuiteOutcome {
  const comparison = compareRunToBaseline(input.report, input.baseline);
  return {
    suite: input.suite,
    verdict: input.retention.ok ? comparison.verdict : 'fail',
    ...(input.retention.ok ? { rawReportPath: input.retention.reportedPath } : {}),
    ...(input.mcpjamExitCode === undefined ? {} : { mcpjamExitCode: input.mcpjamExitCode }),
    ...(input.retention.ok
      ? {}
      : { failureReason: `raw-report retention failed: ${input.retention.error}` }),
    divergences: comparison.divergences,
    ...(input.baseline.residual_masking === undefined
      ? {}
      : { baselineResidualMasking: input.baseline.residual_masking }),
  };
}

function resolveBaseline(
  input: McpConformanceRunInput,
  suite: ConformanceSuite,
): Result<Baseline, string> {
  const loadOutcome = input.baselines[suite];
  if (loadOutcome === undefined) {
    return err(
      `no ${input.mode} baseline is available for the "${suite}" suite — a run without a baseline has no verdict semantics`,
    );
  }
  if (loadOutcome.kind === 'invalid') {
    return err(
      `the ${input.mode} baseline for the "${suite}" suite is unusable: ${loadOutcome.reason}`,
    );
  }
  return ok(loadOutcome.baseline);
}

function runOneSuite(
  io: McpConformanceIo,
  input: McpConformanceRunInput,
  suite: ConformanceSuite,
): SuiteOutcome {
  const baseline = resolveBaseline(input, suite);
  if (isErr(baseline)) {
    return failedOutcome(suite, baseline.error);
  }

  const spawn = io.runMcpjam(
    composeSuiteArgs({
      suite,
      mode: input.mode,
      target: input.target,
      ...(input.credentialsFile === undefined ? {} : { credentialsFile: input.credentialsFile }),
    }),
  );
  if (isErr(spawn)) {
    return failedOutcome(
      suite,
      `mcpjam could not be launched for the "${suite}" suite: ${spawn.error.message}`,
    );
  }

  const retention = io.retainRawReport(suite, spawn.value.stdout);
  const parsed = parseRawReport(suite, spawn.value.stdout);
  if (isErr(parsed)) {
    return parseFailureOutcome({
      suite,
      parseErrorMessage: parsed.error.message,
      retention,
      mcpjamExitCode: spawn.value.exitCode,
    });
  }

  return comparedOutcome({
    suite,
    report: parsed.value,
    baseline: baseline.value,
    retention,
    mcpjamExitCode: spawn.value.exitCode,
  });
}

function parseFailureOutcome(input: {
  readonly suite: ConformanceSuite;
  readonly parseErrorMessage: string;
  readonly retention: RetentionOutcome;
  readonly mcpjamExitCode: number | undefined;
}): SuiteOutcome {
  const where = input.retention.ok
    ? ` — raw output retained at ${input.retention.reportedPath}`
    : '';
  const retentionNote = input.retention.ok
    ? ''
    : ` (raw-report retention ALSO failed: ${input.retention.error})`;
  return failedOutcome(input.suite, `${input.parseErrorMessage}${where}${retentionNote}`, {
    ...(input.retention.ok ? { rawReportPath: input.retention.reportedPath } : {}),
    ...(input.mcpjamExitCode === undefined ? {} : { mcpjamExitCode: input.mcpjamExitCode }),
  });
}

/** Run every requested suite and aggregate the wrapper's own report. */
export function runMcpConformance(
  io: McpConformanceIo,
  input: McpConformanceRunInput,
): { readonly report: ConformanceRunReport; readonly exitCode: 0 | 1 } {
  const suites = input.suites.map((suite) => runOneSuite(io, input, suite));
  const verdict = suites.every((outcome) => outcome.verdict === 'pass') ? 'pass' : 'fail';
  return {
    report: {
      schema_version: '1.0.0',
      target: input.target,
      mode: input.mode,
      suites,
      verdict,
    },
    exitCode: verdict === 'pass' ? 0 : 1,
  };
}
