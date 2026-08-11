#!/usr/bin/env node
/**
 * CLI for the skills adapter generator.
 *
 * Usage:
 *   skills-adapter-generate            # generate adapters into the current repo
 *   skills-adapter-generate --check    # exit non-zero if any adapter is stale
 *   skills-adapter-generate --clear    # clear all adapter dirs before generating
 */
import { join } from 'node:path';
import { argv, exit, stderr, stdout } from 'node:process';

import { checkAdapters } from '../skills-adapter-generate/checker.js';
import { clearGeneratedAdapters, readLockedSkillIds } from '../skills-adapter-generate/clear.js';
import { generateAdapters, generateExitCode } from '../skills-adapter-generate/generator.js';

interface CliFlags {
  readonly clear: boolean;
  readonly check: boolean;
  readonly prefix: string;
}

function parseFlags(args: readonly string[]): CliFlags {
  let clear = false;
  let check = false;
  let prefix = '';
  for (const arg of args) {
    if (arg === '--clear') {
      clear = true;
    } else if (arg === '--check') {
      check = true;
    } else if (arg.startsWith('--prefix=')) {
      prefix = arg.slice('--prefix='.length);
    }
  }
  return { clear, check, prefix };
}

function reportCheckFailures(result: Awaited<ReturnType<typeof checkAdapters>>): void {
  if (result.skipped.length > 0) {
    stderr.write(
      `Skipped directories (content no harness can summon): ${result.skipped.join(', ')}\n`,
    );
  }
  if (result.duplicates.length > 0) {
    stderr.write(
      `Duplicate canonical leaf ids (the flat adapter namespace cannot hold both): ${result.duplicates.join(', ')}\n`,
    );
  }
  if (result.missing.length > 0) {
    const missingList = result.missing.map((p) => `  ${p}`).join('\n');
    stderr.write(`Missing projection files:\n${missingList}\n`);
  }
  if (result.drifted.length > 0) {
    const driftedList = result.drifted.map((p) => `  ${p}`).join('\n');
    stderr.write(`Drifted projection files:\n${driftedList}\n`);
  }
  if (result.orphaned.length > 0) {
    const orphanedList = result.orphaned.map((p) => `  ${p}`).join('\n');
    stderr.write(
      `Orphaned carried files (canonical source gone; a generator run prunes them):\n${orphanedList}\n`,
    );
  }
  stderr.write('Run `pnpm skills:check` after regenerating to confirm.\n');
}

async function runCheck(repoRoot: string, prefix: string): Promise<number> {
  const result = await checkAdapters({ repoRoot, prefix });
  if (result.canonicalCount === 0) {
    stderr.write(
      'Zero canonical skills discovered — a missing or unreadable `.agent/skills` root, not an empty estate. Refusing to certify.\n',
    );
    return 1;
  }
  const failureCount =
    result.drifted.length +
    result.missing.length +
    result.orphaned.length +
    result.duplicates.length +
    result.skipped.length;
  if (failureCount === 0) {
    stdout.write(
      `All adapters are up to date (${String(result.canonicalCount)} canonical skills, ` +
        `${String(result.carriedFileCount)} carried supporting files per surface).\n`,
    );
    return 0;
  }
  reportCheckFailures(result);
  return 1;
}

async function runGenerate(repoRoot: string, flags: CliFlags): Promise<number> {
  if (flags.clear) {
    const lockResult = await readLockedSkillIds(join(repoRoot, 'skills-lock.json'));
    if (lockResult.kind === 'error') {
      stderr.write(`--clear refused: ${lockResult.message}\n`);
      return 1;
    }
    const clearResult = await clearGeneratedAdapters(repoRoot, lockResult.value);
    if (clearResult.kind === 'error') {
      stderr.write(`--clear failed: ${clearResult.message}\n`);
      return 1;
    }
    stdout.write(
      `Cleared adapter directories (${String(lockResult.value.size)} lock-pinned preserved).\n`,
    );
  }
  const outcome = await generateAdapters({ repoRoot, prefix: flags.prefix });
  reportGenerateOutcome(outcome);
  if (outcome.written.length === 0 && outcome.skipped.length === 0) {
    stderr.write(
      'ERROR — no canonicals discovered under .agent/skills; wrong working directory?\n',
    );
    return 1;
  }
  return generateExitCode(outcome);
}

function reportGenerateOutcome(outcome: Awaited<ReturnType<typeof generateAdapters>>): void {
  stdout.write(`Wrote ${String(outcome.written.length)} projection files.\n`);
  if (outcome.pruned.length > 0) {
    const prunedList = outcome.pruned.map((p) => `  ${p}`).join('\n');
    stdout.write(
      `Pruned ${String(outcome.pruned.length)} orphaned carried files:\n${prunedList}\n`,
    );
  }
  if (outcome.duplicates.length > 0) {
    stderr.write(
      `ERROR — duplicate canonical leaf ids: ${outcome.duplicates.join(', ')}\n` +
        'The adapter namespace is flat; emission is refused so neither claimant silently shadows the other. ' +
        'Rename one canonical before regenerating.\n',
    );
  }
  if (outcome.skipped.length > 0) {
    stderr.write(
      `ERROR — directories with no readable SKILL-CANONICAL.md: ${outcome.skipped.join(', ')}\n` +
        'These entries hold content no harness can summon (a directory at any of the three ratified ' +
        'tiers without a parseable canonical, or a dead end below them). Fix the canonical before regenerating.\n',
    );
  }
}

async function main(): Promise<number> {
  const flags = parseFlags(argv.slice(2));
  const repoRoot = process.cwd();
  return flags.check ? await runCheck(repoRoot, flags.prefix) : await runGenerate(repoRoot, flags);
}

try {
  const code = await main();
  exit(code);
} catch (error: unknown) {
  stderr.write(`skills-adapter-generate failed: ${String(error)}\n`);
  exit(1);
}
