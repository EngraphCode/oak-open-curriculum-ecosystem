import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { defaultOwaRoot, emitJson, parseArgs, resolveFromCwd, usageError } from '../lib/cli.js';
import { assertRepository } from '../lib/repository.js';

interface ExecError {
  code?: string | number;
  stdout?: string;
  stderr?: string;
  message: string;
}

function asExecError(error: unknown): ExecError {
  const result: ExecError = { message: '' };
  if (typeof error !== 'object' || error === null) {
    return result;
  }
  if ('code' in error && (typeof error.code === 'string' || typeof error.code === 'number')) {
    result.code = error.code;
  }
  if ('stdout' in error && typeof error.stdout === 'string') {
    result.stdout = error.stdout;
  }
  if ('stderr' in error && typeof error.stderr === 'string') {
    result.stderr = error.stderr;
  }
  if ('message' in error && typeof error.message === 'string') {
    result.message = error.message;
  }
  return result;
}

interface ExecutionResult {
  exitCode: string | number;
  stdout: string;
  stderr: string;
}

const run = promisify(execFile);
const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.resolve(
  scriptRoot,
  '../fixtures/curriculum-export/missing-mv-refresh.test.ts.template',
);
const usage = `Usage: pnpm exec tsx scripts/curriculum-export-redirect.ts [options]

Options:
  --owa <path>     OWA checkout (default: sibling Oak-Web-Application)
  --output <path>  Write normalized JSON evidence to this path instead of stdout`;

function optionalString(value: string | boolean | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

const args = parseArgs(process.argv.slice(2), [], ['owa', 'output']);
const owaRoot = resolveFromCwd(optionalString(args.owa), defaultOwaRoot);

function normalizeLog(value: string, temporaryRoot: string): string {
  return value
    .split(owaRoot)
    .join('<OWA_ROOT>')
    .split(temporaryRoot)
    .join('<TEMP_ROOT>')
    .replaceAll('\\', '/');
}

async function main(): Promise<void> {
  const owa = await assertRepository(owaRoot, 'oak-web-application');
  const jestBin = path.join(owaRoot, 'node_modules/.bin/jest');
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'oak-curriculum-redirect-'));
  const testPath = path.join(temporaryRoot, 'missing-mv-refresh.test.ts');
  const envLocalPath = path.join(owaRoot, '.env.local');
  let envLocalBefore: Buffer | null = null;
  try {
    envLocalBefore = await readFile(envLocalPath);
  } catch (error) {
    if (asExecError(error).code !== 'ENOENT') {
      throw error;
    }
  }

  try {
    const template = await readFile(fixturePath, 'utf8');
    const staged = template
      .replace(
        '"__OWA_HANDLER_IMPORT__"',
        JSON.stringify(path.join(owaRoot, 'src/pages/api/curriculum-downloads/index')),
      )
      .replace(
        '"__OWA_MOCKS_IMPORT__"',
        JSON.stringify(path.join(owaRoot, 'src/__tests__/__helpers__/createNextApiMocks')),
      );
    await writeFile(testPath, staged, 'utf8');

    const commandArgs = [
      '--runInBand',
      '--no-cache',
      '--collectCoverage=false',
      '--roots',
      temporaryRoot,
      path.join(owaRoot, 'src'),
      '--runTestsByPath',
      testPath,
    ];
    const started = process.hrtime.bigint();
    let execution: ExecutionResult;
    try {
      const result = await run(jestBin, commandArgs, {
        cwd: owaRoot,
        env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
        maxBuffer: 16 * 1024 * 1024,
      });
      execution = { exitCode: 0, stdout: result.stdout, stderr: result.stderr };
    } catch (error) {
      const execError = asExecError(error);
      execution = {
        exitCode: execError.code ?? 1,
        stdout: execError.stdout ?? '',
        stderr: execError.stderr ?? execError.message,
      };
    }
    const durationMilliseconds = Number(process.hrtime.bigint() - started) / 1_000_000;

    const combined = `${execution.stdout}\n${execution.stderr}`;
    const passed = execution.exitCode === 0 && /1 passed/.test(combined);
    await emitJson(
      {
        schemaVersion: 1,
        input: owa,
        fixture: 'fixtures/curriculum-export/missing-mv-refresh.test.ts.template',
        outcome: passed ? 'reproduced' : 'not-reproduced',
        assertions: {
          firstResponse: '307 containing mvRefreshTime=1000',
          followedResponse: '307 containing mvRefreshTime=1001',
        },
        execution: {
          exitCode: execution.exitCode,
          durationMilliseconds: Math.round(durationMilliseconds),
          stdout: normalizeLog(execution.stdout, temporaryRoot),
          stderr: normalizeLog(execution.stderr, temporaryRoot),
        },
      },
      optionalString(args.output),
    );
    if (!passed) {
      process.exitCode = 1;
    }
  } finally {
    if (envLocalBefore === null) {
      await rm(envLocalPath, { force: true });
    } else {
      await writeFile(envLocalPath, envLocalBefore);
    }
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

try {
  await main();
} catch (error) {
  const details = error instanceof Error ? (error.stack ?? error.message) : String(error);
  usageError(details, usage);
}
