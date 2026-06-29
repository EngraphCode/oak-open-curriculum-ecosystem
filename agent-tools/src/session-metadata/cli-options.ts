/**
 * Pure CLI option parser for the `session-metadata` topic.
 *
 * @remarks
 * `--vendor`, `--model`, and `--session-id` are required value options;
 * `--json` and `--help` are flags. The scan mechanics are delegated to the
 * shared {@link scanArgs}; this module owns only the topic's option surface and
 * the required-field check. Returns a discriminated union (never throws, never
 * exits, no IO).
 *
 * @packageDocumentation
 */

import { scanArgs, standardFlags, type ValueHandler } from '../core/cli-arg-parser.js';

interface SessionMetadataOptions {
  readonly vendor: string;
  readonly model: string;
  readonly sessionId: string;
  readonly json: boolean;
  readonly help: boolean;
}

/** Result of parsing `session-metadata` argv. */
export type ParseResult =
  | { readonly ok: true; readonly options: SessionMetadataOptions }
  | { readonly ok: false; readonly error: string };

interface MutableOptions {
  vendor: string;
  model: string;
  sessionId: string;
  json: boolean;
  help: boolean;
}

const VALUE_OPTIONS = {
  '--vendor': (state, value) => {
    state.vendor = value;
  },
  '--model': (state, value) => {
    state.model = value;
  },
  '--session-id': (state, value) => {
    state.sessionId = value;
  },
} satisfies Record<string, ValueHandler<MutableOptions>>;

export const SESSION_METADATA_HELP_TEXT = [
  'session-metadata --vendor <vendor> --model <model> --session-id <id> [--json]',
  '',
  "Read a session's recorded context occupancy from the vendor transcript and",
  'report window / used / remaining tokens, percentage, and an advisory',
  'effectiveness zone. Vendor + model + session-id in, session metadata out.',
  '',
  'Options:',
  '  --vendor <vendor>    Agent vendor. Supported: claude. Required.',
  '  --model <model>      Full model id incl. variant, e.g. claude-opus-4-8[1m]. Required.',
  '  --session-id <id>    Session id. Required.',
  '  --json               Emit machine-readable JSON instead of text.',
  '  -h, --help           Show this help.',
  '',
  'Examples:',
  "  agent-tools session-metadata --vendor claude --model 'claude-opus-4-8[1m]' --session-id abc-123",
  '  agent-tools session-metadata --vendor claude --model claude-opus-4-8 --session-id abc-123 --json',
].join('\n');

/**
 * Parse `session-metadata` argv into options or an error.
 *
 * @param argv - Topic argv (after the `session-metadata` topic token).
 * @returns A discriminated union: parsed options, or an error with usage text.
 */
export function parseArgs(argv: readonly string[]): ParseResult {
  const state: MutableOptions = {
    vendor: '',
    model: '',
    sessionId: '',
    json: false,
    help: false,
  };

  const scan = scanArgs(argv, state, {
    flags: standardFlags<MutableOptions>(),
    valueOptions: VALUE_OPTIONS,
    helpText: SESSION_METADATA_HELP_TEXT,
  });
  if (!scan.ok) {
    return { ok: false, error: scan.error };
  }

  if (state.help) {
    return { ok: true, options: state };
  }

  const missing = missingRequired(state);
  if (missing !== undefined) {
    return { ok: false, error: `${missing} is required\n\n${SESSION_METADATA_HELP_TEXT}` };
  }

  return { ok: true, options: state };
}

function missingRequired(state: MutableOptions): string | undefined {
  if (state.vendor.length === 0) {
    return '--vendor';
  }
  if (state.model.length === 0) {
    return '--model';
  }
  if (state.sessionId.length === 0) {
    return '--session-id';
  }
  return undefined;
}
