import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { brotliCompressSync, gzipSync } from 'node:zlib';

import {
  defaultComponentsRoot,
  defaultOwaRoot,
  emitJson,
  parseArgs,
  resolveFromCwd,
  usageError,
} from '../lib/cli.js';
import { codeUnitCompare } from '../lib/compare.js';
import { assertRepository, resolvePackage } from '../lib/repository.js';
import type { RepositoryInfo } from '../lib/repository.js';

interface CompressedSizes {
  rawBytes: number;
  gzipBytes: number;
  brotliBytes: number;
}

interface NodeProbeResult {
  label: string;
  exitCode: number;
  stdout: string;
  stderr: string;
}

interface ScenarioDefinition {
  fixture: string;
  expected: string;
}

interface PackageManifest {
  name: string;
  version: string;
  main: string;
  module: string;
  types: string;
}

interface TreeShakingEntry extends CompressedSizes {
  exportName: string;
  externalImports: string[];
}

interface ArtifactEvidence {
  installedPackage: {
    name: string;
    version: string;
    main: string;
    module: string;
    types: string;
    hasExportsMap: boolean;
    hasSideEffectsDeclaration: boolean;
    distributionFileCount: number;
  };
  artifactSizes: Record<string, CompressedSizes>;
  runtimeExportCount: number;
  runtimeNames: string[];
  treeShaking: TreeShakingEntry[];
  nodeCompatibility: NodeProbeResult[];
}

interface RouteMetrics {
  route: string | null;
  firstLoad: string | null;
}

interface NextExecution {
  exitCode: number;
  stdout: string;
  stderr: string;
}

interface NextScenarioResult {
  name: string;
  fixture: string;
  expected: string;
  expectedObserved: boolean;
  exitCode: number;
  durationMilliseconds: number;
  routeMetrics: RouteMetrics | null;
  stdout: string;
  stderr: string;
}

interface NextEvidence {
  nextVersion: string;
  scenarios: NextScenarioResult[];
}

interface EvidenceResult {
  schemaVersion: number;
  inputs: { owa: RepositoryInfo; components: RepositoryInfo };
  environment: { node: string; platform: string; architecture: string };
  artifact?: ArtifactEvidence;
  next?: NextEvidence;
}

interface CaughtError {
  code?: number;
  stdout?: string;
  stderr?: string;
  message: string;
  stack?: string;
}

function stringOption(value: string | boolean | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asCaughtError(error: unknown): CaughtError {
  const result: CaughtError = {
    message: error instanceof Error ? error.message : String(error),
  };
  if (typeof error === 'object' && error !== null) {
    if ('code' in error && typeof error.code === 'number') {
      result.code = error.code;
    }
    if ('stdout' in error && typeof error.stdout === 'string') {
      result.stdout = error.stdout;
    }
    if ('stderr' in error && typeof error.stderr === 'string') {
      result.stderr = error.stderr;
    }
    if ('stack' in error && typeof error.stack === 'string') {
      result.stack = error.stack;
    }
  }
  return result;
}

const run = promisify(execFile);
const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const fixtureRoot = path.resolve(scriptRoot, '../fixtures/next-app');
const usage = `Usage: pnpm exec tsx scripts/oak-components-runtime.ts [options]

Options:
  --owa <path>          OWA checkout containing the installed Components artifact
  --components <path>   Oak Components checkout containing Rollup and Terser
  --scenarios <names>   Comma-separated Next scenarios (default: all)
  --skip-next           Run artifact, tree-shaking and Node probes only
  --only-next           Run Next probes only
  --output <path>       Write normalized JSON evidence to this path instead of stdout

Scenarios: baseline, client-oak-box, client-lesson-bottom-nav,
           server-oak-box, server-tokens`;

const args = parseArgs(
  process.argv.slice(2),
  ['skip-next', 'only-next'],
  ['owa', 'components', 'output', 'scenarios'],
);
if (args['skip-next'] && args['only-next']) {
  usageError('--skip-next and --only-next cannot be combined', usage);
  process.exit(2);
}
const owaRoot = resolveFromCwd(stringOption(args.owa), defaultOwaRoot);
const componentsRoot = resolveFromCwd(stringOption(args.components), defaultComponentsRoot);
const packageName = '@oaknational/oak-components';

const scenarios: Record<string, ScenarioDefinition> = {
  baseline: { fixture: 'baseline.server.tsx', expected: 'success' },
  'client-oak-box': { fixture: 'oak-box.client.tsx', expected: 'success' },
  'client-lesson-bottom-nav': {
    fixture: 'lesson-bottom-nav.client.tsx',
    expected: 'success',
  },
  'server-oak-box': {
    fixture: 'oak-box.server.tsx',
    expected: 'createContext-failure',
  },
  'server-tokens': {
    fixture: 'tokens.server.tsx',
    expected: 'createContext-failure',
  },
};

function normalize(value: string, temporaryRoot: string): string {
  return value
    .split(owaRoot)
    .join('<OWA_ROOT>')
    .split(componentsRoot)
    .join('<COMPONENTS_ROOT>')
    .split(temporaryRoot)
    .join('<TEMP_ROOT>')
    .replaceAll('\\', '/')
    .replaceAll(/\u001b\[[0-9;]*m/g, '');
}

async function filesBelow(root: string): Promise<string[]> {
  const files: string[] = [];
  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(absolute);
      } else if (entry.isFile()) {
        files.push(absolute);
      }
    }
  }
  await visit(root);
  return files.sort(codeUnitCompare);
}

function compressedSizes(buffer: Buffer): CompressedSizes {
  return {
    rawBytes: buffer.byteLength,
    gzipBytes: gzipSync(buffer).byteLength,
    brotliBytes: brotliCompressSync(buffer).byteLength,
  };
}

async function isolatedNodeProbe(
  label: string,
  code: string,
  cwd: string,
  temporaryRoot: string,
): Promise<NodeProbeResult> {
  try {
    const result = await run(process.execPath, ['--input-type=module', '--eval', code], {
      cwd,
      maxBuffer: 4 * 1024 * 1024,
    });
    return {
      label,
      exitCode: 0,
      stdout: normalize(result.stdout, temporaryRoot).trim(),
      stderr: normalize(result.stderr, temporaryRoot).trim(),
    };
  } catch (error) {
    const caught = asCaughtError(error);
    return {
      label,
      exitCode: caught.code ?? 1,
      stdout: normalize(caught.stdout ?? '', temporaryRoot).trim(),
      stderr: normalize(caught.stderr ?? caught.message, temporaryRoot).trim(),
    };
  }
}

async function artifactEvidence(
  requireFromOwa: NodeRequire,
  requireFromComponents: NodeRequire,
  temporaryRoot: string,
): Promise<ArtifactEvidence> {
  const manifestPath = await resolvePackage(requireFromOwa, `${packageName}/package.json`);
  const packageRoot = path.dirname(manifestPath);
  const manifest: PackageManifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const distRoot = path.join(packageRoot, 'dist');
  const distributionFiles = await filesBelow(distRoot);
  const artifactSizes: Record<string, CompressedSizes> = {};
  for (const file of distributionFiles) {
    const relative = path.relative(packageRoot, file).split(path.sep).join('/');
    artifactSizes[relative] = compressedSizes(await readFile(file));
  }

  const runtimeNames = Object.keys(requireFromOwa(packageName)).sort(codeUnitCompare);
  const esmPath = path.join(packageRoot, manifest.module);
  const cjsPath = path.join(packageRoot, manifest.main);

  const rollupPath = await resolvePackage(requireFromComponents, 'rollup');
  const terserPath = await resolvePackage(requireFromComponents, '@rollup/plugin-terser');
  const { rollup } = requireFromComponents(rollupPath);
  const terser = requireFromComponents(terserPath).default;
  const selectedNames = [
    'oakColorTokens',
    'OakBox',
    'OakPrimaryButton',
    'OakPupilJourneyLayout',
    'OakDownloadCard',
    'OakLessonBottomNav',
    'OakLessonLayout',
    'OakQuizMatch',
    'OakCookieConsent',
  ];
  const treeShaking: TreeShakingEntry[] = [];

  for (const exportName of [...selectedNames, '*']) {
    const entryPath = path.join(
      temporaryRoot,
      `entry-${exportName === '*' ? 'all' : exportName}.mjs`,
    );
    const source =
      exportName === '*'
        ? `export * from ${JSON.stringify(esmPath)};\n`
        : `export { ${exportName} as value } from ${JSON.stringify(esmPath)};\n`;
    await writeFile(entryPath, source, 'utf8');
    const bundle = await rollup({
      input: entryPath,
      external: (identifier: string): boolean =>
        !identifier.startsWith('.') && !path.isAbsolute(identifier),
      treeshake: { moduleSideEffects: false },
      onwarn(warning: { code?: string }, warn: (warning: { code?: string }) => void): void {
        if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') {
          warn(warning);
        }
      },
    });
    const generated = await bundle.generate({
      format: 'es',
      compact: true,
      plugins: [terser()],
    });
    await bundle.close();
    const chunk = generated.output.find((output: { type: string }) => output.type === 'chunk');
    if (!chunk) {
      throw new Error(`Rollup emitted no chunk for ${exportName}`);
    }
    const buffer = Buffer.from(chunk.code);
    treeShaking.push({
      exportName: exportName === '*' ? 'all exports' : exportName,
      ...compressedSizes(buffer),
      externalImports: chunk.imports.slice().sort(),
    });
  }

  const probes = await Promise.all([
    isolatedNodeProbe(
      'package root require',
      `const {createRequire}=await import('node:module');const r=createRequire(${JSON.stringify(path.join(owaRoot, 'package.json'))});console.log(Object.keys(r(${JSON.stringify(packageName)})).length);`,
      owaRoot,
      temporaryRoot,
    ),
    isolatedNodeProbe(
      'package root ESM import',
      `const value=await import(${JSON.stringify(packageName)});console.log(Object.keys(value).length);`,
      owaRoot,
      temporaryRoot,
    ),
    isolatedNodeProbe(
      'explicit CJS require',
      `const {createRequire}=await import('node:module');const r=createRequire(${JSON.stringify(path.join(owaRoot, 'package.json'))});console.log(Object.keys(r(${JSON.stringify(cjsPath)})).length);`,
      owaRoot,
      temporaryRoot,
    ),
    isolatedNodeProbe(
      'direct native ESM import',
      `const value=await import(${JSON.stringify(pathToFileURL(esmPath).href)});console.log(Object.keys(value).length);`,
      owaRoot,
      temporaryRoot,
    ),
  ]);

  return {
    installedPackage: {
      name: manifest.name,
      version: manifest.version,
      main: manifest.main,
      module: manifest.module,
      types: manifest.types,
      hasExportsMap: Object.hasOwn(manifest, 'exports'),
      hasSideEffectsDeclaration: Object.hasOwn(manifest, 'sideEffects'),
      distributionFileCount: distributionFiles.length,
    },
    artifactSizes,
    runtimeExportCount: runtimeNames.length,
    runtimeNames,
    treeShaking,
    nodeCompatibility: probes,
  };
}

function probeManifestName(scenarioName: string): string {
  return `oak-probe-${scenarioName}`;
}

function parseRouteMetrics(output: string): RouteMetrics | null {
  const clean = output.replaceAll(/\u001b\[[0-9;]*m/g, '');
  const routeLine = clean.split('\n').find((line) => /(?:^|\s)[┌├└]?\s*[○ƒ]\s+\//u.test(line));
  if (!routeLine) {
    return null;
  }
  const sizes = [...routeLine.matchAll(/([0-9.]+)\s*(B|kB|MB)/g)].map(
    (match) => `${match[1]} ${match[2]}`,
  );
  return { route: sizes[0] ?? null, firstLoad: sizes[1] ?? null };
}

async function nextEvidence(
  requireFromOwa: NodeRequire,
  temporaryRoot: string,
): Promise<NextEvidence> {
  const scenariosArg = stringOption(args.scenarios);
  const selected = scenariosArg
    ? scenariosArg.split(',').map((name) => name.trim())
    : Object.keys(scenarios);
  const unknown = selected.filter((name) => !scenarios[name]);
  if (unknown.length) {
    throw new Error(`Unknown Next scenarios: ${unknown.join(', ')}`);
  }

  const nextPackagePath = await resolvePackage(requireFromOwa, 'next/package.json');
  const nextPackage: { version: string } = JSON.parse(await readFile(nextPackagePath, 'utf8'));
  const nextVersion = nextPackage.version;
  const nextBin = await resolvePackage(requireFromOwa, 'next/dist/bin/next');
  const nodeModules = path.join(owaRoot, 'node_modules');
  const results: NextScenarioResult[] = [];

  for (const name of selected) {
    const definition = scenarios[name];
    const fixtureDirectory = path.join(temporaryRoot, name);
    const appDirectory = path.join(fixtureDirectory, 'app');
    await mkdir(appDirectory, { recursive: true });
    await Promise.all([
      cp(path.join(fixtureRoot, 'layout.tsx'), path.join(appDirectory, 'layout.tsx')),
      cp(path.join(fixtureRoot, definition.fixture), path.join(appDirectory, 'page.tsx')),
      writeFile(
        path.join(fixtureDirectory, 'package.json'),
        `${JSON.stringify({ name: probeManifestName(name), private: true }, null, 2)}\n`,
        'utf8',
      ),
    ]);
    await symlink(nodeModules, path.join(fixtureDirectory, 'node_modules'), 'junction');

    const started = process.hrtime.bigint();
    let execution: NextExecution;
    try {
      const result = await run(process.execPath, [nextBin, 'build'], {
        cwd: fixtureDirectory,
        env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
        maxBuffer: 32 * 1024 * 1024,
      });
      execution = { exitCode: 0, stdout: result.stdout, stderr: result.stderr };
    } catch (error) {
      const caught = asCaughtError(error);
      execution = {
        exitCode: caught.code ?? 1,
        stdout: caught.stdout ?? '',
        stderr: caught.stderr ?? caught.message,
      };
    }
    const durationMilliseconds = Number(process.hrtime.bigint() - started) / 1_000_000;
    const combined = `${execution.stdout}\n${execution.stderr}`;
    const expectedObserved =
      definition.expected === 'success'
        ? execution.exitCode === 0
        : execution.exitCode !== 0 && /createContext is not a function/.test(combined);
    results.push({
      name,
      fixture: `fixtures/next-app/${definition.fixture}`,
      expected: definition.expected,
      expectedObserved,
      exitCode: execution.exitCode,
      durationMilliseconds: Math.round(durationMilliseconds),
      routeMetrics: parseRouteMetrics(combined),
      stdout: normalize(execution.stdout, temporaryRoot),
      stderr: normalize(execution.stderr, temporaryRoot),
    });
  }

  return { nextVersion, scenarios: results };
}

async function main(): Promise<void> {
  const [owa, components] = await Promise.all([
    assertRepository(owaRoot, 'oak-web-application'),
    assertRepository(componentsRoot, '@oaknational/oak-components'),
  ]);
  const requireFromOwa = createRequire(path.join(owaRoot, 'package.json'));
  const requireFromComponents = createRequire(path.join(componentsRoot, 'package.json'));
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'oak-components-runtime-'));

  try {
    const result: EvidenceResult = {
      schemaVersion: 1,
      inputs: { owa, components },
      environment: {
        node: process.version,
        platform: process.platform,
        architecture: process.arch,
      },
    };
    if (!args['only-next']) {
      result.artifact = await artifactEvidence(
        requireFromOwa,
        requireFromComponents,
        temporaryRoot,
      );
    }
    if (!args['skip-next']) {
      result.next = await nextEvidence(requireFromOwa, temporaryRoot);
    }
    await emitJson(result, stringOption(args.output));

    if (result.next?.scenarios.some((scenario) => !scenario.expectedObserved)) {
      process.exitCode = 1;
    }
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

try {
  await main();
} catch (error) {
  const caught = asCaughtError(error);
  usageError(caught.stack ?? caught.message, usage);
}
