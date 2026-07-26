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
import { typeSafeKeys } from '@oaknational/type-helpers';
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
  .strict()
  // A report with zero cases across every group has nothing to verdict; an
  // empty run paired with an empty baseline would otherwise pass vacuously.
  .refine((report) => report.groups.some((group) => group.cases.length > 0), {
    message: 'a json-summary report must contain at least one check case',
  });

export type McpjamCase = z.infer<typeof mcpjamCaseSchema>;
export type McpjamReport = z.infer<typeof mcpjamReportSchema>;

/** The suites the wrapper can drive. */
export const conformanceSuiteSchema = z.enum(['protocol', 'apps', 'oauth']);
export type ConformanceSuite = z.infer<typeof conformanceSuiteSchema>;

/** Run mode: unattended (headless, no credentials) or attended/credentialed. */
const conformanceModeSchema = z.enum(['unattended', 'attended']);
export type ConformanceMode = z.infer<typeof conformanceModeSchema>;

/**
 * The wrapper's two operations. `verdict` (default) compares each suite
 * against its committed baseline and validates every baseline UP FRONT —
 * a missing or unusable baseline fails in milliseconds with no network
 * contact. `seed` is capture-only: run live, retain raw reports verbatim
 * (the observation seed for authoring baselines), no comparison, pass iff
 * every capture succeeded.
 */
export type ConformanceOperation = 'verdict' | 'seed';

/**
 * Expected terminal state for one check id. `errorIncludes` is required
 * exactly when a failure is expected — an expected failure without a pinned
 * shape would let any failure pass, which is exactly the masking that the
 * ticket's "named verdicts" bar exists to prevent.
 */
const expectedCheckSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('pass') }).strict(),
  z.object({ status: z.literal('skip') }).strict(),
  z
    .object({
      // Trimmed-non-empty, not just non-empty: `" "` pins no failure shape,
      // and `observed.error.includes(" ")` matches nearly any message — the
      // same masking a missing fragment would cause, one space wide.
      status: z.literal('fail'),
      errorIncludes: z.string().refine((fragment) => fragment.trim().length > 0, {
        message: 'errorIncludes must contain a non-whitespace failure fragment',
      }),
    })
    .strict(),
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
    // non-enum key (verified against the pinned zod 4.4.x source). The
    // refine rejects an EMPTY expectation set: it has no verdict semantics,
    // and paired with an empty run it would pass vacuously.
    expected: z
      .partialRecord(z.string().min(1), expectedCheckSchema)
      .refine((expected) => typeSafeKeys(expected).length > 0, {
        message: 'a baseline must pin at least one expected check',
      }),
  })
  .strict();

export type ExpectedCheck = z.infer<typeof expectedCheckSchema>;
export type Baseline = z.infer<typeof baselineSchema>;

/**
 * Named divergence classes. Complete over the expected×observed status
 * matrix plus the set-membership and multiplicity drifts:
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
 * - `duplicate-check` — one check id observed more than once in a run:
 *   ambiguous verdict input under the floating range, surfaced loudly and
 *   never resolved last-wins.
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
   * Bounded excerpt of mcpjam's stderr when the run still produced a usable
   * report — a vendor deprecation or configuration warning emitted by a run
   * that otherwise passes. Report data, never a verdict input: it exists so
   * a clean verdict cannot silently sit on top of an unread warning.
   */
  readonly mcpjamStderr?: string;
  /**
   * Why this suite failed outside baseline comparison — one entry per
   * applicable failure class, NEVER joined into prose (a child stream can
   * contain any separator, so a joined string is lossy on arrival):
   * baseline unavailable/invalid, entry-validation abort, mcpjam launch
   * failure (bounded diagnostics of both streams ride the reason on
   * signal/timeout death, where retention cannot run), raw-stdout parse
   * failure (with a bounded stderr diagnostic when the child wrote one),
   * and raw-report retention failure. Simultaneous problems all appear.
   * Empty when the suite reached its operation's success bar.
   */
  readonly failureReasons: readonly string[];
  readonly divergences: readonly Divergence[];
  readonly baselineResidualMasking?: string;
}

/** The wrapper's aggregate report: `{ report, exitCode }` per house shape. */
export interface ConformanceRunReport {
  readonly schema_version: '1.0.0';
  readonly operation: ConformanceOperation;
  readonly target: string;
  readonly mode: ConformanceMode;
  readonly suites: readonly SuiteOutcome[];
  readonly verdict: 'pass' | 'fail';
}
