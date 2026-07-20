import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

import { assertRepository, resolvePackage } from './repository.js';
import { isProductionFile, normaliseRelative, readSources, sourceFiles } from './source-files.js';
import type { SourceFile } from './source-files.js';
import type * as TypeScriptNamespace from 'typescript';

type TypeScriptApi = typeof TypeScriptNamespace;

const run = promisify(execFile);

export interface ImportShapeInput {
  clauseIsTypeOnly: boolean;
  hasDefaultBinding: boolean;
  namedSpecifierTypeOnly: boolean[] | undefined;
}

interface ImportReference {
  specifier: string;
  runtime: boolean;
}

interface ExternalImport {
  package: string;
  files: number;
}

interface KnownSupportFiles {
  fixtureShaped: number;
  storybookDecorators: number;
  storybookMocks: number;
  sourceTestsSupport: number;
}

interface SourceInventory {
  allTrackedTypeScriptFiles: number;
  analysedTypeScriptFiles: number;
  knownSupportFilesWithinAnalysis: KnownSupportFiles;
  byTopLevelArea: Record<string, number>;
  componentFamilies: Record<string, number>;
}

interface ScopeInventory {
  sourcePopulation: string;
  analysisExclusions: string;
  analysisKnownInclusions: string;
  dependencyEdges: string;
  clientClosure: string;
}

interface AppRouterInventory {
  roles: Record<string, number>;
  routeModulesByFirstSegment: Record<string, number>;
}

interface PagesRouterInventory {
  pageModules: number;
  apiModules: number;
  getStaticPropsFiles: number;
  getStaticPathsFiles: number;
  getServerSidePropsFiles: number;
}

interface RoutingInventory {
  appRouter: AppRouterInventory;
  pagesRouter: PagesRouterInventory;
}

interface BoundariesInventory {
  allLocalEdges: number;
  runtimeShapedLocalEdges: number;
  crossAreaRuntimeShapedEdges: number;
  runtimeShapedDependencyMatrix: Record<string, number>;
  unresolvedLocalImports: string[];
  externalImportsByFileCount: ExternalImport[];
  useClientDirectiveRoots: number;
  useClientDirectiveClosureModules: number;
  useClientDirectiveClosureByTopLevelArea: Record<string, number>;
  moduleUseServerDirectiveFiles: number;
  filesContainingUseServerDirective: number;
  serverOnlyImportFiles: number;
  cyclicStronglyConnectedComponents: number;
  cyclicModules: number;
  largestCyclicStronglyConnectedComponents: string[][];
}

interface AssuranceInventory {
  definitions: {
    sourceTests: string;
    sourceStories: string;
    endToEndTests: string;
    workflowFiles: string;
    terraformFiles: string;
  };
  sourceTests: number;
  sourceStories: number;
  snapshots: number;
  endToEndTests: number;
  workflowFiles: number;
  customGithubActionSourceFiles: number;
  terraformFiles: number;
  configuredSurfaces: string[];
}

export interface OwaArchitectureInventory {
  input: Awaited<ReturnType<typeof assertRepository>>;
  scope: ScopeInventory;
  source: SourceInventory;
  routing: RoutingInventory;
  boundaries: BoundariesInventory;
  assurance: AssuranceInventory;
}

function expectDefined<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error('Expected value to be defined');
  }
  return value;
}

export function classifyArea(relativePath: string): string {
  const parts = relativePath.split('/');
  return parts[0] === 'src' ? (parts[1] ?? 'src-root') : (parts[0] ?? 'root');
}

export function appRouteRole(relativePath: string): string | null {
  if (!relativePath.startsWith('src/app/')) {
    return null;
  }
  const basename = path.posix.basename(relativePath).replace(/\.(?:ts|tsx)$/, '');
  const roles = new Set([
    'page',
    'route',
    'layout',
    'template',
    'loading',
    'error',
    'global-error',
    'not-found',
    'default',
    'sitemap',
    'robots',
  ]);
  return roles.has(basename) ? basename : null;
}

export function externalPackageRoot(specifier: string): string {
  if (specifier.startsWith('node:')) {
    return 'node:';
  }
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

export function importShapeHasRuntimeBinding({
  clauseIsTypeOnly,
  hasDefaultBinding,
  namedSpecifierTypeOnly,
}: ImportShapeInput): boolean {
  if (clauseIsTypeOnly) {
    return false;
  }
  if (hasDefaultBinding) {
    return true;
  }
  if (namedSpecifierTypeOnly) {
    return namedSpecifierTypeOnly.some((isTypeOnly) => !isTypeOnly);
  }
  return true;
}

export function stronglyConnectedComponents(
  nodes: string[],
  adjacency: Map<string, Set<string>>,
): string[][] {
  let nextIndex = 0;
  const indices = new Map<string, number>();
  const lowLinks = new Map<string, number>();
  const stack: string[] = [];
  const onStack = new Set<string>();
  const components: string[][] = [];

  function visit(node: string): void {
    indices.set(node, nextIndex);
    lowLinks.set(node, nextIndex);
    nextIndex += 1;
    stack.push(node);
    onStack.add(node);

    for (const target of adjacency.get(node) ?? []) {
      if (!indices.has(target)) {
        visit(target);
        lowLinks.set(
          node,
          Math.min(expectDefined(lowLinks.get(node)), expectDefined(lowLinks.get(target))),
        );
      } else if (onStack.has(target)) {
        lowLinks.set(
          node,
          Math.min(expectDefined(lowLinks.get(node)), expectDefined(indices.get(target))),
        );
      }
    }

    if (lowLinks.get(node) !== indices.get(node)) {
      return;
    }
    const component: string[] = [];
    let member: string;
    do {
      member = expectDefined(stack.pop());
      onStack.delete(member);
      component.push(member);
    } while (member !== node);
    components.push(component.sort());
  }

  for (const node of nodes) {
    if (!indices.has(node)) {
      visit(node);
    }
  }
  return components;
}

function increment(record: Record<string, number>, key: string, amount = 1): void {
  record[key] = (record[key] ?? 0) + amount;
}

function sortedRecord(record: Record<string, number>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(record).sort(([left], [right]) => left.localeCompare(right)),
  );
}

async function trackedFiles(root: string): Promise<string[]> {
  const { stdout } = await run('git', ['-C', root, 'ls-files', '-z'], {
    encoding: 'buffer',
    maxBuffer: 32 * 1024 * 1024,
  });
  return stdout.toString('utf8').split('\0').filter(Boolean).sort();
}

function importReferences(ts: TypeScriptApi, file: string, text: string): ImportReference[] {
  const sourceFile = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const references: ImportReference[] = [];

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteralLike(statement.moduleSpecifier)) {
      const clause = statement.importClause;
      const named = clause?.namedBindings;
      const namedSpecifierTypeOnly =
        named && ts.isNamedImports(named) && named.elements.length > 0
          ? named.elements.map((element) => element.isTypeOnly)
          : undefined;
      references.push({
        specifier: statement.moduleSpecifier.text,
        runtime: importShapeHasRuntimeBinding({
          clauseIsTypeOnly: clause?.isTypeOnly ?? false,
          hasDefaultBinding: clause?.name !== undefined,
          namedSpecifierTypeOnly,
        }),
      });
    }
    if (
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier &&
      ts.isStringLiteralLike(statement.moduleSpecifier)
    ) {
      references.push({
        specifier: statement.moduleSpecifier.text,
        runtime: !statement.isTypeOnly,
      });
    }
  }
  return references;
}

function hasModuleDirective(
  ts: TypeScriptApi,
  file: string,
  text: string,
  directive: string,
): boolean {
  const sourceFile = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  for (const statement of sourceFile.statements) {
    if (ts.isExpressionStatement(statement) && ts.isStringLiteralLike(statement.expression)) {
      if (statement.expression.text === directive) {
        return true;
      }
      continue;
    }
    break;
  }
  return false;
}

function resolveLocalImport(
  sourceFile: string,
  specifier: string,
  sourceRoot: string,
  knownFiles: Set<string>,
): string | null | undefined {
  let base: string;
  if (specifier.startsWith('@/')) {
    base = path.join(sourceRoot, specifier.slice(2));
  } else if (specifier.startsWith('.')) {
    base = path.resolve(path.dirname(sourceFile), specifier);
  } else {
    return null;
  }

  const withoutJsExtension = base.replace(/\.(?:js|jsx|mjs|cjs)$/, '');
  const candidates = [
    base,
    withoutJsExtension,
    `${withoutJsExtension}.ts`,
    `${withoutJsExtension}.tsx`,
    `${withoutJsExtension}.d.ts`,
    path.join(withoutJsExtension, 'index.ts'),
    path.join(withoutJsExtension, 'index.tsx'),
  ];
  return candidates.find((candidate) => knownFiles.has(candidate)) ?? undefined;
}

function routeGroup(relativePath: string): string {
  const remainder = relativePath.slice('src/app/'.length);
  if (!remainder.includes('/')) {
    return 'root';
  }
  const first = remainder.split('/')[0];
  return first || 'root';
}

function pagesLifecycle(sources: SourceFile[], name: string): number {
  return sources.filter(({ text }) => new RegExp(String.raw`\b${name}\b`).test(text)).length;
}

function assuranceInventory(files: string[]): AssuranceInventory {
  const count = (predicate: (file: string) => boolean): number => files.filter(predicate).length;
  return {
    definitions: {
      sourceTests: 'tracked src files named *.test.* or *.spec.*',
      sourceStories: 'tracked src files named *.stories.*',
      endToEndTests: 'tracked test/spec files below e2e_tests or src/tests/e2e',
      workflowFiles: 'tracked YAML files below .github/workflows',
      terraformFiles: 'tracked *.tf files',
    },
    sourceTests: count((file) => file.startsWith('src/') && /\.(?:test|spec)\.[^.]+$/.test(file)),
    sourceStories: count((file) => file.startsWith('src/') && /\.stories\.[^.]+$/.test(file)),
    snapshots: count((file) => /(?:^|\/)__snapshots__\//.test(file)),
    endToEndTests: count(
      (file) =>
        (file.startsWith('e2e_tests/') || file.startsWith('src/tests/e2e/')) &&
        /\.(?:test|spec)\.[^.]+$/.test(file),
    ),
    workflowFiles: count((file) => file.startsWith('.github/workflows/') && /\.ya?ml$/.test(file)),
    customGithubActionSourceFiles: count((file) => file.startsWith('.github/actions/')),
    terraformFiles: count((file) => file.endsWith('.tf')),
    configuredSurfaces: [
      '.storybook/main.ts',
      'jest.config.js',
      'pa11yci.config.js',
      'percy.config.js',
      'playwright.config.ts',
      'next.config.ts',
      'netlify.toml',
      'vercel.json',
    ].filter((file) => files.includes(file)),
  };
}

export async function buildOwaArchitectureInventory(
  owaRoot: string,
): Promise<OwaArchitectureInventory> {
  const input = await assertRepository(owaRoot, 'oak-web-application');
  const sourceRoot = path.join(owaRoot, 'src');
  const [allSourceFiles, allTrackedFiles] = await Promise.all([
    sourceFiles(sourceRoot),
    trackedFiles(owaRoot),
  ]);
  const analysedFiles = allSourceFiles.filter((file) => isProductionFile(file, sourceRoot));
  const sources = await readSources(analysedFiles);

  const requireFromOwa = createRequire(path.join(owaRoot, 'package.json'));
  const ts: TypeScriptApi = requireFromOwa(await resolvePackage(requireFromOwa, 'typescript'));
  const knownFiles = new Set(analysedFiles);
  const relative = (file: string): string => normaliseRelative(owaRoot, file);

  const byArea: Record<string, number> = {};
  const componentFamilies: Record<string, number> = {};
  for (const file of analysedFiles) {
    const rel = relative(file);
    increment(byArea, classifyArea(rel));
    if (rel.startsWith('src/components/')) {
      increment(componentFamilies, rel.split('/')[2] ?? 'root');
    }
  }

  const allLocalEdges = new Set<string>();
  const runtimeShapedLocalEdges = new Set<string>();
  const adjacency = new Map<string, Set<string>>(
    analysedFiles.map((file): [string, Set<string>] => [file, new Set<string>()]),
  );
  const unresolvedLocal = new Set<string>();
  const externalFiles = new Map<string, Set<string>>();

  for (const { file, text } of sources) {
    for (const reference of importReferences(ts, file, text)) {
      if (reference.specifier.startsWith('@/') || reference.specifier.startsWith('.')) {
        const target = resolveLocalImport(file, reference.specifier, sourceRoot, knownFiles);
        if (!target) {
          unresolvedLocal.add(`${relative(file)} -> ${reference.specifier}`);
          continue;
        }
        const edge = `${file}\0${target}`;
        allLocalEdges.add(edge);
        if (reference.runtime) {
          runtimeShapedLocalEdges.add(edge);
          expectDefined(adjacency.get(file)).add(target);
        }
        continue;
      }

      if (reference.runtime) {
        const packageName = externalPackageRoot(reference.specifier);
        if (!externalFiles.has(packageName)) {
          externalFiles.set(packageName, new Set());
        }
        expectDefined(externalFiles.get(packageName)).add(file);
      }
    }
  }

  const dependencyMatrix: Record<string, number> = {};
  let crossAreaRuntimeShapedEdges = 0;
  for (const edge of runtimeShapedLocalEdges) {
    const [source, target] = edge.split('\0');
    const sourceArea = classifyArea(relative(source));
    const targetArea = classifyArea(relative(target));
    const key = `${sourceArea} -> ${targetArea}`;
    increment(dependencyMatrix, key);
    if (sourceArea !== targetArea) {
      crossAreaRuntimeShapedEdges += 1;
    }
  }

  const components = stronglyConnectedComponents(analysedFiles, adjacency);
  const cyclic = components
    .filter((component) => component.length > 1 || adjacency.get(component[0])?.has(component[0]))
    .sort((left, right) => right.length - left.length || left[0].localeCompare(right[0]));

  const clientRoots = sources
    .filter(({ file, text }) => hasModuleDirective(ts, file, text, 'use client'))
    .map(({ file }) => file);
  const clientClosure = new Set(clientRoots);
  const pending = [...clientRoots];
  while (pending.length > 0) {
    const file = expectDefined(pending.pop());
    for (const target of adjacency.get(file) ?? []) {
      if (!clientClosure.has(target)) {
        clientClosure.add(target);
        pending.push(target);
      }
    }
  }
  const clientClosureByArea: Record<string, number> = {};
  for (const file of clientClosure) {
    increment(clientClosureByArea, classifyArea(relative(file)));
  }

  const appRoles: Record<string, number> = {};
  const appGroups: Record<string, number> = {};
  for (const file of analysedFiles) {
    const rel = relative(file);
    const role = appRouteRole(rel);
    if (role) {
      increment(appRoles, role);
    }
    if (rel.startsWith('src/app/') && role) {
      increment(appGroups, routeGroup(rel));
    }
  }

  const pagesSources = sources.filter(({ file }) => relative(file).startsWith('src/pages/'));
  const pagesApiModules = pagesSources.filter(({ file }) =>
    relative(file).startsWith('src/pages/api/'),
  );
  const pagesRouteModules = pagesSources.filter(({ file }) => {
    const rel = relative(file);
    return (
      !rel.startsWith('src/pages/api/') &&
      file.endsWith('.tsx') &&
      !path.basename(file).startsWith('_')
    );
  });

  const externalImports = [...externalFiles]
    .map(([packageName, files]) => ({
      package: packageName,
      files: files.size,
    }))
    .sort((left, right) => right.files - left.files || left.package.localeCompare(right.package));

  return {
    input,
    scope: {
      sourcePopulation: 'Git-tracked src/**/*.ts and src/**/*.tsx',
      analysisExclusions:
        'filename/path heuristic excludes tests, specs, stories, mocks, __tests__, __mocks__ and snapshots',
      analysisKnownInclusions:
        'fixture-shaped files, Storybook decorators/mocks and src/tests support remain unless they match an exclusion; this is not a deployment population',
      dependencyEdges:
        'static imports and re-exports resolved within the analysed TS/TSX population; syntactically type-only edges excluded from the runtime-shaped graph',
      clientClosure:
        'static runtime reachability from files with a use-client directive; an upper-bound source-graph model, not a bundle measurement, and not the browser graph for Pages Router entries without that directive',
    },
    source: {
      allTrackedTypeScriptFiles: allSourceFiles.length,
      analysedTypeScriptFiles: analysedFiles.length,
      knownSupportFilesWithinAnalysis: {
        fixtureShaped: analysedFiles.filter((file) =>
          /(?:^|\/)(?:fixtures?)(?:\/|\.|$)|\.fixtures?\.[^.]+$/.test(
            normaliseRelative(sourceRoot, file),
          ),
        ).length,
        storybookDecorators: analysedFiles.filter((file) =>
          normaliseRelative(sourceRoot, file).startsWith('storybook-decorators/'),
        ).length,
        storybookMocks: analysedFiles.filter((file) =>
          normaliseRelative(sourceRoot, file).startsWith('storybook-mocks/'),
        ).length,
        sourceTestsSupport: analysedFiles.filter((file) =>
          normaliseRelative(sourceRoot, file).startsWith('tests/'),
        ).length,
      },
      byTopLevelArea: sortedRecord(byArea),
      componentFamilies: sortedRecord(componentFamilies),
    },
    routing: {
      appRouter: {
        roles: sortedRecord(appRoles),
        routeModulesByFirstSegment: sortedRecord(appGroups),
      },
      pagesRouter: {
        pageModules: pagesRouteModules.length,
        apiModules: pagesApiModules.length,
        getStaticPropsFiles: pagesLifecycle(pagesSources, 'getStaticProps'),
        getStaticPathsFiles: pagesLifecycle(pagesSources, 'getStaticPaths'),
        getServerSidePropsFiles: pagesLifecycle(pagesSources, 'getServerSideProps'),
      },
    },
    boundaries: {
      allLocalEdges: allLocalEdges.size,
      runtimeShapedLocalEdges: runtimeShapedLocalEdges.size,
      crossAreaRuntimeShapedEdges,
      runtimeShapedDependencyMatrix: sortedRecord(dependencyMatrix),
      unresolvedLocalImports: [...unresolvedLocal].sort(),
      externalImportsByFileCount: externalImports,
      useClientDirectiveRoots: clientRoots.length,
      useClientDirectiveClosureModules: clientClosure.size,
      useClientDirectiveClosureByTopLevelArea: sortedRecord(clientClosureByArea),
      moduleUseServerDirectiveFiles: sources.filter(({ file, text }) =>
        hasModuleDirective(ts, file, text, 'use server'),
      ).length,
      filesContainingUseServerDirective: sources.filter(({ text }) =>
        /^\s*["']use server["'];?/m.test(text),
      ).length,
      serverOnlyImportFiles: sources.filter(({ text }) =>
        /(?:from\s+|import\s*)["']server-only["']/.test(text),
      ).length,
      cyclicStronglyConnectedComponents: cyclic.length,
      cyclicModules: cyclic.reduce((total, component) => total + component.length, 0),
      largestCyclicStronglyConnectedComponents: cyclic
        .slice(0, 20)
        .map((component) => component.map(relative)),
    },
    assurance: assuranceInventory(allTrackedFiles),
  };
}
