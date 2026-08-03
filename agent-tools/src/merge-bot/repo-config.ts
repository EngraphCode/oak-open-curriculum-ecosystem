import { readFileSync } from 'node:fs';
import path from 'node:path';

import { z } from 'zod';

import { parseWithSchema } from '../core/schema-parse.js';
import { err, type Result } from '@oaknational/result';

/**
 * Repo-owned merge-bot identity (AIP-158, owner ruling 2026-07-21: "the
 * generalisation from that bot to the repo's merge bot needs to happen in
 * config in the repo").
 *
 * `.github/merge-bot.json` names WHICH GitHub App is this repo's merge bot,
 * so no seat carries the mapping as session memory. The private key is the
 * one thing that stays machine-local by design; its default location is
 * DERIVED from the config (`~/.config/<appSlug>/private-key.pem`), so the
 * repo never records a machine path (principles.md §No machine-local paths).
 */

const MERGE_BOT_CONFIG_RELATIVE_PATH = path.join('.github', 'merge-bot.json');

const MERGE_BOT_CONFIG_SCHEMA = z
  .object({
    appSlug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/, 'appSlug must be a GitHub app slug'),
    appId: z.string().regex(/^\d+$/, 'appId must be the numeric GitHub App id as a string'),
    repo: z
      .string()
      .regex(/^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/, 'repo must be owner/name in GitHub grammar'),
  })
  .strict();

export type MergeBotRepoConfig = z.output<typeof MERGE_BOT_CONFIG_SCHEMA>;

/** Read and strictly validate `.github/merge-bot.json` under `repoRoot`. */
export function loadMergeBotRepoConfig(input: {
  readonly repoRoot: string;
  readonly readFileImpl?: (filePath: string) => string;
}): Result<MergeBotRepoConfig, Error> {
  const configPath = path.join(input.repoRoot, MERGE_BOT_CONFIG_RELATIVE_PATH);
  const read = input.readFileImpl ?? ((filePath: string) => readFileSync(filePath, 'utf8'));
  let raw: string;
  try {
    raw = read(configPath);
  } catch (cause) {
    return err(
      new Error(
        `merge-bot repo config not readable at ${MERGE_BOT_CONFIG_RELATIVE_PATH}: ${cause instanceof Error ? cause.message : String(cause)}`,
      ),
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return err(new Error(`${MERGE_BOT_CONFIG_RELATIVE_PATH} is not valid JSON`));
  }
  return parseWithSchema({
    label: MERGE_BOT_CONFIG_RELATIVE_PATH,
    schema: MERGE_BOT_CONFIG_SCHEMA,
    value: parsed,
  });
}

/** The machine-local default key location derived from the repo config. */
export function defaultPrivateKeyPath(input: {
  readonly home: string;
  readonly appSlug: string;
}): string {
  return path.join(input.home, '.config', input.appSlug, 'private-key.pem');
}
