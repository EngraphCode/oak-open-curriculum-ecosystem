/**
 * MCP-189 — `agent-tools mcp-conformance` (MCPJam suite wrapper).
 *
 * Schema-first boundary for the wrapper: every shape that crosses an
 * external boundary — the MCPJam `--reporter json-summary` report and the
 * committed baseline files — is a zod schema here with its type as
 * `z.infer`, never a hand-declared twin. The wrapper's own OUTPUT shapes
 * (`Divergence`, `SuiteOutcome`, `ConformanceRunReport`) are deliberately
 * hand-declared interfaces: they are synthesized by this module and never
 * re-parsed from unknown input, so a schema would be ceremony.
 *
 * The baseline is the behaviour pin (the ticket's design): the `@mcpjam/cli`
 * dependency floats on a compatible range, and drift is caught loudly by
 * name — a novel or vanished check id, a new or vanished skip, a failure
 * whose shape moved — never absorbed silently.
 *
 * Vendor call shapes verified first-hand 2026-07-26 against the installed
 * `@mcpjam/cli` 3.15.2 (resolving `@mcpjam/sdk` 2.0.1): a failing suite
 * exits 1 while still writing the full json-summary document to stdout
 * (observed on the protocol, oauth, and apps suites against the deployed
 * alpha); the `--conformance-checks` OAuth negative probes are gated on a
 * fully-successful ATTENDED main flow and cannot run headless against a
 * consent-requiring server. The wrapper therefore never reads the child
 * exit code as a verdict — verdicts come from parse + baseline comparison
 * only, and the child exit code is retained as report data.
 */
import { z } from 'zod';

/** The check/step statuses MCPJam's json-summary reporter emits. */
const mcpjamCaseStatusSchema = z.enum(['passed', 'failed', 'skipped']);

/**
 * One check (protocol/apps suites) or flow step (oauth suite) in a
 * json-summary report. `details` stays `unknown`: the wrapper never
 * consumes it, and pinning vendor-internal diagnostics would make the
 * boundary brittle for no verdict value.
 */
const mcpjamCaseSchema = z
  .object({
    id: z.string().min(1),
    title: z.string(),
    category: z.string(),
    status: mcpjamCaseStatusSchema,
    durationMs: z.number(),
    description: z.string().optional(),
    error: z.string().optional(),
    details: z.unknown().optional(),
    output: z.string().optional(),
  })
  .strict();

/** One suite group in a json-summary report. */
const mcpjamGroupSchema = z
  .object({
    id: z.string().min(1),
    title: z.string(),
    target: z.string().optional(),
    passed: z.boolean(),
    durationMs: z.number(),
    summary: z.string().optional(),
    cases: z.array(mcpjamCaseSchema),
  })
  .strict();

/**
 * The MCPJam `--reporter json-summary` document. `schemaVersion` is pinned
 * as a literal: a reporter schema bump must fail loudly at the parse
 * boundary, never half-match (strict validation at the boundary).
 */
export const mcpjamReportSchema = z
  .object({
    schemaVersion: z.literal(1),
    kind: z.string().min(1),
    name: z.string(),
    passed: z.boolean(),
    durationMs: z.number(),
    groups: z.array(mcpjamGroupSchema).min(1),
  })
  .strict();

export type McpjamCase = z.infer<typeof mcpjamCaseSchema>;
export type McpjamReport = z.infer<typeof mcpjamReportSchema>;

/** The suites the wrapper can drive. */
export const conformanceSuiteSchema = z.enum(['protocol', 'apps', 'oauth']);
export type ConformanceSuite = z.infer<typeof conformanceSuiteSchema>;

/** Run mode: unattended (headless, no credentials) or attended/credentialed. */
const conformanceModeSchema = z.enum(['unattended', 'attended']);
export type ConformanceMode = z.infer<typeof conformanceModeSchema>;

/**
 * Expected terminal state for one check id. `errorIncludes` is required
 * exactly when a failure is expected — an expected failure without a pinned
 * shape would let any failure pass, which is the masking the ticket's
 * "named verdicts" bar exists to prevent.
 */
const expectedCheckSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('pass') }).strict(),
  z.object({ status: z.literal('skip') }).strict(),
  z.object({ status: z.literal('fail'), errorIncludes: z.string().min(1) }).strict(),
]);

/**
 * A committed baseline: the exact expected outcome of one (suite, mode)
 * run. Self-describing so a future drift adjudication can see what the
 * baseline was true OF: the baseline format version, the mcpjam version
 * and date observed at seeding, and any named residual masking window the
 * expectations cannot close (with its cover). Baselines are
 * target-agnostic — they never embed a deployment URL, and comparison
 * ignores environment-varying report fields (`target`, durations).
 */
export const baselineSchema = z
  .object({
    schema_version: z.literal('1.0.0'),
    suite: conformanceSuiteSchema,
    mode: conformanceModeSchema,
    seeded: z
      .object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
        mcpjam_version: z.string().min(1),
      })
      .strict(),
    residual_masking: z.string().optional(),
    // partialRecord: statically Partial<Record<...>> — most check-id strings
    // are NOT keys, and the comparator's absent-key guard must be justified
    // by the type, not merely tolerated. Runtime-identical to z.record for a
    // non-enum key (verified against the pinned zod 4.4.x source).
    expected: z.partialRecord(z.string().min(1), expectedCheckSchema),
  })
  .strict();

export type ExpectedCheck = z.infer<typeof expectedCheckSchema>;
export type Baseline = z.infer<typeof baselineSchema>;

/**
 * Named divergence classes. Complete over the expected×observed status
 * matrix plus the two set-membership drifts:
 *
 * - `unexpected-failure` — expected pass or skip, observed failed.
 * - `failure-shape-mismatch` — expected fail, observed fail, but the error
 *   text no longer contains the pinned `errorIncludes` fragment.
 * - `unexpected-pass` — expected fail, observed passed (a "healed" check is
 *   loud: e.g. the consent boundary suddenly passing headless would mean
 *   auto-consent appeared on the deployed surface).
 * - `new-skip` — expected pass or fail, observed skipped.
 * - `vanished-skip` — expected skip, observed passed (the ticket's named
 *   drift: a skip silently becoming a pass is a baseline event, not a win).
 * - `missing-check` — in the baseline, absent from the run.
 * - `novel-check` — in the run, absent from the baseline (the
 *   version-drift tripwire that lets the dependency range float safely).
 */
export interface Divergence {
  readonly kind:
    | 'unexpected-failure'
    | 'failure-shape-mismatch'
    | 'unexpected-pass'
    | 'new-skip'
    | 'vanished-skip'
    | 'missing-check'
    | 'novel-check'
    | 'duplicate-check';
  readonly checkId: string;
  readonly message: string;
}

/** Per-suite outcome in the wrapper's own report. */
export interface SuiteOutcome {
  readonly suite: ConformanceSuite;
  readonly verdict: 'pass' | 'fail';
  /**
   * Path of the retained raw mcpjam stdout: repo-root-relative when the
   * report dir was given (or defaulted) relative, verbatim when it was
   * given absolute. Absent when retention failed or never ran.
   */
  readonly rawReportPath?: string;
  /** The child process exit code — report data, never a verdict input. */
  readonly mcpjamExitCode?: number;
  /**
   * Why this suite failed outside baseline comparison. Carries one of four
   * failure classes: baseline unavailable/invalid, mcpjam launch failure,
   * raw-stdout parse failure, or raw-report retention failure. Absent when
   * the suite reached comparison and retention succeeded.
   */
  readonly failureReason?: string;
  readonly divergences: readonly Divergence[];
  readonly baselineResidualMasking?: string;
}

/** The wrapper's aggregate report: `{ report, exitCode }` per house shape. */
export interface ConformanceRunReport {
  readonly schema_version: '1.0.0';
  readonly target: string;
  readonly mode: ConformanceMode;
  readonly suites: readonly SuiteOutcome[];
  readonly verdict: 'pass' | 'fail';
}
