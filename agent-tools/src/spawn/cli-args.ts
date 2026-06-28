import { err, isErr, ok, type Result } from '@oaknational/result';

/**
 * Argument parsing for `agent-tools spawn` (spawn-flow). Extracted from `cli.ts`
 * so the orchestration there stays within the per-file line budget as the option
 * set grows (1D added the seat specifics). Pure: no IO, no git, no throw.
 */

const DEFAULT_TYPE = 'feat';
const DEFAULT_BASE = 'origin/main';

/** The parsed, trimmed spawn arguments (or `help: true` for the usage path). */
export interface ParsedSpawnArgs {
  readonly slug: string;
  readonly type: string;
  readonly base: string;
  /** Per-seat specifics for the 1D brief; absent unless the coordinator supplied them. */
  readonly role?: string;
  readonly task?: string;
  readonly director?: string;
  readonly help: boolean;
}

interface MutableSpawnArgs {
  slug?: string;
  type: string;
  base: string;
  role?: string;
  task?: string;
  director?: string;
  help: boolean;
}

const VALUE_HANDLERS: Readonly<Record<string, (state: MutableSpawnArgs, value: string) => void>> = {
  '--slug': (state, value) => {
    state.slug = value;
  },
  '--type': (state, value) => {
    state.type = value;
  },
  '--base': (state, value) => {
    state.base = value;
  },
  '--role': (state, value) => {
    state.role = value;
  },
  '--task': (state, value) => {
    state.task = value;
  },
  '--director': (state, value) => {
    state.director = value;
  },
};

function requireValue(
  args: readonly string[],
  index: number,
  option: string,
): Result<string, Error> {
  const value = args[index];
  if (value === undefined || value.startsWith('-')) {
    return err(new Error(`spawn: ${option} requires a value`));
  }
  return ok(value);
}

/** Consume one argument into `state`; returns the new index, or an error. */
function consumeArg(
  args: readonly string[],
  index: number,
  state: MutableSpawnArgs,
): Result<number, Error> {
  const arg = args[index];
  if (arg === '--help' || arg === '-h') {
    state.help = true;
    return ok(index);
  }
  const valueHandler = VALUE_HANDLERS[arg];
  if (valueHandler !== undefined) {
    const value = requireValue(args, index + 1, arg);
    if (isErr(value)) {
      return value;
    }
    valueHandler(state, value.value);
    return ok(index + 1);
  }
  return err(new Error(`spawn: unknown option: ${arg}\n\n${usage()}`));
}

/**
 * Normalise an optional seat specific: collapse all interior whitespace runs
 * (including embedded newlines) to single spaces and trim the ends, dropping the
 * value when it is absent or blank. The seat brief renders each specific on a
 * single aligned line, so a multi-line value would forge extra brief fields —
 * collapsing at the parse boundary keeps the rendered brief well-formed
 * (strict-validation-at-boundary).
 */
function normaliseOptional(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const collapsed = value.replaceAll(/\s+/gu, ' ').trim();
  return collapsed.length === 0 ? undefined : collapsed;
}

/** Parse the spawn argv into trimmed, validated arguments (or the help sentinel). */
export function parseSpawnArgs(args: readonly string[]): Result<ParsedSpawnArgs, Error> {
  const state: MutableSpawnArgs = { type: DEFAULT_TYPE, base: DEFAULT_BASE, help: false };

  let index = 0;
  while (index < args.length) {
    const step = consumeArg(args, index, state);
    if (isErr(step)) {
      return step;
    }
    index = step.value + 1;
  }

  if (state.help) {
    return ok({ slug: '', type: state.type, base: state.base, help: true });
  }
  if (state.slug === undefined) {
    return err(new Error(`spawn: --slug is required\n\n${usage()}`));
  }
  // Normalise option values once at the parse boundary so every downstream consumer
  // sees the same trimmed value. createSpawnWorktree trims again for its own
  // validation, but openDraftPr and the seat brief consume the parsed values
  // directly — without this, trailing whitespace would reach `gh pr create --base`,
  // the marker commit / PR title, and the rendered brief.
  return ok({
    slug: state.slug.trim(),
    type: state.type.trim(),
    base: state.base.trim(),
    role: normaliseOptional(state.role),
    task: normaliseOptional(state.task),
    director: normaliseOptional(state.director),
    help: false,
  });
}

/** The `agent-tools spawn` usage text. */
export function usage(): string {
  return [
    'agent-tools spawn --slug <slug> [--type <type>] [--base <ref>]',
    '                  [--role <role>] [--task <task>] [--director <name>]',
    '',
    'Creates a sibling oak-<slug> worktree on a <type>/<slug> branch cut from <ref>',
    'and emits a seat brief (worktree/branch plus any supplied role/task/Director)',
    'that invokes /oak-start-right-team. The session identity is assigned at launch',
    'by the SessionStart hook, not predicted here.',
    `Defaults: --type ${DEFAULT_TYPE}, --base ${DEFAULT_BASE}.`,
    '',
  ].join('\n');
}
