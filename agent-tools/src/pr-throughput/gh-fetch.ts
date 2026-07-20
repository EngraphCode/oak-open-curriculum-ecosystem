/**
 * The `gh` IO boundary for the PDR-131 throughput register.
 *
 * @remarks
 * Fetches the merged-PR corpus through the injected executor seam (tests
 * inject a fake; the CLI injects `execFileSync` with the absolute `gh` path
 * from `pr-watch`'s resolver — second consumer, so the resolver is reused,
 * never re-derived). The payload is schema-parsed at this boundary: external
 * data enters typed or not at all.
 *
 * @packageDocumentation
 */
import { err, type Result } from '@oaknational/result';
import { z } from 'zod';

import { parseWithSchema } from '../core/schema-parse.js';
import type { GhCommandExecutor } from '../pr-watch/gh.js';

import type { MergedPrRecord } from './index.js';

const MERGED_PR_SCHEMA = z.array(
  z.object({
    number: z.number().int().positive(),
    createdAt: z.iso.datetime(),
    mergedAt: z.iso.datetime(),
    isDraft: z.boolean(),
    headRefName: z.string().min(1),
  }),
);

export const MERGED_PR_JSON_FIELDS = 'number,createdAt,mergedAt,isDraft,headRefName';

/**
 * List PRs merged into `main`, newest first, up to `limit`. A transport or
 * shape failure is a typed `err` the caller reports — never a throw and
 * never silently-empty data (the empty-state-is-transport-failure class).
 */
export function fetchMergedPrs(input: {
  readonly executor: GhCommandExecutor;
  readonly ghPath: string;
  readonly limit: number;
}): Result<readonly MergedPrRecord[], Error> {
  let raw: string;

  try {
    raw = input.executor(
      input.ghPath,
      [
        'pr',
        'list',
        '--state',
        'merged',
        '--base',
        'main',
        '--limit',
        String(input.limit),
        '--json',
        MERGED_PR_JSON_FIELDS,
      ],
      { encoding: 'utf8' },
    );
  } catch (cause) {
    return err(cause instanceof Error ? cause : new Error(String(cause)));
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return err(new Error(`gh pr list returned non-JSON output: ${raw.slice(0, 200)}`));
  }

  return parseWithSchema({
    label: 'gh pr list --state merged',
    schema: MERGED_PR_SCHEMA,
    value: parsed,
  });
}
