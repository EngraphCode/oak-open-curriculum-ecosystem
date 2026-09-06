#!/usr/bin/env node

/**
 * Writes the EEF corpus markdown projection — the corpus reference and one
 * file per strand — into a directory of the caller's choice. The rendering
 * itself is the pure `renderEefMarkdownFiles` in `src/`; this script only
 * writes, then verifies.
 *
 * Containment: the output root must sit inside the directory the command
 * runs from (`process.cwd()`: this package's directory under
 * `pnpm --filter … render:eef-markdown`, or wherever `pnpm exec tsx` is run).
 * The root is checked lexically before anything is created, canonically
 * through its nearest existing ancestor before it is created (so a symbolic
 * link already on the path cannot carry the creation outside), and canonically
 * once it exists; every target directory gets the same three checks before a
 * byte is written; each target is opened without following
 * symbolic links and written through that descriptor, so a symbolic link or a
 * directory in the target's place is refused in the same operation as the open
 * (no check-then-write window), and a platform that cannot open a file without
 * following links is refused outright. Every
 * written file is then checked against this repository's own formatter
 * configuration (resolved from the script's location, never from the output
 * directory), so a drift between the renderer's normal form and the
 * repository's formatter settings fails here rather than in a consumer's gate.
 *
 * The script only writes. A file an earlier render produced that the current
 * corpus no longer does (a renamed or withdrawn strand) stays in the output
 * directory until the caller removes it, so a consumer that commits the set
 * renders into an empty directory or clears it first.
 *
 * Usage: `pnpm render:eef-markdown --out <directory>` from this package, or
 * `pnpm exec tsx packages/sdks/graph-corpus-sdk/scripts/render-eef-markdown.ts --out <directory>`
 * from the repository root. `<directory>` resolves against, and must stay
 * inside, the directory the command runs from.
 */

import { closeSync, constants, mkdirSync, openSync, realpathSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { assertPathWithinBase } from '@oaknational/safe-path';
import { check, resolveConfig, type Options } from 'prettier';
import {
  renderEefMarkdownFiles,
  type RenderedMarkdownFile,
} from '../src/eef-strands/eef-markdown-files.js';

/** The reason a run writes nothing more. */
interface Refusal {
  readonly refused: string;
}

/** The `code` of a system error, when the thrown value carries one. */
function errorCode(error: unknown): string | undefined {
  return error instanceof Error && 'code' in error && typeof error.code === 'string'
    ? error.code
    : undefined;
}

/** The canonical path of the nearest existing ancestor of `path` (`path` itself when it exists). */
function canonicalNearestExisting(path: string): string | Refusal {
  let current = path;
  while (current !== dirname(current)) {
    try {
      return realpathSync(current);
    } catch (error) {
      const code = errorCode(error);
      if (code !== 'ENOENT') {
        return { refused: `${current} could not be canonicalised (${code ?? String(error)})` };
      }
      current = dirname(current);
    }
  }
  return realpathSync(current);
}

/**
 * Create `directory` inside `base` and return its canonical path: the nearest
 * existing ancestor is canonicalised and checked before anything is created,
 * and the created directory is checked again once it exists.
 */
function ensureContainedDirectory(directory: string, base: string): string | Refusal {
  const nearest = canonicalNearestExisting(directory);
  if (typeof nearest !== 'string') {
    return nearest;
  }
  assertPathWithinBase(nearest, base);
  mkdirSync(directory, { recursive: true });
  return assertPathWithinBase(directory, base);
}

/**
 * Open `target` for writing (create or truncate) without following a symbolic
 * link in its place, so the refusal and the open are one operation.
 */
function openWithoutFollowing(target: string, relativePath: string): number | Refusal {
  if (!Object.hasOwn(constants, 'O_NOFOLLOW')) {
    return {
      refused:
        'this platform cannot open a file without following symbolic links; run under a POSIX shell',
    };
  }
  const flags = constants.O_WRONLY | constants.O_CREAT | constants.O_TRUNC | constants.O_NOFOLLOW;
  try {
    return openSync(target, flags, 0o644);
  } catch (error) {
    const code = errorCode(error);
    const reason =
      code === 'ELOOP'
        ? 'is a symbolic link; not followed'
        : `could not be opened for writing (${code ?? String(error)})`;
    return { refused: `${relativePath} ${reason}` };
  }
}

/** This repository's formatter configuration, resolved from where this script lives. */
async function repositoryFormatterOptions(): Promise<Options | null> {
  return resolveConfig(fileURLToPath(import.meta.url));
}

/**
 * Resolve `--out` against the working directory and refuse it outside that
 * directory: lexically before anything is created, canonically through its
 * nearest existing ancestor, and canonically once it exists.
 */
function containedOutputRoot(outArgument: string): string | Refusal {
  const base = process.cwd();
  const candidate = resolve(base, outArgument);
  if (candidate !== base && !candidate.startsWith(`${base}${sep}`)) {
    return { refused: `--out '${outArgument}' resolves outside the working directory '${base}'` };
  }
  return ensureContainedDirectory(candidate, base);
}

/**
 * Write one rendered file under the output root: the target directory is
 * canonicalised and checked against the root first, and the target is opened
 * without following symbolic links and written through that descriptor.
 */
function writeContained(outputRoot: string, file: RenderedMarkdownFile): string | Refusal {
  const directory = ensureContainedDirectory(join(outputRoot, dirname(file.path)), outputRoot);
  if (typeof directory !== 'string') {
    return directory;
  }
  const target = join(directory, basename(file.path));
  const descriptor = openWithoutFollowing(target, file.path);
  if (typeof descriptor !== 'number') {
    return descriptor;
  }
  try {
    writeFileSync(descriptor, file.text);
  } finally {
    closeSync(descriptor);
  }
  return target;
}

/**
 * Write every rendered file and verify each against the formatter options.
 *
 * @returns The paths of files not in the formatter's normal form, or the refusal that stopped the run.
 */
async function writeAndVerify(
  outputRoot: string,
  files: readonly RenderedMarkdownFile[],
  options: Options,
): Promise<readonly string[] | Refusal> {
  const notNormal: string[] = [];
  for (const file of files) {
    const written = writeContained(outputRoot, file);
    if (typeof written !== 'string') {
      return written;
    }
    if (!(await check(file.text, { ...options, parser: 'markdown' }))) {
      notNormal.push(file.path);
    }
  }
  return notNormal;
}

function fail(message: string): void {
  process.stderr.write(`render-eef-markdown: ${message}\n`);
  process.exitCode = 1;
}

async function main(outArgument: string): Promise<void> {
  const options = await repositoryFormatterOptions();
  if (options === null) {
    fail('the repository formatter configuration was not found');
    return;
  }
  const outputRoot = containedOutputRoot(outArgument);
  if (typeof outputRoot !== 'string') {
    fail(outputRoot.refused);
    return;
  }
  const files = renderEefMarkdownFiles();
  const outcome = await writeAndVerify(outputRoot, files, options);
  if ('refused' in outcome) {
    fail(outcome.refused);
    return;
  }
  if (outcome.length > 0) {
    fail(
      `wrote ${String(files.length)} files to ${outputRoot}, but ${String(outcome.length)} are not in the repository formatter's normal form: ${outcome.join(', ')}`,
    );
    return;
  }
  process.stdout.write(
    `wrote ${String(files.length)} files to ${outputRoot}; all in the repository formatter's normal form\n`,
  );
}

const { values } = parseArgs({ options: { out: { type: 'string' } }, strict: true });
const outArgument = values.out?.trim() ?? '';

if (outArgument === '') {
  process.stderr.write('usage: render-eef-markdown --out <directory>\n');
  process.exitCode = 2;
} else {
  try {
    await main(outArgument);
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
}
