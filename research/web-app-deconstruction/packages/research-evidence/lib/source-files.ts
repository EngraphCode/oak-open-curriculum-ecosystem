import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);

const SOURCE_EXTENSION = /\.(?:ts|tsx)$/;
const EXCLUDED_PRODUCTION_PATH =
  /(?:^|\/)(?:__tests__|__mocks__|__snapshots__)(?:\/|$)|\.(?:test|spec|stories|mock)\.[^.]+$/;

export interface SourceFile {
  file: string;
  text: string;
}

export async function sourceFiles(root: string): Promise<string[]> {
  const repositoryRoot = path.dirname(root);
  const sourceDirectory = path.relative(repositoryRoot, root);
  const { stdout } = await run(
    'git',
    ['-C', repositoryRoot, 'ls-files', '-z', '--', sourceDirectory],
    { encoding: 'buffer', maxBuffer: 16 * 1024 * 1024 },
  );

  return stdout
    .toString('utf8')
    .split('\0')
    .filter((file) => SOURCE_EXTENSION.test(file))
    .map((file) => path.join(repositoryRoot, file))
    .sort();
}

export function isProductionFile(file: string, sourceRoot: string): boolean {
  const relative = path.relative(sourceRoot, file).split(path.sep).join('/');
  return !EXCLUDED_PRODUCTION_PATH.test(relative);
}

export async function readSources(files: string[]): Promise<SourceFile[]> {
  return Promise.all(files.map(async (file) => ({ file, text: await readFile(file, 'utf8') })));
}

export function normaliseRelative(root: string, file: string): string {
  return path.relative(root, file).split(path.sep).join('/');
}
