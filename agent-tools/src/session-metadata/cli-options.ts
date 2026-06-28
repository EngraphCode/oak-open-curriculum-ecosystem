/**
 * Pure CLI option parser for the `session-metadata` topic.
 *
 * @remarks
 * `--vendor`, `--model`, and `--session-id` are required value options;
 * `--json` and `--help` are flags. Returns a discriminated union (never throws,
 * never exits, no IO), mirroring the proven `context-cost` parser shape.
 *
 * @packageDocumentation
 */

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

type FlagHandler = (state: MutableOptions) => void;
type ValueHandler = (state: MutableOptions, value: string) => void;

const FLAG_HANDLERS = {
  '--json': (state) => {
    state.json = true;
  },
  '--help': (state) => {
    state.help = true;
  },
  '-h': (state) => {
    state.help = true;
  },
} satisfies Record<'--json' | '--help' | '-h', FlagHandler>;

const VALUE_HANDLERS = {
  '--vendor': (state, value) => {
    state.vendor = value;
  },
  '--model': (state, value) => {
    state.model = value;
  },
  '--session-id': (state, value) => {
    state.sessionId = value;
  },
} satisfies Record<'--vendor' | '--model' | '--session-id', ValueHandler>;

type FlagOption = keyof typeof FLAG_HANDLERS;
type ValueOption = keyof typeof VALUE_HANDLERS;

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

  try {
    let index = 0;
    while (index < argv.length) {
      index = consumeArg({ argv, index, state }) + 1;
    }

    if (state.help) {
      return { ok: true, options: state };
    }

    const missing = missingRequired(state);
    if (missing !== undefined) {
      return { ok: false, error: `${missing} is required\n\n${SESSION_METADATA_HELP_TEXT}` };
    }

    return { ok: true, options: state };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
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

function consumeArg(input: {
  readonly argv: readonly string[];
  readonly index: number;
  readonly state: MutableOptions;
}): number {
  const arg = input.argv[input.index];

  if (arg === '--') {
    return input.argv.length;
  }

  if (consumeFlag(input.state, arg)) {
    return input.index;
  }

  const valueHandler = getValueHandler(arg);
  if (valueHandler !== undefined) {
    const nextIndex = input.index + 1;
    valueHandler(input.state, requireValue(input.argv, nextIndex, arg ?? ''));
    return nextIndex;
  }

  if (arg?.startsWith('--')) {
    throw new Error(`unknown option: ${arg}\n\n${SESSION_METADATA_HELP_TEXT}`);
  }

  throw new Error(`unexpected positional argument: ${arg ?? ''}\n\n${SESSION_METADATA_HELP_TEXT}`);
}

function consumeFlag(state: MutableOptions, arg: string | undefined): boolean {
  if (!isFlagOption(arg)) {
    return false;
  }
  FLAG_HANDLERS[arg](state);
  return true;
}

function getValueHandler(arg: string | undefined): ValueHandler | undefined {
  return isValueOption(arg) ? VALUE_HANDLERS[arg] : undefined;
}

function isFlagOption(arg: string | undefined): arg is FlagOption {
  return arg !== undefined && Object.hasOwn(FLAG_HANDLERS, arg);
}

function isValueOption(arg: string | undefined): arg is ValueOption {
  return arg !== undefined && Object.hasOwn(VALUE_HANDLERS, arg);
}

function requireValue(argv: readonly string[], index: number, option: string): string {
  const value = argv[index];
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`${option} requires a value\n\n${SESSION_METADATA_HELP_TEXT}`);
  }
  return value;
}
