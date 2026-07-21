import { execFileSync } from 'node:child_process';

import {
  GH_EXEC_OPTIONS,
  parseGhJson,
  resolveGhPath,
  reviewThreadsArgs,
  type GhCommandExecutor,
  type PathExistsCheck,
  type PrTarget,
} from './gh.js';
import { parseReviewThreadPages } from './review-threads.js';
import { parseAgentTaskList, parseAgentTaskView } from './agent-task-fields.js';
import { parseReviewsHarvest, parseStateView, PR_STATE_VIEW_JSON_FIELDS } from './state-fields.js';
import type { PrStateReading, ReviewRun, ReviewRunsLeg } from './state-types.js';

/**
 * The gh IO composition for `pr state`: one extended `pr view` call, the
 * review-threads GraphQL slurp (shared with `pr-watch`), the FULL paginated
 * `reviews` harvest (the reviewer-leg source — never the `latestReviews`
 * pointer), and the `gh agent-task` review-run legs, composed into one
 * {@link PrStateReading}.
 *
 * The expected reviewer set is a DECLARED input (`expectedReviewers`); when
 * undeclared it defaults to the observed surface (requests ∪ harvest authors)
 * and the reading marks `expectedDeclared: false` so the verdict names the
 * first-round-guarantee gap instead of silently passing it.
 *
 * Run→PR mapping is view-per-session-id (the list surface carries no PR
 * number — verified live 2026-07-21), so the mapping is BOUNDED: every
 * in-flight run is mapped, completed runs cap at
 * {@link COMPLETED_RUN_MAP_LIMIT} most-recent. A missing or failing
 * `gh agent-task` degrades the leg to a TYPED `unavailable`.
 */

export interface ReadPrStateOptions {
  readonly target: PrTarget;
  readonly ghPath?: string;
  readonly execFileSync?: GhCommandExecutor;
  readonly exists?: PathExistsCheck;
  /** The declared expected reviewer set (`--expect`, repeatable). */
  readonly expectedReviewers?: readonly string[];
}

const COMPLETED_RUN_MAP_LIMIT = 5;

const AGENT_TASK_LIST_ARGS = [
  'agent-task',
  'list',
  '--json',
  'id,name,createdAt,completedAt',
] as const;

// Paginated full-history reviews harvest; `--slurp` wraps pages into one array.
const REVIEWS_QUERY = `query($owner: String!, $name: String!, $number: Int!, $endCursor: String) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      reviews(first: 100, after: $endCursor) {
        pageInfo { hasNextPage endCursor }
        nodes { author { login } state body submittedAt commit { oid } }
      }
    }
  }
}`;

function reviewsHarvestArgs(prNumber: string, repo: string | undefined): string[] {
  const [owner, name] = repo === undefined ? ['{owner}', '{repo}'] : repo.split('/');
  return [
    'api',
    'graphql',
    '--paginate',
    '--slurp',
    '-f',
    `query=${REVIEWS_QUERY}`,
    '-F',
    `owner=${owner}`,
    '-F',
    `name=${name}`,
    '-F',
    `number=${prNumber}`,
  ];
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function mapRunsToPr(input: {
  readonly run: GhCommandExecutor;
  readonly gh: string;
  readonly prNumber: number;
  readonly runs: readonly ReviewRun[];
}): ReviewRunsLeg {
  const live = input.runs.filter((run) => run.completedAt === null);
  const completed = input.runs
    .filter((run) => run.completedAt !== null)
    .slice(0, COMPLETED_RUN_MAP_LIMIT);
  const scoped: ReviewRun[] = [];
  for (const run of [...live, ...completed]) {
    const viewRaw = parseGhJson(
      input.run(input.gh, ['agent-task', 'view', run.id, '--json'], GH_EXEC_OPTIONS),
      'agent-task view',
    );
    if (parseAgentTaskView(viewRaw).pullRequestNumber === input.prNumber) {
      scoped.push(run);
    }
  }
  return { kind: 'read', runs: scoped };
}

function readReviewRunsLeg(input: {
  readonly run: GhCommandExecutor;
  readonly gh: string;
  readonly prNumber: number;
}): ReviewRunsLeg {
  try {
    const listRaw = parseGhJson(
      input.run(input.gh, AGENT_TASK_LIST_ARGS, GH_EXEC_OPTIONS),
      'agent-task list',
    );
    return mapRunsToPr({ ...input, runs: parseAgentTaskList(listRaw) });
  } catch (error) {
    return { kind: 'unavailable', reason: describeError(error) };
  }
}

/**
 * Fetch the `pr state` gh surfaces and compose the compound reading.
 *
 * @throws when the primary `pr view`, review-threads, or reviews-harvest legs
 *   fail (a verdict without them would be a guess); only the agent-task leg
 *   degrades typed.
 */
export function readPrStateReading(options: ReadPrStateOptions): PrStateReading {
  const run = options.execFileSync ?? execFileSync;
  const gh = resolveGhPath(options.ghPath, options.exists);
  const { number, repo } = options.target;
  const prNumber = String(number);

  const viewArgs = ['pr', 'view', prNumber, '--json', PR_STATE_VIEW_JSON_FIELDS.join(',')];
  if (repo !== undefined) {
    viewArgs.push('--repo', repo);
  }

  const view = parseStateView(parseGhJson(run(gh, viewArgs, GH_EXEC_OPTIONS), 'pr view'));
  const reviewThreads = parseReviewThreadPages(
    parseGhJson(
      run(gh, reviewThreadsArgs(prNumber, repo), GH_EXEC_OPTIONS),
      'api graphql reviewThreads',
    ),
  );
  const reviews = parseReviewsHarvest(
    parseGhJson(
      run(gh, reviewsHarvestArgs(prNumber, repo), GH_EXEC_OPTIONS),
      'api graphql reviews',
    ),
  );
  const reviewRuns = readReviewRunsLeg({ run, gh, prNumber: number });

  const declared = options.expectedReviewers ?? [];
  const observed = [...new Set([...view.reviewRequests, ...reviews.map((r) => r.author)])];
  return {
    ...view,
    reviewThreads,
    reviews,
    reviewRuns,
    expectedReviewers: declared.length > 0 ? declared : observed,
    expectedDeclared: declared.length > 0,
  };
}
