import { execFile as execFileCallback } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import type { ExecFileOptions } from 'node:child_process';

import { emitJson, parseArgs, resolveFromCwd, usageError, workspaceRoot } from '../lib/cli.js';
import {
  collectJsonDifferencePaths,
  contractProjection,
  summarizeOpenApiDocument,
} from '../lib/openapi-contract-comparison.js';

interface PackageManifest {
  name?: string;
  version?: string;
}

interface OpenApiDocument extends Record<string, unknown> {
  openapi?: unknown;
  info?: { version?: unknown } | null;
  paths?: Record<string, unknown> | null;
  components?: { schemas?: Record<string, unknown> | null } | null;
}

interface LockfileInfo {
  path: string;
  sha256: string;
  installedSha256: string | null;
  installedMatches: boolean | null;
}

interface Snapshot {
  root: string;
  revision: string;
  package: string | undefined;
  version: string | undefined;
  lockfile: LockfileInfo;
}

interface CommandResult {
  stdout: string;
  stderr: string;
}

function optionalString(value: string | boolean | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

const execFile = promisify(execFileCallback);
const defaults = {
  oakOpenApi: path.join(workspaceRoot, 'oak-openapi'),
  oce: path.join(workspaceRoot, 'oak-open-curriculum-ecosystem'),
};
const usage = `Usage: pnpm exec tsx scripts/openapi-oce-contract-comparison.ts [options]

Options:
  --oak-openapi <path>  oak-openapi checkout (default: sibling oak-openapi)
  --oce <path>          OCE checkout (default: sibling oak-open-curriculum-ecosystem)
  --output <path>       Write normalized JSON evidence instead of stdout`;
const args = parseArgs(process.argv.slice(2), [], ['oak-openapi', 'oce', 'output']);
const roots = {
  oakOpenApi: resolveFromCwd(optionalString(args['oak-openapi']), defaults.oakOpenApi),
  oce: resolveFromCwd(optionalString(args.oce), defaults.oce),
};

async function run(
  command: string,
  arguments_: readonly string[],
  options: Omit<ExecFileOptions, 'encoding'> = {},
): Promise<CommandResult> {
  return execFile(command, arguments_, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });
}

async function git(root: string, arguments_: readonly string[]): Promise<string> {
  const { stdout } = await run('git', ['-C', root, ...arguments_]);
  return stdout;
}

function sha256(source: string): string {
  return createHash('sha256').update(source).digest('hex');
}

async function cleanSnapshot(
  root: string,
  expectedPackage: string,
  { validateInstalledLockfile = false }: { validateInstalledLockfile?: boolean } = {},
): Promise<Snapshot> {
  const lockfilePath = 'pnpm-lock.yaml';
  const [revision, status, manifestSource, lockfileSource] = await Promise.all([
    git(root, ['rev-parse', 'HEAD']),
    git(root, ['status', '--porcelain']),
    git(root, ['show', 'HEAD:package.json']),
    git(root, ['show', `HEAD:${lockfilePath}`]),
  ]);
  const manifest: PackageManifest = JSON.parse(manifestSource);
  if (manifest.name !== expectedPackage) {
    throw new Error(
      `Expected ${root} to contain ${expectedPackage}; found ${manifest.name ?? 'no package name'}`,
    );
  }
  if (status.length > 0) {
    throw new Error(
      `${root} has working-tree changes; this runtime comparison requires a clean tree because it imports source files`,
    );
  }
  const lockfileSha256 = sha256(lockfileSource);
  let installedLockfileSha256: string | null = null;
  if (validateInstalledLockfile) {
    let installedLockfile: string;
    try {
      installedLockfile = await readFile(path.join(root, 'node_modules/.pnpm/lock.yaml'), 'utf8');
    } catch {
      throw new Error(
        `${root} has no pnpm installed-lock snapshot; install the pinned dependencies before running this comparison`,
      );
    }
    installedLockfileSha256 = sha256(installedLockfile);
    if (installedLockfileSha256 !== lockfileSha256) {
      throw new Error(
        `${root} node_modules was installed from a different lockfile; committed=${lockfileSha256} installed=${installedLockfileSha256}`,
      );
    }
  }
  return {
    root,
    revision: revision.trim(),
    package: manifest.name,
    version: manifest.version,
    lockfile: {
      path: lockfilePath,
      sha256: lockfileSha256,
      installedSha256: installedLockfileSha256,
      installedMatches: validateInstalledLockfile ? true : null,
    },
  };
}

async function servedProviderDocument(
  snapshot: Snapshot,
): Promise<{ document: OpenApiDocument; stderr: string }> {
  const source = `
import { createRequire, syncBuiltinESMExports } from 'node:module';
const require = createRequire(import.meta.url);
const blocked = (surface) => () => {
  throw new Error('Network access blocked by research evidence harness: ' + surface);
};
for (const [moduleName, methods] of Object.entries({
  'node:http': ['get', 'request'],
  'node:https': ['get', 'request'],
  'node:net': ['connect', 'createConnection'],
  'node:tls': ['connect'],
  'node:dgram': ['createSocket'],
  'node:dns': ['lookup', 'resolve', 'resolve4', 'resolve6'],
})) {
  const module = require(moduleName);
  for (const method of methods) module[method] = blocked(moduleName + '.' + method);
}
syncBuiltinESMExports();
globalThis.fetch = blocked('fetch');
const { GET } = await import('./src/app/api/v0/swagger.json/route.ts');
const response = GET();
process.stdout.write(await response.text());
`;
  const env = {
    LANG: 'C',
    LC_ALL: 'C',
    NODE_ENV: 'production',
    OAK_GRAPHQL_HOST: 'http://127.0.0.1',
    OAK_GRAPHQL_SECRET: 'research-evidence-placeholder',
    UPSTASH_REDIS_REST_URL: 'https://example.invalid',
    UPSTASH_REDIS_REST_TOKEN: 'research-evidence-placeholder',
    PRISMA_ACCELERATE_DATABASE_URL:
      'prisma://example.invalid/?api_key=research-evidence-placeholder',
    NEXT_PUBLIC_VERCEL_URL: 'open-api.thenational.academy',
    TZ: 'UTC',
    VERCEL_GIT_COMMIT_SHA: snapshot.revision,
  };
  const { stdout, stderr } = await run(
    process.execPath,
    ['--import', 'tsx', '--input-type=module', '-e', source],
    { cwd: snapshot.root, env },
  );
  const document: OpenApiDocument = JSON.parse(stdout);
  return { document, stderr: stderr.trim() };
}

async function cachedConsumerDocument(
  snapshot: Snapshot,
): Promise<{ cachePath: string; document: OpenApiDocument }> {
  const cachePath = 'packages/sdks/oak-sdk-codegen/schema-cache/api-schema-original.json';
  const source = await git(snapshot.root, ['show', `${snapshot.revision}:${cachePath}`]);
  const document: OpenApiDocument = JSON.parse(source);
  return { cachePath, document };
}

function canonicalText(value: unknown): string {
  return JSON.stringify(value);
}

function hash(value: unknown): string {
  return sha256(canonicalText(value));
}

interface Comparison {
  equal: boolean;
  providerSha256: string;
  consumerSha256: string;
  differenceCount: number;
  differencePaths: string[];
}

function comparison(left: unknown, right: unknown): Comparison {
  const differencePaths = collectJsonDifferencePaths(left, right);
  return {
    equal: differencePaths.length === 0,
    providerSha256: hash(left),
    consumerSha256: hash(right),
    differenceCount: differencePaths.length,
    differencePaths,
  };
}

async function main(): Promise<void> {
  const [providerSnapshot, consumerSnapshot] = await Promise.all([
    cleanSnapshot(roots.oakOpenApi, 'oak-openapi', {
      validateInstalledLockfile: true,
    }),
    cleanSnapshot(roots.oce, '@oaknational/open-curriculum-ecosystem'),
  ]);
  const [served, cached] = await Promise.all([
    servedProviderDocument(providerSnapshot),
    cachedConsumerDocument(consumerSnapshot),
  ]);

  const providerSemantic = contractProjection(served.document, {
    includeProse: true,
  });
  const consumerSemantic = contractProjection(cached.document, {
    includeProse: true,
  });
  const providerStructural = contractProjection(served.document, {
    includeProse: false,
  });
  const consumerStructural = contractProjection(cached.document, {
    includeProse: false,
  });

  await emitJson(
    {
      schemaVersion: 1,
      inputs: {
        provider: {
          package: providerSnapshot.package,
          version: providerSnapshot.version,
          revision: providerSnapshot.revision,
          lockfile: providerSnapshot.lockfile,
          runtime: { node: process.version },
        },
        consumer: {
          package: consumerSnapshot.package,
          version: consumerSnapshot.version,
          revision: consumerSnapshot.revision,
          cachePath: cached.cachePath,
          lockfile: consumerSnapshot.lockfile,
        },
      },
      method: {
        provider:
          'Import clean pinned oak-openapi source with fixed configuration after verifying the installed pnpm lock snapshot matches the committed lockfile; block common Node network entry points before dynamic route import',
        consumer: 'Read the OCE committed cache from its Git HEAD blob',
        semantic:
          'Remove top-level deployment metadata and bearerFormat, then compare canonical JSON while retaining descriptions, summaries and examples',
        structural:
          'Additionally remove descriptions, summaries and examples before canonical comparison',
        qualification:
          'Equality establishes document correspondence under the stated projection, not runtime response, policy, data-completeness or consumer compatibility. The in-process network guard is not OS isolation, and matching lockfiles do not content-verify installed dependency files',
      },
      provider: summarizeOpenApiDocument(served.document),
      consumer: summarizeOpenApiDocument(cached.document),
      comparisons: {
        semantic: comparison(providerSemantic, consumerSemantic),
        structural: comparison(providerStructural, consumerStructural),
      },
      providerStderr: served.stderr,
    },
    optionalString(args.output),
  );
}

try {
  await main();
} catch (error) {
  const details = error instanceof Error ? (error.stack ?? error.message) : String(error);
  usageError(details, usage);
}
