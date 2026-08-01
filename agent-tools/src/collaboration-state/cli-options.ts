import { parseToken } from './cli-argv-parse.js';
import { fail } from './cli-fail.js';

export interface Options {
  readonly command: string | undefined;
  readonly topic: string | undefined;
  readonly values: ReadonlyMap<string, string>;
  readonly files: readonly string[];
  readonly areaPatterns: readonly string[];
  readonly tags: readonly string[];
  /** Repeatable `--exclude-tag` values (the sanctioned F-146 watch exclusion). */
  readonly excludeTags: readonly string[];
  /**
   * Bare (non-`--`) tokens after the `<command> <topic>` prefix, in argv
   * order. The parser captures them rather than rejecting them so a command
   * spec may opt into a positional argument (`CommandSpec.positional`); the
   * dispatcher rejects positionals for any command that does not opt in, so a
   * stray token is still an error on every command-execution path — diagnosed
   * at dispatch rather than at parse. (Help short-circuits return before
   * dispatch validation, so a trailing token on a help invocation is ignored,
   * the conventional CLI behaviour.)
   */
  readonly positionals: readonly string[];
}

export function parseOptions(argv: readonly string[]): Options {
  const normalizedArgv = argv[0] === '--' ? argv.slice(1) : argv;
  const [command, possibleTopic] = normalizedArgv;
  const topic = possibleTopic?.startsWith('--') === false ? possibleTopic : undefined;
  const rest = topic === undefined ? normalizedArgv.slice(1) : normalizedArgv.slice(2);
  const values = new Map<string, string>();
  const files: string[] = [];
  const areaPatterns: string[] = [];
  const tags: string[] = [];
  const excludeTags: string[] = [];
  const positionals: string[] = [];

  for (let index = 0; index < rest.length;) {
    index = parseToken({
      rest,
      index,
      values,
      files,
      areaPatterns,
      tags,
      excludeTags,
      positionals,
    });
  }

  return { command, topic, values, files, areaPatterns, tags, excludeTags, positionals };
}

export function required(options: Options, key: string): string {
  const value = optional(options, key);
  if (value === undefined) {
    throw new Error(`missing required option --${key}`);
  }

  return value;
}

export function optional(options: Options, key: string): string | undefined {
  return options.values.get(key);
}

export function valueOrDefault(options: Options, key: string, fallback: string): string {
  return optional(options, key) ?? fallback;
}

export function optionalPositiveInteger(options: Options, key: string): number | undefined {
  const raw = optional(options, key);
  if (raw === undefined) {
    return undefined;
  }

  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value <= 0 || String(value) !== raw) {
    throw new Error(`--${key} must be a positive integer`);
  }

  return value;
}

/**
 * `required` plus a trimmed non-empty contract: the value is trimmed and a
 * missing or whitespace-only value is a teaching error naming the flag. Use
 * for flags where an empty value would silently write a meaningless field.
 */
export function nonEmptyRequired(options: Options, key: string): string {
  const value = required(options, key).trim();
  if (value.length === 0) {
    return fail(`--${key} must not be empty`);
  }

  return value;
}

/**
 * `optional` plus the same trimmed non-empty contract as
 * {@link nonEmptyRequired}: an absent flag is `undefined`, but a supplied
 * whitespace-only value is a teaching error rather than an empty write.
 */
export function nonEmptyOptional(options: Options, key: string): string | undefined {
  const raw = optional(options, key);
  if (raw === undefined) {
    return undefined;
  }
  const value = raw.trim();
  if (value.length === 0) {
    return fail(`--${key} must not be empty`);
  }

  return value;
}
