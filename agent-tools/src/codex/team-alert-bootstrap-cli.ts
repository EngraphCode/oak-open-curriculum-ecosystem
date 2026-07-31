#!/usr/bin/env node
import { argv, stderr, stdout } from 'node:process';

import { isErr } from '@oaknational/result';

import { resolveRepoRoot } from '../core/repo-root.js';
import {
  AGENTS_PATH,
  NODE_FILE_IO,
  checkTeamAlertBootstrap,
  generateTeamAlertBootstrap,
} from './team-alert-bootstrap.js';

async function main(): Promise<number> {
  const repoRoot = resolveRepoRoot(import.meta.url);
  if (argv.includes('--check')) {
    const outcome = await checkTeamAlertBootstrap(repoRoot, NODE_FILE_IO);
    if (isErr(outcome)) {
      stderr.write(`${formatError(outcome.error)}\n`);
      return 1;
    }
    if (outcome.value.upToDate) {
      stdout.write('Codex team-alert bootstrap projection is up to date.\n');
      return 0;
    }
    stderr.write(
      `Generated Codex team-alert projection is stale: ${AGENTS_PATH}\n` +
        `Regenerate with \`pnpm codex-team-alert-bootstrap:generate\` and ` +
        `commit the result.\n`,
    );
    return 1;
  }

  const generated = await generateTeamAlertBootstrap(repoRoot, NODE_FILE_IO);
  if (isErr(generated)) {
    stderr.write(`${formatError(generated.error)}\n`);
    return 1;
  }
  stdout.write(`Generated ${AGENTS_PATH}\n`);
  return 0;
}

try {
  process.exitCode = await main();
} catch (error: unknown) {
  stderr.write(`${formatError(error instanceof Error ? error : new Error(String(error)))}\n`);
  process.exitCode = 1;
}

function formatError(error: Error): string {
  return error.cause instanceof Error
    ? `${error.message}: ${formatError(error.cause)}`
    : error.message;
}
