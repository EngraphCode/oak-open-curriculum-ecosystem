import { z } from 'zod';

import type { ReviewRun } from './state-types.js';

/**
 * Boundary parsers for the `gh agent-task` review-run surfaces consumed by
 * `pr state` (split from `state-fields.ts` by responsibility): the list leg
 * (run liveness) and the view leg (the run→PR mapping).
 */

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
