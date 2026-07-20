import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { execFile as execFileCallback } from 'node:child_process';

const execFile = promisify(execFileCallback);

interface PackageManifest {
  name?: string;
  version: string;
}

export interface RepositoryInfo {
  package: string;
  version: string;
  revision: string;
  clean: boolean;
}

export async function assertRepository(
  root: string,
  expectedName: string,
): Promise<RepositoryInfo> {
  const manifestPath = path.join(root, 'package.json');
  await access(path.join(root, '.git'));
  const manifest: PackageManifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (manifest.name !== expectedName) {
    throw new Error(
      `Expected ${root} to contain package ${expectedName}; found ${manifest.name ?? 'no name'}`,
    );
  }

  const [{ stdout: revision }, { stdout: status }] = await Promise.all([
    execFile('git', ['-C', root, 'rev-parse', 'HEAD']),
    execFile('git', ['-C', root, 'status', '--porcelain']),
  ]);

  return {
    package: manifest.name,
    version: manifest.version,
    revision: revision.trim(),
    clean: status.length === 0,
  };
}

export async function resolvePackage(
  requireFrom: NodeRequire,
  packageName: string,
): Promise<string> {
  try {
    return requireFrom.resolve(packageName);
  } catch {
    throw new Error(
      `Cannot resolve ${packageName} from the measured checkout. Install that checkout's locked dependencies first.`,
    );
  }
}
