import { fail } from './cli-fail.js';

/**
 * Argv tokenisation internals for the collaboration-state CLI. The public
 * option surface (the `Options` shape and its accessors) lives in
 * `cli-options.ts`; this module owns the token walk it is built from.
 */

/**
 * Per-key opt-in for bare-boolean handling. Tokens whose key is in this set
 * NEVER consume the next argv token: `--seed-from-now foo` parses as
 * `seed-from-now=true` plus a stray `foo` (the dispatcher rejects strays).
 *
 * Needed because the default `parseValueOption` path requires a value for
 * keys in `KNOWN_OPTION_KEYS`, and per-command specs (`commsWatchOptions`,
 * etc.) put the flag in that set for validation. Without this opt-in,
 * `--seed-from-now` would either be required to take a value or, if absent
 * from KNOWN_OPTION_KEYS, would silently consume the next non-`--` token.
 */
const BOOLEAN_OPTION_KEYS = new Set(['seed-from-now', 'no-auto-seed', 'no-heartbeat']);

// Value-taking flags only. Bare boolean flags are registered in
// BOOLEAN_OPTION_KEYS instead (they must not consume the next token).
const KNOWN_OPTION_KEYS = new Set([
  'active',
  'agent-name',
  'area-kind',
  'area-pattern',
  'body',
  'body-file',
  'body-json',
  'branch',
  'claim-id',
  'closed',
  'comms-dir',
  'comms-seen-dir',
  'created-at',
  'closure-summary',
  'current-cycle-label',
  'entry-json',
  'event-id',
  'events-dir',
  'file',
  'format',
  'heartbeat-file',
  'heartbeat-interval-ms',
  'help',
  'in-response-to',
  'intent',
  'intent-id',
  'kind',
  'lifecycle-dir',
  'max-events-per-drain',
  'messages-dir',
  'model',
  'notes',
  'now',
  'output',
  'path',
  'platform',
  'poll-ms',
  'repo-root',
  'role',
  'seen-file',
  'session-prefix',
  'since',
  'step-timeout-ms',
  'subject',
  'summary',
  'supervisor-pid',
  'tag',
  'thread',
  'thread-record',
  'title',
  'to-agent-name',
  'to-event-id',
  'to-id',
  'to-model',
  'to-platform',
  'to-session-prefix',
  'ttl-seconds',
]);

function requireFlagValue(flag: string, value: string | undefined): string {
  if (value === undefined || value.startsWith('--')) {
    return fail(`flag '${flag}' requires a value`);
  }

  return value;
}

export function parseToken(input: {
  readonly rest: readonly string[];
  readonly index: number;
  readonly values: Map<string, string>;
  readonly files: string[];
  readonly areaPatterns: string[];
  readonly tags: string[];
  readonly excludeTags: string[];
  readonly positionals: string[];
}): number {
  const token = input.rest[input.index] ?? '';
  const next = input.rest[input.index + 1];

  if (token === '--help') {
    input.values.set('help', 'true');
    return input.index + 1;
  }
  const repeatableSink = repeatableSinkFor(token, input);
  if (repeatableSink !== undefined) {
    repeatableSink.push(requireFlagValue(token, next));
    return input.index + 2;
  }
  if (token.startsWith('--')) {
    return parseValueOption({ token, next, values: input.values, index: input.index });
  }

  // A bare token is captured as a positional. The dispatcher (which knows the
  // command spec) decides whether the command accepts a positional and rejects
  // it otherwise, so a stray token remains an error.
  input.positionals.push(token);
  return input.index + 1;
}

/** The mutable sink for a repeatable flag token, or undefined for non-repeatable tokens. */
function repeatableSinkFor(
  token: string,
  input: {
    readonly files: string[];
    readonly areaPatterns: string[];
    readonly tags: string[];
    readonly excludeTags: string[];
  },
): string[] | undefined {
  switch (token) {
    case '--file':
      return input.files;
    case '--area-pattern':
      return input.areaPatterns;
    case '--tag':
      return input.tags;
    case '--exclude-tag':
      return input.excludeTags;
    default:
      return undefined;
  }
}

function parseValueOption(input: {
  readonly token: string;
  readonly next: string | undefined;
  readonly values: Map<string, string>;
  readonly index: number;
}): number {
  const key = input.token.slice(2);
  if (BOOLEAN_OPTION_KEYS.has(key)) {
    input.values.set(key, 'true');
    return input.index + 1;
  }
  if (!KNOWN_OPTION_KEYS.has(key)) {
    input.values.set(
      key,
      input.next === undefined || input.next.startsWith('--') ? 'true' : input.next,
    );
    return input.next === undefined || input.next.startsWith('--')
      ? input.index + 1
      : input.index + 2;
  }
  input.values.set(key, requireFlagValue(input.token, input.next));
  return input.index + 2;
}
