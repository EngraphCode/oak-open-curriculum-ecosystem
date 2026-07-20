import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// The record is the nested projection oak-open-curriculum-ecosystem/research/
// web-app-deconstruction and the measured repositories are siblings of the
// OCE checkout, so the common checkout parent is FIVE levels above this
// package (packages -> web-app-deconstruction -> research -> OCE -> parent).
export const workspaceRoot = path.resolve(packageRoot, '../../../../..');
export const defaultOwaRoot = path.join(workspaceRoot, 'Oak-Web-Application');
export const defaultComponentsRoot = path.join(workspaceRoot, 'oak-components');

export function parseArgs(
  argv: string[],
  booleanFlags: string[] = [],
  valueFlags?: string[],
): Record<string, string | boolean> {
  const booleans = new Set(booleanFlags);
  // When a command declares its value-option set, unknown keys REFUSE: a
  // typo such as `--owaa` must never silently fall through to a default
  // checkout and produce normal-looking (wrong) research evidence.
  const allowedValues = valueFlags === undefined ? undefined : new Set(valueFlags);
  const values: Record<string, string | boolean> = {};

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--') {
      continue;
    }
    if (!argument.startsWith('--')) {
      throw new Error(`Unexpected positional argument: ${argument}`);
    }

    const key = argument.slice(2);
    if (booleans.has(key)) {
      values[key] = true;
      continue;
    }
    if (allowedValues !== undefined && !allowedValues.has(key)) {
      throw new Error(`Unknown option: --${key}`);
    }

    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }
    values[key] = value;
    index += 1;
  }

  return values;
}

export function resolveFromCwd(
  value: string | undefined,
  fallback: string,
  cwd: string = process.cwd(),
): string {
  return path.resolve(cwd, value ?? fallback);
}

export async function emitJson(result: unknown, outputPath?: string): Promise<void> {
  const json = `${JSON.stringify(result, null, 2)}\n`;
  if (!outputPath) {
    process.stdout.write(json);
    return;
  }

  const resolved = path.resolve(process.cwd(), outputPath);
  await mkdir(path.dirname(resolved), { recursive: true });
  await writeFile(resolved, json, 'utf8');
  process.stderr.write(`Wrote ${path.relative(process.cwd(), resolved)}\n`);
}

export function usageError(message: string, usage: string): void {
  process.stderr.write(`${message}\n\n${usage}\n`);
  process.exitCode = 2;
}
