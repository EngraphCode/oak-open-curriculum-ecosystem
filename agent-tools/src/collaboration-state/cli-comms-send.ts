import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { dirname, join, parse } from 'node:path';

import { appendComms, renderComms } from './cli-comms-commands.js';
import { optional, required, type Options } from './cli-options.js';
import { type CliRuntime } from './cli-runtime.js';
import { type CollaborationStateEnvironment } from './types.js';

const DEFAULT_COMMS_DIR = '.agent/state/collaboration/comms';
const DEFAULT_SHARED_LOG = '.agent/state/collaboration/shared-comms-log.md';

/**
 * One-shot convenience wrapper: append a narrative comms event and re-render
 * the shared log, resolving canonical collaboration paths from the repo root
 * when the caller does not pass them explicitly.
 */
export async function sendComms(
  options: Options,
  env: CollaborationStateEnvironment,
  runtime: CliRuntime,
): Promise<string> {
  const nowIso = optional(options, 'now') ?? new Date().toISOString();
  const eventId = optional(options, 'event-id') ?? randomUUID();
  const defaults = commsSendDefaults(options, nowIso, eventId);
  const resolvedOptions = withDefaults(options, defaults);
  await appendComms(resolvedOptions, env, runtime);
  await renderComms(resolvedOptions, env, runtime);

  return formatCommsSendResult(resolvedOptions, eventId);
}

// `withDefaults` merges only the `values` Map; `tags`, `files`, and
// `areaPatterns` arrays pass through unchanged on the spread.

export function commsSendDefaults(
  options: Options,
  nowIso: string,
  eventId: string,
): Readonly<Record<string, string>> {
  const repoRoot = collaborationRepoRoot(options);
  return {
    'comms-dir': join(repoRoot, DEFAULT_COMMS_DIR),
    now: nowIso,
    'created-at': nowIso,
    'event-id': eventId,
    output: join(repoRoot, DEFAULT_SHARED_LOG),
    active: join(repoRoot, '.agent/state/collaboration/active-claims.json'),
  };
}

function collaborationRepoRoot(options: Options): string {
  return optional(options, 'repo-root') ?? findCollaborationRepoRoot(process.cwd());
}

export function formatCommsSendResult(options: Options, eventId: string): string {
  return `${JSON.stringify(commsSendResult(options, eventId), null, 2)}\n`;
}

function commsSendResult(
  options: Options,
  eventId: string,
): Readonly<{
  readonly event_id: string;
  readonly event_path: string;
  readonly shared_log_path: string;
}> {
  return {
    event_id: eventId,
    event_path: join(required(options, 'comms-dir'), `${eventId}.json`),
    shared_log_path: required(options, 'output'),
  };
}

function findCollaborationRepoRoot(start: string): string {
  let current = start;
  const root = parse(start).root;
  while (true) {
    if (existsSync(join(current, '.agent', 'state', 'collaboration'))) {
      return current;
    }
    if (current === root) {
      return start;
    }
    current = dirname(current);
  }
}

function withDefaults(options: Options, defaults: Readonly<Record<string, string>>): Options {
  const values = new Map(options.values);
  for (const key in defaults) {
    if (!values.has(key)) {
      values.set(key, defaults[key] ?? '');
    }
  }

  return { ...options, values };
}
