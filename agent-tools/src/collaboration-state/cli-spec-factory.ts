import { type Options } from './cli-options.js';
import { type CliRuntime } from './cli-runtime.js';
import { type CollaborationStateEnvironment } from './types.js';

/**
 * A collaboration-state CLI command handler: takes parsed options, the
 * environment, and the runtime, and returns its stdout (sync or async). The
 * `specs` registry in `cli-specs.ts` maps each `<topic>:<action>` to one of
 * these via {@link commandSpec}.
 */
export type CliHandler = (
  options: Options,
  env: CollaborationStateEnvironment,
  runtime: CliRuntime,
) => Promise<string> | string;

/** A resolved command specification: handler, help text, and allowed options. */
export interface CommandSpec {
  readonly handler: CliHandler;
  readonly help: string;
  readonly options: ReadonlySet<string>;
  readonly allowsFiles?: boolean;
  /**
   * When set, the command accepts a single bare positional argument and the
   * dispatcher binds it to this option key (so the handler reads it via the
   * same key as the equivalent `--<key>` flag). Commands without this field
   * reject any positional. At most one positional is ever accepted.
   */
  readonly positional?: string;
}

/**
 * Build a {@link CommandSpec} from an option-name list (materialised into the
 * `ReadonlySet` the parser validates against). Kept separate from the registry
 * data in `cli-specs.ts` so adding a command grows only the registry, not this
 * factory.
 */
export function commandSpec(input: {
  readonly help: string;
  readonly options: readonly string[];
  readonly allowsFiles?: boolean;
  readonly positional?: string;
  readonly handler: CliHandler;
}): CommandSpec {
  // Closed-shape invariant: the dispatcher binds a positional into
  // `values[positional]`, which the option allowlist then validates, so a
  // positional key absent from `options` would fail every positional
  // invocation with a misleading "unknown option" error. Catch the
  // misconfiguration at construction (module load) rather than at runtime.
  if (input.positional !== undefined && !input.options.includes(input.positional)) {
    throw new Error(`commandSpec: positional '${input.positional}' must also be listed in options`);
  }

  return {
    help: input.help,
    options: new Set(input.options),
    allowsFiles: input.allowsFiles,
    positional: input.positional,
    handler: input.handler,
  };
}
