/**
 * Per-suite pipelines for `agent-tools mcp-conformance` (MCP-189): the
 * evidence phase (spawn → retain verbatim → parse) and the two operations'
 * suite runners. `report.ts` aggregates these; `suite-outcome.ts` composes
 * the outcomes.
 *
 * Vocabulary: EVIDENCE means retained artefacts (the verbatim raw
 * reports); bounded stream excerpts riding failure reasons are
 * DIAGNOSTICS, not evidence. "Launch failure" includes signal/timeout
 * death (see `node-io.ts`) — retention cannot run on that path, so only
 * bounded diagnostics of both streams survive it.
 */
import { err, isErr, ok, type Result } from '@oaknational/result';

import { parseWithSchema } from '../core/schema-parse.js';
import { boundedExcerpt } from './bounded-excerpt.js';
import { type McpConformanceIo, type McpConformanceRunInput } from './io-port.js';
import { composeSuiteArgs, findTargetMismatch, SUITE_REPORT_KIND } from './runner.js';
import {
  buildSuiteOutcome,
  compareAndCompose,
  composeEvidence,
  type EvidenceFields,
} from './suite-outcome.js';
import {
  mcpjamReportSchema,
  type Baseline,
  type ConformanceSuite,
  type McpjamReport,
  type SuiteOutcome,
} from './types.js';

const SEED_HINT =
  'no verdict was attempted — run the same invocation with --seed to capture observation reports for authoring the missing baseline';

const ENTRY_ABORT =
  'not run: entry validation failed for another suite in this verdict run — fix the named baseline problem and rerun';

function parseRawReport(
  suite: ConformanceSuite,
  stdout: string,
  requestedTarget: string,
): Result<McpjamReport, Error> {
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
  const parsed = parseWithSchema({
    label: `mcpjam json-summary report ("${suite}" suite)`,
    schema: mcpjamReportSchema,
    value: parsedJson,
  });
  if (isErr(parsed)) {
    return parsed;
  }
  // Identity check at the parse boundary: a structurally valid report from a
  // DIFFERENT subcommand would otherwise be retained and verdicted under the
  // requested suite's name.
  const expectedKind = SUITE_REPORT_KIND[suite];
  if (parsed.value.kind !== expectedKind) {
    return err(
      new Error(
        `mcpjam returned a "${parsed.value.kind}" report for the "${suite}" suite (expected "${expectedKind}") — the vendor dispatched a different subcommand; do not author a baseline from this capture`,
      ),
    );
  }
  // Provenance, the identity check's sibling: a capture of a DIFFERENT
  // deployment would otherwise match the (target-agnostic) baseline and be
  // emitted under the requested target — false assurance about a live surface.
  const targetMismatch = findTargetMismatch(parsed.value, requestedTarget);
  if (targetMismatch !== undefined) {
    return err(new Error(`the "${suite}" suite: ${targetMismatch}`));
  }
  return parsed;
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

/** The evidence phase's terminal states: launch failed, ran-but-unparseable, or parsed. */
type SuiteEvidence =
  | { readonly kind: 'launch-failure'; readonly reason: string }
  | {
      readonly kind: 'unparseable';
      readonly reason: string;
      readonly retentionReasons: readonly string[];
      readonly evidence: EvidenceFields;
    }
  | {
      readonly kind: 'parsed';
      readonly report: McpjamReport;
      readonly retentionReasons: readonly string[];
      readonly evidence: EvidenceFields;
    };

/** Spawn, retain verbatim, parse — the evidence phase, baseline-independent. */
function gatherSuiteEvidence(
  io: McpConformanceIo,
  input: McpConformanceRunInput,
  suite: ConformanceSuite,
): SuiteEvidence {
  const spawn = io.runMcpjam(
    composeSuiteArgs({
      suite,
      mode: input.mode,
      target: input.target,
      ...(input.credentialsFile === undefined ? {} : { credentialsFile: input.credentialsFile }),
    }),
  );
  if (isErr(spawn)) {
    return {
      kind: 'launch-failure',
      reason: `mcpjam could not be launched for the "${suite}" suite: ${spawn.error.message}`,
    };
  }
  const retention = io.retainRawReport(suite, spawn.value.stdout);
  const retentionReasons = retention.ok ? [] : [`raw-report retention failed: ${retention.error}`];
  const evidence = composeEvidence(retention, spawn.value);
  const parsed = parseRawReport(suite, spawn.value.stdout, input.target);
  if (isErr(parsed)) {
    const retainedNote = retention.ok ? ` — raw output retained at ${retention.reportedPath}` : '';
    return {
      kind: 'unparseable',
      reason: `${parsed.error.message}${retainedNote}${boundedExcerpt('mcpjam stderr', spawn.value.stderr)}`,
      retentionReasons,
      evidence,
    };
  }
  return { kind: 'parsed', report: parsed.value, retentionReasons, evidence };
}

/** One launched suite under either operation; `onParsed` supplies the operation's parsed arm. */
function runLaunchedSuite(
  io: McpConformanceIo,
  input: McpConformanceRunInput,
  suite: ConformanceSuite,
  onParsed: (gathered: {
    readonly report: McpjamReport;
    readonly retentionReasons: readonly string[];
    readonly evidence: EvidenceFields;
  }) => SuiteOutcome,
): SuiteOutcome {
  const gathered = gatherSuiteEvidence(io, input, suite);
  switch (gathered.kind) {
    case 'launch-failure':
      return buildSuiteOutcome({
        suite,
        operation: input.operation,
        failureReasons: [gathered.reason],
        divergences: [],
      });
    case 'unparseable':
      return buildSuiteOutcome({
        suite,
        operation: input.operation,
        failureReasons: [gathered.reason, ...gathered.retentionReasons],
        divergences: [],
        ...gathered.evidence,
      });
    case 'parsed':
      return onParsed(gathered);
    default: {
      // Compile-time exhaustiveness over the evidence phase's terminal states.
      const exhaustive: never = gathered;
      return exhaustive;
    }
  }
}

/** The verdict operation: fail-fast entry validation, then run + compare. */
export function runVerdictSuites(
  io: McpConformanceIo,
  input: McpConformanceRunInput,
): readonly SuiteOutcome[] {
  const resolved = input.suites.map((suite) => ({
    suite,
    baseline: resolveBaseline(input, suite),
  }));
  const anyBroken = resolved.some(({ baseline }) => isErr(baseline));
  return resolved.map(({ suite, baseline }) => {
    if (isErr(baseline)) {
      return buildSuiteOutcome({
        suite,
        operation: 'verdict',
        failureReasons: [baseline.error, SEED_HINT],
        divergences: [],
      });
    }
    if (anyBroken) {
      return buildSuiteOutcome({
        suite,
        operation: 'verdict',
        failureReasons: [ENTRY_ABORT],
        divergences: [],
      });
    }
    return runLaunchedSuite(io, input, suite, (gathered) =>
      compareAndCompose({
        suite,
        baseline: baseline.value,
        report: gathered.report,
        retentionReasons: gathered.retentionReasons,
        evidence: gathered.evidence,
      }),
    );
  });
}

/** The seed operation: capture-only — a parsed, retained capture passes. */
export function runSeedSuites(
  io: McpConformanceIo,
  input: McpConformanceRunInput,
): readonly SuiteOutcome[] {
  return input.suites.map((suite) =>
    runLaunchedSuite(io, input, suite, (gathered) =>
      buildSuiteOutcome({
        suite,
        operation: 'seed',
        failureReasons: gathered.retentionReasons,
        divergences: [],
        ...gathered.evidence,
      }),
    ),
  );
}
