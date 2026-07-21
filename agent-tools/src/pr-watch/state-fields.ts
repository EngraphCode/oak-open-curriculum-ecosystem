import { z } from 'zod';

import { classifyCheck, type ChecksSummary } from './index.js';
import type { LatestReview, NamedCheck, ReviewRun } from './states.js';

/**
 * Boundary parsers for the `pr state` legs that the existing snapshot does not
 * carry: named per-check verdicts, auto-merge intent, review requests, latest
 * reviews with their reviewed tip, and `gh agent-task` review-run shapes.
 * Zod at the external boundary; misshapen input fails loud (never a silent
 * empty), while fields GitHub genuinely nulls (rollup on a no-check PR, a
 * review's commit oid — observed live 2026-07-21) normalise explicitly.
 */

// Superset of the pr-watch rollup schema: D1 additionally carries the check's
// NAME (CheckRun `name`, StatusContext `context`) — the #437 cure. Verdicts by
// name, never by column position.
const namedRollupItemSchema = z
  .object({
    __typename: z.string(),
    name: z.string().optional(),
    context: z.string().optional(),
    status: z.string().optional(),
    conclusion: z.string().nullish(),
    state: z.string().optional(),
  })
  .loose();

const authorLogin = z
  .object({ login: z.string() })
  .nullish()
  .transform((value) => value?.login ?? 'unknown');

const latestReviewSchema = z.object({
  author: authorLogin,
  state: z.string(),
  body: z.string(),
  commit: z
    .object({ oid: z.string() })
    .nullish()
    .transform((value) => value?.oid ?? ''),
});

// A review request names a User (`login`) or a Team (`slug`, with `name` as a
// fallback); an unrecognised shape becomes 'unknown' rather than a rejection.
const reviewRequestSchema = z
  .object({
    login: z.string().optional(),
    slug: z.string().optional(),
    name: z.string().optional(),
  })
  .loose()
  .transform((value) => value.login ?? value.slug ?? value.name ?? 'unknown');

const stateViewSchema = z.object({
  number: z.number(),
  state: z.string(),
  mergeable: z.string(),
  mergeStateStatus: z.string(),
  headRefOid: z.string(),
  statusCheckRollup: z
    .array(namedRollupItemSchema)
    .nullish()
    .transform((value) => value ?? []),
  // Armed iff GitHub returns an auto-merge object; null/absent means unarmed.
  autoMergeRequest: z
    .object({})
    .loose()
    .nullish()
    .transform((value) => value !== null && value !== undefined),
  reviewRequests: z
    .array(reviewRequestSchema)
    .nullish()
    .transform((value) => value ?? []),
  latestReviews: z
    .array(latestReviewSchema)
    .nullish()
    .transform((value) => value ?? []),
});

/** The exact `--json` field set the `pr state` gh call requests. */
export const PR_STATE_VIEW_JSON_FIELDS = [
  'number',
  'state',
  'mergeable',
  'mergeStateStatus',
  'headRefOid',
  'statusCheckRollup',
  'autoMergeRequest',
  'reviewRequests',
  'latestReviews',
] as const;

/** The parsed `gh pr view` legs specific to `pr state`. */
export interface ParsedStateView {
  readonly number: number;
  readonly state: string;
  readonly mergeable: string;
  readonly mergeStateStatus: string;
  readonly headRefOid: string;
  readonly checks: ChecksSummary;
  readonly namedChecks: readonly NamedCheck[];
  readonly autoMergeArmed: boolean;
  readonly reviewRequests: readonly string[];
  readonly latestReviews: readonly LatestReview[];
}

type NamedRollupItem = z.infer<typeof namedRollupItemSchema>;

function checkName(item: NamedRollupItem): string {
  return item.name ?? item.context ?? 'unnamed check';
}

function summarise(namedChecks: readonly NamedCheck[]): ChecksSummary {
  return {
    total: namedChecks.length,
    passed: namedChecks.filter((check) => check.bucket === 'passed').length,
    failed: namedChecks.filter((check) => check.bucket === 'failed').length,
    pending: namedChecks.filter((check) => check.bucket === 'pending').length,
  };
}

/**
 * Parse the extended `gh pr view --json` payload for `pr state`.
 *
 * @throws a ZodError when the payload is not the expected gh shape (strict
 *   validation at the external-input boundary).
 */
export function parseStateView(raw: unknown): ParsedStateView {
  const parsed = stateViewSchema.parse(raw);
  const namedChecks = parsed.statusCheckRollup.map((item) => ({
    name: checkName(item),
    bucket: classifyCheck(item),
  }));
  return {
    number: parsed.number,
    state: parsed.state,
    mergeable: parsed.mergeable,
    mergeStateStatus: parsed.mergeStateStatus,
    headRefOid: parsed.headRefOid,
    checks: summarise(namedChecks),
    namedChecks,
    autoMergeArmed: parsed.autoMergeRequest,
    reviewRequests: parsed.reviewRequests,
    latestReviews: parsed.latestReviews.map((review) => ({
      author: review.author,
      state: review.state,
      body: review.body,
      commitOid: review.commit,
    })),
  };
}

// `gh agent-task list --json id,name,createdAt,completedAt` — verified live
// 2026-07-21: the list surface carries NO PR number; `completedAt` null means
// the run is in flight.
const agentTaskListSchema = z.array(
  z
    .object({
      id: z.string(),
      name: z.string(),
      completedAt: z
        .string()
        .nullish()
        .transform((value) => value ?? null),
    })
    .loose(),
);

/**
 * Parse `gh agent-task list` JSON into review-run entries.
 *
 * @throws a ZodError when the payload is not the expected array shape.
 */
export function parseAgentTaskList(raw: unknown): ReviewRun[] {
  return agentTaskListSchema.parse(raw).map((run) => ({
    id: run.id,
    name: run.name,
    completedAt: run.completedAt,
  }));
}

const agentTaskViewSchema = z
  .object({
    id: z.string(),
    completedAt: z
      .string()
      .nullish()
      .transform((value) => value ?? null),
    pullRequestNumber: z.number().optional(),
  })
  .loose();

/** One `gh agent-task view <id>` result — the surface carrying the run→PR map. */
export interface AgentTaskView {
  readonly id: string;
  readonly completedAt: string | null;
  readonly pullRequestNumber?: number;
}

/**
 * Parse `gh agent-task view <id>` JSON (the run→PR mapping surface).
 *
 * @throws a ZodError when the payload is not the expected object shape.
 */
export function parseAgentTaskView(raw: unknown): AgentTaskView {
  const parsed = agentTaskViewSchema.parse(raw);
  return {
    id: parsed.id,
    completedAt: parsed.completedAt,
    ...(parsed.pullRequestNumber === undefined
      ? {}
      : { pullRequestNumber: parsed.pullRequestNumber }),
  };
}
