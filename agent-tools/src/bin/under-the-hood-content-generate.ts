#!/usr/bin/env node
/**
 * CLI for the under-the-hood MCP content generator.
 *
 * Usage:
 *   under-the-hood-content-generate            # regenerate the committed module
 *   under-the-hood-content-generate --check    # exit non-zero if the module is stale
 */
import { argv, stderr, stdout } from 'node:process';

import { isErr } from '@oaknational/result';

import { resolveRepoRoot } from '../core/repo-root.js';
import {
  GENERATED_MODULE_PATH,
  NODE_FILE_IO,
  checkContentModule,
  generateContentModule,
} from '../under-the-hood-content-generate/generator.js';

async function main(): Promise<number> {
  const repoRoot = resolveRepoRoot(import.meta.url);
  if (argv.includes('--check')) {
    const outcome = await checkContentModule(repoRoot, NODE_FILE_IO);
    if (outcome.ok) {
      stdout.write(`${outcome.detail}\n`);
      return 0;
    }
    stderr.write(
      `${outcome.detail}\nRe-generate with \`pnpm under-the-hood-content:generate\` and commit ` +
        `the result.\n`,
    );
    return 1;
  }
  const generated = await generateContentModule(repoRoot, NODE_FILE_IO);
  if (isErr(generated)) {
    stderr.write(`${generated.error}\n`);
    return 1;
  }
  stdout.write(`Generated ${GENERATED_MODULE_PATH}\n`);
  return 0;
}

try {
  process.exitCode = await main();
} catch (error: unknown) {
  stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
