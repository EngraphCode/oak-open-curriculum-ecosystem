#!/usr/bin/env node

/**
 * Writes the EEF corpus markdown projection — the corpus reference and one
 * file per strand — into a directory of the caller's choice. The rendering
 * itself is the pure `renderEefMarkdownFiles` in `src/`; this script only
 * writes, then verifies. Every target directory is asserted to sit inside the
 * output root before a byte is written, and every written file is checked
 * against this repository's own formatter configuration (resolved from the
 * script's location, never from the output directory), so a drift between
 * the renderer's normal form and the repository's formatter settings fails
 * here rather than in a consumer's gate.
 *
 * The script only writes. A file an earlier render produced that the current
 * corpus no longer does (a renamed or withdrawn strand) stays in the output
 * directory until the caller removes it, so a consumer that commits the set
 * renders into an empty directory or clears it first.
 *
 * Usage: `pnpm render:eef-markdown --out <directory>`
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { assertPathWithinBase } from '@oaknational/safe-path';
import { check, resolveConfig, type Options } from 'prettier';
import {
  renderEefMarkdownFiles,
  type RenderedMarkdownFile,
} from '../src/eef-strands/eef-markdown-files.js';

/** This repository's formatter configuration, resolved from where this script lives. */
async function repositoryFormatterOptions(): Promise<Options | null> {
  return resolveConfig(fileURLToPath(import.meta.url));
}

/** Write one rendered file under the output root, asserting containment first. */
function writeContained(outputRoot: string, file: RenderedMarkdownFile): void {
  const directory = join(outputRoot, dirname(file.path));
  mkdirSync(directory, { recursive: true });
  const containedDirectory = assertPathWithinBase(directory, outputRoot);
  writeFileSync(join(containedDirectory, basename(file.path)), file.text);
}

/**
 * Write every rendered file and verify each against the formatter options.
 *
 * @returns The paths of files that are not in the formatter's normal form.
 */
async function writeAndVerify(
  outputRoot: string,
  files: readonly RenderedMarkdownFile[],
  options: Options,
): Promise<readonly string[]> {
  const notNormal: string[] = [];
  for (const file of files) {
    writeContained(outputRoot, file);
    if (!(await check(file.text, { ...options, parser: 'markdown' }))) {
      notNormal.push(file.path);
    }
  }
  return notNormal;
}

async function main(outArgument: string): Promise<void> {
  const options = await repositoryFormatterOptions();
  if (options === null) {
    process.stderr.write(
      'render-eef-markdown: the repository formatter configuration was not found\n',
    );
    process.exitCode = 1;
    return;
  }
  const outputRoot = resolve(outArgument);
  mkdirSync(outputRoot, { recursive: true });
  const files = renderEefMarkdownFiles();
  const notNormal = await writeAndVerify(outputRoot, files, options);
  if (notNormal.length > 0) {
    process.stderr.write(
      `wrote ${String(files.length)} files to ${outputRoot}, but ${String(notNormal.length)} are not in the repository formatter's normal form: ${notNormal.join(', ')}\n`,
    );
    process.exitCode = 1;
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
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`render-eef-markdown: ${message}\n`);
    process.exitCode = 1;
  }
}
